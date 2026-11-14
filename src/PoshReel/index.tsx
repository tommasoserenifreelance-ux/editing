import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";

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
  B: { src: "posh3.mp4", dur: 3.0 }, // FLASHBACK: bar
  C: { src: "posh4.mp4", dur: 12.417 }, // sala biliardo (take nuova, più stabile)
  D: { src: "posh2.mp4", dur: 9.708 }, // reveal Daisy's (stabilizzata)
};

const A_LEN = toComp(CLIPS.A.dur);
const B_LEN = toComp(CLIPS.B.dur);
const C_LEN = toComp(CLIPS.C.dur);
const D_LEN = toComp(CLIPS.D.dur);

const A_FROM = 0;
const B_FROM = A_FROM + A_LEN;
const C_FROM = B_FROM + B_LEN;
const D_FROM = C_FROM + C_LEN;
export const POSH_DURATION = D_FROM + D_LEN;

// Appare la scritta "Daisy's" (≈ 5.6 s sorgente in posh2).
const REVEAL = D_FROM + toComp(5.6);

// Appoggi del tacco, in frame sorgente (24fps), rilevati sul girato.
// posh1: si ferma alla porta dopo l'ultimo passo.
const STEPS_A = [9, 25, 41, 57, 73, 89, 104, 119, 133];
// posh4 (take nuova): cammina fino a ~175, poi si ferma alla finestra.
const STEPS_C = [4, 20, 35, 51, 66, 82, 97, 113, 128, 144, 159, 175];
const STEPS_D = [2, 18, 31, 45, 58, 75, 90, 106, 120];

// Musica: il drop del brano (2:28.2) cade sul reveal di Daisy's.
const SONG_DROP = 148.2;

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
const Clip: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(`posh/v/${src}`)}
      playbackRate={RATE}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "contrast(1.1) saturate(0.95) brightness(0.98)",
      }}
    />
  </AbsoluteFill>
);

// ---------- flashback "vedo / non vedo" ----------

// Opacità del nero, un valore per frame: nero / colore / nero / colore veloce.
const FLICKER_IN = [1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0.85, 0, 0, 0, 0, 0.6, 0];
const FLICKER_OUT = [0, 0.6, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1];

const flickerAt = (frame: number) => {
  // Ingresso nel flashback (ultimi frame di posh1 + primi di posh3).
  const inStart = B_FROM - 4;
  if (frame >= inStart && frame < inStart + FLICKER_IN.length) {
    return FLICKER_IN[frame - inStart];
  }
  // Uscita: finisce sul nero e riparte posh4 dal nero.
  const outStart = C_FROM - FLICKER_OUT.length;
  if (frame >= outStart && frame < C_FROM) {
    return FLICKER_OUT[frame - outStart];
  }
  if (frame >= C_FROM && frame < C_FROM + 6) {
    return interpolate(frame, [C_FROM, C_FROM + 6], [1, 0]);
  }
  return 0;
};

// ---------- audio ----------

const musicVolume = (fr: number) =>
  interpolate(
    fr,
    [
      0,
      30,
      B_FROM - 15,
      B_FROM + 6,
      C_FROM - 8,
      C_FROM + 30,
      D_FROM,
      REVEAL,
      POSH_DURATION - 45,
      POSH_DURATION,
    ],
    [0, 0.14, 0.4, 0.1, 0.1, 0.35, 0.75, 1, 1, 0],
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
  const fadeToBlack = interpolate(frame, [POSH_DURATION - 18, POSH_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
  });
  // Passaggio biliardo -> Daisy's: rapido calo di luce, nessun frame tagliato.
  const dip = interpolate(
    frame,
    [D_FROM - 5, D_FROM, D_FROM + 6],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const black = Math.max(fadeFromBlack, fadeToBlack, flickerAt(frame), dip);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={A_FROM} durationInFrames={A_LEN}>
        <Clip src={CLIPS.A.src} />
      </Sequence>
      <Sequence from={B_FROM} durationInFrames={B_LEN}>
        <Clip src={CLIPS.B.src} />
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

      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />

      {/* --- AUDIO --- */}
      <Steps clipFrom={A_FROM} steps={STEPS_A} volume={0.9} />
      <Steps clipFrom={C_FROM} steps={STEPS_C} volume={0.8} />
      <Steps clipFrom={D_FROM} steps={STEPS_D} volume={0.9} />

      <Sequence from={B_FROM - 30} durationInFrames={36}>
        <Audio src={staticFile("posh/flash_in.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={C_FROM - 6} durationInFrames={30}>
        <Audio src={staticFile("posh/flash_out.wav")} volume={0.3} />
      </Sequence>

      {music ? (
        <Audio
          src={staticFile(`posh/${music}`)}
          trimBefore={Math.round((SONG_DROP - REVEAL / POSH_FPS) * POSH_FPS)}
          volume={musicVolume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
