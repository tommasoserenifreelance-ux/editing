"""'Plastic' glowing skin (CHIICAS reference): brighter, smooth, glossy skin on
the subject while keeping eyes/brows/lips detail. Pairs with a vivid violet
background (violet_background.py --ramp violet_vivid --lift 2.0).

Usage: python skin_glow.py input.jpg output.jpg --mask mask.png [--smooth 0.7]
       [--bright 0.35] [--gloss 0.5] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, lum, skin_mask


def glow(a, mask, smooth=0.7, bright=0.35, gloss=0.5):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 1.2 * k), 0, 1)
    sk = np.clip(blur(skin_mask(a) * 1.5, 2 * k), 0, 1) * m

    # frequency separation: keep the finest texture (pores) lightly, flatten blotches
    low = blur(a, 7 * k)
    fine = a - blur(a, 1.0 * k)
    mid = blur(a, 1.0 * k) - low
    smooth_img = low + mid * (1 - smooth) + fine * 0.6
    out = a + (smooth_img - a) * sk[..., None]

    # brighter subject, more on skin (high-key, "lit" look)
    # brighten in luminance only (keeps the tan/colour), soft roll-off near white
    L0 = lum(out)
    L1 = L0 * 2 ** (bright * sk + 0.08 * m)
    L1 = np.where(L1 > 0.8, 0.8 + (1 - np.exp(-(L1 - 0.8) * 3)) / 3 * 0.6, L1)
    out = out * (L1 / np.maximum(L0, 1e-4))[..., None]
    # a bit more saturation on skin (tanned, polished look)
    Lc = lum(out)[..., None]
    out = Lc + (out - Lc) * (1 + 0.15 * sk)[..., None]

    # glossy sheen: lift and bloom the skin highlights
    L = lum(out)
    spec = np.clip((L - 0.62) / 0.3, 0, 1) * sk
    sheen = blur(spec, 4 * k)
    out = 1 - (1 - out) * (1 - (sheen * gloss)[..., None] * np.array([1.0, 0.95, 0.92]))
    out = 1 - (1 - out) * (1 - blur(out * spec[..., None], 18 * k) * 0.15)
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask", required=True)
    p.add_argument("--smooth", type=float, default=0.7)
    p.add_argument("--bright", type=float, default=0.18)
    p.add_argument("--gloss", type=float, default=0.3)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    mask = np.asarray(Image.open(args.mask).convert("L").resize((w, h))).astype(np.float64) / 255.0
    out = glow(a, mask, args.smooth, args.bright, args.gloss)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
