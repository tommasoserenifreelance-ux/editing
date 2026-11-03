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


def tone_curve(x):
    # Black point crush (~5%), strong S curve, soft highlight roll-off.
    x = np.clip((x - 0.025) / (1 - 0.025), 0, 1)
    s = x * x * (3 - 2 * x)                 # smoothstep S
    x = 0.45 * s + 0.55 * x                  # blend -> contrast ~+25
    x = np.where(x > 0.85, 0.85 + (x - 0.85) * 0.75, x)  # highlights roll-off
    x = np.clip(x - 0.05 * np.clip(1 - x / 0.25, 0, 1) * x * 4, 0, 1)  # deepen shadows only
    return x


def grade(a, strength=1.0):
    src = a.copy()
    h, w, _ = a.shape
    radius = max(w, h) / 1000.0

    # 1. Clarity: local contrast on luminance (large radius) + texture (small radius)
    L = lum(a)
    clar = (L - blur(L, 40 * radius)) * 0.25 * np.clip(L * 3, 0, 1)
    tex = (L - blur(L, 2.0 * radius)) * 0.15
    a = np.clip(a + (clar + tex)[..., None], 0, 1)

    # 2. Exposure -0.2 EV and tone curve per luminance (preserves hue)
    a = a * 2 ** -0.12
    L = lum(a)
    Lc = tone_curve(L)
    ratio = np.where(L > 1e-4, Lc / np.maximum(L, 1e-4), 0)
    a = np.clip(a * ratio[..., None], 0, 1)

    # 3. White balance warmer (+~400K) and a touch of magenta
    a = a * np.array([1.03, 1.0, 0.94])
    a[..., 1] *= 0.985

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
    sat_mul = vib * (1 - 0.15 * is_orange) * (1 + 0.15 * is_blue) * (1 + 0.12 * is_red)
    a = L[..., None] + (a - L[..., None]) * sat_mul[..., None]
    # orange luminance +: brighter, glowing skin
    a = a * (1 + 0.10 * is_orange * np.clip(L * 2.5, 0, 1))[..., None]
    a = np.clip(a, 0, 1)

    # 6. Vignette (-15)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    vig = 1 - 0.28 * np.clip((d - 0.45) / 0.55, 0, 1) ** 2
    a = a * vig[..., None]

    a = np.clip(a, 0, 1)
    return src + (a - src) * strength


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--strength", type=float, default=1.0)
    args = p.parse_args()
    im = Image.open(args.input)
    icc = im.info.get("icc_profile")
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    out = grade(a, args.strength)
    out_im = Image.fromarray(np.round(out * 255).astype(np.uint8))
    kw = {"icc_profile": icc} if icc else {}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0, optimize=True)
    out_im.save(args.output, **kw)
    print(f"saved {args.output} {out_im.size}")


if __name__ == "__main__":
    main()
