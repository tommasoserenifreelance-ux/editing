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


# ===================== 1 · COPERTINA =====================
s = prs.slides.add_slide(BLANK); bg(s, 'bg-copertina.jpg')

# ===================== 2 · LO STATO DELL'ARTE (video) =====================
s = inner("Lo stato dell'arte", 'Ossigeno-ozonoterapia oggi')
vw, vh = 3.05, 3.05 * 1276 / 720
rect(s, 8.9 + 0.1, 1.45 + 0.1, vw, vh, fill=LILAC)
video(s, 'stato-arte.mp4', 'stato-arte-poster.jpg', 8.9, 1.45, vw, vh)
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
vw = 9.6; vh = vw * 9 / 16; vx = (SW - vw) / 2
rect(s, vx + 0.12, 1.55 + 0.12, vw, vh, fill=CYAN)
video(s, 'storia-ozono.mp4', 'storia-ozono-poster.jpg', vx, 1.55, vw, vh)
tb(s, vx, 1.55 + vh + 0.18, vw, 0.4, '1839  →  1857  →  1870  →  1881  →  1885  →  1886  →  1900  →  1990–2000',
   size=13, color=NAVY, bold=True, align=PP_ALIGN.CENTER, spacing=1)

# ===================== 4 · DAL 2000 AL 2025 (video PubMed) =====================
s = inner('Dal 2000 al 2025', 'L’esplosione delle evidenze')
vw = 7.9; vh = vw * 9 / 16
rect(s, 0.62 + 0.1, 1.6 + 0.1, vw, vh, fill=LILAC)
video(s, 'pubmed.mp4', 'pubmed-poster.jpg', 0.62, 1.6, vw, vh)
card(s, 8.95, 1.6, 3.75, 2.2, shadow=CYAN)
tb(s, 9.2, 1.75, 3.3, 1.9, [[('Esplosione', {'bold': True, 'size': 20})],
                            [('degli studi pubblicati su PubMed: un aumento esponenziale delle evidenze scientifiche.', {'size': 14, 'color': GREY})]], line=1.2)
for i, (t, c) in enumerate([('Dermatologia', CYAN), ('Stress ossidativo', LILAC), ('Invecchiamento vascolare', PINK), ('Medicina integrativa', CYAN)]):
    y = 4.05 + i * 0.6
    rect(s, 8.95, y, 0.14, 0.42, fill=c)
    tb(s, 9.2, y, 3.5, 0.42, t.upper(), size=12.5, bold=True, anchor=MSO_ANCHOR.MIDDLE, spacing=1)
banner(s, 0.62, 6.25, 7.9, 'Le quattro revisioni che seguono riassumono lo stato delle evidenze', size=13)

# ===================== 5–8 · GLI STUDI =====================
STUDIES = [
    ('img13.png', 'Ozonoterapia in dermatologia', 'Revisione della letteratura · studi clinici', [
        ('Condizioni trattate', 'Acne, dermatite atopica, psoriasi, ferite infette, ulcere.'),
        ('Benefici riportati', 'Azione antibatterica, antinfiammatoria e rigenerativa. Riduce prurito e carica batterica.'),
        ('Sicurezza', 'Nessun evento avverso significativo nei protocolli standardizzati. Ottima tollerabilità anche in trattamenti ripetuti.')]),
    ('img14.png', 'Stress ossidativo e mitocondri', 'Revisione sistematica', [
        ('Problema', 'Stress ossidativo cronico e disfunzione mitocondriale sono alla base di molte malattie croniche (neurodegenerative, metaboliche, autoimmuni).'),
        ('Intervento', "L'ozono a basse dosi attiva i sistemi antiossidanti endogeni (Nrf2, SOD, catalasi) senza causare danno cellulare."),
        ('Conclusione', "L'ozonoterapia agisce come modulatore redox, favorisce l'equilibrio sistemico e sostiene la funzione mitocondriale.")]),
    ('img15.png', 'Ozono e invecchiamento vascolare', 'Pazienti anziani', [
        ('Contesto', 'Pazienti anziani con malattie croniche legate allo stress ossidativo e alla disregolazione vascolare.'),
        ('Risultato', 'Riduzione significativa dei marcatori di perossidazione lipidica (MDA) e miglior tono vascolare, grazie alla regolazione di NO ed endoteline.'),
        ('Implicazione clinica', "L'ozonoterapia può rallentare l'invecchiamento vascolare e migliorare la qualità di vita del paziente geriatrico.")]),
    ('img16.png', "L'ozono nella medicina integrativa", 'Evidenze e lacune', [
        ('Obiettivo', "Raccogliere e analizzare gli ambiti di applicazione dell'ozono in medicina integrativa, dal dolore cronico alla terapia rigenerativa."),
        ('Risultato', 'Evidenze solide per dolore muscolo-scheletrico e ferite croniche. Restano lacune in oncologia e psichiatria.'),
        ('Conclusione', "L'ozono è una terapia emergente promettente, ma servono ulteriori ricerche in ambiti specifici.")]),
]
for img, title, kick, blocks in STUDIES:
    s = inner(title, 'Dal 2000 al 2025 · ' + kick)
    pw, ph = fit(img, 4.6, 4.9)
    card(s, 0.62, 1.7, pw + 0.3, ph + 0.3, shadow=LILAC)
    picture(s, img, 0.77, 1.85, pw, ph, frame=False)
    x0 = 0.62 + pw + 0.85; w = SW - x0 - 0.75
    icons = ['1', '2', '3']
    for i, (h, t) in enumerate(blocks):
        y = 1.7 + i * 1.72
        card(s, x0, y, w, 1.45, shadow=[CYAN, LILAC, PINK][i])
        circle(s, x0 + 0.5, y + 0.5, 0.56, text=icons[i], size=15, fill=[NAVY, CYAN, NAVY][i])
        tb(s, x0 + 1.0, y + 0.14, w - 1.2, 0.4, h.upper(), size=14, bold=True, color=NAVY, spacing=1.5)
        tb(s, x0 + 1.0, y + 0.52, w - 1.2, 0.9, t, size=13.5, color=GREY, line=1.2)

# ===================== 9 · MECCANISMO D'AZIONE =====================
s = inner("Il meccanismo d'azione", 'Come agisce l’ozono')
tb(s, 0.62, 1.55, 7.2, 0.75, "Negli ultimi anni è cresciuto l'interesse per gli approcci integrati, con particolare attenzione all'ozonoterapia per efficacia e profilo di sicurezza.",
   size=14, color=GREY, line=1.2)
MECH = ['Azione multifattoriale: modulazione redox, effetto antinfiammatorio e antimicrobico',
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
pw, ph = fit('img17.png', 4.6, 4.4)
card(s, 8.2, 1.7, pw + 0.3, ph + 0.3, shadow=CYAN)
picture(s, 'img17.png', 8.35, 1.85, pw, ph, frame=False)

# ===================== 10 · CAMPI DI APPLICAZIONE =====================
s = inner('I campi di applicazione', 'Dove si utilizza')
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
pw, ph = fit('img18.png', 5.5, 4.6)
card(s, 7.15, 1.75, pw + 0.3, ph + 0.3, shadow=PINK)
picture(s, 'img18.png', 7.3, 1.9, pw, ph, frame=False)

# ===================== 11–15 · LE AREE =====================
AREAS = [
    ('img19.png', 'Ortopedia e medicina fisica', 'Principali tecniche di somministrazione', [
        ('Infiltrazioni paravertebrali o periradicolari', "per il trattamento delle ernie discali, spesso sotto guida TC o ecografica"),
        ('Iniezioni intra-articolari', "nei casi di artrosi di ginocchio, anca e spalla"),
        ('Iniezioni sottocutanee o intramuscolari', 'sui trigger point miofasciali o nelle aree muscolari contratte')]),
    ('img20.png', 'Dermatologia', 'Quattro modalità di applicazione topica', [
        ('Ozono gassoso', "somministrato con una sacca contenente la miscela ossigeno-ozono"),
        ('Soluzioni ozonizzate', "come l'acqua ozonizzata, per lavare o irrigare le lesioni cutanee"),
        ('Creme od oli vegetali ozonizzati', 'usati come medicazione per favorire la guarigione delle ferite'),
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
        ('Grande autoemotrasfusione', 'gold standard: un lieve stress ossidativo attiva la risposta antiossidante (superossido dismutasi, catalasi, glutatione)'),
        ('Insufflazioni rettali', 'metodo non invasivo per un effetto sistemico'),
        ('Iniezioni sottocutanee', 'in punti strategici per migliorare microcircolo e ossigenazione dei tessuti')]),
]
for img, title, kick, blocks in AREAS:
    s = inner(title, kick)
    n = len(blocks); gap = 0.3; w = (SW - 1.24 - gap * (n - 1)) / n
    for i, (h, t) in enumerate(blocks):
        x = 0.62 + i * (w + gap)
        card(s, x, 1.7, w, 2.45, shadow=[CYAN, LILAC, PINK, CYAN][i])
        rect(s, x, 1.7, w, 0.62, fill=NAVY)
        tb(s, x + 0.2, 1.7, 0.7, 0.62, f'0{i + 1}', size=20, bold=True, color=CYAN, anchor=MSO_ANCHOR.MIDDLE)
        tb(s, x + 0.2, 2.45, w - 0.4, 0.75, h, size=15, bold=True, color=NAVY, line=1.1)
        tb(s, x + 0.2, 3.2, w - 0.4, 0.9, t, size=12.5, color=GREY, line=1.2)
    pw, ph = fit(img, SW - 1.24, 2.35)
    picture(s, img, (SW - pw) / 2, 4.45, pw, ph, frame=False)

# ===================== 16 · È SICURA? =====================
s = inner("L'ozonoterapia è sicura?", 'Il profilo di sicurezza')
card(s, 0.62, 1.7, 6.2, 3.75, shadow=CYAN)
circle(s, 1.2, 2.3, 0.75, text='✓', size=22, fill=CYAN)
tb(s, 1.8, 1.95, 4.8, 0.7, 'Secondo uno studio pubblicato su International Wound Journal', size=14, bold=True, line=1.15)
tb(s, 0.95, 2.85, 5.6, 2.5, ["L'ozonoterapia, eseguita da professionisti qualificati secondo protocolli standardizzati, mostra un profilo di sicurezza favorevole.",
                            'Gli effetti collaterali riportati sono rari, per lo più lievi e transitori (dolore locale, irritazione). Non sono stati osservati eventi avversi gravi.'],
   size=13.5, color=GREY, line=1.25)
banner(s, 0.62, 5.75, 6.2, 'Un trattamento complementare sicuro, se applicato correttamente', size=13)
pw, ph = fit('img24.png', 5.4, 2.55); picture(s, 'img24.png', 7.3 + (5.4 - pw) / 2, 1.65, pw, ph, frame=False)
pw2, ph2 = fit('img25.png', 5.4, 2.55); picture(s, 'img25.png', 7.3 + (5.4 - pw2) / 2, 4.35, pw2, ph2, frame=False)

# ===================== 17 · CONCLUSIVA =====================
s = prs.slides.add_slide(BLANK); bg(s, 'bg-conclusiva.jpg')
tb(s, 0, 6.35, SW, 0.4, 'Dott. Michele Bonaccorso  ·  Medico funzionale e della longevità', size=15, color=WHITE, align=PP_ALIGN.CENTER, spacing=1)

prs.save(OUT)
print('saved', OUT, len(prs.slides._sldIdLst), 'slides')
