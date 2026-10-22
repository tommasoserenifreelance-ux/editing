import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, sans, serif } from "./theme";

export const Reason: React.FC<{
  index: number;
  total: number;
  lines: string[];
}> = ({ index, total, lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const num = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const rule = spring({ frame: frame - 10, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: "0 100px", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: colors.muted }}>
          MOTIVO
        </div>
        <div style={{ height: 3, width: 220 * rule, background: colors.accent }} />
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 460,
          lineHeight: 0.9,
          color: colors.accent,
          transform: `scale(${interpolate(num, [0, 1], [0.6, 1])})`,
          transformOrigin: "left bottom",
          opacity: Math.min(1, num * 1.5),
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div style={{ marginTop: 60 }}>
        {lines.map((line, i) => {
          const s = spring({ frame: frame - 14 - i * 6, fps, config: { damping: 200 } });
          return (
            <div key={line} style={{ overflow: "hidden", paddingTop: 16 }}>
              <div
                style={{
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: 104,
                  lineHeight: 1.05,
                  color: colors.ink,
                  transform: `translateY(${interpolate(s, [0, 1], [110, 0])}%)`,
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 160, left: 100, display: "flex", gap: 16 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 10,
              width: i + 1 === index ? 80 : 30,
              borderRadius: 5,
              background: i + 1 <= index ? colors.accent : colors.muted,
              opacity: i + 1 <= index ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
