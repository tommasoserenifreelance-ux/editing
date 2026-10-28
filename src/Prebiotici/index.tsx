import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "../Bonaccorso/Captions";
import { colors } from "../Bonaccorso/theme";
import {
  at,
  CLIPS,
  DURATION,
  FPS,
  phrases,
  SEGMENTS,
  wordFrame,
} from "./script";

export {
  DURATION as PREBIOTICI_DURATION,
  FPS as PREBIOTICI_FPS,
} from "./script";

// Zoom per take, pivoting on the bottom edge so the face is lifted clear of
// the stickers and captions. Alternating scales hide the jump cuts.
const FRAMING = SEGMENTS.map((_, i) => (i % 2 === 0 ? 1.06 : 1.12));

const Take: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const frames = CLIPS[index];
  const drift = interpolate(frame, [0, frames], [0, 0.02]);
  // Two-frame audio fades so the cuts between sentences don't click.
  const volume = (f: number) =>
    Math.min(1, (f + 1) / 2, Math.max(0, (frames - f) / 2));
  return (
    <OffthreadVideo
      src={staticFile("prebiotici/doctor/prebiotici.mp4")}
      startFrom={Math.round(SEGMENTS[index][0] * FPS)}
      volume={volume}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${FRAMING[index] + drift})`,
        transformOrigin: "50% 100%",
      }}
    />
  );
};

const BRoll: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        muted
        src={staticFile(`prebiotici/broll/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.02 + frame * 0.0006})`,
        }}
      />
      {/* Darken the lower half so the captions stay readable. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(4,18,48,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Emoji stickers, in the style of the coffee intro: they spin in with a
// bounce, float, and throw a couple of sparkles. Centred between the chin
// and the captions.
const STICKER_TOP = 1060;
const STICKER_HEIGHT = 240;
const EMOJI_SIZE = 180;
const emojiFont = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"';

const usePop = (delay: number, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 170, mass: 0.7 },
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

const Emoji: React.FC<{ char: string; delay: number; index: number }> = ({
  char,
  delay,
  index,
}) => {
  const frame = useCurrentFrame();
  const t = usePop(delay, 8);
  const float = Math.sin((frame + index * 7) / 9) * 6;
  const tilt = [-6, 5, -3][index % 3];
  return (
    <div style={{ position: "relative", width: EMOJI_SIZE * 1.15 }}>
      <div
        style={{
          fontFamily: emojiFont,
          fontSize: EMOJI_SIZE,
          lineHeight: 1,
          textAlign: "center",
          filter: "drop-shadow(0 14px 18px rgba(4, 18, 48, 0.4))",
          opacity: frame >= delay ? 1 : 0,
          transform: `translateY(${float}px) scale(${t}) rotate(${interpolate(t, [0, 1], [-30, tilt])}deg)`,
        }}
      >
        {char}
      </div>
      <Sparkle x={-6} y={40} size={52} delay={delay + 6} color={colors.white} />
      <Sparkle
        x={EMOJI_SIZE * 1.15}
        y={STICKER_HEIGHT - 50}
        size={38}
        delay={delay + 10}
        color={colors.blue}
      />
    </div>
  );
};

const EmojiSticker: React.FC<{
  chars: string[];
  delays: number[];
  duration: number;
}> = ({ chars, delays, duration }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [duration - 5, duration], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: STICKER_TOP }}>
      <div
        style={{
          height: STICKER_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: 40,
          transform: `scale(${out})`,
        }}
      >
        {chars.map((c, i) => (
          <Emoji key={i} char={c} delay={delays[i]} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; file: string; volume: number }> = ({
  at: from,
  file,
  volume,
}) => (
  <Sequence from={from} durationInFrames={FPS * 2} layout="none">
    <Html5Audio src={staticFile(`sfx/${file}.wav`)} volume={volume} />
  </Sequence>
);

// Start of take i on the timeline (the end of the video past the last one).
const take = (i: number) => (i < CLIPS.length ? at(i, 0) : DURATION);

const BROLLS: { src: string; from: number; to: number }[] = [
  // Microbiome under the microscope for "salute intestinale".
  {
    src: "475.mp4",
    from: wordFrame(1, "Quando"),
    to: wordFrame(1, "sentiamo"),
  },
  // A bacterium for "dai microorganismi dell'ospite".
  { src: "470.mp4", from: wordFrame(3, "dai"), to: wordFrame(3, "che") },
  // Legumes for "alcune fibre possono essere prebiotici".
  { src: "473.mp4", from: take(4), to: take(5) },
  // Live bacteria, then capsules for "somministrati in quantità adeguate".
  {
    src: "474.mp4",
    from: wordFrame(5, "microorganismi"),
    to: wordFrame(5, "che"),
  },
  { src: "471.mp4", from: wordFrame(5, "che"), to: take(6) },
  // Inactivated cells for "microorganismi inattivati".
  { src: "472.mp4", from: wordFrame(8, "di"), to: wordFrame(8, "e") },
];

// Each sticker: emojis popping in at the given frames, gone at `to`.
const trio = (clip: number) => ({
  chars: ["🌾", "🦠", "🧪"],
  delays: [
    wordFrame(clip, clip === 0 ? "Prebiotici" : "prebiotici"),
    wordFrame(clip, "probiotici"),
    wordFrame(clip, "postbiotici"),
  ],
});
const single = (char: string, from: number) => ({
  chars: [char],
  delays: [from],
});

const STICKERS: { chars: string[]; delays: number[]; to: number }[] = [
  { ...trio(0), to: wordFrame(0, "vengono") },
  { ...single("🍲", wordFrame(0, "calderone")), to: wordFrame(0, "ma") },
  { ...trio(2), to: wordFrame(2, "ma") },
  { ...single("❌", wordFrame(2, "sinonimi")), to: take(3) },
  { ...single("🌾", wordFrame(3, "prebiotici")), to: wordFrame(3, "dai") },
  { ...single("💚", wordFrame(3, "un")), to: take(4) },
  { ...single("💪", take(6)), to: take(7) },
  { ...single("⚠️", wordFrame(7, "Non")), to: wordFrame(7, "fermentato") },
  { ...single("🫙", wordFrame(7, "fermentato")), to: wordFrame(7, "per") },
  { ...single("🧪", wordFrame(8, "postbiotici")), to: wordFrame(8, "di") },
  { ...single("🔬", wordFrame(9, "evidenze")), to: take(10) },
  { ...single("🏷️", wordFrame(10, "etichette")), to: take(11) },
];

const CAPTION_ZONES = STICKERS.map((s) => ({
  from: s.delays[0],
  to: s.to,
  top: STICKER_TOP + STICKER_HEIGHT + 15,
}));

type Sound = { at: number; file: string; volume: number };
const SOUNDS: Sound[] = [
  // A soft tick whenever a blue box lands.
  ...phrases.reduce<Sound[]>(
    (acc, p) =>
      acc.concat(
        p.lines
          .filter((l) => l.style === "x")
          .map((l) => ({ at: l.words[0].from, file: "tick", volume: 0.5 })),
      ),
    [],
  ),
  ...STICKERS.reduce<Sound[]>(
    (acc, s) =>
      acc.concat(s.delays.map((d) => ({ at: d, file: "pop", volume: 0.9 }))),
    [],
  ),
  ...BROLLS.map((b) => ({ at: b.from - 6, file: "whoosh", volume: 0.45 })),
  { at: wordFrame(1, "tre"), file: "ding", volume: 0.45 },
];

export const Prebiotici: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {CLIPS.map((frames, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Take index={i} />
          </Series.Sequence>
        ))}
      </Series>
      {BROLLS.map((b) => (
        <Sequence key={b.src} from={b.from} durationInFrames={b.to - b.from}>
          <BRoll src={b.src} />
        </Sequence>
      ))}
      {STICKERS.map((s) => (
        <Sequence
          key={s.delays[0]}
          from={s.delays[0]}
          durationInFrames={s.to - s.delays[0]}
        >
          <EmojiSticker
            chars={s.chars}
            delays={s.delays.map((d) => d - s.delays[0])}
            duration={s.to - s.delays[0]}
          />
        </Sequence>
      ))}
      <Captions phrases={phrases} zones={CAPTION_ZONES} />
      {SOUNDS.map((s, i) => (
        <Sfx key={i} {...s} />
      ))}
    </AbsoluteFill>
  );
};
