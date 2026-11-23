// Storia dell'ozono — the single timeline. Voice durations from voice/out/dur.json (Kokoro im_nicola).
// Free tempo: the grid is the narrator. The loupe lands 0.35 s before each line starts and lifts 0.45 s after it ends.
export const VDUR = { l0: 5.211, l1: 9.376, l2: 6.103, l3: 8.177, l4: 5.605, l5: 6.492, l6: 7.855, l7: 6.408, l8: 7.909, l9: 4.501 };
export const LIGHT_ON = 0.9;
export const INTRO = { line: 'l0', t: 1.0 };
// one event per print, in date order. push = the camera falls into the lens (the four turning points)
const STARTS = [7.35, 18.55, 26.45, 36.45, 43.95, 52.25, 61.9, 70.1];
const PUSH = [true, true, true, true, true, true, true, true];   // every print opens up and comes alive
export const EVENTS = STARTS.map((t, i) => {
  const line = 'l' + (i + 1), d = VDUR[line];
  return { i, line, t0: t, t1: t + d, drop: t - 0.35, lift: t + d + 0.45, push: PUSH[i] };
});
export const PULL = 78.5;            // rise from the last print, pull back over the whole table
export const INDEX = 80.0;           // the tags fly into one index
export const OUTRO = { line: 'l9', t: 81.0 };
export const ENDCARD = 82.6;
export const DUR = 89.0;

// on-screen facts, one per print (from the presentation's slides 3–4)
export const PRINTS = [
  { year: '1839', title: 'La scoperta', sub: 'C. F. Schönbein · elettrolisi dell’acqua' },
  { year: '1857', title: 'Il primo generatore', sub: 'Werner von Siemens' },
  { year: '1870', title: 'Il sangue in provetta', sub: 'Dott. C. Lender' },
  { year: '1881', title: 'Disinfettante', sub: 'Dott. Kellogg' },
  { year: '1885', title: 'Il libro “Ozone”', sub: 'Florida Medical Association' },
  { year: '1886', title: 'Disinfezione e ferite', sub: 'Charles Kenworthy · Stati Uniti' },
  { year: '1900', title: 'Il brevetto', sub: 'Nikola Tesla' },
  { year: '1990–2000', title: 'Protocolli standardizzati', sub: 'efficacia e sicurezza' },
];

// subtitles: [line, fraction of the line where the cue starts, text]
export const SUBS = [
  ['l0', 0, 'L’ozono non nasce oggi.'], ['l0', 0.32, 'La sua storia in medicina comincia quasi due secoli fa.'],
  ['l1', 0, 'Nel 1839, il chimico tedesco Christian Friedrich Schönbein'], ['l1', 0.58, 'scopre l’ozono, studiando l’elettrolisi dell’acqua.'],
  ['l2', 0, 'Nel 1857, Werner von Siemens'], ['l2', 0.45, 'costruisce il primo generatore di ozono.'],
  ['l3', 0, 'Nel 1870, il dottor Lender è tra i primi medici'], ['l3', 0.52, 'a documentarne l’uso, per purificare il sangue in provetta.'],
  ['l4', 0, 'Nel 1881, il dottor Kellogg'], ['l4', 0.47, 'ne descrive l’impiego come disinfettante.'],
  ['l5', 0, 'Nel 1885, la Florida Medical Association'], ['l5', 0.6, 'pubblica un libro dal titolo: “Ozone”.'],
  ['l6', 0, 'Nel 1886, Charles Kenworthy ne racconta l’uso negli Stati Uniti,'], ['l6', 0.62, 'per disinfettare e trattare le ferite.'],
  ['l7', 0, 'Nel 1900, Nikola Tesla brevetta un generatore di ozono'], ['l7', 0.62, 'per uso medico e commerciale.'],
  ['l8', 0, 'Tra il 1990 e il 2000, i protocolli clinici vengono standardizzati:'], ['l8', 0.66, 'più efficacia, e più sicurezza.'],
  ['l9', 0, 'Da una scoperta di laboratorio,'], ['l9', 0.4, 'a una terapia con protocolli condivisi.'],
];
const LSTART = { l0: INTRO.t, l9: OUTRO.t };
EVENTS.forEach(e => { LSTART[e.line] = e.t0; });
export const VOICE = Object.keys(VDUR).map(id => ({ id, t: LSTART[id] }));
export const CUES = SUBS.map(([line, f, text], i) => {
  const t0 = LSTART[line] + f * VDUR[line];
  const nxt = SUBS[i + 1] && SUBS[i + 1][0] === line ? LSTART[line] + SUBS[i + 1][1] * VDUR[line] : LSTART[line] + VDUR[line] + 0.6;
  return { t0: +t0.toFixed(3), t1: +Math.max(nxt, t0 + 1.8).toFixed(3), text };
});
