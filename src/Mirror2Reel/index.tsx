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

// MIRROR 2 - same structure and movements as the reference reel
// (public/mirror/music/reference_track_2.wav = its audio + reverb tail):
// wide walk-in -> CU writing -> legs detail -> wide (closes the diary, walks
// out) -> black + logo on the song's closing hit.
// Track grid (~83 BPM): kicks every 1.448 s from 0.73 s (2.18, 3.63, 5.07,
// 6.52, 7.97, 9.42, 10.87, 12.31), snares half a bar later (1.46, 2.90, ...).
// The groove ends on the 12.31 s kick; after it only the last chord decays.
// Clips are 24p: the edit runs at 24 fps and 1x, so every source frame is
// shown exactly once (no repeated frames, no interpolation). *_sharp.mp4 =
// the original clips with a two-radius unsharp pass (detail + local contrast).
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

// from/to = edit frames (24 fps), src = second in the (sharpened) clip.
// MIRROR.2_in_sharp.mp4 = MIRROR.2.mov frames 12-95, _out_ = frames 336-471.
const SHOTS: Shot[] = [
  // wide: enters from frame left (half body in on frame 0, like the
  // reference); cut on the 1.46 s snare while the smile is only a hint
  // (it opens fully ~0.3 s later in the source)
  { clip: "MIRROR.2_in_sharp.mp4", from: 0, to: f(1.46), src: 17 / 24 },
  // CU writing, head down; handheld -> stabilised on a smooth path, face
  // pulled to centre with a slight zoom. Kept short (client): to the 3.63 s kick.
  {
    clip: "MIRROR.2.2_sharp.mp4",
    from: f(1.46),
    to: f(3.63),
    src: 10 / 24,
    track: { ...cuTrack, zoom: 1.17 },
  },
  // legs: opens on the planted stance, keeps the whole foot pivot and the
  // turn to three-quarters; cut on the 7.97 s kick once he has settled
  {
    clip: "MIRROR.2.1_sharp.mp4",
    from: f(3.63),
    to: f(3.63) + 69,
    src: 15 / 24,
    track: { ...legsTrack, zoom: 1.05 },
  },
  // wide (source 14.75 s): looks up from the diary and closes it straight
  // away, turns and walks out frame right; shortened (client): black as
  // soon as he has cleared the frame
  {
    clip: "MIRROR.2_out_sharp.mp4",
    from: f(3.63) + 69,
    to: f(3.63) + 69 + 82,
    src: 18 / 24,
  },
];

const END_FRAME = f(3.63) + 69 + 82; // 9.9 s: black as he leaves -> logo
const FADE_OUT = f(0.4);
const LOGO_IN = END_FRAME;
export const MIRROR2_DURATION = END_FRAME + f(3.1);

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
      <Audio
        src={staticFile("mirror/music/reference_track_2.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [MIRROR2_DURATION - 30, MIRROR2_DURATION - 1],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />
    </AbsoluteFill>
  );
};
