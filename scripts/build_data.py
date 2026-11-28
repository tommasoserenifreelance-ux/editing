import json, re, sys
tx = json.load(open(sys.argv[1])); pieces = json.load(open(sys.argv[2])); out = sys.argv[3]

segments, t = [], 0.0
for p in pieces:
    segments.append({"clip": p["clip"], "from": p["from"], "to": p["to"], "at": round(t, 3)})
    t += p["to"] - p["from"]

def clean(words):
    # Merge apostrophes, fix the transcript's spelling of "menopausa".
    out = []
    for a, b, w, *_ in words:
        w = w.strip()
        if w.startswith("'") and out:
            out[-1][1] = b; out[-1][2] += w; continue
        if out and out[-1][2].lower() == "meno" and w.lower().startswith("pausa"):
            out[-1][1] = b; out[-1][2] = ("M" if out[-1][2][0] == "M" else "m") + "enopausa" + w[5:]; continue
        out.append([a, b, w])
    return out

words = []
for name in sorted(tx):
    clip = name[4:8]
    for a, b, w in clean(tx[name]):
        mid = (a + b) / 2
        seg = next((s for s in segments if s["clip"] == clip and s["from"] <= mid <= s["to"]), None)
        # The transcript starts each clip's first word at 0: keep words that
        # end inside a piece even if they "start" before it.
        if seg is None:
            seg = next((s for s in segments if s["clip"] == clip and s["from"] < b <= s["to"] and b - s["from"] > 0.08), None)
        if seg is None:
            continue  # word cut out (flub)
        off = seg["at"] - seg["from"]
        words.append({"t": round(max(a, seg["from"]) + off, 3), "e": round(min(b, seg["to"]) + off, 3), "w": w})
words.sort(key=lambda w: w["t"])
# Text fixes for the captions.
FIX = {"Sei": "Sei in", "Tai": "Tai", "la": "la"}
for i, w in enumerate(words):
    if i == 0 and w["w"] == "Sei":
        w["w"] = "Sei in"
    if w["w"] == "L'equilibrio." and i + 1 < len(words) and words[i + 1]["w"] == "va":
        w["w"] = "L'equilibrio"
    if i and words[i - 1]["w"].endswith(".") and w["w"][0].islower():
        w["w"] = w["w"][0].upper() + w["w"][1:]
tl = {}
for s in segments:
    tl.setdefault(s["clip"], []).append([s["from"], s["to"], s["at"]])
json.dump({"total": round(t, 3), "segments": segments, "words": words, "tl": tl}, open(out, "w"), ensure_ascii=False, indent=1)
print("total", round(t, 2), "words", len(words))
print(" ".join(w["w"] for w in words))
