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

// MIRROR 6 - cut like reference 6 (public/mirror/music/reference_track_6.wav
// = its audio + reverb tail): wide -> torso close-up, unbuttons the jacket
// (cut once it is open) -> wide, takes the jacket off -> detail, jacket in
// hand -> wide, jacket over the shoulder, turns and walks out right; cuts on the
// reference's grid (2.68 / 4.44 / 6.56 / 8.16 s), black + MIRROR logo.
// One locked-off take (MIRROR.6.mov): the close shots are punched in from
// the wide (scripts/mirror6_build.py, graded and sharpened). 24 fps.
export const MIRROR6_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR6_FPS);

const CLIP_LEN = 245; // 10.21 s
const END_FRAME = CLIP_LEN;
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR6_DURATION = END_FRAME + f(3.1);

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const len = MIRROR6_DURATION - LOGO_IN;
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

export const Mirror6Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <Sequence durationInFrames={CLIP_LEN}>
          <OffthreadVideo
            src={staticFile("mirror/MIRROR.6_sharp.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio
        src={staticFile("mirror/music/reference_track_6.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [MIRROR6_DURATION - 30, MIRROR6_DURATION - 1],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
