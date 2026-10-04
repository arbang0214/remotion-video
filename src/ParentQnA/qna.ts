// 학부모 상담 Q&A 쇼츠 — 상담 통화(source/source1~5.md)에서 뽑은 고민을 재구성
// 질문은 실제 발화가 아니라 다듬은 문장이고, 아이 이름·학교·지역 등 신원 정보는 넣지 않는다.
export const FPS = 30;
export const HOOK_FRAMES = 60;
export const MINI_OUTRO_FRAMES = 60; // 2초짜리 브랜드 카드
export const Q_ENTER = 12; // 캐릭터·말풍선 등장
export const Q_FRAMES_PER_CHAR = 1.5; // 타이핑 속도
export const Q_HOLD = 30; // 다 친 뒤 읽을 시간

export const HOOK = { top: "학부모 상담에서", main: "진짜 많이 나오는\n질문 {n}가지", sub: "수학쌤이 직접 답합니다" };

// 표정 컷이 들어 있는 폴더 (public/ 기준, source/split_parent_sheet.py 로 표정 시트를 잘라 만든다).
// think → (타이핑 중) talkA/talkB 번갈아 → after 컷 순서로 보여준다. null 이면 자리표시 캐릭터를 그린다.
export type Cut = "think" | "talkA" | "talkB" | "worry" | "curious" | "surprise" | "nod" | "happy";
export type Character = { dir: string; after: Cut } | null;

export type Caption = { start: number; end: number; text: string }; // 답변 영상 내 상대 시각(초)
export type QnA = {
  topic: string; // 답변 화면 상단에 고정되는 짧은 요약
  question: string; // 말풍선에 타이핑되는 질문 (\n 으로 줄바꿈)
  character: Character;
  answer: {
    file: string | null; // public/answers/*.mp4 — 촬영 전이면 null (대본 자리표시 화면)
    duration: number; // 초. 영상이 들어오면 실제 길이로 교체
    script: string; // 촬영용 대본 (상담에서 선생님이 실제로 답한 내용 기반)
    captions: Caption[];
  };
};

export const QNAS: QnA[] = [
  {
    topic: "실수가 너무 많아요",
    question: "매일 연산 연습을 하는데도\n실수가 너무 많아요.\n이거… 고등학교까지 가나요?",
    character: { dir: "parents/mom4", after: "worry" },
    answer: {
      file: null,
      duration: 21,
      script:
        "초등 때는 집중력이 짧아서 실수가 많은 게 자연스러워요. 중·고등으로 가면 실수보다 '몰라서' 틀리는 게 훨씬 많아져서, 실수의 영향은 오히려 줄어듭니다. 지금 봐야 할 건 하나예요. 진짜 실수인지, 모르는데 실수라고 말하는 건지. 진짜 실수면 기다려 주시고, 몰라서 틀린 거면 개념부터 다시 잡아 주세요.",
      captions: [],
    },
  },
  {
    topic: "속도가 느려요",
    question: "아이가 문제 푸는 속도가 느려요.\n정확하게 풀라고 해야 할까요,\n빨리 풀라고 해야 할까요?",
    character: null,
    answer: {
      file: null,
      duration: 21,
      script:
        "말한다고 바로 바뀌면 얼마나 좋겠어요. 빨리 하라고 다그치면 오히려 더 안 됩니다. 먼저 왜 느린지를 보세요. 어려운 문제를 갑자기 제일 빨리 풀 때가 있다면, 이해를 못 해서가 아니라 집중력 차이예요. 그런 아이는 시간 규칙만 분명히 알려주고, 수학을 잘 따라오는 한 기다려 주는 게 낫습니다. 터지는 시기는 아이마다 달라요.",
      captions: [],
    },
  },
  {
    topic: "수학이 싫대요",
    question: "숙제가 버거운지,\n좋아하던 수학이\n이제 제일 싫대요…",
    character: null,
    answer: {
      file: null,
      duration: 21,
      script:
        "초등 수학은 중등을 위한 기초 체력 단계예요. 중등부터 확 어려워지는데, 그 전에 '수학이 싫다'가 돼 버리면 그게 제일 큰 손해입니다. 그래서 지금은 진도보다 지친 마음이 먼저예요. 숙제에 우선순위를 정해서 꼭 해야 할 것만 남기고 양을 줄여 주세요. 흥미를 지키면서 가는 게, 결국 제일 멀리 갑니다.",
      captions: [],
    },
  },
  {
    topic: "심화가 너무 버거워요",
    question: "심화 문제집을 하루 종일\n붙잡고 있어도 다 못 풀어요.\n계속 시켜도 될까요?",
    character: null,
    answer: {
      file: null,
      duration: 21,
      script:
        "심화를 처음 하는 아이가 제일 어려운 문제까지 다 풀려고 하면 그대로 나가떨어져요. 틀린 걸 계속 다시 푸는 상황 자체가 아이들한테는 굉장히 힘들거든요. 처음 몇 단원은 다 맞히는 게 목표가 아니에요. 어려운 문제에 익숙해지는 게 먼저입니다. 제일 어려운 단계는 선생님 풀이를 보고 따라가는 것만으로도 충분해요.",
      captions: [],
    },
  },
];

// 한 편에 담을 질문들 (QNAS 인덱스). 지금은 질문 1개 = 쇼츠 1편, 답변을 20초 안팎으로 깊게.
export const EPISODES: { id: string; pick: number[] }[] = QNAS.map((_q, i) => ({ id: `Q${i + 1}`, pick: [i] }));

export const questionFrames = (q: QnA) => Q_ENTER + Math.round(q.question.replace(/\n/g, "").length * Q_FRAMES_PER_CHAR) + Q_HOLD;
export const answerFrames = (q: QnA) => Math.round(q.answer.duration * FPS);
