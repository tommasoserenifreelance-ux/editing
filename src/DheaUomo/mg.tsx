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
