"""Slow Elena's walk down (default 0.8x) keeping transparency.

Re-times WORKDIR/seq/*.png (RGBA) by blending neighbouring frames in
premultiplied alpha, then encodes public/elena/walk_slow.webm (VP9 + alpha).
Usage: python3 scripts/elena-slow.py WORKDIR [speed]
"""

import glob
import os
import subprocess
import sys

import numpy as np
from PIL import Image

work = sys.argv[1]
speed = float(sys.argv[2]) if len(sys.argv) > 2 else 0.8
src = sorted(glob.glob(f"{work}/seq/*.png"))
frames = []
for f in src:
    a = np.asarray(Image.open(f)).astype(np.float32)
    a[..., :3] *= a[..., 3:4] / 255
    frames.append(a)
out_dir = f"{work}/slow"
os.makedirs(out_dir, exist_ok=True)
for f in glob.glob(f"{out_dir}/*.png"):
    os.remove(f)
n_out = int((len(frames) - 1) / speed) + 1
for i in range(n_out):
    t = i * speed
    k = int(t)
    w = t - k
    b = frames[min(k + 1, len(frames) - 1)]
    c = frames[k] * (1 - w) + b * w
    alpha = c[..., 3:4]
    c[..., :3] = np.where(alpha > 0, c[..., :3] * 255 / np.maximum(alpha, 1e-3), 0)
    Image.fromarray(c.clip(0, 255).astype(np.uint8), "RGBA").save(f"{out_dir}/{i + 1:04d}.png")
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-framerate", "24", "-i", f"{out_dir}/%04d.png",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "14",
     "-auto-alt-ref", "0", "public/elena/walk_slow.webm"], check=True)
print(n_out, "frames")
