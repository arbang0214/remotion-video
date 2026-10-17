# 10/10·10/11 주말 특강 하이라이트 시안 3편 클립 제작
# - parts: 원본 구간들을 이어 붙임 (학생 이름이 나오는 곳은 구간 사이로 빠지게 잘라냄)
# - kid: 학생 발화 구간(원본 시각) → 이 구간만 음높이를 살짝 올림
#   (맥미니 ffmpeg 에 rubberband 가 없어 asetrate+atempo 로 길이는 그대로, 피치만 PITCH 배)
# - 수업 화면 파일은 선생님 캠 자리를 그 아래 배경색으로 덮음(판서 영역에 캠이 겹쳐 보이지 않게)
#   캠 파일(cam_*.mp4)은 얼굴캠 원본(~/classvideo/work/facecam, 1920x1080)에서 같은 구간을 잘라 만듦(2026-10-16~)
#   - 얼굴캠 오디오는 무음이라 화면 비교로 싱크를 맞춤: 얼굴캠 시각 = 녹화본 시각 + face_off (수업 내내 일정)
# usage: python3 cut_1010_1011.py [A|B|C ...] [클립이름 ...]
import os, subprocess, sys
from collections import Counter

ARCH = os.path.expanduser("~/classvideo/archive")
FACE = os.path.expanduser("~/classvideo/work/facecam")
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../public/clips")
PITCH = 1.15  # 약 +2.4 반음 (9/19 시안과 같은 정도)
CAMBOX = (1448, 0, 472, 268)  # 원본 1920x1080 안의 선생님 캠
CAM = "scale=852:480:flags=lanczos,unsharp=3:3:0.3:3:3:0"  # 얼굴캠 원본 → 쇼츠 캠 표시 크기

EPS = {
  # 10/10 오후 최상위수학 5-1 (분수의 덧셈과 뺄셈) — 1/12+1/20+1/30+1/42 "통분하면 멈추세요"
  "A": dict(src="2026-10-10 16-30-06.mp4", face_off=-0.167, out="1010a", clips={
    "a1": dict(parts=[(1917.2, 1923.0), (1927.5, 1931.9), (1932.9, 1941.0)], kid=[]),
    "a2": dict(parts=[(1943.9, 1958.6), (1964.2, 1969.4)], kid=[]),
    # 이름(…한테 물어볼까/…아) 나오는 1982~1986.7, 1996.2~1997.9 는 빼고 이어 붙임
    "a3": dict(parts=[(1972.1, 1975.9), (1986.6, 1996.2), (1997.9, 2004.7), (2011.3, 2017.9)], kid=[(1991.6, 1994.1), (2011.3, 2015.75)]),
    "a4": dict(parts=[(2018.4, 2021.7), (2074.7, 2111.7)], kid=[]),
  }),
  # 10/10 저녁 최상위수학 6-1 (여러 가지 그래프) — 반올림해서 더하면 101%
  "B": dict(src="2026-10-10 19-00-39.mp4", face_off=-0.067, out="1010b", clips={
    "b1": dict(parts=[(884.6, 886.4), (924.9, 931.9)], kid=[]),
    # 1026.9~1028.5 "○○이가 아까 말했지" 이름 컷
    "b2": dict(parts=[(1021.3, 1026.9), (1028.5, 1042.2), (1048.4, 1050.1), (1053.5, 1054.4), (1057.6, 1064.0)], kid=[]),
    "b3": dict(parts=[(1067.5, 1088.2), (1090.0, 1092.3)], kid=[]),
    "b4": dict(parts=[(1108.4, 1117.0), (1119.5, 1136.0)], kid=[]),
    "b5": dict(parts=[(1143.3, 1147.4), (1151.4, 1162.7)], kid=[]),
    # 시안B 1분 편집(2026-10-16) 용 짧은 컷: 101 반전만 / 반올림 이유(공백 컷) / 마무리 한 마디
    "b2s": dict(parts=[(1041.6, 1042.24), (1048.3, 1049.95), (1057.6, 1062.4)], kid=[]),
    "b3s": dict(parts=[(1068.7, 1075.8), (1076.8, 1081.5), (1083.2, 1088.2), (1089.7, 1092.3)], kid=[]),
    "b5s": dict(parts=[(1155.5, 1162.6)], kid=[]),
  }),
  # 10/11 초등경시 5-2 (합동과 대칭) — 짝수 점대칭수 105, 친구 설명의 틀린 곳을 다른 친구가 짚음
  "C": dict(src="2026-10-11 19-01-39.mp4", face_off=-0.200, out="1011a", clips={
    "c1": dict(parts=[(1617.4, 1627.75)], kid=[]),
    "c2": dict(parts=[(1808.5, 1811.0), (1816.4, 1826.1), (1828.2, 1833.6), (1835.2, 1838.0)], kid=[]),
    # "○○가 한번 설명해볼 수 있을까?" 이름 컷 → 첫 번째 친구 설명
    "c3": dict(parts=[(1840.7, 1841.4), (1841.92, 1843.5), (1857.5, 1889.3)], kid=[(1857.5, 1887.05)]),
    # "○○가/○○의" 이름 컷 → 틀린 곳 찾기 → 두 번째 친구(“여기 ○○가 아까” 이름 컷)
    "c4": dict(parts=[(1890.75, 1897.9), (1899.7, 1904.25), (1904.7, 1905.3), (1909.9, 1910.95), (1912.0, 1927.45), (1927.45, 1929.33), (1930.15, 1930.84)], kid=[(1909.9, 1910.95), (1912.0, 1927.45)]),
    # 시안C2(분할) 용: c4 에서 "90점…" 도입을 빼고 "틀린 게 있었다는 거 말할 수 있는 친구 있나?"부터 → 학생 설명이 빨리 나오게
    "c4s": dict(parts=[(1902.2, 1904.25), (1904.7, 1905.3), (1909.9, 1910.95), (1912.0, 1927.45), (1927.45, 1929.33), (1930.15, 1930.84)], kid=[(1909.9, 1910.95), (1912.0, 1927.45)]),
    "c5": dict(parts=[(1930.84, 1934.7), (1938.8, 1943.0), (1981.8, 2013.4)], kid=[]),
  }),
}

def run(args):
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args])
    if r.returncode: sys.exit(r.returncode)

def bg_color(src, t):
    # 캠 바로 아래 띠(배경)에서 가장 많이 나오는 색 → 캠 자리를 덮을 색
    x, y, w, h = CAMBOX
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t}", "-i", src, "-frames:v", "1", "-vf", f"crop={w - 20}:8:{x + 10}:{y + h + 4}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    px = Counter(tuple(c >> 2 << 2 for c in raw[i:i + 3]) for i in range(0, len(raw), 3))
    return "0x%02X%02X%02X" % px.most_common(1)[0][0]

def to_clip(parts, t):
    acc = 0
    for a, b in parts:
        if a <= t <= b: return acc + (t - a)
        acc += b - a
    return None

args = sys.argv[1:]
eps = [a for a in args if a in EPS] or list(EPS)
only = [a for a in args if a not in EPS]
for ep in eps:
    E = EPS[ep]
    src = os.path.join(ARCH, E["src"])
    face = os.path.join(FACE, "얼굴캠 " + E["src"].replace(".mp4", ".mov"))
    out = os.path.join(PUB, E["out"])
    os.makedirs(out, exist_ok=True)
    for name, c in E["clips"].items():
        if only and name not in only: continue
        parts = c["parts"]
        ss = max(0, parts[0][0] - 2)
        x, y, w, h = CAMBOX
        fc, fcam = [], []
        for i, (a, b) in enumerate(parts):
            col = bg_color(src, (a + b) / 2)
            fc.append(f"[1:v]trim={a - ss:.3f}:{b - ss:.3f},setpts=PTS-STARTPTS[vr{i}];"
                      f"[0:v]trim={a - ss:.3f}:{b - ss:.3f},setpts=PTS-STARTPTS[vc{i}];[vc{i}]drawbox=x={x}:y={y}:w={w}:h={h}:color={col}:t=fill[v{i}];"
                      f"[0:a]atrim={a - ss:.3f}:{b - ss:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[a{i}]")
        n = len(parts)
        fc.append("".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][araw]")
        fc.append("".join(f"[vr{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,{CAM}[cam]")
        spans = [(to_clip(parts, a), to_clip(parts, b)) for a, b in c["kid"]]
        if spans:
            cond = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in spans)
            fc.append(f"[araw]aresample=48000,asplit=2[ao][ap];[ap]asetrate={48000 * PITCH:.0f},aresample=48000,atempo={1 / PITCH:.6f}[aps];"
                      f"[ao]volume=0:enable='{cond}'[ao2];[aps]volume=0:enable='not({cond})'[ap2];[ao2][ap2]amix=inputs=2:normalize=0[a]")
        else:
            fc.append("[araw]anull[a]")
        dur = parts[-1][1] - ss + 1
        run(["-ss", f"{ss}", "-t", f"{dur}", "-i", src, "-ss", f"{ss + E['face_off']}", "-t", f"{dur}", "-i", face, "-filter_complex", ";".join(fc),
             "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", f"{out}/{name}.mp4",
             "-map", "[cam]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", "30", f"{out}/cam_{name}.mp4"])
        total = sum(b - a for a, b in parts)
        print(ep, name, f"dur={total:.2f}", "kid:", [(round(s, 2), round(e, 2)) for s, e in spans], flush=True)
