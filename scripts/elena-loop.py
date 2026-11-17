"""Build the seamless one-stride walk loop (public/elena/walk_loop.webm).

Takes green screen frames 42-61 (already cut out by elena-compose.py) and
normalises them: in the source Elena walks slightly towards the camera, so
she grows ~6% during the stride and would visibly shrink every time the loop
restarts. Each frame is rescaled to the size of the first one, put on the
same floor line, and placed so her torso moves at constant speed; the
brightness is evened out and the hair steadied, so nothing flashes.
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
frames = []
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
    frames.append(canvas)

# Even out the light: in the room the light on her changes as she walks, so
# at every loop restart the brightness would jump. Each frame's colour is
# scaled so her upper body (sweater, face, hair) matches the average.
def upper_mean(img):
    a = np.asarray(img).astype(np.float32)
    m = a[..., 3] > 230
    ys, _ = np.nonzero(m)
    m[ys.min() + 600:] = False
    return a[..., :3][m].mean(0)

means = [upper_mean(c) for c in frames]
target = np.mean(means, axis=0)
arrs = []
for c, mean in zip(frames, means):
    a = np.asarray(c).astype(np.float32)
    a[..., :3] *= target / mean
    arrs.append(a)

# Steady hair: the matte of loose strands wobbles from frame to frame (and
# most at the loop restart), which reads as flashing on her head. In the head
# zone the outline (alpha only) is averaged with the neighbouring frames (circularly, as the loop
# repeats), after aligning the heads; the body below is left untouched.
HEAD_H, RAMP = 330, 80


def head_box(a):
    ys, xs = np.nonzero(a[..., 3] > 128)
    top = ys.min()
    hx = np.nonzero(a[top:top + 260, :, 3] > 128)[1].mean()
    return top, hx


boxes = [head_box(a) for a in arrs]
n = len(arrs)
out = []
for i, a in enumerate(arrs):
    top, hx = boxes[i]
    y0 = max(top - 20, 0)
    y1 = min(top + HEAD_H + RAMP, a.shape[0])
    acc = np.zeros((y1 - y0, a.shape[1]), np.float32)
    for d, w in ((-2, 0.1), (-1, 0.2), (0, 0.4), (1, 0.2), (2, 0.1)):
        b = arrs[(i + d) % n]
        tb, hb = boxes[(i + d) % n]
        dy, dx = int(round(tb - top)), int(round(hb - hx))
        acc += w * np.roll(np.roll(b[..., 3], -dy, axis=0), -dx, axis=1)[y0:y1]
    # only the outline (alpha) is averaged; face and hair colour stay sharp
    smooth = a[y0:y1].copy()
    smooth[..., 3] = acc
    ramp = np.ones((y1 - y0, 1, 1), np.float32)
    k = HEAD_H + 20
    if y1 - y0 > k:
        ramp[k:] = np.linspace(1, 0, y1 - y0 - k)[:, None, None]
    res = a.copy()
    res[y0:y1] = a[y0:y1] * (1 - ramp) + smooth * ramp
    out.append(res)

for i, a in enumerate(out):
    Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA").save(f"{out_dir}/{i + 1:04d}.png")
print("stride px:", round(torN - tor0, 1), "scale range:", round(h0 / hN, 3))
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-framerate", "24", "-i", f"{out_dir}/%04d.png",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "14",
     "-auto-alt-ref", "0", "public/elena/walk_loop.webm"], check=True)
