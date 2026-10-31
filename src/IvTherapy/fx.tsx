import React from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Sfx } from "../Testosterone/primitives";

/*
 * "Documentary podcast" look from the IV-therapy references: a dark room
 * with a grid, film grain, kinetic type that decodes into place, real
 * footage inside a vintage TV / CRT, dossiers, polaroids, torn newspaper,
 * smoke and colour-bar glitches.
 */

export const ref = {
  yellow: "#F7C600", // LongevaMed yellow (the reference uses a warm yellow too)
  red: "#E8343F",
  room: "#141416",
  paper: "#F1ECE2",
  manila: "#D9B865",
  ink: "#141414",
  crt: "#5CFF8A",
};

export const mont = "Montserrat";
export const anton = "Anton";

const FONTS: [string, string, string, string][] = [
  [mont, "600", "italic", "montserrat-latin-600-italic"],
  [mont, "800", "italic", "montserrat-latin-800-italic"],
  [mont, "900", "italic", "montserrat-latin-900-italic"],
  [mont, "700", "normal", "montserrat-latin-700-normal"],
  [anton, "400", "normal", "anton-latin-400-normal"],
];
const handle = delayRender("Loading IV fonts");
Promise.all(
  FONTS.map(([family, weight, style, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
      style,
    })
      .load()
      .then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/* ------------------------------------------------------------------ */
/* Room, grain, vignette                                                */
/* ------------------------------------------------------------------ */

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0, opacity, mixBlendMode: "overlay", pointerEvents: "none" }}
    >
      <filter id={`grain${frame % 6}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 6} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain${frame % 6})`} />
    </svg>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 70% 65% at 50% 48%, transparent 45%, rgba(0,0,0,${strength}))`,
      pointerEvents: "none",
    }}
  />
);

/** The dark grid room the references put their graphics in. */
export const Room: React.FC<{ children?: React.ReactNode; grid?: number }> = ({
  children,
  grid = 90,
}) => (
  <AbsoluteFill style={{ backgroundColor: ref.room }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)`,
        backgroundSize: `${grid}px ${grid}px`,
        backgroundPosition: "center center",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(255,255,255,0.07), transparent 70%)",
      }}
    />
    {children}
    <Vignette />
    <Grain />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Decoding text                                                         */
/* ------------------------------------------------------------------ */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#%&?!";

/** Letters scramble and lock in from left to right (reference: ARSIVBRE → ARRIVARE). */
export const decode = (text: string, frame: number, start: number, dur = 9) => {
  const t = frame - start;
  if (t >= dur) return text;
  if (t < 0) return "";
  const locked = Math.floor((t / dur) * text.length);
  return [...text]
    .map((ch, i) => {
      if (i < locked || ch === " ") return ch;
      return GLYPHS[Math.floor(random(`${text}${i}${frame}`) * GLYPHS.length)];
    })
    .join("");
};

/* ------------------------------------------------------------------ */
/* Smoke and glitch transitions                                          */
/* ------------------------------------------------------------------ */

/** Smoke that billows across the frame and clears (≈ 1 s): two layers of
 * drifting noise clouds whose density rises and falls. */
export const Smoke: React.FC<{ at?: number; dur?: number; sound?: boolean }> = ({
  at = 0,
  dur = 30,
  sound = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = (frame - at) / dur;
  const visible = t >= 0 && t <= 1;
  const cover = visible ? Math.sin(Math.PI * t) : 0; // 0 → 1 → 0
  const layer = (seed: number, freq: string, drift: number, gain: number) => {
    const id = `smoke${at}_${seed}`;
    // alpha = 3·noise + offset: the offset sweeps from "almost none" to "dense"
    const off = -1.85 + 1.4 * cover * gain; // soft ramp: wisps → thick cloud at the peak
    return (
      <g transform={`translate(${-width * 0.3 + drift * t * width} ${-height * 0.1 * t})`}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="4" seed={seed} />
          <feColorMatrix type="matrix" values={`0 0 0 0 0.86  0 0 0 0 0.86  0 0 0 0 0.88  1.9 0 0 0 ${off}`} />
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <rect x={0} y={0} width={width * 1.6} height={height * 1.3} filter={`url(#${id})`} />
      </g>
    );
  };
  return (
    <>
      {visible ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width={width} height={height} style={{ position: "absolute" }}>
            {layer(3, "0.0016 0.0026", 0.35, 1)}
            {layer(11, "0.0028 0.0042", -0.25, 0.8)}
          </svg>
        </AbsoluteFill>
      ) : null}
      {sound ? <Sfx at={at} name="smoke" volume={0.45} /> : null}
    </>
  );
};

/** SMPTE colour bars with noise, for a few frames. */
export const ColorBars: React.FC<{ at?: number; dur?: number }> = ({ at = 0, dur = 7 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const cols = ["#C0C0C0", "#C0C000", "#00C0C0", "#00C000", "#C000C0", "#C00000", "#0000C0"];
  return (
    <>
      {t >= 0 && t < dur ? (
        <AbsoluteFill style={{ flexDirection: "row", transform: `translateX(${(random(`cb${frame}`) - 0.5) * 30}px) skewX(${(random(`sk${frame}`) - 0.5) * 6}deg)` }}>
          {cols.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
          <Grain opacity={0.5} />
        </AbsoluteFill>
      ) : null}
      <Sfx at={at} name="glitch" volume={0.45} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Footage inside objects                                                */
/* ------------------------------------------------------------------ */

const Footage: React.FC<{ src: string; startFrom?: number; tint?: string; gray?: boolean }> = ({
  src,
  startFrom = 0,
  tint,
  gray,
}) => (
  <>
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: gray ? "grayscale(1) contrast(1.1)" : "saturate(0.85) contrast(1.05)" }}
    />
    {tint ? <AbsoluteFill style={{ background: tint, mixBlendMode: "color" }} /> : null}
  </>
);

/** Screen effects: scanlines, rolling band, glass glare. */
const ScreenFx: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 5px)",
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent ${(frame * 2) % 140 - 20}%, rgba(255,255,255,0.08) ${(frame * 2) % 140 - 10}%, transparent ${(frame * 2) % 140}%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 35% 30%, rgba(255,255,255,0.16), transparent 50%), radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65))",
        }}
      />
    </>
  );
};

/** Vintage yellow TV (reference) with footage on its screen. */
export const RetroTV: React.FC<{
  src: string;
  startFrom?: number;
  scale?: number;
  bars?: number; // frame at which to flash colour bars on the screen
}> = ({ src, startFrom = 0, scale = 1, bars }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 18, mass: 0.7 } });
  const on = interpolate(frame, [4, 10], [0, 1], clamp);
  const W = 1000 * scale;
  const H = 800 * scale;
  const showBars = bars !== undefined && frame >= bars && frame < bars + 6;
  return (
    <Room>
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height * 0.24, background: "linear-gradient(180deg,#3A1418,#1A0A0C)" }} />
      <div
        style={{
          position: "absolute",
          left: (width - W) / 2,
          top: height * 0.5 - H * 0.52,
          width: W,
          height: H,
          transform: `translateY(${(1 - p) * 120}px) scale(${0.92 + 0.08 * p})`,
        }}
      >
        {/* body */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 90 * scale, background: "linear-gradient(160deg,#F6C64A 0%,#E3A321 55%,#B97A12 100%)", boxShadow: `inset -${14 * scale}px -${18 * scale}px 0 rgba(0,0,0,0.18), 0 ${40 * scale}px ${70 * scale}px rgba(0,0,0,0.6)` }} />
        {/* screen bezel + screen */}
        <div style={{ position: "absolute", left: 70 * scale, top: 60 * scale, width: 860 * scale, height: 560 * scale, borderRadius: 70 * scale, background: "#2A2A2A", padding: 24 * scale, boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54 * scale, overflow: "hidden", background: "#000" }}>
            <div style={{ position: "absolute", inset: 0, opacity: on, transform: `scaleY(${0.02 + 0.98 * on})` }}>
              <Footage src={src} startFrom={startFrom} />
            </div>
            {showBars ? (
              <AbsoluteFill style={{ flexDirection: "row" }}>
                {["#C0C0C0", "#C0C000", "#00C0C0", "#00C000", "#C000C0", "#C00000", "#0000C0"].map((c) => (
                  <div key={c} style={{ flex: 1, background: c }} />
                ))}
              </AbsoluteFill>
            ) : null}
            <ScreenFx />
          </div>
        </div>
        {/* knobs + speaker grille */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: (110 + i * 120) * scale, top: 660 * scale, width: 80 * scale, height: 80 * scale, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#FFF4C8,#C98E16)", boxShadow: "0 6px 0 rgba(0,0,0,0.3)" }} />
        ))}
        <div style={{ position: "absolute", left: 420 * scale, top: 670 * scale, width: 470 * scale, height: 60 * scale, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 8px, transparent 8px 18px)", borderRadius: 12 * scale }} />
      </div>
      <Sfx at={4} name="tvon" volume={0.4} />
      {bars !== undefined ? <Sfx at={bars} name="glitch" volume={0.35} /> : null}
    </Room>
  );
};

/** Beige CRT monitor with green text that decodes in (reference: FOCUS). */
export const CrtMonitor: React.FC<{
  big: string;
  small?: string;
  smallAt?: number;
}> = ({ big, small, smallAt = 12 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const zoom = interpolate(frame, [0, 90], [1, 1.08], clamp);
  const W = height > width ? width * 0.9 : Math.min(width * 0.62, 1180);
  const H = W * 0.78;
  return (
    <Room>
      <div style={{ position: "absolute", left: (width - W) / 2, top: (height - H) / 2, width: W, height: H, transform: `scale(${zoom})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: W * 0.05, background: "linear-gradient(160deg,#E6DFCC,#B9B09A)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }} />
        <div style={{ position: "absolute", left: W * 0.07, top: W * 0.06, right: W * 0.07, bottom: W * 0.12, borderRadius: W * 0.04, background: "#06140A", overflow: "hidden", boxShadow: "inset 0 0 60px rgba(0,0,0,0.9)" }}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: W * 0.02 }}>
            <div style={{ fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: W * 0.12, color: ref.crt, letterSpacing: "0.02em", textShadow: `0 0 ${W * 0.02}px ${ref.crt}, 0 0 ${W * 0.05}px ${ref.crt}88` }}>
              {decode(big, frame, 4, 12)}
            </div>
            {small ? (
              <div style={{ fontFamily: mont, fontWeight: 700, fontSize: W * 0.04, color: ref.crt, textAlign: "center", lineHeight: 1.15, whiteSpace: "pre-line", textShadow: `0 0 ${W * 0.012}px ${ref.crt}` }}>
                {decode(small, frame, smallAt, 14)}
              </div>
            ) : null}
          </AbsoluteFill>
          <ScreenFx />
        </div>
      </div>
      <Sfx at={4} name="typewriter" volume={0.35} />
    </Room>
  );
};

/* ------------------------------------------------------------------ */
/* Paper: dossier, polaroids, torn newspaper                             */
/* ------------------------------------------------------------------ */

/** Manila folder that slides in and opens on a document + clipped photo. */
export const Dossier: React.FC<{
  doc: string;
  photo?: string;
  photoIsVideo?: boolean;
  stamp?: string;
  stampAt?: number;
}> = ({ doc, photo, photoIsVideo, stamp, stampAt = 30 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 16, mass: 0.8 } });
  const open = spring({ frame: frame - 10, fps, config: { damping: 14, mass: 0.9 } });
  const st = spring({ frame: frame - stampAt, fps, config: { damping: 8, mass: 0.5 } });
  const W = Math.min(width * 0.72, 1300);
  const H = W * 0.66;
  const push = interpolate(frame, [0, 150], [1, 1.1], clamp);
  return (
    <Room>
      <div style={{ position: "absolute", left: (width - W) / 2, top: (height - H) / 2, width: W, height: H, transform: `translateY(${(1 - inP) * height * 0.6}px) rotate(${-4 + 2 * inP}deg) scale(${push})`, perspective: 1600 }}>
        {/* back of folder */}
        <div style={{ position: "absolute", inset: 0, background: ref.manila, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
        {/* document */}
        <div style={{ position: "absolute", left: W * 0.16, top: H * 0.06, width: W * 0.62, height: H * 0.9, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.3)", overflow: "hidden", transform: `rotate(${1.5 * open}deg)` }}>
          <Img src={staticFile(doc)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "top" }} />
        </div>
        {/* clipped photo */}
        {photo ? (
          <div style={{ position: "absolute", left: W * 0.6, top: H * 0.12, width: W * 0.34, height: W * 0.25, background: "#fff", padding: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.4)", transform: `rotate(${6 * open}deg) translateY(${(1 - open) * -40}px)`, opacity: open }}>
            <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
              {photoIsVideo ? <Footage src={photo} gray /> : <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)" }} />}
            </div>
            <div style={{ position: "absolute", left: "45%", top: -22, width: 26, height: 60, border: "6px solid #9A9A9A", borderRadius: 14 }} />
          </div>
        ) : null}
        {/* front cover swinging open */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg,${ref.manila},#E8C97A)`, borderRadius: 10, transformOrigin: "0% 50%", transform: `rotateY(${-165 * open}deg)`, backfaceVisibility: "hidden", boxShadow: "inset -6px 0 0 rgba(0,0,0,0.1)" }}>
          <div style={{ position: "absolute", right: -2, top: H * 0.08, width: W * 0.18, height: H * 0.08, background: ref.manila, borderRadius: "10px 10px 0 0" }} />
        </div>
        {stamp ? (
          <div style={{ position: "absolute", left: W * 0.2, top: H * 0.62, padding: "10px 26px", border: `7px solid ${ref.red}`, color: ref.red, fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: W * 0.055, letterSpacing: "0.04em", transform: `rotate(-12deg) scale(${2 - st})`, opacity: frame < stampAt ? 0 : 0.92, mixBlendMode: "multiply" }}>
            {stamp}
          </div>
        ) : null}
      </div>
      <Sfx at={0} name="whoosh" volume={0.35} />
      <Sfx at={12} name="swoosh" volume={0.3} />
      {stamp ? <Sfx at={stampAt} name="impact" volume={0.4} /> : null}
    </Room>
  );
};

/** Polaroids taped to a dark wall, dropping in one by one. */
export const PolaroidWall: React.FC<{
  items: { src: string; video?: boolean; at: number; caption?: string }[];
}> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const n = items.length;
  const pw = Math.min(width / (n + 0.6), height * 0.5);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, #3A3530, #16130F)" }}>
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 3px, transparent 3px 60px)" }} />
      {items.map((it, i) => {
        const p = spring({ frame: frame - it.at, fps, config: { damping: 12, mass: 0.6 } });
        const rot = [-6, 4, -3, 7][i % 4];
        const x = width / 2 + (i - (n - 1) / 2) * pw * 1.05 - pw / 2;
        const y = height * 0.18 + (i % 2) * height * 0.06;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: pw, height: pw * 1.18, background: "#F4F1EA", padding: pw * 0.05, paddingBottom: pw * 0.2, boxShadow: "0 18px 40px rgba(0,0,0,0.55)", transform: `translateY(${(1 - p) * -height}px) rotate(${rot * p}deg)`, opacity: frame < it.at ? 0 : 1 }}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#222" }}>
              {it.video ? <Footage src={it.src} /> : <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            {it.caption ? (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: pw * 0.04, textAlign: "center", fontFamily: mont, fontWeight: 800, fontStyle: "italic", fontSize: pw * 0.09, color: ref.ink }}>{it.caption}</div>
            ) : null}
            <div style={{ position: "absolute", left: "35%", top: -pw * 0.05, width: "30%", height: pw * 0.1, background: "rgba(235,225,190,0.85)", transform: "rotate(-3deg)" }} />
            <Sfx at={it.at} name="pop2" volume={0.35} />
          </div>
        );
      })}
      <Vignette strength={0.6} />
      <Grain />
    </AbsoluteFill>
  );
};

const jag = (seed: string, n = 14) => {
  // torn-paper polygon (percent coordinates)
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${random(`${seed}t${i}`) * 5}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - random(`${seed}r${i}`) * 4}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - random(`${seed}b${i}`) * 5}%`);
  for (let i = n; i >= 0; i--) pts.push(`${random(`${seed}l${i}`) * 4}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(",")})`;
};

/** Torn newspaper scraps dropping onto the grid room, stacking up. */
export const TornCollage: React.FC<{
  items: { src: string; at: number; w: number; x: number; y: number; rot: number }[];
  word?: { text: string; at: number; color: string };
}> = ({ items, word }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const push = interpolate(frame, [0, 200], [1, 1.08], clamp);
  return (
    <Room>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
      {items.map((it, i) => {
        const p = spring({ frame: frame - it.at, fps, config: { damping: 13, mass: 0.7 } });
        const w = width * it.w;
        return (
          <div key={i} style={{ position: "absolute", left: width * it.x - w / 2, top: height * it.y, width: w, transform: `translateY(${(1 - p) * height * 0.5}px) rotate(${it.rot + (1 - p) * 25}deg) scale(${1.25 - 0.25 * p})`, opacity: frame < it.at ? 0 : 1, filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.6))" }}>
            <div style={{ clipPath: jag(it.src + i), background: ref.paper, padding: w * 0.03 }}>
              <Img src={staticFile(it.src)} style={{ width: "100%", display: "block", filter: "sepia(0.25) contrast(1.05)" }} />
            </div>
            <Sfx at={it.at} name="swoosh" volume={0.3} />
          </div>
        );
      })}
      </AbsoluteFill>
      {word ? <BigWord text={word.text} at={word.at} color={word.color} top={0.72} /> : null}
    </Room>
  );
};

/* ------------------------------------------------------------------ */
/* Big words, typewriter, height-chart lineup, chart                    */
/* ------------------------------------------------------------------ */

/** Huge glowing word that decodes in (reference: ECOLOGIA / INTERNET). */
export const BigWord: React.FC<{ text: string; at: number; color: string; top?: number; size?: number }> = ({
  text,
  at,
  color,
  top = 0.38,
  size,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Montserrat Black Italic caps are ~0.8 em wide: keep the word inside the frame
  const fs = size ?? Math.min((width * 1.08) / Math.max(text.length, 5), height * 0.22);
  const p = interpolate(frame - at, [0, 10], [0, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: height * top - fs / 2, textAlign: "center", fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: fs, lineHeight: 1, letterSpacing: "-0.01em", color, opacity: frame < at ? 0 : 1, textShadow: `0 0 ${fs * 0.15}px ${color}aa, 0 0 ${fs * 0.4}px ${color}55, 0 ${fs * 0.04}px 0 rgba(0,0,0,0.6)`, transform: `scale(${1.15 - 0.15 * p})` }}>
        {decode(text, frame, at, 10)}
      </div>
      <Sfx at={at} name="glitch" volume={0.3} />
      <Sfx at={at + 9} name="impact" volume={0.35} />
    </>
  );
};

/** Typewriter line on a foggy dark set (reference). */
export const Typewriter: React.FC<{ text: string; cps?: number }> = ({ text, cps = 18 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const n = Math.floor(((frame - 4) / fps) * cps);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, #5A5A5E, #18181A)" }}>
      <Smoke at={-10} dur={1} sound={false} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: '"Courier New", "DejaVu Sans Mono", monospace', fontSize: width * 0.035, color: "#EDEDED", letterSpacing: "0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.6)", maxWidth: width * 0.8, textAlign: "center" }}>
          {text.slice(0, Math.max(0, n))}
          <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>▌</span>
        </div>
      </AbsoluteFill>
      <Vignette />
      <Grain opacity={0.12} />
      <Sfx at={4} name="typewriter" volume={0.45} />
    </AbsoluteFill>
  );
};

/** Height-chart wall with "profiles" sliding in and a red name tag each. */
export const Lineup: React.FC<{
  items: { src: string; at: number; label: string }[];
}> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const n = items.length;
  const slot = width / n;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#CFCFCF,#9C9C9C)" }}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: height * (0.08 + i * 0.075), height: 2, background: "rgba(0,0,0,0.25)" }}>
          <div style={{ position: "absolute", left: 18, top: -16, fontFamily: mont, fontWeight: 700, fontSize: 20, color: "rgba(0,0,0,0.45)" }}>{200 - i * 10}</div>
        </div>
      ))}
      {items.map((it, i) => {
        const p = spring({ frame: frame - it.at, fps, config: { damping: 16, mass: 0.7 } });
        const x = slot * i + slot * 0.08;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: height * 0.14, width: slot * 0.84, height: height * 0.62, overflow: "hidden", opacity: frame < it.at ? 0 : 1, transform: `translateY(${(1 - p) * 60}px)`, boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
            <Footage src={it.src} gray />
            <div style={{ position: "absolute", left: "8%", bottom: "6%", padding: "6px 14px", background: ref.red, color: "#fff", fontFamily: mont, fontWeight: 800, fontStyle: "italic", fontSize: Math.min(slot * 0.075, 34), transform: `scale(${interpolate(frame - it.at - 6, [0, 6], [0, 1], clamp)})`, transformOrigin: "left center" }}>
              {it.label}
            </div>
            <Sfx at={it.at} name="whoosh" volume={0.3} />
            <Sfx at={it.at + 6} name="tick" volume={0.5} />
          </div>
        );
      })}
      <Vignette strength={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};

/** Two curves on the dark grid: oral absorption vs IV at 100%. */
export const BioChart: React.FC<{ ivAt: number; oralAt: number }> = ({ ivAt, oralAt }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const X0 = width * 0.12;
  const X1 = width * 0.88;
  const Y0 = height * 0.22;
  const Y1 = height * 0.8;
  const iv = interpolate(frame, [ivAt, ivAt + 18], [0, 1], clamp);
  const or = interpolate(frame, [oralAt, oralAt + 24], [0, 1], clamp);
  const oralD = `M${X0} ${Y1} C ${X0 + (X1 - X0) * 0.25} ${Y1 - (Y1 - Y0) * 0.25}, ${X0 + (X1 - X0) * 0.5} ${Y1 - (Y1 - Y0) * 0.45}, ${X1} ${Y1 - (Y1 - Y0) * 0.4}`;
  const ivD = `M${X0} ${Y1} L ${X0 + (X1 - X0) * 0.08} ${Y0} L ${X1} ${Y0}`;
  return (
    <Room>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <line x1={X0} y1={Y1} x2={X0} y2={Y0 - 30} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <path d={oralD} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - or} />
        <path d={ivD} fill="none" stroke={ref.yellow} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - iv} style={{ filter: `drop-shadow(0 0 12px ${ref.yellow})` }} />
      </svg>
      <div style={{ position: "absolute", left: X1 - 330, top: Y0 - 90, padding: "8px 18px", background: ref.yellow, color: ref.ink, fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 44, opacity: iv >= 1 ? 1 : 0 }}>IV · 100%</div>
      <div style={{ position: "absolute", left: X1 - 330, top: Y1 - (Y1 - Y0) * 0.4 + 20, padding: "6px 16px", background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: mont, fontWeight: 800, fontStyle: "italic", fontSize: 36, opacity: or >= 1 ? 1 : 0 }}>via orale</div>
      <div style={{ position: "absolute", left: X0, top: Y0 - 80, fontFamily: mont, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>BIODISPONIBILITÀ</div>
      <Sfx at={ivAt} name="riser_short" volume={0.4} />
      <Sfx at={oralAt} name="draw" volume={0.35} />
    </Room>
  );
};

/** A real photo/footage full-frame with slow push, grade and grain (B-roll). */
export const Broll: React.FC<{ src: string; startFrom?: number; gray?: boolean }> = ({ src, startFrom = 0, gray }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 150], [1.04, 1.14], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <Footage src={src} startFrom={startFrom} gray={gray} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25), transparent 30%, transparent 70%, rgba(0,0,0,0.35))" }} />
      <Vignette strength={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};
