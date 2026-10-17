# 구간만 단어 단위로 다시 받아쓰기 (mlx-whisper). usage: words_mlx.py in.wav start end out.txt
# 출력 시각은 원본(파일) 기준 초
import sys, subprocess, tempfile, os
import mlx_whisper
src, a, b, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
tmp = tempfile.mktemp(suffix=".wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-to", str(b), "-i", src, tmp], check=True)
r = mlx_whisper.transcribe(tmp, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", language="ko", word_timestamps=True, condition_on_previous_text=False)
os.remove(tmp)
with open(out, "w", encoding="utf-8") as f:
    for s in r["segments"]:
        f.write(f"## {s['start']+a:.2f}-{s['end']+a:.2f} {s['text'].strip()}\n")
        f.write(" ".join(f"{w['word'].strip()}@{w['start']+a:.2f}" for w in s.get("words", [])) + "\n")
print(out)
