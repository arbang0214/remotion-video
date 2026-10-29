"""12번째 편 전용: 원본(위 줌 화면 + 아래 판서·채팅)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다. ep11/compose.py 와 같은 배치.

- 위 608px: 선생님 줌 화면을 가로 꽉 채움
- 아래 392px(1.5배): 정답 발표까지(P)는 문제와 답 "14개"가 있는 판서 윗부분, 손 들기부터(C)는 손 이모지·채팅이 올라오는 아래 띠
  (앞부분엔 아래 띠가 거의 비어 있어서 바꿈)
- 구간 제목 카드·장면 전환 깜빡임 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 앞부분("틀려도 괜찮아" + 손 들기)만 씀: 19.0~20.75초(말 없는 구간)는 잘라 내고 33.75초에서 끝(뒤는 풀이·홍보 카드)

결과: composed.mp4 → episode.json 의 source 로 쓰고 crop 은 화면 전체(1080×1000)
"""
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "orig.mp4"
OUT = HERE / "composed.mp4"
W, H = 1080, 1000

ZOOM = "crop=568:320:76:153,scale=1080:608:flags=lanczos"
LAYOUT = {
    "P": f"[0:v]split[a][b];[a]{ZOOM}[z];[b]crop=720:261:0:690,scale=1080:392:flags=lanczos[s];[z][s]vstack,setsar=1[v]",
    "C": f"[0:v]split[a][b];[a]{ZOOM}[z];[b]crop=720:261:0:1003,scale=1080:392:flags=lanczos[s];[z][s]vstack,setsar=1[v]",
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (2.80, 3.10, "P", 3.15),     # 01 제목 카드가 걷히는 중 → 정지
    (3.10, 14.25, "P", None),
    (14.25, 14.55, "P", 14.60),  # 장면 전환 깜빡임 → 정지
    (14.55, 19.00, "P", None),
    (20.75, 22.70, "C", 22.75),  # 02 제목 카드 → 정지 ("나 14개 맞았다"는 소리로)
    (22.70, 33.10, "C", None),
    (33.10, 33.75, "C", 33.00),  # 03 제목 카드 시작 → 정지 (말끝 "괜찮아요" 여유)
]
AUDIO = [(2.80, 19.00), (20.75, 33.75)]
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
