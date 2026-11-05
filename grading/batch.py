"""Batch edit a set of photos with a per-photo style.

Styles (all share the same nightlife base colour and the same violet):
  neutral  base colour only
  bokeh    violet blurred background + bokeh discs + grain          (approved look)
  glow     glossy bright skin + vivid violet background + grain
  streaks  violet background + horizontal 'scratched' streaks + grain
  flares   violet background + star flares on the real lights + grain
  crowd    whole frame toned violet (no subject) + grain
  trail    violet background + light-painting trail (needs head x,y,size) + grain
  motion   violet blurred background + drag-shutter blur ON the subject + grain (1-2 photos)

Usage: python batch.py assignments.csv in_dir out_dir [--workers 2]
CSV columns: name,style[,head_x,head_y,head_size]
"""
import argparse
import csv
import os
import sys
import zlib
from concurrent.futures import ProcessPoolExecutor

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nightlife_grade import grade, lum, blur, BRIGHT, MID, highlight_knee  # noqa: E402
from violet_background import violet_background  # noqa: E402
from bokeh import add_bokeh, layout  # noqa: E402
from skin_glow import glow  # noqa: E402
from motion_streaks import streaks  # noqa: E402
from star_flares import add_stars  # noqa: E402
from grain import add_grain  # noqa: E402
from light_trails import trails_from_mask  # noqa: E402
from motion_blur import subject_motion  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
def get_mask(img):
    """Union of two fast models: BiRefNet-lite (clean edges) + IS-Net (keeps
    hand-held objects such as glasses that the first one sometimes drops)."""
    from rembg import new_session, remove
    out = None
    for model in ("birefnet-general-lite", "isnet-general-use"):
        sess = new_session(model)
        m = np.asarray(remove(img, session=sess, only_mask=True))
        out = m if out is None else np.maximum(out, m)
        del sess
    return Image.fromarray(out)


def find_lights(a, m, n=3):
    """Bright small lights in the upper background, spaced apart."""
    h, w, _ = a.shape
    L = blur(lum(a), 3)
    mx = np.asarray(Image.fromarray((L * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41))).astype(float) / 255
    pk = (L >= mx - 1e-6) & (L > 0.5) & (m < 0.1)
    pk[int(0.55 * h):] = False
    ys, xs = np.nonzero(pk)
    cand = sorted(zip(L[ys, xs], xs, ys), reverse=True)
    sel = []
    for v, x, y in cand:
        if all((x - x2) ** 2 + (y - y2) ** 2 > (0.22 * w) ** 2 for _, x2, y2 in sel):
            sel.append((v, x, y))
        if len(sel) == n:
            break
    if not sel:  # no real light: one from the top corner away from the subject
        cx = (m.mean(0) * np.arange(w)).sum() / max(m.mean(0).sum(), 1e-6)
        sel = [(1, 0.82 * w if cx < w / 2 else 0.18 * w, 0.07 * h)]
    sizes = [0.34, 0.26, 0.20]
    return [(x, y, sizes[i] * w) for i, (_, x, y) in enumerate(sel)]


def process(row, in_dir, out_dir):
    name, style = row[0], row[1]
    src = os.path.join(in_dir, name)
    out = os.path.join(out_dir, os.path.splitext(name)[0] + ".jpg")
    if os.path.exists(out):
        return name, "skip"
    im = Image.open(src)
    icc, exif = im.info.get("icc_profile"), im.info.get("exif")
    rgb = im.convert("RGB")
    a0 = np.asarray(rgb).astype(np.float64) / 255.0
    # approved base colour (DSC00618 v7b): warm natural skin, not brightened
    a = grade(a0)
    bright = False
    seed = zlib.crc32(name.encode()) % 1000
    h, w, _ = a.shape

    if style != "neutral":
        if style == "crowd":
            m = np.zeros((h, w))
        else:
            m = np.asarray(get_mask(rgb)).astype(np.float64) / 255.0
        mask_img = Image.fromarray((m * 255).astype(np.uint8))

        if style == "bokeh":
            a = violet_background(a, mask_img, lift=1.6, ramp="violet_vivid", bg_blur=6)
            a = add_bokeh(a, m, layout(w, h, np.random.default_rng(seed), 7))
        elif style == "glow":
            a = violet_background(a, mask_img, lift=2.4, ramp="violet_vivid", bg_blur=8)
            a = glow(a, m, smooth=0.6, bright=0.22, gloss=0.3)
        elif style == "streaks":
            a = violet_background(a, mask_img, lift=1.6, ramp="violet_vivid", bg_blur=3)
            cx = (m.mean(0) * np.arange(w)).sum() / max(m.mean(0).sum(), 1e-6) / w
            region = (0.45, 0.0, 1.0, 0.55) if cx < 0.5 else (0.0, 0.0, 0.55, 0.55)
            a = streaks(a, m, region, 0.12, 0.9, seed)
        elif style == "flares":
            a = violet_background(a, mask_img, lift=1.5, ramp="violet_vivid", bg_blur=4)
            mm = np.clip(blur(np.clip((m - 0.15) / 0.7, 0, 1), 1.2), 0, 1)
            a = add_stars(a, find_lights(a, m), behind=mm, haze=0.2)
        elif style == "motion":   # drag shutter on the subject (use on 1-2 photos max)
            a = violet_background(a, mask_img, lift=1.6, ramp="violet_vivid", bg_blur=6)
            a = subject_motion(a, m, angle=12, length=0.06)
        elif style == "crowd":
            a = violet_background(a, mask_img, lift=1.15, ramp="violet_vivid", bg_blur=0)
        elif style == "trail":
            a = violet_background(a, mask_img, lift=1.4, ramp="violet_vivid", bg_blur=4)
            hx, hy, hs = map(float, row[2:5])
            a = trails_from_mask(a, Image.open(os.path.join(HERE, "assets", "trail_redline.png")),
                                 (345, 300), 200, (hx, hy), hs)
        a = highlight_knee(np.clip(a, 0, 1))      # never burn the subject
        # background: lower ceiling so the violet never blows out
        bgw = (1 - np.clip(blur(np.clip((m - 0.15) / 0.7, 0, 1), 2), 0, 1))[..., None]
        a = a * (1 - bgw) + highlight_knee(a, knee=0.68, ceiling=0.90) * bgw
        a = add_grain(a, 0.04, seed=seed)

    o = Image.fromarray(np.round(np.clip(a, 0, 1) * 255).astype(np.uint8))
    kw = {k: v for k, v in (("icc_profile", icc), ("exif", exif)) if v}
    o.save(out, quality=100, subsampling=0, **kw)
    return name, style + (" +luminosa" if bright else "")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("csv")
    p.add_argument("in_dir")
    p.add_argument("out_dir")
    p.add_argument("--workers", type=int, default=2)
    args = p.parse_args()
    os.makedirs(args.out_dir, exist_ok=True)
    rows = [r for r in csv.reader(open(args.csv)) if r and not r[0].startswith("#")]
    if args.workers == 1:
        for r in rows:
            try:
                n, st = process(r, args.in_dir, args.out_dir)
                print("done", n, st, flush=True)
            except Exception as e:  # keep going on a single failure
                print("FAIL", r[0], e, flush=True)
        return
    with ProcessPoolExecutor(args.workers) as ex:
        futs = [ex.submit(process, r, args.in_dir, args.out_dir) for r in rows]
        for f in futs:
            try:
                n, st = f.result()
                print("done", n, st, flush=True)
            except Exception as e:  # keep going on a single failure
                print("FAIL", e, flush=True)


if __name__ == "__main__":
    main()
