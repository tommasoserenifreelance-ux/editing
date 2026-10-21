// Edit decision list for the Venus reel (30 fps). It keeps the structure of
// the reference reel: a black & white voice-over intro with white flashes on
// every phrase, a magenta smear into the drop, a colour section cut on the
// beat, a fast flash burst and a black end card.

export const NIGHTLIFE_FPS = 30;

// The song starts after the first voice line; music.m4a carries this pre-roll
// (see scripts/nightlife_audio.py).
export const MUSIC_START = 59;

// Beat grid of the song (seconds, 123 BPM), from the drop to the end card.
const SONG_BEATS = [
  6.43, 6.9, 7.38, 7.87, 8.34, 8.82, 9.31, 9.78, 10.26, 10.75, 11.22, 11.7,
  12.17, 12.65, 13.14, 13.63, 14.09, 14.58, 15.07, 15.53, 16.02, 16.51, 17.0,
  17.46, 17.95,
];
// Frame of beat i counted from the drop.
export const beat = (i: number) =>
  MUSIC_START + Math.round(SONG_BEATS[i] * NIGHTLIFE_FPS);

export const DROP = beat(0);
// Colour comes in once the drop smear clears.
export const COLOR_FROM = DROP + 7;
export const END_CARD = beat(24);
export const NIGHTLIFE_DURATION = 710; // music track length

export const CLIPS = {
  v1: "nightlife/clips/v1.mp4", // blonde with lollipop 0-14 s, brunette in red 14-21.7 s
  v2: "nightlife/clips/v2.mp4", // brunette singing, 8 s
  v4: "nightlife/clips/v4.mp4", // group of girls with drinks, 17.7 s
  v5: "nightlife/clips/v5.mp4", // two girls smoking, 8.2 s
  dancer: "nightlife/clips/ballerine.mp4", // dancer in purple corset, 30 s
  sign: "nightlife/clips/logo.mp4", // neon "venus" sign, 1 s
  t1: "nightlife/clips/t1.mp4", // blonde in black corset dancing, 15.6 s
  t2: "nightlife/clips/t2.mp4", // crowd under the Venus sign, 2.4 s
  t3: "nightlife/clips/t3.mp4", // crowd and lights, Venus sign, 4.9 s
  t4: "nightlife/clips/t4.mp4", // brunette blowing a kiss, 2 s
  t5: "nightlife/clips/t5.mp4", // blonde blowing a kiss, hand to lens, 3.3 s
  t6: "nightlife/clips/t6.mp4", // brunette kiss 0-2.9 s, blonde in zebra 3.3-5.7 s
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
  // Black & white voice-over intro
  { from: 0, clip: "t1", at: 0.5 },
  { from: 28, clip: "dancer", at: 20.0 },
  { from: 54, clip: "t4", at: 0.0 },
  { from: 76, clip: "v1", at: 14.0 },
  { from: 108, clip: "t5", at: 1.0 },
  { from: 149, clip: "v4", at: 15.0 },
  { from: 163, clip: "t6", at: 3.4 },
  { from: 184, clip: "dancer", at: 9.5, fx: "swirl" },
  { from: 210, clip: "t1", at: 8.0, fx: "flicker" },
  { from: 230, clip: "v1", at: 6.0 },
  // Drop: colour, cuts on the beat
  { from: COLOR_FROM, clip: "t3", at: 0.0, fx: "rgb" },
  { from: beat(2), clip: "t1", at: 1.0 },
  { from: beat(3), clip: "t6", at: 0.0 },
  { from: beat(5) + 2, clip: "dancer", at: 0.0 },
  { from: beat(6), clip: "v2", at: 5.0 },
  { from: beat(7) + 2, clip: "t5", at: 0.0 },
  { from: beat(9) + 2, clip: "v4", at: 0.0 },
  { from: beat(10), clip: "dancer", at: 12.5 },
  { from: beat(11), clip: "t1", at: 9.0 },
  { from: beat(12) + 2, clip: "t2", at: 0.3 },
  { from: beat(13), clip: "v1", at: 9.0 },
  { from: beat(14), clip: "dancer", at: 17.0, fx: "swirl" },
  { from: beat(16) + 2, clip: "t6", at: 3.4 },
  { from: beat(17), clip: "v5", at: 5.0 },
  { from: beat(18) + 1, clip: "t4", at: 0.5 },
  { from: beat(19), clip: "dancer", at: 22.0 },
  { from: beat(20), clip: "t1", at: 12.0 },
  { from: beat(21) + 1, clip: "v2", at: 1.5 },
  // Flash burst into the end card
  { from: beat(22), clip: "dancer", at: 27.0 },
  { from: beat(22) + 8, clip: "t3", at: 2.5 },
  { from: beat(23), clip: "v1", at: 19.0 },
  { from: beat(23) + 6, clip: "t2", at: 1.0 },
  { from: beat(23) + 10, clip: "dancer", at: 28.5 },
];

// White frames. "soft" ones only wash the picture out halfway.
export const FLASHES: [number, number, "full" | "soft"][] = [
  [51, 54, "full"],
  [105, 108, "full"],
  [110, 112, "full"],
  [147, 149, "full"],
  [182, 184, "full"],
  [207, 210, "full"],
  [beat(2), beat(2) + 2, "soft"],
  [beat(6), beat(6) + 2, "full"],
  [beat(10), beat(10) + 2, "full"],
  [beat(16), beat(16) + 2, "full"],
  [beat(21), beat(21) + 1, "full"],
  [beat(22) + 7, beat(22) + 8, "full"],
  [beat(23) - 2, beat(23), "full"],
  [beat(23) + 5, beat(23) + 6, "full"],
  [beat(23) + 9, beat(23) + 10, "full"],
  [END_CARD - 2, END_CARD, "full"],
];

// Blown-out magenta smears between shots; the first one is the drop.
export const SMEARS: [number, number][] = [
  [246, COLOR_FROM],
  [beat(5) - 4, beat(5) + 2],
  [beat(7) - 3, beat(7) + 2],
  [beat(9) - 3, beat(9) + 2],
  [beat(12) - 3, beat(12) + 2],
  [beat(16) - 4, beat(16)],
  [beat(18) - 3, beat(18) + 1],
];

export type Caption = {
  from: number;
  to: number;
  // Index into the captions prop.
  line: number;
  // Frame where the caption starts fading out.
  fade?: number;
};

// One caption per voice-over phrase (public/nightlife/voice.m4a).
export const CAPTIONS: Caption[] = [
  { from: 0, to: 50, line: 0, fade: 44 },
  { from: 53, to: 105, line: 1, fade: 98 },
  { from: 149, to: 182, line: 2 },
  { from: 184, to: 207, line: 3 },
  { from: 210, to: 246, line: 4, fade: 240 },
];

export const VOICE_SPAN: [number, number] = [0, 245];

// Venus logo slammed in on the word "Venus".
export const LOGO_STAMP: [number, number] = [112, 147];

export const END_TEXT = {
  from: END_CARD + 2,
  to: END_CARD + 42,
  fade: END_CARD + 32,
};
export const END_LOGOS = [
  {
    logo: "venus",
    from: END_CARD + 42,
    in: END_CARD + 48,
    out: END_CARD + 70,
    to: END_CARD + 77,
  },
  {
    logo: "yab",
    from: END_CARD + 78,
    in: END_CARD + 84,
    out: END_CARD + 104,
    to: END_CARD + 111,
  },
] as const;

// Sound effects, by frame.
export const SFX: { file: string; from: number; volume: number }[] = [
  { file: "impact", from: MUSIC_START, volume: 0.35 },
  ...FLASHES.filter(([from]) => from < DROP).map(([from]) => ({
    file: "flash",
    from,
    volume: 0.35,
  })),
  { file: "impact", from: LOGO_STAMP[0], volume: 0.6 },
  { file: "riser", from: DROP - 54, volume: 0.5 },
  { file: "impact", from: DROP, volume: 0.5 },
  ...SMEARS.slice(1).map(([from]) => ({
    file: "whoosh",
    from: from - 6,
    volume: 0.45,
  })),
  ...FLASHES.filter(([from]) => from > beat(21)).map(([from]) => ({
    file: "flash",
    from,
    volume: 0.4,
  })),
  { file: "impact", from: END_CARD, volume: 0.5 },
];
