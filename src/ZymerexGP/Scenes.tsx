import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Icon, IconName } from "../Zymerex/Icons";
import { usePop, useT, Visible } from "./ui";

// Same language as the IB-Support / Magnesio PMS edits: white line icons with a brand-blue
// halo, product packshots, no boxes. Times are source seconds.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const GLOW =
  "drop-shadow(0 0 2px rgba(0,63,115,1)) drop-shadow(0 0 6px rgba(0,93,160,0.9)) drop-shadow(0 6px 16px rgba(0,30,70,0.45))";

const FloatIcon: React.FC<{
  name: IconName;
  at: number;
  to: number;
  x: number;
  y: number;
  size: number;
  stroke?: number;
  draw?: number;
}> = ({ name, at, to, x, y, size, stroke = 3.6, draw = 0.7 }) => {
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

export const Product: React.FC<{ src: string; at: number; to: number; x: number; y: number; width: number }> = ({
  src,
  at,
  to,
  x,
  y,
  width,
}) => {
  const t = useT(at);
  const pop = usePop(at);
  const out = interpolate(t, [to - at - 0.25, to - at], [1, 0], clamp);
  const bob = Math.sin((t + at) * 1.4) * 4;
  return (
    <Visible from={at} to={to}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: x,
          top: y + bob,
          width,
          transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: pop * out,
          filter: "drop-shadow(0 30px 40px rgba(0,30,70,0.45))",
        }}
      />
    </Visible>
  );
};

// Client stickers (already die-cut with a white outline): pop in with a
// slight tilt, bob gently.
const Sticker: React.FC<{ src: string; at: number; to: number; x: number; y: number; width: number; tilt?: number }> = ({
  src,
  at,
  to,
  x,
  y,
  width,
  tilt = -4,
}) => {
  const t = useT(at);
  const pop = usePop(at);
  const out = interpolate(t, [to - at - 0.25, to - at], [1, 0], clamp);
  const bob = Math.sin((t + at) * 1.5) * 5;
  return (
    <Visible from={at} to={to}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: x,
          top: y + bob,
          width,
          transform: `translate(-50%,-50%) scale(${interpolate(pop, [0, 1], [0.6, 1])}) rotate(${interpolate(pop, [0, 1], [tilt * 3, tilt])}deg)`,
          opacity: Math.min(1, pop * 1.6) * out,
          filter: "drop-shadow(0 18px 26px rgba(0,30,70,0.35))",
        }}
      />
    </Visible>
  );
};

// Air moving in the belly: bubbles rising from the centre.
const Bubbles: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const t = useT(from);
  const out = interpolate(t, [to - from - 0.3, to - from], [1, 0], clamp);
  if (t < 0 || t > to - from) return null;
  return (
    <div style={{ position: "absolute", left: 540, top: 1150, opacity: out, filter: GLOW }}>
      {Array.from({ length: 10 }, (_, i) => {
        const delay = (i * 0.23) % 1.5;
        if (t < delay) return null;
        const life = ((t - delay) % 1.5) / 1.5;
        const x = ((i * 89) % 520) - 260 + Math.sin((t + i) * 3) * 14;
        const sz = 20 + ((i * 37) % 26);
        const popped = life > 0.82;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: sz,
              height: sz,
              borderRadius: sz,
              border: "3px solid #fff",
              transform: `translate(${x}px, ${interpolate(life, [0, 1], [80, -240])}px) scale(${popped ? interpolate(life, [0.82, 1], [1, 1.8]) : 1})`,
              opacity: popped ? interpolate(life, [0.82, 1], [1, 0]) : 1,
            }}
          />
        );
      })}
    </div>
  );
};

const DONNA = "zymerex-gp/sticker-donna.png";
const PIZZA = "zymerex-gp/sticker-pizza.png";
const PRANZO = "zymerex-gp/sticker-pranzo.png";

// Speaker is framed larger here than in the other edits, so the whole layer
// sits lower and slightly smaller to keep clear of the chin.
export const Overlays: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, transform: "translateY(130px) scale(0.86)", transformOrigin: "540px 1060px" }}>
    {/* Q1: quando la pancia si fa sentire */}
    <Sticker src={DONNA} at={9.2} to={11.85} x={540} y={1090} width={460} />
    <FloatIcon name="plate" at={11.92} to={14.25} x={540} y={1060} size={230} />
    <FloatIcon name="belly" at={14.34} to={16.85} x={540} y={1060} size={230} />
    <Sticker src={PIZZA} at={16.94} to={18.95} x={540} y={1080} width={460} tilt={5} />
    <Sticker src={PRANZO} at={19.2} to={22.6} x={540} y={1080} width={560} />
    <FloatIcon name="people" at={22.72} to={25.3} x={540} y={1060} size={240} />
    <FloatIcon name="plate" at={25.48} to={26.6} x={540} y={1060} size={220} />

    {/* gonfiore frequente */}
    <FloatIcon name="belly" at={30.66} to={32.6} x={540} y={1060} size={230} />
    <FloatIcon name="calendar" at={32.68} to={35.8} x={540} y={1060} size={230} />
    <FloatIcon name="check" at={32.9} to={35.8} x={700} y={1160} size={70} stroke={6} />
    <FloatIcon name="timer" at={36.98} to={40.4} x={540} y={1060} size={230} />
    <FloatIcon name="plate" at={40.46} to={41.5} x={540} y={1060} size={210} />
    <FloatIcon name="clock" at={41.58} to={43.2} x={540} y={1060} size={220} />
    <FloatIcon name="people" at={43.3} to={45.4} x={540} y={1060} size={240} />

    {/* Q2: cosa fa la persona */}
    <FloatIcon name="pants" at={53.46} to={56.9} x={540} y={1070} size={240} />
    <FloatIcon name="lotus" at={57.3} to={58.7} x={540} y={1060} size={220} />
    <FloatIcon name="cross" at={59.22} to={61.1} x={540} y={1060} size={200} stroke={4} />
    <FloatIcon name="belly" at={62.3} to={66.1} x={480} y={1070} size={230} />
    <FloatIcon name="bolt" at={63.66} to={66.1} x={680} y={980} size={130} />
    <Bubbles from={68.3} to={70.1} />
    <FloatIcon name="sound" at={70.18} to={73.0} x={540} y={1060} size={230} />
    <FloatIcon name="person" at={74.6} to={77.4} x={420} y={1070} size={200} />
    <FloatIcon name="person" at={75.54} to={77.4} x={660} y={1070} size={200} />
    <FloatIcon name="sound" at={80.64} to={83.0} x={540} y={1060} size={230} />

    {/* Q3: quanto incide sulla giornata */}
    <FloatIcon name="bolt" at={104.06} to={107.1} x={330} y={1060} size={170} />
    <FloatIcon name="bolt" at={105.12} to={107.1} x={540} y={1010} size={170} />
    <FloatIcon name="bolt" at={105.8} to={107.1} x={750} y={1060} size={170} />
  </div>
);
