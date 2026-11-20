import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// The footage is one landscape 4K take (speech starts at 5.7 s); these are
// its sentences, [start, end] in seconds, cut at the breaths between them.
export const SEGMENTS: [number, number][] = [
  [5.65, 9.4],
  [9.62, 17.5],
  [17.66, 26.6],
  [26.78, 30.45],
  [30.8, 36.32],
  [36.55, 41.55],
  [41.85, 45.75],
  [45.92, 52.45],
  [52.62, 53.8],
  [53.88, 58.6],
];
export const CLIPS = SEGMENTS.map(([s, e]) => Math.round((e - s) * FPS));
// Frames of the slide between takes.
export const TRANSITION = 6;
const time = timeline(FPS, CLIPS, TRANSITION);
export const { duration: DURATION, at } = time;

const PHRASES: string[][][] = [
  [
    ["s:Un", "b:filler", "x:riempie"],
    ["s:un", "c:collagen booster", "x:costruisce"],
  ],
  [
    ["s:E la differenza si vede", "x:nel tempo"],
    ["s:gli studi", "b:istologici"],
    ["s:sui biostimolatori a base di", "c:idrossiapatite"],
    ["s:di calcio", "x:parlano chiaro"],
  ],
  [
    ["b:Biopsie", "s:eseguite a tre mesi"],
    ["s:dal trattamento mostrano un", "c:aumento significativo"],
    ["s:di collagene", "b:di tipo 1 e 3"],
    ["s:nell'area", "x:trattata"],
  ],
  [
    ["s:ancora ben presente a", "n:12 e 18"],
    ["s:mesi", "x:di distanza"],
  ],
  [
    ["s:Queste sostanze attivano i vostri", "c:fibroblasti"],
    ["s:e vi spingono a costruire", "x:nuovo collagene"],
  ],
  [
    ["b:seduta dopo seduta"],
    ["s:invece di limitarsi a", "c:occupare spazio"],
    ["s:come il", "x:filler"],
  ],
  [
    ["s:Il risultato cresce", "b:nel tempo"],
    ["s:in modo progressivo", "x:e armonico"],
  ],
  [
    ["s:pelle", "c:più tonica"],
    ["s:più", "b:elastica"],
    ["s:più", "x:strutturata"],
    ["s:con un effetto che sembra il vostro", "i:miglioramento naturale"],
  ],
  [["s:non un", "x:ritocco"]],
  [
    ["s:Investire sul proprio", "b:collagene", "x:oggi"],
    ["s:significa una pelle", "c:più giovane"],
    ["x:domani"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
