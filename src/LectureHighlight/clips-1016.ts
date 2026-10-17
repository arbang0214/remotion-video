// 2026-10-16 요청: 중2 기하 필기(source/1016/*.png) 설명 클립 — 필기하면서 설명한 구간만
// 원본: ~/classvideo/archive/*.mp4 → source/cut_1016.py 로 잘라 public/clips/1016o/ (캠은 얼굴캠 원본)
// 외심(10/6 저녁): 할리갈리 종 비유로 시작 → 필기(정의·성질①) / 종 자리 찾기 → 성질②(수직이등분선의 교점)
import { TEACHER } from "./clips";
import { DATA_0913 } from "./clips-0913";
import type { Clip, HighlightData, Rect } from "./clips";

const CAM_TR: Rect = { x: 1448, y: 0, w: 472, h: 266 };
const O_MEMO: Rect = { x: 80, y: 120, w: 1080, h: 960 }; // 교재 아래 MEMO 칸의 "할리갈리?" 낙서
const O_NOTE: Rect = { x: 420, y: 40, w: 1160, h: 1031 }; // 외심 필기(정의·성질①)
const O_NOTE2: Rect = { x: 400, y: 0, w: 1215, h: 1080 }; // 필기를 내려 성질② 작도까지 보일 때

const O1_HOOK: Clip = {
  file: "clips/1016o/o1h.mp4",
  camFile: "clips/1016o/cam_o1h.mp4",
  source: "41:46.2 ~ 42:11.9 (학생 대답 컷)",
  duration: 14.05,
  label: "할리갈리 종은 어디에?",
  desc: "공평하게 하려면 종을 어디에 놓아야 할까",
  cam: CAM_TR,
  board: O_MEMO,
  noteBoard: true,
  boardKeys: [{ t: 0, rect: { x: 280, y: 260, w: 840, h: 800 } }],
  captions: [
    { start: 0.1, end: 4.5, text: "할리갈리 플레이어\n[[두 명]]이 앉아서" },
    { start: 4.5, end: 9.1, text: "할리갈리 하면\n[[종]]을 어디 놔둬야 돼?" },
    { start: 9.1, end: 10.45, text: "[[가운데]] 놔야겠지" },
    { start: 10.6, end: 14.05, text: "[[세 명]]이면?\n종 어디에 놓을까?" },
  ],
};

const O1_NOTE: Clip = {
  file: "clips/1016o/o1n.mp4",
  camFile: "clips/1016o/cam_o1n.mp4",
  source: "50:36.9 ~ 56:41.9 (필기 구간만)",
  duration: 28.8,
  label: "삼각형의 외심",
  desc: "외접원의 중심 · 세 꼭짓점까지 거리가 같다",
  cam: CAM_TR,
  board: O_NOTE,
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 420, y: 0, w: 720, h: 880 } }, // 제목·정의 두 줄
    { t: 11.3, rect: { x: 470, y: 100, w: 1040, h: 880 } }, // 외접원 줄 + 오른쪽 원이 함께 나타남
    { t: 15.5, rect: { x: 960, y: 96, w: 620, h: 758 } }, // 원에 반지름 긋기
    { t: 22.5, rect: { x: 500, y: 150, w: 1050, h: 1000 } }, // 화면이 내려가며 성질①(그림+이등변삼각형 3개)
  ],
  captions: [
    { start: 0.22, end: 3.0, text: "자, [[외심]]이라는 건 뭐냐면" },
    { start: 3.12, end: 6.2, text: "삼각형 [[외접원의 중심]]" },
    { start: 6.36, end: 11.7, text: "외접원은 삼각형\n[[세 꼭짓점]]을 지나는 원" },
    { start: 11.82, end: 19.0, text: "세 꼭짓점까지 거리가\n항상 어떨까?" },
    { start: 19.1, end: 22.6, text: "항상 [[같아요]]\n왜냐하면 [[반지름]]이니까" },
    { start: 22.68, end: 28.8, text: "안에 있는 삼각형이 모두\n[[이등변삼각형]]이다" },
  ],
};

const O2: Clip = {
  file: "clips/1016o/o2.mp4",
  camFile: "clips/1016o/cam_o2.mp4",
  source: "57:48.1 ~ 60:14.85 (학생 이름·공백 컷)",
  duration: 47.85,
  label: "외심 찾는 법",
  desc: "할리갈리 종 자리 = 세 변의 수직이등분선의 교점",
  cam: CAM_TR,
  board: O_NOTE2,
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 620, y: 700, w: 740, h: 300 }, free: true }, // ② 삼각형
    { t: 8.9, rect: { x: 760, y: 700, w: 740, h: 300 }, free: true }, // 오른쪽 "두 명" 선분의 중앙 찍기
    { t: 17.4, rect: { x: 620, y: 700, w: 740, h: 300 }, free: true }, // 다시 삼각형: 변마다 중앙선 긋기
    { t: 39.3, rect: { x: 420, y: 600, w: 860, h: 300 }, free: true }, // 그림 지우고 "② 외심은 세 변 수직이등분선의 교점" 판서
  ],
  captions: [
    { start: 0.1, end: 7.0, text: "이번엔 진짜 진지해\n할리갈리 [[중앙점]]을 잘 찾고 싶어" },
    { start: 7.0, end: 8.9, text: "이 점 [[어떻게]] 찾을까?" },
    { start: 8.95, end: 15.4, text: "할리갈리 [[두 명]]의\n중앙을 찍으려면?" },
    { start: 15.4, end: 17.7, text: "중앙 찍으면 되겠지?" },
    { start: 17.8, end: 20.9, text: "종이 [[이 선 위]]에만\n있으면 되지 않나?" },
    { start: 20.9, end: 23.6, text: "꼭 가운데 있을\n필요는 없잖아" },
    { start: 23.7, end: 30.6, text: "마지막 두 명도\n사이에 [[중앙선]]을 긋고" },
    { start: 30.6, end: 35.7, text: "이 선 위 어디 있어도 돼" },
    { start: 35.7, end: 39.4, text: "그래서 [[만나는 점]],\n여기가 바로 [[외심]]이야" },
    { start: 39.5, end: 47.85, text: "외심은 세 변의\n[[수직이등분선의 교점]]" },
  ],
};

const outro = { ...DATA_0913.outro!, lines: ["카이스트 박사 선생님과 함께하는", "중등 수학 수업", "대치동캐슬에서 만나요"] };

// 2026-10-17: 1·2편을 합쳐 외심 개념 설명 한 편으로(1분 넘어도 됨). 필기 강조라 캠은 줄이고 판서를 확대해 따라감
export const DATA_1016O: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "개념 설명",
  title: "외심은 할리갈리 종 자리",
  hook: "중2 도형의 첫 단추\n[[삼각형의 외심]]\n필기 한 장으로 정리",
  subtitle: "중2 수학 · 할리갈리 종으로 이해하기",
  clips: [O1_HOOK, O1_NOTE, { ...O2, label: "외심 찾는 법" }],
  holdAfterLast: 75, // 다 쓴 "교점" 판서를 2.5초 보여주고 아웃트로
  // 썸네일·첫 화면: 57:10 완성 필기(캠 자리 페이지 색으로 덮음) + 정면 보는 캠 프레임
  cover: { note: "clips/1016o/note_full.png", noteAspect: 1180 / 790, camFile: "clips/1016o/cam_o2.mp4", camFrom: 1100, faceAt: [405, 250], faceBox: 320, tag: "도형 개념 정리 · 삼각형의 외심" },
  outro,
};

// ── 내심(10/6 저녁 94~107분): 삼각형 안 가장 큰 원 → 정의·성질① → 성질②(각의 이등분선, RHS 합동) ──
// source/cut_1016.py I → public/clips/1016i/. 외심 편과 같은 틀(필기 강조 레이아웃 + 판서 따라가기 + 필기 표지)
const I_WIDE: Rect = { x: 250, y: 330, w: 960, h: 420 }; // MEMO 칸 삼각형 세 개

const I1: Clip = {
  file: "clips/1016i/i1.mp4",
  camFile: "clips/1016i/cam_i1.mp4",
  source: "94:03.0 ~ 96:06.4 (타이머·공백 컷)",
  duration: 28.0,
  label: "삼각형 안에 가장 큰 원",
  desc: "원을 최대한 크게 그리면, 중심은 어디?",
  cam: CAM_TR,
  board: I_WIDE,
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: I_WIDE },
    { t: 10.8, rect: { x: 170, y: 330, w: 560, h: 480 } }, // 첫 삼각형에 변까지 거리 표시
    { t: 24.2, rect: I_WIDE }, // 나머지 삼각형에도 반지름
  ],
  captions: [
    { start: 0.0, end: 2.6, text: "이거 한번 삼각형 안에\n[[원]]을 그려봐" },
    { start: 2.6, end: 4.9, text: "원을 [[최대한 크게]]\n그려봅시다" },
    { start: 4.9, end: 11.2, text: "자, 이렇게 생긴 원의\n[[특징]]은 뭘까?" },
    { start: 11.2, end: 15.4, text: "각 변에서 [[최대한 멀리]]\n떨어진 점 아닐까?" },
    { start: 15.4, end: 20.7, text: "그 말은 [[세 변까지]]\n닿는 거리가 같겠지?" },
    { start: 20.7, end: 23.3, text: "이 변까지 닿는\n거리가 [[같아]]" },
    { start: 23.3, end: 26.4, text: "세 변에 닿는 거리가\n[[다 같습니다]]" },
    { start: 26.4, end: 28.0, text: "이게 바로 [[내심]]이야" },
  ],
};

const I2: Clip = {
  file: "clips/1016i/i2.mp4",
  camFile: "clips/1016i/cam_i2.mp4",
  source: "96:39.5 ~ 99:27.2 (필기 구간만)",
  duration: 28.6,
  label: "삼각형의 내심",
  desc: "내접원의 중심 · 세 변까지 거리가 같다",
  cam: CAM_TR,
  board: { x: 430, y: 0, w: 740, h: 900 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 430, y: 0, w: 740, h: 900 } }, // 제목·정의·성질①
    { t: 23.5, rect: { x: 420, y: 260, w: 860, h: 620 } }, // 화면이 내려가며 ① 그림 + ID=IE=IF
  ],
  captions: [
    { start: 0.0, end: 5.1, text: "첫 번째, 내심은\n삼각형 [[내접원의 중심]]" },
    { start: 5.1, end: 7.3, text: "[[내접원]]은 뭐지?" },
    { start: 7.3, end: 11.0, text: "내접원은 삼각형\n[[세 변]]에 접하는 원" },
    { start: 11.0, end: 15.1, text: "아까 외심은 [[세 점]]이었다면\n이번에는 [[세 변]]이겠지" },
    { start: 15.2, end: 21.0, text: "첫 번째 성질\n[[세 변까지 거리가 같다]]" },
    { start: 21.0, end: 23.5, text: "이게 [[가장 큰 특징]]입니다" },
    { start: 23.5, end: 28.6, text: "ID, IE, IF의\n거리가 [[같습니다]]" },
  ],
};

const I3: Clip = {
  file: "clips/1016i/i3.mp4",
  camFile: "clips/1016i/cam_i3.mp4",
  source: "99:46.1 ~ 106:25.0 (필기·설명 구간만)",
  duration: 62.9,
  label: "세 각의 이등분선의 교점",
  desc: "두 삼각형이 RHS 합동이라서",
  cam: CAM_TR,
  board: { x: 440, y: 380, w: 880, h: 420 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 440, y: 380, w: 880, h: 420 } }, // ① 그림 아래 "② 삼각형 세 각의 이등분선의 교점이다"
    { t: 15.0, rect: { x: 600, y: 470, w: 720, h: 470 } }, // 화면이 내려가며 분홍 삼각형에 각 이등분 그려 보기
    { t: 28.6, rect: { x: 440, y: 420, w: 560, h: 480 } }, // ② 그림: 합동인 두 삼각형 칠하기
    { t: 46.5, rect: { x: 470, y: 440, w: 980, h: 480 } }, // 합동식(RHS)까지
    { t: 58.9, rect: { x: 440, y: 440, w: 1240, h: 480 } }, // 각이 같다(∠DAI=∠FAI …)까지
  ],
  captions: [
    { start: 0.0, end: 4.6, text: "두 번째는 좀\n[[신기한]] 말인데" },
    { start: 4.6, end: 8.5, text: "삼각형 [[세 각의 이등분선]]의\n교점" },
    { start: 8.5, end: 14.8, text: "선생님은 이 말이\n제일 [[생뚱맞다]]고 생각해" },
    { start: 14.8, end: 20.7, text: "각을 [[이등분]]해서 그으면\n만나는 점이 생기는 것도 이상해" },
    { start: 20.7, end: 28.6, text: "여기서 원을 그리면\n딱 [[삼각형에 접하는 원]]이 그려져" },
    { start: 28.6, end: 34.5, text: "요 삼각형과 요 삼각형,\n이 두 개가 [[합동]]이야" },
    { start: 34.5, end: 40.9, text: "아까 [[외심]]은\n이거랑 이게 합동이었어" },
    { start: 40.9, end: 46.6, text: "근데 [[내심]]은\n요놈과 요놈이 합동" },
    { start: 46.6, end: 50.8, text: "직각삼각형이고 빗변이 같고\n요 길이도 같잖아" },
    { start: 50.8, end: 52.8, text: "[[RHS 합동]]" },
    { start: 52.8, end: 59.2, text: "합동이니까 당연히\n요 [[각도]]랑 요 [[각도]]가 같습니다" },
    { start: 59.2, end: 62.9, text: "이게 [[내심의 가장 큰 특징]]이에요" },
  ],
};

export const DATA_1016I: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "개념 설명",
  title: "내심은 삼각형 안 가장 큰 원의 중심",
  hook: "중2 도형의 첫 단추\n[[삼각형의 내심]]\n필기 한 장으로 정리",
  subtitle: "중2 수학 · 가장 큰 원으로 이해하기",
  clips: [I1, I2, I3],
  holdAfterLast: 75,
  outro,
  // 썸네일·첫 화면: 107:00 축소 화면의 완성 필기 한 장(제목~성질②). 세로로 길어 카드를 줄이고 얼굴은 카드 오른쪽 아래(필기 없는 곳)에 걸침
  cover: { note: "clips/1016i/note_full.png", noteAspect: 1, camFile: "clips/1016i/cam_i1.mp4", camFrom: 360, faceAt: [372, 270], faceBox: 320, tag: "도형 개념 정리 · 삼각형의 내심", cardW: 860, cardTop: 720, faceInset: 110, belowGap: 170, labelRight: true },
};

// ── 내심·외심 비교표(10/8 저녁 12~31분): 표를 행별로 채우며 설명. 위치·응용 행은 길이 때문에 뺌 ──
// source/cut_1016.py C → public/clips/1016c/. 선생님이 수업 중 화면 확대를 바꿔서 c4 중간(23.1초~)부터 표 좌표가 달라짐
const C1: Clip = {
  file: "clips/1016c/c1.mp4",
  camFile: "clips/1016c/cam_c1.mp4",
  source: "12:24.1 ~ 13:45.0 (필기 구간만)",
  duration: 26.1,
  label: "헷갈리는 두 점",
  desc: "외심 O · 할리갈리 종 / 내심 I · 피구",
  cam: CAM_TR,
  board: { x: 340, y: 180, w: 760, h: 320 },
  noteBoard: true,
  boardKeys: [{ t: 0, rect: { x: 340, y: 180, w: 760, h: 320 } }], // 제목 + 외심(O)·내심(I) 머리글
  captions: [
    { start: 0.0, end: 5.3, text: "이렇게 정리를 해볼게\n내심이랑 외심, [[헷갈리지]]?" },
    { start: 5.3, end: 10.4, text: "외심은 주로 [[O]]라고 씁니다\n아웃(out)의 느낌" },
    { start: 10.4, end: 14.7, text: "그 다음에 내심은 [[I]]" },
    { start: 14.7, end: 21.8, text: "비유를 들었었지?\n외심은 [[할리갈리 종]]" },
    { start: 21.8, end: 26.1, text: "내심은 [[피구]]라고도 했고" },
  ],
};

const C2: Clip = {
  file: "clips/1016c/c2.mp4",
  camFile: "clips/1016c/cam_c2.mp4",
  source: "14:19.2 ~ 17:08.9 (필기 구간만, 학생 이름 구간 뺌)",
  duration: 26.9,
  label: "원과 같은 거리",
  desc: "세 꼭짓점까지 vs 세 변까지",
  cam: CAM_TR,
  board: { x: 440, y: 200, w: 1060, h: 360 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 440, y: 200, w: 1060, h: 360 } }, // 머리글 + 원(외접원·내접원)
    { t: 5.8, rect: { x: 440, y: 380, w: 1060, h: 400 } }, // 같은 거리 행
  ],
  captions: [
    { start: 0.0, end: 3.8, text: "제일 처음에는 [[원]]" },
    { start: 3.8, end: 5.8, text: "[[외접원]], [[내접원]]" },
    { start: 5.8, end: 12.8, text: "원이니까 어딘가\n[[같은 거리]]가 있을 거 아니야" },
    { start: 12.8, end: 14.7, text: "외심은 [[세 꼭짓점]]까지" },
    { start: 14.7, end: 17.2, text: "내심은 [[세 변]]까지" },
    { start: 17.2, end: 24.0, text: "그려 보면 사실\n차이점은 [[금방 캐치]]해" },
    { start: 24.0, end: 26.9, text: "근데 정리하다 보면\n또 [[헷갈리기]]도 하지" },
  ],
};

const C3: Clip = {
  file: "clips/1016c/c3.mp4",
  camFile: "clips/1016c/cam_c3.mp4",
  source: "18:12.7 ~ 21:01.9 (필기 구간만, 학생 이름 구간 뺌)",
  duration: 28.8,
  label: "작도",
  desc: "변의 수직이등분선 vs 각의 이등분선",
  cam: CAM_TR,
  board: { x: 660, y: 520, w: 480, h: 340 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 660, y: 520, w: 480, h: 340 } }, // 외심 칸: 수직이등분선 그리기
    { t: 19.3, rect: { x: 1050, y: 520, w: 540, h: 340 } }, // 내심 칸: 각의 이등분선
    { t: 26.0, rect: { x: 440, y: 500, w: 1080, h: 380 } }, // 작도 행 전체
  ],
  captions: [
    { start: 0.0, end: 9.8, text: "할리갈리 두 사람 사이\n[[중앙선]] 위 어디든 공평하다고 했지" },
    { start: 9.8, end: 13.3, text: "그래서 [[수직이등분선]]을\n그리는 거야" },
    { start: 13.3, end: 19.3, text: "외심은 각 변의\n[[수직이등분선의 교점]]" },
    { start: 19.3, end: 22.3, text: "내심은\n[[각의 이등분선의 교점]]" },
    { start: 22.3, end: 28.8, text: "각을 이등분해서 그으면\n[[한 점]]에서 만나고, 요게 [[내심]]" },
  ],
};

const C4: Clip = {
  file: "clips/1016c/c4.mp4",
  camFile: "clips/1016c/cam_c4.mp4",
  source: "21:29.2 ~ 30:50.0 (필기·설명 구간만, 학생 이름 구간 뺌)",
  duration: 59.2,
  label: "생기는 도형",
  desc: "이등변삼각형 3개 vs 직각삼각형 합동 3쌍",
  cam: CAM_TR,
  board: { x: 430, y: 560, w: 1060, h: 440 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 430, y: 560, w: 1060, h: 440 } }, // 성질(생기는 도형) 행
    { t: 5.4, rect: { x: 680, y: 600, w: 520, h: 400 } }, // 외심 칸: 이등변삼각형 3개 그리기
    { t: 15.9, rect: { x: 430, y: 560, w: 1060, h: 440 } }, // 행 전체(내심 칸 쓰기 시작)
    { t: 23.1, rect: { x: 470, y: 540, w: 600, h: 470 } }, // (화면 확대 바뀜) 외심 칸: 이등변 반쪽끼리 합동
    { t: 32.3, rect: { x: 1060, y: 540, w: 620, h: 470 } }, // 내심 칸: 사각형 반쪽끼리 합동
    { t: 40.0, rect: { x: 440, y: 520, w: 1260, h: 500 } }, // 행 전체: 도형 문제는 합동에서
    { t: 52.8, rect: { x: 300, y: 0, w: 1320, h: 1080 } }, // 선생님이 화면을 축소하는 동안은 넓게
    { t: 56.6, rect: { x: 630, y: 40, w: 770, h: 1000 } }, // 축소 끝: 완성된 표 한 장
  ],
  captions: [
    { start: 0.0, end: 5.4, text: "생기는 도형,\n여기가 [[하이라이트]]인데" },
    { start: 5.4, end: 13.6, text: "여기도 이등변, 여기도 이등변\n여기도 이등변" },
    { start: 13.6, end: 15.9, text: "외심은 [[이등변삼각형 3개]]" },
    { start: 15.9, end: 23.1, text: "내심은 합동인\n[[직각삼각형 세 쌍]]이 나와" },
    { start: 23.1, end: 32.3, text: "외심은 [[이등변삼각형]]이 딱 생기고\n그 반쪽끼리 합동" },
    { start: 32.3, end: 40.0, text: "근데 내심은 [[사각형]]이 있거든\n사각형 반쪽끼리 합동" },
    { start: 40.0, end: 49.0, text: "모든 도형 문제는 [[합동]]에서\n여러 성질을 가져오잖아" },
    { start: 49.0, end: 52.8, text: "실제 문제에서\n[[제일 많이 나오는]] 성질이야" },
    { start: 52.8, end: 59.2, text: "여기까지가 전체를\n[[한 장에]] 모은 거야" },
  ],
};

export const DATA_1016C: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "개념 설명",
  title: "내심·외심 한 장 비교",
  hook: "중2 도형의 첫 단추\n[[내심 vs 외심]]\n표 한 장으로 비교",
  subtitle: "중2 수학 · 헷갈리는 두 점 한 번에 정리",
  clips: [C1, C2, C3, C4],
  holdAfterLast: 75,
  outro,
  // 썸네일·첫 화면: 30:50 완성된 비교표(좁고 긴 한 장) — 카드를 왼쪽에, 얼굴은 카드 오른쪽 옆에
  // 얼굴은 얼굴캠 원본 21:13.5 OK 표시 장면(face_ok.png, 사용자 선택 A)
  cover: { note: "clips/1016c/note_full.png", noteAspect: 770 / 1000, camFile: "clips/1016c/cam_c4.mp4", camFrom: 1260, faceAt: [348, 270], faceBox: 320, tag: "도형 개념 정리 · 내심 vs 외심", cardW: 690, cardTop: 770, cardLeft: 46, faceInset: 330, belowGap: 70, labelRight: true, facePhoto: "clips/1016c/face_ok.png", faceSize: 300 },
};

// ── 평행사변형(10/8 저녁 88~106분): 정의·성질 → 왜 증명할까 → ① 증명(ASA) → 헷갈릴 땐 극단적으로 ──
// source/cut_1016.py P → public/clips/1016p/. 학생 이름·대답 구간은 모두 피함
const P1: Clip = {
  file: "clips/1016p/p1.mp4",
  camFile: "clips/1016p/cam_p1.mp4",
  source: "88:55.1 ~ 92:12.9 (필기 구간만)",
  duration: 34.7,
  label: "정의와 성질 세 가지",
  desc: "두 쌍의 대변이 평행한 사각형",
  cam: CAM_TR,
  board: { x: 460, y: 180, w: 820, h: 420 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 460, y: 180, w: 820, h: 420 } }, // 제목·정의·성질 머리
    { t: 19.7, rect: { x: 440, y: 80, w: 720, h: 900 } }, // 화면을 내려 ①②③ 세 줄
  ],
  captions: [
    { start: 0.0, end: 6.7, text: "평행사변형의 정의는\n[[두 쌍의 대변이 평행]]한 사각형" },
    { start: 6.7, end: 13.6, text: "성질 첫 번째\n[[두 쌍의 대변의 길이]]가 같다" },
    { start: 13.6, end: 21.3, text: "두 번째\n[[두 쌍의 대각의 크기]]가 같다" },
    { start: 21.3, end: 25.1, text: "세 번째, 두 대각선이\n서로를 [[이등분]]한다" },
    { start: 25.1, end: 30.0, text: "여기 세 가지가 있고\n내심·외심에 비하면" },
    { start: 30.0, end: 34.7, text: "헷갈리는 건 별로 없어\n[[직관적]]으로 생각하는 그대로야" },
  ],
};

const P2: Clip = {
  file: "clips/1016p/p2.mp4",
  camFile: "clips/1016p/cam_p2.mp4",
  source: "88:07.2 ~ 96:19.2 (설명 구간만)",
  duration: 46.7,
  label: "왜 증명할까",
  desc: "주어진 조건 → 목표, 굵직한 시나리오",
  cam: CAM_TR,
  board: { x: 600, y: 60, w: 800, h: 420 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 600, y: 60, w: 800, h: 420 } }, // 도입 페이지: 평행사변형은 어떤 특징? 성질?
    { t: 21.9, rect: { x: 900, y: 180, w: 700, h: 600 } }, // 필기 페이지 오른쪽: 주어진 것 → 증명할 것
  ],
  captions: [
    { start: 0.0, end: 9.2, text: "근데 이제 [[왜 그럴까]]의 세계로\n들어가는 게 짜증 나는 거야" },
    { start: 9.2, end: 15.5, text: "증명을 해야 되는 이유는\n이걸로만 문제가 안 나오잖아" },
    { start: 15.5, end: 21.9, text: "여러 단계를 거치는\n[[논리적인 과정]]을 훈련하기 위해" },
    { start: 21.9, end: 24.7, text: "선생님은 증명을 항상 이렇게 해" },
    { start: 24.7, end: 32.0, text: "[[주어진 조건]]이 있고\n증명할 [[목표]]가 있어" },
    { start: 32.0, end: 38.9, text: "증명은 중간 과정 때문에\n짜증 나고 머리 아프잖아" },
    { start: 38.9, end: 46.7, text: "[[굵직한 시나리오]]를 미리 갖고 가면\n증명이 훨씬 쉬워져" },
  ],
};

const P3: Clip = {
  file: "clips/1016p/p3.mp4",
  camFile: "clips/1016p/cam_p3.mp4",
  source: "97:03.9 ~ 97:47.6 (설명 구간만)",
  duration: 22.1,
  label: "① 증명: ASA 합동",
  desc: "두 삼각형이 합동이면 대변이 같다",
  cam: CAM_TR,
  board: { x: 480, y: 400, w: 520, h: 360 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 480, y: 400, w: 520, h: 360 } }, // ① 그림: 대각선으로 나눈 두 삼각형
    { t: 17.8, rect: { x: 480, y: 400, w: 1100, h: 400 } }, // 그림 + △ABD ≡ △CDB
  ],
  captions: [
    { start: 0.0, end: 7.5, text: "요 삼각형과 요 삼각형이 [[합동]]이면\n대응하는 변의 길이가 같겠지" },
    { start: 7.5, end: 13.0, text: "여기랑 여기 [[각도]] 같고\n여기랑 여기 각도 같고" },
    { start: 13.0, end: 17.8, text: "가운데 있는 놈은\n[[공통변]]이잖아" },
    { start: 17.8, end: 22.1, text: "[[ASA 합동]]\n되지 않을까?" },
  ],
};

const P4: Clip = {
  file: "clips/1016p/p4.mp4",
  camFile: "clips/1016p/cam_p4.mp4",
  source: "104:19.0 ~ 106:09.9 (설명 구간만, 학생 대답 뺌)",
  duration: 44.3,
  label: "헷갈릴 땐 극단적으로",
  desc: "공식보다 원리",
  cam: CAM_TR,
  board: { x: 360, y: 520, w: 640, h: 460 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 360, y: 520, w: 640, h: 460 } }, // ③ 그림: 대각선 교점이 직각일까?
    { t: 19.6, rect: { x: 820, y: 640, w: 760, h: 360 } }, // 납작한 평행사변형 그려 보기
    { t: 30.2, rect: { x: 360, y: 500, w: 1240, h: 500 } }, // 두 그림 함께
  ],
  captions: [
    { start: 0.0, end: 8.4, text: "퀴즈! 대각선이 만나는\n이 각도, [[직각]]일까 아닐까?" },
    { start: 8.4, end: 10.4, text: "아닙니다, 이게 [[헷갈려]]" },
    { start: 10.4, end: 19.6, text: "이럴 때는 [[극단적인 상황]]을 만들면\n훨씬 선명해져" },
    { start: 19.6, end: 30.2, text: "이렇게 만들고 대각선을 그어 보면\n직각은 될까? [[안 되지]]" },
    { start: 30.2, end: 37.0, text: "[[공식]]은 항상 우리를 배신해\n그대로 나오지도 않고, 우린 까먹어" },
    { start: 37.0, end: 44.3, text: "그래서 [[원리]]를 기억해야 돼\n헷갈리면 극단적인 상황을 가정해 봐" },
  ],
};

export const DATA_1016P: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "개념 설명",
  title: "평행사변형, 공식보다 원리",
  hook: "중2 도형의 첫 단추\n[[평행사변형]]\n필기 한 장으로 정리",
  subtitle: "중2 수학 · 공식보다 원리로 이해하기",
  clips: [P1, P2, P3, P4],
  holdAfterLast: 75,
  outro,
  // 썸네일·첫 화면: 수업 화면엔 필기 전체가 한 번에 안 나와서 사용자 제공 필기 이미지(source/1016/image (1).png)를 2배로 키워 씀
  // 얼굴은 얼굴캠 원본 89:42.5 웃으며 말하는 장면
  cover: { note: "clips/1016p/note_full.png", noteAspect: 1058 / 1422, camFile: "clips/1016p/cam_p1.mp4", tag: "도형 개념 정리 · 평행사변형", cardW: 660, cardTop: 770, cardLeft: 46, faceInset: 330, belowGap: 70, labelRight: true, facePhoto: "clips/1016p/face_smile.png", faceSize: 300 },
};

// ── 여러 가지 사각형(10/13 저녁 91~108분): 사각형 신분 사회 → 레벨업 조건 → 좋은 건 다 가져간다 ──
// source/cut_1016.py Q → public/clips/1016q/. 학생 대답·이름 구간은 피함
const Q1: Clip = {
  file: "clips/1016q/q1.mp4",
  camFile: "clips/1016q/cam_q1.mp4",
  source: "91:57.4 ~ 94:15.6 (설명 구간만, 학생 대답 뺌)",
  duration: 63.7,
  label: "사각형 신분 사회",
  desc: "노예 등급 사각형 → 끝판왕 정사각형",
  cam: CAM_TR,
  board: { x: 540, y: 180, w: 860, h: 440 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 540, y: 180, w: 860, h: 440 } }, // 제목 + 사각형
    { t: 8.3, rect: { x: 1060, y: 180, w: 440, h: 340 } }, // 신분 피라미드(맨 아래 사각형 ~ 맨 위 정사각형)
    { t: 34.8, rect: { x: 540, y: 300, w: 860, h: 360 } }, // 사다리꼴 → 평행사변형 → 직사각형·마름모 → 정사각형
  ],
  captions: [
    { start: 0.0, end: 8.3, text: "이게 가장 하급,\n등급으로 치면 [[노예 등급]]" },
    { start: 8.3, end: 17.2, text: "[[신분 사회]]라고 하자\n가장 볼품없는 [[사각형]]" },
    { start: 17.2, end: 23.0, text: "난 좋은 걸 다 가지고 있어\n[[끝판왕]]은 뭘까?" },
    { start: 23.0, end: 28.4, text: "좋은 걸 다 가지면\n[[정사각형]]이 되겠지" },
    { start: 28.4, end: 34.8, text: "사각형보다 조금 나은 놈이\n[[사다리꼴]]" },
    { start: 34.8, end: 42.5, text: "맞아, [[평행사변형]]이야\n레벨업!" },
    { start: 42.5, end: 50.7, text: "평행사변형 다음은 뭐가 있을까?\n[[마름모]], 그리고 [[직사각형]]" },
    { start: 50.7, end: 57.7, text: "애매하지만 [[레벨이 같습니다]]\n둘이 싸워" },
    { start: 57.7, end: 63.7, text: "그리고 끝판왕\n[[정사각형]]이 있습니다" },
  ],
};

const Q2: Clip = {
  file: "clips/1016q/q2.mp4",
  camFile: "clips/1016q/cam_q2.mp4",
  source: "94:42.5 ~ 96:23.9 (설명 구간만, 학생 대답 뺌)",
  duration: 27.7,
  label: "레벨업 조건",
  desc: "각은 직각으로, 변은 같게",
  cam: CAM_TR,
  board: { x: 560, y: 200, w: 820, h: 440 },
  noteBoard: true,
  boardKeys: [{ t: 0, rect: { x: 560, y: 200, w: 820, h: 440 } }], // 관계도 + (각)/(변) 표시
  captions: [
    { start: 0.0, end: 2.7, text: "평행사변형이 직사각형이 되려면?" },
    { start: 2.7, end: 5.7, text: "각을 [[직각]]으로 만들면 되겠지" },
    { start: 5.7, end: 11.3, text: "마름모가 되려면\n[[길이]]를 같게 만들면 되겠지" },
    { start: 11.3, end: 18.9, text: "이번엔 반대야, 직사각형이\n[[변의 길이]]가 같아지면 정사각형" },
    { start: 18.9, end: 22.7, text: "마름모는 [[각도]]가 같아지면\n정사각형이 되겠지" },
    { start: 22.7, end: 27.7, text: "오늘 공부의 [[80%]]가\n이 내용입니다" },
  ],
};

const Q3: Clip = {
  file: "clips/1016q/q3.mp4",
  camFile: "clips/1016q/cam_q3.mp4",
  source: "98:56.7 ~ 108:31.4 (설명 구간만, 학생 대답·이름 뺌)",
  duration: 60.1,
  label: "좋은 건 다 가져간다",
  desc: "직사각형은 길이, 마름모는 수직, 정사각형은 둘 다",
  cam: CAM_TR,
  board: { x: 420, y: 60, w: 760, h: 900 },
  noteBoard: true,
  boardKeys: [
    { t: 0, rect: { x: 420, y: 60, w: 760, h: 900 } }, // 평행사변형 성질 + 직사각형·마름모 자리
    { t: 24.2, rect: { x: 360, y: 250, w: 900, h: 800 } }, // (확대 바뀜) 직사각형 성질: 대각선 길이
    { t: 31.6, rect: { x: 440, y: 180, w: 900, h: 760 } }, // 대각선 이등분 → 직사각형 길이 / 마름모 수직
    { t: 44.9, rect: { x: 820, y: 60, w: 640, h: 980 } }, // 직사각형·마름모·정사각형 상자
    { t: 56.2, rect: { x: 480, y: 0, w: 980, h: 1080 } }, // 완성된 한 장
  ],
  captions: [
    { start: 0.0, end: 6.5, text: "퀴즈! 직사각형은 평행사변형의\n성질을 [[모두 다]] 가질까?" },
    { start: 6.5, end: 16.6, text: "네, O입니다. 신분이 높아져서\n[[왕]]에게 가까워질수록" },
    { start: 16.6, end: 24.2, text: "좋은 건 [[다 가져가는]] 거야\n아래에서 좋은 걸 다 흡수해" },
    { start: 24.2, end: 31.6, text: "대각선을 [[이등분]]만 했는데\n직사각형은 [[길이]]도 같아" },
    { start: 31.6, end: 39.0, text: "직사각형은\n[[길이]]의 특징을 가져가고" },
    { start: 39.0, end: 44.9, text: "마름모는 [[수직]]의 특징을 가져가\n하나씩 나눠서 가져가는 거야" },
    { start: 44.9, end: 48.5, text: "정사각형은 좋은 거\n[[다]] 가져가는 거야" },
    { start: 48.5, end: 56.2, text: "직사각형의 특징도,\n마름모의 특징도 가져온 거지" },
    { start: 56.2, end: 60.1, text: "다 [[아귀가 맞아떨어지니까]]\n훨씬 낫지 않니?" },
  ],
};

export const DATA_1016Q: HighlightData = {
  teacher: TEACHER,
  cam: CAM_TR,
  episode: "개념 설명",
  title: "사각형 신분 사회",
  hook: "중2 도형의 첫 단추\n[[여러 가지 사각형]]\n필기 한 장으로 정리",
  subtitle: "중2 수학 · 사각형 신분 사회로 이해하기",
  clips: [Q1, Q2, Q3],
  holdAfterLast: 75,
  outro,
  // 썸네일·첫 화면: 사용자 제공 필기 이미지(source/1016/image (2).png) 2배 확대, 얼굴은 얼굴캠 원본 93:47 활짝 웃는 장면
  cover: { note: "clips/1016q/note_full.png", noteAspect: 1138 / 1508, camFile: "clips/1016q/cam_q1.mp4", tag: "도형 개념 정리 · 여러 가지 사각형", cardW: 660, cardTop: 770, cardLeft: 46, faceInset: 330, belowGap: 70, labelRight: true, facePhoto: "clips/1016q/face_smile.png", faceSize: 300 },
};
