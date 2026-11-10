import {
  BRollCue,
  CardCue,
  SentenceReel,
  StickerCue,
} from "../Bonaccorso/SentenceReel";
import {
  at,
  CLIPS,
  DURATION,
  phrases,
  SEGMENTS,
  TRANSITION,
  wordFrame,
} from "./script";

export { DURATION as ESOSOMI_DURATION, FPS as ESOSOMI_FPS } from "./script";

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);
const broll = (file: string) => `esosomi/broll/${file}`;

const BROLLS: BRollCue[] = [
  // Skin for "la pelle si può rigenerare", then the plasma lamp for
  // "il vostro plasma". Both are landscape, so they are shown whole.
  {
    src: broll("model.mp4"),
    from: wordFrame(0, "la"),
    to: wordFrame(0, "il"),
    fit: "contain",
  },
  {
    src: broll("plasma.mp4"),
    from: wordFrame(0, "il"),
    to: take(1),
    fit: "contain",
  },
  // A vesicle in the skin layers for "gli esosomi autologhi".
  { src: broll("clip-b.mp4"), from: wordFrame(1, "esosomi"), to: take(2) },
  // Collagen fibres for "sulle vescicole extracellulari nel ringiovanimento
  // cutaneo", then skin again for "risultati incoraggianti sulla qualità della
  // pelle".
  {
    src: broll("clip-a.mp4"),
    from: wordFrame(3, "sulle"),
    to: wordFrame(3, "evidenziando"),
  },
  {
    src: broll("model.mp4"),
    from: wordFrame(3, "risultati"),
    to: wordFrame(3, "proprio"),
    fit: "contain",
    startFrom: 7,
  },
  // The vesicle again for "ricchi di proteine, lipidi e segnali rigenerativi".
  {
    src: broll("clip-b.mp4"),
    from: wordFrame(4, "ricchi"),
    to: take(5),
    startFrom: 5,
  },
  // Collagen again for "usare il potenziale del proprio corpo per rigenerarlo".
  { src: broll("clip-a.mp4"), from: take(6), to: take(7), startFrom: 3.5 },
];

// The PubMed page of the review he cites, from "Una review pubblicata" to
// "gli studi clinici disponibili".
const CARDS: CardCue[] = [
  {
    src: "esosomi/img/study.png",
    crop: { x: 520, y: 390, w: 1470, h: 590 },
    from: take(2),
    to: wordFrame(3, "sulle"),
  },
];

const single = (char: string, from: number) => ({
  chars: [char],
  delays: [from],
});

const STICKERS: StickerCue[] = [
  { ...single("🩸", wordFrame(3, "PRP")), to: take(4) },
  {
    ...single("🩸", wordFrame(4, "vostro")),
    to: wordFrame(4, "ricchi"),
  },
  { ...single("✅", wordFrame(5, "100%")), to: wordFrame(5, "nessun") },
  { ...single("🛡️", wordFrame(5, "rigetto")), to: wordFrame(5, "massima") },
  {
    ...single("🧩", wordFrame(5, "compatibilità")),
    to: wordFrame(5, "massima", 1),
  },
  { ...single("🔒", wordFrame(5, "sicurezza")), to: wordFrame(5, "È") },
  { ...single("✨", wordFrame(7, "futuro")), to: wordFrame(7, "passa") },
];

export const Esosomi: React.FC = () => (
  <SentenceReel
    source="esosomi/doctor/esosomi.mp4"
    segments={SEGMENTS}
    clips={CLIPS}
    phrases={phrases}
    brolls={BROLLS}
    stickers={STICKERS}
    cards={CARDS}
    sounds={[{ at: wordFrame(5, "100%"), file: "ding", volume: 0.45 }]}
    zoom={[1, 1]}
    drift={0}
    slideFrames={TRANSITION}
  />
);
