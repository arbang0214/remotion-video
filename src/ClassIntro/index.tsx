import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { FONT } from "../BreakGameIntro/shared";
import { SceneRegions, SceneZoom, SceneTimelapse, SceneOutro } from "./scenes";
import { SceneRegionsV, SceneZoomV, SceneOutroV } from "./scenes-vertical";

import { CLASS_INTRO_DURATION } from "./config";
export { CLASS_INTRO_DURATION } from "./config";

const CUTS = [0, 100, 220, 560]; // 장면 시작 프레임: 지역 → 줌 강의실 → 타임랩스 → 마무리
const FADE = 10;

const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE, duration - FADE, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const Timeline: React.FC<{ scenes: React.FC[] }> = ({ scenes }) => {
  return (
    <AbsoluteFill style={{ background: "#0F1B33", fontFamily: FONT, color: "#fff" }}>
      {scenes.map((Scene, i) => {
        const from = CUTS[i];
        const to = CUTS[i + 1] ?? CLASS_INTRO_DURATION;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Fade duration={to - from}>
              <Scene />
            </Fade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// 가로 16:9 (유튜브)
export const ClassIntro: React.FC = () => <Timeline scenes={[SceneRegions, SceneZoom, SceneTimelapse, SceneOutro]} />;

// 세로 9:16 (유튜브 쇼츠) — 타임랩스 장면은 방향을 자동 감지
export const ClassIntroShorts: React.FC = () => <Timeline scenes={[SceneRegionsV, SceneZoomV, SceneTimelapse, SceneOutroV]} />;
