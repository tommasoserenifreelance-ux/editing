"""Yamorè x Rivoire aftermovie: beat-synced cut list rendered with ffmpeg.

Usage: python3 build.py <clips_dir> <song.mp3> <out.mp4>
"""
import os, subprocess, sys, tempfile

CLIPS, SONG, OUT = sys.argv[1:4]
HERE = os.path.dirname(os.path.abspath(__file__))
LOGOS = os.path.join(HERE, '..', 'public', 'logos')
FPS, W, H = 25, 1080, 1920

# (start_s, clip_no, in_point_s, look) ; look: c=colour, bw=black&white
# Cut points sit on the song's beats (129 BPM, beat ~0.465 s).
EDL = [
    (0.00, 1, 0.00, 'c'),    # Rivoire sign - branding opener
    (0.93, 18, 0.30, 'c'),   # House of Negroni
    (1.81, 19, 0.00, 'c'),   # Palazzo Vecchio
    (2.28, 2, 0.20, 'c'),    # giraffe
    (2.74, 3, 0.50, 'bw'),   # terrace crowd, breath before the build
    (3.69, 12, 0.30, 'c'),   # DJ
    (4.18, 4, 0.00, 'c'),
    (4.64, 4, 1.60, 'c'),    # stutter jump on same clip
    (5.11, 7, 0.00, 'c'),
    (5.60, 6, 0.30, 'c'),
    (6.06, 13, 0.00, 'c'),   # half-beat micro cuts
    (6.29, 17, 0.00, 'bw'),
    (6.52, 5, 0.00, 'c'),
    (6.99, 5, 2.00, 'c'),
    (7.48, 9, 0.00, 'c'),
    (7.94, 22, 1.00, 'bw'),  # energy dip -> b&w
    (8.43, 22, 3.00, 'c'),
    (8.89, 10, 0.30, 'c'),
    (9.36, 14, 0.50, 'c'),
    (9.82, 11, 0.30, 'bw'),
    (10.31, 8, 0.20, 'c'),
    (10.77, 20, 0.00, 'c'),
    (11.26, 21, 0.00, 'c'),
    (11.73, 21, 1.00, 'c'),
    (12.21, 15, 0.30, 'c'),
    (12.68, 16, 0.50, 'bw'),
    (13.14, 18, 1.00, 'c'),  # brand re-flash
    (13.37, 1, 0.60, 'c'),
    (13.61, 12, 1.50, 'c'),
    (14.09, 9, 0.38, 'c'),
    (14.56, 3, 1.20, 'c'),
    (15.05, 7, 0.40, 'c'),
    (15.28, 13, 0.40, 'bw'),
    (15.51, 14, 1.80, 'c'),
    (15.98, 20, 0.36, 'c'),
    (16.44, 'yamore', 0, 'logo'),
    (18.34, 'rivoire', 0, 'logo'),
]
END = 20.16
FLASH_AT = {1.81, 3.69, 7.94, 12.21, 13.14}  # white flash frames on these cuts
LOWPASS_FROM = 16.44

GRADE = ("eq=contrast=1.12:saturation=1.18:gamma=0.96,"
         "colorbalance=rs=0.05:gs=0.0:bs=-0.05:rh=0.03:bh=-0.03,"
         "vignette=PI/5")
BW = "hue=s=0,eq=contrast=1.25:gamma=0.92,vignette=PI/5"


def clip_path(n):
    for f in os.listdir(CLIPS):
        nums = ''.join(c if c.isdigit() else ' ' for c in f).split()
        if nums and int(nums[0]) == n and f.lower().endswith('.mp4'):
            return os.path.join(CLIPS, f)
    raise FileNotFoundError(n)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


tmp = tempfile.mkdtemp(prefix='yamore_')
parts = []
frames = [round(s * FPS) for s, *_ in EDL] + [round(END * FPS)]
for i, (start, clip, inp, look) in enumerate(EDL):
    n = frames[i + 1] - frames[i]
    out = os.path.join(tmp, f'p{i:02d}.mp4')
    enc = ['-r', str(FPS), '-frames:v', str(n), '-an', '-c:v', 'libx264',
           '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out]
    if look == 'logo':
        width = 620 if clip == 'yamore' else 460
        d = n / FPS
        vf = (f"[1]scale={width}:-1,format=rgba,fade=in:st=0:d=0.25:alpha=1,"
              f"scale=w='{width}*(1+0.04*t/{d:.2f})':h=-1:eval=frame[l];"
              f"[0][l]overlay=(W-w)/2:(H-h)/2:shortest=1")
        run(['ffmpeg', '-y', '-f', 'lavfi', '-i', f'color=black:s={W}x{H}:r={FPS}:d={d:.2f}',
             '-loop', '1', '-i', os.path.join(LOGOS, f'{clip}.png'),
             '-filter_complex', vf] + enc)
    else:
        vf = (f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              + (BW if look == 'bw' else GRADE))
        if start in FLASH_AT:  # 2 overexposed frames at the head of the shot
            vf += f",eq=brightness=0.6:contrast=0.6:enable='lt(n,2)'"
        run(['ffmpeg', '-y', '-ss', f'{inp:.3f}', '-i', clip_path(clip), '-vf', vf] + enc)
    parts.append(out)

with open(os.path.join(tmp, 'list.txt'), 'w') as f:
    f.writelines(f"file '{p}'\n" for p in parts)
video = os.path.join(tmp, 'video.mp4')
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'), '-c', 'copy', video])

# Grain + small Yamorè watermark on the footage (not on the logo cards).
logo_t = frames[-3] / FPS
# Low-pass sweep 18 kHz -> 250 Hz over the end cards, then a short fade.
steps = 40
cmds = ';'.join(
    f"{LOWPASS_FROM + (END - LOWPASS_FROM) * k / steps:.3f} lowpass f "
    f"{int(18000 * (250 / 18000) ** (k / steps))}" for k in range(steps + 1))
fc = (f"[0]noise=alls=7:allf=t[g];"
      f"[2]scale=150:-1,format=rgba,colorchannelmixer=aa=0.85[wm];"
      f"[g][wm]overlay=(W-w)/2:70:enable='lt(t,{logo_t:.2f})'[v];"
      f"[1]asendcmd=c='{cmds}',lowpass=f=18000,afade=t=out:st={END - 0.6:.2f}:d=0.6[a]")
run(['ffmpeg', '-y', '-i', video, '-i', SONG, '-i', os.path.join(LOGOS, 'yamore.png'),
     '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow',
     '-b:v', '14M', '-maxrate', '18M', '-bufsize', '28M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-t', f'{END}',
     '-movflags', '+faststart', OUT])
print(OUT)
