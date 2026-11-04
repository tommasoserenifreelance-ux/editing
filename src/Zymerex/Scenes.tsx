import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Icon, IconName } from "./Icons";
import { usePop, useT, Visible } from "./ui";

// Everything here is "naked": brand-blue line icons or product packshots,
// no cards, pills or boxes behind them. White strokes with a brand-blue halo stay
// legible over both the white shirt and the jacket.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GLOW =
  "drop-shadow(0 0 2px rgba(0,63,115,1)) drop-shadow(0 0 6px rgba(0,93,160,0.9)) drop-shadow(0 6px 16px rgba(0,30,70,0.45))";

/** One icon at (x, y) centre that fades/scales in at `at` and draws itself on. */
const FloatIcon: React.FC<{
  name: IconName;
  at: number;
  to: number;
  x: number;
  y: number;
  size: number;
  stroke?: number;
  draw?: number;
}> = ({ name, at, to, x, y, size, stroke = 3.6, draw = 0.8 }) => {
  const t = useT(at);
  const pop = usePop(at);
  const out = interpolate(t, [to - at - 0.22, to - at], [1, 0], clamp);
  const bob = Math.sin((t + at) * 1.6) * 5;
  return (
    <Visible from={at} to={to}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + bob,
          transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: Math.min(pop * 1.5, 1) * out,
          filter: GLOW,
        }}
      >
        <Icon name={name} size={size} color="#fff" stroke={stroke} progress={interpolate(t, [0, draw], [0, 1], clamp)} />
      </div>
    </Visible>
  );
};

/** Product packshot, centred at (x, y). */
const Product: React.FC<{
  src: string;
  at: number;
  to: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  desaturateAt?: number;
}> = ({ src, at, to, x, y, width, height, desaturateAt }) => {
  const t = useT(at);
  const pop = usePop(at);
  const out = interpolate(t, [to - at - 0.25, to - at], [1, 0], clamp);
  const bob = Math.sin((t + at) * 1.4) * 4;
  const sat = desaturateAt ? interpolate(t + at, [desaturateAt, desaturateAt + 0.8], [1, 0.55], clamp) : 1;
  return (
    <Visible from={at} to={to}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: x,
          top: y + bob,
          width,
          height,
          transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: pop * out,
          filter: `drop-shadow(0 30px 40px rgba(0,30,70,0.45)) saturate(${sat})`,
        }}
      />
    </Visible>
  );
};

// ------------------------------------------------------------------ pieces

const Timer: React.FC = () => {
  const t = useT(10.7);
  const pop = usePop(10.7);
  const out = interpolate(t, [1.3, 1.55], [1, 0], clamp);
  const r = 120;
  const circ = 2 * Math.PI * r;
  return (
    <Visible from={10.7} to={12.25}>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 990,
          transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: pop * out,
          filter: GLOW,
        }}
      >
        <svg width={300} height={300}>
          <circle cx={150} cy={150} r={r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={10} />
          <circle
            cx={150}
            cy={150}
            r={r}
            fill="none"
            stroke="#fff"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - interpolate(t, [0, 1.4], [0, 1], clamp))}
            transform="rotate(-90 150 150)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="timer" size={140} color="#fff" stroke={3.6} progress={interpolate(t, [0, 0.6], [0, 1], clamp)} />
        </div>
      </div>
    </Visible>
  );
};

const Bubbles: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const t = useT(from);
  const out = interpolate(t, [to - from - 0.3, to - from], [1, 0], clamp);
  if (t < 0 || t > to - from) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: 1000, opacity: out, filter: GLOW }}>
      {Array.from({ length: 9 }, (_, i) => {
        const delay = (i * 0.29) % 1.6;
        if (t < delay) return null;
        const life = ((t - delay) % 1.6) / 1.6;
        const x = ((i * 97) % 640) - 320;
        const s = 22 + ((i * 37) % 26);
        const popped = life > 0.82;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: s,
              height: s,
              borderRadius: s,
              border: "3px solid #fff",
              transform: `translate(${x}px, ${interpolate(life, [0, 1], [120, -260])}px) scale(${popped ? interpolate(life, [0.82, 1], [1, 1.8]) : 1})`,
              opacity: popped ? interpolate(life, [0.82, 1], [1, 0]) : 1,
            }}
          />
        );
      })}
    </div>
  );
};

// Small bacteria drifting around the main probiotics icon.
const Swarm: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <>
    {[
      [300, 860, 0.3],
      [790, 880, 0.6],
      [250, 1150, 0.9],
      [830, 1160, 1.2],
      [540, 760, 1.5],
    ].map(([x, y, d]) => (
      <FloatIcon key={`${x}-${y}`} name="bacteria" at={from + d} to={to} x={x} y={y} size={110} stroke={4} />
    ))}
  </>
);

const ProductsScene: React.FC = () => {
  const t = useT(0);
  const move = usePop(30.08);
  // IB-Support: big in the centre, then slides right when the old name appears.
  const x = interpolate(move, [0, 1], [540, 770]);
  const w = interpolate(move, [0, 1], [430, 380]);
  const pop = usePop(28.36);
  const out = interpolate(t, [35.55, 35.85], [1, 0], clamp);
  const bob = Math.sin(t * 1.4) * 4;
  return (
    <>
      <Visible from={28.36} to={35.85}>
        <Img
          src={staticFile("zymerex/ib-support.png")}
          style={{
            position: "absolute",
            left: x,
            top: 1080 + bob,
            width: w,
            transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
            opacity: pop * out,
            filter: "drop-shadow(0 30px 40px rgba(0,30,70,0.45))",
          }}
        />
      </Visible>
      <Product src="zymerex/regola-ibs.png" at={31.64} to={35.85} x={290} y={1080} height={340} desaturateAt={32.3} />
      <FloatIcon name="arrow" at={32.1} to={35.85} x={500} y={1080} size={110} stroke={5} />
      <FloatIcon name="check" at={34.26} to={35.85} x={540} y={1290} size={110} stroke={6} />
    </>
  );
};

// --------------------------------------------------------------- timeline

export const Overlays: React.FC = () => (
  <>
    {/* "non è solo stress / non è nella tua testa" */}
    <FloatIcon name="lotus" at={1.32} to={3.62} x={330} y={980} size={220} />
    <FloatIcon name="cross" at={1.6} to={3.62} x={330} y={980} size={300} stroke={2.6} />
    <FloatIcon name="brain" at={2.46} to={3.62} x={750} y={980} size={220} />
    <FloatIcon name="cross" at={2.7} to={3.62} x={750} y={980} size={300} stroke={2.6} />

    {/* symptoms */}
    <FloatIcon name="bolt" at={3.68} to={10.6} x={330} y={880} size={210} />
    <FloatIcon name="belly" at={4.62} to={10.6} x={750} y={880} size={210} />
    <FloatIcon name="hourglass" at={5.92} to={10.6} x={330} y={1170} size={210} />
    <FloatIcon name="drop" at={7.72} to={10.6} x={750} y={1170} size={210} />

    <Timer />

    {/* da persona a persona */}
    <FloatIcon name="person" at={12.5} to={15.6} x={260} y={1000} size={200} />
    <FloatIcon name="person" at={12.95} to={15.6} x={540} y={1000} size={200} />
    <FloatIcon name="person" at={13.4} to={15.6} x={820} y={1000} size={200} />

    {/* nessuna dieta valida per tutti */}
    <FloatIcon name="plate" at={15.7} to={18.25} x={540} y={1000} size={300} />
    <FloatIcon name="cross" at={16.1} to={18.25} x={540} y={1000} size={400} stroke={2.4} />

    {/* primi suggerimenti */}
    <FloatIcon name="lotus" at={18.7} to={24.6} x={250} y={1000} size={200} />
    <FloatIcon name="check" at={19.05} to={24.6} x={250} y={1170} size={80} stroke={6} />
    <FloatIcon name="clock" at={19.96} to={24.6} x={540} y={1000} size={200} />
    <FloatIcon name="check" at={20.3} to={24.6} x={540} y={1170} size={80} stroke={6} />
    <FloatIcon name="wheat" at={21.36} to={24.6} x={830} y={1000} size={200} />
    <FloatIcon name="check" at={21.7} to={24.6} x={830} y={1170} size={80} stroke={6} />

    {/* benessere dell'intestino */}
    <FloatIcon name="intestine" at={25.1} to={28.3} x={540} y={1000} size={330} draw={1.6} />

    {/* products: IB-Support, nuovo nome di Regola-IBS, stessa formula */}
    <ProductsScene />

    {/* 5 azioni */}
    <FloatIcon name="energy" at={35.96} to={40.42} x={540} y={1000} size={320} draw={1} />
    <FloatIcon name="flower" at={40.46} to={42.9} x={540} y={1000} size={320} draw={1} />
    <FloatIcon name="leaf" at={42.94} to={46.0} x={540} y={1000} size={320} draw={1} />
    <Bubbles from={43.7} to={46.0} />
    <FloatIcon name="daisy" at={46.04} to={49.52} x={540} y={1000} size={320} draw={1} />
    <FloatIcon name="bacteria" at={49.56} to={55.2} x={540} y={1000} size={300} draw={1} />
    <Swarm from={49.56} to={55.2} />

    {/* posologia */}
    <Product src="zymerex/ib-support.png" at={55.36} to={58.35} x={350} y={1080} width={380} />
    <FloatIcon name="pill" at={55.4} to={58.35} x={800} y={900} size={150} />
    <FloatIcon name="pill" at={55.84} to={58.35} x={800} y={1040} size={150} />
    <FloatIcon name="plate" at={56.68} to={58.35} x={800} y={1200} size={130} />
  </>
);
