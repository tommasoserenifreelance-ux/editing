import { BRollCue, SentenceReel, StickerCue } from "../Bonaccorso/SentenceReel";
import { at, CLIPS, DURATION, phrases, SEGMENTS, wordFrame } from "./script";

export { DURATION as GENI_DURATION, FPS as GENI_FPS } from "./script";

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);
const broll = (file: string) => `geni/broll/${file}`;

const BROLLS: BRollCue[] = [
  // Belly fat for "i tassi di obesità del mondo sono più che triplicati".
  {
    src: broll("477.mp4"),
    from: wordFrame(0, "tassi"),
    to: wordFrame(0, "ma"),
  },
  // The double helix for "il nostro DNA in 50 anni non è cambiato".
  { src: broll("479.mp4"), from: wordFrame(0, "nostro"), to: take(1) },
  // Chromosomes for "il patrimonio genetico", then arm fat for
  // "la tendenza ad accumulare peso".
  {
    src: broll("480.mp4"),
    from: wordFrame(3, "patrimonio"),
    to: wordFrame(3, "la"),
  },
  { src: broll("478.mp4"), from: wordFrame(3, "la"), to: take(4) },
];

const single = (char: string, from: number) => ({
  chars: [char],
  delays: [from],
});

const STICKERS: StickerCue[] = [
  { ...single("📈", wordFrame(0, "triplicati")), to: wordFrame(0, "ma") },
  { ...single("🚫", wordFrame(1, "impossibile")), to: take(2) },
  { ...single("🧬", wordFrame(2, "geni")), to: take(3) },
  { ...single("👯", wordFrame(3, "gemelli")), to: wordFrame(3, "patrimonio") },
  {
    ...single("🌍", wordFrame(5, "l'ambiente")),
    to: wordFrame(5, "alimentazione"),
  },
  {
    chars: ["🍽️", "🛋️"],
    delays: [wordFrame(5, "alimentazione"), wordFrame(5, "sedentarietà")],
    to: wordFrame(5, "sonno"),
  },
  {
    chars: ["😴", "😰"],
    delays: [wordFrame(5, "sonno"), wordFrame(5, "stress")],
    to: take(6),
  },
  { ...single("🤫", wordFrame(6, "silenzioso")), to: wordFrame(6, "o") },
  { ...single("💡", wordFrame(6, "accende")), to: take(7) },
  { ...single("🤔", wordFrame(7, "domanda")), to: wordFrame(7, "ma") },
  { ...single("💪", wordFrame(7, "posso")), to: take(8) },
];

export const Geni: React.FC = () => (
  <SentenceReel
    source="geni/doctor/geni.mp4"
    segments={SEGMENTS}
    clips={CLIPS}
    phrases={phrases}
    brolls={BROLLS}
    stickers={STICKERS}
    sounds={[{ at: wordFrame(0, "triplicati"), file: "ding", volume: 0.45 }]}
  />
);
