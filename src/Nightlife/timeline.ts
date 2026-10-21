// Edit decision list copied frame by frame from the reference reel (30 fps).
// Every cut, flash and smear lands on the same frame as the reference; the
// Venus song is placed so its drop hits the reference drop.

export const NIGHTLIFE_FPS = 30;
export const NIGHTLIFE_DURATION = 720; // 24 s

// Black & white intro until the drop, colour after it.
export const DROP = 277;
// After this frame the screen is black for the end card.
export const END_CARD = 632;

// music.m4a carries this pre-roll before the song starts, so the song's
// drop (6.43 s) lands on frame 270, the reference drop. Keep in sync with
// scripts/nightlife_audio.py.
export const MUSIC_START = 77;

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
  // Black & white, voice-over
  { from: 0, clip: "v1", at: 1.0 },
  { from: 8, clip: "v4", at: 3.5 },
  { from: 14, clip: "v2", at: 0.5 },
  { from: 25, clip: "dancer", at: 3.5, fx: "flicker" },
  { from: 48, clip: "v4", at: 14.5 },
  { from: 59, clip: "v1", at: 14.0 },
  { from: 70, clip: "dancer", at: 20.0 },
  { from: 94, clip: "v2", at: 3.0, fx: "swirl" },
  { from: 123, clip: "v1", at: 6.0 },
  { from: 145, clip: "t6", at: 3.4 },
  { from: 160, clip: "v1", at: 18.0 },
  { from: 183, clip: "dancer", at: 9.5 },
  { from: 198, clip: "t4", at: 0.45 },
  { from: 228, clip: "v4", at: 15.0 },
  { from: 253, clip: "dancer", at: 24.0 },
  // Drop: colour, cuts on the beat
  { from: 277, clip: "dancer", at: 0.0, fx: "rgb" },
  { from: 294, clip: "v2", at: 5.0 },
  { from: 312, clip: "t1", at: 13.0 },
  { from: 335, clip: "t5", at: 0.15 },
  { from: 361, clip: "dancer", at: 12.5 },
  { from: 378, clip: "v4", at: 1.5 },
  { from: 392, clip: "v1", at: 15.5 },
  { from: 408, clip: "dancer", at: 17.0, fx: "swirl" },
  { from: 415, clip: "v1", at: 4.0 },
  { from: 422, clip: "v4", at: 11.0 },
  { from: 430, clip: "dancer", at: 22.0 },
  { from: 437, clip: "v5", at: 5.0 },
  { from: 449, clip: "t6", at: 1.45 },
  { from: 474, clip: "dancer", at: 6.0 },
  { from: 494, clip: "t1", at: 5.0 },
  { from: 510, clip: "v2", at: 6.5 },
  { from: 519, clip: "dancer", at: 27.0 },
  { from: 540, clip: "v1", at: 11.5 },
  { from: 554, clip: "t5", at: 2.0 },
  { from: 564, clip: "dancer", at: 14.5 },
  { from: 577, clip: "t3", at: 2.5 },
  { from: 588, clip: "dancer", at: 10.0 },
  { from: 592, clip: "v1", at: 19.0 },
  { from: 598, clip: "t6", at: 4.5 },
  { from: 603, clip: "dancer", at: 24.5 },
  { from: 609, clip: "v4", at: 4.0 },
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

// Voice-over (public/nightlife/voice.m4a) placed so "Venus" starts on the
// flash at frame 120, where the logo slams in.
export const VOICE_FROM = 8;
export const VOICE_TO = VOICE_FROM + 245;
export const LOGO_STAMP: [number, number] = [120, 145];

export type Caption = {
  from: number;
  to: number;
  // Index into the captions prop.
  line: number;
  // Frame where the caption starts fading out.
  fade?: number;
};

// One caption per voice-over phrase, "Venus" is the logo instead.
export const CAPTIONS: Caption[] = [
  { from: 8, to: 57, line: 0, fade: 52 },
  { from: 61, to: 114, line: 1, fade: 108 },
  { from: 157, to: 189, line: 2 },
  { from: 192, to: 216, line: 3 },
  { from: 220, to: 256, line: 4, fade: 250 },
];

export const END_TEXT = { from: 633, to: 662, fade: 655 };
export const END_LOGOS = [
  { logo: "venus", from: 662, in: 667, out: 684, to: 690 },
  { logo: "yab", from: 691, in: 696, out: 712, to: 718 },
] as const;

// Sound effects from public/nightlife/sfx. Each one is lined up so its
// loudest moment (`peak`, in frames from the start of the file) lands on the
// frame it belongs to.
const sfx = (file: string, at: number, peak: number, volume: number) => ({
  file,
  from: at - peak,
  volume,
});

export const SFX: { file: string; from: number; volume: number }[] = [
  sfx("impact", LOGO_STAMP[0], 22, 0.5),
  // Slow swoosh into the drop smear, sub drop on the drop itself.
  sfx("swoosh-slow", 270, 41, 0.45),
  sfx("sub-drop", 270, 28, 0.4),
  // Fast and slow swooshes taking turns on the smears of the colour section.
  ...SMEARS.slice(1).map(([from], i) =>
    i % 2 === 0
      ? sfx("swoosh-fast", from + 2, 12, 0.45)
      : sfx("swoosh-slow", from + 2, 41, 0.35),
  ),
  // Shutter burst ticking over the swirl, as in the reference at 13.5 s.
  sfx("shutter-short", 405, 0, 0.7),
  // Longer burst under the rapid cuts before the end card.
  sfx("shutter-long", 577, 0, 0.6),
  // Camera flash on the flash burst before the end card.
  ...[585, 597, 608].map((at) => sfx("camera-flash", at, 7, 0.4)),
  sfx("impact", END_CARD - 2, 22, 0.5),
];
