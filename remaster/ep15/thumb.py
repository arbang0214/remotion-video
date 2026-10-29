"""15번째 편 썸네일 배경(사용자 선택 D안): 위(608px)는 선생님이 정면으로 묻는 프레임, 아래(392px)는 친구 설명으로 판서가 다 채워진 마지막 프레임을 합친다.
친구가 설명하는 동안 선생님은 고개를 숙이고 있어서. composed.mp4 를 만든 뒤 실행 → thumb/still.png
"""
import subprocess
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "composed.mp4"
FACE_T, BOARD_T, SPLIT = 0.8, 32.5, 608


def grab(t, path):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(SRC), "-frames:v", "1", str(path)], check=True)
    return Image.open(path).convert("RGB")


(HERE / "thumb").mkdir(exist_ok=True)
top = grab(FACE_T, HERE / "thumb" / "face.png")
board = grab(BOARD_T, HERE / "thumb" / "board.png")
top.paste(board.crop((0, SPLIT, 1080, 1000)), (0, SPLIT))
top.save(HERE / "thumb" / "still.png")
print("저장:", HERE / "thumb" / "still.png")
