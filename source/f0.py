# 구간의 목소리 높이(F0) 를 0.25초 단위로 출력 — 선생님(낮음)/학생(높음) 발화 구분용
# usage: f0.py in.wav start end
import sys, subprocess, numpy as np
src, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", src, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
sr, win, hop = 16000, 640, 160
f0s, ens = [], []
for i in range(0, len(x) - win, hop):
    f = x[i:i + win] * np.hanning(win)
    e = np.sqrt(np.mean(f ** 2))
    ac = np.correlate(f, f, "full")[win - 1:]
    lo, hi = sr // 500, sr // 70
    k = lo + np.argmax(ac[lo:hi])
    f0s.append(sr / k if ac[k] > 0.35 * ac[0] and e > 0.01 else 0); ens.append(e)
f0s = np.array(f0s); step = 25  # 0.25s
line = []
for j in range(0, len(f0s), step):
    v = f0s[j:j + step]; v = v[v > 0]
    t = a + j * hop / sr
    line.append(f"{t:.2f}:{int(np.median(v)) if len(v) > 3 else '-'}")
for k in range(0, len(line), 8): print("  ".join(line[k:k + 8]))
