import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";

export const CORPO_FPS = 30;

const BEFORE = colors.navy; // what declines up to menopause
const AFTER = colors.rose; // what appears or increases after it

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const ease = (t: number, at: number, dur = 0.6) =>
  interpolate(t, [at, at + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const appear = (t: number, at: number): React.CSSProperties => {
  const k = ease(t, at);
  return { opacity: k, transform: `translateY(${(1 - k) * 30}px)` };
};

const Kicker: React.FC<{ t: number; children: React.ReactNode }> = ({
  t,
  children,
}) => (
  <div
    style={{
      ...appear(t, 0),
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 4,
      color: colors.rose,
      marginBottom: 24,
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{
  t: number;
  size?: number;
  children: React.ReactNode;
}> = ({ t, size = 78, children }) => (
  <div
    style={{
      ...appear(t, 0.1),
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: -2,
      color: colors.plum,
    }}
  >
    {children}
  </div>
);

const Sub: React.FC<{ t: number; at: number; children: React.ReactNode }> = ({
  t,
  at,
  children,
}) => (
  <div
    style={{
      ...appear(t, at),
      fontSize: 44,
      lineHeight: 1.35,
      marginTop: 36,
      color: colors.navy,
    }}
  >
    {children}
  </div>
);

const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.rose }}>{children}</span>
);

// ---------- Timeline chart, after the Science figure ----------

type Bar = { label: string; kind: "before" | "after" };

const W = 900;
const FROM = 30;
const TO = 80;
const MENOPAUSE = 51;
const ROW = 96;
const TOP = 90;
const xOf = (age: number) => ((age - FROM) / (TO - FROM)) * W;

const Timeline: React.FC<{ t: number; bars: Bar[]; id: string }> = ({
  t,
  bars,
  id,
}) => {
  // A playhead sweeps from 30 to 80 years and reveals the bars.
  const head = interpolate(t, [0.8, 2.8], [FROM, TO], clamp);
  const height = TOP + bars.length * ROW + 10;
  const m = xOf(MENOPAUSE);
  return (
    <svg
      width={W}
      height={height}
      style={{ ...appear(t, 0.4), marginTop: 50, overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id={`${id}-before`}
          x1="0"
          x2={m}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.55" stopColor={BEFORE} stopOpacity={0.9} />
          <stop offset="1" stopColor={BEFORE} stopOpacity={0.08} />
        </linearGradient>
        <linearGradient
          id={`${id}-after`}
          x1={xOf(44)}
          x2={W}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={AFTER} stopOpacity={0.05} />
          <stop offset="0.3" stopColor={AFTER} stopOpacity={0.9} />
          <stop offset="0.85" stopColor={AFTER} stopOpacity={0.75} />
          <stop offset="1" stopColor={AFTER} stopOpacity={0.15} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={0} y={0} width={xOf(head)} height={height} />
        </clipPath>
      </defs>
      <line
        x1={0}
        x2={W}
        y1={40}
        y2={40}
        stroke={colors.grid}
        strokeWidth={6}
      />
      {[30, 40, 50, 60, 70, 80].map((a) => (
        <g key={a}>
          <line
            x1={xOf(a)}
            x2={xOf(a)}
            y1={32}
            y2={48}
            stroke={colors.muted}
            strokeWidth={3}
          />
          <text
            x={xOf(a)}
            y={20}
            textAnchor="middle"
            fill={colors.muted}
            fontSize={26}
          >
            {a}
          </text>
        </g>
      ))}
      <text x={W} y={84} textAnchor="end" fill={colors.muted} fontSize={22}>
        anni
      </text>
      <g clipPath={`url(#${id}-clip)`}>
        {bars.map((bar, i) => {
          const y = TOP + i * ROW;
          const before = bar.kind === "before";
          return (
            <g key={bar.label}>
              <rect
                x={before ? 0 : xOf(44)}
                y={y}
                width={before ? m : W - xOf(44)}
                height={ROW - 14}
                fill={`url(#${id}-${bar.kind})`}
                rx={6}
              />
              <text
                x={before ? 14 : m + 14}
                y={y + (ROW - 14) / 2 + 11}
                fill="#fff"
                fontSize={32}
                fontWeight={600}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </g>
      <line
        x1={m}
        x2={m}
        y1={40}
        y2={height}
        stroke={colors.plum}
        strokeWidth={3}
        strokeDasharray="8 8"
      />
      <circle
        cx={m}
        cy={40}
        r={12}
        fill={colors.pink}
        stroke={colors.plum}
        strokeWidth={5}
      />
      <text
        x={m}
        y={-14}
        textAnchor="middle"
        fill={colors.plum}
        fontSize={28}
        fontWeight={700}
      >
        Menopausa
      </text>
    </svg>
  );
};

const Legend: React.FC<{ t: number }> = ({ t }) => (
  <div
    style={{
      ...appear(t, 2.8),
      display: "flex",
      gap: 40,
      marginTop: 24,
      fontSize: 28,
      color: colors.muted,
    }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{ width: 28, height: 20, borderRadius: 4, background: BEFORE }}
      />
      si riduce
    </span>
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{ width: 28, height: 20, borderRadius: 4, background: AFTER }}
      />
      compare o aumenta
    </span>
  </div>
);

const System: React.FC<{
  t: number;
  title: string;
  bars: Bar[];
}> = ({ t, title, bars }) => (
  <>
    <Kicker t={t}>COSA CAMBIA</Kicker>
    <Headline t={t} size={84}>
      {title}
    </Headline>
    <Timeline t={t} bars={bars} id={title.replace(/\W/g, "")} />
    <Legend t={t} />
  </>
);

// ---------- Scenes ----------

const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} size={100}>
      La menopausa non riguarda solo il ciclo.
    </Headline>
    <Sub t={t} at={1.2}>
      <b style={{ color: colors.rose, fontSize: 64 }}>
        Riguarda tutto il corpo.
      </b>
    </Sub>
  </>
);

const ORGANS = [
  "Cervello",
  "Occhi",
  "Tiroide",
  "Polmoni",
  "Seno",
  "Cuore",
  "Fegato",
  "Milza",
  "Reni",
  "Intestino",
  "Utero e ovaie",
  "Grasso",
  "Muscoli",
  "Ossa",
  "Pelle",
];

const Receptors: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>PERCHÉ</Kicker>
    <Headline t={t}>
      Estrogeni e progesterone agiscono in <Accent>tutto il corpo</Accent>:
    </Headline>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 50 }}>
      {ORGANS.map((o, i) => (
        <div
          key={o}
          style={{
            ...appear(t, 0.8 + i * 0.18),
            background: "#fff",
            color: colors.plum,
            borderRadius: 40,
            padding: "16px 30px",
            fontSize: 40,
            fontWeight: 600,
          }}
        >
          {o}
        </div>
      ))}
    </div>
  </>
);

const Hormones: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>GLI ORMONI</Kicker>
    <Headline t={t}>Intorno ai 50 anni gli ormoni cambiano.</Headline>
    <Timeline
      t={t}
      id="ormoni"
      bars={[
        { label: "Estrogeni", kind: "before" },
        { label: "Progesterone", kind: "before" },
        { label: "FSH e LH", kind: "after" },
      ]}
    />
    <Legend t={t} />
  </>
);

const Context: React.FC<{ t: number }> = ({ t }) => {
  const circle = (
    cx: number,
    cy: number,
    color: string,
    label: string,
    lx: number,
    ly: number,
    at: number,
  ) => (
    <g opacity={ease(t, at)}>
      <circle cx={cx} cy={cy} r={170} fill={color} opacity={0.35} />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        fill={colors.plum}
        fontSize={36}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
  return (
    <>
      <Kicker t={t}>OGNI DONNA È DIVERSA</Kicker>
      <Headline t={t}>Ognuna vive la menopausa a modo suo.</Headline>
      <svg width={900} height={560} style={{ marginTop: 30 }}>
        {circle(450, 190, colors.rose, "Corpo", 450, 110, 0.8)}
        {circle(340, 370, colors.plum, "Emozioni", 260, 450, 1.2)}
        {circle(560, 370, colors.navy, "Vita sociale", 650, 450, 1.6)}
        <text
          x={450}
          y={320}
          textAnchor="middle"
          fill={colors.plum}
          fontSize={30}
          fontWeight={700}
          opacity={ease(t, 2.2)}
        >
          La tua menopausa
        </text>
      </svg>
      <Sub t={t} at={2.4}>
        Contano anche la storia del ciclo, le gravidanze e i sintomi.
      </Sub>
    </>
  );
};

const Closing: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} size={88}>
      La menopausa merita <Accent>attenzione, ricerca e cure</Accent>.
    </Headline>
    <Sub t={t} at={1}>
      Parlane con il tuo medico.
    </Sub>
  </>
);

type Scene = { duration: number; Body: React.FC<{ t: number }> };

const system = (title: string, bars: Bar[]): React.FC<{ t: number }> => {
  const Scene: React.FC<{ t: number }> = ({ t }) => (
    <System t={t} title={title} bars={bars} />
  );
  return Scene;
};

const SCENES: Scene[] = [
  { duration: 4, Body: Hook },
  { duration: 6, Body: Receptors },
  { duration: 5.5, Body: Hormones },
  {
    duration: 5,
    Body: system("Umore e cervello", [
      { label: "Sbalzi d'umore", kind: "after" },
      { label: "Irritabilità", kind: "after" },
      { label: "Depressione", kind: "after" },
      { label: "Rischio per la memoria", kind: "after" },
    ]),
  },
  {
    duration: 5.5,
    Body: system("Cuore e metabolismo", [
      { label: "Vasi elastici", kind: "before" },
      { label: "Metabolismo attivo", kind: "before" },
      { label: "Pressione", kind: "after" },
      { label: "Colesterolo e trigliceridi", kind: "after" },
      { label: "Grasso sulla pancia", kind: "after" },
    ]),
  },
  {
    duration: 4.5,
    Body: system("Difese immunitarie", [
      { label: "Linfociti T", kind: "before" },
      { label: "Infiammazione cronica", kind: "after" },
    ]),
  },
  {
    duration: 5,
    Body: system("Sonno", [
      { label: "Insonnia", kind: "after" },
      { label: "Apnee notturne", kind: "after" },
      { label: "Gambe senza riposo", kind: "after" },
      { label: "Vampate e sudori notturni", kind: "after" },
    ]),
  },
  {
    duration: 5.5,
    Body: system("Reni e vie urinarie", [
      { label: "Funzione dei reni", kind: "before" },
      { label: "Cistiti ricorrenti", kind: "after" },
      { label: "Urgenza e perdite", kind: "after" },
      { label: "Rapporti dolorosi", kind: "after" },
      { label: "Secchezza vaginale", kind: "after" },
    ]),
  },
  {
    duration: 4.5,
    Body: system("Ossa e muscoli", [
      { label: "Densità ossea", kind: "before" },
      { label: "Mal di schiena e dolori", kind: "after" },
    ]),
  },
  {
    duration: 4.5,
    Body: system("Intestino", [
      { label: "Flora intestinale", kind: "before" },
      { label: "Digestione veloce", kind: "before" },
      { label: "Reflusso", kind: "after" },
    ]),
  },
  {
    duration: 4.5,
    Body: system("Pelle e mucose", [
      { label: "Pelle, occhi e bocca secchi", kind: "after" },
      { label: "Capelli e unghie più fragili", kind: "after" },
    ]),
  },
  { duration: 6, Body: Context },
  { duration: 5, Body: Closing },
];

const STARTS = SCENES.reduce<number[]>(
  (acc, sc, i) => [...acc, i ? acc[i - 1] + SCENES[i - 1].duration : 0],
  [],
);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].duration;
export const CORPO_DURATION = Math.round(TOTAL * CORPO_FPS);

export const CorpoMenopausa: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / CORPO_FPS;
  const index = STARTS.filter((s) => time >= s).length - 1;
  const { Body, duration } = SCENES[index];
  const t = time - STARTS[index];
  const out =
    index === SCENES.length - 1
      ? 1
      : interpolate(t, [duration - 0.3, duration], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.pink,
        fontFamily: inter,
        color: colors.navy,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 160,
          bottom: 340,
          left: 90,
          right: 90,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: out,
        }}
      >
        <Body t={t} />
      </div>
      <Signature color={colors.plum} fontFamily={inter} />
    </AbsoluteFill>
  );
};
