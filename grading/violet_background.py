"""Violet background grade (like the VENUS references): everything behind the
subject is re-toned along a violet ramp measured from the references
(deep violet-black shadows, magenta-violet mids, lavender highlights) and
lifted so the crowd reads as violet-lit. The subject keeps its own colours.

Usage: python violet_background.py graded.jpg output.jpg [--mask mask.png]
       [--strength 1.0] [--lift 1.0]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, lum

# luminance (0-255) -> RGB, measured on the reference backgrounds
RAMP_L = np.array([0, 12, 55, 120, 200, 255], float)
RAMP_RGB = np.array([
    [0, 0, 0],
    [24, 7, 30],
    [82, 39, 96],
    [150, 106, 152],
    [198, 174, 206],
    [250, 240, 252],
], float)


def violet_ramp(L255):
    return np.stack([np.interp(L255, RAMP_L, RAMP_RGB[:, c]) for c in range(3)], -1) / 255.0


def violet_background(a, mask, strength=1.0, lift=1.0):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.asarray(mask.resize((w, h))).astype(np.float64) / 255.0
    m = blur(np.clip((m - 0.15) / 0.7, 0, 1), 1.5 * k)
    bg = 1 - m

    L = lum(a)
    # lift the crushed background so people/lights behind show up (gamma + gain)
    Lb = np.clip(1.6 * lift * L ** 0.75, 0, 1) if lift else L
    tinted = violet_ramp(Lb * 255)
    # keep a little of the original hue variation (neon, signs) for realism
    chroma = a - L[..., None]
    tinted = np.clip(tinted + chroma * 0.25, 0, 1)

    # soft violet glow around the brightest background lights
    hot = np.clip((Lb - 0.55) / 0.45, 0, 1) * bg
    glow = blur(hot, 35 * k)
    tinted = 1 - (1 - tinted) * (1 - glow[..., None] * np.array([0.55, 0.30, 0.85]) * 0.6)

    # violet spill on the subject's edges (rim from the background light)
    edge = np.clip(blur(bg, 10 * k) * m * 2.0, 0, 1)
    spill = blur(tinted * bg[..., None], 30 * k) * edge[..., None] * 0.30
    out = a * m[..., None] + tinted * bg[..., None]
    out = 1 - (1 - out) * (1 - spill)
    return np.clip(a + (out - a) * strength, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask")
    p.add_argument("--strength", type=float, default=1.0)
    p.add_argument("--lift", type=float, default=1.0)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    rgb = im.convert("RGB")
    if args.mask:
        mask = Image.open(args.mask).convert("L")
    else:
        from rembg import new_session, remove
        mask = remove(rgb, session=new_session("birefnet-portrait"), only_mask=True)
    a = np.asarray(rgb).astype(np.float64) / 255.0
    out = violet_background(a, mask, args.strength, args.lift)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
