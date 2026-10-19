"""Nightlife color grade: deep inky blacks, neon magenta/violet, glow, protected skin."""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
img = np.asarray(im).astype(np.float32) / 255.0
h, w, _ = img.shape


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn + 1e-6
    hue = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    sat = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return np.stack([hue % 1, sat, mx], -1)


def hsv_to_rgb(hsv):
    hh, s, v = hsv[..., 0] * 6, hsv[..., 1], hsv[..., 2]
    i = np.floor(hh).astype(int) % 6
    f = hh - np.floor(hh)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    choices = [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]
    out = np.zeros(hsv.shape, np.float32)
    for k, (a, b_, c) in enumerate(choices):
        m = i == k
        out[m] = np.stack([a[m], b_[m], c[m]], -1)
    return out


def hue_mask(hue, center, width):
    d = np.abs((hue - center + 0.5) % 1 - 0.5)
    return np.clip(1 - d / width, 0, 1) ** 1.5


lum = img @ np.array([0.2126, 0.7152, 0.0722], np.float32)

# 1. Contrast S-curve with crushed, slightly lifted-matte blacks
x = img
x = np.clip((x - 0.03) / 0.97, 0, 1)
x = x + 0.22 * x * (1 - x) * (2 * x - 1) * 2.2  # S-curve
x = 0.018 + x * 0.982  # tiny lift so shadows feel filmic, not dead

# 2. Split toning: indigo/blue shadows, warm-pink highlights
lum = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)
sh = np.clip(1 - lum / 0.45, 0, 1)[..., None] ** 1.5
hi = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
x = x + sh * np.array([0.010, -0.010, 0.060]) * 1.0
x = x + hi * np.array([0.035, 0.005, 0.010])
x = np.clip(x, 0, 1)

# 3. HSL work: neon magenta pumped, skin protected/warmed
hsv = rgb_to_hsv(x)
hue, sat, val = hsv[..., 0], hsv[..., 1], hsv[..., 2]
skin = hue_mask(hue, 0.06, 0.07) * np.clip((val - 0.25) / 0.3, 0, 1) * np.clip(1 - sat / 0.75, 0, 1)
magenta = hue_mask(hue, 0.83, 0.10)
purple = hue_mask(hue, 0.74, 0.07)
# shift purples toward hot magenta, magentas a touch toward pink
hue = hue + magenta * 0.020 + purple * 0.035
sat = sat * (1 + 0.35 * magenta + 0.30 * purple)
# vibrance on everything else, gentle on skin
vib = 0.25 * (1 - sat) * (1 - skin)
sat = sat * (1 + vib) * (1 - 0.06 * skin)
hue = hue - skin * 0.006  # skin slightly warmer/peachier
val = val * (1 + 0.08 * magenta * (1 - skin))
hsv = np.stack([hue % 1, np.clip(sat, 0, 1), np.clip(val, 0, 1)], -1)
x = hsv_to_rgb(hsv)

# 4. Clarity (large-radius local contrast), stronger on subject
def blur(a, r):
    pil = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(pil.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255

yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
cx, cy = w * 0.52, h * 0.45
rr = np.sqrt(((xx - cx) / (w * 0.55)) ** 2 + ((yy - cy) / (h * 0.5)) ** 2)
center = np.clip(1.2 - rr, 0, 1)[..., None]
local = blur(x, 25)
x = np.clip(x + (x - local) * (0.18 + 0.10 * center), 0, 1)

# 5. Neon bloom: glow from bright saturated areas, screen blended
sat_now = (x.max(-1) - x.min(-1)) / (x.max(-1) + 1e-6)
bright = (np.clip((x.max(-1) - 0.5) / 0.5, 0, 1) * np.clip((sat_now - 0.35) / 0.4, 0, 1))[..., None] * x
glow = blur(bright, 45) * 0.6 + blur(bright, 14) * 0.25
glow = glow * np.array([1.0, 0.75, 1.05])
x = 1 - (1 - x) * (1 - np.clip(glow, 0, 1))

# Highlight roll-off so skin and hair keep their detail
lum = x @ np.array([0.2126, 0.7152, 0.0722], np.float32)
knee = 0.72
comp = np.where(lum > knee, knee + (1 - knee) * np.tanh((lum - knee) / (1 - knee) * 0.9) / np.tanh(0.9) * 0.93, lum)
x = np.clip(x * (comp / (lum + 1e-6))[..., None], 0, 1)

# 6. Vignette toward deep violet-black
vig = np.clip((rr - 0.55) / 0.7, 0, 1)[..., None] ** 1.6
x = x * (1 - 0.55 * vig) + vig * 0.55 * np.array([0.03, 0.0, 0.05])

# 7. Fine film grain (luma)
rng = np.random.default_rng(7)
grain = blur(rng.normal(0.5, 0.18, (h, w, 1)).repeat(3, -1), 0.6) - 0.5
x = x + grain[..., :1] * 0.05 * (1 - np.abs(x.mean(-1, keepdims=True) - 0.5) * 1.2)

out = Image.fromarray((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8))
out.save(dst, quality=95, subsampling=0)
print("saved", dst)
