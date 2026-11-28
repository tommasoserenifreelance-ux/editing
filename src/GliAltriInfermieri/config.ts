import aghiCaptions from "./aghi.captions.json";
import cortisoloCaptions from "./cortisolo.captions.json";

export type Word = { t: number; text: string; style: "white" | "lime" | "red" };
export type CaptionGroup = { start: number; end: number; words: Word[] };

export type HookLine = { text: string; kind: "small" | "big"; color?: "white" | "lime"; dot?: boolean };

export type Sticker =
  | { kind: "img"; src: string; from: number; to: number; w: number; x?: number; rot?: number; xAt?: number }
  | { kind: "photo"; src: string; from: number; to: number; w: number; rot?: number }
  | { kind: "clock"; from: number; to: number }
  | { kind: "badge"; from: number; to: number; small: string; big: string };

export type Flash = { from: number; to: number; num?: string; title: string[] };

export type ReelConfig = {
  video: string;
  /** seconds of the cut video */
  videoDuration: number;
  /** freeze the last frame for this long so the closing line can breathe */
  tail: number;
  captions: CaptionGroup[];
  /** vertical centre of captions, fraction of height (chest level, below every face) */
  captionY: number;
  hook: { from: number; to: number; y: number; lines: HookLine[]; hideCaptions: boolean };
  stickers: Sticker[];
  stickerY: number;
  flashes: Flash[];
  /** punch-zoom points: [time, scale] */
  zooms: [number, number][];
  /** windows where the shot is a close-up with the face at the top edge */
  closeups: [number, number][];
  slogan: { a: number; b: number };
};

const sentence = (ts: number[], big = 1.12): [number, number][] =>
  ts.map((t, i) => [t, i % 2 === 0 ? 1.0 : big]);

export const CORTISOLO: ReelConfig = {
  video: "gai/cortisolo_cut.mp4",
  videoDuration: 51.8,
  tail: 0.9,
  captions: cortisoloCaptions as CaptionGroup[],
  captionY: 0.665,
  stickerY: 0.515,
  hook: {
    from: 0.04,
    to: 3.18,
    y: 0.53,
    hideCaptions: true,
    lines: [
      { text: "Il test che", kind: "small" },
      { text: "TUTTI", kind: "big" },
      { text: "SBAGLIANO", kind: "big", color: "lime", dot: true },
    ],
  },
  stickers: [
    { kind: "img", src: "gai/img/kit.png", from: 3.6, to: 5.22, w: 600, rot: -4 },
    { kind: "photo", src: "gai/img/casa.jpg", from: 7.4, to: 9.85, w: 560, rot: 3 },
    { kind: "img", src: "gai/img/provette.png", from: 11.06, to: 12.9, w: 600, rot: -3 },
    { kind: "clock", from: 12.92, to: 14.3 },
    { kind: "clock", from: 21.8, to: 24.5 },
    { kind: "img", src: "gai/img/frigo.png", from: 26.24, to: 27.86, w: 520, rot: 3 },
    { kind: "img", src: "gai/img/provettina.png", from: 29.82, to: 31.62, w: 560, rot: -3 },
    { kind: "badge", from: 35.54, to: 37.36, small: "nei", big: "30 MIN PRIMA" },
    { kind: "img", src: "gai/img/spazzolino.png", from: 37.4, to: 38.32, w: 640, rot: -8, xAt: 37.55 },
    { kind: "img", src: "gai/img/panino.png", from: 38.36, to: 39.12, w: 460, rot: 4, xAt: 38.5 },
    { kind: "img", src: "gai/img/bicchiere.png", from: 39.14, to: 39.77, w: 260, rot: -4, xAt: 39.28 },
    { kind: "img", src: "gai/img/sigaretta.png", from: 39.8, to: 40.66, w: 640, rot: -6, xAt: 39.96 },
  ],
  flashes: [{ from: 27.9, to: 29.8, title: ["ERRORI", "COMUNI"] }],
  zooms: sentence([0, 3.2, 9.9, 14.36, 20.84, 24.58, 27.9, 29.82, 34.56, 37.4, 38.36, 39.14, 39.8, 40.7, 43.3, 45.8, 47.56, 49.06]),
  closeups: [],
  slogan: { a: 47.56, b: 49.06 },
};

export const AGHI: ReelConfig = {
  video: "gai/aghi_cut.mp4",
  videoDuration: 44.93,
  tail: 0.9,
  captions: aghiCaptions as CaptionGroup[],
  captionY: 0.72,
  stickerY: 0.53,
  hook: {
    from: 0.04,
    to: 4.6,
    y: 0.555,
    hideCaptions: false,
    lines: [
      { text: "Ozonoterapia e simili:", kind: "small" },
      { text: "L'AGO RESTA", kind: "big" },
      { text: "IN VENA?", kind: "big", color: "lime" },
    ],
  },
  stickers: [],
  flashes: [
    { from: 9.58, to: 10.9, num: "1", title: ["AGOCANNULA"] },
    { from: 24.96, to: 26.2, num: "2", title: ["BUTTERFLY"] },
  ],
  zooms: sentence([0, 2.68, 5.0, 7.72, 10.54, 14.64, 17.82, 20.74, 23.82, 25.94, 28.9, 30.64, 33.6, 36.14, 38.3, 40.54, 42.0]),
  closeups: [
    [16.6, 23.5],
    [28.9, 33.42],
  ],
  slogan: { a: 40.54, b: 42.0 },
};
