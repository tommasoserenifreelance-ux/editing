"""'Scratched' horizontal motion streaks (VENUS reference, top right): the
background is smeared sideways in a region, with uneven streak lines, as if the
camera moved during a slow shutter. Applied behind the subject only.

Usage: python motion_streaks.py input.jpg output.jpg --mask mask.png
       [--region x0,y0,x1,y1] (fractions 0..1, default top-right) [--length 0.12]
       [--strength 0.9] [--seed 2] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, lum


def hblur(a, n):
    """Horizontal box blur of radius n (edge padded)."""
    pad = np.pad(a, ((0, 0), (n + 1, n), (0, 0)), mode="edge")
    c = np.cumsum(pad, axis=1)
    return (c[:, 2 * n + 1:] - c[:, :-2 * n - 1]) / (2 * n + 1)


def streaks(a, mask, region=(0.45, 0.0, 1.0, 0.45), length=0.12, strength=0.9, seed=2):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    rng = np.random.default_rng(seed)
    n = max(4, int(length * w / 2))
    sm = hblur(hblur(a, n), n // 2)
    # uneven horizontal lines: some rows brighter / darker (the "scratches")
    rows = rng.normal(0, 1, h)
    rows = np.convolve(rows, np.ones(3) / 3, mode="same")
    rows = 1 + 0.35 * np.tanh(rows) + 0.25 * (rng.random(h) > 0.93)
    sm = np.clip(sm * rows[:, None, None], 0, 1)
    # bright lights get long, thin trails
    L = lum(a)
    hot = np.clip((L - 0.55) / 0.35, 0, 1)[..., None] * a
    trail = hblur(hot, int(n * 1.6))
    sm = 1 - (1 - sm) * (1 - np.clip(trail * 1.8 * rows[:, None, None], 0, 1))
    # soft region mask, behind the subject
    x0, y0, x1, y1 = region
    yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w])[:, None, None]
    fx = np.clip(np.minimum(xx - x0, x1 - xx) / 0.12, 0, 1)
    fy = np.clip(np.minimum(yy - y0, y1 - yy) / 0.12, 0, 1)
    reg = fx * fy
    reg = np.where(x1 >= 1.0, np.clip((xx - x0) / 0.15, 0, 1) * fy, reg) if x1 >= 1.0 else reg
    m = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 2 * k), 0, 1)
    wgt = (reg * (1 - m) * strength)[..., None]
    return np.clip(a * (1 - wgt) + sm * wgt, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask", required=True)
    p.add_argument("--region", default="0.45,0,1,0.45")
    p.add_argument("--length", type=float, default=0.12)
    p.add_argument("--strength", type=float, default=0.9)
    p.add_argument("--seed", type=int, default=2)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    mask = np.asarray(Image.open(args.mask).convert("L").resize((w, h))).astype(np.float64) / 255.0
    out = streaks(a, mask, tuple(map(float, args.region.split(","))), args.length, args.strength, args.seed)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
