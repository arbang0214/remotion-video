# 단어 받아쓰기(words.py 출력) → 자막 초안. 끊는 곳만 기계적으로 잡아 주고, 문구·개행은 사람이 다듬는다
# usage: python3 draft.py words.json out.(json|srt|ts) [--font PATH] [--size 58] [--width 960] [--lines 2] [--gap 0.6] [--end 영상길이]
#   한 자막 = 최대 --lines 줄, 한 줄 폭 --width px 이하(--font·--size 로 실제 폭을 잼. 글꼴이 없으면 17자 기준)
#   받아쓰기 문장(seg)이 바뀌는 곳, 말 사이가 --gap 초 넘게 비는 곳, 문장 끝(다/요/까/죠/? 등)에서 끊는다
#   출력 형식은 확장자로 정함:
#     .json  [{"from","to","text"}]  — shorts-remaster episode.json 의 captions
#     .ts    { start, end, text },   — LectureHighlight clips-*.ts 의 captions 배열에 붙여 넣는 줄
#     .srt   유튜브·인스타 업로드용
import argparse, json, re

p = argparse.ArgumentParser()
p.add_argument("words"); p.add_argument("out")
p.add_argument("--font"); p.add_argument("--size", type=int, default=58)
p.add_argument("--width", type=int, default=960); p.add_argument("--lines", type=int, default=2)
p.add_argument("--gap", type=float, default=0.6); p.add_argument("--end", type=float)
o = p.parse_args()

if o.font:
    from PIL import ImageFont
    F = ImageFont.truetype(o.font, o.size)
    width = lambda t: F.getlength(t)
else:
    width = lambda t: len(t) * o.width / 17

words = json.load(open(o.words, encoding="utf-8"))
END = re.compile(r"(다|요|까|죠|지|네|야|어|아|래)[.?!]*$|[.?!]$")

def wrap(ws):
    """단어들을 줄 폭에 맞게 나눔 → 줄 목록(넘치면 None)"""
    lines, cur = [], ""
    for w in ws:
        t = (cur + " " + w).strip()
        if cur and width(t) > o.width:
            lines.append(cur); cur = w
        else:
            cur = t
    lines.append(cur)
    return lines if len(lines) <= o.lines else None

caps, cur = [], []
for w in words:
    if cur and (w.get("seg") != cur[-1].get("seg") or w["s"] - cur[-1]["e"] > o.gap or wrap([x["w"] for x in cur + [w]]) is None):
        caps.append(cur); cur = []
    cur.append(w)
    if len(cur) > 1 and END.search(w["w"]):  # 한 단어짜리("자", "네")에서는 안 끊음
        caps.append(cur); cur = []
if cur: caps.append(cur)

rows = []
for k, c in enumerate(caps):
    start = c[0]["s"]
    nxt = caps[k + 1][0]["s"] if k + 1 < len(caps) else (o.end or c[-1]["e"])
    end = nxt if nxt - c[-1]["e"] < 1.0 else c[-1]["e"] + 0.3  # 다음 자막까지 짧게 비면 이어 붙여 깜빡임을 없앰
    if k + 1 == len(caps) and o.end: end = o.end  # 마지막 자막은 영상 끝까지
    rows.append({"from": round(start, 2), "to": round(end, 2), "text": "\n".join(wrap([x["w"] for x in c]) or [" ".join(x["w"] for x in c)])})

def srt_t(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

ext = o.out.rsplit(".", 1)[-1]
with open(o.out, "w", encoding="utf-8") as f:
    if ext == "srt":
        for k, r in enumerate(rows, 1):
            f.write(f"{k}\n{srt_t(r['from'])} --> {srt_t(r['to'])}\n{r['text']}\n\n")
    elif ext == "ts":
        for r in rows:
            f.write(f"      {{ start: {r['from']}, end: {r['to']}, text: {json.dumps(r['text'], ensure_ascii=False)} }},\n")
    else:
        json.dump(rows, f, ensure_ascii=False, indent=1)
over = [r["text"] for r in rows if any(width(l) > o.width for l in r["text"].split("\n"))]
print(f"{len(rows)} captions → {o.out}" + (f"  [경고] 폭 초과 {len(over)}개: {over}" if over else ""))
