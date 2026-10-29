인스타·스레드 쇼츠 게시 (klee_castle) — 10/24 맥북에서 옮겨 옴

  python3 social_post.py check        토큰 상태·오늘 게시 한도
  python3 social_post.py dryrun R01   게시 없이 처리까지만 점검
  python3 social_post.py post R01     지금 바로 게시 (예약일 전에 당기고 싶을 때만)

  schedule.tsv  ID / 날짜 / 영상 / 유튜브 / 릴스 표지   (R01 = 리마스터 1편)
  captions.json ID별 인스타·스레드 본문
  posted.tsv    올린 기록 (여기 있으면 다시 안 올림)
  social.log    매일 실행 기록. 결과는 슬랙에도 올라감

  crontab: 매일 20:00 due (오늘 줄, 없으면 빠진 줄 하나), 월요일 10:30 refresh (토큰 60일 연장)
  14·15·16편은 이미 C2·C1·101% 로 올라가 있어 제외
  토큰 파일·slack_webhook.url 은 남에게 주지 말 것
