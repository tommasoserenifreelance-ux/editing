"""Add 'wow' club lights behind the subject: volumetric beams, coloured haze,
bokeh and lens flares. The subject is cut out with a portrait segmentation
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


def add_lights(img, mask, seed=7):
    rng = np.random.default_rng(seed)
    a = np.asarray(img.convert("RGB")).astype(np.float64) / 255.0
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    m = np.asarray(mask).astype(np.float64) / 255.0
    m = np.clip((m - 0.15) / 0.7, 0, 1)
    m = blur(m, 1.2 * k)                       # soft but tight edge
    bg = 1 - m

    light = np.zeros_like(a)
    magenta = np.array([1.0, 0.15, 0.75])
    blue = np.array([0.15, 0.45, 1.0])
    amber = np.array([1.0, 0.62, 0.25])
    cyan = np.array([0.3, 0.9, 1.0])

    # 1. Coloured haze glows (big soft blobs), like smoke lit by washes
    yy, xx = np.mgrid[0:h, 0:w]
    for cx, cy, r, col, s in [(0.10, 0.30, 0.35, blue, 0.16), (0.92, 0.22, 0.35, magenta, 0.16),
                              (0.60, 0.02, 0.30, amber, 0.12)]:
        d2 = ((xx - cx * w) ** 2 + (yy - cy * h) ** 2) / (r * max(w, h)) ** 2
        light += np.exp(-d2 * 2.5)[..., None] * col * s

    # 2. Volumetric beams fanning down from rigs at the top
    beams = [((0.18, -0.02), 70, blue), ((0.50, -0.03), 98, amber), ((0.84, -0.02), 112, magenta),
             ((0.66, -0.02), 80, cyan), ((0.30, -0.02), 118, magenta)]
    for (ox, oy), ang, col in beams:
        ang += rng.uniform(-3, 3)
        light += beam_layer(w, h, (ox * w, oy * h), ang, 1.1 * h, 4 * k, 110 * k, col, 30 * k) * 0.22
        light += beam_layer(w, h, (ox * w, oy * h), ang, 0.9 * h, 1.5 * k, 16 * k, col * 0.7 + 0.3, 3 * k) * 0.30

    # 3. Hot spots (fixtures) with star flare at beam origins
    for (ox, oy), ang, col in beams:
        cx, cy = ox * w, max(oy * h, 25 * k)
        d2 = ((xx - cx) ** 2 + (yy - cy) ** 2)
        light += np.exp(-d2 / (14 * k) ** 2)[..., None] * (col * 0.4 + 0.6) * 1.0
        light += np.exp(-d2 / (60 * k) ** 2)[..., None] * col * 0.35
        streak = np.exp(-((yy - cy) / (3 * k)) ** 2) * np.exp(-np.abs(xx - cx) / (260 * k))
        light += streak[..., None] * (col * 0.5 + 0.5) * 0.35

    # 4. Bokeh balls in the crowd
    bok = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(bok)
    for _ in range(18):
        x, y = rng.uniform(0, w), rng.uniform(0.25 * h, 0.6 * h)
        r = rng.uniform(6, 20) * k
        col = [magenta, blue, amber, cyan][rng.integers(4)]
        lum = rng.uniform(0.15, 0.45)
        c = tuple(int(255 * min(1, v * lum)) for v in col)
        d.ellipse((x - r, y - r, x + r, y + r), fill=c)
    bok = np.asarray(bok.filter(ImageFilter.GaussianBlur(3 * k))).astype(np.float64) / 255.0
    light += bok * 0.6

    # Lights only where there is background; screen-blend so blacks lift into colour
    fade = np.clip(1.15 - yy / h, 0.15, 1)[..., None]
    light = np.clip(light * fade, 0, 2) * bg[..., None]
    out = 1 - (1 - a) * np.exp(-light)          # soft "screen" for HDR-ish light

    # 5. Rim light on the subject edges from the coloured backlight
    edge = np.clip(blur(bg, 10 * k) * m * 2.2, 0, 1)
    rim = blur(light, 30 * k) * edge[..., None] * 0.35
    out = 1 - (1 - out) * np.exp(-rim)

    # 6. Overall bloom on highlights
    L = out @ np.array([0.2126, 0.7152, 0.0722])
    glow = blur(out * np.clip((L - 0.7) / 0.3, 0, 1)[..., None], 25 * k)
    out = 1 - (1 - out) * (1 - glow * 0.25)
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
