"""MIRROR 5 source prep (reference 5: triptych intro, then single shots).
Usage: python3 mirror5_build.py MIRROR.5.1.mov MIRROR.5.2.mov MIRROR.5.mov OUT_DIR
 - MIRROR.5_tri_sharp.mp4 (94 frames, 0-3.92 s): split screen like the
   reference - top-left full body grey look (5.1, 168-207 = from 7.0 s, at
   0.43x, motion-interpolated), top-right full body black look (5, 240-333,
   centred), bottom medium brown (5.2, 1020-1113, hands in the jacket, looks into the lens) - three
   different looks, no repeat
 - MIRROR.5_b_sharp.mp4 (232 frames): the single shots on the reference's
   cut grid - 5 553-614 (black look close-up, fixes the tie), 5.1 30-52
   (grey look, adjusts his collar into the lens), 5.1 214-241 (shoe step,
   foot lands), 5.2 626-660 (buttons the jacket), 5 1279-1306 (black look
   shoes),
   5.2 804-859 (full body, turns three-quarters and back)
No frame where he is talking or smiling (lip tracking + review). Grade on
every source: exposure down, more contrast, stronger sharpening.
"""
import subprocess, sys, os

A, B, C, OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SHARP = ("curves=master='0/0 0.25/0.19 0.5/0.45 0.75/0.73 1/0.97',eq=contrast=1.08:saturation=1.04,"
         "unsharp=7:7:1.2:7:7:0,unsharp=3:3:0.75:3:3:0")
ENC = ["-c:v", "libx264", "-crf", "11", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]

def run(inputs, fc, out):
    args = ["ffmpeg", "-v", "error", "-y"]
    for i in inputs: args += ["-i", i]
    subprocess.run(args + ["-an", "-filter_complex", fc, "-map", "[v]", *ENC, out], check=True)

# brown look (input 1, MIRROR.5.2): highlights pulled down (white shirt, wall)
HL = "curves=master='0/0 0.55/0.53 0.8/0.72 1/0.88'"
# grey (input 0) and brown (input 1) looks: more flesh tone in the skin only
# (reds saturated), whites and wall stay neutral - no overall warm/yellow cast
WARM = "huesaturation=saturation=0.45:colors=r:strength=60"
def tr(i, a, n):
    f = f"[{i}:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS"
    if i == 1: f += f",{HL}"
    if i in (0, 1): f += f",{WARM}"
    return f

# triptych
fc = (f"{tr(0, 168, 40)},minterpolate=fps={24 * 94 / 40:.6f}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,"
      f"setpts=N/24/TB,trim=end_frame=94,{SHARP},scale=540:960:flags=lanczos[tl];"
      f"{tr(2, 240, 94)},{SHARP},scale=540:960:flags=lanczos[tr];"
      f"{tr(1, 1020, 94)},crop=1080:960:0:150,{SHARP}[bo];"
      f"[tl][tr]hstack[top];[top][bo]vstack[v]")
run([A, B, C], fc, os.path.join(OUT, "MIRROR.5_tri_sharp.mp4"))

# single shots, in edit order: (input, first frame, frames)
SHOTS = [(2, 553, 62), (0, 30, 23), (0, 214, 28), (1, 626, 35), (2, 1279, 28), (1, 804, 56)]
parts = "".join(f"{tr(i, a, n)}[p{k}];" for k, (i, a, n) in enumerate(SHOTS))
cat = "".join(f"[p{k}]" for k in range(len(SHOTS)))
run([A, B, C], f"{parts}{cat}concat=n={len(SHOTS)}:v=1:a=0,{SHARP}[v]",
    os.path.join(OUT, "MIRROR.5_b_sharp.mp4"))
