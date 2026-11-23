"""Cut the MSC voice over into phrases and place each one on its shot.

The recording runs 21.4 s against a 28 s edit, so every phrase starts on the
cut it talks about and the breaths in between grow to fit.

Usage: python scripts/place_msc_vo.py vo_clean.wav out.wav [length]
"""

import sys

import numpy as np
import soundfile as sf

SRC, OUT = sys.argv[1], sys.argv[2]
LENGTH = float(sys.argv[3]) if len(sys.argv) > 3 else 28.0

# (start in the recording, end in the recording, start in the video)
PHRASES = [
    # Cut points sit in the silences between phrases (measured on the recording).
    (0.00, 2.76, 0.30),  # MSC World Europa ci ha invitati a bordo
    (2.76, 4.63, 5.00),  # una delle navi più grandi al mondo (atrium)
    (4.63, 7.81, 7.20),  # Welcome cocktail, roadshow, incontri con il settore
    (7.81, 9.96, 11.70),  # Poi la parte migliore, la visita ("la visita" on its shot)
    (9.96, 13.26, 13.90),  # Per scoprire tutti gli spazi della nave dove organizzare eventi
    (13.26, 17.40, 17.22),  # Teatro, sale, ponti panoramici. Qui si può fare davvero di tutto
    (17.40, 19.98, 23.30),  # Il prossimo evento a bordo potrebbe essere il tuo
    (19.98, 21.39, 27.50),  # Scrivici in DM (end card)
]

audio, sr = sf.read(SRC)
if audio.ndim > 1:
    audio = audio.mean(axis=1)
out = np.zeros(int(sr * LENGTH))
fade = int(0.012 * sr)
for a, b, t in PHRASES:
    seg = audio[int(a * sr) : int(b * sr)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    s = int(t * sr)
    out[s : s + len(seg)] += seg[: len(out) - s]
sf.write(OUT, out, sr, subtype="PCM_24")
print(f"wrote {OUT}")
