import sys, subprocess, io, re, json
import numpy as np, soundfile as sf, librosa
TXT, WAV, OUT = sys.argv[1:4]; SR=16000; H=160
SAY={'DHEA':'di acca e a','DHEA-S':'di acca e a esse','EPA':'e pi a','DHA':'di acca a','T3':'ti tre','T4':'ti quattro','100%':'cento per cento'}
text=open(TXT).read().split()
def synth(w):
    key=re.sub(r"[^\wàèéìòùÀÈÉÌÒÙ'%-]",'',w); say=SAY.get(key,key)
    out=subprocess.run(['espeak-ng','-v','it','-s','185','--stdout',say],capture_output=True).stdout
    a,sr=sf.read(io.BytesIO(out)); a=librosa.resample(a,orig_sr=sr,target_sr=SR)
    return librosa.effects.trim(a,top_db=30)[0]
def feat(x):
    m=librosa.feature.mfcc(y=x,sr=SR,n_mfcc=20,hop_length=H,n_fft=512)[1:]
    m=np.vstack([m,librosa.feature.delta(m)])
    return (m-m.mean(1,keepdims=True))/(m.std(1,keepdims=True)+1e-8)
q,_=sf.read(WAV)
ref=[np.zeros(int(.4*SR))]; b=[]; pos=len(ref[0])
for w in text:
    a=synth(w); b.append([pos,pos+len(a)]); ref.append(a); pos+=len(a)
    g=.25 if re.search(r'[.?:]$',w) else (.12 if w.endswith(',') else .02); ref.append(np.zeros(int(g*SR))); pos+=int(g*SR)
ref.append(np.zeros(int(.4*SR))); ref=np.concatenate(ref)
R,Q=feat(ref),feat(q)
_,wp=librosa.sequence.dtw(X=R,Y=Q,metric='cosine',global_constraints=True,band_rad=0.15); wp=wp[::-1]
r2q={}
for r,qq in wp: r2q.setdefault(r,qq)
mp=lambda s: r2q[min(s//H,R.shape[1]-1)]*H/SR
t=[[mp(s),mp(e)] for s,e in b]
o=subprocess.run(['ffmpeg','-i',WAV,'-af','highpass=f=100,silencedetect=n=-34dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
sil=list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)],[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]))
for ss,se in sil:
    k=min(range(len(t)),key=lambda i:abs(t[i][0]-se))
    if abs(t[k][0]-se)<0.45 and k>0: t[k][0]=se; t[k-1][1]=min(t[k-1][1],ss)
for i in range(1,len(t)):
    if t[i][0]<t[i-1][0]+0.05: t[i][0]=t[i-1][0]+0.05
res=[{'w':w,'s':round(s,3),'e':round(max(e,s+.05),3)} for w,(s,e) in zip(text,t)]
json.dump(res,open(OUT,'w'),ensure_ascii=False,indent=1)
print(len(sil),'pauses'); print(' | '.join(f"{r['s']:.2f} {r['w']}" for r in res))
