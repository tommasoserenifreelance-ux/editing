"""Track where a point on the table moves as the handheld camera drifts.

usage: track_anchor.py OUT.json clip.mp4:t0:x:y[:t1] ...
For each clip, follows the point (x, y) (frame pixels at time t0) forward
until t1 (default: end of clip), using ORB features + RANSAC similarity
between consecutive frames (hands and plates are rejected as outliers).
Writes {clipName: {t0, fps, pts: [[x, y], ...]}} with one point per frame.
"""
import cv2, json, numpy as np, sys, os

orb = cv2.ORB_create(3000, fastThreshold=10)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
S = 0.5

def feats(fr):
    g = cv2.cvtColor(cv2.resize(fr, None, fx=S, fy=S), cv2.COLOR_BGR2GRAY)
    return orb.detectAndCompute(g, None)

out = {}
for spec in sys.argv[2:]:
    parts = spec.split(":")
    path, t0, x, y = parts[0], float(parts[1]), float(parts[2]), float(parts[3])
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS)
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    t1 = float(parts[4]) if len(parts) > 4 else n / fps
    cap.set(cv2.CAP_PROP_POS_FRAMES, round(t0 * fps))
    ok, prev = cap.read(); kp, dp = feats(prev)
    p = np.array([x, y, 1.0]); pts = [[x, y]]
    for _ in range(round((t1 - t0) * fps) - 1):
        ok, fr = cap.read()
        if not ok: break
        k, d = feats(fr); M = None
        if d is not None and dp is not None:
            m = bf.match(dp, d)
            if len(m) > 30:
                a = np.float32([kp[i.queryIdx].pt for i in m]) / S
                b = np.float32([k[i.trainIdx].pt for i in m]) / S
                M, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=3.0)
        if M is not None:
            p = np.array([*(M @ p), 1.0])
        pts.append([round(p[0], 1), round(p[1], 1)])
        kp, dp = k, d
    name = os.path.splitext(os.path.basename(path))[0]
    out[name] = {"t0": t0, "fps": fps, "pts": pts}
    print(name, len(pts), "frames, end", pts[-1], flush=True)
json.dump(out, open(sys.argv[1], "w"))
