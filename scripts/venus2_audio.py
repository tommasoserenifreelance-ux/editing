"""Builds the audio assets for the Venus2 reel.

    python3 scripts/venus2_audio.py SONG.mp3 VOICE.mp3

Writes to public/venus2/:
  music.m4a  the song from SONG_FROM, faded in and opened up gradually
             ahead of its drop, low-passed from the end card, cut to LENGTH
  voice.m4a  the voice-over with its pause tightened and sped up by SPEED

SONG_FROM and the end card frame must match src/Venus2/timeline.ts.
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from nightlife_audio import SR, blend, decode, encode, lowpass  # noqa: E402

SONG_FROM = 51.28  # song time at frame 0: the build-up, then the drop at 60.12 s
END_CARD = 640 / 30  # video time of the end card
LENGTH = 728 / 30  # video length
SPEED = 1.08
OPEN_OVER = 4.0
OUT = Path(__file__).resolve().parent.parent / "public" / "venus2"


def build_music(song_path):
    song = decode(song_path)
    song = song[int(SONG_FROM * SR) : int((SONG_FROM + LENGTH) * SR)]
    time = np.arange(len(song)) / SR

    # Muffled to open: 0 is the dry song, the last step the most filtered.
    steps = [song] + [lowpass(song, f) for f in (5000, 2200, 1000, 500, 320)]
    last = len(steps) - 1

    # Fade in from silence, muffled, opening up over OPEN_OVER seconds so the
    # song's own build-up and break are heard before the drop; then a
    # low-pass sweep into the end card.
    build = np.clip(time / OPEN_OVER, 0, 1)
    closing = np.clip((time - END_CARD) / 0.9, 0, 1)
    out = blend(steps, np.maximum(1 - build, closing) * last)
    out *= (np.clip(time / 2.0, 0, 1) ** 2 * (0.35 + 0.65 * build**1.5))[:, None]

    fade = int(0.8 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    encode(out, OUT / "music.m4a", ["-c:a", "aac", "-b:a", "256k"])


def build_voice(voice_path):
    voice = decode(voice_path, f"atempo={SPEED}")
    # The one pause (1.50-1.78 s before the speed-up) shortened to 0.15 s.
    a, b = int(1.52 / SPEED * SR), int(1.76 / SPEED * SR)
    gap = np.zeros((int(0.15 * SR), 2), np.float32)
    out = np.concatenate([voice[:a], gap, voice[b:]])
    print(f"voice: {len(out) / SR:.2f} s")
    encode(out, OUT / "voice.m4a", ["-c:a", "aac", "-b:a", "192k"])


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    build_music(sys.argv[1])
    build_voice(sys.argv[2])
