import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
S = sys.argv[1]
OUT = f'{S}/piano/Venus_accostamenti_foto.pdf'
def src(n):
    for p in (f'{S}/venus/out/{n}.jpg', f'{S}/drive/new/{n}.jpg', f'{S}/drive/new/{n}.JPEG'):
        if os.path.exists(p): return p
    raise SystemExit('missing ' + n)
PLAN = [
 ('30.10', 'La serata', 'Apertura forte: sala, persone, DJ, folla', ['DSC00860','DSC00419','DSC00162','DSC00618','DSC00390','DSC00882','DSC00424','DSC00862']),
 ('30.10', 'Ritratti', 'Una ragazza per slide, sfondo viola', ['DSC00086','DSC00242','DSC00329','DSC00766','DSC09865','DSC01152-2']),
 ('30.10', 'Con gli amici', 'Gruppi e coppie', ['DSC09368','DSC00393','DSC00549','DSC09585','DSC09815','DSC00044','DSC09525']),
 ('30.10', 'Sguardi', 'Pose e primi piani, viola e neutre alternate', ['DSC00173','DSC00339','DSC09522','DSC09770','DSC00584','DSC00552','DSC00097']),
 ('30.10', 'Mood', 'Scie di luce ed effetto graffiato', ['DSC00900','DSC00417','DSC00427','DSC09955','DSC09427','DSC09809']),
 ('30.10', 'Il look', 'Outfit: rete, trasparenze, maschera', ['DSC00888','DSC00911','DSC00914','DSC00411','DSC00425']),
 ('30.10', 'Una ragazza, una serie', 'Stessa ragazza davanti alla parete metallica', ['DSC00685','DSC00689','DSC00690','DSC00693']),
 ('30.10', 'Dietro la console', 'DJ e ospiti', ['DSC09350','DSC00819']),
 ('30.10', 'Post singolo', 'Funziona da sola', ['DSC00723']),
 ('Altre serate', 'Venus nights', 'Il meglio delle serate precedenti', ['DSC04985','DSC05003','DSC04991','DSC05033','DSC05497','DSC05502','DSC05684','DSC06438-2']),
 ('Altre serate', 'Il locale', 'Insegna, colonne e pista piena', ['DSC06073','DSC04947','DSC04956','DSC04941']),
 ('Altre serate', 'Una ragazza, una serie', 'Tre pose della stessa ragazza', ['DSC04982','DSC04984','DSC04986']),
 ('Altre serate', 'Post singolo', 'Dettaglio tavolo', ['IMG_5161']),
]
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
# cover
pg = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(pg)
d.text((160, 200), 'PIANO FOTO', font=f(48), fill=ACC)
d.text((160, 280), 'VENUS', font=f(260, True), fill=FG)
d.text((160, 600), 'Accostamenti per caroselli e post singoli', font=f(64), fill=SUB)
d.text((160, 700), f'{len(PLAN)} proposte · prima la serata del 30.10, poi le altre serate', font=f(44), fill=SUB)
d.text((160, 780), 'Formato 4:5 · massimo 8 foto per carosello', font=f(44), fill=SUB)
for i, n in enumerate(['DSC00618', 'DSC00419', 'DSC00162', 'DSC00882', 'DSC00086']):
    pg.paste(thumb(n, 400), (160 + i * 440, 1100))
pages.append(pg)
# overview
pg = Image.new('RGB', (W, H), BG2); d = ImageDraw.Draw(pg)
d.text((160, 140), 'PANORAMICA', font=f(44), fill=ACC)
d.text((160, 200), 'Tutti gli accostamenti', font=f(96, True), fill=FG)
y = 400; cur = None
for i, (grp, t, sub, ph) in enumerate(PLAN, 1):
    if grp != cur:
        cur = grp; d.text((160, y), grp.upper(), font=f(40, True), fill=ACC); y += 70
    d.text((200, y), f'{i}.  {t}', font=f(46, True), fill=FG)
    d.text((1000, y + 4), ('Post singolo' if len(ph) == 1 else f'Carosello · {len(ph)} foto') + '  —  ' + sub, font=f(38), fill=SUB)
    y += 78
pages.append(pg)
# one page per proposal
for i, (grp, t, sub, ph) in enumerate(PLAN, 1):
    pg = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(pg)
    d.text((160, 120), f'{grp.upper()}  ·  {i}/{len(PLAN)}', font=f(44), fill=ACC)
    d.text((160, 185), t, font=f(110, True), fill=FG)
    d.text((160, 330), ('Post singolo' if len(ph) == 1 else f'Carosello · {len(ph)} foto') + '  —  ' + sub, font=f(48), fill=SUB)
    n = len(ph); gap = 28; avail = W - 320
    w = min(560, (avail - (n - 1) * gap) // n)
    if n == 1: w = 760
    total = n * w + (n - 1) * gap; x0 = (W - total) // 2; y0 = 470
    for j, name in enumerate(ph):
        x = x0 + j * (w + gap)
        pg.paste(thumb(name, w), (x, y0))
        d.text((x, y0 + int(w * 1.25) + 18), f'{j+1}  ·  {name.replace("DSC","")}', font=f(36 if w < 300 else 40), fill=SUB)
    pages.append(pg)
pages[0].save(OUT, save_all=True, append_images=pages[1:], resolution=300)
print(OUT, len(pages))
