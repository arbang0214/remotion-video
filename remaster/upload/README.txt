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
