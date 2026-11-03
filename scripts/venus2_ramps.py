"""Renders the speed-ramped shots of the Venus2 reel.

    python3 scripts/venus2_ramps.py RAW_DIR [NAME ...]

RAW_DIR holds the original 50 fps clips (VENUS.*.30.10.mp4 from the
footage-nightlife release, saved as n_<name>.mp4); n_4stab.mp4 is clip 4
stabilized with ffmpeg's vidstabdetect/vidstabtransform (smoothing=40,
optzoom=1). Each ramp plays its clip
from `at` with the speed going linearly from r0 to r1 over `frames` frames at
30 fps; in-between source frames are blended so slow motion stays smooth.
Writes public/venus2/ramps/<name>.mp4, a few frames longer than the cut.
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

W, H, SRC_FPS, FPS = 1080, 1920, 50, 30
OUT = Path(__file__).resolve().parent.parent / "public" / "venus2" / "ramps"

# name: (clip, at in seconds, frames, r0, r1). Keep in sync with
# src/Venus2/timeline.ts.
RAMPS = {
    "c4-intro": ("4stab", 0.0, 58, 0.8, 0.8),
    "c9-intro": ("9", 0.0, 28, 1.6, 0.6),
    "ballerina-drop": ("ballerina", 0.55, 30, 0.5, 1.5),
    "dance-ramp": ("dance", 0.3, 29, 2.0, 0.4),
    "ballerina-mid": ("ballerina", 4.7, 29, 0.7, 0.5),
    "ballerina-end": ("ballerina", 3.7, 33, 0.4, 1.2),
}
EXTRA = 6


def render(name, clip, at, frames, r0, r1, raw_dir):
    total = frames + EXTRA
    # Source seconds after `at` for each output frame; past the cut the speed
    # stays at r1.
    i = np.arange(total, dtype=float)
    k = (r1 - r0) / frames
    within = r0 * i + k * i * i / 2
    tail = r0 * frames + k * frames * frames / 2 + r1 * (i - frames)
    offset = np.where(i <= frames, within, tail) / FPS

    decoder = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", str(at), "-i", str(raw_dir / f"n_{clip}.mp4"),
         "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    encoder = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
         "-preset", "fast", "-crf", "18", "-g", "15", "-pix_fmt", "yuv420p",
         str(OUT / f"{name}.mp4")],
        stdin=subprocess.PIPE,
    )
    size = W * H * 3
    frames_read = []  # (index, frame) of the last two source frames

    def read():
        raw = decoder.stdout.read(size)
        if len(raw) < size:
            return None
        return np.frombuffer(raw, np.uint8).reshape(H, W, 3)

    index = -1
    prev = cur = None
    for t in offset:
        q = t * SRC_FPS
        lo = int(np.floor(q))
        while index < lo + 1:
            nxt = read()
            if nxt is None:
                break
            prev, cur, index = cur, nxt, index + 1
        if prev is None or index < lo + 1:
            # Ran out of source: hold the last frame.
            frame = cur
        else:
            w = q - lo if index == lo + 1 else 1.0
            frame = (prev * (1 - w) + cur * w).astype(np.uint8)
        encoder.stdin.write(frame.tobytes())
    encoder.stdin.close()
    encoder.wait()
    decoder.kill()
    end = at + offset[frames]
    print(f"{name}: {clip} {at:.2f}-{end:.2f} s")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    raw_dir = Path(sys.argv[1])
    only = sys.argv[2:]
    for name, spec in RAMPS.items():
        if not only or name in only:
            render(name, *spec, raw_dir)
