"""Build the seamless one-stride walk loop (public/elena/walk_loop.webm).

Takes green screen frames 42-61 (already cut out by elena-compose.py) and
normalises them: in the source Elena walks slightly towards the camera, so
she grows ~6% during the stride and would visibly shrink every time the loop
restarts. Each frame is rescaled to the size of the first one, put on the
same floor line, and placed so her torso moves at constant speed.
Usage: python3 scripts/elena-loop.py WORKDIR   (reads WORKDIR/rgba)
"""

import os
import subprocess
import sys

import numpy as np
from PIL import Image

work = sys.argv[1]
FIRST, N = 42, 19  # frames 42..60 are played; 61 is the next loop's 42
out_dir = f"{work}/loop"
os.makedirs(out_dir, exist_ok=True)


def measure(i):
    im = Image.open(f"{work}/rgba/{i:04d}.png")
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 200)
    top, bottom = ys.min(), ys.max()
    torso = xs[ys < top + 650].mean()
    return im, top, bottom, torso


data = [measure(FIRST + i) for i in range(N + 1)]
_, top0, bot0, tor0 = data[0]
_, topN, botN, torN = data[N]
h0, hN = bot0 - top0, botN - topN
for i in range(N):
    im, _, _, torso = data[i]
    f = i / N
    h = h0 + (hN - h0) * f  # smooth trend, ignores step-by-step bobbing
    base = bot0 + (botN - bot0) * f
    s = h0 / h
    scaled = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    target_x = tor0 + (torN - tor0) * f
    ox = round(target_x - torso * s)
    oy = round(bot0 - base * s)
    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
    canvas.alpha_composite(scaled, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
    canvas.save(f"{out_dir}/{i + 1:04d}.png")
print("stride px:", round(torN - tor0, 1), "scale range:", round(h0 / hN, 3))
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-framerate", "24", "-i", f"{out_dir}/%04d.png",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "14",
     "-auto-alt-ref", "0", "public/elena/walk_loop.webm"], check=True)
