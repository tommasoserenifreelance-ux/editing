import { z } from "zod";

// Every editable bit of the video lives here so it can be tweaked from the
// Remotion Studio sidebar or via --props when rendering.
export const beatSchema = z.object({
  // Clips in public/ (e.g. "beat/clip1.mp4"), played back-to-back with hard
  // cuts. Leave empty to preview with the placeholder steel-bench background.
  clips: z.array(
    z.object({
      src: z.string(),
      startFrom: z.number().min(0), // seconds trimmed from the clip start
      duration: z.number().positive(), // seconds used from the clip
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

// Timings copied frame-by-frame from the reference (24 fps, 9.5 s).
export const beatDefaults: BeatProps = {
  clips: [],
  music: "",
  receipt: {
    restaurant: "BEAT RESTAURANT",
    location: "Via Esempio 1, Città",
    tableLabel: "TAVOLO 12",
    coversLabel: "COPERTI: 2",
    serviceLabel: "SALA",
    orderLabel: "ORDINE #0467",
    date: "17 Nov 2026",
    time: "20:32",
    footerLine1: "CUCINA",
    footerLine2: "SERVIZIO AL TAVOLO",
    printedLabel: "Stampato: 20:32",
    printedDate: "17 Nov 2026",
    orderShort: "#0467",
  },
  dishes: [
    { qty: "1", name: "Tagliatelle al ragù", strikeAt: 74 / 24 },
    { qty: "1", name: "Risotto, zafferano\ne midollo", strikeAt: 28 / 24 },
    { qty: "1", name: "Tiramisù della casa", strikeAt: 132 / 24 },
  ],
  receiptIn: 7 / 24,
  receiptOut: 167 / 24,
  logoIn: 189 / 24,
  logoSrc: "",
  logoText: "BEAT\nRESTAURANT",
};
