import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SEGMENT_OUT_STARTS, srcToOut, TRANSITION_SEGMENTS } from "./timeline";

// Sound design. Times are in source seconds (same as the overlays) unless
// noted; each cue is shifted so its transient lands on the visual event.
type Cue = { src: string; at: number; vol: number; lead?: number };

const POPS = [
  1.32, 2.46, 3.68, 4.62, 5.92, 7.72, 12.5, 12.95, 13.4, 15.7, 18.7, 19.96, 21.36, 25.1, 31.64, 32.1, 35.96,
  40.46, 42.94, 46.04, 49.56, 55.4, 55.84, 56.68,
];
const TICKS = [1.6, 2.7, 16.1, 19.05, 20.3, 21.7, 34.26];
const TIMER = [10.72, 11.05, 11.38, 11.7];
const BUBBLES = [43.8, 44.15, 44.45, 44.8, 45.1, 45.45, 45.75];

const SRC_CUES: Cue[] = [
  ...POPS.map((at) => ({ src: "pop", at, vol: 0.32 })),
  ...TICKS.map((at) => ({ src: "tick", at, vol: 0.4 })),
  ...TIMER.map((at) => ({ src: "tick", at, vol: 0.3 })),
  ...BUBBLES.map((at) => ({ src: "bubble", at, vol: 0.2 })),
  { src: "chime", at: 28.36, vol: 0.35 },
  { src: "whoosh", at: 30.08, vol: 0.35, lead: 0.2 },
];

export const Sfx: React.FC<{ outroOut: number }> = ({ outroOut }) => {
  const { fps } = useVideoConfig();
  const cues: { src: string; out: number; vol: number }[] = [
    ...SRC_CUES.map((c) => ({ src: c.src, out: srcToOut(c.at) - (c.lead ?? 0), vol: c.vol })),
    // whoosh peaks right on each zoom-blur cut (output time)
    ...TRANSITION_SEGMENTS.map((i) => ({ src: "whoosh", out: SEGMENT_OUT_STARTS[i] - 0.22, vol: 0.5 })),
    // riser into the logo hit
    { src: "riser-hit", out: outroOut - 0.85, vol: 0.55 },
    { src: "chime", out: outroOut + 0.45, vol: 0.3 },
  ];
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.out * fps))} durationInFrames={Math.round(2 * fps)}>
          <Audio src={staticFile(`zymerex/sfx/${c.src}.wav`)} volume={c.vol} />
        </Sequence>
      ))}
    </>
  );
};
