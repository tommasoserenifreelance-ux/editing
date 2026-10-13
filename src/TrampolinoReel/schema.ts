import { z } from "zod";

const label = z.object({
  text: z.string(),
  side: z.enum(["left", "right", "center"]),
  // Vertical centre of the label, in px on the 1080x1920 canvas.
  y: z.number(),
});

export const trampolinoReelSchema = z.object({
  // Files in public/.
  videoSrc: z.string(),
  musicSrc: z.string(),
  musicVolume: z.number().min(0).max(1),
  hookTitle: z.string(),
  hookSubtitle: z.string(),
  headline: z.string(),
  // Top edge of the headline, in px. Instagram's UI covers roughly the top
  // 220px and the bottom 320px of a reel.
  headlineY: z.number(),
  labels: z.array(label),
  // Seconds.
  hookEnd: z.number(),
  firstLabelAt: z.number(),
  labelInterval: z.number(),
});

export type TrampolinoReelProps = z.infer<typeof trampolinoReelSchema>;

export const defaultTrampolinoReelProps: TrampolinoReelProps = {
  videoSrc: "video-2.mp4",
  musicSrc: "music.mp3",
  musicVolume: 1,
  hookTitle: "Faccio rebounding\nogni giorno",
  hookSubtitle: "Ecco perché dovresti farlo anche tu",
  headlineY: 470,
  headline: "10 minuti di rebounding > 10 minuti di camminata",
  labels: [
    { text: "Parte della mia\nroutine quotidiana", side: "left", y: 640 },
    { text: "Gambe più leggere\nmeno gonfie", side: "right", y: 760 },
    { text: "Dormo meglio", side: "left", y: 880 },
    { text: "Rafforza core e\npavimento pelvico", side: "right", y: 1000 },
    { text: "Migliora la\ncircolazione", side: "left", y: 1120 },
    { text: "Favorisce il\ndrenaggio linfatico", side: "right", y: 1240 },
    { text: "Più equilibrio\ne coordinazione", side: "left", y: 1370 },
    { text: "Bastano 10 minuti al giorno", side: "center", y: 1540 },
  ],
  hookEnd: 2,
  firstLabelAt: 2.8,
  labelInterval: 1.35,
};
