import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

// "La mia colazione anti picco glicemico": same editing style as the
// collagen myths reel (stickers hook, white outlined subtitles, logo
// watermark, whoosh on the cut) without the black & white / red reveal.
// Source: GitHub release (colazione.santa.mov) → public/colazione/colazione.mp4.
// The ~4.5 s pause before "piccolo trucchetto" is cut out.

export const COLAZIONE_FPS = 24;
const s = (seconds: number) => Math.round(seconds * COLAZIONE_FPS);

const SRC = "colazione/colazione.mp4";
const CUT_FROM = 68.3; // pause in the source
const CUT_TO = 72.85;
const PART1 = s(CUT_FROM);
const PART2 = s(85.875) - s(CUT_TO);
export const COLAZIONE_DURATION = PART1 + PART2;

// Output-timeline seconds for something said at source time t.
const at = (t: number) => (t < CUT_FROM ? t : t - (CUT_TO - CUT_FROM));

const HOOK = ["La mia colazione", "anti picco glicemico"];

const CAPTIONS: [number, number, string][] = [
  [0, 3.0, "La colazione al bar può essere divertente,"],
  [3.0, 3.95, "interessante."],
  [3.98, 6.75, "Io personalmente non la faccio spesso"],
  [6.8, 8.9, "perché preferisco farla a casa"],
  [8.94, 12.9, "e spesso scelgo questa colazione che ora vi mostro"],
  [13.12, 16.3, "Prendi 150-200 grammi"],
  [16.3, 19.6, "di yogurt greco e mettilo in una bowl"],
  [19.74, 22.45, "poi aggiungi 10 grammi di semi di chia"],
  [22.5, 25.55, "già tritati, oppure in ammollo dalla sera prima:"],
  [25.64, 29.1, "circa due cucchiaini, se sono già tritati"],
  [29.18, 32.85, "A questo punto avrai 22 grammi di proteine,"],
  [32.9, 36.1, "le prime fibre e il tuo intestino ti ringrazierà"],
  [36.16, 39.1, "Se poi aggiungi una manciata di mirtilli,"],
  [39.1, 41.8, "circa 60 grammi, al tuo yogurt greco"],
  [41.86, 46.4, "avrai raggiunto 23 grammi di proteine"],
  [46.58, 49.5, "E non solo: 5 grammi di fibre"],
  [49.5, 53.0, "più antiossidanti e dolcezza naturale"],
  [53.82, 58.4, "Poi aggiungiamo due cucchiaini rasi di semi di lino"],
  [58.44, 62.6, "e raggiungiamo 24 grammi di proteine"],
  [62.66, 64.6, "e 7 grammi di fibre"],
  [64.64, 67.9, "e sono certa che il vostro intestino ringrazierà"],
  [72.95, 75.0, "Un piccolo trucchetto:"],
  [75.0, 76.7, "arriverai a pranzo più sazia"],
  [76.74, 80.9, "magari spezzando la fame con 3-4 mandorle"],
  [80.94, 82.7, "o un pezzetto di cioccolato"],
  [82.7, 85.8, "e non avrai il famoso picco glicemico"],
];

// Ingredient tags, shown when she adds each one (source seconds).
const TAGS: { from: number; to: number; text: string; color: string }[] = [
  { from: 16.4, to: 29.0, text: "Yogurt greco · 150-200 g", color: "#EEF7A3" },
  { from: 21.98, to: 29.0, text: "Semi di chia · 10 g", color: "#D9C4F1" },
  { from: 38.04, to: 53.0, text: "Mirtilli · 60 g", color: "#D9C4F1" },
  {
    from: 56.66,
    to: 67.9,
    text: "Semi di lino · 2 cucchiaini",
    color: "#EEF7A3",
  },
];

// Running totals, updated when she says them (source seconds).
const TOTALS: { from: number; to: number; protein: number; fibre?: number }[] =
  [
    { from: 30.76, to: 44.0, protein: 22 },
    { from: 44.02, to: 47.8, protein: 23 },
    { from: 47.82, to: 60.88, protein: 23, fibre: 5 },
    { from: 60.88, to: 67.9, protein: 24, fibre: 7 },
  ];

const YELLOW = "#EEF7A3";
const LILAC = "#D9C4F1";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const pill: React.CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  color: "#1F1F1F",
  fontFamily: sans,
  fontWeight: 700,
  whiteSpace: "nowrap",
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
};

// Hook stickers, same look and place as "Sfatiamo i / Falsi miti".
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ padding: "750px 0 0 56px" }}>
      <div
        style={{
          opacity: enter,
          transform: `translateX(${interpolate(enter, [0, 1], [-200, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            ...pill,
            background: YELLOW,
            fontSize: 62,
            padding: "12px 42px",
          }}
        >
          {HOOK[0]}
        </div>
        <div
          style={{
            ...pill,
            background: LILAC,
            fontSize: 56,
            padding: "12px 42px",
            marginLeft: 40,
            marginTop: -6,
          }}
        >
          {HOOK[1]}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Pop: React.FC<{
  duration: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ duration, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.6 } });
  const out = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, pop * 2) * out,
        transform: `${style?.transform ?? ""} scale(${pop})`,
      }}
    >
      {children}
    </div>
  );
};

const Subtitle: React.FC<{ text: string; duration: number }> = ({
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 3, duration - 3, duration],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1280 }}>
      <div
        style={{
          opacity,
          width: 940,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 58,
          lineHeight: 1.25,
          color: "white",
          WebkitTextStroke: "6px rgba(40,40,40,0.55)",
          paintOrder: "stroke fill",
          textShadow: "0 4px 16px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Timed: React.FC<{
  from: number;
  to: number;
  children: (duration: number) => React.ReactNode;
}> = ({ from, to, children }) => {
  const a = s(at(from));
  const d = Math.max(1, s(at(to)) - a);
  return (
    <Sequence from={a} durationInFrames={d}>
      {children(d)}
    </Sequence>
  );
};

export const Colazione: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Sequence durationInFrames={PART1}>
      <OffthreadVideo
        src={staticFile(SRC)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Sequence>
    <Sequence from={PART1} durationInFrames={PART2}>
      <OffthreadVideo
        src={staticFile(SRC)}
        trimBefore={s(CUT_TO)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Sequence>
    <Sequence from={PART1 - 3}>
      <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
    </Sequence>

    <Hook />

    {TAGS.map((t, i) => (
      <Timed key={t.text} from={t.from} to={t.to}>
        {(d) => (
          <AbsoluteFill
            style={{ alignItems: "flex-end", padding: "430px 50px 0 0" }}
          >
            <Pop
              duration={d}
              style={{
                ...pill,
                background: t.color,
                fontSize: 44,
                padding: "10px 32px",
                marginTop: (i % 2) * 90,
                transform: "rotate(-3deg)",
              }}
            >
              {t.text}
            </Pop>
          </AbsoluteFill>
        )}
      </Timed>
    ))}

    {TOTALS.map((t) => (
      <Timed key={`${t.from}`} from={t.from} to={t.to}>
        {(d) => (
          <AbsoluteFill
            style={{ alignItems: "flex-end", padding: "620px 50px 0 0" }}
          >
            <Pop
              duration={d}
              style={{
                ...pill,
                background: "white",
                fontSize: 46,
                padding: "12px 30px",
                textAlign: "right",
                lineHeight: 1.3,
              }}
            >
              💪 {t.protein} g proteine
              {t.fibre ? (
                <>
                  <br />
                  🌾 {t.fibre} g fibre
                </>
              ) : null}
            </Pop>
          </AbsoluteFill>
        )}
      </Timed>
    ))}

    {CAPTIONS.map(([from, to, text]) => (
      <Timed key={`${from}-${text}`} from={from} to={to}>
        {(d) => <Subtitle text={text} duration={d} />}
      </Timed>
    ))}

    <AbsoluteFill style={{ alignItems: "flex-end", padding: "250px 80px 0 0" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 120,
          opacity: 0.8,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
        }}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);
