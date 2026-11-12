"""MIRROR 4 source prep.
Usage: python3 mirror4_build.py MIRROR.4.mov MIRROR.4.1.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order;
   no frame where he is talking or pulling a face (lip tracking + review),
   mostly him tossing sheets away
 - MIRROR.4_b_sharp.mp4: MIRROR.4.1.mov (the re-cut ending) as shot, 1x:
   throw and the camera's tilt down (0-47, cut as soon as the sheets read on
   the floor), then him standing up and walking out (55-94, ends as he
   clears the frame - no re-centring of the camera)
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
def read(path, extra=""):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", SHARP + extra,
                          "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
E = read(END_SRC)                                             # 132 frames
out = [E[k] for k in range(0, 48)]                            # throw + tilt to the sheets
out += [E[k] for k in range(55, 95)]                          # stands up, walks out
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
    "-s", f"{W}x{H}", "-r", "24", "-i", "-", *ENC, os.path.join(OUT, "MIRROR.4_b_sharp.mp4")],
    stdin=subprocess.PIPE)
for img in out: enc.stdin.write(np.ascontiguousarray(img).tobytes())
enc.stdin.close(); enc.wait()
print("ending frames", len(out))
