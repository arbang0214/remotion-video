import React from "react";
import { AbsoluteFill, Sequence, OffthreadVideo, Audio, Freeze, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FONT } from "../BreakGameIntro/shared";
import { FPS } from "./clips";
import { HookText } from "./Hook";
import type { Rect, HighlightData, Chat as ChatEvent } from "./clips";

// 세로 쇼츠 레이아웃 (1080x1920)
// - 위 절반(960) = 라이브: [타이틀 여백 230][캠 852x480][자막 띠 250], 배경은 캠을 블러한 앰비언트
// - 아래 절반(960) = 실시간 수업 화면(판서, cover 크롭) + 그 위에 학생 채팅·이모지 반응 오버랩
// - bigBoard 클립만 라이브 780 / 수업 화면 1140 (풀이 판서를 크게 보여줄 때)
// - 챕터마다: 제목+한 줄 설명이 중앙에 "짠" 등장 → 제목만 위 타이틀 여백으로 이동 → 영상 재생 (그동안 첫 프레임 정지)
// - 첫 클립은 그 앞에 에피소드 타이틀. 유튜브 쇼츠 자동 썸네일이 첫 프레임을 잡으므로 0프레임에 이미 완성된 카드로 시작(페이드인 없음). 마지막에 아웃트로(선생님 사진 + 문구 + QR 2개, data.outro 가 있을 때만)
// - 자막은 캠 아래 띠에(줄바꿈 지원), 채팅은 수업 화면 오른쪽 아래에 크게, 이모지는 수업 화면 왼쪽에서 여러 개 떠오름

const C = { gold: "#FFD23F", coral: "#FF5C7A", sky: "#5DB7FF", mint: "#3DDC97", ink: "#0F1B33" };
const SRC_W = 1920;
const SRC_H = 1080;
const W = 1080;
const H = 1920;
const CAM_W2 = 852; // 캠 표시 크기(원본 426x240 의 2배 — 화질 때문에 이 이상 키우지 않음)
const CAM_H2 = 480;
const TITLE_LEAD = 40; // 첫 클립 앞 에피소드 타이틀: 0프레임부터 완성된 카드(썸네일용)로 0.9초 머문 뒤 0.4초 퇴장
const CHAPTER_LEAD = 48; // 챕터 제목 등장 → 위로 이동(1.6초), 이 동안 영상 정지

type Layout = { liveH: number; titleBand: number; camTop: number; bandTop: number; headerY: number; headerScale: number };
const layoutOf = (bigBoard?: boolean): Layout =>
  bigBoard
    ? { liveH: 780, titleBand: 130, camTop: 130, bandTop: 610, headerY: 44, headerScale: 0.42 }
    : { liveH: 960, titleBand: 230, camTop: 230, bandTop: 710, headerY: 118, headerScale: 0.6 };

const OUTRO_FRAMES = 180; // 아웃트로 6초 (QR 찍을 시간)

const leadFrames = (d: HighlightData, i: number) => (d.clips[i].label ? CHAPTER_LEAD : 0) + (i === 0 ? TITLE_LEAD : 0);
const clipFrames = (d: HighlightData, i: number) => leadFrames(d, i) + Math.round(d.clips[i].duration * FPS) + (i === d.clips.length - 1 ? d.holdAfterLast : 0);
export const shortsDuration = (d: HighlightData) => d.clips.reduce((a, _c, i) => a + clipFrames(d, i), 0) + (d.outro ? OUTRO_FRAMES : 0);

// 원본의 rect 영역을 width x height 박스에 cover 로 채운다(넘치는 부분은 잘라냄)
const CoverVideo: React.FC<{ src: string; rect: Rect; width: number; height: number; muted?: boolean; fit?: "cover" | "contain" }> = ({ src, rect, width, height, muted, fit = "cover" }) => {
  const scale = fit === "contain" ? Math.min(width / rect.w, height / rect.h) : Math.max(width / rect.w, height / rect.h);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return (
    <div style={{ width, height, overflow: "hidden", position: "relative", background: fit === "contain" ? "#fff" : "#000" }}>
      <div style={{ position: "absolute", left: width / 2 - cx * scale, top: height / 2 - cy * scale, width: SRC_W * scale, height: SRC_H * scale, clipPath: fit === "contain" ? `inset(${rect.y * scale}px ${(SRC_W - rect.x - rect.w) * scale}px ${(SRC_H - rect.y - rect.h) * scale}px ${rect.x * scale}px)` : undefined }}>
        <OffthreadVideo src={src} muted={muted} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
    </div>
  );
};

// [[단어]] 를 형광 강조로 바꿔 렌더
const Rich: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[\[.*?\]\])/g).filter(Boolean);
  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {parts.map((p, i) =>
        p.startsWith("[[") ? (
          <span key={i} style={{ color: C.gold }}>{p.slice(2, -2)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
};

const STROKE = "0 0 12px rgba(0,0,0,0.9), 3px 3px 0 #000, -3px 3px 0 #000, 3px -3px 0 #000, -3px -3px 0 #000, 0 4px 0 #000, 0 -4px 0 #000, 4px 0 0 #000, -4px 0 0 #000";

const Sticker: React.FC<{ children: React.ReactNode; bg: string; color?: string; size?: number }> = ({ children, bg, color = "#fff", size = 30 }) => (
  <div style={{ display: "inline-block", background: bg, color, fontSize: size, fontWeight: 900, padding: `${size * 0.3}px ${size * 0.7}px`, borderRadius: size * 0.35, boxShadow: "0 8px 20px rgba(0,0,0,0.35)", letterSpacing: -0.5, whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// 에피소드 타이틀(첫 클립 앞) — 키네틱 타이포
const TitleOverlay: React.FC<{ data: HighlightData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 0프레임부터 완성된 카드(썸네일). 살짝 숨쉬는 움직임만 주고, 끝에서 위로 빠지며 퇴장
  const out = interpolate(frame, [TITLE_LEAD - 12, TITLE_LEAD], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag = 1;
  const words = data.title.split(" ");
  // 글자 수에 따라 크기 자동 조절(한 줄 유지): EP 태그·아이콘 자리를 뺀 폭에 맞춤
  const titleChars = data.title.replace(/ /g, "").length + (words.length - 1) * 0.3;
  const titleFont = Math.min(112, Math.floor((1080 - 60 - 150 - (data.icon ? 150 : 0)) / titleChars));
  const wipe = 100;
  const sub = 1;
  const fish = 1 + Math.sin(frame / 5) * 0.04;
  void fps;
  // 훅 문구가 있으면 "초등 수학은 ~" 메시지를 크게, 에피소드 제목은 위 작은 태그로
  if (data.hook) {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out, transform: `translateY(${(1 - out) * -60}px)`, pointerEvents: "none" }}>
        {/* 판서 글씨가 비치지 않게 가로 띠 전체를 어둡게 깔고 그 위에 문구 */}
        <div style={{ width: W, display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 0 60px", background: "rgba(8,14,32,0.93)", borderTop: `6px solid ${C.gold}`, borderBottom: `6px solid ${C.gold}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ transform: "rotate(-3deg)", marginBottom: 34 }}>
          <Sticker bg={C.coral} size={34}>{data.episode ?? "EP.01"} · {data.title}</Sticker>
        </div>
        <HookText text={data.hook} />
        <div style={{ marginTop: 40, background: C.gold, color: C.ink, fontSize: 40, fontWeight: 900, padding: "12px 34px", borderRadius: 999, letterSpacing: -0.5, boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 30px ${C.gold}66` }}>{data.subtitle}</div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out, transform: `translateY(${(1 - out) * -60}px)`, pointerEvents: "none" }}>
      {/* 한 줄 타이틀: EP.01 태그 + 제목 + 붕어빵 아이콘 */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 30px" }}>
        <div style={{ transform: `scale(${tag}) rotate(-6deg)` }}>
          <Sticker bg={C.coral} size={30}>{data.episode ?? "EP.01"}</Sticker>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, overflow: "hidden", padding: "6px 4px" }}>
          {words.map((w, i) => {
            const last = i === words.length - 1;
            return (
              <div key={i} style={{ position: "relative", display: "inline-block", fontSize: titleFont, fontWeight: 900, letterSpacing: -4, lineHeight: 1.05, color: last ? C.gold : "#fff", textShadow: "0 10px 40px rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>
                <span style={{ position: "relative" }}>{w}</span>
                {last && <div style={{ position: "absolute", left: 2, bottom: -4, height: 12, background: C.coral, width: `${wipe}%`, borderRadius: 6, transform: "rotate(-1.5deg)", boxShadow: `0 0 24px ${C.coral}88` }} />}
              </div>
            );
          })}
        </div>
        {data.icon && <Img src={staticFile(data.icon)} style={{ width: 118, height: 71, objectFit: "contain", transform: `scale(${fish}) rotate(${-12 + fish * 4}deg)`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.5))" }} />}
      </div>
      {/* 부제: 잘 보이게 골드 라벨로 강조 */}
      <div style={{ marginTop: 34, transform: `scale(${sub})`, opacity: sub }}>
        <div style={{ background: C.gold, color: C.ink, fontSize: 40, fontWeight: 900, padding: "12px 34px", borderRadius: 999, letterSpacing: -0.5, boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 30px ${C.gold}66` }}>
          {data.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 챕터 제목: 중앙에 제목+설명 짠 → 둘 다 위 타이틀 여백으로 이동해 머무름(설명은 제목보다 덜 줄임)
const ChapterTitle: React.FC<{ index: number; label: string; desc?: string; layout: Layout }> = ({ index, label, desc, layout }) => {
  const frame = useCurrentFrame(); // 챕터 리드 시작 기준 0
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 190 } });
  const descS = spring({ frame: frame - 6, fps, config: { damping: 13, stiffness: 160 } });
  const move = interpolate(frame, [28, CHAPTER_LEAD], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ease = 1 - Math.pow(1 - move, 3);
  const y = interpolate(ease, [0, 1], [H / 2 - 40, layout.headerY]);
  const scale = interpolate(ease, [0, 1], [1, layout.headerScale]) * pop;
  const descScale = interpolate(ease, [0, 1], [1, Math.max(layout.headerScale, 0.68)]) * pop;
  const gap = interpolate(ease, [0, 1], [18, 6]);
  const num = String(index + 1).padStart(2, "0");
  // 긴 제목은 중앙 등장 때 폭(약 920px)에 맞춰 줄이고, 상단에 갈 때는 최소 40px 은 유지
  const labelFont = Math.min(100, Math.floor(880 / Math.max(1, label.length)));
  const scaleAdj = Math.max(scale, Math.min(1, 40 / labelFont) * (scale / layout.headerScale));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, transform: "translateY(-50%)", pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, whiteSpace: "nowrap", transform: `scale(${scaleAdj})`, transformOrigin: "center bottom" }}>
        <span style={{ fontSize: Math.round(labelFont * 0.64), fontWeight: 900, color: C.gold, textShadow: STROKE }}>{num}</span>
        <span style={{ fontSize: labelFont, fontWeight: 900, letterSpacing: -3, color: "#fff", textShadow: STROKE }}>{label}</span>
      </div>
      {desc && (
        <div style={{ fontSize: 40, fontWeight: 700, color: "rgba(255,255,255,0.92)", textShadow: "0 3px 12px rgba(0,0,0,0.85), 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000", opacity: descS, transform: `translateY(${(1 - descS) * 20}px) scale(${descScale})`, transformOrigin: "center top", textAlign: "center", padding: "0 40px", maxWidth: 1000, wordBreak: "keep-all", lineHeight: 1.25 }}>
          {desc}
        </div>
      )}
    </div>
  );
};

// 학생 반응(수업 화면 위에 오버랩): 말풍선은 오른쪽 아래에 크게(최근 4개), 이모지는 왼쪽 아래에서 여러 개 떠오름
const NAME_COLORS = [C.sky, C.mint, C.gold, C.coral, "#C39BFF"];
const ReactionLayer: React.FC<{ chats: ChatEvent[]; height: number }> = ({ chats, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const LIFE = 5; // 말풍선이 머무는 시간(초)
  const MAX = 4; // 동시에 보이는 말풍선 수
  const msgs = chats.filter((c) => c.text);
  const live = msgs.filter((c) => t >= c.t && t < c.t + LIFE).slice(-MAX);
  const emojis = chats.filter((c) => c.emoji && t >= c.t && t < c.t + 2.4);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 36, bottom: 40, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, maxWidth: W - 200 }}>
        {live.map((c) => {
          const i = msgs.indexOf(c);
          const age = t - c.t;
          const s = spring({ frame: Math.round(age * fps), fps, config: { damping: 13, stiffness: 170 } });
          const out = interpolate(age, [LIFE - 0.6, LIFE], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const color = NAME_COLORS[i % NAME_COLORS.length];
          return (
            <div key={i} style={{ transform: `translateX(${(1 - s) * 80}px) scale(${0.9 + s * 0.1})`, opacity: Math.min(s, out), transformOrigin: "right center", background: "rgba(15,27,51,0.92)", border: `3px solid ${color}`, borderRadius: 22, padding: "12px 24px", boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 24px ${color}44`, display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color, whiteSpace: "nowrap" }}>💬 {c.name}</span>
              <span style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, wordBreak: "keep-all", color: "#fff" }}>{c.text}</span>
            </div>
          );
        })}
      </div>
      {emojis.map((c) => {
        const j = chats.indexOf(c);
        const age = t - c.t;
        const x = 60 + ((j * 173) % 520);
        const y = age * 260; // 초당 260px 상승
        const sway = Math.sin(age * 5 + j) * 22;
        const op = interpolate(age, [0, 0.15, 1.8, 2.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const sc = interpolate(age, [0, 0.25], [0.3, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={j} style={{ position: "absolute", left: x, top: height - 60 - y, fontSize: 84, opacity: op, transform: `translateX(${sway}px) scale(${sc})`, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }}>
            {c.emoji}
          </div>
        );
      })}
    </div>
  );
};

// 학생 발화 표시: 캠 아래쪽에 "직접 설명 중" 배지 + 음성 막대(움직이는 이퀄라이저)
const KidBadge: React.FC<{ label: string; age: number; camTop: number }> = ({ label, age, camTop }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.round(age * fps), fps, config: { damping: 12, stiffness: 180 } });
  const bars = [0, 1, 2, 3, 4];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: camTop + CAM_H2 - 92, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `translateY(${(1 - s) * 30}px) scale(${0.85 + s * 0.15})`, opacity: s, display: "flex", alignItems: "center", gap: 16, background: C.sky, color: C.ink, borderRadius: 999, padding: "12px 30px", boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 30px ${C.sky}88` }}>
        <span style={{ fontSize: 36 }}>🙋</span>
        <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, whiteSpace: "nowrap" }}>{label}가 직접 설명 중</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, height: 34 }}>
          {bars.map((b) => (
            <div key={b} style={{ width: 7, borderRadius: 4, background: C.ink, height: 8 + Math.abs(Math.sin(age * (9 + b * 2.3) + b * 1.7)) * 26 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// 선생님 소개 카드(영상이 없는 구간용): 위 = 프로필 사진, 아래 = 이름·역할 + 소개 포인트 3개가 순서대로 등장
const TeacherVisual: React.FC<{ data: HighlightData; layout: Layout; boardH: number; t: number; cardTimes: number[] }> = ({ data, layout, boardH, t, cardTimes }) => {
  const { fps } = useVideoConfig();
  const photo = staticFile(data.outro?.photo ?? data.teacher.photo);
  const T = data.teacher;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: layout.liveH, overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", left: -W * 0.15, top: -layout.liveH * 0.2, width: W * 1.3, height: layout.liveH * 1.4, filter: "blur(44px) brightness(0.4) saturate(1.3)" }}>
          <Img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ position: "absolute", left: (W - CAM_W2) / 2, top: layout.camTop, width: CAM_W2, height: CAM_H2, overflow: "hidden", borderRadius: 6, boxShadow: "0 14px 44px rgba(0,0,0,0.6)" }}>
          <Img src={photo} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%", display: "block" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: layout.liveH, width: W, height: boardH, background: `radial-gradient(ellipse at 50% 20%, #1B3159 0%, ${C.ink} 70%)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 66, fontWeight: 900, letterSpacing: -2 }}>{T.name} <span style={{ fontSize: 40, fontWeight: 700, opacity: 0.75 }}>· 이강준</span></div>
          <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.75 }}>{T.role}</div>
        </div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 270, display: "flex", flexDirection: "column", gap: 26 }}>
          {T.points.map((pt, i) => {
            const at = cardTimes[i] ?? i * 5;
            const sp = spring({ frame: Math.round((t - at) * fps), fps, config: { damping: 13, stiffness: 140 } });
            const accent = [C.sky, C.gold, C.mint][i];
            return (
              <div key={i} style={{ opacity: t >= at ? sp : 0, transform: `translateX(${(1 - sp) * -60}px)`, display: "flex", alignItems: "center", gap: 24, background: "rgba(255,255,255,0.07)", border: `2px solid ${accent}55`, borderRadius: 24, padding: "22px 28px" }}>
                <div style={{ width: 84, height: 84, borderRadius: 22, background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, flexShrink: 0 }}>{pt.icon}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: accent, letterSpacing: -1 }}>{pt.title}</div>
                  <div style={{ fontSize: 27, fontWeight: 700, opacity: 0.85, wordBreak: "keep-all" }}>{pt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Clip: React.FC<{ data: HighlightData; index: number }> = ({ data, index }) => {
  const CLIPS = data.clips;
  const clip = CLIPS[index];
  const CAM = clip.cam ?? data.cam;
  const L = layoutOf(clip.bigBoard);
  const boardH = H - L.liveH;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lead = leadFrames(data, index);
  // 챕터 번호: label 이 있는 클립만 센다
  const chapterNo = CLIPS.slice(0, index + 1).filter((c) => c.label).length;
  const videoLen = Math.round(clip.duration * fps);
  const total = clipFrames(data, index);
  const last = index === CLIPS.length - 1;
  const src = staticFile(clip.file);
  const camSrc = clip.camFile ? staticFile(clip.camFile) : undefined;
  const isCard = clip.visual === "teacherCard";

  const vf = frame - lead; // 영상 기준 프레임
  const playing = vf >= 0 && vf < videoLen;
  const holding = vf >= videoLen;
  const t = Math.max(0, Math.min(vf, videoLen - 1)) / fps;
  const cap = playing ? clip.captions.find((c) => t >= c.start && t < c.end) : undefined;
  const capS = cap ? spring({ frame: Math.round((t - cap.start) * fps), fps, config: { damping: 15, stiffness: 220 } }) : 0;
  const kidSpan = playing ? clip.kid?.find((k) => t >= k.start && t < k.end) : undefined;
  // 학생 발화가 있는 클립은 자막마다 화자 라벨을 붙여 누가 말하는지 구분
  const hasKid = (clip.kid?.length ?? 0) > 0;
  const kidLabel = clip.kidLabel ?? "친구";
  const note = playing ? clip.notes?.find((n) => t >= n.start && t < n.end) : undefined;

  const fadeIn = index === 0 ? 1 : interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = last && !data.outro ? interpolate(frame, [total - 24, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(frame, [total - 8, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrim = interpolate(frame, [lead - 10, lead + 4], [0.62, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.5 + Math.sin(frame / 4) * 0.5;

  // 영상 레이어: 리드/정지 구간에는 고정 프레임, 재생 구간에는 lead 만큼 늦게 시작하는 Sequence
  const layers = (muted: boolean) =>
    isCard ? (
      <>
        <TeacherVisual data={data} layout={L} boardH={boardH} t={muted ? 0 : t} cardTimes={clip.cardTimes ?? []} />
        {!muted && <Audio src={src} />}
      </>
    ) : (
    <>
      {camSrc ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: L.liveH, overflow: "hidden", background: "#000" }}>
          {/* 앰비언트: 캠을 블러·어둡게 해서 라이브 영역 전체를 채움 */}
          <div style={{ position: "absolute", left: -W * 0.15, top: -L.liveH * 0.2, width: W * 1.3, height: L.liveH * 1.4, filter: "blur(44px) brightness(0.4) saturate(1.3)" }}>
            <OffthreadVideo src={camSrc} muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ position: "absolute", left: (W - CAM_W2) / 2, top: L.camTop, width: CAM_W2, height: CAM_H2, overflow: "hidden", borderRadius: 6, boxShadow: "0 14px 44px rgba(0,0,0,0.6)" }}>
            <OffthreadVideo src={camSrc} muted style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <CoverVideo src={src} rect={CAM} width={W} height={L.liveH} muted />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, top: L.liveH }}>
        <CoverVideo src={src} rect={clip.board} width={W} height={boardH} muted={muted} fit={clip.fit} />
      </div>
    </>
    );

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT, color: "#fff", overflow: "hidden" }}>
      {vf < 0 && <Freeze frame={0}>{layers(true)}</Freeze>}
      {playing && <Sequence from={lead} durationInFrames={videoLen}>{layers(false)}</Sequence>}
      {holding && <Freeze frame={videoLen - 1}>{layers(true)}</Freeze>}

      {/* 라이브/판서 구분선 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.liveH - 3, height: 6, background: `linear-gradient(90deg, ${C.sky}, ${C.mint}, ${C.gold}, ${C.coral})`, opacity: 0.9 }} />

      {/* LIVE 표시(캠 왼쪽 위) + 판서 태그 */}
      {!isCard && (
        <div style={{ position: "absolute", left: (W - CAM_W2) / 2 + 18, top: L.camTop + 18, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.55)", borderRadius: 999, padding: "6px 16px", opacity: 0.9 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.coral, boxShadow: `0 0 ${6 + pulse * 14}px ${C.coral}` }} />
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>LIVE</span>
        </div>
      )}
      <div style={{ position: "absolute", right: 30, top: L.liveH + 24, background: "rgba(0,0,0,0.55)", borderRadius: 999, padding: "6px 18px", fontSize: 24, fontWeight: 900, opacity: 0.9 }}>{isCard ? "👨‍🏫 선생님 소개" : "🖥️ 실시간 수업 화면"}</div>

      {/* 학생 반응(채팅 + 이모지): 수업 화면 위에 오버랩 */}
      {playing && clip.chats && clip.chats.length > 0 && (
        <div style={{ position: "absolute", left: 0, top: L.liveH }}>
          <Sequence from={lead} durationInFrames={videoLen} layout="none">
            <ReactionLayer chats={clip.chats} height={boardH} />
          </Sequence>
        </div>
      )}

      {/* 학생 발화 중: 캠 테두리 발광 + 배지 */}
      {kidSpan && !isCard && (
        <>
          <div style={{ position: "absolute", left: (W - CAM_W2) / 2 - 6, top: L.camTop - 6, width: CAM_W2 + 12, height: CAM_H2 + 12, borderRadius: 10, border: `6px solid ${C.sky}`, boxShadow: `0 0 ${24 + pulse * 20}px ${C.sky}`, pointerEvents: "none" }} />
          <KidBadge label={kidLabel} age={t - kidSpan.start} camTop={L.camTop} />
        </>
      )}

      {/* 수업 화면 보충 메모 */}
      {note && (() => {
        const s = spring({ frame: Math.round((t - note.start) * fps), fps, config: { damping: 13, stiffness: 170 } });
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: H - 190, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px) rotate(-1.5deg)`, background: C.gold, color: C.ink, fontSize: 38, fontWeight: 900, padding: "16px 34px", borderRadius: 18, boxShadow: "0 12px 30px rgba(0,0,0,0.35)", textAlign: "center", lineHeight: 1.3, wordBreak: "keep-all", maxWidth: 960 }}>
              <span style={{ whiteSpace: "pre-line" }}>{note.text}</span>
            </div>
          </div>
        );
      })()}

      {/* 자막: 캠 아래 여백 띠에. 학생 자막은 하늘색 박스 + 학생 라벨, 학생 클립의 선생님 자막엔 선생님 라벨 */}
      {cap && (
        <div style={{ position: "absolute", left: 0, right: 0, top: L.bandTop, height: L.liveH - L.bandTop, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, padding: "0 40px" }}>
          {hasKid && (
            <div style={{ opacity: Math.min(1, capS * 1.5), fontSize: 26, fontWeight: 900, padding: "4px 18px", borderRadius: 999, background: cap.who === "kid" ? C.sky : "rgba(255,255,255,0.9)", color: C.ink, letterSpacing: -0.5 }}>
              {cap.who === "kid" ? `🙋 ${kidLabel}` : "👨‍🏫 선생님"}
            </div>
          )}
          <div style={{ fontSize: cap.who === "kid" ? 52 : 54, fontWeight: 900, textAlign: "center", lineHeight: 1.28, letterSpacing: -1, wordBreak: "keep-all", textShadow: STROKE, transform: `translateY(${(1 - capS) * 24}px) scale(${0.96 + capS * 0.04})`, opacity: Math.min(1, capS * 1.5), ...(cap.who === "kid" ? { background: "rgba(15,27,51,0.78)", border: `4px solid ${C.sky}`, borderRadius: 24, padding: "8px 28px", boxShadow: `0 0 24px ${C.sky}55` } : {}) }}>
            <Rich text={cap.text} />
          </div>
        </div>
      )}

      <AbsoluteFill style={{ background: `rgba(6,10,24,${scrim})`, pointerEvents: "none" }} />

      {/* 챕터 제목: 리드 구간에 중앙 등장 → 타이틀 여백으로 이동, 이후 유지 */}
      {index === 0 && frame < TITLE_LEAD && <TitleOverlay data={data} />}
      {clip.label ? (
        frame >= lead - CHAPTER_LEAD && (
          <Sequence from={lead - CHAPTER_LEAD} layout="none">
            <ChapterTitle index={chapterNo - 1} label={clip.label} desc={clip.desc} layout={L} />
          </Sequence>
        )
      ) : (
        // 이어지는 클립: 앞 챕터 제목을 상단에 그대로 유지
        <Sequence from={-CHAPTER_LEAD} layout="none">
          <ChapterTitle index={chapterNo - 1} label={CLIPS.slice(0, index).reverse().find((c) => c.label)?.label ?? ""} desc={CLIPS.slice(0, index).reverse().find((c) => c.label)?.desc} layout={L} />
        </Sequence>
      )}

      <AbsoluteFill style={{ background: "#000", opacity: 1 - Math.min(fadeIn, fadeOut), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// 아웃트로: 선생님 사진 + 세 줄 문구 + 안내 문구(note) 또는 QR 카드(links). 영상 파일 안의 링크는 클릭이 안 되므로 댓글/설명란으로 안내
const OutroScene: React.FC<{ data: HighlightData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = data.outro!;
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [OUTRO_FRAMES - 18, OUTRO_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const photo = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 140 } });
  const glyphs = ["½", "×", "+", "⅓", "=", "÷", "¼", "−"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #16294D 0%, ${C.ink} 70%)`, fontFamily: FONT, color: "#fff", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      {glyphs.map((g, i) => {
        const x = (i * 137) % 100;
        const y = ((i * 71 + frame * 0.15 * (1 + (i % 3) * 0.4)) % 110) - 5;
        return (
          <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, fontSize: 60 + (i % 3) * 30, fontWeight: 900, color: [C.sky, C.mint, C.gold, C.coral][i % 4], opacity: 0.12, transform: `rotate(${((i * 23) % 40) - 20}deg)` }}>
            {g}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150, gap: 0 }}>
        {/* 선생님 사진 */}
        <div style={{ transform: `scale(${photo})`, padding: 8, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.mint})`, boxShadow: `0 0 60px ${C.sky}55` }}>
          <Img src={staticFile(o.photo ?? data.teacher.photo)} style={{ width: 300, height: 300, borderRadius: "50%", display: "block", objectFit: "cover" }} />
        </div>
        {/* 문구 세 줄: 순서대로 등장, 가운데 줄 강조 */}
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {o.lines.map((line, i) => {
            const sp = spring({ frame: frame - 14 - i * 9, fps, config: { damping: 13, stiffness: 150 } });
            const big = i === 1;
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${(1 - sp) * 30}px)`, fontSize: big ? 84 : 44, fontWeight: 900, letterSpacing: big ? -3 : -1, color: big ? C.gold : "rgba(255,255,255,0.92)", textAlign: "center", wordBreak: "keep-all", lineHeight: 1.2, padding: "0 60px" }}>
                {line}
              </div>
            );
          })}
        </div>
        {/* 텍스트 링크 줄 (qr 없는 링크) */}
        {(o.links ?? []).some((l) => !l.qr) && (
          <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 16, width: 940 }}>
            {(o.links ?? []).filter((l) => !l.qr).map((l, i) => {
              const sp = spring({ frame: frame - 40 - i * 7, fps, config: { damping: 13, stiffness: 150 } });
              const accent = [C.gold, C.sky, C.coral][i % 3];
              return (
                <div key={i} style={{ opacity: sp, transform: `translateX(${(1 - sp) * -50}px)`, display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.08)", border: `2px solid ${accent}66`, borderRadius: 20, padding: "16px 26px" }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, background: accent, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, flexShrink: 0 }}>{l.icon ?? "🔗"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, whiteSpace: "nowrap" }}>{l.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.url.replace(/^https?:\/\/(www\.)?/, "")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* 링크 안내 문구 */}
        {o.note && (() => {
          const sp = spring({ frame: frame - 66, fps, config: { damping: 12, stiffness: 150 } });
          return (
            <div style={{ marginTop: 40, opacity: sp, transform: `translateY(${(1 - sp) * 30}px) scale(${0.9 + sp * 0.1})`, background: C.gold, color: C.ink, fontSize: 40, fontWeight: 900, padding: "14px 40px", borderRadius: 999, boxShadow: `0 12px 36px rgba(0,0,0,0.45), 0 0 30px ${C.gold}66` }}>
              {o.note}
            </div>
          );
        })()}
        {o.footer && <div style={{ marginTop: 26, fontSize: 28, fontWeight: 800, opacity: 0.8, letterSpacing: -0.5 }}>{o.footer}</div>}
        {/* QR 카드 (qr 가 있는 링크만) */}
        <div style={{ marginTop: 40, display: "flex", gap: 40 }}>
          {(o.links ?? []).filter((l) => l.qr).map((l, i) => {
            const sp = spring({ frame: frame - 44 - i * 8, fps, config: { damping: 13, stiffness: 150 } });
            const accent = i === 0 ? C.gold : C.sky;
            return (
              <div key={i} style={{ opacity: sp, transform: `translateY(${(1 - sp) * 40}px) scale(${0.9 + sp * 0.1})`, background: "#fff", borderRadius: 28, padding: 22, width: 400, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 6px ${accent}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <Img src={staticFile(l.qr!)} style={{ width: 300, height: 300, display: "block", imageRendering: "pixelated" }} />
                <div style={{ color: C.ink, fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>{l.label}</div>
                {l.url && <div style={{ color: "#5b6478", fontSize: 20, fontWeight: 700, wordBreak: "break-all", textAlign: "center", lineHeight: 1.3 }}>{l.url.replace(/^https?:\/\//, "")}</div>}
              </div>
            );
          })}
        </div>
        {(o.links ?? []).some((l) => l.qr) && <div style={{ marginTop: 40, fontSize: 26, fontWeight: 700, opacity: 0.7 }}>QR 을 찍거나 설명란 링크를 눌러주세요</div>}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - Math.min(fadeIn, fadeOut), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const HighlightShorts: React.FC<{ data: HighlightData }> = ({ data }) => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#000" }}>
      {data.clips.map((_c, i) => {
        const len = clipFrames(data, i);
        const from = cursor;
        cursor += len;
        return (
          <Sequence key={i} from={from} durationInFrames={len}><Clip data={data} index={i} /></Sequence>
        );
      })}
      {data.outro && <Sequence from={cursor} durationInFrames={OUTRO_FRAMES}><OutroScene data={data} /></Sequence>}
    </AbsoluteFill>
  );
};
