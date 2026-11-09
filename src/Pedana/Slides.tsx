import { SlideData } from "../Carosello/Slides";

// Vibration plate carousel, slides 2-8 (after the video cover in ./index.tsx).
// Content from the guidelines by physiotherapist Stella Maris Glowinski
// ("Pedana vibrante – Linee guida"), without the lipedema framing.
// Rendered with the pasta carousel's <Slide> layout.

const SOURCE = "Linee guida di Stella Maris Glowinski, fisioterapista";

export const PEDANA_SLIDES: SlideData[] = [
  {
    photo: "pedana-17.jpg",
    title: "A cosa serve",
    body: "Un valido supporto per il benessere di tutti i giorni, anche in pre e post menopausa: favorisce la mobilità articolare, stimola la circolazione e riduce la sensazione di gambe pesanti.",
    source: SOURCE,
  },
  {
    photo: "pedana-19.webp",
    title: "1. In piedi, per le gambe",
    body: "Piedi divaricati e ginocchia flesse, programma 1 per 10 minuti. Aggiungi squat leggeri o apri e chiudi le ginocchia: 10 movimenti, 1 minuto di pausa, poi ripeti.",
    source: SOURCE,
  },
  {
    photo: "pedana-21.webp",
    title: "2. Gambe flesse e braccia",
    body: "Con le ginocchia leggermente piegate puoi lavorare anche sulle braccia, con o senza pesi, con o senza elastico.",
    source: SOURCE,
  },
  {
    photo: "pedana-18.webp",
    title: "3. Seduta a terra, per le braccia",
    body: "Su un tappetino, programma 1 per 10 minuti. Durante il tempo cambia appoggio: mani, avambracci, poi braccia dal gomito all'ascella.",
    source: SOURCE,
  },
  {
    video: "pedana/video2_h264.mp4",
    title: "4. Da sdraiata",
    body: "Polpacci sulla pedana, programma 1 per 10 minuti. Puoi aggiungere flessione ed estensione dei piedi, rotazioni del bacino e respirazione diaframmatica.",
    source: SOURCE,
  },
  {
    photo: "pedana-20.webp",
    title: "Quando aumentare la velocità",
    body: "Solo se non senti dolore e hai preso confidenza. Un leggero formicolio è normale: indica che la circolazione si attiva. Dolore o instabilità? Fermati subito.",
    source: SOURCE,
  },
  {
    photo: "pedana-22.webp",
    title: "Quando evitarla",
    body: "Interventi recenti, ernie o patologie della colonna, tumori, flebite, trombi o problemi venosi gravi. In caso di patologie croniche confrontati sempre con un professionista sanitario.",
    source: `${SOURCE} · Salva il post e condividilo`,
  },
];
