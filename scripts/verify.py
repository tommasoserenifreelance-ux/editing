import json, subprocess, sys, re, difflib
import numpy as np
from faster_whisper import WhisperModel
tx = json.load(open(sys.argv[1])); pieces = json.load(open(sys.argv[2])); mp4 = sys.argv[3]
m = WhisperModel("medium", device="cpu", compute_type="int8")
norm = lambda w: re.sub(r"[^a-zàèéìòù0-9]", "", w.lower())
pcm = subprocess.run(["ffmpeg","-v","error","-i",mp4,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
t = 0.0; bad = 0
for p, q in zip(pieces, pieces[1:]):
    t += p["to"] - p["from"]
    if p["clip"] != q["clip"]:
        continue
    ws = tx[f"IMG_{p['clip']}.mp4"]
    exp = [norm(w[2]) for w in ws if p["to"] - 1.2 <= w[0] and w[1] <= q["from"] + 1.2]
    seg = x[int((t - 1.3) * 16000): int((t + 1.3) * 16000)]
    out, _ = m.transcribe(seg, language="it", word_timestamps=False, vad_filter=False, condition_on_previous_text=False)
    got = [norm(w) for s in out for w in s.text.split()]
    exp = [e for e in exp if e]; got = [g for g in got if g]
    r = difflib.SequenceMatcher(None, exp, got).ratio()
    flag = "OK " if r > 0.8 else "?? "
    if r <= 0.8: bad += 1
    print(flag, f"{t:6.2f}s", p["clip"], f"{p['to']:.2f}->{q['from']:.2f}", "|", " ".join(exp), "||", " ".join(got))
print("suspect joins:", bad)
