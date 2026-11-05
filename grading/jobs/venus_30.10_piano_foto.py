import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
S = sys.argv[1]
OUT = f'{S}/piano/Venus_accostamenti_foto.pdf'
def src(n):
    for p in (f'{S}/venus/out/{n}.jpg', f'{S}/drive/new/{n}.jpg', f'{S}/drive/new/{n}.JPEG'):
        if os.path.exists(p): return p
    raise SystemExit('missing ' + n)
# 2 weeks of posts, NO photo repeated anywhere. Each carousel: girls first, then the DJ
# (a person) and at most ONE venue shot, the bottle detail only once. 30.10 first.
PLAN = [
 ['DSC00419','DSC00618','DSC00162','DSC00882','DSC00424','DSC00390','DSC00860'],
 ['DSC00086','DSC00242','DSC00329','DSC09865','DSC00766','DSC01152-2','DSC09350','DSC00862'],
 ['DSC09368','DSC00393','DSC00549','DSC09585','DSC09815','DSC00044','DSC00819'],
 ['DSC00900','DSC00417','DSC00427','DSC09955','DSC09427','DSC09809'],
 ['DSC00888','DSC00911','DSC00914','DSC00411','DSC00425','DSC09525'],
 ['DSC00685','DSC00689','DSC00693','DSC00690'],
 ['DSC00723','DSC00584','DSC00173','DSC00339'],
 ['DSC00552','DSC00097','DSC09522','DSC09770','DSC00745'],
 ['DSC04985','DSC05003','DSC04991','DSC05033','DSC05497','DSC04947','IMG_5161'],
 ['DSC04982','DSC04984','DSC05502','DSC05684','DSC06438-2','DSC04986','DSC06073'],
]
SINGLE = ['DSC04956','DSC04941']
_all = [x for c in PLAN for x in c] + SINGLE
assert len(_all) == len(set(_all)), 'photo repeated'
W, H = 2480, 1754  # A4 landscape @300dpi
BG, BG2, FG, SUB, ACC = (18,11,26), (28,18,38), (244,238,248), (203,187,217), (185,140,255)
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f = lambda s, b=False: ImageFont.truetype(FB if b else F, s)
def thumb(n, w):
    im = ImageOps.exif_transpose(Image.open(src(n))).convert('RGB'); iw, ih = im.size
    th = int(iw * 5 / 4)
    if th <= ih: y = int((ih - th) * 0.25); im = im.crop((0, y, iw, y + th))
    else: tw = int(ih * 4 / 5); x = (iw - tw) // 2; im = im.crop((x, 0, x + tw, ih))
    return im.resize((w, int(w * 1.25)), Image.LANCZOS)
pages = []
pg = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(pg)
d.text((160, 280), 'VENUS', font=f(260, True), fill=FG)
d.text((160, 600), 'Piano foto', font=f(72), fill=SUB)
for i, n in enumerate(['DSC00618', 'DSC00086', 'DSC00860', 'DSC04985', 'IMG_5161']):
    pg.paste(thumb(n, 400), (160 + i * 440, 1000))
pages.append(pg)
def strip(pg, d, ph, y0, title):
    d.text((160, 150), title, font=f(110, True), fill=FG)
    n = len(ph); gap = 28; avail = W - 320
    w = min(560, (avail - (n - 1) * gap) // n)
    total = n * w + (n - 1) * gap; x0 = (W - total) // 2
    for j, name in enumerate(ph):
        x = x0 + j * (w + gap)
        pg.paste(thumb(name, w), (x, y0))
        d.text((x, y0 + int(w * 1.25) + 18), f'{j+1}  ·  {name.replace("DSC","")}', font=f(36), fill=SUB)
for i, ph in enumerate(PLAN, 1):
    pg = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(pg)
    strip(pg, d, ph, 420, f'Versione {i}')
    pages.append(pg)
# single post options
pg = Image.new('RGB', (W, H), BG2); d = ImageDraw.Draw(pg)
d.text((160, 120), 'Post singolo', font=f(110, True), fill=FG)
w = 560; gapx = 120
x_start = (W - (len(SINGLE) * w + (len(SINGLE) - 1) * gapx)) // 2
for j, name in enumerate(SINGLE):
    x = x_start + j * (w + gapx); y = 330
    pg.paste(thumb(name, w), (x, y))
    d.text((x, y + int(w * 1.25) + 14), f'Versione {j+1}  ·  {name.replace("DSC","")}', font=f(36), fill=SUB)
pages.append(pg)
pages[0].save(OUT, save_all=True, append_images=pages[1:], resolution=300)
print(OUT, len(pages))
