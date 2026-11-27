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
import { CARD_SECONDS, EDIT_END, ITEM_OUT_STARTS, ITEMS, itemAt, TRANSITION_ITEMS, useSrcSec } from "./timeline";

export const GP_FPS = 25;
const VIDEO = "zymerex-gp/video.mp4";
export const GP_DURATION = Math.round((EDIT_END + 3.4) * GP_FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The two interview questions, shown as cards (Zymerex reference style).
export const QUESTIONS: string[][] = [
  ["Zymerex", "Gonfiore Plus,", "qual è l'occasione", "tipo in cui la pancia", "si fa sentire?"],
  ["Quanto incide", "questo fastidio", "sul resto", "della giornata?"],
];

const FRAMING = [1.0, 1.15, 1.05, 1.2];
const TR = 4;
const outFrame = (i: number, fps: number) => Math.round(ITEM_OUT_STARTS[i] * fps);

// zoom-blur at topic changes and when leaving every question card
const BLUR_ITEMS = [...TRANSITION_ITEMS, ...ITEMS.flatMap((it, i) => (it.kind === "card" ? [i + 1] : []))];

const VideoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = itemAt(frame / fps);
  const segIndex = ITEMS.slice(0, idx + 1).filter((it) => it.kind === "seg").length;
  const local = (frame - outFrame(idx, fps)) / fps;
  const isCard = ITEMS[idx].kind === "card";
  const z = isCard ? 1.08 : FRAMING[segIndex % FRAMING.length] + local * 0.006;
  let boost = 0;
  for (const i of BLUR_ITEMS) {
    const d = frame - outFrame(i, fps);
    if (d >= -TR && d < 0) boost = Math.max(boost, (d + TR + 1) / (TR + 1));
    if (d >= 0 && d < 2) boost = Math.max(boost, 0.5 - d * 0.25);
  }
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${z * (1 + boost * 0.28)})`,
        transformOrigin: "540px 620px",
        filter: boost > 0 ? `blur(${boost * 16}px) brightness(${1 + boost * 0.35})` : undefined,
      }}
    >
      {ITEMS.map((it, i) => {
        const from = outFrame(i, fps);
        // the last segment stops exactly at the end of the talk: nothing plays under the end card
        const end = i + 1 < ITEMS.length ? outFrame(i + 1, fps) : Math.round(EDIT_END * fps);
        if (it.kind === "card") {
          // blurred, muted footage of the question under the card
          const next = ITEMS.slice(i + 1).find((x) => x.kind === "seg") as { a: number };
          return (
            <Sequence key={i} from={from} durationInFrames={end - from}>
              <AbsoluteFill style={{ filter: "blur(26px) brightness(1.04)" }}>
                <OffthreadVideo src={staticFile(VIDEO)} startFrom={Math.round((next.a - CARD_SECONDS) * fps)} muted />
              </AbsoluteFill>
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            <OffthreadVideo src={staticFile(VIDEO)} startFrom={Math.round(it.a * fps)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const PINK = "#F6A9DA";
const Bracket: React.FC<{ x: number; y: number; flip?: boolean; p: number }> = ({ x, y, flip, p }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 110,
      height: 110,
      borderLeft: flip ? undefined : `15px solid ${PINK}`,
      borderTop: flip ? undefined : `15px solid ${PINK}`,
      borderRight: flip ? `15px solid ${PINK}` : undefined,
      borderBottom: flip ? `15px solid ${PINK}` : undefined,
      opacity: p,
      transform: `translate(${(1 - p) * (flip ? 40 : -40)}px, ${(1 - p) * (flip ? 40 : -40)}px)`,
    }}
  />
);

const QuestionCard: React.FC<{ lines: string[]; product?: boolean }> = ({ lines, product }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 2, fps, config: { damping: 22, stiffness: 160 } });
  const out = interpolate(frame / fps, [CARD_SECONDS - 0.2, CARD_SECONDS], [1, 0], clamp);
  const top = 760;
  const bottom = top + lines.length * 64 + 40;
  const prod = spring({ frame: frame - 14, fps, config: { damping: 22, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Bracket x={150} y={top - 70} p={p} />
      <Bracket x={830} y={bottom - 40} flip p={p} />
      <div style={{ position: "absolute", left: 250, top, fontFamily: font, fontWeight: 700, fontSize: 56, lineHeight: 1.14, color: "white", whiteSpace: "nowrap" }}>
        {lines.map((l, i) => {
          const q = spring({ frame: frame - 6 - i * 3, fps, config: { damping: 22, stiffness: 170 } });
          return (
            <div key={l} style={{ opacity: q, transform: `translateY(${(1 - q) * 24}px)`, textShadow: "0 2px 18px rgba(0,30,70,0.35)" }}>
              {l}
            </div>
          );
        })}
      </div>
      {product ? (
        <Img
          src={staticFile("zymerex-gp/gonfiore-plus.png")}
          style={{
            position: "absolute",
            left: 540,
            top: bottom + 230,
            width: 270,
            transform: `translate(-50%,-50%) scale(${interpolate(prod, [0, 1], [0.85, 1])})`,
            opacity: prod,
            filter: "drop-shadow(0 26px 34px rgba(0,30,70,0.4))",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useSrcSec();
  if (ITEMS[itemAt(frame / fps)].kind === "card" || frame / fps >= EDIT_END) return null;
  const cap = CAPTIONS.find((c) => t >= c.s && t < c.e);
  if (!cap) return null;
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
  const t = frame / fps;
  const onCard = t < EDIT_END && ITEMS[itemAt(t)].kind === "card";
  const vis = spring({ frame: frame - Math.round(CARD_SECONDS * fps) - 4, fps, config: { damping: 14 } });
  const out = interpolate(t, [EDIT_END, EDIT_END + 0.25], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1572,
        display: "flex",
        justifyContent: "center",
        opacity: vis * out * (onCard ? 0 : 0.95),
        transform: `translateY(${interpolate(vis, [0, 1], [40, 0])}px) scale(${1 + Math.sin(t * 2) * 0.02})`,
      }}
    >
      <Img src={staticFile("zymerex/pittogramma.png")} style={{ height: 68, filter: "drop-shadow(0 3px 8px rgba(0,40,90,0.55))" }} />
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ease = (x: number) => x * x * (3 - 2 * x);
  const black = interpolate(t, [0, 0.7], [0, 1], { ...clamp, easing: ease });
  const logo = interpolate(t, [0.55, 1.6], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${black})`, alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("zymerex/logo.png")}
        style={{
          width: 760,
          opacity: logo,
          filter: `blur(${(1 - logo) * 10}px)`,
          transform: `scale(${0.96 + logo * 0.04 + t * 0.006})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const ZymerexGP: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <VideoLayer />
      {ITEMS.map((it, i) =>
        it.kind === "card" ? (
          <Sequence key={i} from={outFrame(i, fps)} durationInFrames={Math.round(CARD_SECONDS * fps)}>
            <QuestionCard lines={QUESTIONS[it.q]} product={it.q === 0} />
          </Sequence>
        ) : null,
      )}
      <AbsoluteFill>
        <Overlays />
      </AbsoluteFill>
      <Captions />
      <Pictogram />
      <Sfx />
      <Sequence from={Math.round(EDIT_END * fps)}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
