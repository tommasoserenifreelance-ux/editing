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
  const drop = spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.7 } });
  const cy = height * top;
  const bw = 520;
  const bh = 230;
  const branch = (from: number) => interpolate(frame, [from, from + 8], [0, 1], clamp);
  const L = branch(leftAt);
  const R = branch(rightAt);
  const chip = (k: number, x: number, text: string, color: string, rot: number, fg: string) =>
    k > 0 ? (
      <div
        style={{
          position: "absolute",
          left: x - 230,
          top: cy + 330,
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
          transform: `scale(${0.6 + 0.4 * k}) rotate(${rot}deg)`,
          opacity: k,
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
  const y1 = cy + 320;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        {[
          { k: L, x: xl },
          { k: R, x: xr },
        ].map(({ k, x }, i) =>
          k > 0 ? (
            <g key={i}>
              <line x1={x0} y1={y0} x2={x0 + (x - x0) * k} y2={y0 + (y1 - y0) * k} stroke={ref.yellow} strokeWidth={10} strokeLinecap="round" />
              {k > 0.95 ? (
                <polygon
                  points="-24,-6 24,-6 0,26"
                  fill={ref.yellow}
                  transform={`translate(${x} ${y1 - 14}) rotate(${(Math.atan2(y1 - y0, x - x0) * 180) / Math.PI - 90})`}
                />
              ) : null}
            </g>
          ) : null,
        )}
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
      {chip(L, xl, "ESTROGENI", ref.red, -4, "#fff")}
      {chip(R, xr, "ANDROGENI", "#fff", 4, "#141416")}
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
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const ap = interpolate(frame, [at - 6, at], [0, 1], clamp);
  // level vs age (relative to the peak at 25): roughly -2%/year, ~10-20% at 85
  const level = (age: number) => (age <= 25 ? 0.92 + (age - 20) * 0.016 : 1 * Math.exp(-(age - 25) / 30));
  const ages = Array.from({ length: 66 }, (_, i) => 20 + i);
  const X = (age: number) => x0 + ((age - 20) / 65) * W;
  const Y = (v: number) => y0 + H - v * H * 0.9;
  const shown = ages.filter((a) => (a - 20) / 65 <= p);
  const d = shown.map((a, i) => `${i ? "L" : "M"}${X(a).toFixed(1)} ${Y(level(a)).toFixed(1)}`).join(" ");
  const last = shown[shown.length - 1] ?? 20;
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
            left: Math.min(X(last) - 90, x0 + W - 220),
            top: Y(level(last)) - 130,
            fontFamily: mont,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 64,
            color: "#fff",
            textShadow: "0 4px 14px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {last} anni
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
 * Body silhouette with the two adrenal glands lighting up (no organs
 * shown): outline figure on the dark room, the camera pushes in towards two
 * glowing yellow points above the waist, either side of the spine.
 */
export const Adrenals: React.FC<{ at: number; top: number }> = ({ at, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const draw = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const on = spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.6 } });
  const pulse = frame >= at ? 0.5 + 0.5 * Math.sin(((frame - at) / fps) * Math.PI * 2.2) : 0;
  const push = interpolate(frame, [at, at + 70], [1, 1.12], { ...clamp, easing: (t) => t * (2 - t) });
  const size = 1250;
  // figure in a 200x400 box; adrenals near (90,192) and (110,192), just above the waist
  const body =
    "M100 8 a26 26 0 1 1 -0.1 0 Z " +
    "M74 78 Q100 70 126 78 L150 92 Q160 98 162 112 L172 210 Q174 222 166 224 Q158 226 156 214 L146 128 L140 132 L144 230 Q146 250 140 260 L134 392 Q133 400 122 400 Q112 400 112 390 L104 270 L96 270 L88 390 Q88 400 78 400 Q67 400 66 392 L60 260 Q54 250 56 230 L60 132 L54 128 L44 214 Q42 226 34 224 Q26 222 28 210 L38 112 Q40 98 50 92 Z";
  const len = 2600;
  const dot = (x: number) => (
    <g>
      <circle cx={x} cy={192} r={11 + 4 * pulse} fill={ref.yellow} opacity={0.18 * on} />
      <circle cx={x} cy={192} r={6 + 1.5 * pulse} fill={ref.yellow} opacity={0.4 * on} />
    </g>
  );
  return (
    <>
      <svg
        width={size / 2}
        height={size}
        viewBox="0 0 200 400"
        style={{ position: "absolute", left: width / 2 - size / 4, top: height * top - size / 2, transform: `scale(${push})`, transformOrigin: "50% 48%", overflow: "visible" }}
      >
        <defs>
          <filter id="adrGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <path d={body} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.85)" strokeWidth={1.6} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinejoin="round" />
        {/* spine hint */}
        <line x1={100} y1={86} x2={100} y2={250} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} strokeDasharray="3 4" opacity={draw} />
        <g filter="url(#adrGlow)" opacity={on}>
          <circle cx={90} cy={192} r={5} fill={ref.yellow} />
          <circle cx={110} cy={192} r={5} fill={ref.yellow} />
        </g>
        {dot(90)}
        {dot(110)}
      </svg>
      <Sfx at={2} name="draw" volume={0.14} />
      <Sfx at={at} name="pop2" volume={0.2} />
    </>
  );
};
