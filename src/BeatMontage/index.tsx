import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Cinematic montage modelled on the fourth reference: one shot per scene
// (nothing shown twice), every shot slowly pushing in, fast whip-slides with
// motion blur on alternate cuts (the reference's push transitions), then the
// Beat menu fading up from black and holding with the push-in.
// Rendered at 24 fps like the footage, real speed only: no duplicated frames,
// so nothing judders. Clip: public/beat/montage/c4.mp4 (beat.ref.4);
// beat.ref.5 belongs to the plated-sushi format and is not used here.
export const MONTAGE_FPS = 24;

const SRC = staticFile("beat/montage/c4.mp4");

// The source clip is itself an edit with cuts at 4.83, 12.50, 16.46, 20.04,
// 24.54, 26.42, 29.88, 33.25, 34.29, 36.17, 37.42 and 40.08 s: every shot
// (slide overlap included) sits inside one of those takes, so no shot ever
// jumps mid-way.
type Shot = { from: number; frames: number; slide?: 1 | -1 };
const SHOTS: Shot[] = [
  { from: 0.3, frames: 20 }, // chef at work
  { from: 5.2, frames: 18, slide: 1 }, // hands on the rice
  { from: 13.1, frames: 18 }, // piping on nori
  { from: 16.6, frames: 22, slide: -1 }, // piping on the rolls
  { from: 25.0, frames: 16 }, // tuna roll close-up
  { from: 26.5, frames: 22, slide: 1 }, // crispy topping
  { from: 30.2, frames: 24 }, // orange garnish
  { from: 33.3, frames: 20, slide: -1 }, // sauce
  { from: 34.35, frames: 22 }, // wine wall
  { from: 36.2, frames: 16, slide: 1 }, // booth
  { from: 37.5, frames: 30 }, // dining room
];
const MENU = { from: 40.1, frames: 26 }; // the Beat menu, real speed
const HOLD = 49; // then its last frame, still pushing in

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].frames],
  [],
);
const END_AT = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].frames;
export const MONTAGE_DURATION = END_AT + MENU.frames + HOLD;

const SL = 6; // slide length, frames
const W = 1080;
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const MotionBlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    {[16, 36, 64].map((d, i) => (
      <filter key={i} id={`mmb${i}`} x="-20%" y="0" width="140%" height="100%">
        <feGaussianBlur stdDeviation={`${d} 0`} />
      </filter>
    ))}
  </svg>
);
const blurFor = (speed: number) =>
  speed < 0.08
    ? undefined
    : `url(#mmb${speed < 0.22 ? 0 : speed < 0.4 ? 1 : 2})`;

// Shot i is on screen from starts[i]; if shot i+1 slides in, shot i keeps
// playing SL frames longer and is pushed out.
const ShotView: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const s = SHOTS[i];
  const next = SHOTS[i + 1];
  const push = interpolate(f, [0, s.frames + SL], [1.0, 1.07]);
  let x = 0;
  let speed = 0;
  if (s.slide && f < SL) {
    x = s.slide * W * (1 - ease(f / SL));
    speed = Math.abs(ease((f + 1) / SL) - ease(f / SL));
  } else if (next?.slide && f >= s.frames) {
    const t = (f - s.frames) / SL;
    x = -next.slide * W * ease(t);
    speed = Math.abs(ease(t + 1 / SL) - ease(t));
  }
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        transform: `translateX(${x}px)`,
        filter: blurFor(speed),
      }}
    >
      <OffthreadVideo
        src={SRC}
        startFrom={Math.round(s.from * MONTAGE_FPS)}
        muted
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${push})`,
        }}
      />
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const push = interpolate(f, [0, MENU.frames + HOLD], [1.0, 1.1]);
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    opacity: o,
    transform: `scale(${push})`,
  };
  // hold = the same video frozen (a separate PNG would decode with
  // slightly different colours)
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Freeze frame={MENU.frames - 1} active={f >= MENU.frames}>
        <OffthreadVideo
          src={SRC}
          startFrom={Math.round(MENU.from * MONTAGE_FPS)}
          muted
          style={style}
        />
      </Freeze>
    </AbsoluteFill>
  );
};

export const BeatMontage: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <MotionBlurDefs />
    {SHOTS.map((s, i) => (
      <Sequence
        key={i}
        from={starts[i]}
        durationInFrames={s.frames + (SHOTS[i + 1]?.slide ? SL : 0)}
      >
        <ShotView i={i} />
      </Sequence>
    ))}
    <Sequence from={END_AT}>
      <End />
    </Sequence>
    <Audio
      src={staticFile("beat/montage/ref-audio.m4a")}
      volume={(f) =>
        interpolate(f, [MONTAGE_DURATION - 30, MONTAGE_DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </AbsoluteFill>
);
