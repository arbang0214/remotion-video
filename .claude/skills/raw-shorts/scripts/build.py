"""편 설정(녹음 시각 기준) 하나로 중간 영상 → 내용 파일 → 템플릿 합성까지.

사용:
  python3 build.py <편.json>                 중간 영상 + 내용 파일 + 썸네일 + 영상
  python3 build.py <편.json> --thumb-only    썸네일만(제목 폭 확인)
  python3 build.py <편.json> --no-mc         중간 영상은 그대로 두고(자막·제목만 고쳤을 때) 합성만

편.json (경로는 이 파일 기준, 시각은 모두 녹음 파일 기준 초):
  audio      녹음 파일 (따로 녹음이 없으면 카메라 하나를 쓰고 그 카메라 offset 은 0)
  cams       {"A": {"file", "offset", "crop": [x, y, w, h], "eq"(선택)}, "B": {...}}  — 첫 카메라가 바탕
  template   템플릿 이름 (기본 daechi-navy)
  out        결과 이름, out_dir 결과 폴더(프로젝트 루트 기준)
  title      ["첫 줄", "둘째 줄"]
  parts      [[시작, 끝], ...]  쓸 구간
  switch     [[시각, "A"], ...]  그 시각부터 그 카메라
  captions   [[시작, 끝, "자막"], ...]
  thumb      썸네일 장면
  loudness   목표 LUFS (기본 -16)

중간 영상(mc_<out>.mov)과 내용 파일(ep_<out>.json)은 편.json 옆에 생긴다.
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
COMPOSE = HERE.parent.parent / "shorts-template" / "scripts" / "compose.py"
SPEC_PATH = Path(sys.argv[1]).resolve()
S = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
BASE = SPEC_PATH.parent
PAD = 0.3
T0 = round(S["parts"][0][0] - PAD, 3)
T1 = round(S["parts"][-1][1] + PAD, 3)
mc_name = f"mc_{S['out']}"

# 1) 중간 영상 설정
mc = {"audio": S["audio"], "range": [T0, T1], "size": [1080, 912], "cams": S["cams"],
      "switch": [[max(t, T0), n] for t, n in S["switch"]], "out": mc_name, "loudness": S.get("loudness", -16)}
(BASE / f"{mc_name}.json").write_text(json.dumps(mc, ensure_ascii=False, indent=1), encoding="utf-8")

# 2) 내용 파일 (중간 영상 시각 = 녹음 시각 - T0)
sh = lambda t: round(t - T0, 3)
ep = {"source": f"{mc_name}.mov", "out": S["out"], "out_dir": S.get("out_dir", "out/shorts"), "title": S["title"],
      "crop": {"x": 0, "y": 0, "w": 1080, "h": 912}, "thumb": sh(S["thumb"]),
      "parts": [[sh(a), sh(b)] for a, b in S["parts"]],
      "captions": [{"from": sh(a), "to": sh(b), "text": t} for a, b, t in S["captions"]]}
ep_path = BASE / f"ep_{S['out']}.json"
ep_path.write_text(json.dumps(ep, ensure_ascii=False, indent=1), encoding="utf-8")

thumb_only = "--thumb-only" in sys.argv
if "--no-mc" not in sys.argv and not (thumb_only and (BASE / f"{mc_name}.mov").exists()):
    subprocess.run([sys.executable, str(HERE / "multicam.py"), str(BASE / f"{mc_name}.json")], check=True)
cmd = [sys.executable, str(COMPOSE), S.get("template", "daechi-navy"), str(ep_path)]
subprocess.run(cmd + (["--thumb-only"] if thumb_only else []), check=True)
