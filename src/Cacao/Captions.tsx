import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Line, LineStyle, Phrase, phrases } from "./script";
import { colors, sans, serif } from "./theme";

const MAX_WIDTH = 940;

// Base font size and average glyph width (in em) per style, so long lines
// shrink to fit the frame.
const SIZES: Record<LineStyle, [number, number]> = {
  s: [46, 0.56],
  b: [112, 0.64],
  c: [112, 0.64],
  n: [210, 0.62],
  x: [86, 0.5],
  i: [92, 0.5],
};

const fitSize = (line: Line) => {
  const [size, em] = SIZES[line.style];
  const chars = line.words.map((w) => w.text).join(" ").length;
  return Math.min(size, MAX_WIDTH / (chars * em));
};

const shadow = "0 4px 18px rgba(4, 18, 48, 0.55)";

const styleFor = (style: LineStyle, size: number): React.CSSProperties => {
  switch (style) {
    case "s":
      return { fontFamily: sans, fontWeight: 600, color: colors.white };
    case "b":
    case "c":
    case "n":
      return {
        fontFamily: sans,
        fontWeight: 800,
        letterSpacing: -size * 0.03,
        lineHeight: 0.95,
        color: style === "b" ? colors.white : colors.cyan,
      };
    case "x":
    case "i":
      return {
        fontFamily: serif,
        fontStyle: "italic",
        fontWeight: 600,
        lineHeight: 1.1,
        color: style === "x" ? colors.white : colors.cyan,
      };
  }
};

const usePop = (from: number, stiff = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - from,
    fps,
    config: stiff
      ? { damping: 12, mass: 0.5, stiffness: 220 }
      : { damping: 16, mass: 0.5 },
  });
  return { visible: frame >= from, t };
};

const Word: React.FC<{ text: string; from: number; gap: boolean }> = ({
  text,
  from,
  gap,
}) => {
  const { visible, t } = usePop(from);
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: gap ? "0.25em" : 0,
        opacity: visible ? Math.min(1, t * 2.5) : 0,
        transform: `translateY(${interpolate(t, [0, 1], [18, 0])}px) scale(${interpolate(t, [0, 1], [0.85, 1])})`,
      }}
    >
      {text}
    </span>
  );
};

const BoxLine: React.FC<{ line: Line; size: number }> = ({ line, size }) => {
  const { visible, t } = usePop(line.words[0].from, true);
  return (
    <div
      style={{
        ...styleFor(line.style, size),
        fontSize: size,
        padding: "0.02em 0.32em 0.1em",
        borderRadius: 14,
        background: colors.blue,
        boxShadow: "0 10px 30px rgba(4, 18, 48, 0.45)",
        opacity: visible ? 1 : 0,
        transform: `scale(${interpolate(t, [0, 1], [0.6, 1])}) rotate(${interpolate(t, [0, 1], [-4, -1.5])}deg)`,
      }}
    >
      {line.words.map((w) => w.text).join(" ")}
    </div>
  );
};

// Lines alternate left / right of centre to build a staggered block.
const ALIGN = ["flex-start", "center", "flex-end"];

const PhraseBlock: React.FC<{ phrase: Phrase }> = ({ phrase }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [phrase.to - 3, phrase.to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const n = phrase.lines.length;
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", top: 700 }}
    >
      <div
        style={{
          width: MAX_WIDTH,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          opacity: exit,
          textShadow: shadow,
        }}
      >
        {phrase.lines.map((line, i) => {
          const size = fitSize(line);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: n === 1 ? "center" : ALIGN[i === n - 1 ? 2 : i],
                paddingLeft: i === 0 && n > 1 ? 40 : 0,
                paddingRight: i === n - 1 && n > 1 ? 40 : 0,
              }}
            >
              {line.style === "x" ? (
                <BoxLine line={line} size={size} />
              ) : (
                <div
                  style={{
                    ...styleFor(line.style, size),
                    fontSize: size,
                    whiteSpace: "nowrap",
                  }}
                >
                  {line.words.map((w, j) => (
                    <Word key={j} text={w.text} from={w.from} gap={j > 0} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const phrase = phrases.find((p) => frame >= p.from && frame < p.to);
  return phrase ? <PhraseBlock key={phrase.from} phrase={phrase} /> : null;
};
