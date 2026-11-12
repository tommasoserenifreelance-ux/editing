"""MIRROR 4 source prep: sharpened selects + slider whoosh down to the floor.
Usage: python3 mirror4_build.py MIRROR.4.mov OUT_DIR
 - MIRROR.4_a_sharp.mp4: jump-cut selects (frames listed in SELECTS), in order;
   no frame where he is talking (lip tracking), mostly him tossing sheets away
 - MIRROR.4_ramp_sharp.mp4: the throw at 1x (1985-1995, locked-off wide, him
   centred), then a fast vertical slider move: the wide scrolls up out of
   frame and the floor shot (2022-2027) scrolls in from below, 12 frames with
   smootherstep easing and 180-degree motion blur, landing at 1x on the sheets
   on the floor (2028-2037). No slow motion.
 - MIRROR.4_c_sharp.mp4: 2038-2114 (stands up, walks out, empty room)
"""
import subprocess, sys, os
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
SHARP = "unsharp=7:7:1.0:7:7:0,unsharp=3:3:0.6:3:3:0"
ENC = ["-c:v", "libx264", "-crf", "8", "-preset", "slow", "-tune", "film", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "24", "-write_tmcd", "0"]
# (first source frame, number of frames) - edit cuts follow reference 4
SELECTS = [(89, 8), (490, 5), (1186, 5), (1600, 34), (1020, 34), (1390, 23),
           (924, 34), (1706, 22), (1291, 23), (312, 16)]

def cut(ranges, out):
    # trim + concat keeps the list order (select would sort by source frame)
    parts = "".join(f"[0:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS[p{i}];"
                    for i, (a, n) in enumerate(ranges))
    cat = "".join(f"[p{i}]" for i in range(len(ranges)))
    fc = f"{parts}{cat}concat=n={len(ranges)}:v=1:a=0,{SHARP}[v]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-an", "-filter_complex", fc,
                    "-map", "[v]", *ENC, out], check=True)

cut(SELECTS, os.path.join(OUT, "MIRROR.4_a_sharp.mp4"))
cut([(2038, 77)], os.path.join(OUT, "MIRROR.4_c_sharp.mp4"))
if os.environ.get("SKIP_RAMP"):
    sys.exit(0)

# ---- throw + continuous slider down to the floor ----
# One continuous move on the real camera: 1970-1996 locked off (handheld
# drift removed, him centred), the sheets leave his hands on 1988; then the
# camera's own tilt down to the floor (1996-2037) sped up (peak ~4.5x, no slow
# motion) with motion blur, lateral drift and roll removed and the subject
# kept centred (zoom eases 1.10 -> 1.30).
import cv2
A0, A1, MOVE0 = 1970, 2038, 1996
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-an", "-vf",
    f"trim=start_frame={A0 - 1}:end_frame={A1 + 1},setpts=PTS-STARTPTS,{SHARP}",
    "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)          # F[i] = frame A0-1+i
fi = lambda k: F[k - (A0 - 1)]
# camera motion (similarity) between consecutive frames, cumulative from A0
SC = 0.5
def gray(k): return cv2.cvtColor(cv2.resize(fi(k), None, fx=SC, fy=SC, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
cum = {A0: np.eye(3)}
ctr = np.array([W / 2, H / 2])
for k in range(A0 + 1, MOVE0 + 1):                # motion only needed for the lock
    g0, g1 = gray(k - 1), gray(k)
    p0 = cv2.goodFeaturesToTrack(g0, 500, 0.01, 10)
    p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None)
    ok = st.ravel() == 1
    M, _ = cv2.estimateAffinePartial2D(p0[ok].reshape(-1, 2) / SC - ctr, p1[ok].reshape(-1, 2) / SC - ctr,
                                       method=cv2.RANSAC, ransacReprojThreshold=3)
    cum[k] = np.vstack([M, [0, 0, 1]]) @ cum[k - 1]   # centred A0 coords -> frame k
ks = np.arange(A0, A1)
nl = MOVE0 - A0 + 1
tx = np.array([cum[k][0, 2] for k in ks[:nl]]); ty = np.array([cum[k][1, 2] for k in ks[:nl]])
th = np.array([np.arctan2(cum[k][1, 0], cum[k][0, 0]) for k in ks[:nl]])
# subject x (centred coords) per frame: sweater, then trousers/shoes on the floor
def subj(k):
    hsv = cv2.cvtColor(cv2.resize(fi(k), (270, 480)), cv2.COLOR_BGR2HSV)
    m = cv2.inRange(hsv, (125, 60, 60), (160, 255, 255))
    if m.sum() / 255 < 3000:
        m = cv2.inRange(hsv, (0, 0, 0), (180, 120, 45)); m[:150] = 0
    xs = np.nonzero(m)[1]
    return np.median(xs) * 4 - W / 2 if len(xs) > 300 else 0.0
sx = np.array([subj(k) for k in ks])
def zoom_at(k):
    u = np.clip((k - MOVE0) / 18, 0, 1); return 1.10 + 0.20 * (u * u * (3 - 2 * u))
Z = np.array([zoom_at(k) for k in ks])
lim = (1 - 1 / Z) * W / 2 * 0.9
# lock: cancel the drift, keep him centred (constant offset); move: only recentre
lock_dx = -tx + np.clip(-np.median(sx[:nl] - tx), -lim[0], lim[0])
lock_dy = -ty
sm = np.convolve(np.pad(sx, 6, mode="edge"), np.ones(13) / 13, "valid")
rec = np.clip(-sm, -lim, lim)
dx = np.empty(len(ks)); dy = np.empty(len(ks)); rot = np.zeros(len(ks))
dx[:nl], dy[:nl], rot[:nl] = lock_dx, lock_dy, -th
for i in range(nl, len(ks)):
    b_ = np.clip((i - nl + 1) / 5, 0, 1); b_ = b_ * b_ * (3 - 2 * b_)
    dx[i] = (1 - b_) * lock_dx[-1] + b_ * rec[i]
    dy[i] = lock_dy[-1] * (1 - b_)
    rot[i] = -th[-1] * (1 - b_)
def warp_mat(i):
    c, s_ = np.cos(rot[i]), np.sin(rot[i]); z = Z[i]
    # about the frame centre: translate by (dx,dy), rotate, zoom
    T = np.array([[1, 0, dx[i]], [0, 1, dy[i]], [0, 0, 1]])
    R = np.array([[c, -s_, 0], [s_, c, 0], [0, 0, 1]])
    S = np.diag([z, z, 1.0])
    C = np.array([[1, 0, W / 2], [0, 1, H / 2], [0, 0, 1]]); Ci = np.linalg.inv(C)
    return (C @ S @ R @ Ci @ T)[:2]
def render(pos):
    """source position (float, frame units) -> corrected image (blend of neighbours)"""
    k0 = int(np.floor(pos)); a = pos - k0
    k0 = min(max(k0, A0), A1 - 1); k1 = min(k0 + 1, A1 - 1)
    out = np.zeros((H, W, 3), np.float32)
    for k, wgt in ((k0, 1 - a), (k1, a)):
        if wgt <= 0: continue
        i = k - A0
        out += wgt * cv2.warpAffine(fi(k), warp_mat(i), (W, H), flags=cv2.INTER_LANCZOS4,
                                    borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    return out
# time map: 1x through the lock, then speed v = 1 + 3.5 sin^1.5 over NM frames
NL = MOVE0 - A0
NM = 14
v = np.array([1 + 3.5 * np.sin(np.pi * (j + 0.5) / NM) ** 1.5 for j in range(NM)])
v *= (A1 - 1 - MOVE0) / v.sum()
pos = list(np.arange(A0, MOVE0, 1.0)) + list(MOVE0 + np.concatenate([[0], np.cumsum(v)[:-1]]))
speeds = [1.0] * NL + list(v)
print("move speeds", np.round(v, 2).tolist())
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
    "-s", f"{W}x{H}", "-r", "24", "-i", "-", *ENC, os.path.join(OUT, "MIRROR.4_ramp_sharp.mp4")],
    stdin=subprocess.PIPE)
for p_, sp in zip(pos, speeds):
    if sp <= 1.01:
        img = render(p_)
    else:  # 180-degree shutter motion blur across the distance travelled
        subs = np.linspace(p_ - sp / 4, p_ + sp / 4, int(np.ceil(sp * 3)) + 1)
        img = sum(render(q) for q in subs) / len(subs)
    enc.stdin.write(np.clip(img, 0, 255).round().astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print("ramp frames", len(pos), "lock dx range", lock_dx.min().round(), lock_dx.max().round(), "dy", lock_dy.min().round(), lock_dy.max().round(), "rec", rec.min().round(), rec.max().round())
