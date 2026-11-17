"""MIRROR 2 - music bed = audio of the reference reel, extended with a
convolution-reverb tail so the logo sits over a decaying wash (as in v1).
Usage: python3 track2_tail.py reference.mp4 OUT.wav [TOTAL_S SEND_FROM_S]
(MIRROR 2: defaults; MIRROR 3: reference3.mp4 reference_track_3.wav 15.0 9.0;
 MIRROR 4: reference4.mp4 reference_track_4.wav 17.5 12.5;
 MIRROR 5: reference5.mp4 reference_track_5.wav 16.8 11.5;
 MIRROR 6: reference6.mp4 reference_track_6.wav 13.5 8.5)
"""
import subprocess, sys, wave
import numpy as np
from scipy import signal

SR = 44100
TOTAL = 15.4           # >= MIRROR2_DURATION (369 frames @ 24 fps)
SRC, OUT = sys.argv[1], sys.argv[2]
if len(sys.argv) > 3:
    TOTAL = float(sys.argv[3])
SEND_FROM = float(sys.argv[4]) if len(sys.argv) > 4 else 10.5
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-vn", "-ac", "2", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
dry = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
N = int(TOTAL * SR)
dry = np.concatenate([dry, np.zeros((max(0, N - len(dry)), 2))])[:N]

rng = np.random.default_rng(7)
t = np.arange(N) / SR
ir_len = int(3.5 * SR); it = np.arange(ir_len) / SR
ir = rng.standard_normal((ir_len, 2)) * np.exp(-it / 1.0)[:, None]
sos_lp = signal.butter(2, 5000, "low", fs=SR, output="sos")
sos_hp = signal.butter(2, 200, "high", fs=SR, output="sos")
ir = signal.sosfilt(sos_hp, signal.sosfilt(sos_lp, ir, axis=0), axis=0)
ir /= np.sqrt((ir ** 2).sum(0))
# send only the last phrase (the track is already fading out from ~12.5 s)
send = dry * np.clip((t - SEND_FROM) / 1.5, 0, 1)[:, None]
wet = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], 1)
pre = int(0.03 * SR)
wet = np.concatenate([np.zeros((pre, 2)), wet[:-pre]])
mix = dry + wet * 0.8
fade = int(0.6 * SR)
mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]
peak = np.abs(mix).max()
if peak > 0.98:
    mix *= 0.98 / peak
pcm = (mix * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"{OUT}: {N / SR:.2f}s peak {peak:.3f}")
