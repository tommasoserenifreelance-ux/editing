import sys, numpy as np, soundfile as sf, sherpa_onnx
M=sys.argv[1]; wav=sys.argv[2]
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/turbo-encoder.int8.onnx",decoder=f"{M}/turbo-decoder.int8.onnx",tokens=f"{M}/turbo-tokens.txt",language="it",task="transcribe",num_threads=8)
x,sr=sf.read(wav); n=len(x)
w=int(.02*sr); e=np.sqrt(np.convolve(x**2,np.ones(w)/w,'same'))
cuts=[0]
while n-cuts[-1]>25*sr:
    a=cuts[-1]+18*sr; b=cuts[-1]+25*sr; cuts.append(a+int(np.argmin(e[a:b])))
cuts.append(n)
for s,t in zip(cuts,cuts[1:]):
    st=rec.create_stream(); st.accept_waveform(sr,x[s:t].astype(np.float32)); rec.decode_stream(st)
    print(f"[{s/sr:6.2f}-{t/sr:6.2f}] {st.result.text.strip()}")
