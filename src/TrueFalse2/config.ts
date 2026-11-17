// "Sfatiamo i falsi miti sul collagene – Parte 2". Same editing as part 1
// (src/TrueFalse): the opening is part 1's first clip with a "Parte 2"
// sticker, then the new take is split at its camera cuts.
// All times are in seconds, relative to the start of each clip.

import { Caption } from "../TrueFalse/config";

export type Clip2 = {
  // File in public/, played from trimStart.
  src: string;
  trimStart?: number;
  duration: number;
  question: { from: number; to: number } | null;
  answer: boolean | null;
  revealAt: number;
  revealEnd?: number;
  flash?: boolean;
  captions: Caption[];
};

export const FPS = 24;
export const TRANSITION_SECONDS = 0.35;
export const PART_LABEL = "Parte 2";

const TAKE = "collagene2/parte2.mp4"; // camera cuts at 44.17, 55.96, 66.08

export const CLIPS: Clip2[] = [
  {
    src: "truefalse/collagene_1.mp4",
    duration: 4.79,
    question: null,
    answer: null,
    revealAt: 0,
    captions: [
      { from: 1.9, to: 2.9, text: "Collagene." },
      { from: 2.95, to: 4.75, text: "Sfatiamo dei falsi miti" },
    ],
  },
  {
    src: TAKE,
    trimStart: 0,
    duration: 44.17,
    question: { from: 0, to: 10.6 },
    answer: false,
    revealAt: 10.66,
    // long explanation: back to normal colours after the first answer
    revealEnd: 22.7,
    captions: [
      { from: 0, to: 2.46, text: "È vero Elena che se assumo tre bustine" },
      {
        from: 2.46,
        to: 5.94,
        text: "di Collagene Skin Formula con peptidi di collagene",
      },
      { from: 5.94, to: 8.4, text: "idrolizzato, quindi 15 grammi," },
      { from: 8.4, to: 10.6, text: "avrò ancora più effetto sulla mia pelle?" },
      { from: 10.66, to: 11.3, text: "Falso!" },
      {
        from: 11.34,
        to: 15.28,
        text: "Perché io prendo 5 grammi di collagene idrolizzato",
      },
      {
        from: 15.28,
        to: 18.9,
        text: "ogni giorno e 5 grammi di collagene idrolizzato",
      },
      { from: 18.92, to: 20.6, text: "per le articolazioni:" },
      { from: 20.66, to: 22.7, text: "così la mia combo è di 10 grammi." },
      { from: 22.72, to: 25.0, text: "Non ci sono studi che supportano" },
      {
        from: 25.0,
        to: 29.1,
        text: "che aumentando tanto il collagene avresti più benefici,",
      },
      {
        from: 29.1,
        to: 32.42,
        text: "perché il consiglio è di prendere dai 2,5 grammi",
      },
      {
        from: 32.42,
        to: 35.0,
        text: "fino a un massimo di 12 grammi al giorno.",
      },
      {
        from: 35.54,
        to: 37.9,
        text: "Ovviamente ogni età ha le proprie esigenze:",
      },
      {
        from: 37.94,
        to: 41.68,
        text: "io ho 45 anni e ho fatto dei test sulla mia pelle",
      },
      { from: 41.7, to: 44.1, text: "e ho notato che 10 grammi sono perfetti" },
    ],
  },
  {
    src: TAKE,
    trimStart: 44.17,
    duration: 11.79,
    question: { from: 0.3, to: 3.65 },
    answer: false,
    revealAt: 3.79,
    captions: [
      {
        from: 0.4,
        to: 3.65,
        text: "È vero Elena che il collagene è solo per noi donne?",
      },
      { from: 3.79, to: 4.9, text: "No! Falso!" },
      {
        from: 4.93,
        to: 7.27,
        text: "Il collagene va bene sia per le donne che per gli uomini",
      },
      { from: 7.79, to: 11.7, text: "ed è multiuso: pelle e articolazioni" },
    ],
  },
  {
    src: TAKE,
    trimStart: 55.96,
    duration: 10.12,
    question: { from: 4.2, to: 7.4 },
    answer: false,
    revealAt: 7.48,
    captions: [
      { from: 0, to: 2.38, text: "Rido già pensando alla domanda" },
      { from: 2.38, to: 4.25, text: "che spesso leggo in direct:" },
      {
        from: 4.28,
        to: 7.4,
        text: "«Elena, ma è vero che il collagene fa ingrassare?»",
      },
      { from: 7.48, to: 10.0, text: "No, è falso ragazze!" },
    ],
  },
  {
    src: TAKE,
    trimStart: 66.08,
    duration: 3.95,
    question: null,
    answer: null,
    revealAt: 0,
    captions: [
      { from: 0.4, to: 2.3, text: "E tu conoscevi questi falsi miti?" },
      { from: 2.3, to: 3.9, text: "Spero di averti aiutato" },
    ],
  },
];
