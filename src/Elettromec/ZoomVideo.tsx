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

export const ZoomVideo: React.FC<{ src: string; zooms: Zoom[] }> = ({
  src,
  zooms,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scale, origin } = zoomAt(zooms, frame / fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        <OffthreadVideo src={staticFile(src)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
