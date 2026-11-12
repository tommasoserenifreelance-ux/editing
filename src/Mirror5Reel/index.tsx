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

// MIRROR 5 - cut like reference 5 (public/mirror/music/reference_track_5.wav
// = its audio + reverb tail, 120 BPM). Reference: split screen for the
// first 3.93 s (two full-body looks side by side on top, a medium shot
// below), then single shots cut at 3.93 / 6.50 / 7.47 / 8.63 / 10.10 /
// 11.23 s, ending on a full body at 13.6 s. Same grid here:
//   split screen: grey look full body | brown look full body / brown medium
//   adjusts his collar into the lens -> turns his head -> shoe step ->
//   buttons the jacket -> tilt up trousers to jacket -> full body, collar
// then black + MIRROR logo. Sources: scripts/mirror5_build.py (sharpened,
// no talking). 24 fps, 1x except the top-left panel (0.65x).
export const MIRROR5_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR5_FPS);

const TRI_END = 94; // 3.92 s
const B_LEN = 232;
const END_FRAME = TRI_END + B_LEN; // 13.58 s
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR5_DURATION = END_FRAME + f(3.1);

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const len = MIRROR5_DURATION - LOGO_IN;
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

export const Mirror5Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <Sequence durationInFrames={TRI_END}>
          <OffthreadVideo
            src={staticFile("mirror/MIRROR.5_tri_sharp.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
        <Sequence from={TRI_END} durationInFrames={B_LEN}>
          <OffthreadVideo
            src={staticFile("mirror/MIRROR.5_b_sharp.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio
        src={staticFile("mirror/music/reference_track_5.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [MIRROR5_DURATION - 30, MIRROR5_DURATION - 1],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
