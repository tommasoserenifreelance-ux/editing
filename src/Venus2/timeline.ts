// Edit decision list for the second Venus reel (30 fps), modelled on the
// "THE ROOM" reference with effects from the first Venus reel: a black &
// white intro with white flashes under the voice-over and caption, the logo
// flipping past and landing on the real sign, where the picture turns to
// colour, a smear and RGB split into the purple drop, speed ramps and beat
// zooms, a whip on the dancer's hand swing, a camcorder shot bouncing into
// the next kiss, a black & white stop-motion on the song's
// percussion roll, a film burn into a quick-fire run of the dancer, and a
// wash into the end card. Cuts sit on the song's beat grid. Only clips of
// the last night, each once except the dancer; the sign is only seen in the
// shot the logo lands in.

export const VENUS2_FPS = 30;

// Frame 0 is 52.72 s into the song (scripts/venus2_audio.py): the build-up
// plays under the voice-over and the drop at 60.12 s lands here.
export const DROP = 222;
export const END_CARD = 540;
export const VENUS2_DURATION = 628;

export const CLIPS = {
  c1: "venus2/clips/1.mp4", // crowd under the Venus sign, 2.7 s (white flash at 0.4 s)
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
  "c4-intro": "venus2/ramps/c4-intro.mp4", // stabilized
  "c9-intro": "venus2/ramps/c9-intro.mp4",
  "ballerina-drop": "venus2/ramps/ballerina-drop.mp4",
  "ballerina-mid": "venus2/ramps/ballerina-mid.mp4",
  "dance-ramp": "venus2/ramps/dance-ramp.mp4",
  "ballerina-end": "venus2/ramps/ballerina-end.mp4",
} as const;

export type ClipFx = "pushIn" | "rgb" | "vhs" | "burst";

export type Cut = {
  from: number;
  clip: keyof typeof CLIPS;
  // Second of the source clip shown on the first frame of the cut.
  at: number;
  fx?: ClipFx;
  // Whip pan out of this shot, into the next one.
  whipOut?: "left" | "right";
  // Bounce into this shot: the last one squashes, this one springs in.
  bounce?: boolean;
  // Barely any handheld shake.
  steady?: boolean;
};

// Each cut lasts until the next one starts.
export const CUTS: Cut[] = [
  // Black & white build-up under the voice-over
  { from: 0, clip: "c4-intro", at: 0, steady: true, whipOut: "right" },
  { from: 58, clip: "c9-intro", at: 0 },
  { from: 86, clip: "ballerina", at: 4.5 },
  { from: 115, clip: "c5", at: 0.2 },
  // The logo lands on the sign and the picture turns to colour
  { from: 159, clip: "c1", at: 0.6, fx: "pushIn" },
  // Drop into purple
  { from: DROP, clip: "ballerina-drop", at: 0, fx: "rgb", whipOut: "right" },
  { from: 251, clip: "c8", at: 0.0, fx: "vhs" },
  { from: 295, clip: "kiss", at: 0.2, bounce: true },
  { from: 324, clip: "ballerina-mid", at: 0 },
  { from: 353, clip: "dance-ramp", at: 0 },
  { from: 382, clip: "c6", at: 0.0, whipOut: "left" },
  // Black & white stop-motion on the percussion roll
  { from: 424, clip: "ballerina", at: 2.0, fx: "burst" },
  // Out of it on a film burn: a quick-fire run of the dancer's poses
  { from: 453, clip: "ballerina", at: 0.2, fx: "rgb" },
  { from: 457, clip: "ballerina", at: 1.8, fx: "rgb" },
  { from: 461, clip: "ballerina", at: 2.6, fx: "rgb" },
  { from: 465, clip: "ballerina", at: 3.3, fx: "rgb" },
  { from: 469, clip: "ballerina", at: 4.3, fx: "rgb" },
  { from: 473, clip: "ballerina", at: 5.0, fx: "rgb" },
  // Slow motion under the wash, flashes, and the two girls into the end card
  { from: 477, clip: "ballerina-end", at: 0 },
  { from: 511, clip: "c7", at: 0.2 },
];

// The logo flips past on its back over shot 4, turning to face the lens by
// the cut, then flies on into the sign shot and lands on the real sign.
export const LOGO_FLY: [number, number] = [148, 173];
export const LOGO_LAND = 166;

// Shown in black & white: the intro until the logo lands, and the
// stop-motion run.
export const BLACK_AND_WHITE: [number, number][] = [
  [0, LOGO_LAND],
  [424, 453],
];

// Beats from the drop: each one bumps the zoom.
export const BEATS = [
  222, 237, 251, 266, 280, 295, 309, 324, 338, 353, 367, 382, 396, 410, 424,
  439, 453, 468, 482, 497, 511, 525, 540,
];

// Hits of the song's percussion roll (66.97-67.80 s): the stop-motion jumps
// to a new pose on each one.
export const ROLL = [424, 427, 431, 435, 438, 442, 445, 449, 453];

// Blown-out purple smears between shots, from the first Venus reel; the
// first one carries the drop.
export const SMEARS: [number, number][] = [
  [214, 225],
  [349, 353],
  [473, 477],
];

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
  // White hits on the beat after the drop.
  white(295, 296, 0.5),
  white(324, 326),
  white(353, 355),
  white(382, 384),
  // Film burn out of the stop-motion, then white on every other pose.
  {
    from: 453,
    to: 456,
    fill: "radial-gradient(ellipse at 30% 30%, #fffef5 0%, #ffe08a 40%, #ff8a1e 75%, #ff5a00 100%)",
    opacity: 1,
  },
  white(461, 462, 0.7),
  white(469, 470, 0.7),
  // Yellow, then cyan, out of the wash.
  { from: 505, to: 508, fill: "#e8ff1a", opacity: 0.92 },
  { from: 508, to: 511, fill: "#a8f6ff", opacity: 0.92 },
];

// Purple wash building up until the yellow flash.
export const WASH: [number, number] = [486, 505];

// Captions over the voice-over, timed to public/venus2/voice.m4a: the laugh
// that opens it, then the words, held until the logo comes in.
export const CAPTIONS: { from: number; to: number; line: number }[] = [
  { from: 10, to: 56, line: 0 },
  { from: 58, to: 146, line: 1 },
];

export const VOICE_FROM = 8;
export const VOICE_TO = VOICE_FROM + 99;

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
  sfx("swoosh-slow", DROP, 41, 0.17),
  sfx("sub-drop", DROP, 28, 0.12),
  // Swooshes on the whips, the bounce and the smears, fast and slow in turn.
  sfx("swoosh-fast", 251, 12, 0.4),
  sfx("swoosh-slow", 295, 41, 0.25),
  sfx("swoosh-fast", 351, 12, 0.35),
  sfx("swoosh-slow", 424, 41, 0.28),
  // Burn and quick-fire run out of the stop-motion.
  sfx("impact", 453, 22, 0.25),
  sfx("camera-flash", 453, 7, 0.4),
  sfx("shutter-short", 453, 0, 0.45),
  sfx("swoosh-slow", 477, 41, 0.28),
  sfx("camera-flash", 505, 7, 0.35),
  sfx("impact", END_CARD, 22, 0.3),
];
