import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { mont, ref } from "../IvTherapy/fx";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Hormone cascade, top to bottom: the DHEA "reservoir" fills, then flows
 * down a glowing line into the next tiers as they are named.
 */
export const Cascade: React.FC<{ tiers: { text: string; at: number; bg: string; color: string }[]; top: number; gap?: number }> = ({ tiers, top, gap = 300 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const x = width / 2;
  const y0 = height * top;
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <filter id="cascGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {tiers.slice(1).map((t, i) => {
          const k = interpolate(frame, [t.at - 10, t.at], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
          if (k <= 0) return null;
          const ya = y0 + i * gap + 70;
          const yb = y0 + (i + 1) * gap - 70;
          const yk = ya + (yb - ya) * k;
          // a bright pulse travelling down the line
          const py = ya + (yb - ya) * ((frame * 0.035) % 1);
          return (
            <g key={i}>
              <line x1={x} y1={ya} x2={x} y2={yk} stroke={ref.yellow} strokeWidth={14} strokeLinecap="round" filter="url(#cascGlow)" opacity={0.6} />
              <line x1={x} y1={ya} x2={x} y2={yk} stroke={ref.yellow} strokeWidth={8} strokeLinecap="round" />
              {k >= 1 ? <circle cx={x} cy={py} r={10} fill="#fff" /> : null}
              {k >= 1 ? <polygon points={`${x - 26},${yb - 26} ${x + 26},${yb - 26} ${x},${yb + 6}`} fill={ref.yellow} /> : null}
            </g>
          );
        })}
      </svg>
      {tiers.map((t, i) => {
        const s = spring({ frame: frame - t.at, fps, config: { damping: 13, mass: 0.6 } });
        if (frame < t.at) return null;
        const first = i === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y0 + i * gap,
              transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * s})`,
              opacity: Math.min(1, s * 1.5),
              background: t.bg,
              color: t.color,
              fontFamily: mont,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: first ? 120 : 84,
              letterSpacing: "-0.02em",
              padding: first ? "18px 60px 22px" : "14px 46px 18px",
              borderRadius: first ? 24 : 18,
              boxShadow: first ? "0 0 60px rgba(247,198,0,0.45), 0 20px 40px rgba(0,0,0,0.5)" : "0 18px 36px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {t.text}
            <Sfx at={0} name={first ? "impact" : "pop2"} volume={first ? 0.18 : 0.16} />
          </div>
        );
      })}
    </>
  );
};

/**
 * The two adrenal glands as stylised glowing caps (no body, no organs):
 * they pulse and release little "DHEA" molecules that float up.
 */
export const GlandEmit: React.FC<{ at: number; top: number }> = ({ at, top }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cy = height * top;
  const pop = spring({ frame: frame - 2, fps, config: { damping: 12, mass: 0.7 } });
  const lit = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.5 } });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  const gland = (x: number, flip: number) => (
    <g transform={`translate(${x} ${cy}) scale(${flip * (1.0 + 0.4 * pop)} ${1.0 + 0.4 * pop})`}>
      <path d="M-120 60 Q-110 -40 -20 -90 Q40 -110 90 -60 Q130 -10 120 60 Q0 90 -120 60 Z" fill={ref.yellow} opacity={0.12 + 0.18 * lit * pulse} filter="url(#glGlow)" />
      <path d="M-120 60 Q-110 -40 -20 -90 Q40 -110 90 -60 Q130 -10 120 60 Q0 90 -120 60 Z" fill="rgba(247,198,0,0.12)" stroke={ref.yellow} strokeWidth={6} />
      {[[-50, 0], [10, -30], [50, 20], [-10, 35]].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={10 + 4 * lit} fill={ref.yellow} opacity={0.35 + 0.5 * lit} />
      ))}
    </g>
  );
  const parts = Array.from({ length: 14 }).map((_, i) => {
    const t0 = at + i * 5;
    const k = (frame - t0) / 45;
    if (k <= 0 || k >= 1) return null;
    const side = i % 2 ? 1 : -1;
    const x = width / 2 + side * (230 + ((i * 37) % 60)) + Math.sin(k * 6 + i) * 30;
    const y = cy - 150 - k * 560;
    return (
      <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85, fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 40, color: "#141416", background: ref.yellow, borderRadius: 30, padding: "4px 16px" }}>
        DHEA
      </div>
    );
  });
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <filter id="glGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        {gland(width / 2 - 260, 1)}
        {gland(width / 2 + 260, -1)}
      </svg>
      {parts}
      <Sfx at={2} name="swoosh" volume={0.14} />
      <Sfx at={at} name="rise" volume={0.12} />
    </>
  );
};

/** Hook card: "dopo la donna" struck through, then the man. */
export const HookCard: React.FC<{ leadAt: number; dheaAt: number; uomoAt: number }> = ({ leadAt, dheaAt, uomoAt }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const a = spring({ frame: frame - leadAt, fps, config: { damping: 14 } });
  const strike = interpolate(frame, [dheaAt - 6, dheaAt + 2], [0, 1], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.3, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        <span style={{ position: "relative", fontFamily: mont, fontWeight: 800, fontStyle: "italic", fontSize: 78, color: "rgba(255,255,255,0.75)" }}>
          DOPO LA DONNA
          <span style={{ position: "absolute", left: -10, top: "52%", height: 10, width: `${strike * 104}%`, background: ref.red, borderRadius: 5 }} />
        </span>
      </div>
      <Sfx at={dheaAt - 6} name="draw" volume={0.14} />
      {frame >= uomoAt ? null : null}
      <div style={{ position: "absolute", left: width * 0.5, top: height * 0.5, transform: "translate(-50%,-50%)" }} />
    </>
  );
};
