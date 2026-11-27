import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FLAKES = 150;

// Deterministic snowfall: near flakes are bigger, faster and blurred.
export const Snow: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: FLAKES }).map((_, i) => {
        const depth = random(`d${i}`);
        const size = 4 + depth * 16;
        const speed = 1.2 + depth * 3.5;
        const span = height + 60;
        const y = ((random(`y${i}`) * span + frame * speed) % span) - 30;
        const sway =
          Math.sin(frame / (25 + random(`s${i}`) * 30) + i) * (10 + depth * 25);
        const x = random(`x${i}`) * width + sway;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 45%, rgba(255,255,255,0) 72%)",
              opacity: 0.45 + depth * 0.5,
              filter: depth > 0.85 ? "blur(2px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
