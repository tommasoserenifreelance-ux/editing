export const WORKOUT_FPS = 30;

export type Clip = {
  src: string;
  durationInFrames: number;
};

// Source videos, played back to back
export const clips: Clip[] = [
  { src: "clips/hook.mp4", durationInFrames: 232 },
  { src: "clips/esercizi-1-3.mp4", durationInFrames: 524 },
  { src: "clips/esercizio-4.mp4", durationInFrames: 201 },
  { src: "clips/esercizio-5.mp4", durationInFrames: 255 },
  { src: "clips/esercizio-6.mp4", durationInFrames: 299 },
  { src: "clips/esercizio-7.mp4", durationInFrames: 256 },
];

export const clipStart = (clipIndex: number) =>
  clips.slice(0, clipIndex).reduce((sum, c) => sum + c.durationInFrames, 0);

export const WORKOUT_DURATION_IN_FRAMES = clipStart(clips.length);

export type Exercise = {
  number: string;
  title: string;
  detail: string;
  description: string;
  clip: number;
  // Frames within the clip; omitted means the whole clip.
  // Exercises 1–3 share one clip and are split at its scene cuts.
  from?: number;
  to?: number;
};

export const exercises: Exercise[] = [
  {
    number: "01.",
    title: "CORSA – 5 MINUTI",
    detail: "Pendenza 1% · Velocità 8",
    description: "Riscaldamento cardiovascolare e attivazione muscolare.",
    clip: 1,
    from: 0,
    to: 110,
  },
  {
    number: "02.",
    title: "AFFONDO INDIETRO – 4×10",
    detail: "Muscoli: quadricipiti e grande gluteo.",
    description: "Migliora forza, equilibrio e stabilità.",
    clip: 1,
    from: 110,
    to: 335,
  },
  {
    number: "03.",
    title: "STEP UP – 4×10",
    detail: "Muscoli: quadricipiti, grande gluteo e ischiocrurali.",
    description: "Sviluppa forza e coordinazione delle gambe.",
    clip: 1,
    from: 335,
  },
  {
    number: "04.",
    title: "HIP THRUST – 4×10",
    detail: "Muscolo: grande gluteo.",
    description: "Favorisce lo sviluppo di forza e volume dei glutei.",
    clip: 2,
  },
  {
    number: "05.",
    title: "LAT MACHINE PRESA LARGA – 4×10",
    detail: "Muscolo: gran dorsale.",
    description: "Rinforza la schiena e migliora la forza di trazione.",
    clip: 3,
  },
  {
    number: "06.",
    title: "FRENCH PRESS CON MANUBRI – 4×10",
    detail: "Muscoli: tricipiti.",
    description: "Isola i tricipiti e ne stimola lo sviluppo muscolare.",
    clip: 4,
  },
  {
    number: "07.",
    title: "ALZATE LATERALI – 4×10",
    detail: "Muscolo: deltoide laterale.",
    description: "Sviluppa le spalle, migliorandone ampiezza e definizione.",
    clip: 5,
  },
];

export const exerciseRange = (exercise: Exercise) => {
  const start = clipStart(exercise.clip);
  const from = start + (exercise.from ?? 0);
  const to = start + (exercise.to ?? clips[exercise.clip].durationInFrames);
  return { from, durationInFrames: to - from };
};
