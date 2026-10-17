import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background, Shade } from "./Slide";
import { asset, colors, sans, serif } from "./theme";

export const COVER_DURATION = 144; // 4.8 s, length of the source clip

// Hand-drawn stroke: a wavy pass under the word, then a quick return flick.
const SCRIBBLE =
  "M8 34 C 90 22, 170 40, 260 30 S 430 20, 520 28 S 640 36, 692 22 C 600 40, 420 48, 250 46 S 110 44, 70 50";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Word rises out of a mask, staggered by `delay`.
const Word: React.FC<{ children: string; delay: number }> = ({
  children,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        paddingRight: "0.12em",
        marginRight: "0.06em",
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%) rotate(${interpolate(p, [0, 1], [6, 0])}deg)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

// Without props it plays the video cover; with `image` it lays the same
// design over a photo (render the still on a frame after the type lands).
export const Cover: React.FC<{ image?: string; position?: string }> = ({
  image,
  position = "50% 10%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = interpolate(frame, [0, 16], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const punch = spring({
    frame: frame - 34,
    fps,
    config: { damping: 11, mass: 0.7 },
  });
  const underline = interpolate(frame, [46, 74], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const swipe = interpolate(frame, [70, 82], [0, 1], clamp);
  const nudge = Math.sin((frame / fps) * Math.PI * 2) * 8 * swipe;
  // Slow drift keeps the type alive once it has landed.
  const drift = interpolate(frame, [0, COVER_DURATION], [0, -14]);

  return (
    <AbsoluteFill>
      {image ? (
        <Background image={image} position={position} />
      ) : (
        <Background video="cover.mp4" position="50% 18%" zoom={[1, 1.06]} />
      )}
      <Shade from={34} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
        <Img
          src={asset("logo-santa-longevity.png")}
          style={{
            width: 520,
            opacity: logo,
            transform: `translateY(${interpolate(logo, [0, 1], [-20, 0])}px)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 72px 92px",
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 104,
            lineHeight: 1.04,
            color: colors.ink,
            textShadow: "0 6px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div>
            <Word delay={10}>Non</Word>
            <Word delay={14}>fare</Word>
          </div>
          <div>
            <Word delay={18}>le</Word>
            <Word delay={22}>scale.</Word>
          </div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              fontSize: 168,
              lineHeight: 1.1,
              color: colors.accent,
              opacity: Math.min(1, punch * 1.5),
              transform: `scale(${interpolate(punch, [0, 1], [0.6, 1])}) translateY(${interpolate(punch, [0, 1], [40, 0])}px)`,
              transformOrigin: "left bottom",
            }}
          >
            Allenale.
            <svg
              viewBox="0 0 700 60"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                left: -6,
                bottom: -24,
                width: "100%",
                height: 56,
                overflow: "visible",
              }}
            >
              <path
                d={SCRIBBLE}
                pathLength={1}
                fill="none"
                stroke={colors.accent}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={1}
                strokeDashoffset={1 - underline}
              />
            </svg>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 26,
            fontFamily: sans,
            fontSize: 28,
            color: colors.soft,
            opacity: swipe,
          }}
        >
          <span>Il protocollo per la longevità, gradino dopo gradino</span>
          <span
            style={{
              fontSize: 40,
              color: colors.ink,
              transform: `translateX(${nudge}px)`,
            }}
          >
            →
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
