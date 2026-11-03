"""Out-of-focus bokeh discs behind the subject (like the VENUS poster reference):
big soft violet/magenta discs, slightly brighter rim, a few small bright dots.

Usage: python bokeh.py input.jpg output.jpg --mask mask.png [--seed 4] [--count 11]
       [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur

COLOURS = [np.array(c) for c in ([0.62, 0.22, 1.00], [0.85, 0.30, 0.95], [0.72, 0.45, 1.00], [0.55, 0.18, 0.95])]


def disc(h, w, cx, cy, r, soft):
    x0, x1 = int(max(0, cx - r - 4 * soft)), int(min(w, cx + r + 4 * soft))
    y0, y1 = int(max(0, cy - r - 4 * soft)), int(min(h, cy + r + 4 * soft))
    out = np.zeros((h, w))
    if x1 <= x0 or y1 <= y0:
        return out
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.hypot(xx - cx, yy - cy)
    body = 1 / (1 + np.exp((d - r) / soft))                 # very soft-edged disc
    centre = np.exp(-(d / (0.55 * r)) ** 2)                 # brighter, paler middle
    out[y0:y1, x0:x1] = body * 0.75 + centre * 0.35
    return out


def add_bokeh(a, mask, discs):
    h, w, _ = a.shape
    light = np.zeros_like(a)
    for (x, y, r, amp, ci) in discs:
        soft = max(2.0, r * 0.16)
        dd = disc(h, w, x, y, r, soft)
        col = COLOURS[ci % len(COLOURS)]
        pale = 0.55 * col + 0.45                              # lavender-white core
        light += (dd[..., None] * col + np.clip(dd - 0.7, 0, 1)[..., None] * pale) * amp
    light += blur(light, 0.08 * max(w, h)) * 0.6                # violet glow around the discs
    k = max(w, h) / 2000.0
    behind = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 1.2 * k), 0, 1)
    light = light * (1 - behind)[..., None]
    return np.clip(1 - (1 - a) * (1 - np.clip(light, 0, 1)), 0, 1)


def layout(w, h, rng, count):
    """Mostly in the upper two thirds and at the sides, like the reference."""
    discs = []
    for i in range(count):
        for _ in range(200):
            x = rng.uniform(-0.05, 1.05) * w
            y = rng.uniform(0.0, 0.70) * h * (0.6 + 0.4 * rng.random())
            r = rng.uniform(0.07, 0.13) * w
            if all(np.hypot(x - X, y - Y) > 0.8 * (r + R) for X, Y, R, *_ in discs):
                break
        discs.append((x, y, r, rng.uniform(0.45, 0.85), i))
    for i in range(2):  # small sharp-ish dots
        discs.append((rng.uniform(0.05, 0.95) * w, rng.uniform(0.05, 0.55) * h, rng.uniform(0.006, 0.012) * w, 0.9, i))
    return discs


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask", required=True)
    p.add_argument("--seed", type=int, default=4)
    p.add_argument("--count", type=int, default=7)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    mask = np.asarray(Image.open(args.mask).convert("L").resize((w, h))).astype(np.float64) / 255.0
    discs = layout(w, h, np.random.default_rng(args.seed), args.count)
    out = add_bokeh(a, mask, discs)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
