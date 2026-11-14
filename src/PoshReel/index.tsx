import React from "react";
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
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
type Seg = { src: string; inF: number; outF: number };
const segLen = (g: Seg) => toComp((g.outF - g.inF) / SRC_FPS);

// posh1: 3 passi -> già alla porta -> già dentro.
const A_SEGS: Seg[] = [
  { src: "posh1.mp4", inF: 0, outF: 50 },
  { src: "posh1.mp4", inF: 120, outF: 205 },
  { src: "posh1.mp4", inF: 220, outF: 299 },
];
// FLASHBACK: bar (clip nuova, bloccata), intera.
const B_SEG: Seg = { src: "posh3.mp4", inF: 0, outF: 37 };
// Biliardo: lei che entra -> girato l'angolo, a metà tavolo
// -> in fondo alla sala davanti alla camera (palle in primo piano).
const C_SEGS: Seg[] = [
  { src: "posh4.mp4", inF: 0, outF: 50 },
  { src: "posh4.mp4", inF: 120, outF: 168 },
  { src: "posh4.mp4", inF: 226, outF: 298 },
];
// Reveal Daisy's: intera.
const D_SEG: Seg = { src: "posh2.mp4", inF: 0, outF: 161 };

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

// Finale: dissolvenza al nero, la data, poi il logo Posh.
const END_FADE = 18;
const DATE_TEXT = "28.11.2026";
const BORDEAUX = "#7B1023"; // stesso colore del logo Posh
const DATE_DELAY = 8;
const DATE_IN = 20;
const DATE_HOLD = 45;
const DATE_OUT = 15;
const DATE_LEN = DATE_DELAY + DATE_IN + DATE_HOLD + DATE_OUT;
const LOGO_DELAY = 8;
const LOGO_IN = 30;
const LOGO_HOLD = 75;
const LOGO_LEN = LOGO_DELAY + LOGO_IN + LOGO_HOLD;

const A_FROM = 0;
const B_FROM = A_FROM + A_LEN + GAP_IN;
const C_FROM = B_FROM + B_LEN + GAP_OUT;
const D_FROM = C_FROM + C_LEN;
const DATE_FROM = D_FROM + D_LEN;
const LOGO_FROM = DATE_FROM + DATE_LEN;
export const POSH_DURATION = LOGO_FROM + LOGO_LEN;

// Appare la scritta "Daisy's" (≈ 2.3 s sorgente nella clip nuova).
const REVEAL = D_FROM + toComp(2.3);

// Appoggi del tacco, in frame sorgente (24fps), rilevati sul girato.
// Si sentono solo quelli che cadono dentro gli spezzoni usati.
const STEPS_A = [9, 25, 41, 57, 73, 89, 104, 119, 133, 214, 231, 248, 265, 282];
const STEPS_C = [4, 20, 35, 51, 66, 82, 97, 113, 128, 144, 159, 175];
const STEPS_D = [11, 27, 41];

// Musica: base pre-mixata (public/posh/music_bed.wav) generata da
// scripts/posh_music_bed.sh con i tempi stampati da scripts/posh_timing.py:
// il drop del brano (2:28.2) cade sul reveal di Daisy's, passa-basso sul finale.

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
const Clip: React.FC<{ src: string; inF?: number; filter?: string }> = ({
  src,
  inF = 0,
  filter,
}) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`posh/v/${src}`)}
      trimBefore={Math.round((inF / SRC_FPS) * POSH_FPS)}
      playbackRate={RATE}
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
            <Clip src={g.src} inF={g.inF} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------- audio ----------

// Camminata e porta: solo tacchi. La musica parte quando lei è entrata e sale piano.
const INSIDE_FROM = A_FROM + segLen(A_SEGS[0]) + segLen(A_SEGS[1]);

const musicVolume = (fr: number) =>
  interpolate(
    fr,
    [
      0,
      INSIDE_FROM,
      A_LEN - FADE,
      B_FROM,
      C_FROM - 4,
      C_FROM + 30,
      D_FROM,
      REVEAL,
      LOGO_FROM + LOGO_DELAY + LOGO_IN,
      POSH_DURATION,
    ],
    [0, 0, 0.4, 0.12, 0.12, 0.35, 0.75, 1, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
      if (n >= g.inF && n < g.outF) hits.push(at + toComp((n - g.inF) / SRC_FPS));
    }
    at += segLen(g);
  }
  return (
    <>
      {hits.map((h, i) => (
        <Sequence key={h} from={h} durationInFrames={20}>
          <Audio
            src={staticFile(`posh/step${(i % 2) + 1}.wav`)}
            playbackRate={RATE}
            volume={volume * (i % 2 ? 0.85 : 1)}
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
  const fadeToBlack = interpolate(frame, [DATE_FROM - END_FADE, DATE_FROM], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dateOpacity = interpolate(
    frame,
    [
      DATE_FROM + DATE_DELAY,
      DATE_FROM + DATE_DELAY + DATE_IN,
      LOGO_FROM - DATE_OUT,
      LOGO_FROM,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const logoOpacity = interpolate(
    frame,
    [LOGO_FROM + LOGO_DELAY, LOGO_FROM + LOGO_DELAY + LOGO_IN],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Passaggio biliardo -> Daisy's: rapido calo di luce, nessun frame tagliato.
  const dip = interpolate(
    frame,
    [D_FROM - 5, D_FROM, D_FROM + 6],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const black = Math.max(fadeFromBlack, fadeToBlack, flashbackBlack(frame), dip);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Segments from={A_FROM} segs={A_SEGS} />
      <Segments from={C_FROM} segs={C_SEGS} />
      <Segments from={D_FROM} segs={[D_SEG]} />

      <Grade />
      <Vignette strength={0.55} />
      <Grain opacity={0.12} />

      <Segments from={B_FROM} segs={[B_SEG]} />

      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />

      {/* data */}
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", opacity: dateOpacity }}
      >
        <div
          style={{
            fontFamily: scriptFont,
            color: BORDEAUX,
            fontSize: 150,
            letterSpacing: 2,
          }}
        >
          {DATE_TEXT}
        </div>
      </AbsoluteFill>

      {/* logo finale */}
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", opacity: logoOpacity }}
      >
        <Img src={staticFile("posh/logo_bordeaux.png")} style={{ width: 720 }} />
      </AbsoluteFill>

      {/* --- AUDIO --- */}
      <Steps from={A_FROM} segs={A_SEGS} steps={STEPS_A} volume={0.9} />
      <Steps from={C_FROM} segs={C_SEGS} steps={STEPS_C} volume={0.8} />
      <Steps from={D_FROM} segs={[D_SEG]} steps={STEPS_D} volume={0.9} />

      {/* whoosh di entrata e uscita dal flashback */}
      <Sequence from={B_FROM - 30} durationInFrames={36}>
        <Audio src={staticFile("posh/flash_in.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={C_FROM - 6} durationInFrames={30}>
        <Audio src={staticFile("posh/flash_out.wav")} volume={0.32} />
      </Sequence>

      {music ? (
        <Audio
          src={staticFile(`posh/${music}`)}
          volume={musicVolume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
