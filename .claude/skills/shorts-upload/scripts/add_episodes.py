"""새 쇼츠를 유튜브 업로드 목록(remaster/upload/manifest.json)과 인스타·스레드 일정(remaster/social)에 넣는다.

사용: python3 add_episodes.py <spec.json> [--dry-run]

spec.json:
{
  "footer": "카이스트 박사 강준쌤의 수학 공부법 — 대치동캐슬",      // 설명·본문 꼬리말 첫 줄
  "base_tags": ["대치동캐슬", "강준쌤", "카박준쌤", "수학공부법"],
  "start_date": "2026-11-22",                                       // 첫 편 공개일(인스타·스레드 일정용). 하루 한 편
  "episodes": [
    {"post_no": 29, "video": "out/shorts_1120/ep29_....mp4",        // 프로젝트 루트 기준. 썸네일은 같은 이름 + _썸네일.png
     "title_lines": ["선행의 진짜 효과는", "성적이 아니라 시간"],
     "desc": "요약 두 줄(\\n 으로 줄 바꿈)", "tags": ["수학선행", "고등수학", "내신"]}
  ]
}

하는 일: 백업(*.bak_YYMMDD) → 영상·썸네일을 upload/videos·thumbnails/epNN 으로 복사 → 릴스 표지 covers/epNN.jpg
→ manifest 끝에 추가(배열 순서 = 게시 순서) → captions.json R<번호> → schedule.tsv 한 줄씩.
유튜브 날짜는 youtube_daily.py schedule 이 빈 칸부터 manifest 순서대로 채운다(start_date 는 그와 맞춰 줄 것).
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
UP, SO = ROOT / "remaster/upload", ROOT / "remaster/social"
DRY = "--dry-run" in sys.argv
spec = json.loads(Path([a for a in sys.argv[1:] if not a.startswith("--")][0]).read_text(encoding="utf-8"))
KAKAO, LINKS = "https://open.kakao.com/o/giv5x7Ai", "https://litt.ly/klee_castle"

manifest = json.loads((UP / "manifest.json").read_text(encoding="utf-8"))
caps = json.loads((SO / "captions.json").read_text(encoding="utf-8"))
sched = (SO / "schedule.tsv").read_text(encoding="utf-8")
have = {e["post_no"] for e in manifest}
day = date.fromisoformat(spec["start_date"])
problems, plan = [], []
for i, ep in enumerate(spec["episodes"]):
    n = ep["post_no"]
    v = ROOT / ep["video"]
    t = Path(ep.get("thumbnail") or str(v)[:-4] + "_썸네일.png")
    if n in have or f"R{n}\t" in sched or f"R{n}" in caps:
        problems.append(f"{n}편은 이미 목록에 있습니다")
    for f in (v, t):
        if not Path(f).exists():
            problems.append(f"파일 없음: {f}")
    if Path(t).exists() and os.path.getsize(t) > 2_000_000:
        problems.append(f"썸네일이 2MB 를 넘습니다: {t}")
    plan.append((n, v, Path(t), ep, day + timedelta(days=i)))
if problems:
    sys.exit("[중단]\n" + "\n".join(problems))

stamp = datetime.now().strftime("%y%m%d")
if not DRY:
    for f in (UP / "manifest.json", SO / "captions.json", SO / "schedule.tsv"):
        bak = f.with_name(f.name + f".bak_{stamp}")
        if not bak.exists():
            shutil.copy(f, bak)
rows = []
for n, v, t, ep, d in plan:
    dv, dt, cv = UP / f"videos/ep{n}.mp4", UP / f"thumbnails/ep{n}.png", SO / f"covers/ep{n}.jpg"
    title, desc, tg = " ".join(ep["title_lines"]), ep["desc"], ep["tags"]
    tags = spec["base_tags"] + tg
    print(f"{n}편 {d} 20:00  {title}")
    if DRY:
        continue
    shutil.copy(v, dv)
    shutil.copy(t, dt)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(dt), "-q:v", "2", str(cv)], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(dv)]))
    hs = " ".join("#" + x for x in tg[:1] + spec["base_tags"][-1:] + spec["base_tags"][:1] + tg[1:])
    manifest.append({
        "post_no": n, "video": f"videos/ep{n}.mp4", "thumbnail": f"thumbnails/ep{n}.png", "title": title,
        "title_lines": ep["title_lines"], "duration_sec": round(dur, 1), "live_class": False,
        "video_mb": round(os.path.getsize(dv) / 1e6, 1), "thumbnail_mb": round(os.path.getsize(dt) / 1e6, 2),
        "description": f"{desc}\n\n{spec['footer']}\n📌 초등 학부모 오픈카톡방: {KAKAO}\n📌 모든 링크: {LINKS}\n\n{hs}",
        "tags": tags, "privacy_status": "public", "made_for_kids": False, "category_id": "27",
        "original_id": None, "new_short": True})
    caps[f"R{n}"] = {
        "ig": f"{title}\n\n{desc}\n\n{spec['footer']}\n📌 초등 학부모 오픈카톡방·상담은 프로필 링크에서\n\n" + " ".join("#" + x for x in tags),
        "threads": f"{title}\n\n{desc}\n\n{spec['footer']}\n📌 초등 학부모 오픈카톡방: {KAKAO}\n📌 모든 링크: {LINKS}\n\n#{tg[0]}"}
    rows.append(f"R{n}\t{d}\t{dv}\t-\t{cv}")
if DRY:
    sys.exit("[dry-run] 바꾼 것 없음")
(UP / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
(SO / "captions.json").write_text(json.dumps(caps, ensure_ascii=False, indent=1), encoding="utf-8")
(SO / "schedule.tsv").write_text(sched.rstrip("\n") + "\n" + "\n".join(rows) + "\n", encoding="utf-8")
print(f"{len(rows)}편 추가. 백업 *.bak_{stamp}")
