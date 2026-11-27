import {
  AbsoluteFill,
  Easing,
  Audio,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { interTight, pinkColors as colors } from "../EleonoraPiccolo/brand";
import data from "./data.json";

// Talking-head reel: the doctor's clips cut tight, with word-by-word captions,
// b-roll and graphic cards over her, and her shrunk to a corner meanwhile.
// Footage lives in public/allenamento (see .gitignore).
export const ALLENAMENTO_FPS = 30;
export const ALLENAMENTO_DURATION = Math.ceil(data.total * ALLENAMENTO_FPS);

const f = (s: number) => Math.round(s * ALLENAMENTO_FPS);
const file = (name: string) => staticFile(`allenamento/${name}`);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// The clips are sped up 1.2× (public/allenamento/fast); cue times below are in
// the original clips' seconds.
const SPEED = 1.2;

// Source time in a clip → seconds on the final timeline.
const at = (clip: keyof typeof data.tl, original: number) => {
  const src = original / SPEED;
  const segs = data.tl[clip];
  for (const [from, to, start] of segs) {
    if (src >= from && src <= to) return start + src - from;
  }
  const after = segs.filter(([, to]) => src > to).pop();
  return after ? after[2] + after[1] - after[0] : segs[0][2];
};

type Overlay =
  | { kind: "media"; src: string }
  | { kind: "image"; src: string; label: string }
  | { kind: "card"; kicker?: string; lines: string[]; accent?: number }
  | { kind: "pillars" }
  | { kind: "sets" };

type Cue = { clip: keyof typeof data.tl; from: number; to: number; o: Overlay };

const CUES: Cue[] = [
  { clip: "8122", from: 3.4, to: 5.9, o: { kind: "media", src: "pancia.mp4" } },
  {
    clip: "8122",
    from: 7.8,
    to: 9.9,
    o: { kind: "media", src: "addome.mp4" },
  },
  {
    clip: "8122",
    from: 10.6,
    to: 14.4,
    o: { kind: "media", src: "muscoli.mp4" },
  },
  {
    clip: "8122",
    from: 15.9,
    to: 19.6,
    o: {
      kind: "card",
      kicker: "LA SOLUZIONE",
      lines: ["Allenare e", "ipertrofizzare", "il muscolo"],
      accent: 1,
    },
  },
  {
    clip: "8123",
    from: 3.2,
    to: 5.1,
    o: {
      kind: "card",
      lines: ["Il muscolo è", "un organo di", "longevità"],
      accent: 2,
    },
  },
  {
    clip: "8123",
    from: 6.3,
    to: 10.5,
    o: { kind: "image", src: "spesa.png", label: "Autonomia" },
  },
  { clip: "8124", from: 1.9, to: 4.6, o: { kind: "pillars" } },
  {
    clip: "8124",
    from: 4.7,
    to: 10.2,
    o: { kind: "image", src: "pesi.png", label: "1. Pesi" },
  },
  { clip: "8124", from: 14.6, to: 24.3, o: { kind: "sets" } },
  {
    clip: "8124",
    from: 26.1,
    to: 30.7,
    o: { kind: "media", src: "manubri.mp4" },
  },
  {
    clip: "8124",
    from: 32.9,
    to: 35.4,
    o: {
      kind: "card",
      lines: ["Carico", "progressivo", "e crescente"],
      accent: 1,
    },
  },
  {
    clip: "8125",
    from: 0.2,
    to: 2.0,
    o: { kind: "card", kicker: "PILASTRO 2", lines: ["Cardio"], accent: 0 },
  },
  {
    clip: "8125",
    from: 6.2,
    to: 10.9,
    o: { kind: "media", src: "cuore.mp4" },
  },
  {
    clip: "8125",
    from: 11.4,
    to: 15.1,
    o: { kind: "media", src: "corsa.mp4" },
  },
  {
    clip: "8126",
    from: 0.2,
    to: 2.9,
    o: { kind: "card", kicker: "PILASTRO 3", lines: ["Equilibrio"], accent: 0 },
  },
  {
    clip: "8126",
    from: 3.0,
    to: 7.6,
    o: {
      kind: "image",
      src: "equilibrio.png",
      label: "Meno rischio di cadute",
    },
  },
  {
    clip: "8127",
    from: 1.1,
    to: 2.4,
    o: { kind: "image", src: "pilates.png", label: "Pilates" },
  },
  {
    clip: "8127",
    from: 2.4,
    to: 3.2,
    o: { kind: "image", src: "taichi.png", label: "Tai Chi" },
  },
  {
    clip: "8127",
    from: 3.2,
    to: 4.7,
    o: { kind: "image", src: "yoga.png", label: "Yoga" },
  },
  {
    clip: "8128",
    from: 0.0,
    to: 2.85,
    o: {
      kind: "card",
      kicker: "PILASTRO 4",
      lines: ["Articolazioni"],
      accent: 0,
    },
  },
  {
    clip: "8128",
    from: 2.9,
    to: 7.2,
    o: {
      kind: "media",
      src: "ginocchio.mp4",
    },
  },
  {
    clip: "8128",
    from: 9.3,
    to: 13.3,
    o: {
      kind: "media",
      src: "nuoto.mp4",
    },
  },
  {
    clip: "8129",
    from: 2.0,
    to: 9.5,
    o: {
      kind: "card",
      kicker: "LA VERITÀ SCOMODA",
      lines: ["L'allenamento", "è una medicina", "da prendere", "ogni giorno"],
      accent: 1,
    },
  },
  {
    clip: "8130",
    from: 4.7,
    to: 6.45,
    o: { kind: "media", src: "sonno.mp4" },
  },
  {
    clip: "8130",
    from: 6.5,
    to: 8.3,
    o: { kind: "media", src: "sorriso.mp4" },
  },
  {
    clip: "8130",
    from: 8.3,
    to: 12.6,
    o: { kind: "image", src: "gel.png", label: "Terapia ormonale sostitutiva" },
  },
  {
    clip: "8130",
    from: 13.0,
    to: 18.5,
    o: {
      kind: "card",
      lines: [
        "Allenamento",
        "+ terapia ormonale",
        "= una menopausa",
        "vissuta bene",
      ],
      accent: 3,
    },
  },
];

const TIMED = CUES.map((c) => ({
  start: f(at(c.clip, c.from)),
  end: f(at(c.clip, c.to)),
  o: c.o,
}));

const smooth = { ...clamp, easing: Easing.inOut(Easing.cubic) };

const PIP_SCALE = 0.42;
// Frames for her to shrink into / grow out of the corner.
const FADE = 16;
const SLIDE = 12;

// Back-to-back cues form one span. She shrinks into the corner only during
// the three longest spans; the others cover her with a slide.
const SPANS = TIMED.reduce<{ start: number; end: number; first: number }[]>(
  (acc, c, i) => {
    const last = acc[acc.length - 1];
    if (last && c.start - last.end <= FADE * 2) {
      last.end = Math.max(last.end, c.end);
    } else {
      acc.push({ start: c.start, end: c.end, first: i });
    }
    return acc;
  },
  [],
);
const PIP_SPANS = [...SPANS]
  .sort((x, y) => y.end - y.start - (x.end - x.start))
  .slice(0, 3)
  .sort((x, y) => x.start - y.start);
const spanOf = (frame: number) =>
  SPANS.find(({ start, end }) => frame >= start && frame < end);
const isPip = (span: { start: number } | undefined) =>
  span !== undefined && PIP_SPANS.some((p) => p.start === span.start);

// Overlays slide: the next one pushes the current one off to the left. Outside
// the corner spans the first slides in over her and the last slides away.
const OVERLAYS = TIMED.map((c, i) => {
  const span = spanOf(c.start)!;
  const pip = isPip(span);
  const chainedPrev = span.first !== i;
  const next =
    i + 1 < TIMED.length && spanOf(TIMED[i + 1].start) === span
      ? TIMED[i + 1]
      : null;
  const outAt = next ? next.start : pip ? null : c.end;
  return {
    ...c,
    slideIn: chainedPrev || !pip,
    outAt,
    until: outAt === null ? c.end : outAt + SLIDE,
  };
});

const Slider: React.FC<{
  start: number;
  slideIn: boolean;
  outAt: number | null;
  children: React.ReactNode;
}> = ({ start, slideIn, outAt, children }) => {
  const frame = useCurrentFrame() + start;
  const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
  const x =
    (slideIn
      ? interpolate(frame, [start, start + SLIDE], [1080, 0], ease)
      : 0) +
    (outAt !== null
      ? interpolate(frame, [outAt, outAt + SLIDE], [0, -1080], ease)
      : 0);
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- Letter reveal ----------

// Deterministic pseudo-random number in [-1, 1] for a given seed.
const jitter = (seed: number) => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};

// Letters fade in one after another, from blurred and scattered to settled.
const Reveal: React.FC<{
  text: string;
  start: number; // seconds or frames, same unit as `now`
  now: number;
  step: number; // delay between letters
  dur: number; // duration of each letter's animation
  seed?: number;
}> = ({ text, start, now, step, dur, seed = 0 }) => {
  // Words never break across lines; lines only wrap between words.
  let i = 0;
  return (
    <>
      {text.split(" ").map((word, wi) => (
        <span key={wi}>
          {wi ? " " : ""}
          <span style={{ whiteSpace: "nowrap" }}>
            {[...word].map((ch) => {
              const n = i++;
              const k = interpolate(
                now,
                [start + n * step, start + n * step + dur],
                [0, 1],
                clamp,
              );
              return (
                <span
                  key={n}
                  style={{
                    display: "inline-block",
                    opacity: k,
                    filter: `blur(${(1 - k) * 8}px)`,
                    transform: `translateY(${(1 - k) * 22 * jitter(seed + n)}px) scale(${0.7 + 0.3 * k})`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </>
  );
};

// ---------- Overlay pieces ----------

const GridBg: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.pink,
      backgroundImage: `linear-gradient(${colors.grid} 2px, transparent 2px), linear-gradient(90deg, ${colors.grid} 2px, transparent 2px)`,
      backgroundSize: "90px 90px",
    }}
  />
);

// Animated title above the illustrations.
const Label: React.FC<{ children: string }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 230,
        left: 70,
        right: 70,
        textAlign: "center",
        color: colors.plum,
        fontSize: 84,
        fontWeight: 700,
        letterSpacing: -2,
        lineHeight: 1.1,
      }}
    >
      <Reveal
        text={children}
        start={2}
        now={frame}
        step={0.8}
        dur={7}
        seed={children.length}
      />
    </div>
  );
};

const zoom = (t: number, len: number) =>
  `scale(${interpolate(t, [0, len], [1, 1.08], clamp)})`;

const Media: React.FC<{ src: string; len: number }> = ({ src, len }) => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={file(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: zoom(t, len),
        }}
      />
    </AbsoluteFill>
  );
};

const Picture: React.FC<{ src: string; label: string; len: number }> = ({
  src,
  label,
  len,
}) => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GridBg />
      <Label>{label}</Label>
      <Img
        src={file(src)}
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 390,
          width: 960,
          height: 600,
          objectFit: "contain",
          transform: zoom(t, len),
        }}
      />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ kicker?: string; lines: string[]; accent?: number }> = ({
  kicker,
  lines,
  accent,
}) => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GridBg />
      <div style={{ position: "absolute", top: 300, left: 90, right: 90 }}>
        {kicker ? (
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 5,
              color: colors.rose,
              marginBottom: 24,
            }}
          >
            {kicker}
          </div>
        ) : null}
        {lines.map((line, i) => (
          <div
            key={line}
            style={{
              opacity: interpolate(t, [i * 8, i * 8 + 8], [0, 1], clamp),
              transform: `translateY(${interpolate(t, [i * 8, i * 8 + 8], [30, 0], clamp)}px)`,
              fontSize: lines.length === 1 ? 140 : 96,
              fontWeight: i === accent || lines.length === 1 ? 700 : 300,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: i === accent ? colors.rose : colors.plum,
            }}
          >
            <Reveal
              text={line}
              start={i * 8}
              now={t}
              step={0.7}
              dur={7}
              seed={i * 31}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const PILLARS = ["Pesi", "Cardio", "Equilibrio", "Articolazioni"];

const Pillars: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GridBg />
      <div style={{ position: "absolute", top: 260, left: 90, right: 90 }}>
        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            letterSpacing: -3,
            color: colors.plum,
            marginBottom: 40,
          }}
        >
          I <span style={{ color: colors.rose }}>4 pilastri</span>
        </div>
        {PILLARS.map((p, i) => (
          <div
            key={p}
            style={{
              opacity: interpolate(t, [6 + i * 9, 14 + i * 9], [0, 1], clamp),
              display: "flex",
              alignItems: "center",
              gap: 30,
              background: "#fff",
              borderRadius: 22,
              borderLeft: `14px solid ${colors.rose}`,
              padding: "22px 36px",
              marginBottom: 22,
              fontSize: 56,
              fontWeight: 700,
              color: colors.plum,
            }}
          >
            <span style={{ color: colors.rose }}>{i + 1}</span>
            {p}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Sets: React.FC = () => {
  const t = useCurrentFrame();
  const row = (reps: number, how: string, fill: number, appearAt: number) => (
    <div
      style={{
        opacity: interpolate(t, [appearAt, appearAt + 8], [0, 1], clamp),
        marginBottom: 50,
      }}
    >
      <div style={{ fontSize: 70, fontWeight: 700, color: colors.plum }}>
        Serie da <span style={{ color: colors.rose }}>{reps}</span>
      </div>
      <div style={{ fontSize: 44, color: colors.navy, margin: "8px 0 18px" }}>
        {how}
      </div>
      <div
        style={{
          height: 34,
          borderRadius: 17,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${interpolate(t, [appearAt + 6, appearAt + 30], [0, fill], clamp)}%`,
            background: colors.rose,
          }}
        />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <GridBg />
      <div style={{ position: "absolute", top: 280, left: 90, right: 90 }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 5,
            color: colors.rose,
            marginBottom: 40,
          }}
        >
          COME INIZIARE CON I PESI
        </div>
        {row(5, "non deve essere faticosa", 35, 0)}
        {row(10, "lievemente faticosa", 70, f(4.5))}
      </div>
    </AbsoluteFill>
  );
};

const OverlayView: React.FC<{ o: Overlay; len: number }> = ({ o, len }) => {
  switch (o.kind) {
    case "media":
      return <Media src={o.src} len={len} />;
    case "image":
      return <Picture src={o.src} label={o.label} len={len} />;
    case "card":
      return <Card kicker={o.kicker} lines={o.lines} accent={o.accent} />;
    case "pillars":
      return <Pillars />;
    case "sets":
      return <Sets />;
  }
};

// ---------- Speaker, full screen or picture-in-picture ----------

// 0 = full screen, 1 = in the corner.
const pipAmount = (frame: number) => {
  let v = 0;
  for (const { start, end } of PIP_SPANS) {
    v = Math.max(
      v,
      Math.min(
        interpolate(frame, [start, start + FADE], [0, 1], smooth),
        interpolate(frame, [end - FADE, end], [1, 0], smooth),
      ),
    );
  }
  return v;
};

// Full screen ↔ corner, plus a jump zoom on every other caption phrase.
const useSpeakerFrame = (corner: boolean) => {
  const frame = useCurrentFrame();
  const k = corner ? pipAmount(frame) : 0;
  const phrase = phraseAt(frame / ALLENAMENTO_FPS);
  const punch = 1 + 0.12 * ((phrase < 0 ? 0 : phrase) % 2) * (1 - k);
  const feather = `rgba(0,0,0,${1 - k})`;
  const outer: React.CSSProperties = corner
    ? {
        transformOrigin: "100% 100%",
        transform: `scale(${1 - (1 - PIP_SCALE) * k})`,
        overflow: "hidden",
        WebkitMaskImage: `linear-gradient(to right, ${feather}, #000 22%), linear-gradient(to bottom, ${feather}, #000 18%)`,
        WebkitMaskComposite: "source-in",
      }
    : {};
  const inner: React.CSSProperties = {
    transform: `scale(${punch})`,
    transformOrigin: "50% 35%",
  };
  return { outer, inner };
};

const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

// Jump cuts between her takes slide: the next take enters from the right
// while the last frame of the previous one, frozen, leaves to the left.
const CUTS = data.segments.slice(1).map((s) => f(s.at));

const Take: React.FC<{
  clip: string;
  trim: number;
  slideIn: boolean;
  muted?: boolean;
}> = ({ clip, trim, slideIn, muted }) => {
  const t = useCurrentFrame();
  const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
  const x = slideIn ? interpolate(t, [0, SLIDE], [1080, 0], ease) : 0;
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      <OffthreadVideo
        src={file(`fast/IMG_${clip}.mp4`)}
        trimBefore={trim}
        muted={muted}
        style={fill}
      />
    </AbsoluteFill>
  );
};

const Tail: React.FC<{ clip: string; lastFrame: number }> = ({
  clip,
  lastFrame,
}) => {
  const t = useCurrentFrame();
  const ease = { ...clamp, easing: Easing.out(Easing.cubic) };
  return (
    <AbsoluteFill
      style={{
        zIndex: -1,
        transform: `translateX(${interpolate(t, [0, SLIDE], [0, -1080], ease)}px)`,
      }}
    >
      <Freeze frame={0}>
        <OffthreadVideo
          muted
          src={file(`fast/IMG_${clip}.mp4`)}
          trimBefore={lastFrame}
          style={fill}
        />
      </Freeze>
    </AbsoluteFill>
  );
};

const Takes: React.FC<{ muted?: boolean }> = ({ muted }) => (
  <>
    {data.segments.map((s, i) => {
      const start = f(s.at);
      const len = f(s.at + s.to - s.from) - start;
      return (
        <Sequence
          key={`${s.clip}-${s.from}`}
          from={start}
          durationInFrames={len}
        >
          <Take clip={s.clip} trim={f(s.from)} slideIn={i > 0} muted={muted} />
        </Sequence>
      );
    })}
    {data.segments.slice(0, -1).map((s) => {
      const start = f(s.at + s.to - s.from);
      return (
        <Sequence
          key={`tail-${s.clip}-${s.from}`}
          from={start}
          durationInFrames={SLIDE}
          layout="none"
        >
          <Tail clip={s.clip} lastFrame={f(s.to) - 1} />
        </Sequence>
      );
    })}
  </>
);

// Full screen, under the overlays: carries her voice.
const Speaker: React.FC = () => {
  const { inner } = useSpeakerFrame(false);
  return (
    <AbsoluteFill style={inner}>
      <Takes />
    </AbsoluteFill>
  );
};

// Over the overlays, only during the corner spans.
const SpeakerCorner: React.FC = () => {
  const frame = useCurrentFrame();
  const { outer, inner } = useSpeakerFrame(true);
  if (!PIP_SPANS.some(({ start, end }) => frame >= start && frame < end)) {
    return null;
  }
  return (
    <AbsoluteFill style={outer}>
      <AbsoluteFill style={inner}>
        <Takes muted />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Her cut-out (public/allenamento/fast/matte_8122.webm, first 4 s of the
// clip) drawn over the opening title so the title sits behind her.
const HOOK_END = f(at("8122", 3.4)) + FADE;
const SpeakerMatte: React.FC = () => {
  const { inner } = useSpeakerFrame(false);
  const first = data.segments[0];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={inner}>
        <Sequence durationInFrames={HOOK_END}>
          <OffthreadVideo
            transparent
            muted
            src={file("fast/matte_8122.webm")}
            trimBefore={f(first.from)}
            style={fill}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// A whoosh on every switch between her and the b-roll, softer between cues
// and on her jump cuts.
const Sfx: React.FC = () => (
  <>
    {CUTS.map((c) => (
      <Sequence key={`k${c}`} from={c - 4} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh-in.wav")} volume={0.3} />
      </Sequence>
    ))}
    {SPANS.map(({ start }) => (
      <Sequence
        key={`s${start}`}
        from={Math.max(0, start - 6)}
        durationInFrames={20}
      >
        <Audio src={staticFile("sfx/whoosh-in.wav")} volume={0.55} />
      </Sequence>
    ))}
    {SPANS.map(({ end }) => (
      <Sequence key={`e${end}`} from={end - 8} durationInFrames={18}>
        <Audio src={staticFile("sfx/whoosh-out.wav")} volume={0.45} />
      </Sequence>
    ))}
    {TIMED.filter((c) => !SPANS.some((p) => p.start === c.start)).map((c) => (
      <Sequence key={`c${c.start}`} from={c.start - 6} durationInFrames={20}>
        <Audio src={staticFile("sfx/whoosh-in.wav")} volume={0.3} />
      </Sequence>
    ))}
  </>
);

// Warm light flash on every switch between her and the b-roll.
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const { start, end } of PIP_SPANS) {
    for (const b of [start + FADE / 2, end - FADE / 2]) {
      o = Math.max(
        o,
        interpolate(frame, [b - 6, b, b + 8], [0, 0.85, 0], clamp),
      );
    }
  }
  if (o === 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background:
          "radial-gradient(circle at 65% 40%, rgba(255,246,236,1) 0%, rgba(255,214,190,0.85) 45%, rgba(246,193,204,0.4) 80%, rgba(246,193,204,0) 100%)",
      }}
    />
  );
};

// ---------- Captions ----------

type Word = (typeof data.words)[number];

// One-line phrases of about three words, broken at punctuation.
const PHRASES = (() => {
  const out: Word[][] = [];
  let line: Word[] = [];
  for (const w of data.words) {
    line.push(w);
    const len = line.map((x) => x.w).join(" ").length;
    if (/[.?!]$/.test(w.w) || len >= 14 || (/,$/.test(w.w) && len >= 7)) {
      out.push(line);
      line = [];
    }
  }
  if (line.length) out.push(line);
  return out;
})();

const phraseAt = (t: number) => {
  for (let i = PHRASES.length - 1; i >= 0; i--) {
    if (t >= PHRASES[i][0].t - 0.05) return i;
  }
  return -1;
};

// Each phrase keeps one place for its whole life, so it is never seen twice:
// hidden if a light card or picture covers any part of it, beside her if it
// overlaps a corner span, centred otherwise.
const PHRASE_MODE = PHRASES.map((phrase, i) => {
  const a = f(phrase[0].t - 0.05);
  const b = f(PHRASES[i + 1]?.[0].t ?? phrase[phrase.length - 1].e + 0.6);
  const overlaps = (s: number, e: number) => s < b && e > a;
  if (TIMED.some((c) => c.o.kind !== "media" && overlaps(c.start, c.end))) {
    return "hidden";
  }
  if (PIP_SPANS.some((p) => overlaps(p.start, p.end))) return "side";
  return "center";
});

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / ALLENAMENTO_FPS;
  const i = phraseAt(t);
  if (i < 0 || PHRASE_MODE[i] === "hidden") return null;
  const phrase = PHRASES[i];
  const end = PHRASES[i + 1]?.[0].t ?? phrase[phrase.length - 1].e + 0.6;
  if (t >= end) return null;
  const out = interpolate(t, [end - 0.18, end - 0.02], [0, 1], clamp);
  const side = PHRASE_MODE[i] === "side";
  const width = side ? 560 : 920;
  const text = phrase.map((w) => w.w.replace(/[.,]$/, "")).join(" ");
  // Never wraps: shrink the type to fit the line instead.
  const fontSize = Math.min(side ? 64 : 76, width / (text.length * 0.5));
  return (
    <div
      style={{
        position: "absolute",
        top: side ? 1560 : 1400,
        left: side ? 50 : 80,
        width,
        whiteSpace: "nowrap",
        textAlign: side ? "left" : "center",
        fontFamily: interTight,
        fontSize,
        fontWeight: i % 2 ? 700 : 300,
        letterSpacing: -1,
        color: "#fff",
        textShadow: "0 2px 16px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
        opacity: 1 - out,
        filter: `blur(${out * 8}px)`,
      }}
    >
      {phrase.map((w, wi) => (
        <span key={wi}>
          {wi ? " " : ""}
          <Reveal
            text={w.w.replace(/[.,]$/, "")}
            start={w.t - 0.04}
            now={t}
            step={0.025}
            dur={0.22}
            seed={Math.round(w.t * 100)}
          />
        </span>
      ))}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [HOOK_END - 8, HOOK_END], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 50,
        right: 50,
        opacity: o,
        filter: `blur(${(1 - o) * 8}px)`,
        textAlign: "center",
        fontFamily: interTight,
        lineHeight: 0.98,
        letterSpacing: -4,
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 300, color: colors.plum }}>
        <Reveal
          text="Menopausa:"
          start={2}
          now={frame}
          step={1}
          dur={8}
          seed={7}
        />
      </div>
      <div style={{ fontSize: 124, fontWeight: 700, color: colors.rose }}>
        <Reveal
          text="perché la pancia"
          start={10}
          now={frame}
          step={1}
          dur={8}
          seed={19}
        />
      </div>
      <div style={{ fontSize: 190, fontWeight: 700, color: colors.rose }}>
        <Reveal
          text="cresce?"
          start={24}
          now={frame}
          step={1.2}
          dur={8}
          seed={43}
        />
      </div>
    </div>
  );
};

export const AllenamentoMenopausa: React.FC = () => (
  <AbsoluteFill
    style={{ backgroundColor: colors.pink, fontFamily: interTight }}
  >
    <Speaker />
    <Hook />
    <SpeakerMatte />
    {OVERLAYS.map(({ start, until, o, slideIn, outAt }) => (
      <Sequence key={start} from={start} durationInFrames={until - start}>
        <Slider start={start} slideIn={slideIn} outAt={outAt}>
          <OverlayView o={o} len={until - start} />
        </Slider>
      </Sequence>
    ))}
    <SpeakerCorner />
    <Flash />
    <Captions />
    <Sfx />
  </AbsoluteFill>
);
