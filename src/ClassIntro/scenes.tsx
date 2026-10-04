import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { CHARACTERS, seededShuffle } from "../BreakGameIntro/characters";
import { Avatar, Pop, Pill } from "../BreakGameIntro/shared";
import { BRAND, PHOTO_COUNT } from "./config";

export const C = {
  navy: "#0F1B33",
  navy2: "#16294D",
  sky: "#5DB7FF",
  mint: "#3DDC97",
  yellow: "#FFD166",
  coral: "#FF7B7B",
  violet: "#A78BFA",
  paper: "#FFF9EE",
};
export const PALETTE = [C.sky, C.mint, C.yellow, C.coral, C.violet];
export const CAST = seededShuffle(CHARACTERS.filter((c) => c.id !== "owl"), 777);
export const TEACHER = "owl"; // 안경 쓴 부엉이 → 선생님

// 어두운 배경 + 은은한 격자
export const Board: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 30%, ${C.navy2} 0%, ${C.navy} 70%)`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }}
    />
    {children}
  </AbsoluteFill>
);

export const H1: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 96 }) => (
  <div style={{ fontSize: size, fontWeight: 900, letterSpacing: -2, lineHeight: 1.15, textAlign: "center", textShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
    {children}
  </div>
);

/* ───────────── 장면 1: 지역이 어디든 한자리에 (0~3.3초) ───────────── */
export const SceneRegions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 화면 좌표(1920x1080) — 한반도 배치를 느슨하게 흉내
  const nodes = [
    { name: "서울", x: 560, y: 300 },
    { name: "인천", x: 380, y: 380 },
    { name: "강릉", x: 820, y: 280 },
    { name: "대전", x: 560, y: 560 },
    { name: "대구", x: 880, y: 560 },
    { name: "광주", x: 460, y: 780 },
    { name: "부산", x: 980, y: 760 },
    { name: "제주", x: 420, y: 960 },
    { name: "해외", x: 1700, y: 900 },
    { name: "울산", x: 1120, y: 660 },
    { name: "세종", x: 700, y: 440 },
    { name: "전주", x: 620, y: 700 },
  ];
  const hub = { x: 1380, y: 640 };

  return (
    <Board>
      {/* 연결선 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {nodes.map((n, i) => {
          const p = interpolate(frame - 10 - i * 3, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          const x2 = n.x + (hub.x - n.x) * p;
          const y2 = n.y + (hub.y - n.y) * p;
          return (
            <g key={n.name}>
              <line x1={n.x} y1={n.y} x2={x2} y2={y2} stroke={PALETTE[i % PALETTE.length]} strokeWidth={4} strokeOpacity={0.55} strokeDasharray="14 12" strokeDashoffset={-frame * 3} />
              {p >= 1 && <circle cx={hub.x} cy={hub.y} r={6 + Math.sin(frame / 3 + i) * 2} fill={PALETTE[i % PALETTE.length]} />}
            </g>
          );
        })}
      </svg>

      {/* 도시 노드 */}
      {nodes.map((n, i) => {
        const s = spring({ frame: frame - i * 3, fps, config: { damping: 12, stiffness: 150 } });
        return (
          <div key={n.name} style={{ position: "absolute", left: n.x - 60, top: n.y - 60, transform: `scale(${s})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Avatar id={CAST[i].id} size={120} ring={PALETTE[i % PALETTE.length]} />
            <div style={{ background: "rgba(255,255,255,0.12)", border: `2px solid ${PALETTE[i % PALETTE.length]}`, borderRadius: 999, padding: "4px 18px", fontSize: 28, fontWeight: 800, whiteSpace: "nowrap" }}>
              {n.name}
            </div>
          </div>
        );
      })}

      {/* 허브: 줌 화면 아이콘 */}
      <Pop delay={30} from={30} style={{ position: "absolute", left: hub.x - 170, top: hub.y - 120 }}>
        <div style={{ width: 340, height: 240, borderRadius: 28, background: "#fff", boxShadow: `0 0 0 8px ${C.sky}, 0 30px 60px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 120, height: 84, borderRadius: 18, background: C.sky, position: "relative" }}>
            <div style={{ position: "absolute", right: -30, top: 12, width: 0, height: 0, borderTop: "30px solid transparent", borderBottom: "30px solid transparent", borderLeft: `34px solid ${C.sky}` }} />
          </div>
          <div style={{ color: C.navy, fontWeight: 900, fontSize: 30 }}>줌 화상 수업</div>
        </div>
      </Pop>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", left: 1080, top: 200, width: 700, textAlign: "center" }}>
        <Pop delay={40}><Pill color={C.mint} size={34}>지역이 어디든</Pill></Pop>
        <div style={{ height: 24 }} />
        <Pop delay={48} from={50}><H1 size={84}>매 수업, 한자리에</H1></Pop>
      </div>
    </Board>
  );
};

/* ───────────── 장면 2: 줌 강의실 — 대치동 선생님 실시간 강의 (3.3~7.3초) ───────────── */
export const SceneZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const students = CAST.slice(12, 24);
  const cities = ["서울", "부산", "대구", "제주", "광주", "인천", "대전", "울산", "강릉", "전주", "세종", "해외"];
  // 오픈 카톡방 닉네임 형식: 지역/학년/닉네임
  const grades = ["초5", "초6", "초5", "중1", "초6", "초5", "초6", "중1", "초5", "초6", "초5", "초6"];
  const script = "이 문제는 연립방정식으로 풀어볼까요?";
  const typed = script.slice(0, Math.max(0, Math.floor((frame - 20) / 2)));
  const pulse = 0.5 + Math.sin(frame / 4) * 0.5;

  return (
    <Board>
      <AbsoluteFill style={{ padding: "40px 60px" }}>
        {/* 상단 바 */}
        <Pop>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.coral, boxShadow: `0 0 ${10 + pulse * 20}px ${C.coral}` }} />
            <div style={{ fontSize: 34, fontWeight: 800 }}>LIVE · 수학 특강 · 화상 수업</div>
            <div style={{ marginLeft: "auto", fontSize: 30, opacity: 0.7 }}>참가자 {students.length + 1}명</div>
          </div>
        </Pop>

        <div style={{ display: "flex", gap: 24, flex: 1 }}>
          {/* 선생님 타일 */}
          <Pop delay={4} style={{ flex: 1.35 }}>
            <div style={{ height: 820, borderRadius: 32, overflow: "hidden", position: "relative", background: "linear-gradient(160deg, #2E5E4E 0%, #1F3F36 100%)", boxShadow: `0 0 0 6px ${C.mint}`, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {/* 칠판 판서 */}
              <div style={{ position: "absolute", left: 50, top: 50, fontSize: 40, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                <div>3x + 2y = 2</div>
                <div>3x − 3y = 5</div>
                <div style={{ opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), color: C.yellow }}>→ 빼면 5y = −3</div>
              </div>
              <div style={{ position: "absolute", right: 40, top: 40 }}>
                <Pill color={C.coral} size={26}>대치동 선생님</Pill>
              </div>
              <div style={{ transform: `translateY(${Math.sin(frame / 8) * 4}px)`, marginBottom: 90 }}>
                <Avatar id={TEACHER} size={380} ring="#fff" />
              </div>
              {/* 자막 */}
              <div style={{ position: "absolute", left: 30, right: 30, bottom: 24, background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "14px 24px", fontSize: 36, fontWeight: 700, display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: C.mint }}>🎙</span>
                <span>{typed}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span></span>
              </div>
            </div>
          </Pop>

          {/* 학생 타일 그리드 */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: 16, height: 820 }}>
            {students.map((c, i) => {
              const s = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 13, stiffness: 140 } });
              const hand = i % 5 === 2 && frame > 50 + i * 2;
              const speaking = i === 4 && frame > 70;
              return (
                <div key={c.id} style={{ transform: `scale(${s})`, borderRadius: 22, background: "rgba(255,255,255,0.08)", boxShadow: speaking ? `0 0 0 5px ${C.mint}` : "0 0 0 2px rgba(255,255,255,0.12)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Avatar id={c.id} size={120} ring={PALETTE[i % PALETTE.length]} />
                  <div style={{ position: "absolute", left: 12, bottom: 10, fontSize: 21, fontWeight: 700, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "3px 10px" }}>
                    {cities[i]}/{grades[i]}/{c.ko}
                  </div>
                  {hand && <div style={{ position: "absolute", right: 12, top: 8, fontSize: 40, transform: `rotate(${Math.sin(frame / 3) * 15}deg)` }}>✋</div>}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center" }}>
        <Pop delay={30}><Pill color={C.sky} size={36}>대치동 선생님 강의를 어디서든 실시간으로</Pill></Pop>
      </div>
    </Board>
  );
};

/* ───────────── 장면 3: 문제 풀이 사진 타임랩스 (7.3~18.7초) ───────────── */
export const SceneTimelapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;

  const STACK_END = 250; // 이 프레임까지 한 장씩 쌓임
  // i번째 사진이 등장하는 프레임 — 처음 약 8프레임 간격에서 점점 빨라져 끝에는 약 2프레임 간격
  const LINEAR_MIX = 0.4;
  const appearFrame = (i: number) => {
    const u = i / PHOTO_COUNT;
    const eased = LINEAR_MIX * u + (1 - LINEAR_MIX) * (1 - (1 - u) * (1 - u));
    return STACK_END * eased;
  };
  const WALL_START = 256; // 모자이크로 펼쳐지기 시작
  let shown = 0;
  while (shown < PHOTO_COUNT && appearFrame(shown) <= frame) shown++;

  // 폴라로이드 크기 / 모자이크 셀
  const CARD_W = vertical ? 660 : 500;
  const CARD_H = vertical ? 820 : 620;
  const COLS = vertical ? 5 : 10;
  const ROWS = vertical ? 10 : 5;
  const CELL_W = width / COLS;
  const CELL_H = height / ROWS;
  // 쌓이는 중심점 / 날아오는 시작점
  const STACK_CX = vertical ? width / 2 : 600;
  const STACK_CY = vertical ? 1320 : 540;
  const FROM_X = vertical ? width / 2 : 1500;
  const FROM_Y = vertical ? height + 500 : 1300;

  const wallP = interpolate(frame, [WALL_START, WALL_START + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

  // 결정적 난수
  const rnd = (i: number, k: number) => {
    const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };

  return (
    <Board>
      {Array.from({ length: PHOTO_COUNT }).map((_, i) => {
        if (i >= shown) return null;
        const appearAt = appearFrame(i);
        const s = spring({ frame: frame - appearAt, fps, config: { damping: 16, stiffness: 220 } });

        // 쌓인 위치(가운데 살짝 왼쪽, 무작위 기울기)
        const rot = (rnd(i, 1) - 0.5) * 22;
        const px = STACK_CX + (rnd(i, 2) - 0.5) * 60;
        const py = STACK_CY + (rnd(i, 3) - 0.5) * 50;
        // 날아오는 시작점: 화면 아래
        const fromX = FROM_X + rnd(i, 4) * 400;
        const fromY = FROM_Y;

        const stackX = interpolate(s, [0, 1], [fromX, px]);
        const stackY = interpolate(s, [0, 1], [fromY, py]);
        const stackRot = interpolate(s, [0, 1], [rot + 40, rot]);

        // 모자이크 위치
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const wx = col * CELL_W + CELL_W / 2;
        const wy = row * CELL_H + CELL_H / 2;

        // 순차 이동(왼쪽 위부터)
        const delay = (i / PHOTO_COUNT) * 0.4;
        const p = interpolate(wallP, [delay, Math.min(1, delay + 0.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        const x = interpolate(p, [0, 1], [stackX, wx]);
        const y = interpolate(p, [0, 1], [stackY, wy]);
        const r = interpolate(p, [0, 1], [stackRot, 0]);
        const w = interpolate(p, [0, 1], [CARD_W, CELL_W - 6]);
        const h = interpolate(p, [0, 1], [CARD_H, CELL_H - 6]);
        const pad = interpolate(p, [0, 1], [16, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              transform: `rotate(${r}deg)`,
              background: "#fff",
              padding: pad,
              paddingBottom: pad * 3,
              borderRadius: interpolate(p, [0, 1], [10, 4]),
              boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
              boxSizing: "border-box",
            }}
          >
            <Img src={staticFile(`photos/p${String(i + 1).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        );
      })}

      {/* 스택 단계 텍스트 */}
      <div style={{ position: "absolute", left: vertical ? 80 : 1000, top: vertical ? 150 : 300, width: vertical ? 920 : 860, opacity: 1 - wallP, textAlign: vertical ? "center" : "left" }}>
        <Pop delay={6}><Pill color={C.yellow} size={34}>수업 중 실시간으로</Pill></Pop>
        <div style={{ height: 24 }} />
        <Pop delay={14} from={50}>
          <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -2, lineHeight: 1.15 }}>
            다 같이<br />직접 풀어보는 문제
          </div>
        </Pop>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 800, color: C.yellow }}>
          <span style={{ fontSize: 140, fontVariantNumeric: "tabular-nums" }}>{shown}</span> 장의 풀이
        </div>
      </div>

      {/* 모자이크 단계 오버레이 */}
      <AbsoluteFill style={{ background: "rgba(15,27,51,0.55)", opacity: interpolate(wallP, [0.7, 1], [0, 1], { extrapolateLeft: "clamp" }), justifyContent: "center", alignItems: "center", gap: 28 }}>
        <H1 size={vertical ? 84 : 110}>{vertical ? <>매 수업,<br />손으로 푼 풀이가<br />쌓입니다</> : "매 수업, 손으로 푼 풀이가 쌓입니다"}</H1>
        <div style={{ display: "flex", gap: 18 }}>
          <Pill color={C.sky} size={34}>어디서든</Pill>
          <Pill color={C.mint} size={34}>실시간으로</Pill>
          <Pill color={C.coral} size={34}>함께</Pill>
        </div>
      </AbsoluteFill>
    </Board>
  );
};

/* ───────────── 장면 4: 마무리 (18.7~23초) ───────────── */
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const faces = CAST.slice(24, 38);
  return (
    <Board>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <Pop><Pill color={C.coral} size={36}>대치동 선생님과 줌으로</Pill></Pop>
        <Pop delay={8} from={60}><H1 size={140}>{BRAND}</H1></Pop>
        <Pop delay={16}>
          <div style={{ fontSize: 48, fontWeight: 700, opacity: 0.8 }}>매 수업 시간, 전국의 친구들과 함께 문제를 풉니다</div>
        </Pop>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 50, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10 }}>
        {faces.map((c, i) => (
          <Pop key={c.id} delay={10 + i * 1.5} from={120}>
            <div style={{ transform: `translateY(${Math.sin((frame + i * 5) / 6) * 8}px)` }}>
              <Avatar id={c.id} size={118} ring={PALETTE[i % PALETTE.length]} />
            </div>
          </Pop>
        ))}
      </div>
    </Board>
  );
};
