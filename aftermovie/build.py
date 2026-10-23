"""Yamorè x Rivoire aftermovie, cut frame-for-frame on the reference edit.

The song and the reference share the same tempo (129 BPM); delaying the song by
SONG_DELAY puts its beat grid on the reference's, so shot boundaries below are
the reference's own frame numbers (24 fps). Sound design comes from sfx.py.

Rules: a clip used in b&w is never shown in colour; brand clips appear once.

Usage: python3 build.py <clips_dir> <song.mp3> <out.mp4>
"""
import os, subprocess, sys, tempfile

import numpy as np
import soundfile as sf

import sfx

CLIPS, SONG, OUT = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
LOGOS = os.path.join(HERE, '..', 'public', 'logos')
FPS, W, H = 24, 1080, 1920
SONG_DELAY = 0.28

# (first_frame, last_frame, clip, in_s, look, fx)
# fx: white/half = overexposed flash frames, dark = strobe-dark frames,
#     black = fade-to-black frames, zoom = slow push-in, speed = playback speed,
#     lift = brighten dark shot, ramp = source seconds covered by a fast->slow speed ramp,
#     deep = b&w keeping true blacks, text = title overlay,
#     punch = zoom punch-in on the hit, shake = decaying camera shake, rgb = RGB split on every frame.
SHOTS = [
    (0, 18, 1, 0.00, 'c', dict(zoom=1)),                        # Rivoire sign
    (19, 49, 19, 0.00, 'bw', dict(white=[19], half=[20], speed=0.42, lift=1, deep=1, text=1)),  # Piazza Signoria
    (50, 71, 18, 0.00, 'c', dict(ramp=1.3)),                    # House of Negroni speed ramp
    (72, 83, 21, 0.00, 'c', {}),                                # muffled run-up to the drop
    (84, 94, 9, 0.00, 'c', {}),
    (95, 106, 20, 0.00, 'c', {}),
    (107, 118, 3, 0.00, 'bw', {}),                              # drop
    (119, 129, 7, 0.00, 'c', {}),
    (130, 140, 13, 0.00, 'c', {}),
    (141, 146, 16, 0.30, 'c', {}),
    (147, 151, 16, 0.90, 'c', {}),
    (152, 162, 12, 0.30, 'c', {}),
    (163, 173, 6, 0.30, 'bw', {}),
    (174, 185, 10, 0.30, 'c', {}),
    (186, 196, 21, 0.60, 'c', {}),
    (197, 202, 9, 0.40, 'c', {}),
    (203, 208, 20, 0.45, 'c', {}),
    (209, 219, 15, 0.30, 'c', dict(white=[209], half=[210])),
    (220, 230, 17, 0.00, 'bw', {}),
    (231, 241, 11, 0.40, 'c', {}),
    (242, 253, 22, 1.20, 'c', {}),                              # bartender, once
    (254, 259, 16, 0.00, 'c', {}),
    (260, 264, 9, 0.62, 'c', {}),
    (265, 270, 13, 0.45, 'c', {}),
    (271, 276, 7, 0.50, 'c', {}),
    (277, 287, 8, 0.20, 'bw', {}),
    (288, 299, 16, 1.30, 'c', {}),
    (300, 310, 2, 0.30, 'c', {}),
    (311, 321, 12, 0.76, 'c', {}),
    (322, 332, 10, 1.40, 'c', {}),
    (333, 344, 3, 1.40, 'bw', {}),
    (345, 355, 15, 0.85, 'c', {}),
    (356, 367, 12, 1.40, 'c', {}),
    (368, 378, 11, 0.00, 'c', {}),
    (379, 400, 21, 1.50, 'c', dict(white=[379], half=[380])),        # end on the dancers
    (401, 446, 'yamore', 0, 'logo', {}),
    (447, 490, 'rivoire', 0, 'logo', {}),
]
END = (SHOTS[-1][1] + 1) / FPS
IMPACT_AT = 72 / FPS            # swoosh + muffled music until the drop
DROP_AT = 107 / FPS
LOWPASS_FROM = 401 / FPS        # end cards

# Clean pastel look: tungsten pulled towards neutral, softer contrast, lifted
# blacks with a hint of blue, gently desaturated so skin reads natural.
GRADE = ("colortemperature=temperature=5200:mix=0.55:pl=1,"
         "colorbalance=rs=-0.02:bs=0.03:rm=-0.03:bm=0.02:rh=0.02:gh=0.01,"
         "eq=contrast=0.90:saturation=0.82:gamma=1.15:brightness=0.025,"
         "curves=r='0/0.07 0.5/0.53 1/0.96':g='0/0.07 0.5/0.52 1/0.96':b='0/0.09 0.5/0.52 1/0.95'")
BW = "hue=s=0,eq=contrast=1.06:gamma=1.08,curves=all='0/0.06 0.5/0.52 1/0.96'"
BW_DEEP = "hue=s=0,eq=contrast=1.18,curves=all='0/0.0 0.5/0.5 1/0.97'"  # night sky stays black
FONT = os.path.join(HERE, '..', 'public', 'fonts', 'BarlowCondensed-SemiBoldItalic.ttf')
TITLE = ('PIAZZA DELLA SIGNORIA', 'EVERY FRIDAY')
FIT = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"


def clip_path(n):
    for f in os.listdir(CLIPS):
        nums = ''.join(c if c.isdigit() else ' ' for c in f).split()
        if nums and int(nums[0]) == n and f.lower().endswith('.mp4'):
            return os.path.join(CLIPS, f)
    raise FileNotFoundError(n)


def run(cmd, **kw):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, **kw)


def frames_expr(first, frames):
    return '+'.join(f'eq(n,{f - first})' for f in frames)


class Graph:
    """Tiny filter_complex builder so effect layers can be stacked per shot."""

    def __init__(self, src='0:v'):
        self.steps, self.cur, self.k = [], src, 0

    def _lab(self, p='v'):
        self.k += 1
        return f'{p}{self.k}'

    def add(self, f):
        out = self._lab()
        self.steps.append(f'[{self.cur}]{f}[{out}]')
        self.cur = out

    def glow(self, sigma, expr=None, opacity=None, curves=None):
        """Screen a blurred copy over the image: halation / flash bloom."""
        a, b, c, out = self._lab('s'), self._lab('s'), self._lab('s'), self._lab()
        pre = f"curves=all='{curves}'," if curves else ''
        self.steps += [f'[{self.cur}]split[{a}][{b}]', f'[{b}]{pre}gblur=sigma={sigma}[{c}]']
        mode = f"all_expr='{expr}'" if expr else f'all_mode=screen:all_opacity={opacity}'
        self.steps.append(f'[{a}][{c}]blend={mode}[{out}]')
        self.cur = out

    def build(self):
        return ';'.join(self.steps), f'[{self.cur}]'


def weights(first, groups):
    """Per-frame weight expression: groups = [(frames, w), ...] in absolute frames."""
    terms = [f'{w}*({"+".join(f"eq(N,{f - first})" for f in frames)})' for frames, w in groups if frames]
    return '+'.join(terms) or '0'


def finish(g, a, n, fx):
    """Halation, flash bloom, RGB split, strobe, fade - shared by every footage shot."""
    g.add('format=gbrp')
    g.glow(28, opacity=0.18, curves='0/0 0.6/0 1/1')                # soft halation
    white, half, dark = fx.get('white', []), fx.get('half', []), fx.get('dark', [])
    if white or half:                                               # bloom instead of flat white
        k = weights(a, [(white, 1.0), (half, 0.55)])
        g.glow(45, expr=f'A+(255-(255-A)*(255-B)/255-A)*({k})')
    if white:
        g.add(f"eq=brightness=0.30:contrast=0.85:enable='{frames_expr(a, white)}'")
    if half:
        g.add(f"eq=brightness=0.12:enable='{frames_expr(a, half)}'")
    if dark:
        g.add(f"eq=brightness=-0.35:enable='{frames_expr(a, dark)}'")
    split = white + half + dark
    if fx.get('rgb'):
        g.add('rgbashift=rh=-12:bh=12')
    elif split:
        g.add(f"rgbashift=rh=-8:bh=8:enable='{frames_expr(a, split)}'")
    if fx.get('black'):
        k = fx['black'][0] - a
        g.add(f"fade=out:s={k - 2}:n={n - k + 2}")
    g.add('format=yuv420p,tpad=stop_mode=clone:stop_duration=1')


def camera(n, fx):
    """Push-in, punch-in on the hit and decaying shake as one scale+crop."""
    z = ['1']
    if fx.get('zoom'):
        z.append(f'0.08*n/{n}')
    if fx.get('punch'):
        z.append('0.14*pow(max(0,1-n/6),2)')
    if fx.get('shake'):
        z.append('0.03')
    if len(z) == 1:
        return None
    sx = sy = '0'
    if fx.get('shake'):
        sx, sy = '16*sin(n*2.7)*max(0,1-n/9)', '12*cos(n*3.1)*max(0,1-n/9)'
    return (f"scale=w='ceil({W}*({'+'.join(z)})/2)*2':h=-2:eval=frame,"
            f"crop={W}:{H}:x='(iw-{W})/2+{sx}':y='(ih-{H})/2+{sy}'")


def ramp_times(n, span, slow=0.5):
    """Source offsets per output frame: starts ~4-5x, eases down to `slow` x."""
    k = np.arange(n)
    v_slow = slow / FPS
    shape = np.exp(-k / 3.0)
    v = v_slow + (span - n * v_slow) / shape.sum() * shape
    return np.concatenate([[0], np.cumsum(v)])  # n+1 edges


def encode(n, out):
    return ['-r', str(FPS), '-frames:v', str(n), '-an', '-c:v', 'libx264',
            '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out]


def render_ramp(a, n, clip, inp, fx, out):
    span = fx['ramp']
    raw = subprocess.run(['ffmpeg', '-ss', f'{inp:.3f}', '-t', f'{span + 0.15:.3f}', '-i', clip_path(clip),
                          '-vf', f'{FIT},{GRADE}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         check=True, capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    src_fps = 50
    edges = ramp_times(n, span)
    g = Graph()
    finish(g, a, n, fx)
    graph, last = g.build()
    p = subprocess.Popen(['ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-filter_complex', graph, '-map', last] + encode(n, out),
                         stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for i in range(n):  # average the source frames each output frame sweeps over = motion blur
        lo = min(int(edges[i] * src_fps), len(src) - 1)
        hi = min(max(int(edges[i + 1] * src_fps), lo + 1), len(src))
        p.stdin.write(src[lo:hi].mean(axis=0).astype(np.uint8).tobytes())
    p.stdin.close()
    assert p.wait() == 0


def render_logo(n, name, out):
    """Logo on black: scales down into place with a soft glow, small shake on the hit."""
    width = 620 if name == 'yamore' else 460
    z = '(1+0.22*pow(max(0,1-t/0.35),3)+0.03*t)'
    sx = '10*sin(n*2.9)*max(0,1-n/8)' if name == 'yamore' else '0'
    graph = (f"[1]scale={width}:-1,format=rgba,fade=in:st=0:d=0.15:alpha=1,split[l][g];"
             f"[g]gblur=sigma=18,colorchannelmixer=aa=0.55[gl];"
             f"[gl][l]overlay=0:0[lg];"
             f"[lg]scale=w='{width}*{z}':h=-1:eval=frame[ls];"
             f"[0][ls]overlay=x='(W-w)/2+{sx}':y='(H-h)/2':shortest=1")
    run(['ffmpeg', '-y', '-f', 'lavfi', '-i', f'color=black:s={W}x{H}:r={FPS}:d={n / FPS:.3f}',
         '-loop', '1', '-i', os.path.join(LOGOS, f'{name}.png'), '-filter_complex', graph] + encode(n, out))


def title_pngs(tmp):
    """Two lines in the Yamorè logo style (condensed semibold italic, tracked)."""
    from PIL import Image, ImageDraw, ImageFont
    paths = []
    for line, size, track in ((TITLE[0], 92, 6), (TITLE[1], 64, 14)):
        font = ImageFont.truetype(FONT, size)
        widths = [font.getlength(c) for c in line]
        w = int(sum(widths) + track * (len(line) - 1)) + 40
        im = Image.new('RGBA', (w, int(size * 1.4)), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        x = 20
        for c, cw in zip(line, widths):
            d.text((x, 0), c, font=font, fill=(245, 245, 242, 255))
            x += cw + track
        p = os.path.join(tmp, f'title{len(paths)}.png')
        im.save(p)
        paths.append(p)
    return paths


def add_title(g, tmp):
    """Lines rise into place with an ease-out and fade, second line a beat later."""
    l1, l2 = title_pngs(tmp)
    g.steps.append("[1:v]format=rgba,fade=in:st=0.10:d=0.30:alpha=1[t1]")
    g.steps.append("[2:v]format=rgba,fade=in:st=0.30:d=0.30:alpha=1[t2]")
    rise = lambda st: f"40*pow(max(0,1-(t-{st})/0.45),3)"
    g.steps.append(f"[{g.cur}][t1]overlay=x='(W-w)/2':y='1560+{rise(0.10)}':shortest=1[o1]")
    g.steps.append(f"[o1][t2]overlay=x='(W-w)/2':y='1680+{rise(0.30)}':shortest=1[o2]")
    g.cur = 'o2'
    return ['-loop', '1', '-framerate', str(FPS), '-i', l1, '-loop', '1', '-framerate', str(FPS), '-i', l2]


def render_shot(i, a, b, clip, inp, look, fx, tmp):
    n = b - a + 1
    out = os.path.join(tmp, f'p{i:02d}.mp4')
    if look == 'logo':
        render_logo(n, clip, out)
        return out
    if 'ramp' in fx:
        render_ramp(a, n, clip, inp, fx, out)
        return out
    g = Graph()
    base = []
    if 'speed' in fx:
        base.append(f"setpts=PTS/{fx['speed']}")
    base.append(f"fps={FPS},{FIT}")
    cam = camera(n, fx)
    if cam:
        base.append(cam)
    if fx.get('lift'):  # night exterior, needs opening up
        base.append("eq=gamma=1.35")
    base.append(BW_DEEP if fx.get('deep') else BW if look == 'bw' else GRADE)
    g.add(','.join(base))
    finish(g, a, n, fx)
    extra = add_title(g, tmp) if fx.get('text') else []
    graph, last = g.build()
    run(['ffmpeg', '-y', '-ss', f'{inp:.3f}', '-i', clip_path(clip)] + extra +
        ['-filter_complex', graph, '-map', last] + encode(n, out))
    return out


def sound_design():
    """Sparse: a shutter click per flash, swooshes on the two big moves,
    sub drop on the drop, impact on the logo."""
    t = lambda f: f / FPS
    shutter, swoosh = sfx.sample('shutter_burst'), sfx.sample('slow_swoosh')
    impact, sub = sfx.sample('impact'), sfx.sample('sub_drop')
    SW_PEAK = 1.358
    ev = []
    for a, b, clip, inp, look, fx in SHOTS:
        if fx.get('white'):
            ev.append(sfx.place(t(fx['white'][0]), sfx.cut(shutter, 0.015, 0.105, fade_out=0.03, gain_db=-5), 0.009))
        if 'ramp' in fx:                     # House of Negroni: fast swoosh peaking as it slows
            rate = 1.7
            ev.append(sfx.place(t(a + 4), sfx.cut(swoosh, 0.6, 2.2, fade_in=0.05, fade_out=0.3,
                                                  gain_db=-7, rate=rate), (SW_PEAK - 0.6) / rate))
        elif a == 72:                        # slow swoosh into the muffled run-up
            ev.append(sfx.place(t(a), sfx.cut(swoosh, 0.3, 3.0, fade_in=0.3, fade_out=0.6, gain_db=-8), SW_PEAK - 0.3))
        elif a == 107:                       # its hiss rises into the drop, sub lands on the cut
            ev.append(sfx.place(t(a), sfx.cut(sub, 0.0, 2.4, fade_in=0.4, fade_out=1.2, gain_db=-10), 0.915))
        elif a == 401:                       # Yamorè logo hit
            ev.append(sfx.place(t(a), sfx.cut(impact, 0.25, None, fade_in=0.05, fade_out=0.4, gain_db=-5), 0.733 - 0.25))
    return sfx.render(ev, END)


tmp = tempfile.mkdtemp(prefix='yamore_')
parts = [render_shot(i, *s, tmp) for i, s in enumerate(SHOTS)]
with open(os.path.join(tmp, 'list.txt'), 'w') as f:
    f.writelines(f"file '{p}'\n" for p in parts)
video = os.path.join(tmp, 'video.mp4')
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'), '-c', 'copy', video])

fx_wav = os.path.join(tmp, 'sfx.wav')
sf.write(fx_wav, sound_design(), sfx.SR, subtype='FLOAT')
sf.write(os.path.splitext(OUT)[0] + '_sfx_stem.wav', sf.read(fx_wav)[0], sfx.SR, subtype='PCM_24')

# Music: muffled from the impact to the drop, then a closing low-pass sweep on the end cards.
steps = 40
sweep = [f"{LOWPASS_FROM + (END - LOWPASS_FROM) * k / steps:.3f} lowpass f "
         f"{int(18000 * (250 / 18000) ** (k / steps))}" for k in range(steps + 1)]
cmds = ';'.join([f"0 lowpass f 20000", f"{IMPACT_AT:.3f} lowpass f 900",
                 f"{DROP_AT - 0.001:.3f} lowpass f 20000"] + sweep)
delay = int(SONG_DELAY * 1000)
fc = (f"[0]noise=alls=7:allf=t[g];"
      f"[2]scale=150:-1,format=rgba,colorchannelmixer=aa=0.85[wm];"
      f"[g][wm]overlay=(W-w)/2:70:enable='lt(t,{LOWPASS_FROM:.3f})'[v];"
      f"[1]aresample=48000,adelay={delay}|{delay},asendcmd=c='{cmds}',lowpass=f=20000,volume=0.85,"
      f"afade=t=out:st={END - 0.6:.2f}:d=0.6[m];"
      f"[3]aformat=channel_layouts=stereo[fx];"
      f"[m][fx]amix=inputs=2:normalize=0,alimiter=limit=0.93:attack=3:release=80[a]")
run(['ffmpeg', '-y', '-i', video, '-i', SONG, '-i', os.path.join(LOGOS, 'yamore.png'), '-i', fx_wav,
     '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow',
     '-b:v', '14M', '-maxrate', '18M', '-bufsize', '28M', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '256k', '-t', f'{END:.3f}', '-movflags', '+faststart', OUT])
print(OUT)
