export type Exercise = {
  number: string;
  title: string;
  detail: string;
  description: string;
  // Scene boundaries in seconds, aligned with the cuts in the source video
  from: number;
  to: number;
};

export const WORKOUT_FPS = 30;
export const WORKOUT_DURATION_SECONDS = 17.45;

export const exercises: Exercise[] = [
  {
    number: "01.",
    title: "CORSA – 5 MINUTI",
    detail: "Pendenza 1% · Velocità 8",
    description: "Riscaldamento cardiovascolare e attivazione muscolare.",
    from: 0,
    to: 3.667,
  },
  {
    number: "02.",
    title: "AFFONDO INDIETRO – 4×10",
    detail: "Muscoli: quadricipiti e grande gluteo.",
    description: "Migliora forza, equilibrio e stabilità.",
    from: 3.667,
    to: 11.167,
  },
  {
    number: "03.",
    title: "STEP UP – 4×10",
    detail: "Muscoli: quadricipiti, grande gluteo e ischiocrurali.",
    description: "Sviluppa forza e coordinazione delle gambe.",
    from: 11.167,
    to: WORKOUT_DURATION_SECONDS,
  },
];
