import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Illo } from "./illos";
import { colors, FPS, sans, serif } from "./theme";

// Global start time (s) of each source clip inside the voice track.
export const CLIP_OFFSETS = [0, 12.839, 32.017, 49.454];

export const clipFor = (t: number) => {
  let i = 0;
  while (i < CLIP_OFFSETS.length - 1 && t >= CLIP_OFFSETS[i + 1] - 0.001) i++;
  return i;
};

export type SfxName =
  | "pop1"
  | "pop2"
  | "pop3"
  | "whoosh"
  | "swoosh"
  | "whoosh_long"
  | "whoosh_down"
  | "impact"
  | "tick"
  | "typing"
  | "counter"
  | "riser"
  | "riser_short"
  | "draw"
  | "ding"
  | "rise"
  | "powerdown";

// Master level for all effects, under the voice.
const SFX_GAIN = 0.7;

/** One-shot sound effect at a frame of the current sequence. */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number }> = ({
  at,
  name,
  volume = 0.5,
}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * SFX_GAIN} />
  </Sequence>
);

// Elastic pop used by every element that enters (reference: overshoot, no fades).
export const usePop = (delay = 0, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, mass: 0.55, stiffness: 170 },
  });
};

/**
 * SVG filters shared by the whole video (mounted once at the root).
 * `print`: rough edges + worn white specks, `sticker`: same + white outline.
 * Apply with `filter: "url(#print)"` on any element.
 */
const PrintFilter: React.FC<{ id: string; outline: number }> = ({
  id,
  outline,
}) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="warp" />
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11" result="grain" />
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -60 0 0 0 16.5" result="specks" />
    <feComposite in="specks" in2="rough" operator="in" result="wear" />
    {outline > 0 ? (
      <>
        <feMorphology in="rough" operator="dilate" radius={outline} result="fat" />
        <feFlood floodColor="#fff" />
        <feComposite in2="fat" operator="in" result="outline" />
      </>
    ) : null}
    <feMerge>
      {outline > 0 ? <feMergeNode in="outline" /> : null}
      <feMergeNode in="rough" />
      <feMergeNode in="wear" />
    </feMerge>
  </filter>
);

export const PrintDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <PrintFilter id="print" outline={0} />
      <PrintFilter id="sticker" outline={9} />
      {[0, 1].map((v) => (
        <filter key={v} id={v ? "paperLight" : "paper"} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="2" />
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 ${v}  0 0 0 0 ${v}  0 0 0 0 ${v}  0 0 0 -1.4 1.05`}
          />
        </filter>
      ))}
    </defs>
  </svg>
);

export type Paper = "white" | "black" | "coral" | "mint";

const PAPER_BG: Record<Paper, string> = {
  white: colors.white,
  black: colors.black,
  coral: colors.coral,
  mint: colors.mint,
};

/**
 * Scene background with a printed-paper feel: grain, faint diagonal
 * stripes and (on colour) a soft vignette, as in the illustrated reference.
 */
export const Fill: React.FC<{
  bg: Paper;
  children?: React.ReactNode;
}> = ({ bg, children }) => {
  const dark = bg === "black";
  const colour = bg === "coral" || bg === "mint";
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG[bg] }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${
            dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.035)"
          } 0 3px, transparent 3px 11px)`,
        }}
      />
      {colour ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(255,255,255,0.12), rgba(0,0,0,0.22))",
          }}
        />
      ) : null}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          opacity: dark ? 0.06 : 0.1,
          mixBlendMode: dark ? "screen" : "multiply",
        }}
      >
        <rect width="100%" height="100%" filter={dark ? "url(#paperLight)" : "url(#paper)"} />
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/**
 * The speaker, playing from the clip that covers the given global time.
 * Hard cut in with a small punch, then a slow push-in.
 */
export const TalkingHead: React.FC<{
  start: number;
  punch?: number[]; // extra punch-in moments, seconds relative to scene start
}> = ({ start, punch = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ci = clipFor(start);
  const settle = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  let scale = interpolate(settle, [0, 1], [1.07, 1]);
  for (const p of punch) {
    const f = Math.round(p * fps);
    if (frame >= f) {
      scale += 0.09 * spring({ frame: frame - f, fps, config: { damping: 18 } });
    }
  }
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`longeva/clip${ci + 1}.mp4`)}
        startFrom={Math.round((start - CLIP_OFFSETS[ci]) * FPS)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "50% 30%",
        }}
      />
      {punch.map((p) => (
        <Sfx key={p} at={p * fps - 2} name="swoosh" volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};

/** Dashed perspective floor the cut-outs stand on. */
export const GridFloor: React.FC<{
  width?: number;
  top: number;
  opacity?: number;
}> = ({ width = 900, top, opacity = 1 }) => {
  const cells = 10;
  const step = width / cells;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= cells; i++) {
    lines.push(
      <line
        key={`v${i}`}
        x1={i * step}
        y1={0}
        x2={i * step}
        y2={width}
        stroke="#9A9AA0"
        strokeWidth={2}
        strokeDasharray="6 10"
      />,
      <line
        key={`h${i}`}
        x1={0}
        y1={i * step}
        x2={width}
        y2={i * step}
        stroke="#9A9AA0"
        strokeWidth={2}
        strokeDasharray="6 10"
      />,
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - width) / 2,
        top,
        width,
        height: width,
        perspective: 900,
        opacity,
        WebkitMaskImage:
          "radial-gradient(ellipse 50% 50% at 50% 30%, black 40%, transparent 75%)",
        maskImage:
          "radial-gradient(ellipse 50% 50% at 50% 30%, black 40%, transparent 75%)",
      }}
    >
      <svg
        width={width}
        height={width}
        style={{ transform: "rotateX(68deg)", transformOrigin: "50% 0%" }}
      >
        {lines}
      </svg>
    </div>
  );
};

/**
 * Extruded "3D" word with a glow, flying in tilted with motion blur
 * (reference: STRATEGIA / idee diverse).
 */
export const Word3D: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  depthColor?: string;
  top: number;
  rotate?: number;
}> = ({
  text,
  delay = 0,
  size = 150,
  color = colors.blue,
  depthColor = colors.blueDeep,
  top,
  rotate = -6,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 13);
  const blur = interpolate(frame - delay, [0, 7], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const depth = Array.from(
    { length: 9 },
    (_, i) => `${i + 1}px ${i + 1}px 0 ${depthColor}`,
  ).join(", ");
  const wobble = Math.sin((frame - delay) / 14) * 2.5;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        perspective: 1200,
        opacity: frame < delay ? 0 : 1,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "-0.05em",
          color,
          whiteSpace: "nowrap",
          textShadow: `${depth}, 0 0 40px ${color}88`,
          filter: `url(#print) blur(${blur}px)`,
          transform: `translateY(${interpolate(p, [0, 1], [260, 0])}px) rotateX(${interpolate(p, [0, 1], [70, 14])}deg) rotateY(${-18 + wobble}deg) rotateZ(${rotate}deg) scale(${interpolate(p, [0, 1], [0.4, 1])})`,
        }}
      >
        {text}
      </div>
      <Sfx at={delay} name="impact" volume={0.35} />
    </div>
  );
};

/** Hand-drawn yellow scribble that draws itself on. */
export const Scribble: React.FC<{
  d: string;
  delay: number;
  len?: number;
  width?: number;
  color?: string;
  style?: React.CSSProperties;
  viewBox?: string;
}> = ({
  d,
  delay,
  len = 1400,
  width = 16,
  color = colors.yellow,
  style,
  viewBox = "0 0 1080 400",
}) => {
  const frame = useCurrentFrame();
  const drawn = interpolate(frame - delay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg viewBox={viewBox} style={{ position: "absolute", ...style }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - drawn)}
        style={{ filter: `url(#print) drop-shadow(0 0 10px ${color}aa)` }}
      />
      <Sfx at={delay} name="draw" volume={0.4} />
    </svg>
  );
};

/** Italic serif label that types itself letter by letter, slightly tilted. */
export const SerifLabel: React.FC<{
  text: string;
  delay: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, delay, size = 54, color = colors.ink, style }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor((frame - delay) * 1.6));
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: "-0.03em",
        color,
        whiteSpace: "pre",
        textAlign: "center",
        ...style,
      }}
    >
      <Sfx at={delay} name="typing" volume={0.35} />
      {text.split("\n").map((line, li, lines) => {
        const base = lines.slice(0, li).join("").length;
        return (
          <div key={li}>
            {[...line].map((ch, j) => {
              const i = base + j;
              const drop = interpolate(frame - delay - i / 1.6, [0, 4], [-30, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <span
                  key={j}
                  style={{
                    opacity: i < shown ? 1 : 0,
                    display: "inline-block",
                    whiteSpace: "pre",
                    transform: `translateY(${drop}px) rotate(${drop / 4}deg)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Pastel circle with an icon (reference avatar grid). */
export const Bubble: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  grey?: number; // 0..1 desaturation
  sound?: SfxName;
  children: React.ReactNode;
}> = ({ x, y, size, color, delay, grey = 0, sound, children }) => {
  const p = usePop(delay);
  const frame = useCurrentFrame();
  const floatY = Math.sin((frame - delay) / 20 + x) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + floatY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "6px solid #fff",
        boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${p})`,
        opacity: frame < delay ? 0 : 1,
        filter: `url(#print) grayscale(${grey}) brightness(${1 + grey * 0.15})`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.56} height={size * 0.56}>
        {children}
      </svg>
      {sound ? <Sfx at={delay} name={sound} volume={0.25} /> : null}
    </div>
  );
};

/** Line that draws itself between two points. */
export const Link: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  color?: string;
  dashed?: boolean;
  width?: number;
}> = ({ x1, y1, x2, y2, delay, color = colors.blue, dashed, width = 8 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <line
        filter="url(#print)"
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * t}
        y2={y1 + (y2 - y1) * t}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? "18 22" : undefined}
      />
      <Sfx at={delay} name="draw" volume={0.25} />
    </svg>
  );
};

/**
 * Screen-print illustration (see illos.tsx) — no circle, pops in with
 * overshoot and a little wobble, then floats.
 */
const POPS = ["pop1", "pop2", "pop3"] as const;

export const Emoji: React.FC<{
  name: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  grey?: number;
  volume?: number;
}> = ({ name, x, y, size, delay, grey = 0, volume = 0.55 }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 9);
  const local = frame - delay;
  const floatY = Math.sin(local / 18 + x / 97) * 6;
  const rot =
    interpolate(p, [0, 1], [-25, 0]) + Math.sin(local / 22 + y / 50) * 3;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + floatY,
        width: size,
        height: size,
        opacity: frame < delay ? 0 : 1,
        transform: `scale(${p}) rotate(${rot}deg)`,
        filter: `grayscale(${grey}) drop-shadow(0 22px 26px rgba(0,0,0,${0.18 * (1 - grey * 0.5)}))`,
      }}
    >
      <Illo name={name} size={size} seed={Math.round(x + y) % 50} />
      <Sfx
        at={delay}
        name={POPS[Math.abs(Math.round(x + y)) % 3]}
        volume={volume}
      />
    </div>
  );
};
