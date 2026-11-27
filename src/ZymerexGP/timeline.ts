import { useCurrentFrame, useVideoConfig } from "remotion";

// Edit of ZYM gonfiore plus 1 + 2 (concatenated, source seconds). The two
// interview questions become blurred question cards with a music bed; the
// off-mic aside at 49-51.7 s is dropped. Only real pauses (>=0.3 s below
// -29 dB, keeping a breath of tail), the "ehm"s (10.6, 27.0, 101.2-103.5 s)
// and the stumbles ("sla- slaccio", "borbo- borborigmi", "non senti- non
// sentendomi") are cut, for a smoother rhythm.
export type Item = { kind: "seg"; a: number; b: number } | { kind: "card"; q: number };

export const ITEMS: Item[] = [
  { kind: "card", q: 0 },
  { kind: "seg", a: 8.5, b: 10.57 },
  { kind: "seg", a: 11.67, b: 18.2 },
  { kind: "seg", a: 18.35, b: 26.5 },
  { kind: "seg", a: 27.72, b: 28.36 },
  { kind: "seg", a: 28.51, b: 31.97 },
  { kind: "seg", a: 32.3, b: 37.29 },
  { kind: "seg", a: 37.48, b: 42.74 },
  { kind: "seg", a: 42.98, b: 47.7 },
  { kind: "seg", a: 51.85, b: 52.74 },
  { kind: "seg", a: 53.52, b: 62.42 },
  { kind: "seg", a: 62.72, b: 65.07 },
  { kind: "seg", a: 65.22, b: 66.18 },
  { kind: "seg", a: 66.71, b: 71.38 },
  { kind: "seg", a: 71.84, b: 73.14 },
  { kind: "seg", a: 73.47, b: 77.5 },
  { kind: "seg", a: 77.72, b: 83.11 },
  { kind: "seg", a: 83.35, b: 86.8 },
  { kind: "card", q: 1 },
  { kind: "seg", a: 92.55, b: 94.3 },
  { kind: "seg", a: 94.44, b: 98.68 },
  { kind: "seg", a: 99.58, b: 101.16 },
  { kind: "seg", a: 103.47, b: 106.9 },
  { kind: "seg", a: 107.16, b: 110.6 },
];

export const CARD_SECONDS = 3.0;

/** Items (index into ITEMS) that start with a zoom-blur + whoosh: topic changes. */
export const TRANSITION_ITEMS = [4, 9, 13];

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
