import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { Grain, mont, Vignette } from "../IvTherapy/fx";

/*
 * "Omega 3" look: same LongevaMed brand (yellow, Montserrat, grain) but a
 * different grammar from the thyroid/DHEA reels so the series doesn't feel
 * copy-pasted: upright heavy type instead of italic, centred word-by-word
 * captions, navy panels instead of the grey room, diagonal yellow wipes
 * between shots, pill tags on the B-roll.
 */

export const C = {
  yellow: "#F7C600",
  navy: "#0B1622",
  navy2: "#13263A",
  red: "#E8343F",
  green: "#3DDC84",
  white: "#FFFFFF",
  ink: "#0E0E0E",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type Word = { w: string; s: number; e: number };
export const norm = (w: string) => w.replace(/[.,?:!]/g, "").toLowerCase();

/** Navy panel with a fine dot grid, a soft spotlight and grain. */
export const Panel: React.FC<{ children?: React.ReactNode; tint?: string }> = ({ children, tint = C.navy }) => (
  <AbsoluteFill style={{ backgroundColor: tint }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)", backgroundSize: "38px 38px" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 55% at 50% 42%, ${C.navy2}, transparent 75%)` }} />
    {children}
    <Vignette strength={0.5} />
    <Grain opacity={0.07} />
  </AbsoluteFill>
);

/** Heavy upright title; each line rises out of a mask as it is spoken. */
export const Title: React.FC<{ lines: string[]; at: number[]; top: number; size?: number; color?: string; align?: "center" | "left" }> = ({
  lines,
  at,
  top,
  size,
  color = C.white,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const longest = Math.max(...lines.map((l) => l.length), 5);
  const fs = size ?? Math.min((width * 0.92) / (longest * 0.66), 190);
  return (
    <div style={{ position: "absolute", left: width * 0.06, right: width * 0.06, top: height * top, textAlign: align }}>
      {lines.map((l, i) => {
        const s = spring({ frame: frame - (at[i] ?? at[0]), fps, config: { damping: 16, mass: 0.6 } });
        return (
          <div key={i} style={{ overflow: "hidden", lineHeight: 1.02 }}>
            <div
              style={{
                fontFamily: mont,
                fontWeight: 900,
                fontSize: fs,
                letterSpacing: "-0.03em",
                color: l.startsWith("*") ? C.yellow : color,
                transform: `translateY(${(1 - s) * 110}%)`,
                textTransform: "uppercase",
              }}
            >
              {l.replace(/^\*/, "")}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Small upright lead line, words fading up one by one. */
export const Lead: React.FC<{ words: { w: string; at: number }[]; top: number; size?: number; color?: string }> = ({ words, top, size = 54, color = "rgba(255,255,255,0.9)" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: width * 0.07, right: width * 0.07, top: height * top, textAlign: "center", fontFamily: mont, fontWeight: 600, fontSize: size, lineHeight: 1.15, color }}>
      {words.map((x, i) => {
        const k = interpolate(frame, [x.at, x.at + 4], [0, 1], clamp);
        return (
          <span key={i} style={{ opacity: k, display: "inline-block", marginRight: "0.26em", transform: `translateY(${(1 - k) * 10}px)` }}>
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

/** Rounded tag that slides in (B-roll labels, chips). */
export const Pill: React.FC<{ text: string; at: number; x: number; y: number; bg?: string; color?: string; size?: number; rot?: number; anchor?: "center" | "left" }> = ({
  text,
  at,
  x,
  y,
  bg = C.yellow,
  color = C.ink,
  size = 64,
  rot = 0,
  anchor = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 13, mass: 0.55 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: width * x,
        top: height * y,
        transform: `translate(${anchor === "center" ? "-50%" : "0"}, -50%) scale(${0.6 + 0.4 * s}) rotate(${rot * s}deg)`,
        opacity: Math.min(1, s * 1.6),
        background: bg,
        color,
        fontFamily: mont,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: "-0.02em",
        padding: `${size * 0.2}px ${size * 0.45}px ${size * 0.24}px`,
        borderRadius: size * 0.5,
        whiteSpace: "nowrap",
        boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
};

/** Diagonal yellow band that sweeps across on a cut (the new transition). */
export const Wipe: React.FC<{ dur?: number; sound?: boolean }> = ({ dur = 9, sound = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame > dur) return null;
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const band = Math.max(width, height) * 0.5;
  const x = -band * 1.6 + p * (width + band * 3.2);
  return (
    <>
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: x, top: -height * 0.5, width: band, height: height * 2, background: C.yellow, transform: "skewX(-18deg)", opacity: 0.95 }} />
        <div style={{ position: "absolute", left: x - band * 0.32, top: -height * 0.5, width: band * 0.12, height: height * 2, background: C.white, transform: "skewX(-18deg)", opacity: 0.8 }} />
      </AbsoluteFill>
      {sound ? <Sfx at={0} name="swoosh" volume={0.12} /> : null}
    </>
  );
};

/** Full-frame B-roll, slow push and a soft grade. */
export const Clip: React.FC<{ src: string; startFrom?: number; children?: React.ReactNode }> = ({ src, startFrom = 0, children }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 150], [1.03, 1.13], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,22,34,0.35), transparent 28%, transparent 62%, rgba(11,22,34,0.75))" }} />
      {children}
      <Vignette strength={0.45} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

/**
 * Centred word-by-word captions: 2-4 word groups, the spoken word turns
 * yellow and pops; key words sit in a yellow box.
 */
export const Captions: React.FC<{
  words: Word[];
  keys: string[];
  visible: (t: number) => boolean;
  top: number;
  size?: number;
}> = ({ words, keys, visible, top, size = 76 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const K = new Set(keys);
  // groups: break on punctuation, on key words, or every 3 words
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const brk = !next || /[.,?:!]$/.test(w.w) || K.has(norm(w.w)) || cur.length >= 3 || next.s - w.e > 0.35;
    if (brk) {
      groups.push(cur);
      cur = [];
    }
  });
  const g = groups.find((gr, i) => t >= gr[0].s - 0.05 && t < (groups[i + 1]?.[0].s ?? gr[gr.length - 1].e + 0.6) - 0.05 && t < gr[gr.length - 1].e + 0.6);
  if (!g || !visible(g[0].s + 0.01)) return null;
  const gStart = Math.round((g[0].s - 0.05) * fps);
  const gin = spring({ frame: frame - gStart, fps, config: { damping: 15, mass: 0.5 } });
  return (
    <div
      style={{
        position: "absolute",
        left: width * 0.05,
        right: width * 0.05,
        top: height * top,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `${size * 0.12}px ${size * 0.24}px`,
        transform: `translateY(${(1 - gin) * 30}px)`,
        opacity: Math.min(1, gin * 1.5),
      }}
    >
      {g.map((w, i) => {
        const key = K.has(norm(w.w));
        const said = t >= w.s - 0.03;
        const p = spring({ frame: frame - Math.round(w.s * fps), fps, config: { damping: 12, mass: 0.4 } });
        const txt = w.w.replace(/[.,?:!]$/, "").toUpperCase();
        return (
          <span
            key={i}
            style={{
              fontFamily: mont,
              fontWeight: 900,
              fontSize: key ? size * 1.12 : size,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: key ? C.ink : said ? C.yellow : C.white,
              background: key && said ? C.yellow : "transparent",
              padding: key ? `0 ${size * 0.16}px ${size * 0.04}px` : 0,
              borderRadius: 10,
              transform: `scale(${said ? 1 + 0.12 * (1 - p) : 1})`,
              textShadow: key ? "none" : "0 4px 16px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)",
              opacity: key && !said ? 0 : 1,
              display: "inline-block",
            }}
          >
            {txt}
          </span>
        );
      })}
    </div>
  );
};

/** PubMed screenshots sliding in from the right and fanning out. */
export const StudyFan: React.FC<{ items: { src: string; at: number; hl: [number, number] }[]; top: number }> = ({ items, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        const s = spring({ frame: frame - it.at, fps, config: { damping: 16, mass: 0.7 } });
        if (frame < it.at) return null;
        const Wd = width * 0.9;
        const hl = interpolate(frame - it.at, [8, 22], [0, 1], clamp);
        const rot = [-2.5, 2, -1.2][i % 3];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (width - Wd) / 2,
              top: height * top + i * height * 0.085,
              width: Wd,
              transform: `translateX(${(1 - s) * width}px) rotate(${rot * s}deg)`,
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
              borderLeft: `14px solid ${C.yellow}`,
            }}
          >
            <div style={{ position: "relative" }}>
              <Img src={staticFile(it.src)} style={{ width: "100%", display: "block" }} />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: `${it.hl[0] * 100}%`,
                  height: `${(it.hl[1] - it.hl[0]) * 100}%`,
                  width: `${hl * 100}%`,
                  background: "rgba(247,198,0,0.5)",
                  mixBlendMode: "multiply",
                }}
              />
            </div>
            <Sfx at={it.at} name="whoosh" volume={0.13} />
          </div>
        );
      })}
    </>
  );
};
