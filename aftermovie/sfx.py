"""Synthesised sound design for the aftermovie (no sample libraries needed).

Every sound is built from filtered noise / sines, shaped with smooth envelopes,
decorrelated in stereo and sent through a synthetic plate/hall reverb so it
sits under the music instead of sounding like a stock "swoosh".
"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)


def _t(d):
    return np.arange(int(d * SR)) / SR


def pink(n):
    w = rng.standard_normal(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    p = signal.lfilter(b, a, w)
    return p / (np.abs(p).max() + 1e-9)


def bp(x, lo, hi, order=4):
    sos = signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, order=4):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=4):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def sweep_filter(x, centers, q=1.6):
    """Moving gaussian band-pass in the STFT domain (smooth, no zipper noise)."""
    f, tt, Z = signal.stft(x, SR, nperseg=1024, noverlap=768)
    c = np.interp(np.linspace(0, 1, Z.shape[1]), np.linspace(0, 1, len(centers)), centers)
    lf = np.log2(np.maximum(f, 20))[:, None]
    g = np.exp(-0.5 * ((lf - np.log2(c)[None, :]) * q) ** 2)
    _, y = signal.istft(Z * g, SR, nperseg=1024, noverlap=768)
    return y[:len(x)]


def env(n, attack, release, curve=3.0):
    a = int(attack * SR)
    e = np.ones(n)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    r = n - a
    e[a:] = (1 - np.linspace(0, 1, r)) ** curve if release else 1
    return e


def make_ir(d, damp_hz, pre=0.012):
    n = int(d * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for ch in range(2):
        ir[:, ch] = lp(rng.standard_normal(n), damp_hz, 2) * np.exp(-t * 6.9 / d)
    ir[:int(pre * SR)] = 0
    return ir / np.abs(ir).sum(axis=0).max() * 40


PLATE = make_ir(1.2, 7000)
HALL = make_ir(2.8, 4500, 0.025)


def verb(st, ir, wet):
    out = np.stack([signal.fftconvolve(st[:, c], ir[:, c])[:len(st) + len(ir) - 1] for c in range(2)], 1)
    dry = np.zeros_like(out)
    dry[:len(st)] = st
    return dry * (1 - wet) + out * wet


def stereo(m, pan_from=0.0, pan_to=0.0, width=0.0):
    p = np.linspace(pan_from, pan_to, len(m))
    l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    st = np.stack([m * l, m * r], 1) * np.sqrt(2) / 2 * 1.4
    if width:  # Haas-style decorrelation
        k = int(0.009 * SR)
        st[k:, 1] = st[k:, 1] * (1 - width) + m[:-k] * width * 0.7
    return st


def norm(x, peak):
    return x / (np.abs(x).max() + 1e-9) * peak


# ---------------------------------------------------------------- sounds
def whoosh(d=0.45, f0=350, f1=5000, f2=900, pan=(-0.6, 0.6), peak=0.25, verb_wet=0.3):
    n = int(d * SR)
    x = pink(n)
    k = np.linspace(0, 1, 64)
    centers = np.where(k < 0.55, f0 * (f1 / f0) ** (k / 0.55), f1 * (f2 / f1) ** ((k - 0.55) / 0.45))
    y = sweep_filter(x, centers) * env(n, d * 0.55, True, 2.2)
    return norm(verb(stereo(y, *pan, width=0.5), PLATE, verb_wet), peak)


def air_swish(d=0.22, peak=0.08, pan=0.0):
    n = int(d * SR)
    y = sweep_filter(pink(n), np.geomspace(2500, 7000, 32), q=1.2) * env(n, d * 0.6, True, 2)
    return norm(verb(stereo(y, pan - 0.3, pan + 0.3, 0.6), PLATE, 0.2), peak)


def flash(peak=0.32):
    """Camera flash: shutter double-click, capacitor 'pop', glassy shimmer tail."""
    d = 0.9
    n = int(d * SR)
    t = _t(d)
    m = np.zeros(n)
    for off, g in ((0.0, 1.0), (0.021, 0.6)):          # mechanical shutter
        k = int(off * SR)
        c = bp(rng.standard_normal(int(0.006 * SR)), 1800, 9000) * np.exp(-np.arange(int(0.006 * SR)) / (0.0012 * SR))
        m[k:k + len(c)] += c * g
    pop = np.sin(2 * np.pi * (1800 * t + 2600 * t ** 2 / 0.05)) * np.exp(-t / 0.012)  # flash discharge
    m += 0.25 * pop
    shimmer = hp(bp(pink(n), 5000, 15000), 4500) * np.exp(-t / 0.18) * env(n, 0.01, False)
    m += 0.55 * norm(shimmer, 1)
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.035)  # weight
    m += 0.35 * thump
    return norm(verb(stereo(m, 0, 0, 0.6), PLATE, 0.28), peak)


def sparkle(peak=0.12):
    d = 0.5
    n = int(d * SR)
    t = _t(d)
    y = hp(pink(n), 6000) * np.exp(-t / 0.08)
    return norm(verb(stereo(y, -0.2, 0.2, 0.7), PLATE, 0.35), peak)


def tick(peak=0.12, f=2600):
    d = 0.05
    t = _t(d)
    y = bp(rng.standard_normal(len(t)), f * 0.6, f * 1.8) * np.exp(-t / 0.004)
    y += 0.4 * np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t / 0.006)
    return norm(verb(stereo(y, 0, 0, 0.5), PLATE, 0.15), peak)


def impact(peak=0.7, sub=(68, 30), tail=HALL, wet=0.35, d=1.8):
    n = int(d * SR)
    t = _t(d)
    f = sub[1] + (sub[0] - sub[1]) * np.exp(-t / 0.18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    body = lp(rng.standard_normal(n), 220) * np.exp(-t / 0.07)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004)
    m = np.tanh(1.6 * (s + 0.6 * norm(body, 1) + 0.25 * norm(click, 1)))
    st = stereo(m, 0, 0, 0.0)
    rv = verb(stereo(lp(m, 3000), 0, 0, 0.6), tail, 1.0)
    out = np.zeros_like(rv)
    out[:len(st)] += st
    out += wet * rv
    return norm(out, peak)


def riser(d=1.45, peak=0.3):
    """Reverse-swell into the drop: noise + rising tone, cut dead at the end."""
    n = int(d * SR)
    t = _t(d)
    y = sweep_filter(pink(n), np.geomspace(300, 9000, 64), q=1.0)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / d)) / SR) * 0.25
    e = (t / d) ** 2.6
    st = stereo((norm(y, 1) + tone) * e, -0.3, 0.3, 0.7)
    rev = verb(st[::-1], HALL, 0.6)[::-1][-n:]   # reversed reverb tail -> swell
    return norm(rev, peak)


def glitch(d=0.38, peak=0.18):
    n = int(d * SR)
    m = np.zeros(n)
    pos = 0
    while pos < n - 600:
        L = int(rng.integers(200, 900))
        f = float(rng.choice([900, 1400, 2200, 3300]))
        seg = bp(rng.standard_normal(L), f * 0.7, f * 1.5) * np.hanning(L)
        m[pos:pos + L] += seg * rng.uniform(0.5, 1)
        pos += L + int(rng.integers(150, 700))
    return norm(verb(stereo(m, -0.4, 0.4, 0.6), PLATE, 0.2), peak)


def suck(d=0.35, peak=0.2):
    """Reverse whoosh used on the fade to black."""
    return whoosh(d, 6000, 800, 400, (0.5, -0.5), peak, 0.2)[::-1].copy()


def shimmer_tail(d=2.5, peak=0.15):
    n = int(d * SR)
    t = _t(d)
    m = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in (1318.5, 1975.5, 2637.0, 3951.1))
    m = m * np.exp(-t / 0.9) * env(n, 0.02, False)
    return norm(verb(stereo(m / 4, -0.5, 0.5, 0.8), HALL, 0.7), peak)


# ---------------------------------------------------------------- timeline
def render(events, length_s):
    """events: list of (time_s, sound_array, anchor) where anchor='start'|'end'."""
    out = np.zeros((int(length_s * SR) + SR * 4, 2))
    for t, snd, anchor in events:
        k = int(t * SR) - (len(snd) if anchor == 'end' else 0)
        k0 = max(k, 0)
        snd = snd[k0 - k:]
        out[k0:k0 + len(snd)] += snd[:len(out) - k0]
    return out[:int(length_s * SR)]


# ---------------------------------------------------------------- user samples
SAMPLES = {}


def sample(name):
    """Stereo float array at SR from aftermovie/sfx/<name>.mp3 (cached)."""
    if name not in SAMPLES:
        import librosa, os
        y, _ = librosa.load(os.path.join(os.path.dirname(__file__), 'sfx', name + '.mp3'), sr=SR, mono=False)
        y = np.atleast_2d(y)
        SAMPLES[name] = (np.vstack([y, y]) if y.shape[0] == 1 else y[:2]).T.copy()
    return SAMPLES[name]


def cut(x, start, end=None, fade_in=0.004, fade_out=0.05, gain_db=0.0, rate=1.0):
    """Slice [start, end) seconds with short fades; rate>1 plays faster (and higher)."""
    if rate != 1.0:
        n = int(len(x) / rate)
        x = signal.resample(x, n, axis=0)
    a, b = int(start / rate * SR), int((end / rate if end else len(x) / SR) * SR)
    y = x[a:b].copy()
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi:
        y[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo:
        y[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
    return y * 10 ** (gain_db / 20)


def place(t_anchor, y, anchor_in_y):
    """Event so that sample time `anchor_in_y` (s) lands on `t_anchor`."""
    return (t_anchor - anchor_in_y, y, 'start')
