// 2026-09-19 초등 최상위수학 특강 1부 — "선생님, 제가 설명할게요" (직선 13개 교점 문제, 아이가 직접 설명)
// 원본: source/0919/part1.mov (영상 0초 = 16:29:47) → source/0919/cut_0919a.py 로 잘라 public/clips/0919a/
// 학생 이름이 나오는 곳은 구간 사이로 잘라냈고, 학생 발화(kid)는 음높이를 살짝 올림. 표기는 학년만.
import { TEACHER } from "./clips";
import { DATA_0913 } from "./clips-0913";
import type { Clip, HighlightData, Rect } from "./clips";

const CAM_TR: Rect = { x: 1468, y: 0, w: 452, h: 254 };
const PROB_ZOOM: Rect = { x: 350, y: 300, w: 1340, h: 600 }; // a1: 확대 보기(타이머 왼쪽 위) — 지문 + 그림
const PROB: Rect = { x: 500, y: 400, w: 1260, h: 500 }; // a2·a3: 그림 + 아래 판서(1, 1+2, 1+2+3 … 1+2+…+13) 확대
const SLIDE: Rect = { x: 60, y: 260, w: 1780, h: 720 }; // a4: 심화 슬라이드(가장 적을 때는?)
const TABLE: Rect = { x: 440, y: 260, w: 1240, h: 800 }; // a5: 직선/점 개수 표 + 13×6=78 풀이

const CLIPS: Clip[] = [
  {
    file: "clips/0919a/a1.mp4",
    camFile: "clips/0919a/cam_a1.mp4",
    source: "48:30.9 ~ 48:41.7",
    duration: 10.8,
    label: "답보다 '왜'를 물어요",
    desc: "숫자 패턴 말고, 왜 그 숫자가 나오는지",
    cam: CAM_TR,
    board: PROB_ZOOM,
    fit: "contain",
    captions: [
      { start: 0.0, end: 2.6, text: "이거 [[설명]]할 수 있는 친구 있으면" },
      { start: 2.6, end: 4.6, text: "진짜 선생님이 칭찬해 줄게" },
      { start: 4.6, end: 7.6, text: "그러니까 숫자가\n[[왜]] 그런지…" },
      { start: 7.6, end: 10.8, text: "숫자 패턴 말고\n[[왜 그 숫자가 나오는지]]" },
    ],
  },
  {
    file: "clips/0919a/a2.mp4",
    camFile: "clips/0919a/cam_a2.mp4",
    source: "50:31.6 ~ 51:16.0",
    duration: 44.38,
    label: "친구가 직접 설명해요",
    desc: "마이크 켜고 내 풀이를 말로 설명하는 수업",
    cam: CAM_TR,
    board: PROB,
    fit: "contain",
    kidLabel: "초4 친구",
    kid: [
      { start: 3.25, end: 17.48 },
      { start: 18.0, end: 37.85 },
    ],
    captions: [
      { start: 0.1, end: 3.2, text: "자, 설명 한번 해주세요" },
      { start: 3.3, end: 8.6, text: "첫 번째는\n[[교차점이 하나]]고요", who: "kid" },
      { start: 10.9, end: 13.7, text: "두 번째는 늘어난 게…", who: "kid" },
      { start: 13.7, end: 17.5, text: "원래 있던 1에서\n[[1 + 2]]가 돼요", who: "kid" },
      { start: 20.1, end: 22.6, text: "그리고요, 그리고 또", who: "kid" },
      { start: 22.6, end: 26.2, text: "세 번째는\n원래 있던 1 + 2에다가", who: "kid" },
      { start: 26.2, end: 31.2, text: "또 하나를 추가해서\n[[1 + 2 + 3]]이 돼서", who: "kid" },
      { start: 32.0, end: 35.3, text: "직선 13개면\n1 + 2부터 시작해서", who: "kid" },
      { start: 35.3, end: 37.85, text: "13까지 더하면\n91이 나와요", who: "kid" },
      { start: 37.85, end: 41.8, text: "네, 이렇게 했었군요" },
      { start: 41.8, end: 44.38, text: "아주 [[잘했어요]]" },
    ],
    notes: [{ start: 36.4, end: 44.38, text: "✏️ 규칙은 정확! 계산만 살짝 —\n선생님이 뒤에서 짚어줘요" }],
    chats: [
      { t: 0.2, name: "초4", text: "제가 설명을!" },
      { t: 41.9, emoji: "👏" },
      { t: 42.3, emoji: "👏" },
      { t: 42.8, emoji: "👍" },
    ],
  },
  {
    file: "clips/0919a/a3.mp4",
    camFile: "clips/0919a/cam_a3.mp4",
    source: "51:20.4 ~ 51:51.2 (중간 공백·이름 컷)",
    duration: 24.05,
    label: "'왜'까지 스스로",
    desc: "직선이 하나 늘면, 만나는 점은 몇 개 늘까?",
    cam: CAM_TR,
    board: PROB,
    fit: "contain",
    kidLabel: "초4 친구",
    kid: [
      { start: 7.25, end: 10.75 },
      { start: 10.85, end: 15.95 },
    ],
    captions: [
      { start: 0.0, end: 4.2, text: "[[왜]] 이렇게 하나씩\n더해지는지 알아?" },
      { start: 4.2, end: 7.2, text: "그거 설명할 수 있을까?" },
      { start: 7.3, end: 10.8, text: "그거는… 그거는…", who: "kid" },
      { start: 11.0, end: 13.8, text: "직선이 있으면\n추가할 수 있는 직선이", who: "kid" },
      { start: 13.8, end: 16.0, text: "[[하나씩 더 추가]]가 돼요", who: "kid" },
      { start: 16.0, end: 19.5, text: "와~ 알겠습니다\n고맙습니다" },
      { start: 19.5, end: 20.8, text: "좋아요" },
      { start: 20.8, end: 22.8, text: "자, 방금\n진짜 [[설명 잘했어]]" },
      { start: 22.8, end: 24.05, text: "선생님이 [[원하는 답]]을 했어" },
    ],
    chats: [
      { t: 16.2, emoji: "😮" },
      { t: 16.6, emoji: "👏" },
      { t: 21.0, emoji: "👏" },
      { t: 21.4, emoji: "👏" },
      { t: 21.8, emoji: "❤️" },
      { t: 22.4, emoji: "👍" },
    ],
  },
  {
    file: "clips/0919a/a4.mp4",
    camFile: "clips/0919a/cam_a4.mp4",
    source: "79:42.8 ~ 80:06.5 (중간 공백·이름 컷)",
    duration: 17.9,
    label: "초2 친구도 손 번쩍",
    desc: "그럼 만나는 점이 가장 적을 때는?",
    cam: CAM_TR,
    board: SLIDE,
    fit: "contain",
    kidLabel: "초2 친구",
    kid: [
      { start: 0.75, end: 1.55 },
      { start: 1.55, end: 11.6 },
    ],
    captions: [
      { start: 0.0, end: 1.6, text: "설명 한번 해줄래?" },
      { start: 2.3, end: 6.9, text: "0개인 이유는\n13개를 [[나란히]] 두면", who: "kid" },
      { start: 6.9, end: 11.6, text: "그 점이 [[0개]]라서 그래요", who: "kid" },
      { start: 11.65, end: 13.4, text: "딩동댕동!" },
      { start: 13.4, end: 14.3, text: "박수 한번 쳐주자" },
      { start: 14.3, end: 17.9, text: "이런 [[새로운 문제]]를 잘 푸는 거\n너무 멋진 거예요" },
    ],
    chats: [
      { t: 0.1, name: "초4", text: "0" },
      { t: 0.5, name: "초3", text: "0" },
      { t: 0.9, name: "초3", text: "000000000000" },
      { t: 2.3, name: "초5", text: "0" },
      { t: 11.8, emoji: "🎉" },
      { t: 12.1, emoji: "🎉" },
      { t: 13.5, emoji: "👏" },
      { t: 13.8, emoji: "👏" },
      { t: 14.1, emoji: "👏" },
      { t: 15.0, emoji: "❤️" },
    ],
  },
  {
    file: "clips/0919a/a5.mp4",
    camFile: "clips/0919a/cam_a5.mp4",
    source: "54:59.8 ~ 55:10.8",
    duration: 11.0,
    label: "아는 것 ≠ 설명하는 것",
    desc: "틀려도 원리를 말하면 박수받는 수업",
    cam: CAM_TR,
    board: TABLE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 3.8, text: "계산은 12 대신 13으로 해서\n틀렸지만" },
      { start: 3.8, end: 6.3, text: "[[원리]]를 잘 이해하고 있어" },
      { start: 6.3, end: 8.5, text: "그리고 그걸\n[[설명]]을 잘 해줬어" },
      { start: 8.5, end: 11.0, text: "[[아는 거]]랑 [[설명하는 거]]는\n다르거든" },
    ],
    chats: [
      { t: 4.0, emoji: "👍" },
      { t: 8.8, emoji: "❤️" },
      { t: 9.2, emoji: "👏" },
      { t: 9.6, emoji: "👏" },
    ],
  },
];

export const DATA_0919A: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "직접 설명",
  title: "선생님, 제가 설명할게요",
  hook: "초등 수학은\n[[직접 설명하는 힘]]을\n길러야 합니다",
  subtitle: "최상위수학 특강 · 아이들이 말하는 수업",
  clips: CLIPS,
  holdAfterLast: 60,
  outro: { ...DATA_0913.outro!, lines: ["카이스트 박사 선생님과 함께하는", "초등 최상위수학 특강", "대치동캐슬에서 만나요"] },
};
