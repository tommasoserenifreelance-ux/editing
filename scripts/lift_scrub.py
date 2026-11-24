"""Open up the shadows of the black scrub so folds and fabric read, keep it black.

usage: lift_scrub.py in.jpg bg_mask.png out.jpg gamma
"""
import sys
import cv2
import numpy as np

src, mask_path, out_path = sys.argv[1:4]
gamma = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8
im = cv2.imread(src)
h, w = im.shape[:2]
a_bg = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255

lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
L = lab[..., 0]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)

# Fabric = dark, neutral, away from skin / logo / tattooed arms, below the chin.
yy = np.mgrid[0:h, 0:w][0]
local_max = cv2.dilate(cv2.medianBlur(gray, 7), np.ones((9, 9), np.uint8))
colourful = cv2.dilate(((hsv[..., 1] > 90) & (gray > 60)).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
# Tattoo ink sits on warm skin (R > B); the scrub is neutral / slightly blue.
f = cv2.GaussianBlur(im.astype(np.float32), (0, 0), 4)
warm = (f[..., 2] - f[..., 0]) > 4
warm = cv2.dilate(cv2.morphologyEx(warm.astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)), np.ones((5, 5), np.uint8)) > 0
fabric = (a_bg < 0.5) & (yy > 0.33 * h) & (local_max < 85) & ~colourful & ~warm
fabric = cv2.morphologyEx(fabric.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
# Fill enclosed holes (the logo patch): bright logo colours are protected by the tone fade below.
n, lab_id, st, _ = cv2.connectedComponentsWithStats(1 - fabric, 8)
for i in range(1, n):
    x, y, bw, bh, area = st[i]
    touches_border = x == 0 or y == 0 or x + bw == w or y + bh == h
    if area < 60000 and not touches_border:
        fabric[lab_id == i] = 1
m = cv2.GaussianBlur(fabric.astype(np.float32), (0, 0), 3)
m *= (1 - a_bg)  # never touch the backdrop

# Shadow lift on L only: gamma curve that fades out above mid-dark tones.
Ln = L / 255.0
lifted = 255.0 * Ln ** gamma
fade = np.clip(1 - (L - 60) / 60, 0, 1)      # full effect in the blacks, none from L≈120 up
L2 = L + (lifted - L) * fade * m
lab[..., 0] = L2
# keep the black neutral (no colour cast when lifted)
lab[..., 1] = 128 + (lab[..., 1] - 128) * (1 - 0.5 * m * fade)
lab[..., 2] = 128 + (lab[..., 2] - 128) * (1 - 0.5 * m * fade)
out = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
cv2.imwrite(out_path, out, [cv2.IMWRITE_JPEG_QUALITY, 96])
cv2.imwrite(out_path.rsplit('.', 1)[0] + '_mask.png', (m * 255).astype(np.uint8))
