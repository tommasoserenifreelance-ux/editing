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
// down, a fade to black with a big "VS", then the running clip with its own. Same hand-written
// style as the perimenopause reel. Clips uploaded in chat →
// public/tapis/{a,b}_v.mp4 (b = walking, a = running).

export const TAPIS_FPS = 30;
const s = (seconds: number) => Math.round(seconds * TAPIS_FPS);

const PART = 10.5; // seconds per side: all notes stay on screen ~4 s at the end
export const TAPIS_DURATION = s(PART * 2);

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

// Client's copy: four benefits per side, then a water-retention note.
const WALK = [
  "tonifica di più\nglutei e gambe",
  "aiuta a bruciare\ncalorie e grassi",
  "meno traumatica\nper le articolazioni",
  "favorisce resistenza\ne recupero",
];
const RUN = [
  "più capacità\ncardiovascolare",
  "più calorie\nin meno tempo",
  "rafforza la\nresistenza fisica",
  "stimola di più\nossa e muscoli",
];
const WALK_WATER =
  "ritenzione idrica:\nfavorisce circolazione e ritorno venoso,\ngambe meno pesanti e gonfie";
const RUN_WATER =
  "ritenzione idrica:\nmigliora la circolazione, ma è più traumatica\ne non sempre è la più efficace";
// Scattered around the edges so her body in the middle stays visible.
const SPOTS: { left: boolean; y: number }[] = [
  { left: true, y: 560 },
  { left: false, y: 800 },
  { left: true, y: 1050 },
  { left: false, y: 1300 },
];
const WATER_Y = 1560; // centred banner, last

const FIRST = 1.6; // first note falls, in each part (s)
const EVERY = 1.0;

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

// A torn-paper note that drops from above and bounces into place, at the
// left or right edge of the frame.
const Falling: React.FC<{
  text: string;
  color: string;
  left: boolean | null; // null = centred
  y: number;
  seed: number;
  size?: number;
}> = ({ text, color, left, y, seed, size = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 11, mass: 0.8 } });
  const tilt = left === null ? -2 : (left ? -1 : 1) * (3 + rnd(seed) * 4);
  return (
    <div
      style={{
        position: "absolute",
        top: interpolate(drop, [0, 1], [-260, y]),
        ...(left === null
          ? { left: 0, right: 0, display: "flex", justifyContent: "center" }
          : { [left ? "left" : "right"]: 34 }),
        filter: "drop-shadow(0 10px 14px rgba(70,30,50,0.3))",
        transform: `rotate(${interpolate(drop, [0, 1], [tilt * 3, tilt])}deg)`,
      }}
    >
      <div
        style={{
          background: "#FFFDF8",
          clipPath: tornClip(seed),
          padding: "16px 26px",
          ...hand(color, size),
          WebkitTextStroke: "0px",
          filter: "none",
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Part: React.FC<{
  water: string;
  src: string;
  label: string;
  color: string;
  notes: string[];
  seed: number;
  withTitle: boolean;
}> = ({ src, label, color, notes, water, seed, withTitle }) => {
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
              text="cosa cambia per il tuo corpo?"
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
            size={label.length > 12 ? 92 : 120}
            delay={withTitle ? 18 : 2}
          />
        </div>
      </AbsoluteFill>
      {notes.map((n, i) => (
        <Sequence key={n} from={s(FIRST + i * EVERY)} layout="none">
          <Falling
            text={n}
            color={color}
            left={SPOTS[i].left}
            y={SPOTS[i].y}
            seed={seed + i}
          />
          <Audio src={staticFile("sfx/pop_user.wav")} volume={0.6} />
        </Sequence>
      ))}
      <Sequence from={s(FIRST + notes.length * EVERY + 0.3)} layout="none">
        <Falling
          text={water}
          color={color}
          left={null}
          y={WATER_Y}
          seed={seed + 9}
          size={40}
        />
        <Audio src={staticFile("sfx/pop_user.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Between the clips: fade to black, a big "VS" bursts in on the black,
// then the black fades away on the running clip.
const VS_LEN = 42; // frames
const Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const black = interpolate(
    frame,
    [0, 8, VS_LEN - 8, VS_LEN],
    [0, 1, 1, 0],
    clamp,
  );
  const p = spring({
    frame: frame - 8,
    fps,
    config: { damping: 7, mass: 0.6 },
  });
  const out = interpolate(frame, [VS_LEN - 10, VS_LEN - 4], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `rgba(0,0,0,${black})`,
      }}
    >
      <div
        style={{
          ...hand(LILAC, 360),
          WebkitTextStroke: "0px",
          filter: "drop-shadow(0 0 30px rgba(217,168,240,0.55))",
          opacity: out,
          transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-30, -8])}deg)`,
        }}
      >
        vs
      </div>
    </AbsoluteFill>
  );
};

// Sung chorus of "Turn It Up" (client's track): from the beat at 0:10, so
// "turn it up, let it go" (0:15-0:30) is in and the verse (0:32) is not;
// faded in and out, kept under the pops.
const SONG_FROM = 10.01;

const Song: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile("music/turn_it_up.mp3")}
      trimBefore={s(SONG_FROM)}
      volume={(f) =>
        0.4 *
        interpolate(
          f,
          [0, 8, durationInFrames - 30, durationInFrames],
          [0, 1, 1, 0],
          clamp,
        )
      }
    />
  );
};

export const TapisVs: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "white" }}>
    <Song />
    <Sequence durationInFrames={s(PART) + 10}>
      <Part
        src="tapis/b_v.mp4"
        label="camminata in salita"
        color={BLUE}
        notes={WALK}
        water={WALK_WATER}
        seed={1}
        withTitle
      />
    </Sequence>
    <Audio src={staticFile("sfx/paper_swish.wav")} volume={0.3} />
    <Sequence from={s(PART)}>
      <Part
        src="tapis/a_v.mp4"
        label="corsa"
        color={PINK}
        notes={RUN}
        water={RUN_WATER}
        seed={11}
        withTitle={false}
      />
    </Sequence>
    <Sequence from={s(PART) - VS_LEN / 2} durationInFrames={VS_LEN}>
      <Versus />
      <Sequence from={8}>
        <Audio src={staticFile("sfx/pop_user.wav")} volume={0.7} />
      </Sequence>
    </Sequence>
  </AbsoluteFill>
);
