import sys, time, json
from faster_whisper import WhisperModel
src, out, model_name = sys.argv[1], sys.argv[2], sys.argv[3]
t0 = time.time()
model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=16)
t1 = time.time()
segments, info = model.transcribe(src, language="ko", beam_size=1, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=700))
rows = []
for s in segments:
    rows.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()})
t2 = time.time()
json.dump(rows, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
with open(out.replace(".json", ".txt"), "w", encoding="utf-8") as f:
    for r in rows:
        m, s_ = divmod(int(r["start"]), 60)
        f.write(f"[{m:02d}:{s_:02d}] {r['text']}\n")
print(f"model load {t1-t0:.0f}s, transcribe {t2-t1:.0f}s, segments {len(rows)}")
