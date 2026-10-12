import sys, os
import numpy as np
from PIL import Image, ImageFilter

logo_path, out_dir = sys.argv[1], sys.argv[2]
W, H, FPS, DUR = 1080, 1920, 24, 4.25
START = 0.30  # logo animation start (s, local), right after the black point of the transition
os.makedirs(out_dir, exist_ok=True)

logo = Image.open(logo_path).convert("RGBA")
bbox = logo.getchannel("A").getbbox()
logo = logo.crop(bbox)
LW = 760
logo = logo.resize((LW, round(logo.height * LW / logo.width)), Image.LANCZOS)

# soft diagonal light beam from top-right, echoing the video's spotlight
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
ang = np.deg2rad(-60)
d = (xx - W * 0.95) * np.cos(ang) + (yy + 100) * np.sin(ang)  # distance from beam axis
along = np.clip((-(xx - W * 0.95) * np.sin(ang) + (yy + 100) * np.cos(ang)) / H, 0, 1)
beam = np.exp(-(d / 140) ** 2) * (1 - along) ** 1.5


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


n = int(DUR * FPS)
for f in range(n):
    t = f / FPS
    p = ease_out((t - START) / 1.1)
    bg = np.zeros((H, W, 3), np.float32)
    bg += (beam * 38 * ease_out((t - START) / 1.6))[..., None]
    frame = Image.fromarray(bg.clip(0, 255).astype(np.uint8)).convert("RGBA")

    if p > 0:
        s = 1.08 - 0.08 * p
        lw, lh = round(LW * s), round(logo.height * s)
        lg = logo.resize((lw, lh), Image.LANCZOS)
        blur = 14 * (1 - p)
        if blur > 0.3:
            pad = 40
            canvas = Image.new("RGBA", (lw + 2 * pad, lh + 2 * pad))
            canvas.paste(lg, (pad, pad))
            lg = canvas.filter(ImageFilter.GaussianBlur(blur))
        a = np.array(lg).astype(np.float32)
        a[..., 3] *= p
        # glint: a bright diagonal band sweeping left->right once the logo has settled
        g = (t - START - 1.2) / 0.8
        if 0 <= g <= 1:
            gx = np.arange(a.shape[1])[None, :] + 0.5 * np.arange(a.shape[0])[:, None]
            cx = -0.3 * a.shape[1] + g * 1.8 * a.shape[1]
            band = np.exp(-((gx - cx) / 40) ** 2)
            glow = Image.fromarray(np.dstack([np.full(a.shape[:2], 255.0)] * 3 + [a[..., 3] * band * 0.9]).astype(np.uint8))
        else:
            glow = None
        lg = Image.fromarray(a.clip(0, 255).astype(np.uint8))
        x, y = (W - lg.width) // 2, int(H * 0.47) - lg.height // 2
        frame.alpha_composite(lg, (x, y))
        if glow is not None:
            glow = glow.filter(ImageFilter.GaussianBlur(6))
            frame.alpha_composite(glow, (x, y))
    frame.convert("RGB").save(f"{out_dir}/f{f:04d}.png")
print(n)
