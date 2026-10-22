import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Segment } from "./timeline";

// punch: hard cut in and out (emphasis). push: eased zoom in, eased zoom out.
export type Zoom = {
  t: number;
  d: number;
  s: number;
  type?: "punch" | "push";
  x?: number; // transform origin, % of width
  y?: number; // transform origin, % of height
};

const zoomAt = (zooms: Zoom[], t: number) => {
  for (const z of zooms) {
    if (t < z.t || t > z.t + z.d) continue;
    const origin = `${z.x ?? 50}% ${z.y ?? 40}%`;
    if (z.type === "push") {
      const ramp = Math.min(0.6, z.d / 3);
      const k = interpolate(
        t,
        [z.t, z.t + ramp, z.t + z.d - ramp, z.t + z.d],
        [0, 1, 1, 0],
        { easing: Easing.inOut(Easing.cubic) },
      );
      return { scale: 1 + (z.s - 1) * k, origin };
    }
    // Small settle after the punch so it doesn't feel static.
    const settle = interpolate(t, [z.t, z.t + 0.25], [1.04, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { scale: z.s * settle, origin };
  }
  return { scale: 1, origin: "50% 40%" };
};

// Plays the kept segments back to back. `mute` holds output-frame ranges (bleeps).
export const ZoomVideo: React.FC<{
  src: string;
  zooms: Zoom[];
  segments: Segment[];
  mute: [number, number][];
}> = ({ src, zooms, segments, mute }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scale, origin } = zoomAt(zooms, frame / fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        {segments.map((seg) => (
          <Sequence key={seg.from} from={seg.from} durationInFrames={seg.dur}>
            <OffthreadVideo
              src={staticFile(src)}
              trimBefore={Math.round(seg.src * fps)}
              volume={(f) => {
                const abs = seg.from + f;
                if (mute.some(([a, b]) => abs >= a && abs < b)) return 0;
                // Two-frame ramps at the cuts avoid clicks.
                return 0.9 * Math.min(1, (f + 1) / 2, (seg.dur - f) / 2);
              }}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
