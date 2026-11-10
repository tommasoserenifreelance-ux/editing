import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, outline, sans } from "../Ramatex/theme";

export const LINE_FPS = 30;
export const LINE_DURATION = 573; // 19.1 s, length of the source clip

// Sections snap to the shot changes nearest to the client's timings.
const STEPS = [
  { name: "LAB CARD", from: 0 },
  { name: "CROSSLAPPER", from: 50 }, // cut at 1.67 s
  { name: "NEEDLE LOOM", from: 219 }, // cut at 7.3 s
  { name: "CALENDER", from: 418 }, // cut at 13.93 s
];

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      <div
        style={{
          background: colors.blue,
          borderRadius: 22,
          padding: "20px 32px",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          opacity: Math.min(1, enter * 2),
          transform: `translateY(${interpolate(enter, [0, 1], [-50, 0])}px)`,
        }}
      >
        <Img src={staticFile("ramatex/logo-white.png")} style={{ width: 340, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};

const StepLabel: React.FC<{ index: number; duration: number }> = ({ index, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  const tag = spring({ frame: frame - 4, fps, config: { damping: 12, mass: 0.6 } });
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const last = index === STEPS.length - 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1180 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: last ? Math.min(1, enter * 2) : Math.min(1, enter * 2) * exit,
          fontFamily: sans,
          fontWeight: 900,
        }}
      >
        <div
          style={{
            background: colors.sky,
            color: colors.ink,
            fontSize: 34,
            padding: "6px 20px",
            borderRadius: 12,
            transform: `rotate(-4deg) scale(${interpolate(tag, [0, 1], [0.4, 1])})`,
            marginBottom: -8,
            zIndex: 1,
          }}
        >
          STEP {String(index + 1).padStart(2, "0")}
        </div>
        <div
          style={{
            background: colors.blue,
            color: colors.white,
            fontSize: 92,
            padding: "10px 42px 16px",
            borderRadius: 24,
            border: `7px solid ${colors.white}`,
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            transform: `translateY(${interpolate(enter, [0, 1], [90, 0])}px) scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
          }}
        >
          {STEPS[index].name}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Four dots under the label: the line's progress from card to calender.
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const current = STEPS.filter((s) => frame >= s.from).length - 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1450 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.name}>
            {i > 0 ? (
              <div
                style={{
                  width: 70,
                  height: 6,
                  borderRadius: 3,
                  background: i <= current ? colors.white : "rgba(255,255,255,0.4)",
                }}
              />
            ) : null}
            <div
              style={{
                width: i === current ? 34 : 24,
                height: i === current ? 34 : 24,
                borderRadius: "50%",
                background: i <= current ? colors.blue : "rgba(10,20,48,0.5)",
                border: `5px solid ${colors.white}`,
              }}
            />
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 30,
          color: colors.white,
          letterSpacing: 2,
          ...outline,
          WebkitTextStroke: "6px #0A1430",
        }}
      >
        NON-WOVEN PRODUCTION LINE
      </div>
    </AbsoluteFill>
  );
};

export const RamatexLine: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <OffthreadVideo src={staticFile("ramatex/line.mp4")} />
      {/* Soft shade top and bottom so the white labels read over bright machinery. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,20,48,0.5) 0%, rgba(10,20,48,0) 22%, rgba(10,20,48,0) 52%, rgba(10,20,48,0.55) 100%)",
        }}
      />
      <Logo />
      {STEPS.map((s, i) => {
        const end = STEPS[i + 1]?.from ?? LINE_DURATION;
        return (
          <React.Fragment key={s.name}>
            <Sequence from={s.from} durationInFrames={end - s.from} layout="none">
              <StepLabel index={i} duration={end - s.from} />
            </Sequence>
            <Sequence from={s.from} durationInFrames={20} layout="none">
              <Audio src={staticFile("ramatex/sfx/whoosh.wav")} volume={0.4} />
            </Sequence>
          </React.Fragment>
        );
      })}
      <Progress />
    </AbsoluteFill>
  );
};
