# transcript_*.json → 1분 단위로 묶은 읽기용 텍스트. usage: group_min.py in.json out.txt
import sys, json
rows = json.load(open(sys.argv[1], encoding="utf-8"))
out, cur, buf = [], None, []
for r in rows:
    m = int(r["start"] // 60)
    if m != cur:
        if buf: out.append(f"[{cur:03d}] " + " ".join(buf))
        cur, buf = m, []
    buf.append(r["text"])
if buf: out.append(f"[{cur:03d}] " + " ".join(buf))
open(sys.argv[2], "w", encoding="utf-8").write("\n".join(out) + "\n")
