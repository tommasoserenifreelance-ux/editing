import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BLOCKS,
  CUTAWAYS,
  LineStyle,
  NAME_CARD,
  REASONS,
  RED_WORDS,
  Scene,
} from "./edit";
import {
  AtmScene,
  AppScene,
  BankScene,
  CardsScene,
  GraphicBackground,
  Pin,
} from "./Scenes";
import { colors, condensed, outline } from "./theme";
import { CLIPS } from "./timeline";

export const CONTO_FPS = 30;
const FPS = CONTO_FPS;
const END_CARD = Math.round(2.8 * FPS);

const toFrame = (t: number) => Math.round(t * FPS);

// ---------- timeline maths ----------

const clipStartF: number[] = [];
{
  let t = 0;
  for (const clip of CLIPS) {
    clipStartF.push(toFrame(t));
    t += clip.trimOut - clip.trimIn;
  }
  clipStartF.push(toFrame(t));
}
const SPEECH_END = clipStartF[CLIPS.length];
export const CONTO_DURATION = SPEECH_END + END_CARD;

// Global frame of a time (seconds) inside clip `c`.
const g = (c: number, t: number) =>
  clipStartF[c] + toFrame(t - CLIPS[c].trimIn);

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

const cutawayWindows = CUTAWAYS.map((cut) => {
  const words = CLIPS[cut.clip].words;
  return {
    ...cut,
    from: Math.max(clipStartF[cut.clip], g(cut.clip, words[cut.from].s) - 3),
    to: Math.min(clipStartF[cut.clip + 1], g(cut.clip, words[cut.to].e) + 6),
  };
});

const onGraphic = (frame: number) =>
  cutawayWindows.some((w) => frame >= w.from && frame < w.to);

const ITEMS: Item[] = [];
CLIPS.forEach((clip, c) => {
  const items: Item[] = [];
  const { words } = clip;
  let i = 0;
  while (i < words.length) {
    const block = BLOCKS.find((b) => b.clip === c && b.at === i);
    if (block) {
      const from = g(c, words[i].s);
      let k = i;
      const lines: Line[] = block.lines.map(([n, style]) => {
        const line = {
          text: words
            .slice(k, k + n)
            .map((w) => clean(w.w))
            .join(" "),
          style,
          at: g(c, words[k].s) - from,
        };
        k += n;
        return line;
      });
      items.push({
        kind: "block",
        lines,
        icon: block.icon,
        from,
        to: g(c, words[k - 1].e) + 14,
      });
      i = k;
    } else if (NAME_CARD.clip === c && NAME_CARD.from === i) {
      items.push({
        kind: "name",
        from: g(c, words[i].s),
        to: g(c, words[NAME_CARD.to].e) + 15,
      });
      i = NAME_CARD.to + 1;
    } else {
      items.push({
        kind: "word",
        text: clean(words[i].w),
        red: RED_WORDS.some(([rc, rw]) => rc === c && rw === i),
        from: g(c, words[i].s),
        to: g(c, words[i].e) + 8,
      });
      i++;
    }
  }
  // No overlaps: each caption gives way to the next, and stays inside its clip.
  items.forEach((item, j) => {
    const next = items[j + 1];
    const limit = next ? next.from : clipStartF[c + 1];
    if (item.kind === "word" && next && next.from - item.to < 10) {
      item.to = next.from;
    }
    item.to = Math.max(item.from + 3, Math.min(item.to, limit));
  });
  ITEMS.push(...items);
});

// Punch-in zoom alternates on every clip start and key-phrase block.
const ZOOM_POINTS = [
  ...clipStartF.slice(0, -1),
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
  const base = shot % 2 === 0 ? 1 : 1.22;
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
        transformOrigin: "55% 37%",
        filter: "contrast(1.08) saturate(1.12) brightness(1.02)",
      }}
    >
      {CLIPS.map((clip, c) => (
        <Sequence
          key={clip.src}
          from={clipStartF[c]}
          durationInFrames={clipStartF[c + 1] - clipStartF[c]}
        >
          <OffthreadVideo
            src={staticFile(clip.src)}
            trimBefore={toFrame(clip.trimIn)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Sequence>
      ))}
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

const SCENES: Record<Scene, React.FC<{ clip: number }>> = {
  atm: () => <AtmScene />,
  app: () => <AppScene />,
  cards: ({ clip }) => {
    const w = CLIPS[clip].words;
    const start = g(clip, w[6].s) - 3;
    return (
      <CardsScene
        prepaidAt={g(clip, w[16].s) - start}
        creditAt={g(clip, w[20].s) - start}
      />
    );
  },
  bank: ({ clip }) => {
    const w = CLIPS[clip].words;
    return <BankScene strikeAt={g(clip, w[19].s) - (g(clip, w[16].s) - 3)} />;
  },
};

const Cutaway: React.FC<{ scene: Scene; clip: number; duration: number }> = ({
  scene,
  clip,
  duration,
}) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 8], [0, 150], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const Art = SCENES[scene];
  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${reveal}% at 50% 34%)`,
        opacity: exit,
        transform: `scale(${interpolate(exit, [0, 1], [1.08, 1])})`,
      }}
    >
      <GraphicBackground />
      <Art clip={clip} />
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
          fontSize: 80,
          fontWeight: 800,
          clipPath: `inset(0 ${wipe(0)}% 0 0)`,
        }}
      >
        Federica Galassini
      </div>
      <div
        style={{
          ...box(colors.red),
          color: colors.white,
          fontSize: 46,
          fontWeight: 700,
          marginTop: 10,
          letterSpacing: 1,
          clipPath: `inset(0 ${wipe(6)}% 0 0)`,
        }}
      >
        Consulente assicurativa senior
      </div>
    </AbsoluteFill>
  );
};

const ReasonBadge: React.FC<{ n: number; label: string; duration: number }> = ({
  n,
  label,
  duration,
}) => {
  const frame = useCurrentFrame();
  const p = usePopIn(2);
  const exit = interpolate(frame, [duration - 4, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ top: 1640, alignItems: "center", fontFamily: condensed }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          background: colors.red,
          borderRadius: 60,
          padding: "10px 34px 10px 10px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          transform: `scale(${interpolate(p, [0, 1], [0.3, 1])}) rotate(${interpolate(p, [0, 1], [-8, -2])}deg)`,
          opacity: Math.min(1, p * 2) * exit,
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            background: colors.white,
            color: colors.red,
            fontSize: 64,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {n}
        </div>
        <div style={{ color: colors.white, lineHeight: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>
            MOTIVO {n} DI 4
          </div>
          <div style={{ fontSize: 46, fontWeight: 800 }}>
            {label.toUpperCase()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const last = CLIPS[CLIPS.length - 1];
  const pop = [
    usePopIn(4),
    usePopIn(9),
    usePopIn(16),
    usePopIn(22),
    usePopIn(30),
  ];
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const item = (i: number): React.CSSProperties => ({
    opacity: Math.min(1, pop[i] * 2),
    transform: `translateY(${interpolate(pop[i], [0, 1], [40, 0])}px) scale(${interpolate(pop[i], [0, 1], [0.7, 1])})`,
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(28px)", transform: "scale(1.15)" }}>
        <OffthreadVideo
          src={staticFile(last.src)}
          trimBefore={toFrame(last.trimIn)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: fadeIn,
          background: `linear-gradient(170deg, rgba(142,18,32,0.82), rgba(51,5,10,0.92))`,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: condensed,
          color: colors.white,
          textAlign: "center",
        }}
      >
        <div
          style={{
            ...item(0),
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: 8,
          }}
        >
          IL TUO CONTO CORRENTE
        </div>
        <div
          style={{ ...item(1), fontSize: 150, fontWeight: 800, lineHeight: 1 }}
        >
          CONTO
          <br />
          GENERALI
        </div>
        <div
          style={{
            ...item(2),
            width: 160,
            height: 10,
            borderRadius: 5,
            background: colors.white,
            margin: "40px 0",
          }}
        />
        <div
          style={{ ...item(2), display: "flex", alignItems: "center", gap: 20 }}
        >
          <Pin size={72} color={colors.red} />
          <div style={{ textAlign: "left", lineHeight: 1.05 }}>
            <div style={{ fontSize: 64, fontWeight: 800 }}>
              Agenzia Generali
            </div>
            <div style={{ fontSize: 54, fontWeight: 500 }}>
              Frascati · Piazza Roma
            </div>
          </div>
        </div>
        <div
          style={{
            ...item(3),
            ...box(colors.white),
            color: colors.red,
            fontSize: 64,
            fontWeight: 800,
            marginTop: 60,
          }}
        >
          VIENI A TROVARCI
        </div>
      </AbsoluteFill>
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

cutawayWindows.forEach((w) => {
  sfx(w.from - 5, "whoosh", 0.75);
  sfx(w.to - 6, "swoosh", 0.35);
  const words = CLIPS[w.clip].words;
  if (w.scene === "atm") {
    sfx(w.from + 10, "kaching", 0.55);
    sfx(w.from + 18, "stamp", 0.8);
  } else if (w.scene === "app") {
    sfx(w.from + 44, "ding", 0.55);
  } else if (w.scene === "cards") {
    sfx(w.from + 14, "ding", 0.5);
    sfx(g(w.clip, words[16].s), "swoosh", 0.7);
    sfx(g(w.clip, words[20].s), "swoosh", 0.7);
  } else {
    sfx(g(w.clip, words[19].s), "stamp", 0.85);
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

REASONS.forEach((r) => sfx(clipStartF[r.clip] + 2, "tick", 0.5));

sfx(SPEECH_END - 36, "riser", 0.22);
sfx(SPEECH_END, "impact", 0.8);
sfx(SPEECH_END + 22, "ding", 0.45);

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

export const ContoGenerali: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <SpeakerVideo />
      <Vignette />
      {cutawayWindows.map((w) => (
        <Sequence key={w.scene} from={w.from} durationInFrames={w.to - w.from}>
          <Cutaway scene={w.scene} clip={w.clip} duration={w.to - w.from} />
        </Sequence>
      ))}
      {REASONS.map((r) => (
        <Sequence
          key={r.n}
          from={clipStartF[r.clip]}
          durationInFrames={clipStartF[r.clip + 1] - clipStartF[r.clip]}
        >
          <ReasonBadge
            n={r.n}
            label={r.label}
            duration={clipStartF[r.clip + 1] - clipStartF[r.clip]}
          />
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
