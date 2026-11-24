import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Icon, IconName } from "../Zymerex/Icons";
import { usePop, useT, Visible } from "./ui";

// Same language as the IB-Support edit: white line icons with a brand-blue
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

const Product: React.FC<{ src: string; at: number; to: number; x: number; y: number; width: number }> = ({
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

const BUSTINE = "zymerex-pms/magnesio-pms-bustine.png";
const GUMMIES = "zymerex-pms/magnesio-pms-gummies.png";

// A day cell of the dosage calendar: outline square that draws on, with one
// or two dose dots and an optional "ciclo" drop.
const Day: React.FC<{ at: number; doses: 1 | 2; ciclo?: boolean; size: number }> = ({ at, doses, ciclo, size }) => {
  const t = useT(at);
  const pop = usePop(at);
  const draw = interpolate(t, [0, 0.3], [0, 1], clamp);
  const per = 2 * (size - 6) * 2;
  return (
    <div style={{ position: "relative", width: size, height: size, opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})` }}>
      <svg width={size} height={size} style={{ position: "absolute", overflow: "visible" }}>
        <rect
          x={3}
          y={3}
          width={size - 6}
          height={size - 6}
          rx={size * 0.2}
          fill={ciclo ? "rgba(255,255,255,0.22)" : "none"}
          stroke="#fff"
          strokeWidth={3}
          strokeDasharray={per}
          strokeDashoffset={per * (1 - draw)}
        />
      </svg>
      {ciclo ? (
        <div style={{ position: "absolute", left: "50%", top: -size * 0.55, transform: "translateX(-50%)" }}>
          <Icon name="drop" size={size * 0.45} color="#fff" stroke={4} progress={draw} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: size * 0.1,
        }}
      >
        {Array.from({ length: doses }, (_, i) => {
          const d = interpolate(t, [0.15 + i * 0.12, 0.35 + i * 0.12], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                width: size * 0.22,
                height: size * 0.26,
                borderRadius: `${size * 0.2}px ${size * 0.2}px ${size * 0.06}px ${size * 0.06}px`,
                background: "#fff",
                transform: `scale(${d})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/** 7 days before the cycle at 1 dose, then 5 cycle days at 2 doses. */
const IdealStrip: React.FC = () => {
  const t = useT(0);
  const out = interpolate(t, [24.95, 25.25], [1, 0], clamp);
  return (
    <Visible from={20.0} to={25.3}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 70,
          opacity: out,
          filter: GLOW,
          transform: "translateY(-50%)",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Day key={i} at={20.08 + i * 0.13} doses={1} size={104} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Day key={i} at={22.04 + i * 0.16} doses={2} ciclo size={104} />
          ))}
        </div>
      </div>
    </Visible>
  );
};

/** Prevention: one a day every day (4 weeks), then 2 a day on cycle days. */
const MonthGrid: React.FC = () => {
  const t = useT(0);
  const out = interpolate(t, [39.15, 39.45], [1, 0], clamp);
  const cycleFrom = 23; // last 5 days of the grid are cycle days
  return (
    <Visible from={32.3} to={39.5}>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1130,
          transform: "translate(-50%,-50%)",
          display: "grid",
          gridTemplateColumns: "repeat(7, 84px)",
          gap: 12,
          opacity: out,
          filter: GLOW,
        }}
      >
        {Array.from({ length: 28 }, (_, i) =>
          i >= cycleFrom && t >= 36.58 ? (
            <Day key={`c${i}`} at={36.58 + (i - cycleFrom) * 0.14} doses={2} ciclo size={84} />
          ) : (
            <Day key={i} at={32.4 + i * 0.05} doses={1} size={84} />
          ),
        )}
      </div>
    </Visible>
  );
};

export const Overlays: React.FC = () => (
  <>
    {/* "il prodotto si utilizza in vari modi" */}
    <Product src={BUSTINE} at={5.64} to={8.05} x={300} y={1080} width={420} />
    <Product src={GUMMIES} at={6.0} to={8.05} x={800} y={1060} width={300} />

    {/* minimo: 2 gommose o 2 bustine nei giorni del ciclo */}
    <FloatIcon name="gummy" at={10.26} to={13.2} x={250} y={1020} size={150} />
    <FloatIcon name="gummy" at={10.45} to={13.2} x={390} y={1020} size={150} />
    <FloatIcon name="sachet" at={11.92} to={13.2} x={690} y={1020} size={150} />
    <FloatIcon name="sachet" at={12.1} to={13.2} x={830} y={1020} size={150} />
    <FloatIcon name="cycle" at={13.26} to={14.3} x={540} y={1030} size={260} />

    {/* ideale: 1 nei 7 giorni prima, 2 nei giorni del ciclo */}
    <FloatIcon name="gummy" at={17.76} to={20.0} x={330} y={1030} size={190} />
    <FloatIcon name="sachet" at={19.0} to={20.0} x={750} y={1030} size={190} />
    <IdealStrip />

    {/* prevenzione */}
    <FloatIcon name="shield" at={29.68} to={32.3} x={540} y={1040} size={280} draw={1} />
    <MonthGrid />

    {/* tutto il mese */}
    <Product src={BUSTINE} at={39.52} to={42.0} x={300} y={1080} width={420} />
    <Product src={GUMMIES} at={39.7} to={42.0} x={800} y={1060} width={300} />
  </>
);
