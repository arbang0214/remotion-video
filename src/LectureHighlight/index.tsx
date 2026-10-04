import React from "react";
import { AbsoluteFill, Sequence, OffthreadVideo, Freeze, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT, Pill, Pop } from "../BreakGameIntro/shared";
import { DATA_0910, INTRO_FRAMES, OUTRO_FRAMES, FPS } from "./clips";
import type { Rect, HighlightData, Chat as ChatEvent } from "./clips";

const C = { navy: "#0F1B33", navy2: "#16294D", gold: "#C9A24A", sky: "#5DB7FF", coral: "#FF7B7B", mint: "#3DDC97" };
const SRC_W = 1920;
const SRC_H = 1080;

const clipFrames = (d: HighlightData, i: number) => Math.round(d.clips[i].duration * FPS) + (i === d.clips.length - 1 ? d.holdAfterLast : 0);

export const highlightDuration = (d: HighlightData = DATA_0910) => INTRO_FRAMES + d.clips.reduce((a, _c, i) => a + clipFrames(d, i), 0) + OUTRO_FRAMES;

export const Backdrop: React.FC<{ children: React.ReactNode; deco?: boolean }> = ({ children, deco }) => {
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
export const GlowCard: React.FC<{ children: React.ReactNode; colors: [string, string]; radius?: number; style?: React.CSSProperties }> = ({ children, colors, radius = 28, style }) => (
  <div style={{ padding: 6, borderRadius: radius + 6, background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${colors[0]}55`, ...style }}>
    <div style={{ borderRadius: radius, overflow: "hidden", background: "#fff" }}>{children}</div>
  </div>
);

// 인트로 카드
const Intro: React.FC<{ data: HighlightData }> = ({ data }) => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return (
    <Backdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26, padding: "0 60px", textAlign: "center" }}>
        <Pop><Pill color={C.gold} size={v ? 30 : 34}>대치동캐슬 · 실시간 수업 하이라이트</Pill></Pop>
        <Pop delay={6} from={60}>
          <div style={{ fontSize: v ? 96 : 110, fontWeight: 900, letterSpacing: -3, lineHeight: 1.2, wordBreak: "keep-all" }}>{data.title}</div>
        </Pop>
        <Pop delay={12}><div style={{ fontSize: v ? 38 : 44, fontWeight: 700, opacity: 0.8 }}>{data.subtitle}</div></Pop>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 원본 영상의 일부 영역(rect)만 잘라 W x H 박스에 채워 보여준다
export const CropVideo: React.FC<{ src: string; rect: Rect; width: number; height: number; muted?: boolean; radius?: number }> = ({ src, rect, width, height, muted, radius = 0 }) => {
  const scale = width / rect.w;
  return (
    <div style={{ width, height, overflow: "hidden", borderRadius: radius, position: "relative", background: "#fff" }}>
      <div style={{ position: "absolute", left: -rect.x * scale, top: -rect.y * scale, width: SRC_W * scale, height: SRC_H * scale }}>
        <OffthreadVideo src={src} muted={muted} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    </div>
  );
};

// 줌 채팅 연출: 판서 카드 오른쪽 아래(지문이 없는 여백)에 실제 채팅이 순서대로 쌓이고(최대 3줄), 이모지 리액션은 왼쪽 아래에서 둥실 떠오른다
const NAME_COLORS = [C.sky, C.mint, C.gold, C.coral, "#C39BFF"];
export const ChatOverlay: React.FC<{ chats: ChatEvent[]; width: number; height: number }> = ({ chats, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const LIFE = 6; // 말풍선이 머무는 시간(초)
  const msgs = chats.filter((c) => c.text);
  const live = msgs.filter((c) => t >= c.t && t < c.t + LIFE).slice(-3);
  const emojis = chats.filter((c) => c.emoji && t >= c.t && t < c.t + 2.2);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, pointerEvents: "none", overflow: "hidden", borderRadius: 22 }}>
      <div style={{ position: "absolute", right: 22, bottom: 22, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", maxWidth: width * 0.6 }}>
        {live.map((c) => {
          const i = msgs.indexOf(c);
          const age = t - c.t;
          const s = spring({ frame: Math.round(age * fps), fps, config: { damping: 13, stiffness: 160 } });
          const out = interpolate(age, [LIFE - 0.6, LIFE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const color = NAME_COLORS[i % NAME_COLORS.length];
          return (
            <div key={i} style={{ transform: `translateX(${(1 - s) * 60}px) scale(${0.85 + s * 0.15})`, opacity: Math.min(s, out), transformOrigin: "right bottom", background: "rgba(15,27,51,0.88)", border: `2px solid ${color}55`, borderRadius: 18, padding: "10px 18px", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", color: "#fff" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 2 }}>💬 {c.name}</div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25, wordBreak: "keep-all" }}>{c.text}</div>
            </div>
          );
        })}
      </div>
      {emojis.map((c) => {
        const j = chats.indexOf(c);
        const age = t - c.t;
        const y = age * 150; // 초당 150px 상승
        const x = ((j * 53) % 90) - 45; // 좌우로 살짝 흩어짐
        const sway = Math.sin(age * 5 + j) * 14;
        const op = interpolate(age, [0, 0.2, 1.6, 2.2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const sc = interpolate(age, [0, 0.25], [0.4, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={j} style={{ position: "absolute", left: 90 + x, bottom: 30 + y, fontSize: 64, opacity: op, transform: `translateX(${sway}px) scale(${sc})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>
            {c.emoji}
          </div>
        );
      })}
    </div>
  );
};

// 클립 하나: 영상 + 챕터 라벨 + 자막 (+ 마지막 클립은 끝에서 정지)
const Clip: React.FC<{ data: HighlightData; index: number }> = ({ data, index }) => {
  const CLIPS = data.clips;
  const clip = CLIPS[index];
  const CAM = clip.cam ?? data.cam;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  const videoLen = Math.round(clip.duration * fps);
  const total = clipFrames(data, index);
  const holding = frame >= videoLen; // 정지 구간
  const inOut = interpolate(frame, [0, 6, total - 10, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelS = spring({ frame, fps, config: { damping: 14 } });

  const t = Math.min(frame, videoLen - 1) / fps;
  const cap = holding ? undefined : clip.captions.find((c) => t >= c.start && t < c.end);
  const src = staticFile(clip.file);

  // 정지 구간에는 마지막 프레임을 고정하고 소리를 끈다
  const FreezeIfHolding: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    holding ? <Freeze frame={videoLen - 1}>{children}</Freeze> : <>{children}</>;

  if (vertical) {
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
            {clip.chats && clip.chats.length > 0 && <ChatOverlay chats={clip.chats} width={cardW} height={boardH} />}
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

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <FreezeIfHolding>
        <OffthreadVideo src={src} muted={holding} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </FreezeIfHolding>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.75) 100%)" }} />
      <div style={{ position: "absolute", left: 60, top: 50, transform: `translateX(${(1 - labelS) * -80}px)`, opacity: labelS, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ background: C.coral, color: "#fff", fontWeight: 900, fontSize: 30, padding: "8px 18px", borderRadius: 12 }}>{index + 1}</div>
        <div style={{ background: "rgba(15,27,51,0.85)", color: "#fff", fontWeight: 800, fontSize: 34, padding: "8px 24px", borderRadius: 12 }}>{clip.label}</div>
      </div>
      {clip.chats && clip.chats.length > 0 && (
        <div style={{ position: "absolute", left: 60, top: 140, width: 620, height: height - 300 }}>
          <ChatOverlay chats={clip.chats} width={620} height={height - 300} />
        </div>
      )}
      {cap && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", padding: "0 160px" }}>
          <div style={{ background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 46, fontWeight: 800, padding: "16px 36px", borderRadius: 16, textAlign: "center", lineHeight: 1.35, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>{cap.text}</div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - inOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// 아웃트로: 선생님 소개 + 브랜드
export const Outro: React.FC<{ data: HighlightData }> = ({ data }) => {
  const TEACHER = data.teacher;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const photoS = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const brandIn = interpolate(frame, [OUTRO_FRAMES - 60, OUTRO_FRAMES - 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Backdrop deco>
      <AbsoluteFill style={{ padding: v ? "0 80px 220px" : "60px 120px", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: v ? 44 : 90 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: v ? 40 : 34, alignItems: v ? "center" : "flex-start", textAlign: v ? "center" : "left" }}>
          {TEACHER.points.map((p, i) => {
            const s = spring({ frame: frame - 22 - i * 12, fps, config: { damping: 13, stiffness: 130 } });
            const accent = [C.sky, C.gold, C.mint][i];
            return (
              <div key={i} style={{ transform: `translateY(${(1 - s) * 30}px)`, opacity: s }}>
                <div style={{ fontSize: v ? 46 : 40, fontWeight: 900, lineHeight: 1.2, letterSpacing: -1 }}>
                  <span style={{ color: accent }}>{p.title}</span>
                </div>
                <div style={{ fontSize: v ? 30 : 27, fontWeight: 600, opacity: 0.8, marginTop: 8, wordBreak: "keep-all" }}>{p.desc}</div>
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

export const LectureHighlight: React.FC<{ data?: HighlightData }> = ({ data = DATA_0910 }) => {
  let cursor = INTRO_FRAMES;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#000" }}>
      <Sequence durationInFrames={INTRO_FRAMES}><Intro data={data} /></Sequence>
      {data.clips.map((_c, i) => {
        const len = clipFrames(data, i);
        const from = cursor;
        cursor += len;
        return (
          <Sequence key={i} from={from} durationInFrames={len}><Clip data={data} index={i} /></Sequence>
        );
      })}
      <Sequence from={cursor} durationInFrames={OUTRO_FRAMES}><Outro data={data} /></Sequence>
    </AbsoluteFill>
  );
};
