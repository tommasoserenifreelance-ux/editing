import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

export const BODYPUMP_FPS = 30;
export const BODYPUMP_DURATION = 304; // 10.1 s, length of the source clip

// public/audio/bodypump-beat.wav is 128 BPM with the drop on beat 4.
const BEAT = (60 / 128) * BODYPUMP_FPS;
const DROP = Math.round(4 * BEAT);
const CTA = Math.round(10 * BEAT);

const colors = {
  red: "#E5262B",
  yellow: "#FFD400",
  ink: "#111111",
  white: "#FFFFFF",
};

const boxed: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 26px",
  borderRadius: 16,
};

// Spring pop-in from a given frame; returns 0..1 (overshoots slightly).
const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, mass: 0.6 },
  });
};

// Small scale bump on every beat after the drop.
const useBeatPulse = (from: number) => {
  const frame = useCurrentFrame();
  if (frame < from) return 1;
  const sinceBeat = (frame - from) % BEAT;
  return 1 + 0.06 * Math.exp(-sinceBeat / 2.5);
};

const Slam: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  pulseFrom?: number;
}> = ({ delay, children, style, pulseFrom }) => {
  const p = usePop(delay);
  const pulse = useBeatPulse(pulseFrom ?? Infinity);
  return (
    <div
      style={{
        ...boxed,
        ...style,
        opacity: Math.min(1, p * 3),
        transform: `scale(${interpolate(p, [0, 1], [2.2, 1]) * pulse}) rotate(${interpolate(p, [0, 1], [-8, -2])}deg)`,
      }}
    >
      {children}
    </div>
  );
};

// "1 2 3 ... 10" counter flipping on half beats while the title holds.
const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.min(10, Math.floor(frame / (BEAT / 2)) + 1);
  const sinceStep = frame % (BEAT / 2);
  return (
    <div
      style={{
        fontSize: 230,
        fontWeight: 700,
        color: colors.yellow,
        WebkitTextStroke: `10px ${colors.ink}`,
        paintOrder: "stroke fill",
        lineHeight: 1,
        transform: `scale(${1 + 0.15 * Math.exp(-sinceStep / 2)})`,
      }}
    >
      {step}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [CTA - 8, CTA], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Quick white flash + shake on the drop.
  const sinceDrop = frame - DROP;
  const shake = sinceDrop >= 0 ? 14 * Math.exp(-sinceDrop / 4) : 0;
  const flash = sinceDrop >= 0 ? 0.55 * Math.exp(-sinceDrop / 3) : 0;
  return (
    <>
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 60,
          gap: 8,
          fontFamily: sans,
          textAlign: "center",
          opacity: exit,
          transform: `translate(${Math.sin(frame * 2.3) * shake}px, ${Math.cos(frame * 3.1) * shake}px)`,
          filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
        }}
      >
        <Slam
          delay={0}
          style={{
            background: colors.white,
            color: colors.ink,
            fontSize: 78,
            fontWeight: 700,
          }}
        >
          10 MOTIVI
        </Slam>
        <Slam
          delay={Math.round(2 * BEAT)}
          style={{
            background: colors.ink,
            color: colors.white,
            fontSize: 50,
            fontWeight: 700,
          }}
        >
          per praticare
        </Slam>
        <Slam
          delay={DROP}
          pulseFrom={DROP}
          style={{
            background: colors.red,
            color: colors.white,
            fontSize: 116,
            fontWeight: 700,
            letterSpacing: 2,
            padding: "4px 30px",
          }}
        >
          BODY PUMP
        </Slam>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
      <Sequence
        from={DROP + Math.round(BEAT)}
        durationInFrames={CTA - DROP - Math.round(BEAT)}
      >
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 330,
            fontFamily: sans,
            opacity: exit,
          }}
        >
          <Counter />
        </AbsoluteFill>
      </Sequence>
    </>
  );
};

const Arrow: React.FC = () => {
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin((frame / BEAT) * Math.PI)) * 30;
  return (
    <svg
      width={170}
      height={170}
      viewBox="0 0 24 24"
      style={{ transform: `translateY(${bounce}px)`, marginTop: 10 }}
    >
      <path
        d="M12 3v15M5 12l7 7 7-7"
        fill="none"
        stroke={colors.yellow}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const CTA_WORDS = [
  { text: "LEGGI LA", bg: colors.white, fg: colors.ink },
  { text: "DESCRIZIONE", bg: colors.red, fg: colors.white },
  { text: "PER SCOPRIRLO", bg: colors.white, fg: colors.ink },
];

const CallToAction: React.FC = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 260,
      gap: 18,
      fontFamily: sans,
      textAlign: "center",
      filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
    }}
  >
    {CTA_WORDS.map((w, i) => (
      <Slam
        key={w.text}
        delay={Math.round(i * BEAT)}
        pulseFrom={Math.round(3 * BEAT)}
        style={{
          background: w.bg,
          color: w.fg,
          fontSize: i === 1 ? 112 : 78,
          fontWeight: 700,
        }}
      >
        {w.text}
      </Slam>
    ))}
    <Sequence from={Math.round(3 * BEAT)} layout="none">
      <Arrow />
    </Sequence>
  </AbsoluteFill>
);

export const BodyPump: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile("video/bodypump.mp4")}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Audio src={staticFile("audio/bodypump-beat.wav")} />
      <Sequence durationInFrames={CTA}>
        <Hook />
      </Sequence>
      <Sequence from={CTA}>
        <CallToAction />
      </Sequence>
    </AbsoluteFill>
  );
};
