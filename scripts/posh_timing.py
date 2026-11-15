"""Tempi di PoshReel (stessa logica di src/PoshReel/index.tsx) per la base musicale.
Uso: python3 scripts/posh_timing.py  -> stampa START LEN LP_AT"""
RATE, FPS, SRC = 0.85, 30, 24
comp = lambda s: round(s / RATE * FPS)
seg = lambda a, b, r=RATE: round((b - a) / SRC / r * FPS)
A = seg(0, 50) + seg(178, 255, 1.15)
B = seg(0, 37)
C = seg(0, 84) + seg(128, 171) + seg(205, 247) + seg(284, 297, 0.55)
D = seg(13, 161)
B_FROM = A + 4
C_FROM = B_FROM + B + 3
D_FROM = C_FROM + C
HOLD_FROM = D_FROM + D
TOTAL = HOLD_FROM + 165
REVEAL = D_FROM + comp(2.3 - 13 / SRC)
SONG_DROP = 148.32
print(f"{SONG_DROP - REVEAL / FPS:.2f} {TOTAL / FPS + 0.3:.2f} {(HOLD_FROM + 30) / FPS:.2f}")

if __name__ == "__main__":
    import sys
    if "--cuts" in sys.argv:
        start = SONG_DROP - REVEAL / FPS
        at = C_FROM
        for n in [seg(0, 84), seg(128, 171), seg(205, 247), seg(284, 297, 0.55)]:
            print(f"cut at song {start + at / FPS:.2f}s"); at += n
        print(f"cut at song {start + at / FPS:.2f}s (Daisy's)")
