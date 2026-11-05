"""Drag-shutter motion blur: the subject stays sharp (flash), the background is
smeared along one direction and a soft ghost of the subject trails behind it.

Usage: python motion_blur.py input.jpg output.jpg --mask mask.png [--angle 12]
       [--length 0.07] [--ghost 0.35] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image

from nightlife_grade import blur


def line_blur(a, angle, n):
    """Average along a direction (rotate, 1D box blur, rotate back) per channel."""
    out = np.empty_like(a)
    h, w = a.shape[:2]
    for c in range(a.shape[2]):
        im = Image.fromarray((np.clip(a[..., c], 0, 1) * 65535).astype(np.uint16).astype(np.int32), "I").convert("F")
        r = im.rotate(angle, resample=Image.BILINEAR, expand=True)
        b = np.asarray(r, dtype=np.float32) / 65535.0
        pad = np.pad(b, ((0, 0), (n + 1, n)), mode="edge")
        cs = np.cumsum(pad, axis=1, dtype=np.float64)
        sm = ((cs[:, 2 * n + 1:] - cs[:, :-2 * n - 1]) / (2 * n + 1)).astype(np.float32)
        back = Image.fromarray(sm * 65535.0, "F").rotate(-angle, resample=Image.BILINEAR, expand=True)
        W, H = back.size
        l, t = (W - w) // 2, (H - h) // 2
        out[..., c] = np.asarray(back.crop((l, t, l + w, t + h))) / 65535.0
    return out


def motion(a, mask, angle=12.0, length=0.07, ghost=0.35):
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 1.5 * k), 0, 1)
    n = max(3, int(length * w / 2))
    smeared = line_blur(a, angle, n)
    # ghost: the subject itself smeared and shifted slightly, seen behind it
    t = np.radians(angle)
    dx, dy = int(np.cos(t) * n * 0.6), int(-np.sin(t) * n * 0.6)
    g = np.roll(np.roll(line_blur(a * m[..., None], angle, n), dy, 0), dx, 1)
    gm = np.roll(np.roll(line_blur(m[..., None], angle, n)[..., 0], dy, 0), dx, 1)
    bg = smeared * (1 - gm[..., None] * ghost) + g * ghost
    return np.clip(a * m[..., None] + bg * (1 - m)[..., None], 0, 1)


def subject_motion(a, mask, angle=10.0, length=0.05, amount=0.45):
    """Drag shutter ON the subject: the sharp (flash) subject plus a smeared,
    slightly shifted copy of itself that trails off in one direction."""
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.clip(blur(np.clip((mask - 0.15) / 0.7, 0, 1), 1.5 * k), 0, 1)
    n = max(3, int(length * w / 2))
    t = np.radians(angle)
    dx, dy = int(np.cos(t) * n * 0.8), int(-np.sin(t) * n * 0.8)
    sm = line_blur(a * m[..., None], angle, n)
    smm = line_blur(m[..., None], angle, n)[..., 0]
    sm = np.roll(np.roll(sm, dy, 0), dx, 1)
    smm = np.roll(np.roll(smm, dy, 0), dx, 1)
    ghost = sm / np.maximum(smm, 1e-3)[..., None]
    wgt = (np.clip(smm * 1.3, 0, 1) * amount)[..., None]
    # lighten-style mix: the trail shows where it is brighter (light streak), sharp image stays underneath
    trail = np.maximum(a, ghost)
    return np.clip(a * (1 - wgt) + trail * wgt * 0.85 + ghost * wgt * 0.15, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask", required=True)
    p.add_argument("--angle", type=float, default=12.0)
    p.add_argument("--length", type=float, default=0.07)
    p.add_argument("--ghost", type=float, default=0.35)
    p.add_argument("--exif-from")
    p.add_argument("--on-subject", action="store_true", help="blur the subject (drag shutter) instead of the background")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    mask = np.asarray(Image.open(args.mask).convert("L").resize((w, h))).astype(np.float64) / 255.0
    out = subject_motion(a, mask, args.angle, args.length) if args.on_subject else motion(a, mask, args.angle, args.length, args.ghost)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
