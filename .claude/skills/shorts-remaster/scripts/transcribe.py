"""원본 쇼츠 받아쓰기(단어별 시각 포함) — 자막 타이밍과 제목·티저 후보를 고를 때 쓴다.

사용: python3 transcribe.py <video> [model]   (model 기본 large-v3)
결과: 영상 옆에 transcript.txt (문장별 + 단어별 시각)
"""
import sys
from pathlib import Path
from faster_whisper import WhisperModel

src = Path(sys.argv[1])
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "large-v3", device="cpu", compute_type="int8")
segments, _ = model.transcribe(str(src), language="ko", beam_size=5, word_timestamps=True)
lines = []
for s in segments:
    lines.append(f"{s.start:6.2f}-{s.end:6.2f}  {s.text.strip()}")
    lines.append("        " + " ".join(f"{w.word.strip()}[{w.start:.2f}]" for w in s.words))
out = src.parent / "transcript.txt"
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines))
print("저장:", out)
