"""쇼츠 리마스터 하루 한 편 업로드 + 같은 편 원본 비공개.

사용 (이 폴더에서):
  python3 youtube_daily.py auth                 처음 한 번: 유튜브 계정 로그인 → token.json
  python3 youtube_daily.py originals            채널에 올라가 있는 영상 목록 → originals.csv (원본 ID 찾기용)
  python3 youtube_daily.py set-original N ID    N편 원본의 영상 ID(또는 링크) 등록. 비워 두면 그 편 원본은 손대지 않음(수동 처리)
  python3 youtube_daily.py status               몇 편까지 올렸는지
  python3 youtube_daily.py schedule [--dry-run] 예약 공개 방식(기본, crontab 10:00·18:00·21:00): 오늘(19시 전)~사흘 뒤 20:00 칸이 비어 있으면
                                                manifest 순서대로 다음 편을 비공개로 미리 올리고 공개 시각(publishAt) 지정 → 썸네일
  python3 youtube_daily.py after                공개 뒤 처리(crontab 20:10): 예약 시각이 지난 편이 공개됐는지 확인 → 원본 비공개 → 슬랙
  python3 youtube_daily.py unschedule N         아직 공개 전인 N편 예약을 취소(유튜브에서 그 비공개 영상 삭제) — 순서를 바꿀 때
  python3 youtube_daily.py report               앞으로 7일 게시 일정(유튜브 + 인스타·스레드)을 슬랙으로 보냄(crontab 월·목 09:30)
  python3 youtube_daily.py next [--dry-run]     (예전 방식) 아직 안 올린 가장 앞 편을 지금 바로 공개 — 손으로 돌리지 말 것

준비물: 같은 폴더에 client_secret.json (Google Cloud 콘솔 → OAuth 클라이언트 ID, 데스크톱 앱)
기록: state.json (올린 편·영상 ID), upload.log
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "manifest.json"
STATE = HERE / "state.json"
TOKEN = HERE / "token.json"
SECRET = HERE / "client_secret.json"
LOG = HERE / "upload.log"
SCOPES = ["https://www.googleapis.com/auth/youtube"]  # 업로드·썸네일·원본 공개 상태 변경
KST = timezone(timedelta(hours=9))
PUBLISH_HOUR = 20          # 매일 공개 시각 (KST)
CUTOFF_HOUR = 19           # 이 시각이 지나면 오늘 칸은 건너뛰고 내일부터 예약
LOOKAHEAD_DAYS = 3         # 오늘 + 사흘 뒤까지 미리 올려 둠 (11/09 1→3: 맥미니가 주말 내내 꺼져도 일정이 안 빔)
SOCIAL = HERE.parent / "social"
WEBHOOK = SOCIAL / "slack_webhook.url"
AUTH_PORT = 8765  # VS Code Remote-SSH 가 이 포트를 PC로 자동 전달 → PC 브라우저에서 로그인


def log(msg):
    line = f"{datetime.now():%Y-%m-%d %H:%M:%S} {msg}"
    print(line)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def load(path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def youtube():
    creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES) if TOKEN.exists() else None
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN.write_text(creds.to_json())
        TOKEN.chmod(0o600)
    if not creds or not creds.valid:
        sys.exit("로그인이 필요합니다: python3 youtube_daily.py auth")
    return build("youtube", "v3", credentials=creds)


def video_id(s):
    m = re.search(r"(?:shorts/|v=|youtu\.be/)([\w-]{11})", s)
    return m.group(1) if m else s


def cmd_auth():
    if not SECRET.exists():
        sys.exit(f"client_secret.json 이 없습니다: {SECRET}")
    flow = InstalledAppFlow.from_client_secrets_file(str(SECRET), SCOPES)
    creds = flow.run_local_server(port=AUTH_PORT, open_browser=False, prompt="consent")
    TOKEN.write_text(creds.to_json())
    TOKEN.chmod(0o600)
    print("로그인 완료:", TOKEN)


def cmd_originals():
    yt = youtube()
    uploads = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    ids, token = [], None
    while True:
        r = yt.playlistItems().list(part="contentDetails", playlistId=uploads, maxResults=50, pageToken=token).execute()
        ids += [it["contentDetails"]["videoId"] for it in r["items"]]
        token = r.get("nextPageToken")
        if not token:
            break
    mine = {v["video_id"] for v in load(STATE, {}).values()}  # 리마스터로 올린 건 빼고
    rows = []
    for i in range(0, len(ids), 50):
        r = yt.videos().list(part="snippet,contentDetails,status", id=",".join(ids[i:i + 50])).execute()
        for v in r["items"]:
            if v["id"] in mine:
                continue
            rows.append((v["snippet"]["publishedAt"], v["id"], v["status"]["privacyStatus"], v["contentDetails"]["duration"], v["snippet"]["title"]))
    rows.sort()
    out = HERE / "originals.csv"
    with open(out, "w", encoding="utf-8-sig") as f:
        f.write("순서,올린 날,영상 ID,공개 상태,길이,제목,링크\n")
        for k, (at, vid, priv, dur, title) in enumerate(rows, 1):
            f.write(f'{k},{at[:10]},{vid},{priv},{dur},"{title}",https://youtube.com/shorts/{vid}\n')
    print(f"{len(rows)}편 → {out}")


def cmd_set_original(n, ident):
    items = load(MANIFEST, [])
    ep = next(e for e in items if e["post_no"] == int(n))
    ep["original_id"] = video_id(ident) if ident else None
    save(MANIFEST, items)
    print(f"{n}편 원본: {ep['original_id'] or '없음(수동 처리)'}")


def cmd_status():
    state = load(STATE, {})
    for e in load(MANIFEST, []):
        s = state.get(str(e["post_no"]))
        if s and s.get("publish_at") and not s.get("done"):
            done = f"예약 {s['publish_at'][:16].replace('T', ' ')} https://youtube.com/shorts/{s['video_id']}"
        else:
            done = f"올림 {slot_date(s)} https://youtube.com/shorts/{s['video_id']}" if s else "대기"
        orig = e.get("original_id") or "수동"
        print(f"{e['post_no']:2d} {done:60s} 원본 {orig}  {e['title']}")


def make_private(yt, vid):
    """원본 공개 상태만 비공개로. status 파트는 통째로 덮어써서 나머지 값은 지금 값 그대로 보냄"""
    cur = yt.videos().list(part="status", id=vid).execute()["items"]
    if not cur:
        return "영상을 찾지 못함"
    st = cur[0]["status"]
    if st["privacyStatus"] == "private":
        return "이미 비공개"
    body = {k: st[k] for k in ("embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids") if k in st}
    body["privacyStatus"] = "private"
    yt.videos().update(part="status", body={"id": vid, "status": body}).execute()
    return "비공개로 바꿈"


def now_kst():
    return datetime.now(KST)


def slack(text):
    try:
        url = WEBHOOK.read_text().strip()
        req = urllib.request.Request(url, data=json.dumps({"text": text}).encode(), headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=20).read()
    except Exception as e:  # 슬랙이 안 돼도 업로드는 계속
        log(f"  슬랙 보내기 실패: {e}")


def slot_date(s):
    """state 한 줄이 차지한 게시 날짜 (예전 방식은 올린 날 = 공개한 날)"""
    return s.get("publish_date") or (s.get("uploaded_at") or "")[:10]


def first_open_day(now):
    d = now.date()
    return d if now.hour < CUTOFF_HOUR else d + timedelta(days=1)


def upload_ep(yt, ep, publish_at=None):
    """업로드 + 썸네일. publish_at(ISO 8601)이 있으면 비공개 + 예약 공개"""
    status = {"privacyStatus": ep.get("privacy_status") or "public"}
    if publish_at:
        status = {"privacyStatus": "private", "publishAt": publish_at}
    if ep.get("made_for_kids") is not None:
        status["selfDeclaredMadeForKids"] = ep["made_for_kids"]
    snippet = {"title": ep["title"], "description": ep.get("description") or "", "tags": ep.get("tags") or []}
    if ep.get("category_id"):
        snippet["categoryId"] = ep["category_id"]
    req = yt.videos().insert(part="snippet,status", body={"snippet": snippet, "status": status},
                             media_body=MediaFileUpload(str(HERE / ep["video"]), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    return resp


def set_thumb(yt, state, n, ep):
    """썸네일 설정. 업로드 직후엔 403(forbidden)이 날 때가 있어 실패하면 표시만 해 두고 다음 실행 때 다시 시도"""
    s = state[str(n)]
    try:
        yt.thumbnails().set(videoId=s["video_id"], media_body=MediaFileUpload(str(HERE / ep["thumbnail"]))).execute()
        s.pop("thumb_pending", None)
        log(f"  {n}편 썸네일 설정")
    except Exception as e:
        s["thumb_pending"] = True
        log(f"  {n}편 썸네일 실패(다음 실행 때 다시 시도): {str(e)[:120]}")
    save(STATE, state)


def retry_thumbs(yt, state, items):
    for n, s in state.items():
        if s.get("thumb_pending") and str(n) in items:
            set_thumb(yt, state, n, items[str(n)])


def cmd_schedule(dry_run=False):
    items = load(MANIFEST, [])
    state = load(STATE, {})
    now = now_kst()
    taken = {slot_date(s) for s in state.values()}
    pending = [e for e in items if str(e["post_no"]) not in state]
    start = first_open_day(now)
    days = [start + timedelta(days=k) for k in range(LOOKAHEAD_DAYS + 1 - (start - now.date()).days)]
    yt = None
    if not dry_run and any(s.get("thumb_pending") for s in state.values()):
        yt = youtube()
        retry_thumbs(yt, state, {str(e["post_no"]): e for e in items})
    for d in days:
        if d.isoformat() in taken:
            continue
        if not pending:
            log(f"{d} 칸이 비었는데 올릴 편이 없음 — manifest 에 새 편을 넣어야 함")
            if not dry_run:
                slack(f":warning: 쇼츠 {d:%m/%d} 20:00 에 올릴 편이 없습니다. manifest.json 에 다음 편을 넣어 주세요.")
            return
        ep = pending.pop(0)
        n = ep["post_no"]
        at = datetime(d.year, d.month, d.day, PUBLISH_HOUR, tzinfo=KST)
        if dry_run:
            print(f"[dry-run] {n}편 → {at:%m/%d %H:%M} 공개 예약: {ep['title']}")
            continue
        yt = yt or youtube()
        resp = upload_ep(yt, ep, at.isoformat())
        vid = resp["id"]
        state[str(n)] = {"video_id": vid, "uploaded_at": f"{datetime.now():%Y-%m-%d %H:%M}",
                         "publish_at": at.isoformat(), "publish_date": d.isoformat()}
        save(STATE, state)  # 올리자마자 기록 — 뒤 단계가 실패해도 같은 편을 또 올리지 않게
        st = resp["status"]
        log(f"{n}편 예약 업로드: https://youtube.com/shorts/{vid} ({st['privacyStatus']}, 공개 {st.get('publishAt', '없음')}) {ep['title']}")
        if not st.get("publishAt"):
            log("  [주의] 예약 시각이 안 걸림 — 스튜디오에서 직접 예약할 것")
            slack(f":warning: 쇼츠 {n}편 예약 시각이 안 걸렸습니다. 스튜디오에서 확인해 주세요: https://studio.youtube.com/video/{vid}/edit")
        set_thumb(yt, state, n, ep)
        slack(f":calendar: 쇼츠 {n}편 예약 완료 — {at:%m/%d}({'월화수목금토일'[at.weekday()]}) {at:%H:%M} 공개\n{ep['title']}\nhttps://studio.youtube.com/video/{vid}/edit")


def cmd_after():
    items = {str(e["post_no"]): e for e in load(MANIFEST, [])}
    state = load(STATE, {})
    now = now_kst()
    due = [(n, s) for n, s in state.items()
           if s.get("publish_at") and not s.get("done") and datetime.fromisoformat(s["publish_at"]) <= now]
    if not due:
        return
    yt = youtube()
    retry_thumbs(yt, state, items)
    for n, s in due:
        ep = items.get(n, {})
        cur = yt.videos().list(part="status", id=s["video_id"]).execute()["items"]
        priv = cur[0]["status"]["privacyStatus"] if cur else "없음"
        if priv != "public":
            log(f"{n}편 예약 시각이 지났는데 {priv} — 스튜디오 확인 필요")
            slack(f":warning: 쇼츠 {n}편이 예약 시각이 지났는데 공개되지 않았습니다({priv}). https://studio.youtube.com/video/{s['video_id']}/edit")
            continue
        msg = f"{n}편 공개 확인: https://youtube.com/shorts/{s['video_id']} {ep.get('title', '')}"
        if ep.get("original_id"):
            s["original"] = make_private(yt, ep["original_id"])
            msg += f" / 원본 {ep['original_id']}: {s['original']}"
        elif ep.get("new_short"):
            s["original"] = "없음(새 쇼츠)"
        s["done"] = f"{datetime.now():%Y-%m-%d %H:%M}"
        save(STATE, state)
        log(msg)
        slack(f":white_check_mark: 쇼츠 {n}편 공개됨 — {ep.get('title', '')}\nhttps://youtube.com/shorts/{s['video_id']}")


def cmd_unschedule(n):
    state = load(STATE, {})
    s = state.get(str(n))
    if not s or not s.get("publish_at"):
        sys.exit(f"{n}편은 예약 업로드된 기록이 없습니다")
    if datetime.fromisoformat(s["publish_at"]) <= now_kst():
        sys.exit(f"{n}편은 이미 공개 시각이 지났습니다 — 취소하지 않음")
    youtube().videos().delete(id=s["video_id"]).execute()
    del state[str(n)]
    save(STATE, state)
    log(f"{n}편 예약 취소: {s['video_id']} 삭제 ({s['publish_date']} 칸 비움) — 다음 schedule 때 manifest 순서대로 다시 채움")


def cmd_report(dry_run=False):
    items = load(MANIFEST, [])
    state = load(STATE, {})
    now = now_kst()
    today = now.date()
    end = today + timedelta(days=6)
    rows = {}
    for e in items:
        s = state.get(str(e["post_no"]))
        if s and today.isoformat() <= slot_date(s) <= end.isoformat():
            mark = "예약됨" if s.get("publish_at") and not s.get("done") else "공개됨"
            rows[slot_date(s)] = (e["post_no"], e["title"], mark)
    pending = [e for e in items if str(e["post_no"]) not in state]
    taken = {slot_date(s) for s in state.values()}
    d = first_open_day(now)
    while d <= end and pending:
        if d.isoformat() not in taken:
            e = pending.pop(0)
            rows[d.isoformat()] = (e["post_no"], e["title"], "대기(공개 사흘 전 자동 예약)")
        d += timedelta(days=1)
    wd = "월화수목금토일"
    lines = [f"*게시 일정 리포트* ({today:%m/%d} ~ {end:%m/%d}) — 맥미니 기준", "", "*유튜브 쇼츠* (매일 20:00)"]
    for k in range(7):
        day = today + timedelta(days=k)
        r = rows.get(day.isoformat())
        lines.append(f"• {day:%m/%d}({wd[day.weekday()]}) " + (f"{r[0]}편 {r[1]} — {r[2]}" if r else "— 비어 있음"))
    left = len([e for e in items if str(e["post_no"]) not in state])
    last = max([slot_date(s) for s in state.values()] + [""])
    lines.append(f"남은 대기 편: {left}편" + (" — 새 편을 manifest.json 에 넣어야 합니다" if left <= 3 else ""))
    # 인스타·스레드
    posted = set()
    pt = SOCIAL / "posted.tsv"
    if pt.exists():
        posted = {l.split("\t")[0] for l in pt.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")}
    soc = []
    st = SOCIAL / "schedule.tsv"
    if st.exists():
        for l in st.read_text(encoding="utf-8").splitlines():
            c = l.split("\t")
            if len(c) < 3 or l.startswith("#") or c[0] in posted:
                continue
            if c[1] != "-" and today.isoformat() <= c[1] <= end.isoformat():
                soc.append(f"• {c[1][5:].replace('-', '/')} {c[0]} {Path(c[2]).name}")
    lines += ["", "*인스타·스레드* (매일 20:00 due)"] + (soc or ["• 예약 없음"])
    text = "\n".join(lines)
    print(text)
    if not dry_run:
        slack(text)


def cmd_next(dry_run=False):
    items = load(MANIFEST, [])
    state = load(STATE, {})
    ep = next((e for e in items if str(e["post_no"]) not in state), None)
    if not ep:
        log("모두 올렸음 — 할 일 없음")
        return
    n = ep["post_no"]
    if dry_run:
        print(f"[dry-run] {n}편 업로드 예정: {ep['title']} / 원본 {ep.get('original_id') or '수동'}")
        return
    yt = youtube()
    status = {"privacyStatus": ep.get("privacy_status") or "public"}
    if ep.get("made_for_kids") is not None:
        status["selfDeclaredMadeForKids"] = ep["made_for_kids"]
    snippet = {"title": ep["title"], "description": ep.get("description") or "", "tags": ep.get("tags") or []}
    if ep.get("category_id"):
        snippet["categoryId"] = ep["category_id"]
    req = yt.videos().insert(part="snippet,status", body={"snippet": snippet, "status": status},
                             media_body=MediaFileUpload(str(HERE / ep["video"]), chunksize=-1, resumable=True))
    resp = None
    while resp is None:
        _, resp = req.next_chunk()
    vid = resp["id"]
    # 올리자마자 기록 — 뒤 단계에서 실패해도 다음 날 같은 편을 또 올리지 않게
    state[str(n)] = {"video_id": vid, "uploaded_at": f"{datetime.now():%Y-%m-%d %H:%M}"}
    save(STATE, state)
    got = resp["status"]["privacyStatus"]
    log(f"{n}편 업로드: https://youtube.com/shorts/{vid} ({got}) {ep['title']}")
    if got != status["privacyStatus"]:
        log(f"  [주의] 요청 {status['privacyStatus']} → 실제 {got}. API 프로젝트가 감사 전이면 비공개로 잠김 — 스튜디오에서 직접 공개할 것")

    yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(str(HERE / ep["thumbnail"]))).execute()
    log(f"  썸네일 설정")

    if ep.get("original_id"):
        result = make_private(yt, ep["original_id"])
        state[str(n)]["original"] = result
        save(STATE, state)
        log(f"  원본 {ep['original_id']}: {result}")
    elif ep.get("new_short"):
        log("  원본: 없음(새 쇼츠)")
    else:
        log("  원본: 등록 안 됨 → 수동으로 비공개 처리")


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    cmd, rest = args[0], args[1:]
    if cmd == "auth":
        cmd_auth()
    elif cmd == "originals":
        cmd_originals()
    elif cmd == "set-original":
        cmd_set_original(rest[0], rest[1] if len(rest) > 1 else "")
    elif cmd == "status":
        cmd_status()
    elif cmd == "schedule":
        cmd_schedule(dry_run="--dry-run" in rest)
    elif cmd == "after":
        cmd_after()
    elif cmd == "unschedule":
        cmd_unschedule(rest[0])
    elif cmd == "report":
        cmd_report(dry_run="--dry-run" in rest)
    elif cmd == "next":
        cmd_next(dry_run="--dry-run" in rest)
    else:
        sys.exit(__doc__)


main()
