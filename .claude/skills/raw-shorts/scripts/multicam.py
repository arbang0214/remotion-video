"""두 카메라 촬영본 + 따로 녹음한 소리 → 카메라를 번갈아 붙인 중간 영상(템플릿 영상 칸 크기).

사용: python3 multicam.py <multicam.json>

multicam.json (경로는 이 파일 기준, 시각은 모두 녹음 파일 기준 초):
  audio    녹음 파일
  range    [T0, T1]  중간 영상에 담을 범위. 결과 영상의 0초 = 녹음 T0
  size     [1080, 912]  결과 크기(템플릿 영상 칸)
  cams     {"A": {"file", "offset"(카메라 시각 - 녹음 시각), "crop": [x, y, w, h], "eq"(선택, ffmpeg 필터)}}
  switch   [[녹음 시각, "A"], ...]  그 시각부터 그 카메라
  out      결과 파일
  loudness 목표 LUFS (기본 -16)

카메라마다 같은 T0 에서 한 번에 잘라 겹쳐 놓고 시각으로 고르기 때문에, 바꿀 때마다 시각이 밀리지 않는다.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

CFG_PATH = Path(sys.argv[1]).resolve()
CFG = json.loads(CFG_PATH.read_text(encoding="utf-8"))
BASE = CFG_PATH.parent
T0, T1 = CFG["range"]
DUR = T1 - T0
W, H = CFG.get("size", [1080, 912])
names = list(CFG["cams"])


def loudness_gain():
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-ss", str(T0), "-t", str(DUR), "-i", str(BASE / CFG["audio"]),
                        "-af", "highpass=f=70,ebur128=framelog=quiet", "-f", "null", "-"], capture_output=True, text=True)
    i = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])
    return CFG.get("loudness", -16) - i


inputs, graph = [], []
for k, n in enumerate(names):
    c = CFG["cams"][n]
    x, y, w, h = c["crop"]
    inputs += ["-ss", f"{T0 + c['offset']:.3f}", "-t", f"{DUR:.3f}", "-i", str(BASE / c["file"])]
    eq = f",{c['eq']}" if c.get("eq") else ""
    graph.append(f"[{k}:v]setpts=PTS-STARTPTS,crop={w}:{h}:{x}:{y},scale={W}:{H}:flags=lanczos,setsar=1,format=yuv420p{eq}[c{n}]")

# 카메라마다 켜지는 시간대 → overlay enable
spans = {n: [] for n in names}
sw = sorted(CFG["switch"])
for i, (t, n) in enumerate(sw):
    end = sw[i + 1][0] if i + 1 < len(sw) else T1
    spans[n].append((max(t, T0) - T0, end - T0))
base = names[0]
last = f"c{base}"
for n in names[1:]:
    if not spans[n]:
        continue
    en = "+".join(f"between(t,{a:.3f},{b - 0.0005:.3f})" for a, b in spans[n])
    graph.append(f"[{last}][c{n}]overlay=0:0:enable='{en}'[o{n}]")
    last = f"o{n}"
graph.append(f"[{last}]fps=30000/1001[vout]")
ka = len(names)
inputs += ["-ss", f"{T0:.3f}", "-t", f"{DUR:.3f}", "-i", str(BASE / CFG["audio"])]
gain = loudness_gain()
graph.append(f"[{ka}:a]asetpts=PTS-STARTPTS,highpass=f=70,volume={gain:.2f}dB,alimiter=limit=0.89[aout]")

out = BASE / CFG["out"]
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(graph),
                "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "medium", "-crf", "10",
                "-c:a", "pcm_s16le", "-ar", "48000", str(out.with_suffix(".mov"))], check=True)
print(f"중간 영상: {out.with_suffix('.mov')} ({DUR:.1f}초, 소리 {gain:+.1f}dB)")
for n in names:
    print(f"  {n}: " + ", ".join(f"{a + T0:.1f}~{b + T0:.1f}" for a, b in spans[n]))
