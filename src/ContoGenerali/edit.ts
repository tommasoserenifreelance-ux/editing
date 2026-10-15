// The edit decision list: which words become stacked "key phrase" blocks,
// which single words get a red box, where graphics cut in, and the reason
// badges. Word indexes refer to CLIPS[clip].words in timeline.ts.

export type LineStyle = "plain" | "big" | "red";

export type Block = {
  clip: number;
  at: number;
  // [number of words, style] per line, consumed in order from `at`
  lines: [number, LineStyle][];
  icon?: "pin";
};

export type Scene = "atm" | "app" | "cards" | "bank";

export type Cutaway = { clip: number; from: number; to: number; scene: Scene };

export const BLOCKS: Block[] = [
  // 1: hook + presentation
  {
    clip: 0,
    at: 0,
    lines: [
      [2, "plain"],
      [2, "red"],
    ],
  },
  {
    clip: 0,
    at: 7,
    lines: [
      [2, "big"],
      [1, "plain"],
      [2, "red"],
    ],
    icon: "pin",
  },
  {
    clip: 0,
    at: 12,
    lines: [
      [4, "plain"],
      [2, "red"],
    ],
  },
  {
    clip: 0,
    at: 18,
    lines: [
      [2, "plain"],
      [2, "red"],
      [3, "big"],
    ],
  },
  {
    clip: 0,
    at: 29,
    lines: [
      [2, "red"],
      [3, "plain"],
    ],
  },
  // 2: ATM
  {
    clip: 1,
    at: 0,
    lines: [
      [2, "plain"],
      [1, "red"],
      [4, "big"],
      [2, "plain"],
    ],
  },
  // 3: app
  {
    clip: 2,
    at: 4,
    lines: [
      [1, "plain"],
      [2, "red"],
      [2, "big"],
    ],
  },
  {
    clip: 2,
    at: 9,
    lines: [
      [3, "plain"],
      [1, "red"],
    ],
  },
  // 4: SDD + dossier titoli
  {
    clip: 3,
    at: 0,
    lines: [
      [2, "big"],
      [2, "red"],
    ],
  },
  {
    clip: 3,
    at: 7,
    lines: [
      [1, "red"],
      [2, "plain"],
      [2, "big"],
    ],
  },
  // 5: payments and cards
  {
    clip: 4,
    at: 6,
    lines: [
      [1, "big"],
      [1, "red"],
    ],
  },
  {
    clip: 4,
    at: 15,
    lines: [
      [1, "plain"],
      [2, "red"],
    ],
  },
  {
    clip: 4,
    at: 18,
    lines: [
      [2, "plain"],
      [3, "red"],
    ],
  },
  // 6: come in to the agency
  {
    clip: 5,
    at: 10,
    lines: [
      [3, "plain"],
      [1, "red"],
    ],
  },
  {
    clip: 5,
    at: 16,
    lines: [
      [3, "plain"],
      [3, "red"],
    ],
  },
  {
    clip: 5,
    at: 24,
    lines: [
      [1, "plain"],
      [1, "red"],
    ],
  },
  {
    clip: 5,
    at: 26,
    lines: [
      [3, "plain"],
      [2, "big"],
      [3, "red"],
    ],
    icon: "pin",
  },
  // 7: Federica
  {
    clip: 6,
    at: 16,
    lines: [
      [2, "plain"],
      [1, "red"],
      [2, "plain"],
      [3, "big"],
    ],
  },
  // 8: closing line
  {
    clip: 7,
    at: 0,
    lines: [
      [2, "red"],
      [3, "plain"],
      [2, "big"],
      [2, "red"],
    ],
  },
];

// Single words shown in a red box instead of plain white.
export const RED_WORDS: [clip: number, word: number][] = [
  [0, 28],
  [2, 3],
  [3, 6],
  [4, 2],
  [4, 11],
  [5, 5],
  [6, 12],
];

// Name lower third replaces captions for these words.
export const NAME_CARD = { clip: 6, from: 2, to: 7 };

export const CUTAWAYS: Cutaway[] = [
  { clip: 1, from: 0, to: 8, scene: "atm" },
  { clip: 2, from: 4, to: 12, scene: "app" },
  { clip: 4, from: 6, to: 22, scene: "cards" },
  { clip: 5, from: 16, to: 21, scene: "bank" },
];

export const REASONS: { clip: number; n: number; label: string }[] = [
  { clip: 1, n: 1, label: "Prelievi gratis" },
  { clip: 2, n: 2, label: "Home banking e app" },
  { clip: 3, n: 3, label: "Zero costi" },
  { clip: 4, n: 4, label: "Pagamenti e carte" },
];
