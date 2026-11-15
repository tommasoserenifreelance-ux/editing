"""Generate a royalty-free tech house bed (glamour TV-spot feel) locked to an edit.

Seven bars sit between the drop (first full kick) and the end-logo hit, which
gives ~125 BPM for the Maskhim double-cam reel. Before the drop the groove runs
through a closing low-pass filter; a snare roll and a riser lead into the hit.

Usage: python3 scripts/make_techhouse_music.py out.wav [length] [drop] [logo_hit]
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt, sosfilt_zi

SR = 48000
OUT = sys.argv[1]
LENGTH = float(sys.argv[2]) if len(sys.argv) > 2 else 19.22
DROP = float(sys.argv[3]) if len(sys.argv) > 3 else 3.37
LOGO_HIT = float(sys.argv[4]) if len(sys.argv) > 4 else 16.82
rng = np.random.default_rng(23)

BAR = (LOGO_HIT - DROP) / 7
BEAT = BAR / 4
S16 = BEAT / 4
T0 = DROP - 2 * BAR
SECTION_B = DROP + 3.5 * BAR  # stabs come in, near the cut back to close-up
KICK_OUT = LOGO_HIT - 2 * BEAT
ROLL_IN = LOGO_HIT - BAR

n = int(SR * LENGTH)
t = np.arange(n) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bq(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return sosfilt(bq(kind, f, order), x)


def place(buf, start_s, sig):
    s = int(round(start_s * SR))
    if s >= n or s + len(sig) <= 0:
        return
    a, b = max(0, -s), min(len(sig), n - s)
    buf[s + a : s + b] += sig[a:b]


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def sweep_lowpass(x, f_of_t, block=1024):
    """Block-wise time-varying low-pass (state carried between blocks)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        f = float(np.clip(f_of_t(i / SR), 60, 20000))
        sos = bq("low", f)
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        y[i : i + block], zi = sosfilt(sos, x[i : i + block], zi=zi)
    return y


def grid(step_len, start, end):
    k0 = int(np.ceil((start - T0) / step_len - 1e-9))
    k = k0
    while True:
        tt = T0 + k * step_len
        if tt >= end - 1e-9:
            return
        yield k, tt
        k += 1


# ---------------------------------------------------------------- instruments
def kick_hit(level=1.0):
    ln = int(0.32 * SR)
    tp = np.arange(ln) / SR
    f = 48 + 120 * np.exp(-tp * 38)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tp * 9)
    click = filt(rng.standard_normal(ln), "high", 3000) * np.exp(-tp * 400) * 0.25
    return np.tanh(2.2 * (body + click)) * level


def clap_hit():
    ln = int(0.35 * SR)
    tp = np.arange(ln) / SR
    nz = filt(rng.standard_normal(ln), "band", [1000, 4000])
    env = np.exp(-tp * 18)
    for d in (0.0, 0.011, 0.022):  # three quick bursts
        env += 0.8 * np.exp(-np.maximum(0, tp - d) * 300) * (tp >= d)
    return nz * env


def hat(open_=False):
    ln = int((0.18 if open_ else 0.05) * SR)
    tp = np.arange(ln) / SR
    nz = filt(rng.standard_normal(ln), "high", 8000 if open_ else 9500)
    return nz * np.exp(-tp * (22 if open_ else 90))


def shaker():
    ln = int(0.06 * SR)
    tp = np.arange(ln) / SR
    nz = filt(rng.standard_normal(ln), "band", [5000, 11000])
    return nz * np.minimum(1, tp / 0.01) * np.exp(-tp * 70)


def saw(f, tp, detune=(0.995, 1.0, 1.005)):
    out = np.zeros_like(tp)
    for d in detune:
        ph = (f * d * tp + rng.uniform()) % 1.0
        out += 2 * ph - 1
    return out / len(detune)


def bass_note(midi, length, accent=1.0):
    ln = int(length * SR)
    tp = np.arange(ln) / SR
    f = hz(midi)
    sub = np.sin(2 * np.pi * f * tp)
    grit = filt(saw(f, tp, (1.0,)), "low", 300 + 900 * accent)
    env = np.minimum(1, tp / 0.004) * np.exp(-tp * 9) * np.minimum(1, (length - tp) / 0.01)
    return np.tanh(1.8 * (0.9 * sub + 0.55 * grit)) * env * accent


def stab(notes, length=0.28):
    ln = int(length * SR)
    tp = np.arange(ln) / SR
    v = sum(saw(hz(m), tp) for m in notes)
    v = filt(v, "low", 2600)
    return v * np.minimum(1, tp / 0.003) * np.exp(-tp * 11)


# ------------------------------------------------------------------- patterns
AM9 = [57, 60, 64, 67, 71]
FMAJ9 = [57, 60, 64, 65, 69]
kick = np.zeros(n)
clap = np.zeros(n)
hats = np.zeros(n)
shk = np.zeros(n)
bass = np.zeros(n)
stabs = np.zeros(n)
fx = np.zeros(n)
duck = np.ones(n)

for k, bt in grid(BEAT, 0, KICK_OUT):
    place(kick, bt, kick_hit(1.0))
    s = int(bt * SR)
    ln = min(int(BEAT * SR), n - s)
    tp = np.arange(ln) / SR
    duck[s : s + ln] = np.minimum(duck[s : s + ln], 1 - 0.75 * np.exp(-tp * 14))
    if k % 2 == 1 and bt >= DROP - 1e-6:
        place(clap, bt, clap_hit())
    place(hats, bt + BEAT / 2, hat(open_=True))

for k, st in grid(S16, 0, KICK_OUT):
    place(shk, st, shaker() * (1.0 if k % 2 else 0.55))
    if st >= SECTION_B and k % 4 in (1, 3):
        place(hats, st, hat() * 0.5)

# Rolling offbeat bassline in A, with a lift to C / G at the end of each 2 bars.
for k, st in grid(S16, 0, KICK_OUT):
    pos = k % 4
    if pos not in (2, 3) and not (pos == 1 and k % 16 == 13):
        continue
    bar_idx = int(np.floor((st - T0) / BAR + 1e-9))
    in_bar = k % 16
    root = 33
    if bar_idx % 2 == 1 and in_bar >= 12:
        root = 36 if bar_idx % 4 == 1 else 31
    accent = 1.0 if pos == 2 else 0.75
    place(bass, st, bass_note(root + (12 if (in_bar in (7, 15)) else 0), S16 * 0.95, accent))

# Glamour stabs: syncopated minor-9 chords from section B, plus one in the intro tail.
stab_steps = (3, 6, 10)
for k, st in grid(S16, SECTION_B - BAR / 2, KICK_OUT):
    bar_idx = int(np.floor((st - T0) / BAR + 1e-9))
    if k % 16 in stab_steps:
        place(stabs, st, stab(AM9 if bar_idx % 2 == 0 else FMAJ9))

# Snare roll into the logo: eighths -> sixteenths -> 32nds, rising.
roll_t = ROLL_IN
while roll_t < LOGO_HIT - 1e-6:
    x = (roll_t - ROLL_IN) / BAR
    step = BEAT / 2 if x < 0.5 else (S16 if x < 0.8 else S16 / 2)
    ln = int(0.12 * SR)
    tp = np.arange(ln) / SR
    sn = filt(rng.standard_normal(ln), "band", [800, 6000]) * np.exp(-tp * 30)
    sn += 0.5 * np.sin(2 * np.pi * (190 + 120 * x) * tp) * np.exp(-tp * 40)
    place(fx, roll_t, sn * (0.25 + 0.75 * x**1.5))
    roll_t += step

# Riser (noise sweep + pitch rise) into the logo.
ln = int(2.0 * SR)
tp = np.arange(ln) / SR
xr = tp / tp[-1]
riser = sweep_lowpass(rng.standard_normal(ln), lambda s: 300 + 12000 * (s / 2.0) ** 2)
riser = filt(riser, "high", 400) * xr**2.5
pitch = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * xr)) / SR) * xr**3 * 0.25
place(fx, LOGO_HIT - 2.0, 0.7 * riser + pitch)

# Small sweep into the drop (kept low, the voice is on).
ln = int(1.0 * SR)
tp = np.arange(ln) / SR
sw = sweep_lowpass(rng.standard_normal(ln), lambda s: 400 + 6000 * s**2)
place(fx, DROP - 1.0, filt(sw, "high", 500) * (tp / tp[-1]) ** 2 * 0.35)

# Logo impact: kick + sub boom + crash + Am9 stab with long tail.
ln = int(2.6 * SR)
tp = np.arange(ln) / SR
boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-tp * 9)) / SR) * np.exp(-tp * 1.8)
crash = filt(rng.standard_normal(ln), "high", 4000) * np.exp(-tp * 2.2) * 0.35
final = sum(saw(hz(m), tp) for m in AM9 + [76])
final = filt(final, "low", 3000) * np.minimum(1, tp / 0.004) * np.exp(-tp * 1.4) * 0.22
place(fx, LOGO_HIT, np.tanh(1.5 * boom) * 1.1 + crash + final)
place(kick, LOGO_HIT, kick_hit(1.25))

# ------------------------------------------------------------------------ mix
groove = (
    0.62 * norm(kick)
    + 0.20 * norm(clap)
    + 0.10 * norm(hats)
    + 0.06 * norm(shk)
    + 0.42 * norm(bass) * duck
    + 0.20 * norm(stabs) * duck
)
# Before the drop the groove plays through a closed filter that opens into it.
intro_cut = lambda s: 250 + 1800 * max(0.0, (s - (DROP - 1.5)) / 1.5) ** 2 if s < DROP else 20000
pre = sweep_lowpass(groove[: int(DROP * SR)], intro_cut)
groove[: int(DROP * SR)] = pre * 0.8

fxm = 0.55 * norm(fx)
music = groove + fxm
# Leave room for the voice: dip the 1.2-4 kHz band.
music = music - 0.4 * filt(music, "band", [1200, 4000])

ir_t = np.arange(int(2.2 * SR)) / SR
send = 0.5 * norm(clap) + 0.6 * norm(stabs) + 0.6 * fxm
out = []
for ch in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2), "low", 6000, 1)
    wet = norm(fftconvolve(send, ir)[:n])
    side = 0.06 * norm(hats) * (1 if ch else -1)  # widen the hats a little
    out.append(music + 0.16 * wet + side)
stereo = np.stack(out, axis=1)

fade_in = int(0.25 * SR)
stereo[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
tail = int(0.7 * SR)
stereo[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2
stereo = np.tanh(1.6 * stereo / np.max(np.abs(stereo))) / np.tanh(1.6)
stereo *= 0.89

with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print(f"bar={BAR:.4f}s bpm={240 / BAR:.2f} origin={T0:.3f}s sectionB={SECTION_B:.3f}s")
