import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Exercise } from "./exercises";
import { FONT_FAMILY } from "./font";

const ACCENT = "#A8C7CF";
const WHITE = "#FFFFFF";
const EXIT_FRAMES = 9;

const textShadow = "0 4px 24px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)";

// Words rise out of an invisible mask one after another
const MaskedWords: React.FC<{
  text: string;
  startFrame: number;
  stagger: number;
  style: React.CSSProperties;
}> = ({ text, startFrame, stagger, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.24em",
        fontSize: style.fontSize,
      }}
    >
      {text.split(" ").map((word, i) => {
        const progress = spring({
          frame: frame - startFrame - i * stagger,
          fps,
          config: { damping: 16, stiffness: 170, mass: 0.7 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              // Room for italic overhang and descenders inside the mask
              padding: "0 0.12em 0.12em 0.04em",
              margin: "0 -0.08em -0.12em -0.04em",
            }}
          >
            <span
              style={{
                ...style,
                display: "inline-block",
                transform: `translateY(${(1 - progress) * 110}%) rotate(${(1 - progress) * 6}deg)`,
                opacity: progress,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Description reveals word by word, with the newest word highlighted
const KaraokeWords: React.FC<{
  text: string;
  startFrame: number;
  stagger: number;
  style: React.CSSProperties;
}> = ({ text, startFrame, stagger, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.24em",
        fontSize: style.fontSize,
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * stagger;
        const pop = spring({
          frame: frame - wordStart,
          fps,
          config: { damping: 12, stiffness: 220, mass: 0.6 },
        });
        const highlight = interpolate(
          frame,
          [wordStart, wordStart + stagger, wordStart + stagger * 2.5],
          [1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <span
            key={i}
            style={{
              ...style,
              display: "inline-block",
              opacity: interpolate(pop, [0, 0.4], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${(1 - pop) * 22}px) scale(${0.85 + pop * 0.15})`,
              color: highlight > 0.5 ? ACCENT : WHITE,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const ExerciseSubtitle: React.FC<{
  exercise: Exercise;
  index: number;
  total: number;
}> = ({ exercise, index, total }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Short scenes get a faster entrance so everything is readable in time
  const pace = durationInFrames < 4 * fps ? 0.7 : 1;
  const titleStart = Math.round(4 * pace);
  const detailStart = Math.round(16 * pace);
  const descriptionStart = Math.round(26 * pace);
  const wordStagger = Math.max(2, Math.round(4 * pace));

  const isLast = index === total - 1;
  const exit = isLast
    ? 0
    : interpolate(
        frame,
        [durationInFrames - EXIT_FRAMES, durationInFrames],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        },
      );

  const numberIn = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.8 },
  });
  const barIn = interpolate(frame, [0, 14 * pace], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const detailIn = spring({
    frame: frame - detailStart,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        padding: "0 68px 300px 68px",
        fontFamily: `"${FONT_FAMILY}", serif`,
        fontStyle: "italic",
        fontWeight: 700,
        color: WHITE,
        opacity: 1 - exit,
        transform: `translateY(${exit * 50}px)`,
        filter: `blur(${exit * 10}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1,
            color: ACCENT,
            textShadow,
            transform: `scale(${0.5 + numberIn * 0.5}) rotate(${(1 - numberIn) * -10}deg)`,
            transformOrigin: "left bottom",
            opacity: numberIn,
          }}
        >
          {exercise.number}
        </div>
        {/* Hairline that draws out from the number */}
        <div
          style={{
            flex: 1,
            height: 2,
            marginTop: 18,
            background: `linear-gradient(to right, ${ACCENT}, rgba(168,199,207,0))`,
            transform: `scaleX(${barIn})`,
            transformOrigin: "left",
          }}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <MaskedWords
          text={exercise.title}
          startFrame={titleStart}
          stagger={wordStagger}
          style={{
            fontSize: 70,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: 1.5,
            textShadow,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 24,
          alignSelf: "flex-start",
          padding: "10px 26px 13px 24px",
          borderRadius: 26,
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          border: "1.5px solid rgba(168,199,207,0.75)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          fontSize: 33,
          lineHeight: 1.25,
          opacity: detailIn,
          transform: `translateX(${(1 - detailIn) * -60}px)`,
        }}
      >
        {exercise.detail}
      </div>

      <div style={{ marginTop: 22 }}>
        <KaraokeWords
          text={exercise.description}
          startFrame={descriptionStart}
          stagger={wordStagger}
          style={{ fontSize: 44, lineHeight: 1.22, textShadow }}
        />
      </div>
    </AbsoluteFill>
  );
};
