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
import { Sfx } from "./Sfx";
import { SEGMENT_OUT_STARTS, SEGMENTS, srcToOut, TRANSITION_SEGMENTS, useSrcSec } from "./timeline";
import { C, font, GRADIENT } from "./theme";
import "./theme";

export const ZYMEREX_FPS = 24;
const OUTRO_START = 58.3; // source seconds; speech ends at ~58.28 s
const OUTRO_OUT = srcToOut(OUTRO_START);
export const ZYMEREX_DURATION = Math.round((OUTRO_OUT + 3.2) * ZYMEREX_FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Jump-cut framing: every kept segment gets its own punch-in, alternating
// wide / tight like the reference.
const FRAMING = [1.0, 1.16, 1.06, 1.2];

const TR = 4; // frames on each side of the cut

const segOutFrame = (i: number, fps: number) => Math.round(SEGMENT_OUT_STARTS[i] * fps);

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let idx = 0;
  SEGMENTS.forEach((_, i) => {
    if (frame >= segOutFrame(i, fps)) idx = i;
  });
  const local = (frame - segOutFrame(idx, fps)) / fps;
  const z = FRAMING[idx % FRAMING.length] + local * 0.006; // slow push-in

  // zoom-blur around transition cuts
  let boost = 0;
  for (const i of TRANSITION_SEGMENTS) {
    const d = frame - segOutFrame(i, fps); // <0 before cut, >=0 after
    if (d >= -TR && d < TR) boost = Math.max(boost, 1 - Math.abs(d + 0.5) / TR);
  }
  const scale = z * (1 + boost * 0.28);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "540px 560px",
        filter: boost > 0 ? `blur(${boost * 16}px) brightness(${1 + boost * 0.35})` : undefined,
      }}
    >
      {SEGMENTS.map(([a, b], i) => {
        const from = segOutFrame(i, fps);
        const dur = (i + 1 < SEGMENTS.length ? segOutFrame(i + 1, fps) : from + Math.round((b - a) * fps)) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <OffthreadVideo src={staticFile("zymerex/video.mp4")} startFrom={Math.round(a * fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Zymerex-style captions: bold white words on a brand-blue block.
const Captions: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = useSrcSec();
  const cap = CAPTIONS.find((c) => t >= c.s && t < c.e);
  if (!cap || t > OUTRO_START) return null;
  const pop = spring({ frame: (t - cap.s) * fps, fps, config: { damping: 20, mass: 0.45, overshootClamping: true } });
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
  const t = useSrcSec();
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
      <VideoLayer />
      <AbsoluteFill>
        <Overlays />
      </AbsoluteFill>
      <Captions />
      <Pictogram />
      <Sfx outroOut={OUTRO_OUT} />
      <Sequence from={Math.round(OUTRO_OUT * fps)}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
