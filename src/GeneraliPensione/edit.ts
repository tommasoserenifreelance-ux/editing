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
      [3, "plain"],
      [3, "red"],
    ],
  },
  {
    at: 35,
    lines: [
      [1, "plain"],
      [1, "big"],
    ],
  },
  // life moments
  {
    at: 37,
    lines: [
      [2, "plain"],
      [3, "red"],
    ],
  },
  {
    at: 42,
    lines: [
      [3, "plain"],
      [3, "big"],
    ],
  },
  {
    at: 48,
    lines: [
      [2, "plain"],
      [1, "red"],
    ],
  },
  // one step at a time
  {
    at: 51,
    lines: [
      [5, "plain"],
      [2, "big"],
    ],
  },
  {
    at: 58,
    lines: [
      [2, "plain"],
      [3, "red"],
    ],
  },
  // public pension gap
  {
    at: 63,
    lines: [
      [1, "plain"],
      [2, "red"],
      [2, "plain"],
    ],
  },
  {
    at: 68,
    lines: [
      [2, "plain"],
      [1, "red"],
    ],
  },
  {
    at: 71,
    lines: [
      [2, "plain"],
      [3, "big"],
      [2, "plain"],
    ],
  },
  // the solution
  {
    at: 78,
    lines: [
      [2, "plain"],
      [1, "big"],
      [1, "red"],
    ],
  },
  {
    at: 82,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 85,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 88,
    lines: [
      [3, "plain"],
      [2, "big"],
    ],
  },
  {
    at: 93,
    lines: [
      [2, "plain"],
      [2, "red"],
    ],
  },
  {
    at: 97,
    lines: [
      [2, "plain"],
      [2, "big"],
    ],
  },
  // call to action
  {
    at: 108,
    lines: [
      [1, "plain"],
      [2, "red"],
      [4, "plain"],
    ],
  },
  {
    at: 115,
    lines: [
      [3, "plain"],
      [2, "big"],
      [2, "plain"],
    ],
  },
  {
    at: 122,
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
  from: 101,
  to: 107,
  name: "Luca Perrone",
  role: "Agenzia Generali Frascati · Piazza Roma",
};

export const CUTAWAYS: { from: number; to: number; scene: Scene }[] = [
  { from: 16, to: 21, scene: "years" },
  { from: 37, to: 50, scene: "life" },
  { from: 51, to: 62, scene: "steps" },
  { from: 63, to: 77, scene: "gap" },
  { from: 82, to: 87, scene: "flex" },
  { from: 88, to: 100, scene: "deadline" },
];

export const BADGES: { from: number; to: number; n: number; label: string }[] =
  [
    { from: 82, to: 84, n: 1, label: "Versi quando vuoi" },
    { from: 85, to: 87, n: 2, label: "Versi come vuoi" },
    { from: 88, to: 100, n: 3, label: "Vantaggi fiscali" },
  ];
