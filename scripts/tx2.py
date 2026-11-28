import sys, json, glob, os, subprocess
import numpy as np
from faster_whisper import WhisperModel
d, out, size = sys.argv[1], sys.argv[2], sys.argv[3]
m = WhisperModel(size, device="cpu", compute_type="int8")
res = {}
for f in sorted(glob.glob(os.path.join(d, "IMG_*.mp4"))):
    pcm = subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True,check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(audio, language="it", word_timestamps=True, vad_filter=False,
        condition_on_previous_text=False, beam_size=5,
        initial_prompt="Ehm, allora, cioè... ehm, sì. Eh, quindi, ehm, ripeto, ripeto.")
    words = []
    for s in segs:
        for w in s.words: words.append([round(w.start,2), round(w.end,2), w.word, round(w.probability,2)])
    name = os.path.basename(f); res[name] = words
    print(name, " ".join(f"{w[2].strip()}" + ("(?)" if w[3] < 0.5 else "") for w in words), flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
