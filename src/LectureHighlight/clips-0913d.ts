// 2026-09-13 초등경시 특강 — EP.04 "틀려도 괜찮아" (기약분수 14개 문제, 112:22 ~ 114:07)
// 원본: source/0913/lecture-0913.mp4 (영상 0초 = 18:40:29) → public/clips/0913d/
import { TEACHER } from "./clips";
import { DATA_0913 } from "./clips-0913";
import type { Clip, HighlightData, Rect } from "./clips";

const CAM_TR: Rect = { x: 1438, y: 46, w: 426, h: 240 };
const PROB4: Rect = { x: 380, y: 340, w: 760, h: 675 }; // 문제 04 지문 + 14개 + 분수①②③ 판서

const CLIPS: Clip[] = [
  {
    file: "clips/0913d/k1.mp4",
    camFile: "clips/0913d/cam_k1.mp4",
    source: "112:22.5 ~ 112:34.0",
    duration: 11.5,
    label: "틀려도 괜찮아",
    desc: "풀어주는 것보다 집중해서 푸는 게 더 중요해요",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.1, end: 2.1, text: "선생님은 이 문제를" },
      { start: 2.1, end: 3.4, text: "선생님이 풀어주는 것보다" },
      { start: 3.4, end: 5.7, text: "친구들이 지금처럼\n집중해서 푸는 게" },
      { start: 5.7, end: 7.1, text: "훨씬 중요하다고 생각해" },
      { start: 7.1, end: 8.4, text: "[[틀려도 괜찮아]]" },
      { start: 8.4, end: 10.3, text: "이렇게 집중해서\n푸는 것만 더" },
      { start: 10.3, end: 11.5, text: "너무너무 [[대단합니다]]" },
    ],
    chats: [
      { t: 7.3, emoji: "❤️" },
      { t: 7.7, emoji: "❤️" },
      { t: 8.1, emoji: "👍" },
      { t: 10.5, emoji: "👏" },
      { t: 10.9, emoji: "👏" },
    ],
  },
  {
    file: "clips/0913d/k2.mp4",
    camFile: "clips/0913d/cam_k2.mp4",
    source: "112:34.5 ~ 112:41.0",
    duration: 6.5,
    label: "",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.1, end: 2.3, text: "자, 이 문제의 정답은 바로" },
      { start: 2.3, end: 6.5, text: "[[14개]]였습니다" },
    ],
    chats: [
      { t: 0.3, name: "경기 초5", text: "14" },
      { t: 2.6, emoji: "🎉" },
      { t: 2.9, emoji: "😮" },
      { t: 3.3, emoji: "🎉" },
    ],
  },
  {
    file: "clips/0913d/k3.mp4",
    camFile: "clips/0913d/cam_k3.mp4",
    source: "112:42.4 ~ 112:53.2",
    duration: 10.8,
    label: "맞아도 틀려도 손 들어요",
    desc: "결과보다 끝까지 풀어본 시도를 칭찬해요",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.1, end: 2.0, text: "나 [[14개]] 맞았다!" },
      { start: 2.0, end: 4.5, text: "와, 저 친구 몇 명 있던데" },
      { start: 4.5, end: 5.9, text: "나는 안타깝지만" },
      { start: 5.9, end: 8.6, text: "풀었지만 틀렸다" },
      { start: 8.6, end: 10.8, text: "그래요, [[괜찮아요]]" },
    ],
    chats: [
      { t: 0.5, emoji: "✋" },
      { t: 0.8, emoji: "✋" },
      { t: 1.1, emoji: "✋" },
      { t: 1.5, emoji: "✋" },
      { t: 6.2, name: "대전 초4", text: "저는 소수 찾아서 분수 만들었는데 수가 너무 커졌어요..." },
      { t: 7.4, emoji: "😅" },
      { t: 7.8, emoji: "😅" },
      { t: 9.0, emoji: "👍" },
      { t: 9.4, emoji: "❤️" },
    ],
  },
  {
    file: "clips/0913d/k4.mp4",
    camFile: "clips/0913d/cam_k4.mp4",
    source: "112:53.5 ~ 113:08.9",
    duration: 15.4,
    label: "그룹으로 묶어서 세기",
    desc: "다 적기 전에 범위를 좁히는 법을 배워요",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.4, end: 1.9, text: "자, 집중해서 다시" },
      { start: 1.9, end: 4.5, text: "하나씩 하나씩\n꼼꼼하게 해볼까?" },
      { start: 4.6, end: 9.1, text: "꼼꼼하게 한번 써봅시다" },
      { start: 9.1, end: 13.2, text: "이거를 [[그룹]]을\n잘 지어야 돼" },
      { start: 13.2, end: 15.4, text: "그룹을 어떻게 지어야 되냐면" },
    ],
    chats: [
      { t: 9.6, emoji: "👍" },
      { t: 10.0, emoji: "🤔" },
    ],
  },
  {
    file: "clips/0913d/k5.mp4",
    camFile: "clips/0913d/cam_k5.mp4",
    source: "113:24.9 ~ 113:38.5",
    duration: 13.6,
    label: "",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.1, end: 2.8, text: "분수1을 제일 처음\n만들 때는" },
      { start: 7.3, end: 10.2, text: "[[23과 67]]로\n만들어 보는 거예요" },
      { start: 10.2, end: 11.8, text: "이거를 앞뒤, 뒤앞" },
      { start: 11.8, end: 13.6, text: "이렇게 뒤집어가면서\n만들어 보는 거야" },
    ],
    chats: [],
  },
  {
    file: "clips/0913d/k6.mp4",
    camFile: "clips/0913d/cam_k6.mp4",
    source: "113:56.8 ~ 114:07.0",
    duration: 10.2,
    label: "",
    cam: CAM_TR,
    board: PROB4,
    captions: [
      { start: 0.1, end: 2.8, text: "그러면 분수가\n이 안에 다 들어오거든" },
      { start: 2.9, end: 6.0, text: "그래서 모든 걸 다 적는다고\n생각하기 전에" },
      { start: 6.0, end: 8.9, text: "너무 많은 걸\n[[좁혀보는]] 거지" },
      { start: 8.9, end: 10.2, text: "이 [[세 개]] 안에 다 들어와요" },
    ],
    chats: [
      { t: 8.9, emoji: "😮" },
      { t: 9.3, emoji: "👏" },
      { t: 9.7, emoji: "😮" },
      { t: 10.3, emoji: "👏" },
      { t: 10.9, emoji: "👍" },
    ],
  },
];

export const DATA_0913D: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "EP.04",
  title: "틀려도 괜찮아",
  hook: "초등 수학은\n[[틀리면서]]\n실력이 늡니다",
  subtitle: "초등경시 특강 · 이렇게 수업해요",
  clips: CLIPS,
  holdAfterLast: 90,
  outro: DATA_0913.outro,
};
