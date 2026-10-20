import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./Captions";
import { CLIPS, FPS, phrases, wordFrame } from "./script";
import { colors } from "./theme";

export { DURATION as CACAO_DURATION, FPS as CACAO_FPS } from "./script";

// Framing per take: [seconds into the take, scale]. Alternating scales hide
// the jump cuts between takes; a slow push-in keeps each shot alive.
const FRAMING: [number, number][][] = [
  [[0, 1]],
  [
    [0, 1.12],
    [12.72, 1],
  ],
  [
    [0, 1],
    [10.26, 1.18],
  ],
  [[0, 1.12]],
  [
    [0, 1],
    [8.08, 1.15],
  ],
  [[0, 1.12]],
];

const Take: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const keys = FRAMING[index];
  const k = keys.filter(([s]) => frame >= s * FPS).length - 1;
  const start = keys[k][0] * FPS;
  const end = k + 1 < keys.length ? keys[k + 1][0] * FPS : CLIPS[index];
  const drift = interpolate(frame, [start, end], [0, 0.035]);
  return (
    <OffthreadVideo
      src={staticFile(`cacao/doctor/cacao-${index + 1}.mp4`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${keys[k][1] + drift})`,
        transformOrigin: "50% 30%",
      }}
    />
  );
};

const BRoll: React.FC<{ src: string; startFrom?: number }> = ({
  src,
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        muted
        src={staticFile(`cacao/broll/${src}`)}
        startFrom={startFrom}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.02 + frame * 0.0006})`,
        }}
      />
      {/* Darken the lower half so the captions stay readable. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(4,18,48,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const usePopIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
};

// PubMed screenshots, cropped to the title block: [file, top, bottom] in px.
const STUDIES: [string, number, number][] = [
  ["study-desch-2010.jpg", 585, 1030],
  ["study-hooper-2012.jpg", 575, 1180],
  ["study-lin-2016.jpg", 565, 1100],
];
const CARD_WIDTH = 800;
const SOURCE_WIDTH = 1320;
const STUDY_GAP = 15; // frames between cards: tac, tac, tac

const StudyCard: React.FC<{
  file: string;
  top: number;
  bottom: number;
  tilt: number;
}> = ({ file, top, bottom, tilt }) => {
  const t = usePopIn();
  const scale = CARD_WIDTH / SOURCE_WIDTH;
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: (bottom - top) * scale,
        overflow: "hidden",
        borderRadius: 22,
        background: "white",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        border: `5px solid ${colors.blue}`,
        transform: `scale(${interpolate(t, [0, 1], [0.5, 1])}) rotate(${tilt * t}deg)`,
        opacity: Math.min(1, t * 3),
      }}
    >
      <Img
        src={staticFile(`cacao/img/${file}`)}
        style={{ width: CARD_WIDTH, marginTop: -top * scale }}
      />
    </div>
  );
};

const Studies: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [0, 6, duration - 4, duration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ backgroundColor: colors.navy, opacity: 0.78 * dim }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 110,
          gap: 26,
          opacity: interpolate(frame, [duration - 4, duration], [1, 0], {
            extrapolateLeft: "clamp",
          }),
        }}
      >
        {STUDIES.map(([file, top, bottom], i) => (
          <Sequence key={file} from={i * STUDY_GAP} layout="none">
            <StudyCard
              file={file}
              top={top}
              bottom={bottom}
              tilt={[-2, 1.5, -1][i]}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The milk chocolate cut-out, cropped around the bars and the splash.
const MilkChocolate: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const t = usePopIn();
  const out = interpolate(frame, [duration - 5, duration], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const crop = { x: 220, y: 580, w: 660, h: 720 };
  const width = 480;
  const scale = width / crop.w;
  // Floats by the doctor's shoulder, clear of his face and the captions.
  return (
    <AbsoluteFill style={{ alignItems: "flex-end", paddingTop: 760 }}>
      <div
        style={{
          width,
          height: crop.h * scale,
          overflow: "hidden",
          marginRight: -30,
          filter: "drop-shadow(0 24px 30px rgba(4,18,48,0.55))",
          transform: `translateY(${Math.sin(frame / 12) * 8}px) scale(${interpolate(t, [0, 1], [0.3, 1]) * out}) rotate(${interpolate(t, [0, 1], [-14, 4])}deg)`,
        }}
      >
        <Img
          src={staticFile("cacao/img/milk-chocolate.png")}
          style={{
            width: 1080 * scale,
            marginLeft: -crop.x * scale,
            marginTop: -crop.y * scale,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; file: string; volume: number }> = ({
  at: from,
  file,
  volume,
}) => (
  <Sequence from={from} durationInFrames={FPS * 2} layout="none">
    <Html5Audio src={staticFile(`sfx/${file}.wav`)} volume={volume} />
  </Sequence>
);

// Moments (global frames) where overlays start and stop.
const studiesFrom = wordFrame(1, "Diverse");
const studiesTo = wordFrame(1, "mostrano");
const BROLLS: { src: string; from: number; to: number; startFrom?: number }[] =
  [
    { src: "cocoa-pods.mp4", from: studiesTo, to: wordFrame(1, "riduce") },
    {
      src: "chocolate-pour.mp4",
      from: wordFrame(2, "La"),
      to: wordFrame(2, "distrugge"),
    },
    {
      src: "cocoa-powder.mp4",
      from: wordFrame(4, "cacao"),
      to: wordFrame(4, "o"),
    },
  ];
const milkFrom = wordFrame(3, "peggio");
const milkTo = wordFrame(3, "dei");

const SOUNDS: { at: number; file: string; volume: number }[] = [
  // A soft tick whenever a blue box lands.
  ...phrases.reduce<{ at: number; file: string; volume: number }[]>(
    (acc, p) =>
      acc.concat(
        p.lines
          .filter((l) => l.style === "x")
          .map((l) => ({ at: l.words[0].from, file: "tick", volume: 0.5 })),
      ),
    [],
  ),
  ...STUDIES.map((_, i) => ({
    at: studiesFrom + i * STUDY_GAP,
    file: "pop",
    volume: 0.9,
  })),
  { at: milkFrom, file: "pop", volume: 0.9 },
  ...BROLLS.map((b) => ({ at: b.from - 6, file: "whoosh", volume: 0.45 })),
  { at: wordFrame(1, "3-5"), file: "ding", volume: 0.45 },
  { at: wordFrame(4, "70%"), file: "ding", volume: 0.45 },
];

export const Cacao: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {CLIPS.map((frames, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Take index={i} />
          </Series.Sequence>
        ))}
      </Series>
      {BROLLS.map((b) => (
        <Sequence key={b.src} from={b.from} durationInFrames={b.to - b.from}>
          <BRoll src={b.src} startFrom={b.startFrom} />
        </Sequence>
      ))}
      <Sequence from={studiesFrom} durationInFrames={studiesTo - studiesFrom}>
        <Studies duration={studiesTo - studiesFrom} />
      </Sequence>
      <Sequence from={milkFrom} durationInFrames={milkTo - milkFrom}>
        <MilkChocolate duration={milkTo - milkFrom} />
      </Sequence>
      <Captions />
      {SOUNDS.map((s, i) => (
        <Sfx key={i} {...s} />
      ))}
    </AbsoluteFill>
  );
};
