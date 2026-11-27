"""Generate the presentation carousel in 4 styles (certo, factanza, theia, piccolimondi)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2)}
@font-face{font-family:IT;font-weight:200;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-200-normal.woff2)}
@font-face{font-family:IT;font-weight:300;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-300-normal.woff2)}
@font-face{font-family:IT;font-weight:400;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-normal.woff2)}
@font-face{font-family:IT;font-weight:600;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-600-normal.woff2)}
@font-face{font-family:IT;font-weight:800;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-800-normal.woff2)}
@font-face{font-family:IT;font-weight:400;font-style:italic;src:url(node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-italic.woff2)}
@font-face{font-family:Hand;src:url(node_modules/@fontsource/caveat/files/caveat-latin-700-normal.woff2)}
:root{--red:#EF4122;--lime:#C9C63B;--ink:#141414;--blue:#2F8FC4;--paper:#F4F2EE}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#777}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;background:#fff;color:var(--ink);font-family:IT;margin-bottom:20px}
.grain::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.10;mix-blend-mode:multiply;z-index:20;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.t{position:absolute;left:100px;right:100px;z-index:5;letter-spacing:-.03em}
b{font-weight:800}
.r{color:var(--red)} .l{color:var(--lime)}
svg.sc{position:absolute;pointer-events:none;z-index:4}
.num{position:absolute;top:78px;right:80px;font:600 22px IT;z-index:6}
.pill{position:absolute;top:70px;left:80px;display:flex;align-items:center;gap:14px;background:var(--ink);color:#fff;border-radius:40px;padding:12px 26px 12px 14px;font:600 22px IT;letter-spacing:.18em;z-index:6}
.pill img{width:40px;height:35px}
.pill.w{background:#fff;color:var(--ink)}
.cut{position:absolute;z-index:3}
.big{font-family:Anton;text-transform:uppercase;letter-spacing:-.005em;line-height:.93}
.hand{font-family:Hand}
%EXTRA%
</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="1" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="mask"/><feComposite in="d" in2="mask" operator="in"/></filter>
<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>
<filter id="sticker"><feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>
"""
TAIL = "</body></html>"

# ------------------------------------------------------------------ CERTO
CERTO_CSS = """
.full{position:absolute;inset:0;background:center/cover no-repeat}
.vig{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 42%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.82) 100%);z-index:1}
.c-t{color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}
.lite{font-weight:300;letter-spacing:-.02em}
.wm{font-weight:800;letter-spacing:-.045em}
.wm i{font-style:normal;color:var(--red)}
.badge{position:absolute;left:70px;bottom:70px;width:120px;height:120px;border-radius:50%;background:#fff;z-index:6;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.badge img{width:86px}
.badge::after{content:"";position:absolute;right:-6px;bottom:-6px;width:42px;height:42px;border-radius:50%;background:var(--red);border:5px solid #fff}
.cnum{position:absolute;top:70px;right:70px;z-index:6;background:rgba(0,0,0,.35);color:#fff;border-radius:30px;padding:10px 20px;font:600 24px IT}
"""


def certo():
    def sl(i, img, body, badge=True, extra=""):
        b = '<div class="badge"><img src="logo.png"></div>' if badge else ""
        return (f'<div class="s" id="s{i}"><div class="full" style="background-image:url({img})"></div><div class="vig"></div>'
                f'<div class="cnum">{i}/10</div>{body}{b}{extra}</div>\n')
    o = ""
    o += sl(1, "f_DSC06650-2.jpg",
            '<div class="t c-t lite" style="top:930px;font-size:66px">ci chiamiamo</div>'
            '<div class="t c-t wm" style="top:1005px;font-size:112px;line-height:1">glialtrinfermieri<i>.</i></div>'
            '<div class="t c-t lite" style="top:1135px;left:300px;font-size:46px">non è un caso.</div>', badge=False)
    o += sl(2, "f_DSC06527.jpg",
            '<div class="t c-t lite" style="top:820px;font-size:72px;line-height:1.08">pensa a un<br>infermiere.</div>'
            '<div class="t c-t lite" style="top:1010px;left:300px;font-size:44px;line-height:1.25">ti viene in mente un ospedale:<br><b>corsie, turni, camici.</b></div>')
    o += sl(3, "f_DSC06933.jpg",
            '<div class="t c-t lite" style="top:900px;left:300px;font-size:62px;line-height:1.1">per anni è stato<br>il nostro mondo.</div>'
            '<div class="t c-t" style="top:1060px;left:300px;font-size:62px;font-weight:800;letter-spacing:-.035em">e ci ha insegnato <span class="l">tutto.</span></div>')
    o += sl(4, "f_DSC06651.jpg",
            '<div class="t c-t lite" style="top:860px;left:300px;font-size:52px;line-height:1.15">poi abbiamo capito che<br>questo mestiere può essere</div>'
            '<div class="t c-t wm" style="top:1000px;left:300px;font-size:120px;line-height:1">anche altro<i>.</i></div>')
    o += sl(5, "f_DSC07001.jpg",
            '<div class="t c-t lite" style="top:880px;left:300px;font-size:52px">oggi lavoriamo nella</div>'
            '<div class="t c-t" style="top:950px;left:300px;font-size:70px;font-weight:800;line-height:1.02;letter-spacing:-.04em">medicina rigenerativa<br>e della <span class="l">longevità.</span></div>')
    o += sl(6, "f_DSC06658.jpg",
            '<div class="t c-t" style="top:880px;left:300px;font-size:64px;line-height:1.08;font-weight:800;letter-spacing:-.04em">pasquale <span class="lite">a milano.</span><br>gabriele <span class="lite">a roma.</span></div>'
            '<div class="t c-t lite" style="top:1060px;left:300px;font-size:44px;line-height:1.2">stesso lavoro,<br><b>un altro modo di farlo.</b></div>')
    o += sl(7, "f_DSC06703.jpg",
            '<div class="t c-t" style="top:740px;left:300px;font-size:58px;font-weight:800;letter-spacing:-.04em;line-height:1.05">qui raccontiamo<br>quello che vediamo.</div>'
            '<div class="t c-t lite" style="top:900px;left:300px;font-size:38px;line-height:1.35">come funziona <b>davvero</b> questo mondo.<br>cosa ci <b>chiedono</b> le persone.<br>cosa impari stando accanto a qualcuno<br><b class="l">per mezz\'ora.</b></div>')
    o += sl(8, "f_DSC06834.jpg",
            '<div class="t c-t wm" style="top:900px;left:300px;font-size:96px;line-height:1">niente promesse<i>.</i><br>niente miracoli<i>.</i></div>')
    o += sl(9, "f_DSC07113.jpg",
            '<div class="t c-t lite" style="top:940px;left:300px;font-size:52px">solo il punto di vista di</div>'
            '<div class="t c-t" style="top:1010px;left:300px;font-size:72px;font-weight:800;line-height:1.02;letter-spacing:-.04em">chi ci sta dentro<br><span class="l">con le mani.</span></div>')
    o += sl(10, "f_DSC06650-2.jpg",
            '<div class="t c-t lite" style="top:850px;left:300px;font-size:52px;line-height:1.15">non sapevi che un infermiere<br>potesse fare questo?</div>'
            '<div class="t c-t wm" style="top:1000px;left:300px;font-size:140px;line-height:1;white-space:nowrap">appunto<i>.</i></div>')
    return HEAD.replace("%EXTRA%", CERTO_CSS) + o + TAIL


# ------------------------------------------------------------------ FACTANZA
FACT_CSS = """
.blue{background:var(--blue);color:#fff}
.box{background:var(--ink);color:#fff;position:absolute;left:0;z-index:5;box-shadow:0 18px 40px rgba(0,0,0,.25)}
.mk{background:linear-gradient(100deg,transparent 1%,rgba(201,198,59,.9) 3% 96%,transparent 98%);padding:0 .08em}
.tag{position:absolute;top:66px;right:80px;text-align:right;z-index:6;font:400 30px IT;line-height:1.1;color:var(--ink)}
.tag .d{display:inline-block;background:var(--lime);font:italic 400 24px IT;padding:4px 12px;margin-bottom:8px}
.ht{filter:url(#sticker)}
"""
SCRIB = ['<svg class="sc" style="left:-40px;top:520px" width="260" height="360" viewBox="0 0 260 360"><path d="M10 10 C 160 60, 40 160, 200 210 S 60 320, 240 350" stroke="#141414" stroke-width="3" fill="none"/></svg>',
         '<svg class="sc" style="right:30px;top:140px" width="200" height="200" viewBox="0 0 200 200"><g stroke="#141414" stroke-width="2.5" fill="none"><path d="M30 100c20-60 120-70 140-10s-60 90-100 60-20-90 40-80 70 60 20 80-60-20-30-40"/></g></svg>',
         '<svg class="sc" style="right:30px;bottom:30px" width="260" height="260" viewBox="0 0 260 260"><g stroke="#141414" stroke-width="2" fill="none"><path d="M20 240c40-40 20-90 70-110s60 40 100 10 20-90 60-120"/><path d="M40 250c40-40 30-80 70-100s70 30 110 0"/></g></svg>']


def factanza():
    P = '<div class="pill w"><img src="logo.png">GLIALTRINFERMIERI</div>'
    def sl(i, body, sc=0):
        return f'<div class="s blue grain" id="s{i}">{P}<div class="num" style="color:rgba(255,255,255,.8)">{i}/10</div>{SCRIB[sc % 3]}{body}</div>\n'
    o = ""
    o += ('<div class="s blue grain" id="s1">' + P + '<div class="tag"><span class="d">piacere,</span><br><span style="color:#fff">chi siamo</span></div>'
          '<div class="t big" style="top:170px;font-size:112px;color:#fff">Ci chiamiamo<br><span class="l">gli altri<br>infermieri.</span></div>'
          '<div class="hand" style="position:absolute;right:70px;top:300px;font-size:76px;color:#fff;transform:rotate(-6deg);z-index:5">Non è un caso.</div>'
          '<svg class="sc" style="right:70px;top:385px" width="380" height="50" viewBox="0 0 380 50"><path d="M5 34 C 100 8, 210 46, 375 18" stroke="#EF4122" stroke-width="8" fill="none" stroke-linecap="round"/></svg>'
          '<img class="cut ht" src="duo.png" style="left:0;width:1080px;top:520px"></div>\n')
    o += sl(2, '<div class="t" style="top:300px;font-size:62px;color:#fff;line-height:1.12"><b>Pensa a un infermiere.</b><br>Ti viene in mente un ospedale:</div>'
               '<div class="box" style="top:560px;right:300px;padding:40px 100px"><div class="big" style="font-size:140px">corsie,<br>turni,<br><span class="l">camici.</span></div></div>', 1)
    o += sl(3, '<div class="t" style="top:320px;font-size:64px;color:#fff;line-height:1.1">Per anni è stato<br><b>il nostro mondo.</b></div>'
               '<div class="t big" style="top:600px;font-size:160px;color:#fff">E ci ha<br>insegnato</div><div class="t big" style="top:920px;font-size:160px"><span class="mk" style="color:var(--ink);display:inline-block;line-height:1.05;padding:0 20px">tutto.</span></div>', 2)
    o += sl(4, '<div class="t" style="top:300px;font-size:58px;color:#fff;line-height:1.15">Poi abbiamo capito che<br>questo mestiere</div>'
               '<div class="box" style="top:500px;right:280px;padding:40px 100px"><div style="font-size:72px;font-weight:800;letter-spacing:-.03em">può essere</div></div>'
               '<div class="t big" style="top:760px;font-size:230px;color:#fff">anche<br><span class="l">altro.</span></div>', 0)
    o += sl(5, '<div class="t" style="top:300px;font-size:60px;color:#fff">Oggi lavoriamo nella</div>'
               '<div class="box" style="top:420px;right:120px;padding:44px 100px"><div class="big" style="font-size:130px">medicina<br><span class="l">rigenerativa</span></div><div style="font:italic 400 44px IT;color:#bbb;margin-top:14px">- e della longevità -</div></div>', 1)
    o += ('<div class="s blue grain" id="s6">' + P + '<div class="num" style="color:rgba(255,255,255,.8)">6/10</div>'
          '<div class="t" style="top:170px;font-size:62px;color:#fff;line-height:1.1"><b>Pasquale</b> a Milano.<br><b>Gabriele</b> a Roma.</div>'
          '<div class="box" style="top:340px;right:380px;padding:26px 100px"><div style="font-size:44px;line-height:1.15;letter-spacing:-.03em">Stesso lavoro,<br><b class="l">un altro modo di farlo.</b></div></div>'
          '<img class="cut ht" src="duo.png" style="left:0;width:1080px;top:540px"></div>\n')
    o += sl(7, '<div class="t" style="top:260px;font-size:70px;color:#fff;line-height:1.1"><b>Qui raccontiamo<br>quello che vediamo.</b></div>'
               '<div class="box" style="top:560px;right:100px;padding:46px 100px"><div style="font-size:50px;line-height:1.3;letter-spacing:-.025em">Come funziona <b class="l">davvero</b> questo mondo.<br>Cosa ci <b class="l">chiedono</b> le persone.<br>Cosa impari stando accanto a qualcuno <b class="l">per mezz\'ora.</b></div></div>', 0)
    o += sl(8, '<div class="box" style="top:300px;right:120px;padding:50px 100px"><div class="big" style="font-size:150px">Niente<br>promesse.</div></div>'
               '<div class="t big" style="top:740px;font-size:190px;color:#fff">Niente</div><div class="t big" style="top:940px;font-size:190px"><span class="mk" style="color:var(--ink);display:inline-block;line-height:1.05;padding:0 20px">miracoli.</span></div>', 1)
    o += sl(9, '<div class="t" style="top:320px;font-size:70px;color:#fff">Solo il punto di vista di</div>'
               '<div class="box" style="top:520px;right:80px;padding:50px 100px"><div class="big" style="font-size:132px">chi ci sta dentro<br><span class="l">con le mani.</span></div></div>', 2)
    o += ('<div class="s blue grain" id="s10">' + P + '<div class="num" style="color:rgba(255,255,255,.8)">10/10</div>'
          '<div class="t" style="top:170px;font-size:58px;color:#fff;line-height:1.12">Non sapevi che un infermiere potesse fare <b>questo?</b></div>'
          '<div class="t big" style="top:330px;font-size:150px"><span class="mk" style="color:var(--ink);display:inline-block;line-height:1.05;padding:0 20px">Appunto.</span></div>'
          + '<img class="cut ht" src="duo.png" style="left:0;width:1080px;top:540px"></div>\n')
    return HEAD.replace("%EXTRA%", FACT_CSS) + o + TAIL


# ------------------------------------------------------------------ THEIA
THEIA_CSS = """
.w{background:#FAFAF8}
.tx{font-size:60px;line-height:1.14;letter-spacing:-.035em}
.line{position:absolute;left:330px;width:420px;height:20px;z-index:4}
"""
LINE = '<svg class="sc" style="left:330px;top:%dpx" width="420" height="20" viewBox="0 0 420 20"><path d="M5 12 C 120 4, 300 16, 415 8" stroke="#EF4122" stroke-width="5" fill="none" stroke-linecap="round"/></svg>'


def theia():
    P = '<div class="pill"><img src="logo.png">GLIALTRINFERMIERI</div>'
    def sl(i, body):
        return f'<div class="s w" id="s{i}">{P}<div class="num" style="color:#999">{i}/7</div>{body}</div>\n'
    o = ""
    o += sl(1, '<div class="t tx" style="top:200px;font-size:74px;line-height:1.08"><b>Ci chiamiamo <span class="r">gli altri infermieri</span>.</b></div>'
               '<div class="t tx" style="top:400px">Non è un caso.</div><img class="cut" src="duo.png" style="left:0;width:1080px;top:520px">')
    o += sl(2, '<div class="t tx" style="top:290px"><b>Pensa a un infermiere.</b></div>'
               '<div class="t tx" style="top:440px">Ti viene in mente un <b class="r">ospedale</b>: corsie, turni, camici.</div>' + LINE % 720 +
               '<div class="t tx" style="top:820px">Per anni è stato <b>il nostro mondo</b>.<br>E ci ha insegnato <b class="r">tutto</b>.</div>')
    o += sl(3, '<div class="t tx" style="top:300px">Poi abbiamo capito che questo mestiere può essere</div>'
               '<div class="t" style="top:480px;font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:1"><span class="r">anche altro.</span></div>'
               + LINE % 720 + '<div class="t tx" style="top:820px">Oggi lavoriamo nella <b>medicina rigenerativa</b> e della <b class="r">longevità</b>.</div>')
    o += sl(4, '<div class="t tx" style="top:180px;right:120px"><b>Pasquale</b> a <b class="r">Milano</b>.<br><b>Gabriele</b> a <b class="r">Roma</b>.</div>'
               '<div class="t tx" style="top:350px;font-size:52px">Stesso lavoro, <b>un altro modo di farlo</b>.</div><img class="cut" src="duo.png" style="left:0;width:1080px;top:540px">')
    o += sl(5, '<div class="t tx" style="top:270px;font-size:70px"><b>Qui raccontiamo quello che <span class="r">vediamo</span>.</b></div>' + LINE % 520 +
               '<div class="t tx" style="top:620px;font-size:56px;line-height:1.22">Come funziona <b>davvero</b> questo mondo.<br><br>Cosa ci <b>chiedono</b> le persone.<br><br>Cosa impari stando accanto a qualcuno <b class="r">per mezz\'ora.</b></div>')
    o += sl(6, '<div class="t" style="top:340px;font-size:120px;font-weight:800;letter-spacing:-.055em;line-height:1">Niente promesse.<br><span class="r">Niente miracoli.</span></div>'
               + LINE % 760 + '<div class="t tx" style="top:860px">Solo il punto di vista di chi ci sta dentro <b class="r">con le mani</b>.</div>')
    o += sl(7, '<div class="t tx" style="top:180px;font-size:54px">Non sapevi che un infermiere potesse fare <b>questo?</b></div>'
               '<div class="t" style="top:330px;font-size:150px;font-weight:800;letter-spacing:-.06em;line-height:1;white-space:nowrap">Appunto.</div><img class="cut" src="duo.png" style="left:0;width:1080px;top:540px">')
    return HEAD.replace("%EXTRA%", THEIA_CSS) + o + TAIL


# ------------------------------------------------------------------ PICCOLI MONDI
PM_CSS = """.paper{background:var(--paper)}"""
HOSP = """<svg class="sc" style="left:120px;top:110px" width="840" height="640" viewBox="0 0 840 640" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M230 560 L230 230 L560 230 L560 560 Z" stroke="#2F8FC4" stroke-width="16"/><path d="M236 566 L226 236 L566 226 L556 560" stroke="#2F8FC4" stroke-width="7" opacity=".7"/>
<path d="M360 300 h70 M395 265 v70" stroke="#EF4122" stroke-width="26"/><path d="M270 400h60v60h-60zM460 400h60v60h-60zM360 470h70v90h-70z" stroke="#2F8FC4" stroke-width="10"/>
<circle cx="690" cy="180" r="85" stroke="#EF4122" stroke-width="14"/><path d="M690 180 V120 M690 180 L735 205" stroke="#EF4122" stroke-width="12"/>
<path d="M90 140c0 120 40 170 90 170s70-60 70-120" stroke="#EF4122" stroke-width="12"/><circle cx="180" cy="420" r="34" stroke="#C9C63B" stroke-width="14"/><path d="M180 310 v76" stroke="#EF4122" stroke-width="10"/>
<g stroke="#C9C63B" stroke-width="10"><circle cx="740" cy="480" r="22"/><path d="M740 430c25-30 55-5 25 25M790 470c35-5 35 40 0 35M760 525c10 35-35 40-35 5M700 500c-35 10-40-35-5-35M705 445c-15-35 30-45 35-10"/></g></g></svg>"""
TREE = """<svg class="sc" style="left:250px;top:120px" width="580" height="560" viewBox="0 0 580 560" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M290 540 C 280 440, 300 380, 290 300" stroke="#8a5a2b" stroke-width="22"/><path d="M290 380 C 240 340, 200 330, 170 300 M292 360 C 340 330, 380 320, 410 290" stroke="#8a5a2b" stroke-width="12"/>
<path d="M290 300 C 150 320, 80 220, 140 150 C 140 70, 250 40, 300 80 C 360 30, 470 70, 450 160 C 500 230, 420 320, 330 300" stroke="#C9C63B" stroke-width="20"/>
<path d="M160 200 C 200 140, 250 230, 300 170 M260 120 C 300 160, 360 110, 400 170" stroke="#C9C63B" stroke-width="12" opacity=".8"/>
<path d="M390 160 C 470 150, 500 240, 440 290 C 400 310, 380 260, 395 220" stroke="#EF4122" stroke-width="18"/><path d="M120 545 C 260 525, 380 530, 470 545" stroke="#2F8FC4" stroke-width="12"/></g></svg>"""
FLOW = """<svg class="sc" style="left:%dpx;top:%dpx" width="260" height="260" viewBox="0 0 260 260" filter="url(#crayon)"><g fill="none" stroke-linecap="round" stroke="%s" stroke-width="11"><circle cx="130" cy="130" r="26"/><path d="M130 70c30-40 70-10 30 30M190 120c45-5 45 50 0 45M150 190c10 45-45 50-45 5M75 150c-45 10-50-45-5-45M85 85c-20-45 40-55 45-15"/></g></svg>"""


def piccolimondi():
    def sl(i, body):
        return f'<div class="s paper grain" id="s{i}"><div class="num" style="color:#999">{i}/10</div>{body}</div>\n'
    big = 'font-size:104px;line-height:.98;letter-spacing:-.05em;font-weight:600'
    o = ""
    o += sl(1, '<div class="t" style="top:100px;text-align:center;font-size:72px;font-weight:600;letter-spacing:-.045em;line-height:1">Ci chiamiamo<br>gli altri infermieri.</div>'
               '<svg class="sc" style="left:500px;top:270px" width="80" height="140" viewBox="0 0 80 140" filter="url(#rough)"><path d="M36 6 C 54 40, 18 80, 42 128 M42 128 L20 98 M42 128 L64 102" stroke="#141414" stroke-width="5" fill="none" stroke-linecap="round"/></svg>'
               + FLOW % (30, 250, "#2F8FC4") +
               '<img class="cut" src="duo.png" style="left:0;width:1080px;top:520px">'
               '<div class="hand" style="position:absolute;right:60px;top:300px;font-size:66px;color:var(--red);transform:rotate(-6deg);z-index:5">non è un caso.</div>')
    o += sl(2, HOSP + f'<div class="t" style="top:820px;{big}">Pensa a un<br>infermiere.</div>'
               '<div class="t" style="top:1060px;font-size:50px;line-height:1.15">Ti viene in mente un ospedale:<br><b>corsie, turni, camici.</b></div>')
    o += sl(3, FLOW % (720, 140, "#C9C63B") + f'<div class="t" style="top:640px;{big}">Per anni è stato il nostro mondo.</div>'
               '<div class="t" style="top:1000px;font-size:58px">E ci ha insegnato <b>tutto.</b></div>')
    o += sl(4, '<svg class="sc" style="left:120px;top:140px" width="840" height="520" viewBox="0 0 840 520" filter="url(#crayon)"><g fill="none" stroke-linecap="round"><path d="M80 420 C 220 120, 420 460, 560 160 S 760 120, 800 60" stroke="#EF4122" stroke-width="14"/><path d="M760 40 l45 15 -25 40" stroke="#EF4122" stroke-width="14"/><circle cx="140" cy="160" r="50" stroke="#2F8FC4" stroke-width="12"/></g></svg>'
               f'<div class="t" style="top:720px;font-size:52px;line-height:1.15">Poi abbiamo capito che questo mestiere può essere</div><div class="t" style="top:900px;{big};font-size:150px">anche altro.</div>')
    o += sl(5, FLOW % (90, 160, "#C9C63B") + FLOW % (720, 280, "#2F8FC4") +
               f'<div class="t" style="top:700px;font-size:52px">Oggi lavoriamo nella</div><div class="t" style="top:790px;{big}">medicina rigenerativa e della longevità.</div>')
    o += sl(6, '<div class="t" style="top:110px;text-align:center;font-size:78px;font-weight:600;letter-spacing:-.045em;line-height:1">Pasquale a Milano.<br>Gabriele a Roma.</div>'
               '<svg class="sc" style="left:495px;top:300px" width="90" height="170" viewBox="0 0 90 170" filter="url(#rough)"><path d="M40 6 C 60 50, 20 100, 46 158 M46 158 L22 124 M46 158 L70 128" stroke="#141414" stroke-width="5" fill="none" stroke-linecap="round"/></svg>'
               '<img class="cut" src="duo.png" style="left:0;width:1080px;top:560px">'
               '<div class="hand" style="position:absolute;left:40px;top:470px;font-size:62px;color:var(--red);transform:rotate(-6deg);z-index:5;line-height:1">stesso lavoro,</div>'
               '<div class="hand" style="position:absolute;right:40px;top:440px;font-size:62px;color:var(--red);transform:rotate(5deg);z-index:5;line-height:1;text-align:right">un altro modo<br>di farlo.</div>')
    o += sl(7, f'<div class="t" style="top:180px;{big};font-size:90px">Qui raccontiamo quello che vediamo.</div>'
               '<div class="t" style="top:560px;font-size:54px;line-height:1.25">Come funziona davvero questo mondo.<br><br>Cosa ci chiedono le persone.<br><br>Cosa impari stando accanto a qualcuno <b>per mezz\'ora.</b></div>'
               + FLOW % (780, 1060, "#EF4122"))
    o += sl(8, '<svg class="sc" style="left:200px;top:140px" width="680" height="520" viewBox="0 0 680 520" filter="url(#crayon)"><g fill="none" stroke-linecap="round"><path d="M340 60 L385 200 L530 200 L412 285 L458 425 L340 340 L222 425 L268 285 L150 200 L295 200 Z" stroke="#C9C63B" stroke-width="14" stroke-linejoin="round"/><path d="M110 120 l40 0 M130 100 l0 40 M560 90 l30 0 M575 75 l0 30 M590 420 l36 0 M608 402 l0 36" stroke="#2F8FC4" stroke-width="10"/><path d="M90 470 L600 60" stroke="#EF4122" stroke-width="18"/></g></svg>'
               f'<div class="t" style="top:760px;{big};font-size:130px">Niente promesse.<br>Niente miracoli.</div>')
    o += sl(9, '<svg class="sc" style="left:300px;top:150px" width="480" height="500" viewBox="0 0 480 500" filter="url(#crayon)"><g fill="none" stroke="#EF4122" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"><path d="M140 470c-60-90-40-180 10-250 18-30 50-14 42 18l-18 80 110-160c18-26 52-8 40 22l-60 116 90-90c22-22 52 4 30 30l-90 100 66-44c26-18 48 14 26 36-90 90-150 150-246 142z"/></g></svg>'
               f'<div class="t" style="top:760px;font-size:56px">Solo il punto di vista di</div><div class="t" style="top:860px;{big};font-size:130px">chi ci sta dentro con le mani.</div>')
    o += sl(10, TREE + '<div class="t" style="top:760px;font-size:62px;line-height:1.1">Non sapevi che un infermiere potesse fare questo?</div>'
               '<div class="t" style="top:960px;font-size:150px;font-weight:600;letter-spacing:-.05em;line-height:1">Appunto.</div>'
               '<div class="pill" style="top:auto;bottom:80px;left:50%;transform:translateX(-50%)"><img src="logo.png">GLIALTRINFERMIERI</div>')
    return HEAD.replace("%EXTRA%", PM_CSS) + o + TAIL


if __name__ == "__main__":
    for name, fn in [("certo", certo), ("factanza", factanza), ("theia", theia), ("piccolimondi", piccolimondi)]:
        open(os.path.join(HERE, name + ".html"), "w").write(fn())
    print("ok")
