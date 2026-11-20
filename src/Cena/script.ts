import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// The footage is one landscape 4K take (speech starts at 6.9 s); these are
// its sentences, [start, end] in seconds, cut at the breaths between them.
export const SEGMENTS: [number, number][] = [
  [6.85, 15.65],
  [15.95, 36.98],
  // "E c'è di più" runs straight into the next sentence, one shot.
  [37.7, 53.7],
  [53.95, 56.55],
  [56.75, 64.95],
];
export const CLIPS = SEGMENTS.map(([s, e]) => Math.round((e - s) * FPS));
// Frames of the slide between takes.
export const TRANSITION = 6;
const time = timeline(FPS, CLIPS, TRANSITION);
export const { duration: DURATION, at } = time;

const PHRASES: string[][][] = [
  [
    ["s:Ti svegli", "b:stanco"],
    ["s:e dai la colpa al", "x:sonno"],
    ["s:ma la vera causa potrebbe essere", "c:la tua cena"],
    ["s:non", "b:cosa mangi"],
    ["s:ma", "x:quando mangi"],
  ],
  [
    ["b:Uno studio", "s:ha confrontato"],
    ["s:la", "c:risposta glicemica"],
    ["s:alla stessa cena consumata in", "x:orari diversi"],
    ["s:rispetto al proprio", "i:ritmo abituale"],
    ["s:Quando la cena viene spostata", "c:più tardi"],
    ["s:il corpo la gestisce", "x:peggio"],
    ["s:la tolleranza al glucosio", "b:peggiora"],
    ["s:perché il pasto arriva mentre la", "c:melatonina"],
    ["s:è già", "x:più alta"],
  ],
  [
    ["b:E c'è di più"],
    ["s:Chi porta una", "c:variante genetica", "s:comune"],
    ["s:del recettore della", "x:melatonina"],
    ["s:chiamata", "b:MTNR1B"],
    ["s:presente in una parte", "c:significativa"],
    ["s:della", "i:popolazione"],
    ["s:mostra un effetto ancora più", "x:marcato"],
    ["s:quando", "b:cena tardi"],
  ],
  [["s:Non serve stravolgere", "x:le tue abitudini"]],
  [
    ["s:a volte basta", "c:anticipare la cena"],
    ["s:di", "n:un'ora"],
    ["s:per dare al tuo", "b:metabolismo"],
    ["s:un contesto migliore", "x:in cui lavorare"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
