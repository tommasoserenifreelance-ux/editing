import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// The upload also holds the Prebiotici take; this video is its last minute.
// These are its sentences, [start, end] in seconds, cut tight to drop the
// breaths between them.
export const SEGMENTS: [number, number][] = [
  [117.83, 127.03],
  [127.24, 133.59],
  // Cut before he swallows after "non contino".
  [134.18, 137.92],
  [138.36, 146.71],
  [146.9, 153.73],
  [154.02, 160.15],
  [160.34, 167.85],
  // Split to drop the pause between "quanto" and "pesano".
  [168.14, 171.52],
  [171.84, 177.3],
];
export const CLIPS = SEGMENTS.map(([s, e]) => Math.round((e - s) * FPS));
// Frames of the slide between takes.
export const TRANSITION = 6;
const time = timeline(FPS, CLIPS, TRANSITION);
export const { duration: DURATION, at } = time;

// "\u00a0" keeps two spoken words as one caption word ("un altro", "i miei").
const PHRASES: string[][][] = [
  [
    ["s:In", "n:50 anni"],
    ["s:i tassi di", "b:obesità", "s:del mondo sono"],
    ["c:più che triplicati"],
    ["s:ma il nostro", "b:DNA"],
    ["s:in 50 anni non è cambiato", "x:di una virgola"],
  ],
  [
    ["s:un'evoluzione così rapida della", "b:genetica umana"],
    ["s:è semplicemente", "x:impossibile"],
    ["s:in così", "c:poco tempo"],
  ],
  [["s:Questo non significa che", "b:i geni", "x:non contino"]],
  [
    ["s:Gli studi sui", "b:gemelli"],
    ["s:mostrano che il", "c:patrimonio genetico"],
    ["s:influenza in modo", "x:importante"],
    ["s:la tendenza ad", "b:accumulare peso"],
  ],
  [
    ["s:ma un conto è avere una", "c:predisposizione"],
    ["s:un\u00a0altro è che quella", "b:predisposizione"],
    ["s:si esprima quindi", "x:davvero"],
  ],
  [
    ["s:Ed è qui che entra in gioco", "x:l'ambiente"],
    ["c:alimentazione", "c:sedentarietà"],
    ["b:sonno", "b:stress"],
  ],
  [
    ["s:Sono questi i fattori a", "b:decidere"],
    ["s:in gran parte se un", "c:gene a rischio"],
    ["s:resta", "i:silenzioso"],
    ["s:o", "x:si accende"],
  ],
  [
    ["s:La vera", "b:domanda"],
    ["s:quindi non è", "c:quanto"],
  ],
  [
    ["c:pesano i miei geni"],
    ["s:ma quanto", "x:posso influenzare"],
    ["s:ciò che fanno quindi", "i:i\u00a0miei geni"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
