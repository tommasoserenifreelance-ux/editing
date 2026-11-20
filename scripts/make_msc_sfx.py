"""Build the sound-effects track for the MSC World Europa reel from earshot's bank.

Each cue names a bank sound, the time its loudest moment must land on (a cut or
a title reveal) and a level. Every sound is rendered with `earshot sfx render`
and placed so its measured peak sits on the cue time.

Usage: python scripts/make_msc_sfx.py out.wav [length]
Needs earshot on PATH (uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot").
"""

import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

SR = 48000
OUT = sys.argv[1]
LENGTH = float(sys.argv[2]) if len(sys.argv) > 2 else 28.0

# (time of the peak, sound id, level 0-1, extra render args)
CUES = [
    # Music comes later (added on TikTok): only a few whooshes under key titles.
    (3.40, "pro_whoosh_big/swell", 0.60, []),  # "Una delle navi più grandi al mondo"
    (10.00, "whoosh_fast/tight", 0.50, ["--apex", "0.3"]),  # "Ma la parte migliore?"
    (19.80, "pro_whoosh_big/swell", 0.60, ["--seed", "4"]),  # "Un palco"
    (23.60, "whoosh_fast/tight", 0.50, ["--apex", "0.3", "--seed", "11"]),  # "Potrebbe essere il tuo"
]


def render(sound, args, path):
    cmd = ["earshot", "sfx", "render", sound, "-o", path, "--json"] + args
    meta = json.loads(subprocess.run(cmd, check=True, capture_output=True, text=True).stdout)["meta"]
    audio, sr = sf.read(path, always_2d=True)
    assert sr == SR
    return audio.mean(axis=1), meta["peak_s"]


buf = np.zeros((int(SR * LENGTH), 2))
pans = [-0.25, 0.25]
with tempfile.TemporaryDirectory() as tmp:
    for i, (t, sound, level, args) in enumerate(CUES):
        mono, peak = render(sound, args, os.path.join(tmp, f"{i}.wav"))
        start = int(round((t - peak) * SR))
        if start < 0:
            mono, start = mono[-start:], 0
        mono = mono[: len(buf) - start] * level
        # Whooshes drift a little left/right, hits stay centred.
        p = pans[i % 2] if "whoosh" in sound or "swish" in sound else 0.0
        buf[start : start + len(mono), 0] += mono * (1 - p)
        buf[start : start + len(mono), 1] += mono * (1 + p)
        print(f"{t:6.2f}s  {sound:28s} peak@{peak:.3f}s level {level}")

peak = np.abs(buf).max()
if peak > 0.89:
    buf *= 0.89 / peak
sf.write(OUT, buf, SR, subtype="PCM_24")
print(f"wrote {OUT}")
