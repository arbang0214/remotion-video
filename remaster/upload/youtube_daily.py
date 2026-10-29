"""쇼츠 리마스터 하루 한 편 업로드 + 같은 편 원본 비공개.

사용 (이 폴더에서):
  python3 youtube_daily.py auth                 처음 한 번: 유튜브 계정 로그인 → token.json
  python3 youtube_daily.py originals            채널에 올라가 있는 영상 목록 → originals.csv (원본 ID 찾기용)
  python3 youtube_daily.py set-original N ID    N편 원본의 영상 ID(또는 링크) 등록. 비워 두면 그 편 원본은 손대지 않음(수동 처리)
  python3 youtube_daily.py status               몇 편까지 올렸는지
  python3 youtube_daily.py next [--dry-run]     아직 안 올린 가장 앞 편을 공개로 업로드 → 썸네일 → 원본 비공개

준비물: 같은 폴더에 client_secret.json (Google Cloud 콘솔 → OAuth 클라이언트 ID, 데스크톱 앱)
기록: state.json (올린 편·영상 ID), upload.log
"""
import json
import re
import sys
from datetime import datetime
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
        done = f"올림 {s['uploaded_at']} https://youtube.com/shorts/{s['video_id']}" if s else "대기"
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
    elif cmd == "next":
        cmd_next(dry_run="--dry-run" in rest)
    else:
        sys.exit(__doc__)


main()
