"""Synthesise the sound effects used by the TrueFalse video into public/sfx.

Run: python3 scripts/make-sfx.py  (needs numpy and scipy)
"""

from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def save(name, stereo):
    stereo = stereo / np.max(np.abs(stereo)) * 10 ** (-3 / 20)
    wavfile.write(OUT / name, SR, (stereo * 32767).astype(np.int16))


def env(n, attack, release):
    t = np.linspace(0, 1, n)
    return np.minimum(1, t / attack) * np.minimum(1, (1 - t) / release)


def whoosh(duration=0.55):
    """Swept band-pass noise, panned right to left like the slide."""
    n = int(SR * duration)
    f, _, z = signal.stft(rng.standard_normal(n), SR, nperseg=1024)
    pos = np.linspace(0, 1, z.shape[1])
    center = 350 + 3800 * np.sin(np.pi * pos) ** 1.5
    width = 0.35 + 0.4 * pos
    bump = np.exp(-((np.log(f[:, None] + 1) - np.log(center)) ** 2) / (2 * width**2))
    _, y = signal.istft(z * bump, SR, nperseg=1024)
    y = y[:n]
    t = np.linspace(0, 1, n)
    y *= np.sin(np.pi * t**0.8) ** 2
    pan = np.linspace(0.2, 0.8, n)  # 0 = right, 1 = left
    return np.stack([y * np.sqrt(pan), y * np.sqrt(1 - pan)], axis=1)


def tone(freq, duration, shape="square"):
    n = int(SR * duration)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 7 * t)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    wave = signal.square if shape == "square" else signal.sawtooth
    y = wave(phase) + 0.6 * wave(phase * 1.007)
    sos = signal.butter(4, 2200, "low", fs=SR, output="sos")
    return signal.sosfilt(sos, y) * env(n, 0.03, 0.25)


def wrong():
    """Game-show 'wrong answer': two descending buzzes over a low thump."""
    gap = np.zeros(int(SR * 0.05))
    y = np.concatenate([tone(311, 0.17), gap, tone(220, 0.45)])
    n = int(SR * 0.3)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (90 * t - 60 * t**2)) * np.exp(-t * 14)
    y[:n] += 1.4 * thump
    return np.stack([y, y], axis=1)


def correct():
    """Bright two-note 'ding' for a true answer."""
    parts = []
    for freq, start in ((988, 0), (1319, 0.11)):
        n = int(SR * 0.7)
        t = np.arange(n) / SR
        y = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * np.exp(-t * 6)
        parts.append(np.concatenate([np.zeros(int(SR * start)), y]))
    length = max(len(p) for p in parts)
    y = sum(np.pad(p, (0, length - len(p))) for p in parts)
    return np.stack([y, y], axis=1)


def pop():
    """Short bubbly pop for labels appearing."""
    n = int(SR * 0.16)
    t = np.arange(n) / SR
    freq = 520 + 900 * np.exp(-t * 40)
    y = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 32)
    return np.stack([y, y], axis=1)


OUT.mkdir(parents=True, exist_ok=True)
save("whoosh.wav", whoosh())
save("wrong.wav", wrong())
save("correct.wav", correct())
save("pop.wav", pop())
