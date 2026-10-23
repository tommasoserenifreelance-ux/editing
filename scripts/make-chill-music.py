"""Synthesise a calm chill-out bed for the plate video into public/music.

Slow (72 BPM) Fmaj7 - Em7 - Dm7 - Cmaj7 progression: warm pad, soft
electric-piano arpeggio, sine bass, gentle kick and shaker, long reverb.
Run: python3 scripts/make-chill-music.py  (needs numpy and scipy)
"""

from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
LENGTH = 25.7
OUT = Path(__file__).resolve().parent.parent / "public" / "music"
rng = np.random.default_rng(3)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


# Two bars per chord; voicings in MIDI notes, root for the bass.
CHORDS = [
    (53, [57, 60, 64, 65 + 12]),  # Fmaj7
    (52, [55, 59, 62, 64 + 12]),  # Em7
    (50, [53, 57, 60, 62 + 12]),  # Dm7
    (48, [52, 55, 59, 60 + 12]),  # Cmaj7
]

n = int(SR * (LENGTH + 4))
t_all = np.arange(n) / SR
pad = np.zeros(n)
keys = np.zeros(n)
bass = np.zeros(n)
drums = np.zeros(n)


def place(buf, start, wave):
    i = int(start * SR)
    end = min(len(buf), i + len(wave))
    if i < len(buf):
        buf[i:end] += wave[: end - i]


def adsr(length, attack, release):
    k = np.ones(length)
    a, r = int(attack * SR), int(release * SR)
    k[:a] = np.linspace(0, 1, a)
    k[-r:] *= np.linspace(1, 0, r)
    return k


chord_len = 2 * BAR
time = 0.0
step = 0
while time < LENGTH + 2:
    root, notes = CHORDS[step % len(CHORDS)]
    # Pad: detuned triangles, long attack and release, overlapping chords.
    m = int(SR * (chord_len + 1.5))
    t = np.arange(m) / SR
    p = sum(
        signal.sawtooth(2 * np.pi * hz(note) * d * t, 0.5)
        for note in notes
        for d in (0.997, 1.0, 1.003)
    )
    place(pad, time, p * adsr(m, 1.2, 1.6))
    # Bass: soft sine on the root, one note per bar.
    for b in range(2):
        mb = int(SR * BAR)
        tb = np.arange(mb) / SR
        place(
            bass,
            time + b * BAR,
            np.sin(2 * np.pi * hz(root - 12) * tb) * adsr(mb, 0.04, 0.8),
        )
    # Electric piano: gentle arpeggio on eighth notes, FM bell tone.
    arp = notes + notes[-2:0:-1]
    for k in range(int(chord_len / (BEAT / 2))):
        note = arp[k % len(arp)] + 12
        mk = int(SR * 1.6)
        tk = np.arange(mk) / SR
        f = hz(note)
        tone = np.sin(2 * np.pi * f * tk + 1.3 * np.exp(-tk * 6) * np.sin(2 * np.pi * f * tk))
        vel = 0.75 + 0.25 * rng.random()
        place(keys, time + k * BEAT / 2, tone * np.exp(-tk * 2.8) * vel)
    time += chord_len
    step += 1

# Drums: soft kick on 1 and 3, quiet filtered shaker on the off-beats.
mk = int(SR * 0.5)
tk = np.arange(mk) / SR
kick = np.sin(2 * np.pi * (48 * tk + 40 * (1 - np.exp(-tk * 30)) / 30)) * np.exp(-tk * 9)
sh_len = int(SR * 0.09)
shaker = signal.sosfilt(
    signal.butter(2, [5000, 9000], "band", fs=SR, output="sos"),
    rng.standard_normal(sh_len),
) * np.exp(-np.arange(sh_len) / SR * 45)
b = BAR  # drums come in after the first bar
while b < LENGTH + 2:
    place(drums, b, kick)
    place(drums, b + 2 * BEAT, kick * 0.8)
    for e in range(4):
        place(drums, b + e * BEAT + BEAT / 2, shaker * 0.5)
    b += BAR


def lowpass(x, cutoff):
    return signal.sosfilt(signal.butter(2, cutoff, "low", fs=SR, output="sos"), x)


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


mix = (
    0.30 * norm(lowpass(pad, 1400))
    + 0.30 * norm(lowpass(keys, 3500))
    + 0.32 * norm(lowpass(bass, 300))
    + 0.22 * norm(drums)
)

# Reverb: exponentially decaying noise impulse, separate per channel.
ir_len = int(SR * 2.6)
decay = np.exp(-np.arange(ir_len) / SR * 2.2)
wet = [
    signal.fftconvolve(mix, lowpass(rng.standard_normal(ir_len), 6000) * decay)[:n]
    for _ in range(2)
]
stereo = np.stack([mix + 0.35 * norm(w) * np.max(np.abs(mix)) for w in wet], axis=1)
stereo += 0.003 * rng.standard_normal(stereo.shape)  # faint tape hiss

stereo = stereo[: int(SR * LENGTH)]
fade_in, fade_out = int(SR * 1.0), int(SR * 2.5)
stereo[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
stereo[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]
stereo = stereo / np.max(np.abs(stereo)) * 10 ** (-1.5 / 20)

OUT.mkdir(parents=True, exist_ok=True)
wavfile.write(OUT / "chill.wav", SR, (stereo * 32767).astype(np.int16))
