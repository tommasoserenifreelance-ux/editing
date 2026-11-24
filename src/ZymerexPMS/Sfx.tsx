import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { INTRO, SEGMENT_OUT_STARTS, srcToOut, TRANSITION_SEGMENTS } from "./timeline";

// Same synthesized SFX bank as the IB-Support edit. Times are source seconds.
const POPS = [5.64, 6.0, 10.26, 10.45, 11.92, 12.1, 13.26, 17.76, 19.0, 29.68, 39.52, 39.7];
// dosage calendar cells
const TICKS = [
  ...Array.from({ length: 7 }, (_, i) => 20.08 + i * 0.13),
  ...Array.from({ length: 5 }, (_, i) => 22.04 + i * 0.16),
  ...Array.from({ length: 6 }, (_, i) => 32.4 + i * 0.25),
  ...Array.from({ length: 5 }, (_, i) => 36.58 + i * 0.14),
];

export const Sfx: React.FC = () => {
  const { fps } = useVideoConfig();
  const cues: { src: string; out: number; vol: number }[] = [
    { src: "whoosh-long", out: 0, vol: 0.35 },
    { src: "pop", out: 0.3, vol: 0.3 },
    { src: "whoosh", out: INTRO - 0.22, vol: 0.5 },
    ...TRANSITION_SEGMENTS.map((i) => ({ src: "whoosh", out: SEGMENT_OUT_STARTS[i] - 0.22, vol: 0.5 })),
    ...POPS.map((at) => ({ src: "pop", out: srcToOut(at), vol: 0.32 })),
    ...TICKS.map((at) => ({ src: "tick", out: srcToOut(at), vol: 0.28 })),
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
