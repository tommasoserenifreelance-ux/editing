"""Full-frame colour wash copied from a reference (e.g. the RED LINE shot) and
re-hued: the brightness distribution (HSV value) is matched to the reference,
saturation follows the reference value->saturation profile, shadows and mids
take the target hue, bright skin keeps its own colour.

Usage: python color_wash.py input.jpg reference.png output.jpg [--hue 0.77]
       [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import rgb_to_hsv, hsv_to_rgb, skin_mask


def profile(ref):
    h, s, v = rgb_to_hsv(ref)
    vs = np.sort(v.ravel())
    bins = np.linspace(0, 1, 21)
    idx = np.digitize(v.ravel(), bins) - 1
    sat = np.array([np.median(s.ravel()[idx == i]) if (idx == i).sum() > 50 else np.nan for i in range(20)])
    centers = (bins[:-1] + bins[1:]) / 2
    ok = ~np.isnan(sat)
    return vs, centers[ok], sat[ok]


def wash(a, ref, hue=0.77):
    vs_ref, sc, ss = profile(ref)
    h, s, v = rgb_to_hsv(a)
    # match the value histogram to the reference
    ranks = np.argsort(np.argsort(v.ravel())) / (v.size - 1)
    v2 = np.interp(ranks, np.linspace(0, 1, vs_ref.size), vs_ref).reshape(v.shape)
    s_ref = np.interp(v2, sc, ss)
    # wash: target hue, reference saturation, matched value
    hi = np.clip((v2 - 0.65) / 0.25, 0, 1)          # bright glass/highlights -> lavender-white
    washed = hsv_to_rgb(np.full_like(h, hue * 360.0), np.clip(s_ref * (1 - 0.85 * hi), 0, 1), v2)
    # skin keeps its own colour (as in the reference): blend in RGB, not hue,
    # so the transition never passes through pink
    sm = np.clip(skin_mask(a) * 1.6, 0, 1)
    keep = sm * np.clip((v2 - 0.25) / 0.35, 0, 1)
    natural = a * (v2 / np.maximum(v, 1e-4))[..., None]  # original colour at the new brightness
    out = washed * (1 - keep[..., None]) + np.clip(natural, 0, 1) * keep[..., None]
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("reference")
    p.add_argument("output")
    p.add_argument("--hue", type=float, default=0.77, help="target hue 0..1 (0.77 = violet)")
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    ref = np.asarray(Image.open(args.reference).convert("RGB")).astype(np.float64) / 255.0
    out = wash(a, ref, args.hue)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
