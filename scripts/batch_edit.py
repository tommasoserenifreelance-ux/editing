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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import faces as faces_mod  # noqa: E402
SEG_MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'selfie_mc.tflite')

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


# ---------------------------------------------------------------- 1a) colour-only wall brightening
def recolor_wall(im, info, name=''):
    """No cut-out: brighten/saturate blue-wall colours with a smooth colour-space weight,
    like an HSL adjustment. Cannot create jagged edges."""
    u8 = np.clip(im, 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(u8, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    h, w = H.shape
    border = np.zeros((h, w), bool); border[:int(0.08 * h)] = True
    ref = border & (H > 88) & (H < 112) & (S > 60)
    Hm = float(np.median(H[ref])) if ref.sum() > 500 else 100.0
    s_lo = 12 if name in LIGHT_WALL or name == 'DSC07418.jpg' else 60
    wgt = np.clip(1 - (np.abs(H - Hm) - 6) / 8, 0, 1) * np.clip((S - s_lo) / 30, 0, 1)
    wgt *= 1 - np.clip((S - 225) / 15, 0, 1) * np.clip((V - 120) / 30, 0, 1)   # bright saturated caps stay
    # only the wall connected to the top/sides of the frame (not wall seen through packaging or under the chair)
    bw_ = (wgt > 0.5).astype(np.uint8)
    n_, l_, st_, _ = cv2.connectedComponentsWithStats(bw_, 8)
    conn = np.zeros_like(bw_)
    for i in range(1, n_):
        x, y, cw, ch_, ar = st_[i]
        if ((y == 0 or x == 0 or x + cw == w) and ar > 0.002 * h * w and y < 0.5 * h) or (ar > 0.001 * h * w and y + ch_ < 0.9 * h):
            conn[l_ == i] = 1
    conn = cv2.dilate(conn, np.ones((9, 9), np.uint8)).astype(np.float32)
    wgt = wgt * cv2.GaussianBlur(conn, (0, 0), 4)
    wgt = cv2.GaussianBlur(wgt, (0, 0), 2.0)
    wall = wgt > 0.8
    # shift the wall toward the approved backdrop colour, per pixel, with the soft colour weight
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rr = np.sqrt(((xx - 0.5 * w) / w) ** 2 + ((yy - 0.30 * h) / (1.15 * h)) ** 2)
    t = np.clip((rr - 0.05) / 0.85, 0, 1)
    light = 1 - t * t * (3 - 2 * t)
    new_bg = BACKDROP_CORNER + (BACKDROP_CENTRE - BACKDROP_CORNER) * light[..., None]
    wall_est = smooth_fill(im, (wgt > 0.8).astype(np.float32))
    shadow = np.clip((im.mean(2) / np.maximum(wall_est.mean(2), 1)), 0.3, 1.0)[..., None]  # keep cast shadows
    shadow = 1 - 0.5 * (1 - shadow)
    target = new_bg * shadow + (im - wall_est) * 0.3
    out = im * (1 - wgt[..., None]) + target * wgt[..., None]
    k = 0
    info['backdrop'] = 'recoloured to approved colour'
    return out, wgt.astype(np.float32)


# ---------------------------------------------------------------- 1) backdrop
SHADOW_KEEP = set()
LIGHT_WALL = {'DSC06743.jpg', 'DSC06745.jpg', 'DSC06749.jpg', 'DSC06716.jpg', 'DSC07278.jpg'}   # over-exposed pale wall
CROP_ABOVE_SKIRTING = {"DSC06703.jpg": 2453, "DSC06704.jpg": 2451, "DSC06705.jpg": 2449, "DSC06727-2.jpg": 2422, "DSC06728.jpg": 2423, "DSC06732.jpg": 2425, "DSC06863.jpg": 2027, "DSC06870.jpg": 2204, "DSC06873.jpg": 2264, "DSC06874.jpg": 2267, "DSC06881.jpg": 2303, "DSC06925.jpg": 2197, "DSC07046.jpg": 2361, "DSC07050.jpg": 2173, "DSC07226.jpg": 2463, "DSC07227.jpg": 2463, "DSC07258.jpg": 2456, "DSC07270.jpg": 2188}   # y of the skirting line: crop just above it
EDGE_CROP = {'DSC07198.jpg': (60, 0)}
# rects painted as backdrop regardless of the person mask; 'keep_dark' keeps the black scrub inside
FORCE_ANY = {'DSC07185.jpg': [((1440, 0, 1667, 330), True)], 'DSC06834.jpg': [((0, 2250, 80, 2380), False)]}
CHAIR_SHOTS = {'DSC07278.jpg', 'DSC07281.jpg', 'DSC07319.jpg', 'DSC07361.jpg', 'DSC07395.jpg', 'DSC07418.jpg'}
PROTECT_POLYS = {'DSC06925.jpg': [[(420, 1050), (1400, 1050), (1400, 1500), (420, 1500)]],
                 'DSC07001.jpg': [[(42, 1050), (55, 1035), (100, 1033), (110, 1010), (125, 990), (155, 980), (195, 985),
                                   (222, 1008), (234, 1050), (245, 1078), (310, 1095), (360, 1100), (480, 1200),
                                   (480, 1280), (40, 1280)]]}
PROTECT_RECTS = {'DSC07418.jpg': [(1230, 2080, 1667, 2500)]}   # objects with wall-like colour
FLOOR_TO_BG = {'DSC06925.jpg'}
FORCE_BG_RECTS = {'DSC06833.jpg': [(0, 1450, 600, 2500)], 'DSC06925.jpg': [(0, 1750, 1667, 2500), (1150, 1450, 1667, 2500)],
                  'DSC07140.jpg': [(0, 2000, 220, 2500)], 'DSC06814.jpg': [(0, 1500, 220, 2500)],
                  'DSC07185.jpg': [(1440, 0, 1667, 330)]}   # x0, y0, x1, y1: leftover plant
NO_BACKDROP = {'DSC06844.jpg', 'DSC07362.jpg', 'DSC07376.jpg', 'DSC07304.jpg'}   # still lifes: blue furniture, not the wall


def backdrop(im, info, name='', person=None):
    h, w = im.shape[:2]
    zero = np.zeros((h, w), np.float32)
    if name in NO_BACKDROP:
        info['backdrop'] = 'skipped (still life)'
        return im, zero
    if name in CHAIR_SHOTS:
        return recolor_wall(im, info, name)
    B, R = im[..., 0], im[..., 2]
    br = B - R
    u8 = np.clip(im, 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(u8, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    # Wall candidates: blue/cyan, including very light (over-exposed) wall.
    cand = ((H > 84) & (H < 112) & (S > 30) & (br > 8) & (V > 22))
    # typical wall colour of this photo (border pixels), then drop blues that differ from it
    bmask = np.zeros((h, w), bool)
    bmask[: int(0.06 * h)] = True; bmask[:, : int(0.05 * w)] = True; bmask[:, -int(0.05 * w):] = True
    if (cand & bmask).sum() > 500:
        Hm, Sm = np.median(H[cand & bmask]), np.median(S[cand & bmask])
    else:
        Hm, Sm = np.median(H[cand]) if cand.any() else 100, np.median(S[cand]) if cand.any() else 150
    if name in LIGHT_WALL:
        cand = (H > 84) & (H < 112) & (S > 10) & (br > 6) & (V > 120)
    else:
        cand &= (np.abs(H - Hm) < 6) & (S < 245) & (S > 0.4 * Sm)
    cand = cand.astype(np.uint8)
    cand = cv2.morphologyEx(cand, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(cand, 8)
    wallreg = np.zeros((h, w), np.uint8)
    for i in range(1, n):
        x, y, bw, bh, area = st[i]
        touches = x == 0 or y == 0 or x + bw == w or y + bh == h
        if (touches and area > 0.004 * h * w) or (not touches and area > 300):
            wallreg[lab == i] = 1
    frac = wallreg.mean()
    info['wall_fraction'] = round(float(frac), 3)
    if frac < 0.01:
        info['backdrop'] = 'skipped (no wall)'
        return im, zero
    sure = cv2.erode(wallreg, np.ones((7, 7), np.uint8))
    if sure.sum() < 500:
        sure = wallreg
    wall = smooth_fill(im, sure.astype(np.float32))
    wall_br = np.maximum(wall[..., 0] - wall[..., 2], 8)
    a = np.clip(br / wall_br, 0, 1)
    a = np.clip((a - 0.10) / (0.75 - 0.10), 0, 1)
    # colour consistency with the local wall: saturated / different-hue blues (caps, labels) are objects
    hs = smooth_fill(hsv[..., :2].copy(), sure.astype(np.float32))
    Hw, Sw = hs[..., 0], hs[..., 1]
    consistent = np.clip(1 - (np.abs(H - Hw) - 5) / 4, 0, 1) * np.clip(1 - (S - 245) / 10, 0, 1)
    a *= consistent
    # much darker than the local wall -> an object (device, dark cabinet), not wall
    Vw = smooth_fill(V[..., None].repeat(3, 2).copy(), sure.astype(np.float32))[..., 0]
    dark_ok = np.clip((V / np.maximum(Vw, 1) - 0.25) / 0.15, 0, 1)
    wall_like = np.clip(1 - (np.abs(H - Hw) - 3) / 3, 0, 1) * np.clip((S - 0.85 * Sw) / (0.1 * Sw + 1), 0, 1)
    if name in SHADOW_KEEP:
        a *= cv2.GaussianBlur(dark_ok.astype(np.float32), (0, 0), 6)
    else:
        a *= np.maximum(dark_ok, wall_like)
    # only pixels on/next to the detected wall can be wall (floor, skirting, objects stay as shot)
    near = cv2.dilate(wallreg, np.ones((15, 15), np.uint8)).astype(np.float32)
    a *= cv2.GaussianBlur(near, (0, 0), 3)
    # neutral white/grey objects (door, chair, bottles, gloves) are never wall
    neutral = (S < 28) & (V > 60)
    if name in LIGHT_WALL:
        neutral = (S < 8) & (V > 60)
    a[neutral] = 0
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
            comp = lab2 == i
            if raw[comp].mean() < 0.85 or st2[i, cv2.CC_STAT_AREA] < 60:   # keep real wall pockets as wall
                keep[comp] = 1

    # Plants: green things (and their dark leaf parts) that are not part of a person.
    plants = 0
    zone_all = np.zeros((h, w), np.uint8)
    # real foliage only: clearly green and bright enough (black-fabric noise is not green)
    Gc, Bc_, Rc = im[..., 1], im[..., 0], im[..., 2]
    true_green = (H > 30) & (H < 85) & (S > 70) & (V > 55) & (Gc > Rc + 15) & (Gc > Bc_ + 5)
    true_green = cv2.morphologyEx(true_green.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    if person is not None:
        green = true_green.astype(np.uint8)
        not_person = cv2.dilate(person, np.ones((5, 5), np.uint8)) == 0
        gseed = green & not_person.astype(np.uint8)
        n3, lab3, st3, _ = cv2.connectedComponentsWithStats(gseed, 8)
        seeds = np.zeros_like(gseed)
        bw_ = int(0.03 * w)
        for i in range(1, n3):
            x, y, bw, bh, area = st3[i]
            touches = x <= bw_ or y <= bw_ or x + bw >= w - bw_ or y + bh >= h - bw_
            if area > 300 and touches:
                seeds[lab3 == i] = 1
                plants += 1
        if plants:
            zone = (cv2.dilate(seeds, np.ones((45, 45), np.uint8)) > 0) & not_person & (keep > 0)
            zone = cv2.dilate(zone.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
            zone &= not_person
            zone_all = zone.astype(np.uint8)
            keep[zone] = 0
            a[zone] = 1
            raw[zone] = 1
            info['plants_removed'] = plants

    core = cv2.erode(keep, np.ones((9, 9), np.uint8))
    a[core > 0] = 0
    outside = (cv2.dilate(keep, np.ones((15, 15), np.uint8)) == 0) & (raw > 0.3)
    if person is not None:
        # loose bits not attached to anything kept and not part of a person (leaf scraps, specks)
        far_from_person = cv2.dilate(person, np.ones((15, 15), np.uint8)) == 0
        # stray green next to a person's outline (leaf tips touching a sleeve)
        green_px = true_green
        core_person = cv2.erode(person, np.ones((15, 15), np.uint8)) > 0
        near_wall = cv2.dilate(wallreg, np.ones((41, 41), np.uint8)) > 0
        stray = green_px & ~core_person & near_wall & (cv2.dilate(person, np.ones((25, 25), np.uint8)) > 0)
        if person.mean() < 0.05:
            stray[:] = False
        stray = cv2.dilate(stray.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        stray &= ~core_person
        outside |= stray
        keep[stray] = 0
        stray_all = stray
        rect_all = np.zeros((h, w), bool)
        for (x0, y0, x1, y1) in FORCE_BG_RECTS.get(name, []):
            reg = np.zeros((h, w), bool); reg[y0:y1, x0:x1] = True
            reg &= ~(cv2.dilate(person, np.ones((9, 9), np.uint8)) > 0)
            outside |= reg; keep[reg] = 0; stray_all = stray_all | reg
            rect_all = rect_all | reg
        # bottom-left corner: the studio plant peeks in there. Anything that is not a person
        # (or a white object) becomes backdrop.
        if name not in CHAIR_SHOTS and name not in LIGHT_WALL and name not in FLOOR_TO_BG and person.mean() > 0.05:
            zone = np.zeros((h, w), bool); zone[int(0.5 * h):, :int(0.4 * w)] = True
            pd25 = cv2.dilate(person, np.ones((11, 11), np.uint8)) > 0
            blueish_px = (H > 85) & (H < 118) & (S > 45) & (V > 22)
            warm_px = (im[..., 2] - im[..., 0]) > 0
            free = (~pd25 & ~neutral) if person[int(0.5 * h):, :int(0.4 * w)].mean() < 0.6 else np.zeros((h, w), bool)
            regc = zone & (free | (blueish_px & ~warm_px & (V > 75)))
            regc &= ~(cv2.dilate(neutral.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0)
            regc = cv2.morphologyEx(regc.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
            n5, l5, s5, _ = cv2.connectedComponentsWithStats(regc, 8)
            regc = np.zeros((h, w), bool)
            for i in range(1, n5):
                if s5[i, cv2.CC_STAT_AREA] > 800:
                    regc |= l5 == i
            if regc.sum() > 50:
                outside |= regc; keep[regc] = 0; stray_all = stray_all | regc
                rect_all = rect_all | regc
                info['corner_cleaned'] = int(regc.sum())
        # leftover dark leaf scraps: kept bits near a detected plant, not touching any person
        if plants:
            near_plant = cv2.dilate(seeds, np.ones((161, 161), np.uint8)) > 0
            pd = cv2.dilate(person, np.ones((9, 9), np.uint8)) > 0
            n4, lab4, st4, _ = cv2.connectedComponentsWithStats(keep, 8)
            for i in range(1, n4):
                if st4[i, cv2.CC_STAT_AREA] > 0.03 * h * w:
                    continue
                comp = lab4 == i
                if near_plant[comp].mean() > 0.5 and pd[comp].mean() < 0.02:
                    reg = (cv2.dilate(comp.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0) & ~pd
                    outside |= reg
                    keep[reg] = 0
                    stray_all = stray_all | reg
    outside &= ~cv2.dilate(neutral.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    if 'stray_all' in dir():
        stray_all &= ~cv2.dilate(neutral.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    if 'rect_all' in dir():
        outside |= rect_all
        stray_all = stray_all | rect_all
    a[outside] = 1
    protect_all = np.zeros((h, w), bool)
    for poly in PROTECT_POLYS.get(name, []):
        pm = np.zeros((h, w), np.uint8); cv2.fillPoly(pm, [np.array(poly, np.int32)], 1)
        soft = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), 2.0)
        a = a * (1 - soft)
        outside[pm > 0] = False; keep[pm > 0] = 1
        protect_all = protect_all | (cv2.dilate(pm, np.ones((9, 9), np.uint8)) > 0)
    for (x0, y0, x1, y1) in PROTECT_RECTS.get(name, []):
        box = np.zeros((h, w), bool); box[y0:y1, x0:x1] = True
        simw = np.clip((V / np.maximum(Vw, 1) - 0.8) / 0.12, 0, 1) * np.clip((S - 0.8 * Sw) / (0.12 * Sw + 1), 0, 1) \
            * np.clip(1 - (np.abs(H - Hw) - 3) / 3, 0, 1)
        obj = (simw < 0.5) & box
        obj = cv2.morphologyEx(obj.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        n_, l_, s_, _ = cv2.connectedComponentsWithStats(obj, 8)
        if n_ > 1:
            big = 1 + int(np.argmax(s_[1:, cv2.CC_STAT_AREA]))
            obj = (l_ == big).astype(np.uint8)
        # fill holes
        inv = 1 - obj; n2_, l2_, s2_, _ = cv2.connectedComponentsWithStats(inv, 8)
        for i in range(1, n2_):
            if s2_[i, cv2.CC_STAT_AREA] < 20000:
                obj[l2_ == i] = 1
        reg = obj > 0
        a[box] = np.minimum(a[box], cv2.GaussianBlur(1 - obj.astype(np.float32), (0, 0), 1.5)[box])
        outside[reg] = False; keep[reg] = 1
        protect_all = protect_all | box
        if 'stray_all' in dir():
            stray_all &= ~reg
    forced = np.zeros((h, w), np.float32)
    if person is not None and 'stray_all' in dir():
        forced = ((stray_all & (raw < 0.6)) | rect_all).astype(np.float32)
        if plants:
            forced = np.maximum(forced, ((raw >= 0) & (keep == 0) & (a >= 1) & (zone_all > 0)).astype(np.float32))
        forced = cv2.GaussianBlur(cv2.dilate(forced, np.ones((5, 5), np.uint8)), (0, 0), 2)
    a = cv2.GaussianBlur(a, (3, 3), 0)

    v = V[sure > 0]
    info['wall_unevenness'] = round(float(np.percentile(v, 95) - np.percentile(v, 5)), 1)

    cols = keep[: int(0.6 * h)].sum(0)
    cx = float(np.average(np.arange(w), weights=cols + 1e-6)) if cols.sum() > 0 else w / 2
    cx = 0.5 * cx + 0.25 * w
    cy = 0.30 * h
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rr = np.sqrt(((xx - cx) / w) ** 2 + ((yy - cy) / (1.15 * h)) ** 2)
    t = np.clip((rr - 0.05) / 0.85, 0, 1)
    light = 1 - t * t * (3 - 2 * t)
    new_bg = BACKDROP_CORNER + (BACKDROP_CENTRE - BACKDROP_CORNER) * light[..., None]
    rng = np.random.default_rng(7)
    new_bg += rng.normal(0, 1.4, (h, w, 1)).astype(np.float32)

    out = im + a[..., None] * (new_bg - wall)
    far = cv2.erode((a > 0.9).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32)
    far = cv2.GaussianBlur(far, (0, 0), 1.5)[..., None]
    out -= far * 0.9 * (im - wall)
    out = out * (1 - forced[..., None]) + new_bg * forced[..., None]   # removed objects: pure backdrop
    for (x0, y0, x1, y1), keep_dark in FORCE_ANY.get(name, []):
        reg = np.zeros((h, w), np.float32); reg[y0:y1, x0:x1] = 1
        if keep_dark:
            reg *= (cv2.GaussianBlur(V, (0, 0), 1.5) > 70).astype(np.float32)
            reg = cv2.dilate(reg, np.ones((3, 3), np.uint8))
        reg = cv2.GaussianBlur(reg, (0, 0), 1.2)[..., None]
        out = out * (1 - reg) + new_bg * reg
        a = np.maximum(a, reg[..., 0])
    if name in FLOOR_TO_BG:
        for (x0, y0, x1, y1) in FORCE_BG_RECTS.get(name, []):
            if x0 == 0 and x1 >= w - 1:
                out[y0:y1] = new_bg[y0:y1]

    # Edge clean-up: in a thin band around the subject rebuild the subject colour from
    # the inside, so no light wall fringe/halo survives on hair, ears, neck, shoulders.
    inner = cv2.erode(keep, np.ones((11, 11), np.uint8)).astype(np.float32)
    if inner.sum() > 0:
        fg_est = smooth_fill(np.clip(out, 0, 255) * 1.0, inner, scale=2)
        band = (cv2.dilate(keep, np.ones((7, 7), np.uint8)) > 0) & (inner == 0)
        cur = out
        lum_cur = cur.mean(2)
        lum_fg = fg_est.mean(2)
        lum_bg = new_bg.mean(2)
        # only fix pixels that are lighter than what subject+backdrop mixing allows
        expected = (1 - a) * lum_fg + a * lum_bg
        too_light = band & (lum_cur > expected + 6) & ~protect_all
        mix = (1 - a)[..., None] * fg_est + a[..., None] * new_bg
        wfix = cv2.GaussianBlur(too_light.astype(np.float32), (0, 0), 1.0)[..., None]
        out = cur * (1 - wfix) + mix * wfix
        info['edge_px_fixed'] = int(too_light.sum())
    info['backdrop'] = 'replaced'
    return out, a


# ---------------------------------------------------------------- 2) vibrance
def vibrance(out, a_bg):
    lab = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    L, A, Bb = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.sqrt(A ** 2 + Bb ** 2)
    boost = 1 + 0.14 * np.clip(1 - chroma / 60, 0, 1)
    L2 = np.clip(L + (0.03 * L + 2) * (1 - (L / 255.0) ** 3), 0, 255)   # no lift in highlights
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


# ---------------------------------------------------------------- 4b) right person exposure
PAIR_DEFAULT = {'DSC06703.jpg', 'DSC06704.jpg', 'DSC06705.jpg', 'DSC06607.jpg'}   # right face not detected


def balance_pair(u8, faces, person, name, info):
    """In two-person shots the person on the right is over-exposed: pull their highlights down."""
    if person is None:
        return u8
    h, w = u8.shape[:2]
    lab = cv2.cvtColor(u8, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    reduce = None
    if len(faces) >= 2:
        fs = sorted(faces, key=lambda f: f[:, 0].mean())
        vals = []
        for f in (fs[0], fs[-1]):
            m = poly_mask((h, w), f[FACE_OVAL])
            vals.append(float(np.percentile(L[m > 0], 75)))
        diff = vals[1] - vals[0]
        if diff > 15:
            reduce = min(0.6 * (diff - 8), 20.0)
            split = 0.5 * (fs[0][:, 0].mean() + fs[-1][:, 0].mean())
            ref_L = vals[1]
    elif name in PAIR_DEFAULT:
        cov = person[int(0.15 * h):int(0.7 * h)].mean(0)
        lo, hi = int(0.3 * w), int(0.7 * w)
        split = lo + int(np.argmin(cov[lo:hi]))
        reduce, ref_L = 12.0, 210.0
    if reduce is None:
        return u8
    xx = np.arange(w)[None, :].repeat(h, 0)
    region = ((person > 0) & (xx > split)).astype(np.float32)
    region = cv2.GaussianBlur(region, (0, 0), 25)
    # highlight-weighted pull: strongest on bright skin, nothing in the blacks
    k = reduce / (ref_L * (ref_L / 255.0) ** 2)
    L2 = L * (1 - k * (L / 255.0) ** 2)
    lab[..., 0] = L * (1 - region) + L2 * region
    info['right_person_darkened'] = round(reduce, 1)
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


# ---------------------------------------------------------------- 4c) tame glaring white furniture
TAME_WHITES = {'DSC07304.jpg': 0.30}


def tame_whites(u8, person, name, info):
    k = TAME_WHITES.get(name)
    if not k or person is None:
        return u8
    lab = cv2.cvtColor(u8, cv2.COLOR_BGR2LAB).astype(np.float32)
    hsv = cv2.cvtColor(u8, cv2.COLOR_BGR2HSV)
    L = lab[..., 0]
    region = ((hsv[..., 1] < 50) & (hsv[..., 2] > 150) & (cv2.erode(person, np.ones((21, 21), np.uint8)) == 0))
    region = cv2.morphologyEx(region.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)).astype(np.float32)
    region = cv2.GaussianBlur(region, (0, 0), 2)
    # compress the top of the tonal range: 255 -> ~255-k*105, mid-greys untouched
    over = np.clip(L - 150, 0, None)
    L2 = L - k * over
    # a gentle contrast boost inside the chair so its shape reads
    local = cv2.GaussianBlur(L2, (0, 0), 20)
    L2 = local + (L2 - local) * 1.6
    lab[..., 0] = L * (1 - region) + np.clip(L2, 0, 255) * region
    info['whites_tamed'] = k
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


# ---------------------------------------------------------------- 4d) arms lost in shadow
def lift_dark_skin(u8, person, head, info):
    if person is None:
        return u8
    h, w = u8.shape[:2]
    hsv = cv2.cvtColor(u8, cv2.COLOR_BGR2HSV).astype(np.int16)
    f = cv2.GaussianBlur(u8.astype(np.float32), (0, 0), 3)
    warm = ((hsv[..., 0] < 25) | (hsv[..., 0] > 170)) & (f[..., 2] - f[..., 0] > 8) & (hsv[..., 1] > 50)
    dark = (hsv[..., 2] > 6) & (hsv[..., 2] < 95)
    reg = (warm & dark & (person > 0) & (head == 0)).astype(np.uint8)
    reg = cv2.morphologyEx(reg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    reg = cv2.morphologyEx(reg, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(reg, 8)
    keep = np.zeros_like(reg)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w:
            keep[lab == i] = 1
    if keep.sum() == 0:
        return u8
    lab_ = cv2.cvtColor(u8, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab_[..., 0]
    med = float(np.median(L[keep > 0]))
    target = 110.0
    if med >= target - 5:
        return u8
    g = float(np.clip(np.log(target / 255) / np.log(max(med, 5) / 255), 0.55, 1.0))
    m = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 8)
    lifted = 255.0 * (L / 255.0) ** g
    lab_[..., 0] = L + (lifted - L) * m
    for c in (1, 2):
        lab_[..., c] = 128 + (lab_[..., c] - 128) * (1 + 0.35 * m)
    info['dark_skin_lifted'] = round(g, 2)
    return cv2.cvtColor(np.clip(lab_, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


# ---------------------------------------------------------------- 4e) over-exposed faces
FACE_DIM = {'DSC06607.jpg': ('all', 14), 'DSC06621.jpg': ('all', 14),
            'DSC06703.jpg': ('right', 12), 'DSC06704.jpg': ('right', 12), 'DSC06705.jpg': ('right', 12),
            'DSC06719.jpg': ('right', 8), 'DSC06727-2.jpg': ('right', 8), 'DSC06728.jpg': ('right', 8)}


def dim_faces(u8, faces, person, name, info):
    cfg = FACE_DIM.get(name)
    if not cfg or person is None:
        return u8
    which, amount = cfg
    h, w = u8.shape[:2]
    hsv = cv2.cvtColor(u8, cv2.COLOR_BGR2HSV).astype(np.int16)
    f = cv2.GaussianBlur(u8.astype(np.float32), (0, 0), 2)
    skin = ((hsv[..., 0] < 25) | (hsv[..., 0] > 170)) & (f[..., 2] - f[..., 0] > 10) & (hsv[..., 2] > 90) & (person > 0)
    yy, xx = np.mgrid[0:h, 0:w]
    top = person.any(1).argmax()
    region = skin & (yy < top + 0.42 * h)
    if which == 'right':
        cov = cv2.blur(person[int(0.1 * h):int(0.6 * h)].astype(np.float32), (1, 1)).mean(0)
        lo, hi = int(0.3 * w), int(0.75 * w)
        split = lo + int(np.argmin(cov[lo:hi]))
        region &= xx > split
    m = cv2.GaussianBlur(region.astype(np.float32), (0, 0), 12)
    m = np.clip(m * 1.6, 0, 1)
    lab = cv2.cvtColor(u8, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    k = amount / (220.0 * (220.0 / 255.0) ** 2)
    L2 = L * (1 - k * (L / 255.0) ** 2)
    lab[..., 0] = L * (1 - m) + L2 * m
    info['faces_dimmed'] = [which, amount]
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
    person = faces_mod.person_mask(cv2.imread(src), SEG_MODEL)
    out, a_bg = backdrop(im, info, name, person)
    out = vibrance(out, a_bg)
    u8 = np.clip(out, 0, 255).astype(np.uint8)
    head = head_zone(u8.shape[:2], faces)
    u8 = skin_retouch(u8, faces, a_bg, info)
    u8 = lift_scrub(u8, a_bg, head, info)
    u8 = balance_pair(u8, faces, person, name, info)
    u8 = tame_whites(u8, person, name, info)
    u8 = dim_faces(u8, faces, person, name, info)
    if 'right_person_darkened' in info:
        u8 = lift_dark_skin(u8, person, head, info)
    u8 = dust(u8, a_bg, head, info)
    if name in EDGE_CROP:                      # trim a strip at the frame edge, keep the aspect ratio
        hh, ww = u8.shape[:2]
        left, bottom = EDGE_CROP[name]
        W2 = ww - left; H2 = int(round(W2 * hh / ww))
        u8 = u8[:H2, left:]
        info['cropped'] = [left, 0, W2, H2]
    if name in CROP_ABOVE_SKIRTING:
        hh, ww = u8.shape[:2]
        H2 = CROP_ABOVE_SKIRTING[name] - 12
        W2 = min(ww, int(round(H2 * ww / hh)))
        cols = person[:H2].sum(0).astype(np.float64) if person is not None else np.ones(ww)
        cx = float(np.average(np.arange(ww), weights=cols + 1e-6))
        x0 = int(np.clip(cx - W2 / 2, 0, ww - W2))
        u8 = u8[:H2, x0:x0 + W2]
        info['cropped'] = [x0, 0, W2, H2]
    kw = dict(quality=98, subsampling=0)
    if pil.info.get('icc_profile'):
        kw['icc_profile'] = pil.info['icc_profile']
    if pil.info.get('exif'):
        kw['exif'] = pil.info['exif']
    Image.fromarray(cv2.cvtColor(u8, cv2.COLOR_BGR2RGB)).save(os.path.join(out_dir, name), dpi=(72, 72), **kw)
    # before/after preview
    a = cv2.imread(src)
    s = 600 / max(a.shape[:2])
    ra = cv2.resize(a, None, fx=s, fy=s)
    rb = cv2.resize(u8, (int(u8.shape[1] * ra.shape[0] / u8.shape[0]), ra.shape[0]))
    prev = np.hstack([ra, rb])
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
