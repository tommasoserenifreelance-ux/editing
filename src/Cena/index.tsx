import {
  BRollCue,
  ExtraCue,
  SentenceReel,
  StickerCue,
} from "../Bonaccorso/SentenceReel";
import {
  ClockRewind,
  GlucoseCurves,
  StudyCitation,
  VariantGrid,
} from "./Animations";
import {
  at,
  CLIPS,
  DURATION,
  phrases,
  SEGMENTS,
  TRANSITION,
  wordFrame,
} from "./script";

export { DURATION as CENA_DURATION, FPS as CENA_FPS } from "./script";

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);
const broll = (file: string) => `c0099/broll/${file}`;

// Each clip is used once. Landscape clips are shown whole over a blurred copy.
const BROLLS: BRollCue[] = [
  // "Ti svegli stanco" opens on a tired woman in bed, then "e dai la colpa al
  // sonno" on a tired woman at the table.
  { src: broll("person.mp4"), from: 0, to: wordFrame(0, "e"), fit: "contain" },
  {
    src: broll("woman-blonde.mp4"),
    from: wordFrame(0, "e"),
    to: wordFrame(0, "ma"),
    fit: "contain",
  },
  // A dinner table for "la tua cena", the fridge at night for "non cosa
  // mangi, ma quando mangi".
  {
    src: broll("couple-food.mp4"),
    from: wordFrame(0, "la", 2),
    to: wordFrame(0, "non"),
    fit: "contain",
  },
  { src: broll("fridge.mp4"), from: wordFrame(0, "non"), to: take(1) },
  // A glucose meter for "la risposta glicemica".
  {
    src: broll("vertical.mp4"),
    from: wordFrame(1, "risposta"),
    to: wordFrame(1, "alla"),
  },
  // The bedroom at night for "mentre la melatonina è già più alta".
  {
    src: broll("bed.mp4"),
    from: wordFrame(1, "perché"),
    to: take(2),
    fit: "contain",
  },
  // Cooking calmly for "non serve stravolgere le tue abitudini", and a
  // daylight family dinner for "un contesto migliore in cui lavorare".
  { src: broll("knife.mp4"), from: take(3), to: take(4) },
  { src: broll("family-dinner.mp4"), from: wordFrame(4, "per"), to: take(5) },
];

const curvesFrom = wordFrame(1, "alla");
const variantFrom = wordFrame(2, "del");
const clockFrom = take(4);
const EXTRAS: ExtraCue[] = [
  { from: take(1), to: wordFrame(1, "risposta"), node: <StudyCitation /> },
  {
    from: curvesFrom,
    to: wordFrame(1, "perché"),
    node: (
      <GlucoseCurves
        atTimes={wordFrame(1, "orari") - curvesFrom}
        atLate={wordFrame(1, "tardi") - curvesFrom}
        atWorse={wordFrame(1, "peggio") - curvesFrom}
        atTolerance={wordFrame(1, "peggiora") - curvesFrom}
      />
    ),
  },
  {
    from: variantFrom,
    to: wordFrame(2, "mostra"),
    node: (
      <VariantGrid
        atGene={wordFrame(2, "MTNR1B") - variantFrom}
        atPeople={wordFrame(2, "presente") - variantFrom}
        atShare={wordFrame(2, "significativa") - variantFrom}
      />
    ),
  },
  {
    from: clockFrom,
    to: wordFrame(4, "per"),
    node: (
      <ClockRewind
        atRewind={wordFrame(4, "anticipare") - clockFrom}
        atHour={wordFrame(4, "un'ora") - clockFrom}
      />
    ),
  },
];

const STICKERS: StickerCue[] = [
  { chars: ["⚠️"], delays: [take(2)], to: wordFrame(2, "Chi") },
];

// Sound effects on each beat of the animations, matched to what he says.
const pop = (at: number, volume = 0.8) => ({ at, file: "pop", volume });
const tick = (at: number) => ({ at, file: "tick", volume: 0.55 });
const SOUNDS = [
  pop(take(1)),
  tick(take(1) + 10),
  tick(wordFrame(1, "orari")),
  pop(wordFrame(1, "tardi")),
  tick(wordFrame(1, "peggio")),
  tick(wordFrame(1, "peggiora")),
  tick(wordFrame(2, "MTNR1B")),
  pop(wordFrame(2, "presente"), 0.6),
  pop(wordFrame(2, "significativa")),
  pop(wordFrame(4, "anticipare"), 0.6),
  { at: wordFrame(4, "un'ora"), file: "ding", volume: 0.45 },
];

export const Cena: React.FC = () => (
  <SentenceReel
    source="c0099/doctor/take.mp4"
    segments={SEGMENTS}
    clips={CLIPS}
    phrases={phrases}
    brolls={BROLLS}
    stickers={STICKERS}
    extras={EXTRAS}
    sounds={SOUNDS}
    zoom={[1, 1]}
    drift={0}
    slideFrames={TRANSITION}
    // The doctor stands left of centre in the landscape take.
    focus="35% 50%"
  />
);
