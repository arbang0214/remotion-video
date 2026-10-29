import React from "react";
import { AbsoluteFill, OffthreadVideo, Img, staticFile } from "remotion";
import { FONT } from "../BreakGameIntro/shared";
import type { HighlightData } from "./clips";
import { HookText } from "./Hook";

// 개념 설명(필기 강조) 썸네일 1080x1920: 위 = 훅 문구, 가운데 = 선생님 실제 필기 한 장(종이 카드), 카드 모서리에 선생님 얼굴
// "개념을 잘 정리해 주는 선생님" 이 첫눈에 보이도록 판서 결과물을 주인공으로 둔다
const C = { gold: "#FFD23F", coral: "#FF5C7A", sky: "#5DB7FF", ink: "#0F1B33" };

// note: 완성된 필기 이미지(public 경로), noteAspect: 가로/세로 비, hook: data.hook 대신 쓸 문구(시안 비교용)
// faceAt: 캠(852x480)에서 얼굴 중심 좌표, faceBox: 원 안에 담을 캠 영역 크기(머리~어깨)
// facePhoto: 캠 프레임 대신 쓸 얼굴 사진(정사각, 얼굴캠 원본에서 표정 좋은 순간을 잘라 둠)
// noFace: 얼굴 원 없이 필기 카드만
// labelRight: 필기 제목이 왼쪽 위에 있으면 라벨을 오른쪽으로. cardLeft: 좁고 긴 필기는 왼쪽에 두고 얼굴을 카드 옆에(faceInset 을 얼굴 크기만큼). cardW·cardTop: 필기 카드 폭·위치(세로로 긴 필기는 줄임), faceInset: 얼굴 원이 카드 아래쪽에 걸치는 깊이, belowGap: 카드 아래~부제 간격
export const NoteThumbnail: React.FC<{ data: HighlightData; note: string; noteAspect: number; camFile: string; camFrom?: number; faceAt?: [number, number]; faceBox?: number; hook?: string; tag?: string; noteLabel?: string; cardW?: number; cardTop?: number; faceInset?: number; belowGap?: number; labelRight?: boolean; cardLeft?: number; facePhoto?: string; faceSize?: number; noFace?: boolean }> = ({ data, noFace = false, note, noteAspect, camFile, camFrom = 0, faceAt = [426, 240], faceBox = 320, hook, tag, noteLabel = "실제 수업 필기", cardW = 980, cardTop = 820, faceInset = 60, belowGap = 240, labelRight = false, cardLeft, facePhoto, faceSize = 260 }) => {
  const cardH = Math.round(cardW / noteAspect);
  const face = faceSize;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #1B3159 0%, ${C.ink} 68%)`, fontFamily: FONT, color: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* 위: 태그 + 훅 문구 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ background: C.coral, color: "#fff", fontSize: 40, fontWeight: 900, padding: "12px 32px", borderRadius: 16, transform: "rotate(-3deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>{tag ?? `${data.episode} · ${data.title}`}</div>
        <HookText text={hook ?? data.hook ?? data.title} scale={1.05} />
      </div>

      {/* 가운데: 필기 카드 */}
      <div style={{ position: "absolute", left: cardLeft ?? (1080 - cardW) / 2, top: cardTop, width: cardW, height: cardH, transform: "rotate(-1.8deg)" }}>
        <div style={{ position: "absolute", inset: -14, background: "#fff", borderRadius: 18, boxShadow: "0 40px 90px rgba(0,0,0,0.65)" }} />
        <Img src={staticFile(note)} style={{ position: "absolute", inset: 0, width: cardW, height: cardH, borderRadius: 8, display: "block" }} />
        {/* 카드 위 라벨 */}
        <div style={{ position: "absolute", ...(labelRight ? { right: 30 } : { left: 30 }), top: -46, background: C.gold, color: C.ink, fontSize: 36, fontWeight: 900, padding: "10px 26px", borderRadius: 14, transform: "rotate(-2deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>✍️ {noteLabel}</div>
      </div>

      {/* 카드 오른쪽 아래 모서리(필기를 가리지 않게 카드 밖으로 걸침): 선생님 얼굴 */}
      {!noFace && (
      <div style={{ position: "absolute", left: 1080 - face - (face > 260 ? 22 : 40), top: cardTop + cardH - faceInset, width: face, height: face, borderRadius: "50%", overflow: "hidden", border: `8px solid ${C.gold}`, boxShadow: "0 18px 40px rgba(0,0,0,0.6)", background: "#000" }}>
        {facePhoto ? (
          <Img src={staticFile(facePhoto)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
        <div style={{ position: "absolute", width: (852 * face) / faceBox, height: (480 * face) / faceBox, left: face / 2 - (faceAt[0] * face) / faceBox, top: face / 2 - (faceAt[1] * face) / faceBox }}>
          <OffthreadVideo src={staticFile(camFile)} muted startFrom={camFrom} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        )}
      </div>
      )}

      {/* 아래: 부제 + 브랜드 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: cardTop + cardH + belowGap, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ background: C.gold, color: C.ink, fontSize: 44, fontWeight: 900, padding: "14px 40px", borderRadius: 999, boxShadow: `0 12px 36px rgba(0,0,0,0.45), 0 0 34px ${C.gold}66` }}>{data.subtitle}</div>
        <div style={{ fontSize: 34, fontWeight: 800, opacity: 0.85 }}>대치동캐슬 · {data.teacher.name}</div>
      </div>
    </AbsoluteFill>
  );
};
