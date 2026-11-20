import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
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
// few themed 3D emoji (not on every line). Everything sits above her head or
// on her sweater, never on her face. No subtitles.
// Source: GitHub release (33DC2C2F...MP4) → public/hook/elena.mp4.

export const PERI_FPS = 30;
export const PERI_DURATION = 1908; // 63.6 s
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

// Pop-ups, in source seconds. y is the vertical centre in px.
const POPS: {
  from: number;
  to: number;
  text: string;
  color: string;
  y: number;
  emoji?: string;
}[] = [
  { from: 5.85, to: 7.4, text: "3 semplici mosse", color: BLUE, y: 1380 },
  {
    from: 7.53,
    to: 9.5,
    text: "sveglia alle 7",
    color: PINK,
    y: 1300,
    emoji: "alarm_clock",
  },
  {
    from: 9.63,
    to: 11.6,
    text: "niente telefono",
    color: BLUE,
    y: 1460,
    emoji: "no_mobile_phones",
  },
  {
    from: 12.19,
    to: 13.15,
    text: "sole all'alba",
    color: PINK,
    y: 1320,
    emoji: "sun",
  },
  {
    from: 13.19,
    to: 14.6,
    text: "tisana tiepida",
    color: BLUE,
    y: 1460,
    emoji: "teacup_without_handle",
  },
  {
    from: 18.23,
    to: 19.95,
    text: "ringrazia",
    color: PINK,
    y: 1360,
    emoji: "sparkles",
  },
  {
    from: 23.79,
    to: 25.25,
    text: "2 litri d'acqua",
    color: BLUE,
    y: 1400,
    emoji: "droplet",
  },
  {
    from: 25.31,
    to: 30.7,
    text: "collagene\nmagnesio\nvitamine",
    color: PINK,
    y: 1380,
    emoji: "pill",
  },
  {
    from: 30.81,
    to: 34.9,
    text: "pilates & pesi",
    color: BLUE,
    y: 1420,
    emoji: "flexed_biceps",
  },
  {
    from: 35.5,
    to: 38.3,
    text: "erano solo 3…",
    color: PINK,
    y: 1360,
    emoji: "grinning_face_with_sweat",
  },
  {
    from: 50.47,
    to: 52.3,
    text: "non arrabbiarti",
    color: BLUE,
    y: 1440,
    emoji: "face_with_steam_from_nose",
  },
  {
    from: 57.29,
    to: 59.0,
    text: "la tua versione migliore",
    color: PINK,
    y: 1380,
  },
  {
    from: 59.01,
    to: 60.4,
    text: "sorridi",
    color: BLUE,
    y: 1420,
    emoji: "grinning_squinting_face",
  },
  {
    from: 61.05,
    to: 63.5,
    text: "a letto alle 22:30",
    color: PINK,
    y: 1380,
    emoji: "zzz",
  },
];

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 11, mass: 0.6 } });
  const a = line(2);
  const b = line(9);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
      <div
        style={{
          ...hand(PINK, 84),
          opacity: a,
          transform: `translateY(${interpolate(a, [0, 1], [-30, 0])}px) rotate(-2deg)`,
        }}
      >
        come vivo la perimenopausa
      </div>
      <div
        style={{
          ...hand(PINK, 96),
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [-30, 0])}px) rotate(-2deg)`,
        }}
      >
        al meglio ✨
      </div>
    </AbsoluteFill>
  );
};

const Pop: React.FC<{
  text: string;
  color: string;
  y: number;
  emoji?: string;
  duration: number;
}> = ({ text, color, y, emoji, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, mass: 0.5 } });
  const out = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  // gentle float upwards, like the reference words rising with her hands
  const rise = interpolate(frame, [0, duration], [20, -25]);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        top: y - 960,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: Math.min(1, pop * 2) * out,
          transform: `translateY(${rise}px) scale(${0.6 + 0.4 * pop})`,
        }}
      >
        <div style={{ ...hand(color, 92), whiteSpace: "pre-line" }}>
          {`* ${text} *`}
        </div>
        {emoji ? (
          // Fluent Emoji 3D (Microsoft, MIT licence)
          <Img
            src={staticFile(`emoji/${emoji}.png`)}
            style={{
              width: 150,
              transform: `rotate(${interpolate(frame, [0, duration], [-8, 8])}deg)`,
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.25))",
            }}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// withEmoji=false renders the text-only version, for adding emoji on the phone.
export const Perimenopausa: React.FC<{ withEmoji?: boolean }> = ({
  withEmoji = true,
}) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo
      src={staticFile("hook/elena.mp4")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <Hook />
    {POPS.map((p) => {
      const d = s(p.to) - s(p.from);
      return (
        <Sequence key={p.text} from={s(p.from)} durationInFrames={d}>
          <Pop {...p} emoji={withEmoji ? p.emoji : undefined} duration={d} />
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      );
    })}
    <AbsoluteFill style={{ alignItems: "flex-end", padding: "330px 70px 0 0" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 110,
          opacity: 0.8,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
        }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);
