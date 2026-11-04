import { z } from "zod";

// Every editable bit of the video lives here so it can be tweaked from the
// Remotion Studio sidebar or via --props when rendering.
export const beatSchema = z.object({
  // Clips in public/ (e.g. "beat/clip1.mp4"), played back-to-back with hard
  // cuts. Leave empty to preview with the placeholder steel-bench background.
  clips: z.array(
    z.object({
      src: z.string(),
      startFrom: z.number().min(0), // seconds into the source clip
      duration: z.number().positive(), // seconds on the output timeline
      playbackRate: z.number().positive(),
      // Areas to clean up by copying nearby bench (source-clip pixels).
      patches: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
            w: z.number(),
            h: z.number(),
            dx: z.number(),
            dy: z.number(),
          }),
        )
        .optional(),
    }),
  ),
  music: z.string(), // optional audio file in public/, "" = none
  receipt: z.object({
    restaurant: z.string(),
    location: z.string(),
    tableLabel: z.string(),
    coversLabel: z.string(),
    serviceLabel: z.string(),
    orderLabel: z.string(),
    date: z.string(),
    time: z.string(),
    footerLine1: z.string(),
    footerLine2: z.string(),
    printedLabel: z.string(),
    printedDate: z.string(),
    orderShort: z.string(),
  }),
  // Use "\n" in a name to wrap onto a second (unstruck) line.
  dishes: z.array(
    z.object({
      qty: z.string(),
      name: z.string(),
      strikeAt: z.number(), // seconds: when the plate leaves the pass
    }),
  ),
  receiptIn: z.number(), // seconds
  receiptOut: z.number(), // seconds
  logoIn: z.number(), // seconds
  logoSrc: z.string(), // logo image in public/, "" = text wordmark
  logoText: z.string(), // "\n" separates lines
});

export type BeatProps = z.infer<typeof beatSchema>;

// Cut points copied frame-by-frame from the reference (24 fps, 9.5 s):
// shots end at frames 15, 28, 44, 57, 91, 105, 125, 167, 228.
// Order matches the reference: line 2 leaves first, then line 1, then line 3.
const f = (frames: number) => frames / 24;
// Leftover truffle crumb on the bench, bottom-left of C0007.
const crumb = [{ x: 130, y: 915, w: 160, h: 180, dx: -130, dy: -20 }];

export const beatDefaults: BeatProps = {
  clips: [
    // La Tartare
    {
      src: "beat/C0006.MP4",
      startFrom: 1.2,
      duration: f(15),
      playbackRate: 1.5,
    }, // burrata
    {
      src: "beat/C0006.MP4",
      startFrom: 10.6,
      duration: f(13),
      playbackRate: 1.5,
    }, // pistacchio
    {
      src: "beat/C0006.MP4",
      startFrom: 14.2,
      duration: f(16),
      playbackRate: 2,
    }, // esce
    // Il Gattopardo
    {
      src: "beat/C0005.MP4",
      startFrom: 31.0,
      duration: f(13),
      playbackRate: 1.5,
    }, // miele
    {
      src: "beat/C0005.MP4",
      startFrom: 37.0,
      duration: f(34),
      playbackRate: 2.2,
    }, // esce
    // L'Uovo Perfetto (skips 9.7–11 s, truffle picked up from the bench)
    {
      src: "beat/C0007.MP4",
      startFrom: 3.3,
      duration: f(14),
      playbackRate: 1.5,
      patches: crumb,
    }, // tartufo
    {
      src: "beat/C0007.MP4",
      startFrom: 13.0,
      duration: f(20),
      playbackRate: 1.5,
      patches: crumb,
    }, // olio
    {
      src: "beat/C0007.MP4",
      startFrom: 15.3,
      duration: f(42),
      playbackRate: 1,
      patches: crumb,
    }, // esce
    // Empty bench for the logo
    {
      src: "beat/C0007.MP4",
      startFrom: 17.05,
      duration: f(61),
      playbackRate: 0.66,
      patches: crumb,
    },
  ],
  music: "",
  receipt: {
    restaurant: "BEAT",
    location: "Pizza, Roll & Spa",
    tableLabel: "TAVOLO 12",
    coversLabel: "COPERTI: 2",
    serviceLabel: "SALA",
    orderLabel: "ORDINE #0467",
    date: "04 Nov 2026",
    time: "20:32",
    footerLine1: "CUCINA",
    footerLine2: "SALA",
    printedLabel: "Stampato: 20:32",
    printedDate: "04 Nov 2026",
    orderShort: "#0467",
  },
  dishes: [
    { qty: "1", name: "Il Gattopardo", strikeAt: f(72) },
    { qty: "1", name: "La Tartare", strikeAt: f(28) },
    { qty: "1", name: "L’Uovo Perfetto\n(... o quasi)", strikeAt: f(137) },
  ],
  receiptIn: f(7),
  receiptOut: f(167),
  logoIn: f(189),
  logoSrc: "beat/logo-bianco.png",
  logoText: "BEAT",
};
