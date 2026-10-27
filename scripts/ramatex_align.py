"""Rough word timings for the Ramatex talk: no ASR model is reachable, so the
script text is split into phrases, each phrase is pinned to its speech window
(read off ffmpeg silencedetect), and words are spread over the voiced parts
of the window by syllable count."""
import json
import re
import subprocess
import sys

wav, out = sys.argv[1], sys.argv[2]

PHRASES = [
    (1.33, 2.15, "Crosslappers."),
    (2.83, 3.37, "Eight out of ten."),
    (3.56, 5.50, "High speed and very good correction of density."),
    (6.24, 6.93, "Lab card."),
    (7.75, 8.75, "Seven out of ten."),
    (10.11, 14.58, "Small, compact and perfect for a little production line."),
    (15.16, 15.66, "Needle loom."),
    (16.26, 16.98, "Ten out of ten."),
    (17.97, 25.11, "It's our flagship product, with different types of technology and levels of complexity."),
    (25.93, 26.83, "Thermal machine."),
    (27.87, 28.52, "Nine out of ten."),
    (28.68, 35.26, "It's a new product in collaboration with Mecatex from last year, like calenders."),
    (35.98, 36.94, "End of line."),
    (37.51, 37.98, "Eight out of ten."),
    (38.19, 42.29, "It's suitable for any non-woven fabric production line."),
]

log = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", wav, "-af", "silencedetect=noise=-30dB:d=0.12", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
silences = list(zip(starts, ends))


def voiced(a, b):
    parts, t = [], a
    for s, e in silences:
        if e <= t or s >= b:
            continue
        if s > t:
            parts.append((t, s))
        t = max(t, e)
    if t < b:
        parts.append((t, b))
    return parts


def syllables(w):
    return max(1, len(re.findall(r"[aeiouy]+", w.lower())))


words = []
for a, b, text in PHRASES:
    parts = voiced(a, b)
    total = sum(e - s for s, e in parts)
    toks = text.split()
    weights = [syllables(t) + 0.4 for t in toks]
    scale = total / sum(weights)

    def at(x):  # voiced offset -> clock time
        for s, e in parts:
            if x <= e - s:
                return s + x
            x -= e - s
        return parts[-1][1]

    pos = 0.0
    for tok, wgt in zip(toks, weights):
        s, pos = at(pos), pos + wgt * scale
        words.append({"w": tok, "s": round(s, 2), "e": round(at(pos), 2)})

json.dump(words, open(out, "w"), ensure_ascii=False, indent=0)
print(len(words), "words")
