"""Remove light flicker at one frequency (the restaurant lights pulse at
about 11.4 Hz in the 50 fps takes) without touching motion.

The frame is split into 40 px cells; each cell's brightness over time is
notched at that frequency (zero-phase, in the FFT domain), and every pixel
is scaled by its cell's corrected/original ratio, interpolated smoothly and
clamped to +-4% so a moving hand can't pick up a halo.

Uso: python3 scripts/rb_deflicker.py <in.mp4> <out.mp4> <hz>
"""

import subprocess
import sys

import numpy as np

CELL = 40
FPS = 50


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True).stdout.strip()
    w, h = map(int, out.split(","))
    return w, h


def frames(path, w, h):
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-map", "0:v",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    size = w * h * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    p.wait()


def main(src, dst, hz):
    w, h = probe(src)
    gh, gw = h // CELL, w // CELL

    # Pass 1: cell brightness over time.
    cells = []
    for f in frames(src, w, h):
        y = f[: gh * CELL, : gw * CELL].astype(np.float32).mean(axis=2)
        cells.append(y.reshape(gh, CELL, gw, CELL).mean(axis=(1, 3)))
    cells = np.array(cells)
    n = len(cells)

    # Notch the flicker frequency out of every cell's time series.
    spec = np.fft.rfft(cells, axis=0)
    fr = np.fft.rfftfreq(n, 1 / FPS)
    keep = 1 - np.exp(-(((fr - hz) / 0.5) ** 2))
    fixed = np.fft.irfft(spec * keep[:, None, None], n=n, axis=0)
    gain = np.clip((fixed + 1) / (cells + 1), 0.96, 1.04).astype(np.float32)

    # Smooth per-pixel gain from the cell grid (bilinear over cell centres).
    ys = (np.arange(h) + 0.5) / CELL - 0.5
    xs = (np.arange(w) + 0.5) / CELL - 0.5
    y0 = np.clip(np.floor(ys).astype(int), 0, gh - 1)
    x0 = np.clip(np.floor(xs).astype(int), 0, gw - 1)
    y1 = np.clip(y0 + 1, 0, gh - 1)
    x1 = np.clip(x0 + 1, 0, gw - 1)
    wy = np.clip(ys - y0, 0, 1)[:, None]
    wx = np.clip(xs - x0, 0, 1)[None, :]

    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "12",
         "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    for i, f in enumerate(frames(src, w, h)):
        g = gain[i]
        full = ((g[y0][:, x0] * (1 - wx) + g[y0][:, x1] * wx) * (1 - wy)
                + (g[y1][:, x0] * (1 - wx) + g[y1][:, x1] * wx) * wy)
        out = np.clip(f.astype(np.float32) * full[:, :, None] + 0.5, 0, 255)
        enc.stdin.write(out.astype(np.uint8).tobytes())
    enc.stdin.close()
    enc.wait()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]))
