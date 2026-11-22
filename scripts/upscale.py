"""AI upscale a clip with Real-ESRGAN (realesr-general-x4v3, CPU) to 1080x1920.

usage: python3 scripts/upscale.py in.mp4 out.mp4 weights.pth [seconds]
"""
import subprocess, sys
import numpy as np
import torch
from torch import nn
import torch.nn.functional as F


class SRVGGNetCompact(nn.Module):
    def __init__(self, nf=64, nc=32, up=4):
        super().__init__()
        self.up = up
        b = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)]
        for _ in range(nc):
            b += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf, 3 * up * up, 3, 1, 1)]
        self.body = nn.ModuleList(b)
        self.ps = nn.PixelShuffle(up)

    def forward(self, x):
        out = x
        for m in self.body:
            out = m(out)
        return self.ps(out) + F.interpolate(x, scale_factor=self.up, mode="nearest")


src, dst, wts = sys.argv[1:4]
secs = sys.argv[4] if len(sys.argv) > 4 else None
torch.set_num_threads(4)
net = SRVGGNetCompact()
sd = torch.load(wts, map_location="cpu")
net.load_state_dict(sd.get("params", sd), strict=True)
net.eval()

w, h = 576, 1024
cut = ["-t", secs] if secs else []
rd = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", src, *cut,
                       "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
wr = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                       "-s", f"{w*4}x{h*4}", "-r", "30", "-i", "-",
                       "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-crf", "12",
                       "-preset", "slow", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
n = 0
with torch.no_grad():
    while True:
        buf = rd.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        x = torch.from_numpy(np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy())
        x = x.permute(2, 0, 1)[None].float() / 255
        y = net(x).clamp(0, 1)[0].permute(1, 2, 0).mul(255).round().byte().numpy()
        wr.stdin.write(y.tobytes())
        n += 1
        if n % 30 == 0:
            print(n, flush=True)
wr.stdin.close(); wr.wait()
print("done", n)
