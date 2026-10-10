import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ExerciseSubtitle } from "./ExerciseSubtitle";
import { clips, clipStart, exerciseRange, exercises } from "./exercises";
import "./font";

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 0.85], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "flex-end", padding: "150px 64px 0 0" }}>
      <Img
        src={staticFile("logo-santa-longevity.png")}
        style={{
          width: 118,
          height: 118,
          opacity,
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};

export const WorkoutVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {clips.map((clip, i) => (
        <Sequence
          key={clip.src}
          from={clipStart(i)}
          durationInFrames={clip.durationInFrames}
          name={clip.src}
        >
          <OffthreadVideo src={staticFile(clip.src)} />
        </Sequence>
      ))}
      {/* Soft vignette plus a bottom gradient so the subtitles stay readable */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(8,14,16,0.72) 0%, rgba(8,14,16,0.4) 26%, rgba(8,14,16,0) 46%)",
        }}
      />
      {exercises.map((exercise, i) => (
        <Sequence
          key={exercise.number}
          {...exerciseRange(exercise)}
          name={exercise.title}
        >
          <ExerciseSubtitle
            exercise={exercise}
            index={i}
            total={exercises.length}
          />
        </Sequence>
      ))}
      <Watermark />
    </AbsoluteFill>
  );
};
