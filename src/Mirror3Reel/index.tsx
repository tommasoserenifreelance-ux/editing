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

// MIRROR 3 - jump-cut edit on one locked-off wide, cut like reference 3
// (public/mirror/music/reference_track_3.wav = its audio + reverb tail).
// Reference: walks in with a bare laptop, then the post-its on the lid grow
// from one shot to the next (1 -> 2-3 -> 4-5 -> full) while he sticks them
// on, quick stutter cuts in the middle, walks out. Its jump cuts sit on
// kicks/beats of the ~138 BPM track (2.56, 5.28, 6.60, 6.88, 7.32, 7.44,
// 7.56, 9.32, 10.48). The last hit is at ~11.28 s and the final note dies by
// ~12 s: he leaves on the way out and the logo comes in as the song closes.
// Rule: the count on the lid only grows on screen, while he sticks one on -
// both sides of every cut show the same number. Good placements in the
// source: #1 top right 5.5-7.5 s, #2 centre 10.0-11.5, #3 left 15.0-16.6,
// #4 right 21.0-22.8, #5 bottom right 23.0-24.0, #6 top left 42.5-43.7 (the
// redo: the one he sticks on at 28-30 s is in the wrong spot and comes off).
// Clips are 24p: 24 fps at 1x, every source frame shown exactly once.
// MIRROR.3_*_sharp.mp4 = MIRROR.3.mov ranges with the same unsharp pass as
// MIRROR 2: a = frames 36-107, d = 120-349, b1 = 360-551, f = 500-599,
// g = 1000-1059, c = 1188-1235.
export const MIRROR3_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR3_FPS);

type Shot = { clip: string; from: number; to: number; src: number };

// from/to = edit frames, src = frame inside the segment file
const SHOTS: Shot[] = [
  // smoother cut (client): seven shots of 1.2-3 s on the beats, no stutter
  // cuts; every new post-it still seen going on, same count across each cut
  // walks in from frame left, bare lid, settles centre-frame
  { clip: "a", from: 0, to: 51, src: 6 },
  // #1 top right (0 -> 1)
  { clip: "d", from: 51, to: 103, src: 14 },
  // #2 centre (1 -> 2)
  { clip: "d", from: 103, to: 140, src: 120 },
  // #3 left (2 -> 3)
  { clip: "b1", from: 140, to: 176, src: 0 },
  // #4 and #5 down the right side in one take (3 -> 5)
  { clip: "f", from: 176, to: 248, src: 4 },
  // #6: the redone one, top left (5 -> 6)
  { clip: "g", from: 248, to: 277, src: 20 },
  // hand at his glasses, walks out frame right
  { clip: "c", from: 277, to: 310, src: 3 },
];

const END_FRAME = 310; // 12.9 s: black as he clears frame
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR3_DURATION = END_FRAME + f(3.1);

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const len = MIRROR3_DURATION - LOGO_IN;
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

export const Mirror3Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {SHOTS.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.to - s.from}>
            <OffthreadVideo
              src={staticFile(`mirror/MIRROR.3_${s.clip}_sharp.mp4`)}
              trimBefore={s.src}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio
        src={staticFile("mirror/music/reference_track_3.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [MIRROR3_DURATION - 30, MIRROR3_DURATION - 1],
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
