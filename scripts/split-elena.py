"""Cut the Elena panorama (out/elena-panorama.mp4) into one video per slide.

Each slide gets its own uninterrupted walk: it opens with Elena entering from
the left edge and closes as she leaves on the right;
also writes a scaled preview of the whole panorama. Constants mirror
src/Elena/index.tsx.  Run: python3 scripts/split-elena.py
"""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "out" / "elena-panorama.mp4"
OUT = ROOT / "export" / "elena"
FPS, SLIDE_W, SLIDES, WALK = 24, 1080, 6, 58

OUT.mkdir(parents=True, exist_ok=True)
for k in range(SLIDES):
    t_s, t_e = k * WALK, (k + 1) * WALK
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(SRC),
         "-vf", f"select=between(n\\,{t_s}\\,{t_e - 1}),setpts=N/{FPS}/TB,"
                f"crop={SLIDE_W}:1350:{k * SLIDE_W}:0", "-an",
         "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
         str(OUT / f"slide-0{k + 1}.mp4")], check=True)
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-i", str(SRC),
     "-vf", f"scale={SLIDES * 360}:-2", "-an", "-c:v", "libx264", "-crf", "18",
     "-pix_fmt", "yuv420p", str(OUT / "anteprima-carosello.mp4")], check=True)
print("ok")
