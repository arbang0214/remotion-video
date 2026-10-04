import io, sys
p = 'C:/dev/remotion-video/src/LectureHighlight/index.tsx'
s = open(p, encoding='utf-8').read()

s = s.replace('import { AbsoluteFill, Sequence, OffthreadVideo, Freeze, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";',
              'import { AbsoluteFill, Sequence, OffthreadVideo, Freeze, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";')
s = s.replace('import { CLIPS, CAM, HIGHLIGHT_TITLE, HIGHLIGHT_SUBTITLE, INTRO_FRAMES, OUTRO_FRAMES, HOLD_AFTER_LAST, FPS } from "./clips";',
              'import { CLIPS, CAM, TEACHER, HIGHLIGHT_TITLE, HIGHLIGHT_SUBTITLE, INTRO_FRAMES, OUTRO_FRAMES, HOLD_AFTER_LAST, FPS } from "./clips";')

# ── Backdrop + GlowCard ──
old = s[s.index("const Backdrop: React.FC"):s.index("// 인트로 카드")]
new = '''const Backdrop: React.FC<{ children: React.ReactNode; deco?: boolean }> = ({ children, deco }) => {
  const frame = useCurrentFrame();
  const glyphs = ["½", "×", "+", "⅓", "=", "÷", "¼", "−"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.navy2} 0%, ${C.navy} 70%)`, color: "#fff", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      {deco &&
        glyphs.map((g, i) => {
          const x = (i * 137) % 100;
          const y = ((i * 71 + frame * 0.15 * (1 + (i % 3) * 0.4)) % 110) - 5;
          return (
            <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, fontSize: 60 + (i % 3) * 30, fontWeight: 900, color: [C.sky, C.mint, C.gold, C.coral][i % 4], opacity: 0.12, transform: `rotate(${((i * 23) % 40) - 20}deg)` }}>
              {g}
            </div>
          );
        })}
      {children}
    </AbsoluteFill>
  );
};

// 그라데이션 테두리 카드
const GlowCard: React.FC<{ children: React.ReactNode; colors: [string, string]; radius?: number; style?: React.CSSProperties }> = ({ children, colors, radius = 28, style }) => (
  <div style={{ padding: 6, borderRadius: radius + 6, background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${colors[0]}55`, ...style }}>
    <div style={{ borderRadius: radius, overflow: "hidden", background: "#fff" }}>{children}</div>
  </div>
);

'''
s = s.replace(old, new)

# ── vertical clip layout ──
old = s[s.index("  if (vertical) {"):s.index('  return (\n    <AbsoluteFill style={{ background: "#000" }}>')]
new = '''  if (vertical) {
    const cardW = 1000;
    const camH = Math.round((cardW * CAM.h) / CAM.w);
    const boardH = Math.round((cardW * clip.board.h) / clip.board.w);
    const camTop = 360;
    const boardTop = camTop + camH + 70;
    const pulse = 0.5 + Math.sin(frame / 4) * 0.5;
    return (
      <Backdrop deco>
        {/* 상단: 배지 + 챕터 라벨 + 진행 점 */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, transform: `translateY(${(1 - labelS) * -40}px)`, opacity: labelS }}>
          <Pill color={C.gold} size={28}>대치동캐슬 · 수업 하이라이트</Pill>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ background: C.coral, color: "#fff", fontWeight: 900, fontSize: 40, padding: "10px 24px", borderRadius: 14 }}>{index + 1}</div>
            <div style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, fontSize: 46, padding: "10px 30px", borderRadius: 14 }}>{clip.label}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {CLIPS.map((_c, i) => (
              <div key={i} style={{ width: i === index ? 44 : 14, height: 14, borderRadius: 7, background: i === index ? C.gold : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>

        <FreezeIfHolding>
          {/* 선생님 캠 카드 */}
          <div style={{ position: "absolute", left: (width - cardW) / 2 - 6, top: camTop }}>
            <GlowCard colors={[C.sky, C.mint]}>
              <CropVideo src={src} rect={CAM} width={cardW} height={camH} muted />
            </GlowCard>
            <div style={{ position: "absolute", left: 26, top: 26, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.6)", borderRadius: 999, padding: "8px 18px" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.coral, boxShadow: `0 0 ${6 + pulse * 14}px ${C.coral}` }} />
              <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>LIVE</span>
            </div>
            <div style={{ position: "absolute", right: 26, bottom: 26, background: "rgba(15,27,51,0.9)", border: `2px solid ${C.mint}`, borderRadius: 14, padding: "8px 20px", fontSize: 28, fontWeight: 800 }}>
              {TEACHER.name} · 대치동 선생님
            </div>
          </div>

          {/* 카드 사이 연결 장식 */}
          <div style={{ position: "absolute", left: width / 2 - 3, top: camTop + camH + 12, width: 6, height: 46, borderRadius: 3, background: `linear-gradient(${C.mint}, ${C.gold})`, opacity: 0.8 }} />

          {/* 판서 카드 */}
          <div style={{ position: "absolute", left: (width - cardW) / 2 - 6, top: boardTop }}>
            <GlowCard colors={[C.gold, C.coral]} radius={22}>
              <CropVideo src={src} rect={clip.board} width={cardW} height={boardH} muted={holding} />
            </GlowCard>
            <div style={{ position: "absolute", left: 26, top: -22, background: C.gold, color: C.navy, borderRadius: 999, padding: "6px 20px", fontSize: 26, fontWeight: 900 }}>
              ✏️ 실시간 판서
            </div>
          </div>
        </FreezeIfHolding>

        {cap && (
          <div style={{ position: "absolute", left: 0, right: 0, top: boardTop + boardH + 70, display: "flex", justifyContent: "center", padding: "0 60px" }}>
            <div style={{ color: "#fff", fontSize: 50, fontWeight: 900, textAlign: "center", lineHeight: 1.4, textShadow: "0 3px 10px rgba(0,0,0,0.8)", wordBreak: "keep-all" }}>{cap.text}</div>
          </div>
        )}
        <AbsoluteFill style={{ background: "#000", opacity: 1 - inOut, pointerEvents: "none" }} />
      </Backdrop>
    );
  }

'''
s = s.replace(old, new)

# ── outro ──
old = s[s.index("const Outro: React.FC"):s.index("export const LectureHighlight")]
new = '''// 아웃트로: 선생님 소개 + 브랜드
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const photoS = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const brandIn = interpolate(frame, [OUTRO_FRAMES - 60, OUTRO_FRAMES - 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Backdrop deco>
      <AbsoluteFill style={{ padding: v ? "180px 80px 0" : "60px 120px", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-start" : "center", gap: v ? 44 : 90 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <Pop><Pill color={C.coral} size={v ? 32 : 30}>{TEACHER.headline}</Pill></Pop>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${photoS})` }}>
            <div style={{ padding: 8, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.mint})`, boxShadow: `0 0 50px ${C.sky}66` }}>
              <Img src={staticFile(TEACHER.photo)} style={{ width: v ? 300 : 260, height: v ? 300 : 260, borderRadius: "50%", display: "block", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: v ? 64 : 56, fontWeight: 900, letterSpacing: -1 }}>{TEACHER.name}</div>
            <div style={{ fontSize: v ? 30 : 28, fontWeight: 700, opacity: 0.75 }}>{TEACHER.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {TEACHER.points.map((p, i) => {
            const s = spring({ frame: frame - 22 - i * 12, fps, config: { damping: 13, stiffness: 130 } });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateX(${(1 - s) * 80}px)`, opacity: s, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.14)", borderRadius: 22, padding: "20px 28px", width: v ? 900 : 760 }}>
                <div style={{ width: 76, height: 76, borderRadius: 20, background: [C.sky, C.gold, C.mint][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: v ? 40 : 36, fontWeight: 900, lineHeight: 1.2 }}>{p.title}</div>
                  <div style={{ fontSize: v ? 28 : 26, fontWeight: 600, opacity: 0.75, marginTop: 6 }}>{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: v ? 120 : 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: brandIn, transform: `translateY(${(1 - brandIn) * 30}px)` }}>
        <div style={{ fontSize: v ? 70 : 56, fontWeight: 900, letterSpacing: -2 }}>대치동캐슬</div>
        <div style={{ fontSize: v ? 30 : 26, fontWeight: 700, opacity: 0.75 }}>매 수업, 전국의 친구들과 줌으로 함께</div>
      </div>
    </Backdrop>
  );
};

'''
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print("patched")
