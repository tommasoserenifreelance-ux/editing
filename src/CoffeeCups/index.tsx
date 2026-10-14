import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CUPS = 4;
const START = 15;
const STAGGER = 25;
const HOLD = 90;

export const COFFEE_FPS = 30;
export const COFFEE_DURATION = START + (CUPS - 1) * STAGGER + HOLD;

const CUP_WIDTH = 230;
const GAP = 20;

const colors = {
  bg: "#FFFFFF",
  porcelain: "#FFFFFF",
  outline: "#2B211C",
  shadow: "#E9E4DF",
  coffee: "#5A3522",
  crema: "#B57A4B",
  steam: "#C9C2BB",
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

const Cup: React.FC<{ delay: number }> = ({ delay }) => {
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
      width={CUP_WIDTH}
      height={CUP_WIDTH}
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
    </svg>
  );
};

export const CoffeeCups: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: GAP }}>
        {Array.from({ length: CUPS }, (_, i) => (
          <Cup key={i} delay={START + i * STAGGER} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
