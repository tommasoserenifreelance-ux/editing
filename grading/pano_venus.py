"""Venue panorama -> Venus look: tone the whole frame along the violet ramp,
upscale, and place the real 'venus' neon sign (cut from an event photo) on a wall
with its glow.

Usage: python pano_venus.py in.png sign.png out.jpg --at x,y --width W [--scale 2]
       (x,y,W in input-image pixels)
"""
import argparse
import numpy as np
from PIL import Image, ImageFilter

from nightlife_grade import blur, lum
from violet_background import violet_ramp


def sign_layer(sign, width):
    """Clean neon tubes from the photographed sign: magenta mask, gaps from the
    lens flare closed morphologically, then re-lit uniformly (pink-violet tube,
    pale core) so the lettering reads 'venus' cleanly."""
    s = sign.convert("RGB")
    a = np.asarray(s).astype(np.float64) / 255.0
    # tubes are the brightest pink/white strokes; the lit acrylic panel behind is darker
    mn = np.minimum(a[..., 0], a[..., 2])
    tube = np.clip((mn - 0.78) / 0.12, 0, 1)
    m = Image.fromarray((tube * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))      # drop specks
    m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))      # close gaps
    h = int(width * s.height / s.width)
    m = m.resize((int(width), h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5))
    alpha = np.clip(np.asarray(m).astype(np.float64) / 255.0 * 1.3, 0, 1)
    core = np.clip((alpha - 0.55) / 0.45, 0, 1)
    col = alpha[..., None] * np.array([0.92, 0.38, 1.0]) + core[..., None] * np.array([0.08, 0.30, 0.0])
    return np.clip(col, 0, 1), alpha


def build(img, sign, at, width, scale=2):
    a = np.asarray(img.convert("RGB")).astype(np.float64) / 255.0
    L = lum(a)
    toned = violet_ramp(np.clip(L * 1.08, 0, 1) * 255, "violet_vivid")
    # keep a little local brightness detail (light spots stay hot but violet)
    toned = np.clip(toned + np.clip(L - 0.8, 0, 1)[..., None] * np.array([0.5, 0.35, 0.6]), 0, 1)
    im = Image.fromarray((toned * 255).astype(np.uint8))
    W, H = im.size[0] * scale, im.size[1] * scale
    im = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    out = np.asarray(im).astype(np.float64) / 255.0
    # sign
    sa, al = sign_layer(sign, width * scale)
    sh, sw = al.shape
    x0, y0 = int(at[0] * scale - sw / 2), int(at[1] * scale - sh / 2)
    layer = np.zeros_like(out); amap = np.zeros(out.shape[:2])
    ys, xs = slice(max(0, y0), min(H, y0 + sh)), slice(max(0, x0), min(W, x0 + sw))
    sy, sx = slice(ys.start - y0, ys.stop - y0), slice(xs.start - x0, xs.stop - x0)
    layer[ys, xs] = sa[sy, sx]; amap[ys, xs] = al[sy, sx]
    neon = layer * amap[..., None]
    k = max(W, H) / 2000.0
    glow = blur(neon, 6 * k) * 0.55 + blur(neon, 30 * k) * 0.6
    out = 1 - (1 - out) * (1 - np.clip(glow, 0, 1))
    out = out * (1 - amap[..., None]) + np.maximum(out, neon) * amap[..., None]
    return Image.fromarray(np.round(np.clip(out, 0, 1) * 255).astype(np.uint8))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input"); p.add_argument("sign"); p.add_argument("output")
    p.add_argument("--at", required=True); p.add_argument("--width", type=float, required=True)
    p.add_argument("--scale", type=int, default=2)
    a = p.parse_args()
    o = build(Image.open(a.input), Image.open(a.sign), tuple(map(float, a.at.split(","))), a.width, a.scale)
    o.save(a.output, quality=100, subsampling=0)
    print("saved", a.output, o.size)


if __name__ == "__main__":
    main()
