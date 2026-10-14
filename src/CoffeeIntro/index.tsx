import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Title card on a transparent background, meant to be layered over the
// first seconds of a clip. Render with an alpha-capable codec (ProRes 4444).

export const COFFEE_INTRO_FPS = 30;
export const COFFEE_INTRO_DURATION = 120;

const EXIT = 10;

const display = "Bricolage Grotesque";
const emoji = '"Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji"';

const handle = delayRender("Loading Bricolage Grotesque");
Promise.all(
  ["600", "800"].map((weight) =>
    new FontFace(
      display,
      `url(${staticFile(`fonts/bricolage-grotesque-latin-${weight}-normal.woff2`)})`,
      { weight },
    )
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

const colors = {
  cobalt: "#2557F5",
  navy: "#0B1B4D",
  sky: "#9CC4FF",
  ice: "#EAF2FF",
  white: "#FFFFFF",
};

// Hard navy offset plus a soft shadow: graphic, but it still sits on footage.
const lift = (offset: number) =>
  `${offset}px ${offset}px 0 ${colors.navy}, 0 24px 48px rgba(11, 27, 77, 0.35)`;

const usePop = (delay: number, damping = 12, stiffness = 170) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness, mass: 0.7 },
  });
};

const Sparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}> = ({ x, y, size, delay, color }) => {
  const frame = useCurrentFrame();
  const progress = usePop(delay, 9);
  const twinkle = 1 + Math.sin((frame - delay) / 5) * 0.12;
  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        transform: `scale(${progress * twinkle}) rotate(${progress * 90}deg)`,
        overflow: "visible",
      }}
    >
      <path
        d="M 0 -50 C 6 -12, 12 -6, 50 0 C 12 6, 6 12, 0 50 C -6 12, -12 6, -50 0 C -12 -6, -6 -12, 0 -50 Z"
        fill={color}
        stroke={colors.navy}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Cup: React.FC = () => {
  const frame = useCurrentFrame();
  const cup = usePop(0, 8);
  const float = Math.sin(frame / 9) * 6 * Math.min(1, frame / 30);

  return (
    <div style={{ position: "relative", width: 300, height: 300 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: emoji,
          fontSize: 260,
          lineHeight: 1,
          filter: "drop-shadow(0 18px 24px rgba(11, 27, 77, 0.35))",
          transform: `translateY(${float}px) scale(${cup}) rotate(${interpolate(cup, [0, 1], [-25, -4])}deg)`,
        }}
      >
        ☕
      </div>
      <Sparkle x={-30} y={30} size={78} delay={14} color={colors.sky} />
      <Sparkle x={325} y={-5} size={58} delay={18} color={colors.white} />
      <Sparkle x={330} y={270} size={44} delay={22} color={colors.sky} />
    </div>
  );
};

// A colored slab wipes in from the left, then the words rise into it.
const Slab: React.FC<{
  text: string;
  delay: number;
  tilt: number;
  background: string;
  color: string;
  shift: number;
}> = ({ text, delay, tilt, background, color, shift }) => {
  const frame = useCurrentFrame();
  const wipe = usePop(delay, 16, 200);
  const rise = interpolate(frame - delay - 5, [0, 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settle = usePop(delay + 4, 8);

  return (
    <div
      style={{
        transform: `translateX(${shift}px) rotate(${tilt * settle}deg)`,
      }}
    >
      <div
        style={{
          backgroundColor: background,
          borderRadius: 28,
          padding: "6px 40px 20px",
          boxShadow: lift(12),
          transform: `scaleX(${wipe})`,
          transformOrigin: "left center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: display,
            fontWeight: 800,
            fontSize: 156,
            lineHeight: 1.05,
            letterSpacing: -4,
            color,
            whiteSpace: "nowrap",
            transform: `translateY(${rise * 110}%)`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export const CoffeeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(
    frame,
    [COFFEE_INTRO_DURATION - EXIT, COFFEE_INTRO_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
        transform: `scale(${interpolate(exit, [0, 1], [0.85, 1])})`,
      }}
    >
      <Cup />
      <div
        style={{
          marginTop: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Slab
          text="Il caffè"
          delay={12}
          tilt={-3}
          background={colors.cobalt}
          color={colors.white}
          shift={-40}
        />
        <Slab
          text="fa bene?"
          delay={20}
          tilt={2}
          background={colors.ice}
          color={colors.navy}
          shift={40}
        />
      </div>
    </AbsoluteFill>
  );
};
