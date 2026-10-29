"""11번째 편 썸네일 배경: 위(608px)는 선생님이 살짝 웃는 정면 프레임, 아래(392px)는 아이들 채팅이 가장 많이 떠 있는 순간을 합친다.
채팅이 많이 뜬 순간엔 선생님 표정이 애매해서 두 순간을 합침(사용자 선택 B안). composed.mp4 를 만든 뒤 실행 → thumb/still.png
"""
import subprocess
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "composed.mp4"
PHOTO_T, CHAT_T, SPLIT = 15.77, 30.07, 608


def grab(t, path):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(SRC), "-frames:v", "1", str(path)], check=True)
    return Image.open(path).convert("RGB")


(HERE / "thumb").mkdir(exist_ok=True)
top = grab(PHOTO_T, HERE / "thumb" / "photo.png")
chat = grab(CHAT_T, HERE / "thumb" / "chat.png")
top.paste(chat.crop((0, SPLIT, 1080, 1000)), (0, SPLIT))
top.save(HERE / "thumb" / "still.png")
print("저장:", HERE / "thumb" / "still.png")
