import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, Pill, Pop } from "../BreakGameIntro/shared";
import { Backdrop } from "../LectureHighlight";
import { TEACHER } from "../LectureHighlight/clips";
import { HOOK, HOOK_FRAMES, MINI_OUTRO_FRAMES, QNAS, Q_ENTER, Q_FRAMES_PER_CHAR, answerFrames, questionFrames } from "./qna";
import type { Character, Cut, QnA } from "./qna";

const C = { navy: "#0F1B33", gold: "#C9A24A", sky: "#5DB7FF", coral: "#FF7B7B", mint: "#3DDC97", ivory: "#FFF9EE" };
const SFX = { pop: "sfx/pop.wav", tick: "sfx/tick.wav", whoosh: "sfx/whoosh.wav", ding: "sfx/ding.wav" };
const TICK_EVERY = 3; // 글자 몇 개마다 타이핑 소리를 낼지

// pick: 이 편에 담을 질문 번호들(QNAS 인덱스). 생략하면 전체 묶음이고, 그때만 훅 화면이 붙는다.
const picked = (pick?: number[]) => (pick ? pick.map((i) => QNAS[i]) : QNAS);
export const parentQnADuration = (pick?: number[]) =>
  (pick ? 0 : HOOK_FRAMES) + picked(pick).reduce((a, q) => a + questionFrames(q) + answerFrames(q), 0) + MINI_OUTRO_FRAMES;

// 진행 점
const Dots: React.FC<{ index: number; count: number }> = ({ index, count }) =>
  count < 2 ? null : (
  <div style={{ display: "flex", gap: 10 }}>
    {Array.from({ length: count }).map((_q, i) => (
      <div key={i} style={{ width: i === index ? 44 : 14, height: 14, borderRadius: 7, background: i === index ? C.gold : "rgba(255,255,255,0.3)" }} />
    ))}
  </div>
);

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame / 5) * 4;
  return (
    <Backdrop deco>
      <Audio src={staticFile(SFX.whoosh)} />
      <Sequence from={10}><Audio src={staticFile(SFX.pop)} /></Sequence>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30, padding: "0 70px", textAlign: "center" }}>
        <Pop><Pill color={C.gold} size={34}>{HOOK.top}</Pill></Pop>
        <Pop delay={8} from={70}>
          <div style={{ fontSize: 112, fontWeight: 900, letterSpacing: -4, lineHeight: 1.2, whiteSpace: "pre-line", wordBreak: "keep-all" }}>{HOOK.main.replace("{n}", String(QNAS.length))}</div>
        </Pop>
        <Pop delay={20}>
          <div style={{ display: "flex", gap: 24, transform: `rotate(${wobble}deg)` }}>
            {QNAS.map((_q, i) => (
              <div key={i} style={{ width: 110, height: 110, borderRadius: 28, background: [C.coral, C.sky, C.mint, C.gold][i % 4], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70, fontWeight: 900, boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>Q</div>
            ))}
          </div>
        </Pop>
        <Pop delay={30}><div style={{ fontSize: 44, fontWeight: 800, opacity: 0.85 }}>{HOOK.sub}</div></Pop>
      </AbsoluteFill>
    </Backdrop>
  );
};

// 캐릭터 이미지가 아직 없을 때 쓰는 자리표시 캐릭터
const PlaceholderParent: React.FC<{ mouthOpen: number; blink: boolean; tint: string }> = ({ mouthOpen, blink, tint }) => (
  <svg viewBox="0 0 400 480" width="100%" height="100%">
    <path d="M40 480 C40 360 120 320 200 320 C280 320 360 360 360 480 Z" fill={C.navy} stroke="#fff" strokeWidth="6" />
    <path d="M165 322 L200 380 L235 322 Z" fill={C.ivory} />
    <rect x="178" y="270" width="44" height="60" rx="16" fill="#F3CFB3" />
    <path d="M92 190 C80 60 320 60 308 190 C312 250 300 290 290 300 L110 300 C100 290 88 250 92 190 Z" fill={tint} />
    <ellipse cx="200" cy="200" rx="92" ry="104" fill="#F8DCC4" />
    <path d="M108 190 C120 110 220 96 292 150 C296 120 250 84 200 86 C140 86 104 130 108 190 Z" fill={tint} />
    {blink ? (
      <>
        <path d="M150 196 h30" stroke="#3B2A1A" strokeWidth="6" strokeLinecap="round" />
        <path d="M220 196 h30" stroke="#3B2A1A" strokeWidth="6" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="165" cy="196" r="9" fill="#3B2A1A" />
        <circle cx="235" cy="196" r="9" fill="#3B2A1A" />
      </>
    )}
    <path d="M146 170 q18 -12 36 -2" stroke="#3B2A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M218 168 q18 -10 36 2" stroke="#3B2A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="200" cy="252" rx={16 - mouthOpen * 4} ry={3 + mouthOpen * 11} fill="#B5474B" />
    <circle cx="140" cy="232" r="14" fill={C.coral} opacity="0.35" />
    <circle cx="260" cy="232" r="14" fill={C.coral} opacity="0.35" />
  </svg>
);

const Parent: React.FC<{ character: Character; talking: boolean; done: boolean; index: number }> = ({ character, talking, done, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  // 움직임은 절제: 느린 숨쉬기 정도의 둥실거림만, 입 컷 전환은 1초에 3번 정도
  const bob = Math.sin(frame / 18) * 5;
  const tilt = Math.sin(frame / 30) * 0.5;
  const mouthOpen = Math.floor(frame / 10) % 2 === 0;
  const motion = `translateY(${(1 - enter) * 600 + bob}px) rotate(${tilt}deg)`;

  if (!character) {
    const size = 760;
    return (
      <div style={{ position: "absolute", left: (1080 - size) / 2, bottom: 140, width: size, height: size * 1.2, transformOrigin: "50% 100%", transform: motion, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))" }}>
        <PlaceholderParent mouthOpen={talking ? (mouthOpen ? 1 : 0.3) : 0} blink={frame % 75 < 4} tint={["#4A3426", "#2B2B33", "#6B4A35"][index % 3]} />
      </div>
    );
  }

  // 컷은 560x600 캔버스에 머리 위치를 맞춰 잘라 둔 것. 몸통 아래가 잘려 있어서 잘린 선이 화면 밖으로 나가게 배치한다.
  const current: Cut = talking ? (mouthOpen ? "talkB" : "talkA") : done ? character.after : "think";
  const cuts: Cut[] = ["think", "talkA", "talkB", character.after];
  const width = 1150;
  const height = (width * 600) / 560;
  const figureBottom = (height * 524) / 600;
  return (
    <div style={{ position: "absolute", left: (1080 - width) / 2, top: 1920 + 50 - figureBottom, width, height, transformOrigin: "50% 90%", transform: motion, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.45))" }}>
      {/* 컷을 모두 겹쳐 두고 투명도로만 바꿔서 전환할 때 깜빡이지 않게 한다 */}
      {cuts.map((c, i) => (
        <Img key={i} src={staticFile(`${character.dir}/${c}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: c === current && cuts.indexOf(c) === i ? 1 : 0 }} />
      ))}
    </div>
  );
};

const Question: React.FC<{ q: QnA; index: number; count: number }> = ({ q, index, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = questionFrames(q);
  const chars = q.question.replace(/\n/g, "").length;
  const typed = Math.max(0, Math.min(chars, Math.floor((frame - Q_ENTER) / Q_FRAMES_PER_CHAR)));
  const talking = frame >= Q_ENTER && typed < chars;
  const bubbleS = spring({ frame: frame - 8, fps, config: { damping: 11, stiffness: 150 } });
  const out = interpolate(frame, [total - 8, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 줄바꿈을 유지한 채 typed 글자까지만 보여준다 (나머지는 투명으로 자리만 차지해 말풍선 크기가 흔들리지 않게)
  let seen = 0;
  const lines = q.question.split("\n").map((line, li) => {
    const shown = Math.max(0, Math.min(line.length, typed - seen));
    seen += line.length;
    return (
      <div key={li}>
        <span>{line.slice(0, shown)}</span>
        <span style={{ opacity: 0 }}>{line.slice(shown)}</span>
      </div>
    );
  });

  return (
    <Backdrop deco>
      <Audio src={staticFile(SFX.pop)} />
      {Array.from({ length: Math.ceil(chars / TICK_EVERY) }).map((_x, i) => (
        <Sequence key={i} from={Q_ENTER + Math.round(i * TICK_EVERY * Q_FRAMES_PER_CHAR)} durationInFrames={6}>
          <Audio src={staticFile(SFX.tick)} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ opacity: out }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Pop><Pill color={C.gold} size={28}>학부모 실제 고민</Pill></Pop>
          <Dots index={index} count={count} />
        </div>

        {/* 말풍선 */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 330, transformOrigin: "50% 100%", transform: `scale(${bubbleS})` }}>
          <div style={{ position: "relative", background: C.ivory, color: C.navy, borderRadius: 48, padding: "56px 54px 60px", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
            <div style={{ position: "absolute", left: 40, top: -36, background: C.coral, color: "#fff", fontWeight: 900, fontSize: 46, padding: "8px 30px", borderRadius: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>{count < 2 ? "Q" : `Q${index + 1}`}</div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.45, letterSpacing: -2, wordBreak: "keep-all" }}>{lines}</div>
            <div style={{ position: "absolute", left: "50%", bottom: -44, marginLeft: -36, width: 0, height: 0, borderLeft: "36px solid transparent", borderRight: "36px solid transparent", borderTop: `48px solid ${C.ivory}` }} />
          </div>
        </div>

        <Parent character={q.character} talking={talking} done={typed >= chars} index={index} />
      </AbsoluteFill>
    </Backdrop>
  );
};

const Answer: React.FC<{ q: QnA; index: number; count: number }> = ({ q, index, count }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = answerFrames(q);
  const chipS = spring({ frame, fps, config: { damping: 14 } });
  const fade = interpolate(frame, [0, 6, total - 8, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = frame / fps;
  const cap = q.answer.captions.find((c) => t >= c.start && t < c.end);

  const chip = (
    <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, transform: `translateY(${(1 - chipS) * -40}px)`, opacity: chipS }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ background: C.coral, color: "#fff", fontWeight: 900, fontSize: 40, padding: "10px 24px", borderRadius: 14 }}>{count < 2 ? "Q" : `Q${index + 1}`}</div>
        <div style={{ background: "rgba(15,27,51,0.85)", color: "#fff", fontWeight: 800, fontSize: 46, padding: "10px 30px", borderRadius: 14 }}>{q.topic}</div>
      </div>
      <Dots index={index} count={count} />
    </div>
  );

  if (!q.answer.file) {
    // 촬영 전 자리표시: 대본을 그대로 보여준다
    return (
      <Backdrop>
        <Audio src={staticFile(SFX.ding)} />
        {chip}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px", gap: 36, opacity: fade }}>
          <Pill color={C.mint} size={32}>🎬 선생님 답변 영상 자리 · {q.answer.duration}초</Pill>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.6, wordBreak: "keep-all", textAlign: "center", opacity: 0.9 }}>{q.answer.script}</div>
        </AbsoluteFill>
      </Backdrop>
    );
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile(SFX.ding)} volume={0.6} />
      <OffthreadVideo src={staticFile(q.answer.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.75) 100%)" }} />
      {chip}
      {cap && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 420, display: "flex", justifyContent: "center", padding: "0 70px" }}>
          <div style={{ color: "#fff", fontSize: 58, fontWeight: 900, textAlign: "center", lineHeight: 1.4, textShadow: "0 3px 12px rgba(0,0,0,0.9)", wordBreak: "keep-all" }}>{cap.text}</div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fade, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const MiniOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  return (
    <Backdrop deco>
      <Audio src={staticFile(SFX.whoosh)} volume={0.6} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28, transform: `scale(${0.8 + 0.2 * s})`, opacity: s }}>
        <div style={{ padding: 8, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sky}, ${C.mint})`, boxShadow: `0 0 50px ${C.sky}66` }}>
          <Img src={staticFile(TEACHER.photo)} style={{ width: 280, height: 280, borderRadius: "50%", display: "block", objectFit: "cover" }} />
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, opacity: 0.8 }}>{TEACHER.name} · {TEACHER.role}</div>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: -3 }}>대치동캐슬</div>
        <Pill color={C.gold} size={34}>더 많은 상담 Q&A 보러가기</Pill>
      </AbsoluteFill>
    </Backdrop>
  );
};

export const ParentQnA: React.FC<{ pick?: number[] }> = ({ pick }) => {
  const list = picked(pick);
  const hook = pick ? 0 : HOOK_FRAMES;
  let cursor = hook;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#000" }}>
      {hook > 0 && <Sequence durationInFrames={hook}><Hook /></Sequence>}
      {list.map((q, i) => {
        const qFrom = cursor;
        const aFrom = qFrom + questionFrames(q);
        cursor = aFrom + answerFrames(q);
        return (
          <React.Fragment key={i}>
            <Sequence from={qFrom} durationInFrames={questionFrames(q)}><Question q={q} index={i} count={list.length} /></Sequence>
            <Sequence from={aFrom} durationInFrames={answerFrames(q)}><Answer q={q} index={i} count={list.length} /></Sequence>
          </React.Fragment>
        );
      })}
      <Sequence from={cursor} durationInFrames={MINI_OUTRO_FRAMES}><MiniOutro /></Sequence>
    </AbsoluteFill>
  );
};
