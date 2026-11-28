import aghiCaptions from "./aghi.captions.json";
import cortisoloCaptions from "./cortisolo.captions.json";
import { FPS } from "./brand";

export type Word = { t: number; text: string; style: "white" | "lime" | "red" };
export type CaptionGroup = { start: number; end: number; words: Word[] };

export type HookLine = { text: string; kind: "small" | "big"; color?: "white" | "lime"; dot?: boolean };

export type Sticker =
  | { kind: "img"; src: string; from: number; to: number; w: number; rot?: number; xAt?: number }
  | { kind: "photo"; src: string; from: number; to: number; w: number; rot?: number }
  | { kind: "badge"; from: number; to: number; big: string };

export type Flash = { from: number; to: number; num?: string; title: string[] };

/** f = first frame of the new framing; instant = lands on a hard cut, so no easing */
export type Zoom = { f: number; s: number; instant: boolean };

export type ReelConfig = {
  video: string;
  /** frames of the cut video */
  videoFrames: number;
  /** freeze the last frame for this long so the closing line can breathe */
  tail: number;
  captions: CaptionGroup[];
  /** vertical centre of captions, fraction of height (chest level, below every face) */
  captionY: number;
  hook: { from: number; to: number; y: number; lines: HookLine[]; hideCaptions: boolean; riserPeak?: number };
  stickers: Sticker[];
  stickerY: number;
  flashes: Flash[];
  zooms: Zoom[];
  /** close-up shots (face at the top edge): [firstFrame, endFrame) */
  closeups: [number, number][];
  slogan: { a: number; b: number; y: number };
};

/**
 * Scale changes sit exactly on the hard cuts of the footage (frame-accurate, instant),
 * plus quick punches on sentence starts that are well inside a shot.
 */
const buildZooms = (cuts: number[], mids: number[], big = 1.12): Zoom[] => {
  const pts: { f: number; instant: boolean }[] = [{ f: 0, instant: true }, ...cuts.map((f) => ({ f, instant: true }))];
  for (const t of mids) {
    const f = Math.round(t * FPS);
    if (cuts.every((c) => Math.abs(c - f) > 0.8 * FPS) && f > 0) pts.push({ f, instant: false });
  }
  pts.sort((a, b) => a.f - b.f);
  return pts.map((p, i) => ({ ...p, s: i % 2 === 0 ? 1.0 : big }));
};

export const CORTISOLO: ReelConfig = {
  video: "gai/cortisolo_cut.mp4",
  videoFrames: 1244,
  tail: 0.9,
  captions: cortisoloCaptions as CaptionGroup[],
  captionY: 0.735,
  stickerY: 0.585,
  hook: {
    from: 0.04,
    to: 3.18,
    y: 0.6,
    hideCaptions: true,
    riserPeak: 3.1,
    lines: [
      { text: "Il test che", kind: "small" },
      { text: "TUTTI", kind: "big" },
      { text: "SBAGLIANO", kind: "big", color: "lime", dot: true },
    ],
  },
  stickers: [
    { kind: "img", src: "gai/img/kit.png", from: 3.6, to: 5.22, w: 600, rot: -4 },
    { kind: "photo", src: "gai/img/casa.jpg", from: 7.4, to: 9.7, w: 540, rot: 3 },
    { kind: "img", src: "gai/img/provette.png", from: 11.06, to: 12.9, w: 600, rot: -3 },
    { kind: "img", src: "gai/img/orologio.png", from: 12.92, to: 14.25, w: 330, rot: 4 },
    { kind: "img", src: "gai/img/orologio.png", from: 21.8, to: 24.5, w: 330, rot: -4 },
    { kind: "img", src: "gai/img/frigo.png", from: 26.24, to: 27.9, w: 520, rot: 3 },
    { kind: "img", src: "gai/img/provettina.png", from: 29.82, to: 31.62, w: 560, rot: -3 },
    { kind: "badge", from: 35.55, to: 37.38, big: "30 MIN PRIMA" },
    { kind: "img", src: "gai/img/spazzolino.png", from: 37.4, to: 38.32, w: 640, rot: -8, xAt: 37.55 },
    { kind: "img", src: "gai/img/panino.png", from: 38.36, to: 39.12, w: 460, rot: 4, xAt: 38.5 },
    { kind: "img", src: "gai/img/bicchiere.png", from: 39.14, to: 39.77, w: 260, rot: -4, xAt: 39.28 },
    { kind: "img", src: "gai/img/sigaretta.png", from: 39.8, to: 40.66, w: 640, rot: -6, xAt: 39.96 },
  ],
  flashes: [{ from: 27.92, to: 29.8, title: ["ERRORI", "COMUNI"] }],
  zooms: buildZooms(
    [233, 342, 499, 588, 670, 829, 1039, 1137, 1177],
    [3.2, 29.82, 37.4, 38.36, 39.14, 39.8, 40.72, 45.82],
  ),
  closeups: [],
  slogan: { a: 47.58, b: 49.06, y: 0.68 },
};

export const AGHI: ReelConfig = {
  video: "gai/aghi_cut.mp4",
  videoFrames: 1078,
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
  zooms: buildZooms(
    [252, 399, 564, 694, 802, 968],
    [2.68, 5.0, 7.72, 14.64, 17.82, 20.74, 25.94, 30.64, 36.14, 38.3, 42.0],
  ),
  closeups: [
    [399, 564],
    [694, 802],
  ],
  slogan: { a: 40.53, b: 42.0, y: 0.68 },
};
