import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cream, gold, red, sans, serif } from "./theme";

export type Line = { text: string; kind: "small" | "big" | "badge" };

const styles: Record<Line["kind"], React.CSSProperties> = {
  small: {
    fontFamily: sans,
    fontWeight: 700,
    fontSize: 62,
    color: cream,
    letterSpacing: 1,
    textShadow: "0 4px 18px rgba(0,0,0,0.6)",
  },
  big: {
    fontFamily: serif,
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: 136,
    lineHeight: 1.05,
    color: gold,
    textShadow: "0 0 24px rgba(242,198,109,0.55), 0 6px 20px rgba(0,0,0,0.6)",
  },
  badge: {
    fontFamily: sans,
    fontWeight: 700,
    fontSize: 96,
    letterSpacing: 4,
    color: "#fff",
    background: red,
    padding: "6px 34px",
    borderRadius: 18,
    border: `4px solid ${gold}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
  },
};

export const Caption: React.FC<{ lines: Line[]; duration: number }> = ({
  lines,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 430,
        textAlign: "center",
        opacity: exit,
      }}
    >
      <div
        style={{
          padding: "34px 56px 40px",
          borderRadius: 40,
          background: "rgba(36,2,10,0.62)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(242,198,109,0.45)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          opacity: Math.min(
            1,
            spring({ frame, fps, config: { damping: 200 } }) * 1.5,
          ),
        }}
      >
        {lines.map((line, i) => {
          const s = spring({
            frame: frame - i * 5,
            fps,
            config: { damping: 13, mass: 0.7 },
          });
          return (
            <div
              key={line.text}
              style={{
                marginTop: line.kind === "badge" ? 24 : 6,
                opacity: Math.min(1, s * 2),
                transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
              }}
            >
              <span style={{ display: "inline-block", ...styles[line.kind] }}>
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
