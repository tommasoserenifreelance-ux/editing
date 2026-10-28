import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// The footage is one 74 s take; these are its sentences, [start, end] in
// seconds, cut tight to drop the breaths between them.
export const SEGMENTS: [number, number][] = [
  [0, 8.29],
  [8.9, 13.09],
  [13.26, 17.75],
  [17.96, 27.29],
  [27.56, 30.51],
  [30.74, 36.67],
  [36.88, 39.63],
  [39.76, 48.85],
  [48.99, 59.91],
  [60.26, 65.75],
  [65.96, 73.91],
];
export const CLIPS = SEGMENTS.map(([s, e]) => Math.round((e - s) * FPS));
const time = timeline(FPS, CLIPS);
export const { duration: DURATION, at } = time;

const PHRASES: string[][][] = [
  [
    ["c:Prebiotici probiotici", "x:e postbiotici"],
    ["s:vengono spesso messi nello stesso", "i:calderone"],
    ["s:ma indicano", "x:cose diverse"],
  ],
  [
    ["s:Quando parliamo di", "b:salute intestinale"],
    ["s:sentiamo spesso", "c:tre parole"],
  ],
  [
    ["c:prebiotici probiotici", "x:e postbiotici"],
    ["s:ma non sono", "x:sinonimi"],
  ],
  [
    ["s:I prebiotici sono", "b:substrati"],
    ["s:utilizzati", "x:selettivamente"],
    ["s:dai microorganismi", "b:dell'ospite"],
    ["s:che sono capaci di apportare", "c:un beneficio"],
    ["x:alla salute"],
  ],
  [
    ["s:Per esempio alcune", "b:fibre"],
    ["s:possono essere", "x:prebiotici"],
  ],
  [
    ["s:I probiotici sono", "b:microorganismi", "x:vivi"],
    ["s:che somministrati in", "c:quantità adeguate"],
  ],
  [["s:conferiscono un beneficio", "x:alla salute"]],
  [
    ["s:Non basta quindi che", "b:un alimento sia"],
    ["b:semplicemente", "x:fermentato"],
    ["s:per poterlo definire", "c:automaticamente", "s:un probiotico"],
  ],
  [
    ["s:I postbiotici invece sono", "b:preparazioni"],
    ["s:di microorganismi", "x:inattivati"],
    [
      "s:e loro componenti che possono",
      "c:conferire",
      "i:un beneficio alla salute",
    ],
  ],
  [
    ["s:Sono concetti", "b:distinti"],
    ["s:con evidenze e", "x:definizioni specifiche"],
  ],
  [
    ["s:Conoscere la", "c:differenza"],
    ["s:aiuta a leggere con più", "b:precisione"],
    ["x:etichette", "s:e messaggi"],
    ["s:sulla", "i:salute intestinale"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
