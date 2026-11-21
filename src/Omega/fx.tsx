import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../Testosterone/primitives";
import { mont, ref } from "../IvTherapy/fx";

/*
 * Data-style motion graphics for the omega 3 reel, in the Pulp/LongevaMed
 * palette: thin glowing strokes, tick rings, counters — no cartoons.
 */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GREEN = "#3DDC84";

/**
 * Omega-3 index HUD: a tick ring with risk zones (<4 % red, 4-8 % yellow,
 * >8 % green), a glowing arc that sweeps to the target while the centre
 * counter runs up, a slowly rotating outer dial.
 */
export const IndexRing: React.FC<{ at: number; top: number; size?: number; target?: number }> = ({ at, top, size = 760, target = 8 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const intro = spring({ frame: frame - at, fps, config: { damping: 18, mass: 0.8 } });
  const sweep = interpolate(frame, [at + 6, at + 46], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const val = target * sweep;
  const MAX = 12;
  const R = 300;
  const C = 2 * Math.PI * R;
  // ring spans 270 degrees, opening at the bottom
  const span = 0.75;
  const arcLen = (v: number) => (v / MAX) * span * C;
  const col = val < 4 ? ref.red : val < 8 ? ref.yellow : GREEN;
  const zone = (from: number, to: number, c: string) => (
    <circle
      r={R + 46}
      fill="none"
      stroke={c}
      strokeWidth={10}
      strokeDasharray={`${(((to - from) / MAX) * span * 2 * Math.PI * (R + 46)) - 8} ${2 * Math.PI * (R + 46)}`}
      strokeDashoffset={-((from / MAX) * span * 2 * Math.PI * (R + 46))}
      opacity={0.9 * intro}
    />
  );
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="-400 -400 800 800"
        style={{ position: "absolute", left: width / 2 - size / 2, top: height * top - size / 2, opacity: intro, transform: `scale(${0.85 + 0.15 * intro})` }}
      >
        <defs>
          <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {/* rotating outer dial */}
        <g transform={`rotate(${frame * 0.4})`} opacity={0.35}>
          {Array.from({ length: 120 }).map((_, i) => (
            <line key={i} x1={0} y1={-385} x2={0} y2={i % 10 === 0 ? -362 : -374} stroke="#fff" strokeWidth={i % 10 === 0 ? 3 : 1.5} transform={`rotate(${i * 3})`} />
          ))}
        </g>
        <g transform="rotate(135)">
          {zone(0, 4, ref.red)}
          {zone(4, 8, ref.yellow)}
          {zone(8, 12, GREEN)}
          {/* track */}
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={34} strokeDasharray={`${span * C} ${C}`} strokeLinecap="round" />
          {/* glow + arc */}
          <circle r={R} fill="none" stroke={col} strokeWidth={34} strokeDasharray={`${arcLen(val)} ${C}`} strokeLinecap="round" filter="url(#ringGlow)" opacity={0.7} />
          <circle r={R} fill="none" stroke={col} strokeWidth={26} strokeDasharray={`${arcLen(val)} ${C}`} strokeLinecap="round" />
          {/* scale ticks */}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={i} x1={R - 40} y1={0} x2={R - 58} y2={0} stroke="rgba(255,255,255,0.7)" strokeWidth={4} transform={`rotate(${(i / 12) * 270})`} />
          ))}
        </g>
        {[0, 4, 8, 12].map((v) => {
          const a = ((135 + (v / 12) * 270) * Math.PI) / 180;
          return (
            <text key={v} x={Math.cos(a) * (R - 100)} y={Math.sin(a) * (R - 100) + 14} fill="rgba(255,255,255,0.75)" fontFamily={mont} fontWeight={700} fontSize={38} textAnchor="middle">
              {v}%
            </text>
          );
        })}
        <text x={0} y={40} fill={col} fontFamily={mont} fontWeight={900} fontStyle="italic" fontSize={170} textAnchor="middle">
          {val.toFixed(1).replace(".", ",")}%
        </text>
        <text x={0} y={110} fill="rgba(255,255,255,0.85)" fontFamily={mont} fontWeight={700} fontSize={40} textAnchor="middle" letterSpacing="0.08em">
          EPA + DHA
        </text>
      </svg>
      <Sfx at={at} name="rise" volume={0.12} />
      <Sfx at={at + 46} name="pop2" volume={0.16} />
    </>
  );
};

/**
 * Cell membrane bilayer: two rows of phospholipid heads with wavy tails
 * draw in from the left, then heads light up yellow one by one as EPA/DHA
 * are built in, with a soft glow.
 */
export const Membrane: React.FC<{ at: number; fillAt: number; top: number }> = ({ at, fillAt, top }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const N = 13;
  const gap = width / (N - 1.4);
  const cy = height * top;
  const rnd = (i: number) => {
    const x = Math.sin(i * 91.7 + 13.1) * 43758.5;
    return x - Math.floor(x);
  };
  const lipids: React.ReactNode[] = [];
  [-1, 1].forEach((side) => {
    for (let i = 0; i < N; i++) {
      const id = i + (side > 0 ? N : 0);
      const x = gap * 0.3 + i * gap + (side > 0 ? gap * 0.5 : 0);
      const appear = interpolate(frame, [at + i * 1.5, at + i * 1.5 + 8], [0, 1], clamp);
      if (appear <= 0) continue;
      const yHead = cy + side * 150;
      const lit = frame >= fillAt + rnd(id) * 30 && rnd(id + 50) < 0.55;
      const litK = lit ? interpolate(frame, [fillAt + rnd(id) * 30, fillAt + rnd(id) * 30 + 6], [0, 1], clamp) : 0;
      const wave = Math.sin(frame * 0.12 + i * 0.8) * 6;
      const tail = (dx: number) => {
        const x0 = x + dx;
        const y0 = yHead - side * 30;
        const y1 = cy + side * 16;
        return `M${x0} ${y0} C${x0 + wave} ${y0 - side * 40}, ${x0 - wave} ${y1 + side * 40}, ${x0 + wave * 0.5} ${y1}`;
      };
      lipids.push(
        <g key={id} opacity={appear} transform={`translate(0 ${(1 - appear) * side * 40})`}>
          <path d={tail(-12)} fill="none" stroke={litK > 0 ? ref.yellow : "rgba(255,255,255,0.45)"} strokeWidth={5} strokeLinecap="round" />
          <path d={tail(12)} fill="none" stroke={litK > 0 ? ref.yellow : "rgba(255,255,255,0.45)"} strokeWidth={5} strokeLinecap="round" />
          {litK > 0 ? <circle cx={x} cy={yHead} r={46} fill={ref.yellow} opacity={0.25 * litK} filter="url(#memGlow)" /> : null}
          <circle cx={x} cy={yHead} r={30} fill={litK > 0 ? ref.yellow : "rgba(255,255,255,0.85)"} />
        </g>,
      );
    }
  });
  const share = interpolate(frame, [fillAt, fillAt + 36], [0, 8], clamp);
  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <filter id="memGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        {lipids}
      </svg>
      <Sfx at={at} name="whoosh" volume={0.12} />
      <Sfx at={fillAt} name="rise" volume={0.1} />
      {frame >= fillAt ? (
        <div style={{ position: "absolute", right: width * 0.06, top: cy + 230, fontFamily: mont, fontWeight: 900, fontStyle: "italic", fontSize: 64, color: ref.yellow, textShadow: "0 4px 16px rgba(0,0,0,0.6)" }}>
          {share.toFixed(0)}% EPA+DHA
        </div>
      ) : null}
    </>
  );
};
