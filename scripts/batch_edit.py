"""Batch version of the approved DSC06527 edit, adaptive per photo.

Steps: clean blue backdrop (no shadows/stains) -> subject vibrance -> skin retouch on
detected faces -> lift of the black scrub up to the approved level -> dust removal.
Saves JPEG q98 4:4:4 with the original ICC profile and EXIF.

usage: batch_edit.py IN_DIR OUT_DIR FACES_PKL DEBUG_DIR
"""
import glob
import json
import os
import pickle
import sys
from multiprocessing import Pool

import cv2
import numpy as np
from PIL import Image

FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
             152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
EYE_L = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
EYE_R = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466]
BROW_L = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
BROW_R = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
NOSE_BASE = [64, 98, 97, 2, 326, 327, 294, 278, 48, 115, 220, 45, 275, 440, 344, 4]

BACKDROP_CENTRE = np.array([222, 182, 94], np.float32)   # BGR: approved hue, more depth
BACKDROP_CORNER = np.array([134, 99, 42], np.float32)
TARGET_FABRIC_L = 23.0                                   # approved scrub median lightness


def poly_mask(shape, pts, scale=1.0, dilate=0):
    m = np.zeros(shape, np.uint8)
    pts = np.asarray(pts, np.float32)
    c = pts.mean(0)
    pts = (c + (pts - c) * scale).astype(np.int32)
    cv2.fillPoly(m, [cv2.convexHull(pts)], 1)
    if dilate > 0:
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dilate + 1, 2 * dilate + 1)))
    return m


def smooth_fill(img, m, scale=4):
    """Normalized multi-scale blur, computed at 1/scale resolution for speed."""
    h, w = m.shape
    sw, sh = max(1, w // scale), max(1, h // scale)
    ims = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(m, (sw, sh), interpolation=cv2.INTER_AREA)
    res = None
    for sigma in (100, 40, 15, 6, 2.5):
        num = cv2.GaussianBlur(ims * ms[..., None], (0, 0), sigma)
        den = cv2.GaussianBlur(ms, (0, 0), sigma)
        est = num / np.maximum(den[..., None], 1e-6)
        if res is None:
            res = est
        else:
            wgt = np.clip(den * 3, 0, 1)[..., None]
            res = res * (1 - wgt) + est * wgt
    return cv2.resize(res, (w, h), interpolation=cv2.INTER_CUBIC)


# ---------------------------------------------------------------- 1) backdrop
def backdrop(im, info):
    h, w = im.shape[:2]
    B, R = im[..., 0], im[..., 2]
    br = B - R
    hsv = cv2.cvtColor(np.clip(im, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    # Read this photo's wall colour from the top band and side edges.
    border = np.zeros((h, w), bool)
    border[: int(0.08 * h)] = True
    border[:, : int(0.06 * w)] = True
    border[:, -int(0.06 * w):] = True
    blueish = border & (br > 20) & (H > 85) & (H < 112) & (S > 50)
    top = np.zeros((h, w), bool); top[: int(0.10 * h)] = True
    top_cover = (blueish & top).sum() / top.sum()
    info['wall_top_cover'] = round(float(top_cover), 2)
    if blueish.sum() < 2000 or top_cover < 0.4:
        info['backdrop'] = 'skipped (no blue wall behind)'
        return im, np.zeros((h, w), np.float32)
    wh, ws, wbr = np.median(H[blueish]), np.median(S[blueish]), np.median(br[blueish])
    sure = ((np.abs(H - wh) < 9) & (S > 0.6 * ws) & (br > 0.45 * wbr)).astype(np.uint8)
    sure = cv2.erode(sure, np.ones((7, 7), np.uint8))
    frac = sure.mean()
    info['wall_fraction'] = round(float(frac), 3)
    if frac < 0.08:
        info['backdrop'] = 'skipped (little blue wall)'
        return im, np.zeros((h, w), np.float32)
    mbg = sure.astype(np.float32)
    wall = smooth_fill(im, mbg)
    wall_br = np.maximum(wall[..., 0] - wall[..., 2], 12)
    a = np.clip(br / wall_br, 0, 1)
    a = np.clip((a - 0.08) / (0.80 - 0.08), 0, 1)      # choke: mostly-wall pixels become full wall
    raw = a.copy()

    fg = (a < 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
    keep = np.zeros_like(fg)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 400:
            keep[lab == i] = 1
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(1 - keep, 8)
    for i in range(1, n2):
        if st2[i, cv2.CC_STAT_AREA] < 3000:
            keep[lab2 == i] = 1
    core = cv2.erode(keep, np.ones((9, 9), np.uint8))
    a[core > 0] = 0
    outside = (cv2.dilate(keep, np.ones((15, 15), np.uint8)) == 0) & (raw > 0.3)
    a[outside] = 1
    a = cv2.GaussianBlur(a, (3, 3), 0)

    v = V[sure > 0]
    info['wall_unevenness'] = round(float(np.percentile(v, 95) - np.percentile(v, 5)), 1)

    # Studio backdrop with depth: bright pool of light behind the subject, darker edges.
    cols = np.where(keep[: int(0.6 * h)].any(0))[0]
    cx = float(np.average(np.arange(w), weights=keep[: int(0.6 * h)].sum(0) + 1e-6)) if cols.size else w / 2
    cx = 0.5 * cx + 0.25 * w            # pull halfway toward the frame centre
    cy = 0.30 * h
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rr = np.sqrt(((xx - cx) / w) ** 2 + ((yy - cy) / (1.15 * h)) ** 2)
    t = np.clip((rr - 0.05) / 0.85, 0, 1)
    light = 1 - t * t * (3 - 2 * t)      # smoothstep falloff
    new_bg = BACKDROP_CORNER + (BACKDROP_CENTRE - BACKDROP_CORNER) * light[..., None]
    rng = np.random.default_rng(7)
    new_bg += rng.normal(0, 1.4, (h, w, 1)).astype(np.float32)

    out = im + a[..., None] * (new_bg - wall)
    far = cv2.erode((a > 0.99).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(np.float32)
    far = cv2.GaussianBlur(far, (0, 0), 3)[..., None]
    out -= far * 0.9 * (im - wall)
    info['backdrop'] = 'replaced'
    return out, a


# ---------------------------------------------------------------- 2) vibrance
def vibrance(out, a_bg):
    lab = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    L, A, Bb = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.sqrt(A ** 2 + Bb ** 2)
    boost = 1 + 0.14 * np.clip(1 - chroma / 60, 0, 1)
    L2 = np.clip(L * 1.03 + 2, 0, 255)
    subj = cv2.cvtColor(np.dstack([L2, A * boost + 128, Bb * boost + 128]).clip(0, 255).astype(np.uint8),
                        cv2.COLOR_LAB2BGR).astype(np.float32)
    a_fg = (1 - a_bg)[..., None]
    return out * (1 - a_fg) + subj * a_fg


# ---------------------------------------------------------------- 3) skin
def skin_retouch(img_u8, faces, a_bg, info):
    h, w = img_u8.shape[:2]
    out = img_u8.astype(np.float32)
    total = 0
    for f in faces:
        fw = float(np.ptp(f[FACE_OVAL, 0]))
        fh = float(np.ptp(f[FACE_OVAL, 1]))
        if fw < 120:
            continue
        # face + neck area
        oval = poly_mask((h, w), f[FACE_OVAL])
        jaw = f[[172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361]]
        neck = np.vstack([jaw, jaw[::-1] + [0, 0.55 * fh]])
        area = np.clip(oval + poly_mask((h, w), neck), 0, 1)
        protect = (poly_mask((h, w), f[LIPS], 1.15, int(0.02 * fw))
                   | poly_mask((h, w), f[EYE_L], 1.45, int(0.03 * fw))
                   | poly_mask((h, w), f[EYE_R], 1.45, int(0.03 * fw))
                   | poly_mask((h, w), f[BROW_L], 1.2, int(0.02 * fw))
                   | poly_mask((h, w), f[BROW_R], 1.2, int(0.02 * fw))
                   | poly_mask((h, w), f[NOSE_BASE], 1.1, int(0.025 * fw)))

        lab = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
        L, A, Bc = lab[..., 0], lab[..., 1], lab[..., 2]
        skin = (area > 0) & (protect == 0) & (a_bg < 0.05) & (L > 95) & (A > 132) & (A < 168) & (Bc > 130)
        skin_u8 = cv2.morphologyEx(skin.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        if skin_u8.sum() < 500:
            continue
        sig = max(6.0, 0.027 * fw)
        A_loc, L_loc = cv2.GaussianBlur(A, (0, 0), sig), cv2.GaussianBlur(L, (0, 0), sig)
        A_s, L_s = cv2.GaussianBlur(A, (0, 0), 1.5), cv2.GaussianBlur(L, (0, 0), 1.5)
        spot = (((A_s - A_loc > 3.5) & (L_s - L_loc < 2)) | ((L_loc - L_s > 9) & (A_s - A_loc > 1.5)))
        spot = (spot & (skin_u8 > 0)).astype(np.uint8)
        n, lab_id, st, _ = cv2.connectedComponentsWithStats(spot, 8)
        blem = np.zeros_like(spot)
        max_dim, max_area, min_area = 0.1 * fw, (0.07 * fw) ** 2, max(4, (0.0055 * fw) ** 2)
        cnt = 0
        for i in range(1, n):
            x, y, bw, bh, ar = st[i]
            if (min_area <= ar <= max_area and max(bw, bh) <= max_dim
                    and max(bw, bh) <= 3.5 * min(bw, bh) and ar / float(bw * bh) > 0.3):
                blem[lab_id == i] = 1
                cnt += 1
        total += cnt
        if cnt:
            blem = cv2.dilate(blem, np.ones((5, 5), np.uint8))
            cur = np.clip(out, 0, 255).astype(np.uint8)
            healed = cv2.inpaint(cur, blem * 255, 7, cv2.INPAINT_TELEA).astype(np.float32)
            grain = out - cv2.GaussianBlur(out, (0, 0), 1.2)
            healed += 0.7 * grain
            wb = cv2.GaussianBlur(blem.astype(np.float32), (0, 0), 1.5)[..., None]
            out = out * (1 - wb) + healed * wb
        # redness
        m = cv2.GaussianBlur(skin_u8.astype(np.float32), (0, 0), 3)
        lab2 = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
        A2 = lab2[..., 1]
        rs = 0.1 * fw
        A_ref = cv2.GaussianBlur(A2 * m, (0, 0), rs) / np.maximum(cv2.GaussianBlur(m, (0, 0), rs), 1e-3)
        excess = np.clip(cv2.GaussianBlur(A2, (0, 0), 4) - A_ref, 0, None)
        lab2[..., 1] = A2 - 0.6 * excess * m - 1.5 * m
        out = cv2.cvtColor(np.clip(lab2, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)
    info['blemishes'] = total
    return np.clip(out, 0, 255).astype(np.uint8)


def head_zone(shape, faces):
    """Faces + hair above them: never treated as 'scrub' or 'dust on fabric'."""
    z = np.zeros(shape, np.uint8)
    for f in faces:
        fw, fh = np.ptp(f[FACE_OVAL, 0]), np.ptp(f[FACE_OVAL, 1])
        pts = f[FACE_OVAL]
        top = pts.copy(); top[:, 1] -= 0.55 * fh
        hull = np.vstack([pts, top])
        z |= poly_mask(shape, hull, 1.25, int(0.05 * fw))
    return z


# ---------------------------------------------------------------- 4) scrub
def lift_scrub(im, a_bg, head, info):
    h, w = im.shape[:2]
    lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    local_max = cv2.dilate(cv2.medianBlur(gray, 7), np.ones((9, 9), np.uint8))
    colourful = cv2.dilate(((hsv[..., 1] > 90) & (gray > 60)).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    f = cv2.GaussianBlur(im.astype(np.float32), (0, 0), 4)
    warm = (f[..., 2] - f[..., 0]) > 4
    warm = cv2.dilate(cv2.morphologyEx(warm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)),
                      np.ones((5, 5), np.uint8)) > 0
    fabric = (a_bg < 0.5) & (local_max < 85) & ~colourful & ~warm & (head == 0)
    fabric = cv2.morphologyEx(fabric.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab_id, st, _ = cv2.connectedComponentsWithStats(1 - fabric, 8)
    for i in range(1, n):
        x, y, bw, bh, area = st[i]
        if area < 60000 and not (x == 0 or y == 0 or x + bw == w or y + bh == h):
            fabric[lab_id == i] = 1
    fabric &= (head == 0)
    # keep only large dark regions (the scrub), not small dark objects
    n, lab_id, st, _ = cv2.connectedComponentsWithStats(fabric, 8)
    big = np.zeros_like(fabric)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 0.01 * h * w:
            big[lab_id == i] = 1
    if big.sum() == 0:
        info['scrub'] = 'none found'
        return im
    med = float(np.median(L[big > 0]))
    info['scrub_L_before'] = med
    if med >= TARGET_FABRIC_L - 2:
        info['scrub'] = 'already open enough, untouched'
        return im
    gamma = float(np.clip(np.log(TARGET_FABRIC_L / 255) / np.log(max(med, 1) / 255), 0.68, 1.0))
    info['scrub'] = f'lifted (gamma {gamma:.2f})'
    m = cv2.GaussianBlur(big.astype(np.float32), (0, 0), 3) * (1 - a_bg)
    lifted = 255.0 * (L / 255.0) ** gamma
    fade = np.clip(1 - (L - 60) / 60, 0, 1)
    lab[..., 0] = L + (lifted - L) * fade * m
    k = 1 - 0.5 * m * fade
    lab[..., 1] = 128 + (lab[..., 1] - 128) * k
    lab[..., 2] = 128 + (lab[..., 2] - 128) * k
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


# ---------------------------------------------------------------- 5) dust
def dust(res, a_bg, head, info):
    h, w = res.shape[:2]
    med = cv2.medianBlur(res, 9)
    g = cv2.cvtColor(res, cv2.COLOR_BGR2GRAY).astype(np.int16)
    gm = cv2.cvtColor(med, cv2.COLOR_BGR2GRAY).astype(np.int16)
    d = g - gm
    hsv = cv2.cvtColor(res, cv2.COLOR_BGR2HSV)
    colourful = cv2.dilate(((hsv[..., 1] > 90) & (g > 60)).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
    deep_black = cv2.dilate(gm.astype(np.uint8), np.ones((31, 31), np.uint8)) < 70
    on_fabric = (gm < 60) & (a_bg < 0.05) & ~colourful & deep_black & (head == 0)
    on_wall = a_bg > 0.99
    cand = ((on_fabric & (d > 18)) | (on_wall & (np.abs(d) > 10))).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(cand, 8)
    sm = np.zeros_like(cand)
    cnt = 0
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] <= 30:
            sm[lab == i] = 1
            cnt += 1
    if cnt > 1500:     # that's fabric texture (close-ups), not dust: only clean the wall
        cand = (on_wall & (np.abs(d) > 10)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(cand, 8)
        sm = np.zeros_like(cand); cnt = 0
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] <= 30:
                sm[lab == i] = 1; cnt += 1
    sm = cv2.dilate(sm, np.ones((3, 3), np.uint8))
    out = res.copy()
    out[sm > 0] = med[sm > 0]
    info['dust_specks'] = cnt
    return out


def process(args):
    src, out_dir, faces, dbg_dir = args
    name = os.path.basename(src)
    info = {'file': name, 'faces': len(faces)}
    pil = Image.open(src)
    im = cv2.imread(src).astype(np.float32)
    out, a_bg = backdrop(im, info)
    out = vibrance(out, a_bg)
    u8 = np.clip(out, 0, 255).astype(np.uint8)
    head = head_zone(u8.shape[:2], faces)
    u8 = skin_retouch(u8, faces, a_bg, info)
    u8 = lift_scrub(u8, a_bg, head, info)
    u8 = dust(u8, a_bg, head, info)
    kw = dict(quality=98, subsampling=0)
    if pil.info.get('icc_profile'):
        kw['icc_profile'] = pil.info['icc_profile']
    if pil.info.get('exif'):
        kw['exif'] = pil.info['exif']
    Image.fromarray(cv2.cvtColor(u8, cv2.COLOR_BGR2RGB)).save(os.path.join(out_dir, name), dpi=(72, 72), **kw)
    # before/after preview
    a = cv2.imread(src)
    s = 600 / max(a.shape[:2])
    prev = np.hstack([cv2.resize(a, None, fx=s, fy=s), cv2.resize(u8, None, fx=s, fy=s)])
    cv2.imwrite(os.path.join(dbg_dir, name), prev, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return info


if __name__ == '__main__':
    in_dir, out_dir, faces_pkl, dbg_dir = sys.argv[1:5]
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(dbg_dir, exist_ok=True)
    faces = pickle.load(open(faces_pkl, 'rb'))
    files = sorted(glob.glob(os.path.join(in_dir, '*.jpg')))
    if len(sys.argv) > 5:
        files = [f for f in files if os.path.basename(f) in sys.argv[5].split(',')]
    jobs = [(f, out_dir, faces.get(os.path.basename(f), []), dbg_dir) for f in files]
    with Pool(6) as p:
        infos = p.map(process, jobs)
    json.dump(infos, open(os.path.join(dbg_dir, 'report.json'), 'w'), indent=1)
    for i in infos:
        print(i)
