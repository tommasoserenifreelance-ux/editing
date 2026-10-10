import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "./font";

const ACCENT = "#A8C7CF";
const textShadow = "0 6px 30px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)";

type Line = { text: string; size: number; accent?: boolean };

const lines: Line[] = [
  { text: "Ecco", size: 64 },
  { text: "7 esercizi", size: 150, accent: true },
  { text: "da fare in palestra", size: 64 },
  { text: "anche senza", size: 64 },
  { text: "personal trainer", size: 96 },
];

const EXIT_FRAMES = 10;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_FRAMES, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );
  const dim = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  let wordIndex = 0;

  return (
    <AbsoluteFill>
      {/* Centered darkening so the hook reads on any background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(8,14,16,0.6) 0%, rgba(8,14,16,0.35) 55%, rgba(8,14,16,0.15) 100%)",
          opacity: dim * (1 - exit),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 70px",
          textAlign: "center",
          fontFamily: `"${FONT_FAMILY}", serif`,
          fontStyle: "italic",
          fontWeight: 700,
          color: "white",
          opacity: 1 - exit,
          transform: `scale(${1 + exit * 0.06})`,
          filter: exit > 0 ? `blur(${exit * 10}px)` : undefined,
        }}
      >
        {lines.map((line, li) => (
          <div
            key={li}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              columnGap: "0.24em",
              fontSize: line.size,
              lineHeight: line.accent ? 1.05 : 1.2,
              fontWeight: line.accent ? 900 : 700,
              color: line.accent ? ACCENT : "white",
              margin: line.accent ? "6px 0 14px" : 0,
            }}
          >
            {line.text.split(" ").map((word) => {
              const start = 4 + wordIndex++ * 4;
              const p = spring({
                frame: frame - start,
                fps,
                config: { damping: 20, stiffness: 120, mass: 0.8 },
              });
              return (
                <span
                  key={word}
                  style={{
                    display: "inline-block",
                    textShadow,
                    opacity: interpolate(p, [0, 0.6], [0, 1], {
                      extrapolateRight: "clamp",
                    }),
                    transform: `translate3d(0, ${(1 - p) * 30}px, 0) scale(${line.accent ? 0.7 + p * 0.3 : 1})`,
                    filter: p < 0.99 ? `blur(${(1 - p) * 8}px)` : undefined,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
        {/* Thin accent rule under the hook */}
        <div
          style={{
            marginTop: 34,
            height: 2,
            width: 220,
            background: `linear-gradient(to right, rgba(168,199,207,0), ${ACCENT}, rgba(168,199,207,0))`,
            transform: `scaleX(${interpolate(frame, [40, 60], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            })})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
