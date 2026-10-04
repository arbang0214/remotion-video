import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { CHARACTERS, seededShuffle } from "./characters";
import { Avatar, Pop, Pill, Title, COLORS, PALETTE } from "./shared";

const SHUFFLED = seededShuffle(CHARACTERS, 20260910);

/* ───────────── 장면 1: 캐릭터들이 쏟아지며 제목 등장 (0~2.5초) ───────────── */
export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 화면 가득 캐릭터 30명이 사방에서 날아와 원형으로 정렬
  const faces = SHUFFLED.slice(0, 30);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <AbsoluteFill>
      {faces.map((c, i) => {
        const angle = (i / faces.length) * Math.PI * 2;
        const rx = i % 2 === 0 ? 780 : 690;
        const ry = i % 2 === 0 ? 420 : 350;
        const tx = cx + Math.cos(angle) * rx;
        const ty = cy + Math.sin(angle) * ry;
        const s = spring({ frame: frame - i * 1.2, fps, config: { damping: 14, stiffness: 90 } });
        // 시작점: 화면 바깥
        const sx = cx + Math.cos(angle) * 1400;
        const sy = cy + Math.sin(angle) * 1000;
        const x = interpolate(s, [0, 1], [sx, tx]);
        const y = interpolate(s, [0, 1], [sy, ty]);
        const bob = Math.sin((frame + i * 7) / 9) * 6;
        const size = i % 2 === 0 ? 120 : 96;
        return (
          <div
            key={c.id}
            style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + bob, transform: `rotate(${(1 - s) * 90}deg)` }}
          >
            <Avatar id={c.id} size={size} ring={PALETTE[i % PALETTE.length]} />
          </div>
        );
      })}

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
        <Pop delay={14}>
          <Pill color={COLORS.pink} size={40}>수학 특강 쉬는 시간에</Pill>
        </Pop>
        <Pop delay={22} from={60}>
          <Title size={150} color={COLORS.orange}>쉬는 시간 게임</Title>
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── 장면 2: 캐릭터 랜덤 뽑기 슬롯머신 (2.5~5.5초) ───────────── */
export const SceneRandom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const SPIN_END = 48; // 이 프레임까지 빠르게 돌다가 멈춤
  const finalIdx = 19; // 여우
  const reel = SHUFFLED;
  const winner = CHARACTERS[finalIdx];

  // 돌아가는 속도: 처음 빠르게, 점점 느리게
  const progress = interpolate(frame, [0, SPIN_END], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const reelPos = progress * 36; // 총 36칸 넘김
  const spinning = frame < SPIN_END;

  const landed = spring({ frame: frame - SPIN_END, fps, config: { damping: 9, stiffness: 160 } });
  const shake = spinning ? Math.sin(frame * 2.5) * 4 : 0;

  // 3칸 보이는 세로 릴
  const cell = 240;
  const visible = [-1, 0, 1].map((k) => {
    const idx = Math.floor(reelPos) + k;
    const offset = (reelPos - Math.floor(reelPos)) * cell;
    return { k, idx, offset };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 110 }}>
        <Pop>
          <Title size={96}>내 캐릭터는 <span style={{ color: COLORS.purple }}>랜덤</span>으로!</Title>
        </Pop>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 80, marginTop: 80 }}>
        {/* 릴 프레임 */}
        <div
          style={{
            width: 300,
            height: cell * 3,
            borderRadius: 40,
            background: "#fff",
            border: `12px solid ${COLORS.yellow}`,
            boxShadow: "0 20px 40px rgba(59,42,26,0.2)",
            overflow: "hidden",
            position: "relative",
            transform: `translateX(${shake}px)`,
          }}
        >
          {spinning
            ? visible.map(({ k, idx, offset }) => {
                const c = reel[((idx % reel.length) + reel.length) % reel.length];
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: (k + 1) * cell - offset,
                      height: cell,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: k === 0 ? 1 : 0.45,
                      filter: `blur(${(1 - progress) * 3}px)`,
                    }}
                  >
                    <Avatar id={c.id} size={190} ring={k === 0 ? COLORS.yellow : "#eee"} />
                  </div>
                );
              })
            : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transform: `scale(${0.9 + landed * 0.25})`,
                }}
              >
                <Avatar id={winner.id} size={210} ring={COLORS.orange} />
              </div>
            )}
          {/* 가운데 강조 띠 */}
          <div style={{ position: "absolute", left: 0, right: 0, top: cell, height: cell, border: `6px solid ${COLORS.orange}`, borderRadius: 24, opacity: spinning ? 0.6 : 0, pointerEvents: "none" }} />
        </div>

        {/* 결과 카드 */}
        <div style={{ width: 640 }}>
          {spinning ? (
            <div style={{ fontSize: 72, fontWeight: 800, color: COLORS.ink, opacity: 0.55 }}>
              두구두구두구{".".repeat((Math.floor(frame / 6) % 3) + 1)}
            </div>
          ) : (
            <Pop from={30}>
              <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.ink, opacity: 0.7, marginBottom: 8 }}>오늘의 내 이름은</div>
              <div style={{ fontSize: 104, fontWeight: 900, color: COLORS.orange, letterSpacing: -3, lineHeight: 1.1 }}>
                피리부는 {winner.ko}
              </div>
              <div style={{ marginTop: 28 }}>
                <Pill color={COLORS.mint} size={36}>귀여운 동물 54종 중 하나!</Pill>
              </div>
            </Pop>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 장면 3: 다 같이 복습 퀴즈 (5.5~8.5초) ───────────── */
export const SceneQuiz: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const players = SHUFFLED.slice(30, 54); // 24명
  const answers = [
    { label: "0.28", color: COLORS.orange, correct: true },
    { label: "2.8", color: COLORS.blue, correct: false },
    { label: "0.028", color: COLORS.mint, correct: false },
    { label: "28", color: COLORS.pink, correct: false },
  ];

  // 학생들이 답을 고르는 타이밍 (한 명씩 답변 표시)
  const REVEAL = 66;
  const revealed = frame >= REVEAL;
  const revealS = spring({ frame: frame - REVEAL, fps, config: { damping: 10, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ padding: "70px 100px" }}>
      <Pop>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Pill color={COLORS.blue} size={38}>문제 3 / 10</Pill>
          <Title size={82}>다 같이 <span style={{ color: COLORS.blue }}>복습 퀴즈</span> 풀기!</Title>
        </div>
      </Pop>

      <div style={{ display: "flex", gap: 60, marginTop: 40, flex: 1 }}>
        {/* 문제 카드 */}
        <Pop delay={6} style={{ flex: 1.1 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 40,
              padding: "44px 56px",
              boxShadow: "0 20px 40px rgba(59,42,26,0.15)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 108, fontWeight: 900, letterSpacing: -2, textAlign: "center", marginTop: 20 }}>
              0.7 × 0.4 = <span style={{ color: COLORS.orange }}>?</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {answers.map((a, i) => {
                const dim = revealed && !a.correct;
                const bump = a.correct ? 1 + revealS * 0.06 : 1;
                return (
                  <Pop key={a.label} delay={12 + i * 4} from={20}>
                    <div
                      style={{
                        background: a.color,
                        color: "#fff",
                        borderRadius: 24,
                        padding: "26px 0",
                        fontSize: 64,
                        fontWeight: 900,
                        textAlign: "center",
                        opacity: dim ? 0.25 : 1,
                        transform: `scale(${bump})`,
                        boxShadow: a.correct && revealed ? `0 0 0 10px ${COLORS.yellow}` : "0 8px 0 rgba(59,42,26,0.15)",
                      }}
                    >
                      {a.label} {a.correct && revealed ? "✓" : ""}
                    </div>
                  </Pop>
                );
              })}
            </div>
          </div>
        </Pop>

        {/* 참가자 패널 */}
        <Pop delay={10} style={{ flex: 0.9 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.7)",
              borderRadius: 40,
              padding: "34px 40px",
              height: "100%",
              boxShadow: "0 20px 40px rgba(59,42,26,0.1)",
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
              <span>참가자 {players.length}명</span>
              <span style={{ color: COLORS.mint }}>
                답변 {Math.min(players.length, Math.max(0, Math.floor((frame - 14) / 2)))}명
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
              {players.map((c, i) => {
                const answeredAt = 14 + i * 2;
                const answered = frame >= answeredAt;
                const s = spring({ frame: frame - i * 2, fps, config: { damping: 12 } });
                const jump = answered ? Math.max(0, Math.sin(((frame - answeredAt) / fps) * Math.PI * 4)) * (frame - answeredAt < 12 ? 14 : 0) : 0;
                return (
                  <div key={c.id} style={{ transform: `scale(${s}) translateY(${-jump}px)`, position: "relative" }}>
                    <Avatar id={c.id} size={110} ring={answered ? COLORS.mint : "#fff"} />
                    {answered && (
                      <div
                        style={{
                          position: "absolute",
                          right: -4,
                          bottom: -4,
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: COLORS.mint,
                          color: "#fff",
                          fontSize: 24,
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "3px solid #fff",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── 장면 4: 마무리 (8.5~10초) ───────────── */
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const faces = SHUFFLED.slice(0, 12);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
      {/* 아래에서 올라오는 캐릭터 줄 */}
      <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 14 }}>
        {faces.map((c, i) => (
          <Pop key={c.id} delay={4 + i * 1.5} from={120}>
            <div style={{ transform: `translateY(${Math.sin((frame + i * 5) / 6) * 8}px)` }}>
              <Avatar id={c.id} size={130} ring={PALETTE[i % PALETTE.length]} />
            </div>
          </Pop>
        ))}
      </div>

      <Pop>
        <Pill color={COLORS.orange} size={40}>폰으로 QR 찍고 바로 입장</Pill>
      </Pop>
      <Pop delay={6} from={60}>
        <Title size={150}>쉬는 시간 게임</Title>
      </Pop>
      <Pop delay={12}>
        <div style={{ fontSize: 52, fontWeight: 700, opacity: 0.75, marginBottom: 80 }}>지금 시작!</div>
      </Pop>
    </AbsoluteFill>
  );
};
