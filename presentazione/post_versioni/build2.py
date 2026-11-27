"""Presentation carousel, 4 styles. Max 3 photos per carousel, no page numbers, no AI-ish filler."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2)}
@font-face{font-family:IT;font-weight:300;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-300-normal.woff2)}
@font-face{font-family:IT;font-weight:400;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-normal.woff2)}
@font-face{font-family:IT;font-weight:600;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-600-normal.woff2)}
@font-face{font-family:IT;font-weight:800;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-800-normal.woff2)}
@font-face{font-family:IT;font-weight:400;font-style:italic;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-italic.woff2)}
@font-face{font-family:Hand;src:url(node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2)}
:root{--red:#F24E24;--lime:#C6CC30;--ink:#141414;--blue:#2F8FC4;--paper:#F4F2EE}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#777}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;background:#fff;color:var(--ink);font-family:IT;margin-bottom:20px}
.grain::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.09;mix-blend-mode:multiply;z-index:20;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.t{position:absolute;left:100px;right:100px;z-index:5;letter-spacing:-.03em}
b{font-weight:800}
.r{color:var(--red)} .l{color:var(--lime)}
.cut{position:absolute;z-index:3;left:0;width:1080px}
.big{font-family:Anton;text-transform:uppercase;letter-spacing:-.005em;line-height:.93}
.hand{font-family:Hand}
/* precise hand underline / circle that wrap exactly the word */
.ul{position:relative;display:inline-block;white-space:nowrap}
.ul>svg{position:absolute;left:-1%;width:102%;bottom:-.16em;height:.28em;overflow:visible}
.ci{position:relative;display:inline-block;white-space:nowrap;margin:0 .14em}
.ci>svg{position:absolute;left:-7%;top:-22%;width:114%;height:144%;overflow:visible}
%EXTRA%
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="1" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="mask"/><feComposite in="d" in2="mask" operator="in"/></filter>
<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>
<filter id="sticker"><feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>
"""
TAIL = "</body></html>"


def UL(word, color="#F24E24", w=4):
    return (f'<span class="ul">{word}<svg viewBox="0 0 100 10" preserveAspectRatio="none">'
            f'<path d="M0.5 6.5 C 25 3, 60 8.5, 99.5 4.5" stroke="{color}" stroke-width="{w}" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span>')


def CI(word, color="#141414", w=3):
    return (f'<span class="ci">{word}<svg viewBox="0 0 100 100" preserveAspectRatio="none">'
            f'<path d="M58 6 C 88 6, 99 30, 97 52 C 95 80, 70 96, 46 95 C 20 94, 2 76, 3 50 C 4 24, 26 4, 54 5 C 66 6, 78 10, 84 16" '
            f'stroke="{color}" stroke-width="{w}" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span>')


def slide(i, cls, body):
    return f'<div class="s {cls}" id="s{i}">{body}</div>\n'


# ============================================================ 1 CERTO
CERTO_CSS = """
.full{position:absolute;inset:0;background:center/cover no-repeat}
.vig{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 40%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.84) 100%);z-index:1}
.dark{background:#121212;color:#fff}
.light{background:#F3F1EC;color:#141414}
.cb{position:absolute;left:100px;right:100px;bottom:250px;z-index:5}
.cb>div+div{margin-top:22px}
.c-t{color:#fff}
.photo .cb{text-shadow:0 2px 18px rgba(0,0,0,.3)}
.lite{font-weight:300;letter-spacing:-.025em}
.bold{font-weight:800;letter-spacing:-.04em}
.wm{font-weight:800;letter-spacing:-.05em}
.wm i{font-style:normal;color:var(--red)}
.badge{position:absolute;left:100px;bottom:96px;width:104px;height:104px;border-radius:50%;background:#fff;z-index:6;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.badge img{width:76px}
.badge::after{content:"";position:absolute;right:-5px;bottom:-5px;width:36px;height:36px;border-radius:50%;background:var(--red);border:5px solid #fff}
.light .badge{box-shadow:0 0 0 1px #e2e0da}
.light .badge::after{border-color:#F3F1EC}
.ctr .cb{top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;text-align:left}
.ctr .cb br{display:block}
.ctr .badge{left:100px}
"""


def certo():
    B = '<div class="badge"><img src="logo.png"></div>'
    def photo(i, img, inner):
        return slide(i, "photo", f'<div class="full" style="background-image:url({img})"></div><div class="vig"></div><div class="cb c-t">{inner}</div>{B}')
    def txt(i, mode, inner):
        return slide(i, mode + " ctr", f'<div class="cb">{inner}</div>{B}')
    o = ""
    o += photo(1, "f_DSC06650-2.jpg",
               '<div class="lite" style="font-size:64px;line-height:1">ci chiamiamo</div>'
               '<div class="wm" style="font-size:112px;line-height:.95;margin-top:10px">glialtrinfermieri<i>.</i></div>'
               '<div class="lite" style="font-size:46px">non è un caso.</div>')
    o += txt(2, "dark",
             '<div class="lite" style="font-size:96px;line-height:1">pensa a un<br>infermiere.</div>'
             '<div class="lite" style="font-size:48px;line-height:1.25;color:#cfcfcf">ti viene in mente un ospedale:<br><b style="color:#fff">corsie, turni, camici.</b></div>')
    o += photo(3, "f_DSC06933.jpg",
               '<div class="lite" style="font-size:64px;line-height:1.08">per anni è stato<br>il nostro mondo.</div>'
               '<div class="bold" style="font-size:64px;line-height:1.05">e ci ha insegnato <span class="l">tutto.</span></div>')
    o += txt(4, "light",
             '<div class="lite" style="font-size:54px;line-height:1.18">poi abbiamo capito che<br>questo mestiere può essere</div>'
             '<div class="wm" style="font-size:150px;line-height:.95">anche altro<i>.</i></div>')
    o += txt(5, "dark",
             '<div class="lite" style="font-size:54px">oggi lavoriamo nella</div>'
             '<div class="bold" style="font-size:96px;line-height:1">medicina rigenerativa<br>e della <span class="l">longevità.</span></div>')
    o += txt(6, "light",
             '<div class="bold" style="font-size:84px;line-height:1.05">pasquale <span class="lite">a milano.</span><br>gabriele <span class="lite">a roma.</span></div>'
             '<div class="lite" style="font-size:48px;line-height:1.25">stesso lavoro,<br><b>un altro modo di farlo.</b></div>')
    o += txt(7, "dark",
             '<div class="bold" style="font-size:80px;line-height:1.02">qui raccontiamo<br>quello che vediamo.</div>'
             '<div class="lite" style="font-size:44px;line-height:1.4;color:#cfcfcf">come funziona <b style="color:#fff">davvero</b> questo mondo.<br>cosa ci <b style="color:#fff">chiedono</b> le persone.<br>cosa impari stando accanto <b style="color:#fff">a qualcuno.</b></div>')
    o += txt(8, "light",
             '<div class="wm" style="font-size:112px;line-height:.98;white-space:nowrap">niente promesse<i>.</i><br>niente miracoli<i>.</i></div>')
    o += photo(9, "f_DSC06765.jpg",
               '<div class="lite" style="font-size:56px">solo il punto di vista di</div>'
               '<div class="bold" style="font-size:88px;line-height:1">chi ci sta dentro<br><span class="l">con le mani.</span></div>')
    o += txt(10, "dark",
             '<div class="lite" style="font-size:58px;line-height:1.15;color:#cfcfcf">non sapevi che un infermiere<br>potesse fare questo?</div>'
             '<div class="wm" style="font-size:190px;line-height:.95">appunto<i>.</i></div>')
    o += txt(11, "light",
             '<div class="lite" style="font-size:56px;line-height:1.15">se vuoi sapere quello che<br>gli altri non ti spiegano,</div>'
             '<div class="wm" style="font-size:150px;line-height:.95">seguici<i>.</i></div>'
             '<div class="bold" style="font-size:46px;color:#6b6b6b">@glialtrinfermieri</div>')
    return HEAD.replace("%EXTRA%", CERTO_CSS) + o + TAIL


# ============================================================ 2 FACTANZA
FACT_CSS = """
.blue{background:var(--blue);color:#fff}
.box{position:absolute;left:70px;background:var(--ink);color:#fff;border-radius:30px;padding:30px 30px 34px;z-index:5;box-shadow:0 16px 36px rgba(0,0,0,.22)}
.col{position:absolute;left:100px;right:100px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;z-index:5}
.col .box{position:relative;left:-30px;align-self:flex-start}
.mk{background:linear-gradient(100deg,transparent 1%,var(--lime) 3% 96%,transparent 98%);color:var(--ink);display:inline-block;line-height:1.05;padding:0 .12em;margin-left:-.12em}
.ht{filter:url(#sticker)}
.gfx{position:absolute;z-index:2}
.st{filter:drop-shadow(0 14px 22px rgba(0,0,0,.22))}
"""


def factanza():
    def s(i, body):
        return slide(i, "blue grain", body)
    o = ""
    o += s(1, '<div class="t big" style="top:150px;font-size:116px;color:#fff">Ci chiamiamo<br><span class="l">gli altri<br>infermieri.</span></div>'
              f'<div class="t hand" style="top:470px;left:104px;font-size:70px;color:#fff;letter-spacing:0">{UL("Non è un caso.", "#F24E24", 5)}</div>'
              '<img class="cut ht" src="duo.png" style="top:590px">')
    o += s(2, f'<div class="t" style="top:150px;font-size:62px;color:#fff;line-height:1.15"><b>Pensa a un infermiere.</b><br>Ti viene in mente un {CI("ospedale", "#141414", 3)}:</div>'
              '<div class="box" style="top:470px"><div class="big" style="font-size:150px">corsie,<br>turni,<br><span class="l">camici.</span></div></div>'
              '<img class="gfx st" src="g_corridoio.png" style="left:610px;top:400px;width:410px;transform:rotate(-5deg)">'
              '<img class="gfx st" src="g_camice.png" style="left:790px;top:700px;width:250px;transform:rotate(7deg);z-index:3">'
              '<img class="gfx st" src="g_turni.png" style="left:560px;top:990px;width:420px;transform:rotate(-4deg);z-index:4">')
    o += s(3, '<div class="col"><div style="font-size:64px;color:#fff;line-height:1.12;letter-spacing:-.03em">Per anni è stato<br><b>il nostro mondo.</b></div>'
              '<div class="big" style="font-size:150px;color:#fff;margin-top:40px">E ci ha<br>insegnato<br><span class="mk">tutto.</span></div></div>')
    o += s(4, '<div class="col"><div style="font-size:60px;color:#fff;line-height:1.15;letter-spacing:-.03em">Poi abbiamo capito che<br>questo mestiere</div>'
              '<div class="box" style="margin-top:30px"><div style="font-size:72px;font-weight:800;letter-spacing:-.03em;line-height:1">può essere</div></div>'
              '<div class="big" style="font-size:210px;color:#fff;margin-top:40px">anche</div>'
              f'<div class="big l" style="font-size:210px;margin-top:70px;margin-left:40px">{CI("altro.", "#141414", 4)}</div></div>')
    o += s(5, '<div class="col"><div style="font-size:60px;color:#fff;letter-spacing:-.03em">Oggi lavoriamo nella</div>'
              '<div class="box" style="margin-top:30px"><div class="big" style="font-size:132px">medicina<br><span class="l">rigenerativa</span></div>'
              '<div style="font:italic 400 44px IT;color:#bbb;margin-top:18px">e della longevità</div></div></div>')
    o += s(6, '<div class="t" style="top:150px;font-size:62px;color:#fff;line-height:1.12"><b>Pasquale</b> a Milano.<br><b>Gabriele</b> a Roma.</div>'
              '<div class="box" style="top:330px"><div style="font-size:44px;line-height:1.18;letter-spacing:-.03em">Stesso lavoro,<br><b class="l">un altro modo di farlo.</b></div></div>'
              '<img class="cut ht" src="c_DSC06703.png" style="top:540px">')
    o += s(7, '<div class="col"><div style="font-size:72px;color:#fff;line-height:1.1;letter-spacing:-.03em"><b>Qui raccontiamo<br>quello che vediamo.</b></div>'
              f'<div class="box" style="margin-top:40px;align-self:stretch;right:0"><div style="font-size:50px;line-height:1.38;letter-spacing:-.025em">Come funziona {CI("<b>davvero</b>", "#C6CC30", 3)} questo mondo.<br>Cosa ci <b class="l">chiedono</b> le persone.<br>Cosa impari stando accanto <b class="l">a qualcuno.</b></div></div></div>')
    o += s(8, '<div class="col"><div class="box"><div class="big" style="font-size:150px">Niente<br>promesse.</div></div>'
              '<div class="big" style="font-size:190px;color:#fff;margin-top:50px">Niente<br><span class="mk">miracoli.</span></div></div>')
    o += s(9, '<div class="col"><div style="font-size:70px;color:#fff;letter-spacing:-.03em">Solo il punto di vista di</div>'
              '<div class="box" style="margin-top:30px"><div class="big" style="font-size:132px">chi ci sta dentro<br><span class="l">con le mani.</span></div></div></div>')
    o += s(10, '<div class="t" style="top:150px;font-size:58px;color:#fff;line-height:1.12">Non sapevi che un infermiere potesse fare <b>questo?</b></div>'
               '<div class="t big" style="top:320px;font-size:150px"><span class="mk">Appunto.</span></div>'
               '<img class="cut ht" src="c_DSC06700.png" style="top:540px">')
    o += s(11, '<div class="col"><div style="font-size:62px;color:#fff;line-height:1.15;letter-spacing:-.03em">Se vuoi sapere quello che<br>gli altri non ti spiegano,</div>'
               f'<div class="big" style="font-size:240px;color:#fff;margin-top:30px">{UL("seguici.", "#F24E24", 7)}</div>'
               '<div class="box" style="margin-top:60px"><div style="font-size:50px;font-weight:800;letter-spacing:-.02em">@glialtrinfermieri</div></div></div>'
               '<img src="logo.png" style="position:absolute;right:100px;bottom:110px;width:190px;background:#fff;border-radius:50%;padding:28px 22px;z-index:5">')
    return HEAD.replace("%EXTRA%", FACT_CSS) + o + TAIL


# ============================================================ 3 THEIA
THEIA_CSS = """
.w{background:#FAFAF8}
.tx{font-size:60px;line-height:1.14;letter-spacing:-.035em}
.col{position:absolute;left:100px;right:100px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;z-index:5}
.col>div+div{margin-top:56px}
.gfx{position:absolute;z-index:2}
.st{filter:drop-shadow(0 14px 22px rgba(0,0,0,.22))}
"""


def theia():
    def s(i, body):
        return slide(i, "w", body)
    o = ""
    o += s(1, '<div class="t tx" style="top:150px;font-size:76px;line-height:1.06"><b>Ci chiamiamo <span class="r">gli altri infermieri</span>.</b></div>'
              '<div class="t tx" style="top:350px">Non è un caso.</div><img class="cut" src="duo.png" style="top:520px">')
    o += s(2, '<img class="gfx st" src="g_corridoio.png" style="left:60px;bottom:90px;width:400px;transform:rotate(-5deg)">'
              '<img class="gfx st" src="g_camice.png" style="left:420px;bottom:60px;width:250px;transform:rotate(4deg);z-index:3">'
              '<img class="gfx st" src="g_turni.png" style="right:50px;bottom:110px;width:390px;transform:rotate(6deg)">'
              '<div class="col" style="bottom:460px"><div class="tx"><b>Pensa a un infermiere.</b></div>'
              '<div class="tx">Ti viene in mente un <b class="r">ospedale</b>: corsie, turni, camici.</div>'
              f'<div class="tx">Per anni è stato {UL("<b>il nostro mondo</b>", "#F24E24", 5)}.<br>E ci ha insegnato <b class="r">tutto</b>.</div></div>')
    o += s(3, '<div class="col"><div class="tx">Poi abbiamo capito che questo mestiere può essere</div>'
              f'<div style="font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:1" class="r">{UL("anche altro.", "#141414", 6)}</div>'
              '<div class="tx">Oggi lavoriamo nella <b>medicina rigenerativa</b> e della <b class="r">longevità</b>.</div></div>')
    o += s(4, '<div class="t tx" style="top:150px"><b>Pasquale</b> a <b class="r">Milano</b>.<br><b>Gabriele</b> a <b class="r">Roma</b>.</div>'
              '<div class="t tx" style="top:320px;font-size:52px">Stesso lavoro, <b>un altro modo di farlo</b>.</div>'
              '<img class="cut" src="c_DSC06719.png" style="top:500px">')
    o += s(5, f'<div class="col"><div class="tx" style="font-size:72px"><b>Qui raccontiamo quello che <span class="r">{UL("vediamo", "#F24E24", 5)}</span>.</b></div>'
              '<div class="tx" style="font-size:56px;line-height:1.22">Come funziona <b>davvero</b> questo mondo.<br><br>Cosa ci <b>chiedono</b> le persone.<br><br>Cosa impari stando accanto <b class="r">a qualcuno.</b></div></div>')
    o += s(6, '<div class="col"><div style="font-size:124px;font-weight:800;letter-spacing:-.055em;line-height:1">Niente promesse.<br><span class="r">Niente miracoli.</span></div>'
              f'<div class="tx">Solo il punto di vista di chi ci sta dentro <b class="r">{UL("con le mani", "#F24E24", 5)}</b>.</div></div>')
    o += s(7, '<div class="t tx" style="top:150px;font-size:54px">Non sapevi che un infermiere potesse fare <b>questo?</b></div>'
              '<div class="t" style="top:300px;font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:1">Appunto.</div>'
              '<img class="cut" src="c_DSC06667.png" style="top:520px">')
    o += s(8, '<div class="col"><div class="tx">Se vuoi sapere quello che gli altri non ti spiegano,</div>'
              f'<div style="font-size:170px;font-weight:800;letter-spacing:-.06em;line-height:1" class="r">{UL("seguici.", "#141414", 6)}</div>'
              '<div class="tx"><b>@glialtrinfermieri</b></div></div>'
              '<img src="logo.png" style="position:absolute;left:100px;bottom:120px;width:150px;z-index:5">')
    return HEAD.replace("%EXTRA%", THEIA_CSS) + o + TAIL


# ============================================================ 4 PICCOLI MONDI
PM_CSS = """.paper{background:var(--paper)}
.logo{position:absolute;left:50%;transform:translateX(-50%);z-index:6}"""
HOSP = """<svg style="position:absolute;left:120px;top:110px;z-index:2" width="840" height="640" viewBox="0 0 840 640" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M230 560 L230 230 L560 230 L560 560 Z" stroke="#2F8FC4" stroke-width="16"/><path d="M236 566 L226 236 L566 226 L556 560" stroke="#2F8FC4" stroke-width="7" opacity=".7"/>
<path d="M360 300 h70 M395 265 v70" stroke="#F24E24" stroke-width="26"/><path d="M270 400h60v60h-60zM460 400h60v60h-60zM360 470h70v90h-70z" stroke="#2F8FC4" stroke-width="10"/>
<circle cx="690" cy="180" r="85" stroke="#F24E24" stroke-width="14"/><path d="M690 180 V120 M690 180 L735 205" stroke="#F24E24" stroke-width="12"/>
<path d="M90 140c0 120 40 170 90 170s70-60 70-120" stroke="#F24E24" stroke-width="12"/><circle cx="180" cy="420" r="34" stroke="#C6CC30" stroke-width="14"/><path d="M180 310 v76" stroke="#F24E24" stroke-width="10"/></g></svg>"""
TREE = """<svg style="position:absolute;left:250px;top:120px;z-index:2" width="580" height="560" viewBox="0 0 580 560" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M290 540 C 280 440, 300 380, 290 300" stroke="#8a5a2b" stroke-width="22"/><path d="M290 380 C 240 340, 200 330, 170 300 M292 360 C 340 330, 380 320, 410 290" stroke="#8a5a2b" stroke-width="12"/>
<path d="M290 300 C 150 320, 80 220, 140 150 C 140 70, 250 40, 300 80 C 360 30, 470 70, 450 160 C 500 230, 420 320, 330 300" stroke="#C6CC30" stroke-width="20"/>
<path d="M160 200 C 200 140, 250 230, 300 170 M260 120 C 300 160, 360 110, 400 170" stroke="#C6CC30" stroke-width="12" opacity=".8"/>
<path d="M390 160 C 470 150, 500 240, 440 290 C 400 310, 380 260, 395 220" stroke="#F24E24" stroke-width="18"/><path d="M120 545 C 260 525, 380 530, 470 545" stroke="#2F8FC4" stroke-width="12"/></g></svg>"""
FLOW = """<svg style="position:absolute;left:%dpx;top:%dpx;z-index:2" width="220" height="220" viewBox="0 0 260 260" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke="%s" stroke-width="11"><circle cx="130" cy="130" r="26"/><path d="M130 70c30-40 70-10 30 30M190 120c45-5 45 50 0 45M150 190c10 45-45 50-45 5M75 150c-45 10-50-45-5-45M85 85c-20-45 40-55 45-15"/></g></svg>"""
ARROW = """<svg style="position:absolute;left:500px;top:%dpx;z-index:4" width="80" height="140" viewBox="0 0 80 140" filter="url(#rough)"><path d="M36 6 C 54 40, 18 80, 42 128 M42 128 L20 98 M42 128 L64 102" stroke="#141414" stroke-width="5" fill="none" stroke-linecap="round"/></svg>"""


def piccolimondi():
    def s(i, body):
        return slide(i, "paper grain", body)
    big = 'font-size:104px;line-height:.98;letter-spacing:-.05em;font-weight:600'
    o = ""
    o += s(1, '<img class="logo" src="logo.png" style="top:60px;width:110px">'
              '<div class="t" style="top:200px;text-align:center;font-size:66px;font-weight:600;letter-spacing:-.045em;line-height:1">Ci chiamiamo<br>gli altri infermieri.</div>'
              + ARROW % 350 + FLOW % (40, 320, "#2F8FC4") +
              '<img class="cut" src="duo.png" style="top:560px">'
              '<div class="hand" style="position:absolute;right:60px;top:380px;font-size:62px;color:var(--red);transform:rotate(-6deg);z-index:5">non è un caso.</div>')
    o += s(2, HOSP + f'<div class="t" style="top:820px;{big}">Pensa a un<br>infermiere.</div>'
              '<div class="t" style="top:1060px;font-size:50px;line-height:1.15">Ti viene in mente un ospedale:<br><b>corsie, turni, camici.</b></div>')
    o += s(3, FLOW % (760, 160, "#C6CC30") + f'<div class="t" style="top:640px;{big}">Per anni è stato il nostro mondo.</div>'
              '<div class="t" style="top:1000px;font-size:58px">E ci ha insegnato <b>tutto.</b></div>')
    o += s(4, '<svg style="position:absolute;left:120px;top:140px;z-index:2" width="840" height="520" viewBox="0 0 840 520" filter="url(#crayon)"><g fill="none" stroke-linecap="round"><path d="M80 420 C 220 120, 420 460, 560 160 S 760 120, 800 60" stroke="#F24E24" stroke-width="14"/><path d="M760 40 l45 15 -25 40" stroke="#F24E24" stroke-width="14"/></g></svg>'
              f'<div class="t" style="top:720px;font-size:52px;line-height:1.15">Poi abbiamo capito che questo mestiere può essere</div><div class="t" style="top:900px;{big};font-size:150px">anche altro.</div>')
    o += s(5, FLOW % (110, 180, "#C6CC30") + FLOW % (740, 300, "#2F8FC4") +
              f'<div class="t" style="top:700px;font-size:52px">Oggi lavoriamo nella</div><div class="t" style="top:790px;{big}">medicina rigenerativa e della longevità.</div>')
    o += s(6, '<div class="t" style="top:110px;text-align:center;font-size:74px;font-weight:600;letter-spacing:-.045em;line-height:1">Pasquale a Milano.<br>Gabriele a Roma.</div>'
              + ARROW % 290 +
              '<img class="cut" src="c_DSC06651.png" style="top:520px">'
              '<div class="hand" style="position:absolute;left:50px;top:330px;font-size:58px;color:var(--red);transform:rotate(-6deg);z-index:5;line-height:1">stesso lavoro,</div>'
              '<div class="hand" style="position:absolute;right:50px;top:310px;font-size:58px;color:var(--red);transform:rotate(5deg);z-index:5;line-height:1;text-align:right">un altro modo<br>di farlo.</div>')
    o += s(7, f'<div class="t" style="top:180px;{big};font-size:90px">Qui raccontiamo quello che vediamo.</div>'
              '<div class="t" style="top:560px;font-size:54px;line-height:1.25">Come funziona davvero questo mondo.<br><br>Cosa ci chiedono le persone.<br><br>Cosa impari stando accanto <b>a qualcuno.</b></div>'
              + FLOW % (790, 1080, "#F24E24"))
    o += s(8, '<svg style="position:absolute;left:200px;top:140px;z-index:2" width="680" height="520" viewBox="0 0 680 520" filter="url(#crayon)"><g fill="none" stroke-linecap="round"><path d="M340 60 L385 200 L530 200 L412 285 L458 425 L340 340 L222 425 L268 285 L150 200 L295 200 Z" stroke="#C6CC30" stroke-width="14" stroke-linejoin="round"/><path d="M90 470 L600 60" stroke="#F24E24" stroke-width="18"/></g></svg>'
              f'<div class="t" style="top:760px;{big};font-size:130px">Niente promesse.<br>Niente miracoli.</div>')
    o += s(9, '<svg style="position:absolute;left:300px;top:150px;z-index:2" width="480" height="500" viewBox="0 0 480 500" filter="url(#crayon)"><g fill="none" stroke="#F24E24" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"><path d="M140 470c-60-90-40-180 10-250 18-30 50-14 42 18l-18 80 110-160c18-26 52-8 40 22l-60 116 90-90c22-22 52 4 30 30l-90 100 66-44c26-18 48 14 26 36-90 90-150 150-246 142z"/></g></svg>'
              f'<div class="t" style="top:760px;font-size:56px">Solo il punto di vista di</div><div class="t" style="top:860px;{big};font-size:130px">chi ci sta dentro con le mani.</div>')
    o += s(10, TREE + '<div class="t" style="top:760px;font-size:62px;line-height:1.1">Non sapevi che un infermiere potesse fare questo?</div>'
               '<div class="t" style="top:960px;font-size:150px;font-weight:600;letter-spacing:-.05em;line-height:1">Appunto.</div>'
               '<img class="logo" src="logo.png" style="bottom:70px;width:120px">')
    o += s(11, TREE.replace('left:250px;top:120px','left:330px;top:150px').replace('width="580" height="560"','width="420" height="405"') +
               '<div class="t" style="top:640px;font-size:58px;line-height:1.15">Se vuoi sapere quello che gli altri non ti spiegano,</div>'
               f'<div class="t" style="top:820px;{big};font-size:170px">seguici.</div>'
               '<div class="t hand" style="top:1020px;font-size:64px;color:var(--red);letter-spacing:0">@glialtrinfermieri</div>'
               '<img class="logo" src="logo.png" style="bottom:70px;width:120px">')
    return HEAD.replace("%EXTRA%", PM_CSS) + o + TAIL


if __name__ == "__main__":
    for name, fn in [("certo", certo), ("factanza", factanza), ("theia", theia), ("piccolimondi", piccolimondi)]:
        open(os.path.join(HERE, name + ".html"), "w").write(fn())
    print("ok")
