"""Tempi di PoshReel (stessa logica di src/PoshReel/index.tsx) per la base musicale.
Uso: python3 scripts/posh_timing.py  -> stampa START LEN LP_AT"""
RATE, FPS, SRC = 0.85, 30, 24
comp = lambda s: round(s / RATE * FPS)
seg = lambda a, b: comp((b - a) / SRC)
A = seg(0, 50) + seg(120, 205) + seg(220, 299)
B = seg(0, 37)
C = seg(0, 50) + seg(120, 168) + seg(226, 298)
D = seg(0, 161)
B_FROM = A + 4
C_FROM = B_FROM + B + 3
D_FROM = C_FROM + C
DATE_FROM = D_FROM + D
LOGO_FROM = DATE_FROM + 8 + 20 + 45 + 15
TOTAL = LOGO_FROM + 8 + 30 + 75
REVEAL = D_FROM + comp(2.3)
SONG_DROP = 148.2
print(f"{SONG_DROP - REVEAL / FPS:.2f} {TOTAL / FPS + 0.3:.2f} {(DATE_FROM - 18) / FPS:.2f}")
