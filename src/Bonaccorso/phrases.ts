/**
 * Line styles:
 * s = small white, b = big white, c = big blue, n = huge blue number,
 * x = serif italic in a blue box, i = serif italic blue.
 */
export type LineStyle = "s" | "b" | "c" | "n" | "x" | "i";

export type Word = { text: string; from: number };
export type Line = { style: LineStyle; words: Word[] };
export type Phrase = { from: number; to: number; lines: Line[] };

// Whisper word timings per take: [word, start, end] in seconds.
export type TimedWords = [string, number, number][][];

// Timeline of takes laid end to end, given their lengths in frames.
export const timeline = (fps: number, clips: number[]) => {
  const clipStart = clips.map((_, i) =>
    clips.slice(0, i).reduce((a, b) => a + b, 0),
  );
  // Frame of a moment given in seconds inside one take.
  const at = (clip: number, seconds: number) =>
    clipStart[clip] + Math.round(seconds * fps);
  return {
    clipStart,
    duration: clips.reduce((a, b) => a + b, 0),
    at,
  };
};

/**
 * `spec` has one array per take; each phrase is a stack of lines, each line
 * "style:text". The words must match `timed` one to one.
 */
export const buildPhrases = (
  spec: string[][][],
  timed: TimedWords,
  clips: number[],
  { clipStart, at }: ReturnType<typeof timeline>,
): Phrase[] =>
  ([] as Phrase[]).concat(
    ...spec.map((clipPhrases, clip) => {
      const clipWords = timed[clip];
      let k = 0;
      const built = clipPhrases.map((lines) => ({
        lines: lines.map((line) => {
          const [style, text] = line.split(/:(.*)/s);
          return {
            style: style as LineStyle,
            words: text.split(" ").map((t) => {
              const [w, s] = clipWords[k++];
              if (w !== t) {
                throw new Error(
                  `Take ${clip + 1}: expected "${w}", got "${t}"`,
                );
              }
              return { text: t, from: at(clip, s) };
            }),
          };
        }),
      }));
      if (k !== clipWords.length) {
        throw new Error(
          `Take ${clip + 1}: ${clipWords.length - k} words unused`,
        );
      }
      return built.map((p, i) => ({
        ...p,
        from: p.lines[0].words[0].from,
        to:
          i + 1 < built.length
            ? built[i + 1].lines[0].words[0].from
            : clipStart[clip] + clips[clip],
      }));
    }),
  );

// Look up when a given word is spoken, for syncing overlays and sounds.
export const wordFinder =
  (timed: TimedWords, { at }: ReturnType<typeof timeline>) =>
  (clip: number, word: string, nth = 0) => {
    const hits = timed[clip].filter(([w]) => w === word);
    if (!hits[nth]) throw new Error(`Take ${clip + 1}: no "${word}" #${nth}`);
    return at(clip, hits[nth][1]);
  };
