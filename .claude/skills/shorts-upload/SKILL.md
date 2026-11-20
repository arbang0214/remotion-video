---
name: shorts-upload
description: 완성한 쇼츠를 유튜브 자동 업로드 목록과 인스타·스레드 게시 일정에 넣어 예약한다 — 영상·썸네일 복사, 설명·태그·본문 초안, 릴스 표지, 백업, 시험 실행, 예약 상태 확인, 며칠까지 예약됐는지 답하기. "업로드 예약해줘", "이 편들 예약 걸어줘", "며칠까지 예약됐어?", "예약 취소·순서 바꿔줘", "/shorts-upload" 같은 요청에 사용. 쇼츠를 만드는 일은 raw-shorts·longform-shorts·shorts-remaster.
---

# 쇼츠 업로드 예약

완성한 편 → `remaster/upload/manifest.json`(유튜브) + `remaster/social/schedule.tsv`·`captions.json`(인스타·스레드).
올리는 일 자체는 맥미니 crontab 이 한다(유튜브 10·18·21시 `schedule`, 인스타·스레드 20시 `due`). 이 스킬은 목록에 넣고 확인하는 일.
계정은 이강준 대치동캐슬 채널·klee_castle 하나다. **다른 선생님 영상은 사용자가 말하기 전에는 넣지 않는다.**

**역할:** 예약은 밖으로 나가는 일이다. 사용자가 "예약해줘"라고 한 편만 넣는다. 확인이 안 끝난 것(일화 속 인물, 원본 확인이 필요한 자막)은 넣기 전에 한 번 더 알리고, 그대로 넣었으면 보고에 적는다.

아래에서 `$U` = `.claude/skills/shorts-upload/scripts`.

## 1. 지금 상태 보기

```bash
cd remaster/upload && PYTHONWARNINGS=ignore python3 youtube_daily.py status | tail -12   # 올림 / 예약 / 대기
tail -5 ../social/schedule.tsv                                                           # 인스타·스레드 마지막 날짜
```
- "며칠까지 예약됐어?" → manifest 마지막 편이 나가는 날. 예약(유튜브에 올라가 공개 시각이 걸림)과 대기(목록에만 있음)를 구분해 답하고, 그다음 빈 날도 알려 준다.
- 게시물 번호는 manifest 마지막 `post_no` 다음부터. 하루 한 편 20:00.

## 2. spec 쓰기 → 넣기

scratchpad 에 `spec.json` 을 쓴다(형식은 `$U/add_episodes.py` 맨 위).
- `title_lines` 는 영상 제목 두 줄 그대로. 유튜브 제목은 둘을 이어 붙인다.
- `desc` 는 그 편 내용 요약 두 줄(받아쓰기에서, 과장 없이). `tags` 는 그 편 주제 3개(첫 번째가 스레드 해시태그).
- `footer` 는 주제에 맞게: 초등 심화면 "카이스트 박사 강준쌤의 초등 수학 — 대치동캐슬", 선행·공부법이면 "…의 수학 공부법 — 대치동캐슬".
- `start_date` 는 1단계에서 본 다음 빈 날.

```bash
python3 $U/add_episodes.py <spec.json> --dry-run   # 번호 중복·파일 없음·썸네일 2MB 확인
python3 $U/add_episodes.py <spec.json>             # 백업(*.bak_YYMMDD) 뒤 복사·추가
```

## 3. 확인

```bash
cd remaster/upload && PYTHONWARNINGS=ignore python3 youtube_daily.py schedule --dry-run   # 어느 편이 어느 날로 가는지
cd ../social && python3 -I social_post.py dryrun R<첫 편>                                 # 게시 없이 처리까지만
```
- 사용자가 예약을 지시했으면 `youtube_daily.py schedule >> cron.log 2>&1` 을 바로 돌려도 된다(cron 과 같은 동작. 오늘~사흘 뒤 칸만 채움). 그 뒤 `status` 로 "예약"을 확인.
- `next`(바로 공개)와 `social_post.py post`(바로 게시)는 돌리지 않는다.
- `remaster/upload/README.txt` 맨 아래에 "MM/DD NN~NN편 추가" 한 줄을 남긴다.
- 슬랙 #9-자동화-마케팅 에 한 줄 남기는 일은 사용자에게 부탁한다(이 채널에는 글을 못 남김).

## 4. 고치기

- 이미 "예약"된 편의 영상·제목을 고치면: `python3 youtube_daily.py unschedule N`(그 비공개 영상 삭제) → `upload/videos·thumbnails/epNN` 과 `social/covers/epNN.jpg` 를 새 파일로 덮기 → 다음 `schedule` 이 다시 올림.
- "대기"인 편은 파일만 덮으면 된다. 제목·설명은 manifest 와 captions.json 을 같이 고친다.
- 순서 바꾸기는 manifest 배열 순서(유튜브)와 schedule.tsv 날짜(인스타·스레드)를 같이.

## 보고

표로: 편 / 공개일(요일) / 제목 / 유튜브 상태. 그리고 넣지 않은 것, 확인 없이 그대로 넣은 것, 사용자가 직접 할 일(슬랙). 커밋은 사용자가 말할 때.
