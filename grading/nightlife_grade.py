"""Nightlife colour grade: crushed warm blacks, cream highlights, golden skin,
saturated club lights, crisp local contrast. Keeps the original resolution.

Usage: python nightlife_grade.py input.jpg output.jpg [--strength 1.0]
"""
import argparse
import numpy as np
from PIL import Image


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def _box(a, r, axis):
    """Box blur of radius r along axis (edge-padded), via cumulative sums."""
    if r < 1:
        return a
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return (hi - lo) / (2 * r + 1)


def blur(a, sigma):
    """Approximate Gaussian blur (3 box passes per axis) on a float array."""
    r = max(1, int(round(np.sqrt(12 * sigma * sigma / 3 + 1) / 2 - 0.5)))
    for _ in range(3):
        a = _box(_box(a, r, 0), r, 1)
    return a


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    dd = np.where(d == 0, 1, d)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4))
    h = np.where(d == 0, 0, h) * 60.0
    s = np.where(mx == 0, 0, d / np.where(mx == 0, 1, mx))
    return h, s, mx


def hsv_to_rgb(h, s, v):
    h = (h % 360) / 60.0
    c = v * s
    x = c * (1 - np.abs(h % 2 - 1))
    m = v - c
    z = np.zeros_like(h)
    i = np.floor(h).astype(int) % 6
    r = np.choose(i, [c, x, z, z, x, c])
    g = np.choose(i, [x, c, c, x, z, z])
    b = np.choose(i, [z, z, x, c, c, x])
    return np.stack([r + m, g + m, b + m], -1)


# Skin target measured on the flash portraits of the references (HSV):
# hue ~20 deg (peach/rose, not yellow), saturation ~0.40, value ~0.70.
SKIN_HUE, SKIN_SAT, SKIN_VAL = 23.0, 0.44, 0.66
# 0 = keep full original skin detail (no smoothing); glow kept subtle
SKIN_SMOOTH, SKIN_GLOW = 0.0, 0.35
# extra shadow depth (0..1)
SHADOW_DEPTH = 0.35


def skin_mask(a):
    h, s, v = rgb_to_hsv(a)
    hd = (h - 22 + 180) % 360 - 180
    m = np.exp(-(hd / 14.0) ** 2)
    m *= np.clip((s - 0.12) / 0.10, 0, 1) * np.clip((0.80 - s) / 0.15, 0, 1)
    m *= np.clip((v - 0.18) / 0.15, 0, 1)
    return blur(m, 3)


def skin_correct(a, radius, skin_val=None):
    m = skin_mask(a)
    h, s, v = rgb_to_hsv(a)
    msum = m.sum() + 1e-6
    # pull hue toward the target, scale saturation/value so the skin average lands on target
    hd = (h - SKIN_HUE + 180) % 360 - 180
    h2 = h - hd * 0.6 * m
    s_mean = (s * m).sum() / msum
    v_mean = (v * m).sum() / msum
    s2 = s * (1 + (SKIN_SAT / s_mean - 1) * m)
    # gamma on skin value: deeper mids, highlights preserved -> sculpted, glossy skin
    lit = (m > 0.5) & (v > 0.5)
    sv = SKIN_VAL if skin_val is None else skin_val
    v_face = np.median(v[lit]) if lit.any() else sv
    gain = sv / max(v_face, 1e-3) ** 1.3
    v2 = v + (np.clip(gain * v ** 1.3, 0, 1) - v) * m
    out = hsv_to_rgb(h2, np.clip(s2, 0, 1), np.clip(v2, 0, 1))
    # soft skin: smooth mid frequencies, keep fine detail at 45%
    low = blur(out, 4 * radius)
    smooth = low + (out - low) * 0.45
    out = out + (smooth - out) * (m * SKIN_SMOOTH)[..., None]
    # gentle glow on skin highlights (sheen like the references)
    L = lum(out)
    glow = blur(np.clip(L - 0.60, 0, 1) * m, 5 * radius) * 0.8
    out = out + glow[..., None] * np.array([0.55, 0.50, 0.45]) * SKIN_GLOW
    return np.clip(out, 0, 1)


def tone_curve(x, black=0.025):
    # Black point crush (~5%), strong S curve, soft highlight roll-off.
    x = np.clip((x - black) / (1 - black), 0, 1)
    s = x * x * (3 - 2 * x)                 # smoothstep S
    x = 0.45 * s + 0.55 * x                  # blend -> contrast ~+25
    x = np.where(x > 0.85, 0.85 + (x - 0.85) * 0.75, x)  # highlights roll-off
    x = np.clip(x - 0.05 * np.clip(1 - x / 0.25, 0, 1) * x * 4, 0, 1)  # deepen shadows only
    return x


# Brighter variant (client: "non scurire troppo"): more exposure, lighter
# shadows, less black crush, brighter skin target.
BRIGHT = dict(exposure=0.25, shadow_depth=0.12, black=0.012, skin_val=0.76, vignette=0.15)


def grade(a, strength=1.0, exposure=-0.12, shadow_depth=None, black=0.025, skin_val=None, vignette=0.28):
    src = a.copy()
    h, w, _ = a.shape
    radius = max(w, h) / 1000.0

    # 1. Clarity: local contrast on luminance (large radius) + texture (small radius)
    L = lum(a)
    clar = (L - blur(L, 40 * radius)) * 0.25 * np.clip(L * 3, 0, 1)
    tex = (L - blur(L, 2.0 * radius)) * 0.15
    a = np.clip(a + (clar + tex)[..., None], 0, 1)

    # 2. Exposure -0.2 EV and tone curve per luminance (preserves hue)
    a = a * 2 ** exposure
    L = lum(a)
    Lc = tone_curve(L, black)
    ratio = np.where(L > 1e-4, Lc / np.maximum(L, 1e-4), 0)
    a = np.clip(a * ratio[..., None], 0, 1)

    # 3. White balance warmer (+~400K) and a touch of magenta
    a = a * np.array([1.015, 1.0, 0.975])

    # 4. Split toning: warm red-brown shadows, cream highlights
    L = np.clip(lum(a), 0, 1)
    sh = np.clip(1 - L / 0.35, 0, 1) ** 1.5 * np.clip(L / 0.03, 0, 1)
    hi = np.clip((L - 0.55) / 0.45, 0, 1)
    a = a + sh[..., None] * np.array([0.020, 0.004, -0.012])
    a = a + hi[..., None] * np.array([0.012, 0.006, -0.025])
    a = np.clip(a, 0, 1)

    # 5. HSL-ish: tame orange saturation (skin), boost reds/blues (lights, nails)
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    L = lum(a)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    is_orange = np.clip((r - b) / np.maximum(mx, 1e-4), 0, 1) * np.clip((g - b) / np.maximum(r - b, 1e-4), 0, 1) * np.clip(1 - (g - b) / np.maximum(r - b, 1e-4) * 0.9, 0, 1) * 2
    is_blue = np.clip((b - np.maximum(r, g)) / np.maximum(mx, 1e-4) * 3, 0, 1)
    is_red = np.clip((r - np.maximum(g, b)) / np.maximum(mx, 1e-4) * 2, 0, 1) * (1 - np.clip((g - b) * 4, 0, 1))
    vib = 1 + 0.18 * (1 - sat)                       # vibrance
    sat_mul = vib * (1 - 0.0 * is_orange) * (1 + 0.15 * is_blue) * (1 + 0.12 * is_red)
    a = L[..., None] + (a - L[..., None]) * sat_mul[..., None]
    a = np.clip(a, 0, 1)

    # 6. Skin: match the reference skin tone, soften, add sheen
    a = skin_correct(a, radius, skin_val)

    # 7. Deeper shadows: pull down low-mids (sculpts the face, darker surroundings),
    #    highlights untouched. SHADOW_DEPTH 0 = off.
    sd = SHADOW_DEPTH if shadow_depth is None else shadow_depth
    if sd:
        L = lum(a)
        t = np.clip(L / 0.6, 0, 1)
        target = L * (1 - sd * (1 - t) ** 1.5 * np.clip(L / 0.04, 0, 1))
        a = np.clip(a * (target / np.maximum(L, 1e-4))[..., None], 0, 1)

    # 8. Vignette (-15)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1 - vignette * np.clip((d - 0.45) / 0.55, 0, 1) ** 2
    a = a * vig[..., None]

    a = np.clip(a, 0, 1)
    return src + (a - src) * strength


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--strength", type=float, default=1.0)
    p.add_argument("--bright", action="store_true", help="lighter variant (less dark, brighter skin)")
    args = p.parse_args()
    im = Image.open(args.input)
    icc = im.info.get("icc_profile")
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    out = grade(a, args.strength, **(BRIGHT if args.bright else {}))
    out_im = Image.fromarray(np.round(out * 255).astype(np.uint8))
    kw = {"icc_profile": icc} if icc else {}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0, optimize=True)
    out_im.save(args.output, **kw)
    print(f"saved {args.output} {out_im.size}")


if __name__ == "__main__":
    main()
