import sys, os, zlib
sys.path.insert(0, '/home/user/editing/grading')
import numpy as np
from PIL import Image
from batch import get_mask
from deflash import recover
from nightlife_grade import grade, highlight_knee, blur
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
a = glow(a, m, smooth=smooth, bright=0.0, gloss=0.0)   # light skin smoothing only; NO grain
# glossy look like the references: tanned, contrasty skin with crisp specular highlights
from nightlife_grade import lum, skin_mask
k = max(w, h) / 2000.0
sk = np.clip(blur(skin_mask(a) * 1.5, 2 * k), 0, 1) * np.clip(blur(m, 2*k), 0, 1)
L = lum(a)
# contrast on skin (deeper shadows/contours)
Lc = np.clip(0.5 + (L - 0.5) * 1.18, 0, 1)
a = a + ((Lc / np.maximum(L, 1e-4))[..., None] * a - a) * sk[..., None]
# a touch more warmth/saturation (tan)
Lm = lum(a)[..., None]
a = Lm + (a - Lm) * (1 + 0.18 * sk)[..., None]
# specular sheen: only the brightest skin points (cheekbones, nose, forehead), small and sharp
L = lum(a)
spec = np.clip((L - np.percentile(L[sk > 0.5], 88)) / 0.12, 0, 1) * sk
sheen = blur(spec, 2.5 * k) * gloss
a = 1 - (1 - a) * (1 - sheen[..., None] * np.array([1.0, 0.97, 0.94]))
a = 1 - (1 - a) * (1 - blur(spec, 9 * k)[..., None] * 0.18 * gloss)
a = highlight_knee(np.clip(a, 0, 1))
bgw = (1 - np.clip(blur(np.clip((m - 0.15) / 0.7, 0, 1), 2), 0, 1))[..., None]
a = a * (1 - bgw) + highlight_knee(a, knee=0.68, ceiling=0.90) * bgw
kw = {k: v for k, v in (('icc_profile', im.info.get('icc_profile')), ('exif', im.info.get('exif'))) if v}
Image.fromarray(np.round(a * 255).astype(np.uint8)).save(out, quality=100, subsampling=0, **kw)
print('saved', out)
