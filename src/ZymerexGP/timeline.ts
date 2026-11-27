import { useCurrentFrame, useVideoConfig } from "remotion";

// Edit of ZYM gonfiore plus 1 + 2 (concatenated, source seconds). Each spoken
// question is replaced by a blurred question card with a music bed; pauses
// (room-reverb tail below -27 dB) and two stumbles ("sla- slaccio",
// "borbo- borborigmi") are cut as jump cuts.
export type Item = { kind: "seg"; a: number; b: number } | { kind: "card"; q: number };

export const ITEMS: Item[] = [
  { kind: "card", q: 0 },
  { kind: "seg", a: 8.5, b: 17.73 },
  { kind: "seg", a: 18.39, b: 21.97 },
  { kind: "seg", a: 22.17, b: 24.91 },
  { kind: "seg", a: 25.16, b: 26.53 },
  { kind: "seg", a: 27.03, b: 28.27 },
  { kind: "seg", a: 28.55, b: 31.88 },
  { kind: "seg", a: 32.34, b: 32.83 },
  { kind: "seg", a: 32.96, b: 37.1 },
  { kind: "seg", a: 37.52, b: 42.61 },
  { kind: "seg", a: 43.02, b: 45.32 },
  { kind: "seg", a: 45.46, b: 47.75 },
  { kind: "card", q: 1 },
  { kind: "seg", a: 51.85, b: 52.72 },
  { kind: "seg", a: 53.44, b: 56.11 },
  { kind: "seg", a: 56.25, b: 57.03 },
  { kind: "seg", a: 57.26, b: 58.66 },
  { kind: "seg", a: 58.86, b: 61.11 },
  { kind: "seg", a: 61.36, b: 62.34 },
  { kind: "seg", a: 62.77, b: 64.96 },
  { kind: "seg", a: 65.27, b: 66.1 },
  { kind: "seg", a: 66.75, b: 67.78 },
  { kind: "seg", a: 68.04, b: 71.38 },
  { kind: "seg", a: 71.84, b: 73.06 },
  { kind: "seg", a: 73.52, b: 77.41 },
  { kind: "seg", a: 77.76, b: 80.14 },
  { kind: "seg", a: 80.38, b: 83.04 },
  { kind: "seg", a: 83.39, b: 85.62 },
  { kind: "seg", a: 85.75, b: 86.1 },
  { kind: "card", q: 2 },
  { kind: "seg", a: 92.55, b: 94.21 },
  { kind: "seg", a: 94.48, b: 98.32 },
  { kind: "seg", a: 98.45, b: 101.34 },
  { kind: "seg", a: 101.66, b: 102.89 },
  { kind: "seg", a: 103.5, b: 105.28 },
  { kind: "seg", a: 105.38, b: 106.81 },
  { kind: "seg", a: 107.2, b: 109.27 },
  { kind: "seg", a: 109.39, b: 110.75 },
];

export const CARD_SECONDS = 3.0;

/** Items (index into ITEMS) that start with a zoom-blur + whoosh: topic changes. */
export const TRANSITION_ITEMS = [5, 17, 21];

const dur = (it: Item) => (it.kind === "card" ? CARD_SECONDS : it.b - it.a);
export const ITEM_OUT_STARTS: number[] = [];
{
  let acc = 0;
  for (const it of ITEMS) {
    ITEM_OUT_STARTS.push(acc);
    acc += dur(it);
  }
}
export const EDIT_END = ITEM_OUT_STARTS[ITEMS.length - 1] + dur(ITEMS[ITEMS.length - 1]);

const nextSegStart = (i: number) => {
  for (let k = i + 1; k < ITEMS.length; k++) {
    const it = ITEMS[k];
    if (it.kind === "seg") return it.a;
  }
  return 0;
};

export const itemAt = (out: number) => {
  let idx = 0;
  ITEM_OUT_STARTS.forEach((s, i) => {
    if (out >= s) idx = i;
  });
  return idx;
};

/** Output -> source. A card maps onto the (cut) seconds just before the next segment. */
export const outToSrc = (out: number) => {
  const i = itemAt(out);
  const it = ITEMS[i];
  const local = out - ITEM_OUT_STARTS[i];
  if (it.kind === "card") return nextSegStart(i) - (CARD_SECONDS - local);
  return i === ITEMS.length - 1 ? it.a + local : Math.min(it.a + local, it.b);
};

export const srcToOut = (src: number) => {
  let last = 0;
  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    if (it.kind !== "seg") continue;
    if (src < it.a) return ITEM_OUT_STARTS[i];
    if (src <= it.b) return ITEM_OUT_STARTS[i] + (src - it.a);
    last = i;
  }
  const it = ITEMS[last] as { a: number; b: number };
  return ITEM_OUT_STARTS[last] + (src - it.a);
};

export const useSrcSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return outToSrc(frame / fps);
};
