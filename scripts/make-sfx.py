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


def pop_soft():
    """Organic bubble / mouth pop: a fast downward pitch sweep with a tiny
    filtered click, no electronic ring."""
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    freq = 180 + 520 * np.exp(-t * 90)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 55)
    click = signal.sosfilt(
        signal.butter(2, [900, 3500], "band", fs=SR, output="sos"),
        rng.standard_normal(n),
    ) * np.exp(-t * 400) * 0.35
    y = body + click
    y = signal.sosfilt(signal.butter(2, 4000, "low", fs=SR, output="sos"), y)
    return np.stack([y, y], axis=1)


def slide_whistle_down():
    """Cartoon "fail" slide whistle going down, for a funny beat."""
    n = int(SR * 0.9)
    t = np.arange(n) / SR
    freq = 1500 * np.exp(-t * 1.6) * (1 + 0.03 * np.sin(2 * np.pi * 6 * t))
    y = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    y += 0.25 * np.sin(4 * np.pi * np.cumsum(freq) / SR)
    breath = signal.sosfilt(signal.butter(2, [800, 3000], "band", fs=SR, output="sos"),
                            rng.standard_normal(n)) * 0.08
    y = (y + breath) * env(n, 0.03, 0.25)
    return np.stack([y, y], axis=1)


def boing():
    """Spring "boing": a wobbling pitch that settles, like a cartoon spring."""
    n = int(SR * 0.6)
    t = np.arange(n) / SR
    freq = 220 + 160 * np.exp(-t * 6) * np.sin(2 * np.pi * 14 * t) + 120 * np.exp(-t * 8)
    y = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 5.5)
    y += 0.3 * np.sin(4 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 7)
    return np.stack([y, y], axis=1)


def twinkle():
    """Bright magical twinkle: quick rising bell notes with shimmer."""
    parts = []
    for k, note in enumerate((88, 91, 95, 100)):
        f = 440 * 2 ** ((note - 69) / 12)
        m = int(SR * 0.7)
        tt = np.arange(m) / SR
        bell = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * 7)
        parts.append(np.concatenate([np.zeros(int(SR * 0.06 * k)), bell]))
    length = max(len(p) for p in parts)
    y = sum(np.pad(p, (0, length - len(p))) for p in parts)
    return np.stack([y, np.roll(y, int(SR * 0.004))], axis=1)


def record_scratch():
    """Vinyl record scratch: two fast filtered noise sweeps."""
    out = []
    for dur, up in ((0.16, True), (0.22, False)):
        n = int(SR * dur)
        t = np.arange(n) / SR
        noise = rng.standard_normal(n)
        lo, hi = (600, 3500) if up else (3500, 400)
        centre = lo + (hi - lo) * (t / dur) ** 0.7
        y = np.zeros(n)
        hop = 256
        for i in range(0, n, hop):
            c = float(centre[min(i, n - 1)])
            sos = signal.butter(2, [c * 0.6, min(c * 1.6, SR / 2 - 100)], "band", fs=SR, output="sos")
            y[i:i + hop] = signal.sosfilt(sos, noise[i:i + hop])
        out.append(y * env(n, 0.01, 0.3))
    y = np.concatenate(out)
    return np.stack([y, y], axis=1)


def marimba():
    """Soft wooden marimba pluck: gentle, warm, not electronic."""
    n = int(SR * 0.5)
    t = np.arange(n) / SR
    f = 523.25
    y = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30))
    y *= np.exp(-t * 9) * (1 - np.exp(-t * 900))
    return np.stack([y, y], axis=1)


def paper_swish():
    """Quiet airy swish, like a sheet of paper sliding in."""
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    y = signal.sosfilt(signal.butter(2, [1500, 6000], "band", fs=SR, output="sos"),
                       rng.standard_normal(n))
    y *= np.sin(np.pi * (t / t[-1]) ** 0.7) ** 2
    return np.stack([y * 0.9, y], axis=1)


def soft_chime():
    """Two warm, soft chime notes (no metallic overtones)."""
    parts = []
    for k, note in enumerate((76, 83)):
        f = 440 * 2 ** ((note - 69) / 12)
        m = int(SR * 1.2)
        tt = np.arange(m) / SR
        tone = (np.sin(2 * np.pi * f * tt) + 0.15 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 3.5)
        tone *= 1 - np.exp(-tt * 300)
        parts.append(np.concatenate([np.zeros(int(SR * 0.12 * k)), tone]))
    length = max(len(p) for p in parts)
    y = sum(np.pad(p, (0, length - len(p))) for p in parts)
    return np.stack([y, y], axis=1)


def soft_bloop():
    """Playful but gentle "bloop" for funny lines (rising, round)."""
    n = int(SR * 0.22)
    t = np.arange(n) / SR
    freq = 260 + 380 * (t / t[-1]) ** 1.5
    y = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.sin(np.pi * t / t[-1]) ** 1.2
    return np.stack([y, y], axis=1)


def capcut_pop():
    """Short, round "bubble" pop in the style of CapCut's pop: a very quick
    downward pitch flick with a tiny transient, gone in ~80 ms."""
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    freq = 260 + 1100 * np.exp(-t * 160)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    body *= np.exp(-t * 60) * (1 - np.exp(-t * 4000))
    click = signal.sosfilt(signal.butter(2, [2000, 7000], "band", fs=SR, output="sos"),
                           rng.standard_normal(n)) * np.exp(-t * 900) * 0.25
    y = np.tanh(1.6 * (body + click)) / np.tanh(1.6)
    tail = np.zeros(int(SR * 0.04))
    y = np.concatenate([y, tail])
    # a touch of tiny-room reverb so it sounds "real", not synthetic
    ir = np.exp(-np.arange(int(SR * 0.05)) / SR * 90) * rng.standard_normal(int(SR * 0.05)) * 0.08
    y = y + signal.fftconvolve(y, ir)[: len(y)]
    return np.stack([y, y], axis=1)


def mouth_pop(f0=620, f1=420, decay=45):
    """Classic "pop!" (finger-in-cheek / cork): a tiny burst exciting a
    resonant cavity whose pitch drops slightly. Round and natural."""
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    freq = f1 + (f0 - f1) * np.exp(-t * 70)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    y = np.sin(phase) * np.exp(-t * decay) * (1 - np.exp(-t * 6000))
    burst = signal.sosfilt(signal.butter(2, [300, 2500], "band", fs=SR, output="sos"),
                           rng.standard_normal(n)) * np.exp(-t * 1500) * 0.6
    y = np.tanh(2.0 * (y + burst)) / np.tanh(2.0)
    return np.stack([y, y], axis=1)


OUT.mkdir(parents=True, exist_ok=True)
save("whoosh.wav", whoosh())
save("wrong.wav", wrong())
save("correct.wav", correct())
save("pop.wav", pop())
save("pop_soft.wav", pop_soft())
save("slide_whistle.wav", slide_whistle_down())
save("boing.wav", boing())
save("twinkle.wav", twinkle())
save("scratch.wav", record_scratch())
save("marimba.wav", marimba())
save("paper_swish.wav", paper_swish())
save("soft_chime.wav", soft_chime())
save("soft_bloop.wav", soft_bloop())
save("capcut_pop.wav", capcut_pop())
save("pop_a.wav", mouth_pop(620, 420, 45))
save("pop_b.wav", mouth_pop(900, 520, 55))
save("pop_c.wav", mouth_pop(480, 330, 38))
