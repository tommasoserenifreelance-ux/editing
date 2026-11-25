"""Smooth (not locked) stabiliser for handheld shots full of moving people.

usage: stabilize_smooth.py SEGS_JSON OUT_DIR [roi_top roi_bottom] [sigma_seconds]
SEGS_JSON: {"name": ["clip.mp4", t0, t1], ...}
Camera motion is measured only on a horizontal band of the frame that holds
static background (default: top 0-38%, ceiling/columns), frame to frame with
phase correlation; the path is Gaussian-smoothed and only the shake (path minus
smoothed path) is removed, so slow intentional moves remain. Each segment gets
the smallest zoom that hides the borders. Writes OUT_DIR/name.mp4 at the
source frame rate.
"""
import cv2, numpy as np, subprocess, sys, json
from scipy.ndimage import gaussian_filter1d

SEGS = json.loads(sys.argv[1]); OUT = sys.argv[2]
R0, R1 = (float(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (0.0, 0.38)
# smoothing window; large values (e.g. 2) give an almost tripod-still shot
SIGMA = float(sys.argv[5]) if len(sys.argv) > 5 else 0.25

def read(src, t0, t1):
    cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, round(t0 * fps)); fr = []
    for _ in range(round((t1 - t0) * fps)):
        ok, f = cap.read()
        if not ok: break
        fr.append(f)
    return fr, fps

for name, (src, t0, t1) in SEGS.items():
    fr, fps = read(src, t0, t1); H, W = fr[0].shape[:2]
    y0, y1 = int(R0 * H), int(R1 * H)
    # frame-to-frame shift of the static background band (phase correlation:
    # robust for small handheld shake, ignores people below the band)
    def band(f):
        g = cv2.cvtColor(cv2.resize(f[y0:y1], None, fx=0.5, fy=0.5), cv2.COLOR_BGR2GRAY).astype(np.float32)
        return g * cv2.createHanningWindow(g.shape[::-1], cv2.CV_32F)
    steps = [(0.0, 0.0, 0.0)]; prev = band(fr[0])
    for f in fr[1:]:
        cur = band(f)
        (dx, dy), resp = cv2.phaseCorrelate(prev, cur)
        steps.append((dx * 2, dy * 2, 0.0) if resp > 0.05 else (0.0, 0.0, 0.0)); prev = cur
    path = np.cumsum(np.array(steps), axis=0)
    smooth = np.stack([gaussian_filter1d(path[:, i], sigma=max(2.0, fps * SIGMA), mode="nearest") for i in range(3)], 1)
    corr = smooth - path  # shift each frame by this
    zoom = min(1.12, 1.005 + 2 * max(np.abs(corr[:, 0]).max() / W, np.abs(corr[:, 1]).max() / H))
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
        "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-c:v", "libx264", "-crf", "14",
        "-preset", "medium", "-pix_fmt", "yuv420p", f"{OUT}/{name}.mp4"], stdin=subprocess.PIPE)
    for f, (dx, dy, da) in zip(fr, corr):
        M = cv2.getRotationMatrix2D((W / 2, H / 2), 0, zoom)  # no rotation: keeps verticals natural
        M[:, 2] += (dx * zoom, dy * zoom)
        enc.stdin.write(cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).tobytes())
    enc.stdin.close(); enc.wait()
    print(f"{name}: {len(fr)} fr, shake removed max {np.abs(corr[:, :2]).max(0).round(1)} px, zoom {zoom:.3f}", flush=True)
