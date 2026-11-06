"""카메라 영상과 따로 녹음한 소리의 시각 차이를 잰다.

사용: ~/.venvs/whisper/bin/python sync.py <녹음 파일> <카메라1> [<카메라2> ...]

카메라마다 "offset = 카메라 시각 - 녹음 시각"(초)을 앞·중간·뒤 세 곳에서 재서 보여 준다.
세 값이 0.05초 안에서 맞으면 그 구간 근처 값을 multicam 설정에 쓴다(40분에 0.03초 정도 밀리는 건 정상).
"""
import subprocess
import sys

import numpy as np

SR = 16000


def load(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-ac", "1", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, np.int16).astype(np.float32)


def env(a, hop=SR // 100):  # 10ms 소리 크기
    n = len(a) // hop
    return np.abs(a[:n * hop]).reshape(n, hop).mean(1)


rec = load(sys.argv[1])
er = env(rec)
dur = len(rec) / SR
w0, w1 = int(dur * 0.2 * 100), int(min(dur * 0.2 + 600, dur * 0.8) * 100)  # 녹음 20% 지점부터 최대 10분
seg = er[w0:w1]
seg = (seg - seg.mean()) / seg.std()
for cam in sys.argv[2:]:
    c = load(cam)
    x = env(c)
    x = (x - x.mean()) / x.std()
    corr = np.correlate(x, seg, "valid")
    k = int(corr.argmax())
    coarse = (k - w0) / 100
    print(f"{cam}: 대략 {coarse:+.2f}초 (일치도 {corr.max() / len(seg):.2f}, 0.5 미만이면 의심)")
    for frac in (0.15, 0.5, 0.85):
        st = dur * frac
        r = rec[int(st * SR):int((st + 20) * SR)]
        base = int((st + coarse) * SR)
        if base - 1600 < 0 or base + len(r) + 1600 > len(c):
            continue
        cc = np.correlate(c[base - 1600:base + len(r) + 1600], r, "valid")
        print(f"  녹음 {st / 60:5.1f}분: offset {coarse + (cc.argmax() - 1600) / SR:.3f}")
