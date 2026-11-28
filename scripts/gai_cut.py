# Tighten pauses between words (needs in/<name>.mov, in/<name>.wav and in/<name>.words.json from gai_transcribe.py).
import json,wave,numpy as np,subprocess,sys
name=sys.argv[1]
w=json.load(open(f'in/{name}.words.json'))
wv=wave.open(f'in/{name}.wav');a=np.frombuffer(wv.readframes(wv.getnframes()),np.int16).astype(float)/32768;sr=16000
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'in/{name}.mov']))
def db(s,e):
    x=a[int(s*sr):int(e*sr)];return 20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
cuts=[]
for p,n in zip(w,w[1:]):
    g=n['s']-p['e']
    if g>0.24:
        s,e=p['e']+0.06,n['s']-0.04
        # refine: find quietest window inside gap
        lvl=db(s,e)
        if lvl<-19 and e-s>0.1: cuts.append((round(s,3),round(e,3),round(lvl,1)))
# leading/trailing
if w[0]['s']>0.25: cuts.insert(0,(0,round(w[0]['s']-0.08,3),0))
end=min(dur,w[-1]['e']+0.6)
keep=[];t=0
for s,e,_ in cuts:
    if s>t: keep.append((t,s))
    t=e
keep.append((t,end))
print(name,'cuts',cuts);print('keep',len(keep),'new dur',round(sum(e-s for s,e in keep),2),'old',round(dur,2))
json.dump(keep,open(f'in/{name}.keep.json','w'))
# remap words
def remap(t):
    acc=0
    for s,e in keep:
        if t<s: return acc
        if t<=e: return acc+t-s
        acc+=e-s
    return acc
nw=[{**x,'s':round(remap(x['s']),3),'e':round(remap(x['e']),3)} for x in w]
json.dump(nw,open(f'in/{name}.words.cut.json','w'),ensure_ascii=False)
# ffmpeg
fc='';cat=''
for i,(s,e) in enumerate(keep):
    d=e-s
    fc+=f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,d-0.012)}:d=0.012[a{i}];"
    cat+=f"[v{i}][a{i}]"
fc+=f"{cat}concat=n={len(keep)}:v=1:a=1[v][a]"
subprocess.run(['ffmpeg','-v','error','-y','-i',f'in/{name}.mov','-filter_complex',fc,'-map','[v]','-map','[a]','-r','24','-c:v','libx264','-crf','14','-preset','fast','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-ar','48000',f'/workspace/editing/public/gai/{name}_cut.mp4'],check=True)
json.dump(keep,open(f'/workspace/editing/public/gai/{name}_keep.json','w'))
