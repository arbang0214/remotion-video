"""10번째 편 전용: 원본(줌 화면 + 판서 두 칸)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다. (ep09/compose.py 를 바탕으로)

- 처음부터 끝까지 같은 배치: 판서를 영상 칸에 채우고, 오른쪽 위에 선생님 줌 화면을 작게(흰 테두리 4px)
- 구간 제목 카드(화면 전체가 어두워짐)가 나오는 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 11.4초까지 판서 왼쪽 위의 검은 사각형(원본에 찍힌 것)은 흰색으로 덮음
- 앞의 옛 EP.02 제목 화면은 정지 화면으로 덮고, 92.4초에서 끝(뒤는 홍보 카드)

결과: composed.mp4 → episode.json 의 source 로 쓰고 crop 은 화면 전체(1080×1000)
"""
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "orig.mp4"
OUT = HERE / "composed.mp4"
W, H = 1080, 1000

PIP_W, PIP_H, BORDER, MARGIN = 440, 248, 4, 24
LAYOUT = {
    "A": (f"[0:v]split[a][b];[a]crop=690:638:15:642,scale={W}:{H}:flags=lanczos[bd];"
          f"[b]crop=564:316:78:156,scale={PIP_W}:{PIP_H}:flags=lanczos,"
          f"pad={PIP_W + 2 * BORDER}:{PIP_H + 2 * BORDER}:{BORDER}:{BORDER}:white[pip];"
          f"[bd][pip]overlay={W - MARGIN - PIP_W - BORDER}:{MARGIN - BORDER},setsar=1[v]"),
}
# 원본 판서 왼쪽 위 모서리에 11.4초까지 검은 사각형이 찍혀 있음 → 그 구간은 흰색으로 덮는다
LAYOUT["A0"] = LAYOUT["A"].replace("[0:v]split", "[0:v]drawbox=x=0:y=640:w=52:h=42:color=white:t=fill,split")

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (2.10, 3.10, "A0", 3.12),     # EP.02·01 제목 카드 → 정지
    (3.10, 10.97, "A0", None),
    (10.97, 13.07, "A", 13.10),  # 02 제목 카드 → 정지
    (13.07, 31.77, "A", None),
    (31.77, 33.83, "A", 33.87),  # 03 제목 카드 → 정지
    (33.83, 44.67, "A", None),
    (44.67, 45.17, "A", 45.20),  # 판서 넘어가는 순간 깜빡임 → 정지
    (45.17, 56.10, "A", None),
    (56.10, 58.13, "A", 58.17),  # 04 제목 카드 → 정지
    (58.13, 82.37, "A", None),
    (82.37, 84.43, "A", 84.47),  # 05 제목 카드 → 정지
    (84.43, 92.40, "A", None),
]
AUDIO = [(2.10, 92.40)]
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
