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


# magenta/pink ramp measured on the CHIICAS / YAB reference
PINK_L = np.array([0, 8, 20, 45, 80, 130, 200, 255], float)
PINK_RGB = np.array([
    [0, 0, 0], [11, 2, 8], [40, 9, 26], [108, 22, 63],
    [170, 45, 105], [208, 100, 147], [232, 200, 215], [252, 242, 247],
], float)


def _rehue(rgb, hue_deg, min_sat=0.0, max_val=1.0):
    import colorsys
    out = []
    for r, g, b in rgb / 255.0:
        h, s_, v = colorsys.rgb_to_hsv(r, g, b)
        out.append(colorsys.hsv_to_rgb(hue_deg / 360.0, max(s_, min_sat), min(v, max_val)))
    return np.array(out) * 255.0


# same intensity/saturation as the pink reference, turned violet
# lights stay saturated violet, never lavender-white (no burnt patches)
VIOLET_VIVID_RGB = _rehue(PINK_RGB, 282, min_sat=0.45, max_val=0.86)
RAMPS = {"violet": (RAMP_L, RAMP_RGB), "pink": (PINK_L, PINK_RGB), "violet_vivid": (PINK_L, VIOLET_VIVID_RGB)}


def violet_ramp(L255, ramp="violet"):
    rl, rc = RAMPS[ramp]
    return np.stack([np.interp(L255, rl, rc[:, c]) for c in range(3)], -1) / 255.0


def violet_background(a, mask, strength=1.0, lift=1.0, ramp="violet", bg_blur=0.0):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.asarray(mask.resize((w, h))).astype(np.float64) / 255.0
    m = np.clip(blur(np.clip((m - 0.15) / 0.7, 0, 1), 1.5 * k), 0, 1)
    bg = 1 - m

    if bg_blur:
        # shallow depth of field: blur only the background, normalised by the
        # mask so the subject never bleeds into it; highlights bloom like bokeh
        wbg = bg[..., None]
        num = blur(a * wbg, bg_blur * k)
        den = blur(bg, bg_blur * k)[..., None]
        soft = num / np.maximum(den, 1e-3)
        Ls = lum(soft)
        soft = soft + blur(soft * np.clip((Ls - 0.35) / 0.4, 0, 1)[..., None], bg_blur * 1.5 * k) * 0.8
        a = np.clip(a * m[..., None] + np.clip(soft, 0, 1) * wbg, 0, 1)
    L = lum(a)
    # lift the crushed background so people/lights behind show up (gamma + gain)
    Lb = np.clip(1.6 * lift * np.clip(L, 0, 1) ** 0.75, 0, 1) if lift else L
    tinted = violet_ramp(Lb * 255, ramp)
    # keep a little of the original hue variation (neon, signs) for realism
    chroma = a - L[..., None]
    tinted = np.clip(tinted + chroma * 0.25, 0, 1)

    # soft violet glow around the brightest background lights
    hot = np.clip((Lb - 0.55) / 0.45, 0, 1) * bg
    glow = blur(hot, 35 * k)
    gcol = np.array([0.90, 0.25, 0.60]) if ramp == "pink" else np.array([0.55, 0.20, 0.90])
    tinted = 1 - (1 - tinted) * (1 - glow[..., None] * gcol * 0.6)

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
    p.add_argument("--ramp", default="violet", choices=sorted(RAMPS))
    p.add_argument("--bg-blur", type=float, default=0.0, help="background blur (px at 2000px long side)")
    args = p.parse_args()
    im = Image.open(args.input)
    rgb = im.convert("RGB")
    if args.mask:
        mask = Image.open(args.mask).convert("L")
    else:
        from rembg import new_session, remove
        mask = remove(rgb, session=new_session("birefnet-portrait"), only_mask=True)
    a = np.asarray(rgb).astype(np.float64) / 255.0
    out = violet_background(a, mask, args.strength, args.lift, args.ramp, args.bg_blur)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
