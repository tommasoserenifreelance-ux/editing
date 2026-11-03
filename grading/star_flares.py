"""Star-filter 'X' flares on club lights (like a cross/star lens filter):
four long tapered rays per light, white-hot core fading into the ambient colour.

Usage: python star_flares.py input.jpg output.jpg --star x,y,size [--star ...]
       [--angle 28] [--tint 0.75,0.35,1.0] [--exif-from orig.jpg]
size = ray length in px.
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur


def star(h, w, cx, cy, length, angle, k):
    """Return (core, colour) intensity maps for one X flare."""
    x0, x1 = int(max(0, cx - length)), int(min(w, cx + length + 1))
    y0, y1 = int(max(0, cy - length)), int(min(h, cy + length + 1))
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float64)
    dx, dy = xx - cx, yy - cy
    r = np.hypot(dx, dy) + 1e-6
    out = np.zeros((y1 - y0, x1 - x0))
    rays = []
    for ang in (angle, 180 - angle):
        t = np.radians(ang)
        ux, uy = np.cos(t), np.sin(t)
        along = np.abs(dx * ux + dy * uy)
        across = np.abs(-dx * uy + dy * ux)
        width = 9.0 * k + along * 0.07           # broad, soft beams like the reference
        ray = np.exp(-(across / width) ** 2) * np.exp(-along / (0.22 * length))
        ray += 0.6 * np.exp(-(across / (3.0 * k)) ** 2) * np.exp(-along / (0.30 * length))  # sharp bright spine
        out = np.maximum(out, ray)
    core = np.exp(-(r / (16 * k)) ** 2)
    halo = np.exp(-(r / (70 * k)) ** 2) * 0.6
    full = np.zeros((h, w)); full[y0:y1, x0:x1] = np.maximum.reduce([out, core, halo])
    return full


def add_stars(a, stars, angle=28.0, tint=(0.75, 0.35, 1.0)):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    I = np.zeros((h, w))
    for (x, y, size) in stars:
        I = np.maximum(I, star(h, w, x, y, size, angle, k))
    I = blur(I, 0.8 * k)
    glow = blur(I, 6 * k)
    white = np.clip(I * 1.35, 0, 1)
    col = np.array(tint)
    light = white[..., None] * (0.55 + 0.45 * col) + glow[..., None] * col * 0.6
    return np.clip(1 - (1 - a) * (1 - np.clip(light, 0, 1)), 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--star", action="append", required=True, help="x,y,length")
    p.add_argument("--angle", type=float, default=28.0, help="ray angle from horizontal")
    p.add_argument("--tint", default="0.75,0.35,1.0")
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    stars = [tuple(map(float, s.split(","))) for s in args.star]
    out = add_stars(a, stars, args.angle, tuple(map(float, args.tint.split(","))))
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
