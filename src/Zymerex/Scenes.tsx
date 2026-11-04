import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Icon, IconName } from "./Icons";
import { C, GRADIENT } from "./theme";
import { cardStyle, IconDisc, Row, Slot, Stamp, TopPill, usePop, useT, Visible } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------- hook 0–3.6s
const Hook: React.FC = () => (
  <Slot from={1.3} to={3.62}>
    <div style={{ ...cardStyle, padding: "34px 44px", display: "flex", flexDirection: "column", gap: 26 }}>
      {[
        { at: 1.32, text: "Non è solo stress", icon: "lotus" as IconName },
        { at: 2.46, text: "Non è nella tua testa", icon: "brain" as IconName },
      ].map((r) => (
        <Row key={r.text} from={r.at}>
          <Stamp kind="cross" from={r.at + 0.15} size={70} />
          <span style={{ fontSize: 50, fontWeight: 800 }}>{r.text}</span>
        </Row>
      ))}
    </div>
  </Slot>
);

// ------------------------------------------------------------ symptoms 3.7–10.6
const SYMPTOMS: { at: number; label: string; icon: IconName }[] = [
  { at: 3.68, label: "Dolore", icon: "bolt" },
  { at: 4.62, label: "Gonfiore", icon: "belly" },
  { at: 5.92, label: "Stitichezza", icon: "hourglass" },
  { at: 7.72, label: "Diarrea", icon: "drop" },
];

const Chip: React.FC<{ at: number; label: string; icon: IconName; pulseAt: number }> = ({
  at,
  label,
  icon,
  pulseAt,
}) => {
  const pop = usePop(at, 10, 0.6);
  const t = useT(pulseAt);
  const pulse = t > 0 && t < 0.6 ? 1 + 0.03 * Math.sin((t / 0.6) * Math.PI) : 1;
  return (
    <div
      style={{
        ...cardStyle,
        width: 400,
        height: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: Math.min(1, pop * 2),
        transform: `scale(${interpolate(pop, [0, 1], [0.9, 1]) * pulse})`,
      }}
    >
      <IconDisc name={icon} size={120} from={at} />
      <span style={{ fontSize: 46, fontWeight: 900 }}>{label}</span>
    </div>
  );
};

const Symptoms: React.FC = () => (
  <Slot from={3.62} to={10.6} y={1000}>
    <div style={{ display: "grid", gridTemplateColumns: "400px 400px", gap: 28 }}>
      {SYMPTOMS.map((s, i) => (
        <Chip key={s.label} {...s} pulseAt={8.64 + i * 0.12} />
      ))}
    </div>
  </Slot>
);

// --------------------------------------------------------------- timer 10.7–12.2
const Timer: React.FC = () => {
  const t = useT(10.7);
  const sweep = interpolate(t, [0, 1.4], [0, 1], clamp);
  const r = 130;
  const circ = 2 * Math.PI * r;
  return (
    <Slot from={10.7} to={12.25} y={990}>
      <div style={{ position: "relative", width: 340, height: 340 }}>
        <svg width={340} height={340} style={{ position: "absolute" }}>
          <circle cx={170} cy={170} r={r + 26} fill="white" />
          <circle cx={170} cy={170} r={r} fill="none" stroke="#E3ECF5" strokeWidth={22} />
          <circle
            cx={170}
            cy={170}
            r={r}
            fill="none"
            stroke="url(#zg)"
            strokeWidth={22}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - sweep)}
            transform="rotate(-90 170 170)"
          />
          <defs>
            <linearGradient id="zg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.blue} />
              <stop offset="1" stopColor={C.blueDeep} />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            ...cardStyle,
            background: "transparent",
            boxShadow: "none",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>30</span>
          <span style={{ fontSize: 34, fontWeight: 800, color: C.blue }}>SECONDI</span>
        </div>
      </div>
    </Slot>
  );
};

// -------------------------------------------------------- people / diet 12.3–18.2
const People: React.FC = () => {
  const t = useT(12.4);
  const marks: IconName[] = ["bolt", "belly", "drop"];
  return (
    <Slot from={12.4} to={15.6}>
      <div style={{ ...cardStyle, padding: "40px 50px", display: "flex", gap: 40, alignItems: "flex-end" }}>
        {marks.map((m, i) => (
          <PersonCol key={m} mark={m} i={i} t={t} />
        ))}
      </div>
    </Slot>
  );
};

const PersonCol: React.FC<{ mark: IconName; i: number; t: number }> = ({ mark, i, t }) => {
  const at = 12.5 + i * 0.45;
  const pop = usePop(at, 12);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <IconDisc name={mark} size={86} from={at + 0.2} />
      <div style={{ transform: `scale(${pop})` }}>
        <Icon
          name="person"
          size={150}
          color={C.navy}
          stroke={4}
          progress={interpolate(t, [i * 0.45, i * 0.45 + 0.6], [0, 1], clamp)}
        />
      </div>
    </div>
  );
};

const NoDiet: React.FC = () => {
  const t = useT(15.7);
  return (
    <Slot from={15.7} to={18.25}>
      <div style={{ ...cardStyle, padding: "40px 56px", display: "flex", alignItems: "center", gap: 36 }}>
        <div style={{ position: "relative" }}>
          <Icon name="plate" size={200} color={C.navy} stroke={4} progress={interpolate(t, [0, 0.7], [0, 1], clamp)} />
          <div style={{ position: "absolute", right: -16, bottom: -6 }}>
            <Stamp kind="cross" from={16.05} size={84} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 34, fontWeight: 800, color: C.blue }}>NON ESISTE</span>
          <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05 }}>
            una dieta
            <br />
            valida per tutti
          </span>
        </div>
      </div>
    </Slot>
  );
};

// ------------------------------------------------------------- tips 18.3–24.6
const TIPS: { at: number; text: string; icon: IconName }[] = [
  { at: 18.7, text: "Gestione dello stress", icon: "lotus" },
  { at: 19.96, text: "Pasti regolari", icon: "clock" },
  { at: 21.36, text: "Fibre solubili", icon: "wheat" },
];

const Tips: React.FC = () => (
  <Slot from={18.5} to={24.6} y={1000}>
    <div style={{ ...cardStyle, padding: "36px 44px", display: "flex", flexDirection: "column", gap: 26, width: 800 }}>
      {TIPS.map((r) => (
        <Row key={r.text} from={r.at}>
          <IconDisc name={r.icon} size={100} from={r.at} />
          <span style={{ fontSize: 50, fontWeight: 800, flex: 1 }}>{r.text}</span>
          <Stamp kind="check" from={r.at + 0.35} size={64} />
        </Row>
      ))}
    </div>
  </Slot>
);

// ---------------------------------------------------------- intestine 25.0–28.2
const Gut: React.FC = () => {
  const t = useT(25.1);
  const label = usePop(26.4, 13);
  return (
    <Slot from={25.1} to={28.3}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 300,
            background: "white",
            border: `3px solid rgba(0,93,160,0.18)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 44px rgba(0,30,70,0.22)",
          }}
        >
          <Icon name="intestine" size={190} color={C.blue} stroke={3.6} progress={interpolate(t, [0.1, 1.6], [0, 1], clamp)} />
        </div>
        <div
          style={{
            ...cardStyle,
            borderRadius: 100,
            padding: "16px 40px",
            fontSize: 44,
            fontWeight: 900,
            opacity: Math.min(1, label * 2),
            transform: `translateY(${interpolate(label, [0, 1], [30, 0])}px)`,
          }}
        >
          Benessere dell’intestino
        </div>
      </div>
    </Slot>
  );
};

// ------------------------------------------------------------ products 28.4–35.8
const Glow: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size,
      background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 70%)",
    }}
  />
);

const Products: React.FC = () => {
  const t = useT(0);
  const ib = usePop(28.36);
  const move = usePop(30.08, 16);
  const rg = usePop(31.64, 11);
  const arrow = interpolate(t, [32.1, 32.6], [0, 1], clamp);
  const badge = usePop(32.3, 11);
  const same = usePop(34.26, 10);
  const out = interpolate(t, [35.55, 35.85], [1, 0], clamp);
  const float = Math.sin(t * 1.6) * 4;

  const ibW = interpolate(move, [0, 1], [640, 440]);
  const ibX = interpolate(move, [0, 1], [540, 770]);
  const ibY = interpolate(move, [0, 1], [1000, 960]);

  return (
    <Visible from={28.3} to={35.9}>
      <div style={{ position: "absolute", inset: 0, opacity: out }}>
        {/* IB-Support */}
        <div
          style={{
            opacity: ib,
            position: "absolute",
            left: ibX,
            top: ibY + float,
            transform: `translate(-50%,-50%) scale(${interpolate(ib, [0, 1], [0.85, 1])}) `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Glow size={ibW * 1.5} />
          <Img
            src={staticFile("zymerex/ib-support.png")}
            style={{ width: ibW, position: "relative", filter: "drop-shadow(0 30px 40px rgba(0,30,70,0.45))" }}
          />
        </div>

        {/* Regola-IBS (old name) */}
        <Visible from={31.6} to={36}>
          <div
            style={{
              position: "absolute",
              opacity: rg,
              left: 255,
              top: 970 - float,
              transform: `translate(-50%,-50%) scale(${interpolate(rg, [0, 1], [0.85, 1])})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Glow size={460} />
            <Img
              src={staticFile("zymerex/regola-ibs.png")}
              style={{
                height: 400,
                position: "relative",
                borderRadius: 8,
                filter: `drop-shadow(0 24px 30px rgba(0,30,70,0.45)) saturate(${interpolate(t, [32.2, 33], [1, 0.55], clamp)})`,
              }}
            />
          </div>
        </Visible>

        {/* arrow old → new + "NUOVO NOME" badge */}
        <Visible from={32} to={36}>
          <div style={{ position: "absolute", left: 420, top: 1080, transform: "translate(-50%,-50%)" }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 120,
                background: GRADIENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${Math.min(1, arrow * 1.4)})`,
                boxShadow: "0 10px 30px rgba(0,30,70,0.4)",
              }}
            >
              <Icon name="arrow" size={64} stroke={5} progress={arrow} />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 640,
              transform: `translate(-50%,-50%) scale(${interpolate(badge, [0, 1], [0.9, 1])})`,
            }}
          >
            <div
              style={{
                ...cardStyle,
                background: GRADIENT,
                color: "white",
                borderRadius: 100,
                padding: "16px 44px",
                fontSize: 46,
                opacity: badge,
                fontWeight: 900,
                letterSpacing: 2,
                whiteSpace: "nowrap",
              }}
            >
              NUOVO NOME
            </div>
          </div>
        </Visible>

        {/* "stessa formula" */}
        <Visible from={34.2} to={36}>
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 1290,
              transform: `translate(-50%,-50%) scale(${interpolate(same, [0, 1], [0.9, 1])})`,
            }}
          >
            <div
              style={{
                ...cardStyle,
                borderRadius: 100,
                padding: "14px 40px 14px 14px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: same,
                fontSize: 44,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              <Stamp kind="check" from={34.35} size={76} />
              STESSA FORMULA
            </div>
          </div>
        </Visible>
      </div>
    </Visible>
  );
};

// ------------------------------------------------------------ 5 actions 36–55
type Action = { from: number; to: number; n: number; icon: IconName; title: string; subs: { at: number; text: string }[] };

export const ACTIONS: Action[] = [
  {
    from: 35.96,
    to: 40.42,
    n: 1,
    icon: "energy",
    title: "Acido butirrico",
    subs: [
      { at: 36.7, text: "ad alto dosaggio" },
      { at: 37.96, text: "energia per le cellule del colon" },
    ],
  },
  { from: 40.46, to: 42.9, n: 2, icon: "flower", title: "Malva", subs: [{ at: 41.1, text: "normale consistenza delle feci" }] },
  { from: 42.94, to: 46.0, n: 3, icon: "leaf", title: "Menta", subs: [{ at: 43.9, text: "contrasta la formazione dei gas" }] },
  { from: 46.04, to: 49.52, n: 4, icon: "daisy", title: "Partenio", subs: [{ at: 47.0, text: "stati di tensione localizzati" }] },
  {
    from: 49.56,
    to: 55.2,
    n: 5,
    icon: "bacteria",
    title: "Probiotici",
    subs: [{ at: 52.7, text: "riequilibrio della flora intestinale" }],
  },
];

const Bubbles: React.FC<{ from: number }> = ({ from }) => {
  const t = useT(from);
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const delay = (i * 0.29) % 1.6;
        const life = ((t - delay) % 1.6) / 1.6;
        if (t < delay) return null;
        const x = ((i * 97) % 700) - 350;
        const s = 24 + ((i * 37) % 30);
        const popped = life > 0.82;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: s,
              height: s,
              borderRadius: s,
              border: "4px solid rgba(255,255,255,0.95)",
              background: "rgba(62,143,208,0.25)",
              transform: `translate(${x}px, ${interpolate(life, [0, 1], [40, -280])}px) scale(${popped ? interpolate(life, [0.82, 1], [1, 1.8]) : 1})`,
              opacity: popped ? interpolate(life, [0.82, 1], [1, 0]) : 1,
            }}
          />
        );
      })}
    </>
  );
};

const Counter: React.FC<{ from: number }> = ({ from }) => {
  const t = useT(from);
  const v = interpolate(t, [0, 1.0], [0, 6], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <span style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: C.blue }}>
      {Math.round(v)} MLD
    </span>
  );
};

const ActionCard: React.FC<{ a: Action }> = ({ a }) => {
  return (
    <Slot from={a.from} to={a.to} y={1000}>
      <div style={{ position: "relative" }}>
        {a.n === 3 ? <Bubbles from={a.from + 0.8} /> : null}
        <div
          style={{
            ...cardStyle,
            width: 880,
            padding: "36px 40px",
            display: "flex",
            alignItems: "center",
            gap: 34,
            position: "relative",
          }}
        >
          <IconDisc name={a.icon} size={190} from={a.from + 0.05} draw={0.9} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: C.blue, letterSpacing: 2 }}>
              AZIONE {a.n}/5
            </span>
            {a.n === 5 ? <Counter from={a.from + 0.1} /> : null}
            <span style={{ fontSize: a.title.length > 12 ? 56 : 66, fontWeight: 900, lineHeight: 1.05 }}>
              {a.title}
            </span>
            {a.subs.map((s) => (
              <Sub key={s.text} at={s.at} text={s.text} />
            ))}
          </div>
        </div>
      </div>
    </Slot>
  );
};

const Sub: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const p = usePop(at, 14);
  return (
    <span
      style={{
        fontSize: 36,
        fontWeight: 700,
        color: C.blue,
        lineHeight: 1.15,
        opacity: Math.min(1, p * 2),
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      }}
    >
      {text}
    </span>
  );
};

const ActionsHeader: React.FC = () => {
  const t = useT(0);
  const done = ACTIONS.filter((a) => t >= a.from).length;
  return (
    <TopPill from={35.9} to={55.25} text="5 AZIONI">
      <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
        {ACTIONS.map((a, i) => (
          <div
            key={a.n}
            style={{
              width: 26,
              height: 26,
              borderRadius: 26,
              background: i < done ? C.blue : "#D8E2EE",
              transform: `scale(${i === done - 1 ? 1.25 : 1})`,
            }}
          />
        ))}
      </div>
    </TopPill>
  );
};

// ------------------------------------------------------------- dosage 55.3–58.3
const Dosage: React.FC = () => {
  const two = usePop(55.84, 10);
  return (
    <Slot from={55.3} to={58.35} y={1000}>
      <div style={{ ...cardStyle, padding: "34px 44px", display: "flex", alignItems: "center", gap: 30, width: 880 }}>
        <Img src={staticFile("zymerex/ib-support.png")} style={{ width: 270, filter: "drop-shadow(0 14px 18px rgba(0,30,70,0.35))" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Row from={55.4}>
            <div style={{ display: "flex", gap: 4 }}>
              <IconDisc name="pill" size={78} from={55.4} />
              <div style={{ transform: `scale(${two})` }}>
                <IconDisc name="pill" size={78} from={55.84} />
              </div>
            </div>
            <span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>
              1–2
              <br />
              <span style={{ fontSize: 32, fontWeight: 800 }}>compresse</span>
            </span>
          </Row>
          <Row from={56.68}>
            <IconDisc name="plate" size={78} from={56.68} />
            <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>
              lontano dai
              <br />
              pasti principali
            </span>
          </Row>
        </div>
      </div>
    </Slot>
  );
};

export const Overlays: React.FC = () => (
  <>
    <TopPill from={0.05} to={3.62} text="PANCIA IRRITABILE" icon="intestine" />
    <Hook />
    <TopPill from={3.68} to={8.6} text="I SINTOMI" icon="belly" />
    <TopPill from={8.64} to={10.65} text="TI RICONOSCI?" icon="check" />
    <Symptoms />
    <TopPill from={10.7} to={12.25} text="ASCOLTA 30 SECONDI" icon="timer" />
    <Timer />
    <TopPill from={12.3} to={15.65} text="DA PERSONA A PERSONA" icon="people" />
    <People />
    <TopPill from={15.7} to={18.25} text="NESSUNA REGOLA FISSA" icon="plate" />
    <NoDiet />
    <TopPill from={18.3} to={24.6} text="I PRIMI SUGGERIMENTI" icon="check" />
    <Tips />
    <TopPill from={25.04} to={28.3} text="COME SUPPORTO" icon="intestine" />
    <Gut />
    <Products />
    <ActionsHeader />
    {ACTIONS.map((a) => (
      <ActionCard key={a.n} a={a} />
    ))}
    <TopPill from={55.36} to={58.35} text="COME SI ASSUME" icon="pill" />
    <Dosage />
  </>
);
