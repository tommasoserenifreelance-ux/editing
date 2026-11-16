"""Tone down harsh direct-flash on faces/skin: only skin areas, only the bright
part. Compresses skin highlights, lowers exposure on lit skin, restores a bit of
local contrast so the face is not flat. Background/effects untouched.

Usage: python deflash.py in.jpg out.jpg [--amount 0.6] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur, lum, skin_mask, rgb_to_hsv, hsv_to_rgb


def deflash(a, amount=0.85):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    L = lum(a)
    sk = np.clip(skin_mask(a) * 1.6, 0, 1)
    # flash-blown skin is pale and barely saturated: warm, bright, R>=G>=B
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    warm = np.clip((r - b) * 8, 0, 1) * np.clip((g - b + 0.02) * 10, 0, 1) * np.clip((r - g + 0.03) * 12, 0, 1)
    sk = np.maximum(sk, warm * np.clip((L - 0.5) / 0.2, 0, 1))
    lit = np.clip((L - 0.42) / 0.25, 0, 1)
    m = np.clip(blur(sk * lit, 6 * k) * 1.3, 0, 1) * amount
    # target luminance: highlights compressed towards ~0.62, about -0.35 EV on lit skin
    Lt = np.where(L > 0.40, 0.40 + (L - 0.40) * 0.45, L) * 0.90
    # keep detail: add back part of the local contrast lost by the compression
    detail = L - blur(L, 3 * k)
    Lt = Lt + detail * 0.35
    L2 = L + (Lt - L) * m
    out = np.clip(a * (L2 / np.maximum(L, 1e-4))[..., None], 0, 1)
    # blown skin has lost its colour (near white -> grey once darkened):
    # give it back the hue/saturation of this person's correctly lit skin
    h0, s0, v0 = rgb_to_hsv(a)
    ref = (sk > 0.5) & (L > 0.28) & (L < 0.58) & (s0 > 0.15)
    if ref.sum() > 200:
        rh = np.median(h0[ref]); rs = np.median(s0[ref])
    else:
        rh, rs = 22.0, 0.38
    h1, s1, v1 = rgb_to_hsv(out)
    blown = np.clip((L - 0.55) / 0.3, 0, 1) * (m / max(amount, 1e-6))
    hd = (rh - h1 + 180) % 360 - 180
    h2 = h1 + hd * blown
    s2 = s1 + (np.maximum(s1, rs * 0.95) - s1) * blown
    out = hsv_to_rgb(h2, np.clip(s2, 0, 1), v1)
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input"); p.add_argument("output")
    p.add_argument("--amount", type=float, default=0.85)
    p.add_argument("--exif-from")
    a = p.parse_args()
    im = Image.open(a.input)
    arr = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    o = Image.fromarray(np.round(deflash(arr, a.amount) * 255).astype(np.uint8))
    src = Image.open(a.exif_from) if a.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    o.save(a.output, quality=100, subsampling=0, **kw)
    print("saved", a.output)


if __name__ == "__main__":
    main()


def recover(a, subj, amount=0.7):
    """Applied to the ORIGINAL photo before grading (highlights not yet clipped):
    smooth highlight compression on the lit parts of the subject (faces, skin
    hit by the flash). Hue is kept because the RGB is scaled, not replaced."""
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    L = lum(a)
    Ls = blur(L, 5 * k)
    wgt = np.clip(blur(subj, 10 * k) * 1.2, 0, 1) * np.clip((Ls - 0.40) / 0.25, 0, 1)
    wgt = blur(wgt, 6 * k) * amount
    Lt = np.where(L > 0.38, 0.38 + (L - 0.38) * 0.45, L)
    L2 = L + (Lt - L) * wgt
    return np.clip(a * (L2 / np.maximum(L, 1e-4))[..., None], 0, 1)
