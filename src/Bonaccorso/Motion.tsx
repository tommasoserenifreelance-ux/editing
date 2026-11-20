import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, sans, serif } from "./theme";

// Building blocks for the drawn cutaways in the Bonaccorso videos: a blue
// backdrop that never sits still, a title with an italic box, chips, and one
// easing for every move (no springy overshoot), so all animations match.

export const EASE = Easing.out(Easing.cubic);

// 0 → 1 over `dur` frames from `start`, eased.
export const useIn = (start: number, dur = 9) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 197) % 1080,
  y: (i * 331) % 1920,
  r: 4 + ((i * 7) % 9),
  speed: 0.6 + ((i * 13) % 10) / 10,
}));

// Blue gradient with slowly rising particles and a gentle push-in, so the
// cutaway never sits still.
export const Backdrop: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${colors.blue}, ${colors.navy} 75%)`,
      }}
    >
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {PARTICLES.map((p, i) => (
          <circle
            key={i}
            cx={p.x + Math.sin((frame + i * 20) / 30) * 12}
            cy={(((p.y - frame * p.speed * 2) % 1920) + 1920) % 1920}
            r={p.r}
            fill="white"
            opacity={0.12}
          />
        ))}
      </svg>
      <AbsoluteFill style={{ transform: `scale(${1 + frame * 0.0004})` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Title: React.FC<{ text: string; italic: string }> = ({
  text,
  italic,
}) => {
  const t = useIn(0, 8);
  const box = useIn(4, 8);
  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        width: "100%",
        textAlign: "center",
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 72,
        color: colors.white,
        letterSpacing: -2,
        opacity: t,
        transform: `translateY(${(1 - t) * 40}px)`,
      }}
    >
      {text}{" "}
      <span
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 600,
          background: colors.white,
          color: colors.blue,
          padding: "0 0.25em 0.05em",
          borderRadius: 12,
          display: "inline-block",
          transform: `rotate(-2deg) scale(${0.7 + 0.3 * box})`,
          opacity: box,
          letterSpacing: 0,
        }}
      >
        {italic}
      </span>
    </div>
  );
};

export const Chip: React.FC<{
  text: string;
  at: number;
  light?: boolean;
  size?: number;
}> = ({ text, at, light, size = 44 }) => {
  const t = useIn(at, 7);
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: sans,
        fontWeight: 800,
        fontSize: size,
        color: light ? colors.white : colors.navy,
        background: light ? colors.blue : colors.white,
        border: light ? `4px solid ${colors.white}` : "none",
        padding: "8px 26px",
        borderRadius: 40,
        opacity: t,
        transform: `translateY(${(1 - t) * 24}px) scale(${0.8 + 0.2 * t})`,
      }}
    >
      {text}
    </span>
  );
};
