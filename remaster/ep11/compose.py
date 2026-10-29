"""11번째 편 전용: 원본(위 줌 화면 + 아래 채팅·소개 카드)을 리마스터 틀의 영상 칸(1080×1000)으로 미리 합성한다.

- 위 608px: 선생님 줌 화면(자기소개 구간은 프로필 사진)을 가로 꽉 채움
- 아래 392px: 원본 아래 칸에서 채팅 말풍선이 올라오는 띠(1.5배)
- 앞의 선생님 소개(프로필 사진 정지 화면, ~22.8초)는 쇼츠로 따분해서 잘라 내고 "오늘 문제의 난이도가"부터 시작
- 구간 제목 카드·장면 전환 깜빡임 동안은 직후의 깨끗한 프레임을 정지 화면으로, 소리는 그대로
- 59.25~60.85초(말 없는 구간 + 03 제목 카드)는 잘라 내고, 89.0초에서 끝(뒤는 특강 홍보 카드)

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
    "C": f"[0:v]split[a][b];[a]{ZOOM}[z];[b]crop=720:261:0:1003,scale=1080:392:flags=lanczos[s];[z][s]vstack,setsar=1[v]",
}

# (시작, 끝, 배치, 정지 화면 시각 또는 None) — 원본 기준 초
SEGMENTS = [
    (22.95, 24.80, "C", 24.85),  # 02 제목 카드 → 정지 ("오늘 문제의 난이도가"는 소리로)
    (24.80, 37.25, "C", None),
    (37.25, 37.55, "C", 37.60),  # 장면 전환 깜빡임 → 정지
    (37.55, 59.25, "C", None),
    (60.85, 61.30, "C", 61.35),  # 03 제목 카드 끝자락 → 정지
    (61.30, 76.55, "C", None),
    (76.55, 76.95, "C", 77.00),  # 장면 전환 깜빡임 → 정지
    (76.95, 89.00, "C", None),
]
AUDIO = [(22.95, 59.25), (60.85, 89.00)]
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
