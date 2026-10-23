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
#     photos = freeze-frame 'photo' moments (with shutter clicks),
#     punch = zoom punch-in on the hit, shake = decaying camera shake, rgb = RGB split on every frame.
SHOTS = [
    (0, 18, 1, 0.00, 'c', dict(zoom=1)),                        # Rivoire sign
    (19, 49, 19, 0.00, 'bw', dict(white=[19], half=[20], speed=0.42, lift=1, deep=1, text=1)),  # Piazza Signoria
    (50, 71, 18, 0.00, 'c', dict(ramp=1.3)),                    # House of Negroni speed ramp
    (72, 83, 20, 0.00, 'c', {}),                                # muffled run-up to the drop
    (84, 106, 9, 0.00, 'c', {}),
    (107, 128, 3, 0.00, 'bw', {}),                              # drop
    (129, 151, 7, 0.00, 'c', {}),
    (152, 173, 12, 0.20, 'c', dict(ramp=1.6)),                  # DJ speed ramp
    (174, 196, 13, 0.00, 'c', dict(white=[174], half=[175], ramp=0.76)),  # flash + speed ramp
    (197, 219, 16, 0.30, 'c', dict(white=[197], half=[198])),
    (220, 241, 17, 0.00, 'bw', {}),
    (242, 253, 5, 2.35, 'c', dict(crop=(1.45, 0.10))),         # kiss -> heart hands, framed tight
    (254, 276, 15, 0.10, 'c', dict(white=[254], half=[255], ramp=1.2)),
    (277, 299, 10, 0.20, 'c', dict(ramp=1.5)),
    (300, 321, 6, 0.20, 'bw', dict(white=[300], half=[301], ramp=1.0)),  # flash + speed ramp
    (322, 333, 2, 0.30, 'c', {}),
    (334, 356, 11, 0.20, 'c', dict(white=[334], half=[335])),
    (357, 367, 8, 0.30, 'bw', {}),
    (368, 378, 21, 0.00, 'c', {}),                              # dancers close it out:
    (379, 400, 21, 1.40, 'c', dict(white=[379], half=[380])),   # jump cut on the beat
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
         "eq=contrast=1.0:saturation=0.84:gamma=1.13:brightness=0.015,"
         "curves=r='0/0.05 0.5/0.53 1/0.97':g='0/0.05 0.5/0.52 1/0.97':b='0/0.07 0.5/0.52 1/0.96'")
BW = "hue=s=0,eq=contrast=1.14:gamma=1.06,curves=all='0/0.04 0.5/0.52 1/0.97'"
BW_DEEP = "hue=s=0,eq=contrast=1.18,curves=all='0/0.0 0.5/0.5 1/0.97'"  # night sky stays black
FONT = os.path.join(HERE, '..', 'public', 'fonts', 'BarlowCondensed-SemiBoldItalic.ttf')
TITLE = ('PIAZZA DELLA SIGNORIA', 'EVERY FRIDAY')
TITLE_IN = 0.40      # s after the tower cut when the first title line lands
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
    white, half, dark = fx.get('white', []), list(fx.get('half', [])), fx.get('dark', [])
    half += fx.get('photos', [])
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
    if fx.get('crop'):  # static punch-in to reframe (zoom, vertical anchor 0=top..1=bottom)
        zc, yf = fx['crop']
        return f"scale=w='ceil({W}*{zc}/2)*2':h=-2,crop={W}:{H}:x='(iw-{W})/2':y='(ih-{H})*{yf}'"
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


def photo_times(n, starts, hold=4):
    """Real-time playback that freezes for `hold` frames at each photo."""
    t, out = 0.0, []
    for k in range(n):
        if k and not any(h < k < h + hold for h in starts):
            t += 1 / FPS
        out.append((t, t))
    return out


def render_remap(a, n, clip, inp, look, fx, out):
    """Render a shot whose output frames map to arbitrary source times."""
    if 'ramp' in fx:
        e = ramp_times(n, fx['ramp'])
        spans = list(zip(e[:-1], e[1:]))
    else:
        spans = photo_times(n, [p - a for p in fx['photos']])
    span = spans[-1][1]
    raw = subprocess.run(['ffmpeg', '-ss', f'{inp:.3f}', '-t', f'{span + 0.15:.3f}', '-i', clip_path(clip),
                          '-vf', f"{FIT},{BW if look == 'bw' else GRADE}", '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         check=True, capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    src_fps = 50
    g = Graph()
    finish(g, a, n, fx)
    graph, last = g.build()
    p = subprocess.Popen(['ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-filter_complex', graph, '-map', last] + encode(n, out),
                         stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for t0, t1 in spans:  # average the source frames each output frame sweeps over = motion blur
        lo = min(int(t0 * src_fps), len(src) - 1)
        hi = min(max(int(t1 * src_fps), lo + 1), len(src))
        p.stdin.write(src[lo:hi].mean(axis=0).astype(np.uint8).tobytes())
    p.stdin.close()
    assert p.wait() == 0


def clip_len(clip):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
                                 clip_path(clip)], check=True, capture_output=True, text=True).stdout)


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
    for line, size, track in ((TITLE[0], 100, 6), (TITLE[1], 72, 16)):
        font = ImageFont.truetype(FONT, size)
        widths = [font.getlength(c) for c in line]
        w = int(sum(widths) + track * (len(line) - 1)) + 40
        from PIL import ImageFilter
        im = Image.new('RGBA', (w, int(size * 1.6)), (0, 0, 0, 0))
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
        d, ds = ImageDraw.Draw(im), ImageDraw.Draw(sh)
        x = 20
        for c, cw in zip(line, widths):
            ds.text((x + 3, 12), c, font=font, fill=(0, 0, 0, 170))
            d.text((x, 8), c, font=font, fill=(245, 245, 242, 255))
            x += cw + track
        im = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)), im)
        p = os.path.join(tmp, f'title{len(paths)}.png')
        im.save(p)
        paths.append(p)
    return paths


def add_title(g, tmp):
    """Line 1 slams in from 160% scale with a motion-blur ghost and a glow pulse on
    landing; line 2 follows, opening up from 85%."""
    l1, l2 = title_pngs(tmp)
    land = TITLE_IN
    st1 = land - 0.22
    ease1 = f"pow(max(0,1-(t-{st1})/0.22),3)"           # 1 -> 0, ease-out
    ease2 = f"pow(max(0,1-(t-{land + 0.12})/0.3),3)"
    g.steps += [
        f"[1:v]format=rgba,split=3[a1][b1][c1]",
        f"[a1]fade=in:st={st1}:d=0.12:alpha=1,scale=w='iw*(1+0.6*{ease1})':h=-1:eval=frame[t1]",
        f"[b1]gblur=sigma=14,fade=in:st={st1}:d=0.08:alpha=1,fade=out:st={land - 0.04}:d=0.12:alpha=1,"
        f"scale=w='iw*(1+0.9*{ease1})':h=-1:eval=frame[g1]",
        f"[c1]gblur=sigma=30,colorchannelmixer=aa=0.9,fade=in:st={land - 0.02}:d=0.03:alpha=1,"
        f"fade=out:st={land + 0.05}:d=0.5:alpha=1[p1]",
        f"[2:v]format=rgba,fade=in:st={land + 0.12}:d=0.2:alpha=1,"
        f"scale=w='iw*(1-0.15*{ease2})':h=-1:eval=frame[t2]",
        f"[{g.cur}][g1]overlay=x='(W-w)/2':y='(H/2)-90-h/2':shortest=1[o1]",
        f"[o1][t1]overlay=x='(W-w)/2':y='(H/2)-90-h/2':shortest=1[o2]",
        f"[o2][p1]overlay=x='(W-w)/2':y='(H/2)-90-h/2':shortest=1[o3]",
        f"[o3][t2]overlay=x='(W-w)/2':y='(H/2)+40':shortest=1[o4]",
    ]
    g.cur = 'o4'
    return ['-loop', '1', '-framerate', str(FPS), '-i', l1, '-loop', '1', '-framerate', str(FPS), '-i', l2]


def render_shot(i, a, b, clip, inp, look, fx, tmp):
    n = b - a + 1
    out = os.path.join(tmp, f'p{i:02d}.mp4')
    if look == 'logo':
        render_logo(n, clip, out)
        return out
    if 'ramp' in fx or 'photos' in fx:
        render_remap(a, n, clip, inp, look, fx, out)
        return out
    g = Graph()
    base = []
    speed = fx.get('speed', 1.0)
    avail = clip_len(clip) - inp - 0.04
    if avail < n / FPS * speed:  # short clip: slow it down instead of freezing the last frame
        speed = avail / (n / FPS)
    if speed != 1.0:
        base.append(f"setpts=PTS/{speed:.4f}")
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
    """Fujifilm shutter on every flash and photo, swooshes on the big moves,
    title hit, sub drop on the drop, impact on the logo."""
    t = lambda f: f / FPS
    shutter, swoosh = sfx.sample('shutter_burst'), sfx.sample('slow_swoosh')
    impact, sub = sfx.sample('impact'), sfx.sample('sub_drop')
    SW_PEAK = 1.358
    # measured click onsets in the burst; take different ones so repeats don't sound cloned
    onsets = [0.024, 0.133, 0.208, 0.272, 0.339, 0.408, 0.472, 0.541, 0.611, 0.675, 0.739, 0.808]
    click = lambda i, db: sfx.cut(shutter, onsets[i % 12] - 0.008, onsets[i % 12] + 0.06,
                                  fade_out=0.025, gain_db=db)
    ev, k = [], 0
    for a, b, clip, inp, look, fx in SHOTS:
        if fx.get('white') and not fx.get('text'):
            ev.append(sfx.place(t(fx['white'][0]), click(k, -4), 0.008)); k += 5
        for p in fx.get('photos', []):       # photo burst: a click per frozen frame
            ev.append(sfx.place(t(p), click(k, -3), 0.008)); k += 1
        if fx.get('text'):                   # title slam: swoosh rushing in + impact on landing
            ev.append(sfx.place(t(a) + TITLE_IN, sfx.cut(swoosh, 0.7, 1.45, fade_in=0.2, fade_out=0.05,
                                                         gain_db=-9), SW_PEAK - 0.7))
            ev.append(sfx.place(t(a) + TITLE_IN, sfx.cut(impact, 0.66, 1.9, fade_in=0.01, fade_out=0.6,
                                                         gain_db=-8), 0.733 - 0.66))
        if 'ramp' in fx and clip == 18:      # House of Negroni: fast swoosh peaking as it slows
            rate = 1.7
            ev.append(sfx.place(t(a + 4), sfx.cut(swoosh, 0.6, 2.2, fade_in=0.05, fade_out=0.3,
                                                  gain_db=-7, rate=rate), (SW_PEAK - 0.6) / rate))
        elif 'ramp' in fx:                   # other ramps: lighter, faster swish
            ev.append(sfx.place(t(a + 3), sfx.cut(swoosh, 0.9, 1.8, fade_in=0.05, fade_out=0.2,
                                                  gain_db=-14, rate=2.0), (SW_PEAK - 0.9) / 2.0))
        if a == 72:                          # slow swoosh into the muffled run-up
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
