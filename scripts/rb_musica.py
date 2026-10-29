"""Regina Bistecca: a different chill classical piano bed for every reel.

Each piece is a public-domain score from the music21 corpus, played note by
note on the Salamander Grand Piano V3 samples by Alexander Holm (CC-BY 3.0,
npm @audio-samples/piano-mp3-velocity4/6/8), with a gentle pedal, a soft
room reverb, a fade out on the last 2.5 s and loudness at -18 LUFS.

Uso: python3 scripts/rb_musica.py <cartella campioni npm> [rb01 ...]
(needs music21, numpy, scipy, soundfile; writes public/rb/music/<rb>.m4a)
"""

import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from music21 import corpus
from scipy.signal import fftconvolve

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "public", "rb", "music")
SR = 48000

# Every reel ends with the logo alone on black for 1.2 s (RB_OUTRO): the
# music plays on under it and fades out with it.
OUTRO = 1.2

# piece, quarter-note bpm, first measure, seconds (= the clip's length),
# loudness of each part from the top (the melody sings, inner voices recede).
PIECES = {
    "rb01": ("bach/bwv846.mxl", 66, 1, 12.96, [0.75, 0.6]),
    "rb02": ("schumann_robert/dichterliebe_no2.xml", 58, 1, 16.04, [0.9, 0.55, 0.5]),
    "rb03": ("schubert/Lindenbaum.xml", 84, 1, 31.28, [0.9, 0.6, 0.5]),
    "rb04": ("mozart/k458/movement3.mxl", 46, 1, 9.6, [0.9, 0.5, 0.5, 0.6]),
    "rb05": ("haydn/opus74no1/movement2.mxl", 50, 1, 10.4, [0.9, 0.5, 0.5, 0.6]),
    "rb06": ("mozart/k545/movement1_exposition.mxl", 78, 1, 36.4, [0.8, 0.5]),
    "rb07": ("mozart/k155/movement2.mxl", 60, 1, 46.9, [0.9, 0.5, 0.5, 0.6]),
    "rb08": ("schumann_robert/opus41no1/movement4.mxl", 60, 1, 34.3, [0.9, 0.5, 0.5, 0.6]),
    "rb09": ("schumann_clara/opus17/movement3.xml", 56, 1, 24.2, [0.0, 0.0, 0.85, 0.6]),
    "rb10": ("mozart/k80/movement1.mxl", 60, 1, 22.45, [0.9, 0.5, 0.5, 0.6]),
    "rb11": ("mozart/k156/movement2.mxl", 54, 1, 34.6, [0.9, 0.5, 0.5, 0.6]),
}

NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


def load_samples(sample_dir: str):
    """{velocity layer: {midi: stereo array}} for the sampled notes."""
    layers = {}
    for v in (4, 6, 8):
        pkg = next(d for d in os.listdir(sample_dir)
                   if d.startswith(f"audio-samples-piano-mp3-velocity{v}")
                   and not d.endswith(".tgz"))
        folder = os.path.join(sample_dir, pkg, "package", "audio")
        notes = {}
        for f in os.listdir(folder):
            name = f.split("v")[0]
            pitch, octave = name[:-1], int(name[-1])
            pitch = {"Ds": "Eb", "Fs": "Gb", "D#": "Eb", "F#": "Gb"}.get(pitch, pitch)
            midi = 12 * (octave + 1) + NAMES.index(pitch)
            raw = subprocess.run(
                ["ffmpeg", "-v", "error", "-i", os.path.join(folder, f),
                 "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                capture_output=True, check=True).stdout
            notes[midi] = np.frombuffer(raw, np.float32).reshape(-1, 2)
        layers[v] = notes
    return layers


def events(path, bpm, first_measure, seconds, weights):
    """(start s, midi, length s, loudness) for every note that starts in time."""
    score = corpus.parse(path).stripTies()
    sec_per_ql = 60.0 / bpm
    start_ql = None
    out = []
    for part, w in zip(score.parts, weights):
        if w <= 0:
            continue
        for n in part.flatten().notes:
            m = n.getContextByClass("Measure")
            if start_ql is None and m is not None and m.number == first_measure:
                start_ql = m.getOffsetInHierarchy(score)
            off = n.getOffsetInHierarchy(score)
            pitches = n.pitches
            vol = w * (0.9 if len(pitches) == 1 else 0.8)
            for p in pitches:
                out.append((off, p.midi, n.quarterLength, vol))
    start_ql = start_ql or 0.0
    rng = np.random.default_rng(7)
    res = []
    for off, midi, ql, vol in out:
        t = (off - start_ql) * sec_per_ql
        if 0 <= t < seconds - 0.4:
            # A little human timing and touch.
            res.append((max(0.0, t + rng.normal(0, 0.006)), midi,
                        max(ql * sec_per_ql, 0.25), vol * rng.uniform(0.92, 1.05)))
    return res


def render(evts, seconds, layers):
    total = int((seconds + 4) * SR)
    mix = np.zeros((total, 2), np.float32)
    for t, midi, length, vol in evts:
        layer = 4 if vol < 0.6 else (6 if vol < 0.82 else 8)
        bank = layers[layer]
        base = min(bank, key=lambda k: abs(k - midi))
        sample = bank[base]
        ratio = 2 ** ((midi - base) / 12)
        # Pedal: let each note ring a little past its written length.
        ring = min(length * 1.3 + 0.9, 6.0)
        n = int(ring * SR)
        idx = np.arange(n) * ratio
        idx = idx[idx < len(sample) - 1]
        if len(idx) == 0:
            continue
        i0 = idx.astype(int)
        frac = (idx - i0)[:, None]
        tone = sample[i0] * (1 - frac) + sample[i0 + 1] * frac
        env = np.ones(len(tone), np.float32)
        rel = int(0.45 * SR)
        if len(env) > rel:
            env[-rel:] = np.linspace(1, 0, rel) ** 2
        tone = tone * env[:, None] * vol
        # Low notes a touch left, high notes a touch right.
        pan = np.clip((midi - 60) / 48, -0.35, 0.35)
        tone = tone * np.array([1 - pan, 1 + pan], np.float32)
        s = int(t * SR)
        e = min(total, s + len(tone))
        mix[s:e] += tone[: e - s]

    # Soft room: decaying stereo noise impulse response.
    rng = np.random.default_rng(3)
    ir_len = int(2.4 * SR)
    decay = np.exp(-np.linspace(0, 7, ir_len))[:, None]
    ir = (rng.standard_normal((ir_len, 2)) * decay).astype(np.float32)
    ir /= np.abs(ir).sum(axis=0) ** 0.5 * 30
    wet = np.stack([fftconvolve(mix[:, c], ir[:, c])[:total] for c in range(2)], 1)
    out = mix * 0.82 + wet * 0.35
    out = out[: int(seconds * SR)]

    fade = int(2.5 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    out[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
    return out


def main():
    sample_dir = sys.argv[1]
    names = sys.argv[2:] or list(PIECES)
    layers = load_samples(sample_dir)
    os.makedirs(OUT, exist_ok=True)
    for name in names:
        path, bpm, first, seconds, weights = PIECES[name]
        seconds += OUTRO
        audio = render(events(path, bpm, first, seconds, weights), seconds, layers)
        wav = os.path.join(OUT, f"{name}.wav")
        sf.write(wav, audio / max(1e-6, np.abs(audio).max()) * 0.8, SR)
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", wav,
             "-af", "loudnorm=I=-18:TP=-1.5:LRA=11", "-ar", str(SR),
             "-c:a", "aac", "-b:a", "192k", os.path.join(OUT, f"{name}.m4a")],
            check=True)
        os.remove(wav)
        print(name, path)


if __name__ == "__main__":
    main()
