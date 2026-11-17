import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";

export const ORMONALE_FPS = 30;
export const ORMONALE_DURATION = 2475; // 82.5 s, length of the original audio

const s = (seconds: number) => seconds * ORMONALE_FPS;

// % change since 1997 in England, read off the original chart.
const FIRST_YEAR = 1997;
const LAST_YEAR = 2024;
const HRT = [
  0, 2, 4, 6, 7, 2, -19, -36, -45, -50, -54, -56, -58, -60, -61.5, -62, -62.5,
  -62, -62.5, -60, -57.5, -52, -46, -43, -30, 6, 38, 44,
];
const CANCER = [
  0, 2, 7, 5, 7, 7, 13, 14.5, 16.5, 17, 17, 21, 22, 25, 25.5, 29, 34.5, 39, 38,
  38, 38, 43.5, 44, 20.5, 47.5, 52.5, 50.5, 55.5,
];

const HRT_COLOR = colors.plum;
const CANCER_COLOR = colors.rose;

// Each caption starts at its time and stays until the next one.
const CAPTIONS: [number, string][] = [
  [0, "Ecco le prescrizioni di terapia ormonale in Inghilterra dal 1997."],
  [7, "E le nuove diagnosi di tumore al seno nello stesso periodo."],
  [
    13,
    "Fino al 2001, terapia ormonale e tumore al seno sono cresciuti a un ritmo simile.",
  ],
  [
    20,
    "Poi nel 2002 lo studio WHI ha scatenato la paura della terapia ormonale.",
  ],
  [27, "Le prescrizioni sono crollate: nel 2013 erano scese di oltre il 60%."],
  [
    34,
    "Ma le diagnosi di tumore al seno non sono calate insieme alla terapia.",
  ],
  [44, "Poi le prescrizioni sono quasi quadruplicate."],
  [
    52,
    "Che la terapia salisse o scendesse, il tumore al seno non l'ha seguita.",
  ],
  [
    62,
    "Nel 2025 gli Stati Uniti hanno iniziato a rimuovere le principali avvertenze sulla terapia ormonale.",
  ],
  [
    68,
    "Oggi in Inghilterra le linee guida NICE raccomandano la terapia ormonale per i sintomi della menopausa.",
  ],
  [
    74,
    "Sono dati di popolazione: il tuo rischio personale va valutato con il tuo medico.",
  ],
];

// How far (in years) each line is drawn: [start s, end s, from year, to year].
type Reveal = [number, number, number, number];
const HRT_REVEAL: Reveal[] = [
  [14, 17, 1997, 2001],
  [22, 23, 2001, 2002],
  [28, 32, 2002, 2013],
  [45, 50, 2013, 2024],
];
const CANCER_REVEAL: Reveal[] = [
  [14, 17, 1997, 2001],
  [22, 23, 2001, 2002],
  [35, 41, 2002, 2019],
  [54, 58, 2019, 2024],
];

const revealedYear = (reveals: Reveal[], frame: number) => {
  let year = FIRST_YEAR;
  for (const [start, end, from, to] of reveals) {
    if (frame >= s(start)) {
      year = interpolate(frame, [s(start), s(end)], [from, to], {
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }
  return year;
};

// Chart geometry.
const PLOT = { left: 150, right: 830, top: 60, bottom: 560 };
const Y_MIN = -70;
const Y_MAX = 70;
const xOf = (year: number) =>
  PLOT.left +
  ((year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR)) * (PLOT.right - PLOT.left);
const yOf = (value: number) =>
  PLOT.bottom - ((value - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT.bottom - PLOT.top);

// Catmull-Rom through the yearly points, sampled finely so the line can be
// revealed up to any fractional year.
const STEPS = 12;
const smooth = (values: number[]) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < values.length - 1; i++) {
    const p0 = values[Math.max(0, i - 1)];
    const p1 = values[i];
    const p2 = values[i + 1];
    const p3 = values[Math.min(values.length - 1, i + 2)];
    for (let k = 0; k < STEPS; k++) {
      const t = k / STEPS;
      const v =
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
      pts.push([FIRST_YEAR + i + t, v]);
    }
  }
  pts.push([LAST_YEAR, values[values.length - 1]]);
  return pts;
};
const HRT_CURVE = smooth(HRT);
const CANCER_CURVE = smooth(CANCER);

const pointAt = (curve: [number, number][], year: number): [number, number] => {
  const i = Math.min(curve.length - 2, Math.floor((year - FIRST_YEAR) * STEPS));
  const [y0, v0] = curve[i];
  const [y1, v1] = curve[i + 1];
  const t = (year - y0) / (y1 - y0);
  return [year, v0 + (v1 - v0) * t];
};

const pathUpTo = (curve: [number, number][], year: number) => {
  const pts = curve.filter(([y]) => y < year);
  pts.push(pointAt(curve, year));
  return pts
    .map(([y, v], i) => `${i ? "L" : "M"}${xOf(y)},${yOf(v)}`)
    .join(" ");
};

const fadeIn = (frame: number, at: number) =>
  interpolate(frame, [s(at), s(at) + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Line: React.FC<{
  curve: [number, number][];
  year: number;
  color: string;
  label: string[];
  // Label offset from the point, which may depend on the current value.
  labelDy: (value: number) => number;
  opacity: number;
}> = ({ curve, year, color, label, labelDy, opacity }) => {
  const [y, v] = pointAt(curve, year);
  const cx = xOf(y);
  const cy = yOf(v);
  return (
    <g opacity={opacity}>
      {year > FIRST_YEAR ? (
        <path
          d={pathUpTo(curve, year)}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={colors.pink}
        stroke={color}
        strokeWidth={5}
      />
      <text
        x={cx + 22}
        y={cy + labelDy(v)}
        fill={color}
        fontSize={34}
        fontWeight={700}
      >
        {label.map((l, i) => (
          <tspan key={l} x={cx + 22} dy={i ? 38 : 0}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const Marker: React.FC<{
  year: number;
  title: string;
  subtitle: string;
  anchor: "start" | "end";
  opacity: number;
}> = ({ year, title, subtitle, anchor, opacity }) => {
  const x = xOf(year);
  const dx = anchor === "end" ? -14 : 14;
  return (
    <g opacity={opacity}>
      <line
        x1={x}
        x2={x}
        y1={PLOT.top - 40}
        y2={PLOT.bottom}
        stroke={colors.navy}
        strokeWidth={4}
        strokeDasharray="12 10"
      />
      <circle cx={x} cy={PLOT.top - 40} r={8} fill={colors.navy} />
      <text
        x={x + dx}
        y={PLOT.top - 92}
        textAnchor={anchor}
        fill={colors.navy}
        fontSize={30}
        fontWeight={700}
      >
        {title}
      </text>
      <text
        x={x + dx}
        y={PLOT.top - 56}
        textAnchor={anchor}
        fill={colors.navy}
        fontSize={26}
      >
        {subtitle}
      </text>
    </g>
  );
};

const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  const hrtYear = revealedYear(HRT_REVEAL, frame);
  const cancerYear = revealedYear(CANCER_REVEAL, frame);
  return (
    <svg width={1080} height={740} style={{ fontFamily: inter }}>
      <g transform="translate(0, 110)">
        {[60, 30, 0, -30, -60].map((v) => (
          <g key={v}>
            <line
              x1={PLOT.left}
              x2={PLOT.right}
              y1={yOf(v)}
              y2={yOf(v)}
              stroke={v === 0 ? colors.muted : colors.grid}
              strokeWidth={v === 0 ? 3 : 2}
            />
            <text
              x={PLOT.left - 16}
              y={yOf(v) + 9}
              textAnchor="end"
              fill={colors.muted}
              fontSize={26}
            >
              {v > 0 ? `+${v}%` : v < 0 ? `−${-v}%` : "0%"}
            </text>
          </g>
        ))}
        {[1997, 2002, 2007, 2012, 2017, 2022].map((y) => (
          <text
            key={y}
            x={xOf(y)}
            y={PLOT.bottom + 46}
            textAnchor="middle"
            fill={colors.muted}
            fontSize={26}
          >
            {y}
          </text>
        ))}
        <Marker
          year={2002}
          title="2002: studio WHI"
          subtitle="paura della terapia"
          anchor="start"
          opacity={fadeIn(frame, 21)}
        />
        <Marker
          year={2020}
          title="2020: Covid"
          subtitle="screening sospesi"
          anchor="start"
          opacity={fadeIn(frame, 53)}
        />
        <Line
          curve={CANCER_CURVE}
          year={cancerYear}
          color={CANCER_COLOR}
          label={["Tumore", "al seno"]}
          labelDy={() => -50}
          opacity={fadeIn(frame, 7)}
        />
        <Line
          curve={HRT_CURVE}
          year={hrtYear}
          color={HRT_COLOR}
          label={["Terapia", "ormonale"]}
          labelDy={(v) => (v < -30 ? -70 : 44)}
          opacity={1}
        />
      </g>
    </svg>
  );
};

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const index = CAPTIONS.filter(([at]) => frame >= s(at)).length - 1;
  const [at, text] = CAPTIONS[index];
  return (
    <div
      style={{
        opacity: interpolate(frame, [s(at), s(at) + 15], [0.3, 1], {
          extrapolateRight: "clamp",
        }),
        height: 200,
        marginTop: 40,
        fontSize: 46,
        fontWeight: 700,
        lineHeight: 1.25,
        color: colors.rose,
      }}
    >
      {text}
    </div>
  );
};

export const TerapiaOrmonale: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.pink,
      fontFamily: inter,
      color: colors.navy,
    }}
  >
    <div style={{ padding: "230px 80px 0" }}>
      <div
        style={{
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
          color: colors.plum,
        }}
      >
        Terapia ormonale e tumore al seno
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, marginTop: 24 }}>
        Prescrizioni di terapia ormonale e nuove diagnosi
      </div>
      <div style={{ fontSize: 28, color: colors.muted, marginTop: 8 }}>
        % di variazione dal 1997 | Inghilterra
      </div>
      <Caption />
    </div>
    <div style={{ position: "absolute", top: 820, left: 0 }}>
      <Chart />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1590,
        left: 80,
        right: 80,
        fontSize: 22,
        lineHeight: 1.4,
        color: colors.muted,
      }}
    >
      Terapia ormonale: NHS Prescription Cost Analysis, prescrizioni (BNF
      6.4.1.1), 2003 stimato. Tumore al seno: ONS e NDRS, nuove diagnosi nelle
      donne.
    </div>
    <Signature color={colors.plum} fontFamily={inter} />
    <Audio src={staticFile("audio/terapia-ormonale.m4a")} />
  </AbsoluteFill>
);
