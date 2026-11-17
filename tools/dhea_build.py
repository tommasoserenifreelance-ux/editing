import json,subprocess,sys,numpy as np
S='/tmp/claude-0/-home-user-editing/80a2e44c-55fb-5633-9cd2-a538b271aca0/scratchpad/'
SRC=S+'dhea_src/'; OUT=sys.argv[1]; SPEED=float(sys.argv[2]); DRY=len(sys.argv)>3
db=np.load(SRC+'db.npy'); SEAM=69.24
TH=-40; MIN=22; KEEP_AFTER=0.13; KEEP_BEFORE=0.08
SECT=[[(5.64,9.95),(10.78,12.55)],[(18.71,22.69),(23.38,25.25)],[(42.28,50.62)],[(68.2,79.62)],[(123.3,136.12)]]
pieces=[]
for k,sec in enumerate(SECT):
    z=k%2
    for (a,b) in sec:
        i0,i1=int(a*100),int(b*100); q=db[i0:i1]<TH; s=None; cur=a
        for i in range(len(q)+1):
            on=i<len(q) and q[i]
            if on and s is None: s=i
            if not on and s is not None:
                if i-s>=MIN and s>0 and i<len(q):
                    ps=a+s/100+KEEP_AFTER; pe=a+i/100-KEEP_BEFORE
                    if pe>ps:
                        pieces.append([cur,ps,z]); cur=pe
                        if (i-s)>=45: z^=1
                s=None
        pieces.append([cur,b,z])
q30=lambda t: round(t*30)/30
pieces=[[q30(a),q30(b),z] for a,b,z in pieces if q30(b)-q30(a)>=2/30]
tot=sum(b-a for a,b,z in pieces); print(len(pieces),'pieces raw',round(tot,2),'-> out',round(tot/SPEED,2))
json.dump(pieces,open(S+'dhea/pieces.json','w'))
if DRY: sys.exit()
WIDE="crop=1216:2160:1274:0,scale=1080:1920:flags=lanczos"
CLOSE="crop=900:1600:1432:180,scale=1080:1920:flags=lanczos"
L=open(S+'dhea/list.txt','w'); n=0
for a,b,z in pieces:
    segs=[('dhea1.mp4',a,b)] if b<=SEAM else ([('dhea2.mp4',a-SEAM,b-SEAM)] if a>=SEAM else [('dhea1.mp4',a,SEAM),('dhea2.mp4',0,b-SEAM)])
    for f,x0,x1 in segs:
        d=x1-x0
        if d<1/30: continue
        o=f'{S}dhea/p{n:03d}.mp4'; n+=1
        subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{x0:.4f}','-i',SRC+f,'-t',f'{d:.4f}','-vf',(CLOSE if z else WIDE)+',fps=30,setsar=1',
            '-af',f'afade=t=in:d=0.006,afade=t=out:st={max(0,d-0.008):.4f}:d=0.008','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-c:a','pcm_s16le','-ar','48000',o],check=True)
        L.write(f"file '{o}'\n")
L.close()
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',S+'dhea/list.txt','-filter_complex',f'[0:v]setpts=PTS/{SPEED},fps=30[v];[0:a]atempo={SPEED},loudnorm=I=-15:TP=-1.5:LRA=9[a]','-map','[v]','-map','[a]','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',OUT],check=True)
print('done')
