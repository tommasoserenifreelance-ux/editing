import React from "react";

// Silences are cut by keeping only these [start, end] ranges of the source (seconds).
// Everything else (captions, zooms, graphics, SFX) is authored in source seconds
// and mapped onto the cut timeline.
export type Keep = [number, number][];

export type Segment = { src: number; from: number; dur: number };

export const buildTimeline = (keep: Keep, fps: number) => {
  let cursor = 0;
  const segments: Segment[] = keep.map(([a, b]) => {
    const dur = Math.round((b - a) * fps);
    const seg = { src: a, from: cursor, dur };
    cursor += dur;
    return seg;
  });
  // Source seconds -> output frame (fractional). Times inside a cut snap to the cut point.
  const toFrame = (t: number) => {
    for (const [i, [a, b]] of keep.entries()) {
      if (t < a) return segments[i].from;
      if (t <= b) return segments[i].from + (t - a) * fps;
    }
    return cursor;
  };
  return { segments, toFrame, frames: cursor };
};

export const TimeContext = React.createContext<(t: number) => number>(
  (t) => t * 30,
);
export const useToFrame = () => React.useContext(TimeContext);
