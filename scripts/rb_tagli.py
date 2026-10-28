"""Regina Bistecca: montaggio dei girati (release "Regina Bistecca – girato").

Ogni video è una lista di spezzoni (inizio, fine, velocità[, dissolvenza])
in secondi del girato originale (50 fps). Gli spezzoni vengono uniti a taglio
netto (o con una dissolvenza in entrata di N secondi) in un unico file a
25 fps in public/rb/edit/, su cui Remotion aggiunge titolo e logo.
Con velocità 0.5 ogni fotogramma a 50 fps viene tenuto: ralenti pulito.

Prima del taglio, dove serve, il girato intero viene stabilizzato (vidstab,
due passate) e messo in cache. Poi a tutto si applica la color calda delle
reference di agosto (RB – Agosto 3, 10, 12).

Uso: python3 scripts/rb_tagli.py <cartella girati> [rb01 rb02 ...]
Scrive anche src/ReginaBistecca/durations.ts con le durate in fotogrammi.
"""

import json
import os
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "public", "rb", "edit")
CACHE = os.path.join(ROOT, "..", "rb_cache")
DURATIONS = os.path.join(ROOT, "src", "ReginaBistecca", "durations.ts")
FPS = 25

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

# Just a little warmer than the camera, towards the August references:
# a hint of amber in the mids, barely lifted blacks.
GRADE = (
    "colorbalance=rs=0.01:bs=-0.015:rm=0.02:bm=-0.025:rh=0.005:bh=-0.01,"
    "curves=all='0/0.012 0.5/0.505 1/0.99',eq=saturation=1.03"
)

# The tablecloth in video 4 pulses at ~11 Hz (lights). Swap the frame's
# soft brightness for a 5-frame average of it, keeping the sharp detail, so
# the flicker goes without smearing the hand.
DEFLICKER = (
    "format=yuv444p,split=3[a][b0][c0];[b0]gblur=sigma=24[b];"
    "[c0]tmix=frames=5,gblur=sigma=24[c];[b][c]blend=all_expr='A-B+128'[d];"
    "[a][d]blend=all_expr='A-B+128'"
)

EDITS = {
    # Filetto alla brace: già montato. Il sale cade fino alla fine della
    # ripresa, quindi tengo fermo l'ultimo fotogramma per il logo.
    "rb01": {
        "gamma": 1.05,
        "hold": 2.6,
        "cuts": [(0.3, 2.26, 1), (2.26, 3.28, 1), (3.28, 5.46, 1), (5.46, 10.6, 1)],
    },
    # Tagliata: i tagli della prima versione (piaciuti di più), con la
    # color nuova: due tagli di coltello, via le mani che sistemano il piatto.
    "rb02": {
        "gamma": 1.05,
        "cuts": [
            (1.0, 4.5, 1),
            (10.3, 12.5, 1),
            (15.0, 20.4, 1),
            (22.6, 23.6, 1),
            (25.08, 29.0, 1),
        ],
    },
    # Pasta: stabilizzata; il tartufo finito entra in dissolvenza.
    "rb03": {
        "stab": True,
        "cuts": [
            (0.5, 3.5, 1),
            (41.3, 44.9, 1),
            (48.4, 51.8, 1),
            (56.6, 60.4, 1),
            (63.4, 65.0, 1),
            (68.4, 70.34, 1),
            (70.4, 75.4, 1, 0.8),
        ],
    },
    # Tartare servita: al ralenti, senza flickering.
    "rb04": {"deflicker": True, "cuts": [(0.0, 4.8, 0.5)]},
    # Tartufo sul filetto, al ralenti, stabilizzato.
    "rb05": {"stab": True, "cuts": [(0.0, 5.2, 0.5)]},
    # Libri: niente tagli, le pagine scorrono vere; stabilizzati.
    "rb06": {"stab": True, "cuts": [(0.0, 36.4, 1)]},
    # Si vede anche la mano che prende gli occhiali.
    "rb07": {"stab": True, "cuts": [(0.0, 46.88, 1)]},
    "rb08": {"stab": True, "cuts": [(0.0, 37.96, 1)]},
    # Campari Spritz: piano sequenza di 62 s, via i tempi morti.
    "rb09": {
        "cuts": [
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
    },
    # Long drink rosa: piano sequenza di 44 s, stessa logica.
    "rb10": {
        "cuts": [
            (0.8, 3.4, 1),
            (7.5, 9.9, 1),
            (11.2, 14.0, 1),
            (19.0, 21.4, 1),
            (25.0, 29.4, 1),
            (30.3, 32.9, 1),
            (34.0, 36.8, 1),
            (39.8, 43.7, 1),
        ],
    },
    # Dolci al banco: ripresa intera, stabilizzata, leggermente rallentata.
    "rb11": {"stab": True, "cuts": [(0.0, 27.7, 0.8)]},
}


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def stabilised(name: str, src: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    out = os.path.join(CACHE, f"{name}_stab.mp4")
    if os.path.exists(out):
        return out
    trf = os.path.join(CACHE, f"{name}.trf")
    run(["-i", src, "-vf", f"vidstabdetect=shakiness=6:accuracy=15:result={trf}",
         "-f", "null", "-"])
    run(["-i", src, "-vf",
         f"vidstabtransform=input={trf}:smoothing=20:optzoom=1:interpol=bicubic,"
         "unsharp=5:5:0.4:3:3:0.2",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-an", out])
    return out


def build(name: str, src_dir: str) -> int:
    edit = EDITS[name]
    src = os.path.join(src_dir, SOURCES[name])
    if edit.get("stab"):
        src = stabilised(name, src)
    look = GRADE + (f",eq=gamma={edit['gamma']}" if "gamma" in edit else "")

    # One seeked input per segment, so only that stretch gets decoded.
    inputs, parts, lengths, fades = [], [], [], []
    for i, (start, end, speed, *fade) in enumerate(edit["cuts"]):
        inputs += ["-ss", str(start), "-t", f"{end - start:.3f}", "-i", src]
        pre = f"{DEFLICKER}," if edit.get("deflicker") else ""
        parts.append(
            f"[{i}:v]{pre}setpts=(PTS-STARTPTS)/{speed},fps={FPS},{look},"
            f"format=yuv420p[v{i}]"
        )
        lengths.append((end - start) / speed)
        fades.append(fade[0] if fade else 0)

    # Join: hard cuts with concat, dissolves with xfade.
    cur, total = "v0", lengths[0]
    for i in range(1, len(lengths)):
        nxt = f"j{i}"
        if fades[i]:
            parts.append(
                f"[{cur}][v{i}]xfade=transition=fade:duration={fades[i]}:"
                f"offset={total - fades[i]:.3f}[{nxt}]"
            )
            total += lengths[i] - fades[i]
        else:
            parts.append(f"[{cur}][v{i}]concat=n=2:v=1:a=0,settb=1/{FPS}[{nxt}]")
            total += lengths[i]
        cur = nxt

    if edit.get("hold"):
        parts.append(f"[{cur}]tpad=stop_mode=clone:stop_duration={edit['hold']}[held]")
        cur = "held"

    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, f"{name}.mp4")
    run([*inputs, "-filter_complex", ";".join(parts), "-map", f"[{cur}]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18",
         "-pix_fmt", "yuv420p", "-r", str(FPS), "-an", out])
    frames = subprocess.run(
        ["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v",
         "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return int(frames)


def write_durations(new: dict) -> None:
    known = {}
    if os.path.exists(DURATIONS):
        text = open(DURATIONS).read()
        known = json.loads(text[text.index("{"): text.rindex("}") + 1])
    known.update(new)
    body = json.dumps(dict(sorted(known.items())), indent=2)
    with open(DURATIONS, "w") as f:
        f.write("// Generated by scripts/rb_tagli.py: frames at 25 fps.\n")
        f.write(f"export const RB_DURATIONS: Record<string, number> = {body};\n")


if __name__ == "__main__":
    names = sys.argv[2:] or list(EDITS)
    done = {}
    for name in names:
        done[name] = build(name, sys.argv[1])
        print(name, done[name], "frames")
    write_durations(done)
