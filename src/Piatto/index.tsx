import {
  AbsoluteFill,
  Audio,
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

// Plate built from above, Santa Longevity style: each ingredient gets a
// label as it lands on the plate. Source: GitHub release
// "clip-piatto-santa-longevity" (Timeline.1.mp4 → public/piatto/timeline_1.mp4).

export const PIATTO_FPS = 24;
export const PIATTO_DURATION = 616; // 25.66 s, length of the source clip

const s = (seconds: number) => Math.round(seconds * PIATTO_FPS);

// Cut from the intro (plate in hand) to the overhead shot.
const OVERHEAD_AT = 6.5;

const HEADLINE = ["Il tuo spuntino longevity", "potrebbe essere così"];

// When each ingredient is in place, and where its label sits (centre, px).
const LABELS: { text: string; at: number; x: number; y: number }[] = [
  { text: "Fichi", at: 7.25, x: 330, y: 370 },
  { text: "Mandorle", at: 10.25, x: 920, y: 520 },
  { text: "Datteri", at: 12, x: 500, y: 700 },
  { text: "Cioccolato fondente", at: 14, x: 230, y: 590 },
  { text: "Lamponi", at: 16, x: 800, y: 930 },
  { text: "Kiwi", at: 18.75, x: 540, y: 1080 },
  { text: "Chia", at: 20.5, x: 190, y: 1060 },
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
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

const Label: React.FC<{
  text: string;
  x: number;
  y: number;
  color: string;
}> = ({ text, x, y, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.6 } });
  return (
    <div
      style={{
        ...pill,
        position: "absolute",
        left: x,
        top: y,
        background: color,
        fontSize: 40,
        padding: "8px 26px",
        opacity: Math.min(1, pop * 2),
        transform: `translate(-50%, -50%) scale(${pop})`,
      }}
    >
      {text}
    </div>
  );
};

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 330,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 130,
          marginBottom: 18,
          opacity: enter,
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px) rotate(-2deg)`,
        }}
      >
        <div
          style={{
            ...pill,
            background: YELLOW,
            fontSize: 64,
            padding: "12px 46px",
          }}
        >
          {HEADLINE[0]}
        </div>
        <div
          style={{
            ...pill,
            background: LILAC,
            fontSize: 56,
            fontWeight: 500,
            padding: "10px 42px",
            marginTop: -4,
          }}
        >
          {HEADLINE[1]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Piatto: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo
      src={staticFile("piatto/timeline_1_graded.mp4")}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    {LABELS.map((l, i) => (
      <Sequence key={l.text} from={s(l.at)}>
        <Label
          text={l.text}
          x={l.x}
          y={l.y}
          color={i % 2 === 0 ? YELLOW : LILAC}
        />
        <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
      </Sequence>
    ))}
    <Headline />
    {/* Song from the reference reel, looped by scripts/loop-song.py */}
    <Audio src={staticFile("piatto/song-looped.wav")} volume={0.8} />
    <Sequence from={s(OVERHEAD_AT) - 6}>
      <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
    </Sequence>
  </AbsoluteFill>
);
