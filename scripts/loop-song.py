"""Extend the reference song to the plate video length.

Plays the song once up to the end of a one-bar loop (128 BPM), then repeats
that bar, with a short crossfade at each seam and a fade-out at the end.
Run: python3 scripts/loop-song.py (needs numpy and scipy).
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent / "public" / "piatto"
LOOP_START, LOOP_LEN = 5.075, 1.875  # one bar, matched on the beat envelope
LENGTH, FADE_OUT = 25.7, 1.5

sr, x = wavfile.read(ROOT / "reference-song.wav")
x = x.astype(np.float64)
start, end = int(LOOP_START * sr), int((LOOP_START + LOOP_LEN) * sr)
out, loop, seam = x[:end].copy(), x[start:end], int(0.012 * sr)
while len(out) < int(LENGTH * sr):
    ramp = np.linspace(0, 1, seam)[:, None]
    out[-seam:] = out[-seam:] * (1 - ramp) + loop[:seam] * ramp
    out = np.concatenate([out, loop[seam:]])
out = out[: int(LENGTH * sr)]
out[-int(FADE_OUT * sr) :] *= np.linspace(1, 0, int(FADE_OUT * sr))[:, None]
wavfile.write(ROOT / "song-looped.wav", sr, np.clip(out, -32768, 32767).astype(np.int16))
