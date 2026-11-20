import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, sans, serif } from "../Bonaccorso/theme";

// Full-screen blue cutaways drawn for the collagen video. Their graphics sit
// in the top half (y 200-1000) so the captions below stay clear. Cue frames
// are relative to the start of each animation.

const Backdrop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 30%, ${colors.blue}, ${colors.navy} 75%)`,
          opacity: interpolate(frame, [0, 4], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const usePop = (at: number, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.6 } });
};

const Title: React.FC<{ text: string; italic: string }> = ({
  text,
  italic,
}) => {
  const t = usePop(0);
  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        width: "100%",
        textAlign: "center",
        fontFamily: sans,
        fontWeight: 800,
        fontSize: 72,
        color: colors.white,
        letterSpacing: -2,
        opacity: t,
        transform: `translateY(${interpolate(t, [0, 1], [30, 0])}px)`,
      }}
    >
      {text}{" "}
      <span
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 600,
          background: colors.white,
          color: colors.blue,
          padding: "0 0.25em 0.05em",
          borderRadius: 12,
          display: "inline-block",
          transform: "rotate(-2deg)",
          letterSpacing: 0,
        }}
      >
        {italic}
      </span>
    </div>
  );
};

// Treatment → 3 → 12 → 18 months, each stop popping in as he says it, with a
// collagen fibre bundle that stays thick from 3 months on.
export const CollagenTimeline: React.FC<{
  at3: number;
  atCollagen: number;
  at12: number;
  at18: number;
}> = ({ at3, atCollagen, at12, at18 }) => {
  const frame = useCurrentFrame();
  const stops = [
    { label: "Trattamento", value: "0", at: 0 },
    { label: "mesi", value: "3", at: at3 },
    { label: "mesi", value: "12", at: at12 },
    { label: "mesi", value: "18", at: at18 },
  ];
  const x = (i: number) => 150 + i * 260;
  const line = interpolate(frame, [0, at18 + 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const badge = usePop(atCollagen);
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
          x2={x(0) + (x(3) - x(0)) * line}
          y2={640}
          stroke={colors.white}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.9}
        />
        {stops.map((s, i) => (
          <Stop key={i} x={x(i)} {...s} grown={i > 0} />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 860,
          width: "100%",
          textAlign: "center",
          opacity: badge,
          transform: `scale(${interpolate(badge, [0, 1], [0.6, 1])})`,
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 46,
            color: colors.navy,
            background: colors.white,
            padding: "10px 28px",
            borderRadius: 40,
          }}
        >
          ↑ Collagene di tipo I e III
        </span>
      </div>
    </Backdrop>
  );
};

const Stop: React.FC<{
  x: number;
  label: string;
  value: string;
  at: number;
  grown: boolean;
}> = ({ x, label, value, at, grown }) => {
  const frame = useCurrentFrame();
  const t = usePop(at, 10);
  const grow = interpolate(frame - at, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // A bundle of wavy fibres above the stop; thicker once collagen is built.
  const fibres = grown ? 5 : 2;
  return (
    <g opacity={Math.min(1, t * 2)}>
      {Array.from({ length: fibres }, (_, k) => {
        const dx = (k - (fibres - 1) / 2) * 14;
        const len = 150 * (grown ? grow : 1);
        return (
          <path
            key={k}
            d={`M ${x + dx} 590 C ${x + dx - 18} ${590 - len * 0.33}, ${x + dx + 18} ${590 - len * 0.66}, ${x + dx} ${590 - len}`}
            stroke={grown ? "#FFD3C2" : "rgba(255,255,255,0.45)"}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <circle
        cx={x}
        cy={640}
        r={34 * t}
        fill={colors.white}
        stroke={colors.navy}
        strokeWidth={6}
      />
      <text
        x={x}
        y={742}
        textAnchor="middle"
        fontFamily={sans}
        fontWeight={800}
        fontSize={value === "0" ? 0 : 76}
        fill={colors.white}
      >
        {value}
      </text>
      <text
        x={x}
        y={value === "0" ? 720 : 790}
        textAnchor="middle"
        fontFamily={sans}
        fontWeight={600}
        fontSize={value === "0" ? 34 : 36}
        fill={colors.white}
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
  const glow = interpolate(frame - atActivate, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const build = interpolate(frame - atBuild, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Backdrop>
      <Title text="I tuoi" italic="fibroblasti" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {/* Collagen fibres woven between and around the cells. */}
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
          const pulse = 1 + Math.sin((frame + i * 9) / 7) * 0.04 * glow;
          return (
            <g
              key={i}
              transform={`translate(${c.x} ${c.y}) rotate(${c.r}) scale(${pulse})`}
            >
              <ellipse
                rx={190}
                ry={62}
                fill={colors.white}
                opacity={0.25 + 0.35 * glow}
                style={{ filter: `blur(${18 * glow}px)` }}
              />
              <path
                d="M -200 0 C -110 -70, 110 -70, 200 0 C 110 70, -110 70, -200 0 Z"
                fill="#BFE0FF"
                stroke={colors.white}
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
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 46,
          color: colors.white,
          opacity: build,
        }}
      >
        → nuovo collagene
      </div>
    </Backdrop>
  );
};

// "Seduta dopo seduta": collagen bars that grow with each session, beside a
// filler that only fills and stays the same.
export const Sessions: React.FC<{ atSessions: number[]; atFiller: number }> = ({
  atSessions,
  atFiller,
}) => {
  const filler = usePop(atFiller);
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
            transform: `scale(${interpolate(filler, [0, 1], [0.8, 1])})`,
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
          color: colors.white,
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
  const t = usePop(at, 14);
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
          color: colors.white,
          opacity: Math.min(1, t * 2),
        }}
      >
        {n}ª
      </div>
    </div>
  );
};
