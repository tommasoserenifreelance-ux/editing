import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPTIONS } from "./captions";
import { Overlays } from "./Scenes";
import { C, font, GRADIENT } from "./theme";
import "./theme";

export const ZYMEREX_FPS = 24;
const VIDEO_SECONDS = 58.458;
export const VIDEO_FRAMES = Math.floor(VIDEO_SECONDS * ZYMEREX_FPS); // 1403
const OUTRO_START = 58.3; // speech ends at ~58.28 s
export const ZYMEREX_DURATION = Math.round((OUTRO_START + 3.2) * ZYMEREX_FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Jump-cut style punch-ins, one per sentence. [startSec, scale]
const ZOOMS: [number, number][] = [
  [0, 1.1],
  [3.66, 1.0],
  [12.26, 1.1],
  [18.28, 1.0],
  [25.0, 1.12],
  [28.3, 1.0],
  [35.9, 1.07],
  [46.0, 1.0],
  [55.3, 1.09],
];

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = 0;
  ZOOMS.forEach(([s], i) => {
    if (t >= s) idx = i;
  });
  const [s0, z] = ZOOMS[idx];
  const next = ZOOMS[idx + 1]?.[0] ?? VIDEO_SECONDS;
  // slow drift inside each segment
  const drift = interpolate(t, [s0, next], [0, 0.025], clamp);
  // short ease into each cut so it feels like a snap-zoom
  const snap = spring({ frame: frame - Math.round(s0 * fps), fps, config: { damping: 18, mass: 0.5 } });
  const prevZ = idx > 0 ? ZOOMS[idx - 1][1] : z;
  const scale = interpolate(snap, [0, 1], [prevZ, z]) + drift;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "540px 560px" }}>
      <OffthreadVideo src={staticFile("zymerex/video.mp4")} />
    </AbsoluteFill>
  );
};

// Zymerex-style captions: bold white words on a brand-blue block.
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cap = CAPTIONS.find((c) => t >= c.s && t < c.e);
  if (!cap || t > OUTRO_START) return null;
  const pop = spring({ frame: frame - Math.round(cap.s * fps), fps, config: { damping: 20, mass: 0.45, overshootClamping: true } });
  return (
    <div
      style={{
        position: "absolute",
        top: 1445,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.blue,
          borderRadius: 16,
          padding: "10px 24px 14px",
          fontFamily: font,
          fontWeight: 800,
          fontSize: 66,
          color: "white",
          display: "flex",
          gap: 16,
          alignItems: "center",
          boxShadow: "0 10px 26px rgba(0,30,70,0.35)",
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
          opacity: Math.min(1, pop * 3),
          whiteSpace: "nowrap",
        }}
      >
        {cap.w.map((w, i) => (
          <span
            key={i}
            style={
              w.k
                ? {
                    background: "white",
                    color: C.blue,
                    borderRadius: 10,
                    padding: "0 12px 4px",
                    margin: "0 -6px",
                  }
                : undefined
            }
          >
            {w.t}
          </span>
        ))}
      </div>
    </div>
  );
};

// Zymerex "Z" pictogram, bottom centre, for the whole talk.
const Pictogram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enter = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const out = interpolate(t, [OUTRO_START, OUTRO_START + 0.25], [1, 0], clamp);
  const breathe = 1 + Math.sin(t * 2) * 0.02;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1745,
        display: "flex",
        justifyContent: "center",
        opacity: enter * out * 0.95,
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${breathe})`,
      }}
    >
      <Img
        src={staticFile("zymerex/pittogramma.png")}
        style={{ height: 110, filter: "drop-shadow(0 4px 10px rgba(0,40,90,0.55))" }}
      />
    </div>
  );
};

// End card: a brand-blue circle grows out of the pictogram, then the full logo.
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const grow = interpolate(t, [0, 0.55], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const logo = spring({ frame: frame - 10, fps, config: { damping: 13, mass: 0.8 } });
  const wipe = interpolate(t, [0.4, 1.0], [0, 100], clamp);
  const prod = spring({ frame: frame - 22, fps, config: { damping: 14 } });
  const line = interpolate(t, [0.9, 1.4], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1800,
          width: 4400 * grow,
          height: 4400 * grow,
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          background: `radial-gradient(circle at 50% 40%, ${C.blueLight} 0%, ${C.blue} 35%, ${C.blueDeep} 70%)`,
        }}
      />
      {/* subtle brand "Z" stroke */}
      <AbsoluteFill style={{ opacity: 0.08 * grow, alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("zymerex/pittogramma.png")} style={{ width: 1300 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        <div
          style={{
            transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])}) translateY(${interpolate(logo, [0, 1], [40, 0])}px)`,
            clipPath: `inset(0 ${100 - wipe}% 0 0)`,
            marginTop: -160,
          }}
        >
          <Img src={staticFile("zymerex/logo.png")} style={{ width: 820 }} />
        </div>
        <div style={{ width: 520 * line, height: 6, borderRadius: 6, background: GRADIENT }} />
        <Img
          src={staticFile("zymerex/ib-support.png")}
          style={{
            width: 460,
            opacity: Math.min(1, prod * 2),
            transform: `translateY(${interpolate(prod, [0, 1], [120, 0])}px)`,
            filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Zymerex: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.blueDeep }}>
      <Sequence durationInFrames={VIDEO_FRAMES}>
        <VideoLayer />
      </Sequence>
      <AbsoluteFill>
        <Overlays />
      </AbsoluteFill>
      <Captions />
      <Pictogram />
      <Sequence from={Math.round(OUTRO_START * fps)}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
