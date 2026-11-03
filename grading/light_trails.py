"""Neon light-painting trails (drag-shutter look) in violet, drawn over the
image with a bright core and a wide coloured glow, additive like real light.

Usage: python light_trails.py input.jpg output.jpg --head X Y --size S
       (head centre and head width in pixels) [--seed 3] [--exif-from orig.jpg]
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw

from nightlife_grade import blur

CORE = np.array([1.00, 0.80, 1.00])
GLOW = np.array([0.58, 0.12, 1.00])
HALO = np.array([0.45, 0.10, 0.85])


def smooth_noise(n, rng, scale, knots=6):
    """Low-frequency wobble (hand movement), smooth cubic-like interpolation."""
    x = rng.normal(0, 1, knots)
    t = np.linspace(0, knots - 1, n)
    i = np.clip(t.astype(int), 0, knots - 2)
    f = t - i
    f = f * f * (3 - 2 * f)
    return (x[i] * (1 - f) + x[i + 1] * f) * scale


def head_loops(cx, cy, s, rng):
    """Stacked elliptical loops around/through the head, drifting sideways."""
    n = 1600
    t = np.linspace(0, 2 * np.pi * 3.2, n)
    x = cx + 0.30 * s + 0.62 * s * np.cos(t) + np.linspace(-0.10 * s, 0.25 * s, n)
    y = cy - 0.95 * s + 0.16 * s * np.sin(t) + np.linspace(0, 0.75 * s, n)
    x += smooth_noise(n, rng, 0.06 * s)
    y += smooth_noise(n, rng, 0.04 * s)
    return np.stack([x, y], 1)


def streak(y0, x0, x1, s, rng, wave=0.05):
    n = 900
    x = np.linspace(x0, x1, n)
    y = y0 + wave * s * np.sin(np.linspace(0, rng.uniform(1.5, 3), n) + rng.uniform(0, 6)) + smooth_noise(n, rng, 0.04 * s, 4)
    return np.stack([x, y], 1)


def body_loop(cx, cy, s, rng):
    n = 900
    t = np.linspace(0.3, 2 * np.pi * 1.15, n)
    x = cx + 0.55 * s * np.cos(t) + np.linspace(0, 0.3 * s, n)
    y = cy + 0.35 * s * np.sin(t) + np.linspace(0, -0.15 * s, n)
    x += smooth_noise(n, rng, 0.05 * s)
    y += smooth_noise(n, rng, 0.05 * s)
    return np.stack([x, y], 1)


def connector(p0, p1, s, rng, wave=0.05, n=700, bulge=0.0):
    """Wavy segment between two points (gentle hand wobble)."""
    t = np.linspace(0, 1, n)
    x = p0[0] + (p1[0] - p0[0]) * t
    y = p0[1] + (p1[1] - p0[1]) * t
    env = np.sin(np.pi * t)  # wobble zero at the ends so joints stay continuous
    y = y + env * (wave * s * np.sin(t * rng.uniform(4, 8) + rng.uniform(0, 6)) + smooth_noise(n, rng, 0.03 * s, 4))
    x = x + env * bulge * s  # sideways arc
    return np.stack([x, y], 1)


def smooth_path(p, win):
    """Moving average on the coordinates: rounds the joints between segments."""
    k = np.ones(win) / win
    pad = np.pad(p, ((win, win), (0, 0)), mode="edge")
    return np.stack([np.convolve(pad[:, i], k, mode="same")[win:-win] for i in range(2)], 1)


def resample(p, n):
    """Even spacing along the arc length."""
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]
    t = np.linspace(0, d[-1], n)
    return np.stack([np.interp(t, d, p[:, i]) for i in range(2)], 1)


def render(paths, w, h, width, rng):
    """Draw paths with varying intensity into a float mask (0..1)."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    for p in paths:
        n = len(p)
        inten = np.clip(0.85 + 0.15 * np.sin(np.linspace(0, rng.uniform(4, 7), n) + rng.uniform(0, 6)), 0.15, 1)
        inten *= np.clip(np.minimum(np.arange(n), n - np.arange(n)) / (0.03 * n), 0, 1)  # fade ends
        for i in range(n - 1):
            v = int(255 * inten[i])
            if v > 3:
                d.line([tuple(p[i]), tuple(p[i + 1])], fill=v, width=max(1, int(width)))
    return np.asarray(img).astype(np.float64) / 255.0


def add_trails(a, head, size, seed=3):
    rng = np.random.default_rng(seed)
    h, w, _ = a.shape
    cx, cy = head
    s = size
    k = max(w, h) / 2000.0
    # ONE continuous trail, like a single light moved during the exposure:
    # enters from the left, loops around the head, drops to the shoulder,
    # circles it and leaves towards the left again.
    hl = head_loops(cx, cy, s, rng)
    bl = body_loop(cx + 0.05 * s, cy + 1.05 * s, s * 0.85, rng)
    a_in = connector((-0.05 * w, cy - 0.62 * s), hl[0], s, rng, 0.06)
    mid = connector(hl[-1], bl[0], s, rng, 0.02, bulge=0.30)
    a_out = connector(bl[-1], (-0.05 * w, cy + 0.75 * s), s, rng, 0.05)
    path = np.concatenate([a_in, hl, mid, bl, a_out])
    path = resample(smooth_path(path, 25), 5000)
    paths = [path]
    core = render(paths, w, h, 7 * k, rng)
    core = blur(core, 1.5 * k)
    glow1 = blur(core, 9 * k)
    glow2 = blur(core, 30 * k)
    light = (core[..., None] * CORE * 1.8 + glow1[..., None] * GLOW * 2.6 + glow2[..., None] * HALO * 2.0)
    # faint violet wash where the trails are, like the coloured cast in the reference
    wash = blur(core, 120 * k)
    light += wash[..., None] * HALO * 1.8
    out = 1 - (1 - a) * np.exp(-light)
    return np.clip(out, 0, 1)


def trails_from_mask(a, mask, ref_head, ref_size, head, size):
    """Place a trail mask extracted from a reference (grey 0..255) on the image,
    scaled so the reference head maps onto our head, and render it as violet neon."""
    h, w, _ = a.shape
    k = max(w, h) / 2000.0
    sc = size / ref_size
    # inverse affine: output (x, y) -> mask (x', y')
    ax = 1 / sc
    cx = ref_head[0] - head[0] / sc
    cy = ref_head[1] - head[1] / sc
    m = mask.convert("L").transform((w, h), Image.AFFINE, (ax, 0, cx, 0, ax, cy), resample=Image.BICUBIC)
    I = np.asarray(m).astype(np.float64) / 255.0
    I = blur(I, 2.0 * k)                       # slightly soft, like the reference
    core = np.clip((I - 0.35) / 0.45, 0, 1) ** 1.3
    hot = np.clip((I - 0.85) / 0.15, 0, 1)     # only the very centre goes pale
    glow1 = blur(I, 9 * k)
    glow2 = blur(I, 30 * k)
    wash = blur(I, 120 * k)
    sat_core = np.array([0.80, 0.30, 1.00])    # saturated violet core (reference core is full red)
    light = (core[..., None] * sat_core * 2.2 + hot[..., None] * CORE * 0.6
             + glow1[..., None] * GLOW * 2.4 + glow2[..., None] * HALO * 2.2 + wash[..., None] * HALO * 1.6)
    out = 1 - (1 - a) * np.exp(-light)
    return np.clip(out, 0, 1)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--head", type=float, nargs=2, required=True)
    p.add_argument("--mask", help="trail mask extracted from a reference (use its exact shape)")
    p.add_argument("--ref-head", type=float, nargs=2, help="head centre in the mask (px)")
    p.add_argument("--ref-size", type=float, help="head width in the mask (px)")
    p.add_argument("--size", type=float, required=True)
    p.add_argument("--seed", type=int, default=3)
    p.add_argument("--exif-from")
    args = p.parse_args()
    im = Image.open(args.input)
    a = np.asarray(im.convert("RGB")).astype(np.float64) / 255.0
    if args.mask:
        out = trails_from_mask(a, Image.open(args.mask), args.ref_head, args.ref_size, args.head, args.size)
    else:
        out = add_trails(a, args.head, args.size, args.seed)
    o = Image.fromarray(np.round(out * 255).astype(np.uint8))
    src = Image.open(args.exif_from) if args.exif_from else im
    kw = {k: v for k, v in (("icc_profile", src.info.get("icc_profile")), ("exif", src.info.get("exif"))) if v}
    if args.output.lower().endswith((".jpg", ".jpeg")):
        kw.update(quality=100, subsampling=0)
    o.save(args.output, **kw)
    print("saved", args.output, o.size)


if __name__ == "__main__":
    main()
