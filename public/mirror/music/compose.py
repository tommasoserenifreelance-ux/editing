"""MIRROR - original track. 123 BPM, Eb minor, deep-house / nu-disco.
Arrangement is locked to the edit: cuts land on beats (see CUT_BEATS).
Renders stems with FluidSynth (FluidR3 GM), mixes in numpy/scipy.
Usage: python3 compose.py OUT.wav
"""
import os, subprocess, sys, tempfile, wave
import numpy as np
import mido
from scipy import signal

SR = 44100
BPM = 123
BEAT = 60 / BPM
TPB = 480
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
OUT = sys.argv[1]
BARS = 10            # bar 0 intro, bars 1..9 groove, final hit on bar 10
END_BEAT = BARS * 4  # 19.51 s -> final chord + logo
TAIL = 3.6
TOTAL = END_BEAT * BEAT + TAIL
N = int(TOTAL * SR)
# edit cuts (in beats): 12=5.85s face CU, 16 feet, 19 tie, 22 medium, 28 buttons, 30 wide out
CUT_BEATS = [12, 16, 19, 22, 28, 30]
rng = np.random.default_rng(3)

# ---------- harmony: Ebm9 | Cbmaj7 | Abm9 | Bb7sus4 -> Bb7 ----------
PROG = [
    dict(root=39, ep=[58, 61, 65, 66, 70]),   # Ebm9: Bb Db F Gb Bb
    dict(root=35, ep=[58, 63, 66, 70]),       # Cbmaj7 (B): Bb Eb Gb Bb
    dict(root=32, ep=[59, 63, 66, 70]),       # Abm9: Cb Eb Gb Bb
    dict(root=34, ep=[56, 61, 63, 68]),       # Bb7sus4: Ab Db Eb Ab
]

def chord(bar):
    return PROG[(bar - 1) % 4] if bar >= 1 else PROG[0]


# ---------- MIDI writing ----------
class Track:
    def __init__(self, program, channel=0):
        self.ev = []
        self.ch = channel
        self.program = program

    def note(self, beat, dur, pitch, vel):
        if beat < 0 or beat >= END_BEAT + 8:
            return
        vel = int(np.clip(vel + rng.integers(-5, 6), 1, 127))
        self.ev.append((beat, 1, pitch, vel))
        self.ev.append((beat + dur, 0, pitch, 0))

    def save(self, path):
        mf = mido.MidiFile(ticks_per_beat=TPB)
        tr = mido.MidiTrack(); mf.tracks.append(tr)
        tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM)))
        if self.ch != 9:
            tr.append(mido.Message("program_change", program=self.program, channel=self.ch))
        tr.append(mido.Message("control_change", control=91, value=0, channel=self.ch))
        tr.append(mido.Message("control_change", control=93, value=0, channel=self.ch))
        last = 0
        for b, on, p, v in sorted(self.ev, key=lambda e: (e[0], e[1])):
            t = int(round(b * TPB))
            tr.append(mido.Message("note_on" if on else "note_off", note=p,
                                   velocity=v, channel=self.ch, time=t - last))
            last = t
        tr.append(mido.MetaMessage("end_of_track", time=TPB * 8))
        mf.save(path)


def render(track, name, tmp):
    mid = os.path.join(tmp, name + ".mid"); wav = os.path.join(tmp, name + ".wav")
    track.save(mid)
    subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.8", "-r", str(SR),
                    "-o", "synth.reverb.active=0", "-o", "synth.chorus.active=0",
                    "-F", wav, SF2, mid], check=True, capture_output=True)
    with wave.open(wav) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2) / 32768
    out = np.zeros((N, 2)); n = min(N, len(x)); out[:n] = x[:n]
    return out


# ---------- parts ----------
ep = Track(4)        # Electric Piano 1 (Rhodes)
gtr = Track(28)      # Electric Guitar (muted)
bass = Track(38)     # Synth Bass 1
pad = Track(50)      # Synth Strings 1
bell = Track(11)     # Vibraphone (hook)
drm = Track(0, channel=9)

# Rhodes stabs: syncopated, staccato (nods to the reference's chopped stabs)
EP_RHYTHM = [(0, .45, 92), (1.5, .3, 78), (2.5, .45, 86), (3.5, .25, 70)]
for bar in range(0, BARS):
    c = chord(bar); b0 = bar * 4
    if bar == 0:  # intro: one soft sustained chord
        for p in c["ep"]: ep.note(b0, 3.8, p, 85)
        continue
    for off, d, v in EP_RHYTHM:
        if b0 + off == 11.5:   # break before the face close-up
            continue
        for p in c["ep"]: ep.note(b0 + off, d, p, v)
# final chord under the logo
for p in [51, 58, 61, 65, 66, 70]: ep.note(END_BEAT, 6, p, 90)

# Muted guitar: 16th funk on the off-beats, enters with the first close-up
for bar in range(3, BARS):
    c = chord(bar); b0 = bar * 4
    tones = [c["ep"][0] - 12, c["ep"][1] - 12, c["ep"][2] - 12]
    for s in range(16):
        if s % 4 in (1, 3) or s in (6, 14):
            vel = 74 if s % 4 == 2 else 62
            for p in tones: gtr.note(b0 + s / 4, 0.12, p, vel)

# Bass: octave-bounce groove, rests on the downbeat (kick owns it)
BASS = [(0.5, .2, 0), (1.0, .2, 12), (1.5, .35, 0), (2.5, .2, 0), (3.0, .2, 12), (3.5, .35, 7)]
for bar in range(1, BARS):
    r = chord(bar)["root"]; b0 = bar * 4
    for off, d, iv in BASS:
        if b0 + off in (11.5,):
            continue
        bass.note(b0 + off, d, r + iv, 100)
bass.note(END_BEAT, 2.5, 27, 105)

# Strings pad: long chords, sidechained later
for bar in range(0, BARS):
    c = chord(bar)
    for p in c["ep"][1:]: pad.note(bar * 4, 4, p + 12, 58 if bar else 64)

# Vibraphone hook (bars 5-8, the "middle" of the edit)
HOOK = [(0, 77), (0.75, 75), (1.5, 73), (2.5, 70), (3.0, 73)]
for bar in (5, 6, 7, 8):
    b0 = bar * 4; shift = 0 if bar % 2 else -2
    for off, p in HOOK:
        bell.note(b0 + off, 0.6, p + shift, 70)

# Drums (GM kit): clap, hats, shaker, crash on cuts; kick is synthesized
for bar in range(1, BARS):
    b0 = bar * 4
    for b in range(4):
        beat = b0 + b
        if beat == 11:  # one-beat break before the face CU
            continue
        if b in (1, 3): drm.note(beat, .2, 39, 96)               # clap
        drm.note(beat + 0.5, .1, 42, 80)                          # closed hat off-beat
        if bar >= 3: drm.note(beat + 0.5, .2, 46, 62)             # open hat
        if bar >= 2:
            for s in (0, .25, .5, .75): drm.note(beat + s, .05, 70, 50 if s else 64)  # shaker
for cb in CUT_BEATS:
    drm.note(cb, 1.5, 49 if cb in (12, 22) else 57, 70)           # crash / splash on cuts
drm.note(END_BEAT, 3, 49, 88)
# little snare pickup into the face CU and into the ending
for s in (10.5, 10.75): drm.note(s, .1, 38, 70)
for s in (END_BEAT - 1, END_BEAT - 0.5, END_BEAT - 0.25): drm.note(s, .1, 38, 80)

# ---------- render ----------
tmp = tempfile.mkdtemp()
S = {n: render(t, n, tmp) for n, t in
     dict(ep=ep, gtr=gtr, bass=bass, pad=pad, bell=bell, drm=drm).items()}

t = np.arange(N) / SR

def bf(x, kind, fc, order=2):
    sos = signal.butter(order, fc, kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)

def kick_sample():
    tt = np.arange(int(0.5 * SR)) / SR
    f = 46 + 140 * np.exp(-tt / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22)
    click = bf(rng.standard_normal(len(tt)), "highpass", 2500) * np.exp(-tt / 0.004) * 0.25
    return np.tanh(2.0 * (body + click))

KICK = kick_sample()
kick = np.zeros(N)
kick_beats = [b for b in range(4, END_BEAT) if b != 11] + [END_BEAT]
for b in kick_beats:
    i = int(b * BEAT * SR); seg = KICK[: N - i]; kick[i:i + len(seg)] += seg

# sidechain envelope from kick positions
duck = np.ones(N)
dk = 1 - 0.65 * np.exp(-np.arange(int(BEAT * SR)) / SR / 0.11)
for b in kick_beats:
    i = int(b * BEAT * SR); seg = dk[: N - i]; duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], seg)
duck = duck[:, None]

# intro filter sweep on the Rhodes (bar 0 opens up)
intro_end = int(4 * BEAT * SR)
ep_x = S["ep"].copy()
lp_intro = bf(ep_x[:intro_end], "lowpass", 700, 2)
mixw = np.linspace(0, 1, intro_end)[:, None] ** 2
ep_x[:intro_end] = lp_intro * (1 - mixw) + ep_x[:intro_end] * mixw

# tremolo on Rhodes (stereo auto-pan)
trem = 0.12 * np.sin(2 * np.pi * (BPM / 60 / 2) * t)
ep_x[:, 0] *= 1 - trem; ep_x[:, 1] *= 1 + trem

# riser into bar 1
riser = np.zeros((N, 2)); rl = intro_end
nz = rng.standard_normal((rl, 2))
sweep = np.zeros_like(nz)
for k, (a, b) in enumerate(zip(range(0, rl, 2048), range(2048, rl + 2048, 2048))):
    fc = 300 + 7000 * (a / rl) ** 2
    sweep[a:b] = bf(nz[a:b], "bandpass", [fc * 0.7, min(fc * 1.4, 18000)], 1)
riser[:rl] = sweep * (np.linspace(0, 1, rl) ** 3)[:, None] * 0.12

def widen(x, amt):
    m = (x[:, 0] + x[:, 1]) / 2; s = (x[:, 0] - x[:, 1]) / 2 * amt
    return np.stack([m + s, m - s], 1)

bass_x = bf(S["bass"], "lowpass", 900, 2)
bass_x = np.tanh(bass_x * 2.2) * 0.55
bass_mono = bass_x.mean(1, keepdims=True) * np.ones((1, 2))

dry = (
    ep_x * 1.6 * (0.75 + 0.25 * duck)
    + bf(S["gtr"], "highpass", 250) * 1.0
    + bass_mono * duck * 0.5
    + widen(bf(S["pad"], "highpass", 300), 1.6) * 0.8 * duck
    + S["bell"] * 0.9
    + bf(S["drm"], "highpass", 120) * 1.4
    + np.stack([kick, kick], 1) * 0.38
    + riser
)

# convolution reverb (generated stereo plate-ish IR), on melodic parts only
ir_len = int(2.2 * SR); it = np.arange(ir_len) / SR
ir = rng.standard_normal((ir_len, 2)) * np.exp(-it / 0.55)[:, None]
ir = bf(ir, "lowpass", 6000); ir = bf(ir, "highpass", 250); ir /= np.sqrt((ir ** 2).sum(0))
send = ep_x * 0.35 + S["gtr"] * 0.15 + S["bell"] * 0.6 + S["pad"] * 0.3 + bf(S["drm"], "highpass", 2000) * 0.15
wet = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], 1)
pre = int(0.025 * SR)
wet = np.concatenate([np.zeros((pre, 2)), wet[:-pre]])
mix = dry + wet * 0.55

# master: gentle tilt EQ, glue compression, soft-clip limiter
mix = mix + bf(mix, "highpass", 8000) * 0.15
env = np.sqrt(bf(mix.mean(1) ** 2, "lowpass", 8, 1).clip(1e-9))
thr = np.percentile(env, 70)
gain = np.where(env > thr, (thr / env) ** 0.35, 1.0)[:, None]
mix *= gain
mix /= np.percentile(np.abs(mix), 99.95)
mix = np.tanh(mix * 1.1) * 0.93
fade = int(1.5 * SR)
mix[-fade:] *= (np.linspace(1, 0, fade) ** 2)[:, None]

pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"{OUT}: {N / SR:.2f}s  end-hit at {END_BEAT * BEAT:.2f}s")
