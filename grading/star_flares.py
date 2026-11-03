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

BAR_FRAC = 0.040  # bar width as a fraction of image width (measured on the reference)


def star(h, w, cx, cy, length, angles, k, bar=None):
    """One reference-style flare: two broad, flat-topped, semi-transparent bars
    (constant width, soft edges) crossing at the light, fading towards the ends."""
    bar = bar or BAR_FRAC * w                     # bar width ~3% of the frame, as measured
    ext = max(length, 7 * bar)
    x0, x1 = int(max(0, cx - ext)), int(min(w, cx + ext + 1))
    y0, y1 = int(max(0, cy - ext)), int(min(h, cy + ext + 1))
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float64)
    dx, dy = xx - cx, yy - cy
    r = np.hypot(dx, dy)
    out = np.zeros((y1 - y0, x1 - x0))
    for ang in angles:
        t = np.radians(ang)
        ux, uy = np.cos(t), np.sin(t)
        along = np.abs(dx * ux + dy * uy) / length
        # bars widen towards the centre (measured: ~3.5% of width mid-arm, ~6.5% near the light)
        local = bar * (1 + 0.9 * np.clip(1 - along * 1.6, 0, 1) ** 2)
        across = np.abs(-dx * uy + dy * ux) / (local / 2)
        body = np.exp(-across ** 4)                       # flat top, soft edges
        fade = np.clip(1 - along, 0, 1) ** 0.8
        out = np.maximum(out, body * fade * 0.92)
        out = np.maximum(out, np.exp(-(across * 1.2) ** 2) * fade)  # bright middle, near white like the reference
    core = np.exp(-(r / (1.2 * bar)) ** 2)
    halo = np.exp(-(r / (2.5 * bar)) ** 2) * 0.40
    full = np.zeros((h, w)); full[y0:y1, x0:x1] = np.maximum.reduce([out, core, halo])
    return full


def add_stars(a, stars, angle=20.0, tint=(0.75, 0.35, 1.0), angle2=112.0, behind=None, haze=0.0):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    I = np.zeros((h, w))
    for (x, y, size) in stars:
        I = np.maximum(I, star(h, w, x, y, size, (angle, angle2), k))
    I = blur(I, 1.5 * k)
    glow = blur(I, 14 * k)
    white = np.clip(I, 0, 1)
    col = np.array(tint)
    light = white[..., None] * (0.78 + 0.22 * col) * 0.95 + glow[..., None] * col * 0.45
    if haze:
        # lit smoke around the lights: lifts the blacks near each flare (like the
        # reference, where the air around the lights is hazy, never pitch black)
        yy, xx = np.mgrid[0:h, 0:w]
        hz = np.zeros((h, w))
        for (x, y, size) in stars:
            hz = np.maximum(hz, np.exp(-(((xx - x) ** 2 + (yy - y) ** 2) / (0.75 * size) ** 2)))
        hz = np.maximum(hz, blur(I, 60 * k) * 2.0)
        light = light + np.clip(hz, 0, 1)[..., None] * col * haze
    if behind is not None:  # flares sit behind the subject (arm/body stay in front)
        light = light * (1 - behind)[..., None]
    return np.clip(1 - (1 - a) * (1 - np.clip(light, 0, 1)), 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--star", action="append", required=True, help="x,y,length")
    p.add_argument("--angle", type=float, default=20.0, help="first bar angle (deg)")
    p.add_argument("--angle2", type=float, default=112.0, help="second bar angle (deg)")
    p.add_argument("--tint", default="0.75,0.35,1.0")
    p.add_argument("--exif-from")
    p.add_argument("--mask", help="subject mask: flares go behind the subject")
    p.add_argument("--haze", type=float, default=0.0, help="lit smoke around the lights (0..0.6)")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    stars = [tuple(map(float, s.split(","))) for s in args.star]
    behind = None
    if args.mask:
        mk = Image.open(args.mask).convert("L").resize(im.size)
        k = max(im.size) / 2000.0
        behind = np.clip(blur(np.clip((np.asarray(mk) / 255.0 - 0.15) / 0.7, 0, 1), 1.2 * k), 0, 1)
    out = add_stars(a, stars, args.angle, tuple(map(float, args.tint.split(","))), args.angle2, behind, args.haze)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
