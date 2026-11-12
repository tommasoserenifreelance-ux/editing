"""Whoosh for the MIRROR 4 slider move: band-passed noise that sweeps down in
pitch while the frame slides down, loudness following the move's speed, plus
a soft low thump as it lands on the sheets. Usage: python3 whoosh.py OUT.wav"""
import sys, wave
import numpy as np

SR = 48000
MOVE = 14 / 24                 # slider move length (14 frames @ 24 fps)
PRE, TAIL = 0.12, 0.45
N = int((PRE + MOVE + TAIL) * SR)
t = np.arange(N) / SR - PRE
u = np.clip(t / MOVE, 0, 1)
speed = 1 + 3.5 * np.sin(np.pi * u) ** 1.5            # same speed curve as the picture
env = (speed - 1) / 3.5
env = np.where(t < 0, np.exp(t / 0.05) * 0.08, env)  # short swell in
env = np.where(t > MOVE, np.exp(-(t - MOVE) / 0.12) * env.max() * 0.0 + np.exp(-(t - MOVE) / 0.09) * 0.15, env)
env = np.convolve(env, np.ones(480) / 480, "same") ** 0.85
fc = 2600 * (350 / 2600) ** u                         # pitch sweeps down with the camera
rng = np.random.default_rng(11)
out = np.zeros((N, 2))
for ch in range(2):
    x = rng.standard_normal(N)
    lp = bp = 0.0
    q = 0.9
    y = np.empty(N)
    for i in range(N):                                # state-variable band-pass
        f = 2 * np.sin(np.pi * fc[i] / SR)
        hp = x[i] - lp - q * bp
        bp += f * hp
        lp += f * bp
        y[i] = bp
    out[:, ch] = y * env
pan = np.clip(0.5 + 0.35 * (u - 0.5), 0, 1)           # slight drift L->R
out[:, 0] *= np.sqrt(1 - pan) * 1.4
out[:, 1] *= np.sqrt(pan) * 1.4
# landing thump
tt = t - MOVE
thump = np.where(tt > 0, np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / 0.11), 0) * 0.35
out += thump[:, None]
out /= np.abs(out).max() / 0.97
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"{sys.argv[1]}: {N / SR:.2f}s, move starts at {PRE:.2f}s")
