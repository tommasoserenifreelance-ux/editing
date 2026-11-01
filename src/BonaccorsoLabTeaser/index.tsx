import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, sans } from "./theme";

// Instagram story teaser: announces the 16:00 newsletter and hints that
// the studio has become a lab, without revealing the service yet.

const INTRO = 105;
const HINT = 225;
const OUTRO = 165;
const TRANSITION = 15;

export const TEASER_DURATION = INTRO + HINT + OUTRO - 2 * TRANSITION;

const timing = linearTiming({ durationInFrames: TRANSITION });

const useRise = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
  };
};

const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = colors.slate,
  delay = 0,
}) => (
  <div
    style={{
      ...useRise(delay),
      fontFamily: sans,
      fontWeight: 500,
      fontSize: 34,
      letterSpacing: 12,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ delay?: number; width?: number }> = ({ delay = 0, width = 620 }) => (
  <div style={useRise(delay)}>
    <Img src={staticFile("bonaccorso/logo-bianco.png")} style={{ width }} />
  </div>
);

// Slowly drifting, blurred lab photo under a navy wash.
const Backdrop: React.FC<{ blur: number; wash: number }> = ({ blur, wash }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 200], [1.12, 1.02], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.navy, overflow: "hidden" }}>
      <Img
        src={staticFile("bonaccorso/analisi.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: colors.navy, opacity: wash }} />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => (
  <AbsoluteFill>
    <Backdrop blur={40} wash={0.82} />
    <AbsoluteFill style={{ padding: "0 110px", justifyContent: "center" }}>
      <Logo />
      <div
        style={{
          ...useRise(14),
          fontFamily: sans,
          fontWeight: 300,
          fontSize: 92,
          lineHeight: 1.15,
          color: colors.white,
          marginTop: 120,
        }}
      >
        Stiamo
        <br />
        preparando
        <br />
        <span style={{ fontWeight: 500 }}>qualcosa di nuovo…</span>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// Outline test tube that fills up while the hint text appears.
const TestTube: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 40 });
  const fill = interpolate(frame, [delay + 25, delay + 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const length = 1000;
  const top = 60 + (1 - fill) * 330;
  return (
    <svg width="200" height="460" viewBox="0 0 200 460">
      <defs>
        <clipPath id="tube">
          <path d="M60 40 V380 a40 40 0 0 0 80 0 V40 Z" />
        </clipPath>
      </defs>
      <rect x="0" y={top} width="200" height="460" fill={colors.mid} opacity={0.85} clipPath="url(#tube)" />
      {[0, 1, 2].map((i) => {
        const y = top + 30 + ((frame * 1.4 + i * 70) % 260);
        return y < 410 && fill > 0.1 ? (
          <circle key={i} cx={85 + i * 15} cy={y} r={6 - i} fill={colors.white} opacity={0.6} clipPath="url(#tube)" />
        ) : null;
      })}
      <path
        d="M60 40 V380 a40 40 0 0 0 80 0 V40 M40 40 H160"
        fill="none"
        stroke={colors.white}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - draw)}
      />
    </svg>
  );
};

const Hint: React.FC = () => (
  <AbsoluteFill>
    <Backdrop blur={30} wash={0.78} />
    <AbsoluteFill style={{ padding: "0 110px", justifyContent: "center" }}>
      <Kicker color={colors.mid}>Novità allo Studio</Kicker>
      <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 70 }}>
        <TestTube delay={8} />
        <div
          style={{
            ...useRise(20),
            fontFamily: sans,
            fontWeight: 300,
            fontSize: 66,
            lineHeight: 1.2,
            color: colors.white,
          }}
        >
          Lo Studio cresce
          <br />
          e diventa anche
          <br />
          un laboratorio…
        </div>
      </div>
      <div
        style={{
          ...useRise(70),
          fontFamily: sans,
          fontWeight: 500,
          lineHeight: 1,
          textTransform: "uppercase",
          color: colors.white,
          marginTop: 80,
        }}
      >
        <div style={{ fontSize: 66, letterSpacing: 8 }}>Studio Bonaccorso</div>
        <div style={{ fontSize: 230, letterSpacing: 12, marginTop: 10 }}>Lab</div>
      </div>
      <div
        style={{
          ...useRise(100),
          fontFamily: sans,
          fontWeight: 400,
          fontSize: 46,
          lineHeight: 1.35,
          color: colors.mid,
          marginTop: 40,
        }}
      >
        …e non solo: tanti altri servizi
        <br />
        ti aspettano. Ma non ti diciamo
        <br />
        ancora tutto.
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlight = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const pulse = 1 + Math.sin(frame / 8) * 0.015;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.powder }}>
      <AbsoluteFill style={{ padding: "0 110px", justifyContent: "center" }}>
        <Kicker>Scopri tutto nella</Kicker>
        <div
          style={{
            ...useRise(8),
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 132,
            lineHeight: 1,
            textTransform: "uppercase",
            color: colors.navy,
            marginTop: 30,
          }}
        >
          newsletter
        </div>
        <div style={{ ...useRise(22), marginTop: 90, position: "relative", alignSelf: "flex-start" }}>
          <div
            style={{
              position: "absolute",
              inset: "-10px -30px",
              background: colors.navy,
              transformOrigin: "left",
              transform: `scaleX(${highlight})`,
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 100,
              letterSpacing: 4,
              whiteSpace: "nowrap",
              color: colors.white,
              transform: `scale(${frame > 50 ? pulse : 1})`,
              transformOrigin: "left",
            }}
          >
            OGGI ALLE 16:00
          </div>
        </div>
        <div
          style={{
            ...useRise(50),
            fontFamily: sans,
            fontWeight: 400,
            fontSize: 50,
            lineHeight: 1.35,
            color: colors.navy,
            marginTop: 90,
          }}
        >
          Tieni d'occhio
          <br />
          la tua casella email.
        </div>
      </AbsoluteFill>
      <div
        style={{
          ...useRise(70),
          position: "absolute",
          left: 110,
          right: 110,
          bottom: 330,
          paddingTop: 40,
          borderTop: `3px solid ${colors.mid}`,
          fontFamily: sans,
          fontWeight: 400,
          fontSize: 34,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: colors.slate,
        }}
      >
        Studio Bonaccorso
      </div>
    </AbsoluteFill>
  );
};

export const BonaccorsoLabTeaser: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={HINT}>
          <Hint />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
