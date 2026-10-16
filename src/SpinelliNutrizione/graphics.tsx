import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";
import { brand } from "./brand";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const shadow = "drop-shadow(0 10px 24px rgba(0,0,0,0.25))";

// Graphics sit just above the captions, below the speaker's face.
const SLOT_BOTTOM = 1240;
const SCALE = 0.55;

const usePop = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
};

const useDraw = (from: number, to: number) =>
  interpolate(useCurrentFrame(), [from, to], [0, 1], clamp);

// Positions a graphic in the slot and handles its entrance and exit.
const Stage: React.FC<{
  duration: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ duration, width, height, children }) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 14);
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 540 - width / 2,
          top: SLOT_BOTTOM - height,
          width,
          height,
          opacity: Math.min(1, enter * 2) * exit,
          transform: `scale(${SCALE * interpolate(enter, [0, 1], [0.6, 1]) * interpolate(exit, [0, 1], [0.85, 1])})`,
          transformOrigin: "50% 100%",
          filter: shadow,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const Disc: React.FC<{
  size: number;
  color: string;
  children?: React.ReactNode;
}> = ({ size, color, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

const HEART =
  "M50 88 C20 66 4 50 4 30 C4 14 16 4 29 4 C38 4 46 9 50 17 C54 9 62 4 71 4 C84 4 96 14 96 30 C96 50 80 66 50 88 Z";

// "La tua salute": an ECG trace that ends in a beating heart.
export const Heartbeat: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const draw = useDraw(0, 16);
  const heart = usePop(14, 9);
  const beat = 1 + 0.08 * Math.max(0, Math.sin((frame - 14) / 4));
  return (
    <Stage duration={duration} width={840} height={300}>
      <svg width={840} height={300} viewBox="0 0 840 300">
        <path
          d="M10 160 H230 L260 115 L290 200 L325 40 L365 265 L400 160 H540"
          fill="none"
          stroke={brand.magenta}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <g
          transform={`translate(680 155) scale(${1.9 * heart * beat}) translate(-50 -46)`}
        >
          <path d={HEART} fill={brand.magenta} />
          <path
            d="M24 30 C24 22 30 17 36 17"
            fill="none"
            stroke="#fff"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      </svg>
    </Stage>
  );
};

// "parte da ciò che mangi": plate with fork and knife, ringed by orbiting dots.
export const Plate: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const pop = usePop(0, 10);
  const ring = useDraw(2, 18);
  return (
    <Stage duration={duration} width={500} height={380}>
      <svg
        width={500}
        height={380}
        viewBox="0 0 500 380"
        style={{
          transform: `rotate(${interpolate(pop, [0, 1], [-25, 0])}deg)`,
        }}
      >
        <circle
          cx={250}
          cy={190}
          r={175}
          fill="none"
          stroke={brand.magenta}
          strokeWidth={6}
          strokeDasharray="18 16"
          strokeDashoffset={-frame * 1.5}
          opacity={ring}
        />
        <circle cx={250} cy={190} r={130} fill={brand.cream} />
        <circle
          cx={250}
          cy={190}
          r={92}
          fill="none"
          stroke={brand.blush}
          strokeWidth={10}
        />
        {/* Fork */}
        <g
          stroke={brand.magenta}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
        >
          <path d="M60 110 V170 M80 110 V170 M100 110 V170 M60 170 Q80 195 100 170 M80 185 V290" />
          {/* Knife */}
          <path d="M420 290 V110 Q450 150 440 205 H420" />
        </g>
        {[0, 1, 2].map((i) => {
          const a = frame / 14 + (i * Math.PI * 2) / 3;
          return (
            <circle
              key={i}
              cx={250 + Math.cos(a) * 175}
              cy={190 + Math.sin(a) * 175}
              r={14 * ring}
              fill={i === 1 ? brand.sage : brand.magenta}
            />
          );
        })}
      </svg>
    </Stage>
  );
};

const DIETS = ["Dieta lampo", "Detox 7 giorni", "1200 kcal"];

// "Sei stanca delle solite diete... che non funzionano?": diet tags that get crossed out.
export const DietTags: React.FC<{ duration: number; strikeAt: number }> = ({
  duration,
  strikeAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [strikeAt, strikeAt + 8], [0, 1], clamp);
  const strike2 = interpolate(
    frame,
    [strikeAt + 5, strikeAt + 13],
    [0, 1],
    clamp,
  );
  const shake =
    frame >= strikeAt
      ? Math.sin((frame - strikeAt) * 2.2) *
        interpolate(frame, [strikeAt, strikeAt + 14], [14, 0], clamp)
      : 0;
  return (
    <Stage duration={duration} width={700} height={430}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          transform: `translateX(${shake}px)`,
        }}
      >
        {DIETS.map((d, i) => {
          const drop = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 11, mass: 0.6 },
          });
          return (
            <div
              key={d}
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 60,
                padding: "14px 40px",
                borderRadius: 60,
                background: brand.cream,
                color:
                  interpolate(strike, [0, 1], [0, 1]) > 0.5
                    ? brand.muted
                    : brand.ink,
                opacity: drop,
                transform: `translateY(${interpolate(drop, [0, 1], [-160, 0])}px) rotate(${(i - 1) * 5 * (1 - strike) + (i - 1) * -3}deg)`,
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
      <svg
        width={700}
        height={430}
        viewBox="0 0 700 430"
        style={{ position: "absolute", inset: 0 }}
      >
        {[
          ["M150 60 L550 370", strike],
          ["M550 60 L150 370", strike2],
        ].map(([d, p]) => (
          <path
            key={d as string}
            d={d as string}
            stroke={brand.red}
            strokeWidth={30}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - (p as number)}
          />
        ))}
      </svg>
    </Stage>
  );
};

// "È il momento di cambiare approccio": spinning refresh arrows with a burst.
export const Refresh: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const burst = useDraw(0, 14);
  const spin = interpolate(frame, [0, 22], [0, 360], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Stage duration={duration} width={400} height={400}>
      <svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        style={{ position: "absolute" }}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 10;
          const r1 = 130 + burst * 40;
          const r2 = r1 + 40 * (1 - burst);
          return (
            <line
              key={i}
              x1={200 + Math.cos(a) * r1}
              y1={200 + Math.sin(a) * r1}
              x2={200 + Math.cos(a) * r2}
              y2={200 + Math.sin(a) * r2}
              stroke={brand.magenta}
              strokeWidth={10}
              strokeLinecap="round"
              opacity={1 - burst * 0.9}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 70, top: 70 }}>
        <Disc size={260} color={brand.magenta}>
          <svg
            width={170}
            height={170}
            viewBox="0 0 100 100"
            style={{ transform: `rotate(${spin + frame * 2}deg)` }}
          >
            <g fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round">
              <path d="M82 42 A33 33 0 0 0 24 30" />
              <path d="M18 58 A33 33 0 0 0 76 70" />
            </g>
            <path d="M14 18 L32 34 L12 40 Z" fill="#fff" />
            <path d="M86 82 L68 66 L88 60 Z" fill="#fff" />
          </svg>
        </Disc>
      </div>
    </Stage>
  );
};

// "Al Centro Medico Spinelli": medical cross with pulsing rings.
export const MedicalCross: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const cross = usePop(4, 9);
  return (
    <Stage duration={duration} width={400} height={400}>
      <svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        style={{ position: "absolute" }}
      >
        {[0, 1].map((i) => {
          const t = ((frame + i * 12) % 24) / 24;
          return (
            <circle
              key={i}
              cx={200}
              cy={200}
              r={120 + t * 80}
              fill="none"
              stroke={brand.magenta}
              strokeWidth={8}
              opacity={1 - t}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        <Disc size={240} color={brand.cream}>
          <svg
            width={130}
            height={130}
            viewBox="0 0 100 100"
            style={{
              transform: `scale(${cross}) rotate(${(1 - cross) * 90}deg)`,
            }}
          >
            <path
              d="M37 8 H63 V37 H92 V63 H63 V92 H37 V63 H8 V37 H37 Z"
              fill={brand.magenta}
              strokeLinejoin="round"
            />
          </svg>
        </Disc>
      </div>
    </Stage>
  );
};

// "ti aspetta un protocollo nutrizionale personalizzato": a plan being ticked off.
export const Clipboard: React.FC<{ duration: number; stampAt: number }> = ({
  duration,
  stampAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({
    frame: frame - stampAt,
    fps,
    config: { damping: 9, mass: 0.5 },
  });
  return (
    <Stage duration={duration} width={430} height={520}>
      <div
        style={{
          position: "absolute",
          inset: "30px 0 0 0",
          background: brand.cream,
          borderRadius: 34,
          padding: "80px 44px 0",
          display: "flex",
          flexDirection: "column",
          gap: 44,
        }}
      >
        {[0, 1, 2].map((i) => {
          const tick = interpolate(
            frame,
            [8 + i * 14, 16 + i * 14],
            [0, 1],
            clamp,
          );
          const bar = interpolate(
            frame,
            [4 + i * 14, 14 + i * 14],
            [0, 1],
            clamp,
          );
          return (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 26 }}
            >
              <svg width={64} height={64} viewBox="0 0 64 64">
                <rect
                  x={4}
                  y={4}
                  width={56}
                  height={56}
                  rx={14}
                  fill={tick > 0 ? brand.magenta : "none"}
                  stroke={brand.magenta}
                  strokeWidth={6}
                />
                <path
                  d="M17 33 L28 44 L48 22"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - tick}
                />
              </svg>
              <div
                style={{
                  height: 22,
                  width: [230, 180, 210][i] * bar,
                  borderRadius: 11,
                  background: brand.blush,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 135,
          top: 0,
          width: 160,
          height: 66,
          borderRadius: 18,
          background: brand.magenta,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120,
          bottom: 130,
          opacity: Math.min(1, stamp * 2),
          transform: `rotate(-10deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 52,
          letterSpacing: 4,
          color: "#fff",
          background: brand.magenta,
          padding: "12px 30px",
          borderRadius: 16,
          border: "5px solid #fff",
        }}
      >
        SU MISURA
      </div>
    </Stage>
  );
};

const PersonIcon = () => (
  <g fill="#fff">
    <circle cx={50} cy={32} r={17} />
    <path d="M18 88 C18 64 32 54 50 54 C68 54 82 64 82 88 Z" />
  </g>
);

const FlameIcon = () => (
  <path
    d="M52 8 C58 30 80 40 80 64 C80 82 66 94 50 94 C34 94 20 82 20 64 C20 48 32 40 36 26 C42 36 44 44 44 52 C50 44 54 30 52 8 Z"
    fill="#fff"
  />
);

const TargetIcon = () => (
  <g fill="none" stroke="#fff" strokeWidth={9}>
    <circle cx={50} cy={50} r={38} />
    <circle cx={50} cy={50} r={20} />
    <circle cx={50} cy={50} r={4} fill="#fff" />
  </g>
);

const NEEDS = [
  { label: "Esigenze", icon: <PersonIcon /> },
  { label: "Metabolismo", icon: <FlameIcon /> },
  { label: "Obiettivi", icon: <TargetIcon /> },
];

// "sulle tue esigenze, sul tuo metabolismo e sui tuoi obiettivi": chips popping up in a row.
export const NeedsStack: React.FC<{ duration: number; at: number[] }> = ({
  duration,
  at,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 800,
          width: 1600,
          top: SLOT_BOTTOM - 130,
          height: 130,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          transform: `scale(${SCALE})`,
          transformOrigin: "50% 100%",
        }}
      >
        {NEEDS.map((n, i) => {
          const pop = spring({
            frame: frame - at[i],
            fps,
            config: { damping: 12, mass: 0.6 },
          });
          const active = frame >= at[i] && (i === 2 || frame < at[i + 1]);
          return (
            <div
              key={n.label}
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "14px 40px 14px 14px",
                borderRadius: 70,
                background: active ? brand.magenta : brand.cream,
                color: active ? "#fff" : brand.ink,
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 56,
                opacity: Math.min(1, pop * 2),
                transform: `translateY(${interpolate(pop, [0, 1], [120, 0])}px) scale(${interpolate(pop, [0, 1], [0.5, 1]) * (active ? 1.08 : 1)})`,
                filter: shadow,
              }}
            >
              <Disc size={100} color={active ? brand.ink : brand.magenta}>
                <svg width={60} height={60} viewBox="0 0 100 100">
                  {n.icon}
                </svg>
              </Disc>
              {n.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// "Il cambiamento inizia dalla tua scelta": a rising trend that lands on a check.
export const Growth: React.FC<{ duration: number; checkAt: number }> = ({
  duration,
  checkAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = useDraw(0, 24);
  const check = spring({
    frame: frame - checkAt,
    fps,
    config: { damping: 9, mass: 0.5 },
  });
  const tick = interpolate(frame, [checkAt + 4, checkAt + 14], [0, 1], clamp);
  const burst = interpolate(frame, [checkAt, checkAt + 18], [0, 1], clamp);
  return (
    <Stage duration={duration} width={820} height={460}>
      <svg width={820} height={460} viewBox="0 0 820 460">
        <path
          d="M30 410 L200 320 L300 360 L460 220 L560 260 L660 120"
          fill="none"
          stroke={brand.magenta}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 12;
          const r = 90 + burst * 110;
          return (
            <circle
              key={i}
              cx={680 + Math.cos(a) * r}
              cy={110 + Math.sin(a) * r}
              r={12 * (1 - burst)}
              fill={i % 2 ? brand.sage : brand.magenta}
            />
          );
        })}
        <g transform={`translate(680 110) scale(${check})`}>
          <circle r={90} fill={brand.magenta} />
          <path
            d="M-40 2 L-12 30 L42 -28"
            fill="none"
            stroke="#fff"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - tick}
          />
        </g>
      </svg>
    </Stage>
  );
};

// Magenta band that sweeps across the cut between the two clips.
export const Wipe: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, duration], [-2200, 1400], {
    easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -400,
          left: x,
          width: 1800,
          height: 2700,
          transform: "rotate(14deg)",
          display: "flex",
        }}
      >
        <div style={{ flex: 1, background: brand.blush }} />
        <div style={{ flex: 3, background: brand.magenta }} />
        <div style={{ flex: 1, background: brand.blush }} />
      </div>
    </AbsoluteFill>
  );
};

export const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 12,
          width: `${(frame / (total - 1)) * 100}%`,
          background: brand.magenta,
          borderRadius: "0 6px 6px 0",
        }}
      />
    </AbsoluteFill>
  );
};
