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
// He adds the post-its through the whole take (0 until 7.5 s, 1 at 8 s, 2 at
// 12, 3 at 13, 4 at 22.5, 5 at 28.5, 6 at 38), so the shots are taken in
// source order and each one lands on him sticking one on.
// Clips are 24p: 24 fps at 1x, every source frame shown exactly once.
// MIRROR.3_*_sharp.mp4 = MIRROR.3.mov ranges with the same unsharp pass as
// MIRROR 2: a = frames 36-107, d = 120-349, b1 = 360-551, b2 = 600-839,
// e = 900-949, c = 1188-1235.
export const MIRROR3_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR3_FPS);

type Shot = { clip: string; from: number; to: number; src: number };

// from/to = edit frames, src = frame inside the segment file
const SHOTS: Shot[] = [
  // walks in from frame left, bare lid, settles centre-frame (source 1.75 s)
  { clip: "a", from: 0, to: f(2.56), src: 6 },
  // sticks the first post-it on; cut once it sits there (source 5.42 s)
  { clip: "d", from: f(2.56), to: f(5.28), src: 10 },
  // second on the lid, sticks the third (source 12.0 s)
  { clip: "d", from: f(5.28), to: f(6.6), src: 168 },
  // stutter cuts: three on the lid, then the fourth going on in three
  // jumps (source 14.0 / 21.3 / 22.0 / 22.6 s)
  { clip: "d", from: f(6.6), to: f(6.88), src: 216 },
  { clip: "b1", from: f(6.88), to: f(7.32), src: 151 },
  { clip: "b1", from: 176, to: 179, src: 168 }, // 3 frames each, as in
  { clip: "b1", from: 179, to: 182, src: 182 }, // the reference
  // four on the lid, sticks the fifth (source 27.0 s)
  { clip: "b2", from: 182, to: f(9.32), src: 48 },
  // six on the lid, facing the lens (source 38.0 s)
  { clip: "e", from: f(9.32), to: f(10.5), src: 12 },
  // hand at his glasses, walks out frame right (source 49.63 s), gone ~11.85 s
  { clip: "c", from: f(10.5), to: f(11.875), src: 3 },
];

const END_FRAME = f(11.875); // black as he clears frame and the song closes
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
      <Audio src={staticFile("mirror/music/reference_track_3.wav")} />
    </AbsoluteFill>
  );
};
