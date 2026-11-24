import sys
import cv2
import numpy as np

src, out_path, mask_path = sys.argv[1], sys.argv[2], sys.argv[3]
im = cv2.imread(src).astype(np.float32)
h, w = im.shape[:2]
B, G, R = im[..., 0], im[..., 1], im[..., 2]
br = B - R  # wall: strongly positive, subject: ~0 or negative


def norm_blur(img, m, sigma):
    """Masked (normalized) Gaussian blur: fills unknown areas from known ones."""
    k = (0, 0)
    if img.ndim == 3:
        num = cv2.GaussianBlur(img * m[..., None], k, sigma)
        den = cv2.GaussianBlur(m, k, sigma)[..., None]
    else:
        num = cv2.GaussianBlur(img * m, k, sigma)
        den = cv2.GaussianBlur(m, k, sigma)
    return num / np.maximum(den, 1e-6), (den if img.ndim == 2 else den[..., 0])


def smooth_fill(img, m):
    """Multi-scale normalized blur: local detail near known pixels, broad fill far away."""
    res = None
    for sigma in (400, 150, 60, 25):
        est, den = norm_blur(img, m, sigma)
        if res is None:
            res = est
        else:
            wgt = np.clip(den * 3, 0, 1)
            if img.ndim == 3:
                wgt = wgt[..., None]
            res = res * (1 - wgt) + est * wgt
    return res


# 1) Rough sure-background: clearly blue, low-ish risk.
hsv = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
sure_bg = ((br > 45) & (np.abs(hsv[..., 0] - 100) < 8) & (hsv[..., 1] > 100)).astype(np.uint8)
sure_bg = cv2.erode(sure_bg, np.ones((9, 9), np.uint8))

# 2) Smooth estimate of the original wall (colour + its B-R), shadows included.
mbg = sure_bg.astype(np.float32)
wall = smooth_fill(im, mbg)
wall_br = np.maximum(wall[..., 0] - wall[..., 2], 20)

# 3) Linear unmixing: subject is dark/warm (B-R <= 0), so a_bg ≈ (B-R)/wall(B-R).
a_bg = np.clip(br / wall_br, 0, 1)
a_bg = np.clip((a_bg - 0.06) / (0.94 - 0.06), 0, 1)

# 4) Clean the subject region: the largest foreground blob, with small holes filled.
fg = (a_bg < 0.5).astype(np.uint8)
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
keep = np.zeros_like(fg)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 0.02 * h * w:
        keep[lab == i] = 1
inv = 1 - keep
n2, lab2, stats2, _ = cv2.connectedComponentsWithStats(inv, 8)
for i in range(1, n2):
    if stats2[i, cv2.CC_STAT_AREA] < 3000:  # tiny "background" specks inside subject
        keep[lab2 == i] = 1
core = cv2.erode(keep, np.ones((7, 7), np.uint8))
a_bg[core > 0] = 0
outside = cv2.dilate(keep, np.ones((15, 15), np.uint8)) == 0
a_bg[outside] = 1
a_bg = cv2.GaussianBlur(a_bg, (3, 3), 0)

# 5) New clean backdrop: same blue hue, brighter and more saturated, soft studio light.
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
cx, cy = w * 0.5, h * 0.33
r = np.sqrt(((xx - cx) / w) ** 2 + ((yy - cy) / h) ** 2)
light = np.clip(1 - r / 0.85, 0, 1) ** 1.2  # 1 at the centre, 0 in the far corners
centre = np.array([212, 172, 88], np.float32)  # BGR
corner = np.array([176, 136, 62], np.float32)
new_bg = corner + (centre - corner) * light[..., None]
rng = np.random.default_rng(7)
new_bg += rng.normal(0, 1.4, (h, w, 1)).astype(np.float32)  # fine grain, no banding

# 6) Composite: out = I + a_bg * (newBG - oldWall)  (keeps edge pixels physically mixed)
out = im + a_bg[..., None] * (new_bg - wall)
# Away from the edges, flatten the wall texture/stains (keep 20% so it still looks real).
far = (cv2.erode((a_bg > 0.99).astype(np.uint8), np.ones((9, 9), np.uint8))).astype(np.float32)
far = cv2.GaussianBlur(far, (0, 0), 3)[..., None]
out -= far * 0.9 * (im - wall)

# 7) A touch more life on the subject only (vibrance + slight lift).
lab_img = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
L, A, Bb = lab_img[..., 0], lab_img[..., 1] - 128, lab_img[..., 2] - 128
chroma = np.sqrt(A ** 2 + Bb ** 2)
boost = 1 + 0.14 * np.clip(1 - chroma / 60, 0, 1)
L2 = np.clip(L * 1.03 + 2, 0, 255)
subj = cv2.cvtColor(np.dstack([L2, A * boost + 128, Bb * boost + 128]).clip(0, 255).astype(np.uint8),
                    cv2.COLOR_LAB2BGR).astype(np.float32)
a_fg = (1 - a_bg)[..., None]
out = out * (1 - a_fg) + subj * a_fg

cv2.imwrite(out_path, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 96])
cv2.imwrite(mask_path, (a_bg * 255).astype(np.uint8))

# 8) Dust removal: tiny specks that stand out from their surroundings.
res = np.clip(out, 0, 255).astype(np.uint8)
med = cv2.medianBlur(res, 9)
g = cv2.cvtColor(res, cv2.COLOR_BGR2GRAY).astype(np.int16)
gm = cv2.cvtColor(med, cv2.COLOR_BGR2GRAY).astype(np.int16)
d = g - gm
sat = cv2.cvtColor(res, cv2.COLOR_BGR2HSV)[..., 1]
colourful = cv2.dilate(((sat > 90) & (g > 60)).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
deep_black = cv2.dilate(gm.astype(np.uint8), np.ones((31, 31), np.uint8)) < 55   # far from skin/logo/hair highlights
below_face = (np.mgrid[0:h, 0:w][0] > 0.36 * h)
on_fabric = (gm < 45) & (a_bg < 0.05) & ~colourful & deep_black & below_face
on_wall = a_bg > 0.99                          # backdrop
cand = ((on_fabric & (d > 18)) | (on_wall & (np.abs(d) > 10))).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(cand, 8)
dust = np.zeros_like(cand)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] <= 30:
        dust[lab == i] = 1
dust = cv2.dilate(dust, np.ones((3, 3), np.uint8))
print('dust specks removed:', int((st[1:, cv2.CC_STAT_AREA] <= 30).sum()))
res[dust > 0] = med[dust > 0]
cv2.imwrite(out_path, res, [cv2.IMWRITE_JPEG_QUALITY, 96])
