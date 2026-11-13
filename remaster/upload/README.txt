쇼츠 리마스터 1~16편 — 하루 한 편 업로드 + 같은 편 원본 비공개

폴더
  videos/epNN.mp4        쇼츠 영상 (1080×1920, 30fps)
  thumbnails/epNN.png    썸네일 (1080×1920 PNG, 모두 2MB 미만)
  manifest.json          편마다 업로드 정보
  youtube_daily.py       업로드 스크립트 (사용법은 파일 맨 위)
  client_secret.json     (직접 넣을 것) Google Cloud OAuth 클라이언트
  token.json             (auth 하면 생김) 로그인 정보 — 남에게 주지 말 것
  state.json             (올리면 생김) 올린 편과 새 영상 ID
  upload.log             (올리면 생김) 매일 기록

manifest 항목
  post_no         게시 순서 (이 순서대로 하루 한 편)
  title           유튜브 제목 (리마스터 두 줄 제목을 한 줄로)
  description     설명 — 비어 있음
  tags            태그 — 비어 있음
  category_id     "27" = 교육
  privacy_status  "public" = 올리자마자 공개
  made_for_kids   아동용 여부 — 비어 있음(null)이면 보내지 않음. true/false 로 직접 정할 것
  original_id     같은 편 원본 영상 ID. null 이면 원본은 손대지 않음(수동으로 비공개)

하루 동작 (youtube_daily.py next)
  1. 아직 안 올린 가장 앞 편을 공개로 업로드 → 바로 state.json 에 기록(다음 날 중복 업로드 방지)
  2. 썸네일 설정
  3. original_id 가 있으면 그 원본을 비공개로 바꿈(조회수·댓글은 그대로 남음)

주의
  - 2020년 7월 이후 만든 Google Cloud API 프로젝트는 YouTube 감사(audit) 전까지 API로 올린 영상이
    비공개로 잠김. 이 경우 upload.log 에 [주의]가 남으니 스튜디오에서 직접 공개로 바꿀 것.
  - API 하루 할당량(기본 10,000 단위) — 하루 한 편이면 충분.

운영 (10/24 세팅)
  - client_secret.json, token.json 넣음 (이강준 대치동캐슬 채널, 권한 600)
  - manifest: 설명·태그 초안, made_for_kids=false, 원본 ID 15편 등록 (11편은 원본 없음)
  - 자동 실행: crontab, 매일 20:00 `youtube_daily.py next` → cron.log, upload.log
  - 팀원은 맥미니에 kk 계정으로 접속해서 쓰면 됨. `status`로 확인만 하고 `next`는 직접 돌리지 말 것
    (직접 돌리면 그날 두 편이 올라감)
  - 멈추기: crontab -e 에서 해당 줄 앞에 # 붙이기
  - 10/24 게시 순서 변경: 조언 영상과 수업 영상을 번갈아 올림. manifest 배열 순서 = 게시 순서
    (post_no 는 편 번호 epNN 그대로). 1,9,2,10,3,12,4,13,5,11,6,14,7,16,8,15

11/09 바꿈 — 예약 공개 방식 (강준쌤 결정, Claude 작업. 예전 코드·기록은 *.bak_261109)
  - 영상을 공개 2~3일 전에 비공개로 미리 올리고(LOOKAHEAD_DAYS = 3) 공개 시각(publishAt) 20:00 을 걸어 둠
    → 맥미니가 꺼지거나 인터넷이 끊겨도 유튜브가 알아서 공개. 스튜디오·리포트에서 "예약됨"으로 보임
  - crontab
      10:00·18:00·21:00  schedule   오늘(19시 전)부터 사흘 뒤까지 칸이 비어 있으면 manifest 순서대로 다음 편 예약 업로드
      20:10              after      공개됐는지 확인 → 원본 비공개 → 슬랙
      월·목 09:30        report     앞으로 7일 게시 일정(유튜브 + 인스타·스레드)을 슬랙으로
  - 순서 바꾸기: manifest.json 배열 순서만 바꾸면 됨. 이미 예약 업로드된 편(status 에 "예약")을 바꾸려면
      python3 youtube_daily.py unschedule N   (그 비공개 영상 삭제 → 다음 schedule 때 새 순서로 다시 채움)
  - 순서를 바꾸거나 새 편을 넣으면 슬랙 #9-자동화-마케팅 에 한 줄 남기기
  - next 는 예전 방식(바로 공개)이라 손으로 돌리지 말 것
  - 11/09 순서 변경(A안): 20,15,18,21,19,17 — 계산 실수 4편을 비유→원인→태도→해결 순서로, 사이에 다른 주제
  - 11/13 22~28편 추가(초등 심화 Q&A 촬영본, out/shorts_1110 에서 복사). 순서 22→28, 11/15부터 하루 한 편.
    원본 없음(new_short). 백업 manifest.json.bak_261113
