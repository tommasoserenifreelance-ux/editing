import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { decode, mont, ref } from "../IvTherapy/fx";

/*
 * Motion graphics specific to the DHEA reel, in the same Pulp/LongevaMed
 * language as the thyroid cards (Montserrat italic, yellow/red on the dark
 * room, decode-in labels).
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Label: React.FC<{ text: string; frame: number; at: number; size: number; color: string }> = ({ text, frame, at, size, color }) => (
  <div style={{ fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: size, color, lineHeight: 1, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
    {decode(text, frame, at, 8)}
  </div>
);

/**
 * "Un mattone di partenza": a DHEA brick drops in, then two arrows branch
 * out to ESTROGENI (left) and ANDROGENI (right) as they are spoken.
 */
export const BrickSplit: React.FC<{ at: number; leftAt: number; rightAt: number; top: number }> = ({ at, leftAt, rightAt, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const drop = spring({ frame: frame - at, fps, config: { damping: 17, mass: 0.8 } });
  const cy = height * top;
  const bw = 520;
  const bh = 230;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const branch = (from: number) => ease(interpolate(frame, [from, from + 10], [0, 1], clamp));
  const pop = (from: number) => spring({ frame: frame - from - 6, fps, config: { damping: 14, mass: 0.6 } });
  const L = branch(leftAt);
  const R = branch(rightAt);
  const chip = (k: number, x: number, text: string, color: string, rot: number, fg: string) =>
    k > 0 ? (
      <div
        style={{
          position: "absolute",
          left: x - 230,
          top: cy + 400,
          width: 460,
          textAlign: "center",
          background: color,
          color: fg,
          fontFamily: mont,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 66,
          padding: "22px 0",
          borderRadius: 18,
          transform: `translateY(${(1 - k) * 40}px) scale(${0.7 + 0.3 * k}) rotate(${rot * k}deg)`,
          opacity: Math.min(1, k * 1.5),
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    ) : null;
  // arrows from the brick bottom to each chip
  const x0 = width / 2;
  const y0 = cy + bh / 2 + 10;
  const xl = width * 0.27;
  const xr = width * 0.73;
  const y1 = cy + 360; // arrow tips stop above the chips
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {[
          { k: L, x: xl },
          { k: R, x: xr },
        ].map(({ k, x }, i) => {
          if (k <= 0) return null;
          const tx = x0 + (x - x0) * k;
          const ty = y0 + (y1 - y0) * k;
          const ang = Math.atan2(y1 - y0, x - x0);
          const head = 34;
          // shaft stops at the base of the head so the tip stays sharp
          const bx = tx - Math.cos(ang) * head * 0.8;
          const by = ty - Math.sin(ang) * head * 0.8;
          return (
            <g key={i}>
              <line x1={x0} y1={y0} x2={bx} y2={by} stroke={ref.yellow} strokeWidth={10} strokeLinecap="round" />
              <polygon
                points={`0,0 ${-head},${-head * 0.55} ${-head},${head * 0.55}`}
                fill={ref.yellow}
                strokeLinejoin="round"
                stroke={ref.yellow}
                strokeWidth={4}
                transform={`translate(${tx} ${ty}) rotate(${(ang * 180) / Math.PI})`}
              />
            </g>
          );
        })}
      </svg>
      {/* the brick */}
      <div
        style={{
          position: "absolute",
          left: x0 - bw / 2,
          top: cy - bh / 2 - (1 - drop) * height * 0.5,
          width: bw,
          height: bh,
          background: `linear-gradient(160deg, #F2D45C, ${ref.yellow} 55%, #C99E00)`,
          borderRadius: 16,
          boxShadow: "inset 0 -14px 0 rgba(0,0,0,0.18), 0 26px 50px rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: frame >= at ? 1 : 0,
        }}
      >
        {/* brick mortar lines */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 6, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ position: "absolute", left: "33%", top: 0, width: 6, height: "50%", background: "rgba(0,0,0,0.12)" }} />
        <div style={{ position: "absolute", left: "66%", top: "50%", width: 6, height: "50%", background: "rgba(0,0,0,0.12)" }} />
        <div style={{ position: "relative", fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 130, color: "#141416", letterSpacing: "-0.02em" }}>DHEA</div>
      </div>
      {chip(pop(leftAt), xl, "ESTROGENI", ref.red, -4, "#fff")}
      {chip(pop(rightAt), xr, "ANDROGENI", "#fff", 4, "#141416")}
      <Sfx at={at + 4} name="impact" volume={0.18} />
      <Sfx at={leftAt} name="pop2" volume={0.2} />
      <Sfx at={rightAt} name="pop3" volume={0.2} />
    </>
  );
};

/**
 * DHEA level falling with age: axes, a curve that draws from the peak at
 * 25 down to 85, the age counter running along with it.
 */
export const Decline: React.FC<{ at: number; top: number; dur?: number }> = ({ at, top, dur = 75 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const W = width * 0.84;
  const H = 620;
  const x0 = (width - W) / 2;
  const y0 = height * top;
  // smooth in-out sweep; nothing (dot, counter) shows before it starts
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: (t) => 0.75 * t + 0.25 * (1 - Math.cos(Math.PI * t)) / 2 });
  const started = frame >= at;
  const ap = interpolate(frame, [at - 6, at], [0, 1], clamp);
  // level vs age (relative to the peak at 25): roughly -2%/year, ~10-20% at 85
  const level = (age: number) => (age <= 25 ? 0.92 + (age - 20) * 0.016 : 1 * Math.exp(-(age - 25) / 30));
  const age = 20 + 65 * p;
  const ages = [...Array.from({ length: 131 }, (_, i) => 20 + i * 0.5).filter((a) => a < age), age];
  const X = (age: number) => x0 + ((age - 20) / 65) * W;
  const Y = (v: number) => y0 + H - v * H * 0.9;
  const shown = started ? ages : [];
  const d = shown.map((a, i) => `${i ? "L" : "M"}${X(a).toFixed(1)} ${Y(level(a)).toFixed(1)}`).join(" ");
  const last = age;
  const area = shown.length > 1 ? `${d} L${X(last)} ${y0 + H} L${X(20)} ${y0 + H} Z` : "";
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, opacity: ap }}>
        <defs>
          <linearGradient id="dheaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ref.yellow} stopOpacity={0.35} />
            <stop offset="1" stopColor={ref.yellow} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={x0} x2={x0 + W} y1={y0 + H * g} y2={y0 + H * g} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        ))}
        <line x1={x0} y1={y0} x2={x0} y2={y0 + H} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
        <line x1={x0} y1={y0 + H} x2={x0 + W} y2={y0 + H} stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
        {area ? <path d={area} fill="url(#dheaFill)" /> : null}
        {d ? <path d={d} fill="none" stroke={last > 40 ? ref.red : ref.yellow} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {shown.length ? <circle cx={X(last)} cy={Y(level(last))} r={18} fill="#fff" /> : null}
        {[25, 45, 65, 85].map((a) => (
          <text key={a} x={X(a)} y={y0 + H + 62} fill="rgba(255,255,255,0.8)" fontFamily={mont} fontWeight={700} fontSize={40} textAnchor="middle">
            {a}
          </text>
        ))}
        <text x={x0 + 14} y={y0 - 20} fill={ref.yellow} fontFamily={mont} fontWeight={900} fontStyle="italic" fontSize={48}>
          DHEA
        </text>
      </svg>
      {/* age counter riding the curve */}
      {shown.length ? (
        <div
          style={{
            position: "absolute",
            left: Math.min(X(last) + 34, x0 + W - 230),
            top: Y(level(last)) - 96,
            opacity: interpolate(frame, [at + 2, at + 7], [0, 1], clamp),
            fontFamily: mont,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 64,
            color: "#fff",
            textShadow: "0 4px 14px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {Math.round(last)} anni
        </div>
      ) : null}
      <Sfx at={at} name="whoosh_down" volume={0.16} />
      <Sfx at={at + 6} name="counter" volume={0.12} />
    </>
  );
};

/** Crosshair locking onto a point: "usi mirati e localizzati". */
export const Target: React.FC<{ at: number; top: number; size?: number }> = ({ at, top, size = 520 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.8 } });
  const lock = interpolate(frame, [at + 14, at + 20], [0, 1], clamp);
  const cx = width / 2;
  const cy = height * top;
  const off = (1 - s) * 220;
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="-100 -100 200 200"
        style={{ position: "absolute", left: cx - size / 2 + off, top: cy - size / 2 - off * 0.6, opacity: interpolate(frame, [at, at + 5], [0, 1], clamp), transform: `rotate(${(1 - s) * 90}deg) scale(${1.4 - 0.4 * s})` }}
      >
        {[88, 60, 32].map((r, i) => (
          <circle key={r} r={r} fill="none" stroke={i === 2 ? ref.red : "#fff"} strokeWidth={i === 2 ? 6 : 4} opacity={i === 2 ? 1 : 0.7} />
        ))}
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={0} y1={-98} x2={0} y2={-70} stroke={ref.yellow} strokeWidth={6} transform={`rotate(${a})`} />
        ))}
        <circle r={10 + 6 * lock} fill={ref.red} />
      </svg>
      <Sfx at={at} name="swoosh" volume={0.14} />
      <Sfx at={at + 16} name="pop1" volume={0.2} />
    </>
  );
};

/** "≠" sign stamped between two words. */
export const NotEqual: React.FC<{ at: number; top: number; left: string; right: string; leftAt: number }> = ({ at, top, left, right, leftAt }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 0, width, top: height * top, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Label text={left} frame={frame} at={leftAt} size={104} color="#fff" />
      <div
        style={{
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 220,
          lineHeight: 0.9,
          color: "#141416",
          opacity: frame >= at ? 1 : 0,
          transform: `scale(${2 - s}) rotate(${(1 - s) * -20}deg)`,
        }}
      >
        ≠
      </div>
      {frame >= at ? <Label text={right} frame={frame} at={at} size={150} color="#141416" /> : null}
      <Sfx at={at} name="impact" volume={0.2} />
    </div>
  );
};

/**
 * Female silhouette with the two adrenal glands lighting up (no organs
 * shown). Dynamic: the figure springs in while its outline draws, a scan
 * line sweeps down, then the two glands pop with shock-wave rings and the
 * camera punches in on them.
 */
export const Adrenals: React.FC<{ at: number; top: number; male?: boolean }> = ({ at, top, male = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const draw = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  // scan passes repeat until the glands light up
  const scan = frame >= 6 && frame < at ? ((frame - 6) % 30) / 30 : 0;
  const on = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.5 } });
  const punch = spring({ frame: frame - at, fps, config: { damping: 16, mass: 0.9 } });
  const drift = interpolate(frame, [at, at + 90], [0, 0.06], clamp);
  const zoom = (0.85 + 0.15 * enter) * (1 + 0.22 * punch + drift);
  const shake = frame >= at && frame < at + 6 ? Math.sin((frame - at) * 2.6) * (6 - (frame - at)) * 2 : 0;
  const size = 1250;
  const GY = 168; // adrenal height in the 200x400 figure box: upper abdomen, above the waist
  const hairF = "M76 44 Q72 8 100 8 Q128 8 124 44 Q126 60 132 72 Q118 74 111 63 L89 63 Q82 74 68 72 Q74 60 76 44 Z";
  const bodyF =
    "M92 70 L108 70 L111 80 Q130 82 140 92 Q148 100 148 112 L156 200 Q158 214 150 216 Q142 218 140 206 L132 126 " +
    "Q128 152 126 176 Q122 194 124 204 Q140 228 142 256 L130 392 Q129 400 118 400 Q108 400 108 390 L103 282 L97 282 " +
    "L92 390 Q92 400 82 400 Q71 400 70 392 L58 256 Q60 228 76 204 Q78 194 74 176 Q72 152 68 126 L60 206 Q58 218 50 216 " +
    "Q42 214 44 200 L52 112 Q52 100 60 92 Q70 82 89 80 Z";
  // male: short hair, broader shoulders, straight waist
  const hairM = "M78 34 Q80 12 100 12 Q120 12 122 34 Q112 24 100 24 Q88 24 78 34 Z";
  const bodyM =
    "M92 70 L108 70 L112 78 Q136 80 150 92 Q160 100 160 114 L168 210 Q170 222 162 224 Q154 226 152 214 L142 128 L138 132 " +
    "L140 232 Q142 250 136 260 L130 392 Q129 400 118 400 Q108 400 108 390 L103 274 L97 274 L92 390 Q92 400 82 400 Q71 400 70 392 " +
    "L64 260 Q58 250 60 232 L62 132 L58 128 L48 214 Q46 226 38 224 Q30 222 32 210 L40 114 Q40 100 50 92 Q64 80 88 78 Z";
  const hair = male ? hairM : hairF;
  const body = male ? bodyM : bodyF;
  const len = 2600;
  const sy = 10 + scan * 390;
  const rings = [0, 12, 24, 36].map((d) => {
    const k = (frame - at - d) / 22;
    return k > 0 && k < 1 ? k : null;
  });
  const gland = (x: number) => (
    <g key={x}>
      {rings.map((k, i) =>
        k === null ? null : <circle key={i} cx={x} cy={GY} r={6 + 26 * k} fill="none" stroke={ref.yellow} strokeWidth={1.4 * (1 - k)} opacity={1 - k} />,
      )}
      <circle cx={x} cy={GY} r={13 * on} fill={ref.yellow} opacity={0.22} />
      <circle cx={x} cy={GY} r={5.5 * on} fill={ref.yellow} filter="url(#adrGlow)" />
      <circle cx={x} cy={GY} r={4 * on} fill="#fff7cc" />
    </g>
  );
  return (
    <>
      <svg
        width={size / 2}
        height={size}
        viewBox="0 0 200 400"
        style={{
          position: "absolute",
          left: width / 2 - size / 4 + shake,
          top: height * top - size / 2 + (1 - enter) * 260,
          opacity: interpolate(frame, [0, 4], [0, 1], clamp),
          transform: `scale(${zoom}) rotate(${(1 - enter) * -6}deg)`,
          transformOrigin: `50% ${(GY / 400) * 100}%`,
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="adrGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <linearGradient id="adrScan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ref.yellow} stopOpacity={0} />
            <stop offset="1" stopColor={ref.yellow} stopOpacity={0.35} />
          </linearGradient>
          <clipPath id="adrClip">
            <path d={body} />
            <path d={hair} />
            <circle cx={100} cy={38} r={24} />
          </clipPath>
        </defs>
        <path d={hair} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <circle cx={100} cy={38} r={22} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <path d={body} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.6} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
        <line x1={100} y1={84} x2={100} y2={250} stroke="rgba(255,255,255,0.18)" strokeWidth={1.1} strokeDasharray="3 4" opacity={draw} />
        {/* scan sweep inside the figure */}
        {scan > 0 && scan < 1 ? (
          <g clipPath="url(#adrClip)">
            <rect x={0} y={sy - 40} width={200} height={40} fill="url(#adrScan)" />
            <line x1={0} x2={200} y1={sy} y2={sy} stroke={ref.yellow} strokeWidth={1.6} />
          </g>
        ) : null}
        {frame >= at ? [gland(91), gland(109)] : null}
      </svg>
      <Sfx at={0} name="whoosh" volume={0.14} />
      <Sfx at={6} name="riser_short" volume={0.1} />
      <Sfx at={at} name="impact" volume={0.2} />
      <Sfx at={at + 1} name="pop2" volume={0.18} />
    </>
  );
};
