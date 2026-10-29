# 영상(또는 그 일부)을 단어 단위로 받아쓰기 (mlx-whisper, 맥미니 GPU)
# usage: ~/.venvs/whisper/bin/python words.py in.mp4 out.json [--from 초] [--to 초] [--offset 초]
#   --from/--to: 이 구간만 받아씀. 출력 시각은 기본으로 "구간 시작 = 0"(클립 안 시각)
#   --offset: 출력 시각에 더할 값. 원본 파일 기준 시각을 원하면 --offset 에 --from 과 같은 값을 줌
# 출력: [{"w": "단어", "s": 시작, "e": 끝, "seg": 받아쓰기 문장 번호}, ...] 와 같은 이름의 .txt(문장 + 단어@시각, 읽기용)
import argparse, json, os, subprocess, tempfile
import mlx_whisper

p = argparse.ArgumentParser()
p.add_argument("src"); p.add_argument("out")
p.add_argument("--from", dest="a", type=float); p.add_argument("--to", dest="b", type=float)
p.add_argument("--offset", type=float, default=0.0)
p.add_argument("--model", default="mlx-community/whisper-large-v3-turbo")
o = p.parse_args()

tmp = tempfile.mktemp(suffix=".wav")
cut = (["-ss", str(o.a)] if o.a is not None else []) + (["-to", str(o.b)] if o.b is not None else [])
subprocess.run(["ffmpeg", "-v", "error", "-y", *cut, "-i", o.src, "-vn", "-ac", "1", "-ar", "16000", tmp], check=True)
r = mlx_whisper.transcribe(tmp, path_or_hf_repo=o.model, language="ko", word_timestamps=True, condition_on_previous_text=False)
os.remove(tmp)

words, lines = [], []
for k, s in enumerate(r["segments"]):
    ws = [{"w": w["word"].strip(), "s": round(w["start"] + o.offset, 2), "e": round(w["end"] + o.offset, 2), "seg": k} for w in s.get("words", []) if w["word"].strip()]
    words += ws
    lines.append(f"{s['start'] + o.offset:7.2f}-{s['end'] + o.offset:7.2f}  {s['text'].strip()}")
    lines.append("        " + " ".join(f"{w['w']}@{w['s']:.2f}" for w in ws))
json.dump(words, open(o.out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
open(os.path.splitext(o.out)[0] + ".txt", "w", encoding="utf-8").write("\n".join(lines) + "\n")
print(f"{len(words)} words → {o.out}")
