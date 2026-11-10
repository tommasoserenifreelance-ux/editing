import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// The footage is one 65 s take; these are its sentences, [start, end] in
// seconds, cut at the breaths between them.
export const SEGMENTS: [number, number][] = [
  [0, 5.75],
  [6.12, 11.8],
  [11.96, 17.4],
  [17.84, 36.38],
  [36.62, 43.5],
  [43.66, 55.8],
  [56.18, 60.4],
  [60.62, 64.6],
];
export const CLIPS = SEGMENTS.map(([s, e]) => Math.round((e - s) * FPS));
// Frames of the slide between takes.
export const TRANSITION = 6;
const time = timeline(FPS, CLIPS, TRANSITION);
export const { duration: DURATION, at } = time;

const PHRASES: string[][][] = [
  [
    ["s:E se vi dicessi che", "b:la pelle"],
    ["s:si può", "c:rigenerare"],
    ["s:usando solo il", "x:vostro plasma"],
  ],
  [
    ["s:Gli", "c:esosomi autologhi"],
    ["s:sono la frontiera più avanzata della", "x:medicina rigenerativa"],
  ],
  [
    ["s:Una", "b:review", "s:pubblicata quest'anno"],
    ["s:sull'International Journal of", "i:Molecular Sciences"],
  ],
  [
    ["s:ha passato in rassegna gli", "c:studi clinici", "s:disponibili"],
    ["s:sulle", "b:vescicole", "x:extracellulari"],
    ["s:nel ringiovanimento", "x:cutaneo"],
    ["s:evidenziando risultati", "b:incoraggianti"],
    ["s:sulla qualità della", "x:pelle"],
    ["s:proprio nei protocolli con", "c:esosomi autologhi"],
    ["s:ottenuti da", "b:PRP", "x:attivato"],
  ],
  [
    ["s:Vengono ricavati direttamente dal", "x:vostro plasma"],
    ["s:ricchi di proteine", "b:lipidi"],
    ["s:e", "x:segnali rigenerativi"],
  ],
  [
    ["s:Sono al", "n:100%"],
    ["x:vostri"],
    ["s:nessun rischio di", "b:rigetto"],
    ["s:massima", "c:compatibilità"],
    ["s:massima", "x:sicurezza"],
    ["s:È la stessa", "b:filosofia"],
    ["s:che guida tutta la medicina", "i:rigenerativa più seria"],
  ],
  [
    ["s:usare il", "c:potenziale"],
    ["s:del proprio corpo per", "x:rigenerarlo"],
  ],
  [
    ["s:Il futuro della rigenerazione", "c:cutanea"],
    ["s:passa da", "b:qui"],
    ["x:è già realtà"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
