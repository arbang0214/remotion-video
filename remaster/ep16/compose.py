"""16번째 편 전용: 원본(위 줌 화면 + 아래 표 슬라이드)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다. ep09/compose.py 와 같은 계열(사용자 선택 B안).

- 판서(표 슬라이드)를 영상 칸에 채움: 원본 712×638 → 1080×968, 위아래 16px 흰 여백(막대그래프 오른쪽 끝이 잘리지 않게 폭을 넓게)
- 선생님 줌 화면은 400×225 + 흰 테두리 4px. 평소엔 오른쪽 위, 마지막 비교 표("같은 7명이라도 … 98 ~ 101 %")에선 제목을 가리지 않게 오른쪽 아래
- 6.4~13.5초 판서 왼쪽 위 검은 시간 표시는 흰색으로 덮음
- 구간 제목 카드·장면 전환 깜빡임 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 29.4~31.4초(동그라미 치며 말 없는 구간)는 잘라 내고 48.9초("생각하면 돼")에서 끝, 뒤는 홍보 카드

결과: composed.mp4 → episode.json 의 source 로 쓰고 crop 은 화면 전체(1080×1000)
"""
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "orig.mp4"
OUT = HERE / "composed.mp4"
W, H = 1080, 1000

BOARD = "crop=712:638:4:642,scale=1080:968:flags=lanczos,pad=1080:1000:0:16:white"
PIP = "crop=568:320:76:153,scale=400:225:flags=lanczos,pad=408:233:4:4:white"
TIMER = "drawbox=x=0:y=738:w=128:h=66:color=white:t=fill,"  # 판서 왼쪽 위 검은 시간 표시("01 23", 6.4~13.5초)와 그 밑에 반쯤 가린 "심화 ①" 딱지까지


def layout(pip_y, timer=False):
    pre = TIMER if timer else ""
    return f"[0:v]{pre}split[a][b];[a]{BOARD}[bd];[b]{PIP}[pip];[bd][pip]overlay=656:{pip_y},setsar=1[v]"


LAYOUT = {
    "T": layout(12, timer=True),   # 선생님 오른쪽 위 + 시간 표시 덮기
    "U": layout(12),               # 선생님 오른쪽 위
    "D": layout(751),              # 선생님 오른쪽 아래 (마지막 비교 표의 제목을 가리지 않게)
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (3.20, 4.70, "T", 4.75),     # 첫 화면 카드가 걷히는 중 → 정지 ("이렇게 이 문제입니다"는 소리로)
    (4.70, 13.15, "T", None),
    (13.15, 13.55, "U", 13.60),  # 장면 전환 깜빡임 → 정지
    (13.55, 20.20, "U", None),
    (20.20, 22.40, "U", 22.45),  # 02 제목 카드 → 정지 ("나 101%였다"는 소리로)
    (22.40, 29.40, "U", None),
    (31.40, 41.20, "U", None),
    (41.20, 41.65, "D", 41.70),  # 장면 전환 깜빡임 → 정지 (마지막 비교 표)
    (41.65, 48.90, "D", None),
]
AUDIO = [(3.20, 29.40), (31.40, 48.90)]
FADE = 0.03


def snap(t):
    return round(t * 30) / 30


def run(*args):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def main():
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        parts = []
        for i, (a, b, lay, still) in enumerate(SEGMENTS):
            a, b = snap(a), snap(b)
            n = round((b - a) * 30)
            p = td / f"seg{i:02d}.mp4"
            if still is None:
                src = ["-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", str(SRC)]
            else:
                png = td / f"still{i:02d}.png"
                run("-ss", f"{still:.3f}", "-i", str(SRC), "-frames:v", "1", str(png))
                src = ["-loop", "1", "-t", f"{b - a:.3f}", "-framerate", "30", "-i", str(png)]
            run(*src, "-filter_complex", LAYOUT[lay], "-map", "[v]", "-an", "-r", "30", "-frames:v", str(n),
                "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p", str(p))
            parts.append(p)
        video = td / "video.mp4"
        # concat 필터로 이어 붙이고 30fps 로 타임스탬프를 다시 매긴다.
        # (concat 데무서 + 스트림 복사는 이은 자리의 타임스탬프가 고르지 않아 build.py 의 틀·자막 overlay 가 중간에 끊겼다)
        ins = [x for p in parts for x in ("-i", str(p))]
        graph = "".join(f"[{i}:v]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=0,setpts=N/(30*TB)[v]"
        run(*ins, "-filter_complex", graph, "-map", "[v]", "-r", "30",
            "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p", str(video))

        chains, labels = [], []
        for i, (a, b) in enumerate(AUDIO):
            a, b = snap(a), snap(b)
            d = b - a
            chains.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,"
                          f"afade=t=in:d={FADE},afade=t=out:st={d - FADE}:d={FADE}[a{i}]")
            labels.append(f"[a{i}]")
        graph = ";".join(chains) + f";{''.join(labels)}concat=n={len(AUDIO)}:v=0:a=1[aout]"
        run("-i", str(video), "-i", str(SRC), "-filter_complex", graph.replace("[0:a]", "[1:a]"),
            "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
            "-shortest", str(OUT))
    print("합성:", OUT)


main()
