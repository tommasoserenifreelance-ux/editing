import { interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Chip, EASE, Title, useIn } from "../Bonaccorso/Motion";
import { sans } from "../Bonaccorso/theme";

// Full-screen blue cutaways drawn for the late-dinner video, in the same
// family as the collagen ones. Graphics sit in the top half (y 200-1000) so
// the captions stay clear. Cue frames are relative to each animation's start.

const CORAL = "#FF9E80";

const useDraw = (start: number, dur = 16) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing: EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// Glucose after the same dinner at two times: the early curve draws first,
// the late one rises higher, then it is flagged as worse.
export const GlucoseCurves: React.FC<{
  atTimes: number;
  atLate: number;
  atWorse: number;
  atTolerance: number;
}> = ({ atTimes, atLate, atWorse, atTolerance }) => {
  const frame = useCurrentFrame();
  const early = useDraw(atTimes);
  const late = useDraw(atLate);
  const worse = useIn(atWorse, 10);
  const pulse = 1 + Math.sin((frame - atWorse) / 4) * 0.02 * worse;
  // Chart box: x 140-940, y 430-900 (baseline at 900).
  const curve = (peak: number) =>
    `M 140 860 C 260 860, 330 ${860 - peak}, 430 ${860 - peak} C 560 ${860 - peak}, 640 ${860 - peak * 0.35}, 940 840`;
  const L = 1100;
  return (
    <Backdrop>
      <Title text="Stessa cena," italic="orari diversi" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <line
          x1={140}
          y1={900}
          x2={940}
          y2={900}
          stroke="white"
          strokeWidth={4}
          opacity={0.5}
        />
        <line
          x1={140}
          y1={430}
          x2={140}
          y2={900}
          stroke="white"
          strokeWidth={4}
          opacity={0.5}
        />
        <text
          x={150}
          y={420}
          fontFamily={sans}
          fontWeight={700}
          fontSize={30}
          fill="white"
          opacity={0.8}
        >
          Glicemia
        </text>
        <text
          x={940}
          y={945}
          textAnchor="end"
          fontFamily={sans}
          fontWeight={700}
          fontSize={30}
          fill="white"
          opacity={0.8}
        >
          Ore dopo la cena
        </text>
        {/* Late dinner: area that lights up when flagged, then the curve. */}
        <path
          d={`${curve(330)} L 940 900 L 140 900 Z`}
          fill={CORAL}
          opacity={0.22 * worse}
        />
        <path
          d={curve(200)}
          stroke="white"
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={L}
          strokeDashoffset={L * (1 - early)}
        />
        <g
          transform={`translate(540 640) scale(${pulse}) translate(-540 -640)`}
        >
          <path
            d={curve(330)}
            stroke={CORAL}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={L}
            strokeDashoffset={L * (1 - late)}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 470,
          right: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 14,
        }}
      >
        <Chip text="Cena presto" at={atTimes + 4} size={34} />
        <Chip text="Cena tardi" at={atLate + 4} light size={34} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 975,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <Chip text="↑ Glicemia" at={atWorse} size={38} />
        <Chip
          text="↓ Tolleranza al glucosio"
          at={atTolerance}
          light
          size={38}
        />
      </div>
    </Backdrop>
  );
};

// The melatonin receptor gene: a turning double helix labelled MTNR1B, then a
// crowd in which a good share of people light up as carriers.
export const VariantGrid: React.FC<{
  atGene: number;
  atPeople: number;
  atShare: number;
}> = ({ atGene, atPeople, atShare }) => {
  const frame = useCurrentFrame();
  const helix = useIn(0, 12);
  const people = useIn(atPeople, 12);
  const share = useIn(atShare, 12);
  // Carriers among 24 people: a fixed, scattered half.
  const carriers = new Set([0, 3, 5, 6, 9, 10, 12, 15, 17, 18, 20, 23]);
  const rungs = 16;
  return (
    <Backdrop>
      <Title text="Recettore della" italic="melatonina" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <g opacity={helix}>
          {Array.from({ length: rungs }, (_, k) => {
            const x = 190 + k * 46;
            const ph = k / 2.2 + frame / 10;
            const y1 = 500 + Math.sin(ph) * 55;
            const y2 = 500 - Math.sin(ph) * 55;
            const front = Math.cos(ph) > 0;
            return (
              <g key={k} opacity={Math.min(1, helix * rungs - k)}>
                <line
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke="white"
                  strokeWidth={5}
                  opacity={0.5}
                />
                <circle
                  cx={x}
                  cy={y1}
                  r={front ? 13 : 9}
                  fill={front ? CORAL : "#BFE0FF"}
                />
                <circle
                  cx={x}
                  cy={y2}
                  r={front ? 9 : 13}
                  fill={front ? "#BFE0FF" : CORAL}
                />
              </g>
            );
          })}
        </g>
        {Array.from({ length: 24 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const x = 205 + col * 96;
          const y = 720 + row * 92;
          const a = Math.min(1, Math.max(0, people * 24 - i * 0.6));
          const lit = carriers.has(i) ? share : 0;
          const fill = lit ? CORAL : "rgba(255,255,255,0.55)";
          return (
            <g
              key={i}
              opacity={a}
              transform={`translate(${x} ${y + (1 - a) * 20})`}
            >
              <circle cy={-26} r={16} fill={fill} />
              <path d="M -24 18 C -24 -6, 24 -6, 24 18 Z" fill={fill} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 590,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Chip text="MTNR1B" at={atGene} light size={44} />
      </div>
    </Backdrop>
  );
};

// A clock turning back from 21:00 to 20:00: "anticipare la cena di un'ora".
export const ClockRewind: React.FC<{ atRewind: number; atHour: number }> = ({
  atRewind,
  atHour,
}) => {
  const turn = useDraw(atRewind, 20);
  const appear = useIn(0, 10);
  // 21:00 → 20:00: the hour hand goes back 30°, the minute hand a full turn.
  const hourAngle = 270 - 30 * turn; // 21:00 points at 9 o'clock
  const minuteAngle = -360 * turn;
  const cx = 540;
  const cy = 650;
  return (
    <Backdrop>
      <Title text="Anticipa" italic="di un'ora" />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <g
          opacity={appear}
          transform={`translate(${cx} ${cy}) scale(${0.85 + 0.15 * appear})`}
        >
          <circle
            r={250}
            fill="rgba(255,255,255,0.12)"
            stroke="white"
            strokeWidth={10}
          />
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k * 30 * Math.PI) / 180;
            return (
              <line
                key={k}
                x1={Math.sin(a) * 205}
                y1={-Math.cos(a) * 205}
                x2={Math.sin(a) * 230}
                y2={-Math.cos(a) * 230}
                stroke="white"
                strokeWidth={k % 3 === 0 ? 10 : 5}
                strokeLinecap="round"
              />
            );
          })}
          {/* Sweep of the hour going back. */}
          <path
            d={`M 0 0 L ${Math.sin((270 * Math.PI) / 180) * 170} ${-Math.cos((270 * Math.PI) / 180) * 170} A 170 170 0 0 0 ${Math.sin((hourAngle * Math.PI) / 180) * 170} ${-Math.cos((hourAngle * Math.PI) / 180) * 170} Z`}
            fill={CORAL}
            opacity={0.35 * Math.min(1, turn * 4)}
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-120}
            stroke="white"
            strokeWidth={16}
            strokeLinecap="round"
            transform={`rotate(${hourAngle})`}
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-190}
            stroke={CORAL}
            strokeWidth={10}
            strokeLinecap="round"
            transform={`rotate(${minuteAngle})`}
          />
          <circle r={18} fill="white" />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 960,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Chip text="21:00 → 20:00" at={atHour} size={46} />
      </div>
    </Backdrop>
  );
};

// The study he cites, as a citation card (no screenshot was uploaded).
export const StudyCitation: React.FC = () => {
  const card = useIn(0, 10);
  return (
    <Backdrop>
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 90,
          right: 90,
          background: "white",
          borderRadius: 28,
          padding: "44px 48px",
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px) rotate(${-1.5 * card}deg)`,
          fontFamily: sans,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span
            style={{
              background: "#E8F0FF",
              color: "#1F5FE8",
              fontWeight: 700,
              fontSize: 26,
              padding: "6px 16px",
              borderRadius: 8,
            }}
          >
            Randomized Crossover Trial
          </span>
          <span style={{ color: "#5B6683", fontSize: 26, fontWeight: 600 }}>
            Diabetes Care · 2022
          </span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1.22,
            color: "#1B2440",
          }}
        >
          Interplay of Dinner Timing and MTNR1B Type 2 Diabetes Risk Variant on
          Glucose Tolerance and Insulin Secretion
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            color: "#1F5FE8",
            fontWeight: 600,
          }}
        >
          Garaulet M, Lopez-Minguez J, Dashti HS, et al.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 900,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Chip text="845 partecipanti" at={10} light size={40} />
      </div>
    </Backdrop>
  );
};
