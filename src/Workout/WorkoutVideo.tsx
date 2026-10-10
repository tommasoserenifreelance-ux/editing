import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { ExerciseSubtitle } from "./ExerciseSubtitle";
import { exercises } from "./exercises";
import "./font";

export const WorkoutVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={staticFile("allenamento.mp4")} />
      {/* Bottom gradient keeps the subtitles readable on bright frames */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0) 52%)",
        }}
      />
      {exercises.map((exercise, i) => {
        const from = Math.round(exercise.from * fps);
        const to = Math.min(durationInFrames, Math.round(exercise.to * fps));
        return (
          <Sequence
            key={exercise.number}
            from={from}
            durationInFrames={to - from}
            name={exercise.title}
          >
            <ExerciseSubtitle
              exercise={exercise}
              index={i}
              total={exercises.length}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
