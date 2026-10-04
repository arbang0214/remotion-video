import "./index.css";
import { Composition } from "remotion";
import { BreakGameIntro, INTRO_DURATION } from "./BreakGameIntro";
import { ClassIntro, ClassIntroShorts, CLASS_INTRO_DURATION } from "./ClassIntro";
import { LectureHighlight, highlightDuration } from "./LectureHighlight";
import { DATA_0913 } from "./LectureHighlight/clips-0913";
import { DATA_0913B } from "./LectureHighlight/clips-0913b";
import { DATA_0913C } from "./LectureHighlight/clips-0913c";
import { DATA_0913D } from "./LectureHighlight/clips-0913d";
import { DATA_0913E } from "./LectureHighlight/clips-0913e";
import { DATA_0919A } from "./LectureHighlight/clips-0919a";
import { HighlightShorts, shortsDuration } from "./LectureHighlight/Shorts";
import { HighlightThumbnail } from "./LectureHighlight/Thumbnail";
import { ParentQnA, parentQnADuration } from "./ParentQnA";
import { EPISODES } from "./ParentQnA/qna";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ParentQnAShorts"
        component={ParentQnA}
        durationInFrames={parentQnADuration()}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      {EPISODES.map((e) => (
        <Composition
          key={e.id}
          id={`ParentQnAShorts-${e.id}`}
          component={ParentQnA}
          durationInFrames={parentQnADuration(e.pick)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ pick: e.pick }}
        />
      ))}
      <Composition
        id="LectureHighlight"
        component={LectureHighlight}
        durationInFrames={highlightDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LectureHighlightShorts"
        component={LectureHighlight}
        durationInFrames={highlightDuration()}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="LectureHighlight0913Shorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0913)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913 }}
      />
      <Composition
        id="LectureHighlight0913bShorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0913B)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913B }}
      />
      <Composition
        id="LectureHighlight0913cShorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0913C)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913C }}
      />
      <Composition
        id="LectureHighlight0913dShorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0913D)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913D }}
      />
      <Composition
        id="Thumbnail0913d"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913D, camFile: "clips/0913d/cam_k3.mp4", episode: "EP.04", camFrom: 30 }}
      />
      <Composition
        id="LectureHighlight0913eShorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0913E)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913E }}
      />
      <Composition
        id="LectureHighlight0919aShorts"
        component={HighlightShorts}
        durationInFrames={shortsDuration(DATA_0919A)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0919A }}
      />
      <Composition
        id="Thumbnail0919a"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0919A, camFile: "clips/0919a/cam_a3.mp4", episode: "직접 설명", camFrom: 600 }}
      />
      <Composition
        id="Thumbnail0913e"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913E, camFile: "clips/0913e/cam_m2.mp4", episode: "EP.05", camFrom: 420 }}
      />
      <Composition
        id="Thumbnail0913c"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913C, photo: "clips/0913/profile.jpg", episode: "EP.03" }}
      />
      <Composition
        id="Thumbnail0913b"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913B, camFile: "clips/0913b/cam_b.mp4", episode: "EP.02", camFrom: 510 }}
      />
      <Composition
        id="Thumbnail0913"
        component={HighlightThumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: DATA_0913, camFile: "clips/0913/cam_c3.mp4", icon: "clips/0913/bungeoppang.svg", episode: "EP.01" }}
      />
      <Composition
        id="ClassIntro"
        component={ClassIntro}
        durationInFrames={CLASS_INTRO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClassIntroShorts"
        component={ClassIntroShorts}
        durationInFrames={CLASS_INTRO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BreakGameIntro"
        component={BreakGameIntro}
        durationInFrames={INTRO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2",
          logoColor2: "#86A8E7",
        }}
      />
    </>
  );
};
