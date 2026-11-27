"""Prepare audio for XmasSponsor.

Usage: python3 scripts/make_xmas_audio.py voice.wav public/xmas
  voice.wav: the voice-over decoded to 16-bit PCM WAV (any rate, mono/stereo)
Writes voce.wav (trimmed before "chiama", normalised) and musica.wav
(music-box "Jingle Bells", public-domain melody, synthesised here).
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SRC, OUT = sys.argv[1], sys.argv[2]
VOICE_START, VOICE_END = 0.6, 32.7  # "chiama" starts at 32.9 s
MUSIC_LEN = 34.5
SR = 44100
rng = np.random.default_rng(3)


def write(path, data, sr):
    data = np.atleast_2d(data.T).T
    with wave.open(path, "wb") as w:
        w.setnchannels(data.shape[1])
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(data, -1, 1) * 32767).astype("<i2").tobytes())


# --- Voice ---------------------------------------------------------------
with wave.open(SRC) as w:
    sr, ch = w.getframerate(), w.getnchannels()
    v = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
v = v.reshape(-1, ch).mean(axis=1)
v = v[int(VOICE_START * sr) : int(VOICE_END * sr)]
v = sosfilt(butter(2, 80, "high", fs=sr, output="sos"), v)
fade = int(0.04 * sr)
v[-fade:] *= np.linspace(1, 0, fade)
v *= 0.89 / np.max(np.abs(v))
write(f"{OUT}/voce.wav", v, sr)

# --- Music box Jingle Bells -----------------------------------------------
BEAT = 60 / 112


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


E, F, G, C, D, A = 76, 77, 79, 72, 74, 69
G5, C6 = 79, 84
# (note, beats); None = rest. Chorus, played twice.
chorus = [
    (E, 1), (E, 1), (E, 2), (E, 1), (E, 1), (E, 2),
    (E, 1), (G, 1), (C, 1.5), (D, 0.5), (E, 4),
    (F, 1), (F, 1), (F, 1.5), (F, 0.5), (F, 1), (E, 1), (E, 1), (E, 0.5), (E, 0.5),
    (E, 1), (D, 1), (D, 1), (E, 1), (D, 2), (G, 2),
    (E, 1), (E, 1), (E, 2), (E, 1), (E, 1), (E, 2),
    (E, 1), (G, 1), (C, 1.5), (D, 0.5), (E, 4),
    (F, 1), (F, 1), (F, 1.5), (F, 0.5), (F, 1), (E, 1), (E, 1), (E, 0.5), (E, 0.5),
    (G, 1), (G, 1), (F, 1), (D, 1), (C, 4),
]
# One chord root per bar (4 beats).
bars = [48, 48, 53, 48, 53, 48, 50, 55, 48, 48, 53, 48, 53, 48, 55, 48]

n = int(MUSIC_LEN * SR)
melody = np.zeros(n)
bass = np.zeros(n)
bells = np.zeros(n)


def bell(f, length, decay):
    t = np.arange(length) / SR
    tone = (
        np.sin(2 * np.pi * f * t)
        + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)
        + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 12)
    )
    return tone * np.exp(-t * decay) * np.minimum(1, t / 0.003)


pos = 1.0  # short lead-in
song_beats = sum(b for _, b in chorus)
while pos < MUSIC_LEN:
    start = pos
    for note, beats in chorus:
        s = int(pos * SR)
        if s >= n:
            break
        ln = min(int(2.0 * SR), n - s)
        melody[s : s + ln] += bell(hz(note), ln, 3.0)
        pos += beats * BEAT
    for i, root in enumerate(bars):
        s = int((start + i * 4 * BEAT) * SR)
        if s >= n:
            break
        for k, off in enumerate((0, 7, 12, 16)):
            ss = s + int(k * BEAT * SR)
            if ss >= n:
                break
            ln = min(int(2.5 * SR), n - ss)
            bass[ss : ss + ln] += bell(hz(root + off), ln, 2.0)
    pos = start + song_beats * BEAT

# Soft sleigh bells on every beat.
tb = np.arange(int(0.25 * SR)) / SR
shake = sosfilt(
    butter(2, [6000, 12000], "band", fs=SR, output="sos"),
    rng.standard_normal(len(tb)),
) * np.exp(-tb * 25)
b = 1.0
while b < MUSIC_LEN:
    s = int(b * SR)
    ln = min(len(shake), n - s)
    bells[s : s + ln] += shake[:ln] * (1 if int(round((b - 1) / BEAT)) % 2 == 0 else 0.6)
    b += BEAT

mix = 0.5 * melody + 0.22 * bass + 0.35 * bells
ir_t = np.arange(int(2.2 * SR)) / SR
out = []
for c in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.8)
    wet = fftconvolve(mix, ir)[:n]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = mix / (np.max(np.abs(mix)) + 1e-9)
    out.append(0.7 * dry + 0.3 * wet)
music = np.stack(out, axis=1)
fi, fo = int(0.8 * SR), int(2.5 * SR)
music[:fi] *= np.linspace(0, 1, fi)[:, None]
music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
music *= 0.8 / np.max(np.abs(music))
write(f"{OUT}/musica.wav", music, SR)
