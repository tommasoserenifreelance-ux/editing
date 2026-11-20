import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// "Come vivo la perimenopausa al meglio… in 3 semplici mosse" (ironic list).
// Text style from the reference reel: hand-written pastel caps, a fixed hook
// at the top and "* WORD *" pop-ups that appear with what she says, plus a
// few torn-paper stickers with hand-drawn doodles (not on every line). Everything sits above her head or
// on her sweater, never on her face. No subtitles.
// Source: GitHub release (33DC2C2F...MP4) → public/hook/elena.mp4.

export const PERI_FPS = 30;
// Fluffed words cut out, keeping the correct take (source seconds):
// the first "prendi il magnesio," the fluffed first "il grasso" and "evita".
const CUTS: [number, number][] = [
  [26.09, 26.73],
  [35.77, 37.17], // "monitora il grasso… ehh… il grasso addominale": keep the retake
  [44.42, 44.94], // fluffed first "evita"
];
const SOURCE_END = 63.6;
const KEEP: [number, number][] = CUTS.reduce<[number, number][]>(
  (acc, [a, b]) => {
    const last = acc[acc.length - 1];
    acc[acc.length - 1] = [last[0], a];
    acc.push([b, SOURCE_END]);
    return acc;
  },
  [[0, SOURCE_END]],
);
// Zoom per kept segment: a slight punch-in masks the jump cut.
const PUNCH = [1, 1, 1.08, 1];
// Output-timeline seconds for a source time.
const at = (t: number) =>
  t - CUTS.filter(([, b]) => b <= t).reduce((sum, [a, b]) => sum + b - a, 0);
export const PERI_DURATION = Math.round(at(SOURCE_END) * 30);
const s = (seconds: number) => Math.round(seconds * PERI_FPS);

const HAND = "Caveat Brush";
const handle = delayRender("Loading hand-written font");
new FontFace(
  HAND,
  `url(${staticFile("fonts/caveat-brush-latin-400-normal.woff2")})`,
)
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(handle);
  });

const PINK = "#F27FB2";
const LILAC = "#D9A8F0";
const BLUE = "#4FB3E6";

const hand = (color: string, size: number): React.CSSProperties => ({
  fontFamily: HAND,
  fontSize: size,
  color,
  textTransform: "uppercase",
  letterSpacing: 1,
  lineHeight: 1.05,
  textAlign: "center",
  WebkitTextStroke: "8px white",
  paintOrder: "stroke fill",
  filter: "drop-shadow(0 4px 10px rgba(120,40,80,0.35))",
});

// Pop-ups, in source seconds. y is the vertical centre in px. Lines with a
// doodle become a torn-paper sticker; the others are plain "* WORD *" text,
// as in the reference.
type DoodleName =
  | "alarm"
  | "phone"
  | "sun"
  | "cup"
  | "sparkle"
  | "drop"
  | "pill"
  | "dumbbell"
  | "heart"
  | "moon"
  | "flask"
  | "plate"
  | "chip"
  | "leaf";

const POPS: {
  from: number;
  to: number;
  text: string;
  color: string;
  y: number;
  doodle?: DoodleName;
  tilt?: number;
  sfx?: string; // comic sound for the funny lines (default: soft pop)
}[] = [
  { from: 5.85, to: 7.4, text: "3 semplici mosse", color: BLUE, y: 1380 },
  {
    from: 7.53,
    to: 9.5,
    text: "sveglia alle 6",
    color: PINK,
    y: 1330,
    doodle: "alarm",
    tilt: -5,
  },
  {
    from: 9.63,
    to: 11.6,
    text: "niente telefono",
    sfx: "soft_bloop",
    color: BLUE,
    y: 1460,
  },
  {
    from: 12.19,
    to: 13.15,
    text: "sole all'alba",
    color: PINK,
    y: 1340,
    doodle: "sun",
    tilt: 4,
  },
  {
    from: 13.19,
    to: 14.6,
    text: "tisana tiepida",
    color: BLUE,
    y: 1460,
    doodle: "cup",
    tilt: -3,
  },
  { from: 18.23, to: 19.95, text: "ringrazia", color: PINK, y: 1380 },
  {
    from: 23.79,
    to: 25.25,
    text: "2 litri d'acqua",
    color: BLUE,
    y: 1400,
    doodle: "drop",
    tilt: 5,
  },
  {
    from: 25.31,
    to: 30.7,
    text: "collagene\nmagnesio\nvitamine",
    color: PINK,
    y: 1380,
    doodle: "pill",
    tilt: -4,
  },
  {
    from: 30.81,
    to: 34.9,
    text: "pilates & pesi",
    color: BLUE,
    y: 1420,
    doodle: "dumbbell",
    tilt: 3,
  },
  {
    from: 38.47,
    to: 40.6,
    text: "check ormoni",
    color: PINK,
    y: 1380,
    doodle: "flask",
    tilt: -4,
  },
  {
    from: 40.67,
    to: 42.0,
    text: "proteine + carboidrati",
    color: BLUE,
    y: 1440,
    doodle: "plate",
    tilt: 3,
  },
  { from: 42.05, to: 43.4, text: "pochi latticini", color: PINK, y: 1380 },
  {
    from: 44.97,
    to: 46.4,
    text: "niente triangolini\ndi mais",
    color: BLUE,
    y: 1420,
    doodle: "chip",
    tilt: -3,
  },
  {
    from: 46.49,
    to: 47.8,
    text: "prima la verdura",
    color: PINK,
    y: 1380,
    doodle: "leaf",
    tilt: 4,
  },
  {
    from: 47.83,
    to: 48.85,
    text: "no bibite zuccherate",
    color: BLUE,
    y: 1440,
  },
  {
    from: 48.91,
    to: 50.4,
    text: "via le persone negative",
    color: PINK,
    y: 1380,
  },
  {
    from: 50.47,
    to: 52.3,
    text: "non arrabbiarti",
    sfx: "soft_bloop",
    color: BLUE,
    y: 1440,
  },
  {
    from: 57.29,
    to: 59.0,
    text: "la tua versione migliore",
    color: PINK,
    y: 1380,
    doodle: "heart",
    tilt: -3,
  },
  {
    from: 59.01,
    to: 60.4,
    text: "sorridi",
    sfx: "soft_chime",
    color: BLUE,
    y: 1420,
  },
  {
    from: 61.05,
    to: 63.5,
    text: "a letto alle 22:30",
    color: PINK,
    y: 1380,
    doodle: "moon",
    tilt: 4,
  },
];

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Deterministic jitter, so the hand-drawn wobble is the same on every render.
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Hook: as in the reference, the words rise up from below into place at
// the very start (letter by letter), then stay still for the rest.
const HOOK = ["come vivo la perimenopausa", "al meglio"];

const RiseLine: React.FC<{ text: string; size: number; delay: number }> = ({
  text,
  size,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ ...hand(LILAC, size), whiteSpace: "pre" }}>
      {text.split("").map((c, i) => {
        const p = spring({
          frame: frame - delay - i * 0.8,
          fps,
          config: { damping: 13, mass: 0.5 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px)`,
            }}
          >
            {c === " " ? "\u00a0" : c}
          </span>
        );
      })}
    </div>
  );
};

const Hook: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
    <RiseLine text={HOOK[0]} size={80} delay={0} />
    <RiseLine text={HOOK[1]} size={92} delay={14} />
  </AbsoluteFill>
);

// Simple hand-drawn doodles (own artwork), stroked like a marker.
const Doodle: React.FC<{ name: DoodleName; color: string }> = ({
  name,
  color,
}) => {
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: 7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const shapes: Record<DoodleName, React.ReactNode> = {
    alarm: (
      <>
        <circle cx={60} cy={64} r={36} {...p} />
        <path
          d="M60 64 L60 44 M60 64 L74 72 M28 34 L40 24 M92 34 L80 24 M38 98 L30 108 M82 98 L90 108"
          {...p}
        />
      </>
    ),
    phone: <rect x={36} y={18} width={48} height={86} rx={10} {...p} />,
    sun: (
      <>
        <circle cx={60} cy={60} r={22} {...p} fill="#FFE08A" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <path
              key={i}
              d={`M${60 + Math.cos(a) * 34} ${60 + Math.sin(a) * 34} L${60 + Math.cos(a) * 48} ${60 + Math.sin(a) * 48}`}
              {...p}
            />
          );
        })}
      </>
    ),
    cup: (
      <>
        <path
          d="M26 50 L34 100 Q36 106 44 106 L76 106 Q84 106 86 100 L94 50 Z"
          {...p}
          fill="#FFF3E0"
        />
        <path d="M92 60 Q110 62 106 78 Q102 90 88 88" {...p} />
        <path
          d="M48 38 Q42 28 50 18 M62 38 Q56 28 64 18 M76 38 Q70 28 78 18"
          {...p}
        />
      </>
    ),
    sparkle: (
      <path
        d="M60 14 Q66 54 106 60 Q66 66 60 106 Q54 66 14 60 Q54 54 60 14 Z"
        {...p}
      />
    ),
    drop: (
      <path
        d="M60 14 Q96 60 92 78 Q88 104 60 104 Q32 104 28 78 Q24 60 60 14 Z"
        {...p}
        fill="#DDF1FB"
      />
    ),
    pill: (
      <>
        <rect
          x={20}
          y={44}
          width={80}
          height={34}
          rx={17}
          transform="rotate(-25 60 61)"
          {...p}
          fill="#FFE1EE"
        />
        <path d="M60 46 L60 78" transform="rotate(-25 60 61)" {...p} />
      </>
    ),
    dumbbell: (
      <>
        <path d="M30 60 L90 60" {...p} />
        <rect
          x={16}
          y={38}
          width={16}
          height={44}
          rx={5}
          {...p}
          fill="#E5F3FB"
        />
        <rect
          x={88}
          y={38}
          width={16}
          height={44}
          rx={5}
          {...p}
          fill="#E5F3FB"
        />
      </>
    ),
    heart: (
      <path
        d="M60 100 Q14 68 24 40 Q34 18 60 36 Q86 18 96 40 Q106 68 60 100 Z"
        {...p}
        fill="#FFE1EE"
      />
    ),
    flask: (
      <>
        <path
          d="M48 18 L72 18 M52 18 L52 50 L28 96 Q24 106 36 106 L84 106 Q96 106 92 96 L68 50 L68 18"
          {...p}
          fill="#F6E6FF"
        />
        <path d="M36 82 L84 82" {...p} />
      </>
    ),
    plate: (
      <>
        <circle cx={60} cy={62} r={42} {...p} fill="#FFFDF5" />
        <circle cx={60} cy={62} r={26} {...p} />
        <path
          d="M16 18 L16 44 M10 18 L10 36 Q10 44 16 44 Q22 44 22 36 L22 18 M104 18 Q94 30 98 50 L104 50 L104 106"
          {...p}
          transform="translate(0 0) scale(0.95)"
        />
      </>
    ),
    chip: (
      <>
        <path d="M24 96 L60 22 L96 96 Z" {...p} fill="#FFE6A8" />
        <path d="M46 70 L48 72 M66 60 L68 62 M62 84 L64 86" {...p} />
        <path d="M20 20 L100 100" {...p} stroke="#E25555" />
      </>
    ),
    leaf: (
      <>
        <path d="M22 98 Q20 30 98 22 Q100 98 22 98 Z" {...p} fill="#E4F4DC" />
        <path d="M22 98 Q56 62 84 36" {...p} />
      </>
    ),
    moon: (
      <>
        <path
          d="M74 18 Q40 26 40 60 Q40 94 76 102 Q46 106 30 84 Q14 58 30 36 Q46 16 74 18 Z"
          {...p}
          fill="#FFF6CF"
        />
        <path d="M80 40 L96 40 L80 56 L96 56" {...p} />
      </>
    ),
  };
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      style={{ flexShrink: 0 }}
    >
      {shapes[name]}
    </svg>
  );
};

// Torn paper edge: a jagged polygon all around the box, fixed per sticker.
const tornClip = (seed: number) => {
  const pts: string[] = [];
  const side = (n: number, f: (u: number, j: number) => string) => {
    for (let i = 0; i <= n; i++) {
      pts.push(f(i / n, rnd(seed * 97 + pts.length) * 3.2));
    }
  };
  side(22, (u, j) => `${u * 100}% ${j}%`);
  side(10, (u, j) => `${100 - j}% ${u * 100}%`);
  side(22, (u, j) => `${100 - u * 100}% ${100 - j}%`);
  side(10, (u, j) => `${j}% ${100 - u * 100}%`);
  return `polygon(${pts.join(", ")})`;
};

const Pop: React.FC<{
  text: string;
  color: string;
  y: number;
  doodle?: DoodleName;
  tilt?: number;
  duration: number;
  seed: number;
}> = ({ text, color, y, doodle, tilt = 0, duration, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, mass: 0.5 } });
  const out = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  // rise from below, like the reference words lifting with her hands
  const rise =
    interpolate(pop, [0, 1], [180, 0]) +
    interpolate(frame, [0, duration], [0, -40]);
  const content = doodle ? (
    // torn-paper sticker: white paper, soft shadow, slight tilt
    <div
      style={{
        filter: "drop-shadow(0 10px 14px rgba(70,30,50,0.28))",
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "26px 40px 26px 30px",
          background: "#FFFDF8",
          clipPath: tornClip(seed),
        }}
      >
        <Doodle name={doodle} color={color} />
        <div
          style={{
            ...hand(color, 78),
            WebkitTextStroke: "0px",
            filter: "none",
            whiteSpace: "pre-line",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  ) : (
    <div style={{ ...hand(color, 92), whiteSpace: "pre-line" }}>
      {`* ${text} *`}
    </div>
  );
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", top: y - 960 }}
    >
      <div
        style={{
          opacity: Math.min(1, pop * 2) * out,
          transform: `translateY(${rise}px) scale(${0.6 + 0.4 * pop})`,
        }}
      >
        {content}
      </div>
    </AbsoluteFill>
  );
};

export const Perimenopausa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {KEEP.map(([a, b], i) => {
      const len = Math.round((b - a) * PERI_FPS);
      return (
        <Sequence
          key={a}
          from={Math.round(at(a) * PERI_FPS)}
          durationInFrames={len}
        >
          <OffthreadVideo
            src={staticFile("hook/elena.mp4")}
            trimBefore={Math.round(a * PERI_FPS)}
            // one-frame audio fades so the joins do not click
            volume={(f) =>
              interpolate(
                f,
                [0, 1, len - 2, len - 1],
                [i ? 0 : 1, 1, 1, i < KEEP.length - 1 ? 0 : 1],
                clamp,
              )
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // punch-in after the "grasso addominale" cut hides the jump
              transform: `scale(${PUNCH[i] ?? 1})`,
            }}
          />
        </Sequence>
      );
    })}
    <Hook />
    <Audio src={staticFile("sfx/paper_swish.wav")} volume={0.3} />
    <Sequence from={10}>
      <Audio src={staticFile("sfx/soft_chime.wav")} volume={0.3} />
    </Sequence>
    {POPS.map((p, i) => {
      const d = s(at(p.to)) - s(at(p.from));
      return (
        <Sequence key={p.text} from={s(at(p.from))} durationInFrames={d}>
          <Pop {...p} duration={d} seed={i + 1} />
          <Audio
            src={staticFile(`sfx/${p.sfx ?? "marimba"}.wav`)}
            volume={p.sfx ? 0.35 : 0.3}
          />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
