import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import cuTrack from "./cuTrack.json";
import legsTrack from "./legsTrack.json";

// MIRROR 2 - same structure, timing and pace as the reference reel
// (public/mirror/music/reference_track_2.wav = its audio + reverb tail).
// Reference: wide walk-in -> CU writing -> legs detail -> wide walk-out,
// cuts at 3.64 / 6.56 / 9.44 s (kick hits, one bar apart at ~83 BPM),
// black at 15.08 s, real-time movement with a smooth cadence. The snare hits
// fall every 1.448 s from 1.46 s; in the last wide he looks into the lens on
// the 11.58 s hit and leaves while the track fades out.
// The clips are 24p: the edit runs at 24 fps and 1x, so every source frame
// is shown exactly once (no repeated frames, no interpolation).
export const MIRROR2_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR2_FPS);

type Track = { x: number[]; y: number[]; rot: number[] };
type Shot = {
  clip: string;
  from: number;
  to: number;
  src: number; // multiple of 1/24 s so trimBefore is a whole frame
  // per-frame stabilisation + recentering (src/Mirror2Reel/*Track.json)
  track?: Track & { zoom: number };
};

// from/to = edit frames (24 fps), src = second in the source clip
const SHOTS: Shot[] = [
  // wide: enters from frame left (half body in on frame 0, like the
  // reference), stops centre-frame and starts writing
  { clip: "MIRROR.2.mov", from: 0, to: f(3.625), src: 29 / 24 },
  // CU matched on the writing pose, head down; handheld -> stabilised,
  // face pulled to centre with a slight zoom
  {
    clip: "MIRROR.2.2.mov",
    from: f(3.625),
    to: f(6.542),
    src: 1.0,
    track: { ...cuTrack, zoom: 1.17 },
  },
  // legs: opens on the planted stance, keeps the whole foot pivot and the
  // turn to three-quarters; cut only once he has settled
  {
    clip: "MIRROR.2.1.mov",
    from: f(6.542),
    to: f(9.417),
    src: 0.625,
    track: { ...legsTrack, zoom: 1.05 },
  },
  // wide: writing, looks up and holds the lens on the 11.58 s hit, turns as
  // the track fades (~12.6 s) and walks out frame right, gone by ~14.5 s;
  // short empty room, fade to black - same timing as the reference
  { clip: "MIRROR.2.mov", from: f(9.417), to: f(15.083), src: 308 / 24 },
];

const END_FRAME = f(15.083); // picture fully black (as in the reference)
const FADE_OUT = f(0.4);
const LOGO_IN = END_FRAME;
export const MIRROR2_DURATION = f(18.458);

const ShotVideo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const video = (
    <OffthreadVideo
      src={staticFile(`mirror/${shot.clip}`)}
      trimBefore={Math.round(shot.src * MIRROR2_FPS)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
  if (!shot.track) return video;
  const { x, y, rot, zoom } = shot.track;
  const i = Math.min(frame, x.length - 1);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom}) translate(${x[i]}px, ${y[i]}px) rotate(${rot[i]}deg)`,
      }}
    >
      {video}
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const len = MIRROR2_DURATION - LOGO_IN;
  const opacity = interpolate(frame, [0, 12, len - 15, len], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, len], [0.96, 1.02], {
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <Img
        src={staticFile("mirror/logo.svg")}
        style={{ width: 900, transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

export const Mirror2Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {SHOTS.map((s, i) => {
          const from = s.from;
          const dur = s.to - from;
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <ShotVideo shot={s} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio src={staticFile("mirror/music/reference_track_2.wav")} />
    </AbsoluteFill>
  );
};
