"""Synthesizes the sound effects in public/sfx (run: python3 scripts/make-sfx.py)."""

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def env(x, attack, decay):
    n = len(x)
    a = np.minimum(1, np.arange(n) / max(1, attack * SR))
    d = np.exp(-np.arange(n) / (decay * SR))
    return x * a * d


def sweep(f0, f1, dur, curve=1.0):
    tt = t(dur)
    f = f0 + (f1 - f0) * (tt / dur) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def band(x, lo, hi):
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(spec, len(x))


def moving_band(x, centers, width):
    """Band-pass whose center follows `centers`, done in short overlapping blocks."""
    out = np.zeros_like(x)
    block, hop = 2048, 512
    win = np.hanning(block)
    for start in range(0, len(x) - block, hop):
        c = centers[start + block // 2]
        out[start : start + block] += band(x[start : start + block] * win, c - width, c + width)
    return out


def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    fade = int(0.004 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    data = (x * 32767).astype(np.int16)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


OUT.mkdir(parents=True, exist_ok=True)

# Bubbly pop for graphics appearing.
save("pop", env(sweep(900, 260, 0.14, 0.5), 0.002, 0.04) + 0.3 * env(sweep(1800, 500, 0.14, 0.5), 0.001, 0.02))

# Air whoosh, used for the wipe and things flying in.
n = rng.standard_normal(int(SR * 0.55))
centers = np.concatenate([np.linspace(300, 3500, len(n) // 2), np.linspace(3500, 800, len(n) - len(n) // 2)])
w = moving_band(n, centers, 500) * np.sin(np.pi * np.arange(len(n)) / len(n)) ** 2
save("whoosh", w, 0.8)

# Lub-dub heartbeat.
beat = np.zeros(int(SR * 0.5))
for start, f, g in [(0, 70, 1.0), (0.17, 60, 0.75)]:
    s = env(sweep(f * 1.6, f, 0.16, 0.4), 0.004, 0.05) * g
    i = int(start * SR)
    beat[i : i + len(s)] += s
save("heartbeat", beat)

# Short click for checkboxes.
click = env(rng.standard_normal(int(SR * 0.05)), 0.0005, 0.006)
save("tick", band(click, 1500, 9000) + env(np.sin(2 * np.pi * 2400 * t(0.05)), 0.0005, 0.01), 0.7)

# Bright two-note chime for the final check.
chime = np.zeros(int(SR * 1.2))
for start, f in [(0, 1318.5), (0.09, 1975.5)]:
    tt = t(1.2 - start)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.08)
    s = env(s, 0.002, 0.35)
    i = int(start * SR)
    chime[i : i + len(s)] += s
save("ding", chime, 0.7)
