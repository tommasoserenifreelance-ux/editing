import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Fast cinematic montage modelled on the fourth reference (25 fps, 24 s):
// 32 shots cut exactly on the reference's cut frames, every moment used once,
// then a slow end shot of the Beat menu fading up from black like the
// reference's logo card. Client's own grade, reference music.
// Clip: public/beat/montage/c4.mp4 (beat.ref.4). beat.ref.5 (plates on the
// yellow placemat) is for the plated-sushi format, not used here.
export const MONTAGE_FPS = 25;

type Shot = { clip: "c4"; from: number; frames: number; rate?: number };

// Shot lengths = gaps between the reference's cuts (frames 6, 12, 18, 25,
// 43, 49, 61, 79, 89, 97, 115, 150, 167, 177, 190, 195, 202, 220, 237, 272,
// 290, 308, 325, 332, 343, 361, 378, 414, 431, 447, 484, 502).
const SHOTS: Shot[] = [
  { clip: "c4", from: 0.5, frames: 6 }, // chef at work
  { clip: "c4", from: 5.2, frames: 6 }, // hands on the rice
  { clip: "c4", from: 13.2, frames: 6 }, // piping on nori
  { clip: "c4", from: 34.2, frames: 7 }, // wine wall
  { clip: "c4", from: 6.5, frames: 18 }, // spreading rice
  { clip: "c4", from: 25.2, frames: 6 }, // tuna roll close
  { clip: "c4", from: 2.0, frames: 12 }, // chef
  { clip: "c4", from: 16.3, frames: 18 }, // piping on the roll
  { clip: "c4", from: 15.2, frames: 10 }, // piping on nori
  { clip: "c4", from: 36.1, frames: 8 }, // booth
  { clip: "c4", from: 30.2, frames: 18 }, // orange garnish
  { clip: "c4", from: 20.5, frames: 35, rate: 0.6 }, // piping, slow
  { clip: "c4", from: 9.5, frames: 17 }, // pressing the rice
  { clip: "c4", from: 37.2, frames: 10 }, // dining room
  { clip: "c4", from: 26.4, frames: 13 }, // crispy topping
  { clip: "c4", from: 33.0, frames: 5 }, // sauce
  { clip: "c4", from: 14.2, frames: 7 }, // piping on nori
  { clip: "c4", from: 19.3, frames: 18 }, // piping on the roll
  { clip: "c4", from: 31.4, frames: 17 }, // garnish
  { clip: "c4", from: 33.2, frames: 35, rate: 0.5 }, // sauce drizzle, slow
  { clip: "c4", from: 38.3, frames: 18 }, // tables
  { clip: "c4", from: 11.2, frames: 18 }, // hands on the rice
  { clip: "c4", from: 27.8, frames: 17 }, // crispy topping
  { clip: "c4", from: 35.1, frames: 7 }, // wine wall
  { clip: "c4", from: 3.5, frames: 11 }, // chef
  { clip: "c4", from: 32.2, frames: 18 }, // garnish
  { clip: "c4", from: 22.5, frames: 17 }, // piping close
  { clip: "c4", from: 28.8, frames: 36, rate: 0.6 }, // tray, slow
  { clip: "c4", from: 18.3, frames: 17 }, // piping on the roll
  { clip: "c4", from: 8.0, frames: 16 }, // rice on nori
  { clip: "c4", from: 39.0, frames: 37, rate: 0.6 }, // dining room, slow
  { clip: "c4", from: 24.0, frames: 18 }, // last dollop
];
const END = { clip: "c4" as const, from: 40.0, frames: 95, rate: 0.3 }; // the Beat menu

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].frames],
  [],
);
const END_AT = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].frames; // 502
export const MONTAGE_DURATION = END_AT + END.frames; // 597

const full: React.CSSProperties = { width: "100%", height: "100%" };

const Clip: React.FC<{ s: Shot; style?: React.CSSProperties }> = ({
  s,
  style,
}) => (
  <OffthreadVideo
    src={staticFile(`beat/montage/${s.clip}.mp4`)}
    startFrom={Math.round(s.from * MONTAGE_FPS)}
    playbackRate={s.rate ?? 1}
    muted
    style={{ ...full, ...style }}
  />
);

const EndShot: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return <Clip s={END} style={{ opacity: o }} />;
};

export const BeatMontage: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={s.frames}>
        <Clip s={s} />
      </Sequence>
    ))}
    <Sequence from={END_AT} durationInFrames={END.frames}>
      <EndShot />
    </Sequence>
    <Audio src={staticFile("beat/montage/ref-audio.m4a")} />
  </AbsoluteFill>
);
