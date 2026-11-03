"""Film-like grain (as in the VENUS poster reference): monochrome, slightly
clumpy, strongest in the midtones, lighter in deep blacks and highlights.

Usage: python grain.py input.jpg output.jpg [--amount 0.022] [--size 1.3] [--seed 1]
       [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, lum


def add_grain(a, amount=0.022, size=1.3, seed=1):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 1, (h, w))
    if size > 1.0:  # very light clumping only for larger output sizes
        n = 0.7 * n + 0.3 * np.roll(n, 1, 0)
    n /= n.std() + 1e-8
    L = lum(a)
    weight = 0.35 + 0.65 * np.clip(4 * L * (1 - L), 0, 1)   # midtones get the most
    g = n * amount * weight
    return np.clip(a + g[..., None], 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--amount", type=float, default=0.022)
    p.add_argument("--size", type=float, default=1.3)
    p.add_argument("--seed", type=int, default=1)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    out = add_grain(a, args.amount, args.size, args.seed)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
