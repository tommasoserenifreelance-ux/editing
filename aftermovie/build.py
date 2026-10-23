"""Yamorè x Rivoire aftermovie, cut frame-for-frame on the reference edit.

The song and the reference share the same tempo (129 BPM); delaying the song by
SONG_DELAY puts its beat grid on the reference's, so shot boundaries below are
the reference's own frame numbers (24 fps).

Usage: python3 build.py <clips_dir> <song.mp3> <out.mp4>
"""
import os, subprocess, sys, tempfile

CLIPS, SONG, OUT = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
LOGOS = os.path.join(HERE, '..', 'public', 'logos')
FPS, W, H = 24, 1080, 1920
SONG_DELAY = 0.28

# (first_frame, last_frame, clip, in_s, look, fx)
# fx: white/half = overexposed flash frames, dark = strobe-dark frames,
#     bwf = single b&w frames, black = fade-to-black frames,
#     zoom = slow push-in, speed = playback speed, lift = brighten dark shot.
SHOTS = [
    (0, 11, 1, 0.00, 'c', dict(zoom=1)),                       # Rivoire sign
    (12, 28, 19, 0.00, 'bw', dict(white=[12], half=[13, 15], speed=0.75, lift=1)),
    (29, 39, 18, 0.25, 'c', dict(white=[29, 30], half=[31, 32])),  # House of Negroni
    (40, 46, 6, 0.30, 'c', {}),
    (47, 55, 2, 0.20, 'c', dict(dark=[50])),
    (56, 70, 12, 0.30, 'c', {}),
    (71, 107, 22, 0.40, 'c', dict(half=[71], zoom=1)),         # long hold into the drop
    (108, 118, 3, 0.50, 'bw', {}),                              # drop
    (119, 133, 9, 0.00, 'c', dict(dark=[119, 121, 129])),
    (134, 141, 7, 0.00, 'c', dict(white=[134], half=[135])),
    (142, 152, 8, 0.20, 'c', {}),
    (153, 163, 13, 0.00, 'c', {}),
    (164, 174, 11, 0.30, 'c', {}),
    (175, 186, 14, 0.30, 'c', dict(half=[183])),
    (187, 195, 4, 0.00, 'c', {}),
    (196, 205, 20, 0.00, 'c', {}),
    (206, 206, 16, 0.20, 'c', {}),                              # micro-cut burst
    (207, 209, 5, 0.00, 'c', dict(white=[207])),
    (210, 210, 5, 0.10, 'c', dict(dark=[210])),
    (211, 211, 16, 0.45, 'c', {}),
    (212, 214, 5, 0.25, 'c', dict(white=[213], half=[214])),
    (215, 229, 21, 1.30, 'bw', dict(dark=[215], half=[216], black=[227, 228, 229])),
    (230, 231, 15, 0.20, 'c', {}),                              # A-B-A sandwich
    (232, 238, 10, 0.20, 'c', {}),
    (239, 242, 15, 0.50, 'c', {}),
    (243, 255, 17, 0.00, 'c', dict(white=[243], half=[244, 246])),
    (256, 267, 16, 1.00, 'bw', {}),
    (268, 281, 5, 2.00, 'c', dict(white=[268], half=[269])),
    (282, 292, 14, 1.60, 'c', dict(dark=[283, 285, 287, 288, 290], half=[284, 289])),
    (293, 303, 12, 1.50, 'c', {}),
    (304, 314, 10, 1.20, 'c', {}),
    (315, 326, 4, 1.50, 'c', {}),                               # colour / b&w / colour
    (327, 330, 4, 2.00, 'bw', {}),
    (331, 341, 4, 2.20, 'c', dict(bwf=[340, 341])),
    (342, 351, 3, 1.40, 'bw', {}),
    (352, 368, 22, 3.60, 'c', {}),
    (369, 380, 21, 0.00, 'c', {}),
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


def clip_path(n):
    for f in os.listdir(CLIPS):
        nums = ''.join(c if c.isdigit() else ' ' for c in f).split()
        if nums and int(nums[0]) == n and f.lower().endswith('.mp4'):
            return os.path.join(CLIPS, f)
    raise FileNotFoundError(n)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def frames_expr(first, frames):
    return '+'.join(f'eq(n,{f - first})' for f in frames)


tmp = tempfile.mkdtemp(prefix='yamore_')
parts = []
for i, (a, b, clip, inp, look, fx) in enumerate(SHOTS):
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
             '-loop', '1', '-i', os.path.join(LOGOS, f'{clip}.png'),
             '-filter_complex', vf] + enc)
        parts.append(out)
        continue
    vf = []
    if 'speed' in fx:
        vf.append(f"setpts=PTS/{fx['speed']}")
    vf.append(f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}")
    if fx.get('zoom'):
        vf.append(f"scale=w='{W}*(1+0.08*n/{n})':h=-2:eval=frame,crop={W}:{H}")
    if fx.get('lift'):  # night exterior, needs opening up
        vf.append("eq=gamma=1.8:brightness=0.05")
    vf.append(BW if look == 'bw' else GRADE)
    if fx.get('bwf'):
        vf.append(f"hue=s=0:enable='{frames_expr(a, fx['bwf'])}'")
    if fx.get('white'):
        vf.append(f"eq=brightness=0.75:contrast=0.35:enable='{frames_expr(a, fx['white'])}'")
    if fx.get('half'):
        vf.append(f"eq=brightness=0.35:contrast=0.7:enable='{frames_expr(a, fx['half'])}'")
    if fx.get('dark'):
        vf.append(f"eq=brightness=-0.35:enable='{frames_expr(a, fx['dark'])}'")
    if fx.get('black'):
        k = fx['black'][0] - a
        vf.append(f"fade=out:s={k - 2}:n={n - k + 2}")
    vf.append("tpad=stop_mode=clone:stop_duration=1")
    run(['ffmpeg', '-y', '-ss', f'{inp:.3f}', '-i', clip_path(clip), '-vf', ','.join(vf)] + enc)
    parts.append(out)

with open(os.path.join(tmp, 'list.txt'), 'w') as f:
    f.writelines(f"file '{p}'\n" for p in parts)
video = os.path.join(tmp, 'video.mp4')
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'), '-c', 'copy', video])

# Impact: sub sweep 95 -> 35 Hz with a noise transient, like the reference's boom.
impact = ("aevalsrc='0.9*sin(2*PI*(35*t+60*0.18*(1-exp(-t/0.18))))*exp(-t/0.55)"
          "+0.35*(random(0)*2-1)*exp(-t/0.03)':s=48000:d=1.6,"
          f"lowpass=f=400,adelay={int(IMPACT_AT * 1000)}|{int(IMPACT_AT * 1000)},aformat=channel_layouts=stereo")
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
      f"[1]adelay={delay}|{delay},asendcmd=c='{cmds}',lowpass=f=20000,"
      f"afade=t=out:st={END - 0.6:.2f}:d=0.6[m];"
      f"{impact}[fx];[m][fx]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]")
run(['ffmpeg', '-y', '-i', video, '-i', SONG, '-i', os.path.join(LOGOS, 'yamore.png'),
     '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow',
     '-b:v', '14M', '-maxrate', '18M', '-bufsize', '28M', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '256k', '-t', f'{END:.3f}', '-movflags', '+faststart', OUT])
print(OUT)
