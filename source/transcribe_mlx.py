# Apple Silicon GPU 받아쓰기 (mlx-whisper). usage: transcribe_mlx.py in.wav out.json [model]
# 출력 형식은 transcribe.py 와 같음 (+ out.txt)
import sys, time, json
import mlx_whisper
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "mlx-community/whisper-large-v3-turbo"
t0 = time.time()
r = mlx_whisper.transcribe(src, path_or_hf_repo=model, language="ko", condition_on_previous_text=False)
rows = [{"start": round(s["start"], 2), "end": round(s["end"], 2), "text": s["text"].strip()} for s in r["segments"]]
json.dump(rows, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
with open(out.replace(".json", ".txt"), "w", encoding="utf-8") as f:
    for x in rows:
        m, s_ = divmod(int(x["start"]), 60)
        f.write(f"[{m:03d}:{s_:02d}] {x['text']}\n")
print(f"{src}: {time.time()-t0:.0f}s, segments {len(rows)}")
