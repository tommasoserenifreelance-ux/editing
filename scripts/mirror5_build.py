"""MIRROR 5 source prep (reference 5: triptych intro, then single shots).
Usage: python3 mirror5_build.py MIRROR.5.1.mov MIRROR.5.2.mov OUT_DIR
 - MIRROR.5_tri_sharp.mp4 (94 frames, 0-3.92 s): split screen like the
   reference - top-left full body grey look (5.1, 147-207 at 0.65x,
   motion-interpolated), top-right full body brown look (5.2, 984-1077,
   centred), bottom medium brown (5.2, 804-897, head to thigh crop)
 - MIRROR.5_b_sharp.mp4 (232 frames): the single shots on the reference's
   cut grid - 5.1 0-61 (adjusts his collar into the lens), 5.1 556-578
   (turns his head), 5.1 214-241 (shoe step, foot lands), 5.2 626-660
   (buttons the jacket), 5.1 466-493 (tilt up trousers -> jacket),
   5.2 442-497 (full body, adjusts collar and scarf)
No frame where he is talking (lip tracking); every source sharpened.
"""
import subprocess, sys, os

A, B, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SHARP = "unsharp=7:7:1.0:7:7:0,unsharp=3:3:0.6:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]

def run(inputs, fc, out):
    args = ["ffmpeg", "-v", "error", "-y"]
    for i in inputs: args += ["-i", i]
    subprocess.run(args + ["-an", "-filter_complex", fc, "-map", "[v]", *ENC, out], check=True)

def tr(i, a, n): return f"[{i}:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS"

# triptych
fc = (f"{tr(0, 147, 61)},minterpolate=fps={24 * 94 / 61:.6f}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,"
      f"setpts=N/24/TB,trim=end_frame=94,{SHARP},scale=540:960:flags=lanczos[tl];"
      f"{tr(1, 984, 94)},{SHARP},scale=540:960:flags=lanczos[tr];"
      f"{tr(1, 804, 94)},crop=1080:960:0:150,{SHARP}[bo];"
      f"[tl][tr]hstack[top];[top][bo]vstack[v]")
run([A, B], fc, os.path.join(OUT, "MIRROR.5_tri_sharp.mp4"))

# single shots, in edit order: (input, first frame, frames)
SHOTS = [(0, 0, 62), (0, 556, 23), (0, 214, 28), (1, 626, 35), (0, 466, 28), (1, 442, 56)]
parts = "".join(f"{tr(i, a, n)}[p{k}];" for k, (i, a, n) in enumerate(SHOTS))
cat = "".join(f"[p{k}]" for k in range(len(SHOTS)))
run([A, B], f"{parts}{cat}concat=n={len(SHOTS)}:v=1:a=0,{SHARP}[v]",
    os.path.join(OUT, "MIRROR.5_b_sharp.mp4"))
