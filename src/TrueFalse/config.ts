// Edit this file to build the video: one entry per clip, in order.
// All times are in seconds, relative to the start of each clip.

export type Caption = { from: number; to: number; text: string };

export type Clip = {
  // File in public/truefalse/, or null for a placeholder while editing.
  src: string | null;
  duration: number;
  // Part of the clip shown in black & white (the question).
  question: { from: number; to: number } | null;
  // Correct answer: green (true) or red (false) on the stickers.
  answer: boolean | null;
  revealAt: number;
  // End of the reveal (seconds); by default it lasts to the end of the clip.
  revealEnd?: number;
  // Flash and badge on the reveal. Off for a clip that continues an answer.
  flash?: boolean;
  captions: Caption[];
};

export const FPS = 24;
// Swipe between clips, played over frozen frames so voices never overlap.
export const TRANSITION_SECONDS = 0.35;

export const LABELS = {
  top: ["Sfatiamo", "i"],
  bottom: "Falsi miti",
  true: "Vero",
  false: "Falso",
};

export const CLIPS: Clip[] = [
  {
    src: "collagene_1.mp4",
    duration: 4.79,
    question: null,
    answer: null,
    revealAt: 0,
    captions: [
      { from: 1.9, to: 2.9, text: "Collagene." },
      { from: 2.95, to: 4.75, text: "Sfatiamo dei falsi miti" },
    ],
  },
  {
    src: "collagene_2.mp4",
    duration: 6.875,
    question: { from: 0, to: 6.15 },
    answer: false,
    revealAt: 6.15,
    captions: [
      { from: 0, to: 1.0, text: "Il collagene che bevi" },
      { from: 1.0, to: 2.4, text: "va diretto nella pelle?" },
      { from: 6.15, to: 6.875, text: "No," },
    ],
  },
  {
    src: "collagene_3.mp4",
    duration: 6.25,
    question: null,
    answer: false,
    revealAt: 0,
    flash: false,
    captions: [
      { from: 0, to: 2.2, text: "viene digerito in aminoacidi" },
      { from: 2.2, to: 3.35, text: "e piccoli peptidi." },
      { from: 3.35, to: 4.25, text: "Ed è il corpo" },
      { from: 4.25, to: 6.2, text: "a decidere dove utilizzarlo" },
    ],
  },
  {
    src: "collagene_4.mp4",
    duration: 14.5,
    question: { from: 0, to: 5.0 },
    answer: false,
    revealAt: 5.35,
    captions: [
      { from: 0, to: 2.5, text: "Non c'è differenza se assumo il collagene" },
      { from: 2.5, to: 5.0, text: "subito dopo i pasti o lontano dai pasti" },
      { from: 5.35, to: 6.0, text: "Falso!" },
      { from: 6.05, to: 7.7, text: "Perché è meglio assumerlo" },
      { from: 7.7, to: 8.6, text: "lontano dai pasti." },
      { from: 8.6, to: 9.6, text: "Tuttavia" },
      { from: 9.6, to: 10.6, text: "non succede nulla" },
      { from: 10.6, to: 11.75, text: "se lo vuoi assumere" },
      { from: 11.75, to: 13.3, text: "per la tua digeribilità" },
      { from: 13.3, to: 14.45, text: "subito dopo un pasto" },
    ],
  },
  {
    src: "collagene_5.mp4",
    duration: 14.583,
    question: { from: 0, to: 4.1 },
    answer: false,
    revealAt: 4.2,
    captions: [
      { from: 0.2, to: 2.55, text: "Il collagene incomincia a calare" },
      { from: 2.55, to: 4.1, text: "a partire dai 45 anni" },
      { from: 4.2, to: 4.9, text: "Falso!" },
      {
        from: 4.95,
        to: 8.05,
        text: "Incomincia già a calare, pensate un po',",
      },
      { from: 8.1, to: 10.3, text: "a partire dai 25 anni." },
      { from: 10.4, to: 12.25, text: "Ovviamente con la perimenopausa" },
      { from: 12.3, to: 14.5, text: "e la menopausa il calo diventa maggiore" },
    ],
  },
  {
    src: "collagene_6.mp4",
    duration: 10.208,
    question: { from: 0, to: 1.95 },
    answer: false,
    revealAt: 1.95,
    // Back to normal for the closing line.
    revealEnd: 5.3,
    captions: [
      { from: 0, to: 0.9, text: "Il collagene" },
      { from: 0.9, to: 1.95, text: "serve solo per la pelle?" },
      { from: 1.95, to: 2.45, text: "Falso!" },
      { from: 2.45, to: 3.5, text: "Serve anche per ossa," },
      { from: 3.5, to: 5.3, text: "tendini, cartilagini e vasi." },
      { from: 5.35, to: 6.8, text: "È la proteina" },
      { from: 6.8, to: 10.1, text: "più importante per il nostro corpo" },
    ],
  },
];
