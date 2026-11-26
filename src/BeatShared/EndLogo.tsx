import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Shared ending for the Beat reels: the picture fades to black over the
// last FADE seconds of the edit (`at` = output frame where the edit ends),
// then the white Beat logo fades in on black for TAIL seconds.
export const END_FADE = 0.5;
export const END_TAIL = 1.6;
export const endTailFrames = (fps: number) => Math.round(END_TAIL * fps);

export const EndLogo: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = Math.round(END_FADE * fps);
  const black = interpolate(f, [at - fade, at], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logo = interpolate(
    f,
    [at + 2, at + 2 + Math.round(0.4 * fps)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  if (black === 0) return null;
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${black})` }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: logo,
        }}
      >
        <Img src={staticFile("beat/logo-bianco.png")} style={{ width: 320 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Audio volume helper: full until the fade, then down to silence by the end.
export const endVolume = (total: number, fps: number) => (f: number) =>
  interpolate(
    f,
    [total - endTailFrames(fps) - Math.round(END_FADE * fps), total],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
