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

const EXIT = 8;
const TITLE = [
  ["Il", "caffè"],
  ["fa", "bene?"],
];
const SUBTITLE = "Vediamo cosa dicono i dati";

const pop = "Lilita One";
const emoji = '"Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji"';

const handle = delayRender("Loading Lilita One");
new FontFace(
  pop,
  `url(${staticFile("fonts/lilita-one-latin-400-normal.woff2")})`,
)
  .load()
  .then((font) => document.fonts.add(font))
  .then(() => continueRender(handle));

const colors = {
  ink: "#2B1A12",
  white: "#FFFFFF",
  yellow: "#FFD23F",
  pink: "#FF4D6D",
  cyan: "#3ED1E0",
};

// Thick outline and a hard offset shadow keep the text readable on any footage.
const outlined = (stroke: number, shadow: number, shadowColor: string) => ({
  WebkitTextStroke: `${stroke}px ${colors.ink}`,
  paintOrder: "stroke fill",
  textShadow: `${shadow}px ${shadow}px 0 ${shadowColor}`,
});

const usePop = (delay: number, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 160, mass: 0.7 },
  });
};

const Cup: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = usePop(0, 12);
  const cup = usePop(4, 8);
  const wobble = Math.sin(frame / 6) * 6 * Math.min(1, frame / 30);

  return (
    <div
      style={{
        position: "relative",
        width: 340,
        height: 340,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: colors.yellow,
          border: `10px solid ${colors.ink}`,
          boxShadow: `14px 14px 0 ${colors.pink}`,
          transform: `scale(${badge})`,
        }}
      />
      <div
        style={{
          fontFamily: emoji,
          fontSize: 210,
          lineHeight: 1,
          transform: `scale(${cup}) rotate(${interpolate(cup, [0, 1], [-30, 0]) + wobble}deg)`,
        }}
      >
        ☕
      </div>
    </div>
  );
};

const Word: React.FC<{ text: string; delay: number; tilt: number }> = ({
  text,
  delay,
  tilt,
}) => {
  const progress = usePop(delay);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: Math.min(1, progress * 3),
        transform: `translateY(${interpolate(progress, [0, 1], [80, 0])}px) scale(${progress}) rotate(${tilt}deg)`,
      }}
    >
      {text}
    </span>
  );
};

const Title: React.FC = () => {
  let index = 0;
  return (
    <div
      style={{
        fontFamily: pop,
        fontSize: 170,
        lineHeight: 1.02,
        color: colors.white,
        textAlign: "center",
        ...outlined(16, 10, colors.pink),
      }}
    >
      {TITLE.map((line) => (
        <div
          key={line.join(" ")}
          style={{ display: "flex", gap: 36, justifyContent: "center" }}
        >
          {line.map((word) => {
            const i = index++;
            return (
              <Word
                key={word}
                text={word}
                delay={10 + i * 5}
                tilt={i % 2 === 0 ? -3 : 3}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Subtitle: React.FC = () => {
  const progress = usePop(36, 11);
  return (
    <div
      style={{
        fontFamily: pop,
        fontSize: 66,
        color: colors.ink,
        backgroundColor: colors.yellow,
        border: `8px solid ${colors.ink}`,
        borderRadius: 999,
        padding: "18px 48px 22px",
        boxShadow: `10px 10px 0 ${colors.cyan}`,
        whiteSpace: "nowrap",
        opacity: Math.min(1, progress * 3),
        transform: `translateX(${interpolate(progress, [0, 1], [-500, 0])}px) rotate(-3deg)`,
      }}
    >
      {SUBTITLE}
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
        gap: 40,
        opacity: exit,
        transform: `scale(${interpolate(exit, [0, 1], [0.7, 1])})`,
      }}
    >
      <Cup />
      <Title />
      <Subtitle />
    </AbsoluteFill>
  );
};
