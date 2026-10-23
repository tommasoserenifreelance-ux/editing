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
#     lift = brighten dark shot, ramp = source seconds covered by a fast->slow speed ramp.
SHOTS = [
    (0, 11, 1, 0.00, 'c', dict(zoom=1)),                        # Rivoire sign
    (12, 28, 19, 0.00, 'bw', dict(white=[12], half=[13, 15], speed=0.75, lift=1)),
    (29, 46, 18, 0.00, 'c', dict(white=[29], half=[30], ramp=1.3)),  # House of Negroni speed ramp
    (47, 55, 2, 0.20, 'c', dict(dark=[50])),
    (56, 70, 9, 0.00, 'c', {}),
    (71, 107, 21, 0.00, 'c', dict(half=[71], zoom=1)),          # long hold into the drop
    (108, 118, 3, 0.00, 'bw', {}),                              # drop
    (119, 133, 5, 0.00, 'c', dict(dark=[119, 121, 129])),
    (134, 141, 7, 0.00, 'c', dict(white=[134], half=[135])),
    (142, 152, 22, 1.20, 'c', {}),                              # bartender, once
    (153, 163, 10, 0.20, 'c', {}),
    (164, 174, 11, 0.30, 'c', {}),
    (175, 186, 14, 0.30, 'c', dict(half=[183])),
    (187, 195, 15, 0.20, 'c', {}),
    (196, 205, 20, 0.00, 'c', {}),
    (206, 206, 13, 0.00, 'c', {}),                              # micro-cut burst
    (207, 209, 5, 1.00, 'c', dict(white=[207])),
    (210, 210, 5, 1.15, 'c', dict(dark=[210])),
    (211, 211, 13, 0.30, 'c', {}),
    (212, 214, 5, 1.30, 'c', dict(white=[213], half=[214])),
    (215, 229, 16, 0.30, 'bw', dict(dark=[215], half=[216], black=[227, 228, 229])),
    (230, 231, 12, 0.30, 'c', {}),                              # A-B-A sandwich
    (232, 238, 21, 1.70, 'c', {}),
    (239, 242, 12, 0.50, 'c', {}),
    (243, 255, 6, 0.30, 'c', dict(white=[243], half=[244, 246])),
    (256, 267, 17, 0.00, 'bw', {}),
    (268, 281, 4, 1.00, 'c', dict(white=[268], half=[269])),
    (282, 292, 14, 1.60, 'c', dict(dark=[283, 285, 287, 288, 290], half=[284, 289])),
    (293, 303, 20, 0.40, 'c', {}),
    (304, 314, 10, 1.20, 'c', {}),
    (315, 326, 4, 2.30, 'c', {}),
    (327, 330, 16, 1.20, 'bw', {}),
    (331, 341, 15, 0.70, 'c', {}),
    (342, 351, 3, 1.50, 'bw', {}),
    (352, 368, 12, 1.20, 'c', {}),
    (369, 380, 8, 0.20, 'c', {}),
    (381, 400, 5, 2.75, 'c', dict(white=[381], half=[382])),
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


def flash_filters(a, fx):
    vf = []
    if fx.get('white'):
        vf.append(f"eq=brightness=0.75:contrast=0.35:enable='{frames_expr(a, fx['white'])}'")
    if fx.get('half'):
        vf.append(f"eq=brightness=0.35:contrast=0.7:enable='{frames_expr(a, fx['half'])}'")
    if fx.get('dark'):
        vf.append(f"eq=brightness=-0.35:enable='{frames_expr(a, fx['dark'])}'")
    return vf


def ramp_times(n, span, slow=0.5):
    """Source offsets per output frame: starts ~4-5x, eases down to `slow` x."""
    k = np.arange(n)
    v_slow = slow / FPS
    shape = np.exp(-k / 3.0)
    v = v_slow + (span - n * v_slow) / shape.sum() * shape
    return np.concatenate([[0], np.cumsum(v)])  # n+1 edges


def render_ramp(a, n, clip, inp, fx, enc):
    span = fx['ramp']
    raw = subprocess.run(['ffmpeg', '-ss', f'{inp:.3f}', '-t', f'{span + 0.15:.3f}', '-i', clip_path(clip),
                          '-vf', f'{FIT},{GRADE}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         check=True, capture_output=True).stdout
    src = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    src_fps = 50
    edges = ramp_times(n, span)
    frames = []
    for i in range(n):  # average the source frames each output frame sweeps over = motion blur
        lo = min(int(edges[i] * src_fps), len(src) - 1)
        hi = min(max(int(edges[i + 1] * src_fps), lo + 1), len(src))
        frames.append(src[lo:hi].mean(axis=0).astype(np.uint8))
    vf = flash_filters(a, fx) or ['null']
    p = subprocess.Popen(['ffmpeg', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-vf', ','.join(vf)] + enc,
                         stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    assert p.wait() == 0


def render_shot(i, a, b, clip, inp, look, fx, tmp):
    n = b - a + 1
    out = os.path.join(tmp, f'p{i:02d}.mp4')
    enc = ['-r', str(FPS), '-frames:v', str(n), '-an', '-c:v', 'libx264',
           '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out]
    if look == 'logo':
        width = 620 if clip == 'yamore' else 460
        d = n / FPS
        vf = (f"[1]scale={width}:-1,format=rgba,fade=in:st=0:d=0.2:alpha=1,"
              f"scale=w='{width}*(1+0.04*t/{d:.2f})':h=-1:eval=frame[l];"
              f"[0][l]overlay=(W-w)/2:(H-h)/2:shortest=1")
        run(['ffmpeg', '-y', '-f', 'lavfi', '-i', f'color=black:s={W}x{H}:r={FPS}:d={d:.3f}',
             '-loop', '1', '-i', os.path.join(LOGOS, f'{clip}.png'), '-filter_complex', vf] + enc)
        return out
    if 'ramp' in fx:
        render_ramp(a, n, clip, inp, fx, enc)
        return out
    vf = []
    if 'speed' in fx:
        vf.append(f"setpts=PTS/{fx['speed']}")
    vf.append(f"fps={FPS},{FIT}")
    if fx.get('zoom'):
        vf.append(f"scale=w='{W}*(1+0.08*n/{n})':h=-2:eval=frame,crop={W}:{H}")
    if fx.get('lift'):  # night exterior, needs opening up
        vf.append("eq=gamma=1.8:brightness=0.05")
    vf.append(BW if look == 'bw' else GRADE)
    vf += flash_filters(a, fx)
    if fx.get('black'):
        k = fx['black'][0] - a
        vf.append(f"fade=out:s={k - 2}:n={n - k + 2}")
    vf.append("tpad=stop_mode=clone:stop_duration=1")
    run(['ffmpeg', '-y', '-ss', f'{inp:.3f}', '-i', clip_path(clip), '-vf', ','.join(vf)] + enc)
    return out


def sound_design():
    """One sound per cut / flash / transition, chosen by what happens on that frame."""
    t = lambda f: f / FPS
    ev = []
    pan = 1
    for i, (a, b, clip, inp, look, fx) in enumerate(SHOTS):
        prev_look = SHOTS[i - 1][4] if i else None
        if a == 0:
            ev.append((0.0, sfx.air_swish(0.35, 0.1), 'start'))
        elif look == 'logo':
            first = clip == 'yamore'
            ev.append((t(a), sfx.impact(0.75 if first else 0.5, sub=(70, 30) if first else (60, 34)), 'start'))
            if first:
                ev.append((t(a), sfx.shimmer_tail(), 'start'))
                ev.append((t(a), sfx.whoosh(0.5, 5000, 600, 300, (0.4, -0.4), 0.15), 'end'))
        elif a == 108:                                       # the drop
            ev += [(t(a), sfx.riser(), 'end'), (t(a), sfx.impact(0.7), 'start')]
        elif a == 71:                                        # boom into the muffled hold
            ev.append((t(a), sfx.impact(0.5, sub=(60, 32), wet=0.5), 'start'))
            ev.append((t(a), sfx.flash(0.18), 'start'))
        elif 'ramp' in fx:                                   # House of Negroni speed ramp
            ev.append((t(a), sfx.flash(0.3), 'start'))
            ev.append((t(a) - 0.04, sfx.whoosh(0.75, 300, 6500, 700, (-0.8, 0.8), 0.32, 0.35), 'start'))
        elif fx.get('white') and fx['white'][0] == a:
            ev.append((t(a), sfx.flash(), 'start'))
        elif a == 206:                                       # micro-cut burst
            ev.append((t(a), sfx.glitch(), 'start'))
        elif look == 'bw' and prev_look != 'bw':
            ev.append((t(a), sfx.whoosh(0.4, 500, 4500, 1200, (-pan * 0.6, pan * 0.6), 0.2), 'start'))
            ev[-1] = (t(a) - 0.4 * 0.55, ev[-1][1], 'start')   # whoosh peak on the cut
        elif look == 'c' and prev_look == 'bw':
            if fx.get('half') or SHOTS[i - 1][5].get('black'):
                ev.append((t(a), sfx.suck(), 'end'))
            else:
                ev.append((t(a) - 0.12, sfx.air_swish(0.3, 0.12, pan * 0.4), 'start'))
        elif a not in (207, 210, 211, 212, 213):
            ev.append((t(a) - 0.1, sfx.air_swish(0.22, 0.07, pan * 0.4), 'start'))
        for f in fx.get('white', [])[1:] if fx.get('white') and fx['white'][0] == a else fx.get('white', []):
            ev.append((t(f), sfx.flash(0.22), 'start'))
        for f in fx.get('half', []):
            if f not in (a, a + 1) and not fx.get('dark'):
                ev.append((t(f), sfx.sparkle(), 'start'))
        for f in fx.get('dark', []):
            ev.append((t(f), sfx.tick(0.1, 2600 if f % 2 else 1900), 'start'))
        pan = -pan
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
