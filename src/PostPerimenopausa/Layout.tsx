import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts } from "./theme";

export const PAD = 90;

export const Slide: React.FC<{
  background: string;
  footerColor: string;
  arrow?: boolean;
  children: React.ReactNode;
}> = ({ background, footerColor, arrow = true, children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: background, fontFamily: fonts.sans }}>
      {children}
      <div
        style={{
          position: "absolute",
          left: PAD,
          bottom: 52,
          fontSize: 18,
          letterSpacing: 4,
          fontWeight: 500,
          color: footerColor,
          opacity: 0.85,
        }}
      >
        DR.SSA ELEONORA PICCOLO
      </div>
      {arrow ? <Arrow color={footerColor} /> : null}
    </AbsoluteFill>
  );
};

const Arrow: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width={150}
    height={24}
    viewBox="0 0 150 24"
    style={{ position: "absolute", right: PAD, bottom: 48 }}
  >
    <line x1={0} y1={12} x2={144} y2={12} stroke={color} strokeWidth={3} />
    <polyline
      points="132,3 145,12 132,21"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);

export const Title: React.FC<{
  color: string;
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ color, size = 66, children, style }) => (
  <div
    style={{
      fontFamily: fonts.serif,
      fontSize: size,
      lineHeight: 1.12,
      color,
      letterSpacing: -0.5,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{
  color?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ color = colors.ink, children, style }) => (
  <div
    style={{
      fontSize: 37,
      lineHeight: 1.38,
      fontWeight: 300,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Bullets: React.FC<{ items: string[]; color?: string; dot: string }> = ({
  items,
  color = colors.ink,
  dot,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 30 }}>
    {items.map((item) => (
      <div
        key={item}
        style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 37, fontWeight: 300, color }}
      >
        <span style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: dot, flexShrink: 0 }} />
        {item}
      </div>
    ))}
  </div>
);

export const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontStyle: "italic" }}>{children}</span>
);
