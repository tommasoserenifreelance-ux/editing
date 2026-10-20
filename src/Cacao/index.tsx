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

// Framing per take: [seconds into the take, scale]. Zooming pivots on the
// bottom edge, which lifts the face (chin at most ~1090px in the raw takes)
// clear of the stickers and captions. Alternating scales hide the jump cuts
// between takes; a slow push-in keeps each shot alive.
const FRAMING: [number, number][][] = [
  [[0, 1.1]],
  [
    [0, 1.12],
    [12.72, 1.06],
  ],
  [
    [0, 1.06],
    [10.26, 1.14],
  ],
  [[0, 1.12]],
  [
    [0, 1.06],
    [8.08, 1.14],
  ],
  [[0, 1.12]],
];

const Take: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const keys = FRAMING[index];
  const k = keys.filter(([s]) => frame >= s * FPS).length - 1;
  const start = keys[k][0] * FPS;
  const end = k + 1 < keys.length ? keys[k + 1][0] * FPS : CLIPS[index];
  const drift = interpolate(frame, [start, end], [0, 0.02]);
  return (
    <OffthreadVideo
      src={staticFile(`cacao/doctor/cacao-${index + 1}.mp4`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${keys[k][1] + drift})`,
        transformOrigin: "50% 100%",
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
const CARD_WIDTH = 680;
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
  const fade = interpolate(
    frame,
    [0, 4, duration - 4, duration],
    [0, 1, 1, 0],
    {
      extrapolateRight: "clamp",
    },
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, ${colors.blue}, ${colors.navy} 75%)`,
          opacity: fade,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 240,
          gap: 18,
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

// Cut-out PNGs shown as stickers, centred between the chin and the captions.
// `box` is the opaque area of the 1080×1920 PNG.
const STICKER_TOP = 1060;
const STICKER_HEIGHT = 240;
const OUTLINE = 6;

const Sticker: React.FC<{
  file: string;
  box: { x: number; y: number; w: number; h: number };
  duration: number;
}> = ({ file, box, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 9, mass: 0.7 } });
  const out = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const scale = STICKER_HEIGHT / box.h;
  // A white die-cut border, then a soft shadow.
  const border = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0.7, 0.7],
    [-0.7, 0.7],
    [0.7, -0.7],
    [-0.7, -0.7],
  ]
    .map(([x, y]) => `drop-shadow(${x * OUTLINE}px ${y * OUTLINE}px 0 white)`)
    .join(" ");
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: STICKER_TOP }}>
      <div
        style={{
          filter: `${border} drop-shadow(0 18px 24px rgba(4,18,48,0.5))`,
          transform: `translateY(${Math.sin(frame / 10) * 5}px) scale(${interpolate(t, [0, 1], [0, 1]) * out}) rotate(${interpolate(t, [0, 1], [-25, -3])}deg)`,
        }}
      >
        <div
          style={{
            width: box.w * scale,
            height: box.h * scale,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(`cacao/img/${file}`)}
            style={{
              width: 1080 * scale,
              marginLeft: -box.x * scale,
              marginTop: -box.y * scale,
            }}
          />
        </div>
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
const STICKERS = [
  {
    file: "cocoa-sticker.png",
    box: { x: 96, y: 717, w: 888, h: 486 },
    from: 0,
    to: wordFrame(0, "ma"),
  },
  {
    file: "milk-chocolate.png",
    box: { x: 228, y: 606, w: 638, h: 676 },
    from: wordFrame(3, "tavoletta"),
    to: wordFrame(3, "dei"),
  },
];
const CAPTION_ZONES = [
  ...STICKERS.map((s) => ({
    from: s.from,
    to: s.to,
    top: STICKER_TOP + STICKER_HEIGHT + 15,
  })),
  { from: studiesFrom, to: studiesTo, top: 1130 },
];

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
  ...STICKERS.map((s) => ({ at: s.from, file: "pop", volume: 0.9 })),
  ...STICKERS.map((s) => ({ at: s.from, file: "whoosh", volume: 0.35 })),
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
      {STICKERS.map((s) => (
        <Sequence key={s.file} from={s.from} durationInFrames={s.to - s.from}>
          <Sticker file={s.file} box={s.box} duration={s.to - s.from} />
        </Sequence>
      ))}
      <Captions zones={CAPTION_ZONES} />
      {SOUNDS.map((s, i) => (
        <Sfx key={i} {...s} />
      ))}
    </AbsoluteFill>
  );
};
