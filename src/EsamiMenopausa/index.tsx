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

export const ESAMI_FPS = 30;
export const ESAMI_DURATION = 1398; // 46.6 s, length of the original audio

const HER = colors.rose;
const HIM = colors.navy;
const GOLD = "#C9A04A";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Scene boundaries in seconds, matching the original's pacing.
type Scene = {
  start: number;
  caption: string;
  source: string;
  Panel: React.FC<{ t: number }>;
};

// ---------- Walking scene ----------

const HER_X = 520;
const SPEED = 110; // px of ground per second
const MEN_Y = 1000;
const HER_Y = 1060;
const LAST_PERIOD = 3.9; // s, when she passes her last period
const MEN_LEAVE = [17.5, 19.5];
const WEIGHTS_FROM = 33.8;
const FAT_RING = [25, 29];
const BONE_RISE_FROM = 39;

// Height of her ground at a given moment of her timeline.
const herGround = (tau: number) => {
  const drop = interpolate(
    tau,
    [LAST_PERIOD - 0.15, LAST_PERIOD + 0.15],
    [0, 1],
    clamp,
  );
  const rise = interpolate(tau, [BONE_RISE_FROM, BONE_RISE_FROM + 4], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  return MEN_Y + drop * (HER_Y - MEN_Y) - rise * 26;
};

const TICKS: [number, string][] = [
  [LAST_PERIOD, "ULTIMO CICLO"],
  [10, "1 ANNO DOPO"],
  [17, "2 ANNI DOPO"],
  [22, "2,5 ANNI DOPO"],
  [27, "3 ANNI DOPO"],
  [32.5, "4 ANNI DOPO"],
  [40.5, "5 ANNI DOPO"],
  [44.5, "8 MESI DOPO"],
];

const Walker: React.FC<{
  x: number;
  ground: number;
  color: string;
  t: number;
  scale?: number;
  weights?: number;
  ring?: number;
}> = ({ x, ground, color, t, scale = 1, weights = 0, ring = 0 }) => {
  const phase = t * Math.PI * 2 * 0.9;
  const swing = Math.sin(phase) * 0.45;
  const leg = 70 * scale;
  const torso = 80 * scale;
  const hip = ground - leg * 2 * 0.95;
  const shoulder = hip - torso;
  const limb = (angle: number, len: number, bend: number) => {
    const kx = x + Math.sin(angle) * len;
    const ky = hip + Math.cos(angle) * len;
    const fx = kx + Math.sin(angle + bend) * len;
    const fy = ky + Math.cos(angle + bend) * len;
    return `M${x},${hip} L${kx},${ky} L${fx},${fy}`;
  };
  const arm = (angle: number) => {
    const len = 52 * scale;
    const ex = x + Math.sin(angle) * len;
    const ey = shoulder + 8 + Math.cos(angle) * len;
    const hx = ex + Math.sin(angle - 0.5) * len;
    const hy = ey + Math.cos(angle - 0.5) * len;
    return { d: `M${x},${shoulder + 8} L${ex},${ey} L${hx},${hy}`, hx, hy };
  };
  const front = arm(-swing * 0.8);
  const back = arm(swing * 0.8);
  const stroke = {
    stroke: color,
    strokeWidth: 13 * scale,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <g>
      <ellipse
        cx={x}
        cy={ground + 4}
        rx={40 * scale}
        ry={6 * scale}
        fill="rgba(46,58,85,0.12)"
      />
      <path d={limb(swing, leg, -Math.max(0, -swing) * 0.8)} {...stroke} />
      <path d={limb(-swing, leg, -Math.max(0, swing) * 0.8)} {...stroke} />
      <path d={back.d} {...stroke} opacity={0.85} />
      <line x1={x} y1={hip} x2={x} y2={shoulder} {...stroke} />
      <circle cx={x} cy={shoulder - 26 * scale} r={24 * scale} fill={color} />
      <path d={front.d} {...stroke} />
      {weights > 0 ? (
        <g opacity={weights}>
          <rect
            x={front.hx - 22}
            y={front.hy - 7}
            width={44}
            height={14}
            rx={4}
            fill={colors.navy}
          />
          <rect
            x={front.hx - 30}
            y={front.hy - 16}
            width={12}
            height={32}
            rx={4}
            fill={colors.navy}
          />
          <rect
            x={front.hx + 18}
            y={front.hy - 16}
            width={12}
            height={32}
            rx={4}
            fill={colors.navy}
          />
        </g>
      ) : null}
      {ring > 0 ? (
        <ellipse
          cx={x}
          cy={hip - 18}
          rx={42}
          ry={10}
          fill="none"
          stroke={GOLD}
          strokeWidth={6}
          opacity={ring}
        />
      ) : null}
    </g>
  );
};

const WalkScene: React.FC<{ t: number }> = ({ t }) => {
  const xs = Array.from({ length: 109 }, (_, i) => i * 10);
  const herLine = xs
    .map((x, i) => {
      const tau = t + (x - HER_X) / SPEED;
      return `${i ? "L" : "M"}${x},${herGround(tau)}`;
    })
    .join(" ");
  const menOut = interpolate(t, MEN_LEAVE, [0, 1], clamp);
  const weights = interpolate(
    t,
    [WEIGHTS_FROM, WEIGHTS_FROM + 0.5],
    [0, 1],
    clamp,
  );
  const ring =
    interpolate(t, [FAT_RING[0], FAT_RING[0] + 0.5], [0, 1], clamp) *
    interpolate(t, [FAT_RING[1] - 0.5, FAT_RING[1]], [1, 0], clamp);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g opacity={1 - menOut}>
        <line
          x1={0}
          x2={1080}
          y1={MEN_Y}
          y2={MEN_Y}
          stroke={HIM}
          strokeWidth={4}
        />
        <text
          x={1040}
          y={MEN_Y - 16}
          textAnchor="end"
          fill={HIM}
          fontSize={26}
          fontWeight={600}
          letterSpacing={2}
        >
          UOMINI
        </text>
      </g>
      <path d={herLine} fill="none" stroke={HER} strokeWidth={6} />
      <line
        x1={0}
        x2={1080}
        y1={1120}
        y2={1120}
        stroke={colors.grid}
        strokeWidth={3}
      />
      {TICKS.map(([at, label]) => {
        const x = HER_X + (at - t) * SPEED;
        if (x < -200 || x > 1300) return null;
        const active = Math.abs(at - t) < 2.5;
        return (
          <g key={label}>
            <line
              x1={x}
              x2={x}
              y1={1110}
              y2={1130}
              stroke={colors.muted}
              strokeWidth={3}
            />
            {at === LAST_PERIOD || at === 22 || at === 44.5 ? (
              <line
                x1={x}
                x2={x}
                y1={720}
                y2={1110}
                stroke={colors.muted}
                strokeWidth={2}
                strokeDasharray="8 8"
              />
            ) : null}
            <text
              x={x}
              y={1166}
              textAnchor="middle"
              fill={active ? HER : colors.muted}
              fontSize={26}
              fontWeight={600}
              letterSpacing={2}
            >
              {label}
            </text>
          </g>
        );
      })}
      {menOut < 1 ? (
        <g transform={`translate(${-menOut * 500}, 0)`} opacity={1 - menOut}>
          <Walker
            x={HER_X - 190}
            ground={MEN_Y}
            color={HIM}
            t={t + 0.3}
            scale={1.08}
          />
        </g>
      ) : null}
      <Walker
        x={HER_X}
        ground={herGround(t)}
        color={HER}
        t={t}
        weights={weights}
        ring={ring}
      />
    </svg>
  );
};

// ---------- Data panels ----------

const label: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: 2,
};

const big: React.CSSProperties = {
  fontSize: 96,
  fontWeight: 700,
  letterSpacing: -3,
  lineHeight: 1,
};

// Deterministic bar heights for the 52 tests that changed.
const BARS = Array.from({ length: 52 }, (_, i) => {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  const r = v - Math.floor(v);
  const sign = i < 6 || (i > 30 && i < 38) ? -1 : 1;
  return sign * (16 + r * 44) * (i === 34 ? 1.8 : 1);
});
const HIGHLIGHTS: [number, string][] = [
  [8, "DENSITÀ OSSEA"],
  [14, "COLESTEROLO LDL"],
  [24, "ENZIMI DEL FEGATO"],
  [42, "SODIO NEL SANGUE"],
];

const TestsPanel: React.FC<{ t: number; detail: boolean }> = ({
  t,
  detail,
}) => {
  const shown = detail
    ? 52
    : Math.round(interpolate(t, [3.9, 7], [0, 52], clamp));
  const hi = detail
    ? HIGHLIGHTS[
        Math.min(3, Math.floor(interpolate(t, [7.7, 11.6], [0, 4], clamp)))
      ]
    : null;
  return (
    <div style={{ position: "relative", height: 320 }}>
      {hi ? (
        <div
          style={{
            ...label,
            color: HER,
            position: "absolute",
            left: 120,
            top: 0,
          }}
        >
          {hi[1]}
        </div>
      ) : null}
      <svg width={920} height={320}>
        <text
          x={0}
          y={140}
          fill={HER}
          fontSize={30}
          fontWeight={700}
          letterSpacing={2}
        >
          LEI
        </text>
        <text
          x={0}
          y={280}
          fill={HIM}
          fontSize={30}
          fontWeight={700}
          letterSpacing={2}
        >
          LUI
        </text>
        <line
          x1={110}
          x2={720}
          y1={130}
          y2={130}
          stroke={HER}
          strokeWidth={2}
          strokeDasharray="3 7"
        />
        <line
          x1={110}
          x2={720}
          y1={270}
          y2={270}
          stroke={HIM}
          strokeWidth={2}
          strokeDasharray="3 7"
        />
        {BARS.slice(0, shown).map((h, i) => {
          const x = 110 + i * 9;
          const lit = hi ? Math.abs(i - hi[0]) <= 2 : true;
          return (
            <rect
              key={i}
              x={x}
              y={h > 0 ? 130 - h : 130}
              width={6}
              height={Math.abs(h)}
              fill={HER}
              opacity={lit ? 1 : 0.3}
            />
          );
        })}
        {hi ? (
          <rect
            x={110 + (hi[0] - 2) * 9 - 6}
            y={60}
            width={5 * 9 + 6}
            height={110}
            rx={8}
            fill="none"
            stroke={HER}
            strokeWidth={3}
          />
        ) : null}
        <text
          x={920}
          y={120}
          textAnchor="end"
          fill={HER}
          fontSize={56}
          fontWeight={700}
        >
          {shown}
          <tspan fill={colors.muted} fontSize={36} fontWeight={500}>
            {" "}
            / 90
          </tspan>
        </text>
        <text
          x={920}
          y={260}
          textAnchor="end"
          fill={HIM}
          fontSize={56}
          fontWeight={700}
        >
          0
          <tspan fill={colors.muted} fontSize={36} fontWeight={500}>
            {" "}
            / 90
          </tspan>
        </text>
      </svg>
    </div>
  );
};

const SYSTEMS_WOMEN = [
  "Lipidi nel sangue",
  "Densità ossea",
  "Reni",
  "Fegato",
  "Sonno",
];

const SystemsPanel: React.FC<{ t: number }> = ({ t }) => {
  const appear = (i: number) =>
    interpolate(t, [12.2 + i * 0.5, 12.6 + i * 0.5], [0, 1], clamp);
  return (
    <div style={{ display: "flex", gap: 80, paddingTop: 10 }}>
      <div>
        <div style={{ ...label, color: HER }}>PIÙ FORTE NELLE DONNE</div>
        {SYSTEMS_WOMEN.map((s, i) => (
          <div
            key={s}
            style={{
              opacity: appear(i),
              fontSize: 36,
              fontWeight: 600,
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: HER,
              }}
            />
            {s}
          </div>
        ))}
      </div>
      <div>
        <div style={{ ...label, color: HIM }}>PIÙ FORTE NEGLI UOMINI</div>
        <div
          style={{
            opacity: appear(5),
            fontSize: 36,
            fontWeight: 600,
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{ width: 16, height: 16, borderRadius: 8, background: HIM }}
          />
          Fragilità
        </div>
        <div
          style={{
            opacity: appear(6),
            fontSize: 28,
            color: colors.muted,
            marginTop: 40,
            lineHeight: 1.4,
          }}
        >
          su 14 sistemi
          <br />
          del corpo
        </div>
      </div>
    </div>
  );
};

const GaugePanel: React.FC<{ t: number }> = ({ t }) => {
  const v = interpolate(t, [19.8, 22.5], [1, 4.3], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const segs = 30;
  const lit = Math.round((v / 5) * segs);
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 50, paddingTop: 10 }}
    >
      <svg width={360} height={220}>
        {Array.from({ length: segs }, (_, i) => {
          const a = Math.PI + (i / (segs - 1)) * Math.PI;
          const cx = 180;
          const cy = 200;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * 130}
              y1={cy + Math.sin(a) * 130}
              x2={cx + Math.cos(a) * 170}
              y2={cy + Math.sin(a) * 170}
              stroke={i < lit ? HER : colors.grid}
              strokeWidth={8}
              strokeLinecap="round"
            />
          );
        })}
        <text
          x={180}
          y={175}
          textAnchor="middle"
          fill={HER}
          fontSize={72}
          fontWeight={700}
          letterSpacing={-2}
        >
          {v.toFixed(1).replace(".", ",")}%
        </text>
        <text
          x={180}
          y={212}
          textAnchor="middle"
          fill={colors.navy}
          fontSize={26}
          fontWeight={600}
          letterSpacing={2}
        >
          ALL&apos;ANNO
        </text>
      </svg>
      <div style={{ fontSize: 32, lineHeight: 1.4 }}>
        <div style={{ ...label, color: HER }}>RESISTENZA ALL&apos;INSULINA</div>
        <div style={{ marginTop: 14 }}>
          Prima e dopo: <b>circa 1%</b>
          <br />
          Intorno all&apos;ultimo ciclo: <b style={{ color: HER }}>4,3%</b>
        </div>
      </div>
    </div>
  );
};

const FatPanel: React.FC<{ t: number }> = ({ t }) => {
  const grow = interpolate(t, [25.3, 27.5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const blobs: [number, number, number][] = [
    [-90, -20, 26],
    [-50, 25, 22],
    [-10, -30, 24],
    [35, 10, 28],
    [80, -18, 22],
    [110, 22, 18],
    [-120, 20, 18],
    [10, 35, 18],
    [60, -40, 16],
  ];
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 60, paddingTop: 10 }}
    >
      <svg width={380} height={220}>
        <ellipse
          cx={190}
          cy={110}
          rx={175}
          ry={95}
          fill={colors.cream}
          stroke={GOLD}
          strokeWidth={10}
        />
        {blobs.map(([dx, dy, r], i) => (
          <circle
            key={i}
            cx={190 + dx}
            cy={110 + dy}
            r={r * (0.6 + 0.4 * grow)}
            fill={GOLD}
            opacity={0.85}
          />
        ))}
        <circle cx={160} cy={100} r={20} fill={colors.muted} opacity={0.5} />
        <circle cx={230} cy={130} r={16} fill={colors.muted} opacity={0.5} />
      </svg>
      <div>
        <div style={{ ...label, color: GOLD }}>GRASSO VISCERALE</div>
        <div style={{ ...big, color: GOLD, marginTop: 10 }}>
          +{Math.round(6 * grow)}%
        </div>
        <div style={{ ...label, color: colors.navy, marginTop: 10 }}>
          ALL&apos;ANNO
        </div>
      </div>
    </div>
  );
};

const TrialsPanel: React.FC<{ t: number }> = ({ t }) => {
  const dots = Math.round(interpolate(t, [29.3, 30.8], [0, 17], clamp));
  const bar = interpolate(t, [31, 32.5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 700, width: 220 }}>
          17 STUDI
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {Array.from({ length: 17 }, (_, i) => (
            <span
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: HER,
                opacity: i < dots ? 1 : 0.15,
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 34,
        }}
      >
        <div style={{ ...label, width: 220, color: colors.muted }}>PLACEBO</div>
        <div
          style={{
            height: 30,
            width: 520 * bar,
            background: "#B9AEB4",
            borderRadius: 8,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginTop: 20,
        }}
      >
        <div style={{ ...label, width: 220, color: HER }}>TERAPIA</div>
        <div
          style={{
            height: 30,
            width: 420 * bar,
            background: HER,
            borderRadius: 8,
          }}
        />
        <div style={{ ...label, color: HER, opacity: bar }}>PIÙ BASSA</div>
      </div>
      <div
        style={{ ...label, color: colors.navy, marginTop: 26, marginLeft: 244 }}
      >
        RESISTENZA ALL&apos;INSULINA
      </div>
    </div>
  );
};

const fmtKg = (v: number) =>
  `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1).replace(".", ",")} kg`;

const TrainingPanel: React.FC<{ t: number }> = ({ t }) => {
  const k = interpolate(t, [34.2, 36.5], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ display: "flex", gap: 90, paddingTop: 10 }}>
      <div>
        <div style={{ ...label, color: colors.navy }}>GRASSO ADDOMINALE</div>
        <div style={{ ...big, color: HER, marginTop: 14 }}>
          {fmtKg(-1.5 * k || -0.0001)}
        </div>
        <div
          style={{ ...label, color: colors.muted, marginTop: 14, fontSize: 24 }}
        >
          ESERCIZIO LEGGERO +0,1
        </div>
      </div>
      <div>
        <div style={{ ...label, color: colors.navy }}>MUSCOLO</div>
        <div style={{ ...big, color: HER, marginTop: 14 }}>
          {fmtKg(0.4 * k || 0.0001)}
        </div>
        <div
          style={{ ...label, color: colors.muted, marginTop: 14, fontSize: 24 }}
        >
          ESERCIZIO LEGGERO −0,4
        </div>
      </div>
    </div>
  );
};

const LIFT = [
  "5 serie da 5",
  "85% del massimale",
  "2 volte a settimana",
  "Con supervisione",
];

const LiftingPanel: React.FC<{ t: number }> = ({ t }) => {
  const appear = (i: number) =>
    interpolate(t, [39.2 + i * 0.4, 39.6 + i * 0.4], [0, 1], clamp);
  const k = interpolate(t, [41.5, 44], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ display: "flex", gap: 70, paddingTop: 10 }}>
      <div>
        {LIFT.map((s, i) => (
          <div
            key={s}
            style={{
              opacity: appear(i),
              fontSize: 34,
              fontWeight: 600,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: HER,
              }}
            />
            {s}
          </div>
        ))}
      </div>
      <div style={{ opacity: interpolate(t, [41.3, 41.8], [0, 1], clamp) }}>
        <div style={{ ...big, color: HER }}>
          +{(2.9 * k).toFixed(1).replace(".", ",")}%
        </div>
        <div style={{ ...label, color: colors.navy, marginTop: 14 }}>
          DENSITÀ OSSEA
          <br />
          DELLA COLONNA
        </div>
        <div
          style={{ ...label, color: colors.muted, marginTop: 14, fontSize: 24 }}
        >
          ESERCIZIO LEGGERO −1,2%
        </div>
      </div>
    </div>
  );
};

const START = 0;
const SCENES: Scene[] = [
  {
    start: START,
    caption:
      "300 milioni di esami, allineati in base all'ultimo ciclo di ogni donna, non alla sua età.",
    source:
      "Pridham 2026, Nat Med: oltre 300 milioni di esami, oltre 1 milione di donne",
    Panel: ({ t }) => <TestsPanel t={t} detail={false} />,
  },
  {
    start: 3.8,
    caption:
      "52 esami su 90 sono cambiati di colpo in quel momento. Negli uomini della stessa età, nessun salto.",
    source:
      "Pridham 2026, Nat Med: oltre 300 milioni di esami, oltre 1 milione di donne",
    Panel: ({ t }) => <TestsPanel t={t} detail={false} />,
  },
  {
    start: 7.7,
    caption:
      "La densità ossea è calata ovunque. LDL, enzimi del fegato e sodio nel sangue sono saliti. La glicemia no.",
    source:
      "Pridham 2026, Nat Med: oltre 300 milioni di esami, oltre 1 milione di donne",
    Panel: ({ t }) => <TestsPanel t={t} detail />,
  },
  {
    start: 11.6,
    caption:
      "Su 14 sistemi del corpo, 5 invecchiano più in fretta nelle donne: lipidi nel sangue, ossa, reni, fegato e sonno. Negli uomini, solo la fragilità.",
    source: "Reicher 2024, Nat Aging: Human Phenotype Project",
    Panel: SystemsPanel,
  },
  {
    start: 19.2,
    caption:
      "La resistenza all'insulina non fa un salto: sale del 4,3% all'anno nei 4 anni intorno all'ultimo ciclo, circa l'1% prima e dopo.",
    source: "Karlamangla 2026, JCI Insight: SWAN, 1.315 donne",
    Panel: GaugePanel,
  },
  {
    start: 25,
    caption:
      "Il grasso intorno agli organi cresce di circa il 6% all'anno in quegli anni. Il peso, invece, non aumenta più in fretta.",
    source: "Greendale 2021, JCEM · Greendale 2019: SWAN",
    Panel: FatPanel,
  },
  {
    start: 29,
    caption:
      "In 17 studi, la terapia ormonale ha ridotto la resistenza all'insulina. Dieci anni dopo averla sospesa, la differenza era sparita.",
    source: "Li 2025, Climacteric: 17 studi clinici · KEEPS, Kantarci 2024",
    Panel: TrialsPanel,
  },
  {
    start: 33.8,
    caption:
      "Nei 5 anni dopo la menopausa, allenarsi in modo intenso 3 volte a settimana ha tolto 1,5 kg di grasso addominale e aggiunto muscolo.",
    source: "Hettchen 2021: studio ACTLIFE, 54 donne, 13 mesi",
    Panel: TrainingPanel,
  },
  {
    start: 38.8,
    caption:
      "Sollevare pesi, e continuare a farlo: 5 serie da 5 all'85% del massimale, due volte a settimana, hanno aumentato del 2,9% l'osso della colonna in 8 mesi.",
    source: "Watson 2018, JBMR: LIFTMOR, 101 donne · Kemmler 2021",
    Panel: LiftingPanel,
  },
];

export const EsamiMenopausa: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / ESAMI_FPS;
  const index = SCENES.filter((sc) => t >= sc.start).length - 1;
  const scene = SCENES[index];
  const fade = interpolate(
    t,
    [scene.start, scene.start + 0.4],
    [index === 0 ? 1 : 0, 1],
    clamp,
  );
  const sourceChanged =
    index === 0 || SCENES[index - 1].source !== scene.source;
  const { Panel } = scene;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.pink,
        fontFamily: inter,
        color: colors.navy,
      }}
    >
      <WalkScene t={t} />
      <div style={{ position: "absolute", top: 190, left: 80, right: 80 }}>
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: colors.plum,
          }}
        >
          La menopausa ha cambiato 52 esami su 90{" "}
          <span style={{ color: colors.rose }}>tutti insieme.</span>
        </div>
        <div
          style={{
            opacity: fade,
            marginTop: 30,
            background: colors.plum,
            color: "#fff",
            borderRadius: 16,
            padding: "22px 28px",
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          {scene.caption}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1220,
          left: 80,
          right: 80,
          opacity: fade,
        }}
      >
        <Panel t={t} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1590,
          left: 80,
          right: 80,
          fontSize: 22,
          color: colors.muted,
          opacity: sourceChanged ? fade : 1,
        }}
      >
        <b>DATI</b> {scene.source}
      </div>
      <Signature color={colors.plum} fontFamily={inter} />
      <Audio src={staticFile("audio/esami-menopausa.m4a")} />
    </AbsoluteFill>
  );
};
