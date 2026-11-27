import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { gold } from "./theme";

const STARS = 26;

const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20">
    <path
      d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z"
      fill="#fff8e1"
      style={{ filter: `drop-shadow(0 0 4px ${gold})` }}
    />
  </svg>
);

// Twinkling four-point stars plus a few drifting warm bokeh lights.
export const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const size = 140 + random(`bs${i}`) * 160;
        return (
          <div
            key={`b${i}`}
            style={{
              position: "absolute",
              left:
                random(`bx${i}`) * width -
                size / 2 +
                Math.sin(frame / 70 + i) * 40,
              top:
                random(`by${i}`) * height -
                size / 2 +
                Math.cos(frame / 90 + i) * 40,
              width: size,
              height: size,
              borderRadius: "50%",
              background:
                i % 2 ? "rgba(255,196,94,0.22)" : "rgba(255,90,80,0.16)",
              filter: "blur(30px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      {Array.from({ length: STARS }).map((_, i) => {
        const period = 40 + random(`p${i}`) * 50;
        const t = Math.sin(
          ((frame + random(`o${i}`) * period) / period) * Math.PI * 2,
        );
        const v = Math.max(0, t);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`sx${i}`) * width,
              top: random(`sy${i}`) * height * 0.85,
              opacity: v,
              transform: `scale(${0.4 + v * 0.8}) rotate(${frame * 1.5}deg)`,
            }}
          >
            <Star size={22 + random(`ss${i}`) * 26} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
