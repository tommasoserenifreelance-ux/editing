import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { Broll, decode, Grain, mont, ref, Room, Vignette } from "../IvTherapy/fx";

/*
 * Motion-graphic cards for the thyroid reel.
 * Layout language from the "kinetic typography" reference (full-screen
 * flat cards, a small italic lead line over one huge heavy word, a circle
 * drawn round the key word, caution-stripe bands with chips, a stamp, dot
 * fields, a clock, a puzzle piece) — dressed in the Pulp/LongevaMed look of
 * the IV Therapy reel: Montserrat italic, yellow/red on the dark room,
 * decode-in key words, grain and vignette.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Bg = "dark" | "red" | "yellow";

/** Flat full-screen card (dark = the Pulp room with grid). */
export const Card: React.FC<{ bg?: Bg; children?: React.ReactNode }> = ({ bg = "dark", children }) => {
  if (bg === "dark") return <Room>{children}</Room>;
  const color = bg === "red" ? ref.red : ref.yellow;
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(0,0,0,0.10) 2.5px, transparent 2.5px)`,
          backgroundSize: "46px 46px",
          opacity: 0.6,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,255,255,0.16), transparent 70%)" }} />
      {children}
      <Vignette strength={0.45} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};

/** Small italic lead line; words appear one by one at their spoken frames. */
export const Lead: React.FC<{ words: { w: string; at: number }[]; top: number; color?: string; size?: number }> = ({
  words,
  top,
  color = "#fff",
  size = 62,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: width * 0.06,
        right: width * 0.06,
        top: height * top,
        textAlign: "center",
        fontFamily: mont,
        fontWeight: 600,
        fontStyle: "italic",
        fontSize: size,
        lineHeight: 1.1,
        color,
        textShadow: color === "#fff" ? "0 3px 14px rgba(0,0,0,0.5)" : "none",
      }}
    >
      {words.map((x, i) => {
        const k = interpolate(frame, [x.at, x.at + 4], [0, 1], clamp);
        return (
          <span key={i} style={{ opacity: k, display: "inline-block", transform: `translateY(${(1 - k) * 12}px)`, marginRight: "0.28em" }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

/** Huge heavy italic word that decodes and pops in at its spoken frame. */
export const Big: React.FC<{
  text: string;
  at: number;
  top: number;
  color?: string;
  size?: number;
  /** deep hit under the key words only (reference: few low booms) */
  boom?: boolean;
  shadow?: boolean;
}> = ({ text, at, top, color = ref.yellow, size, boom = false, shadow = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => l.length), 4);
  const fs = size ?? Math.min((width * 1.1) / longest, 230);
  const p = interpolate(frame - at, [0, 6], [0, 1], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * top - (fs * lines.length) / 2,
          textAlign: "center",
          fontFamily: mont,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: "-0.015em",
          color,
          opacity: frame < at ? 0 : 1,
          transform: `scale(${1.18 - 0.18 * p})`,
          textShadow: shadow ? `0 0 ${fs * 0.12}px ${color}88, 0 ${fs * 0.04}px 0 rgba(0,0,0,0.45)` : "none",
          whiteSpace: "pre",
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{decode(l, frame, at + i * 2, 8)}</div>
        ))}
      </div>
      {boom ? <Sfx at={at} name="impact" volume={0.32} /> : null}
    </>
  );
};

/** Hand-drawn ellipse that strokes itself round the key word. */
export const CircleDraw: React.FC<{ at: number; top: number; w: number; h: number; color?: string }> = ({
  at,
  top,
  w,
  h,
  color = "#fff",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame - at, [0, 12], [0, 1], clamp);
  const len = 2400;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <ellipse
          cx={width / 2}
          cy={height * top}
          rx={(width * w) / 2}
          ry={(height * h) / 2}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - p)}
          transform={`rotate(-6 ${width / 2} ${height * top})`}
        />
      </svg>
      <Sfx at={at} name="draw" volume={0.15} />
    </>
  );
};

/** Asterisk burst (reference opener) — spins and scales in. */
export const Burst: React.FC<{ at: number; x: number; y: number; size?: number; color?: string }> = ({
  at,
  x,
  y,
  size = 110,
  color = ref.red,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.5 } });
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{ position: "absolute", left: width * x - size / 2, top: height * y - size / 2, transform: `scale(${s}) rotate(${frame * 2}deg)` }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={0} y1={-12} x2={0} y2={-46} stroke={color} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
    </svg>
  );
};

/** Radial lines bursting out behind a word. */
export const Radial: React.FC<{ at: number; top: number; color?: string }> = ({ at, top, color = ref.yellow }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame - at, [0, 10], [0, 1], clamp);
  const cx = width / 2;
  const cy = height * top;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, opacity: 0.85 }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 + frame * 0.004;
        const r0 = 300 + (i % 3) * 30;
        const r1 = r0 + (90 + (i % 4) * 30) * p;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r0}
            y1={cy + Math.sin(a) * r0 * 0.7}
            x2={cx + Math.cos(a) * r1}
            y2={cy + Math.sin(a) * r1 * 0.7}
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={p}
          />
        );
      })}
    </svg>
  );
};

/** Diagonal caution-stripe band sliding across (reference "nemmeno HIGGSFIELD"). */
export const Stripes: React.FC<{ at: number; top: number; angle?: number; from?: "left" | "right" }> = ({
  at,
  top,
  angle = -12,
  from = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 16, mass: 0.6 } });
  const dx = (1 - s) * width * 1.4 * (from === "left" ? -1 : 1);
  return (
    <div
      style={{
        position: "absolute",
        left: -width * 0.3,
        width: width * 1.6,
        top: height * top - 110,
        height: 220,
        transform: `translateX(${dx}px) rotate(${angle}deg)`,
        background: `repeating-linear-gradient(45deg, ${ref.red} 0 34px, #2A0E12 34px 68px)`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
        backgroundPosition: `${frame * 3}px 0`,
      }}
    />
  );
};

/** Label chip (dark pill with white heavy text) that pops in. */
export const Chip: React.FC<{ text: string; at: number; x: number; y: number; rot?: number; bg?: string; color?: string; size?: number }> = ({
  text,
  at,
  x,
  y,
  rot = -4,
  bg = "#141416",
  color = "#fff",
  size = 86,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11, mass: 0.5 } });
  if (frame < at) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: width * x,
          top: height * y,
          transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
          background: bg,
          color,
          fontFamily: mont,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: size,
          padding: "14px 34px 18px",
          borderRadius: 18,
          border: "5px solid rgba(255,255,255,0.9)",
          boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <Sfx at={at} name="pop2" volume={0.18} />
    </>
  );
};

/** Red rubber stamp slammed on (reference "NO"). */
export const Stamp: React.FC<{ text: string; at: number; x: number; y: number; size?: number }> = ({ text, at, x, y, size = 300 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame - at, [0, 4], [0, 1], clamp);
  if (frame < at) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: width * x - size / 2,
          top: height * y - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          border: `16px solid ${ref.red}`,
          color: ref.red,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mont,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: size * 0.42,
          background: "rgba(255,255,255,0.92)",
          transform: `rotate(-14deg) scale(${2.2 - 1.2 * p})`,
          opacity: p,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        {text}
      </div>
      <Sfx at={at} name="impact" volume={0.4} />
    </>
  );
};

/** Pseudo-random but deterministic. */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Dot field (reference particle grid). Squares pop in, then at `splitAt`
 * they gather into two columns: many (women, red) vs few (men, yellow).
 */
export const DotSplit: React.FC<{ at: number; splitAt: number; ratio?: number }> = ({ at, splitAt, ratio = 5 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const N = 72;
  const men = Math.round(N / (ratio + 1));
  const sp = spring({ frame: frame - splitAt, fps, config: { damping: 18, mass: 0.8 } });
  const cell = 46;
  const items = Array.from({ length: N }).map((_, i) => {
    const isMan = i < men;
    const appear = at + rnd(i) * 14;
    const k = interpolate(frame, [appear, appear + 5], [0, 1], clamp);
    // scattered position
    const sx = width * (0.08 + rnd(i + 100) * 0.84);
    const sy = height * (0.3 + rnd(i + 200) * 0.42);
    // grouped position: two blocks
    const j = isMan ? i : i - men;
    const cols = 6;
    const gx = (isMan ? width * 0.72 : width * 0.12) + (j % cols) * cell * (isMan ? 1 : 1);
    const gy = height * 0.66 - Math.floor(j / cols) * cell;
    const x = sx + (gx - sx) * sp;
    const y = sy + (gy - sy) * sp;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 34,
          height: 34,
          borderRadius: 6,
          background: isMan ? ref.yellow : ref.red,
          opacity: k,
          transform: `scale(${k})`,
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
        }}
      />
    );
  });
  const lab = interpolate(frame, [splitAt + 10, splitAt + 16], [0, 1], clamp);
  return (
    <>
      {items}
      <div style={{ position: "absolute", left: width * 0.12, width: cell * 6, top: height * 0.7, textAlign: "center", fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 64, color: ref.red, opacity: lab }}>
        DONNA
      </div>
      <div style={{ position: "absolute", left: width * 0.72, width: cell * 6 - 140, top: height * 0.7, textAlign: "left", fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 64, color: ref.yellow, opacity: lab }}>
        UOMO
      </div>
      <Sfx at={splitAt} name="whoosh_down" volume={0.16} />
    </>
  );
};

/** Clock whose hands race forward then settle (reference "NON SPRECARE TEMPO"). */
export const Clock: React.FC<{ at: number; top: number; size?: number }> = ({ at, top, size = 420 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = Math.max(0, frame - at);
  const speed = interpolate(t, [0, 40], [1, 0], clamp);
  const turns = t * 0.06 + 6 * (1 - Math.pow(1 - Math.min(t / 40, 1), 3));
  const ap = interpolate(frame - at, [0, 6], [0, 1], clamp);
  return (
    <>
      <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ position: "absolute", left: width / 2 - size / 2, top: height * top - size / 2, opacity: ap, transform: `scale(${0.8 + 0.2 * ap})` }}>
        <circle r={92} fill="rgba(255,255,255,0.04)" stroke={ref.red} strokeWidth={6} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-80} x2={0} y2={-70} stroke="#fff" strokeWidth={4} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-48} stroke="#fff" strokeWidth={7} strokeLinecap="round" transform={`rotate(${turns * 30})`} />
        <line x1={0} y1={0} x2={0} y2={-72} stroke={ref.yellow} strokeWidth={4} strokeLinecap="round" transform={`rotate(${turns * 360})`} />
        <circle r={7} fill="#fff" />
      </svg>
      <Sfx at={at} name="tick" volume={0.22 * (speed > 0 ? 1 : 0)} />
    </>
  );
};

/** Puzzle piece that snaps into a gap (the "tassello"). */
export const Puzzle: React.FC<{ at: number; top: number }> = ({ at, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13, mass: 0.7 } });
  const piece = "M0 0 H38 C38 -18 62 -18 62 0 H100 V38 C118 38 118 62 100 62 V100 H0 Z";
  const size = 300;
  const cx = width / 2;
  const cy = height * top;
  return (
    <>
      <svg width={size * 2.2} height={size * 1.4} viewBox="-120 -40 340 180" style={{ position: "absolute", left: cx - size * 1.1, top: cy - size * 0.7 }}>
        {/* left neighbour (already in place) */}
        <path d={piece} transform="translate(-100 0)" fill="rgba(20,20,22,0.18)" stroke="#141416" strokeWidth={3} />
        {/* the missing piece slot */}
        <path d={piece} fill="none" stroke="#141416" strokeWidth={3} strokeDasharray="8 8" />
        {/* the piece flying in */}
        <path
          d={piece}
          transform={`translate(${(1 - s) * 200} ${(1 - s) * -160}) rotate(${(1 - s) * 40} 50 50)`}
          fill="#141416"
          stroke="#fff"
          strokeWidth={3}
        />
      </svg>
      <Sfx at={at + 6} name="pop3" volume={0.2} />
    </>
  );
};

/** B-roll with a big decoding label on the lower third (Pulp cutaway). */
export const BrollWord: React.FC<{
  src: string;
  word: string;
  at?: number;
  color?: string;
  startFrom?: number;
  lead?: { w: string; at: number }[];
  boom?: boolean;
}> = ({ src, word, at = 2, color = ref.yellow, startFrom = 0, lead, boom }) => (
  <AbsoluteFill>
    <Broll src={src} startFrom={startFrom} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6) 85%)" }} />
    {lead ? <Lead words={lead} top={0.63} /> : null}
    <Big text={word} at={at} top={0.74} color={color} boom={boom} />
  </AbsoluteFill>
);

/**
 * PubMed study cards: cropped abstract headers on paper, flying in tilted
 * and stacking, with a yellow highlighter sweeping across each title.
 */
export type Study = { src: string; at: number; hl: [number, number] };

export const Studies: React.FC<{ items: Study[]; label?: React.ReactNode }> = ({ items, label }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const push = interpolate(frame, [0, 120], [1, 1.06], clamp);
  return (
    <Room>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {items.map((it, i) => {
          const s = spring({ frame: frame - it.at, fps, config: { damping: 15, mass: 0.6 } });
          if (frame < it.at) return null;
          const rot = [-4, 3, -2, 4][i % 4];
          const W = width * 0.98;
          const yc = height * (0.4 + (i % 3) * 0.06 - (items.length > 2 ? 0.04 : 0));
          const hl = interpolate(frame - it.at, [8, 20], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (width - W) / 2,
                top: yc - 180,
                width: W,
                transform: `translateY(${(1 - s) * height * 0.7}px) rotate(${rot * s + (1 - s) * 18}deg)`,
                background: "#fff",
                padding: "30px 18px 22px",
                borderRadius: 6,
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ position: "relative" }}>
                <Img src={staticFile(it.src)} style={{ width: "100%", display: "block" }} />
                <div
                  style={{
                    position: "absolute",
                    left: "-1%",
                    top: `${it.hl[0] * 100}%`,
                    height: `${(it.hl[1] - it.hl[0]) * 100}%`,
                    width: `${hl * 102}%`,
                    background: "rgba(247,198,0,0.55)",
                    mixBlendMode: "multiply",
                    borderRadius: 4,
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  top: -30,
                  background: "#20558A",
                  color: "#fff",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: 34,
                  padding: "8px 18px",
                  borderRadius: 8,
                  transform: "rotate(-3deg)",
                }}
              >
                Pub<span style={{ color: "#A9D3F5" }}>Med</span>
              </div>
            </div>
          );
        })}
        {items.map((it, i) => (
          <React.Fragment key={`s${i}`}>
            <Sfx at={it.at} name="whoosh" volume={0.14} />
          </React.Fragment>
        ))}
      </AbsoluteFill>
      {label}
    </Room>
  );
};
