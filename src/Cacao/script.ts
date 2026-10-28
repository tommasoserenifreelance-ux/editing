import {
  buildPhrases,
  timeline,
  TimedWords,
  wordFinder,
} from "../Bonaccorso/phrases";
import words from "./words.json";

export const FPS = 25;

// Durations of the six takes in public/cacao/doctor, in frames.
export const CLIPS = [233, 646, 321, 200, 336, 203];
const time = timeline(FPS, CLIPS);
export const { duration: DURATION, at } = time;

const PHRASES: string[][][] = [
  [
    ["s:Il cacao è uno degli", "b:alimenti"],
    ["s:con più prove", "x:scientifiche alle spalle"],
    ["s:ma non tutto il", "c:cioccolato"],
    ["s:che trovi al", "i:supermercato"],
    ["s:conta allo", "x:stesso modo"],
  ],
  [
    ["s:Il cacao è uno degli alimenti", "b:più studiati", "x:in assoluto"],
    ["s:e i risultati sono", "b:sorprendentemente", "x:coerenti"],
    ["s:Diverse", "c:meta-analisi", "s:di studi randomizzati"],
    ["s:mostrano che il cacao ricco di", "x:flavonoidi"],
    ["s:riduce la pressione", "c:sistolica"],
    ["s:di circa", "n:3-5", "s:millimetri di mercurio"],
    ["s:migliora la funzione", "x:dell'endotelio"],
    ["s:la parete interna che riveste i", "b:vasi sanguigni"],
    ["s:e aumenta la", "b:sensibilità", "x:all'insulina"],
  ],
  [
    ["s:Il punto chiave è la parola", "b:ricco di", "x:flavonoidi"],
    ["s:La lavorazione", "c:industriale", "s:del cacao"],
    ["s:quella che serve a renderlo", "i:dolce e delicato"],
    ["b:distrugge", "s:gran parte di", "x:questi composti"],
  ],
  [
    ["s:Una comune tavoletta di", "b:cioccolato"],
    ["s:peggio", "x:al latte"],
    ["s:contiene una", "c:frazione minima"],
    ["s:dei flavonoidi", "i:usati negli studi"],
  ],
  [
    ["b:In pratica"],
    ["s:cacao amaro", "x:in polvere", "s:non zuccherato"],
    ["s:o cioccolato", "c:fondente"],
    ["s:con un'alta percentuale", "s:di cacao superiore al", "n:70%"],
    ["s:sono le scelte", "x:più vicine"],
    ["s:a quello che dice", "i:la scienza"],
  ],
  [
    ["s:Non serve", "b:esagerare", "s:con le quantità"],
    ["s:bastano", "c:poche decine", "x:di grammi al giorno"],
    ["s:per rientrare nei", "x:dosaggi studiati"],
  ],
];

const timed = words as TimedWords;
export const phrases = buildPhrases(PHRASES, timed, CLIPS, time);
export const wordFrame = wordFinder(timed, time);
