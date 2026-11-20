"""1캠 촬영본(Q&A 등) → shorts-template 용 mid.mp4(1080×912) + content.json (+ thumb.json).  (2캠은 build.py)

사용: python3 onecam_template.py <편 폴더>
그 다음: python3 .claude/skills/shorts-template/scripts/compose.py <템플릿> <편 폴더>/content.json
         python3 .claude/skills/shorts-template/scripts/compose.py <템플릿> <편 폴더>/thumb.json --thumb-only   # thumb_raw 를 썼을 때

plan.json (시각은 모두 원본 초):
  source   원본 영상(편 폴더 기준 경로)       crop  [x, y, w, h] (가로:세로 = 1080:912, 예 900x760)
  out, out_dir, title[2줄], profile{name, meta[]}
  speed    말 속도 배율                        grade 톤 보정 ffmpeg 필터(없으면 선명도만)
  parts    [[시작, 끝], ...]                   tail  마지막 구간 뒤로 화면만 더 보여 주는 길이(그 동안 소리는 끔)
  captions [[초, "한 줄 자막"], ...]           thumb 썸네일 장면(쓴 구간 안)  /  thumb_raw 구간 밖 장면(원본 초) → thumb.json
"""
import json
import subprocess
import sys
from pathlib import Path

EP = Path(sys.argv[1]).resolve()
plan = json.loads((EP / "plan.json").read_text())
SRC = (EP / plan["source"]).resolve()
x, y, w, h = plan["crop"]
CAM = f"crop={w}:{h}:{x}:{y},scale=1080:912:flags=lanczos,setsar=1," + plan.get("grade", "unsharp=5:5:0.8:5:5:0")
SPEED, FADE = plan.get("speed", 1.0), 0.03
parts = [(round(a * 30) / 30, round(b * 30) / 30) for a, b in plan["parts"]]


def to_out(t):
    acc = 0.0
    for a, b in parts:
        if t < a:
            return acc / SPEED
        if t <= b:
            return (acc + t - a) / SPEED
        acc += b - a
    return acc / SPEED


TAIL = plan.get("tail", 0)  # 마지막 구간 뒤로 화면만 더 보여 주는 길이(원본 초). 그 동안 소리는 끔(여운)
fc = []
for i, (a, b) in enumerate(parts):
    last = i == len(parts) - 1
    e = b + TAIL if last else b
    out_fade = f"afade=t=out:st={b - a - 0.12:.3f}:d=0.12" if last and TAIL else f"afade=t=out:st={b - a - FADE:.3f}:d={FADE}"
    fc.append(f"[0:v]trim={a:.3f}:{e:.3f},setpts=PTS-STARTPTS,{CAM}[v{i}]")
    fc.append(f"[0:a]atrim={a:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},{out_fade}[a{i}]")
fc.append("".join(f"[v{i}][a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[vc][ac];"
          f"[vc]setpts=PTS/{SPEED}[v];[ac]atempo={SPEED},loudnorm=I=-16:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC), "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]",
                "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-ar", "48000", "-b:a", "256k", str(EP / "mid.mp4")], check=True)
total = (sum(b - a for a, b in parts) + TAIL) / SPEED
caps = plan["captions"]
content = {
    "source": "mid.mp4", "out": plan["out"], "out_dir": plan["out_dir"], "title": plan["title"],
    "crop": {"x": 0, "y": 0, "w": 1080, "h": 912}, "thumb": round(to_out(plan.get("thumb", parts[0][0])), 3),
    "parts": [[0, round(total - 0.02, 3)]],
    "captions": [{"from": round(to_out(c[0]), 2), "to": round(to_out(caps[i + 1][0]) if i + 1 < len(caps) else total, 2),
                  "text": c[1]} for i, c in enumerate(caps)],
}
if plan.get("profile"):
    content["profile"] = plan["profile"]
(EP / "content.json").write_text(json.dumps(content, ensure_ascii=False, indent=2))
if "thumb_raw" in plan:  # 구간 밖 장면(입 다물고 눈 뜬 순간 등)으로 썸네일만 따로
    th = dict(content, source=plan["source"], crop={"x": x, "y": y, "w": w, "h": h}, thumb=plan["thumb_raw"],
              grade=plan.get("grade", "unsharp=5:5:0.8:5:5:0"))
    (EP / "thumb.json").write_text(json.dumps(th, ensure_ascii=False, indent=2))
print(f"mid.mp4 {total:.1f}초, 자막 {len(caps)}개")
