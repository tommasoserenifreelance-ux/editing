"""Regina Bistecca: montaggio dei girati (release "Regina Bistecca – girato").

Ogni video è una lista di spezzoni (inizio, fine, velocità) in secondi del
girato originale (50 fps). Gli spezzoni vengono uniti a taglio netto in un
unico file a 25 fps in public/rb/edit/, su cui Remotion aggiunge il titolo.
Con velocità 0.5 ogni fotogramma a 50 fps viene tenuto: ralenti pulito.

Uso: python3 scripts/rb_tagli.py <cartella girati> [rb1 rb2 ...]
"""

import os
import subprocess
import sys

SOURCES = {
    "rb01": "REGINA.BISTECCA.VIDEO.1.mp4",
    "rb02": "REGINA.BISTECCA.VIDEO.2.mp4",
    "rb03": "REGINA.BISTECCA.VIDEO.3.mp4",
    "rb04": "REGINA.BISTECCA.VIDEO.4.mp4",
    "rb05": "REGINA.BISTECCA.VIDEO.5.mp4",
    "rb06": "REGINA.BISTECCA.VIDEO.6mp4.mp4",
    "rb07": "REGINA.BISTECCA.VIDEO.7.mp4",
    "rb08": "REGINA.BISTECCA.VIDEO.8.mp4",
    "rb09": "VIDEO.9.REGINA.BISTECCA.mp4",
    "rb10": "VIDEO.10.REGINA.BISTECC.mp4",
    "rb11": "VIDEO.11.REGINA.BISTECCA.mp4",
}

EDITS = {
    # Filetto alla brace: già montato, tolgo solo la coda ferma.
    "rb01": [(0.3, 2.26, 1), (2.26, 3.28, 1), (3.28, 5.46, 1), (5.46, 9.3, 1)],
    # Tagliata: 16 s di coltello ridotti a due tagli, via le mani che
    # sistemano il piatto (20.4-22.4) e la coda ferma.
    "rb02": [
        (1.0, 4.5, 1),
        (10.3, 12.5, 1),
        (15.0, 20.4, 1),
        (22.6, 23.6, 1),
        (25.08, 29.0, 1),
    ],
    # Pasta: 45 s in padella ridotti a due gesti, poi impiattamento,
    # salsa, tartufo.
    "rb03": [
        (0.5, 3.5, 1),
        (41.3, 44.9, 1),
        (48.4, 51.8, 1),
        (56.6, 60.4, 1),
        (63.4, 65.0, 1),
        (68.4, 70.3, 1),
        (70.4, 74.6, 1),
    ],
    # Tartare servita: 4.8 s, al ralenti per dare respiro al titolo.
    "rb04": [(0.0, 4.8, 0.5)],
    # Tartufo sul filetto, al ralenti.
    "rb05": [(0.0, 5.2, 0.5)],
    # Libro (pagine rosse e piatti): solo le pagine più belle.
    "rb06": [
        (3.5, 7.5, 1),
        (12.5, 15.0, 1),
        (24.0, 26.6, 1),
        (33.6, 36.3, 1),
    ],
    # Winter in Tuscany.
    "rb07": [
        (1.8, 7.6, 1),
        (14.2, 16.0, 1),
        (26.8, 29.4, 1),
        (31.0, 33.2, 1),
        (38.0, 40.6, 1),
    ],
    # PRIME: si apre e si richiude sulla copertina.
    "rb08": [
        (0.0, 2.6, 1),
        (6.0, 8.0, 1),
        (9.0, 11.0, 1),
        (13.3, 15.0, 1),
        (22.0, 24.0, 1),
        (29.5, 31.5, 1),
        (34.4, 37.9, 1),
    ],
    # Campari Spritz: piano sequenza di 62 s, via i tempi morti
    # (bicchiere fermo, mani che entrano ed escono, bottiglie appoggiate).
    "rb09": [
        (1.3, 3.2, 1),
        (11.6, 14.4, 1),
        (16.8, 19.9, 1),
        (22.4, 24.6, 1),
        (28.8, 32.4, 1),
        (35.0, 36.8, 1),
        (43.0, 45.2, 1),
        (49.4, 52.2, 1),
        (55.0, 56.8, 1),
        (57.4, 62.2, 1),
    ],
    # Long drink rosa: piano sequenza di 44 s, stessa logica.
    "rb10": [
        (0.8, 3.4, 1),
        (7.5, 9.9, 1),
        (11.2, 14.0, 1),
        (19.0, 21.4, 1),
        (25.0, 29.4, 1),
        (30.3, 32.9, 1),
        (34.0, 36.8, 1),
        (39.8, 43.7, 1),
    ],
    # Dolci al banco: tre momenti, chiude quando lei si gira col piatto.
    "rb11": [(3.0, 7.0, 1), (16.0, 19.6, 1), (21.6, 26.4, 1)],
}

FPS = 25
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "rb", "edit")


def build(name: str, src_dir: str) -> None:
    src = os.path.join(src_dir, SOURCES[name])
    # One seeked input per segment, so only that stretch gets decoded.
    inputs, parts = [], []
    for i, (start, end, speed) in enumerate(EDITS[name]):
        inputs += ["-ss", str(start), "-t", f"{end - start:.3f}", "-i", src]
        parts.append(f"[{i}:v]setpts=(PTS-STARTPTS)/{speed},fps={FPS}[v{i}]")
    n = len(EDITS[name])
    chain = "".join(f"[v{i}]" for i in range(n))
    graph = ";".join(parts) + f";{chain}concat=n={n}:v=1:a=0[out]"
    os.makedirs(OUT, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y", *inputs,
            "-filter_complex", graph, "-map", "[out]",
            "-c:v", "libx264", "-preset", "slow", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), "-an",
            os.path.join(OUT, f"{name}.mp4"),
        ],
        check=True,
    )


if __name__ == "__main__":
    names = sys.argv[2:] or list(EDITS)
    for name in names:
        build(name, sys.argv[1])
        print(name, "ok")
