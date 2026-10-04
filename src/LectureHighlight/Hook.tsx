import React from "react";
import { FONT } from "../BreakGameIntro/shared";

// 썸네일 메인 문구: "초등 수학은 / [[직접 설명하는 힘]]을 / 길러야 합니다"
// 첫 줄은 주제(작게), [[ ]] 가 든 줄은 골드 강조(가장 크게 + 코랄 밑줄), 나머지는 흰색
// 줄마다 글자 수로 크기를 자동 조절해 한 줄에 들어가게 한다
const C = { gold: "#FFD23F", coral: "#FF5C7A" };
const STROKE = "0 0 18px rgba(0,0,0,0.9), 5px 5px 0 #000, -5px 5px 0 #000, 5px -5px 0 #000, -5px -5px 0 #000, 0 6px 0 #000, 0 -6px 0 #000, 6px 0 0 #000, -6px 0 0 #000";

export const HookText: React.FC<{ text: string; width?: number; scale?: number }> = ({ text, width = 980, scale = 1 }) => {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, lineHeight: 1.12, gap: 6 * scale }}>
      {lines.map((line, i) => {
        const hot = line.includes("[[");
        const plain = line.replace(/\[\[|\]\]/g, "");
        const len = plain.replace(/ /g, "").length + (plain.split(" ").length - 1) * 0.3;
        const max = (i === 0 ? 92 : hot ? 168 : 124) * scale;
        const size = Math.min(max, Math.floor(width / Math.max(1, len)));
        const parts = line.split(/(\[\[.*?\]\])/g).filter(Boolean);
        return (
          <div key={i} style={{ fontSize: size, fontWeight: 900, letterSpacing: -size * 0.05, color: "#fff", textShadow: STROKE, whiteSpace: "nowrap" }}>
            {parts.map((p, j) =>
              p.startsWith("[[") ? (
                <span key={j} style={{ position: "relative", color: C.gold }}>
                  <span style={{ position: "absolute", left: 0, right: 0, bottom: -size * 0.02, height: size * 0.1, background: C.coral, borderRadius: 8, transform: "rotate(-1.2deg)", boxShadow: `0 0 20px ${C.coral}88` }} />
                  <span style={{ position: "relative" }}>{p.slice(2, -2)}</span>
                </span>
              ) : (
                <span key={j}>{p}</span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
};
