"""원본 영상 프레임 확인용 격자 이미지.

사용:
  python3 frames.py <video> overview               1초 간격 전체 화면 격자 → 내용·옛 글씨 위치 파악
  python3 frames.py <video> still <초>             원본 해상도 한 장 → 옛 제목 아래 끝·옛 자막 위 끝 y 좌표 재기
  python3 frames.py <video> faces x,y,w,h [간격]   얼굴 부분만 촘촘히(기본 0.25초) → 썸네일용 표정 고르기
결과: 영상 옆 frames/ 폴더
프레임은 build.py 와 같은 방식(-ss 를 -i 앞에)으로 한 장씩 뽑아서, 격자의 시각과 최종 썸네일 프레임이 일치한다.
"""
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

src = Path(sys.argv[1]).resolve()
mode = sys.argv[2]
out_dir = src.parent / "frames"
out_dir.mkdir(exist_ok=True)
label_font = ImageFont.truetype(str(Path(__file__).resolve().parent.parent / "fonts" / "Pretendard-Bold.ttf"), 22)


def duration():
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def grab(t, vf, path):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", str(src), "-frames:v", "1", "-vf", vf, str(path)], check=True)


def grid(times, vf, cols, name):
    with tempfile.TemporaryDirectory() as td:
        tiles = []
        for i, t in enumerate(times):
            p = Path(td) / f"{i}.png"
            grab(t, vf, p)
            im = Image.open(p).convert("RGB")
            d = ImageDraw.Draw(im)
            d.rectangle([0, 0, 92, 28], fill="#000000")
            d.text((6, 3), f"{t:.2f}s", font=label_font, fill="#FFD23F")
            tiles.append(im)
    tw, th = tiles[0].size
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), "#000000")
    for i, im in enumerate(tiles):
        sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
    path = out_dir / name
    sheet.save(path)
    print("저장:", path)


dur = duration()
if mode == "overview":
    grid([float(t) for t in range(int(dur))], "scale=270:-2", 6, "overview.png")
elif mode == "still":
    t = float(sys.argv[3])
    path = out_dir / f"still_{t:.2f}.png"
    grab(t, "null", path)
    print("저장:", path, Image.open(path).size)
elif mode == "faces":
    x, y, w, h = (int(v) for v in sys.argv[3].split(","))
    step = float(sys.argv[4]) if len(sys.argv) > 4 else 0.25
    n = int(dur / step)
    grid([i * step for i in range(n)], f"crop={w}:{h}:{x}:{y},scale=160:-2", 10, "faces.png")
else:
    sys.exit(f"모르는 모드: {mode}")
