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

// Each clip is used once.
const BROLLS: BRollCue[] = [
  // An injection for "un filler riempie", then a particle stream for "un
  // collagen booster costruisce".
  {
    src: broll("cosmetic.mp4"),
    from: wordFrame(0, "Un"),
    to: wordFrame(0, "un"),
  },
  { src: broll("abstract-3d.mp4"), from: wordFrame(0, "un"), to: take(1) },
  // A woman at the mirror for "e la differenza si vede nel tempo".
  { src: broll("woman.mp4"), from: take(1), to: wordFrame(1, "gli") },
  // The microscope for "biopsie eseguite a tre mesi dal trattamento".
  { src: broll("objective.mp4"), from: take(2), to: wordFrame(2, "mostrano") },
  // A close-up of skin for "pelle più tonica, più elastica, più strutturata".
  { src: broll("vertical.mp4"), from: take(7), to: wordFrame(7, "con") },
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

const timelineFrom = wordFrame(2, "mostrano");
const fibroFrom = wordFrame(4, "attivano");
const sessionsFrom = take(5);
const EXTRAS: ExtraCue[] = [
  {
    from: timelineFrom,
    to: take(4),
    node: (
      <CollagenTimeline
        at3={0}
        atCollagen={wordFrame(2, "collagene") - timelineFrom}
        at12={wordFrame(3, "12") - timelineFrom}
        at18={wordFrame(3, "18") - timelineFrom}
      />
    ),
  },
  {
    from: fibroFrom,
    to: take(5),
    node: (
      <Fibroblasts
        atActivate={0}
        atBuild={wordFrame(4, "costruire") - fibroFrom}
      />
    ),
  },
  {
    from: sessionsFrom,
    to: take(6),
    node: (
      <Sessions
        atSessions={[
          0,
          wordFrame(5, "seduta", 1) - sessionsFrom,
          wordFrame(5, "invece") - sessionsFrom,
        ]}
        atFiller={wordFrame(5, "occupare") - sessionsFrom}
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
    sounds={[
      ...EXTRAS.map((x) => ({ at: x.from - 6, file: "whoosh", volume: 0.45 })),
      { at: wordFrame(3, "18"), file: "ding", volume: 0.45 },
    ]}
    zoom={[1, 1]}
    drift={0}
    slideFrames={TRANSITION}
    // The doctor stands left of centre in the landscape take.
    focus="35% 50%"
  />
);
