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
import { colors, sans, serif } from "../PilatesReformer/theme";

export const SPINELLI_FPS = 30;

const brand = {
  magenta: "#C8236F",
  cream: "#FBF6F1",
  ink: colors.ink,
};

type Line = {
  // Seconds, relative to the untrimmed source clip.
  from: number;
  to: number;
  text: string;
  highlight?: string[];
};

type Clip = {
  src: string;
  trimStart: number;
  end: number;
  lines: Line[];
};

// Line timings come from the speech envelope of each clip, split by syllables.
const CLIPS: Clip[] = [
  {
    src: "video/spinelli-1.mp4",
    trimStart: 0.4,
    end: 7.03,
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

const f = (s: number) => Math.round(s * SPINELLI_FPS);
const clipFrames = (c: Clip) => f(c.end) - f(c.trimStart);

export const SPINELLI_DURATION = CLIPS.reduce((n, c) => n + clipFrames(c), 0);

const LOCKUP = f(2.4);

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
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.45,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.28))",
        }}
      >
        <span
          style={{
            background: brand.cream,
            color: brand.ink,
            padding: "8px 26px",
            borderRadius: 18,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}
        >
          {words.map((w, i) => (
            <span
              key={i}
              style={{
                color: line.highlight?.includes(w) ? brand.magenta : undefined,
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

const ClipScene: React.FC<{ clip: Clip; zoom: [number, number] }> = ({
  clip,
  zoom,
}) => {
  const frame = useCurrentFrame();
  const duration = clipFrames(clip);
  const scale = interpolate(frame, [0, duration], zoom);
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
      {clip.lines.map((line) => {
        const from = f(line.from) - f(clip.trimStart);
        const length = Math.min(f(line.to), f(clip.end)) - f(line.from);
        return (
          <Sequence key={line.text} from={from} durationInFrames={length}>
            <Caption line={line} duration={length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Clinic name + service, shown over the closing line.
const Lockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const bar = spring({ frame: frame - 6, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
      <div
        style={{
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [-30, 0])}px)`,
          background: "rgba(251, 246, 241, 0.94)",
          borderRadius: 28,
          padding: "34px 56px 38px",
          textAlign: "center",
          boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 8,
            color: brand.magenta,
          }}
        >
          CENTRO MEDICO
        </div>
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.05,
            color: brand.ink,
          }}
        >
          Spinelli
        </div>
        <div
          style={{
            height: 4,
            width: 120 * bar,
            background: brand.magenta,
            margin: "18px auto 16px",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 38,
            color: colors.muted,
          }}
        >
          Protocollo nutrizionale personalizzato
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SpinelliNutrizione: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {CLIPS.map((clip, i) => (
          <Series.Sequence key={clip.src} durationInFrames={clipFrames(clip)}>
            <ClipScene clip={clip} zoom={i === 0 ? [1.08, 1] : [1, 1.06]} />
          </Series.Sequence>
        ))}
      </Series>
      <Sequence from={SPINELLI_DURATION - LOCKUP}>
        <Lockup />
      </Sequence>
    </AbsoluteFill>
  );
};
