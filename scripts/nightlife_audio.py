"""Builds the audio assets for the Nightlife reel.

    python3 scripts/nightlife_audio.py SONG.mp3 REFERENCE.mp4

Writes to public/nightlife/:
  music.m4a  the song, delayed by PREROLL with a reversed swell leading into
             it, a muffled crescendo up to BUILD_TO, a low-pass sweep from
             LOWPASS_AT (song time), cut to LENGTH
  sfx/*.wav  hits sampled from the reference reel

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
BUILD_TO = 6.3  # song time where the crescendo is fully open, just before the drop
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


def blend(steps, position):
    """Per sample, crossfade between neighbouring entries of steps."""
    out = steps[0].copy()
    for i in range(len(steps) - 1):
        w = np.clip(position - i, 0, 1)[:, None]
        sel = position > i
        out[sel] = (steps[i] * (1 - w) + steps[i + 1] * w)[sel]
    return out


def build_music(song_path):
    song = decode(song_path)

    # Muffled to open: 0 is the dry song, the last step the most filtered.
    steps = [song] + [lowpass(song, f) for f in (5000, 2200, 1000, 500, 320)]
    last = len(steps) - 1
    time = np.arange(len(song)) / SR

    # Crescendo: the song starts quiet and muffled and opens up into the drop,
    # then a low-pass sweep into the end card.
    build = np.clip(time / BUILD_TO, 0, 1)
    closing = np.clip((time - LOWPASS_AT) / 0.9, 0, 1)
    out = blend(steps, np.maximum(1 - build, closing) * last)
    out *= (0.2 + 0.8 * build**1.6)[:, None]

    # Reversed first bar of the song, as muffled and quiet as the song's
    # start, swelling up into it.
    n_pre = int(round(PREROLL * SR))
    swell = lowpass(song[:n_pre][::-1].copy(), 320)
    swell *= (np.linspace(0, 1, n_pre) ** 2 * 0.2)[:, None]

    track = np.concatenate([swell, out])[: int(LENGTH * SR)]
    fade = int(0.8 * SR)
    track[-fade:] *= np.linspace(1, 0, fade)[:, None]

    encode(track, OUT / "music.m4a", ["-c:a", "aac", "-b:a", "256k"])


# Hits cut from the reference reel (start, end in seconds, high-pass Hz or
# None). Its effects are mixed into its song, so these are taken where a hit
# stands clear of the music and high-passed to drop the vocal and bass.
SAMPLES = {
    "hit": (4.03, 4.23, 1200),  # flash hit, frame 120 of the reference
    "impact": (8.97, 9.27, None),  # the drop
    "end": (20.97, 21.15, 1200),  # flash into the end card
}


def build_sfx(reference_path):
    (OUT / "sfx").mkdir(exist_ok=True)
    ref = decode(reference_path)
    for name, (start, end, highpass) in SAMPLES.items():
        x = ref[int(start * SR) : int(end * SR)].copy()
        if highpass:
            x = filter_with(x, f"highpass=f={highpass},highpass=f={highpass}")
        # Keep the transient, let the music under it die away quickly.
        attack = int(0.005 * SR)
        x[:attack] *= np.linspace(0, 1, attack)[:, None]
        x *= np.exp(-np.linspace(0, 5, len(x)))[:, None]
        encode(x, OUT / "sfx" / f"{name}.wav", ["-c:a", "pcm_s16le"])


if __name__ == "__main__":
    build_music(sys.argv[1])
    build_sfx(sys.argv[2])
