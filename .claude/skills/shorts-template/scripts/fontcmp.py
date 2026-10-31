"""템플릿 글자 줄과 후보 글꼴을 위아래로 나란히 그려 비교한다.

사용:
  python3 fontcmp.py <normalized.png> <세로중심> <높이> <글자색 #RRGGBB> "<그 줄 문구>" <out.png> 글꼴1.ttf [글꼴2.ttf ...]

- 맨 위 줄은 템플릿(normalized.png)에서 잘라 온 원래 글자, 그 아래로 후보 글꼴을 같은 높이·같은 색으로 그린다.
- 각 후보 오른쪽에 "폭 비율"(후보 폭 / 원래 폭)을 적는다. 1보다 크면 template.json 의 squeeze 로 누르면 된다.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

norm, cy, h, color, text, out, *fonts = sys.argv[1:]
cy, h = int(cy), int(h)
ref = Image.open(norm).convert("RGB")
W = ref.width
band = ref.crop((0, cy - h, W, cy + h))
bg = band.getpixel((4, 4))

# 원래 글자 폭: 배경과 다른 픽셀 범위
xs = [x for x in range(W) for y in range(0, band.height, 3) if sum(abs(a - b) for a, b in zip(band.getpixel((x, y)), bg)) > 90]
ref_w = (max(xs) - min(xs)) if xs else W

rows = [band]
for fp in fonts:
    # 글자 높이가 원래 높이(h)와 같아지는 크기 찾기
    size = h
    f = ImageFont.truetype(fp, size)
    bb = f.getbbox(text)
    size = max(8, round(size * h / max(1, bb[3] - bb[1])))
    f = ImageFont.truetype(fp, size)
    row = Image.new("RGB", (W, band.height), bg)
    d = ImageDraw.Draw(row)
    d.text((W / 2, band.height / 2), text, font=f, fill=color, anchor="mm", stroke_width=3, stroke_fill="#000000")
    bb = f.getbbox(text)
    d.text((8, 8), f"{fp.split('/')[-1]}  size {size}  폭 비율 {(bb[2] - bb[0]) / ref_w:.2f}", fill="#FF00FF",
           font=ImageFont.truetype(fp, 22) if fp else None)
    rows.append(row)

sheet = Image.new("RGB", (W, sum(r.height for r in rows)), "#000000")
y = 0
for r in rows:
    sheet.paste(r, (0, y))
    y += r.height
sheet.save(out)
print("저장:", out, "| 원래 글자 폭", ref_w)
