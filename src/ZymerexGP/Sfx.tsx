import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { CARD_SECONDS, ITEM_OUT_STARTS, ITEMS, srcToOut, TRANSITION_ITEMS } from "./timeline";

// Synthesized SFX bank shared with the other Zymerex edits. Times: source s.
const POPS = [
  9.2, 11.92, 14.34, 16.94, 19.2, 22.72, 25.48, 30.66, 32.68, 36.98, 40.46, 41.58, 43.3, 53.46, 57.3, 62.3, 63.66,
  70.18, 74.6, 75.54, 80.64, 104.06, 105.12, 105.8,
];
const TICKS = [32.9, 59.22];
const BUBBLES = [68.4, 68.7, 68.95, 69.25, 69.55, 69.85];

export const Sfx: React.FC = () => {
  const { fps } = useVideoConfig();
  const cards = ITEMS.flatMap((it, i) => (it.kind === "card" ? [i] : []));
  const cues: { src: string; out: number; vol: number; len?: number }[] = [
    // music bed + whoosh in, whoosh out on every question card
    ...cards.flatMap((i, k) => [
      { src: "intro-bed", out: ITEM_OUT_STARTS[i], vol: k === 0 ? 0.55 : 0.45, len: 4.3 },
      { src: "whoosh-long", out: ITEM_OUT_STARTS[i], vol: 0.22 },
      { src: "whoosh", out: ITEM_OUT_STARTS[i] + CARD_SECONDS - 0.22, vol: 0.45 },
    ]),
    ...TRANSITION_ITEMS.map((i) => ({ src: "whoosh", out: ITEM_OUT_STARTS[i] - 0.22, vol: 0.45 })),
    ...POPS.map((at) => ({ src: "pop", out: srcToOut(at), vol: 0.32 })),
    ...TICKS.map((at) => ({ src: "tick", out: srcToOut(at), vol: 0.35 })),
    ...BUBBLES.map((at) => ({ src: "bubble", out: srcToOut(at), vol: 0.2 })),
  ];
  return (
    <>
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.out * fps))} durationInFrames={Math.round((c.len ?? 2) * fps)}>
          <Audio src={staticFile(`zymerex/sfx/${c.src}.wav`)} volume={c.vol} />
        </Sequence>
      ))}
    </>
  );
};
