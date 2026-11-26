"""DHEA uomo pre-edit builder (IG only; derived from omega_build.py).
usage: omega_build.py yt|ig OUT SPEED [dry]
yt: full talk, pauses compressed, 16:9 with wide/close alternation.
ig: selected sections (SECT_IG), 9:16 speaker crops.
"""
import json, subprocess, sys, numpy as np
S = '/tmp/claude-0/-home-user-editing/80a2e44c-55fb-5633-9cd2-a538b271aca0/scratchpad/'
SRC = S + 'dheau_src/'; W = S + 'dheau/'; WP = S + f'dheau/{sys.argv[1]}_parts/'
MODE, OUT, SPEED = sys.argv[1], sys.argv[2], float(sys.argv[3]); DRY = len(sys.argv) > 4
db = np.load(SRC + 'db.npy'); SEAM = 92.625
TH = -40; MIN = 22; KEEP_AFTER = 0.13; KEEP_BEFORE = 0.08
# cut: false start 'titolo re- reale', micro-gaps in 'di EPA e di DHA', the 'ehh' before
# 'E come sempre' and the 'ahh' before 'compensi'
SECT_YT = [[(0.2, 79.2), (79.2, 101.98), (102.40, 103.17), (103.23, 103.49), (103.55, 104.07), (104.17, 128.85), (129.45, 147.12), (148.86, 157.45)]]
SECT_IG = json.load(open(W + 'sect_ig.json')) if MODE == 'ig' else None
SECT = SECT_YT if MODE == 'yt' else SECT_IG
pieces = []
for k, sec in enumerate(SECT):
    z = k % 2
    for (a, b) in sec:
        i0, i1 = int(a * 100), int(b * 100); q = db[i0:i1] < TH; s = None; cur = a
        for i in range(len(q) + 1):
            on = i < len(q) and q[i]
            if on and s is None: s = i
            if not on and s is not None:
                if i - s >= MIN and s == 0 and i < len(q):
                    cur = a + i / 100 - KEEP_BEFORE  # leading silence of a section: drop it
                elif i - s >= MIN and i == len(q) and s > 0:
                    b_trim = a + s / 100 + KEEP_AFTER  # trailing silence: drop it
                    pieces.append([cur, b_trim, z]); cur = None
                elif i - s >= MIN and s > 0 and i < len(q):
                    ps = a + s / 100 + KEEP_AFTER; pe = a + i / 100 - KEEP_BEFORE
                    if pe > ps:
                        pieces.append([cur, ps, z]); cur = pe
                        z ^= 1  # every cut changes framing, so no same-shot jump (looks like a stutter)
                s = None
        if cur is not None: pieces.append([cur, b, z])
q30 = lambda t: round(t * 30) / 30
pieces = [[q30(a), q30(b), z] for a, b, z in pieces if q30(b) - q30(a) >= 2 / 30]
tot = sum(b - a for a, b, z in pieces); print(len(pieces), 'pieces raw', round(tot, 2), '-> out', round(tot / SPEED, 2))
json.dump(pieces, open(W + f'pieces_{MODE}.json', 'w'))
if DRY: sys.exit()
if MODE == 'yt':
    F = ["scale=1920:1080:flags=lanczos", "crop=2880:1620:560:60,scale=1920:1080:flags=lanczos"]
else:
    F = ["crop=608:1080:591:0,scale=1080:1920:flags=lanczos", "crop=500:889:645:40,scale=1080:1920:flags=lanczos"]
subprocess.run(f'mkdir -p {WP}; rm -f {WP}p*.mp4', shell=True)
L = open(WP + 'list.txt', 'w'); n = 0
for a, b, z in pieces:
    segs = [('u1.mov', a, b)] if b <= SEAM else ([('u2.mov', a - SEAM, b - SEAM)] if a >= SEAM else [('u1.mov', a, SEAM), ('u2.mov', 0, b - SEAM)])
    for f, x0, x1 in segs:
        d = x1 - x0
        if d < 1 / 30: continue
        o = f'{WP}p{n:03d}.mp4'; n += 1
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{x0:.4f}', '-i', SRC + f, '-t', f'{d:.4f}', '-vf', F[z] + ',fps=30,setsar=1',
            '-af', f'afade=t=in:d=0.006,afade=t=out:st={max(0, d - 0.008):.4f}:d=0.008', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', o], check=True)
        L.write(f"file '{o}'\n")
L.close()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', WP + 'list.txt', '-filter_complex', f'[0:v]setpts=PTS/{SPEED},fps=30[v];[0:a]atempo={SPEED},loudnorm=I=-15:TP=-1.5:LRA=9[a]', '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', OUT], check=True)
print('done')
