"""DHEA uomo bed: 118 BPM E-minor groove (variant of the omega bed) (different from the DHEA/thyroid beds) (different from the thyroid bed),
derived from music_tir.py.
Dark documentary trap bed in the spirit of the Pulp Podcast reference.

129 BPM, 808 sub in F# minor, soft kick/clap, quiet hats, dark pad.
Sections (seconds on the reel timeline): intro (pad + sub) until the
symptom montage, full beat, a lighter break on the prevention message,
full beat again, tail at the end. Ducked under the voice.
usage: music_tir.py voice.wav out.wav duration drop_at break_at return_at end_at
"""
import sys
import numpy as np
import soundfile as sf

SR = 48000
voice_path, out_path = sys.argv[1], sys.argv[2]
DUR, DROP, BRK, RET, END = map(float, sys.argv[3:8])
BPM = 118.0
BEAT = 60 / BPM
N = int(DUR * SR)
rng = np.random.default_rng(77)


def env(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


def note(m):  # midi -> Hz
    return 440 * 2 ** ((m - 69) / 12)


mix_drums = np.zeros(N)
mix_bass = np.zeros(N)
mix_pad = np.zeros((N, 2))


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.002, 0.18) * 0.9


def clap():
    n = int(0.3 * SR)
    noise = rng.standard_normal(n)
    # crude band-pass: difference of moving averages
    lp = np.convolve(noise, np.ones(6) / 6, "same")
    bp = lp - np.convolve(lp, np.ones(40) / 40, "same")
    e = env(n, 0.001, 0.07)
    return bp * e * 0.55


def hat(open_=False):
    n = int((0.12 if open_ else 0.04) * SR)
    noise = rng.standard_normal(n)
    hp = noise - np.convolve(noise, np.ones(4) / 4, "same")
    return hp * env(n, 0.0005, 0.03 if open_ else 0.012) * 0.22


def b808(freq, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.6 * np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.004, length * 0.55)
    return np.tanh(2.2 * s) * 0.7


def pad(midis, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, m in enumerate(midis):
        for d, pan in ((-0.09, 0.3), (0.0, 0.5), (0.11, 0.7)):
            fr = note(m) * 2 ** (d / 12)
            saw = 2 * ((t * fr + rng.random()) % 1) - 1
            out[:, 0] += saw * (1 - pan)
            out[:, 1] += saw * pan
    # soft low-pass by repeated moving average
    for _ in range(3):
        for c in range(2):
            out[:, c] = np.convolve(out[:, c], np.ones(24) / 24, "same")
    a = np.minimum(1, t / 0.6) * np.minimum(1, (length - t) / 0.5)
    return out * a[:, None] * 0.05


# progression, 2 bars each: Em - C - G - D
PROG = [(40, [64, 67, 71]), (36, [60, 64, 67]), (31, [59, 62, 67]), (38, [57, 62, 66])]


def bell(m, length=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.08)
    return s * env(n, 0.003, 0.16) * 0.16


mix_bell = np.zeros(N)
BAR = 4 * BEAT
nbars = int(DUR / BAR) + 2
for b in range(nbars):
    t0 = b * BAR
    root, chord = PROG[(b // 2) % 4]
    if b % 2 == 0:
        p = pad(chord, 2 * BAR + 0.5)
        i = int(t0 * SR)
        j = min(N, i + len(p))
        if i < N:
            mix_pad[i:j] += p[: j - i]
    full = DROP <= t0 < BRK or RET <= t0 < END
    light = BRK <= t0 < RET
    # 808: bar downbeat + syncopated hit on the "and" of 3
    for off, ln in ((0, 1.6 * BEAT), (2.5 * BEAT, 1.2 * BEAT)):
        if t0 + off < END + 0.2:
            add(mix_bass, t0 + off, b808(note(root), ln), 1.0 if (full or light or t0 < DROP) else 0.0)
    # bell arpeggio (16ths, chord tones an octave up), always on, quieter in the break
    arp = [chord[0], chord[2], chord[1] + 12, chord[2], chord[0] + 12, chord[1], chord[2] + 12, chord[1]]
    for k in range(8):  # 8ths, syncopated accents
        if t0 + k * BEAT / 2 < END and k not in (3, 6):
            add(mix_bell, t0 + k * BEAT / 2, bell(arp[k % 8], 0.7), (0.55 if light else 1.0) * (1.0 if k in (0, 5) else 0.65))
    if full:
        add(mix_drums, t0, kick())
        add(mix_drums, t0 + 1.75 * BEAT, kick(), 0.7)
        add(mix_drums, t0 + 3.5 * BEAT, kick(), 0.6)
        add(mix_drums, t0 + 2 * BEAT, clap())
        for k in range(8):
            add(mix_drums, t0 + k * BEAT / 2, hat(open_=(k == 5)), 0.9 if k % 2 else 1.0)
        if b % 2 == 1:  # triplet hat roll
            for k in range(6):
                add(mix_drums, t0 + 3 * BEAT + k * BEAT / 6, hat(), 0.55)
    elif light:
        add(mix_drums, t0, kick(), 0.6)
        add(mix_drums, t0 + 2 * BEAT, clap(), 0.4)

mono = mix_drums * 0.9 + mix_bass * 1.0 + mix_bell * 0.8
out = mix_pad + mono[:, None]
# intro: low-passed feel by attenuating drums only (none) — fade in
t = np.arange(N) / SR
fade_in = np.minimum(1, t / 0.15)
fade_out = np.clip((END + 1.2 - t) / 1.2, 0, 1)
out *= (fade_in * fade_out)[:, None]

# duck under the voice
v, vsr = sf.read(voice_path)
if v.ndim > 1:
    v = v.mean(1)
if vsr != SR:
    idx = (np.arange(int(len(v) * SR / vsr)) * vsr / SR).astype(int)
    v = v[idx]
v = np.pad(v, (0, max(0, N - len(v))))[:N]
w = int(0.05 * SR)
ve = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, "same"))
ve = ve / (ve.max() + 1e-9)
talk = np.clip(ve * 6, 0, 1)
# smooth release
sm = np.copy(talk)
alpha = np.exp(-1 / (0.25 * SR))
for i in range(1, N):
    sm[i] = max(talk[i], sm[i - 1] * alpha)
gain = 1 - 0.45 * sm  # about -5 dB under speech
out *= gain[:, None]

out /= np.max(np.abs(out)) + 1e-9
out *= 0.5
sf.write(out_path, out.astype(np.float32), SR)
print("music", out.shape, "peak", float(np.max(np.abs(out))))
