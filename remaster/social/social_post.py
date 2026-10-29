#!/usr/bin/env python3
"""쇼츠(릴스)·사진(한 장 또는 캐러셀)을 인스타그램 + 스레드에 올린다 (klee_castle).

  social_post.py check            토큰 두 개가 살아 있는지, 남은 게시 한도 확인
  social_post.py dryrun <ID>      인스타·스레드 컨테이너만 만들고 처리까지 확인 (게시하지 않음)
  social_post.py post <ID>        schedule.tsv 의 그 줄을 지금 바로 올림 (인스타 → 스레드 순서)
  social_post.py due              오늘 날짜이고 아직 안 올린 줄을 올림 (매일 20:00 실행)
                                  오늘 줄이 없으면 날짜가 지났는데 못 올린 줄 중 가장 앞 하나를 올림 (하루 최대 한 편)
  social_post.py refresh          토큰 두 개를 새로 연장 (60일짜리, nightly 가 주 1회 실행)
  social_post.py prep <출력폴더> <사진...>
                                  사진을 1080×1350(4:5) JPEG 로 맞춰(남는 곳은 흰 여백) 01.jpg, 02.jpg … 로 저장

schedule.tsv  : ID \t 날짜(YYYY-MM-DD) \t 영상 파일 또는 사진 폴더 \t 유튜브 주소(사진이면 -) [\t 릴스 표지 이미지]
                다섯째 칸(선택)을 주면 인스타 릴스 표지로 쓴다 (스레드는 표지 지정 불가)
                사진 폴더는 안의 .jpg 를 이름순으로 올린다 (1장이면 단일 사진, 2~10장이면 캐러셀).
                인스타 캐러셀은 모든 장을 첫 장 비율로 자르므로 prep 으로 4:5 를 맞춘 폴더를 쓴다.
captions.json : {ID: {"ig": 인스타 본문, "threads": 스레드 본문}}
posted.tsv    : ID \t 인스타/스레드 \t 게시물 주소 \t 올린 시각   (한 번 올린 건 다시 안 올림)

인스타(인스타 로그인 방식)·스레드 API 둘 다 파일을 직접 받지 않고 공개 주소만 받는다.
그래서 올리는 동안만 이 Mac 에서 올릴 파일들을 cloudflared 임시 터널(trycloudflare.com)로 열고,
게시가 끝나면 바로 닫는다. 주소에는 무작위 이름을 붙이고, 올릴 파일만 든 임시 폴더만 연다.
결과는 슬랙(../slack_webhook.url)에 올린다.
"""
import contextlib
import datetime as dt
import functools
import http.server
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
IG_TOKEN = os.path.join(HERE, "ig_token.txt")
TH_TOKEN = os.path.join(HERE, "threads_token.txt")
SCHEDULE = os.path.join(HERE, "schedule.tsv")
CAPTIONS = os.path.join(HERE, "captions.json")
POSTED = os.path.join(HERE, "posted.tsv")
WEBHOOK = next((p for p in (os.path.join(HERE, "slack_webhook.url"), os.path.join(HERE, "..", "slack_webhook.url"))
                if os.path.exists(p)), os.path.join(HERE, "..", "slack_webhook.url"))
IG = "https://graph.instagram.com/v21.0"
TH = "https://graph.threads.net/v1.0"


def token(path):
    with open(path) as f:
        return f.read().strip()


def call(method, url, params=None, data=None, headers=None):
    params = dict(params or {})
    if method == "GET":
        url += "?" + urllib.parse.urlencode(params)
        body = None
    else:
        body = data if data is not None else urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{e.code} {e.read().decode(errors='replace')[:400]}") from None


def wait_finished(base, cid, tok, label):
    for _ in range(60):  # 최대 10분
        s = call("GET", f"{base}/{cid}", {"fields": "status_code,status" if base == IG else "status,error_message",
                                          "access_token": tok})
        code = s.get("status_code") or s.get("status")
        if code == "FINISHED":
            return
        if code in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"{label} 처리 실패: {s}")
        time.sleep(10)
    raise RuntimeError(f"{label} 처리가 10분 안에 안 끝남")


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@contextlib.contextmanager
def public_urls(paths):
    """파일들을 임시 공개 주소로 열고 주소 목록을 준다. with 블록이 끝나면 서버·터널·임시 폴더를 모두 정리한다."""
    tmp = tempfile.mkdtemp(prefix="shorts_")
    names = []
    for path in paths:
        names.append(secrets.token_hex(12) + os.path.splitext(path)[1].lower())
        os.symlink(os.path.abspath(path), os.path.join(tmp, names[-1]))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(_Quiet, directory=tmp))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    cf = shutil.which("cloudflared") or next(
        (p for p in ("/opt/homebrew/bin/cloudflared", os.path.expanduser("~/bin/cloudflared")) if os.path.exists(p)),
        "cloudflared")  # 맥미니는 ~/bin (cron 은 PATH 가 짧음)
    tun = subprocess.Popen([cf, "tunnel", "--no-autoupdate", "--url", f"http://127.0.0.1:{srv.server_port}"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    try:
        base, ready = None, False
        deadline = time.time() + 90
        while time.time() < deadline and not (base and ready):  # 주소가 나오고, 터널 연결이 등록될 때까지
            line = tun.stderr.readline() or ""
            m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", line)
            base = base or (m and m.group(0))
            ready = ready or "Registered tunnel connection" in line
        if not (base and ready):
            raise RuntimeError(f"cloudflared 터널이 90초 안에 준비되지 않음 (주소: {base})")
        threading.Thread(target=lambda: [None for _ in tun.stderr], daemon=True).start()  # 남은 로그는 버림
        urls = [f"{base}/{n}" for n in names]
        # 새 주소는 DNS 에 퍼지는 데 시간이 걸린다. 너무 일찍 물어보면 '없는 주소'가 캐시돼 계속 실패하므로 잠깐 기다린다.
        time.sleep(15)
        err = None
        for _ in range(30):  # 최대 약 3분 (첫 파일로 터널이 열렸는지만 본다)
            try:
                req = urllib.request.Request(urls[0], method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    if r.status == 200:
                        break
                    err = f"HTTP {r.status}"
            except Exception as e:
                err = repr(e)
            time.sleep(5)
        else:
            raise RuntimeError(f"임시 주소가 열리지 않음 ({base}, 마지막 오류: {err})")
        yield urls
    finally:
        tun.terminate()
        srv.shutdown()
        shutil.rmtree(tmp, ignore_errors=True)


def is_video(url):
    return url.endswith(".mp4") or url.endswith(".mov")


def ig_container(urls, caption, tok, cover=None):
    """릴스·사진·캐러셀 컨테이너를 만들고 인스타가 파일을 가져가 처리할 때까지 기다린다."""
    if len(urls) == 1 and is_video(urls[0]):
        p = {"media_type": "REELS", "video_url": urls[0], "share_to_feed": "true"}
        if cover:
            p["cover_url"] = cover
    elif len(urls) == 1:
        p = {"image_url": urls[0]}
    else:
        kids = []
        for i, u in enumerate(urls, 1):
            k = call("POST", f"{IG}/me/media", {"image_url": u, "is_carousel_item": "true", "access_token": tok})
            wait_finished(IG, k["id"], tok, f"인스타 {i}번째 사진")
            kids.append(k["id"])
        p = {"media_type": "CAROUSEL", "children": ",".join(kids)}
    c = call("POST", f"{IG}/me/media", {**p, "caption": caption, "access_token": tok})
    wait_finished(IG, c["id"], tok, "인스타")
    return c["id"]


def post_ig(urls, caption, cover=None):
    tok = token(IG_TOKEN)
    cid = ig_container(urls, caption, tok, cover)
    mid = call("POST", f"{IG}/me/media_publish", {"creation_id": cid, "access_token": tok})["id"]
    return call("GET", f"{IG}/{mid}", {"fields": "permalink", "access_token": tok})["permalink"]


def th_container(urls, text, tok):
    def item(u):
        return {"media_type": "VIDEO", "video_url": u} if is_video(u) else {"media_type": "IMAGE", "image_url": u}

    if len(urls) == 1:
        p = item(urls[0])
    else:
        kids = []
        for i, u in enumerate(urls, 1):
            k = call("POST", f"{TH}/me/threads", {**item(u), "is_carousel_item": "true", "access_token": tok})
            wait_finished(TH, k["id"], tok, f"스레드 {i}번째 사진")
            kids.append(k["id"])
        p = {"media_type": "CAROUSEL", "children": ",".join(kids)}
    c = call("POST", f"{TH}/me/threads", {**p, "text": text, "access_token": tok})
    wait_finished(TH, c["id"], tok, "스레드")
    return c["id"]


def post_threads(urls, text):
    tok = token(TH_TOKEN)
    cid = th_container(urls, text, tok)
    pid = call("POST", f"{TH}/me/threads_publish", {"creation_id": cid, "access_token": tok})["id"]
    return call("GET", f"{TH}/{pid}", {"fields": "permalink", "access_token": tok})["permalink"]


def media_files(row):
    """schedule.tsv 한 줄의 셋째 칸 → 올릴 파일 목록. 폴더면 안의 .jpg 를 이름순으로."""
    path = os.path.expanduser(row[2])
    if not os.path.isdir(path):
        return [path]
    files = sorted(os.path.join(path, f) for f in os.listdir(path) if f.lower().endswith((".jpg", ".jpeg")))
    if not 1 <= len(files) <= 10:
        raise SystemExit(f"{path}: 사진은 1~10장이어야 함 (지금 {len(files)}장)")
    return files


def cover_file(row):
    """다섯째 칸의 릴스 표지 이미지 (없으면 None)"""
    return os.path.expanduser(row[4]) if len(row) > 4 and row[4].strip() not in ("", "-") else None


def check_caption(vid, cap):
    for key, limit in (("ig", 2200), ("threads", 500)):
        if len(cap[key]) > limit:
            raise SystemExit(f"{vid} {key} 본문이 {len(cap[key])}자 — {limit}자 이하여야 함")


def prep(out_dir, srcs):
    """사진을 인스타 캐러셀용 1080×1350(4:5) JPEG 로 맞춘다. 자르지 않고 흰 여백을 붙이며, 위치 등 메타데이터는 버린다."""
    from PIL import Image, ImageOps

    os.makedirs(out_dir, exist_ok=True)
    W, H = 1080, 1350
    for i, src in enumerate(srcs, 1):
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        s = min(W / im.width, H / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        canvas = Image.new("RGB", (W, H), "white")
        canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
        dst = os.path.join(out_dir, f"{i:02d}.jpg")
        canvas.save(dst, "JPEG", quality=92)
        print(f"{dst}  ← {os.path.basename(src)}")


def rows():
    with open(SCHEDULE, encoding="utf-8") as f:
        return [l.rstrip("\n").split("\t") for l in f if l.strip() and not l.startswith("#")]


def posted():
    if not os.path.exists(POSTED):
        return {}
    with open(POSTED, encoding="utf-8") as f:
        return {(p[0], p[1]): p[2] for p in (l.rstrip("\n").split("\t") for l in f if l.strip())}


def record(vid, where, url):
    with open(POSTED, "a", encoding="utf-8") as f:
        f.write(f"{vid}\t{where}\t{url}\t{dt.datetime.now():%Y-%m-%d %H:%M}\n")


def slack(text):
    try:
        with open(WEBHOOK) as f:
            hook = f.read().strip()
        req = urllib.request.Request(hook, data=json.dumps({"text": text}).encode(),
                                     headers={"Content-type": "application/json"})
        urllib.request.urlopen(req, timeout=20)
    except Exception as e:
        print("슬랙 알림 실패:", e)


def post(vid):
    row = next((r for r in rows() if r[0] == vid), None)
    if not row:
        raise SystemExit(f"schedule.tsv 에 {vid} 없음")
    files, cover = media_files(row), cover_file(row)
    cap = json.load(open(CAPTIONS, encoding="utf-8"))[vid]
    check_caption(vid, cap)
    done = posted()
    lines = []
    try:
        with public_urls(files + ([cover] if cover else [])) as urls:
            cover_url = urls.pop() if cover else None
            if (vid, "instagram") in done:
                lines.append(f"인스타 이미 올림 {done[(vid, 'instagram')]}")
            else:
                ig_url = post_ig(urls, cap["ig"], cover_url)
                record(vid, "instagram", ig_url)
                lines.append(f"인스타 {ig_url}")
            if (vid, "threads") in done:
                lines.append(f"스레드 이미 올림 {done[(vid, 'threads')]}")
            else:
                th_url = post_threads(urls, cap["threads"])
                record(vid, "threads", th_url)
                lines.append(f"스레드 {th_url}")
        msg = f":white_check_mark: {vid} 게시 완료\n" + "\n".join(lines)
    except Exception as e:
        msg = f":x: {vid} 게시 실패: {e}\n" + "\n".join(lines) + \
              f"\n다시 하려면: python3 {os.path.abspath(__file__)} post {vid}"
    print(msg)
    slack(msg)


def check():
    for name, base, path, fields, limit in (
            ("인스타", IG, IG_TOKEN, "username,account_type", "content_publishing_limit"),
            ("스레드", TH, TH_TOKEN, "username", "threads_publishing_limit")):
        tok = token(path)
        me = call("GET", f"{base}/me", {"fields": fields, "access_token": tok})
        q = call("GET", f"{base}/me/{limit}", {"fields": "quota_usage,config", "access_token": tok})["data"][0]
        print(f"{name}: {me.get('username')} 오늘 {q['quota_usage']}/{q['config']['quota_total']}건 사용")


def refresh():
    for path, url, grant in ((IG_TOKEN, "https://graph.instagram.com/refresh_access_token", "ig_refresh_token"),
                             (TH_TOKEN, f"{TH}/refresh_access_token", "th_refresh_token")):
        r = call("GET", url, {"grant_type": grant, "access_token": token(path)})
        fd = os.open(path + ".new", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(r["access_token"])
        os.replace(path + ".new", path)
        print(os.path.basename(path), "연장됨,", r.get("expires_in", 0) // 86400, "일 남음")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "check":
        check()
    elif cmd == "refresh":
        refresh()
    elif cmd == "dryrun" and len(sys.argv) == 3:
        row = next(r for r in rows() if r[0] == sys.argv[2])
        cap = json.load(open(CAPTIONS, encoding="utf-8"))[sys.argv[2]]
        check_caption(sys.argv[2], cap)
        cover = cover_file(row)
        with public_urls(media_files(row) + ([cover] if cover else [])) as urls:
            cover_url = urls.pop() if cover else None
            print(f"임시 주소 열림 ({len(urls)}개{', 표지 포함' if cover else ''})")
            print("인스타 처리 완료 (게시 안 함):", ig_container(urls, cap["ig"], token(IG_TOKEN), cover_url))
            print("스레드 처리 완료 (게시 안 함):", th_container(urls, cap["threads"], token(TH_TOKEN)))
    elif cmd == "prep" and len(sys.argv) >= 4:
        prep(os.path.expanduser(sys.argv[2]), sys.argv[3:])
    elif cmd == "post" and len(sys.argv) == 3:
        post(sys.argv[2])
    elif cmd == "due":
        today = dt.date.today().isoformat()
        done = posted()
        todo = [r for r in rows() if re.fullmatch(r"\d{4}-\d\d-\d\d", r[1]) and r[1] <= today
                and not ((r[0], "instagram") in done and (r[0], "threads") in done)]
        due = [r for r in todo if r[1] == today] or sorted(todo, key=lambda r: r[1])[:1]  # 빠진 날은 하루 한 편씩 보충
        for r in due:
            post(r[0])
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
