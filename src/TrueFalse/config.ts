// Edit this file to build the video: one entry per clip, in order.
// All times are in seconds, relative to the start of each clip.

export type Caption = { from: number; to: number; text: string };

export type Clip = {
  // File in public/truefalse/, or null for a placeholder while editing.
  src: string | null;
  // Seconds of the source file to use.
  trimStart?: number;
  duration: number;
  // Part of the clip shown in black & white (the question).
  question: { from: number; to: number } | null;
  // Correct answer, revealed with a green (true) or red (false) flash.
  answer: boolean | null;
  revealAt: number;
  captions: Caption[];
};

export const FPS = 24;
export const TRANSITION_SECONDS = 0.4;

export const LABELS = { true: "Vero", or: "o", false: "Falso" };

export const CLIPS: Clip[] = [
  {
    src: null,
    duration: 4,
    question: null,
    answer: null,
    revealAt: 0,
    captions: [
      { from: 0.2, to: 2, text: "Oggi giochiamo a vero o falso" },
      { from: 2, to: 3.8, text: "Vediamo quante ne indovini" },
    ],
  },
  {
    src: null,
    duration: 6,
    question: { from: 0, to: 3 },
    answer: true,
    revealAt: 3,
    captions: [
      { from: 0.2, to: 3, text: "Domanda di esempio numero uno?" },
      { from: 3, to: 5.8, text: "Vero!" },
    ],
  },
  {
    src: null,
    duration: 6,
    question: { from: 0, to: 3 },
    answer: false,
    revealAt: 3,
    captions: [
      { from: 0.2, to: 3, text: "Domanda di esempio numero due?" },
      { from: 3, to: 5.8, text: "Falso!" },
    ],
  },
];
