// Edit decision list for the second Venus reel (30 fps), modelled on the
// "THE ROOM" reference with effects from the first Venus reel: a black &
// white intro with white flashes under the voice-over and caption, the logo
// flipping past and landing on the real sign, a smear and RGB split into the
// purple drop, speed ramps and beat zooms, a whip on the dancer's hand
// swing, a camcorder shot, a vortex, a black & white stop-motion on the
// song's percussion roll, a film burn into a quick-fire run of the dancer,
// and a wash into the end card. Cuts sit on the song's beat grid. Only clips
// of the last night: each appears once, except the dancer.

export const VENUS2_FPS = 30;

// Frame 0 is 51.28 s into the song (scripts/venus2_audio.py): the build-up
// plays under the voice-over and the drop at 60.12 s lands here.
export const DROP = 265;
export const END_CARD = 583;
export const VENUS2_DURATION = 671;

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
  // Speed-ramped shots rendered by scripts/venus2_ramps.py, played from 0.
  "c4-intro": "venus2/ramps/c4-intro.mp4",
  "c9-intro": "venus2/ramps/c9-intro.mp4",
  "c2-long": "venus2/ramps/c2-long.mp4",
  "ballerina-drop": "venus2/ramps/ballerina-drop.mp4",
  "c3-pan": "venus2/ramps/c3-pan.mp4",
  "dance-vortex": "venus2/ramps/dance-vortex.mp4",
  "ballerina-end": "venus2/ramps/ballerina-end.mp4",
} as const;

export type ClipFx =
  | "pushIn"
  | "haze"
  | "rgb"
  | "vhs"
  | "vortex"
  | "burst"
  | "double"
  | "rush";

export type Cut = {
  from: number;
  clip: keyof typeof CLIPS;
  // Second of the source clip shown on the first frame of the cut.
  at: number;
  fx?: ClipFx;
  // Whip pan out of this shot, into the next one.
  whipOut?: "left" | "right";
};

// Each cut lasts until the next one starts.
export const CUTS: Cut[] = [
  // Black & white build-up under the voice-over
  { from: 0, clip: "c4-intro", at: 0, whipOut: "right" },
  { from: 58, clip: "c9-intro", at: 0 },
  { from: 86, clip: "ballerina", at: 4.5 },
  { from: 115, clip: "c5", at: 0.2 },
  { from: 159, clip: "c1", at: 0.6 },
  { from: 187, clip: "c2-long", at: 0, fx: "pushIn" },
  // Drop into purple
  { from: DROP, clip: "ballerina-drop", at: 0, fx: "rgb", whipOut: "right" },
  { from: 295, clip: "c3-pan", at: 0, fx: "rush" },
  { from: 323, clip: "c8", at: 0.3, fx: "vhs" },
  { from: 367, clip: "kiss", at: 0.2 },
  { from: 396, clip: "dance-vortex", at: 0, fx: "vortex" },
  { from: 425, clip: "c6", at: 0.0, whipOut: "left" },
  // Black & white stop-motion on the percussion roll
  { from: 467, clip: "ballerina", at: 2.0, fx: "burst" },
  // Out of it on a film burn: a quick-fire run of the dancer's poses
  { from: 497, clip: "ballerina", at: 0.2, fx: "rgb" },
  { from: 501, clip: "ballerina", at: 1.8, fx: "rgb" },
  { from: 505, clip: "ballerina", at: 2.6, fx: "rgb" },
  { from: 509, clip: "ballerina", at: 3.3, fx: "rgb" },
  { from: 513, clip: "ballerina", at: 4.3, fx: "rgb" },
  { from: 517, clip: "ballerina", at: 5.0, fx: "rgb" },
  // Slow motion under the wash, flashes, and the two girls into the end card
  { from: 521, clip: "ballerina-end", at: 0 },
  { from: 559, clip: "c7", at: 0.2 },
];

// Shown in black & white: the intro and the stop-motion run.
export const BLACK_AND_WHITE: [number, number][] = [
  [0, DROP],
  [467, 497],
];

// Beats after the drop: each one bumps the zoom.
export const BEATS = [
  265, 280, 295, 309, 323, 338, 353, 367, 382, 396, 410, 425, 439, 453, 467,
  482, 497, 511, 525, 540, 554, 568, 583, 598, 611, 626,
];

// Blown-out purple smears between shots, from the first Venus reel; the
// first one carries the drop.
export const SMEARS: [number, number][] = [
  [257, 268],
  [319, 323],
  [517, 521],
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

const white = (from: number, to: number, opacity = 1): Flash => ({
  from,
  to,
  fill: "#fbfbfd",
  opacity,
});

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
  // White flashes on the phrases and cuts of the intro, as in the first
  // Venus reel.
  white(53, 56),
  white(86, 88),
  white(115, 117),
  white(187, 189),
  // White hits on the beat after the drop.
  white(323, 325),
  white(367, 368, 0.6),
  white(396, 398),
  white(425, 427),
  // Film burn out of the stop-motion, then white on every other pose.
  {
    from: 497,
    to: 500,
    fill: "radial-gradient(ellipse at 30% 30%, #fffef5 0%, #ffe08a 40%, #ff8a1e 75%, #ff5a00 100%)",
    opacity: 1,
  },
  white(505, 506, 0.7),
  white(513, 514, 0.7),
  // Yellow, then cyan, out of the wash.
  { from: 554, to: 557, fill: "#e8ff1a", opacity: 0.92 },
  { from: 557, to: 559, fill: "#a8f6ff", opacity: 0.92 },
];

// Purple wash building up until the yellow flash.
export const WASH: [number, number] = [530, 554];

// Shown whole from the start of the voice-over until the logo comes in.
export const CAPTION = { from: 10, to: 146 };

export const VOICE_FROM = 8;
export const VOICE_TO = VOICE_FROM + 99;

// The logo flips past on its back over shot 4, turning to face the lens by
// the cut, then flies on into the sign shot and lands on the real sign.
export const LOGO_FLY: [number, number] = [148, 173];
export const LOGO_LAND = 166;

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
  sfx("impact", LOGO_LAND, 22, 0.45),
  sfx("swoosh-slow", DROP, 41, 0.22),
  sfx("sub-drop", DROP, 28, 0.17),
  // Swooshes on the whips and smears, fast and slow taking turns.
  sfx("swoosh-fast", 295, 12, 0.4),
  sfx("swoosh-slow", 321, 41, 0.28),
  sfx("swoosh-slow", 410, 41, 0.28),
  sfx("swoosh-fast", 467, 12, 0.4),
  // Burn and quick-fire run out of the stop-motion.
  sfx("impact", 497, 22, 0.25),
  sfx("camera-flash", 497, 7, 0.4),
  sfx("shutter-short", 497, 0, 0.45),
  sfx("swoosh-slow", 521, 41, 0.28),
  sfx("camera-flash", 554, 7, 0.35),
  sfx("impact", END_CARD, 22, 0.3),
];
