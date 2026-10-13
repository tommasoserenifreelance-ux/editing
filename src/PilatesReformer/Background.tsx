import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "./theme";

// Soft, slowly drifting shapes shared by every scene.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 60) * 30;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: colors.bgDeep,
          top: -260 + drift,
          right: -380,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: colors.sage,
          opacity: 0.18,
          bottom: -200 - drift,
          left: -240,
        }}
      />
    </AbsoluteFill>
  );
};
