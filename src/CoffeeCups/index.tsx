import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const START = 15;
const STAGGER = 25;
const HOLD = 90;
// The cross starts once the last cup has landed and is drawn stroke by stroke.
const CROSS_DELAY = 20;
const CROSS_STROKE = 8;

export type CoffeeCupsProps = {
  cups: number;
  crossLast: boolean;
  // Leave the background empty so the clip can be layered over footage.
  transparent?: boolean;
};

export const COFFEE_FPS = 30;
export const coffeeDuration = ({ cups, crossLast }: CoffeeCupsProps) =>
  START +
  (cups - 1) * STAGGER +
  (crossLast ? CROSS_DELAY + 2 * CROSS_STROKE : 0) +
  HOLD;

// Shrink the cups so the whole row always fits the 1080px frame.
const ROW_WIDTH = 1000;
const GAP = 20;
const MAX_CUP_WIDTH = 230;

const colors = {
  bg: "#FFFFFF",
  porcelain: "#FFFFFF",
  outline: "#2B211C",
  shadow: "#E9E4DF",
  coffee: "#5A3522",
  crema: "#B57A4B",
  steam: "#C9C2BB",
  cross: "#E0262B",
};

const Steam: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <g opacity={opacity}>
      {[-22, 0, 22].map((dx, i) => {
        const t = frame + i * 12;
        const rise = (t % 45) / 45;
        const sway = Math.sin(t / 8) * 5;
        return (
          <path
            key={dx}
            d={`M ${110 + dx} 72 c ${-10 + sway} -12, ${10 + sway} -22, 0 -34 c ${-10 - sway} -12, ${10 - sway} -22, 0 -34`}
            fill="none"
            stroke={colors.steam}
            strokeWidth={5}
            strokeLinecap="round"
            transform={`translate(0 ${-rise * 12})`}
            opacity={interpolate(rise, [0, 0.3, 1], [0, 0.9, 0])}
          />
        );
      })}
    </g>
  );
};

const Cross: React.FC<{ frame: number }> = ({ frame }) => {
  const LENGTH = 260;
  const strokes = ["M 20 20 L 200 200", "M 200 20 L 20 200"];
  return (
    <g>
      {strokes.map((d, i) => {
        const drawn = interpolate(
          frame - i * CROSS_STROKE,
          [0, CROSS_STROKE],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={colors.cross}
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={LENGTH}
            strokeDashoffset={LENGTH * (1 - drawn)}
            opacity={drawn > 0 ? 1 : 0}
          />
        );
      })}
    </g>
  );
};

const Cup: React.FC<{ delay: number; width: number; crossed: boolean }> = ({
  delay,
  width,
  crossed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const progress = spring({
    frame: local,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
  });
  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [140, 0]);
  const scale = interpolate(progress, [0, 1], [0.6, 1]);

  return (
    <svg
      width={width}
      height={width}
      viewBox="0 -10 240 230"
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        transformOrigin: "50% 85%",
        overflow: "visible",
      }}
    >
      {local > 10 ? <Steam frame={local - 10} /> : null}
      {/* Saucer */}
      <ellipse cx={110} cy={196} rx={108} ry={20} fill={colors.shadow} />
      <ellipse
        cx={110}
        cy={190}
        rx={105}
        ry={20}
        fill={colors.porcelain}
        stroke={colors.outline}
        strokeWidth={5}
      />
      <ellipse
        cx={110}
        cy={186}
        rx={55}
        ry={9}
        fill="none"
        stroke={colors.outline}
        strokeWidth={3}
        opacity={0.35}
      />
      {/* Handle */}
      <path
        d="M 172 104 C 222 96, 222 160, 158 158"
        fill="none"
        stroke={colors.outline}
        strokeWidth={18}
        strokeLinecap="round"
      />
      <path
        d="M 172 104 C 222 96, 222 160, 158 158"
        fill="none"
        stroke={colors.porcelain}
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Body */}
      <path
        d="M 38 90 C 40 150, 62 184, 110 184 C 158 184, 180 150, 182 90 Z"
        fill={colors.porcelain}
        stroke={colors.outline}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* Rim and coffee */}
      <ellipse
        cx={110}
        cy={90}
        rx={72}
        ry={14}
        fill={colors.porcelain}
        stroke={colors.outline}
        strokeWidth={5}
      />
      <ellipse cx={110} cy={92} rx={62} ry={9} fill={colors.coffee} />
      <ellipse
        cx={104}
        cy={91}
        rx={30}
        ry={4}
        fill={colors.crema}
        opacity={0.7}
      />
      {crossed ? <Cross frame={local - CROSS_DELAY} /> : null}
    </svg>
  );
};

export const CoffeeCups: React.FC<CoffeeCupsProps> = ({
  cups,
  crossLast,
  transparent = false,
}) => {
  const width = Math.min(MAX_CUP_WIDTH, (ROW_WIDTH - (cups - 1) * GAP) / cups);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? undefined : colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: GAP }}>
        {Array.from({ length: cups }, (_, i) => (
          <Cup
            key={i}
            delay={START + i * STAGGER}
            width={width}
            crossed={crossLast && i === cups - 1}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
