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

const GOLD = "#C9A04A";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 0 → 1 over `dur` seconds starting at `at` (scene-local time).
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
  at?: number;
  size?: number;
  children: React.ReactNode;
}> = ({ t, at = 0.1, size = 78, children }) => (
  <div
    style={{
      ...appear(t, at),
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

const BigNumber: React.FC<{
  t: number;
  at: number;
  color?: string;
  children: React.ReactNode;
}> = ({ t, at, color = colors.rose, children }) => (
  <div
    style={{
      ...appear(t, at),
      fontSize: 180,
      fontWeight: 700,
      letterSpacing: -6,
      lineHeight: 1,
      color,
    }}
  >
    {children}
  </div>
);

// ---------- Scenes (t is seconds since the scene started) ----------

const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} size={96}>
      Cosa succede al corpo di una donna in <Accent>menopausa?</Accent>
    </Headline>
    <Sub t={t} at={1.2}>
      Un grande studio l&apos;ha misurato.
    </Sub>
  </>
);

const Study: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(
    interpolate(t, [0.4, 2.2], [0, 300], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );
  return (
    <>
      <Kicker t={t}>LO STUDIO</Kicker>
      <BigNumber t={t} at={0.2}>
        {n} milioni
      </BigNumber>
      <Sub t={t} at={1}>
        di esami del sangue,
        <br />
        di <b>oltre 1 milione di donne</b>.
      </Sub>
    </>
  );
};

const Tests: React.FC<{ t: number }> = ({ t }) => {
  const changed = Math.round(interpolate(t, [0.8, 3], [0, 52], clamp));
  return (
    <>
      <Kicker t={t}>IL RISULTATO</Kicker>
      <Headline t={t}>
        Con l&apos;ultimo ciclo, <Accent>52 esami su 90</Accent> cambiano
        all&apos;improvviso.
      </Headline>
      <div
        style={{
          ...appear(t, 0.5),
          display: "grid",
          gridTemplateColumns: "repeat(15, 44px)",
          gap: 14,
          marginTop: 50,
        }}
      >
        {Array.from({ length: 90 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: i < changed ? colors.rose : "transparent",
              border: `4px solid ${i < changed ? colors.rose : colors.grid}`,
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
      <Sub t={t} at={3.4}>
        Negli uomini della stessa età? <b>Nessun cambiamento.</b>
      </Sub>
    </>
  );
};

const CHANGES: [string, string][] = [
  ["Ossa", "più fragili"],
  ["Colesterolo", "più alto"],
  ["Fegato", "esami alterati"],
];

const WhatChanges: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>COSA CAMBIA</Kicker>
    <Headline t={t}>In poco tempo cambiano:</Headline>
    <div style={{ marginTop: 50 }}>
      {CHANGES.map(([what, how], i) => (
        <div
          key={what}
          style={{
            ...appear(t, 0.8 + i * 0.9),
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: 24,
            borderLeft: `14px solid ${colors.rose}`,
            padding: "30px 40px",
            marginBottom: 26,
            fontSize: 52,
          }}
        >
          <b style={{ color: colors.plum, width: 380 }}>{what}</b>
          <span>{how}</span>
        </div>
      ))}
    </div>
  </>
);

const Sugar: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 1.2, 1.4);
  return (
    <>
      <Kicker t={t}>LO ZUCCHERO</Kicker>
      <Headline t={t}>
        Il corpo gestisce peggio lo zucchero nel sangue.
      </Headline>
      <Sub t={t} at={0.8}>
        Negli anni intorno all&apos;ultimo ciclo peggiora{" "}
        <b style={{ color: colors.rose }}>4 volte più in fretta</b>.
      </Sub>
      <div style={{ ...appear(t, 1), marginTop: 50, fontSize: 32 }}>
        <div style={{ color: colors.muted, fontWeight: 600 }}>Prima e dopo</div>
        <div
          style={{
            height: 44,
            width: 200 * k,
            background: colors.grid,
            borderRadius: 12,
            margin: "12px 0 30px",
          }}
        />
        <div style={{ color: colors.rose, fontWeight: 700 }}>
          Intorno all&apos;ultimo ciclo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              height: 44,
              width: 800 * k,
              background: colors.rose,
              borderRadius: 12,
              marginTop: 12,
            }}
          />
          <b style={{ fontSize: 56, color: colors.rose, opacity: k }}>×4</b>
        </div>
      </div>
    </>
  );
};

const Belly: React.FC<{ t: number }> = ({ t }) => {
  const grow = ease(t, 1.2, 1.5);
  const blobs: [number, number, number][] = [
    [-110, -20, 32],
    [-60, 30, 28],
    [-10, -36, 30],
    [45, 12, 34],
    [100, -22, 28],
    [140, 26, 22],
    [-150, 24, 22],
    [10, 44, 22],
  ];
  return (
    <>
      <Kicker t={t}>LA PANCIA</Kicker>
      <Headline t={t}>
        Il grasso si accumula sulla <Accent>pancia</Accent>.
      </Headline>
      <Sub t={t} at={0.8}>
        Cresce intorno agli organi, <b>anche se il peso non cambia</b>.
      </Sub>
      <svg width={920} height={300} style={{ ...appear(t, 1), marginTop: 40 }}>
        <ellipse
          cx={460}
          cy={150}
          rx={230}
          ry={125}
          fill="#fff"
          stroke={GOLD}
          strokeWidth={12}
        />
        {blobs.map(([dx, dy, r], i) => (
          <circle
            key={i}
            cx={460 + dx}
            cy={150 + dy}
            r={r * (0.45 + 0.55 * grow)}
            fill={GOLD}
            opacity={0.85}
          />
        ))}
      </svg>
    </>
  );
};

const Therapy: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>LA BUONA NOTIZIA: SI PUÒ AGIRE</Kicker>
    <Headline t={t} size={84}>
      <Accent>1.</Accent> Terapia ormonale
    </Headline>
    <Sub t={t} at={0.8}>
      Aiuta il corpo a gestire meglio lo zucchero nel sangue.
    </Sub>
    <Sub t={t} at={2}>
      <span style={{ color: colors.muted }}>
        Ma quando si sospende, l&apos;effetto svanisce.
      </span>
    </Sub>
  </>
);

const Training: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>LA BUONA NOTIZIA: SI PUÒ AGIRE</Kicker>
    <Headline t={t} size={84}>
      <Accent>2.</Accent> Allenamento intenso
    </Headline>
    <Sub t={t} at={0.5}>
      3 volte a settimana, nei 5 anni dopo la menopausa:
    </Sub>
    <BigNumber t={t} at={1.2}>
      −1,5 kg
    </BigNumber>
    <Sub t={t} at={1.6}>
      di grasso sulla pancia, <b>e più muscoli</b>.
    </Sub>
  </>
);

const Weights: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Kicker t={t}>LA BUONA NOTIZIA: SI PUÒ AGIRE</Kicker>
    <Headline t={t} size={84}>
      <Accent>3.</Accent> Sollevare pesi
    </Headline>
    <Sub t={t} at={0.5}>
      Pesi impegnativi, 2 volte a settimana, con un professionista:
    </Sub>
    <BigNumber t={t} at={1.2}>
      ossa più forti
    </BigNumber>
    <Sub t={t} at={1.6}>
      nella colonna, <b>in soli 8 mesi</b>.
    </Sub>
  </>
);

const Closing: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Headline t={t} size={88}>
      La menopausa cambia il corpo.{" "}
      <Accent>Conoscerla aiuta a prendersene cura.</Accent>
    </Headline>
    <Sub t={t} at={1}>
      Parlane con il tuo medico.
    </Sub>
  </>
);

type Scene = {
  start: number;
  Body: React.FC<{ t: number }>;
  source?: string;
};

const SCENES: Scene[] = [
  { start: 0, Body: Hook },
  { start: 4, Body: Study, source: "Pridham 2026, Nature Medicine" },
  { start: 9, Body: Tests, source: "Pridham 2026, Nature Medicine" },
  { start: 15, Body: WhatChanges, source: "Pridham 2026, Nature Medicine" },
  {
    start: 20.5,
    Body: Sugar,
    source: "Karlamangla 2026, JCI Insight (studio SWAN)",
  },
  { start: 25.5, Body: Belly, source: "Greendale 2021, JCEM (studio SWAN)" },
  {
    start: 30.5,
    Body: Therapy,
    source: "Li 2025, Climacteric: 17 studi clinici",
  },
  { start: 35, Body: Training, source: "Hettchen 2021: studio ACTLIFE" },
  { start: 39, Body: Weights, source: "Watson 2018, JBMR: studio LIFTMOR" },
  { start: 43, Body: Closing },
];

export const EsamiMenopausa: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / ESAMI_FPS;
  const index = SCENES.filter((sc) => time >= sc.start).length - 1;
  const { start, Body, source } = SCENES[index];
  const end = SCENES[index + 1]?.start ?? ESAMI_DURATION / ESAMI_FPS + 1;
  const t = time - start;
  const out = interpolate(time, [end - 0.3, end], [1, 0], clamp);
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
      {source ? (
        <div
          style={{
            position: "absolute",
            top: 1620,
            left: 90,
            right: 90,
            fontSize: 24,
            color: colors.muted,
            opacity: out * ease(t, 0.5),
          }}
        >
          Fonte: {source}
        </div>
      ) : null}
      <Signature color={colors.plum} fontFamily={inter} />
      <Audio src={staticFile("audio/esami-menopausa.m4a")} />
    </AbsoluteFill>
  );
};
