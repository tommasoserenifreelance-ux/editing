import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// "Pop" grade: more contrast, richer coffee tones, slightly warm.
export const GRADE =
  "contrast(1.14) saturate(1.32) brightness(1.04) sepia(0.06)";

export type ClipProps = {
  src: string;
  // Start point in the source file, in seconds.
  from: number;
  playbackRate?: number;
  // Slow zoom across the clip (ken burns).
  zoomFrom?: number;
  zoomTo?: number;
  // Where the zoom is centered (usually the glass), as CSS transform-origin.
  origin?: string;
  // Quick zoom-in punch on the first frames of the cut.
  punch?: boolean;
  // White flash at the start of the cut.
  flash?: boolean;
  volume?: number;
};

export const Clip: React.FC<ClipProps> = ({
  src,
  from,
  playbackRate = 1,
  zoomFrom = 1.2,
  zoomTo = 1.3,
  origin = "50% 62%",
  punch = false,
  flash = false,
  volume = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const drift = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateRight: "clamp",
  });
  const punchScale = punch
    ? interpolate(frame, [0, 6], [1.12, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;
  const blur = punch
    ? interpolate(frame, [0, 4], [6, 0], { extrapolateRight: "clamp" })
    : 0;
  const flashOpacity = flash
    ? interpolate(frame, [0, 5], [0.85, 0], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#140c08", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${drift * punchScale})`,
          transformOrigin: origin,
          filter: `${GRADE} blur(${blur}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          trimBefore={Math.round(from * fps)}
          playbackRate={playbackRate}
          volume={volume}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {flash ? (
        <AbsoluteFill
          style={{ backgroundColor: "#fff6e0", opacity: flashOpacity }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
