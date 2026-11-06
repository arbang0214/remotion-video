"""구간 경계를 ±win초 안에서 소리가 가장 작은 지점으로 옮긴다. 사용: python snap.py a.wav 627.6 633.9 ..."""
import sys, wave, numpy as np
w = wave.open(sys.argv[1]); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
win = 0.2
for t in map(float, sys.argv[2:]):
    s = a[int((t - win) * sr):int((t + win) * sr)]
    hop = sr // 100
    e = np.sqrt((s[:len(s) // hop * hop].reshape(-1, hop) ** 2).mean(1))
    k = int(np.convolve(e, np.ones(3) / 3, 'same').argmin())
    print(f"{t:.2f} -> {t - win + (k + 0.5) / 100:.2f}  (최소 {20*np.log10(e[k]+1):.0f}dB, 말소리 {20*np.log10(np.percentile(e,90)+1):.0f}dB)")
