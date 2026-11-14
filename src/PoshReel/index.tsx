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
// Leggero slow motion su tutte le clip.
const RATE = 0.85;

const f = (s: number) => Math.round(s * POSH_FPS);
// Durata a schermo (in frame) di un tratto sorgente rallentato.
const len = (srcStart: number, srcEnd: number) =>
  Math.round(((srcEnd - srcStart) / RATE) * POSH_FPS);

// [file, inizio sorgente (s), fine sorgente (s)]
const A = { src: "posh1.mp4", in: 1.0, out: 9.0 }; // corridoio + porta
const B = { src: "posh3.mp4", in: 0.0, out: 3.0 }; // FLASHBACK: bar
const C = { src: "posh4.mp4", in: 4.5, out: 12.5 }; // sala biliardo
const D = { src: "posh2.mp4", in: 1.5, out: 9.7 }; // reveal Daisy's

const XFADE = 12; // dissolvenza biliardo -> Daisy's

const A_LEN = len(A.in, A.out);
const B_LEN = len(B.in, B.out);
const C_LEN = len(C.in, C.out);
const D_LEN = len(D.in, D.out);

const A_FROM = 0;
const B_FROM = A_FROM + A_LEN;
const C_FROM = B_FROM + B_LEN;
const D_FROM = C_FROM + C_LEN - XFADE;
export const POSH_DURATION = D_FROM + D_LEN;

// Momento in cui appare la scritta "Daisy's" (≈ 5.6 s sorgente in posh2).
const REVEAL = D_FROM + Math.round(((5.6 - D.in) / RATE) * POSH_FPS);

export const poshSchema = z.object({
  // File in public/posh/ (es. "music.mp3"); vuoto = nessuna musica.
  music: z.string(),
  // Da che secondo della canzone partire.
  musicStart: z.number(),
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
  <>
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(20,60,70,0.35), rgba(120,60,20,0.25))",
        mixBlendMode: "soft-light",
      }}
    />
  </>
);

const Shot: React.FC<{
  src: string;
  srcIn: number;
  duration: number;
  zoomFrom?: number;
  zoomTo?: number;
  filter?: string;
}> = ({ src, srcIn, duration, zoomFrom = 1.0, zoomTo = 1.06, filter }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [zoomFrom, zoomTo]);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <OffthreadVideo
        src={staticFile(`posh/v/${src}`)}
        trimBefore={f(srcIn)}
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
};

// ---------- flashback ----------

const Flashback: React.FC = () => {
  const frame = useCurrentFrame();
  const flashIn = interpolate(frame, [0, 7], [1, 0], { extrapolateRight: "clamp" });
  const flashOut = interpolate(frame, [B_LEN - 6, B_LEN], [0, 1], {
    extrapolateLeft: "clamp",
  });
  // Leggero tremolio da pellicola.
  const flicker = 1 + Math.sin(frame * 2.3) * 0.03 + Math.sin(frame * 7.1) * 0.02;
  const leakX = interpolate(frame, [0, B_LEN], [-20, 120]);
  const filter = `sepia(0.55) saturate(0.7) contrast(1.25) brightness(${1.05 * flicker}) blur(0.5px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Shot src={B.src} srcIn={B.in} duration={B_LEN} zoomFrom={1.18} zoomTo={1.04} filter={filter} />
      {/* doppia esposizione "ricordo" */}
      <AbsoluteFill style={{ opacity: 0.28, mixBlendMode: "screen" }}>
        <Shot src={B.src} srcIn={B.in + 0.25} duration={B_LEN} zoomFrom={1.3} zoomTo={1.12} filter={filter} />
      </AbsoluteFill>
      {/* bordi sfocati */}
      <AbsoluteFill
        style={{
          backdropFilter: "blur(14px)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 55%, black 100%)",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 55%, black 100%)",
        }}
      />
      {/* light leak */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${leakX}% 30%, rgba(255,140,60,0.55), rgba(255,60,90,0.15) 35%, transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />
      <Vignette strength={0.85} />
      <Grain opacity={0.35} />
      <AbsoluteFill style={{ backgroundColor: "white", opacity: Math.max(flashIn, flashOut) }} />
    </AbsoluteFill>
  );
};

// ---------- audio ----------

// Volume musica: basso -> sale -> giù nel flashback -> risale -> top su Daisy's.
const musicVolume = (fr: number) =>
  interpolate(
    fr,
    [0, 20, B_FROM - 10, B_FROM + 8, C_FROM - 6, C_FROM + 20, D_FROM, REVEAL - 25, REVEAL, POSH_DURATION - 30, POSH_DURATION],
    [0, 0.12, 0.42, 0.12, 0.12, 0.3, 0.55, 0.75, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const Heels: React.FC<{ from: number; duration: number; fadeOutAt: number; volume: number }> = ({
  from,
  duration,
  fadeOutAt,
  volume,
}) => (
  <Sequence from={from} durationInFrames={duration}>
    <Audio
      src={staticFile("posh/freeeverythingxx-wallking-in-heels-on-concrete-268481.mp3")}
      loop
      volume={(fr) =>
        volume *
        interpolate(fr, [0, 6, fadeOutAt - 15, fadeOutAt], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </Sequence>
);

// ---------- composizione ----------

export const PoshReel: React.FC<z.infer<typeof poshSchema>> = ({ music, musicStart }) => {
  const frame = useCurrentFrame();
  const fadeFromBlack = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  const fadeToBlack = interpolate(frame, [POSH_DURATION - 14, POSH_DURATION], [0, 1], {
    extrapolateLeft: "clamp",
  });
  const dOpacity = interpolate(frame, [D_FROM, D_FROM + XFADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Dal bianco del flashback alla sala biliardo.
  const whiteIntoC = interpolate(frame, [C_FROM, C_FROM + 8], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={A_FROM} durationInFrames={A_LEN}>
        <Shot src={A.src} srcIn={A.in} duration={A_LEN} />
      </Sequence>
      <Sequence from={C_FROM} durationInFrames={C_LEN}>
        <Shot src={C.src} srcIn={C.in} duration={C_LEN} zoomFrom={1.04} zoomTo={1.0} />
      </Sequence>
      <Sequence from={D_FROM} durationInFrames={D_LEN}>
        <AbsoluteFill style={{ opacity: dOpacity }}>
          <Shot src={D.src} srcIn={D.in} duration={D_LEN} zoomFrom={1.0} zoomTo={1.08} />
        </AbsoluteFill>
      </Sequence>

      <Grade />
      <Vignette strength={0.55} />
      <Grain opacity={0.12} />

      <Sequence from={B_FROM} durationInFrames={B_LEN}>
        <Flashback />
      </Sequence>

      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: frame >= C_FROM && frame < C_FROM + 8 ? whiteIntoC : 0,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "black", opacity: Math.max(fadeFromBlack, fadeToBlack) }} />

      {/* --- AUDIO --- */}
      {/* tacchi: corridoio, biliardo (si ferma alla finestra), Daisy's (si ferma davanti al palco) */}
      <Heels from={A_FROM} duration={A_LEN} fadeOutAt={A_LEN} volume={0.9} />
      <Heels from={C_FROM} duration={C_LEN} fadeOutAt={len(C.in, 10.5)} volume={0.85} />
      <Heels from={D_FROM} duration={D_LEN} fadeOutAt={len(D.in, 5.8)} volume={0.9} />

      <Sequence from={B_FROM - 30} durationInFrames={40}>
        <Audio src={staticFile("posh/flash_in.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={C_FROM - 4} durationInFrames={30}>
        <Audio src={staticFile("posh/flash_out.wav")} volume={0.5} />
      </Sequence>

      {music ? (
        <Audio
          src={staticFile(`posh/${music}`)}
          trimBefore={f(musicStart)}
          volume={musicVolume}
        />
      ) : null}
    </AbsoluteFill>
  );
};
