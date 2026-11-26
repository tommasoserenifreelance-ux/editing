import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ReformerDrawing } from "./ReformerDrawing";
import { colors, sans, serif } from "./theme";

const useRise = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
  };
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlight = spring({
    frame: frame - 28,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill style={{ padding: "0 100px", justifyContent: "center" }}>
      <div
        style={{
          ...useRise(0),
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 220,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          color: colors.accent,
        }}
      >
        5 motivi
      </div>
      <div
        style={{
          ...useRise(10),
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 64,
          color: colors.ink,
          marginTop: 30,
        }}
      >
        per iniziare
      </div>
      <div
        style={{
          ...useRise(20),
          marginTop: 18,
          position: "relative",
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-6px -24px",
            background: colors.ink,
            transformOrigin: "left",
            transform: `scaleX(${highlight})`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 104,
            letterSpacing: 4,
            color: colors.bg,
          }}
        >
          OGGI STESSO
        </div>
      </div>
      <div
        style={{
          ...useRise(34),
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 112,
          lineHeight: 1.05,
          color: colors.ink,
          marginTop: 50,
        }}
      >
        il Pilates
        <br />
        Reformer
      </div>
      <div style={{ marginTop: 110 }}>
        <ReformerDrawing delay={40} />
      </div>
    </AbsoluteFill>
  );
};
