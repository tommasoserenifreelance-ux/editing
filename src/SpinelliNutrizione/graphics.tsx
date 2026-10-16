import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";
import { brand } from "./brand";

const ease = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.cubic),
} as const;

const shadow = "drop-shadow(0 8px 20px rgba(0,0,0,0.2))";

// Graphics sit just above the captions, below the speaker's face.
const SLOT_BOTTOM = 1240;
const SCALE = 0.55;

// Smooth, non-bouncy 0 → 1 starting at `delay`.
const useSoft = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
};

const useDraw = (from: number, to: number) =>
  interpolate(useCurrentFrame(), [from, to], [0, 1], ease);

const useFadeOut = (duration: number) =>
  interpolate(useCurrentFrame(), [duration - 8, duration], [1, 0], ease);

// Positions a graphic in the slot and fades it in and out.
const Stage: React.FC<{
  duration: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ duration, width, height, children }) => {
  const enter = useSoft();
  const exit = useFadeOut(duration);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 540 - width / 2,
          top: SLOT_BOTTOM - height,
          width,
          height,
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px) scale(${SCALE})`,
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

// "La tua salute parte da ciò che mangi": an ECG trace that ends in a heart.
export const Heartbeat: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const draw = useDraw(0, 28);
  const heart = useSoft(24);
  const beat = 1 + 0.05 * Math.max(0, Math.sin((frame - 24) / 7));
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
          opacity={heart}
          transform={`translate(680 155) scale(${1.9 * interpolate(heart, [0, 1], [0.8, 1]) * beat}) translate(-50 -46)`}
        >
          <path d={HEART} fill={brand.magenta} />
        </g>
      </svg>
    </Stage>
  );
};

const DIETS = ["Dieta lampo", "Detox 7 giorni", "1200 kcal"];

// "Sei stanca delle solite diete che non funzionano?": tags struck through one by one.
export const DietTags: React.FC<{ duration: number; strikeAt: number }> = ({
  duration,
  strikeAt,
}) => {
  const frame = useCurrentFrame();
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
        }}
      >
        {DIETS.map((d, i) => {
          const show = interpolate(frame, [i * 6, i * 6 + 14], [0, 1], ease);
          const strike = interpolate(
            frame,
            [strikeAt + i * 5, strikeAt + i * 5 + 10],
            [0, 1],
            ease,
          );
          return (
            <div
              key={d}
              style={{
                position: "relative",
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 60,
                padding: "14px 40px",
                borderRadius: 60,
                background: brand.cream,
                color: strike > 0.5 ? brand.muted : brand.ink,
                opacity: show,
                transform: `translateY(${interpolate(show, [0, 1], [20, 0])}px)`,
              }}
            >
              {d}
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  top: "50%",
                  height: 8,
                  marginTop: -4,
                  width: `calc((100% - 56px) * ${strike})`,
                  borderRadius: 4,
                  background: brand.red,
                }}
              />
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// "ti aspetta un protocollo nutrizionale personalizzato": a plan being ticked off.
export const Clipboard: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
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
          const bar = interpolate(
            frame,
            [10 + i * 18, 24 + i * 18],
            [0, 1],
            ease,
          );
          const tick = interpolate(
            frame,
            [16 + i * 18, 28 + i * 18],
            [0, 1],
            ease,
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
                  fill={brand.magenta}
                  fillOpacity={tick}
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

// "sulle tue esigenze, sul tuo metabolismo e sui tuoi obiettivi": chips appearing in a row.
export const NeedsRow: React.FC<{ duration: number; at: number[] }> = ({
  duration,
  at,
}) => {
  const frame = useCurrentFrame();
  const exit = useFadeOut(duration);
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
          const show = interpolate(frame, [at[i], at[i] + 14], [0, 1], ease);
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
                background: brand.cream,
                color: brand.ink,
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 56,
                opacity: show,
                transform: `translateY(${interpolate(show, [0, 1], [30, 0])}px)`,
                filter: shadow,
              }}
            >
              <Disc size={100} color={brand.magenta}>
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
  const draw = useDraw(0, 36);
  const check = useSoft(checkAt);
  const tick = useDraw(checkAt + 6, checkAt + 20);
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
        <g
          opacity={check}
          transform={`translate(680 110) scale(${interpolate(check, [0, 1], [0.8, 1])})`}
        >
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
