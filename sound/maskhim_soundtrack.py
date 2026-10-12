import numpy as np, wave, sys

SR = 48000
DUR = 24.5  # 20.25s of footage + logo end card (crossfade through black at ~20.5)
N = int(SR * DUR)
rng = np.random.default_rng(7)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
send = np.zeros((N, 2))  # reverb send


def tt(d):
    return np.arange(int(d * SR)) / SR


def fft_filter(x, lo=None, hi=None, slope=4):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / (1 + (f / hi) ** slope)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** slope)
    return np.fft.irfft(X * g, len(x))


def place(bus, start, sig, gain=1.0, pan=0.0):
    i = int(start * SR)
    if sig.ndim == 1:
        l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    j = min(N, i + len(sig))
    if j > i:
        bus[i:j] += sig[: j - i] * gain


def env(n, a, r, shape=3.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** shape
    return e


def saw(freq, t, phase=0.0):
    # band-limited-ish saw with additive harmonics
    out = np.zeros_like(t)
    k = 1
    while k * freq < 6000 and k < 40:
        out += np.sin(2 * np.pi * k * freq * t + phase * k) / k
        k += 1
    return out


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- MUSIC ----------------
BPM = 88
BEAT = 60 / BPM

# Drone/pad: D minor colour. Chords (midi notes) with start times
chords = [
    (0.0, 4.04, [38, 50, 57, 62, 65]),      # Dm
    (4.04, 2.75, [34, 46, 53, 62, 65]),     # Bb(add)
    (6.79, 4.2, [31, 43, 50, 58, 62]),      # Gm
    (11.0, 4.9, [38, 50, 57, 64, 65, 69]),  # Dm(add9)
    (15.9, 4.6, [34, 46, 57, 62, 65, 69]),  # Bbmaj7
    (20.55, 3.95, [26, 38, 50, 57, 62, 64, 69]),  # Dm(add9) under the logo
]
for st, d, notes in chords:
    t = tt(d + 1.5)
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    for m in notes:
        f = midi(m)
        amp = 0.5 if m < 45 else 0.22
        L += amp * saw(f * 0.997, t, rng.uniform(0, 6))
        R += amp * saw(f * 1.003, t, rng.uniform(0, 6))
    # slow filter opening per chord
    L = fft_filter(L, lo=30, hi=900 if st < 11 else 1500, slope=3)
    R = fft_filter(R, lo=30, hi=900 if st < 11 else 1500, slope=3)
    e = env(len(t), 1.2 if st == 0 else 0.6, 1.5, 2)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.25 * t)
    place(music, st, np.stack([L, R], 1) * (e * trem)[:, None], 0.09)
    place(send, st, np.stack([L, R], 1) * e[:, None], 0.03)

# Heartbeat pulse in the first half (on the beat grid), then a fuller pulse after reveal
def kick(f0=70, f1=38, d=0.45):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 18)) / SR
    return np.sin(ph) * np.exp(-t * 7)

b = 0
while True:
    s = b * BEAT
    if s > DUR - 0.8:
        break
    if 2.6 < s < 9.0 and b % 2 == 0:
        place(music, s, kick(60, 36, 0.5), 0.35)
        place(music, s + 0.22, kick(55, 34, 0.4), 0.18)  # "lub-dub"
    if 11.0 <= s < 20.2 and not 13.4 < s < 14.7:  # breathe through the dip to black
        place(music, s, kick(), 0.42)
    b += 1

# Arpeggio (soft plucked bell) after reveal
arp = [62, 69, 72, 74, 77, 74, 72, 69]
k = 0
s = 11.0
while s < 20.2:
    if 13.4 < s < 14.7:
        s += BEAT / 2
        k += 1
        continue
    seg = 0 if s < 15.9 else 1
    m = arp[k % len(arp)] - (0 if seg == 0 else 0)
    if seg == 1 and m == 72:
        m = 70  # Bb colour
    t = tt(1.2)
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 5)
    sig *= env(len(t), 0.004, 0.05)
    place(music, s, sig, 0.06, pan=0.5 * np.sin(k * 1.3))
    place(send, s, sig, 0.08)
    s += BEAT / 2
    k += 1

# Sub bass under reveal section
t = tt(9.3)
sub = np.sin(2 * np.pi * midi(26) * t)
sub[int(4.9 * SR):] = np.sin(2 * np.pi * midi(22) * t[int(4.9 * SR):])
place(music, 11.0, sub * env(len(t), 0.05, 1.5), 0.16)

# ---------------- SFX ----------------
def noise(d):
    return rng.standard_normal(int(d * SR))


def whoosh(d=0.9, peak=0.5, lo=200, hi=4000):
    n = noise(d)
    t = tt(d)
    out = np.zeros_like(t)
    bands = np.geomspace(lo, hi, 6)
    for i, fc in enumerate(bands):
        b = fft_filter(n, lo=fc * 0.7, hi=fc * 1.4, slope=4)
        c = peak * d * (0.6 + 0.8 * i / 5)  # higher bands peak later -> sweep
        out += b * np.exp(-((t - c) / (d * 0.22)) ** 2)
    out = fft_filter(out, hi=7000, slope=4)
    out /= np.max(np.abs(out)) + 1e-9
    return out


def boom(d=2.5):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(32 + 50 * np.exp(-t * 9)) / SR
    body = np.sin(ph) * np.exp(-t * 2.2)
    click = fft_filter(noise(d), lo=800, hi=4000) * np.exp(-t * 80) * 0.25
    return body + click


def droplet(f0=500, f1=1500, d=0.25):
    t = tt(d)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 60))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 28) * env(len(t), 0.002, 0.02)


def bell(f, d=3.0):
    t = tt(d)
    parts = [(1, 1, 1.5), (2.76, 0.4, 3), (5.4, 0.2, 5), (8.9, 0.08, 8)]
    return sum(a * np.sin(2 * np.pi * f * p * t) * np.exp(-t * k) for p, a, k in parts) * env(len(t), 0.003, 0.1)


def sparkles(d, dens0, dens1, seed):
    r = np.random.default_rng(seed)
    out = np.zeros((int(d * SR), 2))
    t = 0.0
    while t < d:
        dens = dens0 + (dens1 - dens0) * t / d
        t += r.exponential(1 / dens)
        if t >= d:
            break
        f = r.uniform(3000, 9000)
        g = tt(0.08)
        p = np.sin(2 * np.pi * f * g) * np.exp(-g * 70) * r.uniform(0.2, 1)
        pan = r.uniform(-1, 1)
        i = int(t * SR)
        j = min(len(out), i + len(p))
        out[i:j, 0] += p[: j - i] * np.sqrt((1 - pan) / 2)
        out[i:j, 1] += p[: j - i] * np.sqrt((1 + pan) / 2)
    return out


def riser(d):
    t = tt(d)
    n = fft_filter(noise(d), lo=1500, hi=12000, slope=2)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 600 * (t / d) ** 2) / SR) * 0.3
    return (n * 0.6 + tone) * (t / d) ** 3


# 0.00 face: soft air
a = fft_filter(noise(1.0), lo=300, hi=3000) * env(int(SR), 0.4, 0.4, 1)
place(sfx, 0.0, a, 0.03)

# 0.71 cut to bubbles: whoosh + bubbly blips
place(sfx, 0.40, whoosh(0.6), 0.22)
for i in range(14):
    s = 0.72 + rng.uniform(0, 0.62)
    f0 = rng.uniform(250, 600)
    place(sfx, s, droplet(f0, f0 * 2.2, 0.12), 0.10, pan=rng.uniform(-0.8, 0.8))
    place(send, s, droplet(f0, f0 * 2.2, 0.12), 0.05)

# 1.375 box reveal: deep impact + light shimmer
place(sfx, 1.05, whoosh(0.4, 0.8, 100, 1500), 0.20)
place(sfx, 1.375, boom(), 0.55)
place(send, 1.375, boom(), 0.08)
place(sfx, 1.40, fft_filter(noise(1.3), lo=5000, hi=14000) * env(int(1.3 * SR), 0.5, 0.7, 1), 0.035)

# 2.75 water drop + ripples
place(sfx, 2.48, whoosh(0.35, 0.8, 300, 3000), 0.10)
place(sfx, 2.80, droplet(450, 1300, 0.3), 0.40)
place(send, 2.80, droplet(450, 1300, 0.3), 0.30)
for k, (dt, f) in enumerate([(0.32, 700), (0.55, 900), (0.8, 1100)]):
    place(sfx, 2.80 + dt, droplet(f, f * 1.8, 0.15), 0.12 / (k + 1), pan=(-1) ** k * 0.4)
    place(send, 2.80 + dt, droplet(f, f * 1.8, 0.15), 0.08)

# 4.04 patch appears: whoosh + bell
place(sfx, 3.55, whoosh(0.6), 0.22)
place(sfx, 4.04, bell(midi(74)), 0.10)
place(send, 4.04, bell(midi(74)), 0.12)

# 6.00 box: impact
place(sfx, 5.6, whoosh(0.5, 0.85, 100, 2000), 0.18)
place(sfx, 6.0, boom(2.0), 0.45)

# 6.79 dark patch: soft swish + low bell
place(sfx, 6.5, whoosh(0.4), 0.15)
place(sfx, 6.79, bell(midi(62), 3.5), 0.08)
place(send, 6.79, bell(midi(62), 3.5), 0.10)

# 8.4 -> 9.29 riser into particles
place(sfx, 8.4, riser(0.9), 0.15)

# 9.29 particles: shimmer cascade building to reveal ~11.0
sp = sparkles(2.3, 15, 140, 3)
sp *= np.linspace(0.4, 1, len(sp))[:, None]
place(sfx, 9.29, sp, 0.10)
place(send, 9.29, sp, 0.10)
sand = fft_filter(noise(2.3), lo=3000, hi=12000, slope=2) * np.linspace(0, 1, int(2.3 * SR)) ** 2
place(sfx, 9.29, sand, 0.06)

# Reverse-swell riser into the reveal
place(sfx, 9.8, riser(1.2), 0.20)

# 11.0 reveal: impact + bloom
place(sfx, 11.0, boom(3.0), 0.6)
place(send, 11.0, boom(3.0), 0.1)
place(sfx, 11.0, bell(midi(74), 4), 0.12)
place(sfx, 11.0, bell(midi(81), 4), 0.06)
place(send, 11.0, bell(midi(74), 4), 0.15)

# 13.5-14.1 dip to black: whoosh peaking on the black frame, soft bell as the shot fades back up
place(sfx, 13.3, whoosh(1.0, 0.8, 150, 3000), 0.16)
place(sfx, 14.2, bell(midi(69), 3.0), 0.07)
place(send, 14.2, bell(midi(69), 3.0), 0.10)
place(sfx, 14.2, fft_filter(noise(1.2), lo=4000, hi=12000) * env(int(1.2 * SR), 0.5, 0.6, 1), 0.03)

# 14.75-20.25 slow continuous rotation: one long airy swell panning with the turn
rot = whoosh(5.5, 0.6, 400, 6000)
pan = np.linspace(-0.6, 0.6, len(rot))
place(sfx, 14.75, np.stack([rot * np.sqrt((1 - pan) / 2), rot * np.sqrt((1 + pan) / 2)], 1) * 1.414, 0.05)

# 20.25-20.5 crossfade through black into the logo: riser + whoosh landing on the black frame
place(sfx, 19.3, riser(1.2), 0.18)
place(sfx, 19.95, whoosh(0.7, 0.8, 100, 3000), 0.22)

# 20.55 logo appears: main impact + bells
place(sfx, 20.55, boom(3.5), 0.6)
place(send, 20.55, boom(3.5), 0.1)
place(sfx, 20.55, bell(midi(62), 3.9), 0.12)
place(sfx, 20.55, bell(midi(74), 3.9), 0.07)
place(send, 20.55, bell(midi(74), 3.9), 0.15)

# 21.75-22.55 glint sweeping across the logo: sparkle sweep left -> right
gl = sparkles(0.8, 60, 60, 11)
gl[:, 0] *= np.linspace(1, 0.2, len(gl))
gl[:, 1] *= np.linspace(0.2, 1, len(gl))
place(sfx, 21.75, gl, 0.08)
place(send, 21.75, gl, 0.08)
place(sfx, 21.75, bell(midi(86), 2.0), 0.03, pan=0.3)

# ---------------- REVERB ----------------
irt = tt(2.8)
ir = np.stack([rng.standard_normal(len(irt)), rng.standard_normal(len(irt))], 1) * np.exp(-irt * 2.4)[:, None]
ir[:, 0] = fft_filter(ir[:, 0], hi=6000)
ir[:, 1] = fft_filter(ir[:, 1], hi=6000)
L = N + len(irt)
nfft = 1 << (L - 1).bit_length()
wet = np.zeros((N, 2))
for c in range(2):
    y = np.fft.irfft(np.fft.rfft(send[:, c], nfft) * np.fft.rfft(ir[:, c], nfft), nfft)[:N]
    wet[:, c] = y
wet /= np.max(np.abs(wet)) + 1e-9
wet *= 0.25

mix = music + sfx + wet
# fade out the last 1.2s
fo = int(1.2 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok")
