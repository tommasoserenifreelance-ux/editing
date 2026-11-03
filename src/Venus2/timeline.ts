// Edit decision list for the second Venus reel (30 fps), modelled on the
// "THE ROOM" reference: typewriter captions over the voice-over, a 3D logo
// fly-in, a red grade, whips, lightning, a camcorder shot and a red wash
// into the end card. Cuts after the drop sit on the song's beat grid.

export const VENUS2_FPS = 30;
export const VENUS2_DURATION = 720; // 24 s, length of public/venus2/music.m4a

// Frame 0 is 54.0 s into the song (scripts/venus2_audio.py); its drop at
// 60.1 s lands here.
export const DROP = 184;
export const END_CARD = 631;

export const CLIPS = {
  c1: "venus2/clips/1.mp4", // crowd under the Venus sign, 2.7 s (white flash at 0.4 s)
  c2: "venus2/clips/2.mp4", // crowd, sign and lasers, 2.4 s (white flash at 1.6 s)
  c3: "venus2/clips/3.mp4", // pan across the neon Venus sign, 1.4 s
  c4: "venus2/clips/4.mp4", // blonde in a black top, 2.5 s
  c5: "venus2/clips/5.mp4", // brunette in a crop top dancing, 3.9 s
  c6: "venus2/clips/6.mp4", // brunette in glasses blowing a kiss, 1.4 s
  c7: "venus2/clips/7.mp4", // two girls, 1.5 s
  c8: "venus2/clips/8.mp4", // girl in a white top blowing a kiss, 2.1 s
  c9: "venus2/clips/9.mp4", // girl in black under lasers, 3.3 s
  ballerina: "venus2/clips/ballerina.mp4", // masked dancer in mesh, 5.6 s
  dance: "venus2/clips/dance.mp4", // girl dancing, arms up, 2.6 s
  kiss: "venus2/clips/kiss.mp4", // girl blowing a kiss, 1.4 s
} as const;

export type ClipFx = "trail" | "vhs" | "spin" | "double";

export type Cut = {
  from: number;
  clip: keyof typeof CLIPS;
  // Second of the source clip shown on the first frame of the cut.
  at: number;
  fx?: ClipFx;
  // Whip pan into this cut.
  whip?: boolean;
};

// Each cut lasts until the next one starts.
export const CUTS: Cut[] = [
  // Voice-over and captions
  { from: 0, clip: "c4", at: 0.0 },
  { from: 48, clip: "c9", at: 0.3 },
  { from: 78, clip: "dance", at: 0.0 },
  { from: 105, clip: "c5", at: 0.5 },
  { from: 137, clip: "c1", at: 0.6 },
  { from: 152, clip: "c7", at: 0.2 },
  { from: 172, clip: "c2", at: 0.0, fx: "trail", whip: true },
  // Drop, cuts on the beat
  { from: DROP, clip: "ballerina", at: 0.0 },
  { from: 198, clip: "c3", at: 0.0, whip: true },
  { from: 213, clip: "c8", at: 0.0, fx: "vhs" },
  { from: 256, clip: "kiss", at: 0.0 },
  { from: 285, clip: "c6", at: 0.0 },
  { from: 314, clip: "c4", at: 1.4 },
  { from: 328, clip: "c2", at: 0.8 },
  { from: 343, clip: "c1", at: 0.7 },
  { from: 400, clip: "c3", at: 0.6, fx: "spin" },
  { from: 415, clip: "c9", at: 1.5 },
  { from: 430, clip: "c5", at: 2.0 },
  { from: 444, clip: "ballerina", at: 1.2, whip: true },
  { from: 458, clip: "dance", at: 1.2 },
  { from: 472, clip: "c2", at: 1.8, whip: true },
  { from: 487, clip: "ballerina", at: 2.6 },
  // Quick-fire run
  { from: 501, clip: "c9", at: 2.5 },
  { from: 507, clip: "c4", at: 0.5 },
  { from: 513, clip: "c5", at: 3.0 },
  { from: 516, clip: "c6", at: 1.0 },
  { from: 522, clip: "c7", at: 1.0 },
  { from: 527, clip: "ballerina", at: 4.2 },
  { from: 530, clip: "kiss", at: 1.0 },
  { from: 533, clip: "c3", at: 0.2, fx: "double" },
  // Red wash into the end card
  { from: 544, clip: "dance", at: 0.4 },
  { from: 606, clip: "c7", at: 0.2 },
];

// Full-frame colour flashes: [from, to, colour, opacity].
export const FLASHES: [number, number, string, number][] = [
  [48, 51, "#3dff6a", 0.65],
  [DROP, DROP + 2, "#ff2a2a", 0.8],
  [519, 522, "#fff0d8", 1],
  [602, 606, "#e8ff1a", 0.9],
];

// Light leak sweeping in from the right before the second caption.
export const LEAK: [number, number] = [40, 49];

// Red wash building up until the yellow flash.
export const WASH: [number, number] = [556, 602];

// Lightning bolts over the crowd under the sign.
export const LIGHTNING: [number, number] = [343, 400];

export type Caption = {
  from: number;
  to: number;
  // Index into the captions prop.
  line: number;
  // Frames it takes to type the whole line.
  type: number;
};

// Typed in letter by letter over the voice-over.
export const CAPTIONS: Caption[] = [
  { from: 3, to: 48, line: 0, type: 12 },
  { from: 51, to: 78, line: 1, type: 10 },
  { from: 80, to: 105, line: 2, type: 8 },
];

export const VOICE_FROM = 8;
export const VOICE_TO = VOICE_FROM + 99;

// Venus logo spinning in and dissolving into the sign at frame 137.
export const LOGO_FLY: [number, number] = [116, 143];

export const END_TEXT = { from: 633, to: 662, fade: 655 };
export const END_LOGOS = [
  { logo: "venus", from: 662, in: 667, out: 684, to: 690 },
  { logo: "yab", from: 691, in: 696, out: 712, to: 718 },
] as const;

// Sound effects from public/nightlife/sfx, each lined up so its loudest
// moment (`peak`, in frames from the start of the file) lands on `at`.
const sfx = (file: string, at: number, peak: number, volume: number) => ({
  file,
  from: at - peak,
  volume,
});

export const SFX: { file: string; from: number; volume: number }[] = [
  sfx("impact", 128, 22, 0.45),
  sfx("swoosh-slow", DROP, 41, 0.22),
  sfx("sub-drop", DROP, 28, 0.17),
  ...CUTS.filter((c) => c.whip && c.from > DROP).map((c, i) =>
    i % 2 === 0
      ? sfx("swoosh-fast", c.from, 12, 0.4)
      : sfx("swoosh-slow", c.from, 41, 0.3),
  ),
  sfx("swoosh-fast", 400, 12, 0.35),
  sfx("shutter-short", 487, 0, 0.5),
  sfx("camera-flash", 519, 7, 0.4),
  sfx("camera-flash", 602, 7, 0.4),
  sfx("impact", END_CARD, 22, 0.3),
];
