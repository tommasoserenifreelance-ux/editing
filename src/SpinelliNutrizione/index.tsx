import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";
import { brand } from "./brand";
import {
  Clipboard,
  DietTags,
  Growth,
  Heartbeat,
  MedicalCross,
  NeedsStack,
  Plate,
  ProgressBar,
  Refresh,
  Wipe,
} from "./graphics";

export const SPINELLI_FPS = 30;

type Line = {
  // Seconds, relative to the untrimmed source clip.
  from: number;
  to: number;
  text: string;
  highlight?: string[];
};

type Graphic = {
  // Seconds, relative to the untrimmed source clip.
  from: number;
  to: number;
  render: (duration: number) => React.ReactNode;
};

type Clip = {
  src: string;
  trimStart: number;
  end: number;
  zoom: [number, number];
  // Moments (source seconds) that get a quick punch-in zoom.
  punches: number[];
  lines: Line[];
  graphics: Graphic[];
};

const f = (s: number) => Math.round(s * SPINELLI_FPS);
const clipFrames = (c: Clip) => f(c.end) - f(c.trimStart);

// Line timings come from the speech envelope of each clip, split by syllables.
const CLIPS: Clip[] = [
  {
    src: "video/spinelli-1.mp4",
    trimStart: 0.4,
    end: 7.03,
    zoom: [1.06, 1],
    punches: [4.35, 5.8],
    graphics: [
      { from: 0.55, to: 1.7, render: (d) => <Heartbeat duration={d} /> },
      { from: 1.7, to: 2.95, render: (d) => <Plate duration={d} /> },
      {
        from: 3.05,
        to: 5.2,
        render: (d) => <DietTags duration={d} strikeAt={f(4.35 - 3.05)} />,
      },
      { from: 5.2, to: 7.03, render: (d) => <Refresh duration={d + 6} /> },
    ],
    lines: [
      { from: 0.55, to: 1.7, text: "La tua salute", highlight: ["salute"] },
      {
        from: 1.7,
        to: 2.95,
        text: "parte da ciò che mangi.",
        highlight: ["mangi."],
      },
      {
        from: 3.05,
        to: 4.35,
        text: "Sei stanca delle solite diete",
        highlight: ["diete"],
      },
      { from: 4.35, to: 5.2, text: "che non funzionano?" },
      { from: 5.2, to: 5.8, text: "È il momento" },
      {
        from: 5.8,
        to: 7.03,
        text: "di cambiare approccio.",
        highlight: ["approccio."],
      },
    ],
  },
  {
    src: "video/spinelli-2.mp4",
    trimStart: 0.55,
    end: 12.16,
    zoom: [1, 1.06],
    punches: [0.85, 11.1],
    graphics: [
      { from: 0.85, to: 2.2, render: (d) => <MedicalCross duration={d} /> },
      {
        from: 2.2,
        to: 5.1,
        render: (d) => <Clipboard duration={d} stampAt={f(3.5 - 2.2)} />,
      },
      {
        from: 5.1,
        to: 9.6,
        render: (d) => (
          <NeedsStack duration={d} at={[0, f(6.4 - 5.1), f(7.7 - 5.1)]} />
        ),
      },
      {
        from: 9.75,
        to: 12.16,
        render: (d) => <Growth duration={d + 6} checkAt={f(11.1 - 9.75)} />,
      },
    ],
    lines: [
      {
        from: 0.85,
        to: 2.2,
        text: "Al Centro Medico Spinelli",
        highlight: ["Centro", "Medico", "Spinelli"],
      },
      { from: 2.2, to: 3.5, text: "ti aspetta un protocollo" },
      {
        from: 3.5,
        to: 5.1,
        text: "nutrizionale personalizzato",
        highlight: ["personalizzato"],
      },
      { from: 5.1, to: 6.4, text: "sulle tue esigenze," },
      {
        from: 6.4,
        to: 7.7,
        text: "sul tuo metabolismo",
        highlight: ["metabolismo"],
      },
      {
        from: 7.7,
        to: 9.6,
        text: "e sui tuoi obiettivi.",
        highlight: ["obiettivi."],
      },
      {
        from: 9.75,
        to: 11.1,
        text: "Il cambiamento inizia",
        highlight: ["cambiamento"],
      },
      {
        from: 11.1,
        to: 12.16,
        text: "dalla tua scelta.",
        highlight: ["scelta."],
      },
    ],
  },
];

export const SPINELLI_DURATION = CLIPS.reduce((n, c) => n + clipFrames(c), 0);

const CUT = clipFrames(CLIPS[0]);
const WIPE = 14;

// Words light up one after another, roughly following the speech.
const Caption: React.FC<{ line: Line; duration: number }> = ({
  line,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, mass: 0.5 } });
  const exit = interpolate(frame, [duration - 3, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const words = line.text.split(" ");
  const total = words.reduce((n, w) => n + w.length, 0);
  let chars = 0;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 470,
      }}
    >
      <div
        style={{
          opacity: Math.min(1, enter * 2) * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
          maxWidth: 960,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 18,
          padding: "10px 30px",
          borderRadius: 22,
          background: brand.cream,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.3,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.28))",
        }}
      >
        {words.map((w, i) => {
          const at = (chars / total) * duration * 0.8;
          chars += w.length;
          const pop = spring({
            frame: frame - at,
            fps,
            config: { damping: 10, mass: 0.4 },
          });
          const key = line.highlight?.includes(w);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: key ? brand.magenta : brand.ink,
                opacity: interpolate(pop, [0, 1], [0.25, 1], {
                  extrapolateRight: "clamp",
                }),
                transform: `scale(${interpolate(pop, [0, 0.5, 1], [1, key ? 1.15 : 1.08, 1])})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ClipScene: React.FC<{ clip: Clip; entryPunch: boolean }> = ({
  clip,
  entryPunch,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = clipFrames(clip);
  const local = (s: number) => f(s) - f(clip.trimStart);

  const punch = clip.punches.reduce(
    (n, p) =>
      n +
      interpolate(frame - local(p), [0, 3, 18], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    0,
  );
  const entry = entryPunch
    ? 1 - spring({ frame, fps, config: { damping: 14 } })
    : 0;
  const scale =
    interpolate(frame, [0, duration], clip.zoom) *
    (1 + 0.07 * punch + 0.15 * entry);

  // Short audio ramps so the cut between clips doesn't click.
  const volume = (fr: number) =>
    interpolate(fr, [0, 3, duration - 3, duration], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          trimBefore={f(clip.trimStart)}
          volume={volume}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {clip.graphics.map((g) => {
        const length = Math.min(f(g.to), f(clip.end)) - f(g.from);
        return (
          <Sequence key={g.from} from={local(g.from)} durationInFrames={length}>
            {g.render(length)}
          </Sequence>
        );
      })}
      {clip.lines.map((line) => {
        const length = Math.min(f(line.to), f(clip.end)) - f(line.from);
        return (
          <Sequence
            key={line.text}
            from={local(line.from)}
            durationInFrames={length}
          >
            <Caption line={line} duration={length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const SpinelliNutrizione: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {CLIPS.map((clip, i) => (
          <Series.Sequence key={clip.src} durationInFrames={clipFrames(clip)}>
            <ClipScene clip={clip} entryPunch={i > 0} />
          </Series.Sequence>
        ))}
      </Series>
      <Sequence from={CUT - WIPE / 2} durationInFrames={WIPE}>
        <Wipe duration={WIPE} />
      </Sequence>
      <ProgressBar total={SPINELLI_DURATION} />
    </AbsoluteFill>
  );
};
