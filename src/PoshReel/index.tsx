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
const srcFrame = (n: number) => n / SRC_FPS; // frame sorgente (24fps) -> secondi

// Clip intere, nessun taglio.
const CLIPS = {
  A: { src: "posh1.mp4", dur: 12.458 }, // corridoio + porta
  B: { src: "posh3.mp4", dur: 1.542 }, // FLASHBACK: bar (clip nuova, bloccata)
  C: { src: "posh4.mp4", dur: 12.417 }, // sala biliardo (take nuova, più stabile)
  D: { src: "posh2.mp4", dur: 6.708 }, // reveal Daisy's (clip nuova, già stabile)
};

const A_LEN = toComp(CLIPS.A.dur);
const B_LEN = toComp(CLIPS.B.dur);
const C_LEN = toComp(CLIPS.C.dur);
const D_LEN = toComp(CLIPS.D.dur);

// Flashback tranquillo: dissolvenza al nero, appare il bar, di nuovo nero, stacco.
const FADE = 6; // durata delle dissolvenze del flashback
const GAP_IN = 4; // nero prima del bar
const GAP_OUT = 3; // nero prima dello stacco sul biliardo

// Finale: dissolvenza al nero e poi appare il logo Posh.
const END_FADE = 18;
// Dopo il nero: la data, poi il logo.
const DATE_TEXT = "28.11.2026";
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
// posh1: si ferma alla porta, poi riparte dopo averla attraversata.
const STEPS_A = [9, 25, 41, 57, 73, 89, 104, 119, 133, 214, 231, 248, 265, 282];
// posh4 (take nuova): cammina fino a ~175, poi si ferma alla finestra.
const STEPS_C = [4, 20, 35, 51, 66, 82, 97, 113, 128, 144, 159, 175];
// posh2 (clip nuova): ultimi passi prima di fermarsi davanti al palco.
const STEPS_D = [11, 27, 41];

// Musica: base pre-mixata (public/posh/music_bed.wav) generata da
// scripts/posh_music_bed.sh: parte da 1:54.2 del brano così il drop (2:28.2)
// cade sul reveal di Daisy's, e chiude con un passa-basso sul logo.

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
const Clip: React.FC<{ src: string; filter?: string }> = ({ src, filter }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`posh/v/${src}`)}
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

// posh1 sfuma al nero, poi il bar entra con un flash bianco; alla fine del bar
// un altro flash bianco e si riparte sul biliardo dal bianco.
const flashbackBlack = (frame: number) => {
  if (frame >= A_LEN - FADE && frame < B_FROM) {
    return interpolate(frame, [A_LEN - FADE, A_LEN], [0, 1], { extrapolateRight: "clamp" });
  }
  return 0;
};

const FLASH_IN = 8; // il bianco svanisce in 8 frame
const FLASH_UP = 3; // il bianco sale in 3 frame
const flashWhite = (frame: number) => {
  const bEnd = B_FROM + B_LEN;
  if (frame >= B_FROM && frame < B_FROM + FLASH_IN) {
    return interpolate(frame, [B_FROM, B_FROM + FLASH_IN], [1, 0]);
  }
  if (frame >= bEnd - FLASH_UP && frame < bEnd) {
    return interpolate(frame, [bEnd - FLASH_UP, bEnd], [0, 1]);
  }
  if (frame >= bEnd && frame < C_FROM) return 1;
  if (frame >= C_FROM && frame < C_FROM + FLASH_IN) {
    return interpolate(frame, [C_FROM, C_FROM + FLASH_IN], [1, 0]);
  }
  return 0;
};

// Il bar resta com'è: colori normali, inquadratura ferma, nessuno sfarfallio.
const Flashback: React.FC = () => <Clip src={CLIPS.B.src} />;

// ---------- audio ----------

const musicVolume = (fr: number) =>
  interpolate(
    fr,
    [
      0,
      30,
      A_LEN - FADE,
      B_FROM,
      C_FROM - 4,
      C_FROM + 30,
      D_FROM,
      REVEAL,
      LOGO_FROM + LOGO_DELAY + LOGO_IN,
      POSH_DURATION,
    ],
    [0, 0.14, 0.4, 0.12, 0.12, 0.35, 0.75, 1, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const Steps: React.FC<{ clipFrom: number; steps: number[]; volume: number }> = ({
  clipFrom,
  steps,
  volume,
}) => (
  <>
    {steps.map((n, i) => (
      <Sequence key={n} from={clipFrom + toComp(srcFrame(n))} durationInFrames={20}>
        <Audio
          src={staticFile(`posh/step${(i % 2) + 1}.wav`)}
          playbackRate={RATE}
          volume={volume * (i % 2 ? 0.85 : 1)}
        />
      </Sequence>
    ))}
  </>
);

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
      <Sequence from={A_FROM} durationInFrames={A_LEN}>
        <Clip src={CLIPS.A.src} />
      </Sequence>
      <Sequence from={C_FROM} durationInFrames={C_LEN}>
        <Clip src={CLIPS.C.src} />
      </Sequence>
      <Sequence from={D_FROM} durationInFrames={D_LEN}>
        <Clip src={CLIPS.D.src} />
      </Sequence>

      <Grade />
      <Vignette strength={0.55} />
      <Grain opacity={0.12} />

      <Sequence from={B_FROM} durationInFrames={B_LEN}>
        <Flashback />
      </Sequence>

      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flashWhite(frame) }} />

      {/* data */}
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", opacity: dateOpacity }}
      >
        <div
          style={{
            fontFamily: scriptFont,
            color: "white",
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
        <Img src={staticFile("posh/logo.png")} style={{ width: 720 }} />
      </AbsoluteFill>

      {/* --- AUDIO --- */}
      <Steps clipFrom={A_FROM} steps={STEPS_A} volume={0.9} />
      <Steps clipFrom={C_FROM} steps={STEPS_C} volume={0.8} />
      <Steps clipFrom={D_FROM} steps={STEPS_D} volume={0.9} />

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
