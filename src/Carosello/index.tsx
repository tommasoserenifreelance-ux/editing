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

// First slide of a 4:5 carousel: Elena eating pasta, Santa Longevity style.
// Top to bottom in the lower third: pictogram, fixed title, subtitles.
// Source: GitHub release (Edits_carousel_slide1...MP4), transcoded to
// public/carosello/slide1_h264.mp4. Captions from a Whisper transcript.

export const CAROSELLO_FPS = 30;
export const CAROSELLO_DURATION = 623; // 20.77 s, length of the source clip

const s = (seconds: number) => Math.round(seconds * CAROSELLO_FPS);

const TITLE = ["Devo rinunciare", "alla pasta?"];

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0, to: 1.6, text: "Molto spesso quando mi vedete" },
  { from: 1.6, to: 3.24, text: "mangiare la pasta su Instagram" },
  { from: 3.24, to: 4.1, text: "mi scrivete:" },
  { from: 4.1, to: 5.1, text: "«Beata te, Elena," },
  { from: 5.1, to: 6.4, text: "che puoi mangiare la pasta!»" },
  { from: 6.4, to: 8.0, text: "E lo sento tutto il vostro dolore" },
  { from: 8.0, to: 9.04, text: "Ma non è così" },
  { from: 9.04, to: 10.52, text: "Non dovete rinunciare alla pasta" },
  { from: 10.52, to: 11.42, text: "e vi spiego perché" },
  { from: 11.42, to: 12.84, text: "Non perché ve lo dico io," },
  { from: 12.84, to: 15.0, text: "ma perché lo dicono gli esperti" },
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
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))",
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
            src={staticFile("emoji-spaghetti-3d.png")}
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
        fontSize: 50,
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

export const Carosello: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo
      src={staticFile("carosello/slide1_h264.mp4")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
