"""Tint the subject with coloured club light (VENUS reference: pale pink-lavender
highlights, saturated magenta-violet shadows). Keeps the subject's own
brightness and detail; only hue/saturation change, inside the subject mask.

Usage: python subject_tint.py input.jpg output.jpg --mask mask.png [--hue 318]
       [--strength 0.9] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, rgb_to_hsv, hsv_to_rgb


def tint(a, mask, hue=318.0, strength=0.9, lift=0.06):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 1.2 * k), 0, 1)
    hh, s, v = rgb_to_hsv(a)
    # saturation profile measured on the reference skin: ~0.28 in the lights, ~0.6 in the shadows
    s_t = np.interp(v, [0.0, 0.25, 0.5, 0.75, 1.0], [0.85, 0.75, 0.55, 0.36, 0.26])
    s_t = s_t * np.clip(v / 0.08, 0, 1)            # true blacks stay neutral black
    v2 = np.clip(v + lift * np.sin(np.pi * np.clip(v, 0, 1)), 0, 1)  # slight lift, like the brighter reference skin
    v2 = np.clip((v2 - 0.5) * 1.15 + 0.52, 0, 1) * np.clip(v / 0.05, 0, 1) + v2 * (1 - np.clip(v / 0.05, 0, 1))  # more contrast
    tinted = hsv_to_rgb(np.full_like(v, hue), s_t, v2)
    wgt = (m * strength)[..., None]
    return np.clip(a * (1 - wgt) + tinted * wgt, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask", required=True)
    p.add_argument("--hue", type=float, default=322.0)
    p.add_argument("--strength", type=float, default=0.9)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    mask = np.asarray(Image.open(args.mask).convert("L").resize((w, h))).astype(np.float64) / 255.0
    out = tint(a, mask, args.hue, args.strength)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
