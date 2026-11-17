"""Frames + masks -> RGBA frames of Elena (WORKDIR/rgba), cropped to source
rows 150-1550. Brightens and sharpens her, removes leftovers of the teal
cloth and stray blobs, smooths small edge wobbles (anti-flicker, no ghost
trails) and bakes a soft contact shadow under the feet.
Usage: python3 scripts/elena-compose.py WORKDIR
"""

import glob
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

work = sys.argv[1]
os.makedirs(f"{work}/rgba", exist_ok=True)


def mask(i):
    return np.asarray(Image.open(f"{work}/mask/{i:04d}.png").convert("L")).astype(np.float32)


for f in sorted(glob.glob(f"{work}/frames/*.png")):
    name = os.path.basename(f)
    idx = int(name[:4])
    rgb = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)

    cur = mask(idx)
    acc, wsum = 0, 0
    for d, w in ((-1, 0.25), (0, 0.5), (1, 0.25)):
        if os.path.exists(f"{work}/mask/{idx + d:04d}.png"):
            acc, wsum = acc + w * mask(idx + d), wsum + w
    avg = acc / wsum
    sm = np.where(np.abs(avg - cur) < 40, avg, cur)
    m = Image.fromarray(sm.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    m = np.clip((np.asarray(m).astype(np.float32) / 255 - 0.2) / 0.6, 0, 1)

    r0, g0, b0 = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    m = np.where((g0 > r0 * 1.6) & (b0 > r0 * 1.5) & (g0 > 60), 0, m)
    lab, n = ndimage.label(m > 0.5)
    if n:
        sizes = ndimage.sum(np.ones_like(m), lab, range(1, n + 1))
        bottoms = ndimage.maximum(np.indices(m.shape)[0], lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, (s, b) in enumerate(zip(sizes, bottoms)) if s > 4000 and b > 1250])
        m = m * ndimage.binary_dilation(keep, iterations=12)
    else:
        m = m * 0

    pil = Image.fromarray(rgb.clip(0, 255).astype(np.uint8))
    pil = pil.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
    lit = np.asarray(pil).astype(np.float32) / 255
    lit = (1 - (1 - lit) ** 1.35) * np.array([1.04, 1.0, 0.95])
    lit = (lit * 255).clip(0, 255)
    r, g, b = lit[..., 0], lit[..., 1], lit[..., 2]
    edge = (m > 0.02) & (m < 0.98)
    g = np.where(edge & (g > np.maximum(r, b * 0.9)), np.maximum(r, b * 0.9), g)

    alpha = (m * 255).astype(np.uint8)
    ys, xs = np.nonzero(alpha > 128)
    shadow = Image.new("L", (1080, 1920), 0)
    if len(ys) > 500:
        foot = ys.max()
        low = xs[ys > foot - 60]
        cx, w = low.mean(), max(140, low.max() - low.min() + 80)
        ImageDraw.Draw(shadow).ellipse([cx - w / 2, foot - 18, cx + w / 2, foot + 22], fill=110)
        shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    sh = np.asarray(shadow).astype(np.float32) / 255
    a = m + sh * (1 - m)
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.dstack([r, g, b]) * (m[..., None] / safe) + np.array([60, 40, 25]) * ((sh * (1 - m))[..., None] / safe)
    out = np.dstack([col, a * 255]).clip(0, 255).astype(np.uint8)[150:1550]
    Image.fromarray(out, "RGBA").save(f"{work}/rgba/{name}")
print("ok")
