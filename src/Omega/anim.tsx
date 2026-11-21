import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { mont } from "../IvTherapy/fx";
import { C, clamp } from "./ui";

/*
 * Animated graphics for the omega 3 reel (all drawn, no stock).
 */

/** Fuel gauge whose needle falls from F to E: "biologicamente a secco". */
export const FuelGauge: React.FC<{ at: number; top: number; size?: number }> = ({ at, top, size = 640 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ap = spring({ frame: frame - 2, fps, config: { damping: 16 } });
  // needle: starts on F (right, +60deg), wobbles down to E (-60deg) at `at`
  const drop = spring({ frame: frame - at, fps, config: { damping: 7, mass: 0.9, stiffness: 90 } });
  const ang = 60 - 122 * drop;
  const blink = frame > at + 10 ? (Math.floor((frame - at) / 7) % 2 === 0 ? 1 : 0.35) : 0;
  return (
    <>
      <svg width={size} height={size * 0.72} viewBox="-110 -100 220 158" style={{ position: "absolute", left: width / 2 - size / 2, top: height * top, opacity: ap, transform: `scale(${0.85 + 0.15 * ap})` }}>
        <path d="M-90 30 A95 95 0 0 1 90 30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={16} strokeLinecap="round" />
        <path d="M-90 30 A95 95 0 0 1 -55 -50" fill="none" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
        <path d="M55 -50 A95 95 0 0 1 90 30" fill="none" stroke={C.green} strokeWidth={16} strokeLinecap="round" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={0} y1={-72} x2={0} y2={-62} stroke="#fff" strokeWidth={3} transform={`rotate(${-60 + i * 15})`} />
        ))}
        <text x={-78} y={52} fill={C.red} fontFamily={mont} fontWeight={900} fontSize={26} textAnchor="middle" opacity={0.6 + 0.4 * blink}>
          E
        </text>
        <text x={78} y={52} fill={C.green} fontFamily={mont} fontWeight={900} fontSize={26} textAnchor="middle">
          F
        </text>
        <g transform={`rotate(${ang})`}>
          <polygon points="-5,0 5,0 1.5,-80 -1.5,-80" fill={C.yellow} />
        </g>
        <circle r={12} fill="#fff" />
        <circle r={5} fill={C.navy} />
        {/* capsule icon in the middle */}
        <g transform="translate(0 -28) rotate(-30)">
          <rect x={-16} y={-7} width={32} height={14} rx={7} fill={C.yellow} opacity={0.9} />
        </g>
      </svg>
      <Sfx at={at} name="whoosh_down" volume={0.18} />
      <Sfx at={at + 12} name="tick" volume={0.15} />
    </>
  );
};

/** Flickering flames put out by white foam bursts: "estintori dell'incendio". */
export const Fire: React.FC<{ at: number; outAt: number; top: number; size?: number }> = ({ at, outAt, top, size = 760 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const grow = spring({ frame: frame - at, fps, config: { damping: 14 } });
  const out = interpolate(frame, [outAt, outAt + 18], [1, 0], clamp);
  const flame = (i: number, x: number, h: number, col: string) => {
    const f = Math.sin(frame * 0.5 + i * 1.7) * 0.08 + Math.sin(frame * 0.83 + i) * 0.05;
    const hh = h * (1 + f) * grow * out;
    return (
      <path
        key={`${i}${col}`}
        d={`M${x - 26} 0 Q${x - 34} ${-hh * 0.45} ${x + f * 40} ${-hh} Q${x + 34} ${-hh * 0.45} ${x + 26} 0 Z`}
        fill={col}
        opacity={0.95}
      />
    );
  };
  const puffs = Array.from({ length: 9 }).map((_, i) => {
    const t0 = outAt + i * 2;
    const k = interpolate(frame, [t0, t0 + 14], [0, 1], clamp);
    if (k <= 0) return null;
    const ang = -150 + i * 15;
    const r = 30 + 90 * k;
    return <circle key={i} cx={Math.cos((ang * Math.PI) / 180) * r * 0.9} cy={-50 + Math.sin((ang * Math.PI) / 180) * r * 0.6} r={18 + 26 * k} fill="#fff" opacity={0.9 * (1 - k * 0.6)} />;
  });
  return (
    <>
      <svg width={size} height={size * 0.8} viewBox="-150 -230 300 240" style={{ position: "absolute", left: width / 2 - size / 2, top: height * top }}>
        <ellipse cx={0} cy={4} rx={120} ry={10} fill="rgba(232,52,63,0.25)" opacity={out} />
        {[-70, -35, 0, 35, 70].map((x, i) => flame(i, x, [90, 150, 200, 140, 95][i], C.red))}
        {[-50, -15, 18, 52].map((x, i) => flame(i + 9, x, [70, 120, 130, 80][i], "#FF8A00"))}
        {[-20, 15].map((x, i) => flame(i + 20, x, [70, 80][i], C.yellow))}
        {puffs}
      </svg>
      <Sfx at={at} name="riser_short" volume={0.12} />
      <Sfx at={outAt} name="smoke" volume={0.2} />
    </>
  );
};

/** Omega-3 index gauge: bar 0-12 % with red/yellow/green zones, marker sweeps to the 8 % target. */
export const IndexGauge: React.FC<{ at: number; top: number; target?: number }> = ({ at, top, target = 8 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const W = width * 0.84;
  const x0 = (width - W) / 2;
  const y = height * top;
  const ap = interpolate(frame, [at - 6, at + 4], [0, 1], clamp);
  const sweep = interpolate(frame, [at + 4, at + 40], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  // marker goes 2 % -> 4 % (red) and settles on the target
  const val = 2 + (target - 2) * sweep;
  const X = (v: number) => x0 + (v / 12) * W;
  const col = val < 4 ? C.red : val < 8 ? C.yellow : C.green;
  return (
    <div style={{ opacity: ap }}>
      <svg width={width} height={360} style={{ position: "absolute", left: 0, top: y }}>
        <rect x={X(0)} y={120} width={X(4) - X(0)} height={44} fill={C.red} rx={10} />
        <rect x={X(4)} y={120} width={X(8) - X(4)} height={44} fill={C.yellow} />
        <rect x={X(8)} y={120} width={X(12) - X(8)} height={44} fill={C.green} rx={10} />
        {[0, 4, 8, 12].map((v) => (
          <text key={v} x={X(v)} y={212} fill="rgba(255,255,255,0.85)" fontFamily={mont} fontWeight={800} fontSize={38} textAnchor="middle">
            {v}%
          </text>
        ))}
        <polygon points={`${X(val) - 24},70 ${X(val) + 24},70 ${X(val)},112`} fill="#fff" />
        <line x1={X(val)} x2={X(val)} y1={112} y2={170} stroke="#fff" strokeWidth={6} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: Math.min(Math.max(X(val) - 110, x0 - 10), x0 + W - 220),
          width: 220,
          top: y - 40,
          textAlign: "center",
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 92,
          color: col,
          textShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}
      >
        {val.toFixed(0)}%
      </div>
      <Sfx at={at + 4} name="counter" volume={0.12} />
    </div>
  );
};

/**
 * "Non quanto ne prendi, ma quanto arriva": capsules stream into a cell, most
 * bounce off, a few get in and fill its membrane ring.
 */
export const ToTarget: React.FC<{ at: number; fillAt: number; top: number }> = ({ at, fillAt, top }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width * 0.66;
  const cy = height * top;
  const R = 190;
  const caps = Array.from({ length: 10 }).map((_, i) => {
    const t0 = at + i * 4;
    const k = interpolate(frame, [t0, t0 + 22], [0, 1], clamp);
    if (k <= 0 || k >= 1) return null;
    const enters = i % 3 === 0;
    const sx = width * 0.12;
    const sy = cy - 120 + (i % 5) * 60;
    const ex = enters ? cx : cx - R - 20;
    const ey = enters ? cy : cy - 60 + (i % 4) * 40;
    let x = sx + (ex - sx) * Math.min(1, k * 1.25);
    let yy = sy + (ey - sy) * Math.min(1, k * 1.25);
    if (!enters && k > 0.8) {
      const b = (k - 0.8) / 0.2;
      x = ex - b * 120;
      yy = ey + b * 160;
    }
    return (
      <div
        key={i}
        style={{ position: "absolute", left: x - 32, top: yy - 14, width: 64, height: 28, borderRadius: 14, background: C.yellow, opacity: enters ? 1 : 0.55, transform: `rotate(${i * 23}deg)`, boxShadow: "0 0 18px rgba(247,198,0,0.5)" }}
      />
    );
  });
  const fill = interpolate(frame, [fillAt, fillAt + 30], [0, 1], clamp);
  const dots = 36;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={cx} cy={cy} r={R + 18} fill="rgba(255,255,255,0.04)" />
        {Array.from({ length: dots }).map((_, i) => {
          const a = (i / dots) * Math.PI * 2;
          const on = i / dots < fill * 0.66;
          return <circle key={i} cx={cx + Math.cos(a) * R} cy={cy + Math.sin(a) * R} r={13} fill={on ? C.yellow : "rgba(255,255,255,0.25)"} />;
        })}
        <circle cx={cx - 30} cy={cy + 10} r={56} fill="rgba(255,255,255,0.12)" />
      </svg>
      {caps}
      <Sfx at={at} name="whoosh" volume={0.12} />
      <Sfx at={fillAt} name="pop1" volume={0.18} />
    </>
  );
};

/** Two check boxes that tick: QUALITÀ / DOSE VERA. */
export const Checks: React.FC<{ items: { text: string; at: number }[]; top: number }> = ({ items, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        const s = spring({ frame: frame - it.at, fps, config: { damping: 13, mass: 0.6 } });
        const tick = interpolate(frame, [it.at + 4, it.at + 12], [0, 1], clamp);
        if (frame < it.at) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * 0.12,
              top: height * top + i * 170,
              display: "flex",
              alignItems: "center",
              gap: 34,
              transform: `translateX(${(1 - s) * -200}px)`,
              opacity: Math.min(1, s * 1.5),
            }}
          >
            <svg width={110} height={110} viewBox="0 0 110 110">
              <rect x={6} y={6} width={98} height={98} rx={22} fill="rgba(0,0,0,0.35)" stroke="#fff" strokeWidth={6} />
              <path d="M28 58 L48 78 L84 34" fill="none" stroke={C.yellow} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - tick)} />
            </svg>
            <div style={{ fontFamily: mont, fontWeight: 900, fontSize: 96, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>{it.text}</div>
            <Sfx at={it.at + 4} name="pop2" volume={0.18} />
          </div>
        );
      })}
    </>
  );
};

/** Week strip with 2-3 fish days lighting up. */
export const Week: React.FC<{ at: number; top: number }> = ({ at, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const days = ["L", "M", "M", "G", "V", "S", "D"];
  const fishDays = [1, 3, 5];
  const cell = (width * 0.86) / 7;
  return (
    <div style={{ position: "absolute", left: width * 0.07, top: height * top, display: "flex" }}>
      {days.map((d, i) => {
        const s = spring({ frame: frame - at - i * 2, fps, config: { damping: 14 } });
        const fi = fishDays.indexOf(i);
        const lit = fi >= 0 && frame >= at + 14 + fi * 6;
        return (
          <div key={i} style={{ width: cell, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
            <div style={{ fontFamily: mont, fontWeight: 800, fontSize: 44, color: "rgba(255,255,255,0.8)" }}>{d}</div>
            <div
              style={{
                width: cell * 0.78,
                height: cell * 0.78,
                borderRadius: 22,
                background: lit ? C.yellow : "rgba(255,255,255,0.08)",
                border: "4px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${lit ? 1.08 : 1})`,
              }}
            >
              {lit ? (
                <svg width={cell * 0.55} height={cell * 0.35} viewBox="0 0 60 30">
                  <path d="M4 15 Q22 0 42 15 Q22 30 4 15 Z M42 15 L56 5 L56 25 Z" fill={C.ink} />
                  <circle cx={14} cy={13} r={2.4} fill={C.yellow} />
                </svg>
              ) : null}
            </div>
          </div>
        );
      })}
      {fishDays.map((_, k) => (
        <Sfx key={k} at={at + 14 + k * 6} name="pop3" volume={0.15} />
      ))}
    </div>
  );
};

/** Food as the base, the capsule as the cherry on top. */
export const CherryTop: React.FC<{ at: number; capAt: number; top: number }> = ({ at, capAt, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const base = spring({ frame: frame - at, fps, config: { damping: 15 } });
  const cap = spring({ frame: frame - capAt, fps, config: { damping: 9, mass: 0.7 } });
  const y = height * top;
  const bw = width * 0.7;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: (width - bw) / 2,
          top: y + (1 - base) * 300,
          width: bw,
          height: 300,
          borderRadius: "28px 28px 18px 18px",
          background: `linear-gradient(180deg, #fff, #E9E4DA)`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 -18px 0 rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 96,
          color: C.ink,
          letterSpacing: "-0.02em",
          opacity: base,
        }}
      >
        CIBO
      </div>
      {frame >= capAt ? (
        <div style={{ position: "absolute", left: width / 2 - 85, top: y - 120 - (1 - cap) * 500, width: 170, height: 84, borderRadius: 42, background: C.yellow, boxShadow: "0 0 40px rgba(247,198,0,0.7)", transform: `rotate(${(1 - cap) * 40 - 8}deg)` }} />
      ) : null}
      <Sfx at={capAt + 6} name="pop1" volume={0.2} />
    </>
  );
};
