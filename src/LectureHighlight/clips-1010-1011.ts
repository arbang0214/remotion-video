// 2026-10-10·11 주말 특강 하이라이트 시안 3편 — 다음 주 특강 카톡 홍보용(인스타·유튜브 겸용)
// 게임 말고 수업 자체: 어떤 문제를, 어떻게 풀고 설명하고, 아이들이 어떻게 참여하는지
// 원본: ~/classvideo/archive/*.mp4 → source/cut_1010_1011.py 로 잘라 public/clips/1010a·1010b·1011a/
// 학생 이름이 나오는 곳은 구간 사이로 잘라냈고, 학생 발화(kid)는 음높이를 살짝 올림. 표기는 이름·학년 없이 "친구".
// 수업 화면 파일은 선생님 캠 자리를 배경색으로 덮어 두었음(판서 영역에 캠이 겹쳐 보이지 않게)
import { TEACHER } from "./clips";
import { DATA_0913 } from "./clips-0913";
import type { Clip, HighlightData, Rect } from "./clips";

const CAM_TR: Rect = { x: 1448, y: 0, w: 472, h: 266 };

// ── A. 10/10 오후 최상위수학 5-1 (분수의 덧셈과 뺄셈) — 1/12+1/20+1/30+1/42
const A_PAGE: Rect = { x: 70, y: 20, w: 1215, h: 1080 }; // a1: 확대 전 교재 페이지(문제 + 분홍 힌트 + 정답 동그라미)
const A_ZOOM: Rect = { x: 100, y: 60, w: 1520, h: 1000 }; // a2·a3: 확대한 문제 + 오른쪽 정답(4/21)
const A_WORK: Rect = { x: 330, y: 80, w: 1080, h: 960 }; // a4: 1/12=1/3−1/4 … 세로 합 판서

const A_CLIPS: Clip[] = [
  {
    file: "clips/1010a/a1.mp4",
    camFile: "clips/1010a/cam_a1.mp4",
    source: "31:57.2 ~ 32:21.0 (중간 반복 컷)",
    duration: 18.3,
    label: "통분하면 멈추세요!",
    desc: "1/12 + 1/20 + 1/30 + 1/42 = ?",
    cam: CAM_TR,
    board: A_PAGE,
    captions: [
      { start: 1.4, end: 3.96, text: "친구들, 이거 [[통분]]하고 있으면\n멈추세요!" },
      { start: 3.96, end: 5.74, text: "통분하는 문제가 [[아니었어요]]" },
      { start: 5.74, end: 10.1, text: "정답은 [[21분의 4]]" },
      { start: 10.18, end: 14.2, text: "통분 [[안 하고]]\n21분의 4 풀었다?" },
      { start: 14.2, end: 16.1, text: "통분 안 하고 푼 친구 있을까?" },
      { start: 16.14, end: 18.3, text: "오, [[거의 없구나]]" },
    ],
  },
  {
    file: "clips/1010a/a2.mp4",
    camFile: "clips/1010a/cam_a2.mp4",
    source: "32:23.9 ~ 32:49.4",
    duration: 19.9,
    label: "중·고등까지 쓰는 별표 기술",
    desc: "분모를 연속하는 두 수의 곱으로",
    cam: CAM_TR,
    board: A_ZOOM,
    fit: "contain",
    captions: [
      { start: 1.3, end: 3.2, text: "여기 나온 이거 있지" },
      { start: 3.24, end: 6.6, text: "이거 [[별표]]입니다\n엄청 많이 나와요" },
      { start: 6.6, end: 11.0, text: "분수를 하면\n[[중학교]] 때도 나오고요" },
      { start: 11.02, end: 14.6, text: "[[고등학교]] 때도 나옵니다" },
      { start: 14.62, end: 19.9, text: "분모를 [[연속하는 두 수]]로\n바꾸는 거예요" },
    ],
  },
  {
    file: "clips/1010a/a3.mp4",
    camFile: "clips/1010a/cam_a3.mp4",
    source: "32:52.1 ~ 33:37.9 (이름·공백 컷)",
    duration: 26.8,
    label: "직접 바꿔 볼까?",
    desc: "1/12 = 1/(3×4) = ?",
    cam: CAM_TR,
    board: A_ZOOM,
    fit: "contain",
    kidLabel: "친구",
    kid: [
      { start: 8.8, end: 11.3 },
      { start: 20.2, end: 24.65 },
    ],
    captions: [
      { start: 0.0, end: 3.6, text: "제일 처음에는\n[[12분의 1]]부터 해보자" },
      { start: 3.64, end: 7.5, text: "요렇게 바꾸려면\n어떻게 바꿀 수 있지?" },
      { start: 8.9, end: 11.3, text: "3 곱하기 4로 하는 거…", who: "kid" },
      { start: 11.32, end: 13.36, text: "그렇지, [[3×4]]분의 1이야" },
      { start: 13.36, end: 15.6, text: "이거를 어떻게 또 쓸 수 있을까?" },
      { start: 18.0, end: 20.1, text: "요거랑 똑같이 생각하면" },
      { start: 20.2, end: 24.6, text: "[[3분의 1 빼기 4분의 1]]?", who: "kid" },
      { start: 24.62, end: 26.8, text: "맞습니다! 와, [[잘했습니다]]" },
    ],
    chats: [
      { t: 24.8, emoji: "👏" },
      { t: 25.2, emoji: "👏" },
      { t: 25.7, emoji: "👍" },
    ],
  },
  {
    file: "clips/1010a/a4.mp4",
    camFile: "clips/1010a/cam_a4.mp4",
    source: "33:38.4 ~ 35:11.7 (중간 컷)",
    duration: 40.3,
    label: "세로로 더하면 싹 사라져요",
    desc: "가운데는 지워지고 처음과 끝만 남는다",
    cam: CAM_TR,
    board: A_WORK,
    captions: [
      { start: 0.0, end: 3.4, text: "이걸 할 줄 알면\n문제가 [[훨씬 쉬워져요]]" },
      { start: 3.94, end: 10.4, text: "그럼 우리가 할 일은?\n얘를 [[다 더해버리는]] 거네" },
      { start: 10.58, end: 15.6, text: "선생님이 [[새로운 더하기 방법]]을\n알려주겠습니다" },
      { start: 15.82, end: 19.1, text: "[[세로 합]]이라고 들어봤니?\n세로로 더해버려" },
      { start: 19.14, end: 25.4, text: "4분의 1, 5분의 1, 6분의 1…\n[[다 없어져요]]" },
      { start: 25.4, end: 33.4, text: "마지막에 남는 건\n[[3분의 1 빼기 7분의 1]] 하나" },
      { start: 33.4, end: 40.3, text: "계산하면 [[21분의 4]]" },
    ],
    chats: [
      { t: 21.5, emoji: "😮" },
      { t: 23.0, emoji: "✨" },
      { t: 36.5, emoji: "👏" },
      { t: 37.0, emoji: "👏" },
    ],
  },
];

// ── B. 10/10 저녁 최상위수학 6-1 (여러 가지 그래프) — 반올림해서 더하면 101%
const B_SLIDE: Rect = { x: 80, y: 50, w: 1640, h: 1000 }; // 문제 슬라이드·정답 표 슬라이드 공통

const B_CLIPS: Clip[] = [
  {
    file: "clips/1010b/b1.mp4",
    camFile: "clips/1010b/cam_b1.mp4",
    source: "14:44.6 ~ 15:31.9 (풀이 시간 컷)",
    duration: 8.8,
    label: "과연 100%일까요?",
    desc: "사과 3명·배 2명·귤 2명, 반올림해서 더하면?",
    cam: CAM_TR,
    board: B_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 1.8, text: "이 문제입니다" },
      { start: 2.5, end: 7.3, text: "더해보세요, 더해보십시오" },
      { start: 7.38, end: 8.8, text: "과연 [[100]]일까요?" },
    ],
    chats: [{ t: 2.9, name: "초4", text: "100% 아니에요?? 다 더했으니까" }],
  },
  {
    file: "clips/1010b/b2.mp4",
    camFile: "clips/1010b/cam_b2.mp4",
    source: "17:01.3 ~ 17:44.0 (이름·공백 컷)",
    duration: 28.3,
    label: "다 더하면 당연히 100?",
    desc: "선생님이 준비한 함정",
    cam: CAM_TR,
    board: B_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.88, end: 5.58, text: "친구들은 항상\n다 더하면 [[100%]]일 것 같지" },
      { start: 5.58, end: 8.98, text: "더하면 당연히 100 아니야?\n다 더했는데 100 아닙니까?" },
      { start: 11.54, end: 15.42, text: "이 질문에\n[[아닌 경우]]가 있습니다" },
      { start: 15.42, end: 18.6, text: "세상에, [[말이 되나?]]" },
      { start: 18.94, end: 21.6, text: "100도 아니고,\n98도 아닙니다" },
      { start: 22.7, end: 28.3, text: "[[101%]]입니다!\n101% 한 명도 없었던 거" },
    ],
    chats: [
      { t: 0.3, name: "초4", text: "98%" },
      { t: 3.7, name: "초5", text: "98%" },
      { t: 23.6, emoji: "😮" },
      { t: 24.0, emoji: "🤯" },
      { t: 24.6, emoji: "😮" },
    ],
  },
  {
    file: "clips/1010b/b3.mp4",
    camFile: "clips/1010b/cam_b3.mp4",
    source: "17:47.5 ~ 18:12.3",
    duration: 23.0,
    label: "반올림의 함정",
    desc: "하나씩 반올림한 다음에 더하면?",
    cam: CAM_TR,
    board: B_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 4.1, text: "이거 소수점 첫째 자리에서\n반올림하면" },
      { start: 4.18, end: 10.1, text: "[[29%]]잖아, 그치?\n이것도 29%고" },
      { start: 11.66, end: 13.8, text: "반올림 [[전에]] 더하면 100" },
      { start: 13.86, end: 19.0, text: "반올림을 하고 [[나서]] 더하면\n[[101]]이 돼요" },
      { start: 19.04, end: 20.8, text: "어떻게 된 거지?" },
      { start: 20.84, end: 23.0, text: "친구들 [[충격받은 표정]]이\n너무 큰데?" },
    ],
    chats: [
      { t: 19.6, emoji: "🤯" },
      { t: 21.0, emoji: "😱" },
      { t: 21.5, emoji: "😮" },
    ],
  },
  {
    file: "clips/1010b/b4.mp4",
    camFile: "clips/1010b/cam_b4.mp4",
    source: "18:28.4 ~ 18:56.0",
    duration: 25.1,
    label: "100보다 작아질 수도?",
    desc: "같은 7명이라도 나누는 방법에 따라",
    cam: CAM_TR,
    board: B_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 6.2, text: "그러면 100보다, 101보다\n[[적은 경우]]도 있을까?" },
      { start: 7.72, end: 8.52, text: "있을까, 없을까?" },
      { start: 9.12, end: 11.0, text: "3명·2명·2명이면 [[101]]" },
      { start: 12.06, end: 18.08, text: "5명·1명·1명이면\n[[99%]]가 나옵니다" },
      { start: 19.68, end: 23.84, text: "7분의 1이 일곱 개면\n[[98%]]" },
      { start: 23.84, end: 25.1, text: "친구들 98% 많았지?" },
    ],
  },
  {
    file: "clips/1010b/b5.mp4",
    camFile: "clips/1010b/cam_b5.mp4",
    source: "19:03.3 ~ 19:22.7",
    duration: 15.4,
    label: "아, 이럴 수도 있구나",
    desc: "틀린 줄 알고 당황하지 않는 힘",
    cam: CAM_TR,
    board: B_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 3.9, text: "[[반올림의 함정]]이랄까?" },
      { start: 4.24, end: 11.4, text: "나중에 그래프에서 다 더했는데\n[[101]]이 나오면 당황스럽잖아" },
      { start: 12.04, end: 15.4, text: "그럴 때 '아, [[이럴 수도 있구나]]'\n생각하면 돼요" },
    ],
  },
];

// ── C. 10/11 초등경시 5-2 (합동과 대칭) — 점대칭이면서 짝수인 다섯 자리 수(105개)
const C_SLIDE: Rect = { x: 60, y: 60, w: 1800, h: 1000 }; // c1: 문제 슬라이드(심화 ②)
const C_BOARD: Rect = { x: 180, y: 40, w: 1130, h: 1004 }; // c5: 다섯 칸 + 아래로 길어진 화살표 판서
const C_TOP: Rect = { x: 260, y: 20, w: 1000, h: 889 }; // c2~c4: 판서가 위쪽에만 있을 때 크게

const C_CLIPS: Clip[] = [
  {
    file: "clips/1011a/c1.mp4",
    camFile: "clips/1011a/cam_c1.mp4",
    source: "26:57.4 ~ 27:07.8",
    duration: 10.35,
    label: "오늘의 경시 문제",
    desc: "점대칭이면서 짝수인 다섯 자리 수는 몇 개?",
    cam: CAM_TR,
    board: C_SLIDE,
    fit: "contain",
    captions: [
      { start: 0.0, end: 3.4, text: "자, 이번에는요" },
      { start: 3.52, end: 7.0, text: "똑같이 [[다섯 자리]]를 만드는데요" },
      { start: 8.18, end: 10.35, text: "[[짝수]]인 것만 찾으면?" },
    ],
  },
  {
    file: "clips/1011a/c2.mp4",
    camFile: "clips/1011a/cam_c2.mp4",
    source: "30:08.5 ~ 30:38.0 (반복 컷)",
    duration: 20.4,
    label: "정답은 105개",
    desc: "이번엔 맞힌 친구가 많지 않았어요",
    cam: CAM_TR,
    board: C_TOP,
    captions: [
      { start: 0.0, end: 4.18, text: "정답은 [[105개]]였습니다" },
      { start: 5.44, end: 8.44, text: "충격! 으으으… 충격" },
      { start: 9.36, end: 12.3, text: "[[3 × 7 × 5]]였습니다" },
      { start: 12.78, end: 17.5, text: "105개 맞은 친구들 있나?\n이번에는 많진 않던데?" },
      { start: 17.74, end: 20.4, text: "[[함정]]들이 좀 있었어" },
    ],
    // 문제 푸는 동안(28:34~29:45) 실제로 올라온 답들
    chats: [
      { t: 0.4, name: "초4", text: "98" },
      { t: 0.9, name: "초5", text: "140" },
      { t: 1.4, name: "초5", text: "105개" },
      { t: 1.9, name: "초4", text: "147" },
    ],
  },
  {
    file: "clips/1011a/c3.mp4",
    camFile: "clips/1011a/cam_c3.mp4",
    source: "30:40.7 ~ 31:29.3 (이름·공백 컷)",
    duration: 34.08,
    label: "친구가 직접 설명해요",
    desc: "어떻게 풀었는지 말로 설명하기",
    cam: CAM_TR,
    board: C_TOP,
    kidLabel: "첫 번째 친구",
    kid: [{ start: 2.28, end: 31.83 }],
    captions: [
      { start: 0.0, end: 2.28, text: "자, 한번 [[설명]]해볼 수 있을까?" },
      { start: 2.28, end: 8.1, text: "다섯 자리 수인데\n앞에 [[세 자리만]] 봤어요", who: "kid" },
      { start: 8.12, end: 15.4, text: "첫 번째 자리는\n짝수가 된다고 했으니까", who: "kid" },
      { start: 16.16, end: 21.5, text: "홀수가 안 되니까 1, 5, 9가 안 돼서\n[[3개]]밖에 안 되고", who: "kid" },
      { start: 22.4, end: 25.2, text: "두 번째는 똑같이 [[7개]]", who: "kid" },
      { start: 25.24, end: 31.8, text: "세 번째는 5개여서\n3×7×5 = [[105개]]가 나왔어요", who: "kid" },
      { start: 32.14, end: 34.08, text: "네, 7개고 5개" },
    ],
  },
  {
    file: "clips/1011a/c4.mp4",
    camFile: "clips/1011a/cam_c4.mp4",
    source: "31:30.8 ~ 32:10.8 (이름 컷)",
    duration: 31.37,
    label: "어디가 틀렸을까?",
    desc: "답은 맞았지만, 설명 속 실수를 친구가 찾아요",
    cam: CAM_TR,
    board: C_TOP,
    kidLabel: "두 번째 친구",
    kid: [
      { start: 12.3, end: 13.35 },
      { start: 13.35, end: 28.8 },
    ],
    captions: [
      { start: 0.0, end: 4.74, text: "답은 맞았는데 서술형이었으면\n아마 [[90점]]이었을 것 같아" },
      { start: 5.82, end: 6.9, text: "그 이유를 말해줄게" },
      { start: 7.08, end: 11.6, text: "좀 [[틀린 게]] 있었다는 거\n말할 수 있는 친구 있나?" },
      { start: 12.8, end: 16.9, text: "아까 끝자리에 [[9가 들어가면]]\n[[안 된다]]고 했잖아요", who: "kid" },
      { start: 17.64, end: 24.2, text: "근데 9가 들어가면 마지막 자리에\n[[6]]이 들어가니까 짝수라 되고", who: "kid" },
      { start: 24.24, end: 28.7, text: "오히려 [[맨 앞자리에 6]]이\n들어가면 안 돼요", who: "kid" },
      { start: 28.72, end: 31.37, text: "오, 그렇지! 와, [[잘했습니다]]" },
    ],
    chats: [
      { t: 25.5, emoji: "😮" },
      { t: 29.0, emoji: "👏" },
      { t: 29.4, emoji: "👏" },
      { t: 29.9, emoji: "👍" },
    ],
  },
  {
    file: "clips/1011a/c5.mp4",
    camFile: "clips/1011a/cam_c5.mp4",
    source: "32:10.8 ~ 33:33.4 (중간 컷)",
    duration: 39.66,
    label: "함정은 끝자리에",
    desc: "점대칭한 뒤 짝수가 되는 수를 찾아라",
    cam: CAM_TR,
    board: C_BOARD,
    captions: [
      { start: 0.0, end: 3.84, text: "이 문제의 [[첫 번째 함정]]은" },
      { start: 3.84, end: 7.98, text: "마지막 자리,\n여기만 [[짝수]]가 들어가면 됩니다" },
      { start: 7.98, end: 11.84, text: "점대칭을 한 다음에\n짝수가 되는 수여야 하니까" },
      { start: 11.84, end: 17.3, text: "제일 쉬운 건\n[[2]]랑 [[8]]이 있고요" },
      { start: 17.32, end: 24.2, text: "그 다음에 [[9]]가 여기 들어갑니다\n9를 점대칭하면" },
      { start: 24.24, end: 33.06, text: "2는 2, 8은 8,\n9는 [[6]]이 되잖아요" },
      { start: 33.76, end: 39.66, text: "가운데는 [[아무 숫자]]나 상관없어요\n제일 끝만 보면 돼요" },
    ],
  },
];

const outro = (course: string) => ({ ...DATA_0913.outro!, lines: ["카이스트 박사 선생님과 함께하는", course, "대치동캐슬에서 만나요"] });

export const DATA_1010A: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "풀이 전략",
  title: "통분하면 멈추세요",
  hook: "초등 분수는\n[[통분보다 구조]]를\n먼저 봐야 합니다",
  subtitle: "최상위수학 특강 · 분수의 덧셈과 뺄셈",
  clips: A_CLIPS,
  holdAfterLast: 60,
  outro: outro("초등 최상위수학 특강"),
};

export const DATA_1010B: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "고정관념 깨기",
  title: "다 더했는데 101%?",
  hook: "수학은\n[[당연한 것]]도\n의심해 봐야 합니다",
  subtitle: "최상위수학 특강 · 여러 가지 그래프",
  clips: B_CLIPS,
  holdAfterLast: 60,
  outro: outro("초등 최상위수학 특강"),
};

export const DATA_1011A: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "서로 설명하기",
  title: "친구 설명, 어디가 틀렸을까?",
  hook: "초등 경시는\n[[친구의 설명]]에서도\n배웁니다",
  subtitle: "초등경시 특강 · 합동과 대칭",
  clips: C_CLIPS,
  holdAfterLast: 60,
  outro: outro("초등 수학 경시 특강"),
};

// ── 시안C 분할(2026-10-16): 한 편에 한 사람만 설명하도록 쪼갬. 도입(c1 문제·c2 정답)은 빼고 설명부터 바로 시작
// 문제는 챕터 설명(desc)에 한 줄로 띄워 맥락만 줌
// 한 편에 친구가 한 명뿐이라 "첫 번째/두 번째" 대신 그냥 "친구"
const [, , C3, C4, C5] = C_CLIPS;
const C_PROBLEM = "점대칭이면서 짝수인 다섯 자리 수는 몇 개?";

export const DATA_1011A1: HighlightData = {
  ...DATA_1011A,
  episode: "말로 설명하기",
  title: "친구가 직접 설명해요",
  hook: "초등 경시는\n[[말로 설명]]할 수 있어야\n진짜 아는 겁니다",
  clips: [
    {
      ...C3,
      desc: C_PROBLEM,
      kidLabel: "친구",
      notes: [{ start: 32.0, end: 34.08, text: "3 × 7 × 5 = 105개, 정답! 🎉" }],
    },
  ],
};

// 10초 안에 학생 설명이 나오게 c4 의 "90점…" 도입을 뺀 c4s 사용(c4 보다 9.65초 앞당겨짐)
const C4S_SHIFT = 9.65;
const shift = <T extends { start: number; end: number }>(xs: T[]) => xs.map((x) => ({ ...x, start: x.start - C4S_SHIFT, end: x.end - C4S_SHIFT }));

export const DATA_1011A2: HighlightData = {
  ...DATA_1011A,
  clips: [
    {
      ...C4,
      file: "clips/1011a/c4s.mp4",
      camFile: "clips/1011a/cam_c4s.mp4",
      source: "31:42.2 ~ 32:10.8 (이름 컷)",
      duration: 21.72,
      desc: C_PROBLEM,
      kidLabel: "친구",
      kid: [{ start: 2.65, end: 19.15 }],
      captions: [
        { start: 0.0, end: 2.65, text: "[[틀린 게]] 있었다는 거\n말할 수 있는 친구 있나?" },
        ...shift(C4.captions.filter((c) => c.start >= 12)),
      ],
      chats: C4.chats!.map((c) => ({ ...c, t: c.t - C4S_SHIFT })),
      // 앞 친구(c3)의 설명은 이 편에 없으므로 무엇을 고치는지 메모로 깔아 둠
      notes: [{ start: 0.0, end: 8.0, text: "앞 친구 설명: 3 × 7 × 5 = 105개\n\"첫 자리에 1·5·9는 안 돼서 3개\"" }],
    },
  ],
};

export const DATA_1011A3: HighlightData = {
  ...DATA_1011A,
  episode: "선생님 풀이",
  title: "함정은 끝자리에",
  hook: "점대칭 문제의\n[[함정]]은\n끝자리에 있습니다",
  clips: [{ ...C5, desc: C_PROBLEM }],
};

// ── 시안B 1분 편집(2026-10-16): 질문 → 101 반전 → 반올림 이유 → 마무리 한 마디. 99%·98% 확장(b4)은 뺌
const [B1, B2, B3, , B5] = B_CLIPS;

export const DATA_1010B60: HighlightData = {
  ...DATA_1010B,
  clips: [
    B1,
    {
      ...B2,
      file: "clips/1010b/b2s.mp4",
      camFile: "clips/1010b/cam_b2s.mp4",
      source: "17:21.6 ~ 17:42.4 (반전만)",
      duration: 7.09,
      label: "",
      captions: [
        { start: 0.0, end: 2.29, text: "100도 아니고,\n98도 아닙니다" },
        { start: 2.29, end: 4.09, text: "[[101%]]입니다!" },
        { start: 4.09, end: 7.09, text: "101% 한 명도 없었던 거" },
      ],
      chats: [
        { t: 2.6, emoji: "😮" },
        { t: 3.0, emoji: "🤯" },
        { t: 3.6, emoji: "😮" },
      ],
    },
    {
      ...B3,
      file: "clips/1010b/b3s.mp4",
      camFile: "clips/1010b/cam_b3s.mp4",
      source: "17:48.7 ~ 18:12.3 (공백 컷)",
      duration: 19.4,
      captions: [
        { start: 0.0, end: 4.1, text: "이거 소수점 첫째 자리에서\n반올림하면" },
        { start: 4.1, end: 8.1, text: "[[29%]]잖아, 그치?\n이것도 29%고" },
        { start: 9.38, end: 11.8, text: "반올림 [[전에]] 더하면 100" },
        { start: 11.9, end: 15.12, text: "반올림을 하고 [[나서]] 더하면\n[[101]]이 돼요" },
        { start: 15.12, end: 16.8, text: "어떻게 된 거지?" },
        { start: 16.8, end: 19.4, text: "친구들 [[충격받은 표정]]이\n너무 큰데?" },
      ],
      chats: [
        { t: 15.7, emoji: "🤯" },
        { t: 16.4, emoji: "😱" },
        { t: 17.0, emoji: "😮" },
      ],
    },
    {
      ...B5,
      file: "clips/1010b/b5s.mp4",
      camFile: "clips/1010b/cam_b5s.mp4",
      source: "19:15.5 ~ 19:22.6",
      duration: 7.1,
      label: "",
      captions: [
        { start: 0.0, end: 3.2, text: "다 더했는데 [[101]]이 나오면\n당황스럽잖아" },
        { start: 3.2, end: 7.1, text: "그럴 때 '아, [[이럴 수도 있구나]]'\n생각하면 돼요" },
      ],
    },
  ],
};
