"""High-quality cut-out of a subject on a blue studio wall.

usage: matte.py in.jpg out.png
Alpha from the wall's colour signature (B-R relative to the local wall), locked to 1 inside
the person segmentation and 0 far outside, refined with a guided filter, then the edge colours
are decontaminated (blue spill removed) so the cut-out sits cleanly on any background.
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
import faces  # noqa: E402


def box(x, r):
    return cv2.blur(x, (2 * r + 1, 2 * r + 1))


def guided(I, p, r, eps):
    mI, mp = box(I, r), box(p, r)
    cov = box(I * p, r) - mI * mp
    var = box(I * I, r) - mI * mI
    a = cov / (var + eps)
    b = mp - a * mI
    return box(a, r) * I + box(b, r)


def smooth_fill(img, m, scale=4):
    h, w = m.shape
    ims = cv2.resize(img, (w // scale, h // scale), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(m, (w // scale, h // scale), interpolation=cv2.INTER_AREA)
    res = None
    for s in (100, 40, 15, 6, 2.5):
        num = cv2.GaussianBlur(ims * ms[..., None], (0, 0), s)
        den = cv2.GaussianBlur(ms, (0, 0), s)
        est = num / np.maximum(den[..., None], 1e-6)
        if res is None:
            res = est
        else:
            wgt = np.clip(den * 3, 0, 1)[..., None]
            res = res * (1 - wgt) + est * wgt
    return cv2.resize(res, (w, h), interpolation=cv2.INTER_CUBIC)


def main(src, dst):
    im8 = cv2.imread(src)
    im = im8.astype(np.float32)
    h, w = im.shape[:2]
    hsv = cv2.cvtColor(im8, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    br = im[..., 0] - im[..., 2]

    person = faces.person_mask(im8, os.path.join(HERE, "..", "models", "selfie_mc.tflite"))
    sure_bg = (np.abs(H - 100) < 7) & (S > 110) & (br > 60) & (cv2.dilate(person, np.ones((41, 41), np.uint8)) == 0)
    sure_bg = cv2.erode(sure_bg.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32)
    wall = smooth_fill(im, sure_bg)
    wall_br = np.maximum(wall[..., 0] - wall[..., 2], 20)

    a_bg = np.clip(br / wall_br, 0, 1)
    a_bg = np.clip((a_bg - 0.12) / (0.85 - 0.12), 0, 1)
    # hue must match the wall for a pixel to be (partly) wall
    a_bg *= np.clip(1 - (np.abs(H - 100) - 8) / 8, 0, 1)
    alpha = 1 - a_bg

    core = cv2.erode(person, np.ones((25, 25), np.uint8)) > 0
    far = cv2.dilate(person, np.ones((61, 61), np.uint8)) == 0
    alpha[core] = 1
    alpha[far] = 0
    # drop isolated specks
    n, lab, st, _ = cv2.connectedComponentsWithStats((alpha > 0.5).astype(np.uint8), 8)
    keep = np.zeros((h, w), bool)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 5000:
            keep |= lab == i
    alpha[~cv2.dilate(keep.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)] = 0
    # fill holes inside the subjects (e.g. dark between arms)
    inv = (alpha < 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, 8)
    for i in range(1, n):
        x, y, bw, bh, ar = st[i]
        if ar < 4000 and not (x == 0 or y == 0 or x + bw == w or y + bh == h):
            m = lab == i
            if a_bg[m].mean() < 0.7:          # not a real wall gap
                alpha[m] = 1

    gray = cv2.cvtColor(im8, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    alpha = np.clip(guided(gray, alpha.astype(np.float32), 2, 1e-4), 0, 1)
    alpha[core] = 1
    alpha[far] = 0
    alpha = np.where(alpha < 0.02, 0, np.where(alpha > 0.98, 1, alpha))

    # colour decontamination: F = (I - (1-a) B) / a
    a3 = np.maximum(alpha, 0.05)[..., None]
    F = (im - (1 - alpha[..., None]) * wall) / a3
    F = np.clip(F, 0, 255)
    edge = (alpha > 0) & (alpha < 1)
    out = im.copy()
    out[edge] = F[edge]
    # residual blue spill on the edge band: pull B toward max(R,G)
    band = cv2.dilate(edge.astype(np.uint8), np.ones((11, 11), np.uint8)) > 0
    B, G, R = out[..., 0], out[..., 1], out[..., 2]
    lim = np.maximum(R, G) + 8
    out[..., 0] = np.where(band & (B > lim), lim, B)

    # 1px choke so no light wall rim survives
    alpha = np.minimum(alpha, cv2.erode(alpha, np.ones((3, 3), np.uint8)) * 0.5 + alpha * 0.5)
    rgba = np.dstack([np.clip(out, 0, 255).astype(np.uint8), (alpha * 255).astype(np.uint8)])
    cv2.imwrite(dst, rgba)
    print("ok", rgba.shape)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
