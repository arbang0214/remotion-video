"""9번째 편 전용: 원본(줌 화면 + 판서 두 칸)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다.

- 55초 전(구간 A): 판서를 영상 칸에 채우고, 오른쪽 위에 선생님 줌 화면을 작게(흰 테두리 4px)
- 55초 후(구간 B): 원본 배치가 바뀌어 판서가 길어짐 → 판서만(오른쪽 회색 스크롤 막대는 잘라 냄), 높이에 맞추고 양옆은 흰색
- 구간 제목 카드(화면 전체가 어두워짐)가 나오는 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 53.75~55.85초(말 없는 구간 + 04 제목 카드)는 잘라 내고, 72.85초에서 끝(뒤는 다른 문제·홍보 카드)

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
          f"[b]crop=570:320:78:156,scale={PIP_W}:{PIP_H}:flags=lanczos,"
          f"pad={PIP_W + 2 * BORDER}:{PIP_H + 2 * BORDER}:{BORDER}:{BORDER}:white[pip];"
          f"[bd][pip]overlay={W - MARGIN - PIP_W - BORDER}:{MARGIN - BORDER},setsar=1[v]"),
    "B": f"[0:v]crop=704:758:0:522,scale=928:{H}:flags=lanczos,pad={W}:{H}:76:0:white,setsar=1[v]",
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (2.10, 3.10, "A", 3.12),     # 01 제목 카드 → 정지
    (3.10, 19.45, "A", None),
    (19.45, 21.45, "A", 21.50),  # 02 제목 카드 → 정지
    (21.45, 26.27, "A", None),
    (26.27, 28.30, "A", 28.35),  # 03 제목 카드 → 정지 ("왜 700원이지?"는 소리로)
    (28.30, 53.75, "A", None),
    (55.85, 56.30, "B", 56.35),  # 04 제목 카드 끝자락 → 정지
    (56.30, 72.43, "B", None),
    (72.43, 72.85, "B", 72.30),  # 05 제목 카드 시작 → 정지 (말끝 여유)
]
AUDIO = [(2.10, 53.75), (55.85, 72.85)]
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
