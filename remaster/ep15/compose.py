"""15번째 편 전용: 원본(위 줌 화면 + 아래 판서)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다. ep11/compose.py 와 같은 배치.

- 위 608px: 선생님 줌 화면(친구가 설명할 땐 "친구가 직접 설명 중" 표시가 나옴)을 가로 꽉 채움
- 아래 392px: 판서 윗부분(105개 식·다섯 칸·자리별 숫자, 원본 y 655~995)을 높이에 맞추고 양옆은 흰색
  → 판서 아래 노란 메모("앞 친구 설명")는 빠짐(사용자 선택 A안)
- 3.85초("자 그럼 한번 설명해 볼 수 있을까?")부터 38.8초("네, 7개고 5개")까지, 뒤는 홍보 카드
- 15.45~17.55초(친구가 생각하며 말을 멈춘 구간)는 잘라 냄

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
    "C": (f"[0:v]split[a][b];[a]{ZOOM}[z];[b]crop=720:340:0:655,scale=830:392:flags=lanczos,"
          f"pad=1080:392:125:0:white[s];[z][s]vstack,setsar=1[v]"),
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (3.85, 4.70, "C", 4.75),     # 첫 화면 카드가 걷히는 중 → 정지 ("자 그럼"은 소리로)
    (4.70, 15.45, "C", None),
    (17.55, 38.80, "C", None),
]
AUDIO = [(3.85, 15.45), (17.55, 38.80)]
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
