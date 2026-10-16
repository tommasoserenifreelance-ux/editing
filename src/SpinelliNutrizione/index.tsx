import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { sans } from "../PilatesReformer/theme";
import { brand } from "./brand";
import { Clipboard, DietTags, Growth, Heartbeat, NeedsRow } from "./graphics";

export const SPINELLI_FPS = 30;

const f = (s: number) => Math.round(s * SPINELLI_FPS);

// The two clips are one continuous take: the end of "approccio" is in the
// first 0.3 s of the second clip, so it is kept untrimmed.
const CLIPS = [
  { src: "video/spinelli-1.mp4", trimStart: 0.4, end: 7.03, zoom: [1, 1.04] },
  { src: "video/spinelli-2.mp4", trimStart: 0, end: 12.16, zoom: [1.04, 1.08] },
] as const;

const clipFrames = (i: number) => f(CLIPS[i].end) - f(CLIPS[i].trimStart);
const clipStart = (i: number) =>
  CLIPS.slice(0, i).reduce((n, _, j) => n + clipFrames(j), 0);

// Composition frame for a moment (in seconds) of the untrimmed source clip.
const at = (clip: number, s: number) =>
  clipStart(clip) + f(s) - f(CLIPS[clip].trimStart);

export const SPINELLI_DURATION = clipStart(CLIPS.length);

type Caption = { from: number; to: number; text: string; highlight: string[] };

// Timings come from the speech envelope of each clip.
const CAPTIONS: Caption[] = [
  {
    from: at(0, 0.55),
    to: at(0, 2.95),
    text: "La tua salute parte da ciò che mangi.",
    highlight: ["salute", "mangi."],
  },
  {
    from: at(0, 3.05),
    to: at(0, 5.2),
    text: "Sei stanca delle solite diete che non funzionano?",
    highlight: ["diete"],
  },
  {
    from: at(0, 5.2),
    to: at(1, 0.45),
    text: "È il momento di cambiare approccio.",
    highlight: ["approccio."],
  },
  {
    from: at(1, 0.85),
    to: at(1, 2.2),
    text: "Al Centro Medico Spinelli",
    highlight: ["Centro", "Medico", "Spinelli"],
  },
  {
    from: at(1, 2.2),
    to: at(1, 5.1),
    text: "ti aspetta un protocollo nutrizionale personalizzato",
    highlight: ["personalizzato"],
  },
  {
    from: at(1, 5.1),
    to: at(1, 7.7),
    text: "sulle tue esigenze, sul tuo metabolismo",
    highlight: ["esigenze,", "metabolismo"],
  },
  {
    from: at(1, 7.7),
    to: at(1, 9.6),
    text: "e sui tuoi obiettivi.",
    highlight: ["obiettivi."],
  },
  {
    from: at(1, 9.75),
    to: SPINELLI_DURATION,
    text: "Il cambiamento inizia dalla tua scelta.",
    highlight: ["cambiamento", "scelta."],
  },
];

type Graphic = {
  from: number;
  to: number;
  render: (duration: number, from: number) => React.ReactNode;
};

const GRAPHICS: Graphic[] = [
  {
    from: at(0, 0.55),
    to: at(0, 2.95),
    render: (d) => <Heartbeat duration={d} />,
  },
  {
    from: at(0, 3.05),
    to: at(0, 5.2),
    render: (d, from) => (
      <DietTags duration={d} strikeAt={at(0, 4.35) - from} />
    ),
  },
  {
    from: at(1, 2.2),
    to: at(1, 5.1),
    render: (d) => <Clipboard duration={d} />,
  },
  {
    from: at(1, 5.1),
    to: at(1, 9.6),
    render: (d, from) => (
      <NeedsRow duration={d} at={[0, at(1, 6.4) - from, at(1, 7.7) - from]} />
    ),
  },
  {
    from: at(1, 9.75),
    to: SPINELLI_DURATION,
    // Stays on screen through the last frame.
    render: (d, from) => (
      <Growth duration={d + 10} checkAt={at(1, 11.1) - from} />
    ),
  },
];

// [composition frame, file in public/sfx, volume]
const SOUNDS: [number, string, number][] = [
  [at(0, 1.3), "heartbeat", 0.3],
  [at(0, 3.05), "pop", 0.2],
  [at(0, 4.35), "whoosh", 0.18],
  [at(1, 2.73), "tick", 0.3],
  [at(1, 3.33), "tick", 0.3],
  [at(1, 3.93), "tick", 0.3],
  [at(1, 5.1), "pop", 0.2],
  [at(1, 6.4), "pop", 0.2],
  [at(1, 7.7), "pop", 0.2],
  [at(1, 11.3), "ding", 0.25],
];

const soft = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
} as const;

const CaptionView: React.FC<{ caption: Caption; duration: number }> = ({
  caption,
  duration,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], soft);
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], soft);

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1270 }}>
      <div
        style={{
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [12, 0])}px)`,
          maxWidth: 940,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 60,
          lineHeight: 1.45,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
        }}
      >
        <span
          style={{
            background: brand.cream,
            color: brand.ink,
            padding: "8px 24px",
            borderRadius: 18,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          {caption.text.split(" ").map((w, i) => (
            <span
              key={i}
              style={{
                color: caption.highlight.includes(w)
                  ? brand.magenta
                  : undefined,
              }}
            >
              {i > 0 ? " " : ""}
              {w}
            </span>
          ))}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const ClipVideo: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const clip = CLIPS[index];
  const scale = interpolate(frame, [0, clipFrames(index)], clip.zoom);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={f(clip.trimStart)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

export const SpinelliNutrizione: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {CLIPS.map((clip, i) => (
        <Sequence
          key={clip.src}
          from={clipStart(i)}
          durationInFrames={clipFrames(i)}
        >
          <ClipVideo index={i} />
        </Sequence>
      ))}
      {GRAPHICS.map((g) => (
        <Sequence key={g.from} from={g.from} durationInFrames={g.to - g.from}>
          {g.render(g.to - g.from, g.from)}
        </Sequence>
      ))}
      {CAPTIONS.map((c) => (
        <Sequence key={c.text} from={c.from} durationInFrames={c.to - c.from}>
          <CaptionView caption={c} duration={c.to - c.from} />
        </Sequence>
      ))}
      {SOUNDS.map(([frame, name, volume]) => (
        <Sequence key={`${name}-${frame}`} from={frame}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
