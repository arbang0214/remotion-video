import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Background } from "./shared";
import { SceneTitle, SceneRandom, SceneQuiz, SceneOutro } from "./scenes";

// 10초 = 300프레임 @30fps
export const INTRO_DURATION = 300;
const CUTS = [0, 75, 165, 255]; // 장면 시작 프레임
const FADE = 8;

// 장면 전환 시 짧은 페이드
const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FADE, duration - FADE, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const BreakGameIntro: React.FC = () => {
  const scenes = [SceneTitle, SceneRandom, SceneQuiz, SceneOutro];
  return (
    <Background>
      {scenes.map((Scene, i) => {
        const from = CUTS[i];
        const to = CUTS[i + 1] ?? INTRO_DURATION;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Fade duration={to - from}>
              <Scene />
            </Fade>
          </Sequence>
        );
      })}
    </Background>
  );
};
