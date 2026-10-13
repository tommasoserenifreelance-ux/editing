import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DISPLAY_FONT, LIGHT_FONT } from "./fonts";
import { TrampolinoReelProps } from "./schema";

const FADE_SECONDS = 0.25;
const SHADOW =
  "0 2px 6px rgba(0,0,0,0.75), 0 0 18px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.9)";

const useFadeIn = (startSeconds: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = startSeconds * fps;
  const progress = interpolate(
    frame,
    [start, start + FADE_SECONDS * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
  };
};

const Lines: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split("\n").map((line, i) => (
      <div key={i}>{line}</div>
    ))}
  </>
);

const Hook: React.FC<{ title: string; subtitle: string; end: number }> = ({
  title,
  subtitle,
  end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 0.2 * fps, (end - FADE_SECONDS) * fps, end * fps],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 30% at 50% 64%, rgba(0,0,0,0.45), rgba(0,0,0,0.12))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1120,
          width: "100%",
          textAlign: "center",
          textShadow: SHADOW,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 104,
            lineHeight: 1.02,
            color: "#F7EDCF",
            textTransform: "uppercase",
          }}
        >
          <Lines text={title} />
        </div>
        <div
          style={{
            fontFamily: LIGHT_FONT,
            fontWeight: 300,
            fontSize: 54,
            marginTop: 14,
            color: "white",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Label: React.FC<{
  text: string;
  side: "left" | "right" | "center";
  y: number;
  start: number;
}> = ({ text, side, y, start }) => {
  const fade = useFadeIn(start);
  const columnCenter = side === "left" ? 230 : side === "right" ? 835 : 540;
  const width = side === "center" ? 1000 : 520;

  return (
    <div
      style={{
        position: "absolute",
        left: columnCenter - width / 2,
        top: y,
        width,
        translate: "0 -50%",
        textAlign: "center",
        fontFamily: DISPLAY_FONT,
        fontSize: 60,
        lineHeight: 1.05,
        color: "white",
        textTransform: "uppercase",
        textShadow: SHADOW,
        ...fade,
      }}
    >
      <Lines text={text} />
    </div>
  );
};

const Headline: React.FC<{ text: string; start: number }> = ({
  text,
  start,
}) => {
  const fade = useFadeIn(start);
  const [left, right] = text.split(">");

  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        width: "100%",
        textAlign: "center",
        fontFamily: DISPLAY_FONT,
        fontSize: 60,
        color: "white",
        textTransform: "uppercase",
        textShadow: SHADOW,
        ...fade,
      }}
    >
      {right === undefined ? (
        text
      ) : (
        <>
          {left.trim()}
          <span style={{ fontSize: 84, margin: "0 10px", lineHeight: 0 }}>
            &gt;
          </span>
          {right.trim()}
        </>
      )}
    </div>
  );
};

export const TrampolinoReel: React.FC<TrampolinoReelProps> = ({
  videoSrc,
  musicSrc,
  musicVolume,
  hookTitle,
  hookSubtitle,
  headline,
  labels,
  hookEnd,
  firstLabelAt,
  labelInterval,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile(videoSrc)} muted />
      <Html5Audio src={staticFile(musicSrc)} volume={musicVolume} />
      <Hook title={hookTitle} subtitle={hookSubtitle} end={hookEnd} />
      <Headline text={headline} start={hookEnd} />
      {labels.map((label, i) => (
        <Label
          key={i}
          text={label.text}
          side={label.side}
          y={label.y}
          start={firstLabelAt + i * labelInterval}
        />
      ))}
    </AbsoluteFill>
  );
};
