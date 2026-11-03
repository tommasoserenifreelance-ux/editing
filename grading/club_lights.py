"""Add reference-style club lights behind the subject: soft steel-blue beams in
haze from moving heads and a faint red ambient, matching the references. The subject is cut out with a portrait segmentation
model (rembg / BiRefNet) so the lights stay behind them.

Usage: python club_lights.py graded.jpg output.jpg [--mask mask.png] [--seed 7]
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from nightlife_grade import blur


def get_mask(im, mask_path=None):
    if mask_path:
        return Image.open(mask_path).convert("L").resize(im.size)
    from rembg import new_session, remove
    return remove(im, session=new_session("birefnet-portrait"), only_mask=True)


def beam_layer(w, h, origin, angle_deg, length, width0, width1, color, soft):
    """A cone of light starting at origin, pointing along angle."""
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    ang = np.radians(angle_deg)
    dx, dy = np.cos(ang), np.sin(ang)
    px, py = -dy, dx
    ox, oy = origin
    ex, ey = ox + dx * length, oy + dy * length
    poly = [(ox + px * width0, oy + py * width0), (ex + px * width1, ey + py * width1),
            (ex - px * width1, ey - py * width1), (ox - px * width0, oy - py * width0)]
    d.polygon(poly, fill=255)
    a = blur(np.asarray(layer).astype(np.float64) / 255.0, soft)
    # fade along the beam
    yy, xx = np.mgrid[0:h, 0:w]
    t = np.clip(((xx - ox) * dx + (yy - oy) * dy) / length, 0, 1)
    a = a * (1 - t) ** 1.4
    return a[..., None] * np.array(color)[None, None, :]


# Colours sampled from reference 2 (moving-head beams in haze, dark red ambient).
BEAM_BLUE = np.array([0.30, 0.62, 0.88])
HEAD_CYAN = np.array([0.75, 0.95, 1.00])
AMBIENT_RED = np.array([0.40, 0.04, 0.08])


def add_lights(img, mask, seed=7):
    """Reference-style lights: a few soft steel-blue beams in haze from moving
    heads at the top of the frame, a faint dark-red ambient haze, all behind the
    subject. Background stays dark like the references."""
    a = np.asarray(img.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.asarray(mask).astype(np.float64) / 255.0
    m = blur(np.clip((m - 0.15) / 0.7, 0, 1), 1.2 * k)
    bg = 1 - m
    yy, xx = np.mgrid[0:h, 0:w]
    light = np.zeros_like(a)

    # faint red ambient haze (as in the reference background)
    for cx, cy, r, s in [(0.85, 0.35, 0.30, 0.10), (0.08, 0.55, 0.25, 0.07)]:
        d2 = ((xx - cx * w) ** 2 + (yy - cy * h) ** 2) / (r * max(w, h)) ** 2
        light += np.exp(-d2 * 2.5)[..., None] * AMBIENT_RED * s

    # moving heads: (x, y) of fixture, beam angle (deg, 90 = straight down), width
    heads = [((0.78, 0.035), 112, 1.0), ((0.92, 0.10), 98, 0.8), ((0.60, 0.02), 84, 0.7)]
    for (fx, fy), ang, wid in heads:
        ox, oy = fx * w, fy * h
        # wide soft volumetric cone + brighter core, out of focus like the reference
        light += beam_layer(w, h, (ox, oy), ang, 0.75 * h, 14 * k * wid, 95 * k * wid, BEAM_BLUE, 26 * k) * 0.30
        light += beam_layer(w, h, (ox, oy), ang, 0.55 * h, 6 * k * wid, 30 * k * wid, BEAM_BLUE * 0.8 + 0.2, 9 * k) * 0.28
        # fixture lens: small bright oval with a soft halo
        d2 = ((xx - ox) / (16 * k)) ** 2 + ((yy - oy) / (10 * k)) ** 2
        light += np.exp(-d2)[..., None] * HEAD_CYAN * 1.3
        light += np.exp(-d2 / 9)[..., None] * BEAM_BLUE * 0.35

    light *= bg[..., None]
    out = 1 - (1 - a) * np.exp(-light)   # screen-like add, keeps blacks deep

    # very subtle cool edge light on the hair/shoulders from the beams
    edge = np.clip(blur(bg, 8 * k) * m * 2.0, 0, 1)
    rim = blur(light, 40 * k) * edge[..., None] * 0.25
    out = 1 - (1 - out) * np.exp(-rim)
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--mask")
    p.add_argument("--seed", type=int, default=7)
    args = p.parse_args()
    im = Image.open(args.input)
    icc = im.info.get("icc_profile")
    rgb = im.convert("RGB")
    out = add_lights(rgb, get_mask(rgb, args.mask), args.seed)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    kw = {"icc_profile": icc} if icc else {}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
