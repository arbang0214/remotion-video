# 얼굴캠 원본(무음)과 수업 녹화본의 시간차 찾기 — 녹화본 캠 자리와 얼굴캠 화면을 비교
# 결과 face_off: 얼굴캠 시각 = 녹화본 시각 + face_off (수업 내내 일정. 서로 다른 시각 2~3곳에서 재서 같은지 확인)
# usage: python3 facecam_sync.py 녹화본.mp4 얼굴캠.mov|mp4 T초 [--cam x,y,w,h] [--range 2] [--len 4]
#   T: 선생님이 움직이는(손짓·고개) 구간의 녹화본 시각. 가만히 있는 구간은 차이가 안 나서 못 잼
import argparse, subprocess
import numpy as np

p = argparse.ArgumentParser()
p.add_argument("rec"); p.add_argument("face"); p.add_argument("t", type=float)
p.add_argument("--cam", default="1448,0,472,268")  # 녹화본 1920x1080 안의 선생님 캠(수업마다 조금 다를 수 있음)
p.add_argument("--range", type=float, default=2.0)  # 찾을 시간차 범위 ±초
p.add_argument("--len", type=float, default=4.0)  # 비교할 길이(초)
o = p.parse_args()
FPS, W, H = 30, 96, 54

def frames(src, ss, dur, crop=None):
    vf = (f"crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]}," if crop else "") + f"fps={FPS},scale={W}:{H},format=gray"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0, ss):.3f}", "-t", f"{dur:.3f}", "-i", src, "-vf", vf, "-f", "rawvideo", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    return (x - x.mean(axis=(1, 2), keepdims=True)) / (x.std(axis=(1, 2), keepdims=True) + 1)  # 밝기·대비 차이 무시

cam = [int(v) for v in o.cam.split(",")]
a = frames(o.rec, o.t, o.len, cam)
b = frames(o.face, o.t - o.range, o.len + 2 * o.range)
n = len(a)
scores = []
for k in range(0, len(b) - n + 1):
    scores.append((float(np.mean((b[k:k + n] - a) ** 2)), k / FPS - o.range))
scores.sort()
best, off = scores[0]
print(f"face_off = {off:+.3f}  (오차 {best:.3f}, 다음 후보 {scores[1][1]:+.3f}/{scores[1][0]:.3f}, 중간값 {scores[len(scores) // 2][0]:.3f})")
print("오차가 중간값보다 확실히 작아야 믿을 수 있음. 비슷하면 선생님이 더 움직이는 T 로 다시")
