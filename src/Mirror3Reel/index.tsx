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
// Reference: walks in -> checks his watch -> looks at the post-its -> quick
// stutter cuts (turns laptop, glasses) -> looks at laptop -> tilts it ->
// walks out. Its jump cuts sit on kicks/beats of the ~138 BPM track
// (2.56, 5.28, 6.60, 6.88, 7.32, 7.44, 7.56, 9.32, 10.48). The last hit is
// at ~11.28 s and the final note dies by ~12 s: he leaves on the way out
// and the logo comes in as the song closes.
// Clips are 24p: 24 fps at 1x, every source frame shown exactly once.
// MIRROR.3_*_sharp.mp4 = MIRROR.3.mov ranges with the same unsharp pass as
// MIRROR 2: a = frames 36-107, b1 = 360-551, b2 = 600-839, c = 1188-1235.
export const MIRROR3_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR3_FPS);

type Shot = { clip: string; from: number; to: number; src: number };

// from/to = edit frames, src = frame inside the segment file
const SHOTS: Shot[] = [
  // walks in from frame left and settles centre-frame (source 1.75 s)
  { clip: "a", from: 0, to: f(2.56), src: 6 },
  // raises the wrist ~1.4 s in, as in the reference, cut while he reads the
  // watch (source 25.58 s)
  { clip: "b2", from: f(2.56), to: f(5.28), src: 14 },
  // looks down at the post-its (source 18.0 s)
  { clip: "b1", from: f(5.28), to: f(6.6), src: 72 },
  // stutter cuts: turns the laptop, then the glasses adjust in three jumps
  // (source 31.25 / 33.38 / 33.92 / 34.33 s)
  { clip: "b2", from: f(6.6), to: f(6.88), src: 150 },
  { clip: "b2", from: f(6.88), to: f(7.32), src: 201 },
  { clip: "b2", from: 176, to: 179, src: 214 }, // 3 frames each, as in
  { clip: "b2", from: 179, to: 182, src: 224 }, // the reference
  // reads the laptop (source 21.0 s)
  { clip: "b1", from: 182, to: f(9.32), src: 144 },
  // touches a post-it (source 15.25 s)
  { clip: "b1", from: f(9.32), to: f(10.5), src: 6 },
  // drops his hand and walks out frame right (source 49.63 s), gone ~11.85 s
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
