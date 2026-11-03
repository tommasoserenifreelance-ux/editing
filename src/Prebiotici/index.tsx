import { BRollCue, SentenceReel, StickerCue } from "../Bonaccorso/SentenceReel";
import { at, CLIPS, DURATION, phrases, SEGMENTS, wordFrame } from "./script";

export {
  DURATION as PREBIOTICI_DURATION,
  FPS as PREBIOTICI_FPS,
} from "./script";

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);
const broll = (file: string) => `prebiotici/broll/${file}`;

const BROLLS: BRollCue[] = [
  // Microbiome under the microscope for "salute intestinale".
  {
    src: broll("475.mp4"),
    from: wordFrame(1, "Quando"),
    to: wordFrame(1, "sentiamo"),
  },
  // A bacterium for "dai microorganismi dell'ospite".
  { src: broll("470.mp4"), from: wordFrame(3, "dai"), to: wordFrame(3, "che") },
  // Legumes for "alcune fibre possono essere prebiotici".
  { src: broll("473.mp4"), from: take(4), to: take(5) },
  // Live bacteria, then capsules for "somministrati in quantità adeguate".
  {
    src: broll("474.mp4"),
    from: wordFrame(5, "microorganismi"),
    to: wordFrame(5, "che"),
  },
  { src: broll("471.mp4"), from: wordFrame(5, "che"), to: take(6) },
  // Inactivated cells for "microorganismi inattivati".
  { src: broll("472.mp4"), from: wordFrame(8, "di"), to: wordFrame(8, "e") },
];

const trio = (clip: number) => ({
  chars: ["🌾", "🦠", "🧪"],
  delays: [
    wordFrame(clip, clip === 0 ? "Prebiotici" : "prebiotici"),
    wordFrame(clip, "probiotici"),
    wordFrame(clip, "postbiotici"),
  ],
});
const single = (char: string, from: number) => ({
  chars: [char],
  delays: [from],
});

const STICKERS: StickerCue[] = [
  { ...trio(0), to: wordFrame(0, "vengono") },
  { ...single("🍲", wordFrame(0, "calderone")), to: wordFrame(0, "ma") },
  { ...trio(2), to: wordFrame(2, "ma") },
  { ...single("❌", wordFrame(2, "sinonimi")), to: take(3) },
  { ...single("🌾", wordFrame(3, "prebiotici")), to: wordFrame(3, "dai") },
  { ...single("💚", wordFrame(3, "un")), to: take(4) },
  { ...single("💪", take(6)), to: take(7) },
  { ...single("⚠️", wordFrame(7, "Non")), to: wordFrame(7, "fermentato") },
  { ...single("🫙", wordFrame(7, "fermentato")), to: wordFrame(7, "per") },
  { ...single("🧪", wordFrame(8, "postbiotici")), to: wordFrame(8, "di") },
  { ...single("🔬", wordFrame(9, "evidenze")), to: take(10) },
  { ...single("🏷️", wordFrame(10, "etichette")), to: take(11) },
];

export const Prebiotici: React.FC = () => (
  <SentenceReel
    source="prebiotici/doctor/prebiotici.mp4"
    segments={SEGMENTS}
    clips={CLIPS}
    phrases={phrases}
    brolls={BROLLS}
    stickers={STICKERS}
    sounds={[{ at: wordFrame(1, "tre"), file: "ding", volume: 0.45 }]}
  />
);
