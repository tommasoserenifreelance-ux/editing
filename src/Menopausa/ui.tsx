import { AbsoluteFill } from "remotion";
import { anton, colors } from "./theme";

export const Slide: React.FC<{ source?: string; children: React.ReactNode }> = ({
  source,
  children,
}) => (
  <AbsoluteFill style={{ background: colors.bg, fontFamily: anton, color: colors.ink }}>
    <div style={{ position: "absolute", top: 130, left: 70, right: 70 }}>{children}</div>
    {source ? (
      <div
        style={{
          position: "absolute",
          bottom: 135,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 22,
          letterSpacing: 0.5,
          color: colors.muted,
        }}
      >
        {source}
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        bottom: 42,
        width: "100%",
        textAlign: "center",
        fontSize: 38,
        color: colors.blue,
      }}
    >
      @dr.michele.bonaccorso
    </div>
  </AbsoluteFill>
);

// Light-blue band behind the lower half of a word, as in the 2026 template.
export const Hl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      background: `linear-gradient(transparent 52%, ${colors.light} 52%, ${colors.light} 92%, transparent 92%)`,
      padding: "0 8px",
      margin: "0 -8px",
    }}
  >
    {children}
  </span>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 128,
}) => (
  <div style={{ fontSize: size, lineHeight: 1.04, textTransform: "uppercase" }}>{children}</div>
);

export const Blue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.blue }}>{children}</span>
);

export const Box: React.FC<{
  variant: "white" | "light" | "blue";
  children: React.ReactNode;
  height?: number;
}> = ({ variant, children, height = 170 }) => (
  <div
    style={{
      height,
      border: `5px solid ${colors.ink}`,
      borderRadius: 22,
      padding: "0 38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 30,
      background: variant === "white" ? colors.bg : variant === "light" ? colors.light : colors.blue,
      color: variant === "blue" ? colors.bg : colors.ink,
    }}
  >
    {children}
  </div>
);

export const Row: React.FC<{ n: string; top: string; bottom: string; last?: boolean }> = ({
  n,
  top,
  bottom,
  last,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 46,
      padding: "18px 0",
      borderBottom: last ? "none" : `2px solid ${colors.rule}`,
    }}
  >
    <div style={{ fontSize: 108, lineHeight: 1, color: colors.blue, width: 95 }}>{n}</div>
    <div style={{ fontSize: 50, lineHeight: 1.08 }}>
      <div>{top}</div>
      <div style={{ color: colors.blue }}>{bottom}</div>
    </div>
  </div>
);
