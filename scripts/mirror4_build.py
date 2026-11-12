"""MIRROR 4 source prep.
Usage: python3 mirror4_build.py MIRROR.4.mov MIRROR.4.1.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order;
   no frame where he is talking or pulling a face (lip tracking + review),
   mostly him tossing sheets away
 - MIRROR.4_b_sharp.mp4: MIRROR.4.1.mov (the re-cut ending: throw, the camera
   following the sheets down to the floor, stands up, walks out, empty room)
   as is, 1x, sharpened
"""
import subprocess, sys, os
import numpy as np

SRC, END_SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1080, 1920
SHARP = "unsharp=7:7:1.0:7:7:0,unsharp=3:3:0.6:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]
# (first source frame, number of frames) - edit cuts follow reference 4
SELECTS = [(89, 8), (490, 5), (1186, 5), (1600, 34), (1020, 34), (1390, 23),
           (924, 34), (1706, 22), (1291, 23), (312, 29)]

def cut(ranges, out):
    # trim + concat keeps the list order (select would sort by source frame)
    parts = "".join(f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS[p{i}];"
                    for i, (a, n) in enumerate(ranges))
    cat = "".join(f"[p{i}]" for i in range(len(ranges)))
    fc = f"{parts}{cat}concat=n={len(ranges)}:v=1:a=0,{SHARP}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc,
                    "-map", "[v]", *ENC, out], check=True)

cut(SELECTS, os.path.join(OUT, "MIRROR.4_a_sharp.mp4"))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", END_SRC, "-an", "-vf", SHARP, *ENC,
                os.path.join(OUT, "MIRROR.4_b_sharp.mp4")], check=True)
