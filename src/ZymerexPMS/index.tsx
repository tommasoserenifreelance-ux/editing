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
import { C, font } from "../Zymerex/theme";
import { CAPTIONS } from "./captions";
import { Overlays } from "./Scenes";
import { Sfx } from "./Sfx";
import { INTRO, SEGMENT_OUT_STARTS, SEGMENTS, srcToOut, TRANSITION_SEGMENTS, useSrcSec } from "./timeline";

export const PMS_FPS = 25;
const VIDEO = "zymerex-pms/video.mp4";
const OUTRO_START = 41.95; // source seconds; speech ends at ~41.92 s
const OUTRO_OUT = srcToOut(OUTRO_START);
export const PMS_DURATION = Math.round((OUTRO_OUT + 3.0) * PMS_FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Framing changes at every cut and at these extra sentence starts (source s),
// alternating wide / tight.
const FRAMING = [1.0, 1.15, 1.05, 1.2];
const EXTRA_SWITCHES = [21.95, 25.28, 32.36, 39.52];
const TR = 4; // frames each side of a zoom-blur cut
const segOutFrame = (i: number, fps: number) => Math.round(SEGMENT_OUT_STARTS[i] * fps);

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = useSrcSec();
  let idx = 0;
  SEGMENTS.forEach((_, i) => {
    if (frame >= segOutFrame(i, fps)) idx = i;
  });
  const extra = EXTRA_SWITCHES.filter((s) => src >= s).length;
  const lastSwitch = Math.max(SEGMENTS[idx][0], ...EXTRA_SWITCHES.filter((s) => src >= s));
  const z = FRAMING[(idx + extra) % FRAMING.length] + (src - lastSwitch) * 0.006;

  let boost = 0;
  for (const i of [0, ...TRANSITION_SEGMENTS]) {
    const d = frame - segOutFrame(i, fps);
    if (d >= -TR && d < TR) boost = Math.max(boost, 1 - Math.abs(d + 0.5) / TR);
  }
  const introFrames = Math.round(INTRO * fps);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${(frame < introFrames ? 1.08 : z) * (1 + boost * 0.28)})`,
        transformOrigin: "540px 620px",
        filter: boost > 0 ? `blur(${boost * 16}px) brightness(${1 + boost * 0.35})` : undefined,
      }}
    >
      {/* intro: blurred, muted footage under the question card */}
      <Sequence durationInFrames={introFrames}>
        <AbsoluteFill style={{ filter: "blur(26px) brightness(1.04)" }}>
          <OffthreadVideo src={staticFile(VIDEO)} startFrom={Math.round((SEGMENTS[0][0] - INTRO) * fps)} muted />
        </AbsoluteFill>
      </Sequence>
      {SEGMENTS.map(([a, b], i) => {
        const from = segOutFrame(i, fps);
        const dur = (i + 1 < SEGMENTS.length ? segOutFrame(i + 1, fps) : from + Math.round((b - a) * fps)) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <OffthreadVideo src={staticFile(VIDEO)} startFrom={Math.round(a * fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Question card, as in the Zymerex reference: pink corner brackets + white text.
const PINK = "#F6A9DA";
const Bracket: React.FC<{ x: number; y: number; flip?: boolean; p: number }> = ({ x, y, flip, p }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 120,
      height: 120,
      borderLeft: flip ? undefined : `16px solid ${PINK}`,
      borderTop: flip ? undefined : `16px solid ${PINK}`,
      borderRight: flip ? `16px solid ${PINK}` : undefined,
      borderBottom: flip ? `16px solid ${PINK}` : undefined,
      opacity: p,
      transform: `translate(${(1 - p) * (flip ? 40 : -40)}px, ${(1 - p) * (flip ? 40 : -40)}px)`,
    }}
  />
);

const QuestionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 2, fps, config: { damping: 22, stiffness: 160 } });
  const out = interpolate(frame / fps, [INTRO - 0.2, INTRO], [1, 0], clamp);
  const lines = ["Zymerex", "Magnesio PMS,", "come si usa", "durante il mese?"];
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Bracket x={170} y={720} p={p} />
      <Bracket x={800} y={1090} flip p={p} />
      <div style={{ position: "absolute", left: 300, top: 800, fontFamily: font, fontWeight: 700, fontSize: 62, lineHeight: 1.15, color: "white", whiteSpace: "nowrap" }}>
        {lines.map((l, i) => {
          const q = spring({ frame: frame - 6 - i * 4, fps, config: { damping: 22, stiffness: 170 } });
          return (
            <div key={l} style={{ opacity: q, transform: `translateY(${(1 - q) * 24}px)`, textShadow: "0 2px 18px rgba(0,30,70,0.35)" }}>
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = useSrcSec();
  const cap = CAPTIONS.find((c) => t >= c.s && t < c.e);
  if (!cap || t > OUTRO_START) return null;
  const pop = spring({ frame: (t - cap.s) * fps, fps, config: { damping: 20, mass: 0.45, overshootClamping: true } });
  return (
    <div style={{ position: "absolute", top: 1445, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
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
            style={w.k ? { background: "white", color: C.blue, borderRadius: 10, padding: "0 12px 4px", margin: "0 -6px" } : undefined}
          >
            {w.t}
          </span>
        ))}
      </div>
    </div>
  );
};

const Pictogram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useSrcSec();
  const enter = spring({ frame: frame - Math.round(INTRO * fps) - 4, fps, config: { damping: 14 } });
  const out = interpolate(t, [OUTRO_START, OUTRO_START + 0.25], [1, 0], clamp);
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
        transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${1 + Math.sin(t * 2) * 0.02})`,
      }}
    >
      <Img src={staticFile("zymerex/pittogramma.png")} style={{ height: 110, filter: "drop-shadow(0 4px 10px rgba(0,40,90,0.55))" }} />
    </div>
  );
};

// Neutral black end card with the Zymerex logo only, no sound.
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const black = interpolate(t, [0, 0.35], [0, 1], clamp);
  const logo = interpolate(t, [0.45, 1.1], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${black})`, alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("zymerex/logo.png")}
        style={{ width: 760, opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.94, 1])})` }}
      />
    </AbsoluteFill>
  );
};

export const ZymerexPMS: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <VideoLayer />
      <Sequence durationInFrames={Math.round(INTRO * fps)}>
        <QuestionCard />
      </Sequence>
      <AbsoluteFill>
        <Overlays />
      </AbsoluteFill>
      <Captions />
      <Pictogram />
      <Sfx />
      <Sequence from={Math.round(OUTRO_OUT * fps)}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
