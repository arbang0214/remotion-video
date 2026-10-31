"""템플릿 합성: 내용 파일(어디를 자를지·자막·제목) + 템플릿(templates/<이름>/template.json) → 쇼츠 영상 + 썸네일.

사용:
  python3 compose.py <템플릿 이름 또는 폴더> <내용.json>               썸네일 + 영상
  python3 compose.py <템플릿 이름 또는 폴더> <내용.json> --thumb-only  썸네일만

내용.json (경로는 내용.json 기준):
  source        원본 영상
  out           결과 파일 이름(확장자 없이)
  out_dir       결과 폴더(프로젝트 루트 기준, 생략 시 out/shorts)
  title         ["첫 줄", "둘째 줄"]  — 줄 수는 템플릿 title.lines 와 같게. [[ ]] 는 title.accent 색
  clean         {"y0", "y1", "cx"}  원본에서 박힌 글씨가 없는 세로 범위와 인물 가로 중심. 템플릿 영상 칸 비율로
                가장 크게 잘라 쓴다. 또는 "crop": {x,y,w,h} 로 직접 지정
  parts         [[시작초, 끝초], ...] 원본 시각. 이어 붙일 때 경계 0.03초 페이드
  captions      [{from, to, text}] 원본 시각. [[ ]] 는 caption.accent 색. 잘린 구간에 걸치면 그만큼 줄어든다
  thumb         썸네일 장면(원본 시각)

template.json: 템플릿 폴더의 template.json 과 SKILL.md "템플릿 설정" 참고.
"""
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SKILL = Path(__file__).resolve().parent.parent
ROOT = SKILL.parent.parent.parent
args = [a for a in sys.argv[1:] if not a.startswith("--")]
THUMB_ONLY = "--thumb-only" in sys.argv
TPL_DIR = Path(args[0]) if Path(args[0]).is_dir() else SKILL / "templates" / args[0]
TPL = json.loads((TPL_DIR / "template.json").read_text(encoding="utf-8"))
EP_PATH = Path(args[1]).resolve()
EP = json.loads(EP_PATH.read_text(encoding="utf-8"))
SRC = (EP_PATH.parent / EP["source"]).resolve()
OUT = ROOT / EP.get("out_dir", "out/shorts")

W, H = TPL["size"]
VIDEO_Y, VIDEO_H = TPL["video"]["y"], TPL["video"]["h"]
BG = TPL["background"]
MAX_LINE_W = W - 100
FADE = 0.03
WARNINGS = []


def font(path, size):
    return ImageFont.truetype(str(TPL_DIR / path), size)


def parse(text):
    """'a [[b]] c' → [('a ', False), ('b', True), (' c', False)]"""
    out, hot = [], False
    for part in text.replace("]]", "[[").split("[["):
        if part:
            out.append((part, hot))
        hot = not hot
    return out


def title_line(text, color):
    """제목 한 줄을 RGBA 로. 낱말 사이(word_gap)와 가로 누르기(squeeze)로 템플릿 글꼴 느낌에 맞춘다"""
    t = TPL["title"]
    f = font(t["font"], t["size"])
    gap, stroke = t["size"] * t.get("word_gap", 0.25), t.get("stroke", 0)
    # 띄어쓰기마다 끊은 조각: (글자들, 강조 여부). 띄어쓰기 자리는 None
    pieces = []
    for s, hot in parse(text):
        for k, w in enumerate(s.split(" ")):
            if k:
                pieces.append(None)
            if w:
                pieces.append((w, hot))
    width = sum(gap if p is None else f.getlength(p[0]) for p in pieces) + 2 * stroke
    img = Image.new("RGBA", (int(width) + 4, int(t["size"] * 1.5)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = stroke + 2
    for p in pieces:
        if p is None:
            x += gap
            continue
        d.text((x, img.height / 2), p[0], font=f, fill=t.get("accent", color) if p[1] else color, anchor="lm",
               stroke_width=stroke, stroke_fill=t.get("stroke_color", "#000000"))
        x += f.getlength(p[0])
    sq = t.get("squeeze", 1.0)
    if sq != 1.0:
        img = img.resize((round(img.width * sq), img.height), Image.LANCZOS)
    if img.width > MAX_LINE_W:
        WARNINGS.append(f"제목 줄이 너무 깁니다({img.width}px > {MAX_LINE_W}px): {text}")
    return img


def frame_layer():
    """영상 위에 얹는 틀(영상 칸은 투명)"""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, VIDEO_Y - 1], fill=BG)
    d.rectangle([0, VIDEO_Y + VIDEO_H, W, H], fill=BG)
    if len(EP["title"]) != len(TPL["title"]["lines"]):
        WARNINGS.append(f"제목 줄 수({len(EP['title'])})가 템플릿({len(TPL['title']['lines'])})과 다릅니다")
    for line, spec in zip(EP["title"], TPL["title"]["lines"]):
        im = title_line(line, spec["color"])
        img.alpha_composite(im, ((W - im.width) // 2, round(spec["y"] - im.height / 2)))
    for t in TPL.get("texts", []):
        size = t.get("size", 120)
        if "width" in t:  # 템플릿에서 잰 폭에 맞춰 글자 크기를 정한다
            while font(t["font"], size).getlength(t["text"]) > t["width"]:
                size -= 1
        color = t.get("color", "#FFFFFF")  # stroke = 같은 색으로 획 굵게
        d.text((W / 2, t["y"]), t["text"], font=font(t["font"], size), fill=color, anchor="mm",
               stroke_width=t.get("stroke", 0), stroke_fill=color)
    for m in TPL.get("images", []):  # 로고 등 고정 이미지: {file, x, y, w}
        im = Image.open(TPL_DIR / m["file"]).convert("RGBA")
        im = im.resize((m["w"], round(im.height * m["w"] / im.width)), Image.LANCZOS)
        img.alpha_composite(im, (m["x"], m["y"]))
    return img


def caption_layer(text):
    """자막 한 줄: 글자 + 퍼진 그림자 + 얇은 외곽선. [[ ]] 는 강조색"""
    c = TPL["caption"]
    f = font(c["font"], c["size"])
    runs = parse(text)
    width = sum(f.getlength(t) for t, _ in runs)
    if width > MAX_LINE_W:
        WARNINGS.append(f"자막이 너무 깁니다({width:.0f}px > {MAX_LINE_W}px): {text}")
    x0 = (W - width) / 2
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if c.get("shadow_blur"):
        ImageDraw.Draw(img).text((x0, c["y"]), text.replace("[[", "").replace("]]", ""), font=f, fill=(0, 0, 0, 200),
                                 anchor="lm", stroke_width=6, stroke_fill=(0, 0, 0, 200))
        img = img.filter(ImageFilter.GaussianBlur(c["shadow_blur"]))
    d = ImageDraw.Draw(img)
    x = x0
    for t, hot in runs:
        d.text((x, c["y"]), t, font=f, fill=c["accent"] if hot else c["color"], anchor="lm",
               stroke_width=c.get("stroke", 0), stroke_fill="#000000")
        x += f.getlength(t)
    return img


def crop_box():
    if "crop" in EP:
        return EP["crop"]
    cl = EP["clean"]
    h = cl["y1"] - cl["y0"]
    w = round(h * W / VIDEO_H / 2) * 2
    return {"x": round(cl["cx"] - w / 2), "y": cl["y0"], "w": w, "h": h}


def video_filter():
    c = crop_box()
    return f"crop={c['w']}:{c['h']}:{c['x']}:{c['y']},scale={W}:{VIDEO_H}:flags=lanczos,setsar=1"


def to_out(t):
    """원본 시각 → 쇼츠 시각. 잘려 나간 곳이면 다음 구간 시작으로"""
    acc = 0.0
    for a, b in EP["parts"]:
        if t < a:
            return acc
        if t <= b:
            return acc + t - a
        acc += b - a
    return acc


def build_thumbnail(tmp):
    cap = tmp / "thumb_frame.png"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(EP["thumb"]), "-i", str(SRC), "-frames:v", "1",
                    "-vf", video_filter(), str(cap)], check=True)
    cover = Image.new("RGBA", (W, H), BG)
    cover.paste(Image.open(cap).convert("RGBA"), (0, VIDEO_Y))
    cover.alpha_composite(frame_layer())
    path = OUT / f"{EP['out']}_썸네일.png"
    cover.convert("RGB").save(path)
    print("썸네일:", path)


def build_video(tmp):
    frame_layer().save(tmp / "frame.png")
    inputs = ["-i", str(SRC), "-i", str(tmp / "frame.png")]
    graph, cat = [], ""
    for i, (a, b) in enumerate(EP["parts"]):
        d = b - a
        graph.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
        graph.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},afade=t=out:st={d - FADE}:d={FADE}[a{i}]")
        cat += f"[v{i}][a{i}]"
    graph.append(f"{cat}concat=n={len(EP['parts'])}:v=1:a=1[vc][ac]")
    graph.append(f"[vc]{video_filter()}[vs]")
    graph.append(f"color=c={BG}:s={W}x{H}:r=30[bg]")
    graph.append(f"[bg][vs]overlay=0:{VIDEO_Y}:shortest=1[b0]")
    graph.append("[b0][1:v]overlay=0:0[b1]")
    last = "b1"
    for i, c in enumerate(EP["captions"]):
        p = tmp / f"cap_{i:02d}.png"
        caption_layer(c["text"]).save(p)
        inputs += ["-i", str(p)]
        a, b = to_out(c["from"]), to_out(c["to"])
        if b - a < 0.5:
            WARNINGS.append(f"자막이 너무 짧게 보입니다({b - a:.2f}초): {c['text']}")
        graph.append(f"[{last}][{i + 2}:v]overlay=0:0:enable='between(t,{a:.3f},{b - 0.001:.3f})'[c{i}]")
        last = f"c{i}"
    path = OUT / f"{EP['out']}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(graph),
                    "-map", f"[{last}]", "-map", "[ac]",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-r", "30",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(path)], check=True)
    print(f"영상: {path} ({sum(b - a for a, b in EP['parts']):.1f}초)")


def main():
    tmp = OUT / "layers" / EP["out"]
    tmp.mkdir(parents=True, exist_ok=True)
    print("템플릿:", TPL["name"], "| 원본 crop:", crop_box())
    build_thumbnail(tmp)
    if not THUMB_ONLY:
        build_video(tmp)
    for w in dict.fromkeys(WARNINGS):
        print("[경고]", w)


main()
