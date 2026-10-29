"""13번째 편 썸네일 배경: 위(608px)는 선생님이 턱 괴고 정면을 보는 프레임, 아래(392px)는 아이들 "시간만 더 있었으면 ㅠㅠ" 채팅이 다 떠 있는 프레임을 합친다(사용자 선택 E안).
composed.mp4 를 만든 뒤 실행 → thumb/still.png
"""
import subprocess
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "composed.mp4"
FACE_T, CHAT_T, SPLIT = 19.5, 17.0, 608


def grab(t, path):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(SRC), "-frames:v", "1", str(path)], check=True)
    return Image.open(path).convert("RGB")


(HERE / "thumb").mkdir(exist_ok=True)
top = grab(FACE_T, HERE / "thumb" / "face.png")
chat = grab(CHAT_T, HERE / "thumb" / "chat.png")
top.paste(chat.crop((0, SPLIT, 1080, 1000)), (0, SPLIT))
top.save(HERE / "thumb" / "still.png")
print("저장:", HERE / "thumb" / "still.png")
