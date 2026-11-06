"""썸네일 후보: 녹음 시각마다 0.25초 간격 8장씩 뽑아 시각을 적은 한 장으로.

사용: python3 thumbs.py <편.json> <출력.jpg> <녹음초> [<녹음초> ...]
build.py 를 한 번 돌려 중간 영상(mc_<out>.mov)이 있어야 한다. 고른 시각(이미지에 적힌 녹음 초)을 편.json 의 thumb 에 쓴다.
ffmpeg 에 drawtext 가 없어서 글씨는 PIL 로 적는다.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

spec_path = Path(sys.argv[1]).resolve()
S = json.loads(spec_path.read_text(encoding="utf-8"))
T0 = round(S["parts"][0][0] - 0.3, 3)
mov = spec_path.parent / f"mc_{S['out']}.mov"
tiles = []
with tempfile.TemporaryDirectory() as tmp:
    for st in map(float, sys.argv[3:]):
        for i in range(8):
            t = round(st + i * 0.25, 2)
            p = f"{tmp}/{t}.png"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t - T0:.3f}", "-i", str(mov), "-frames:v", "1",
                            "-vf", "scale=240:-1", p], check=True)
            im = Image.open(p).convert("RGB")
            ImageDraw.Draw(im).text((5, 5), f"{t}", fill="red")
            tiles.append(im)
w, h = tiles[0].size
rows = (len(tiles) + 7) // 8
sheet = Image.new("RGB", (w * 8, h * rows))
for i, im in enumerate(tiles):
    sheet.paste(im, ((i % 8) * w, (i // 8) * h))
sheet.save(sys.argv[2])
print(sys.argv[2])
