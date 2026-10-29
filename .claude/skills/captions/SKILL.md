---
name: captions
description: 영상·클립의 한국어 자막을 만든다 — 단어 단위 받아쓰기(mlx-whisper) → 자막 초안 → 맞춤법·개행·강조 다듬기 → 쓰는 곳에 맞는 형식(LectureHighlight 클립 데이터 .ts, shorts-remaster episode.json, 업로드용 .srt)으로. "자막 만들어줘", "자막 달아줘", "srt 뽑아줘", "자막 다시 맞춰줘", "/captions" 같은 요청에 사용. lecture-shorts·shorts-remaster 작업 중 자막 단계에서도 이 방식을 쓴다.
---

# 자막 만들기

받아쓰기는 끊는 곳·시각만 믿고, **문구는 사람이 읽기 좋게 다시 쓴다**. 스크립트는 초안까지만 만든다.

`$K` = `.claude/skills/captions/scripts`

## 1. 무엇에 쓰는 자막인지 확인

| 쓰는 곳 | 출력 | 폭 기준 |
|---|---|---|
| 수업 하이라이트(Remotion `clips-*.ts` 의 `captions`) | `.ts` 줄 — `{ start, end, text }`, 클립 안 시각 | 한 줄 약 16자 |
| 쇼츠 리마스터(`episode.json` 의 `captions`) | `.json` — `{ from, to, text }` | Pretendard-Black 58px, 960px |
| 유튜브·인스타에 올리는 자막 파일 | `.srt` | 한 줄 약 16자 |

어느 클립인지(파일 경로, 또는 원본의 몇 초~몇 초인지)도 받는다.

## 2. 단어 단위 받아쓰기

```bash
~/.venvs/whisper/bin/python $K/words.py public/clips/1010a/a1.mp4 w.json                       # 클립 전체
~/.venvs/whisper/bin/python $K/words.py "<원본>" w.json --from 1917.2 --to 1941               # 원본 일부, 시각은 구간 기준(0부터)
~/.venvs/whisper/bin/python $K/words.py "<원본>" w.json --from 1917.2 --to 1941 --offset 1917.2  # 원본 기준 시각으로
```

→ `w.json`(단어·시각) + `w.txt`(문장과 `단어@시각`, 읽기용). 작업 파일은 scratchpad 나 해당 편 작업 폴더에 둔다.

- 받아쓰기는 틀린다: 수 읽기("21분의 4"), 학생 말, 고유명사("카박준쌤", "하이레벨"). 화면의 판서·옛 자막·문맥으로 맞춘다. 학생 말은 목소리가 작아 빠지기도 하니 소리로 확인한다.

## 3. 초안

```bash
python3 $K/draft.py w.json caps.ts   --font .claude/skills/shorts-remaster/fonts/Pretendard-Black.ttf --end <클립 길이>
python3 $K/draft.py w.json caps.json --font .claude/skills/shorts-remaster/fonts/Pretendard-Black.ttf --end <영상 길이>
python3 $K/draft.py w.json caps.srt
```

받아쓰기 문장 경계·0.6초 넘는 공백·문장 끝에서 끊고, 한 자막 최대 2줄로 줄 폭을 잰다. 다음 자막까지 1초 안이면 이어 붙여 깜빡이지 않게 하고, `--end` 를 주면 마지막 자막을 끝까지 늘린다. 폭이 넘치면 `[경고]`.

## 4. 다듬기 — 여기가 본 작업

초안을 그대로 쓰지 않는다. 한 자막씩 고친다.

- **한 자막 = 1~2줄**, 한 호흡. 2줄은 의미 단위로 나눈다("이제 막 심화를 / 시작한 친구들이"). 조사·어미만 다음 줄로 떨어지지 않게("…21분의 4를 / 풀었다" ×).
- **맞춤법·띄어쓰기**: "안하고" → "안 하고", "해보자" → "해 보자", "확인해 보세요", 정답은 "맞히다"(맞추다 ×). 수는 읽기 쉽게("3 곱하기 4" → "3×4", "21분의 4"는 그대로 두되 강조).
- **군더더기**: "자", "그", "이제", 같은 말 반복("조금씩 조금씩")은 줄이 넘치거나 읽는 데 방해될 때 뺀다. 말투(반말·존댓말)는 바꾸지 않는다.
- **강조 `[[ ]]`**: 자막마다 핵심 한 덩어리만, 없으면 생략. 모든 자막에 넣지 않는다. 숫자 답·반전 단어·훅 문구가 1순위.
- **학생 말**: 수업 하이라이트에서는 `who: "kid"` 를 붙이고(.ts), 변조돼 잘 안 들리니 짧아도 전부 자막으로.
- **개인정보**: 학생 이름·지역·학교가 들리면 자막에 쓰지 않는다. 그 구간이 영상에 남아 있으면 자막 문제가 아니라 컷 문제 → 사용자에게 알린다.
- **시각**: 자막은 말 시작보다 늦게 뜨지 않게. 끝은 다음 자막 시작에 붙이거나 말 끝 + 0.3초. 시각은 소수 둘째 자리까지.
- 쇼츠 리마스터 자막은 `.claude/skills/shorts-remaster/SKILL.md` 7단계 규칙(첫 줄 중심, 폭 960px)도 같이 지킨다.

## 5. 넣고 확인

- `.ts`: 클립 데이터의 `captions: [ … ]` 안에 붙여 넣는다 → `npx tsc --noEmit`.
- `.json`: `episode.json` 의 `captions` 로 → `build.py` 의 `[경고]` 확인.
- `.srt`: 그대로 업로드. 파일 인코딩 UTF-8.
- 렌더된 영상이 있으면 자막이 바뀌는 시각 몇 곳에서 프레임을 뽑아 줄바꿈·잘림을 본다.

## 보고

사용자에게는 **받아쓰기와 달라진 곳**(뺀 말, 고친 맞춤법·수 표기, 들리지 않아 추정한 곳)을 목록으로 알린다. 확인이 필요한 곳은 시각과 함께.
