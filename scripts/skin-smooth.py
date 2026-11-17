"""Soft "glossy" skin for a video: smooths only skin-coloured areas.

Skin mask from YCrCb, edge-preserving bilateral filter blended on the skin,
plus a light lift of highlights for a soft glow. Audio is copied as is.
Usage: python3 scripts/skin-smooth.py IN.mp4 OUT.mp4
"""

import subprocess
import sys

import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
enc = subprocess.Popen(
    ["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
     "-s", f"{w}x{h}", "-r", str(fps), "-i", "-", "-i", src,
     "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium",
     "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "copy", dst],
    stdin=subprocess.PIPE)
while True:
    ok, img = cap.read()
    if not ok:
        break
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # skin: clearly reddish and saturated (the pink kitchen wall is not)
    skin = cv2.inRange(ycc, (35, 146, 80), (235, 180, 125))
    skin &= cv2.inRange(hsv, (0, 70, 40), (25, 255, 255))
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.GaussianBlur(skin, (0, 0), 6).astype(np.float32)[..., None] / 255
    small = cv2.resize(img, (w // 2, h // 2))
    smooth = cv2.bilateralFilter(small, 9, 40, 9)
    smooth = cv2.resize(smooth, (w, h), interpolation=cv2.INTER_LINEAR)
    out = img.astype(np.float32) * (1 - 0.6 * m) + smooth.astype(np.float32) * 0.6 * m
    glow = cv2.GaussianBlur(out, (0, 0), 12)
    out = out + (np.maximum(glow - 150, 0) * 0.25) * m  # soft sheen on highlights
    # brighter, luminous skin: lift skin tones (more on darker parts)
    lifted = 255 - (255 - out) * 0.86
    out = out * (1 - 0.8 * m) + lifted * 0.8 * m
    enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close()
enc.wait()
