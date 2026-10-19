"""Cool nightlife grade with highlight recovery for flash-blown party shots."""
import sys
import numpy as np
from PIL import Image, ImageFilter

LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)


def _box(a, k, axis):
    pad = [(0, 0)] * a.ndim
    pad[axis] = (k + 1, k)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * k + 1, 2 * k + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return (hi - lo) / (2 * k + 1)


def blur(a, r):
    """Approximate Gaussian blur (3 box passes) on float arrays."""
    k = max(1, int(round(r * 0.8)))
    for _ in range(3):
        a = _box(_box(a, k, 0), k, 1)
    return a


def grade(src, dst):
    x = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255.0
    h, w, _ = x.shape

    # 1. Highlight recovery: roll off the brightest channel (keeps hue ratios),
    #    then a gentle local exposure pull where the flash hit hardest.
    mx = x.max(-1, keepdims=True)
    knee = 0.7
    mx_new = np.where(mx > knee, knee + (0.88 - knee) * np.tanh((mx - knee) / (0.88 - knee)), mx)
    x = x * mx_new / (mx + 1e-6)
    lum = x @ LUMA
    base = np.exp(blur(np.log(lum + 1e-3)[..., None], 30)[..., 0])
    hot = np.clip((base - 0.45) / 0.4, 0, 1)
    x = x * np.exp(-0.25 * hot)[..., None]

    # 2. Tame the orange flash cast: pull saturation out of orange/yellow hues
    lum = (x @ LUMA)[..., None]
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    warm = np.clip(((r - b) / (x.max(-1) + 1e-4) - 0.2) / 0.5, 0, 1)[..., None]
    x = lum + (x - lum) * (1 - 0.35 * warm)

    # 3. Cool grade via lift/gamma/gain: blue-steel shadows, cool mids,
    #    highlights kept almost neutral so skin never turns blue.
    lum = x @ LUMA
    sh = np.clip(1 - lum / 0.45, 0, 1)[..., None] ** 1.3
    mid = (4 * lum * (1 - lum))[..., None]
    hi = np.clip((lum - 0.6) / 0.4, 0, 1)[..., None]
    x = x + sh * np.array([-0.020, 0.004, 0.050])
    x = x * (1 + mid * np.array([-0.07, -0.005, 0.07]))
    x = x * (1 + hi * np.array([-0.015, 0.0, 0.01]))

    # 4. Contrast + light clarity
    x = np.clip(x, 0, 1)
    x = x + 0.10 * x * (1 - x) * (2 * x - 1) * 2
    x = x + (x - blur(x, 20)) * 0.12

    # 5. Subtle vignette
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rr = np.sqrt(((xx - w / 2) / (w * 0.6)) ** 2 + ((yy - h * 0.55) / (h * 0.6)) ** 2)
    x = x * (1 - 0.3 * np.clip(rr - 0.6, 0, 1)[..., None] ** 1.5)

    Image.fromarray((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst, quality=95, subsampling=0)


for src in sys.argv[1:]:
    dst = src.replace("_original", "_cool")
    grade(src, dst)
    print("saved", dst)
