import React from "react";

// Silences are cut by keeping only these [start, end] ranges of the source (seconds).
// An optional third value plays that range at another speed (0.5 = half-speed slow motion).
// Everything else (captions, zooms, graphics, SFX) is authored in source seconds
// and mapped onto the cut timeline.
export type Keep = ([number, number] | [number, number, number])[];

export type Segment = { src: number; from: number; dur: number; rate: number };

export const buildTimeline = (keep: Keep, fps: number) => {
  let cursor = 0;
  const segments: Segment[] = keep.map(([a, b, rate = 1]) => {
    const dur = Math.round(((b - a) * fps) / rate);
    const seg = { src: a, from: cursor, dur, rate };
    cursor += dur;
    return seg;
  });
  // Source seconds -> output frame (fractional). Times inside a cut snap to the cut point.
  const toFrame = (t: number) => {
    for (const [i, [a, b]] of keep.entries()) {
      if (t < a) return segments[i].from;
      if (t <= b) return segments[i].from + ((t - a) * fps) / segments[i].rate;
    }
    return cursor;
  };
  return { segments, toFrame, frames: cursor };
};

export const TimeContext = React.createContext<(t: number) => number>(
  (t) => t * 30,
);
export const useToFrame = () => React.useContext(TimeContext);
