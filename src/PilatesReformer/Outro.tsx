import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, sans, serif } from "./theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const btn = spring({ frame: frame - 24, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - 45) / 6) * 0.02;

  return (
    <AbsoluteFill style={{ padding: "0 100px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ opacity: a, transform: `translateY(${interpolate(a, [0, 1], [50, 0])}px)`, fontFamily: sans, fontWeight: 500, fontSize: 60, color: colors.muted }}>
        Non aspettare domani.
      </div>
      <div style={{ opacity: b, transform: `translateY(${interpolate(b, [0, 1], [50, 0])}px)`, fontFamily: serif, fontStyle: "italic", fontWeight: 600, fontSize: 210, lineHeight: 1, color: colors.accent, marginTop: 30 }}>
        Inizia oggi.
      </div>
      <div
        style={{
          marginTop: 110,
          padding: "38px 70px",
          borderRadius: 999,
          background: colors.ink,
          color: colors.bg,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 44, whiteSpace: "nowrap",
          letterSpacing: 2,
          transform: `scale(${btn * pulse})`,
        }}
      >
        Prenota la tua prima lezione
      </div>
    </AbsoluteFill>
  );
};
