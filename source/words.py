import sys, json
from faster_whisper import WhisperModel
m=WhisperModel("small",device="cpu",compute_type="int8",cpu_threads=16)
out={}
for c in ["c1","c2","c3"]:
    segs,_=m.transcribe(f"C:/dev/remotion-video/public/clips/{c}.mp4",language="ko",beam_size=5,word_timestamps=True)
    out[c]=[{"w":w.word.strip(),"s":round(w.start,1),"e":round(w.end,1)} for s in segs for w in s.words]
json.dump(out,open("words.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
