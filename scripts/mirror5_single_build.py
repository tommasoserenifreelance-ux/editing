"""MIRROR 04 split into one video per look (client: each outfit on its own).
Usage: python3 mirror5_single_build.py MIRROR.5.1.mov MIRROR.5.2.mov MIRROR.5.mov OUT_DIR [look ...]
Writes MIRROR.5_grigio_sharp.mp4, MIRROR.5_nero_sharp.mp4, MIRROR.5_marrone_sharp.mp4:
three (grey, brown) or five (black) long shots, back to back, cut on the 120 BPM grid of reference 5
(beats at 0.06 + 0.5 k s). No frame where he is talking (lip tracking).
Same grade as MIRROR 5: contrast curve, sharpening, flesh-tone reds on the
grey/brown looks, highlight roll-off on the brown look.
"""
import subprocess, sys, os

GREY, BROWN, BLACK, OUT = sys.argv[1:5]
SHARP = ("curves=master='0/0 0.25/0.19 0.5/0.45 0.75/0.73 1/0.97',eq=contrast=1.08:saturation=1.04,"
         "unsharp=7:7:1.2:7:7:0,unsharp=3:3:0.75:3:3:0")
HL = "curves=master='0/0 0.55/0.53 0.8/0.72 1/0.88'"
WARM = "huesaturation=saturation=0.45:colors=r:strength=60"
ENC = ["-c:v", "libx264", "-crf", "11", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]

# (first source frame, frames, extra filter)
LOOKS = {
    "grigio": (GREY, f"{WARM},", [
        (0, 61, None),     # wide-angle "mirror" shot, buttons the collar into the lens
        (312, 60, None),   # shoes, steps
        (89, 119, None),   # one take: leans into the mirror, steps back, full body, tie
    ]),
    "nero": (BLACK, "", [    # cut every 2 beats of track_nero (~63 BPM half-time)
        (175, 46, None),   # full body, collar
        (554, 45, None),   # tie detail, hands
        (1304, 46, None),  # shoes: foot settled, turns the toe (no tap), tilt up
        (300, 46, None),   # full body
        (500, 46, None),   # full body, turns to profile
    ]),
    "marrone": (BROWN, f"{HL},{WARM},", [  # cuts on track_marrone hits 2.59 / 5.63 / 8.21 s
        (1020, 62, None),  # full body, hands in the jacket
        (804, 73, None),   # full body, turns three-quarters and back, hands on hips
        (316, 62, None),   # flicks the jacket open and closes it
    ]),
}
for name, (src, pre, shots) in LOOKS.items():
    if len(sys.argv) > 5 and name not in sys.argv[5:]:
        continue
    parts = []
    for k, (a, n, ex) in enumerate(shots):
        f = f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS,{pre}{SHARP}"
        if ex: f += f",{ex}"
        parts.append(f + f",setsar=1[p{k}];")
    fc = "".join(parts) + "".join(f"[p{k}]" for k in range(len(shots))) + f"concat=n={len(shots)}:v=1:a=0[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-filter_complex", fc, "-map", "[v]",
                    *ENC, os.path.join(OUT, f"MIRROR.5_{name}_sharp.mp4")], check=True)
    print(name, sum(n for _, n, _ in shots), "frames")
