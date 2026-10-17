import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { asset, colors, sans, serif } from "./theme";

// Media from 9:16 sources, cropped to 4:5 with a slow push-in.
export const Background: React.FC<{
  video?: string;
  image?: string;
  position: string;
  zoom?: [number, number];
}> = ({ video, image, position, zoom = [1, 1] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], zoom);
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: position,
    transform: `scale(${scale})`,
    transformOrigin: position,
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {video ? (
        <OffthreadVideo src={asset(video)} style={style} />
      ) : (
        <Img src={asset(image!)} style={style} />
      )}
    </AbsoluteFill>
  );
};

// Darkens the text area so white copy stays readable on any frame.
export const Shade: React.FC<{ from?: number }> = ({ from = 38 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(14,18,14,0.38) 0%, rgba(14,18,14,0) 16%, rgba(14,18,14,0) ${from}%, ${colors.shade} 82%, rgba(14,18,14,0.92) 100%)`,
    }}
  />
);

export const Pictogram: React.FC = () => (
  <AbsoluteFill style={{ padding: "56px 64px" }}>
    <Img src={asset("pittogramma.png")} style={{ width: 84, height: 84 }} />
  </AbsoluteFill>
);

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 76 }) => (
  <div
    style={{
      fontFamily: serif,
      fontWeight: 700,
      fontStyle: "italic",
      fontSize: size,
      lineHeight: 1.08,
      color: colors.ink,
      marginBottom: 30,
      textShadow: "0 4px 24px rgba(0,0,0,0.35)",
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 400,
      fontSize: 32,
      lineHeight: 1.42,
      color: colors.soft,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Content: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 72px 76px" }}>
    {children}
  </AbsoluteFill>
);

// Numbered row: accent index, then the step text.
export const Step: React.FC<{ n: string; children: React.ReactNode }> = ({
  n,
  children,
}) => (
  <div
    style={{
      display: "flex",
      gap: 26,
      alignItems: "baseline",
      padding: "14px 0",
      borderTop: "1px solid rgba(255,255,255,0.22)",
    }}
  >
    <div
      style={{
        fontFamily: serif,
        fontWeight: 700,
        fontStyle: "italic",
        fontSize: 38,
        color: colors.accent,
        minWidth: 70,
      }}
    >
      {n}
    </div>
    <Body>{children}</Body>
  </div>
);

export const Strong: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <span style={{ color: colors.ink, fontWeight: 600 }}>{children}</span>;
