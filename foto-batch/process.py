"""Applica l'editing (colori/luce) delle foto editate agli scatti originali,
mantenendo la nitidezza dell'originale (scritte comprese).

Coppie abbinate per nome file (senza estensione):
  originali/NOME.jpg  +  editate/NOME.webp  ->  risultati/NOME.jpg

Uso:  python3 process.py [--upscale]
"""
import argparse, sys, urllib.request
from pathlib import Path
import cv2, numpy as np

ROOT = Path(__file__).parent
EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic'}
MODEL_URL = 'https://github.com/facefusion/facefusion-assets/releases/download/models-3.0.0/real_esrgan_x4.onnx'


def load(p):
    img = cv2.imread(str(p), cv2.IMREAD_COLOR)
    if img is None:
        from PIL import Image
        img = cv2.cvtColor(np.array(Image.open(p).convert('RGB')), cv2.COLOR_RGB2BGR)
    return img


def align(ed, og):
    """Riporta la foto editata sulla geometria dell'originale (omografia SIFT)."""
    H0, W0 = og.shape[:2]
    S = np.diag([W0 / ed.shape[1], H0 / ed.shape[0], 1])
    edu = cv2.resize(ed, (W0, H0), interpolation=cv2.INTER_CUBIC)
    clahe = cv2.createCLAHE(3, (8, 8))
    gray = lambda x: clahe.apply(cv2.cvtColor(x, cv2.COLOR_BGR2GRAY))
    sift = cv2.SIFT_create(8000)
    k1, d1 = sift.detectAndCompute(gray(edu), None)
    k2, d2 = sift.detectAndCompute(gray(og), None)
    H, inliers = None, 0
    if d1 is not None and d2 is not None and len(k1) > 10 and len(k2) > 10:
        good = [a for a, b in cv2.BFMatcher().knnMatch(d1, d2, k=2) if a.distance < 0.75 * b.distance]
        if len(good) >= 20:
            p1 = np.float32([k1[a.queryIdx].pt for a in good])
            p2 = np.float32([k2[a.trainIdx].pt for a in good])
            H, mask = cv2.findHomography(p1, p2, cv2.RANSAC, 3.0)
            inliers = int(mask.sum()) if mask is not None else 0
    if H is None or inliers < 30:
        return edu, f'allineamento debole ({inliers} punti): solo ridimensionata'
    M = H @ S
    warp = cv2.warpPerspective(ed, M, (W0, H0), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return warp, f'allineata ({inliers} punti)'


def transfer(og, ed, r=20, eps=1e-3, s=2):
    """Guided filter a colori: modello affine locale originale->editata, applicato
    all'originale a piena risoluzione (i colori arrivano dall'editata, i bordi dall'originale)."""
    og = og.astype(np.float32) / 255
    ed = ed.astype(np.float32) / 255
    H, W = og.shape[:2]
    gs = cv2.resize(og, (W // s, H // s), interpolation=cv2.INTER_AREA)
    ps = cv2.resize(ed, (W // s, H // s), interpolation=cv2.INTER_AREA)
    rs = max(1, r // s)
    box = lambda x: cv2.boxFilter(x, -1, (2 * rs + 1, 2 * rs + 1), borderType=cv2.BORDER_REFLECT)
    mI = box(gs)
    cov = np.empty(gs.shape[:2] + (3, 3), np.float32)
    for i in range(3):
        for j in range(3):
            cov[..., i, j] = box(gs[..., i] * gs[..., j]) - mI[..., i] * mI[..., j]
    inv = np.linalg.inv(cov + eps * np.eye(3, dtype=np.float32))
    out = np.empty_like(og)
    for c in range(3):
        mp = box(ps[..., c])
        cIp = np.stack([box(gs[..., i] * ps[..., c]) - mI[..., i] * mp for i in range(3)], -1)
        a = np.einsum('hwij,hwj->hwi', inv, cIp)
        b = mp - (a * mI).sum(-1)
        a = np.stack([box(a[..., i]) for i in range(3)], -1)
        b = box(b)
        a = cv2.resize(a, (W, H), interpolation=cv2.INTER_LINEAR)
        b = cv2.resize(b, (W, H), interpolation=cv2.INTER_LINEAR)
        out[..., c] = (a * og).sum(-1) + b
    return (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)


def upscale(img, session, T=256, P=16):
    """Real-ESRGAN x4 sui soggetti a fuoco, Lanczos sullo sfocato (evita l'effetto dipinto)."""
    src = img.astype(np.float32) / 255
    H, W = src.shape[:2]
    x = src[:, :, ::-1].transpose(2, 0, 1)[None]
    esr = np.zeros((H * 4, W * 4, 3), np.float32)
    for y0 in range(0, H, T):
        for x0 in range(0, W, T):
            ya, yb, xa, xb = max(0, y0 - P), min(H, y0 + T + P), max(0, x0 - P), min(W, x0 + T + P)
            o = session.run(None, {'input': np.ascontiguousarray(x[:, :, ya:yb, xa:xb])})[0][0].transpose(1, 2, 0)
            ty, tx = min(T, H - y0), min(T, W - x0)
            esr[y0 * 4:(y0 + ty) * 4, x0 * 4:(x0 + tx) * 4] = o[(y0 - ya) * 4:(y0 - ya + ty) * 4, (x0 - xa) * 4:(x0 - xa + tx) * 4]
    esr = np.clip(esr[:, :, ::-1], 0, 1)
    lan = cv2.resize(src, (W * 4, H * 4), interpolation=cv2.INTER_LANCZOS4)
    lan = np.clip(lan + 0.6 * (lan - cv2.GaussianBlur(lan, (0, 0), 2.0)), 0, 1)
    g = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    m = cv2.GaussianBlur(np.abs(cv2.Laplacian(g, cv2.CV_32F)), (0, 0), 6)
    m = cv2.GaussianBlur(np.clip((m - 0.006) / 0.012, 0, 1), (0, 0), 8)
    m = 0.25 + 0.75 * cv2.resize(m, (W * 4, H * 4), interpolation=cv2.INTER_LINEAR)
    out = esr * m[..., None] + lan * (1 - m[..., None])
    return (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--upscale', action='store_true', help='salva anche una versione x4')
    args = ap.parse_args()
    files = lambda d: {p.stem.lower(): p for p in sorted((ROOT / d).iterdir()) if p.suffix.lower() in EXTS}
    orig, edit = files('originali'), files('editate')
    pairs = sorted(set(orig) & set(edit))
    for name in sorted(set(orig) ^ set(edit)):
        print(f'! {name}: manca la coppia (originale o editata)')
    session = None
    if args.upscale:
        import onnxruntime as ort
        model = ROOT / '.models' / 'real_esrgan_x4.onnx'
        if not model.exists():
            model.parent.mkdir(exist_ok=True)
            print('scarico il modello di upscaling...')
            urllib.request.urlretrieve(MODEL_URL, model)
        session = ort.InferenceSession(str(model))
    out_dir = ROOT / 'risultati'
    for i, name in enumerate(pairs, 1):
        og, ed = load(orig[name]), load(edit[name])
        warp, note = align(ed, og)
        res = transfer(og, warp)
        stem = orig[name].stem
        cv2.imwrite(str(out_dir / f'{stem}.jpg'), res, [cv2.IMWRITE_JPEG_QUALITY, 96])
        if session is not None:
            cv2.imwrite(str(out_dir / f'{stem}_x4.jpg'), upscale(res, session), [cv2.IMWRITE_JPEG_QUALITY, 93])
        print(f'[{i}/{len(pairs)}] {stem}: {note}', flush=True)


if __name__ == '__main__':
    sys.exit(main())
