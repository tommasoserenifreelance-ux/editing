import words from "./words.json";

export const FPS = 25;

// Durations of the six takes in public/cacao/doctor, in frames.
export const CLIPS = [233, 646, 321, 200, 336, 203];
export const CLIP_START = CLIPS.map((_, i) =>
  CLIPS.slice(0, i).reduce((a, b) => a + b, 0),
);
export const DURATION = CLIPS.reduce((a, b) => a + b, 0);

// Frame of a moment given in seconds inside one take.
export const at = (clip: number, seconds: number) =>
  CLIP_START[clip] + Math.round(seconds * FPS);

/**
 * Line styles:
 * s = small white, b = big white, c = big cyan, n = huge cyan number,
 * x = serif italic in a blue box, i = serif italic cyan.
 */
export type LineStyle = "s" | "b" | "c" | "n" | "x" | "i";

// One array per take; each phrase is a stack of lines, each line "style:text".
// The words must match words.json (Whisper word timings) one to one.
const PHRASES: string[][][] = [
  [
    ["s:Il cacao è uno degli", "b:alimenti"],
    ["s:con più prove", "x:scientifiche", "s:alle spalle"],
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
    ["s:Una comune", "b:tavoletta", "s:di cioccolato"],
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

export type Word = { text: string; from: number };
export type Line = { style: LineStyle; words: Word[] };
export type Phrase = { from: number; to: number; lines: Line[] };

const timed = words as [string, number, number][][];

export const phrases: Phrase[] = ([] as Phrase[]).concat(
  ...PHRASES.map((clipPhrases, clip) => {
    const clipWords = timed[clip];
    let k = 0;
    const built = clipPhrases.map((lines) => ({
      lines: lines.map((spec) => {
        const [style, text] = spec.split(/:(.*)/s);
        return {
          style: style as LineStyle,
          words: text.split(" ").map((t) => {
            const [w, s] = clipWords[k++];
            if (w !== t) {
              throw new Error(`Take ${clip + 1}: expected "${w}", got "${t}"`);
            }
            return { text: t, from: at(clip, s) };
          }),
        };
      }),
    }));
    if (k !== clipWords.length) {
      throw new Error(`Take ${clip + 1}: ${clipWords.length - k} words unused`);
    }
    return built.map((p, i) => ({
      ...p,
      from: p.lines[0].words[0].from,
      to:
        i + 1 < built.length
          ? built[i + 1].lines[0].words[0].from
          : CLIP_START[clip] + CLIPS[clip],
    }));
  }),
);

// Look up when a given word is spoken, for syncing overlays and sounds.
export const wordFrame = (clip: number, word: string, nth = 0) => {
  const hits = timed[clip].filter(([w]) => w === word);
  if (!hits[nth]) throw new Error(`Take ${clip + 1}: no "${word}" #${nth}`);
  return at(clip, hits[nth][1]);
};
