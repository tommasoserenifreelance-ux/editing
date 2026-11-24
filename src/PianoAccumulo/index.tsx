import {
  AbsoluteFill,
  Audio,
  Img,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GraphicBackground, Pin } from "../ContoGenerali/Scenes";
import { colors, condensed, outline } from "../ContoGenerali/theme";
import {
  BLOCKS,
  CUTAWAYS,
  LineStyle,
  NAME_CARD,
  RED_WORDS,
  Scene,
} from "./edit";
import {
  AutoScene,
  BusyScene,
  FamilyScene,
  GoalsScene,
  GrowthScene,
} from "./Scenes";
import { JUMPS, WORDS } from "./words";

export const ACCUMULO_FPS = 30;
const FPS = ACCUMULO_FPS;
const END_CARD = Math.round(3 * FPS);
const SRC = "accumulo/timeline.mp4";

const toFrame = (t: number) => Math.round(t * FPS);

// ---------- timeline maths ----------

const SPEECH_END = toFrame(WORDS[WORDS.length - 1].e + 0.25);
export const ACCUMULO_DURATION = SPEECH_END + END_CARD;

const g = (t: number) => toFrame(t);
const ws = (i: number) => g(WORDS[i].s);
const we = (i: number) => g(WORDS[i].e);

const clean = (w: string) => w.replace(/[,.?!]/g, "");

type Line = { text: string; style: LineStyle; at: number };
type Item =
  | { kind: "word"; text: string; red: boolean; from: number; to: number }
  | {
      kind: "block";
      lines: Line[];
      icon?: "pin";
      from: number;
      to: number;
    }
  | { kind: "name"; from: number; to: number };

const cutawayWindows = CUTAWAYS.map((cut) => ({
  ...cut,
  from: ws(cut.from) - 2,
  to: we(cut.to) + 6,
}));

// Graphics that follow each other closely play as one continuous run, so the
// speaker never flashes on screen for a few frames between two animations.
const MERGE_GAP = 30;
type Run = {
  from: number;
  to: number;
  scenes: { scene: Scene; from: number }[];
};
const RUNS: Run[] = [];
cutawayWindows.forEach((w) => {
  const last = RUNS[RUNS.length - 1];
  if (last && w.from - last.to <= MERGE_GAP) {
    last.to = w.to;
    last.scenes.push({ scene: w.scene, from: w.from });
  } else {
    RUNS.push({
      from: w.from,
      to: w.to,
      scenes: [{ scene: w.scene, from: w.from }],
    });
  }
});

const onGraphic = (frame: number) =>
  RUNS.some((r) => frame >= r.from && frame < r.to);

const ITEMS: Item[] = [];
{
  let i = 0;
  while (i < WORDS.length) {
    const block = BLOCKS.find((b) => b.at === i);
    if (block) {
      const from = ws(i);
      let k = i;
      const lines: Line[] = block.lines.map(([n, style]) => {
        const line = {
          text: WORDS.slice(k, k + n)
            .map((w) => clean(w.w))
            .join(" "),
          style,
          at: ws(k) - from,
        };
        k += n;
        return line;
      });
      ITEMS.push({
        kind: "block",
        lines,
        icon: block.icon,
        from,
        to: we(k - 1) + 14,
      });
      i = k;
    } else if (NAME_CARD.from === i) {
      ITEMS.push({ kind: "name", from: ws(i), to: we(NAME_CARD.to) + 12 });
      i = NAME_CARD.to + 1;
    } else {
      ITEMS.push({
        kind: "word",
        text: clean(WORDS[i].w),
        red: RED_WORDS.includes(i),
        from: ws(i),
        to: we(i) + 8,
      });
      i++;
    }
  }
  // No overlaps: each caption gives way to the next.
  ITEMS.forEach((item, j) => {
    const next = ITEMS[j + 1];
    const limit = next ? next.from : SPEECH_END;
    if (item.kind === "word" && next && next.from - item.to < 10) {
      item.to = next.from;
    }
    item.to = Math.max(item.from + 3, Math.min(item.to, limit));
  });
}

// Punch-in zoom alternates on every key-phrase block.
const ZOOM_POINTS = [
  0,
  ...JUMPS.map((t) => toFrame(t)),
  ...ITEMS.filter((it) => it.kind !== "word").map((it) => it.from),
]
  .sort((a, b) => a - b)
  .filter((f, i, arr) => i === 0 || f - arr[i - 1] > 12);

// ---------- layers ----------

const SpeakerVideo: React.FC = () => {
  const frame = useCurrentFrame();
  let shot = 0;
  ZOOM_POINTS.forEach((f, i) => {
    if (frame >= f) shot = i;
  });
  const shotStart = ZOOM_POINTS[shot];
  const base = shot % 2 === 0 ? 1.06 : 1.28;
  const snap = interpolate(frame - shotStart, [0, 4], [base * 1.04, base], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const drift = 1 + (frame - shotStart) * 0.0006;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${snap * drift})`,
        transformOrigin: "49% 37%",
        filter: "contrast(1.08) saturate(1.1) brightness(1.03)",
      }}
    >
      <OffthreadVideo
        src={staticFile(SRC)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(0,0,0,0) 55%, rgba(30,8,10,0.45) 100%)",
    }}
  />
);

// Scene timings are relative to the start of each cutaway window.
const SCENES: Record<Scene, React.FC<{ start: number }>> = {
  family: ({ start }) => <FamilyScene kidsAt={ws(27) - start} />,
  busy: ({ start }) => (
    <BusyScene
      at={[ws(32) - start, ws(33) - start, ws(35) - start, ws(37) - start]}
    />
  ),
  auto: () => <AutoScene />,
  growth: ({ start }) => <GrowthScene growAt={10} flagAt={ws(70) - start} />,
  goals: ({ start }) => (
    <GoalsScene at={[ws(72) - start, ws(78) - start, ws(79) - start]} />
  ),
};

// A run of graphics: the backdrop cuts in at once and each scene starts its
// animation on its first frame; consecutive scenes slide into each other.
const SceneSlot: React.FC<{
  children: React.ReactNode;
  duration: number;
  last: boolean;
}> = ({ children, duration, last }) => {
  const frame = useCurrentFrame();
  const out = last
    ? 0
    : interpolate(frame, [duration - 6, duration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      });
  return (
    <AbsoluteFill
      style={{ opacity: 1 - out, transform: `translateX(${-out * 300}px)` }}
    >
      {children}
    </AbsoluteFill>
  );
};

const GraphicRun: React.FC<{ run: Run }> = ({ run }) => {
  const frame = useCurrentFrame();
  const duration = run.to - run.from;
  const exit = interpolate(frame, [duration - 4, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <GraphicBackground />
      {run.scenes.map((sc, i) => {
        const next = run.scenes[i + 1];
        const from = sc.from - run.from;
        const len = (next ? next.from - run.from : duration) - from;
        const Art = SCENES[sc.scene];
        return (
          <Sequence key={sc.scene} from={from} durationInFrames={len}>
            <SceneSlot duration={len} last={!next}>
              <Art start={sc.from} />
            </SceneSlot>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const usePopIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 180 },
  });
};

const box = (bg: string): React.CSSProperties => ({
  background: bg,
  padding: "2px 22px 6px",
  borderRadius: 10,
  textShadow: "none",
  boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
});

const lineStyle = (style: LineStyle, dark: boolean): React.CSSProperties => {
  if (style === "red") {
    return {
      ...box(dark ? colors.white : colors.red),
      color: dark ? colors.red : colors.white,
      fontSize: 92,
      fontWeight: 800,
      margin: "8px 0",
    };
  }
  if (style === "big") {
    return { fontSize: 108, fontWeight: 800, lineHeight: 1.02 };
  }
  return { fontSize: 62, fontWeight: 700, lineHeight: 1.1 };
};

const BlockLine: React.FC<{ line: Line; dark: boolean }> = ({ line, dark }) => {
  const p = usePopIn(line.at);
  const blur = interpolate(p, [0, 1], [10, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        ...lineStyle(line.style, dark),
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px) scale(${interpolate(p, [0, 1], [0.55, 1])})`,
        filter: `blur(${blur}px)`,
      }}
    >
      {line.text}
    </div>
  );
};

const CaptionFrame: React.FC<{
  children: React.ReactNode;
  dark: boolean;
  duration: number;
}> = ({ children, dark, duration }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [duration - 3, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        top: dark ? 1310 : 1130,
        bottom: "auto",
        height: 0,
        alignItems: "center",
        justifyContent: "center",
        opacity: exit,
      }}
    >
      <div
        style={{
          width: 980,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          fontFamily: condensed,
          color: colors.white,
          textShadow: outline,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

const WordCaption: React.FC<{
  text: string;
  red: boolean;
  dark: boolean;
  duration: number;
}> = ({ text, red, dark, duration }) => {
  const p = usePopIn();
  return (
    <CaptionFrame dark={dark} duration={duration}>
      <div
        style={{
          ...(red
            ? {
                ...box(dark ? colors.white : colors.red),
                color: dark ? colors.red : colors.white,
              }
            : {}),
          fontSize: 82,
          fontWeight: 800,
          transform: `scale(${interpolate(p, [0, 1], [1.35, 1])})`,
          opacity: Math.min(1, p * 2),
        }}
      >
        {text}
      </div>
    </CaptionFrame>
  );
};

const BlockCaption: React.FC<{
  lines: Line[];
  icon?: "pin";
  dark: boolean;
  duration: number;
}> = ({ lines, icon, dark, duration }) => {
  const pin = usePopIn(0);
  return (
    <CaptionFrame dark={dark} duration={duration}>
      {icon === "pin" ? (
        <div
          style={{
            transform: `translateY(${interpolate(pin, [0, 1], [-80, 0])}px)`,
            opacity: Math.min(1, pin * 2),
            marginBottom: 6,
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
          }}
        >
          <Pin size={70} color={dark ? colors.white : colors.red} />
        </div>
      ) : null}
      {lines.map((line) => (
        <BlockLine key={line.text + line.at} line={line} dark={dark} />
      ))}
    </CaptionFrame>
  );
};

const NameCard: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const wipe = (delay: number) =>
    interpolate(frame, [delay, delay + 9], [100, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        top: 1180,
        alignItems: "center",
        fontFamily: condensed,
        opacity: exit,
      }}
    >
      <div
        style={{
          ...box(colors.white),
          color: colors.ink,
          fontSize: 84,
          fontWeight: 800,
          clipPath: `inset(0 ${wipe(0)}% 0 0)`,
        }}
      >
        {NAME_CARD.name}
      </div>
      <div
        style={{
          ...box(colors.red),
          color: colors.white,
          fontSize: 44,
          fontWeight: 700,
          marginTop: 10,
          letterSpacing: 1,
          clipPath: `inset(0 ${wipe(6)}% 0 0)`,
        }}
      >
        {NAME_CARD.role}
      </div>
    </AbsoluteFill>
  );
};

// Closing: the picture dissolves to white and only the Generali logo stays.
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const white = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const logo = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(255,255,255,${white})`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={staticFile("accumulo/generali-logo-red.png")}
        style={{
          width: 520,
          opacity: logo,
          transform: `scale(${interpolate(logo, [0, 1], [0.94, 1])})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- sound effects ----------

type Sfx =
  | "whoosh"
  | "swoosh"
  | "pop"
  | "tick"
  | "ding"
  | "kaching"
  | "stamp"
  | "impact"
  | "riser";

const SFX: { at: number; file: Sfx; volume: number }[] = [];
const sfx = (at: number, file: Sfx, volume: number) =>
  SFX.push({ at: Math.max(0, at), file, volume });

RUNS.forEach((r) => {
  sfx(r.from - 3, "whoosh", 0.75);
  r.scenes.slice(1).forEach((sc) => sfx(sc.from - 6, "swoosh", 0.55));
  sfx(r.to - 6, "swoosh", 0.35);
});

cutawayWindows.forEach((w) => {
  if (w.scene === "family") {
    sfx(ws(27), "pop", 0.55);
    sfx(ws(27) + 10, "ding", 0.4);
  } else if (w.scene === "busy") {
    [32, 33, 35].forEach((i) => sfx(ws(i), "pop", 0.55));
    sfx(ws(37), "stamp", 0.6);
  } else if (w.scene === "auto") {
    sfx(w.from + 6, "kaching", 0.5);
    sfx(w.from + 58, "ding", 0.45);
  } else if (w.scene === "growth") {
    sfx(w.from + 2, "tick", 0.5);
    sfx(w.from + 10, "swoosh", 0.5);
    sfx(ws(70), "stamp", 0.7);
  } else {
    [72, 78, 79].forEach((i) => sfx(ws(i), "pop", 0.55));
  }
});

ITEMS.forEach((it) => {
  if (it.kind === "block") {
    it.lines.forEach((line, i) =>
      sfx(it.from + line.at, i === 0 ? "pop" : "tick", i === 0 ? 0.5 : 0.35),
    );
  } else if (it.kind === "name") {
    sfx(it.from, "swoosh", 0.6);
  } else if (it.red) {
    sfx(it.from, "pop", 0.45);
  }
});

sfx(SPEECH_END + 8, "ding", 0.35);

SFX.sort((a, b) => a.at - b.at);

const SoundEffects: React.FC = () => (
  <>
    {SFX.filter(
      (cue, i) =>
        !SFX.slice(0, i).some(
          (prev) => prev.file === cue.file && cue.at - prev.at < 4,
        ),
    ).map((cue, i) => (
      <Sequence key={`${cue.file}-${cue.at}-${i}`} from={cue.at}>
        <Audio src={staticFile(`sfx/${cue.file}.wav`)} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);

export const PianoAccumulo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <SpeakerVideo />
      <Vignette />
      {RUNS.map((r) => (
        <Sequence key={r.from} from={r.from} durationInFrames={r.to - r.from}>
          <GraphicRun run={r} />
        </Sequence>
      ))}
      {ITEMS.map((it) => {
        const duration = it.to - it.from;
        const dark = onGraphic(it.from);
        return (
          <Sequence key={it.from} from={it.from} durationInFrames={duration}>
            {it.kind === "word" ? (
              <WordCaption
                text={it.text}
                red={it.red}
                dark={dark}
                duration={duration}
              />
            ) : it.kind === "block" ? (
              <BlockCaption
                lines={it.lines}
                icon={it.icon}
                dark={dark}
                duration={duration}
              />
            ) : (
              <NameCard duration={duration} />
            )}
          </Sequence>
        );
      })}
      <Sequence from={SPEECH_END} durationInFrames={END_CARD}>
        <EndCard />
      </Sequence>
      <SoundEffects />
    </AbsoluteFill>
  );
};
