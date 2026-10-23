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
#     punch = zoom punch-in on the hit, shake = decaying camera shake, rgb = RGB split on every frame.
SHOTS = [
    (0, 11, 1, 0.00, 'c', dict(zoom=1)),                        # Rivoire sign
    (12, 28, 19, 0.00, 'bw', dict(white=[12], half=[13, 15], speed=0.75, lift=1)),
    (29, 46, 18, 0.00, 'c', dict(white=[29], half=[30], ramp=1.3)),  # House of Negroni speed ramp
    (47, 55, 2, 0.20, 'c', dict(dark=[50])),
    (56, 70, 9, 0.00, 'c', {}),
    (71, 107, 21, 0.00, 'c', dict(half=[71], zoom=1)),          # long hold into the drop
    (108, 118, 3, 0.00, 'bw', dict(punch=1, shake=1)),                              # drop
    (119, 133, 5, 0.00, 'c', dict(dark=[119, 121, 129])),
    (134, 141, 7, 0.00, 'c', dict(white=[134], half=[135], punch=1)),
    (142, 152, 22, 1.20, 'c', {}),                              # bartender, once
    (153, 163, 10, 0.20, 'c', {}),
    (164, 174, 11, 0.30, 'c', {}),
    (175, 186, 14, 0.30, 'c', dict(half=[183])),
    (187, 195, 15, 0.20, 'c', {}),
    (196, 205, 20, 0.00, 'c', {}),
    (206, 206, 13, 0.00, 'c', dict(rgb=1)),                              # micro-cut burst
    (207, 209, 5, 1.00, 'c', dict(white=[207], rgb=1)),
    (210, 210, 5, 1.15, 'c', dict(dark=[210], rgb=1)),
    (211, 211, 13, 0.30, 'c', dict(rgb=1)),
    (212, 214, 5, 1.30, 'c', dict(white=[213], half=[214], rgb=1)),
    (215, 229, 16, 0.30, 'bw', dict(dark=[215], half=[216], black=[227, 228, 229])),
    (230, 231, 12, 0.30, 'c', {}),                              # A-B-A sandwich
    (232, 238, 21, 1.70, 'c', {}),
    (239, 242, 12, 0.50, 'c', {}),
    (243, 255, 6, 0.30, 'c', dict(white=[243], half=[244, 246])),
    (256, 267, 17, 0.00, 'bw', {}),
    (268, 281, 4, 1.00, 'c', dict(white=[268], half=[269], punch=1)),
    (282, 292, 14, 1.60, 'c', dict(dark=[283, 285, 287, 288, 290], half=[284, 289])),
    (293, 303, 20, 0.40, 'c', {}),
    (304, 314, 10, 1.20, 'c', {}),
    (315, 326, 4, 2.30, 'c', {}),
    (327, 330, 16, 1.20, 'bw', {}),
    (331, 341, 15, 0.70, 'c', {}),
    (342, 351, 3, 1.50, 'bw', {}),
    (352, 368, 12, 1.20, 'c', {}),
    (369, 380, 8, 0.20, 'c', {}),
    (381, 400, 5, 2.75, 'c', dict(white=[381], half=[382], punch=1)),
    (401, 446, 'yamore', 0, 'logo', {}),
    (447, 490, 'rivoire', 0, 'logo', {}),
]
END = (SHOTS[-1][1] + 1) / FPS
IMPACT_AT = 71 / FPS            # boom + muffled music until the drop
DROP_AT = 108 / FPS
LOWPASS_FROM = 401 / FPS        # end cards

GRADE = ("eq=contrast=1.08:saturation=1.20:gamma=1.10:brightness=0.02,"
         "colorbalance=rs=0.06:bs=-0.05:rh=0.03:bh=-0.03,"
         "curves=all='0/0.04 0.5/0.5 1/0.97',vignette=PI/5")
BW = "hue=s=0,eq=contrast=1.22:gamma=1.05,curves=all='0/0.03 1/0.97',vignette=PI/5"
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
    g.glow(28, opacity=0.32, curves='0/0 0.55/0 1/1')               # film halation
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
        g.add(f"rgbashift=rh=-14:bh=14:enable='{frames_expr(a, split)}'")
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
        base.append("eq=gamma=1.8:brightness=0.05")
    base.append(BW if look == 'bw' else GRADE)
    g.add(','.join(base))
    finish(g, a, n, fx)
    graph, last = g.build()
    run(['ffmpeg', '-y', '-ss', f'{inp:.3f}', '-i', clip_path(clip),
         '-filter_complex', graph, '-map', last] + encode(n, out))
    return out


def sound_design():
    """Sparse, sample-based: shutter clicks on flashes, swooshes on transitions,
    sub drop on the drop, impact on the logo."""
    t = lambda f: f / FPS
    shutter, swoosh = sfx.sample('shutter_burst'), sfx.sample('slow_swoosh')
    impact, sub = sfx.sample('impact'), sfx.sample('sub_drop')
    click = lambda db: sfx.cut(shutter, 0.015, 0.105, fade_out=0.03, gain_db=db)
    short_swoosh = lambda db: sfx.cut(swoosh, 0.95, 1.80, fade_in=0.15, fade_out=0.25, gain_db=db)
    SW_PEAK = 1.358
    ev = []
    for a, b, clip, inp, look, fx in SHOTS:
        white = fx.get('white', [])
        if 'ramp' in fx:                     # House of Negroni: click + fast swoosh peaking as it slows
            ev.append(sfx.place(t(a), click(-4), 0.009))
            rate = 1.7
            ev.append(sfx.place(t(a + 4), sfx.cut(swoosh, 0.6, 2.2, fade_in=0.05, fade_out=0.3,
                                                  gain_db=-5, rate=rate), (SW_PEAK - 0.6) / rate))
            continue
        for f in white:
            ev.append(sfx.place(t(f), click(-5 if f != a else -3), 0.009))
        if a == 71:                          # slow swoosh into the muffled hold
            ev.append(sfx.place(t(a), sfx.cut(swoosh, 0.3, 3.0, fade_in=0.3, fade_out=0.6, gain_db=-6), SW_PEAK - 0.3))
        elif a == 108:                       # its hiss rises into the drop, sub lands on the cut
            ev.append(sfx.place(t(a), sfx.cut(sub, 0.0, 2.4, fade_in=0.4, fade_out=1.2, gain_db=-9), 0.915))
        elif a == 206:                       # photo burst over the micro-cuts
            ev.append(sfx.place(t(a), sfx.cut(shutter, 0.015, 0.45, fade_out=0.06, gain_db=-6), 0.009))
        elif a in (215, 342):                # into b&w
            ev.append(sfx.place(t(a), short_swoosh(-11), SW_PEAK - 0.95))
        elif a == 401:                       # Yamorè logo hit
            ev.append(sfx.place(t(a), sfx.cut(impact, 0.25, None, fade_in=0.05, fade_out=0.4, gain_db=-3), 0.733 - 0.25))
        elif a == 447:                       # Rivoire logo
            ev.append(sfx.place(t(a), sfx.cut(swoosh, 0.5, 3.0, fade_in=0.2, fade_out=0.6, gain_db=-9), SW_PEAK - 0.5))
        if a == 282:                         # strobe: soft clicks on the dark frames
            ev += [sfx.place(t(f), click(-14), 0.009) for f in fx.get('dark', [])]
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
