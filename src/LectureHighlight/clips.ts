// 2026-09-10 초5-1 심화 9회차 (분수의 덧셈과 뺄셈) 앞 30분에서 고른 하이라이트
// 원본: source/lecture-0910.mp4 → ffmpeg 로 잘라 public/clips/*.mp4
export const FPS = 30;
export const INTRO_FRAMES = 40;
export const OUTRO_FRAMES = 170; // 선생님 소개 아웃트로(약 5.7초)

// 선생님 소개 — "압도적인 수학 전문성" 초등 강준쌤 소개 영상(youtu.be/rd4R3skC18s) 기반
export const TEACHER = {
  name: "강준쌤",
  role: "대치동캐슬 초등 수학 담당",
  headline: "압도적인 수학 전문성",
  photo: "clips/teacher.jpg",
  points: [
    { icon: "🎓", title: "KAIST 전자공학 학·석·박사", desc: "10년 넘게 수학을 끝까지 공부한 선생님" },
    { icon: "📝", title: "원리 중심 · 백지 공부법", desc: "대치동캐슬 학습법의 시초가 된 공부 방식" },
    { icon: "🧒", title: "초등 전문", desc: "스스로 공부하는 습관을 만드는 수업" },
  ],
};
export const HOLD_AFTER_LAST = 30; // 마지막 클립 끝에서 아웃트로로 넘어가기 전 정지 프레임(1초)

// 원본(1920x1080) 안의 선생님 캠 위치 — 세로판에서 따로 잘라 상단에 배치
export const CAM = { x: 1470, y: 0, w: 450, h: 258 };
export const HIGHLIGHT_TITLE = "규칙 찾기, 약한 놈부터 공격!";
export const HIGHLIGHT_SUBTITLE = "초5-1 심화 9회차 · 분수의 덧셈과 뺄셈";

// who "kid": 학생 발화 자막(학생 라벨이 붙은 박스 자막으로 구분)
export type Caption = { start: number; end: number; text: string; who?: "kid" }; // 클립 내 상대 시각(초). text 의 백슬래시n 은 줄바꿈, [[단어]] 는 강조
export type Rect = { x: number; y: number; w: number; h: number };
// board: 세로판에서 보여줄 판서 영역(원본 좌표)
// 채팅 연출: t = 클립 내 상대 시각(초). emoji 만 있으면 리액션(둥실 떠오르는 이모지)
export type Chat = { t: number; name?: string; text?: string; emoji?: string };
// cam: 이 클립에서 선생님 캠 위치가 기본(CAM)과 다를 때 지정
// camFile: 캠만 따로 잘라 화질 보정한 파일(있으면 cam 대신 이 파일을 그대로 씀)
// label: 챕터 제목(짧게), desc: 챕터 한 줄 설명(왜 이 수업인지), bigBoard: 이 클립만 판서 영역을 크게(캠 600 / 판서 1320)
// fit: 판서 영역에 board 를 넣는 방식. cover(기본, 넘치면 잘라냄) / contain(전체가 보이게, 남는 곳은 흰색)
// label 이 빈 문자열이면 앞 클립과 같은 챕터로 이어져 챕터 제목 등장(리드)이 없음
// visual "teacherCard": 영상 대신 오디오(file)만 쓰고, 캠 자리에 선생님 사진, 수업 화면 자리에 소개 카드(teacher.points)를 보여줌
// cardTimes: 소개 포인트 3개가 나타나는 시각(초). 갤러리 뷰처럼 아이들 얼굴이 나오는 구간에 사용
// kid: 학생이 마이크로 말하는 구간(클립 내 초) — 캠 위에 "직접 설명 중" 배지 + 음성 막대. kidLabel: 학생 표기(학년만, 이름·지역 금지)
// notes: 수업 화면 아래쪽에 붙는 보충 메모(예: 학생 계산 실수 짚기)
export type Span = { start: number; end: number };
export type Note = Span & { text: string };
export type Clip = { file: string; source: string; duration: number; label: string; desc?: string; bigBoard?: boolean; noteBoard?: boolean; boardKeys?: { t: number; rect: Rect; free?: boolean }[]; fit?: "cover" | "contain"; visual?: "video" | "teacherCard"; cardTimes?: number[]; captions: Caption[]; board: Rect; cam?: Rect; camFile?: string; chats?: Chat[]; kid?: Span[]; kidLabel?: string; notes?: Note[] };
export type Teacher = typeof TEACHER;
export type OutroLink = { label: string; url: string; qr?: string; icon?: string }; // qr 가 있으면 QR 카드, 없으면 텍스트 링크 줄
export type Outro = { lines: string[]; links?: OutroLink[]; note?: string; photo?: string; footer?: string }; // photo: 선생님 사진 교체, note: 안내 문구, footer: 맨 아래 한 줄
// episode: 타이틀 앞 스티커(EP.01), icon: 타이틀 옆 작은 아이콘 이미지(public/ 경로, 없으면 표시 안 함)
// hook: 썸네일(첫 프레임·썸네일 카드) 메인 문구. "초등 수학은\n[[강조]]을\n길러야 합니다" 처럼 줄마다 \n, 강조는 [[ ]]. 있으면 title 대신 크게 쓰고 title 은 작은 태그로
// cover: 필기 강조 썸네일(NoteThumbnail) 설정. 있으면 본편 첫 화면도 같은 카드로 시작
// bubble: noFace 자막 말풍선 디자인(Shorts.tsx TalkBubble)
// noFace: 선생님 캠을 빼고 음성 + 수업 화면만(위에는 챕터 제목·자막 띠만 남기고 판서를 1540 으로 키움)
// noFace: 얼굴 없이 필기만(썸네일에서 얼굴 원을 빼고 필기 카드를 키움)
export type NoteCover = { noFace?: boolean; note: string; noteAspect: number; camFile: string; camFrom?: number; faceAt?: [number, number]; faceBox?: number; tag?: string; cardW?: number; cardTop?: number; faceInset?: number; belowGap?: number; labelRight?: boolean; cardLeft?: number; facePhoto?: string; faceSize?: number };
export type HighlightData = { teacher: Teacher; cam: Rect; title: string; subtitle: string; episode?: string; icon?: string; hook?: string; clips: Clip[]; holdAfterLast: number; outro?: Outro; cover?: NoteCover; noFace?: boolean; bubble?: "messenger" | "glass" | "pop" };

export const CLIPS: Clip[] = [
  {
    file: "clips/c1.mp4",
    source: "10:34.5 ~ 10:41",
    duration: 6.5,
    label: "풀이 전략",
    board: { x: 120, y: 250, w: 1340, h: 600 },
    captions: [
      { start: 0.4, end: 3.3, text: "규칙이 안 보이면, 약한 놈을 찾아야 돼" },
      { start: 3.3, end: 6.5, text: "약한 놈을 찾아서 공격! 해야 됩니다" },
    ],
  },
  {
    file: "clips/c2.mp4",
    source: "15:51.5 ~ 15:58.5",
    duration: 7,
    label: "다 같이 규칙 찾기",
    board: { x: 0, y: 200, w: 1720, h: 800 },
    captions: [
      { start: 0, end: 2.9, text: "찾은 것 같다는 사람은 손 먼저 들어볼까?" },
      { start: 5.3, end: 7, text: "힌트는 더하기야" },
    ],
  },
  {
    file: "clips/c3.mp4",
    source: "16:43 ~ 16:49.5",
    duration: 6.5,
    label: "규칙 발견!",
    board: { x: 0, y: 200, w: 1720, h: 800 },
    captions: [
      { start: 0, end: 3.1, text: "아, 이거 규칙 있어요. 유명한 규칙이에요" },
      { start: 3.2, end: 4.85, text: "맞아요, 이거 유명한 규칙" },
      { start: 4.85, end: 6.5, text: "앞의 두 개를 더하면 뒤의 것이 되죠" },
    ],
  },
];

export const DATA_0910: HighlightData = { teacher: TEACHER, cam: CAM, title: HIGHLIGHT_TITLE, subtitle: HIGHLIGHT_SUBTITLE, clips: CLIPS, holdAfterLast: HOLD_AFTER_LAST };
