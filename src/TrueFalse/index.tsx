import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";
import { Clip, CLIPS, FPS, LABELS, TRANSITION_SECONDS } from "./config";

const TRANSITION = Math.round(TRANSITION_SECONDS * FPS);
const s = (seconds: number) => Math.round(seconds * FPS);

const clipFrames = CLIPS.map((c) => s(c.duration));
const clipStarts = clipFrames.map(
  (_, i) =>
    clipFrames.slice(0, i).reduce((a, b) => a + b, 0) - i * TRANSITION,
);

export const TRUE_FALSE_DURATION =
  clipFrames.reduce((a, b) => a + b, 0) - (CLIPS.length - 1) * TRANSITION;

const GREEN = "#2BD46B";
const RED = "#FF3B3B";
const answerColor = (answer: boolean) => (answer ? GREEN : RED);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// 1 inside the question (black & white), easing back to 0 around its edges.
const grayAmount = (clip: Clip, frame: number) => {
  if (!clip.question) return 0;
  const from = s(clip.question.from);
  const to = s(clip.question.to);
  return interpolate(frame, [from - 4, from, to, to + 6], [0, 1, 1, 0], clamp);
};

const ClipVideo: React.FC<{ clip: Clip; index: number }> = ({
  clip,
  index,
}) => {
  const frame = useCurrentFrame();
  const filter = `grayscale(${grayAmount(clip, frame)})`;

  if (!clip.src) {
    return (
      <AbsoluteFill
        style={{
          filter,
          background: `linear-gradient(180deg, #7FB7B2 0%, #A9C9B9 55%, #E6E3DC 70%)`,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 90,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Clip {index + 1}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile(`truefalse/${clip.src}`)}
        trimBefore={s(clip.trimStart ?? 0)}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter }}
      />
    </AbsoluteFill>
  );
};

// Green or red flash on the reveal, settling into a soft glow at the edges.
const Reveal: React.FC<{ answer: boolean }> = ({ answer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = answerColor(answer);
  const flash = interpolate(frame, [0, 3, 18], [0, 0.55, 0.14], clamp);
  const glow = interpolate(frame, [0, 6], [0, 1], clamp);
  const pop = spring({ frame, fps, config: { damping: 11, mass: 0.7 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ backgroundColor: color, opacity: flash, mixBlendMode: "soft-light" }}
      />
      <AbsoluteFill style={{ backgroundColor: color, opacity: flash * 0.5 }} />
      <AbsoluteFill
        style={{ boxShadow: `inset 0 0 160px 30px ${color}`, opacity: glow }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}>
        <div
          style={{
            transform: `scale(${pop}) rotate(${interpolate(pop, [0, 1], [-12, -4])}deg)`,
            opacity: Math.min(1, pop * 2),
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "22px 54px",
            borderRadius: 999,
            background: color,
            color: "white",
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: 2,
            boxShadow: `0 18px 60px ${color}99`,
          }}
        >
          <span>{answer ? "✓" : "✗"}</span>
          <span>{(answer ? LABELS.true : LABELS.false).toUpperCase()}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Phrase-level subtitles, white with a soft outline as in the reference.
const Subtitle: React.FC<{ text: string; duration: number }> = ({
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 3, duration - 3, duration],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1280 }}>
      <div
        style={{
          opacity,
          width: 940,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 58,
          lineHeight: 1.25,
          color: "white",
          WebkitTextStroke: "6px rgba(40,40,40,0.55)",
          paintOrder: "stroke fill",
          textShadow: "0 4px 16px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const ClipScene: React.FC<{ clip: Clip; index: number }> = ({
  clip,
  index,
}) => (
  <AbsoluteFill>
    <ClipVideo clip={clip} index={index} />
    {clip.answer !== null ? (
      <Sequence from={s(clip.revealAt)}>
        <Reveal answer={clip.answer} />
      </Sequence>
    ) : null}
    {clip.captions.map((c) => (
      <Sequence
        key={`${c.from}-${c.text}`}
        from={s(c.from)}
        durationInFrames={s(c.to) - s(c.from)}
      >
        <Subtitle text={c.text} duration={s(c.to) - s(c.from)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// "Vero o / Falso" stickers, top left. On the reveal the right one pops and
// lights up green or red, the other one fades back.
const Stickers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let index = 0;
  clipStarts.forEach((start, i) => {
    if (frame >= start) index = i;
  });
  const clip = CLIPS[index];
  const local = frame - clipStarts[index];
  const revealed = clip.answer !== null && local >= s(clip.revealAt);
  const pop = revealed
    ? spring({ frame: local - s(clip.revealAt), fps, config: { damping: 9 } })
    : 0;
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });

  const sticker = (isTrue: boolean): React.CSSProperties => {
    const chosen = revealed && clip.answer === isTrue;
    const other = revealed && clip.answer !== isTrue;
    return {
      display: "inline-block",
      padding: "14px 46px",
      borderRadius: 999,
      fontSize: 72,
      color: chosen ? "white" : "#1F1F1F",
      background: chosen
        ? answerColor(isTrue)
        : isTrue
          ? "#EEF7A3"
          : "#D9C4F1",
      opacity: other ? 0.45 : 1,
      transform: `scale(${1 + (chosen ? 0.18 * pop : 0)}) rotate(${chosen ? -4 * pop : 0}deg)`,
      transformOrigin: "left center",
      boxShadow: chosen
        ? `0 10px 40px ${answerColor(isTrue)}AA`
        : "0 6px 20px rgba(0,0,0,0.12)",
    };
  };

  return (
    <AbsoluteFill style={{ padding: "520px 0 0 56px", fontFamily: sans }}>
      <div
        style={{
          opacity: enter,
          transform: `translateX(${interpolate(enter, [0, 1], [-200, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={sticker(true)}>
          <span style={{ fontWeight: 700 }}>{LABELS.true}</span>{" "}
          <span style={{ fontWeight: 400 }}>{LABELS.or}</span>
        </div>
        <div style={{ ...sticker(false), marginLeft: 46, marginTop: -6 }}>
          <span style={{ fontWeight: 700 }}>{LABELS.false}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TrueFalse: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <TransitionSeries>
      {CLIPS.flatMap((clip, i) => [
        ...(i > 0
          ? [
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />,
            ]
          : []),
        <TransitionSeries.Sequence
          key={`c${i}`}
          durationInFrames={clipFrames[i]}
        >
          <ClipScene clip={clip} index={i} />
        </TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
    <Stickers />
  </AbsoluteFill>
);
