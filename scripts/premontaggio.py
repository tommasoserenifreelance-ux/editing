import json, subprocess, sys
import numpy as np
SRC = "/home/user/editing/public/allenamento/fast"
tx = json.load(open(sys.argv[1]))
out_json, out_mp4 = sys.argv[2], sys.argv[3]

# Hand-picked cuts (seconds in the sped-up clip) for flubs and mumbles.
EXTRA_CUTS = {
    "8124": [[20.5, 21.04]],  # mumbled "Una volta che" -> "La serie da 10 diventa..."
    "8126": [[1.44, 1.86], [5.04, 5.12]],  # 2nd "l'equilibrio"; stray "è"
}
GAP = 0.22      # pauses longer than this are removed
WIN = 0.01      # energy window (s)

def energy(clip):
    pcm = subprocess.run(["ffmpeg","-v","error","-i",f"{SRC}/IMG_{clip}.mp4","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    w = int(16000 * WIN); n = len(x) // w
    db = 20 * np.log10(np.sqrt((x[: n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    return db, len(x) / 16000

pieces = []
for name in sorted(tx):
    clip = name[4:8]
    db, dur = energy(clip)
    thr = np.percentile(db, 20) + 2
    quiet = db < thr
    ws = tx[name]
    # Clip edges from the audio: the transcript starts the first word at 0.
    floor = np.percentile(db, 10)
    talk = np.where(db > floor + 15)[0]
    start = max(0.0, talk[0] * WIN - 0.08)
    end = min(dur, (talk[-1] + 1) * WIN + 0.15)
    # Only clear pauses between two well-timed words are cut, with generous
    # margins: the transcript tends to start words a little late.
    cuts = []
    for (pa, pb, *_), (na, nb, *_) in zip(ws, ws[1:]):
        if pb - pa < 0.1 or nb - na < 0.1:
            continue  # a mis-timed word may really sit in this "pause"
        a, b = pb + 0.1, na - 0.16
        if b - a >= 0.1:
            cuts.append([a, b])
    cuts += EXTRA_CUTS.get(clip, [])
    cuts.sort()
    merged = []
    for a, b in cuts:
        if merged and a <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    t = start
    for a, b in merged:
        if a > t + 0.05:
            pieces.append((clip, round(t, 3), round(a, 3)))
        t = max(t, b)
    if end > t + 0.05:
        pieces.append((clip, round(t, 3), round(end, 3)))

json.dump([{"clip": c, "from": a, "to": b} for c, a, b in pieces], open(out_json, "w"), indent=1)
# Render: trim each piece, 8 ms audio fades at the joins, then concatenate.
args, fc = [], []
inputs = {}
for c, *_ in pieces:
    if c not in inputs:
        inputs[c] = len(inputs); args += ["-i", f"{SRC}/IMG_{c}.mp4"]
for k, (c, a, b) in enumerate(pieces):
    i = inputs[c]; d = b - a
    fc.append(f"[{i}:v]trim={a}:{b},setpts=PTS-STARTPTS[v{k}]")
    fc.append(f"[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={max(0,d-0.008):.3f}:d=0.008[a{k}]")
fc.append("".join(f"[v{k}][a{k}]" for k in range(len(pieces))) + f"concat=n={len(pieces)}:v=1:a=1[v][a]")
subprocess.run(["ffmpeg","-v","error","-y",*args,"-filter_complex",";".join(fc),"-map","[v]","-map","[a]",
    "-c:v","libx264","-crf","18","-preset","fast","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",out_mp4],check=True)
print("pieces", len(pieces), "total", round(sum(b - a for _, a, b in pieces), 2))
