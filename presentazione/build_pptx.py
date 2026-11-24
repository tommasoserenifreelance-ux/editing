"""Builds "Ossigeno-Ozono e longevità" (Dott. Michele Bonaccorso, The Longevity Lab) as an editable PowerPoint.
Layouts: the congress backgrounds (cover, inner, closing). Graphic language: the "Infiammazione" deck
(boxed cards with a hard offset shadow, numbered blocks, icon circles, a highlight banner), recoloured to the congress palette.
Run: python3 build_pptx.py  →  Ossigeno-Ozono-e-longevita-Bonaccorso.pptx"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'pptx_assets')
OUT = os.path.join(HERE, 'Ossigeno-Ozono-e-longevita-Bonaccorso.pptx')

NAVY = RGBColor(0x0F, 0x3B, 0x52)
CYAN = RGBColor(0x3F, 0xB4, 0xE5)
LILAC = RGBColor(0xB5, 0xBA, 0xF1)
PINK = RGBColor(0xE3, 0xA6, 0xD0)
SKY = RGBColor(0xE6, 0xF4, 0xFB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GREY = RGBColor(0x5B, 0x6B, 0x78)
SERIF, SANS = 'Didot', 'Montserrat'

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]
SW, SH = 13.333, 7.5


def bg(slide, f):
    slide.shapes.add_picture(os.path.join(A, f), 0, 0, prs.slide_width, prs.slide_height)


def tb(slide, x, y, w, h, text, size=16, color=NAVY, font=SANS, bold=False, italic=False, align=PP_ALIGN.LEFT,
       anchor=MSO_ANCHOR.TOP, spacing=None, line=1.15):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = tf.margin_bottom = Inches(0.02)
    tf.vertical_anchor = anchor
    parts = text if isinstance(text, list) else [text]
    for i, part in enumerate(parts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = line
        runs = part if isinstance(part, list) else [(part, {})]
        for r_text, st in runs:
            r = p.add_run(); r.text = r_text
            f = r.font; f.name = st.get('font', font); f.size = Pt(st.get('size', size)); f.bold = st.get('bold', bold)
            f.italic = st.get('italic', italic); f.color.rgb = st.get('color', color)
            if spacing is not None or 'spacing' in st:
                rPr = r._r.get_or_add_rPr(); rPr.set('spc', str(int((st.get('spacing', spacing)) * 100)))
        if 'space_after' in (runs[0][1] if runs else {}):
            p.space_after = Pt(runs[0][1]['space_after'])
    return box


def rect(slide, x, y, w, h, fill=WHITE, line=None, lw=2.0, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.shadow.inherit = False
    if fill is None: s.fill.background()
    else: s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else: s.line.color.rgb = line; s.line.width = Pt(lw)
    return s


def card(slide, x, y, w, h, shadow=CYAN, border=NAVY, fill=WHITE, off=0.09):
    """the Infiammazione box: a white card with a navy border and a hard offset shadow"""
    rect(slide, x + off, y + off, w, h, fill=shadow)
    return rect(slide, x, y, w, h, fill=fill, line=border, lw=2.0)


def circle(slide, cx, cy, d, fill=NAVY, text='', size=18, color=WHITE, font=SANS):
    s = rect(slide, cx - d / 2, cy - d / 2, d, d, fill=fill, shape=MSO_SHAPE.OVAL)
    if text:
        tf = s.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = text; r.font.size = Pt(size); r.font.bold = True; r.font.color.rgb = color; r.font.name = font
    return s


def picture(slide, f, x, y, w=None, h=None, frame=True):
    pic = slide.shapes.add_picture(os.path.join(A, f), Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)
    if frame:
        pic.line.color.rgb = NAVY; pic.line.width = Pt(1.5)
    return pic


def fit(f, w, h):
    """size (in) of image f fitted inside w × h"""
    from PIL import Image
    im = Image.open(os.path.join(A, f)); r = im.width / im.height
    return (w, w / r) if w / r <= h else (h * r, h)


PAGE = [0]
def inner(title, kicker=None):
    s = prs.slides.add_slide(BLANK); bg(s, 'bg-interna.jpg'); PAGE[0] += 1
    if kicker: tb(s, 0.62, 0.66, 9, 0.3, kicker.upper(), size=11, color=CYAN, bold=True, spacing=3)
    tb(s, 0.6, 0.86 if kicker else 0.72, 10.4, 0.8, title, size=34, color=NAVY, font=SERIF)
    tb(s, 0.62, 7.0, 9, 0.25, 'THE LONGEVITY LAB  ·  OSSIGENO-OZONO E LONGEVITÀ  ·  DOTT. MICHELE BONACCORSO', size=8, color=GREY, spacing=2.5)
    tb(s, 12.1, 7.0, 0.6, 0.25, str(PAGE[0] + 1), size=9, color=GREY, align=PP_ALIGN.RIGHT)
    return s


def banner(s, x, y, w, text, h=0.55, fill=CYAN, color=WHITE, size=15):
    rect(s, x + 0.07, y + 0.07, w, h, fill=NAVY)
    b = rect(s, x, y, w, h, fill=fill)
    tb(s, x + 0.25, y, w - 0.5, h, text, size=size, color=color, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    return b


def video(s, f, poster, x, y, w, h):
    m = s.shapes.add_movie(os.path.join(A, f), Inches(x), Inches(y), Inches(w), Inches(h),
                           poster_frame_image=os.path.join(A, poster), mime_type='video/mp4')
    return m



def source(s, text):
    tb(s, 0.62, 6.62, 11.6, 0.3, text, size=9, color=GREY, italic=True)


def points(s, x, y, w, items, h=1.12, gap=0.22, size=13):
    for i, it in enumerate(items):
        head, body = it if isinstance(it, tuple) else (None, it)
        yy = y + i * (h + gap)
        card(s, x, yy, w, h, shadow=[CYAN, LILAC, PINK, CYAN][i % 4], off=0.07)
        circle(s, x + 0.45, yy + h / 2, 0.5, text=str(i + 1), size=14, fill=[NAVY, CYAN, NAVY, CYAN][i % 4])
        if head:
            tb(s, x + 0.9, yy + 0.1, w - 1.05, 0.38, head.upper(), size=12.5, bold=True, spacing=1)
            tb(s, x + 0.9, yy + 0.44, w - 1.05, h - 0.5, body, size=size - 0.5, color=GREY, line=1.15)
        else:
            tb(s, x + 0.9, yy + 0.08, w - 1.05, h - 0.16, body, size=size, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, line=1.15)


def study(s, img, x, y, w, h, shadow=LILAC):
    """a PubMed screenshot in an Infiammazione card"""
    pw, ph = fit(img, w - 0.3, h - 0.3)
    card(s, x, y, pw + 0.3, ph + 0.3, shadow=shadow)
    picture(s, img, x + 0.15, y + 0.15, pw, ph, frame=False)
    return pw + 0.3, ph + 0.3


def aside(s, img, x, y, w, h, shadow=CYAN):
    """image card aligned to the block beside it: same top and bottom, image centred inside"""
    card(s, x, y, w, h, shadow=shadow)
    pw, ph = fit(img, w - 0.3, h - 0.3)
    picture(s, img, x + (w - pw) / 2, y + (h - ph) / 2, pw, ph, frame=False)


def placeholder(s, x, y, w, h, title, sub):
    b = rect(s, x, y, w, h, fill=SKY, line=CYAN, lw=2.0)
    b.line.dash_style = 4
    tb(s, x, y + h / 2 - 0.45, w, 0.45, title, size=18, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    tb(s, x, y + h / 2 + 0.05, w, 0.6, sub, size=12, color=GREY, align=PP_ALIGN.CENTER)


def badge(s, x, y, text, fill=PINK):
    w = 0.16 + 0.105 * len(text)
    rect(s, x, y, w, 0.34, fill=fill)
    tb(s, x, y, w, 0.34, text.upper(), size=10, bold=True, color=NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, spacing=1)


# ===================== 1 · COPERTINA =====================
s = prs.slides.add_slide(BLANK); bg(s, 'bg-copertina.jpg')

# ===================== 2 · LO STATO DELL'ARTE (video) =====================
s = inner("Lo stato dell'arte", 'Ossigeno-ozonoterapia oggi')
vh = 6.49 - 1.95; vw = vh * 720 / 1276; vx = SW - 0.62 - vw - 0.1
rect(s, vx + 0.1, 1.95 + 0.1, vw, vh, fill=LILAC)
video(s, 'stato-arte.mp4', 'stato-arte-poster.jpg', vx, 1.95, vw, vh)
tb(s, 0.62, 1.95, 7.6, 1.6, [[("Dall'esperimento di laboratorio ", {}), ('alla pratica clinica', {'italic': True, 'color': CYAN})]],
   size=36, font=SERIF, line=1.05)
items = [('01', 'Evidenze', 'una letteratura scientifica in crescita costante'),
         ('02', 'Protocolli', 'modalità di somministrazione standardizzate'),
         ('03', 'Sicurezza', 'un profilo favorevole se eseguita da professionisti qualificati')]
for i, (n, t, d) in enumerate(items):
    y = 3.75 + i * 0.98
    card(s, 0.62, y, 7.4, 0.78, shadow=[CYAN, LILAC, PINK][i])
    circle(s, 1.1, y + 0.39, 0.5, text=n, size=13)
    tb(s, 1.55, y + 0.1, 2.0, 0.6, t.upper(), size=14, bold=True, anchor=MSO_ANCHOR.MIDDLE, spacing=1)
    tb(s, 3.4, y + 0.1, 4.5, 0.6, d, size=13, color=GREY, anchor=MSO_ANCHOR.MIDDLE)

# ===================== 3 · LA STORIA (video animato) =====================
s = inner('Come siamo arrivati fin qui', 'La storia dell’ozono in medicina')
vw = 8.8; vh = vw * 9 / 16; vx = (SW - vw) / 2
rect(s, vx + 0.12, 1.5 + 0.12, vw, vh, fill=CYAN)
video(s, 'storia-ozono.mp4', 'storia-ozono-poster.jpg', vx, 1.5, vw, vh)
tb(s, vx, 1.5 + vh + 0.22, vw, 0.4, '1839  →  1857  →  1870  →  1881  →  1885  →  1886  →  1900  →  1990–2000',
   size=13, color=NAVY, bold=True, align=PP_ALIGN.CENTER, spacing=1)

# ===================== 4 · DAL 2000 AL 2025 (video PubMed) =====================
s = inner('Dal 2000 al 2026', 'L’esplosione delle evidenze')
vw = 7.9; vh = vw * 9 / 16
rect(s, 0.62 + 0.1, 1.6 + 0.1, vw, vh, fill=LILAC)
video(s, 'pubmed.mp4', 'pubmed-poster.jpg', 0.62, 1.6, vw, vh)
card(s, 8.95, 1.6, 3.75, 2.2, shadow=CYAN)
tb(s, 9.2, 1.75, 3.3, 1.9, [[('Esplosione', {'bold': True, 'size': 20})],
                            [('degli studi pubblicati su PubMed: un aumento esponenziale delle evidenze scientifiche.', {'size': 14, 'color': GREY})]], line=1.2)
for i, (t, c) in enumerate([('Dermatologia', CYAN), ('Stress ossidativo', LILAC), ('Invecchiamento vascolare', PINK), ('Medicina integrativa', CYAN)]):
    y = 4.0 + i * 0.54
    rect(s, 8.95, y, 0.14, 0.42, fill=c)
    tb(s, 9.2, y, 3.5, 0.42, t.upper(), size=12.5, bold=True, anchor=MSO_ANCHOR.MIDDLE, spacing=1)
banner(s, 0.62, 6.25, 7.9, 'E per la medicina della longevità? Approfondiamo alcuni studi', size=13)


# ===================== E PER LA MEDICINA DELLA LONGEVITÀ? =====================
s = inner('', None)
tb(s, 0.9, 1.7, 11.8, 1.9, [[('E per la medicina ', {})], [('della longevità?', {'italic': True, 'color': CYAN})]], size=50, font=SERIF, line=1.0)
tb(s, 0.95, 3.75, 10.5, 0.8, 'Dalla modulazione dello stress ossidativo alla senescenza cellulare: cosa dicono gli studi.', size=20, color=GREY)
for i, (t, c) in enumerate([('Meccanismi', CYAN), ('Studi sperimentali', LILAC), ('Dati sull’uomo', PINK), ('Prospettive', CYAN)]):
    x = 0.95 + i * 2.95
    rect(s, x + 0.07, 4.85 + 0.07, 2.65, 0.7, fill=NAVY); rect(s, x, 4.85, 2.65, 0.7, fill=c)
    tb(s, x, 4.85, 2.65, 0.7, t.upper(), size=13, bold=True, color=WHITE if c != LILAC else NAVY, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, spacing=1)

# ===================== 1 · LONGEVITÀ E HEALTHY AGING =====================
s = inner('Longevità e healthy aging', '01 · Vivere più a lungo, vivere meglio')
card(s, 0.62, 1.7, 5.4, 4.6, shadow=CYAN)
tb(s, 0.95, 1.95, 4.8, 0.4, 'IL DIVARIO TRA VITA E VITA IN SALUTE', size=12, bold=True, spacing=1.5)
tb(s, 0.9, 2.45, 4.9, 1.6, '9,6', size=110, font=SERIF, color=CYAN, line=0.9)
tb(s, 3.2, 3.15, 2.6, 0.6, 'anni', size=28, font=SERIF, color=NAVY)
tb(s, 0.95, 4.2, 4.8, 1.0, 'In 183 Paesi la differenza tra aspettativa di vita e anni vissuti in salute è passata da 8,5 anni (2000) a 9,6 anni (2019).', size=13, color=GREY, line=1.2)
banner(s, 0.95, 5.45, 4.8, 'Obiettivo: più anni in salute', size=13)
points(s, 6.5, 1.7, 6.2, [
    ('Healthy aging (OMS)', 'Sviluppare e mantenere la capacità funzionale che permette il benessere in età avanzata: non solo assenza di malattia.'),
    ('2021–2030', 'L’ONU ha proclamato il Decennio dell’Invecchiamento in Salute.'),
    ('12 segni dell’invecchiamento', 'Instabilità genomica, telomeri, epigenetica, proteostasi, autofagia, nutrienti, mitocondri, senescenza, staminali, comunicazione, infiammazione, disbiosi.')],
    h=1.35, gap=0.27)
source(s, 'Fonti: WHO, World report on ageing and health 2015 · López-Otín C et al., Cell 2023;186:243-278 · Garmany A, Terzic A, JAMA Netw Open 2024;7:e2450241')

# ===================== 2 · STRESS OSSIDATIVO E INVECCHIAMENTO =====================
s = inner('Lo stress ossidativo nell’invecchiamento', '02 · Dalla teoria dei radicali liberi all’equilibrio redox')
steps = [('1956', 'Teoria dei radicali liberi', 'Harman: l’invecchiamento deriva dall’accumulo di danni ossidativi.', CYAN),
         ('2012', 'Il limite degli antiossidanti', '78 studi, 296.707 persone: gli integratori antiossidanti non riducono la mortalità.', LILAC),
         ('Oggi', 'Eustress e distress', 'I radicali liberi sono anche segnali indispensabili: l’obiettivo è l’equilibrio, non spegnerli.', PINK)]
for i, (y, t, d, c) in enumerate(steps):
    x = 0.62 + i * 4.1
    card(s, x, 1.75, 3.8, 3.5, shadow=c)
    rect(s, x, 1.75, 3.8, 0.85, fill=NAVY)
    tb(s, x + 0.25, 1.75, 3.4, 0.85, y, size=30, font=SERIF, color=CYAN, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, x + 0.25, 2.8, 3.35, 0.8, t, size=17, bold=True, line=1.1)
    tb(s, x + 0.25, 3.6, 3.35, 1.6, d, size=13.5, color=GREY, line=1.25)
banner(s, 0.62, 5.65, 12.0, 'Ripristinare l’equilibrio redox è il razionale dell’ossigeno-ozono a basse dosi', size=14)
source(s, 'Fonti: Harman D, J Gerontol 1956;11:298-300 · Bjelakovic G et al., Cochrane Database Syst Rev 2012;CD007176 · Sies H, Jones DP, Nat Rev Mol Cell Biol 2020;21:363-383')

# ===================== 3 · ORMESI =====================
s = inner('Ormesi e precondizionamento ossidativo', '03 · Uno stress lieve che attiva le difese')
card(s, 0.62, 1.7, 5.6, 4.55, shadow=LILAC)
tb(s, 0.95, 1.9, 5.0, 0.4, 'LA CURVA ORMETICA', size=12, bold=True, spacing=1.5)
# hormesis curve: low dose protects, high dose harms
from pptx.util import Emu as _E
import math
pts = []
for k in range(41):
    xx = k / 40
    yy = 0.9 * math.sin(math.pi * min(xx / 0.62, 1)) if xx < 0.62 else -1.4 * ((xx - 0.62) / 0.38) ** 1.4
    pts.append((1.1 + xx * 4.6, 4.0 - yy))
for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
    seg_ = s.shapes.add_connector(1, Inches(xa), Inches(ya), Inches(xb), Inches(yb))
    seg_.line.color.rgb = CYAN if yb <= 4.0 else PINK; seg_.line.width = Pt(4.5)
ax = s.shapes.add_connector(1, Inches(1.1), Inches(4.0), Inches(5.8), Inches(4.0)); ax.line.color.rgb = NAVY; ax.line.width = Pt(1.5)
tb(s, 1.3, 2.55, 2.4, 0.4, 'BASSE DOSI: PROTEZIONE', size=10.5, bold=True, color=CYAN)
tb(s, 3.9, 4.9, 2.2, 0.4, 'ALTE DOSI: DANNO', size=10.5, bold=True, color=PINK)
tb(s, 0.95, 5.55, 5.0, 0.6, 'Sistemica: 10–40 µg/mL, calibrata sulla capacità antiossidante del sangue', size=12, color=GREY, line=1.15)
points(s, 6.6, 1.7, 6.1, [
    ('La fine di un dogma', 'L’ozono non è sempre tossico: a dosi calibrate viene neutralizzato dalle difese del sangue e diventa un segnale.'),
    ('Stress ossidativo lieve', 'Un breve e controllato stress ossidativo attiva Nrf2 e le risposte adattative.'),
    ('Precondizionamento', 'Il pretrattamento ripetuto protegge i tessuti da un danno ossidativo successivo, come esercizio, freddo o restrizione calorica.')],
    h=1.32, gap=0.29)
source(s, 'Fonti: Bocci V, Toxicol Appl Pharmacol 2006;216:493-504 · Bocci VA et al., J Transl Med 2011;9:66 · Sagai M, Bocci V, Med Gas Res 2011;1:29 · Viebahn-Haensler R, León Fernández OS, Int J Mol Sci 2021;22:7890')

# ===================== STUDY TEMPLATE =====================
def study_slide(title, kicker, img, badge_text, desc, pts, src, shadow=CYAN):
    """one layout for every study: PubMed card left (fixed size), study type + summary below, 3 key points right, source"""
    s = inner(title, kicker)
    bx, by, bw, bh = 0.62, 1.7, 6.3, 2.75
    card(s, bx, by, bw, bh, shadow=shadow)
    pw, ph = fit(img, bw - 0.4, bh - 0.4)
    picture(s, img, bx + (bw - pw) / 2, by + (bh - ph) / 2, pw, ph, frame=False)
    badge(s, bx, 4.75, badge_text, fill=shadow)
    tb(s, bx, 5.22, bw, 1.25, desc, size=13, color=GREY, line=1.2)
    points(s, 7.4, 1.7, SW - 7.4 - 0.62, pts, h=1.38, gap=0.22, size=12.5)
    source(s, src)
    return s


# ===================== 04 · OZONO E NRF2 =====================
study_slide('Ozono e sistema Nrf2', '04 · L’interruttore delle difese antiossidanti', 'st-malatesta.png', 'Revisione · 2024',
    'L’ozono a basse dosi agisce come “eustress”: uno stimolo benefico che attiva la risposta antiossidante della cellula, soprattutto tramite Nrf2.',
    [('Stimolo lieve', 'Basse dosi di ozono generano prodotti di ossidazione lipidica che funzionano da segnale.'),
     ('Keap1 rilascia Nrf2', 'Il segnale libera Nrf2, che entra nel nucleo della cellula.'),
     ('Geni antiossidanti', 'Aumentano HO-1, NQO1 ed enzimi del glutatione: la cellula si difende meglio.')],
    'Fonti: Malatesta M, Tabaracci G, Pellicciari C, Int J Mol Sci 2024;25:12657 · Galiè M et al., Int J Mol Sci 2019;20:4009 · Pecorelli A et al., Toxicol Appl Pharmacol 2013;267:30-40', CYAN)

# ===================== 04 · MECCANISMO D'AZIONE =====================
s = inner("Il meccanismo d'azione", '04 · Come agisce l’ozono')
tb(s, 0.62, 1.55, 7.2, 0.75, "Negli ultimi anni è cresciuto l'interesse per gli approcci integrati, con particolare attenzione all'ozonoterapia per efficacia e profilo di sicurezza.",
   size=14, color=GREY, line=1.2)
MECH = ['Azione multifattoriale: redox, antinfiammatoria e antimicrobica',
        'Effetto locale e sistemico sul microambiente tissutale',
        'Riduzione della carica batterica, virale e fungina',
        'Intervento sugli squilibri immunitari',
        'Stimola rigenerazione e riparazione cellulare',
        'Terapia primaria o complementare',
        'Supportata da evidenze in ambito funzionale e preventivo']
for i, t in enumerate(MECH):
    col, row = i % 2, i // 2
    x, y = 0.62 + col * 3.7, 2.45 + row * 1.08
    if i == 6: x, y = 0.62, 2.45 + 3 * 1.08
    w = 3.5 if i < 6 else 7.2
    card(s, x, y, w, 0.86, shadow=[CYAN, LILAC, PINK][i % 3], off=0.07)
    circle(s, x + 0.4, y + 0.43, 0.46, text=str(i + 1), size=13, fill=NAVY)
    tb(s, x + 0.78, y + 0.06, w - 0.9, 0.74, t, size=11.5, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, line=1.1)
aside(s, 'img17.png', 8.2, 2.45, SW - 0.62 - 8.2, 2.45 + 3 * 1.08 + 0.86 - 2.45, CYAN)

# ===================== 05 · GLUTATIONE, SOD, CATALASI =====================
study_slide('Glutatione, SOD e catalasi', '05 · Il dato sull’uomo anziano', 'st-leon.png', 'Studio randomizzato · 60–70 anni',
    'Anziani con malattie a eziologia ossidativa (45 pazienti): ozono per via rettale contro gruppo di controllo.',
    [('Difese', 'Regolati superossido dismutasi, catalasi e perossido di idrogeno.'),
     ('Danno e vasi', 'Arrestata la progressione del danno ossidativo; regolati i mediatori vasoattivi.'),
     ('Limiti', 'Studio piccolo e monocentrico: servono conferme su numeri più ampi.')],
    'Fonte: León Fernández OS et al., Medical ozone arrests oxidative damage progression and regulates vasoactive mediator levels in elderly patients (60–70 years). Front Physiol 2022;13:1029805', PINK)

# ===================== 06 · MITOCONDRI =====================
study_slide('Funzionalità mitocondriale ed energia', '06 · Studio sperimentale sull’invecchiamento', 'st-elsawalhi.png', 'Studio sperimentale · ratti anziani',
    'Ozono per via rettale (0,6 mg/kg) fino a 15 mesi di età, confrontato con ossigeno e con animali anziani non trattati.',
    [('Redox', 'Meno ossidazione di lipidi e proteine, meno lipofuscina; glutatione ripristinato.'),
     ('Energia', 'Attenuato il calo di ATP e del rapporto ATP/ADP legato all’età.'),
     ('Funzione', 'Migliore gestione del calcio nel cuore; Na+/K+-ATPasi ripristinata nel cervello.')],
    'Fonte: El-Sawalhi MM et al., Modulation of age-related changes in oxidative stress markers and energy status in the rat heart and hippocampus: a significant role for ozone therapy. Cell Biochem Funct 2013;31(6):518-525', LILAC)

# ===================== 07 · SENESCENZA E INFLAMMAGING =====================
study_slide('Senescenza cellulare e inflammaging', '07 · Revisione 2025', 'st-chirumbolo.png', 'Revisione · 2025',
    'Lo stato dell’arte sull’ossigeno-ozono come terapia di supporto nei disturbi legati all’invecchiamento e alla senescenza.',
    [('Inflammaging', 'Con l’età si instaura un’infiammazione cronica di basso grado, alimentata dalle cellule senescenti.'),
     ('Nrf2 su, NF-κB giù', 'L’ozono a basse dosi attiva le difese antiossidanti e riduce i segnali infiammatori.'),
     ('Da dimostrare', 'Protocolli e dosi non standardizzati: effetti sulla senescenza nell’uomo ancora da provare.')],
    'Fonti: Chirumbolo S et al., Adv Pharmacol 2025;104:417-446 · Franceschi C et al., Nat Rev Endocrinol 2018;14:576-590', PINK)

study_slide('Invecchiamento e neurodegenerazione', '07 · Revisione 2020', 'st-scassellati.png', 'Revisione · 2020',
    'L’ozono come molecola bioattiva con proprietà antiossidanti: una possibile nuova strategia nell’invecchiamento e nelle malattie neurodegenerative.',
    [('Bersagli comuni', 'Stress ossidativo, infiammazione e mitocondri: meccanismi condivisi da invecchiamento e neurodegenerazione.'),
     ('Fragilità cognitiva', 'Da qui nasce lo studio controllato italiano su ossigeno-ozono e fragilità nell’anziano.'),
     ('Da confermare', 'Evidenze soprattutto precliniche: servono studi controllati sull’uomo.')],
    'Fonte: Scassellati C et al., Ozone: a natural bioactive molecule with antioxidant property as potential new strategy in aging and in neurodegenerative disorders. Ageing Res Rev 2020;63:101138', CYAN)

# ===================== 08 · GLI STUDI =====================
study_slide('Prima o dopo l’invecchiamento?', '08 · Gli studi · sperimentale 2014', 'st-safwat.png', 'Studio sperimentale · fegato e reni',
    'Ozono per via rettale iniziato prima (dai 3 ai 15 mesi) o dopo l’invecchiamento (dai 14 ai 15 mesi).',
    [('Prima', 'Meno MDA, carbonili proteici e lipofuscina in fegato e reni.'),
     ('Dopo', 'Effetti simili ma più deboli; lipofuscina invariata.'),
     ('Il messaggio', 'Iniziare prima funziona meglio: il valore della prevenzione.')],
    'Fonte: Safwat MH, El-Sawalhi MM, Mausouf MN, Shaheen AA. Ozone ameliorates age-related oxidative stress changes in rat liver and kidney: effects of pre- and post-ageing administration. Biochemistry (Moscow) 2014;79(5):450-458', CYAN)

study_slide('Ozonoterapia in dermatologia', '08 · Gli studi · revisione 2022', 'st-machado.png', 'Revisione · 18 studi clinici',
    'Revisione di 18 studi clinici (2011–2021, 1.279 pazienti) su efficacia e sicurezza dell’ozono nelle malattie della pelle.',
    [('Condizioni trattate', 'Ulcere diabetiche e venose, dermatite atopica, ustioni, onicomicosi e altre infezioni cutanee.'),
     ('Benefici riportati', 'Azione antimicrobica, antinfiammatoria e riparativa dei tessuti.'),
     ('Sicurezza', 'Ben tollerata, con effetti avversi rari e lievi nei protocolli descritti.')],
    'Fonte: Machado AU, Contri RV. Effectiveness and Safety of Ozone Therapy for Dermatological Disorders: A Literature Review of Clinical Trials. Indian J Dermatol 2022;67(4):479', LILAC)

study_slide('Stress ossidativo e mitocondri', '08 · Gli studi · revisione sistematica 2024', 'st-viebahn.png', 'Revisione sistematica · 2024',
    'Disfunzione mitocondriale e malattie da stress ossidativo: l’ozono medicale a basse dosi come bioregolatore redox.',
    [('Problema', 'Stress ossidativo cronico e disfunzione mitocondriale sono alla base di molte malattie croniche.'),
     ('Intervento', 'L’ozono a basse dosi attiva le difese endogene (glutatione, SOD, catalasi) senza danno cellulare.'),
     ('Conclusione', 'Modulatore redox: favorisce l’equilibrio sistemico e sostiene la funzione mitocondriale.')],
    'Fonte: Viebahn-Haensler R, León Fernández OS. Mitochondrial Dysfunction, Its Oxidative Stress-Induced Pathologies and Redox Bioregulation through Low-Dose Medical Ozone: A Systematic Review. Molecules 2024;29(12):2738', PINK)

study_slide("L'ozono nella medicina integrativa", '08 · Gli studi · mappa delle evidenze 2023', 'st-serra.png', 'Mappa delle evidenze · 2023',
    'Mappa delle evidenze sull’ozono come pratica di medicina integrativa, dal dolore cronico alla terapia rigenerativa.',
    [('Obiettivo', 'Raccogliere e analizzare gli ambiti clinici in cui l’ozono è stato studiato.'),
     ('Risultato', 'Evidenze più solide per dolore muscolo-scheletrico e ferite croniche; lacune in altri ambiti.'),
     ('Conclusione', 'Terapia emergente e promettente: servono ulteriori ricerche in ambiti specifici.')],
    'Fonte: Serra MEG et al. The role of ozone treatment as integrative medicine. An evidence and gap map. Front Public Health 2023;10:1112296', CYAN)

# ===================== 09 · CAMPI DI APPLICAZIONE =====================
s = inner('I campi di applicazione', '09 · Evidenze cliniche · dove si utilizza')
tb(s, 0.62, 1.55, 6.3, 1.6, "Adattata nelle modalità di somministrazione e nei protocolli, l'ozonoterapia trova impiego in diverse aree cliniche.",
   size=16, color=NAVY, line=1.2)
FIELDS = [('Dermatologia', CYAN), ('Ortopedia e medicina fisica', LILAC), ('Ginecologia', PINK), ('Medicina estetica', CYAN), ('Medicina della longevità', LILAC)]
for i, (t, c) in enumerate(FIELDS):
    y = 2.75 + i * 0.62
    rect(s, 0.62, y, 0.5, 0.46, fill=c)
    tb(s, 0.62, y, 0.5, 0.46, str(i + 1), size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    rect(s, 1.12, y, 5.4, 0.46, fill=WHITE, line=NAVY, lw=1.5)
    tb(s, 1.3, y, 5.1, 0.46, t.upper(), size=13, bold=True, anchor=MSO_ANCHOR.MIDDLE, spacing=1)
banner(s, 0.62, 6.0, 5.9, 'Guarigione · equilibrio ossidativo · qualità di vita', size=13)
aside(s, 'img18.png', 7.15, 2.75, SW - 0.62 - 7.15, 6.55 - 2.75, PINK)

# ===================== 09 · LE AREE =====================
AREAS = [
    ('img19.png', 'Ortopedia e medicina fisica', 'Principali tecniche di somministrazione', [
        ('Infiltrazioni paravertebrali o periradicolari', "per il trattamento delle ernie discali, spesso sotto guida TC o ecografica"),
        ('Iniezioni intra-articolari', "nei casi di artrosi di ginocchio, anca e spalla"),
        ('Iniezioni sottocutanee o intramuscolari', 'sui trigger point miofasciali o nelle aree muscolari contratte')]),
    ('img20.png', 'Dermatologia', 'Quattro modalità di applicazione topica', [
        ('Ozono gassoso', "somministrato con una sacca contenente la miscela ossigeno-ozono"),
        ('Soluzioni ozonizzate', "come l'acqua ozonizzata, per lavare o irrigare le lesioni cutanee"),
        ('Creme od oli ozonizzati', 'usati come medicazione per favorire la guarigione delle ferite'),
        ('Sauna all’ozono', "per l'assorbimento transdermico dell'ozono")]),
    ('img21.png', 'Ginecologia', 'Modalità di applicazione', [
        ('Irrigazioni vaginali', 'con acqua ozonizzata'),
        ('Insufflazioni vaginali', 'con miscela ossigeno-ozono'),
        ('Ovuli o gel vaginali ozonizzati', 'nel dolore pelvico cronico e nei disturbi vulvovaginali')]),
    ('img22.png', 'Medicina estetica', 'Modalità di applicazione', [
        ('Iniezioni sottocutanee o intradermiche', 'di miscela ossigeno-ozono per migliorare il microcircolo e ridurre la cellulite'),
        ('Oli ozonizzati topici', 'su viso, collo e corpo, con effetto idratante, rigenerante e antinfiammatorio'),
        ('Ozonoterapia sistemica', 'grande autoemotrasfusione nei protocolli antiaging: prelievo, ozonizzazione e reinfusione')]),
    ('img23.png', 'Medicina della longevità', 'Principali vie di somministrazione', [
        ('Grande autoemotrasfusione', 'gold standard: un lieve stress ossidativo attiva la risposta antiossidante (SOD, catalasi, glutatione)'),
        ('Insufflazioni rettali', 'metodo non invasivo per un effetto sistemico'),
        ('Iniezioni sottocutanee', 'in punti strategici per migliorare microcircolo e ossigenazione dei tessuti')]),
]
for img, title, kick, blocks in AREAS:
    s = inner(title, '09 · ' + kick)
    n = len(blocks); gap = 0.3; w = (SW - 1.24 - gap * (n - 1)) / n
    for i, (h, t) in enumerate(blocks):
        x = 0.62 + i * (w + gap)
        card(s, x, 1.7, w, 2.45, shadow=[CYAN, LILAC, PINK, CYAN][i])
        rect(s, x, 1.7, w, 0.62, fill=NAVY)
        tb(s, x + 0.2, 1.7, 0.7, 0.62, f'0{i + 1}', size=20, bold=True, color=CYAN, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + 0.2, 2.45, w - 0.4, 0.75, h, size=15 if n < 4 else 14, bold=True, color=NAVY, line=1.1)
        tb(s, x + 0.2, 3.2, w - 0.4, 0.9, t, size=12.5, color=GREY, line=1.2)
    pw, ph = fit(img, SW - 1.24, 2.25)
    picture(s, img, (SW - pw) / 2, 4.45, pw, ph, frame=False)

# ===================== 09 · È SICURA? =====================
s = inner("L'ozonoterapia è sicura?", '09 · Il profilo di sicurezza')
card(s, 0.62, 1.65, 12.0, 1.45, shadow=CYAN)
circle(s, 1.2, 2.375, 0.75, text='✓', size=22, fill=CYAN)
tb(s, 1.8, 1.75, 10.6, 0.45, 'Secondo uno studio pubblicato su International Wound Journal (2022)', size=14, bold=True)
tb(s, 1.8, 2.2, 10.6, 0.85, "Eseguita da professionisti qualificati secondo protocolli standardizzati, l'ozonoterapia mostra un profilo di sicurezza favorevole: effetti collaterali rari, per lo più lievi e transitori (dolore locale, irritazione).",
   size=13, color=GREY, line=1.2)
# the two screenshots side by side, as in the original: the arrow in the first points to the second
IH, GAP = 3.05, 1.1
pw, ph = fit('img24-card.png', 6.0, IH); pw2, ph2 = fit('img25.png', 6.0, IH)
x1 = (SW - pw - pw2 - GAP) / 2; y1 = 3.42
picture(s, 'img24-card.png', x1, y1 + (IH - ph) / 2, pw, ph, frame=False)
picture(s, 'img25.png', x1 + pw + GAP, y1 + (IH - ph2) / 2, pw2, ph2, frame=False)
arr = rect(s, x1 + pw + 0.2, y1 + IH / 2 - 0.3, GAP - 0.4, 0.6, fill=CYAN, shape=MSO_SHAPE.RIGHT_ARROW)
source(s, 'Fonte: Ozone therapy for skin diseases: Cellular and molecular mechanisms. Int Wound J 2023;20(6):2376-2385 (online 16/12/2022). doi:10.1111/iwj.14060')


# ===================== 9 · EVIDENZE E LIMITI =====================
s = inner('Cosa sappiamo, cosa non sappiamo', '09 · Evidenze cliniche e limiti')
cols = [('Solido', 'Meccanismi', ['Ormesi a basse dosi', 'Attivazione di Nrf2', 'Aumento di glutatione, SOD, catalasi'], CYAN),
        ('Promettente', 'Studi sperimentali', ['Ratti anziani: meno danno ossidativo', 'Più energia nei tessuti', 'Meglio se iniziato prima'], LILAC),
        ('Da dimostrare', 'Nell’uomo', ['Pochi studi, piccoli', 'Nessuna prova su durata della vita', 'Servono studi controllati'], PINK)]
for i, (lvl, t, items, c) in enumerate(cols):
    x = 0.62 + i * 4.1
    card(s, x, 1.7, 3.8, 4.0, shadow=c)
    rect(s, x, 1.7, 3.8, 0.75, fill=c)
    tb(s, x + 0.25, 1.7, 3.4, 0.75, lvl.upper(), size=16, bold=True, color=NAVY, anchor=MSO_ANCHOR.MIDDLE, spacing=2)
    tb(s, x + 0.25, 2.6, 3.4, 0.5, t, size=19, font=SERIF)
    for j, it in enumerate(items):
        yy = 3.3 + j * 0.72
        circle(s, x + 0.42, yy + 0.22, 0.2, fill=c)
        tb(s, x + 0.7, yy, 2.95, 0.6, it, size=13, color=NAVY, line=1.1)
banner(s, 0.62, 6.0, 12.0, 'Ben tollerata se eseguita con protocolli standardizzati; certezza delle prove cliniche ancora bassa', size=13)
source(s, 'Fonti: Cacciatore S et al., Med Sci (Basel) 2026;14(2):289 · Chirumbolo S et al., Adv Pharmacol 2025;104:417-446')

# ===================== 10 · PROSPETTIVE =====================
s = inner('Le prospettive per la ricerca', '10 · Dove sta andando la medicina della longevità')
card(s, 0.62, 1.7, 5.9, 4.5, shadow=CYAN)
badge(s, 0.95, 1.95, 'Studio in corso · Italia', fill=CYAN)
tb(s, 0.95, 2.45, 5.3, 0.9, 'Ossigeno-ozono e fragilità cognitiva nell’anziano', size=20, font=SERIF, line=1.1)
tb(s, 0.95, 3.4, 5.3, 2.5, ['Studio randomizzato, in doppio cieco, controllato con placebo (IRCCS Fatebenefratelli, Brescia).',
                            '75 persone tra 60 e 85 anni: ossigeno-ozono contro ossigeno contro aria, per 5 settimane.',
                            'Valuta scale cliniche e biomarcatori (proteomica, metabolomica). NCT06071611.'], size=12.5, color=GREY, line=1.25)
points(s, 6.95, 1.7, SW - 6.95 - 0.62, [
    ('Protocolli', 'Standardizzare dosi, concentrazioni e vie di somministrazione.'),
    ('Studi controllati', 'Trial con placebo ed esiti funzionali: fragilità, cognizione, autonomia.'),
    ('Biomarcatori', 'Pannelli validati: difese (SOD, GSH), danno (MDA, isoprostani), infiammazione (IL-6, PCR).'),
    ('Età biologica', 'Orologi epigenetici come possibili misure di risultato.')],
    h=0.98, gap=0.18, size=12.5)
source(s, 'Fonti: Scassellati C et al., J Pers Med 2024;14(8):795 · Frijhoff J et al., Antioxid Redox Signal 2015;23:1144-1170 · Belsky DW et al., eLife 2022;11:e73420')

# ===================== COME SI PREPARA L'OZONO (video) =====================
s = inner('Come si prepara l’ossigeno-ozono', 'Dalla teoria alla pratica')
vw = 8.3; vh = vw * 9 / 16; vx = (SW - vw) / 2; vy = 1.85
rect(s, vx + 0.12, vy + 0.12, vw, vh, fill=LILAC)
if os.path.exists(os.path.join(A, 'preparazione-ozono.mp4')):
    video(s, 'preparazione-ozono.mp4', 'preparazione-ozono-poster.jpg', vx, vy, vw, vh)
else:
    placeholder(s, vx, vy, vw, vh, 'Video: preparazione dell’ossigeno-ozono', 'Spazio riservato al video')

# ===================== 17 · CONCLUSIVA =====================
s = prs.slides.add_slide(BLANK); bg(s, 'bg-conclusiva.jpg')
tb(s, 0, 6.35, SW, 0.4, 'Dott. Michele Bonaccorso  ·  Medico funzionale e della longevità', size=15, color=WHITE, align=PP_ALIGN.CENTER, spacing=1)

prs.save(OUT)
print('saved', OUT, len(prs.slides._sldIdLst), 'slides')
