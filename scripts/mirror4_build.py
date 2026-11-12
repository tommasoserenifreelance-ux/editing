"""MIRROR 4 source prep.
Usage: python3 mirror4_build.py MIRROR.4.mov MIRROR.4.1.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order;
   no frame where he is talking or pulling a face (lip tracking + review),
   mostly him tossing sheets away
 - MIRROR.4_b_sharp.mp4: MIRROR.4.1.mov (the re-cut ending) reworked: throw
   at 1x (0-17), the camera's tilt down to the floor (18-50) sped up as a
   slider move (v = 1 + 2.5 sin^2, peak 3.5x, motion-interpolated blur),
   landing at 1x (50-54), then him standing up and walking out (55-131) with
   the handheld sway smoothed (vid.stab, smoothing 12, zoom 8%)
"""
import subprocess, sys, os
import numpy as np

SRC, END_SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1080, 1920
SHARP = "unsharp=7:7:1.0:7:7:0,unsharp=3:3:0.6:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]
# (first source frame, number of frames) - edit cuts follow reference 4
SELECTS = [(1186, 8), (592, 5), (864, 5), (1611, 22), (87, 12), (476, 22),
           (1294, 12), (240, 23), (1708, 22), (1396, 12), (1022, 22), (924, 23), (312, 29)]

def cut(ranges, out):
    # trim + concat keeps the list order (select would sort by source frame)
    parts = "".join(f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS[p{i}];"
                    for i, (a, n) in enumerate(ranges))
    cat = "".join(f"[p{i}]" for i in range(len(ranges)))
    fc = f"{parts}{cat}concat=n={len(ranges)}:v=1:a=0,{SHARP}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc,
                    "-map", "[v]", *ENC, out], check=True)

cut(SELECTS, os.path.join(OUT, "MIRROR.4_a_sharp.mp4"))
import cv2
def read(path, extra=""):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", SHARP + extra,
                          "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
E = read(END_SRC)                                             # 132 frames
K = 4                                                         # in-betweens for the slider blur
EI = read(END_SRC, f",trim=start_frame=16:end_frame=54,setpts=PTS-STARTPTS,"
          f"minterpolate=fps={24 * K}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
def sub(p):                                                   # source position -> image
    j = int(round((p - 16) * K)); j = min(max(j, 0), len(EI) - 1)
    return EI[j].astype(np.float32)
out = []
for k in range(0, 18): out.append(E[k].astype(np.float32))    # throw
M0, M1, NM = 18, 50, 14
v = np.array([1 + 2.5 * np.sin(np.pi * (j + 0.5) / NM) ** 2 for j in range(NM)])
v *= (M1 - M0) / v.sum()
p_ = M0 + np.concatenate([[0], np.cumsum(v)])
for j in range(NM):                                           # slider: blend across the travel
    qs = np.linspace(p_[j], p_[j] + v[j] * 0.5, max(2, int(np.ceil(v[j] * 0.5 * K)) + 1))
    out.append(sum(sub(q) for q in qs) / len(qs))
for k in range(M1, 55): out.append(E[k].astype(np.float32))   # landing
# stand-up / walk-out (its own shot in MIRROR.4.1, frames 55-131): handheld
# sway smoothed with vid.stab (smoothing 12, 8% zoom so no borders show)
trf = os.path.join(OUT, ".mirror4_vs.trf")
base = f"trim=start_frame=55,setpts=PTS-STARTPTS,"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", END_SRC, "-an", "-vf",
                base + f"vidstabdetect=shakiness=6:accuracy=15:result={trf}", "-f", "null", "-"], check=True)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", END_SRC, "-an", "-vf",
    base + f"vidstabtransform=input={trf}:smoothing=12:optzoom=0:zoom=8:interpol=bicubic,{SHARP}",
    "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
os.remove(trf)
for img in np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3): out.append(img.astype(np.float32))
print("slider speeds", np.round(v, 2).tolist())
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
    "-s", f"{W}x{H}", "-r", "24", "-i", "-", *ENC, os.path.join(OUT, "MIRROR.4_b_sharp.mp4")],
    stdin=subprocess.PIPE)
for img in out: enc.stdin.write(np.clip(img, 0, 255).round().astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print("ending frames", len(out))
