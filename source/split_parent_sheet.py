# 표정 시트(4x2)를 컷별 PNG로 분리. 머리 위치를 기준으로 정렬해 컷을 바꿔도 얼굴이 튀지 않게 한다.
import sys, os
from PIL import Image
import numpy as np
src, outdir = sys.argv[1], sys.argv[2]
NAMES = ["think", "talkA", "talkB", "worry", "curious", "surprise", "nod", "happy"]
im = Image.open(src).convert("RGBA"); arr = np.array(im); H, W = arr.shape[:2]
op = arr[:, :, 3] > 128
def cut(occ, nominal, r=40):
    lo = max(0, nominal - r); return lo + int(np.argmin(occ[lo:nominal + r]))
ycut = cut(op.sum(1), H // 2)
bands = [(0, ycut), (ycut, H)]
CW, CH, HEAD_X, HEAD_TOP = 560, 600, 280, 24
os.makedirs(outdir, exist_ok=True)
i = 0
for (y0, y1) in bands:
    occ = op[y0:y1].sum(0)
    xs = [0] + [cut(occ, W * k // 4) for k in (1, 2, 3)] + [W]
    for k in range(4):
        cell = arr[y0:y1, xs[k]:xs[k + 1]].copy()
        # 옆 컷에서 넘어온 조각 제거: 열 기준으로 가장 긴 연속 구간만 남긴다
        colocc = (cell[:, :, 3] > 40).any(0); runs = []; st = None
        for x, v in enumerate(list(colocc) + [False]):
            if v and st is None: st = x
            if not v and st is not None: runs.append((st, x)); st = None
        r0, r1 = max(runs, key=lambda r: r[1] - r[0])
        cell[:, :r0] = 0; cell[:, r1:] = 0
        # 위·아래 줄에서 넘어온 가는 선도 같은 방식으로 제거
        rowocc = (cell[:, :, 3] > 40).sum(1) > 8; runs = []; st = None
        for y, v in enumerate(list(rowocc) + [False]):
            if v and st is None: st = y
            if not v and st is not None: runs.append((st, y)); st = None
        q0, q1 = max(runs, key=lambda r: r[1] - r[0])
        cell[:q0] = 0; cell[q1:] = 0
        a = cell[:, :, 3] > 40
        ys, xs_ = np.where(a); top = ys.min()
        head = a[top:top + 170]              # 머리 영역
        hx = np.where(head.any(0))[0]; headc = (hx.min() + hx.max()) // 2
        canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        canvas.paste(Image.fromarray(cell), (HEAD_X - headc, HEAD_TOP - top))
        canvas.save(os.path.join(outdir, NAMES[i] + ".png"))
        print(NAMES[i], "cell", xs[k], xs[k + 1], y0, y1, "top", top, "headc", headc, "bottom", ys.max())
        i += 1
