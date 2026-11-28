import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Easing,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { DISPLAY, FPS, H, INK, LIME, RED, SANS, W } from "./brand";
import { CaptionGroup, Flash, HookLine, ReelConfig, Sticker } from "./config";

export { AGHI, CORTISOLO } from "./config";

const sec = (s: number) => Math.round(s * FPS);
export const reelDuration = (c: ReelConfig) => c.videoFrames + sec(c.tail);

// ---------------------------------------------------------------- fonts
const FONTS: [string, string, string][] = [
  ["GaiAnton", "gai/fonts/anton-latin-400-normal.woff2", "400"],
  ["GaiInter", "gai/fonts/inter-tight-latin-300-normal.woff2", "300"],
  ["GaiInter", "gai/fonts/inter-tight-latin-800-normal.woff2", "800"],
  ["GaiInter", "gai/fonts/inter-tight-latin-900-normal.woff2", "900"],
];
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const f = new FontFace(family, `url(${staticFile(file)})`, { weight });
        document.fonts.add(f);
        return f.load();
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};

const inAny = (f: number, ws: [number, number][]) => ws.some(([a, b]) => f >= a && f < b);

// Bold white type with a dark outline: readable on any shot.
const outline = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${INK}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${px * 0.6}px ${px * 1.6}px rgba(0,0,0,.45)`,
});

// ---------------------------------------------------------------- zoom
const DRIFT = 0.02;
const zoomAt = (c: ReelConfig, frame: number) => {
  const close = inAny(frame, c.closeups);
  const cap = (v: number) => (close ? Math.min(v, 1.05) : v);
  let i = 0;
  while (i + 1 < c.zooms.length && c.zooms[i + 1].f <= frame) i++;
  const z = c.zooms[i];
  const f1 = i + 1 < c.zooms.length ? c.zooms[i + 1].f : reelDuration(c);
  const drift = interpolate(frame, [z.f, f1], [0, DRIFT], { extrapolateRight: "clamp" });
  let scale = cap(z.s) + drift;
  if (!z.instant && i > 0) {
    // quick punch (3 frames) from where the previous framing ended
    const p = c.zooms[i - 1];
    const from = cap(p.s) + DRIFT;
    scale = interpolate(frame - z.f, [0, 3], [from, cap(z.s)], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }) + drift;
  }
  // flashes punch in a bit more
  const t = frame / FPS;
  const fl = c.flashes.find((x) => t >= x.from && t < x.to);
  const flashBoost = fl ? interpolate(t - fl.from, [0, 0.08], [0, 0.08], { extrapolateRight: "clamp" }) : 0;
  return { scale: scale + flashBoost, originY: close ? 0 : 30 };
};

// ---------------------------------------------------------------- captions
const Captions: React.FC<{ c: ReelConfig; t: number }> = ({ c, t }) => {
  const hidden =
    (c.hook.hideCaptions && t < c.hook.to) ||
    c.flashes.some((f) => t >= f.from - 0.02 && t < f.to) ||
    t >= c.slogan.a;
  if (hidden) return null;
  const LEAD = 2 / FPS;
  const g: CaptionGroup | undefined = c.captions.find((x) => t + LEAD >= x.start && t + LEAD < x.end);
  if (!g) return null;
  const local = (t + LEAD - g.start) * FPS;
  const pop = spring({ frame: local, fps: FPS, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: c.captionY * H,
        transform: `translateY(-50%) scale(${0.82 + 0.18 * pop})`,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: 76,
        lineHeight: 1.05,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
      }}
    >
      {g.words.map((w, i) => {
        const on = t + LEAD >= w.t;
        const color = w.style === "lime" ? LIME : w.style === "red" ? RED : "#fff";
        return (
          <span key={i} style={{ color, opacity: on ? 1 : 0.0, ...outline(14) }}>
            {w.text}
            {i < g.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const Hook: React.FC<{ c: ReelConfig; t: number }> = ({ c, t }) => {
  const { from, to, y, lines } = c.hook;
  if (t < from || t >= to) return null;
  const f = (t - from) * FPS;
  const out = interpolate(t, [to - 0.18, to], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: y * H,
        transform: "translateY(-50%)",
        textAlign: "center",
        opacity: out,
      }}
    >
      {lines.map((l: HookLine, i) => {
        const s = spring({ frame: f - i * 3, fps: FPS, config: { damping: 11, stiffness: 220, mass: 0.7 } });
        const wob = l.kind === "big" ? Math.sin((f + i * 7) / 9) * 0.6 : 0;
        return (
          <div
            key={i}
            style={{
              transform: `scale(${s}) rotate(${(i % 2 ? 1.5 : -1.5) + wob}deg)`,
              fontFamily: l.kind === "big" ? DISPLAY : SANS,
              fontWeight: l.kind === "big" ? 400 : 300,
              fontSize: l.kind === "big" ? 150 : 58,
              lineHeight: l.kind === "big" ? 0.98 : 1.2,
              color: l.color === "lime" ? LIME : "#fff",
              textTransform: l.kind === "big" ? "uppercase" : "none",
              marginBottom: l.kind === "small" ? 6 : 0,
              ...outline(l.kind === "big" ? 18 : 9),
            }}
          >
            {l.text}
            {l.dot ? <span style={{ color: RED }}>.</span> : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- flash (B/W + speed lines, numbered chapter)
const SpeedLines: React.FC<{ seed: number }> = ({ seed }) => {
  const rays = Array.from({ length: 64 }, (_, i) => {
    const r = Math.sin(i * 91.7 + seed * 13.1) * 0.5 + 0.5;
    const a = (i / 64) * Math.PI * 2 + r * 0.08;
    const inner = 520 + r * 260;
    const w = 0.012 + r * 0.02;
    const p = (ang: number, d: number) => `${W / 2 + Math.cos(ang) * d},${H * 0.5 + Math.sin(ang) * d}`;
    return <polygon key={i} points={`${p(a - w, 1800)} ${p(a + w, 1800)} ${p(a, inner)}`} fill="#fff" opacity={0.55 + r * 0.4} />;
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {rays}
    </svg>
  );
};

const FlashTitle: React.FC<{ fl: Flash; t: number; y: number }> = ({ fl, t, y }) => {
  const f = (t - fl.from) * FPS;
  const s = spring({ frame: f, fps: FPS, config: { damping: 10, stiffness: 240, mass: 0.7 } });
  const out = interpolate(t, [fl.to - 0.12, fl.to], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: y * H,
        transform: `translateY(-50%) scale(${s}) rotate(-3deg)`,
        textAlign: "center",
        opacity: out,
      }}
    >
      {fl.num ? (
        <div
          style={{
            display: "inline-block",
            background: LIME,
            color: INK,
            fontFamily: DISPLAY,
            fontSize: 96,
            lineHeight: 1,
            padding: "8px 30px 4px",
            borderRadius: 26,
            marginBottom: 14,
            boxShadow: "0 14px 30px rgba(0,0,0,.35)",
          }}
        >
          {fl.num}
        </div>
      ) : null}
      {fl.title.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: DISPLAY,
            fontSize: fl.title.length > 1 ? 180 : 150,
            lineHeight: 0.95,
            color: i === fl.title.length - 1 ? LIME : "#fff",
            ...outline(20),
          }}
        >
          {line}
          {i === fl.title.length - 1 ? <span style={{ color: RED }}>.</span> : null}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- stickers
const stickerOutline =
  "drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 18px 24px rgba(0,0,0,.4))";

const StickerView: React.FC<{ s: Sticker; t: number; y: number }> = ({ s, t, y }) => {
  if (t < s.from || t >= s.to) return null;
  const f = (t - s.from) * FPS;
  const inS = spring({ frame: f, fps: FPS, config: { damping: 11, stiffness: 260, mass: 0.6 } });
  const outS = interpolate(t, [s.to - 0.1, s.to], [1, 0], { extrapolateLeft: "clamp" });
  const rot = "rot" in s && s.rot ? s.rot : 0;
  const base: React.CSSProperties = {
    position: "absolute",
    left: W / 2,
    top: y * H,
    transform: `translate(-50%,-50%) scale(${inS * outS}) rotate(${rot + (1 - inS) * -12}deg)`,
  };
  let body: React.ReactNode = null;
  if (s.kind === "img") {
    body = <Img src={staticFile(s.src)} style={{ width: s.w, maxHeight: 340, objectFit: "contain", filter: stickerOutline }} />;
  } else if (s.kind === "photo") {
    body = (
      <Img
        src={staticFile(s.src)}
        style={{ width: s.w, borderRadius: 30, border: "10px solid #fff", boxShadow: "0 18px 30px rgba(0,0,0,.4)", display: "block" }}
      />
    );
  } else {
    body = (
      <div
        style={{
          background: INK,
          borderRadius: 30,
          padding: "22px 40px 26px",
          textAlign: "center",
          border: "6px solid #fff",
          boxShadow: "0 18px 30px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontSize: 118, lineHeight: 0.95, color: "#fff" }}>
          <span style={{ color: LIME }}>{s.big.split(" ").slice(0, 2).join(" ")}</span>
          <br />
          {s.big.split(" ").slice(2).join(" ")}
          <span style={{ color: RED }}>.</span>
        </div>
      </div>
    );
  }
  let x: React.ReactNode = null;
  if (s.kind === "img" && s.xAt !== undefined && t >= s.xAt) {
    const xf = (t - s.xAt) * FPS;
    const xs = spring({ frame: xf, fps: FPS, config: { damping: 9, stiffness: 320, mass: 0.5 } });
    x = (
      <Img
        src={staticFile("gai/img/x.png")}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 360,
          transform: `translate(-50%,-50%) scale(${2 - xs}) rotate(${(1 - xs) * 20}deg)`,
          opacity: Math.min(1, xf / 2),
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,.45))",
        }}
      />
    );
  }
  // little shake when the X lands
  const shake = s.kind === "img" && s.xAt !== undefined && t >= s.xAt && t < s.xAt + 0.25 ? Math.sin(t * 90) * 10 : 0;
  return (
    <div style={{ ...base, marginLeft: shake }}>
      <div style={{ position: "relative" }}>
        {body}
        {x}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- slogan
const Slogan: React.FC<{ c: ReelConfig; t: number }> = ({ c, t }) => {
  if (t < c.slogan.a) return null;
  const fa = (t - c.slogan.a) * FPS;
  const fb = (t - c.slogan.b) * FPS;
  const sa = spring({ frame: fa, fps: FPS, config: { damping: 14, stiffness: 200 } });
  const sb = spring({ frame: fb, fps: FPS, config: { damping: 14, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: c.slogan.y * H,
        transform: `translateY(-50%) scale(${0.9 + 0.1 * sa})`,
        textAlign: "center",
        opacity: sa,
        color: "#fff",
        fontFamily: SANS,
        // no box: a soft dark halo keeps the type readable on the footage
        textShadow: "0 3px 14px rgba(0,0,0,.85), 0 0 5px rgba(0,0,0,.7), 0 0 2px rgba(0,0,0,.9)",
      }}
    >
      <div style={{ fontWeight: 300, fontSize: 58, lineHeight: 1 }}>Noi siamo</div>
      <div style={{ fontWeight: 800, fontSize: 88, lineHeight: 1.02, letterSpacing: "-0.035em", marginTop: 6, ...outline(8) }}>
        GLIALTRINFERMIERI<span style={{ color: RED }}>.</span>
      </div>
      <div style={{ opacity: t >= c.slogan.b ? sb : 0, transform: `translateY(${(1 - sb) * 20}px)`, marginTop: 22 }}>
        <div style={{ fontWeight: 300, fontSize: 50, lineHeight: 1.15 }}>Vi spieghiamo quello che</div>
        <div style={{ fontWeight: 800, fontSize: 56, lineHeight: 1.15, letterSpacing: "-0.02em", ...outline(7) }}>
          <span style={{ color: LIME }}>gli altri</span> non vi spiegano<span style={{ color: RED }}>.</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- sound effects
// Swoosh peaks 0.35 s after it starts, so it is started early to peak on the visual change.
const SWOOSH_PEAK = 0.35;
const Sfx: React.FC<{ c: ReelConfig }> = ({ c }) => {
  // at = moment the sound must land on
  const cues: { at: number; src: string; lead: number; v: number }[] = [];
  const swoosh = (at: number, v: number) => cues.push({ at, src: "swoosh_u", lead: SWOOSH_PEAK, v });
  swoosh(c.hook.from + SWOOSH_PEAK, 0.8);
  for (const s of c.stickers) {
    cues.push({ at: s.from, src: "pop_u", lead: 0.02, v: 1 });
    if (s.kind === "img" && s.xAt !== undefined) cues.push({ at: s.xAt, src: "wrong", lead: 0.05, v: 0.7 });
  }
  for (const f of c.flashes) swoosh(f.from, 0.9);
  // a swoosh on every zoom, unless another effect already lands there
  for (const z of c.zooms) {
    const at = z.f / FPS;
    if (at < 0.5) continue;
    if (cues.some((q) => Math.abs(q.at - at) < 0.3)) continue;
    swoosh(at, 0.7);
  }
  return (
    <>
      {cues.map((q, i) => (
        <Sequence key={i} from={Math.max(0, sec(q.at - q.lead))} durationInFrames={sec(1.2)} layout="none">
          <Audio src={staticFile(`gai/sfx/${q.src}.wav`)} volume={q.v} />
        </Sequence>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- reel
export const GaiReel: React.FC<{ config: ReelConfig }> = ({ config: c }) => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const z = zoomAt(c, frame);
  const flash = c.flashes.find((f) => t >= f.from && t < f.to);
  const lastFrame = c.videoFrames - 1;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill
        style={{
          transform: `scale(${z.scale})`,
          transformOrigin: `50% ${z.originY}%`,
          filter: flash ? "grayscale(1) contrast(1.25) brightness(1.05)" : undefined,
        }}
      >
        <Sequence durationInFrames={lastFrame} layout="none">
          <OffthreadVideo src={staticFile(c.video)} style={{ width: W, height: H, objectFit: "cover" }} />
        </Sequence>
        <Sequence from={lastFrame} layout="none">
          <Freeze frame={lastFrame - 1}>
            <OffthreadVideo src={staticFile(c.video)} muted style={{ width: W, height: H, objectFit: "cover" }} />
          </Freeze>
        </Sequence>
      </AbsoluteFill>
      {flash ? <SpeedLines seed={Math.floor(frame / 2)} /> : null}
      {c.stickers.map((s, i) => (
        <StickerView key={i} s={s} t={t} y={c.stickerY} />
      ))}
      <Hook c={c} t={t} />
      {flash ? <FlashTitle fl={flash} t={t} y={c.stickerY + 0.02} /> : null}
      <Captions c={c} t={t} />
      <Slogan c={c} t={t} />
      <Sfx c={c} />
    </AbsoluteFill>
  );
};
