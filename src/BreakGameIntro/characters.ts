// 쉬는 시간 게임 캐릭터 목록 (break-game/src/lib/characters.ts 에서 복사)
export type Character = { id: string; ko: string };

export const CHARACTERS: Character[] = [
  { id: "alpaca", ko: "알파카" },
  { id: "bear", ko: "곰" },
  { id: "beaver", ko: "비버" },
  { id: "bee", ko: "꿀벌" },
  { id: "bluebird", ko: "파랑새" },
  { id: "buffalo", ko: "물소" },
  { id: "camel", ko: "낙타" },
  { id: "cat", ko: "고양이" },
  { id: "chameleon", ko: "카멜레온" },
  { id: "chick", ko: "병아리" },
  { id: "cow", ko: "소" },
  { id: "croc", ko: "악어" },
  { id: "deer", ko: "사슴" },
  { id: "dino", ko: "공룡" },
  { id: "dog", ko: "강아지" },
  { id: "dolphin", ko: "돌고래" },
  { id: "duck", ko: "오리" },
  { id: "elephant", ko: "코끼리" },
  { id: "flamingo", ko: "홍학" },
  { id: "fox", ko: "여우" },
  { id: "frog", ko: "개구리" },
  { id: "giraffe", ko: "기린" },
  { id: "goat", ko: "염소" },
  { id: "hamster", ko: "햄스터" },
  { id: "hedgehog", ko: "고슴도치" },
  { id: "hippo", ko: "하마" },
  { id: "horse", ko: "말" },
  { id: "koala", ko: "코알라" },
  { id: "lion", ko: "사자" },
  { id: "meercat", ko: "미어캣" },
  { id: "mole", ko: "두더지" },
  { id: "monkey", ko: "원숭이" },
  { id: "octopus", ko: "문어" },
  { id: "ostrich", ko: "타조" },
  { id: "otter", ko: "수달" },
  { id: "owl", ko: "부엉이" },
  { id: "panda", ko: "판다" },
  { id: "parrot", ko: "앵무새" },
  { id: "pelican", ko: "펠리컨" },
  { id: "penguin", ko: "펭귄" },
  { id: "pig", ko: "돼지" },
  { id: "polarbear", ko: "북극곰" },
  { id: "rabbit", ko: "토끼" },
  { id: "raccoon", ko: "너구리" },
  { id: "rhino", ko: "코뿔소" },
  { id: "seal", ko: "물개" },
  { id: "sheep", ko: "양" },
  { id: "sloth", ko: "나무늘보" },
  { id: "snail", ko: "달팽이" },
  { id: "tiger", ko: "호랑이" },
  { id: "turtle", ko: "거북이" },
  { id: "whale", ko: "고래" },
  { id: "wolf", ko: "늑대" },
  { id: "zebra", ko: "얼룩말" },
];

export const VERBS = [
  "피리부는", "썰매타는", "춤추는", "노래하는", "낮잠자는", "책읽는", "수영하는", "달리는",
  "별보는", "꽃든", "웃는", "날아가는", "숨바꼭질", "요리하는", "그림그린", "줄넘기하는",
];

export const characterSrc = (id: string) => `characters/${id}.jpg`;

// 렌더마다 같은 결과가 나오도록 고정 시드 셔플
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
