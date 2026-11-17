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
import { z } from "zod";

// MIRROR 04 split into one video per look (client: each outfit on its own).
// Three to five shots per look, cut on the 120 BPM grid of reference 5
// (public/mirror/music/reference_track_5.wav), then black + MIRROR logo.
// Sources: scripts/mirror5_single_build.py -> MIRROR.5_<look>_sharp.mp4.
export const MIRROR5_SINGLE_FPS = 24;
export const LOOK_FRAMES = { grigio: 205, nero: 241, marrone: 157 } as const;
const LOGO_LEN = 74; // 3.1 s
const FADE_OUT = 9;

export const mirror5SingleSchema = z.object({
  look: z.enum(["grigio", "nero", "marrone"]),
});
export const mirror5SingleDuration = (look: keyof typeof LOOK_FRAMES) =>
  LOOK_FRAMES[look] + LOGO_LEN;

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, LOGO_LEN - 15, LOGO_LEN],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [0, LOGO_LEN], [0.96, 1.02], {
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

export const Mirror5Single: React.FC<z.infer<typeof mirror5SingleSchema>> = ({
  look,
}) => {
  const frame = useCurrentFrame();
  const end = LOOK_FRAMES[look];
  const total = end + LOGO_LEN;
  const fade = interpolate(frame, [end - FADE_OUT, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <Sequence durationInFrames={end}>
          <OffthreadVideo
            src={staticFile(`mirror/MIRROR.5_${look}_sharp.mp4`)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      </AbsoluteFill>
      <Sequence from={end}>
        <Logo />
      </Sequence>
      <Audio
        src={staticFile("mirror/music/reference_track_5.wav")}
        volume={(fr) =>
          interpolate(fr, [total - 30, total - 1], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
