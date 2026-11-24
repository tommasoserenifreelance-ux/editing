import cv2, numpy as np, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
_lm = None
def landmarker(model):
    global _lm
    if _lm is None:
        opts = vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=model),
                                            num_faces=4, min_face_detection_confidence=0.3,
                                            min_face_presence_confidence=0.3)
        _lm = vision.FaceLandmarker.create_from_options(opts)
    return _lm
def _run(crop, model):
    h, w = crop.shape[:2]
    s = 1024 / max(h, w)
    sm = cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(sm, cv2.COLOR_BGR2RGB)))
    res = landmarker(model).detect(img)
    return [np.array([[p.x * w, p.y * h] for p in f]) for f in res.face_landmarks]
def detect(im, model):
    """Faces as (478,2) landmark arrays in full-res pixel coords. Full frame + overlapping halves."""
    h, w = im.shape[:2]
    found = _run(im, model)
    for x0, x1 in ((0, int(w * 0.6)), (int(w * 0.4), w)):
        for f in _run(im[:, x0:x1], model):
            found.append(f + [x0, 0])
    for y0, y1 in ((0, int(h * 0.6)),):
        for f in _run(im[y0:y1], model):
            found.append(f + [0, y0])
    out = []
    for f in found:                      # merge duplicates by centre distance
        c = f.mean(0); size = np.ptp(f[:, 0])
        if size < 40:
            continue
        if all(np.linalg.norm(c - g.mean(0)) > 0.5 * max(size, np.ptp(g[:, 0])) for g in out):
            out.append(f)
    return out
