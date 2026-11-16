import sys, os, zlib
sys.path.insert(0, '/home/user/editing/grading')
import numpy as np
from PIL import Image
from batch import get_mask
from deflash import recover
from nightlife_grade import grade, highlight_knee, blur, rgb_to_hsv, hsv_to_rgb
from violet_background import violet_background
from bokeh import add_bokeh, layout
from skin_glow import glow
name, smooth, gloss, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
src = f'orig/{name}.jpg'
im = Image.open(src); rgb = im.convert('RGB')
a0 = np.asarray(rgb).astype(np.float64) / 255.0
mi = get_mask(rgb); m = np.asarray(mi).astype(np.float64) / 255.0
a0 = recover(a0, m, 0.6)
a = grade(a0, skin_val=0.62)
h, w, _ = a.shape
seed = zlib.crc32((name + '.jpg').encode()) % 1000
a = violet_background(a, mi, lift=1.6, ramp='violet_vivid', bg_blur=6)
a = add_bokeh(a, m, layout(w, h, np.random.default_rng(seed), 7))
# NO grain anywhere
# glossy look like the references: tanned, contrasty skin with crisp specular highlights
from nightlife_grade import lum, skin_mask
k = max(w, h) / 2000.0
sk = np.clip(blur(skin_mask(a) * 1.5, 2 * k), 0, 1) * np.clip(blur(m, 2*k), 0, 1)
L = lum(a)
# 1) airbrushed skin with an EDGE-PRESERVING guided filter: pores/blotches go,
#    eyes, brows, lips, nostrils and the face outline stay sharp
def box(x, r):
    c = np.cumsum(np.cumsum(np.pad(x, ((r + 1, r), (r + 1, r))), 0), 1)
    return (c[2*r+1:, 2*r+1:] - c[:-2*r-1, 2*r+1:] - c[2*r+1:, :-2*r-1] + c[:-2*r-1, :-2*r-1]) / (2*r+1)**2
def guided(I, p, r, eps):
    mI, mp = box(I, r), box(p, r)
    cov = box(I * p, r) - mI * mp; var = box(I * I, r) - mI * mI
    A = cov / (var + eps); B = mp - A * mI
    return box(A, r) * I + box(B, r)
G = lum(a); r = int(7 * k)
sm = np.stack([guided(G, a[..., c], r, 0.0025) for c in range(3)], -1)
gx = np.abs(np.diff(G, axis=1, append=G[:, -1:])); gy = np.abs(np.diff(G, axis=0, append=G[-1:, :]))
edges = np.clip(blur(gx + gy, 1.2 * k) * 14, 0, 1)            # strong local detail = features
w_s = sk * (1 - edges) * smooth
a = a + (sm - a) * w_s[..., None]
# 2) skin colour sampled from the CHIICAS reference: rosy hue ~10 deg,
#    saturation ~0.42 in the mids falling to ~0.12 in the highlights, mids at V ~0.72
REF_H = 10.0
# keep the recolour off the hair: hair is full of fine strands (high local texture), skin is smooth
Gt = lum(a)
tex = blur(np.abs(Gt - blur(Gt, 1.5 * k)), 4 * k)
face = sk * np.clip(1 - (tex - 0.012) / 0.02, 0, 1)
face = np.clip(blur(face, 3 * k) * 1.2, 0, 1)
hh, ss, vv = rgb_to_hsv(np.clip(a, 0, 1))
med = np.median(vv[sk > 0.6]) if (sk > 0.6).sum() > 500 else 0.72
v2 = np.clip(vv * (0.60 / max(med, 1e-3)), 0, 1)                    # less flash: lit skin down to ref level
v2 = np.where(v2 > 0.74, 0.74 + (v2 - 0.74) * 0.5, v2)
v2 = np.clip(0.5 + (v2 - 0.5) * 1.32, 0, 1)                         # sculpted contrast
s_t = np.interp(v2, [0.0, 0.25, 0.5, 0.72, 0.88, 1.0], [0.60, 0.58, 0.52, 0.44, 0.34, 0.18])
hd = ((REF_H - hh + 180) % 360) - 180
skin_new = hsv_to_rgb(hh + hd, s_t, v2)
a = a + (skin_new - a) * face[..., None]
# 4) plastic gloss: broad specular sheets on the high planes (cheekbones, forehead, nose, shoulders) + bloom
L = lum(a)
thr = np.percentile(L[sk > 0.5], 72)
spec = np.clip((L - thr) / 0.14, 0, 1) ** 1.3 * face
sheen = blur(spec, 4 * k)
a = 1 - (1 - a) * (1 - (sheen * gloss)[..., None] * np.array([1.0, 0.90, 0.90]))   # pink-white sheen like the reference
core = np.clip((spec - 0.45) / 0.4, 0, 1)
a = 1 - (1 - a) * (1 - (blur(core, 1.5 * k) * 0.55 * gloss)[..., None])
a = 1 - (1 - a) * (1 - (blur(spec, 14 * k) * 0.22 * gloss)[..., None] * np.array([1.0, 0.82, 0.86]))
a = highlight_knee(np.clip(a, 0, 1))
bgw = (1 - np.clip(blur(np.clip((m - 0.15) / 0.7, 0, 1), 2), 0, 1))[..., None]
a = a * (1 - bgw) + highlight_knee(a, knee=0.68, ceiling=0.90) * bgw
kw = {k: v for k, v in (('icc_profile', im.info.get('icc_profile')), ('exif', im.info.get('exif'))) if v}
Image.fromarray(np.round(a * 255).astype(np.uint8)).save(out, quality=100, subsampling=0, **kw)
print('saved', out)
