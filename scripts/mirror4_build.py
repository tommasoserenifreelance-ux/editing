"""MIRROR 4 source prep: sharpened selects + speed-ramped paper fall.
Usage: python3 mirror4_build.py MIRROR.4.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order
 - MIRROR.4_ramp_sharp.mp4: source 1985-2037 (throw -> camera follows the
   sheets to the floor) speed-ramped: 1x throw, accelerates to 3x on the fall
   (motion-blurred), decelerates to ~0.08x and settles on the sheets
 - MIRROR.4_c_sharp.mp4: 2038-2112 (stands up, walks out, empty room)
"""
import subprocess, sys, os
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
SHARP = "unsharp=7:7:0.8:7:7:0,unsharp=3:3:0.45:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]
# (first source frame, number of frames) - edit cuts follow reference 4
SELECTS = [(1306, 8), (490, 5), (1160, 5), (129, 34), (236, 34), (1668, 23),
           (806, 34), (1277, 22), (576, 23), (1954, 31)]

def cut(ranges, out):
    # trim + concat keeps the list order (select would sort by source frame)
    parts = "".join(f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS[p{i}];"
                    for i, (a, n) in enumerate(ranges))
    cat = "".join(f"[p{i}]" for i in range(len(ranges)))
    fc = f"{parts}{cat}concat=n={len(ranges)}:v=1:a=0,{SHARP}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc,
                    "-map", "[v]", *ENC, out], check=True)

cut(SELECTS, os.path.join(OUT, "MIRROR.4_a_sharp.mp4"))
cut([(2038, 75)], os.path.join(OUT, "MIRROR.4_c_sharp.mp4"))
if os.environ.get("SKIP_RAMP"):
    sys.exit(0)

# ---- speed ramp ----
R0, R1, NOUT, K = 1985, 2037, 49, 8          # source span, output frames, interp factor
v = np.empty(NOUT)
for i in range(NOUT):
    if i < 5: v[i] = 1.0
    elif i < 9: u = (i - 5 + 0.5) / 4; v[i] = 1 + 2 * (u * u * (3 - 2 * u))
    elif i < 12: v[i] = 3.0
    else: u = (i - 12 + 0.5) / 37; v[i] = 0.08 + 2.92 * (1 - u) ** 3
v *= (R1 - R0) / v.sum()
pos = R0 + np.concatenate([[0], np.cumsum(v)[:-1]])  # source frame shown at each output frame
print("speeds", np.round(v, 2).tolist())
print("positions", np.round(pos, 1).tolist())
# interpolate source (with 1-frame margins) to K x frame rate
interp = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-an", "-vf",
    f"select='between(n\\,{R0 - 1}\\,{R1 + 1})',setpts=N/24/TB,{SHARP},"
    f"minterpolate=fps={24 * K}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1",
    "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb48le",
    "-s", f"{W}x{H}", "-r", "24", "-i", "-", *ENC, os.path.join(OUT, "MIRROR.4_ramp_sharp.mp4")],
    stdin=subprocess.PIPE)
fsz = W * H * 3 * 2
buf, base = {}, (R0 - 1) * K       # sub-frame index -> image
nxt = base
def get(j):
    global nxt
    while nxt <= j:
        b = interp.stdout.read(fsz)
        if len(b) < fsz: break
        buf[nxt] = np.frombuffer(b, np.uint16).reshape(H, W, 3)
        nxt += 1
    return buf[min(j, nxt - 1)]
for i in range(NOUT):
    # 180-degree shutter: blend sub-frames over half the source distance travelled
    half = max(v[i] * 0.5, 1.0 / K) / 2
    js = np.arange(int(np.ceil((pos[i] - half) * K)), int(np.floor((pos[i] + half) * K)) + 1)
    js = js[js >= base] if len(js) else np.array([int(round(pos[i] * K))])
    acc = np.zeros((H, W, 3), np.float64)
    for j in js: acc += get(int(j))
    enc.stdin.write((acc / len(js)).round().astype(np.uint16).tobytes())
    for k in [k for k in buf if k < js.min() - K]: del buf[k]
enc.stdin.close(); enc.wait(); interp.kill()
