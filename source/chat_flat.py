# 익명 채팅 → "영상시각 [보낸이] 내용" 한 줄씩. usage: chat_flat.py chat.txt HH:MM:SS(영상 0초 시각) out.txt
import sys, re, datetime as dt
src, t0, out = sys.argv[1:4]
base = dt.datetime.strptime(t0, "%H:%M:%S")
rows, cur = [], None
for line in open(src, encoding="utf-8"):
    m = re.match(r"\d{4}-\d\d-\d\d (\d\d:\d\d:\d\d) 시작 (.+?) 수신자", line)
    if m:
        cur = [m.group(1), m.group(2), []]; rows.append(cur)
    elif cur and line.strip():
        cur[2].append(line.strip())
with open(out, "w", encoding="utf-8") as f:
    for t, who, msg in rows:
        s = int((dt.datetime.strptime(t, "%H:%M:%S") - base).total_seconds())
        sign = "-" if s < 0 else ""
        f.write(f"{sign}{abs(s)//60:03d}:{abs(s)%60:02d} [{who}] {' / '.join(msg)}\n")
