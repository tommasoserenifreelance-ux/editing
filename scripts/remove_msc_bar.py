"""Paint the orange bar out of the MSC atrium shot with LaMa (ONNX).

Reads PNG frames (extracted from public/msc/nuda.mp4, frames 100-170), finds
the bar by colour (plus its faint orange halo), inpaints a 640 px crop around
it with LaMa and blends the result back with a soft mask.

Usage: python scripts/remove_msc_bar.py frames_in/ frames_out/ lama_fp32.onnx
  (model: huggingface.co/Carve/LaMa-ONNX; needs opencv-python-headless,
   onnxruntime, numpy)
Then splice the frames back over frames 100-170 with ffmpeg (trim + concat).
"""

import glob
import os
import sys

import cv2
import numpy as np
import onnxruntime as ort

SRC, DST, MODEL = sys.argv[1], sys.argv[2], sys.argv[3]
sess = ort.InferenceSession(MODEL)
CROP = 640


def bar_mask(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (8, 100, 100), (32, 255, 255))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for k in range(1, n):
        _, _, w, h, area = st[k]
        # The bar: wide, orange, in the middle band (the exit sign is lower down).
        if area > 400 and 950 < cen[k][1] < 1350 and w > 1.4 * h:
            keep[lab == k] = 255
    if keep.any():
        near = cv2.dilate(keep, np.ones((41, 41), np.uint8))
        halo = cv2.inRange(hsv, (5, 45, 70), (35, 255, 255))
        keep = cv2.bitwise_or(keep, cv2.bitwise_and(halo, near))
        keep = cv2.dilate(keep, np.ones((17, 17), np.uint8))
    return keep


os.makedirs(DST, exist_ok=True)
for path in sorted(glob.glob(os.path.join(SRC, "*.png"))):
    f = cv2.imread(path)
    mask = bar_mask(f)
    if mask.any():
        ys, xs = np.where(mask > 0)
        cy, cx = (ys.min() + ys.max()) // 2, (xs.min() + xs.max()) // 2
        H, W = f.shape[:2]
        x0 = int(np.clip(cx - CROP // 2, 0, W - CROP))
        y0 = int(np.clip(cy - CROP // 2, 0, H - CROP))
        crop = f[y0 : y0 + CROP, x0 : x0 + CROP].copy()
        mc = mask[y0 : y0 + CROP, x0 : x0 + CROP]
        img = cv2.resize(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB), (512, 512), interpolation=cv2.INTER_AREA)
        mm = (cv2.resize(mc, (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
        out = sess.run(
            None,
            {"image": (img.astype(np.float32) / 255).transpose(2, 0, 1)[None], "mask": mm[None, None]},
        )[0][0].transpose(1, 2, 0)
        out = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
        out = cv2.resize(out, (CROP, CROP), interpolation=cv2.INTER_CUBIC)
        soft = cv2.GaussianBlur(mc, (0, 0), 4).astype(np.float32)[..., None] / 255
        f[y0 : y0 + CROP, x0 : x0 + CROP] = (crop * (1 - soft) + out * soft).astype(np.uint8)
    cv2.imwrite(os.path.join(DST, os.path.basename(path)), f)
