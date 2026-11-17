import sys,json,numpy as np,soundfile as sf,sherpa_onnx
M='/tmp/claude-0/-home-user-editing/80a2e44c-55fb-5633-9cd2-a538b271aca0/scratchpad/asr/sherpa-onnx-whisper-turbo'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/turbo-encoder.int8.onnx",decoder=f"{M}/turbo-decoder.int8.onnx",tokens=f"{M}/turbo-tokens.txt",language="it",task="transcribe",num_threads=8)
x,sr=sf.read(sys.argv[1])
for spec in json.loads(sys.argv[2]):
    parts=spec if isinstance(spec[0],list) else [spec]
    seg=np.concatenate([np.zeros(3000)]+[x[int(a*sr):int(b*sr)] for a,b in parts]+[np.zeros(3000)]).astype(np.float32)
    st=rec.create_stream(); st.accept_waveform(sr,seg); rec.decode_stream(st)
    print(parts,'|',st.result.text.strip())
