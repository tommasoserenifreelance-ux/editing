"""Turn a decorated pillar in a venue photo into a VENUS neon pillar (reference:
pink neon rings + big outlined serif letters wrapping a dark cylinder).

Usage: python pano_pillar.py in.png out.jpg --quad x1,y1,x2,y2,x3,y3,x4,y4
       [--tone violet|neutral] [--scale 2] [--fade 0.25]
quad = TL,TR,BR,BL corners of the visible pillar (input pixels).
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from nightlife_grade import blur, lum
from violet_background import violet_ramp

FONT = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"


def homography(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
    b = [c for p in dst for c in p]
    return np.linalg.solve(np.array(A, float), np.array(b, float))


def pillar_texture(tw, th):
    """Reference pillar: glowing magenta cylinder, thick segmented horizontal light
    bands, huge solid serif VENUS letters crossed by the bands.
    Returns (glow intensity 0..1, hot core 0..1) in screen columns."""
    W = int(tw * 1.9)
    band = Image.new("L", (W, th), 0); db = ImageDraw.Draw(band)
    bw = max(4, int(th * 0.034))
    rows = [0.05, 0.19] + [0.40 + i * 0.08 for i in range(7)]
    rng = np.random.default_rng(5)
    for v in rows:
        y = int(v * th); x = 0
        while x < W:                      # segmented tubes with small gaps
            ln = int(rng.uniform(0.18, 0.35) * W)
            db.line([(x, y), (min(W, x + ln), y)], fill=255, width=bw)
            x += ln + int(rng.uniform(0.02, 0.05) * W)
    let = Image.new("L", (W, th), 0); dl = ImageDraw.Draw(let)
    # huge letters that wrap round the cylinder (outer letters run off the edges, like the reference)
    size = int(th * 0.62)
    font = ImageFont.truetype(FONT, size)
    bb = dl.textbbox((0, 0), "VENUS", font=font)
    font = ImageFont.truetype(FONT, int(size * W * 1.15 / (bb[2] - bb[0])))
    bb = dl.textbbox((0, 0), "VENUS", font=font)
    x = (W - (bb[2] - bb[0])) // 2 - bb[0]
    y = int(th * 0.60) - (bb[3] - bb[1]) // 2 - bb[1]
    dl.text((x, y), "VENUS", font=font, fill=255)
    B = np.asarray(band.filter(ImageFilter.GaussianBlur(bw * 0.35))).astype(np.float64) / 255.0
    Lt = np.asarray(let.filter(ImageFilter.GaussianBlur(1.0))).astype(np.float64) / 255.0
    xs = np.linspace(-0.985, 0.985, tw)
    cols = ((np.arcsin(xs) / np.pi + 0.5) * (W - 1)).astype(int)
    B, Lt = B[:, cols], Lt[:, cols]
    bulge = (np.sqrt(1 - xs ** 2) * 0.05 * th).astype(int)      # rings seen from below
    B = np.stack([np.roll(B[:, i], bulge[i]) for i in range(tw)], 1)
    Lt = np.stack([np.roll(Lt[:, i], bulge[i]) for i in range(tw)], 1)
    facing = np.sqrt(1 - xs ** 2)[None, :]
    rimlight = np.exp(-((np.abs(xs) - 0.93) / 0.05) ** 2)[None, :]   # bright vertical edges
    surface = 0.10 * (0.6 + 0.4 * facing) + 0.55 * rimlight
    inten = np.clip(np.maximum.reduce([np.broadcast_to(surface, B.shape), Lt * (0.8 + 0.2 * facing), B]), 0, 1)
    core = np.clip(B * 1.4 - 0.35, 0, 1) * (0.5 + 0.5 * facing)
    return inten, core


def build(img, quad, tone="violet", scale=2, fade=0.25):
    a = np.asarray(img.convert("RGB")).astype(np.float64) / 255.0
    L = lum(a)
    if tone == "violet":
        base = violet_ramp(np.clip(L * 1.08, 0, 1) * 255, "violet_vivid")
        base = np.clip(base + np.clip(L - 0.8, 0, 1)[..., None] * np.array([0.5, 0.35, 0.6]), 0, 1)
        neon_col = np.array([0.85, 0.18, 1.0])
    else:  # neutral: the photo's own colours; the pillar glows in the photo's highlight colour
        base = a
        hi = a[L >= np.percentile(L, 98)].mean(0)
        neon_col = np.clip(hi / hi.max(), 0, 1)
    core_col = np.clip(neon_col * 0.35 + 0.75, 0, 1)
    im = Image.fromarray((base * 255).astype(np.uint8))
    W, H = im.size[0] * scale, im.size[1] * scale
    im = im.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    out = np.asarray(im).astype(np.float64) / 255.0
    q = [(quad[i] * scale, quad[i + 1] * scale) for i in range(0, 8, 2)]
    xs = [p[0] for p in q]; ys = [p[1] for p in q]
    tw, th = int(max(xs) - min(xs)), int(max(ys) - min(ys))
    inten, core = pillar_texture(tw, th)
    coef = homography(q, [(0, 0), (tw - 1, 0), (tw - 1, th - 1), (0, th - 1)])
    def warp(arr):
        t = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
        return np.asarray(t.transform((W, H), Image.PERSPECTIVE, tuple(coef), Image.BILINEAR)).astype(np.float64) / 255.0
    x0, x1 = int(min(xs)), int(max(xs))
    yb0, yb1 = int(max(ys) - fade * (max(ys) - min(ys))), min(H, int(max(ys) + 0.45 * (max(ys) - min(ys))))
    cur = out[yb0:yb1, x0:x1].copy()
    kk = max(W, H) / 2000.0
    local = blur(cur, 7 * kk)                                      # smooth surroundings
    Lc, Ll = lum(cur), lum(local)
    lines = np.clip((Lc - Ll - 0.04) * 5, 0, 1)                    # thin bright LED lines only
    lines = blur(lines, 1.5 * kk)[..., None]
    feather = np.minimum(np.linspace(0, 1, x1 - x0) * 6, np.linspace(1, 0, x1 - x0) * 6).clip(0, 1)[None, :, None]
    vfeat = np.minimum(np.linspace(0, 1, yb1 - yb0) * 4, np.linspace(1, 0, yb1 - yb0) * 3).clip(0, 1)[:, None, None]
    w_ = lines * feather * vfeat * 0.9
    out[yb0:yb1, x0:x1] = cur * (1 - w_) + local * 0.8 * w_
    I = warp(inten) ** 1.15; C = warp(core); region = warp(np.ones((th, tw)))
    yy = np.arange(H)[:, None]
    bot, top = max(ys), min(ys)
    fade_m = np.clip((bot - yy) / max(1, fade * (bot - top)), 0, 1)
    k = max(W, H) / 2000.0
    region = np.clip(blur(region * fade_m, 2 * k), 0, 1)
    light = I[..., None] * neon_col + C[..., None] * (core_col - neon_col * 0.5)
    light = np.clip(light, 0, 1)
    out = out * (1 - region[..., None]) + light * region[..., None]          # the pillar IS the light
    lit = light * region[..., None]
    glow = blur(lit, 8 * k) * 0.7 + blur(lit, 40 * k) * 0.7 + blur(lit, 120 * k) * 0.45
    out = 1 - (1 - out) * (1 - np.clip(glow, 0, 1) * (1 - region[..., None] * 0.6))
    return Image.fromarray(np.round(np.clip(out, 0, 1) * 255).astype(np.uint8))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input"); p.add_argument("output")
    p.add_argument("--quad", required=True)
    p.add_argument("--tone", default="violet", choices=["violet", "neutral"])
    p.add_argument("--scale", type=int, default=2)
    p.add_argument("--fade", type=float, default=0.2)
    a = p.parse_args()
    o = build(Image.open(a.input), list(map(float, a.quad.split(","))), a.tone, a.scale, a.fade)
    o.save(a.output, quality=100, subsampling=0)
    print("saved", a.output, o.size)


if __name__ == "__main__":
    main()
