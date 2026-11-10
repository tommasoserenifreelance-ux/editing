import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./Captions";
import { Phrase } from "./phrases";
import { colors } from "./theme";

// A talking-head reel cut from one long take: each sentence is a segment of
// the source, laid end to end, with b-roll, emoji stickers, word-by-word
// captions and sound effects on top.

export type BRollCue = {
  src: string;
  from: number;
  to: number;
  // "contain" shows a landscape clip whole, over a blurred copy of itself,
  // instead of cropping a narrow slice out of it.
  fit?: "cover" | "contain";
  // Seconds into the clip to start from, to reuse a clip without repeats.
  startFrom?: number;
};
// A study screenshot on a blue cutaway; `crop` is the region of the image
// (in its own pixels) that shows the title block.
export type CardCue = {
  src: string;
  crop: { x: number; y: number; w: number; h: number };
  from: number;
  to: number;
};
// Emojis popping in at the given frames, gone at `to`.
export type StickerCue = { chars: string[]; delays: number[]; to: number };
export type Sound = { at: number; file: string; volume: number };

// Emoji stickers, in the style of the coffee intro: they spin in with a
// bounce, float, and throw a couple of sparkles. Centred between the chin
// and the captions.
const STICKER_TOP = 1060;
const STICKER_HEIGHT = 240;
const EMOJI_SIZE = 180;
const emojiFont = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"';

const Take: React.FC<{
  src: string;
  start: number;
  frames: number;
  scale: number;
  drift: number;
}> = ({ src, start, frames, scale, drift: driftTo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = interpolate(frame, [0, frames], [0, driftTo]);
  // Two-frame audio fades so the cuts between sentences don't click.
  const volume = (f: number) =>
    Math.min(1, (f + 1) / 2, Math.max(0, (frames - f) / 2));
  return (
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={Math.round(start * fps)}
      volume={volume}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        // Pivot on the bottom edge so zooming lifts the face clear of the
        // stickers and captions.
        transform: `scale(${scale + drift})`,
        transformOrigin: "50% 100%",
      }}
    />
  );
};

const BRoll: React.FC<Omit<BRollCue, "from" | "to">> = ({
  src,
  fit = "cover",
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const video = (style: React.CSSProperties) => (
    <OffthreadVideo
      muted
      src={staticFile(src)}
      startFrom={Math.round(startFrom * fps)}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
  const push = `scale(${1.02 + frame * 0.0006})`;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {fit === "cover" ? (
        video({ objectFit: "cover", transform: push })
      ) : (
        <>
          {video({
            objectFit: "cover",
            transform: "scale(1.2)",
            filter: "blur(40px) brightness(0.6)",
          })}
          <AbsoluteFill style={{ justifyContent: "center", top: -180 }}>
            {video({
              objectFit: "contain",
              transform: push,
              filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
            })}
          </AbsoluteFill>
        </>
      )}
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

const CARD_WIDTH = 920;

const StudyCard: React.FC<Omit<CardCue, "from" | "to">> = ({ src, crop }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  const scale = CARD_WIDTH / crop.w;
  return (
    // Fades in over the doctor, then hard-cuts to whatever follows.
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, ${colors.blue}, ${colors.navy} 75%)`,
          opacity: interpolate(frame, [0, 4], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
        <div
          style={{
            width: CARD_WIDTH,
            height: crop.h * scale,
            overflow: "hidden",
            borderRadius: 24,
            background: "white",
            border: `6px solid ${colors.blue}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            opacity: Math.min(1, t * 3),
            transform: `scale(${interpolate(t, [0, 1], [0.5, 1])}) rotate(${-2 * t}deg)`,
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: "auto",
              height: "auto",
              transform: `translate(${-crop.x * scale}px, ${-crop.y * scale}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Sfx: React.FC<Sound> = ({ at: from, file, volume }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={from} durationInFrames={fps * 2} layout="none">
      <Html5Audio src={staticFile(`sfx/${file}.wav`)} volume={volume} />
    </Sequence>
  );
};

export const SentenceReel: React.FC<{
  // The long take, under public/.
  source: string;
  // [start, end] in seconds of each sentence in the source.
  segments: [number, number][];
  // Length of each segment in frames.
  clips: number[];
  phrases: Phrase[];
  brolls: BRollCue[];
  stickers: StickerCue[];
  cards?: CardCue[];
  sounds?: Sound[];
  // Zoom on even and odd takes; alternating scales hide the jump cuts.
  zoom?: [number, number];
  // Slow push-in over each take, added to its zoom.
  drift?: number;
  // Frames of a quick slide between takes (0 = hard cut). The timeline the
  // cue frames come from must use the same overlap.
  slideFrames?: number;
}> = ({
  source,
  segments,
  clips,
  phrases,
  brolls,
  stickers,
  cards = [],
  sounds = [],
  zoom = [1.06, 1.12],
  drift = 0.02,
  slideFrames = 0,
}) => {
  const zones = stickers.map((s) => ({
    from: s.delays[0],
    to: s.to,
    top: STICKER_TOP + STICKER_HEIGHT + 15,
  }));
  const allSounds: Sound[] = [
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
    ...stickers.reduce<Sound[]>(
      (acc, s) =>
        acc.concat(s.delays.map((d) => ({ at: d, file: "pop", volume: 0.9 }))),
      [],
    ),
    ...brolls.map((b) => ({ at: b.from - 6, file: "whoosh", volume: 0.45 })),
    ...cards.map((c) => ({ at: c.from, file: "pop", volume: 0.9 })),
    // A light whoosh under each slide between takes.
    ...(slideFrames
      ? clips.slice(1).map((_, i) => ({
          at:
            clips.slice(0, i + 1).reduce((a, b) => a + b, 0) -
            (i + 1) * slideFrames -
            3,
          file: "whoosh",
          volume: 0.3,
        }))
      : []),
    ...sounds,
  ];
  const take = (i: number) => (
    <Take
      src={source}
      start={segments[i][0]}
      frames={clips[i]}
      scale={zoom[i % 2]}
      drift={drift}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {slideFrames ? (
        <TransitionSeries>
          {clips.map((frames, i) => [
            i > 0 ? (
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={slide({
                  direction: i % 2 ? "from-right" : "from-left",
                })}
                timing={linearTiming({ durationInFrames: slideFrames })}
              />
            ) : null,
            <TransitionSeries.Sequence key={i} durationInFrames={frames}>
              {take(i)}
            </TransitionSeries.Sequence>,
          ])}
        </TransitionSeries>
      ) : (
        <Series>
          {clips.map((frames, i) => (
            <Series.Sequence key={i} durationInFrames={frames}>
              {take(i)}
            </Series.Sequence>
          ))}
        </Series>
      )}
      {brolls.map((b) => (
        <Sequence key={b.from} from={b.from} durationInFrames={b.to - b.from}>
          <BRoll src={b.src} fit={b.fit} startFrom={b.startFrom} />
        </Sequence>
      ))}
      {cards.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.to - c.from}>
          <StudyCard src={c.src} crop={c.crop} />
        </Sequence>
      ))}
      {stickers.map((s) => (
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
      <Captions phrases={phrases} zones={zones} />
      {allSounds.map((s, i) => (
        <Sfx key={i} {...s} />
      ))}
    </AbsoluteFill>
  );
};
