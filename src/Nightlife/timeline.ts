// Edit decision list copied frame by frame from the reference reel (30 fps).
// Every cut, flash and caption lands on the same frame as the reference.

export const NIGHTLIFE_FPS = 30;
export const NIGHTLIFE_DURATION = 720; // 24 s, length of the music track

// Black & white intro until the drop, colour after it.
export const DROP = 277;
// After this frame the screen is black for the end card.
export const END_CARD = 632;

export const CLIPS = {
  v1: "nightlife/clips/v1.mp4", // blonde with lollipop 0-14 s, brunette in red 14-21.7 s
  v2: "nightlife/clips/v2.mp4", // brunette singing, 8 s
  v4: "nightlife/clips/v4.mp4", // group of girls with drinks, 17.7 s
  v5: "nightlife/clips/v5.mp4", // two girls smoking, 8.2 s
  dancer: "nightlife/clips/ballerine.mp4", // dancer in purple corset, 30 s
  sign: "nightlife/clips/logo.mp4", // neon "venus" sign, 1 s
} as const;

export type ClipFx = "flicker" | "swirl" | "rgb";

export type Cut = {
  from: number;
  clip: keyof typeof CLIPS;
  // Second of the source clip shown on the first frame of the cut.
  at: number;
  fx?: ClipFx;
};

// Each cut lasts until the next one starts.
export const CUTS: Cut[] = [
  // Black & white, lyrics on screen
  { from: 0, clip: "v1", at: 1.0 },
  { from: 8, clip: "v4", at: 3.5 },
  { from: 14, clip: "v2", at: 0.5 },
  { from: 25, clip: "dancer", at: 3.5, fx: "flicker" },
  { from: 48, clip: "v4", at: 14.5 },
  { from: 59, clip: "v1", at: 14.0 },
  { from: 70, clip: "dancer", at: 20.0 },
  { from: 94, clip: "v2", at: 3.0, fx: "swirl" },
  { from: 123, clip: "v1", at: 6.0 },
  { from: 145, clip: "v5", at: 0.5 },
  { from: 160, clip: "v1", at: 18.0 },
  { from: 183, clip: "dancer", at: 9.5 },
  { from: 198, clip: "v4", at: 7.0 },
  { from: 228, clip: "v4", at: 15.0 },
  { from: 253, clip: "dancer", at: 24.0 },
  // Drop: colour, cuts on the beat
  { from: 277, clip: "dancer", at: 0.0, fx: "rgb" },
  { from: 294, clip: "v2", at: 5.0 },
  { from: 312, clip: "v1", at: 9.0 },
  { from: 335, clip: "v4", at: 0.0 },
  { from: 361, clip: "dancer", at: 12.5 },
  { from: 378, clip: "v5", at: 5.0 },
  { from: 392, clip: "v1", at: 15.5 },
  { from: 408, clip: "dancer", at: 17.0, fx: "swirl" },
  { from: 415, clip: "v2", at: 1.5 },
  { from: 422, clip: "v4", at: 11.0 },
  { from: 430, clip: "dancer", at: 22.0 },
  { from: 437, clip: "v1", at: 3.0 },
  { from: 449, clip: "sign", at: 0.0 },
  { from: 474, clip: "dancer", at: 6.0 },
  { from: 494, clip: "v4", at: 8.0 },
  { from: 510, clip: "v2", at: 6.5 },
  { from: 519, clip: "dancer", at: 27.0 },
  { from: 540, clip: "v1", at: 11.5 },
  { from: 554, clip: "v5", at: 6.8 },
  { from: 564, clip: "dancer", at: 14.5 },
  { from: 577, clip: "v4", at: 13.0 },
  { from: 588, clip: "dancer", at: 10.0 },
  { from: 592, clip: "v1", at: 19.0 },
  { from: 598, clip: "v2", at: 4.0 },
  { from: 603, clip: "dancer", at: 24.5 },
  { from: 609, clip: "sign", at: 0.5 },
  { from: 618, clip: "dancer", at: 28.5 },
];

// White frames. "soft" ones only wash the picture out halfway.
export const FLASHES: [number, number, "full" | "soft"][] = [
  [5, 8, "full"],
  [23, 25, "full"],
  [45, 48, "full"],
  [57, 59, "full"],
  [68, 70, "full"],
  [89, 94, "full"],
  [120, 123, "full"],
  [158, 160, "full"],
  [180, 183, "full"],
  [195, 198, "full"],
  [225, 228, "full"],
  [285, 287, "soft"],
  [292, 294, "full"],
  [333, 335, "full"],
  [518, 519, "full"],
  [563, 564, "full"],
  [585, 588, "full"],
  [590, 592, "full"],
  [597, 598, "full"],
  [602, 603, "full"],
  [608, 609, "full"],
  [630, 632, "full"],
];

// Blown-out magenta smears between shots; the first one is the drop.
export const SMEARS: [number, number][] = [
  [269, 277],
  [355, 361],
  [375, 378],
  [405, 408],
  [427, 430],
  [507, 510],
];

export type Caption = {
  from: number;
  to: number;
  // Index into the lyrics prop.
  line: number;
  // Frame where the caption starts fading out.
  fade?: number;
  big?: boolean;
};

export const CAPTIONS: Caption[] = [
  { from: 0, to: 21, line: 0 },
  { from: 21, to: 41, line: 1, fade: 34 },
  { from: 45, to: 86, line: 2, fade: 80 },
  { from: 89, to: 110, line: 3, fade: 104 },
  { from: 120, to: 142, line: 4, fade: 136, big: true },
  { from: 145, to: 177, line: 5, fade: 168 },
  { from: 180, to: 219, line: 6, fade: 210 },
  { from: 225, to: 252, line: 7, fade: 246 },
];

export const END_TEXT = { from: 633, to: 672, fade: 660 };

// Logo stamped over the last black & white shot, then the end card.
export const LOGO_STAMP: [number, number] = [258, 269];
export const LOGO_END = { from: 672, in: 678, out: 693, to: 714 };
