"""Synthesise an original 128 BPM workout track for the Total Body reel.

Everything is generated from scratch with numpy, so the music is royalty free.
Output: public/audio/totalbody-beat.wav

    python3 scripts/make-totalbody-beat.py
"""

import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 128
BEAT = 60 / BPM
DURATION = 10.25
DROP_BEAT = 4  # the full groove kicks in on beat 4 (1.875 s)

rng = np.random.default_rng(7)
n = int(SR * DURATION)
t_all = np.arange(n) / SR


def lowpass(x, cutoff):
    """One-pole low-pass, cutoff in Hz (scalar or per-sample array)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def place(buf, sound, start_s, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf):
        return
    end = min(len(buf), i + len(sound))
    buf[i:end] += gain * sound[: end - i]


def saw(freq, length, detune=(0.0,)):
    t = np.arange(int(length * SR)) / SR
    out = np.zeros_like(t)
    for d in detune:
        f = freq * (2 ** (d / 1200))
        phase = rng.random()
        out += 2 * ((t * f + phase) % 1) - 1
    return out / len(detune)


# --- one-shot sounds -------------------------------------------------------

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    freq = 45 + 110 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t * 7)
    click = rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.3
    return np.tanh(1.8 * (body + click))


def clap():
    t = np.arange(int(0.25 * SR)) / SR
    noise = highpass(rng.standard_normal(len(t)), 900)
    env = np.exp(-t * 22)
    for off in (0.0, 0.011, 0.022):  # three quick slaps = clap
        env += (t >= off) * np.exp(-np.maximum(t - off, 0) * 180) * 0.8
    return lowpass(noise * env, 7000) * 0.6


def hat(open_=False):
    t = np.arange(int((0.18 if open_ else 0.05) * SR)) / SR
    noise = highpass(rng.standard_normal(len(t)), 7000)
    return noise * np.exp(-t * (18 if open_ else 90))


def pluck(freq, length):
    t = np.arange(int(length * SR)) / SR
    raw = saw(freq, length, detune=(-9, 0, 9))
    return lowpass(raw, 600 + 5000 * np.exp(-t * 14)) * np.exp(-t * 6)


# --- arrangement -------------------------------------------------------------

drums = np.zeros(n)
bass = np.zeros(n)
synth = np.zeros(n)
fx = np.zeros(n)

# Am - F - C - G, one bar each
PROGRESSION = [
    (55.00, [220.00, 261.63, 329.63]),
    (43.65, [174.61, 220.00, 261.63]),
    (65.41, [196.00, 261.63, 329.63]),
    (49.00, [196.00, 246.94, 293.66]),
]

K, C, HC, HO = kick(), clap(), hat(), hat(open_=True)
total_beats = int(DURATION / BEAT) + 1

# Intro (beats 0-3): filtered kicks + accelerating snare roll + noise riser
for b in range(DROP_BEAT):
    place(drums, lowpass(K, 300), b * BEAT, 0.6)
roll_times = []
s = 2 * BEAT
step = BEAT / 2
while s < DROP_BEAT * BEAT - 0.01:
    roll_times.append(s)
    s += step
    if s > 3 * BEAT:
        step = BEAT / 4
for i, s in enumerate(roll_times):
    place(drums, C, s, 0.25 + 0.5 * i / len(roll_times))
riser_len = DROP_BEAT * BEAT
rt = np.arange(int(riser_len * SR)) / SR
riser = highpass(rng.standard_normal(len(rt)), 400 + 6000 * (rt / riser_len) ** 2)
place(fx, riser * (rt / riser_len) ** 2 * 0.35, 0)

# Main groove
for b in range(DROP_BEAT, total_beats):
    start = b * BEAT
    place(drums, K, start, 1.0)
    if b % 2 == 1:
        place(drums, C, start, 0.9)
    place(drums, HO, start + BEAT / 2, 0.35)
    for q in (0.25, 0.75):
        place(drums, HC, start + q * BEAT, 0.18)

    root, chord = PROGRESSION[((b - DROP_BEAT) // 4) % 4]
    # rolling off-beat bass, sidechained by the kick
    for q in (0.5, 0.75):
        note = saw(root * 2, BEAT / 4, detune=(-6, 6))
        place(bass, lowpass(note, 380) * np.hanning(len(note)) ** 0.3, start + q * BEAT, 0.9)
    # 16th-note arpeggio
    arp = [chord[0], chord[1], chord[2], chord[1] * 2]
    for i, f in enumerate(arp):
        place(synth, pluck(f * 2, BEAT / 2), start + i * BEAT / 4, 0.28)

# Impact on the drop
it = np.arange(int(1.2 * SR)) / SR
place(fx, lowpass(rng.standard_normal(len(it)), 2500) * np.exp(-it * 4) * 0.5, DROP_BEAT * BEAT)
place(fx, np.sin(2 * np.pi * 50 * it) * np.exp(-it * 3) * 0.6, DROP_BEAT * BEAT)

# Pumping sidechain on bass + synth
duck = np.ones(n)
for b in range(DROP_BEAT, total_beats):
    i = int(b * BEAT * SR)
    seg = np.arange(int(BEAT * SR)) / SR
    curve = 1 - 0.75 * np.exp(-seg * 16)
    end = min(n, i + len(curve))
    duck[i:end] = curve[: end - i]

mix = drums * 0.8 + (bass + synth) * duck + fx
mix = np.tanh(mix * 1.3)  # glue / soft clip
fade = np.clip((DURATION - t_all) / 0.35, 0, 1)
mix *= fade
mix /= np.max(np.abs(mix)) / 0.89

stereo = np.stack([mix, mix], axis=1)
out = Path(__file__).resolve().parent.parent / "public/audio/totalbody-beat.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print(f"wrote {out}")
