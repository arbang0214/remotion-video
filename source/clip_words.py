# 잘라낸 클립들을 다시 받아쓰기(단어 단위, 클립 내 시각) — 이름 컷 확인 + 자막 시각용
import sys, mlx_whisper
for f in sys.argv[1:]:
    r = mlx_whisper.transcribe(f, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", language="ko", word_timestamps=True, condition_on_previous_text=False)
    print("=====", f)
    for s in r["segments"]:
        print(f"[{s['start']:.2f}-{s['end']:.2f}] " + " ".join(f"{w['word'].strip()}@{w['start']:.2f}" for w in s.get("words", [])))
