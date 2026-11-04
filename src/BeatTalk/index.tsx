import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Icon, type IconName } from "./Icons";

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
type Tr = "slide" | "zoom"; // fast whip slide / zoom-blur, each with a whoosh
type Shot = { from: number; to: number; zoom: number; rot: number; tr?: Tr };
const SHOTS: Shot[] = [
  { from: 0.0, to: 1.38, zoom: 1.0, rot: 0 },
  { from: 1.38, to: 2.55, zoom: 1.35, rot: 0 },
  { from: 2.55, to: 4.7, zoom: 1.12, rot: -2, tr: "slide" },
  { from: 4.7, to: 6.78, zoom: 1.5, rot: 0 },
  { from: 6.78, to: 8.25, zoom: 1.0, rot: 0, tr: "zoom" },
  { from: 8.25, to: 10.15, zoom: 1.4, rot: 0 },
  { from: 10.15, to: 11.9, zoom: 1.12, rot: 2, tr: "slide" },
  { from: 11.9, to: 14.2, zoom: 1.55, rot: 0 },
  { from: 14.2, to: 16.5, zoom: 1.0, rot: 0, tr: "zoom" },
  { from: 16.5, to: 18.15, zoom: 1.4, rot: 0 },
  { from: 18.15, to: 19.5, zoom: 1.6, rot: 0, tr: "slide" },
  { from: 19.5, to: 22.4, zoom: 1.12, rot: -2 },
  { from: 22.4, to: 23.9, zoom: 1.0, rot: 0, tr: "zoom" },
  { from: 23.9, to: 25.45, zoom: 1.5, rot: 0 },
  { from: 25.45, to: 27.45, zoom: 1.12, rot: 0, tr: "slide" },
  { from: 27.45, to: 30.35, zoom: 1.4, rot: 2 },
  { from: 30.35, to: 31.5, zoom: 1.55, rot: 0 },
  { from: 31.5, to: 32.38, zoom: 1.0, rot: 0 },
  { from: 32.38, to: 33.25, zoom: 1.45, rot: 0 },
  { from: 33.25, to: 34.8, zoom: 1.12, rot: -2 },
  { from: 34.8, to: 35.55, zoom: 1.6, rot: 0 },
];
const END_FROM = 35.55;
export const TALK_DURATION = f30(END_FROM) + 46;

type Caption = {
  text: string;
  from: number;
  to: number;
  big?: boolean;
  icon?: IconName;
};
// From a Whisper transcript of Timeline.1.mov, cleaned up by hand.
const CAPTIONS: Caption[] = [
  {
    text: "CENA DI NATALE AZIENDALE?",
    from: 0.0,
    to: 1.38,
    big: true,
    icon: "tree",
  },
  { text: "siete in più di 40?", from: 1.42, to: 2.58, icon: "people" },
  { text: "AUGURI!", from: 2.62, to: 3.3, big: true },
  { text: "lo sai già", from: 3.34, to: 3.95 },
  { text: "come andrà a finire", from: 3.95, to: 4.72 },
  { text: "o state divisi", from: 4.75, to: 5.78 },
  { text: "o è già tutto pieno", from: 5.82, to: 6.86 },
  { text: "quindi", from: 6.89, to: 7.05 },
  {
    text: "DA BEAT CI STATE TUTTI",
    from: 7.05,
    to: 8.25,
    big: true,
    icon: "people",
  },
  { text: "possiamo venire incontro", from: 8.3, to: 9.1 },
  { text: "alle vostre esigenze", from: 9.1, to: 10.15 },
  { text: "possiamo partire", from: 10.18, to: 11.2 },
  { text: "da un aperitivo", from: 11.2, to: 11.9, icon: "glass" },
  { text: "fino a un buffet dinamico", from: 11.92, to: 13.24, icon: "plate" },
  { text: "a una cena servita", from: 13.24, to: 14.2, icon: "plate" },
  { text: "il menù è vario", from: 14.26, to: 15.05 },
  {
    text: "PERSONALIZZABILE",
    from: 15.1,
    to: 16.5,
    big: true,
    icon: "sliders",
  },
  { text: "inoltre dove lo trovi", from: 16.58, to: 17.45 },
  { text: "un ristorante", from: 17.45, to: 18.15 },
  { text: "con il", from: 18.2, to: 18.85 },
  { text: "PARCHEGGIO", from: 18.85, to: 19.5, big: true, icon: "parking" },
  { text: "e tutte le comodità", from: 19.52, to: 20.7 },
  { text: "che la nostra location", from: 20.7, to: 21.55 },
  { text: "può offrire", from: 21.55, to: 22.4 },
  { text: "insomma", from: 22.44, to: 23.1 },
  { text: "tanti vantaggi", from: 23.1, to: 23.9 },
  { text: "e non li ho neanche detti tutti", from: 23.92, to: 25.45 },
  { text: "per scoprirne di più", from: 25.5, to: 26.35 },
  {
    text: "LASCIACI I TUOI DATI",
    from: 26.38,
    to: 27.45,
    big: true,
    icon: "phone",
  },
  { text: "e sarai ricontattato", from: 27.5, to: 28.6 },
  { text: "per ricevere l'offerta perfetta", from: 28.62, to: 30.35 },
  { text: "per la tua azienda", from: 30.4, to: 31.5 },
  { text: "BEAT", from: 31.58, to: 32.38, big: true },
  { text: "puoi trovarci", from: 32.4, to: 33.25 },
  { text: "via Alcide", from: 33.26, to: 33.8 },
  { text: "De Gasperi 6", from: 33.8, to: 34.8 },
  { text: "BAGNO A RIPOLI", from: 34.82, to: 35.55, big: true, icon: "pin" },
];

const SL = 6; // slide length in frames (0.2 s)
const W = 1080;
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Horizontal motion blur strengths, picked by slide speed.
const MotionBlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    {[14, 32, 60, 90].map((d, i) => (
      <filter key={i} id={`mb${i}`} x="-20%" y="0" width="140%" height="100%">
        <feGaussianBlur stdDeviation={`${d} 0`} />
      </filter>
    ))}
  </svg>
);
const blurFor = (speed: number) => {
  if (speed < 0.08) return undefined;
  const i = speed < 0.2 ? 0 : speed < 0.35 ? 1 : speed < 0.5 ? 2 : 3;
  return `url(#mb${i})`;
};

// One framing. When the next shot slides in, this one keeps playing for SL
// frames and is pushed out; when this shot slides in, it pushes from `dir`.
const Framed: React.FC<{
  shot: Shot;
  slideIn: boolean;
  slideOut: boolean;
  dir: 1 | -1;
}> = ({ shot, slideIn, slideOut, dir }) => {
  const f = useCurrentFrame();
  const n = f30(shot.to) - f30(shot.from);
  const drift = interpolate(f, [0, n], [1, 1.035]); // slow push, like the reference
  let x = 0;
  let speed = 0;
  if (slideIn && f < SL) {
    x = dir * W * (1 - ease(f / SL));
    speed = Math.abs(ease((f + 1) / SL) - ease(f / SL));
  } else if (slideOut && f >= n) {
    const t = (f - n) / SL;
    x = -dir * W * ease(t);
    speed = Math.abs(ease(t + 1 / SL) - ease(t));
  }
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        transform: `translateX(${x}px)`,
        filter: blurFor(speed),
      }}
    >
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

// Zoom-blur punch around "zoom" cuts: scale + blur + brighten peaking on the cut.
const useZoomBoost = (cuts: number[]) => {
  const f = useCurrentFrame();
  return Math.max(
    0,
    ...cuts.map((c) =>
      interpolate(f - c, [-4, 0, 4], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
};

const YELLOW = "#F3EC9C";

const CaptionView: React.FC<{ c: Caption }> = ({ c }) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 4], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const draw = interpolate(f, [1, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (c.big) {
    return (
      <AbsoluteFill
        style={{
          alignItems: "center",
          top: c.icon ? 1030 : 1180,
          bottom: "auto",
        }}
      >
        {c.icon ? (
          <div style={{ transform: `scale(${pop})`, marginBottom: 18 }}>
            <Icon
              name={c.icon}
              size={130}
              color={YELLOW}
              progress={draw}
              stroke={3.6}
            />
          </div>
        ) : null}
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
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1240, bottom: "auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: mono,
          fontSize: 38,
          color: "white",
          background: "rgba(20,20,20,0.72)",
          borderRadius: 12,
          padding: "8px 22px",
          transform: `scale(${pop})`,
        }}
      >
        {c.icon ? (
          <Icon
            name={c.icon}
            size={44}
            color={YELLOW}
            progress={draw}
            stroke={4.5}
          />
        ) : null}
        {c.text}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const logo = interpolate(f, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s = interpolate(f, [2, 10], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
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
            transform: `scale(${s})`,
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- sound design (sfx from the Zymerex pack in public/beat/sfx) ---
type Cue = { src: string; at: number; vol: number }; // at = output frame of the transient
const PEAK = {
  whoosh: 0.21,
  "whoosh-long": 0.43,
  "riser-hit": 0.91,
  pop: 0,
  tick: 0,
  chime: 0,
};

const Sfx: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => {
      const from =
        c.at - Math.round(PEAK[c.src as keyof typeof PEAK] * TALK_FPS);
      return (
        <Sequence
          key={i}
          from={Math.max(0, from)}
          durationInFrames={TALK_FPS * 3}
        >
          <Audio src={staticFile(`beat/sfx/${c.src}.wav`)} volume={c.vol} />
        </Sequence>
      );
    })}
  </>
);

export const BeatTalk: React.FC = () => {
  const end = f30(END_FROM);
  const zoomCuts = [
    ...SHOTS.filter((s) => s.tr === "zoom").map((s) => f30(s.from)),
    end,
  ];
  const boost = useZoomBoost(zoomCuts);
  let slideN = 0;
  const dirs = SHOTS.map(
    (s) => (s.tr === "slide" ? (slideN++ % 2 ? -1 : 1) : 1) as 1 | -1,
  );
  const cues: Cue[] = [
    ...SHOTS.filter((s) => s.tr === "slide").map((s) => ({
      src: "whoosh",
      at: f30(s.from) + 2,
      vol: 0.55,
    })),
    ...SHOTS.filter((s) => s.tr === "zoom").map((s) => ({
      src: "whoosh-long",
      at: f30(s.from),
      vol: 0.45,
    })),
    ...CAPTIONS.map((c) => ({
      src: c.big ? "pop" : "tick",
      at: f30(c.from),
      vol: c.big ? 0.45 : 0.16,
    })),
    { src: "riser-hit", at: end, vol: 0.5 },
    { src: "chime", at: end + 4, vol: 0.35 },
  ];
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <MotionBlurDefs />
      <AbsoluteFill
        style={{
          transform: `scale(${1 + 0.2 * boost})`,
          filter:
            boost > 0.02
              ? `blur(${boost * 16}px) brightness(${1 + boost * 0.35})`
              : undefined,
        }}
      >
        {SHOTS.map((s, i) => {
          const next = SHOTS[i + 1];
          const slideOut = next?.tr === "slide";
          return (
            <Sequence
              key={i}
              from={f30(s.from)}
              durationInFrames={f30(s.to) - f30(s.from) + (slideOut ? SL : 0)}
            >
              <Framed
                shot={s}
                slideIn={s.tr === "slide"}
                slideOut={slideOut}
                dir={slideOut ? dirs[i + 1] : dirs[i]}
              />
            </Sequence>
          );
        })}
        <Sequence from={end}>
          <EndCard />
        </Sequence>
      </AbsoluteFill>
      {CAPTIONS.map((c, i) => (
        <Sequence
          key={i}
          from={f30(c.from)}
          durationInFrames={f30(c.to) - f30(c.from)}
        >
          <CaptionView c={c} />
        </Sequence>
      ))}
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
      <Sfx cues={cues} />
    </AbsoluteFill>
  );
};
