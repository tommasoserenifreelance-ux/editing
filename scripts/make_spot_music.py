"""Generate a royalty-free TV-spot style bed for the Maskhim double-cam reel.

The bar grid is locked to the edit: the first downbeat with drums lands on the
cut to the wide camera, the second section on the cut back to the close-up and
the final hit on the end logo.

Usage: python3 scripts/make_spot_music.py out.wav [length] [drums_in] [logo_hit]
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
OUT = sys.argv[1]
LENGTH = float(sys.argv[2]) if len(sys.argv) > 2 else 19.22
DRUMS_IN = float(sys.argv[3]) if len(sys.argv) > 3 else 3.37
LOGO_HIT = float(sys.argv[4]) if len(sys.argv) > 4 else 16.82
rng = np.random.default_rng(11)

# Six bars between the drums entry and the logo hit.
BAR = (LOGO_HIT - DRUMS_IN) / 6
BEAT = BAR / 4
T0 = DRUMS_IN - 2 * BAR  # grid origin (negative: the track starts mid-bar)
SECTION_C = DRUMS_IN + 3 * BAR  # fuller groove, close to the cut back to close-up
DROP = LOGO_HIT - 2 * BEAT  # drums stop, riser takes over

n = int(SR * LENGTH)
t = np.arange(n) / SR


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def place(buf, start_s, sig):
    s = int(round(start_s * SR))
    if s >= n or s + len(sig) <= 0:
        return
    a, b = max(0, -s), min(len(sig), n - s)
    buf[s + a : s + b] += sig[a:b]


# A minor: Am, F, C, G (x2), final Am(add9) on the logo.
CHORDS = [
    [45, 57, 60, 64, 71],
    [41, 57, 60, 65, 69],
    [48, 55, 60, 64, 67],
    [43, 55, 59, 62, 67],
]
FINAL = [45, 57, 60, 64, 71, 76]


def chord_at(bar_index):
    return CHORDS[bar_index % 4]


pad = np.zeros(n)
pluck = np.zeros(n)
bass = np.zeros(n)
kick = np.zeros(n)
hats = np.zeros(n)
clap = np.zeros(n)
fx = np.zeros(n)
duck = np.ones(n)  # kick-driven pumping on pad and bass

# --- Pad: detuned saw-ish stack, chords overlap for seamless changes.
for k in range(0, 8):
    start = T0 + k * BAR
    if start >= LOGO_HIT:
        break
    ln = int((BAR + 1.2) * SR)
    tt = np.arange(ln) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, np.maximum(0, (BAR + 1.2 - tt)) / 1.0)
    v = np.zeros(ln)
    for note in chord_at(k)[1:]:
        f = hz(note)
        for d in (0.994, 1.0, 1.006):
            ph = rng.uniform(0, 6.28)
            v += sum(np.sin(2 * np.pi * f * d * h * tt + ph) / h for h in (1, 2, 3, 4))
    place(pad, start, v * env)
pad = lp(pad, 1800)
pad[t > LOGO_HIT] *= 0

# --- Pluck arpeggio, eighth notes, from the start until the drop.
pattern = [1, 2, 3, 4, 3, 2, 4, 3]
for k in range(0, 8):
    tones = [x + 12 for x in chord_at(k)[1:]]
    for step in range(8):
        st = T0 + k * BAR + step * BEAT / 2
        if st < 0 or st >= DROP:
            continue
        f = hz(tones[pattern[step] - 1])
        ln = int(1.2 * SR)
        tp = np.arange(ln) / SR
        tone = np.sin(2 * np.pi * f * tp) + 0.25 * np.sin(2 * np.pi * 2 * f * tp) * np.exp(-tp * 12)
        acc = 1.0 if step % 2 == 0 else 0.7
        place(pluck, st, tone * np.exp(-tp * 6) * np.minimum(1, tp / 0.003) * acc)

# --- Kick + bass from the cut to the wide camera.
def kick_hit(level=1.0):
    ln = int(0.45 * SR)
    tp = np.arange(ln) / SR
    f = 45 + 85 * np.exp(-tp * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tp * 7)
    click = hp(rng.standard_normal(ln), 2000) * np.exp(-tp * 300) * 0.15
    return (body + click) * level


def duck_env():
    ln = int(BEAT * SR)
    tp = np.arange(ln) / SR
    return 1 - 0.55 * np.exp(-tp * 9)


beat_idx = 0
bt = DRUMS_IN
while bt < DROP - 1e-6:
    full = bt >= SECTION_C - 1e-6
    on_one_three = beat_idx % 2 == 0
    if full or on_one_three:
        place(kick, bt, kick_hit(1.0 if on_one_three else 0.8))
        s = int(bt * SR)
        e = duck_env()
        duck[s : s + len(e)] = np.minimum(duck[s : s + len(e)], e[: max(0, min(len(e), n - s))])
    # Bass: offbeat eighth pulses on the chord root.
    k = int(np.floor((bt - T0) / BAR + 1e-9))
    root = hz(chord_at(k)[0] - 12)
    for off in (0.0, 0.5):
        st = bt + off * BEAT
        ln = int(BEAT / 2 * SR)
        tp = np.arange(ln) / SR
        b = np.sin(2 * np.pi * root * tp) + 0.3 * np.sin(2 * np.pi * 2 * root * tp)
        env = np.minimum(1, tp / 0.01) * np.exp(-tp * 4) * np.minimum(1, (ln / SR - tp) / 0.02)
        place(bass, st, b * env * (0.6 if off == 0 else 1.0))
    if full:
        # Hats on the offbeats, soft clap on 2 and 4.
        ln = int(0.08 * SR)
        tp = np.arange(ln) / SR
        place(hats, bt + BEAT / 2, hp(rng.standard_normal(ln), 7000) * np.exp(-tp * 60))
        if beat_idx % 2 == 1:
            ln = int(0.25 * SR)
            tp = np.arange(ln) / SR
            nz = sosfilt(butter(2, [900, 3500], "band", fs=SR, output="sos"), rng.standard_normal(ln))
            env = np.exp(-tp * 25) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * tp) > 0) * (tp < 0.03))
            place(clap, bt, nz * env)
    bt += BEAT
    beat_idx += 1

# --- Riser into the logo, then the hit.
rs = LOGO_HIT - 1.9
ln = int((LOGO_HIT - rs) * SR)
tp = np.arange(ln) / SR
x = tp / tp[-1]
noise = rng.standard_normal(ln)
riser = np.zeros(ln)
for i in range(0, ln, 2400):  # sweeping band-pass, block by block
    fc = 400 + 7000 * x[i] ** 2
    seg = noise[i : i + 2400]
    riser[i : i + 2400] = sosfilt(butter(2, [fc * 0.7, min(fc * 1.4, 20000)], "band", fs=SR, output="sos"), seg)
place(fx, rs, riser * x ** 2.2 * 0.8)
tone_rise = np.sin(2 * np.pi * np.cumsum(110 + 330 * x ** 2) / SR) * x ** 3 * 0.25
place(fx, rs, tone_rise)

ln = int(2.6 * SR)
tp = np.arange(ln) / SR
f = 32 + 40 * np.exp(-tp * 8)
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tp * 1.6)
place(fx, LOGO_HIT, boom * 1.2)
stab = np.zeros(ln)
for note in FINAL:
    fr = hz(note)
    stab += sum(np.sin(2 * np.pi * fr * h * tp) * np.exp(-tp * (1.2 + h * 0.8)) / h for h in (1, 2, 3))
place(fx, LOGO_HIT, lp(stab, 3500) * np.minimum(1, tp / 0.004) * 0.35)
place(kick, LOGO_HIT, kick_hit(1.2))

# --- Mix.
def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


music = (
    0.30 * norm(pad) * duck
    + 0.26 * norm(pluck)
    + 0.34 * norm(bass) * duck
    + 0.55 * norm(kick)
    + 0.10 * norm(hats)
    + 0.16 * norm(clap)
)
fxm = 0.75 * norm(fx)

# Voice-friendly EQ: thin the 1-4 kHz presence band of the music a little.
music = music - 0.35 * sosfilt(butter(2, [1200, 3800], "band", fs=SR, output="sos"), music)

ir_t = np.arange(int(2.8 * SR)) / SR
out = []
for ch in range(2):
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.4)
    ir = lp(ir, 5000, 1)
    send = 0.6 * norm(pluck) + 0.3 * norm(pad) + 0.4 * norm(clap) + 0.8 * fxm
    wet = norm(fftconvolve(send, ir)[:n])
    # Light stereo spread on the pluck via a short channel delay.
    d = int((0.011 if ch else 0.0) * SR)
    dry = music + fxm
    if d:
        dry = dry + 0.08 * np.concatenate([np.zeros(d), norm(pluck)[:-d]])
    out.append(dry + 0.22 * wet)
stereo = np.stack(out, axis=1)

fade_in = int(1.2 * SR)
stereo[:fade_in] *= np.linspace(0, 1, fade_in)[:, None] ** 2
tail = int(0.8 * SR)
stereo[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2
stereo = np.tanh(1.2 * stereo / np.max(np.abs(stereo))) / np.tanh(1.2)
stereo *= 0.89

with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print(f"bar={BAR:.4f}s bpm={240 / BAR:.2f} grid origin={T0:.3f}s")
