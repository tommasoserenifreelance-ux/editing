// Edit decision list for the pension reel. Word indexes refer to WORDS.

export type LineStyle = "plain" | "big" | "red";

export type Block = {
  at: number;
  // [number of words, style] per line, consumed in order from `at`
  lines: [number, LineStyle][];
  icon?: "pin";
};

export type Scene = "years" | "life" | "steps" | "gap" | "flex" | "deadline";

export const BLOCKS: Block[] = [
  // hook
  {
    at: 0,
    lines: [
      [4, "plain"],
      [2, "big"],
      [2, "red"],
    ],
  },
  {
    at: 8,
    lines: [
      [3, "plain"],
      [1, "red"],
    ],
  },
  // twenty years from now
  {
    at: 16,
    lines: [
      [4, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 22,
    lines: [
      [3, "plain"],
      [2, "big"],
      [2, "red"],
    ],
  },
  {
    at: 29,
    lines: [
      [1, "plain"],
      [1, "big"],
    ],
  },
  // life moments
  {
    at: 31,
    lines: [
      [2, "plain"],
      [3, "red"],
    ],
  },
  {
    at: 36,
    lines: [
      [3, "plain"],
      [3, "big"],
    ],
  },
  {
    at: 42,
    lines: [
      [2, "plain"],
      [1, "red"],
    ],
  },
  // one step at a time
  {
    at: 45,
    lines: [
      [5, "plain"],
      [2, "big"],
    ],
  },
  {
    at: 52,
    lines: [
      [2, "plain"],
      [3, "red"],
    ],
  },
  // public pension gap
  {
    at: 57,
    lines: [
      [1, "plain"],
      [2, "red"],
      [2, "plain"],
    ],
  },
  {
    at: 62,
    lines: [
      [2, "plain"],
      [1, "red"],
    ],
  },
  {
    at: 65,
    lines: [
      [2, "plain"],
      [3, "big"],
      [2, "plain"],
    ],
  },
  // the solution
  {
    at: 72,
    lines: [
      [2, "plain"],
      [1, "big"],
      [1, "red"],
    ],
  },
  {
    at: 76,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 79,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 82,
    lines: [
      [3, "plain"],
      [2, "big"],
    ],
  },
  {
    at: 87,
    lines: [
      [2, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 91,
    lines: [
      [2, "plain"],
      [2, "big"],
    ],
  },
  // call to action
  {
    at: 102,
    lines: [
      [1, "plain"],
      [2, "red"],
      [4, "plain"],
    ],
  },
  {
    at: 109,
    lines: [
      [3, "plain"],
      [2, "big"],
      [2, "plain"],
    ],
  },
  {
    at: 116,
    lines: [
      [3, "plain"],
      [2, "red"],
    ],
  },
];

// Single words shown in a red box instead of plain white.
export const RED_WORDS: number[] = [12, 15];

// Name lower third replaces captions for these words.
export const NAME_CARD = {
  from: 95,
  to: 101,
  name: "Luca Perrone",
  role: "Agenzia Generali Frascati · Piazza Roma",
};

export const CUTAWAYS: { from: number; to: number; scene: Scene }[] = [
  { from: 16, to: 21, scene: "years" },
  { from: 31, to: 44, scene: "life" },
  { from: 45, to: 56, scene: "steps" },
  { from: 57, to: 71, scene: "gap" },
  { from: 76, to: 81, scene: "flex" },
  { from: 82, to: 94, scene: "deadline" },
];

export const BADGES: { from: number; to: number; n: number; label: string }[] =
  [
    { from: 76, to: 78, n: 1, label: "Versi quando vuoi" },
    { from: 79, to: 81, n: 2, label: "Versi come vuoi" },
    { from: 82, to: 94, n: 3, label: "Vantaggi fiscali" },
  ];
