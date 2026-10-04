import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { characterSrc } from "./characters";

export const FONT = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

export const COLORS = {
  bg: "#FFF7E6",
  bg2: "#FFE3B3",
  ink: "#3B2A1A",
  orange: "#FF8A3D",
  pink: "#FF5C8A",
  mint: "#2ED3B7",
  blue: "#4C8DFF",
  yellow: "#FFD23F",
  purple: "#9B6BFF",
};

export const PALETTE = [COLORS.orange, COLORS.pink, COLORS.mint, COLORS.blue, COLORS.yellow, COLORS.purple];

// 따뜻한 그라데이션 배경 + 물방울 무늬
export const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.6) % 120;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.bg} 0%, ${COLORS.bg2} 100%)`,
        fontFamily: FONT,
        color: COLORS.ink,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,138,61,0.14) 14px, transparent 15px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${shift}px ${shift}px`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// 원형 테두리 안의 캐릭터 얼굴
export const Avatar: React.FC<{
  id: string;
  size: number;
  ring?: string;
  style?: React.CSSProperties;
}> = ({ id, size, ring = "#fff", style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      border: `${Math.max(4, size * 0.05)}px solid ${ring}`,
      boxShadow: "0 10px 24px rgba(59,42,26,0.18)",
      background: "#fff",
      flexShrink: 0,
      ...style,
    }}
  >
    <Img src={staticFile(characterSrc(id))} style={{ width: "100%", height: "100%", display: "block" }} />
  </div>
);

// 튕기며 등장하는 래퍼
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number; // 시작 y 오프셋(px)
}> = ({ delay = 0, children, style, from = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ transform: `translateY(${(1 - s) * from}px) scale(${0.6 + 0.4 * s})`, opacity, ...style }}>
      {children}
    </div>
  );
};

// 알약 모양 라벨
export const Pill: React.FC<{ color: string; children: React.ReactNode; size?: number }> = ({ color, children, size = 44 }) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: "#fff",
      fontWeight: 800,
      fontSize: size,
      padding: `${size * 0.25}px ${size * 0.8}px`,
      borderRadius: 999,
      boxShadow: "0 8px 0 rgba(59,42,26,0.15)",
      letterSpacing: -1,
    }}
  >
    {children}
  </div>
);

// 큰 제목 텍스트 (외곽선 느낌)
export const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 120,
  color = COLORS.ink,
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 900,
      color,
      letterSpacing: -3,
      lineHeight: 1.1,
      textShadow: "0 6px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(59,42,26,0.15)",
      textAlign: "center",
    }}
  >
    {children}
  </div>
);
