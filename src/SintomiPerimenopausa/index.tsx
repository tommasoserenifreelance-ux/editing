import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { colors, sans, serif, Signature } from "../EleonoraPiccolo/brand";

export const SINTOMI_FPS = 30;

const INTRO = 75;
const THINK = 150;
const BRIDGE = 90;
const ACTUAL = 180;
const FINALE = 195;
export const SINTOMI_DURATION = INTRO + THINK + BRIDGE + ACTUAL + FINALE;

const SOURCE = "Mayo Clinic + Flo  ·  rivista Menopause";

// One colour per symptom, shared by both charts.
const C = {
  vampate: "#C9606F",
  sonno: "#2E3A55",
  peso: "#C9A04A",
  irritabilita: "#C0683F",
  stanchezza: "#3E7C78",
  spossatezza: "#6E3F63",
  sudorazioni: "#A63D4C",
  umore: "#9B7FC0",
  digestivi: "#78966A",
  ansia: "#5A5D74",
};

type Bar = {
  label: string;
  color: string;
  value: number;
  // Different start/duration per bar so they overtake each other.
  delay: number;
  duration: number;
};

const THINK_BARS: Bar[] = [
  { label: "Vampate", color: C.vampate, value: 71, delay: 0, duration: 70 },
  {
    label: "Disturbi del sonno",
    color: C.sonno,
    value: 68,
    delay: 15,
    duration: 80,
  },
  {
    label: "Aumento di peso",
    color: C.peso,
    value: 65,
    delay: 5,
    duration: 60,
  },
  {
    label: "Irritabilità",
    color: C.irritabilita,
    value: 64,
    delay: 20,
    duration: 75,
  },
  {
    label: "Stanchezza",
    color: C.stanchezza,
    value: 64,
    delay: 25,
    duration: 70,
  },
  {
    label: "Spossatezza",
    color: C.spossatezza,
    value: 63,
    delay: 10,
    duration: 85,
  },
  {
    label: "Sudorazioni notturne",
    color: C.sudorazioni,
    value: 62,
    delay: 5,
    duration: 55,
  },
];

const ACTUAL_BARS: Bar[] = [
  {
    label: "Stanchezza",
    color: C.stanchezza,
    value: 83,
    delay: 10,
    duration: 80,
  },
  {
    label: "Spossatezza fisica e mentale",
    color: C.spossatezza,
    value: 83,
    delay: 30,
    duration: 75,
  },
  {
    label: "Irritabilità",
    color: C.irritabilita,
    value: 80,
    delay: 5,
    duration: 70,
  },
  {
    label: "Calo dell'umore",
    color: C.umore,
    value: 77,
    delay: 15,
    duration: 75,
  },
  {
    label: "Disturbi del sonno",
    color: C.sonno,
    value: 76,
    delay: 0,
    duration: 60,
  },
  {
    label: "Disturbi digestivi",
    color: C.digestivi,
    value: 76,
    delay: 25,
    duration: 70,
  },
  { label: "Ansia", color: C.ansia, value: 75, delay: 0, duration: 50 },
];

const PAD = 80;

const useAppear = (delay = 0) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { opacity: t, transform: `translateY(${(1 - t) * 24}px)` };
};

const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.rose }}>{children}</span>
);

const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 82,
}) => (
  <div
    style={{
      ...useAppear(),
      fontFamily: serif,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.05,
      color: colors.plum,
    }}
  >
    {children}
  </div>
);

const Source: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div
    style={{
      ...useAppear(delay),
      fontFamily: sans,
      fontSize: 22,
      color: colors.muted,
      marginTop: 10,
    }}
  >
    {SOURCE}
  </div>
);

const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ padding: `320px ${PAD}px 0` }}>
    {children}
  </AbsoluteFill>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const widths = [74, 74, 71, 68, 67, 67, 66];
  const order = [
    C.stanchezza,
    C.spossatezza,
    C.irritabilita,
    C.umore,
    C.sonno,
    C.digestivi,
    C.ansia,
  ];
  return (
    <Scene>
      <Title>
        I sintomi più comuni della perimenopausa, secondo la ricerca
      </Title>
      <div
        style={{
          ...useAppear(10),
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 34,
          lineHeight: 1.4,
          color: colors.rose,
          marginTop: 28,
        }}
      >
        17.494 donne. 158 paesi.
        <br />
        Indovina quale sintomo vince.
      </div>
      <div style={{ marginTop: 70 }}>
        {order.map((color, i) => {
          const t = interpolate(frame, [12 + i * 4, 32 + i * 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div key={color} style={{ height: 110 }}>
              <div
                style={{
                  fontFamily: sans,
                  fontWeight: 700,
                  fontSize: 30,
                  color: colors.navy,
                  opacity: t,
                }}
              >
                ?
              </div>
              <div
                style={{
                  marginTop: 6,
                  height: 40,
                  borderRadius: 8,
                  background: color,
                  width: `${widths[i] * t}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

const CHART_W = 1080 - PAD * 2;
const SCALE_W = CHART_W - 150; // room for the % label at 100
const ROW = 110;
const RACE_START = 20;

const valueAt = (bar: Bar, frame: number) =>
  bar.value *
  interpolate(
    frame - RACE_START,
    [bar.delay, bar.delay + bar.duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

const rankAt = (bars: Bar[], frame: number) => {
  const sorted = bars
    .map((bar, i) => ({ i, v: valueAt(bar, frame) }))
    .sort((a, b) => b.v - a.v || a.i - b.i);
  const ranks: number[] = [];
  sorted.forEach(({ i }, r) => (ranks[i] = r));
  return ranks;
};

// Averaging ranks over the last frames makes bars glide when they overtake.
const smoothRanks = (bars: Bar[], frame: number) => {
  const n = 8;
  const sum = bars.map(() => 0);
  for (let k = 0; k < n; k++) {
    rankAt(bars, Math.max(0, frame - k)).forEach((r, i) => (sum[i] += r));
  }
  return sum.map((s) => s / n);
};

const BarRace: React.FC<{ bars: Bar[] }> = ({ bars }) => {
  const frame = useCurrentFrame();
  const ranks = smoothRanks(bars, frame);
  const appear = useAppear(6);
  return (
    <div
      style={{
        ...appear,
        position: "relative",
        marginTop: 80,
        height: 40 + ROW * bars.length,
      }}
    >
      {[0, 25, 50, 75, 100].map((tick) => (
        <div
          key={tick}
          style={{
            position: "absolute",
            left: (SCALE_W * tick) / 100,
            top: 0,
            bottom: 0,
            borderLeft: `2px solid ${tick === 0 ? colors.navy : colors.grid}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -34,
              left: tick === 0 ? 0 : -24,
              fontFamily: sans,
              fontSize: 20,
              color: colors.muted,
            }}
          >
            {tick}%
          </div>
        </div>
      ))}
      {bars.map((bar, i) => {
        const v = valueAt(bar, frame);
        return (
          <div
            key={bar.label}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 20 + ranks[i] * ROW,
              fontFamily: sans,
              color: colors.navy,
            }}
          >
            <div style={{ fontWeight: 500, fontSize: 31, paddingLeft: 10 }}>
              {bar.label}
            </div>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 6 }}
            >
              <div
                style={{
                  height: 40,
                  width: (SCALE_W * v) / 100,
                  background: bar.color,
                  borderRadius: "0 8px 8px 0",
                }}
              />
              <div style={{ marginLeft: 12, fontWeight: 700, fontSize: 31 }}>
                {Math.round(v)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Subtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      ...useAppear(4),
      fontFamily: sans,
      fontWeight: 500,
      fontSize: 28,
      color: colors.navy,
      marginTop: 20,
    }}
  >
    {children}
  </div>
);

const Think: React.FC = () => (
  <Scene>
    <Title>
      Cosa le donne <Accent>PENSANO</Accent> sia la perimenopausa
    </Title>
    <Subtitle>I sintomi più conosciuti</Subtitle>
    <Source delay={4} />
    <BarRace bars={THINK_BARS} />
  </Scene>
);

const Bridge: React.FC = () => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: PAD,
      paddingBottom: 200,
    }}
  >
    <div style={{ textAlign: "center" }}>
      <Title size={96}>
        Ecco invece cosa
        <br />
        hanno riferito
        <br />
        <Accent>davvero</Accent> le donne…
      </Title>
    </div>
  </AbsoluteFill>
);

const Actual: React.FC = () => (
  <Scene>
    <Title>
      Cosa hanno <Accent>DAVVERO</Accent> le donne in perimenopausa
    </Title>
    <Subtitle>Sintomi riferiti, donne dai 35 anni in su</Subtitle>
    <Source delay={4} />
    <BarRace bars={ACTUAL_BARS} />
    <div
      style={{
        ...useAppear(125),
        fontFamily: sans,
        fontSize: 28,
        color: colors.navy,
        marginTop: 10,
      }}
    >
      <span style={{ color: colors.rose, textDecoration: "line-through" }}>
        Vampate
      </span>{" "}
      non entrano nella top 7
    </div>
  </Scene>
);

const Stat: React.FC<{
  value: number;
  label: string;
  color: string;
  delay: number;
}> = ({ value, label, color, delay }) => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [delay, delay + 20], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        ...useAppear(delay),
        display: "flex",
        alignItems: "baseline",
        marginTop: 20,
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 112,
          color,
          width: 280,
        }}
      >
        {Math.round(n)}%
      </div>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 44,
          color: colors.navy,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Finale: React.FC = () => (
  <Scene>
    <Title size={76}>E per le donne che sono in perimenopausa adesso:</Title>
    <div style={{ marginTop: 40 }}>
      <Stat value={95} label="spossatezza" color={colors.rose} delay={10} />
      <Stat value={93} label="stanchezza" color={colors.plum} delay={30} />
      <Stat value={91} label="irritabilità" color={colors.plum} delay={50} />
    </div>
    <div
      style={{
        ...useAppear(80),
        fontFamily: sans,
        fontSize: 36,
        lineHeight: 1.35,
        color: colors.navy,
        marginTop: 50,
      }}
    >
      Il sintomo più comune della perimenopausa non sono le vampate.
    </div>
    <div
      style={{
        ...useAppear(105),
        fontFamily: serif,
        fontWeight: 600,
        fontSize: 110,
        color: colors.plum,
        marginTop: 26,
      }}
    >
      È la spossatezza.
    </div>
    <Source delay={115} />
  </Scene>
);

export const SintomiPerimenopausa: React.FC = () => {
  const scenes: [number, React.ReactNode][] = [
    [INTRO, <Intro key="intro" />],
    [THINK, <Think key="think" />],
    [BRIDGE, <Bridge key="bridge" />],
    [ACTUAL, <Actual key="actual" />],
    [FINALE, <Finale key="finale" />],
  ];
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      {scenes.map(([duration, scene]) => {
        const s = (
          <Sequence key={from} from={from} durationInFrames={duration}>
            {scene}
          </Sequence>
        );
        from += duration;
        return s;
      })}
      <Signature color={colors.plum} />
    </AbsoluteFill>
  );
};
