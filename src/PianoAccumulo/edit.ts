// Edit decision list for the "piano di accumulo" reel. Word indexes refer
// to WORDS.

export type LineStyle = "plain" | "big" | "red";

export type Block = {
  at: number;
  // [number of words, style] per line, consumed in order from `at`
  lines: [number, LineStyle][];
  icon?: "pin";
};

export type Scene = "family" | "busy" | "auto" | "growth" | "goals";

export const BLOCKS: Block[] = [
  {
    at: 8,
    lines: [
      [2, "plain"],
      [2, "big"],
      [3, "red"],
    ],
    icon: "pin",
  },
  {
    at: 22,
    lines: [
      [3, "plain"],
      [1, "red"],
      [3, "big"],
    ],
  },
  {
    at: 31,
    lines: [
      [1, "plain"],
      [1, "red"],
    ],
  },
  {
    at: 33,
    lines: [
      [1, "big"],
      [2, "red"],
    ],
  },
  {
    at: 36,
    lines: [
      [2, "plain"],
      [1, "plain"],
      [1, "red"],
    ],
  },
  {
    at: 40,
    lines: [
      [3, "plain"],
      [3, "big"],
    ],
  },
  {
    at: 46,
    lines: [
      [1, "plain"],
      [2, "plain"],
      [3, "red"],
    ],
  },
  {
    at: 52,
    lines: [
      [1, "plain"],
      [2, "red"],
      [4, "plain"],
    ],
  },
  {
    at: 59,
    lines: [
      [2, "plain"],
      [1, "big"],
      [1, "red"],
    ],
  },
  {
    at: 63,
    lines: [
      [4, "plain"],
      [1, "big"],
      [3, "red"],
    ],
  },
  {
    at: 71,
    lines: [
      [3, "red"],
      [3, "plain"],
    ],
  },
  {
    at: 77,
    lines: [
      [2, "big"],
      [1, "red"],
    ],
  },
  {
    at: 80,
    lines: [
      [2, "plain"],
      [3, "big"],
    ],
  },
  {
    at: 85,
    lines: [
      [4, "plain"],
      [3, "red"],
    ],
  },
  {
    at: 92,
    lines: [
      [3, "plain"],
      [2, "big"],
    ],
  },
  {
    at: 97,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 100,
    lines: [
      [4, "plain"],
      [1, "big"],
      [4, "red"],
    ],
    icon: "pin",
  },
];

// Single words shown in a red box instead of plain white.
export const RED_WORDS: number[] = [15, 30];

// Name lower third replaces captions for these words.
export const NAME_CARD = {
  from: 1,
  to: 7,
  name: "Marzia Pisu",
  role: "Consulente assicurativo · Generali Italia",
};

export const CUTAWAYS: { from: number; to: number; scene: Scene }[] = [
  { from: 22, to: 28, scene: "family" },
  { from: 31, to: 39, scene: "busy" },
  { from: 52, to: 58, scene: "auto" },
  { from: 59, to: 70, scene: "growth" },
  { from: 71, to: 79, scene: "goals" },
];
