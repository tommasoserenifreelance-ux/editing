import React from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
// Font corsivo (Pinyon Script, OFL) incluso in public/fonts.
const scriptFont = "PinyonScript";
const fontHandle = delayRender("Carico il font corsivo");
new FontFace(scriptFont, `url(${staticFile("fonts/PinyonScript.woff2")}) format("woff2")`)
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

export const POSH_FPS = 30;
// Leggero slow motion su tutte le clip (video e passi).
const RATE = 0.85;
const SRC_FPS = 24;

// Secondi sorgente -> frame della composizione (rallentati).
const toComp = (srcSeconds: number) => Math.round((srcSeconds / RATE) * POSH_FPS);

// Spezzoni [inizio, fine) in frame sorgente (24fps). Montaggio a tagli netti.
type Seg = { src: string; inF: number; outF: number; rate?: number };
const segRate = (g: Seg) => g.rate ?? RATE;
const segLen = (g: Seg) => Math.round(((g.outF - g.inF) / SRC_FPS / segRate(g)) * POSH_FPS);

// posh1: 3 passi -> taglio -> alla porta e dentro senza tagli (lineare).
const A_SEGS: Seg[] = [
  { src: "posh1.mp4", inF: 0, outF: 50 },
  // porta "Members Club" -> dentro: senza tagli, accorciata in testa e in coda.
  { src: "posh1.mp4", inF: 178, outF: 255, rate: 1.15 },
];
// FLASHBACK: bar (clip nuova, bloccata), intera.
const B_SEG: Seg = { src: "posh3.mp4", inF: 0, outF: 37 };
// Biliardo, tagli a tempo con le battute del brano (una ogni ~1,036 s):
// insegna "Sala Biliardo" | lei tocca il tavolo | ha girato l'angolo |
// frontale alla camera (rallentata). Poi Daisy's, anch'essa su una battuta.
const C_SEGS: Seg[] = [
  { src: "posh4.mp4", inF: 0, outF: 84 },
  { src: "posh4.mp4", inF: 128, outF: 171 },
  { src: "posh4.mp4", inF: 205, outF: 247 },
  { src: "posh4.mp4", inF: 284, outF: 297, rate: 0.55 },
];
// Reveal Daisy's: parte mezzo secondo più avanti per cadere sulla battuta.
const D_SEG: Seg = { src: "posh2.mp4", inF: 13, outF: 161 };

const sum = (gs: Seg[]) => gs.reduce((t, g) => t + segLen(g), 0);
const A_LEN = sum(A_SEGS);
const B_LEN = segLen(B_SEG);
const C_LEN = sum(C_SEGS);
const D_LEN = segLen(D_SEG);

// Flashback: posh1 sfuma al nero, il bar entra dal nero, esce al nero, stacco.
const FADE = 6; // posh1 -> nero
const GAP_IN = 4; // nero prima del bar
const GAP_OUT = 3; // nero prima dello stacco sul biliardo
const BAR_IN = 8; // il bar emerge dal nero
const BAR_OUT = 3; // il bar va al nero
const C_IN = 8; // il biliardo emerge dal nero

// Finale: Daisy's arriva all'ultimo fotogramma e si ferma; l'immagine si sfoca
// leggermente, appare la data e poi il logo Posh. Restano entrambi.
const DATE_TEXT = "28.11.2026";
const BORDEAUX = "#7B1023"; // stesso colore del logo Posh
// Bordino chiaro sottile attorno a data e logo, per staccarli dallo sfondo.
const OUTLINE = "#FFF3EC";
const OUTLINE_FILTER = [
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2],
]
  .map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${OUTLINE})`)
  .join(" ");
const SHARP_HOLD = 30; // "Daisy's" ferma e nitida, ben leggibile
const BLUR_IN = 50; // poi si sfoca piano piano
const DATE_AT = 50;
const DATE_IN = 22;
const LOGO_AT = 80;
const LOGO_IN = 26;
const HOLD_LEN = 165;

const A_FROM = 0;
const B_FROM = A_FROM + A_LEN + GAP_IN;
const C_FROM = B_FROM + B_LEN + GAP_OUT;
const D_FROM = C_FROM + C_LEN;
const HOLD_FROM = D_FROM + D_LEN;
export const POSH_DURATION = HOLD_FROM + HOLD_LEN;

// Appare la scritta "Daisy's" (≈ 2.3 s sorgente nella clip nuova).
const REVEAL = D_FROM + toComp(2.3 - D_SEG.inF / SRC_FPS);

// Appoggi del tacco, in frame sorgente (24fps), rilevati sul girato.
// Si sentono solo quelli che cadono dentro gli spezzoni usati.
const STEPS_A = [9, 25, 41, 57, 73, 89, 104, 119, 133, 214, 231, 248, 265, 282];
const STEPS_C = [4, 20, 35, 51, 66, 82, 97, 113, 128, 144, 159, 175];
const STEPS_D = [11, 27, 41];

// Musica: base pre-mixata (public/posh/music_bed.wav) generata da
// scripts/posh_music_bed.sh con i tempi stampati da scripts/posh_timing.py:
// il drop del brano (2:28.32) cade sul reveal di Daisy's, passa-basso sul finale.

export const poshSchema = z.object({
  music: z.string(),
});

// ---------- look ----------

const Grain: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${frame}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 97}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ strength: number }> = ({ strength }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

// Teal nelle ombre, caldo nelle luci.
const Grade: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(180deg, rgba(20,60,70,0.35), rgba(120,60,20,0.25))",
      mixBlendMode: "soft-light",
    }}
  />
);

// Inquadratura ferma come da girato: nessuno zoom o movimento aggiunto.
const Clip: React.FC<{ src: string; inF?: number; rate?: number; filter?: string }> = ({
  src,
  inF = 0,
  rate = RATE,
  filter,
}) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`posh/v/${src}`)}
      trimBefore={Math.round((inF / SRC_FPS) * POSH_FPS)}
      playbackRate={rate}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: filter ?? "contrast(1.1) saturate(0.95) brightness(0.98)",
      }}
    />
  </AbsoluteFill>
);

// ---------- flashback ----------

const flashbackBlack = (frame: number) => {
  const bEnd = B_FROM + B_LEN;
  if (frame >= A_LEN - FADE && frame < B_FROM) {
    return interpolate(frame, [A_LEN - FADE, A_LEN], [0, 1], { extrapolateRight: "clamp" });
  }
  if (frame >= B_FROM && frame < B_FROM + BAR_IN) {
    return interpolate(frame, [B_FROM, B_FROM + BAR_IN], [1, 0]);
  }
  if (frame >= bEnd - BAR_OUT && frame < bEnd) {
    return interpolate(frame, [bEnd - BAR_OUT, bEnd], [0, 1]);
  }
  if (frame >= bEnd && frame < C_FROM) return 1;
  if (frame >= C_FROM && frame < C_FROM + C_IN) {
    return interpolate(frame, [C_FROM, C_FROM + C_IN], [1, 0]);
  }
  return 0;
};

// Sequenza di spezzoni a tagli netti, a partire da `from`.
const Segments: React.FC<{ from: number; segs: Seg[] }> = ({ from, segs }) => {
  let at = from;
  return (
    <>
      {segs.map((g) => {
        const start = at;
        at += segLen(g);
        return (
          <Sequence key={`${g.src}-${g.inF}`} from={start} durationInFrames={segLen(g)}>
            <Clip src={g.src} inF={g.inF} rate={segRate(g)} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------- audio ----------

// La musica c'è di sottofondo, appena percepibile, già dai primi passi;
// si alza quando lei entra nel locale (≈ frame sorgente 212 di posh1).
const DOOR_FROM = A_FROM + segLen(A_SEGS[0]);
const ENTER_AT =
  DOOR_FROM +
  Math.round(((212 - A_SEGS[1].inF) / SRC_FPS / segRate(A_SEGS[1])) * POSH_FPS);

const musicVolume = (fr: number) =>
  interpolate(
    fr,
    [
      0,
      DOOR_FROM,
      ENTER_AT - 6,
      ENTER_AT + 40,
      A_LEN - FADE,
      B_FROM,
      C_FROM - 4,
      C_FROM + 30,
      D_FROM,
      REVEAL,
      HOLD_FROM + LOGO_AT + LOGO_IN,
      POSH_DURATION,
    ],
    [0, 0.04, 0.08, 0.3, 0.4, 0.12, 0.12, 0.35, 0.75, 1, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// 14 passi veri estratti dal file dei tacchi, alternati in modo irregolare
// e con piccole differenze di volume, per un suono naturale.
const HEELS = 14;
const HEEL_GAIN = [1, 0.86, 0.95, 0.9, 1, 0.83, 0.97];

const Steps: React.FC<{ from: number; segs: Seg[]; steps: number[]; volume: number }> = ({
  from,
  segs,
  steps,
  volume,
}) => {
  const hits: number[] = [];
  let at = from;
  for (const g of segs) {
    for (const n of steps) {
      if (n >= g.inF && n < g.outF) {
        hits.push(at + Math.round(((n - g.inF) / SRC_FPS / segRate(g)) * POSH_FPS));
      }
    }
    at += segLen(g);
  }
  return (
    <>
      {hits.map((h, i) => (
        <Sequence key={h} from={h} durationInFrames={20}>
          <Audio
            src={staticFile(`posh/heel${String(((h * 7 + i * 3) % HEELS) + 1).padStart(2, "0")}.wav`)}
            volume={volume * HEEL_GAIN[(h + i) % HEEL_GAIN.length]}
          />
        </Sequence>
      ))}
    </>
  );
};

// ---------- composizione ----------

export const PoshReel: React.FC<z.infer<typeof poshSchema>> = ({ music }) => {
  const frame = useCurrentFrame();
  const fadeFromBlack = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  const appear = (at: number, len: number) =>
    interpolate(frame, [HOLD_FROM + at, HOLD_FROM + at + len], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const dateOpacity = appear(DATE_AT, DATE_IN);
  const logoOpacity = appear(LOGO_AT, LOGO_IN);
  const holdSoft = appear(SHARP_HOLD, BLUR_IN);
  // Passaggio biliardo -> Daisy's: rapido calo di luce, nessun frame tagliato.
  const dip = interpolate(
    frame,
    [D_FROM - 5, D_FROM, D_FROM + 6],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const black = Math.max(fadeFromBlack, flashbackBlack(frame), dip);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Segments from={A_FROM} segs={A_SEGS} />
      <Segments from={C_FROM} segs={C_SEGS} />
      <Segments from={D_FROM} segs={[D_SEG]} />
      {/* fermo immagine sull'ultimo fotogramma di Daisy's, leggermente sfocato */}
      <Sequence from={HOLD_FROM} durationInFrames={HOLD_LEN}>
        <AbsoluteFill
          style={{ filter: `blur(${holdSoft * 5}px) brightness(${1 + holdSoft * 0.06})` }}
        >
          <Freeze frame={0}>
            <Clip src={D_SEG.src} inF={D_SEG.outF - 1} />
          </Freeze>
        </AbsoluteFill>
      </Sequence>

      <Grade />
      <Vignette strength={0.55} />
      <Grain opacity={0.12} />

      <Segments from={B_FROM} segs={[B_SEG]} />

      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />

      {/* velo crema morbido dietro i titoli, per far leggere il bordeaux */}
      <AbsoluteFill
        style={{
          opacity: holdSoft,
          background:
            "radial-gradient(ellipse 62% 17% at 50% 17%, rgba(255,244,238,0.62), rgba(255,244,238,0.3) 55%, rgba(255,244,238,0) 100%)",
        }}
      />
      {/* titoli finali sul fermo immagine: logo Posh sopra, data sotto */}
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div style={{ position: "absolute", top: 90, opacity: logoOpacity }}>
          <Img
            src={staticFile("posh/logo_bordeaux.png")}
            style={{
              width: 560,
              filter: `${OUTLINE_FILTER} drop-shadow(0 0 14px rgba(255,236,236,0.55))`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 345,
            WebkitTextStroke: `2px ${OUTLINE}`,
            paintOrder: "stroke fill",
            textShadow: "0 0 16px rgba(255,236,236,0.7)",
            opacity: dateOpacity,
            fontFamily: scriptFont,
            color: BORDEAUX,
            fontSize: 116,
            letterSpacing: 2,
          }}
        >
          {DATE_TEXT}
        </div>
      </AbsoluteFill>

      {/* --- AUDIO --- */}
      <Steps from={A_FROM} segs={A_SEGS} steps={STEPS_A} volume={0.9} />
      <Steps from={C_FROM} segs={C_SEGS} steps={STEPS_C} volume={0.8} />
      <Steps from={D_FROM} segs={[D_SEG]} steps={STEPS_D} volume={0.9} />


      {music ? (
        <Audio
          src={staticFile(`posh/${music}`)}
          volume={musicVolume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
