"""Builds the audio assets for the Nightlife reel.

    python3 scripts/nightlife_audio.py SONG.mp3

Writes to public/nightlife/:
  music.m4a  the song, delayed by PREROLL with a reversed swell leading into
             it, a low-pass sweep from LOWPASS_AT (song time), cut to LENGTH
  sfx/*.wav  synthesized whoosh, impact, riser and flash hit

PREROLL and LOWPASS_AT must match MUSIC_START and END_CARD in
src/Nightlife/timeline.ts.
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
PREROLL = 77 / 30  # seconds before the song starts (MUSIC_START in timeline.ts)
LOWPASS_AT = (632 - 77) / 30  # song time where the end card starts
LENGTH = 24.0  # NIGHTLIFE_DURATION, the track is cut and faded here
OUT = Path(__file__).resolve().parent.parent / "public" / "nightlife"


def decode(path, af=None):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)]
    if af:
        cmd += ["-af", af]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def encode(x, path, codec):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR)]
    cmd += ["-ac", str(x.shape[1]), "-i", "-", *codec, str(path)]
    subprocess.run(cmd, input=x.astype(np.float32).tobytes(), check=True)


def lowpass(x, freq):
    # Two passes for a steeper slope.
    return filter_with(x, f"lowpass=f={freq},lowpass=f={freq}")


def filter_with(x, af):
    cmd = ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2"]
    cmd += ["-i", "-", "-af", af, "-f", "f32le", "-"]
    raw = subprocess.run(
        cmd, input=x.astype(np.float32).tobytes(), capture_output=True, check=True
    ).stdout
    y = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return y[: len(x)]


def build_music(song_path):
    song = decode(song_path)

    # Reversed, muffled first bar of the song swelling into its downbeat.
    n_pre = int(round(PREROLL * SR))
    swell = lowpass(song[:n_pre][::-1].copy(), 700)
    swell *= (np.linspace(0, 1, n_pre) ** 2 * 0.7)[:, None]

    # Low-pass sweep into the end card: crossfade through steeper filters.
    start = int(LOWPASS_AT * SR)
    steps = [song] + [lowpass(song, f) for f in (5000, 2200, 1000, 500, 320)]
    sweep = int(0.9 * SR)
    out = song.copy()
    t = np.clip((np.arange(len(song)) - start) / sweep, 0, 1) * (len(steps) - 1)
    for i in range(len(steps) - 1):
        w = np.clip(t - i, 0, 1)[:, None]
        sel = t > i
        out[sel] = (steps[i] * (1 - w) + steps[i + 1] * w)[sel]
    track = np.concatenate([swell, out])[: int(LENGTH * SR)]
    fade = int(0.8 * SR)
    track[-fade:] *= np.linspace(1, 0, fade)[:, None]

    encode(track, OUT / "music.m4a", ["-c:a", "aac", "-b:a", "256k"])


def envelope(n, attack, release):
    a = int(attack * SR)
    env = np.ones(n)
    env[:a] = np.linspace(0, 1, a)
    env[a:] = np.exp(-np.linspace(0, release, n - a))
    return env


def noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def sweep_filter(x, f0, f1):
    """Crude band-pass that slides from f0 to f1 Hz, block by block."""
    block = 1024
    out = np.zeros_like(x)
    freqs = np.fft.rfftfreq(block * 2, 1 / SR)
    win = np.hanning(block * 2)
    for i, s in enumerate(range(0, len(x) - block * 2, block)):
        f = f0 * (f1 / f0) ** (s / len(x))
        band = np.exp(-(((freqs - f) / (f * 0.6)) ** 2))
        out[s : s + block * 2] += np.fft.irfft(np.fft.rfft(x[s : s + block * 2] * win) * band)
    return out


def stereo(x, gain):
    x = x / (np.abs(x).max() + 1e-9) * gain
    return np.stack([x, x], axis=1)


def build_sfx():
    (OUT / "sfx").mkdir(exist_ok=True)
    wav = ["-c:a", "pcm_s16le"]

    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    whoosh = sweep_filter(noise(n, 1), 400, 5000) * np.sin(np.pi * t) ** 2
    encode(stereo(whoosh, 0.7), OUT / "sfx" / "whoosh.wav", wav)

    n = int(1.4 * SR)
    t = np.arange(n) / SR
    pitch = 38 + 70 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * envelope(n, 0.002, 6)
    click = noise(n, 2) * envelope(n, 0.0005, 120) * 0.5
    encode(stereo(np.tanh((boom + click) * 2), 0.9), OUT / "sfx" / "impact.wav", wav)

    n = int(1.8 * SR)
    t = np.linspace(0, 1, n)
    rise = sweep_filter(noise(n, 3), 300, 9000) * t**2.5
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t**2) / SR) * t**3 * 0.15
    encode(stereo(rise + tone, 0.6), OUT / "sfx" / "riser.wav", wav)

    n = int(0.25 * SR)
    hit = sweep_filter(noise(n, 4), 6000, 2500) * envelope(n, 0.001, 25)
    encode(stereo(hit, 0.5), OUT / "sfx" / "flash.wav", wav)


if __name__ == "__main__":
    build_music(sys.argv[1])
    build_sfx()
