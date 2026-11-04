import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  Series,
  staticFile,
  useVideoConfig,
} from "remotion";
import { mono } from "./fonts";
import { Receipt, RECEIPT_W } from "./Receipt";
import type { BeatProps } from "./schema";

export const BEAT_FPS = 24;
export const BEAT_DURATION = 228; // 9.5 s, like the reference

// Stand-in for the overhead pass shot until real footage is dropped in.
const SteelBench: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 45% 70%, #9aa7ad 0%, #6f7c83 45%, #4b555b 100%)",
    }}
  >
    <svg width="100%" height="100%" style={{ position: "absolute" }}>
      <filter id="brushed">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.004 0.35"
          numOctaves={3}
          seed={4}
        />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0" />
      </filter>
      <rect
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filter="url(#brushed)"
        transform="rotate(-18 540 960)"
      />
    </svg>
  </AbsoluteFill>
);

type Clip = BeatProps["clips"][number];

const ClipVideo: React.FC<{ c: Clip; style?: React.CSSProperties }> = ({
  c,
  style,
}) => {
  const { fps } = useVideoConfig();
  const fill: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  };
  if (/\.(png|jpe?g)$/i.test(c.src)) {
    return <Img src={staticFile(c.src)} style={fill} />;
  }
  return (
    <OffthreadVideo
      src={staticFile(c.src)}
      startFrom={Math.round(c.startFrom * fps)}
      playbackRate={c.playbackRate}
      muted
      style={fill}
    />
  );
};

// Clone-stamp: covers a small area with bench texture taken from (x+dx, y+dy).
// Coordinates are in source-clip pixels (1920x1080).
const Patch: React.FC<{ c: Clip; p: NonNullable<Clip["patches"]>[number] }> = ({
  c,
  p,
}) => {
  const { width, height } = useVideoConfig();
  const k = width / 1920;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x * k,
        top: p.y * k,
        width: p.w * k,
        height: p.h * k,
        overflow: "hidden",
        maskImage: "radial-gradient(closest-side, black 60%, transparent)",
        WebkitMaskImage:
          "radial-gradient(closest-side, black 60%, transparent)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -(p.x + p.dx) * k,
          top: -(p.y + p.dy) * k,
          width,
          height,
        }}
      >
        <ClipVideo c={c} />
      </div>
    </div>
  );
};

const Footage: React.FC<{ clips: BeatProps["clips"] }> = ({ clips }) => {
  const { fps } = useVideoConfig();
  if (clips.length === 0) return <SteelBench />;
  return (
    <Series>
      {clips.map((c, i) => (
        <Series.Sequence
          key={i}
          durationInFrames={Math.round(c.duration * fps)}
        >
          <ClipVideo c={c} />
          {(c.patches ?? []).map((p, j) => (
            <Patch key={j} c={c} p={p} />
          ))}
        </Series.Sequence>
      ))}
    </Series>
  );
};

const Logo: React.FC<{
  src: string;
  text: string;
  width: number;
  height: number;
}> = ({ src, text, width, height }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    {src ? (
      <Img src={staticFile(src)} style={{ height: height * 0.28 }} />
    ) : (
      <div
        style={{
          fontFamily: mono,
          fontWeight: 800,
          color: "white",
          fontSize: width * 0.045,
          lineHeight: 0.95,
          letterSpacing: -1,
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
    )}
  </AbsoluteFill>
);

export const BeatRestaurant: React.FC<BeatProps> = (props) => {
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  // Receipt sits top-right, sized relative to the frame like the reference.
  const portrait = height > width;
  // Reference (1100x720): receipt ~0.31 H wide, centred at 73% W, top at 20% H.
  const receiptW = portrait ? width * 0.34 : height * 0.31;
  const scale = receiptW / RECEIPT_W;

  return (
    <AbsoluteFill style={{ background: "#555" }}>
      <Footage clips={props.clips} />
      {/* Hard pop in / out, no easing — matches the reference. */}
      <Sequence
        from={f(props.receiptIn)}
        durationInFrames={f(props.receiptOut) - f(props.receiptIn)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            right: portrait ? width * 0.07 : width * 0.27 - receiptW / 2,
            top: height * (portrait ? 0.14 : 0.2),
            transform: `scale(${scale})`,
            transformOrigin: "top right",
          }}
        >
          {/* Strike timings are absolute, so shift them back by the sequence offset. */}
          <Receipt
            data={{
              ...props,
              dishes: props.dishes.map((d) => ({
                ...d,
                strikeAt: d.strikeAt - f(props.receiptIn) / fps,
              })),
            }}
            strikeFrames={4}
          />
        </div>
      </Sequence>
      <Sequence from={f(props.logoIn)} durationInFrames={durationInFrames}>
        <Logo
          src={props.logoSrc}
          text={props.logoText}
          width={width}
          height={height}
        />
      </Sequence>
      {props.music ? <Audio src={staticFile(props.music)} /> : null}
    </AbsoluteFill>
  );
};
