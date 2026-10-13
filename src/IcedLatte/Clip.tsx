import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Vintage film look: low contrast, softer saturation, warm cast.
export const GRADE =
  "contrast(0.9) saturate(1.08) brightness(1.04) sepia(0.12)";

export type ClipProps = {
  src: string;
  // Start point in the source file, in seconds.
  from: number;
  playbackRate?: number;
  // Gentle zoom across the clip (ken burns). Kept low so the image stays sharp.
  zoomFrom?: number;
  zoomTo?: number;
  // Where the zoom is centered (usually the glass), as CSS transform-origin.
  origin?: string;
  volume?: number;
};

export const Clip: React.FC<ClipProps> = ({
  src,
  from,
  playbackRate = 1,
  zoomFrom = 1.12,
  zoomTo = 1.18,
  origin = "50% 62%",
  volume = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateRight: "clamp",
  });
  const video = {
    src: staticFile(src),
    trimBefore: Math.round(from * fps),
    playbackRate,
    style: { width: "100%", height: "100%", objectFit: "cover" as const },
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#1c130d", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale})`, transformOrigin: origin }}
      >
        <AbsoluteFill style={{ filter: GRADE }}>
          <OffthreadVideo {...video} volume={volume} />
        </AbsoluteFill>
        {/* Bloom: blurred, brightened copy screened on top of the highlights. */}
        <AbsoluteFill
          style={{
            filter: `${GRADE} blur(26px) brightness(1.25)`,
            mixBlendMode: "screen",
            opacity: 0.38,
          }}
        >
          <OffthreadVideo {...video} muted />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
