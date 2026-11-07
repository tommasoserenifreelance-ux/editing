"""Generate a royalty-free relaxing ambient track for ClassReel.

Usage: python3 scripts/make_music.py public/music/relax.wav [seconds]
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
OUT = sys.argv[1]
LENGTH = float(sys.argv[2]) if len(sys.argv) > 2 else 24.0
CHORD_LEN = 4.0  # seconds per chord (60 bpm, 4 beats)
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# D major: Dmaj9, Bm9, Gmaj7, Asus2, Dmaj9, Gmaj9
CHORDS = [
    [50, 57, 61, 64, 66],
    [47, 54, 57, 61, 62],
    [43, 50, 54, 59, 62],
    [45, 52, 57, 59, 64],
    [50, 57, 61, 64, 66],
    [43, 50, 54, 57, 62],
]

n = int(SR * LENGTH)
t = np.arange(n) / SR
pad = np.zeros(n)
bass = np.zeros(n)
pluck = np.zeros(n)


def envelope(length, attack, release):
    env = np.ones(length)
    a, r = int(attack * SR), int(release * SR)
    # Equal-power curves keep the level steady across chord changes.
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a))
    env[-r:] *= np.cos(np.linspace(0, np.pi / 2, r))
    return env


for i, chord in enumerate(CHORDS):
    start = int(i * CHORD_LEN * SR)
    if start >= n:
        break
    # Chords overlap by 1.5 s so changes are seamless.
    length = min(int((CHORD_LEN + 1.5) * SR), n - start)
    tt = np.arange(length) / SR
    env = envelope(length, 1.5, 2.0)
    for note in chord[1:]:
        f = hz(note)
        voice = sum(
            np.sin(2 * np.pi * f * d * tt + rng.uniform(0, 6.28))
            for d in (0.997, 1.0, 1.003)
        )
        voice += 0.25 * np.sin(2 * np.pi * 2 * f * tt)
        pad[start : start + length] += voice * env
    bass[start : start + length] += np.sin(2 * np.pi * hz(chord[0] - 12) * tt) * env

    # Sparse kalimba-like arpeggio on eighth notes.
    tones = [note + 12 for note in chord[1:]]
    for step in range(8):
        if rng.random() < 0.35 and step not in (0, 4):
            continue
        s = start + int(step * 0.5 * SR)
        if s >= n:
            break
        ln = min(int(2.5 * SR), n - s)
        tp = np.arange(ln) / SR
        f = hz(tones[rng.integers(len(tones))])
        tone = np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(2 * np.pi * 3 * f * tp) * np.exp(-tp * 8)
        pluck[s : s + ln] += tone * np.exp(-tp * 2.2) * np.minimum(1, tp / 0.005) * rng.uniform(0.6, 1)

pad = sosfilt(butter(2, 2200, "low", fs=SR, output="sos"), pad)
mix = 0.12 * pad / 4 + 0.08 * bass + 0.12 * pluck

# Simple stereo reverb: decaying noise impulse response per channel.
ir_t = np.arange(int(3.0 * SR)) / SR
out = []
for ch in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.0)
    ir = sosfilt(butter(1, 3000, "low", fs=SR, output="sos"), ir)
    wet = fftconvolve(mix, ir)[:n]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = mix / (np.max(np.abs(mix)) + 1e-9)
    out.append(0.55 * dry + 0.45 * wet)
stereo = np.stack(out, axis=1)

fade_in, fade_out = int(1.5 * SR), int(3.0 * SR)
stereo[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
stereo[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.5
stereo *= 0.8 / np.max(np.abs(stereo))

with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
