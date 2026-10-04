import React from "react";
import { AbsoluteFill, OffthreadVideo, Img, staticFile } from "remotion";
import { FONT } from "../BreakGameIntro/shared";
import type { HighlightData } from "./clips";
import { HookText } from "./Hook";

// 썸네일 전용 1프레임 카드(1080x1920): 릴스 커버·틱톡 프레임·유튜브 모바일 선택용
// 세로 쇼츠 본편의 첫 프레임과 톤은 같지만 얼굴과 글씨를 더 크게 잡는다
const C = { gold: "#FFD23F", coral: "#FF5C7A", sky: "#5DB7FF", ink: "#0F1B33" };
const STROKE = "0 0 16px rgba(0,0,0,0.9), 4px 4px 0 #000, -4px 4px 0 #000, 4px -4px 0 #000, -4px -4px 0 #000, 0 5px 0 #000, 0 -5px 0 #000, 5px 0 0 #000, -5px 0 0 #000";

// camFrom: 캠 파일에서 썸네일로 쓸 프레임(30fps 기준). 얼굴이 정면인 순간을 고른다
// photo: 캠 영상 대신 쓸 사진(public 경로). 있으면 camFile 은 무시
export const HighlightThumbnail: React.FC<{ data: HighlightData; camFile?: string; photo?: string; icon?: string; episode?: string; camFrom?: number }> = ({ data, camFile, photo, icon, episode = "EP.01", camFrom = 0 }) => {
  const src = staticFile(photo ?? camFile ?? "");
  const Media: React.FC<{ style: React.CSSProperties }> = ({ style }) => (photo ? <Img src={src} style={style} /> : <OffthreadVideo src={src} muted startFrom={camFrom} style={style} />);
  const raw = data.title.split(" ");
  // 최대 두 줄: 어절이 3개 이상이면 마지막 어절만 둘째 줄(강조색)로
  const words = raw.length > 2 ? [raw.slice(0, -1).join(" "), raw[raw.length - 1]] : raw;
  const titleFont = Math.min(196, Math.floor(1000 / Math.max(...words.map((w) => w.length))));
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, color: "#fff", overflow: "hidden" }}>
      {/* 앰비언트 배경 */}
      <div style={{ position: "absolute", left: -200, top: -300, width: 1480, height: 2500, filter: "blur(50px) brightness(0.35) saturate(1.4)" }}>
        <Media style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
      {/* 선생님 캠: 화면 폭 가득, 세로는 잘라서 얼굴 중심 */}
      <div style={{ position: "absolute", left: 0, top: 210, width: 1080, height: 760, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: -74, top: -60, width: 1228, height: 692 }}>
          <Media style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: photo ? "50% 15%" : undefined }} />
        </div>
        {!photo && (
          <div style={{ position: "absolute", left: 30, top: 30, display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.6)", borderRadius: 999, padding: "10px 22px" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.coral, boxShadow: `0 0 16px ${C.coral}` }} />
            <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>LIVE</span>
          </div>
        )}
      </div>
      {/* 훅 문구 모드: "초등 수학은 ~" 메시지를 크게, 에피소드 제목은 작은 태그로 */}
      {data.hook && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, bottom: 0, background: `linear-gradient(180deg, rgba(15,27,51,0) 0%, ${C.ink} 16%, ${C.ink} 100%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <div style={{ background: C.coral, color: "#fff", fontSize: 38, fontWeight: 900, padding: "12px 30px", borderRadius: 16, transform: "rotate(-3deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>{episode} · {data.title}</div>
            <HookText text={data.hook} scale={1.1} />
            <div style={{ marginTop: 16, background: C.gold, color: C.ink, fontSize: 44, fontWeight: 900, padding: "14px 40px", borderRadius: 999, boxShadow: `0 12px 36px rgba(0,0,0,0.45), 0 0 34px ${C.gold}66` }}>{data.subtitle}</div>
            <div style={{ fontSize: 34, fontWeight: 800, opacity: 0.85 }}>대치동캐슬 · {data.teacher.name}</div>
          </div>
        </>
      )}
      {!data.hook && <>
      {/* 아래쪽 어두운 그라데이션 + 타이틀 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, bottom: 0, background: `linear-gradient(180deg, rgba(15,27,51,0) 0%, ${C.ink} 22%, ${C.ink} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ background: C.coral, color: "#fff", fontSize: 40, fontWeight: 900, padding: "12px 30px", borderRadius: 16, transform: "rotate(-4deg)", boxShadow: "0 10px 24px rgba(0,0,0,0.4)" }}>{episode}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.0 }}>
          {words.map((w, i) => {
            const last = i === words.length - 1;
            return (
              <div key={i} style={{ position: "relative", fontSize: titleFont, fontWeight: 900, letterSpacing: -8, color: last ? C.gold : "#fff", textShadow: STROKE, whiteSpace: "nowrap" }}>
                {w}
                {last && icon && <Img src={staticFile(icon)} style={{ position: "absolute", right: -150, top: 30, width: 150, height: 90, transform: "rotate(-12deg)", filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.5))" }} />}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, background: C.gold, color: C.ink, fontSize: 48, fontWeight: 900, padding: "16px 44px", borderRadius: 999, boxShadow: `0 12px 36px rgba(0,0,0,0.45), 0 0 34px ${C.gold}66` }}>{data.subtitle}</div>
        <div style={{ marginTop: 14, fontSize: 36, fontWeight: 800, opacity: 0.85 }}>대치동캐슬 · {data.teacher.name}</div>
      </div>
      </>}
    </AbsoluteFill>
  );
};
