"""Natural skin retouch for DSC06527: heal small blemishes, calm redness.

usage: skin_retouch.py in.jpg bg_mask.png out.jpg debug_mask.png
"""
import sys
import cv2
import numpy as np

src, mask_path, out_path, dbg_path = sys.argv[1:5]
im = cv2.imread(src)
h, w = im.shape[:2]
a_bg = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255

lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
L, A, Bc = lab[..., 0], lab[..., 1], lab[..., 2]

# --- Skin mask: head/neck area only, bright warm pixels (beard, hair, eyebrows are dark).
yy, xx = np.mgrid[0:h, 0:w]
region = (yy > 150) & (yy < 1000) & (xx > 580) & (xx < 1200)
skin = region & (a_bg < 0.05) & (L > 105) & (A > 132) & (A < 165) & (Bc > 132)
# Protected features: mouth (lips/teeth/gums) and eyes.
protect = np.zeros((h, w), np.uint8)
cv2.ellipse(protect, (830, 600), (110, 62), -4, 0, 360, 1, -1)   # mouth
cv2.ellipse(protect, (775, 393), (58, 26), 0, 0, 360, 1, -1)     # left eye (viewer's)
cv2.ellipse(protect, (945, 415), (58, 26), 8, 0, 360, 1, -1)     # right eye
cv2.ellipse(protect, (1105, 545), (60, 105), 10, 0, 360, 1, -1)  # ear
cv2.ellipse(protect, (850, 515), (48, 22), 0, 0, 360, 1, -1)     # nostrils
skin &= protect == 0
skin_u8 = cv2.morphologyEx(skin.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
skin_soft = cv2.GaussianBlur(skin_u8.astype(np.float32), (0, 0), 3)

# --- 1) Blemishes: small spots redder and/or darker than the surrounding skin.
A_loc = cv2.GaussianBlur(A, (0, 0), 12)
L_loc = cv2.GaussianBlur(L, (0, 0), 12)
A_s = cv2.GaussianBlur(A, (0, 0), 1.5)
L_s = cv2.GaussianBlur(L, (0, 0), 1.5)
spot = ((A_s - A_loc > 3.5) & (L_s - L_loc < 2)) | ((L_loc - L_s > 9) & (A_s - A_loc > 1.5))
spot &= skin_u8 > 0
spot = spot.astype(np.uint8)
n, lab_id, st, _ = cv2.connectedComponentsWithStats(spot, 8)
blem = np.zeros_like(spot)
for i in range(1, n):
    area = st[i, cv2.CC_STAT_AREA]
    bw, bh = st[i, cv2.CC_STAT_WIDTH], st[i, cv2.CC_STAT_HEIGHT]
    fill = area / float(bw * bh)
    if 6 <= area <= 900 and max(bw, bh) <= 45 and max(bw, bh) <= 3.5 * min(bw, bh) and fill > 0.3:
        blem[lab_id == i] = 1
blem = cv2.dilate(blem, np.ones((5, 5), np.uint8))
print('blemishes healed:', cv2.connectedComponents(blem)[0] - 1)

# Heal: inpaint the colour/tone, then put the original fine skin grain back on top.
healed = cv2.inpaint(im, blem * 255, 7, cv2.INPAINT_TELEA).astype(np.float32)
imf = im.astype(np.float32)
grain = imf - cv2.GaussianBlur(imf, (0, 0), 1.2)
healed = healed + 0.7 * grain
wb = cv2.GaussianBlur(blem.astype(np.float32), (0, 0), 1.5)[..., None]
out = imf * (1 - wb) + healed * wb

# --- 2) Redness: pull local red patches back toward the surrounding skin tone.
lab2 = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
A2 = lab2[..., 1]
m = skin_soft
A_ref = (cv2.GaussianBlur(A2 * m, (0, 0), 45) / np.maximum(cv2.GaussianBlur(m, (0, 0), 45), 1e-3))
A_mid = cv2.GaussianBlur(A2, (0, 0), 4)
excess = np.clip(A_mid - A_ref, 0, None)
lab2[..., 1] = A2 - 0.6 * excess * m
# very slight global calming of skin redness
lab2[..., 1] -= 1.5 * m
out2 = cv2.cvtColor(np.clip(lab2, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)

cv2.imwrite(out_path, out2, [cv2.IMWRITE_JPEG_QUALITY, 96])
dbg = im.copy()
dbg[skin_u8 > 0] = (dbg[skin_u8 > 0] * 0.6 + np.array([0, 120, 0]) * 0.4).astype(np.uint8)
dbg[blem > 0] = (255, 0, 255)
cv2.imwrite(dbg_path, dbg[150:1000, 580:1200])
