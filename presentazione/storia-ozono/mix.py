"""Storia dell'ozono — score, foley, beds and voice → out/mix.wav (48 kHz stereo).
Reads events.json (window.EV from film.js) and the voice timing from timeline.js values mirrored below."""
import json, os, sys
import numpy as np, soundfile as sf, soxr

LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sfx
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add, compress, limit

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; N = int(DUR * SR)
fx = np.zeros((N, 2), np.float32); mus = np.zeros((N, 2), np.float32); bed = np.zeros((N, 2), np.float32); vox = np.zeros((N, 2), np.float32)

# voice start times (timeline.js)
START = {'l0': 1.0, 'l1': 7.35, 'l2': 18.55, 'l3': 26.45, 'l4': 36.45, 'l5': 43.95, 'l6': 52.25, 'l7': 61.9, 'l8': 70.1, 'l9': 81.0}
spans = []
for k, t in START.items():
    x, sr = sf.read(os.path.join(HERE, 'voice', 'out', k + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR)
    x = hp(x, 70)
    x = compress(norm(x, 0.9), thr=.22, ratio=3.0)
    add(vox, x, t, 1.0, 0.0)
    spans.append((t, t + len(x) / SR))

# ---- beds: the light table's ballast hum and room tone (on after the tubes catch)
tt = t_(DUR)
hum = (np.sin(2 * np.pi * 100 * tt) * .6 + np.sin(2 * np.pi * 200 * tt) * .25 + np.sin(2 * np.pi * 300 * tt) * .1)
hum *= (0.85 + 0.15 * np.sin(2 * np.pi * 0.13 * tt))
on = np.clip((tt - 0.9) / 0.3, 0, 1)
room = lp(noise(DUR), 900) * .25
b = (hum * .5 + room) * on
bed[:, 0] += b; bed[:, 1] += b

# ---- foley from the picture's events
def ring_glass(f=3400, v=1.0, d=1.2):
    x = sum(a * np.sin(2 * np.pi * f * m * t_(d)) * env_exp(d, tau) for m, a, tau in [(1, .6, .5), (2.71, .25, .25), (4.1, .12, .12)])
    return norm(x) * v
def paper(d, v=1.0):
    x = bp(noise(d), 1500, 7000) * np.sin(np.linspace(0, np.pi, int(round(d * SR)))) ** 1.5
    return norm(x) * v
def riser(d, v=1.0):
    n = int(round(d * SR)); x = bp(noise(d), 600, 5000) * np.linspace(0, 1, n) ** 2
    return norm(x) * v
def tick(v=1.0):
    d = .05; return norm(hp(noise(d), 3000) * env_exp(d, .003) + np.sin(2 * np.pi * 2400 * t_(d)) * env_exp(d, .01) * .5) * v

for e in ev['ev']:
    t, ty = e['t'], e['type']
    if ty == 'starter': add(fx, sfx.click(pitch=.6, v=.5), t, .5, -.2)
    elif ty == 'lighton': add(fx, sfx.click(pitch=.7, v=.6), t, .5, .1)
    elif ty == 'loupe':
        add(fx, sfx.clack(pitch=1.3, v=1), t, .55, .15)
        add(fx, ring_glass(3600, 1, 1.0), t + .01, .10, .15)
    elif ty == 'lift': add(fx, sfx.click(pitch=1.4, v=.6), t, .25, .15)
    elif ty == 'glide': add(fx, paper(max(.4, min(e.get('d', 1), 2.0)), 1), t, .16, -.3)
    elif ty == 'push': add(fx, riser(e['d'], 1), t, .12, 0)
    elif ty == 'rise': add(fx, riser(e['d'], 1)[::-1].copy(), t, .08, 0)
    elif ty == 'card': add(fx, tick(1), t, .18, -.4)
    elif ty == 'tick': add(fx, tick(1), t, .22, .3)
    elif ty == 'end': add(fx, ring_glass(2349, 1, 2.5), t, .14, 0)

# ---- music: a quiet glass-and-pad drone, D major, swelling at the turning points (1885, 1990–2000, end)
def pad(freqs, d, v=1.0):
    tt = t_(d); x = np.zeros(len(tt))
    for f in freqs:
        for det in (-0.6, 0, 0.6):
            x += np.sin(2 * np.pi * (f + det) * tt + np.random.default_rng(int(f)).random() * 6)
    a = np.minimum(1, tt / 1.8) * np.minimum(1, (d - tt) / 2.0)
    return lp(x, 2500) * a / len(freqs) * v
CH = [(1.0, [146.83, 220.0, 293.66, 369.99]),      # D
      (18.0, [123.47, 185.0, 246.94, 293.66]),     # Bm
      (36.0, [98.0, 196.0, 246.94, 293.66]),       # G
      (43.6, [110.0, 220.0, 277.18, 329.63]),      # A (1885)
      (61.5, [146.83, 220.0, 293.66, 369.99]),     # D (1900)
      (69.5, [98.0, 196.0, 293.66, 392.0]),        # G (protocols)
      (78.5, [146.83, 220.0, 293.66, 369.99, 440.0])]  # D (index, end)
for i, (t0, fr) in enumerate(CH):
    t1 = CH[i + 1][0] + 2.0 if i + 1 < len(CH) else DUR
    p = pad(fr, t1 - t0, 1)
    add(mus, p, t0, .5, 0)
# glass notes on each print's card
GL = [587.33, 659.25, 739.99, 880.0, 739.99, 659.25, 880.0, 987.77]
k = 0
for e in ev['ev']:
    if e['type'] == 'card':
        add(mus, ring_glass(GL[k % len(GL)], 1, 2.2), e['t'], .10, .25 * (1 if k % 2 else -1)); k += 1

# ---- mix: duck music under the voice
duck = np.ones(N)
for a, b2 in spans:
    i0, i1 = int(max(0, a - .2) * SR), int(min(DUR, b2 + .3) * SR)
    duck[i0:i1] = 0.45
duck = lp(duck, 3)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vr = rms(vox[vox[:, 0] != 0, 0]) if np.any(vox) else 1
mix = vox * 1.0 + mus * (vr / max(rms(mus[:, 0]), 1e-9)) * 10 ** (-12 / 20) * duck[:, None] \
      + fx * (vr / max(rms(fx[:, 0][np.abs(fx[:, 0]) > 1e-4]), 1e-9)) * 10 ** (-10 / 20) \
      + bed * (vr / max(rms(bed[:, 0]), 1e-9)) * 10 ** (-27 / 20)
mix[:, 0] = limit(mix[:, 0], .9); mix[:, 1] = limit(mix[:, 1], .9)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix', DUR, 's  voice rms', round(float(20 * np.log10(vr)), 1), 'dBFS')
