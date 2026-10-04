// 2026-09-13 초등경시 특강 (초5-2, 1. 수의 어림) — "붕어빵의 함정" 하이라이트
// 원본: source/0913/lecture-0913.mp4 (영상 0초 = 18:40:29) → ffmpeg 로 잘라 public/clips/0913/*.mp4
// cam_*.mp4: 캠 영역만 크롭 → hqdn3d 노이즈 제거 → 2배(852x480) lanczos → unsharp+cas 샤프닝 (원본 캠이 426x240 라 2배가 한계)
// 채팅은 실제 chat.txt 의 메시지·리액션만 사용, 이름은 지역/학년으로만 표기
// 챕터 제목은 "이 수업이 어떤 수업인지"가 드러나게 잡는다 (문제 내용 자체가 아니라 수업 방식)
import { TEACHER } from "./clips";
import type { Clip, HighlightData, Rect } from "./clips";

const CAM_TR: Rect = { x: 1438, y: 46, w: 426, h: 240 }; // 우상단 캠
const CAM_BL: Rect = { x: 55, y: 850, w: 375, h: 215 }; // 좌하단 캠 (50~52분 구간)
// 판서 영역: 세로판 아래 절반(1080x960, 비율 1.125)에 맞춘 크롭
const PAGE: Rect = { x: 380, y: 150, w: 760, h: 675 }; // 문제 05 지문 + 표 + 700원 메모
const PAGE_WRITE: Rect = { x: 430, y: 395, w: 720, h: 640 }; // 03 챕터: 표 아래에 쓰는 판서(5+1×4, (5×2)=10)까지 포함, 좌하단 캠은 제외
// 판서 크게(1080x1160, 비율 0.93) 쓰는 챕터용
const SOLVE: Rect = { x: 940, y: 290, w: 680, h: 730 }; // 붕어빵/호떡 풀이 손글씨(우상단 캠 모서리 제외)

const CLIPS: Clip[] = [
  {
    file: "clips/0913/c1.mp4",
    camFile: "clips/0913/cam_c1.mp4",
    source: "50:51.3 ~ 51:08.0",
    duration: 16.76,
    label: "전국 친구들과 함께",
    desc: "줌으로 모여 다같이 어려운 문제를 풀어요",
    cam: CAM_BL,
    board: PAGE,
    captions: [
      { start: 1.9, end: 3.2, text: "아, 이거 좀 갈라졌습니다" },
      { start: 3.2, end: 8.4, text: "정답, [[700원]]입니다" },
      { start: 8.5, end: 12.1, text: "맞았다! 맞았다!" },
      { start: 12.1, end: 15.0, text: "맞은 친구 솔직히\n이거 인정" },
      { start: 15.0, end: 16.7, text: "꼼꼼한 거 인정합니다" },
    ],
    // 정답 공개 직전: 680원/700원 답이 갈리는 채팅을 촘촘히(참여감 각색 — 답 내용·이름 형식은 실제 로그 기준)
    chats: [
      { t: 0.2, name: "서울 초5", text: "쏜생님 답 알려주세요!!" },
      { t: 0.5, name: "인천 초4", text: "680원" },
      { t: 0.8, name: "경기 초5", text: "700원??" },
      { t: 1.05, name: "경남 초5", text: "680" },
      { t: 1.3, name: "전북 초5", text: "700" },
      { t: 1.55, name: "부산 초5", text: "680원!!" },
      { t: 1.8, name: "서울 초4", text: "700원이요" },
      { t: 2.05, name: "충북 초4", text: "680" },
      { t: 2.3, name: "대전 초4", text: "저도 680원" },
      { t: 2.55, name: "제주 초5", text: "700원 아닌가요?" },
      { t: 2.8, name: "인천 초5", text: "680원..." },
      { t: 3.05, name: "경기 초4", text: "700!!" },
      { t: 4.8, emoji: "😂" },
      { t: 5.0, emoji: "🎉" },
      { t: 5.3, emoji: "😊" },
      { t: 5.6, emoji: "😂" },
      { t: 8.6, emoji: "🎉" },
      { t: 8.9, emoji: "👏" },
      { t: 9.2, emoji: "🎉" },
      { t: 9.5, emoji: "👏" },
      { t: 9.9, emoji: "😊" },
      { t: 12.4, name: "대전 초4", text: "😂😊" },
    ],
  },
  {
    file: "clips/0913/c1b.mp4",
    camFile: "clips/0913/cam_c1b.mp4",
    source: "51:12.7 ~ 51:17.9",
    duration: 5.24,
    label: "손 들고 답해요",
    desc: "화상 수업이지만 활발하게 참여하도록 이끌어요",
    cam: CAM_BL,
    board: PAGE,
    captions: [
      { start: 0.1, end: 3.2, text: "680원! 680원\n손 들어보자" },
      { start: 3.2, end: 5.2, text: "[[680원]] 엄청 많았어,\n친구들" },
    ],
    chats: [
      { t: 0.5, name: "초5", text: "680" },
      { t: 1.1, name: "인천 초4", text: "680원" },
      { t: 1.9, emoji: "✋" },
      { t: 2.1, emoji: "✋" },
      { t: 2.3, emoji: "✋" },
      { t: 2.6, emoji: "✋" },
      { t: 2.9, emoji: "✋" },
      { t: 3.2, emoji: "✋" },
      { t: 3.6, emoji: "✋" },
    ],
  },
  {
    file: "clips/0913/c2.mp4",
    camFile: "clips/0913/cam_c2.mp4",
    source: "51:25.0 ~ 51:51.4",
    duration: 26.4,
    label: "틀린 이유까지 콕",
    desc: "왜 680원이 아닌지, 함정을 함께 확인해요",
    cam: CAM_BL,
    board: PAGE_WRITE,
    captions: [
      { start: 0.0, end: 1.4, text: "왜 700원이지?" },
      { start: 1.4, end: 3.6, text: "친구들이 680원이\n너무 많아서" },
      { start: 3.6, end: 5.4, text: "열심히 분석을 해봤지" },
      { start: 5.4, end: 9.0, text: "바로바로 그것만\n미리 말해주면" },
      { start: 9.0, end: 13.4, text: "붕어빵을 5개 + 낱개 4개\n살 수가 있고" },
      { start: 13.4, end: 17.6, text: "또는 5개짜리를\n2개 살 수 있어요" },
      { start: 18.0, end: 21.6, text: "근데 5개를 2개 사서\n10개 사는 게 [[더 싸요]]" },
      { start: 22.4, end: 24.9, text: "이것이 [[함정]]이었습니다" },
      { start: 24.9, end: 26.4, text: "이해 됐습니까?" },
    ],
    chats: [
      { t: 21.8, emoji: "😮" },
      { t: 22.2, emoji: "😮" },
      { t: 23.0, name: "서울 초5", text: "답 채인지! 700원" },
      { t: 23.9, name: "경기 초5", text: "계산하니 그러네요" },
      { t: 24.4, emoji: "😂" },
      { t: 24.7, emoji: "😊" },
      { t: 25.0, emoji: "👍" },
      { t: 25.3, emoji: "😂" },
      { t: 25.7, emoji: "⭕" },
    ],
  },
  {
    file: "clips/0913/c3.mp4",
    camFile: "clips/0913/cam_c3.mp4",
    source: "55:00.7 ~ 55:17.2",
    duration: 16.56,
    label: "습관을 잡아주는 한마디",
    desc: "어려운 문제일수록 하나씩 적으며 푸는 연습",
    bigBoard: true,
    cam: CAM_TR,
    board: SOLVE,
    captions: [
      { start: 0.1, end: 4.4, text: "특히나 어려운 문제 풀 때\n진짜 도움이 돼요" },
      { start: 5.0, end: 7.4, text: "쉬운 문제 풀 때는\n암산하지" },
      { start: 7.4, end: 10.7, text: "암산도 괜찮고,\n빠르게 푸는 것도 괜찮은데" },
      { start: 10.7, end: 15.2, text: "어려운 문제 풀 때는\n[[하나씩 하나씩 적어야]]" },
      { start: 15.2, end: 16.5, text: "더 잘 풀 수 있어요" },
    ],
    chats: [],
  },
  {
    file: "clips/0913/c4.mp4",
    camFile: "clips/0913/cam_c4.mp4",
    source: "56:56.2 ~ 57:03.0",
    duration: 6.8,
    label: "자신감과 재미까지",
    desc: "초등 수학은 자신감과 재미도 중요해요",
    cam: CAM_TR,
    board: PAGE,
    captions: [
      { start: 0.1, end: 2.0, text: "자신감이 다시 붙었다" },
      { start: 2.0, end: 4.25, text: "붕어빵에서 떨어진\n[[자존심]]이" },
      { start: 4.25, end: 6.8, text: "분수 계산으로\n살아나고 있습니다" },
    ],
    chats: [
      { t: 2.6, name: "서울 초4", text: "붕어빵, 배신할 거야..." },
      { t: 3.8, name: "경기 초5", text: "ㅋㅋㅋㅋㅋㅋㅋ" },
      { t: 4.4, emoji: "😂" },
      { t: 4.7, emoji: "👍" },
      { t: 5.0, emoji: "⭕" },
      { t: 5.3, emoji: "😂" },
      { t: 5.7, emoji: "😂" },
      { t: 6.0, emoji: "👍" },
      { t: 6.4, emoji: "😂" },
      { t: 6.8, emoji: "⭕" },
      { t: 7.2, emoji: "😂" },
      { t: 7.6, emoji: "👍" },
      { t: 8.0, emoji: "😂" },
    ],
  },
];

export const DATA_0913: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "EP.01",
  icon: "clips/0913/bungeoppang.svg",
  title: "붕어빵의 함정",
  hook: "초등 수학은\n[[꼼꼼함]]이\n실력입니다",
  subtitle: "초등경시 특강 · 이렇게 수업해요",
  clips: CLIPS,
  holdAfterLast: 90, // 3초: 마지막 채팅 반응이 다 뜨도록
  // 아웃트로: 프로필 사진·링크는 litt.ly/klee_castle 에서 가져옴 (source/0913/littly_data.json)
  outro: {
    lines: ["카이스트 박사 선생님과 함께하는", "초등 수학 경시 특강", "대치동캐슬에서 만나요"],
    photo: "clips/0913/profile.jpg",
    links: [
      { icon: "💬", label: "초등 학부모 오픈카톡방", url: "https://open.kakao.com/o/giv5x7Ai" },
      { icon: "🏠", label: "대치동캐슬 홈페이지 · 수업/특강 신청", url: "https://www.daechicastle.kr" },
      { icon: "▶", label: "유튜브 @klee_castle", url: "https://www.youtube.com/@klee_castle" },
    ],
    footer: "모든 링크 한 번에 · litt.ly/klee_castle",
    note: "링크는 댓글에 👇",
  },
};
