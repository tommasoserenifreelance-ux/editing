"""MIRROR 4 source prep: sharpened selects + slider whoosh down to the floor.
Usage: python3 mirror4_build.py MIRROR.4.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order;
   no frame where he is talking (lip tracking), mostly him tossing sheets away
 - MIRROR.4_ramp_sharp.mp4: the throw at 1x (1985-1995, locked-off wide, him
   centred), then a fast vertical slider move: the wide scrolls up out of
   frame and the floor shot (2022-2027) scrolls in from below, 12 frames with
   smootherstep easing and 180-degree motion blur, landing at 1x on the sheets
   on the floor (2028-2037). No slow motion.
 - MIRROR.4_c_sharp.mp4: 2038-2114 (stands up, walks out, empty room)
"""
import subprocess, sys, os
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
SHARP = "unsharp=7:7:0.8:7:7:0,unsharp=3:3:0.45:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]
# (first source frame, number of frames) - edit cuts follow reference 4
SELECTS = [(89, 8), (490, 5), (1186, 5), (163, 34), (805, 34), (1556, 23),
           (924, 34), (1706, 22), (1291, 23), (1954, 31)]

def cut(ranges, out):
    # trim + concat keeps the list order (select would sort by source frame)
    parts = "".join(f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS[p{i}];"
                    for i, (a, n) in enumerate(ranges))
    cat = "".join(f"[p{i}]" for i in range(len(ranges)))
    fc = f"{parts}{cat}concat=n={len(ranges)}:v=1:a=0,{SHARP}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc,
                    "-map", "[v]", *ENC, out], check=True)

cut(SELECTS, os.path.join(OUT, "MIRROR.4_a_sharp.mp4"))
cut([(2038, 77)], os.path.join(OUT, "MIRROR.4_c_sharp.mp4"))
if os.environ.get("SKIP_RAMP"):
    sys.exit(0)

# ---- throw + slider whoosh + floor ----
def frames(a, b):
    """sharpened source frames a..b-1 as float32 RGB arrays"""
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-an", "-vf",
                        f"trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,{SHARP}",
                        "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(p, np.uint16).reshape(-1, H, W, 3).astype(np.float32)

THROW = frames(1985, 1996)          # 11 frames at 1x, sheets leave his hands on 1988
OUTG = frames(1996, 2002)           # 6 frames: wide keeps playing while it scrolls up
INC = frames(2022, 2028)            # 6 frames: floor shot scrolls in from below
LAND = frames(2028, 2038)           # 10 frames at 1x on the sheets
N = 12
def ease(u): return u * u * u * (u * (6 * u - 15) + 10)
pos = [H * ease(i / N) for i in range(N + 1)]   # scroll offset at frame boundaries
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le",
    "-s", f"{W}x{H}", "-r", "24", "-i", "-", *ENC, os.path.join(OUT, "MIRROR.4_ramp_sharp.mp4")],
    stdin=subprocess.PIPE)
def put(img): enc.stdin.write(np.clip(img, 0, 65535).round().astype(np.uint16).tobytes())
for f in THROW: put(f)
for i in range(N):
    top, bot = OUTG[min(i, 5)], INC[max(0, i - 6)]
    canvas = np.concatenate([top, bot], 0)       # wide above, floor below
    p0 = (pos[i] + pos[i + 1]) / 2
    half = (pos[i + 1] - pos[i]) / 2 / 2         # 180-degree shutter
    subs = np.linspace(p0 - half, p0 + half, 9)
    acc = np.zeros((H, W, 3), np.float32)
    for y in subs:
        y0 = int(round(np.clip(y, 0, H)))
        acc += canvas[y0:y0 + H]
    put(acc / len(subs))
for f in LAND: put(f)
enc.stdin.close(); enc.wait()
print("ramp frames", len(THROW) + N + len(LAND))
