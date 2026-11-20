"""1캠 촬영본(Q&A 등) → 리마스터 틀용 cut.mp4 + episode.json.  (2캠은 build.py)

사용: python3 onecam_remaster.py <편 폴더>      # 폴더 안 plan.json 을 읽고 같은 폴더에 cut.mp4, episode.json, teaser_N.png
그 다음: python3 .claude/skills/shorts-remaster/scripts/build.py <편 폴더>/episode.json

plan.json (시각은 모두 원본 초):
  source   원본 영상(편 폴더 기준 경로)            crop  [x, y, w, h] 클로즈업 범위(가로:세로 = 1.08, 예 860x796)
  post_no, title[2줄], profile_small              speed 말 속도 배율(영상·소리·자막 함께, 기본 1.0)
  grade    톤 보정 ffmpeg 필터(선택)               parts [[시작, 끝], ...]
  captions [{"from": 초, "text": "..."}]          — 끝 시각은 다음 자막 시작
  teaser   [{"time": 초, "text": "...", "y": 0.8, "raw": true}]  — raw: 쓴 구간 밖 장면도 되게 원본에서 바로 뽑음
"""
import json
import subprocess
import sys
from pathlib import Path

EP = Path(sys.argv[1]).resolve()
FADE = 0.03

plan = json.loads((EP / "plan.json").read_text())
SRC = (EP / plan["source"]).resolve()
_x, _y, _w, _h = plan["crop"]
CAM = f"crop={_w}:{_h}:{_x}:{_y},scale=1080:1000:flags=lanczos,setsar=1"  # 클로즈업만(1캠 촬영본)
SPEED = plan.get("speed", 1.0)  # 말 속도 배율(영상·소리·자막 함께)
if plan.get("grade"):  # 톤 보정(ffmpeg 필터)
    CAM += "," + plan["grade"]
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


fc = []
for i, (a, b) in enumerate(parts):
    d = b - a
    fc.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,{CAM}[v{i}]")
    fc.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,"
              f"afade=t=in:d={FADE},afade=t=out:st={d - FADE:.3f}:d={FADE}[a{i}]")
fc.append("".join(f"[v{i}][a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[vc][ac];"
          f"[vc]setpts=PTS/{SPEED}[v];[ac]atempo={SPEED}[a]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC), "-filter_complex", ";".join(fc),
                "-map", "[v]", "-map", "[a]", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "10",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", str(EP / "cut_raw.mp4")], check=True)

# 카톡 화면(선택): 그 동안 영상은 흐리고 어둡게, 말풍선이 하나씩 늘어남(kakao.py 로 만든 단계별 PNG)
kk = plan.get("kakao")
if kk:
    t0, t1 = to_out(kk["from"]), to_out(kk["to"])
    starts = [to_out(b["from"]) for b in kk["bubbles"]] + [t1]
    ins, fc = [], [f"[0:v]split[base][bl];[bl]boxblur=24:2,eq=brightness=-0.12[blur];"
                   f"[base][blur]overlay=0:0:enable='between(t,{t0:.3f},{t1:.3f})'[k0]"]
    for i in range(len(kk["bubbles"])):
        ins += ["-i", str(EP / f"kakao_{i + 1}.png")]
        fc.append(f"[k{i}][{i + 1}:v]overlay=0:0:enable='between(t,{starts[i]:.3f},{starts[i + 1]:.3f})'[k{i + 1}]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(EP / "cut_raw.mp4"), *ins,
                    "-filter_complex", ";".join(fc), "-map", f"[k{len(kk['bubbles'])}]", "-map", "0:a",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p", "-c:a", "copy",
                    str(EP / "cut.mp4")], check=True)
else:
    (EP / "cut_raw.mp4").replace(EP / "cut.mp4")

total = sum(b - a for a, b in parts) / SPEED
caps = plan["captions"]
episode = {
    "post_no": plan["post_no"],
    "source": "cut.mp4",
    "title": plan["title"],
    "crop": {"x": 0, "y": 0, "w": 1080, "h": 1000},
    "captions": [{"from": round(to_out(c["from"]), 2),
                  "to": round(to_out(caps[i + 1]["from"]) if i + 1 < len(caps) else total, 2),
                  "text": c["text"]} for i, c in enumerate(caps)],
    "teaser": [],
}
if plan.get("profile_small"):
    episode["profile_small"] = True
# 썸네일 장면은 카톡 화면이 덮이기 전 영상에서 뽑아 둔다
for i, t in enumerate(plan["teaser"]):
    still = EP / f"teaser_{i}.png"
    src = EP / ("cut_raw.mp4" if kk else "cut.mp4")
    if t.get("raw"):  # raw: 쓴 구간 밖 장면도 쓸 수 있게 원본 시각에서 바로 뽑는다(입 다물고 눈 뜬 장면용)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t['time']:.3f}", "-i", str(SRC),
                        "-frames:v", "1", "-vf", CAM, str(still)], check=True)
    else:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{to_out(t['time']):.3f}", "-i", str(src),
                        "-frames:v", "1", str(still)], check=True)
    episode["teaser"].append({k: v for k, v in t.items() if k not in ("time", "raw")} | {"still": still.name})
(EP / "episode.json").write_text(json.dumps(episode, ensure_ascii=False, indent=2))
print(f"cut.mp4 {total:.1f}초, 자막 {len(caps)}개")
