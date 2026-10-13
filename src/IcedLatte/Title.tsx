import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";

// Instrument Serif (Google Fonts, OFL), bundled locally in public/fonts.
const fontFamily = "Instrument Serif";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/InstrumentSerif-Regular.woff2"),
  weight: "400",
});

// Cream-yellow from the reference.
export const TITLE_COLOR = "#F4EDB2";

// Word i starts animating at WORD_DELAY + i * WORD_STAGGER (sound effects sync to this).
export const WORD_DELAY = 6;
export const WORD_STAGGER = 4;

export type TitleWord = { text: string; size: number };

export const Title: React.FC<{ words: TitleWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const outStart = durationInFrames - 8;
  const exitScale = interpolate(
    frame,
    [outStart, durationInFrames],
    [1, 1.25],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const exitOpacity = interpolate(
    frame,
    [outStart, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const breathe = interpolate(frame, [0, durationInFrames], [1, 1.05]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
        transform: `scale(${breathe * exitScale})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily,
          color: TITLE_COLOR,
          textShadow:
            "0 0 28px rgba(255, 228, 160, 0.35), 0 6px 40px rgba(40, 20, 5, 0.45)",
        }}
      >
        {words.map((word, i) => {
          const progress = spring({
            frame: frame - WORD_DELAY - i * WORD_STAGGER,
            fps,
            config: { damping: 14, stiffness: 160, mass: 0.6 },
          });
          return (
            <div
              key={word.text + i}
              style={{
                fontSize: word.size,
                lineHeight: 0.8,
                letterSpacing: "-0.02em",
                opacity: interpolate(progress, [0, 0.4], [0, 1], {
                  extrapolateRight: "clamp",
                }),
                transform: `translateY(${interpolate(progress, [0, 1], [70, 0])}px) scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
                filter: `blur(${interpolate(progress, [0, 1], [14, 0])}px)`,
              }}
            >
              {word.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
