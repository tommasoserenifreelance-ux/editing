import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Talking-head reel modelled on the "parlato" reference: one continuous take
// cut into punch-in / punch-out framings on the phrases, a different
// transition on every cut (mirror, light leak, glitch, white flash), small
// boxed captions and big keyword cards, logo at the end. Source:
// public/beat/talk/take2.mp4 = C9993 from 12.5 s (second take), graded.
export const TALK_FPS = 30;

const mono = "Space Mono";
const handle = delayRender("Loading Space Mono");
new FontFace(
  mono,
  `url(${staticFile("fonts/space-mono-latin-400-normal.woff2")})`,
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

const SRC = staticFile("beat/talk/timeline.mp4"); // Timeline.1.mov, graded
const LAST = staticFile("beat/talk/timeline_last.png"); // its last frame
const T0 = 0;
const f30 = (sec: number) => Math.round((sec - T0) * TALK_FPS);

// The full 35.6 s talk, cut on the phrases with punch-in / punch-out
// framings (face at ~45% x, 42% y). Most cuts are hard, like the reference;
// `tr` adds a transition on the cut INTO that shot.
type Tr = "mirror" | "leak" | "glitch" | "flash";
type Shot = { from: number; to: number; zoom: number; rot: number; tr?: Tr };
const SHOTS: Shot[] = [
  { from: 0.0, to: 1.38, zoom: 1.0, rot: 0 },
  { from: 1.38, to: 2.55, zoom: 1.35, rot: 0 },
  { from: 2.55, to: 4.7, zoom: 1.12, rot: -2, tr: "leak" },
  { from: 4.7, to: 6.78, zoom: 1.5, rot: 0 },
  { from: 6.78, to: 8.25, zoom: 1.0, rot: 0, tr: "mirror" },
  { from: 8.25, to: 10.15, zoom: 1.4, rot: 0 },
  { from: 10.15, to: 11.9, zoom: 1.12, rot: 2, tr: "glitch" },
  { from: 11.9, to: 14.2, zoom: 1.55, rot: 0 },
  { from: 14.2, to: 16.5, zoom: 1.0, rot: 0, tr: "flash" },
  { from: 16.5, to: 18.15, zoom: 1.4, rot: 0 },
  { from: 18.15, to: 19.5, zoom: 1.6, rot: 0, tr: "leak" },
  { from: 19.5, to: 22.4, zoom: 1.12, rot: -2 },
  { from: 22.4, to: 23.9, zoom: 1.0, rot: 0, tr: "mirror" },
  { from: 23.9, to: 25.45, zoom: 1.5, rot: 0 },
  { from: 25.45, to: 27.45, zoom: 1.12, rot: 0, tr: "glitch" },
  { from: 27.45, to: 30.35, zoom: 1.4, rot: 2 },
  { from: 30.35, to: 31.5, zoom: 1.55, rot: 0 },
  { from: 31.5, to: 32.38, zoom: 1.0, rot: 0, tr: "flash" },
  { from: 32.38, to: 33.25, zoom: 1.45, rot: 0 },
  { from: 33.25, to: 34.8, zoom: 1.12, rot: -2, tr: "leak" },
  { from: 34.8, to: 35.55, zoom: 1.6, rot: 0 },
];
const END_FROM = 35.55;
export const TALK_DURATION = f30(END_FROM) + 46;

type Caption = { text: string; from: number; to: number; big?: boolean };
// From a Whisper transcript of Timeline.1.mov, cleaned up by hand.
const CAPTIONS: Caption[] = [
  { text: "CENA DI NATALE AZIENDALE?", from: 0.0, to: 1.38, big: true },
  { text: "siete in più di 40?", from: 1.38, to: 2.55 },
  { text: "allora sai già", from: 2.55, to: 3.66 },
  { text: "come andrà a finire", from: 3.66, to: 4.7 },
  { text: "o state divisi", from: 4.7, to: 5.7 },
  { text: "o è già tutto pieno", from: 5.7, to: 6.78 },
  { text: "quindi", from: 6.8, to: 7.05 },
  { text: "DA BEAT CI STATE TUTTI", from: 7.05, to: 8.25, big: true },
  { text: "possiamo venire incontro", from: 8.3, to: 9.1 },
  { text: "alle vostre esigenze", from: 9.1, to: 10.15 },
  { text: "possiamo partire", from: 10.18, to: 11.2 },
  { text: "da un aperitivo", from: 11.2, to: 11.9 },
  { text: "fino a un buffet dinamico", from: 11.92, to: 13.24 },
  { text: "a una cena servita", from: 13.24, to: 14.2 },
  { text: "il menù è vario", from: 14.26, to: 15.05 },
  { text: "PERSONALIZZABILE", from: 15.1, to: 16.5, big: true },
  { text: "inoltre dove lo trovi", from: 16.58, to: 17.45 },
  { text: "un ristorante", from: 17.45, to: 18.15 },
  { text: "con il", from: 18.2, to: 18.85 },
  { text: "PARCHEGGIO", from: 18.85, to: 19.5, big: true },
  { text: "e tutte le comodità", from: 19.52, to: 20.7 },
  { text: "che la nostra location", from: 20.7, to: 21.55 },
  { text: "può offrire", from: 21.55, to: 22.4 },
  { text: "insomma", from: 22.44, to: 23.1 },
  { text: "tanti vantaggi", from: 23.1, to: 23.9 },
  { text: "e non li ho neanche detti tutti", from: 23.92, to: 25.45 },
  { text: "per scoprirne di più", from: 25.5, to: 26.35 },
  { text: "LASCIACI I TUOI DATI", from: 26.38, to: 27.45, big: true },
  { text: "e sarai ricontattato", from: 27.5, to: 28.6 },
  { text: "per ricevere l'offerta perfetta", from: 28.62, to: 30.35 },
  { text: "per la tua azienda", from: 30.4, to: 31.5 },
  { text: "BEAT", from: 31.58, to: 32.38, big: true },
  { text: "puoi trovarci", from: 32.4, to: 33.25 },
  { text: "via Alcide", from: 33.26, to: 33.8 },
  { text: "De Gasperi 6", from: 33.8, to: 34.8 },
  { text: "BAGNO A RIPOLI", from: 34.82, to: 35.55, big: true },
];

const Framed: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const n = f30(shot.to) - f30(shot.from);
  // slow push inside each framing, like the reference
  const drift = interpolate(f, [0, n], [1, 1.035]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={SRC}
        startFrom={Math.round(shot.from * TALK_FPS)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "45% 42%",
          transform: `scale(${shot.zoom * drift * (shot.rot ? 1.06 : 1)}) rotate(${shot.rot}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

// --- transitions, each centred on a cut frame ---

const Mirror: React.FC<{ at: number; t: number }> = ({ at, t }) => {
  const f = useCurrentFrame() - at;
  if (f < -2 || f > 2) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {[0, 1].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            width: 540,
            height: 1920,
            left: side * 540,
            overflow: "hidden",
          }}
        >
          <OffthreadVideo
            src={SRC}
            startFrom={Math.max(0, Math.round((t + f / TALK_FPS) * TALK_FPS))}
            muted
            style={{
              width: 1080,
              height: 1920,
              objectFit: "cover",
              transform: side ? "scaleX(-1)" : undefined,
              marginLeft: side ? -540 : 0,
            }}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};

const LightLeak: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const o = interpolate(f, [-4, 0, 2, 6], [0, 0.9, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o === 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 15% 30%, #fff6d0 0%, #ffc04a 30%, #ff7a1a 60%, rgba(255,80,0,0) 85%)",
        mixBlendMode: "screen",
        opacity: o,
      }}
    />
  );
};

const Glitch: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < -2 || f > 1) return null;
  const bands = Array.from({ length: 14 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "#d0200f",
          mixBlendMode: "multiply",
          opacity: 0.85,
        }}
      />
      {bands.map((i) => {
        const r = random(`g${f}${i}`);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: (i * 1920) / 14,
              height: 1920 / 14 - 6,
              transform: `translateX(${(r - 0.5) * 160}px)`,
              background:
                r > 0.6
                  ? "rgba(255,255,255,0.18)"
                  : r > 0.3
                    ? "rgba(0,0,0,0.35)"
                    : "transparent",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const WhiteFlash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const o = interpolate(f, [-3, 0, 3, 8], [0, 1, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o === 0) return null;
  return <AbsoluteFill style={{ background: "#fffbea", opacity: o }} />;
};

// --- captions ---

const CaptionView: React.FC<{ c: Caption }> = ({ c }) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 3], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", top: c.big ? 1180 : 1240, bottom: "auto" }}
    >
      {c.big ? (
        <div
          style={{
            fontFamily: mono,
            fontSize: Math.min(96, 940 / (c.text.length * 0.66)),
            letterSpacing: 2,
            color: "white",
            transform: `scale(${pop})`,
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
            whiteSpace: "nowrap",
          }}
        >
          {c.text}
        </div>
      ) : (
        <div
          style={{
            fontFamily: mono,
            fontSize: 38,
            color: "white",
            background: "rgba(20,20,20,0.72)",
            borderRadius: 12,
            padding: "8px 22px",
            transform: `scale(${pop})`,
          }}
        >
          {c.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const logo = interpolate(f, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Img
        src={LAST}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(${8 * k}px) brightness(${1 - 0.25 * k})`,
          transform: `scale(${1.04 + 0.04 * k})`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: logo,
        }}
      >
        <Img
          src={staticFile("beat/logo-bianco.png")}
          style={{
            width: 360,
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BeatTalk: React.FC = () => {
  const end = f30(END_FROM);
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence
          key={i}
          from={f30(s.from)}
          durationInFrames={f30(s.to) - f30(s.from)}
        >
          <Framed shot={s} />
        </Sequence>
      ))}
      <Sequence from={end}>
        <EndCard />
      </Sequence>
      {CAPTIONS.map((c, i) => (
        <Sequence
          key={i}
          from={f30(c.from)}
          durationInFrames={f30(c.to) - f30(c.from)}
        >
          <CaptionView c={c} />
        </Sequence>
      ))}
      {SHOTS.map((s) => {
        const at = f30(s.from);
        if (s.tr === "mirror") return <Mirror key={at} at={at} t={s.from} />;
        if (s.tr === "leak") return <LightLeak key={at} at={at} />;
        if (s.tr === "glitch") return <Glitch key={at} at={at} />;
        if (s.tr === "flash") return <WhiteFlash key={at} at={at} />;
        return null;
      })}
      <WhiteFlash at={end} />
      <Audio
        src={SRC}
        startFrom={Math.round(T0 * TALK_FPS)}
        // whole take; gentle fade under the logo
        volume={(f) =>
          interpolate(f, [end + 20, end + 44], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
