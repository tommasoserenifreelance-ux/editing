"""Tempi di PoshReel (stessa logica di src/PoshReel/index.tsx) per la base musicale.
Uso: python3 scripts/posh_timing.py [song] [--cuts]  -> stampa START LEN LP_AT"""
import json, os, sys

RATE, FPS, SRC = 0.85, 30, 24
args = [a for a in sys.argv[1:] if not a.startswith("--")]
KEY = args[0] if args else "spell"
SONG = json.load(open(os.path.join(os.path.dirname(__file__), "../src/PoshReel/songs.json")))[KEY]

def seg(a, b, r=RATE):
    return round((b - a) / SRC / r * FPS)

A = seg(0, 50) + seg(178, 255, 1.15)
B = seg(0, 37)
C_LENS = [round(c * FPS) for c in SONG["c"]]
C = sum(C_LENS)
D_IN = (2.3 - SONG["d"] * RATE) * SRC
D = seg(D_IN, 161)
B_FROM = A + 4
C_FROM = B_FROM + B + 3
D_FROM = C_FROM + C
HOLD_FROM = D_FROM + D
TOTAL = HOLD_FROM + 165
REVEAL = D_FROM + round((2.3 - D_IN / SRC) / RATE * FPS)
HIT = SONG["hit"]
START = HIT - REVEAL / FPS
print(f"{START:.2f} {TOTAL / FPS + 0.3:.2f} {(HOLD_FROM + 30) / FPS:.2f}")
if "--cuts" in sys.argv:
    at = C_FROM
    for n in C_LENS:
        print(f"cut at song {START + at / FPS:.2f}s"); at += n
    print(f"cut at song {START + at / FPS:.2f}s (Daisy's)  reveal/hit at {START + REVEAL / FPS:.2f}s")
