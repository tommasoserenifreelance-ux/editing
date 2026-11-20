import { interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Chip, EASE, Title, useIn } from "../Bonaccorso/Motion";
import { colors, sans, serif } from "../Bonaccorso/theme";

// Full-screen blue cutaways drawn for the collagen video. Their graphics sit
// in the top half (y 200-1000) so the captions below stay clear. Cue frames
// are relative to the start of each animation.

// Treatment → 3 → 12 → 18 months. The line runs to each stop as he says it;
// each stop lands with a ring pulse and grows a collagen bundle; "Collagene"
// and the type I / type III chips land on their words.
export const CollagenTimeline: React.FC<{
  atCollagen: number;
  atType1: number;
  atType3: number;
  at12: number;
  at18: number;
}> = ({ atCollagen, atType1, atType3, at12, at18 }) => {
  const frame = useCurrentFrame();
  const x = (i: number) => 150 + i * 260;
  const ease = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], {
      easing: EASE,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  // The line reaches stop 1 straight away, then 2 and 3 on their words.
  const reach = ease(0, 8) + ease(at12 - 6, at12) + ease(at18 - 6, at18);
  const stops = [
    { label: "Trattamento", value: "", at: 0 },
    { label: "mesi", value: "3", at: 4 },
    { label: "mesi", value: "12", at: at12 },
    { label: "mesi", value: "18", at: at18 },
  ];
  return (
    <Backdrop>
      <Title text="Il collagene" italic="nel tempo" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <line
          x1={x(0)}
          y1={640}
          x2={x(3)}
          y2={640}
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.2}
        />
        <line
          x1={x(0)}
          y1={640}
          x2={x(0) + 260 * reach}
          y2={640}
          stroke="white"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {stops.map((s, i) => (
          <Stop key={i} x={x(i)} {...s} built={i > 0} />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 850,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Chip text="↑ Collagene" at={atCollagen} />
        <div style={{ display: "flex", gap: 20 }}>
          <Chip text="Tipo I" at={atType1} light size={38} />
          <Chip text="Tipo III" at={atType3} light size={38} />
        </div>
      </div>
    </Backdrop>
  );
};

const Stop: React.FC<{
  x: number;
  label: string;
  value: string;
  at: number;
  built: boolean;
}> = ({ x, label, value, at, built }) => {
  const frame = useCurrentFrame();
  const t = useIn(at, 8);
  const grow = useIn(at + 3, 10);
  const ring = interpolate(frame - at, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fibres = built ? 5 : 2;
  return (
    <g opacity={t}>
      {/* Ring pulse as the stop lands. */}
      {built ? (
        <circle
          cx={x}
          cy={640}
          r={34 + 50 * ring}
          fill="none"
          stroke="white"
          strokeWidth={4}
          opacity={(1 - ring) * 0.8 * (frame >= at ? 1 : 0)}
        />
      ) : null}
      {Array.from({ length: fibres }, (_, k) => {
        const dx = (k - (fibres - 1) / 2) * 14;
        const len = 150 * (built ? grow : 1);
        const sway = Math.sin((frame + k * 8) / 14) * 6;
        return (
          <path
            key={k}
            d={`M ${x + dx} 590 C ${x + dx - 18 + sway} ${590 - len * 0.33}, ${x + dx + 18 + sway} ${590 - len * 0.66}, ${x + dx + sway} ${590 - len}`}
            stroke={built ? "#FFD3C2" : "rgba(255,255,255,0.45)"}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <circle
        cx={x}
        cy={640}
        r={34 * (0.6 + 0.4 * t)}
        fill="white"
        stroke={colors.navy}
        strokeWidth={6}
      />
      {value ? (
        <text
          x={x}
          y={742}
          textAnchor="middle"
          fontFamily={sans}
          fontWeight={800}
          fontSize={76}
          fill="white"
        >
          {value}
        </text>
      ) : null}
      <text
        x={x}
        y={value ? 790 : 720}
        textAnchor="middle"
        fontFamily={sans}
        fontWeight={600}
        fontSize={value ? 36 : 34}
        fill="white"
        opacity={0.85}
      >
        {label}
      </text>
    </g>
  );
};

// Fibroblasts light up as "attivano", then spin out new collagen fibres on
// "costruire".
export const Fibroblasts: React.FC<{ atActivate: number; atBuild: number }> = ({
  atActivate,
  atBuild,
}) => {
  const frame = useCurrentFrame();
  const cells = [
    { x: 300, y: 560, r: -20 },
    { x: 760, y: 500, r: 25 },
    { x: 540, y: 800, r: 5 },
  ];
  const appear = useIn(0, 10);
  const glow = useIn(atActivate, 10);
  const build = useIn(atBuild, 24);
  return (
    <Backdrop>
      <Title text="I tuoi" italic="fibroblasti" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {Array.from({ length: 9 }, (_, k) => {
          const y = 420 + k * 55;
          const L = 1200;
          return (
            <path
              key={k}
              d={`M -40 ${y} C 260 ${y - 70}, 620 ${y + 70}, 1120 ${y - 20}`}
              stroke="#FFD3C2"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={L}
              strokeDashoffset={L * (1 - build)}
              opacity={0.75}
            />
          );
        })}
        {cells.map((c, i) => {
          const pulse = 1 + Math.sin((frame + i * 9) / 9) * 0.03 * glow;
          const a = Math.min(1, Math.max(0, appear * 3 - i));
          return (
            <g
              key={i}
              opacity={a}
              transform={`translate(${c.x} ${c.y + (1 - a) * 30}) rotate(${c.r}) scale(${pulse * (0.85 + 0.15 * a)})`}
            >
              <ellipse
                rx={190}
                ry={62}
                fill="white"
                opacity={0.25 + 0.35 * glow}
                style={{ filter: `blur(${18 * glow}px)` }}
              />
              <path
                d="M -200 0 C -110 -70, 110 -70, 200 0 C 110 70, -110 70, -200 0 Z"
                fill="#BFE0FF"
                stroke="white"
                strokeWidth={5}
              />
              <ellipse rx={48} ry={30} fill={colors.blue} opacity={0.85} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 930,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Chip text="→ nuovo collagene" at={atBuild + 8} />
      </div>
    </Backdrop>
  );
};

// "Seduta dopo seduta": collagen bars that grow smoothly with each session,
// beside a filler that only fills and stays the same.
export const Sessions: React.FC<{ atSessions: number[]; atFiller: number }> = ({
  atSessions,
  atFiller,
}) => {
  const filler = useIn(atFiller, 10);
  return (
    <Backdrop>
      <Title text="Seduta dopo" italic="seduta" />
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 90,
          right: 90,
          height: 560,
          display: "flex",
          gap: 50,
        }}
      >
        <Panel title="Biostimolatore" subtitle="costruisce">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 26,
              height: 330,
            }}
          >
            {atSessions.map((at, i) => (
              <SessionBar key={i} at={at} level={[0.4, 0.7, 1][i]} n={i + 1} />
            ))}
          </div>
        </Panel>
        <div
          style={{
            flex: 1,
            opacity: filler,
            transform: `translateX(${(1 - filler) * 40}px)`,
          }}
        >
          <Panel title="Filler" subtitle="occupa spazio" muted>
            <div
              style={{
                height: 330,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 220,
                  height: 170,
                  borderRadius: "50% 50% 40% 40%",
                  background: "rgba(255,255,255,0.35)",
                  border: "5px solid rgba(255,255,255,0.7)",
                }}
              />
            </div>
          </Panel>
        </div>
      </div>
    </Backdrop>
  );
};

const Panel: React.FC<{
  title: string;
  subtitle: string;
  muted?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, muted, children }) => (
  <div
    style={{
      flex: 1,
      height: "100%",
      background: muted ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)",
      border: `3px solid rgba(255,255,255,${muted ? 0.3 : 0.5})`,
      borderRadius: 30,
      padding: "32px 30px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 44,
          color: "white",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 40,
          color: muted ? "rgba(255,255,255,0.7)" : "#FFD3C2",
        }}
      >
        {subtitle}
      </div>
    </div>
    {children}
  </div>
);

const SessionBar: React.FC<{ at: number; level: number; n: number }> = ({
  at,
  level,
  n,
}) => {
  const t = useIn(at, 14);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 300 * level * t,
          borderRadius: 16,
          background: "linear-gradient(to top, #FF9E80, #FFD3C2)",
        }}
      />
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 28,
          color: "white",
          opacity: t,
        }}
      >
        {n}ª
      </div>
    </div>
  );
};
