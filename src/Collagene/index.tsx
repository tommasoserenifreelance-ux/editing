import {
  BRollCue,
  CardCue,
  ExtraCue,
  SentenceReel,
  StickerCue,
} from "../Bonaccorso/SentenceReel";
import { CollagenTimeline, Fibroblasts, Sessions } from "./Animations";
import {
  at,
  CLIPS,
  DURATION,
  phrases,
  SEGMENTS,
  TRANSITION,
  wordFrame,
} from "./script";

export { DURATION as COLLAGENE_DURATION, FPS as COLLAGENE_FPS } from "./script";

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);
const broll = (file: string) => `c0108/broll/${file}`;

// Each clip is used once. The doctor asked for no shots of women or filler
// injections, so he stays on screen where those clips were.
const BROLLS: BRollCue[] = [
  // A particle stream for "un collagen booster costruisce".
  { src: broll("abstract-3d.mp4"), from: wordFrame(0, "un"), to: take(1) },
  // The microscope for "biopsie eseguite a tre mesi dal trattamento".
  { src: broll("objective.mp4"), from: take(2), to: wordFrame(2, "mostrano") },
];

// The JDD page of the split-face study, on "gli studi istologici … parlano
// chiaro".
const CARDS: CardCue[] = [
  {
    src: "c0108/img/study.png",
    crop: { x: 395, y: 795, w: 1650, h: 415 },
    from: wordFrame(1, "gli"),
    to: take(2),
  },
];

// Each animation starts exactly where the previous shot ends, so the doctor
// never flashes on screen for a few frames in between.
const timelineFrom = wordFrame(2, "mostrano");
const fibroFrom = take(4);
const sessionsFrom = take(5);
const rel = (from: number) => (f: number) => f - from;
const tl = rel(timelineFrom);
const fb = rel(fibroFrom);
const se = rel(sessionsFrom);
const SESSION_CUES = [
  sessionsFrom + 4,
  wordFrame(5, "seduta", 1),
  wordFrame(5, "invece"),
];
const EXTRAS: ExtraCue[] = [
  {
    from: timelineFrom,
    to: take(4),
    node: (
      <CollagenTimeline
        atCollagen={tl(wordFrame(2, "collagene"))}
        atType1={tl(wordFrame(2, "1"))}
        atType3={tl(wordFrame(2, "3"))}
        at12={tl(wordFrame(3, "12"))}
        at18={tl(wordFrame(3, "18"))}
      />
    ),
  },
  {
    from: fibroFrom,
    to: take(5),
    node: (
      <Fibroblasts
        atActivate={fb(wordFrame(4, "attivano"))}
        atBuild={fb(wordFrame(4, "costruire"))}
      />
    ),
  },
  {
    from: sessionsFrom,
    to: take(6),
    node: (
      <Sessions
        atSessions={SESSION_CUES.map(se)}
        atFiller={se(wordFrame(5, "occupare"))}
      />
    ),
  },
];

const single = (char: string, from: number) => ({
  chars: [char],
  delays: [from],
});

const STICKERS: StickerCue[] = [
  { ...single("📈", wordFrame(6, "cresce")), to: wordFrame(6, "in") },
  { ...single("🌿", wordFrame(7, "naturale")), to: take(8) },
  { ...single("🚫", wordFrame(8, "ritocco")), to: take(9) },
  { ...single("✨", wordFrame(9, "giovane")), to: take(10) },
];

// Sound effects on each beat of the animations, matched to what he says.
const pop = (at: number, volume = 0.8) => ({ at, file: "pop", volume });
const tick = (at: number) => ({ at, file: "tick", volume: 0.55 });
const SOUNDS = [
  // Timeline: a pop as each stop lands, ticks for the collagen chips, and a
  // ding on the last stop.
  pop(timelineFrom + 4),
  tick(wordFrame(2, "collagene")),
  tick(wordFrame(2, "1")),
  tick(wordFrame(2, "3")),
  pop(wordFrame(3, "12")),
  pop(wordFrame(3, "18")),
  { at: wordFrame(3, "18"), file: "ding", volume: 0.4 },
  // Fibroblasts: a soft pop as they light up, a tick as the fibres spin out.
  pop(wordFrame(4, "attivano"), 0.6),
  tick(wordFrame(4, "costruire")),
  // Sessions: a pop for each bar, a tick when the filler appears.
  ...SESSION_CUES.map((at) => pop(at, 0.7)),
  tick(wordFrame(5, "occupare")),
];

export const Collagene: React.FC = () => (
  <SentenceReel
    source="c0108/doctor/take.mp4"
    segments={SEGMENTS}
    clips={CLIPS}
    phrases={phrases}
    brolls={BROLLS}
    stickers={STICKERS}
    cards={CARDS}
    extras={EXTRAS}
    sounds={SOUNDS}
    zoom={[1, 1]}
    drift={0}
    slideFrames={TRANSITION}
    // The doctor stands left of centre in the landscape take.
    focus="35% 50%"
  />
);
