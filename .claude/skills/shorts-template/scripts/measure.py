"""새 템플릿 이미지를 재서 template.json 에 넣을 값을 뽑는다.

사용:
  python3 measure.py <템플릿 이미지> [저장할 폴더]

- 바깥 테두리(캡처할 때 생긴 흰 여백·둥근 모서리)를 떼고 1080×1920 으로 환산한다(9:16 이 아니면 경고).
- 왼쪽 가장자리를 따라 내려가며 단색 바(위·아래 바)와 그 사이 영상 칸을 찾는다.
- 단색 바 안의 글자 줄마다 세로 중심·높이·폭·글자색을 출력한다.
- 저장할 폴더를 주면 환산한 이미지(normalized.png)와 줄 표시 이미지(measure.png)를 남긴다.
영상 칸 위에 얹힌 자막은 배경이 영상이라 자동으로 못 찾는다 → measure.png 를 보고 직접 잰다.
"""
import sys
from collections import Counter
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

W, H = 1080, 1920
src = Image.open(sys.argv[1]).convert("RGB")
save = Path(sys.argv[2]) if len(sys.argv) > 2 else None

# 1. 바깥 테두리 떼기: 구석 색과 다른 픽셀의 범위 + 안쪽으로 몇 px(둥근 모서리·경계선)
corner = src.getpixel((0, 0))
diff = ImageChops.difference(src, Image.new("RGB", src.size, corner)).convert("L").point(lambda v: 255 if v > 24 else 0)
box = diff.getbbox() or (0, 0, *src.size)
inset = 1 if box != (0, 0, *src.size) else 0
box = (box[0] + inset, box[1] + inset, box[2] - inset, box[3] - inset)
img = src.crop(box)
ratio = img.width / img.height
print(f"원본 {src.size}, 테두리 뗀 영역 {box} → {img.size}, 비율 {ratio:.4f} (9:16 = 0.5625)")
if abs(ratio - 9 / 16) > 0.01:
    print("[경고] 9:16 이 아닙니다. 휴대폰 화면 전체 캡처라면 상태 표시줄·유튜브 버튼을 잘라 낸 이미지를 받으세요.")
img = img.resize((W, H), Image.LANCZOS)


def far(a, b, tol=40):
    return sum(abs(x - y) for x, y in zip(a, b)) > tol


# 2. 왼쪽 가장자리(x=12)에서 같은 색이 이어지는 세로 구간 = 단색 바
x0, bands, start = 12, [], 0
for y in range(1, H + 1):
    if y == H or far(img.getpixel((x0, y)), img.getpixel((x0, start)), 30):
        if y - start >= H * 0.04:
            bands.append((start, y, img.getpixel((x0, (start + y) // 2))))
        start = y
# 위·아래 끝에 붙은 것만 바로 본다(영상 칸 안의 흰 벽 같은 단색 구간은 제외)
bands = [bd for bd in bands if bd[0] < H * 0.05 or bd[1] > H * 0.95]
print("\n단색 바 (y 시작~끝, 색):")
for a, b, c in bands:
    print(f"  {a:4d} ~ {b:4d}  높이 {b - a:4d}  #{c[0]:02X}{c[1]:02X}{c[2]:02X}")
top = next((bd for bd in bands if bd[0] < H * 0.05), None)
bottom = next((bd for bd in bands if bd[1] > H * 0.95), None)
if top and bottom and top is not bottom:
    vy, vh = top[1], bottom[0] - top[1]
    print(f"→ 영상 칸: \"video\": {{\"y\": {vy}, \"h\": {vh}}}  (가로:세로 {W / vh:.3f}:1)  경계선 몇 px 는 직접 확인")

# 3. 바 안의 글자 줄
marks = img.copy()
md = ImageDraw.Draw(marks)
for a, b, bg in bands:
    print(f"\n[{a}~{b} 바 안의 글자 줄]")
    rows = [y for y in range(a, b) if sum(far(img.getpixel((x, y)), bg, 90) for x in range(0, W, 2)) >= 3]
    lines, cur = [], []
    for y in rows:
        if cur and y - cur[-1] > 6:
            lines.append(cur)
            cur = []
        cur.append(y)
    if cur:
        lines.append(cur)
    for ln in lines:
        if len(ln) < 12:
            continue
        top, bot = ln[0], ln[-1]
        xs, cols = [], Counter()
        for y in range(top, bot + 1, 2):
            for x in range(0, W, 2):
                p = img.getpixel((x, y))
                if far(p, bg, 90):
                    xs.append(x)
                    cols[tuple(v // 16 * 16 for v in p)] += 1
        c = cols.most_common(1)[0][0]
        print(f"  세로 중심 {(top + bot) // 2:4d}  높이 {bot - top:3d}  x {min(xs)}~{max(xs)} (폭 {max(xs) - min(xs)})  글자색 ≈ #{c[0]:02X}{c[1]:02X}{c[2]:02X}")
        md.rectangle([min(xs), top, max(xs), bot], outline="#FF00FF", width=3)

if save:
    save.mkdir(parents=True, exist_ok=True)
    img.save(save / "normalized.png")
    marks.save(save / "measure.png")
    print("\n저장:", save / "normalized.png", save / "measure.png")
