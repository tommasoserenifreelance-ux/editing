"""Remove the LED line graphics from pillars: fill each polygon with a plain
dark (or light) surface with soft shading, then suppress leftover thin bright
lines just around it. Operates on the source image before toning.

Usage: python pillar_clean.py in.png out.png --poly "x,y x,y ..." [--poly ...] [--light]
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw

from nightlife_grade import blur, lum


def clean(a, polys, light=False):
    h, w, _ = a.shape
    k = max(w, h) / 1000.0
    M = Image.new("L", (w, h), 0)
    for poly in polys:
        ImageDraw.Draw(M).polygon(poly, fill=255)
    m = np.asarray(M).astype(np.float64) / 255.0
    ms = np.clip(blur(m, 1.2 * k), 0, 1)
    # tint of the photo (keeps B&W neutral, gold stays gold)
    La = lum(a)
    mid = a[(La > np.percentile(La, 40)) & (La < np.percentile(La, 70))].mean(0)   # colour of the photo's shadows
    tint = mid / max(mid.max(), 1e-6)
    hi_t = a[La > np.percentile(La, 93)].mean(0)
    lut_x = np.linspace(0, 1, 33)
    idx = np.clip((La * 32).round().astype(int), 0, 32)
    lut = np.array([a[idx == i].mean(0) if (idx == i).sum() > 30 else np.full(3, lut_x[i]) for i in range(33)])
    for i in range(1, 33):                       # fill gaps / keep it monotone-ish
        if not np.isfinite(lut[i]).all(): lut[i] = lut[i - 1]
    out = a.copy()
    soft = blur(a, 30 * k)                                   # room light falling on the pillar
    rng = np.random.default_rng(1)
    for poly in polys:
        P = Image.new("L", (w, h), 0); ImageDraw.Draw(P).polygon(poly, fill=255)
        pm = np.asarray(P) > 0
        ys_, xs_ = np.nonzero(pm)
        x0, x1 = xs_.min(), xs_.max()
        xx = np.arange(w)[None, :]
        t = np.clip((xx - x0) / max(1, x1 - x0) * 2 - 1, -1, 1)
        rim = np.exp(-((np.abs(t) - 0.85) / 0.08) ** 2)            # glossy edges
        sheen = np.exp(-((t + 0.35) / 0.12) ** 2) * 0.5            # soft vertical reflection
        # plain surface in the photo's own colour: the pillar's own light, smoothed so the
        # LED lines disappear (normalised blur inside the polygon), with cylinder shading
        pmf = pm.astype(np.float64)
        num = blur(a * pmf[..., None], 14 * k)
        den = blur(pmf, 14 * k)[..., None]
        own = num / np.maximum(den, 1e-3)
        cyl = 0.72 + 0.28 * np.sqrt(np.clip(1 - t ** 2, 0, 1))
        Lown = lum(own)[..., None] * cyl[..., None] * (1.05 if light else 0.85)
        vn = blur(rng.normal(0, 1, (1, w)).repeat(8, 0), 1.2)[0:1] * 0.025   # faint, irregular vertical sheen
        Lv = np.clip(Lown[..., 0] * (1 + vn), 0, 1)
        surf = np.stack([np.interp(Lv, lut_x, lut[:, c]) for c in range(3)], -1)  # photo's own colour at that brightness
        surf = surf + (rim * 0.05)[..., None] * hi_t
        surf = surf + rng.normal(0, 0.006, a.shape)
        out = np.where(pm[..., None], np.broadcast_to(surf, a.shape), out)
    out = a * (1 - ms[..., None]) + out * ms[..., None]
    # leftover bright thin lines in a band around the pillars (not inside crowd faces too much)
    ring = np.clip(blur(np.roll(m, int(35 * k), 0), 28 * k) * 5, 0, 1) * (1 - ms)   # wider, reaching below
    from PIL import ImageFilter
    o8 = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    local = np.asarray(o8.filter(ImageFilter.MinFilter(7))).astype(np.float64) / 255.0
    local = blur(local, 2.5 * k)                           # line-free background, no blocks
    lines = np.clip((lum(out) - lum(local) - 0.06) * 5, 0, 1)
    wgt = np.clip(blur(lines, 0.8 * k) * ring, 0, 1)[..., None]
    out = out * (1 - wgt) + local * wgt
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input"); p.add_argument("output")
    p.add_argument("--poly", action="append", required=True)
    p.add_argument("--light", action="store_true")
    a = p.parse_args()
    polys = [[tuple(map(float, pt.split(","))) for pt in s.split()] for s in a.poly]
    img = np.asarray(Image.open(a.input).convert("RGB")).astype(np.float64) / 255.0
    Image.fromarray((clean(img, polys, a.light) * 255).astype(np.uint8)).save(a.output)
    print("saved", a.output)


if __name__ == "__main__":
    main()
