# Word-level transcription with faster-whisper: python gai_transcribe.py in/<name>.wav
import sys,json
from faster_whisper import WhisperModel
m=WhisperModel('small',device='cpu',compute_type='int8')
for f in sys.argv[1:]:
    import numpy as np,wave; wv=wave.open(f); a=np.frombuffer(wv.readframes(wv.getnframes()),np.int16).astype(np.float32)/32768
    segs,_=m.transcribe(a,language='it',word_timestamps=True)
    out=[]
    print('=====',f)
    for s in segs:
        print(f"[{s.start:5.1f}-{s.end:5.1f}] {s.text}")
        out.append({'start':s.start,'end':s.end,'text':s.text,'words':[{'w':w.word,'s':w.start,'e':w.end} for w in s.words]})
    json.dump(out,open(f+'.json','w'),ensure_ascii=False)
