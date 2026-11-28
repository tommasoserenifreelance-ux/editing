"""Build caption groups for the GLIALTRINFERMIERI reels from word timestamps.

Usage: python scripts/gai_captions.py <words.cut.json> <name>
Writes src/GliAltriInfermieri/<name>.captions.json
"""
import json, re, sys

FIX = {
    "dell'avena": "della vena", "saluta": "seduta", "cannolina": "cannulina",
    "canola": "cannula", "controllo": "contrario", "g-therapy": "IV therapy",
    "cortisolo": "cortisolo", "ozonoterapia": "ozonoterapia",
}
LIME = {
    "cortisolo": ["cortisolo", "salivare", "casa", "quattro", "provette", "24", "ore",
                  "esatta", "8.15", "frigo", "completamente", "trasparente", "mezz'ora",
                  "alterato", "solo", "te", "errori"],
    "aghi": ["ozonoterapia", "iv", "therapy", "vena", "agocannula", "rimosso",
             "cannulina", "flessibile", "nessun", "problema", "butterfly", "farfalla",
             "regola", "fissa", "professionista"],
}
RED = {
    "cortisolo": ["non", "sbagliate"],
    "aghi": ["l'ago", "ago"],
}

def norm(t):
    return re.sub(r"[^\w'.\-]", "", t.lower()).strip(".")

def main(path, name):
    raw = json.load(open(path))
    toks = []
    for w in raw:
        t = w["w"].strip()
        if toks and (t[:1] in "'.-" or (toks[-1]["w"].lower() == "far" and t.lower().startswith("falla"))):
            toks[-1]["w"] += t if t[:1] in "'.-" else t
            toks[-1]["e"] = w["e"]
        else:
            toks.append({"w": t, "s": w["s"], "e": w["e"]})
    for t in toks:
        m = re.match(r"^(.*?)([,.?!]*)$", t["w"])
        core, punct = m.group(1), m.group(2)
        core = FIX.get(core.lower(), core)
        if core.lower() == "farfalla" or core.lower() == "farfalla":
            pass
        t["text"] = core.upper()
        t["punct"] = punct
        n = norm(core)
        parts = n.split()
        t["style"] = ("red" if any(p in RED[name] for p in parts) else
                      "lime" if any(p in LIME[name] for p in parts) else "white")
    groups, cur = [], []
    for i, t in enumerate(toks):
        cur.append(t)
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        chars = sum(len(x["text"]) + 1 for x in cur)
        brk = (nxt is None or t["punct"] or len(cur) >= 3 or chars >= 14
               or (nxt and nxt["s"] - t["e"] > 0.3)
               or (nxt and chars + len(nxt["text"]) > 18))
        if brk:
            groups.append(cur); cur = []
    FUNC = {"il", "la", "lo", "i", "le", "gli", "di", "del", "della", "che", "su", "a", "ad",
            "e", "al", "alle", "alla", "una", "un", "per", "è", "o", "se", "non", "nella", "nelle", "da", "ci", "vi"}
    for _ in range(3):
        for gi in range(len(groups) - 1):
            g, n = groups[gi], groups[gi + 1]
            while (len(g) > 1 and not g[-1]["punct"] and g[-1]["text"].lower() in FUNC
                   and len(n) < 3 and sum(len(x["text"]) + 1 for x in n) + len(g[-1]["text"]) <= 18):
                n.insert(0, g.pop())
    out = []
    for gi, g in enumerate(groups):
        start = g[0]["s"]
        end = groups[gi + 1][0]["s"] if gi + 1 < len(groups) else g[-1]["e"] + 0.6
        end = min(end, g[-1]["e"] + 0.5)
        out.append({"start": round(start, 3), "end": round(end, 3),
                    "words": [{"t": round(x["s"], 3), "text": x["text"], "style": x["style"]} for x in g]})
    json.dump(out, open(f"src/GliAltriInfermieri/{name}.captions.json", "w"), ensure_ascii=False, indent=0)
    for o in out:
        print(f'{o["start"]:6.2f}-{o["end"]:6.2f} ' + " ".join(
            (w["text"] if w["style"] == "white" else f'[{w["style"][0]}:{w["text"]}]') for w in o["words"]))

main(sys.argv[1], sys.argv[2])
