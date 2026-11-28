"""Cut the speaker out of a clip as a VP9 WebM with alpha (MediaPipe selfie
multiclass segmenter), for text that goes behind her.

python3 scripts/matte.py <in.mp4> <out.webm> <seconds> <selfie_multiclass_256x256.tflite>
Model: https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
"""
import sys, subprocess, numpy as np, cv2, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision

src, dst, secs, model = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
W, H = 720, 1280
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpt.BaseOptions(model_asset_path=model), output_confidence_masks=True,
    running_mode=vision.RunningMode.VIDEO))
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-t", str(secs), "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "3M", "-auto-alt-ref", "0", dst], stdin=subprocess.PIPE)
i, prev = 0, None
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    rgb = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb)), int(i * 1000 / 30))
    a = np.clip(1 - r.confidence_masks[0].numpy_view(), 0, 1)
    a = cv2.resize(a, (W, H), interpolation=cv2.INTER_LINEAR)
    if prev is not None:
        a = 0.6 * a + 0.4 * prev  # temporal smoothing
    prev = a
    a = cv2.GaussianBlur(a, (0, 0), 1.5)
    alpha = (np.clip((a - 0.35) / 0.3, 0, 1) * 255).astype(np.uint8)
    enc.stdin.write(np.dstack([rgb, alpha]).tobytes())
    i += 1
enc.stdin.close()
enc.wait()
print("frames", i)
