import sys, cv2, numpy as np, potrace
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src, cv2.IMREAD_GRAYSCALE).astype(np.float32)
UP = 4
big = cv2.resize(img, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
big = cv2.GaussianBlur(big, (0, 0), 1.6 * UP / 2)
# face = bright text (top), reflection = mid-grey text (bottom)
H = big.shape[0]
ys = np.nonzero((img > 60).any(1))[0]
rows = (img > 170).sum(1)   # bright rows
face_rows = np.nonzero(rows > 5)[0]
split = int((face_rows.max() + 1) * UP)          # boundary between face and reflection
print("face rows", face_rows.min(), face_rows.max(), "text rows", ys.min(), ys.max())
def trace(mask):
    bm = potrace.Bitmap(~mask.astype(bool))
    path = bm.trace(turdsize=40, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in path:
        sp = curve.start_point; d.append(f"M{sp.x:.1f},{sp.y:.1f}")
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}")
            else:
                d.append(f"C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}")
        d.append("Z")
    return "".join(d)
face = np.zeros_like(big, bool); face[:split] = big[:split] > 128
refl = np.zeros_like(big, bool); refl[split:] = big[split:] > 70
m = face | refl
ys2, xs2 = np.nonzero(m)
pad = 8 * UP
x0, x1, y0, y1 = xs2.min() - pad, xs2.max() + pad, ys2.min() - pad, ys2.max() + pad
face, refl = face[y0:y1, x0:x1], refl[y0:y1, x0:x1]
w, h = x1 - x0, y1 - y0
sf = (split - y0) / h
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">
<defs>
 <linearGradient id="face" x1="0" y1="0" x2="0" y2="{sf:.3f}"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient>
 <linearGradient id="refl" x1="0" y1="{sf:.3f}" x2="0" y2="1"><stop offset="0" stop-color="#8a8a8a"/><stop offset="1" stop-color="#5a5a5a"/></linearGradient>
</defs>
<path fill="url(#face)" fill-rule="evenodd" d="{trace(face)}"/>
<path fill="url(#refl)" fill-rule="evenodd" d="{trace(refl)}"/>
</svg>
'''
open(out, "w").write(svg)
print("viewBox", w, h, "bytes", len(svg))
