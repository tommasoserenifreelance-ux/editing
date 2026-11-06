import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

// Cover video of the vibration plate carousel (4:5), Santa Longevity style.
// The 9:16 source is cropped full-bleed to 4:5 and straightened (the shot
// leans ~2.5°). Pictogram, title and subtitles in the lower third, as on
// the pasta carousel cover. Source: GitHub release (pedana.mov), transcoded to
// public/pedana/pedana_h264.mp4. Captions from Whisper.

export const PEDANA_FPS = 24;
export const PEDANA_DURATION = 146; // 6.08 s, length of the source clip

const s = (seconds: number) => Math.round(seconds * PEDANA_FPS);

const SRC = "pedana/pedana_h264.mp4";
// Top of the 1080×1920 source shown in the 1350 px tall frame.
const CROP_TOP = 490;
const TILT_FIX_DEG = -2.5;
const ZOOM = 1.06; // hides the corners left by the rotation

const TITLE = ["Pedana vibrante:", "funziona davvero?"];

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.25, to: 2.5, text: "Conoscevi la pedana vibrante?" },
  { from: 2.85, to: 3.7, text: "Io sì!" },
  { from: 3.9, to: 4.8, text: "Scorri le slide" },
  { from: 4.8, to: 6.08, text: "per saperne di più!" },
];

const YELLOW = "#EEF7A3";
const LILAC = "#D9C4F1";

const pill: React.CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  color: "#1F1F1F",
  fontFamily: sans,
  fontWeight: 700,
  whiteSpace: "nowrap",
  boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px)`,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 110,
          marginBottom: 14,
          filter:
            "drop-shadow(0 2px 4px rgba(0,0,0,0.6)) drop-shadow(0 0 14px rgba(0,0,0,0.4))",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: "rotate(-2deg)",
        }}
      >
        <div
          style={{
            ...pill,
            background: YELLOW,
            fontSize: 66,
            padding: "10px 46px",
          }}
        >
          {TITLE[0]}
        </div>
        <div
          style={{
            ...pill,
            background: LILAC,
            fontSize: 66,
            padding: "10px 46px",
            marginTop: -4,
          }}
        >
          {TITLE[1]}
          {/* Fluent Emoji 3D (Microsoft, MIT licence) */}
          <Img
            src={staticFile("emoji-high-voltage-3d.png")}
            style={{
              width: 104,
              margin: "-24px -30px -24px 10px",
              verticalAlign: "middle",
              transform: "rotate(8deg)",
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Caption: React.FC<{ text: string; duration: number }> = ({
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 3, duration - 3, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1150,
        textAlign: "center",
        opacity,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 52,
        lineHeight: 1.2,
        color: "white",
        padding: "0 60px",
        WebkitTextStroke: "6px rgba(40,40,40,0.6)",
        paintOrder: "stroke fill",
        textShadow: "0 4px 16px rgba(0,0,0,0.45)",
      }}
    >
      {text}
    </div>
  );
};

export const Pedana: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo
      src={staticFile(SRC)}
      style={{
        position: "absolute",
        width: 1080,
        height: 1920,
        left: 0,
        top: -CROP_TOP,
        transformOrigin: `540px ${CROP_TOP + 675}px`,
        transform: `rotate(${TILT_FIX_DEG}deg) scale(${ZOOM})`,
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 790 }}>
      <Title />
    </AbsoluteFill>
    {CAPTIONS.map((c) => (
      <Sequence
        key={c.text}
        from={s(c.from)}
        durationInFrames={s(c.to) - s(c.from)}
      >
        <Caption text={c.text} duration={s(c.to) - s(c.from)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
