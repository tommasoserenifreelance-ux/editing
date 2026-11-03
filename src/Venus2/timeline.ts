// Edit decision list for the second Venus reel (30 fps), modelled on the
// "THE ROOM" reference: typewriter caption over the voice-over, the logo
// flipping past on its back before the sign shot, a whip on the dancer's hand
// swing, a camcorder shot, a vortex, a stop-motion run on the song's
// percussion roll, a quick-fire run with a film burn, and a wash into the
// end card. Every cut sits on the song's beat grid. Each clip appears at most
// twice, never with the same moment twice.

export const VENUS2_FPS = 30;

// Frame 0 is 51.28 s into the song (scripts/venus2_audio.py): the build-up
// plays under the voice-over and the drop at 60.12 s lands here.
export const DROP = 265;
export const END_CARD = 640;
export const VENUS2_DURATION = 728;

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
  ballerina: "venus2/clips/ballerina.mp4", // masked dancer in mesh, 5.6 s; hands swing right at 1.4-1.6 s
  dance: "venus2/clips/dance.mp4", // girl dancing, arms up, 2.6 s
  kiss: "venus2/clips/kiss.mp4", // girl blowing a kiss, 1.4 s
} as const;

export type ClipFx = "pushIn" | "haze" | "vhs" | "vortex" | "burst" | "double";

export type Cut = {
  from: number;
  clip: keyof typeof CLIPS;
  // Second of the source clip shown on the first frame of the cut.
  at: number;
  fx?: ClipFx;
  // Whip pan out of this shot to the right, into the next one.
  whipOut?: boolean;
};

// Each cut lasts until the next one starts.
export const CUTS: Cut[] = [
  // Build-up under the voice-over
  { from: 0, clip: "c4", at: 0.0 },
  { from: 58, clip: "c9", at: 0.0 },
  { from: 86, clip: "dance", at: 0.0 },
  { from: 115, clip: "c5", at: 0.2 },
  { from: 159, clip: "c1", at: 0.6 },
  { from: 187, clip: "c9", at: 1.3, fx: "pushIn" },
  { from: 234, clip: "c2", at: 0.0, fx: "haze" },
  // Drop
  { from: DROP, clip: "ballerina", at: 0.55, whipOut: true },
  { from: 295, clip: "c3", at: 0.0 },
  { from: 323, clip: "c8", at: 0.3, fx: "vhs" },
  { from: 367, clip: "kiss", at: 0.2 },
  { from: 396, clip: "dance", at: 1.1, fx: "vortex" },
  { from: 425, clip: "c6", at: 0.0 },
  { from: 453, clip: "c4", at: 1.97 },
  // Stop-motion on the percussion roll, then the dancer plays on
  { from: 467, clip: "ballerina", at: 2.0, fx: "burst" },
  { from: 525, clip: "c1", at: 1.9 },
  // Quick-fire run
  { from: 540, clip: "c2", at: 1.8 },
  { from: 544, clip: "c8", at: 1.85 },
  { from: 548, clip: "c3", at: 1.0, fx: "double" },
  { from: 554, clip: "kiss", at: 1.2 },
  { from: 558, clip: "c6", at: 1.05 },
  // Wash and flashes into the end card
  { from: 562, clip: "c5", at: 2.0 },
  { from: 617, clip: "c7", at: 0.2 },
];

// Hits of the song's percussion roll (66.97-67.69 s): the stop-motion jumps
// to a new pose on each one.
export const ROLL = [467, 471, 474, 477, 481, 485, 488, 492, 497];

export type Flash = {
  from: number;
  to: number;
  // CSS background: a colour, or a gradient for light leaks and burns.
  fill: string;
  opacity: number;
};

export const FLASHES: Flash[] = [
  // Cyan streak down the left edge, then a light bar on the right.
  {
    from: 42,
    to: 43,
    fill: "linear-gradient(90deg, rgba(120,255,240,0.9) 0 6%, transparent 12%)",
    opacity: 1,
  },
  {
    from: 45,
    to: 47,
    fill: "linear-gradient(90deg, transparent 68%, rgba(255,40,210,0.95) 76%, rgba(255,60,220,0.9) 88%, transparent 95%)",
    opacity: 1,
  },
  // Green tint on the cut to the second shot.
  { from: 58, to: 60, fill: "#a6ff7a", opacity: 0.55 },
  // Film burn in the quick-fire run.
  {
    from: 552,
    to: 554,
    fill: "radial-gradient(ellipse at 30% 30%, #fffef5 0%, #ffe08a 40%, #ff8a1e 75%, #ff5a00 100%)",
    opacity: 1,
  },
  // Yellow, then cyan, out of the wash.
  { from: 612, to: 615, fill: "#e8ff1a", opacity: 0.92 },
  { from: 615, to: 617, fill: "#a8f6ff", opacity: 0.92 },
];

// Purple wash building up until the yellow flash.
export const WASH: [number, number] = [585, 612];

// Typed in letter by letter with the voice-over: "Friday" over its first
// word, the rest after the pause.
export const CAPTION = {
  from: 10,
  to: 115,
  parts: [
    { at: 10, chars: 6, frames: 10 },
    { at: 56, chars: 9, frames: 14 },
  ],
};

export const VOICE_FROM = 8;
export const VOICE_TO = VOICE_FROM + 99;

// The logo flips past on its back over shot 4, edge-on by the cut, and a
// ghost of it lingers over the sign shot.
export const LOGO_FLY: [number, number] = [148, 159];
export const LOGO_GHOST: [number, number] = [159, 162];

export const END_TEXT = {
  from: END_CARD + 2,
  to: END_CARD + 31,
  fade: END_CARD + 24,
};
export const END_LOGOS = [
  {
    logo: "venus",
    from: END_CARD + 31,
    in: END_CARD + 36,
    out: END_CARD + 53,
    to: END_CARD + 59,
  },
  {
    logo: "yab",
    from: END_CARD + 60,
    in: END_CARD + 65,
    out: END_CARD + 81,
    to: END_CARD + 87,
  },
] as const;

// Sound effects from public/nightlife/sfx, each lined up so its loudest
// moment (`peak`, in frames from the start of the file) lands on `at`.
const sfx = (file: string, at: number, peak: number, volume: number) => ({
  file,
  from: at - peak,
  volume,
});

export const SFX: { file: string; from: number; volume: number }[] = [
  sfx("impact", LOGO_FLY[0] + 4, 22, 0.45),
  sfx("swoosh-slow", DROP, 41, 0.22),
  sfx("sub-drop", DROP, 28, 0.17),
  sfx("swoosh-fast", 295, 12, 0.4),
  sfx("swoosh-slow", 410, 41, 0.3),
  sfx("camera-flash", 552, 7, 0.4),
  sfx("camera-flash", 612, 7, 0.35),
  sfx("impact", END_CARD, 22, 0.3),
];
