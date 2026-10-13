import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// Faded blacks, warm highlights, grain and a soft vignette over the whole edit.
export const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  // New grain pattern every 2 frames, like real film.
  const seed = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Lift the blacks to a milky brown. */}
      <AbsoluteFill
        style={{ backgroundColor: "#251912", mixBlendMode: "lighten" }}
      />
      {/* Warm, slightly peachy highlights. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#ffb27a",
          mixBlendMode: "soft-light",
          opacity: 0.16,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 60%, rgba(30,16,6,0.4) 100%)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", mixBlendMode: "overlay", opacity: 0.22 }}
      >
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
