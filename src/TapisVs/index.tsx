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

// "Camminare VS correre sul tapis roulant" split screen, same hand-written
// style as the perimenopause reel. The differences rain down one after the
// other on each side and pile up. Clips uploaded in chat →
// public/tapis/{a,b}_v.mp4 (b = walking, a = running).

export const TAPIS_FPS = 30;
export const TAPIS_DURATION = 438; // 14.6 s, the shorter clip
const s = (seconds: number) => Math.round(seconds * TAPIS_FPS);

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
  "basso impatto\nsulle articolazioni",
  "cortisolo\nstabile",
  "usa soprattutto\ni grassi",
  "poca infiammazione\nacuta",
  "recuperi subito:\nogni giorno",
];
const RUN = [
  "impatto 2-3 volte\nil peso corporeo",
  "picco di\ncortisolo",
  "usa più\nzuccheri",
  "infiammazione acuta\ntemporanea",
  "serve più\nrecupero",
];

const FIRST = 2.2; // first difference falls (s)
const EVERY = 1.25; // one pair of differences every … s
const ROW_Y = 470; // top of the first row
const ROW_H = 205;

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
  side(16, (u, j) => `${u * 100}% ${j}%`);
  side(8, (u, j) => `${100 - j}% ${u * 100}%`);
  side(16, (u, j) => `${100 - u * 100}% ${100 - j}%`);
  side(8, (u, j) => `${j}% ${100 - u * 100}%`);
  return `polygon(${pts.join(", ")})`;
};

// A torn-paper note that drops from above the frame and bounces into place.
const Falling: React.FC<{
  text: string;
  color: string;
  y: number;
  seed: number;
}> = ({ text, color, y, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 11, mass: 0.8 } });
  const tilt = (rnd(seed) - 0.5) * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: interpolate(drop, [0, 1], [-260, y]),
        display: "flex",
        justifyContent: "center",
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
            padding: "18px 22px",
            ...hand(color, 46),
            WebkitTextStroke: "0px",
            filter: "none",
            whiteSpace: "pre-line",
            width: 440,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = (
    text: string,
    color: string,
    size: number,
    delay: number,
  ) => (
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
  const vs = spring({ frame: frame - 26, fps, config: { damping: 8 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      {letters("tapis roulant", LILAC, 86, 0)}
      {letters("cosa cambia per l'infiammazione?", LILAC, 60, 10)}
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-around",
          alignItems: "center",
          marginTop: 30,
        }}
      >
        {letters("camminare", BLUE, 82, 18)}
        <div
          style={{
            ...hand("#1F1F1F", 70),
            transform: `scale(${vs}) rotate(-8deg)`,
          }}
        >
          vs
        </div>
        {letters("correre", PINK, 82, 22)}
      </div>
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
        paddingBottom: 150,
      }}
    >
      <div
        style={{
          ...hand(LILAC, 66),
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px)`,
        }}
      >
        il segreto? alternarli ✨
      </div>
    </AbsoluteFill>
  );
};

const Half: React.FC<{ src: string; left: boolean }> = ({ src, left }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: left ? 0 : 540,
      width: 540,
      height: 1920,
      overflow: "hidden",
    }}
  >
    <OffthreadVideo
      src={staticFile(src)}
      muted
      style={{
        position: "absolute",
        left: -270,
        width: 1080,
        height: 1920,
        objectFit: "cover",
      }}
    />
  </div>
);

export const TapisVs: React.FC = () => {
  const frame = useCurrentFrame();
  const shade = interpolate(frame, [s(FIRST) - 10, s(FIRST)], [0, 0.18], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <Half src="tapis/b_v.mp4" left />
      <Half src="tapis/a_v.mp4" left={false} />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${shade})` }} />
      <div
        style={{
          position: "absolute",
          left: 537,
          top: 0,
          width: 6,
          height: 1920,
          background: "white",
          boxShadow: "0 0 12px rgba(0,0,0,0.25)",
        }}
      />
      <Header />
      <Audio src={staticFile("sfx/paper_swish.wav")} volume={0.3} />
      {WALK.map((w, i) => {
        const start = s(FIRST + i * EVERY);
        return (
          <Sequence key={w} from={start} layout="none">
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 540,
                height: 1920,
              }}
            >
              <Falling
                text={w}
                color={BLUE}
                y={ROW_Y + i * ROW_H}
                seed={i + 1}
              />
            </div>
            <Audio src={staticFile("sfx/capcut_pop.wav")} volume={0.45} />
          </Sequence>
        );
      })}
      {RUN.map((r, i) => {
        const start = s(FIRST + i * EVERY + EVERY / 2);
        return (
          <Sequence key={r} from={start} layout="none">
            <div
              style={{
                position: "absolute",
                left: 540,
                top: 0,
                width: 540,
                height: 1920,
              }}
            >
              <Falling
                text={r}
                color={PINK}
                y={ROW_Y + i * ROW_H}
                seed={i + 11}
              />
            </div>
            <Audio src={staticFile("sfx/capcut_pop.wav")} volume={0.45} />
          </Sequence>
        );
      })}
      <Sequence from={s(FIRST + WALK.length * EVERY + 0.6)}>
        <Closing />
        <Audio src={staticFile("sfx/soft_chime.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
