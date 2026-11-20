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

// "Camminare VS correre sul tapis roulant", one after the other (no split
// screen): first the walking clip full screen with its differences raining
// down, then a swipe to the running clip with its own. Same hand-written
// style as the perimenopause reel. Clips uploaded in chat →
// public/tapis/{a,b}_v.mp4 (b = walking, a = running).

export const TAPIS_FPS = 30;
const s = (seconds: number) => Math.round(seconds * TAPIS_FPS);

const PART = 8.6; // seconds per side
const CLOSE = 2.6; // closing line after the running part
export const TAPIS_DURATION = s(PART * 2 + CLOSE);

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
const BLUE = "#4FB3E6";
const LILAC = "#D9A8F0";

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

const WALK = [
  "basso impatto sulle articolazioni",
  "cortisolo stabile",
  "usa soprattutto i grassi",
  "poca infiammazione acuta",
  "recuperi subito: ogni giorno",
];
const RUN = [
  "impatto 2-3 volte il peso corporeo",
  "picco di cortisolo",
  "usa più zuccheri",
  "infiammazione acuta temporanea",
  "serve più recupero",
];

const FIRST = 1.6; // first note falls, in each part (s)
const EVERY = 1.2;
const ROW_Y = 600;
const ROW_H = 165;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const tornClip = (seed: number) => {
  const pts: string[] = [];
  const side = (n: number, f: (u: number, j: number) => string) => {
    for (let i = 0; i <= n; i++) {
      pts.push(f(i / n, rnd(seed * 97 + pts.length) * 3.5));
    }
  };
  side(20, (u, j) => `${u * 100}% ${j}%`);
  side(8, (u, j) => `${100 - j}% ${u * 100}%`);
  side(20, (u, j) => `${100 - u * 100}% ${100 - j}%`);
  side(8, (u, j) => `${j}% ${100 - u * 100}%`);
  return `polygon(${pts.join(", ")})`;
};

const RiseText: React.FC<{
  text: string;
  color: string;
  size: number;
  delay: number;
}> = ({ text, color, size, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ ...hand(color, size), whiteSpace: "pre" }}>
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
            {c === " " ? " " : c}
          </span>
        );
      })}
    </div>
  );
};

// A torn-paper note that drops from above and bounces into place.
const Falling: React.FC<{
  text: string;
  color: string;
  y: number;
  seed: number;
}> = ({ text, color, y, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 11, mass: 0.8 } });
  const tilt = (rnd(seed) - 0.5) * 8;
  const offset = (rnd(seed + 5) - 0.5) * 120;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: interpolate(drop, [0, 1], [-260, y]),
        display: "flex",
        justifyContent: "center",
        transform: `translateX(${offset}px)`,
      }}
    >
      <div
        style={{
          filter: "drop-shadow(0 10px 14px rgba(70,30,50,0.3))",
          transform: `rotate(${interpolate(drop, [0, 1], [tilt * 3, tilt])}deg)`,
        }}
      >
        <div
          style={{
            background: "#FFFDF8",
            clipPath: tornClip(seed),
            padding: "18px 34px",
            ...hand(color, 56),
            WebkitTextStroke: "0px",
            filter: "none",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const Part: React.FC<{
  src: string;
  label: string;
  color: string;
  notes: string[];
  seed: number;
  withTitle: boolean;
}> = ({ src, label, color, notes, seed, withTitle }) => {
  const frame = useCurrentFrame();
  const shade = interpolate(frame, [s(FIRST) - 10, s(FIRST)], [0, 0.15], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${shade})` }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
        {withTitle ? (
          <>
            <RiseText text="tapis roulant" color={LILAC} size={86} delay={0} />
            <RiseText
              text="cosa cambia per l'infiammazione?"
              color={LILAC}
              size={60}
              delay={10}
            />
          </>
        ) : null}
        <div style={{ marginTop: withTitle ? 24 : 120 }}>
          <RiseText
            text={label}
            color={color}
            size={120}
            delay={withTitle ? 18 : 2}
          />
        </div>
      </AbsoluteFill>
      {notes.map((n, i) => (
        <Sequence key={n} from={s(FIRST + i * EVERY)} layout="none">
          <Falling
            text={n}
            color={color}
            y={ROW_Y + i * ROW_H}
            seed={seed + i}
          />
          <Audio src={staticFile("sfx/pop_user.wav")} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 170,
      }}
    >
      <div
        style={{
          ...hand(LILAC, 72),
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px)`,
        }}
      >
        il segreto? alternarli ✨
      </div>
    </AbsoluteFill>
  );
};

// Swipe: the running part slides in from the right over the walking part.
const Swipe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 10], [1080, 0], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const TapisVs: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "white" }}>
    <Sequence durationInFrames={s(PART) + 10}>
      <Part
        src="tapis/b_v.mp4"
        label="camminare"
        color={BLUE}
        notes={WALK}
        seed={1}
        withTitle
      />
    </Sequence>
    <Audio src={staticFile("sfx/paper_swish.wav")} volume={0.3} />
    <Sequence from={s(PART)}>
      <Swipe>
        <Part
          src="tapis/a_v.mp4"
          label="correre"
          color={PINK}
          notes={RUN}
          seed={11}
          withTitle={false}
        />
      </Swipe>
      <Audio src={staticFile("sfx/paper_swish.wav")} volume={0.35} />
    </Sequence>
    <Sequence from={s(PART * 2)}>
      <Closing />
      <Audio src={staticFile("sfx/soft_chime.wav")} volume={0.35} />
    </Sequence>
  </AbsoluteFill>
);
