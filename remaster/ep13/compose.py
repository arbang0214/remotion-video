"""13번째 편 전용: 원본(위 줌 화면 + 아래 판서·채팅)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다. ep11/compose.py 와 같은 배치.

- 위 608px: 선생님 줌 화면을 가로 꽉 채움 / 아래 392px: 원본 아래 칸(숫자 카드 바로 아래부터 689×250 을 1080×392 로, 답 "12개"와 아이들 채팅이 올라오는 띠, 1.5배)
- 구간 제목 카드 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 앞부분(답 공개 → "시간만 더 있었으면" → 빠르게 푸는 법)만 씀: 말 없는 6.10~7.35초, 15.40~17.55초(02 제목 카드 포함)는 잘라 내고
  35.10초에서 끝(뒤는 수직선 풀이·홍보 카드)

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
    "C": f"[0:v]split[a][b];[a]{ZOOM}[z];[b]crop=689:250:15:1030,scale=1080:392:flags=lanczos[s];[z][s]vstack,setsar=1[v]",
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (2.10, 3.10, "C", 3.15),     # 01 제목 카드가 걷히는 중 → 정지 ("자 같이 풀어 보겠습니다"는 소리로)
    (3.10, 6.10, "C", None),
    (7.35, 15.40, "C", None),
    (17.55, 18.10, "C", 18.15),  # 02 제목 카드 끝자락 → 정지
    (18.10, 35.10, "C", None),
]
AUDIO = [(2.10, 6.10), (7.35, 15.40), (17.55, 35.10)]
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
