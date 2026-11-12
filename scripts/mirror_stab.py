# usage: [FPS_OUT=24] [REC_Y=px] mirror_stab.py clip src_start comp_frames speed subject(cu|legs) out.json [deg] [rec_x]
# Smooth (polynomial) camera path + subject recentering, sampled on the
# source frame Remotion shows for each edit frame.
import os, sys, json, numpy as np, cv2
clip, s0, N, speed, subj, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6]
deg = int(sys.argv[7]) if len(sys.argv) > 7 else 2
FPS_SRC, SC = 24.0, 0.5
FPS_OUT = float(os.environ.get("FPS_OUT", 25))
W, H = 1080, 1920
cap = cv2.VideoCapture(clip)
t0 = s0 + 0 ; t1 = s0 + (N - 1) / FPS_OUT * speed
k0 = max(0, int(np.floor(t0 * FPS_SRC)) - 2); k1 = int(np.ceil(t1 * FPS_SRC)) + 2
cap.set(cv2.CAP_PROP_POS_FRAMES, k0)
frames = []
for k in range(k0, k1 + 1):
    ok, fr = cap.read()
    if not ok: break
    frames.append(fr)
gray = [cv2.cvtColor(cv2.resize(f, None, fx=SC, fy=SC, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY) for f in frames]
cx, cy = W * SC / 2, H * SC / 2
A = [np.eye(3)]
for i in range(1, len(gray)):
    p0 = cv2.goodFeaturesToTrack(gray[i-1], 400, 0.01, 12)
    p1, st, _ = cv2.calcOpticalFlowPyrLK(gray[i-1], gray[i], p0, None)
    g = st.ravel() == 1
    a = p0[g].reshape(-1, 2) - [cx, cy]; b = p1[g].reshape(-1, 2) - [cx, cy]
    M, _ = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    M3 = np.vstack([M, [0, 0, 1]])
    A.append(M3 @ A[-1])          # frame0 coords -> frame i coords
A = np.array(A)
th = np.arctan2(A[:, 1, 0], A[:, 0, 0]); tx = A[:, 0, 2] / SC; ty = A[:, 1, 2] / SC
ts = (k0 + np.arange(len(A))) / FPS_SRC
# ultra-smooth camera: low-order polynomial over the used window
def fit(v): return np.polyval(np.polyfit(ts, v, deg), ts)
ths, txs, tys = fit(th), fit(tx), fit(ty)
# subject x position (full-res, centred coords) in each source frame
def subject_x(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    if subj == "cu":   # orange sweater
        m = cv2.inRange(hsv, (0, 120, 80), (20, 255, 255))
    else:              # cream trousers
        m = cv2.inRange(hsv, (0, 0, 150), (40, 60, 255)); m[: H // 10] = 0
    xs = np.nonzero(m)[1]
    return (np.median(xs) - W / 2) if len(xs) else 0.0
sx = np.array([subject_x(f) for f in frames])
res = {"x": [], "y": [], "rot": []}
corr = []
for i in range(len(A)):
    Ai = np.array([[np.cos(th[i]), -np.sin(th[i]), tx[i]], [np.sin(th[i]), np.cos(th[i]), ty[i]], [0, 0, 1]])
    Bi = np.array([[np.cos(ths[i]), -np.sin(ths[i]), txs[i]], [np.sin(ths[i]), np.cos(ths[i]), tys[i]], [0, 0, 1]])
    Wk = Bi @ np.linalg.inv(Ai)    # frame-i coords -> stabilised coords
    corr.append(Wk)
corr = np.array(corr)
# subject x after stabilisation, then smooth recentering offset
sxs = np.array([(corr[i] @ [sx[i], 0, 1])[0] for i in range(len(A))])
REC = float(sys.argv[8]) if len(sys.argv) > 8 else None
rec = -np.polyval(np.polyfit(ts, sxs, 1), ts) if REC is None else np.full(len(ts), REC)
out_t = s0 + np.arange(N) / FPS_OUT * speed
kidx = np.floor(out_t * FPS_SRC + 1e-6).astype(int) - k0   # frame Remotion shows (floor)
def interp(v): return np.asarray(v)[kidx]
rot = interp(np.arctan2(corr[:, 1, 0], corr[:, 0, 0]))
REC_Y = float(os.environ.get("REC_Y", 0))  # +px moves the picture down
X = interp(corr[:, 0, 2] + rec); Y = interp(corr[:, 1, 2] + REC_Y)
# zoom needed so that the viewport stays inside the source frame
need = 1.0
for r, x, y in zip(rot, X, Y):
    for qx, qy in [(-540, -960), (540, -960), (540, 960), (-540, 960)]:
        lo, hi = 1.0, 1.5
        for _ in range(30):
            z = (lo + hi) / 2
            px, py = qx / z - x, qy / z - y
            c, s = np.cos(-r), np.sin(-r)
            sxp, syp = c * px - s * py, s * px + c * py
            if abs(sxp) <= 540 and abs(syp) <= 960: hi = z
            else: lo = z
        need = max(need, hi)
print(f"src {t0:.2f}-{t1:.2f}  frames {len(A)}  zoom needed {need:.3f}  rot max {np.degrees(np.abs(rot)).max():.2f}deg  |x| max {np.abs(X).max():.0f} |y| max {np.abs(Y).max():.0f}")
print("raw shake: tx range %.0f ty range %.0f th range %.2fdeg; subject x raw %.0f..%.0f, after %.0f..%.0f" % (np.ptp(tx), np.ptp(ty), np.degrees(np.ptp(th)), sx.min(), sx.max(), (sxs+rec).min(), (sxs+rec).max()))
json.dump({"x": [round(v, 1) for v in X], "y": [round(v, 1) for v in Y], "rot": [round(float(np.degrees(v)), 3) for v in rot], "zoomNeeded": round(need, 3)}, open(out, "w"))
