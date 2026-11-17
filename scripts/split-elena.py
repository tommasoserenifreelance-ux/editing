"""Cut the Elena panorama (out/elena-panorama.mp4) into one video per slide.

Each slide gets the stretch of time in which Elena is inside it, so it opens
with her entering from the left edge and closes as she leaves on the right;
also writes a scaled preview of the whole panorama. Constants mirror
src/Elena/index.tsx.  Run: python3 scripts/split-elena.py
"""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "out" / "elena-panorama.mp4"
OUT = ROOT / "export" / "elena"
FPS, SLIDE_W, SLIDES, LOOP = 24, 1080, 6, 19
STRIDE = 347 * 0.7  # torso travel per loop, as in index.tsx
BODY_LEFT, BODY_W = 202, 235
START_X = -BODY_LEFT - BODY_W - 20
V = STRIDE / LOOP  # px per frame
TOTAL = int(subprocess.check_output(
    ["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0",
     "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", str(SRC)]
).decode().strip().strip(","))

OUT.mkdir(parents=True, exist_ok=True)
for k in range(SLIDES):
    t_s = max(0, (k * SLIDE_W - 20 - (START_X + BODY_LEFT + BODY_W)) / V)
    t_e = min(TOTAL, ((k + 1) * SLIDE_W + 20 - (START_X + BODY_LEFT)) / V)
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t_s / FPS:.3f}",
         "-i", str(SRC), "-t", f"{(t_e - t_s) / FPS:.3f}",
         "-vf", f"crop={SLIDE_W}:1350:{k * SLIDE_W}:0", "-an",
         "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
         str(OUT / f"slide-0{k + 1}.mp4")], check=True)
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-i", str(SRC),
     "-vf", f"scale={SLIDES * 360}:-2", "-an", "-c:v", "libx264", "-crf", "18",
     "-pix_fmt", "yuv420p", str(OUT / "anteprima-carosello.mp4")], check=True)
print("ok", TOTAL, "frames")
