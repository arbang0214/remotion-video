"""쇼츠 리마스터: 썸네일 틀(위 제목 바 / 가운데 영상 / 아래 자막 바)로 썸네일 + 쇼츠 영상을 만든다.

사용:
  python3 build.py <episode.json>               썸네일 + 영상
  python3 build.py <episode.json> --thumb-only  썸네일만(티저 후보 비교할 때)

episode.json 의 텍스트에서 [[ ]] 로 감싼 부분이 강조색. 결과는 episode.json 옆 out/ 폴더.
"""
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

EP_PATH = Path(sys.argv[1]).resolve()
THUMB_ONLY = "--thumb-only" in sys.argv
EP = json.loads(EP_PATH.read_text(encoding="utf-8"))
SRC = (EP_PATH.parent / EP["source"]).resolve()
OUT = EP_PATH.parent / "out"
FONTS = Path(__file__).resolve().parent.parent / "fonts"

# ── 규격 (사용자 시안 확정값 — 임의로 바꾸지 말 것) ──
W, H = 1080, 1920
TOP_H, VIDEO_H = 480, 1000              # 위 제목 바 / 가운데 영상, 아래 자막 바 = 나머지 440
BOTTOM_Y = TOP_H + VIDEO_H
BAR, WHITE, META_GRAY = "#0A0A0A", "#FFFFFF", "#9A9A9A"
FONT_TITLE = FONTS / "Cafe24Ssurround.ttf"   # 제목 2줄 전용
FONT_NAME = FONTS / "Pretendard-Black.ttf"   # 이름 줄, 자막, 티저 대사
FONT_META = FONTS / "Pretendard-Bold.ttf"    # 자격 줄, 제목 폴백
SIZE_TITLE, SIZE_NAME, SIZE_META = 100, 46, 32
NAME = "이강준 · 카박준쌤"
META = "KAIST 박사 · 대치동캐슬 초등수학"
TITLE_Y = (290, 410)                    # 제목 두 줄 세로 중심
PROFILE_Y = (BOTTOM_Y + 72, BOTTOM_Y + 132)  # 프로필 두 줄 세로 중심. 영상에서는 자막이 없는 구간에만 보인다
MAX_LINE_W = W - 120                    # 한 줄 최대 폭(양옆 여백 60)

# 강조색 로테이션: N번째 게시물 = ROTATION[(N-1) % 6]. 순서를 바꾸지 말 것
ROTATION = [("머스타드", "#E0A526"), ("아이스블루", "#8FD3F4"), ("테라코타", "#D9825B"),
            ("민트", "#9BD8B0"), ("코랄", "#F28B82"), ("라임", "#C5E063")]

# 자막(아래 바) / 티저 대사(썸네일 영상 영역 안)
SIZE_CAP, CAP_LINE_GAP, CAP_TOP = 58, 78, BOTTOM_Y + 70
TEASER_SIZE, TEASER_STROKE = 76, 6

# 배지(선택): episode.json 에 "badge" 가 있을 때만. 실시간 수업 시리즈(9번째 편~)의 "● 실제 수업 영상" 표시.
# 제목 위 가운데 진회색 알약 + 빨간 점. 썸네일·영상 모두에 들어간다
BADGE_CY, BADGE_H, BADGE_PADX, BADGE_SIZE = 170, 64, 28, 40
BADGE_FILL, BADGE_DOT, BADGE_DOT_D, BADGE_DOT_GAP = "#2A2A2A", "#E5484D", 18, 12

# 썸네일 선생님 화면(선택): teaser 항목에 "pip" 가 있을 때만. 영상 칸 오른쪽 위, 흰 테두리.
# 실시간 수업 시리즈에서 썸네일 장면에 선생님이 안 나올 때 쓴다(영상 속 작은 화면 440px 보다 조금 크게)
PIP_W, PIP_BORDER, PIP_MARGIN = 520, 4, 16

ACCENT_NAME, ACCENT = ROTATION[(EP["post_no"] - 1) % len(ROTATION)]
WARNINGS = []


def font(path, size):
    return ImageFont.truetype(str(path), size)


def has_glyph(f, ch):
    return ch.isspace() or f.getmask(ch).getbbox() is not None


def parse(text):
    """'a [[b]] c' → [('a ', False), ('b', True), (' c', False)]"""
    out, hot = [], False
    for part in text.replace("]]", "[[").split("[["):
        if part:
            out.append((part, hot))
        hot = not hot
    return out


def draw_rich_line(d, cy, line, f, fallback=None, base=WHITE, stroke=0):
    """가운데 정렬 한 줄. [[ ]] 부분은 강조색. fallback 이 있으면 f 에 없는 글자만 fallback 으로. stroke = 검정 외곽선 두께"""
    runs = []
    for text, hot in parse(line):
        for ch in text:
            runs.append((ch, f if fallback is None or has_glyph(f, ch) else fallback, ACCENT if hot else base))
    width = sum(ff.getlength(ch) for ch, ff, _ in runs)
    if width > MAX_LINE_W:
        WARNINGS.append(f"한 줄이 너무 깁니다({width:.0f}px > {MAX_LINE_W}px): {line}")
    x = (W - width) / 2
    for ch, ff, color in runs:
        d.text((x, cy), ch, font=ff, fill=color, anchor="lm", stroke_width=stroke, stroke_fill="#000000")
        x += ff.getlength(ch)


def draw_badge(d, text):
    f = font(FONT_NAME, BADGE_SIZE)
    w = BADGE_DOT_D + BADGE_DOT_GAP + f.getlength(text) + 2 * BADGE_PADX
    x0, y0 = (W - w) / 2, BADGE_CY - BADGE_H / 2
    d.rounded_rectangle([x0, y0, x0 + w, y0 + BADGE_H], radius=BADGE_H / 2, fill=BADGE_FILL)
    x = x0 + BADGE_PADX
    d.ellipse([x, BADGE_CY - BADGE_DOT_D / 2, x + BADGE_DOT_D, BADGE_CY + BADGE_DOT_D / 2], fill=BADGE_DOT)
    d.text((x + BADGE_DOT_D + BADGE_DOT_GAP, BADGE_CY), text, font=f, fill=WHITE, anchor="lm")


def frame_layer(profile=True):
    """영상 위에 얹는 틀(가운데는 투명)"""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, TOP_H - 1], fill=BAR)
    d.rectangle([0, BOTTOM_Y, W, H], fill=BAR)
    tf, tfb = font(FONT_TITLE, SIZE_TITLE), font(FONT_META, SIZE_TITLE)
    for cy, line in zip(TITLE_Y, EP["title"]):
        draw_rich_line(d, cy, line, tf, fallback=tfb)
    if EP.get("badge"):
        draw_badge(d, EP["badge"])
    if profile:
        draw_rich_line(d, PROFILE_Y[0], NAME, font(FONT_NAME, SIZE_NAME))
        draw_rich_line(d, PROFILE_Y[1], META, font(FONT_META, SIZE_META), base=META_GRAY)
    return img


def caption_layer(text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = font(FONT_NAME, SIZE_CAP)
    for i, line in enumerate(text.split("\n")):
        draw_rich_line(d, CAP_TOP + i * CAP_LINE_GAP, line, f)
    return img


def video_filter():
    c = EP["crop"]
    return f"crop={c['w']}:{c['h']}:{c['x']}:{c['y']},scale={W}:{VIDEO_H}:flags=lanczos"


def grab(t, path):
    # 썸네일 프레임은 반드시 이 방식(-ss 를 -i 앞에)으로 뽑는다. fps 필터 격자와는 프레임이 어긋날 수 있다
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(SRC), "-frames:v", "1", "-vf", video_filter(), str(path)], check=True)


def paste_pip(cover, pip, path):
    """pip = {"source": 원본 경로(episode.json 기준), "time": 초, "crop": {x,y,w,h}, "w": 폭(생략 시 PIP_W)}"""
    c = pip["crop"]
    w = pip.get("w", PIP_W)
    h = round(w * c["h"] / c["w"])
    src = (EP_PATH.parent / pip["source"]).resolve()
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(pip["time"]), "-i", str(src), "-frames:v", "1",
                    "-vf", f"crop={c['w']}:{c['h']}:{c['x']}:{c['y']},scale={w}:{h}:flags=lanczos", str(path)], check=True)
    x, y = W - PIP_MARGIN - w, TOP_H + PIP_MARGIN
    ImageDraw.Draw(cover).rectangle([x - PIP_BORDER, y - PIP_BORDER, x + w + PIP_BORDER - 1, y + h + PIP_BORDER - 1], fill=WHITE)
    cover.paste(Image.open(path), (x, y))


def build_thumbnails(tmp):
    """티저형 썸네일: 하이라이트 순간 캡처 + 그 순간의 대사 한 줄을 영상 영역 아래쪽에. 후보가 여럿이면 teaser_k.png 로 모두 뽑는다"""
    layer = frame_layer(profile=True)
    teasers = EP["teaser"]
    for k, tz in enumerate(teasers):
        if "\n" in tz["text"]:
            WARNINGS.append(f"티저 대사는 한 줄로 짧게: {tz['text']!r}")
        if tz.get("still"):  # 미리 합성해 둔 영상 칸 이미지(1080×1000, episode.json 기준 경로) — time 대신
            cap = (EP_PATH.parent / tz["still"]).resolve()
        else:
            cap = tmp / f"teaser_frame_{k}.png"
            grab(tz["time"], cap)
        cover = Image.new("RGB", (W, H), BAR)
        cover.paste(Image.open(cap), (0, TOP_H))
        if tz.get("pip"):
            paste_pip(cover, tz["pip"], tmp / f"teaser_pip_{k}.png")
        cover.paste(layer, (0, 0), layer)
        d = ImageDraw.Draw(cover)
        size = tz.get("size", TEASER_SIZE)
        lines = tz["text"].split("\n")
        gap = size * 1.3
        cy0 = TOP_H + VIDEO_H * tz.get("y", 0.8) - gap * (len(lines) - 1) / 2
        for i, line in enumerate(lines):
            draw_rich_line(d, cy0 + i * gap, line, font(FONT_NAME, size), stroke=TEASER_STROKE)
        name = "thumbnail.png" if len(teasers) == 1 else f"teaser_{k}.png"
        cover.save(OUT / name)
        print("썸네일:", OUT / name)


def build_video(tmp):
    """틀 + 자막을 PNG 로 만들고 ffmpeg 로 합성. 프로필은 자막이 없는 구간에만(자막 자리와 겹치고 어차피 유튜브 UI에 가려짐)"""
    frame_layer(profile=False).save(tmp / "frame.png")
    frame_layer(profile=True).save(tmp / "frame_profile.png")
    inputs = ["-i", str(SRC), "-i", str(tmp / "frame.png"), "-i", str(tmp / "frame_profile.png")]
    any_cap = "+".join(f"between(t,{c['from']},{c['to'] - 0.001})" for c in EP["captions"]) or "0"
    graph = [f"color=c={BAR}:s={W}x{H}:r=30[bg]", f"[0:v]{video_filter()},setsar=1[v]",
             f"[bg][v]overlay=0:{TOP_H}:shortest=1[a0]", "[a0][1:v]overlay=0:0[a1]",
             f"[a1][2:v]overlay=0:0:enable='not({any_cap})'[b0]"]
    last = "b0"
    for i, c in enumerate(EP["captions"]):
        p = tmp / f"cap_{i:02d}.png"
        caption_layer(c["text"]).save(p)
        inputs += ["-i", str(p)]
        graph.append(f"[{last}][{i + 3}:v]overlay=0:0:enable='between(t,{c['from']},{c['to'] - 0.001})'[c{i}]")
        last = f"c{i}"
    out_mp4 = OUT / "short.mp4"
    cmd = ["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(graph), "-map", f"[{last}]", "-map", "0:a?",
           "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", "30",
           "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out_mp4)]
    subprocess.run(cmd, check=True)
    print("영상:", out_mp4)


def main():
    tmp = OUT / "layers"
    tmp.mkdir(parents=True, exist_ok=True)
    print(f"{EP['post_no']}번째 게시물 → 강조색 {ACCENT_NAME} {ACCENT}")
    build_thumbnails(tmp)
    if not THUMB_ONLY:
        build_video(tmp)
    for w in dict.fromkeys(WARNINGS):
        print("[경고]", w)


main()
