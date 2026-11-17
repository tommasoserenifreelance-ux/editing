"""MIRROR 6 source prep: one locked-off full-body take (MIRROR.6.mov) cut on
reference 6's grid, the close shots punched in from the wide.
Usage: python3 mirror6_build.py MIRROR.6.mov OUT_DIR
Shots (edit frames @24 fps; reference cuts 2.68 / 4.44 / 6.56 / 8.16 s):
  1   0- 63  wide, finishes buttoning, adjusts tie   src   0- 63
  2  64-106  torso close-up 2.2x, unbuttons the       src 434-476
             jacket - cut once it is open
  3 107-156  wide, takes the jacket off (whole move)  src 560-609
  4 157-195  detail 1.8x, jacket in hand by the leg,  src 612-650
             starts folding it
  5 196-244  wide, jacket over the shoulder, turns   src 852-900
             and walks out right (empty room at the end)
Slightly brighter neutral grade, flesh-tone reds, greens desaturated (green cast from the hedge
wall); crops scaled with lanczos before sharpening.
"""
import subprocess, sys, os

SRC, OUT = sys.argv[1], sys.argv[2]
# a little brighter than MIRROR 5, neutral whites like the other videos,
# flesh tone from the reds only (no yellow cast), greens desaturated
GRADE = ("curves=master='0/0 0.25/0.24 0.5/0.52 0.8/0.81 1/0.94',eq=contrast=1.06:saturation=1.05,"
         "colorbalance=rm=0.03:bm=-0.01:rh=-0.01:bh=0.02,"
         "huesaturation=saturation=0.45:colors=r:strength=60,"
         "huesaturation=saturation=-0.75:intensity=-0.06:colors=g:strength=40")
SHARP = "unsharp=7:7:1.2:7:7:0,unsharp=3:3:0.75:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "11", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]

def crop(z, cx, cy):
    w, h = int(1080 / z) // 2 * 2, int(1920 / z) // 2 * 2
    x = max(0, min(1080 - w, int(cx - w / 2))); y = max(0, min(1920 - h, int(cy - h / 2)))
    return f"crop={w}:{h}:{x}:{y},scale=1080:1920:flags=lanczos"

def tilt(z, cx, y_from, y_to, n):
    w, h = int(1080 / z) // 2 * 2, int(1920 / z) // 2 * 2
    x = max(0, min(1080 - w, int(cx - w / 2)))
    a = max(0, min(1920 - h, int(y_from - h / 2))); b = max(0, min(1920 - h, int(y_to - h / 2)))
    u = f"(n/{n - 1})"
    ease = f"({u}*{u}*(3-2*{u}))"
    return f"crop={w}:{h}:{x}:'{a}+({b}-{a})*{ease}',scale=1080:1920:flags=lanczos"

SHOTS = [  # (src start, frames, extra filter)
    (0, 64, None),
    (434, 43, crop(2.2, 470, 640)),
    (560, 50, None),
    (612, 39, crop(1.8, 540, 1150)),
    (852, 49, None),
]
parts = []
for k, (a, n, ex) in enumerate(SHOTS):
    f = f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS,{GRADE}"
    if ex: f += f",{ex}"
    parts.append(f + f",{SHARP},setsar=1[p{k}];")
fc = "".join(parts) + "".join(f"[p{k}]" for k in range(len(SHOTS))) + f"concat=n={len(SHOTS)}:v=1:a=0[v]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc, "-map", "[v]", *ENC,
                os.path.join(OUT, "MIRROR.6_sharp.mp4")], check=True)
