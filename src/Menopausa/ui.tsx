import { AbsoluteFill } from "remotion";
import { anton, colors } from "./theme";

export const MARGIN = 90;

export const Slide: React.FC<{
  source?: string;
  background?: string;
  art?: React.ReactNode;
  children: React.ReactNode;
}> = ({ source, background = colors.bg, art, children }) => (
  <AbsoluteFill style={{ background, fontFamily: anton, color: colors.ink }}>
    {art}
    <div
      style={{
        position: "absolute",
        top: 70,
        left: MARGIN,
        right: MARGIN,
        fontSize: 22,
        letterSpacing: 4,
        color: colors.muted,
      }}
    >
      GIORNATA MONDIALE DELLA MENOPAUSA
    </div>
    <div
      style={{ position: "absolute", top: 190, left: MARGIN, right: MARGIN }}
    >
      {children}
    </div>
    {source ? (
      <div
        style={{
          position: "absolute",
          bottom: 118,
          left: MARGIN,
          right: MARGIN,
          fontSize: 18,
          letterSpacing: 1.5,
          color: colors.muted,
        }}
      >
        {source}
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: MARGIN,
        right: MARGIN,
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontSize: 28,
        color: colors.blue,
      }}
    >
      <div style={{ flex: 1, height: 2, background: colors.rule }} />
      @dr.michele.bonaccorso
      <div style={{ flex: 1, height: 2, background: colors.rule }} />
    </div>
  </AbsoluteFill>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      fontSize: 26,
      letterSpacing: 5,
      color: colors.pink,
      marginBottom: 28,
    }}
  >
    {children}
  </div>
);

// Soft rose band behind the lower half of a word, as in the 2026 template.
export const Hl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      background: `linear-gradient(transparent 56%, ${colors.pinkSoft} 56%, ${colors.pinkSoft} 92%, transparent 92%)`,
      padding: "0 6px",
      margin: "0 -6px",
    }}
  >
    {children}
  </span>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 96,
}) => <div style={{ fontSize: size, lineHeight: 1.04 }}>{children}</div>;

export const Blue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.blue }}>{children}</span>
);

export const Pink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.pink }}>{children}</span>
);

export const Body: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 38, style }) => (
  <div
    style={{ fontSize: size, lineHeight: 1.2, color: colors.body, ...style }}
  >
    {children}
  </div>
);

export const Row: React.FC<{ n: string; top: string; bottom: string }> = ({
  n,
  top,
  bottom,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 40,
      padding: "18px 0",
      borderTop: `2px solid ${colors.rule}`,
    }}
  >
    <div style={{ fontSize: 56, lineHeight: 1, color: colors.pink, width: 70 }}>
      {n}
    </div>
    <div style={{ fontSize: 40, lineHeight: 1.1 }}>
      <div>{top}</div>
      <div style={{ color: colors.blue }}>{bottom}</div>
    </div>
  </div>
);
