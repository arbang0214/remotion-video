import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { Avatar, Pop, Pill } from "../BreakGameIntro/shared";
import { BRAND } from "./config";
import { Board, H1, C, PALETTE, CAST, TEACHER } from "./scenes";

// 세로(1080x1920) 전용 배치. 타임랩스 장면은 scenes.tsx 의 SceneTimelapse 가 방향을 자동 감지한다.

/* ───────────── 장면 1(세로): 지역이 어디든 ───────────── */
export const SceneRegionsV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes = [
    { name: "서울", x: 420, y: 560 },
    { name: "인천", x: 220, y: 640 },
    { name: "강릉", x: 720, y: 540 },
    { name: "세종", x: 560, y: 720 },
    { name: "대전", x: 380, y: 860 },
    { name: "대구", x: 760, y: 860 },
    { name: "전주", x: 300, y: 1040 },
    { name: "울산", x: 900, y: 1020 },
    { name: "광주", x: 260, y: 1220 },
    { name: "부산", x: 780, y: 1200 },
    { name: "제주", x: 200, y: 1420 },
    { name: "해외", x: 880, y: 1420 },
  ];
  const hub = { x: 540, y: 1640 };

  return (
    <Board>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {nodes.map((n, i) => {
          const p = interpolate(frame - 10 - i * 3, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <line key={n.name} x1={n.x} y1={n.y} x2={n.x + (hub.x - n.x) * p} y2={n.y + (hub.y - n.y) * p} stroke={PALETTE[i % PALETTE.length]} strokeWidth={4} strokeOpacity={0.55} strokeDasharray="14 12" strokeDashoffset={-frame * 3} />
          );
        })}
      </svg>

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

      <Pop delay={30} from={30} style={{ position: "absolute", left: hub.x - 170, top: hub.y - 110 }}>
        <div style={{ width: 340, height: 220, borderRadius: 28, background: "#fff", boxShadow: `0 0 0 8px ${C.sky}, 0 30px 60px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 110, height: 76, borderRadius: 18, background: C.sky, position: "relative" }}>
            <div style={{ position: "absolute", right: -28, top: 10, width: 0, height: 0, borderTop: "28px solid transparent", borderBottom: "28px solid transparent", borderLeft: `32px solid ${C.sky}` }} />
          </div>
          <div style={{ color: C.navy, fontWeight: 900, fontSize: 30 }}>줌 화상 수업</div>
        </div>
      </Pop>

      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
        <Pop delay={40}><Pill color={C.mint} size={36}>지역이 어디든</Pill></Pop>
        <div style={{ height: 24 }} />
        <Pop delay={48} from={50}><H1 size={92}>매 수업, 한자리에</H1></Pop>
      </div>
    </Board>
  );
};

/* ───────────── 장면 2(세로): 줌 강의실 ───────────── */
export const SceneZoomV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const students = CAST.slice(12, 24);
  const cities = ["서울", "부산", "대구", "제주", "광주", "인천", "대전", "울산", "강릉", "전주", "세종", "해외"];
  const grades = ["초5", "초6", "초5", "중1", "초6", "초5", "초6", "중1", "초5", "초6", "초5", "초6"];
  const script = "이 문제는 연립방정식으로 풀어볼까요?";
  const typed = script.slice(0, Math.max(0, Math.floor((frame - 20) / 2)));
  const pulse = 0.5 + Math.sin(frame / 4) * 0.5;

  return (
    <Board>
      <AbsoluteFill style={{ padding: "60px 50px" }}>
        <Pop>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.coral, boxShadow: `0 0 ${10 + pulse * 20}px ${C.coral}` }} />
            <div style={{ fontSize: 34, fontWeight: 800 }}>LIVE · 수학 특강</div>
            <div style={{ marginLeft: "auto", fontSize: 28, opacity: 0.7 }}>참가자 {students.length + 1}명</div>
          </div>
        </Pop>

        {/* 선생님 타일 */}
        <Pop delay={4}>
          <div style={{ height: 760, borderRadius: 32, overflow: "hidden", position: "relative", background: "linear-gradient(160deg, #2E5E4E 0%, #1F3F36 100%)", boxShadow: `0 0 0 6px ${C.mint}`, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ position: "absolute", left: 40, top: 36, fontSize: 36, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
              <div>3x + 2y = 2</div>
              <div>3x − 3y = 5</div>
              <div style={{ opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), color: C.yellow }}>→ 빼면 5y = −3</div>
            </div>
            <div style={{ position: "absolute", right: 30, top: 30 }}>
              <Pill color={C.coral} size={26}>대치동 선생님</Pill>
            </div>
            <div style={{ transform: `translateY(${Math.sin(frame / 8) * 4}px)`, marginBottom: 110 }}>
              <Avatar id={TEACHER} size={360} ring="#fff" />
            </div>
            <div style={{ position: "absolute", left: 24, right: 24, bottom: 20, background: "rgba(0,0,0,0.55)", borderRadius: 18, padding: "14px 22px", fontSize: 32, fontWeight: 700, display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ color: C.mint }}>🎙</span>
              <span>{typed}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span></span>
            </div>
          </div>
        </Pop>

        {/* 학생 그리드 3x4 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gap: 14, height: 820, marginTop: 24 }}>
          {students.map((c, i) => {
            const s = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 13, stiffness: 140 } });
            const hand = i % 5 === 2 && frame > 50 + i * 2;
            const speaking = i === 4 && frame > 70;
            return (
              <div key={c.id} style={{ transform: `scale(${s})`, borderRadius: 22, background: "rgba(255,255,255,0.08)", boxShadow: speaking ? `0 0 0 5px ${C.mint}` : "0 0 0 2px rgba(255,255,255,0.12)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Avatar id={c.id} size={110} ring={PALETTE[i % PALETTE.length]} />
                <div style={{ position: "absolute", left: 10, bottom: 8, fontSize: 20, fontWeight: 700, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "3px 9px" }}>
                  {cities[i]}/{grades[i]}/{c.ko}
                </div>
                {hand && <div style={{ position: "absolute", right: 10, top: 6, fontSize: 38, transform: `rotate(${Math.sin(frame / 3) * 15}deg)` }}>✋</div>}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center" }}>
        <Pop delay={30}><Pill color={C.sky} size={32}>대치동 선생님 강의를 어디서든 실시간으로</Pill></Pop>
      </div>
    </Board>
  );
};

/* ───────────── 장면 4(세로): 마무리 ───────────── */
export const SceneOutroV: React.FC = () => {
  const frame = useCurrentFrame();
  const faces = CAST.slice(24, 38);
  return (
    <Board>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30, padding: "0 60px", textAlign: "center" }}>
        <Pop><Pill color={C.coral} size={36}>대치동 선생님과 줌으로</Pill></Pop>
        <Pop delay={8} from={60}><H1 size={150}>{BRAND}</H1></Pop>
        <Pop delay={16}>
          <div style={{ fontSize: 44, fontWeight: 700, opacity: 0.8, lineHeight: 1.5 }}>매 수업 시간,<br />전국의 친구들과 함께 문제를 풉니다</div>
        </Pop>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 100, left: 0, right: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, padding: "0 60px" }}>
        {faces.map((c, i) => (
          <Pop key={c.id} delay={10 + i * 1.5} from={120}>
            <div style={{ transform: `translateY(${Math.sin((frame + i * 5) / 6) * 8}px)` }}>
              <Avatar id={c.id} size={120} ring={PALETTE[i % PALETTE.length]} />
            </div>
          </Pop>
        ))}
      </div>
    </Board>
  );
};
