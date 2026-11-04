# Per-shot tripod lock. Each segment is registered to its own first frame with
# ORB + RANSAC (peeling off plate/hand models), the path is median-filtered,
# then frames are warped back with the smallest zoom that hides the borders.
import cv2, numpy as np, subprocess, sys, json
from scipy.ndimage import median_filter, uniform_filter1d
SEGS = json.loads(sys.argv[1]); OUT = sys.argv[2]
S, BOUND = 0.5, 60
orb = cv2.ORB_create(5000, fastThreshold=7)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
clahe = cv2.createCLAHE(3.0, (8, 8))
def feats(fr):
    g = clahe.apply(cv2.cvtColor(cv2.resize(fr, None, fx=S, fy=S), cv2.COLOR_BGR2GRAY))
    return orb.detectAndCompute(g, None)
def frames(src, t0, t1):
    cap = cv2.VideoCapture(src); fps = cap.get(5)
    cap.set(cv2.CAP_PROP_POS_FRAMES, round(t0 * fps))
    for _ in range(round((t1 - t0) * fps)):
        ok, fr = cap.read()
        if not ok: break
        yield fr
def analyse(src, t0, t1):
    it = frames(src, t0, t1); ref = next(it); kr, dr = feats(ref)
    H, W = ref.shape[:2]; c = np.array([W / 2, H / 2])
    P = [(0, 0, 0, 1, 1)]
    for fr in it:
        k, d = feats(fr); best = None
        if d is not None and len(k) > 50:
            m = bf.match(d, dr)
            p = np.float32([k[x.queryIdx].pt for x in m]) / S
            q = np.float32([kr[x.trainIdx].pt for x in m]) / S
            for _ in range(5):
                if len(p) < 30: break
                C, inl = cv2.estimateAffinePartial2D(p, q, method=cv2.RANSAC, ransacReprojThreshold=2.0, maxIters=5000)
                if C is None or inl.sum() < 20: break
                sc = np.hypot(C[0, 0], C[1, 0]); ang = np.arctan2(C[1, 0], C[0, 0])
                t = C[:, :2] @ c + C[:, 2] - c
                if np.abs(t).max() < BOUND and abs(ang) < 0.02 and abs(sc - 1) < 0.05:
                    best = (t[0], t[1], ang, sc, 1); break
                keep = inl.ravel() == 0; p, q = p[keep], q[keep]
        P.append(best if best else (np.nan, np.nan, 0, 1, 0))
    P = np.array(P, float); ok = P[:, 4] == 1
    for i in range(4):
        P[~ok, i] = np.interp(np.flatnonzero(~ok), np.flatnonzero(ok), P[ok, i])
        P[:, i] = uniform_filter1d(median_filter(P[:, i], 9, mode="nearest"), 3, mode="nearest")
    return P, int((~ok).sum()), W, H
res = {}
need = 1.0
for name, (src, t0, t1, *_) in SEGS.items():
    P, bad, W, H = analyse(src, t0, t1)
    z = max(1 + 2 * np.abs(P[:, 0]).max() / W, 1 + 2 * np.abs(P[:, 1]).max() / H) / P[:, 3].min()
    res[name] = (P, min(z + 0.005, 1.1))
    print(f"{name}: {len(P)} fr, unmatched {bad}, |t| max {np.abs(P[:, :2]).max(0).round(1)}, zoom {z:.3f}", flush=True)
zooms = {}
for name, (src, t0, t1, *off) in SEGS.items():
    P, ZOOM = res[name]
    ox, oy = (off + [0, 0])[:2]  # optional reframe (px) to keep the dish in shot
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
        "-s", f"{W}x{H}", "-r", "50", "-i", "-", "-c:v", "libx264", "-crf", "12",
        "-preset", "medium", "-pix_fmt", "yuv420p", f"{OUT}/{name}.mp4"], stdin=subprocess.PIPE)
    for fr, (tx, ty, ang, sc, _) in zip(frames(src, t0, t1), P):
        # inverse of the measured frame->ref warp is already "fr -> ref", so apply it
        M = np.vstack([cv2.getRotationMatrix2D((W / 2, H / 2), -np.degrees(ang), sc), [0, 0, 1]])
        M[:2, 2] += (tx, ty)
        Z = np.vstack([cv2.getRotationMatrix2D((W / 2, H / 2), 0, ZOOM), [0, 0, 1]])
        A = (Z @ M)[:2]
        A[:, 2] += (ox, oy)
        enc.stdin.write(cv2.warpAffine(fr, A, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).tobytes())
    enc.stdin.close(); enc.wait()
    zooms[name] = round(float(ZOOM), 4)
    print("wrote", name, flush=True)
json.dump(zooms, open(f"{OUT}/zooms.json", "w"))
