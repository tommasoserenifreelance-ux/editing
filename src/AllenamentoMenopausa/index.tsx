import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";
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

// Source time in a clip → seconds on the final timeline.
const at = (clip: keyof typeof data.tl, src: number) => {
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
}> = ({ text, start, now, step, dur, seed = 0 }) => (
  <>
    {[...text].map((ch, i) => {
      const k = interpolate(
        now,
        [start + i * step, start + i * step + dur],
        [0, 1],
        clamp,
      );
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: k,
            filter: `blur(${(1 - k) * 8}px)`,
            transform: `translateY(${(1 - k) * 22 * jitter(seed + i)}px) scale(${0.7 + 0.3 * k})`,
          }}
        >
          {ch}
        </span>
      );
    })}
  </>
);

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

const PIP_SCALE = 0.42;
const FADE = 5;

// 0 = full screen, 1 = in the corner.
// Back-to-back cues count as one span, so she stays in the corner between them.
const PIP_SPANS = TIMED.reduce<{ start: number; end: number }[]>((acc, c) => {
  const last = acc[acc.length - 1];
  if (last && c.start - last.end <= FADE * 2) {
    last.end = Math.max(last.end, c.end);
  } else {
    acc.push({ start: c.start, end: c.end });
  }
  return acc;
}, []);

const pipAmount = (frame: number) => {
  let v = 0;
  for (const { start, end } of PIP_SPANS) {
    v = Math.max(
      v,
      Math.min(
        interpolate(frame, [start, start + FADE], [0, 1], clamp),
        interpolate(frame, [end - FADE, end], [1, 0], clamp),
      ),
    );
  }
  return v;
};

const Speaker: React.FC = () => {
  const frame = useCurrentFrame();
  const k = pipAmount(frame);
  const scale = 1 - (1 - PIP_SCALE) * k;
  // Jump zoom on every other caption phrase while she is full screen.
  const phrase = phraseAt(frame / ALLENAMENTO_FPS);
  const punch = 1 + 0.12 * ((phrase < 0 ? 0 : phrase) % 2) * (1 - k);
  const feather = `rgba(0,0,0,${1 - k})`;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "100% 100%",
        transform: `scale(${scale})`,
        overflow: "hidden",
        WebkitMaskImage: `linear-gradient(to right, ${feather}, #000 22%), linear-gradient(to bottom, ${feather}, #000 18%)`,
        WebkitMaskComposite: "source-in",
      }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${punch})`, transformOrigin: "50% 35%" }}
      >
        {data.segments.map((s) => (
          <Sequence
            key={`${s.clip}-${s.from}`}
            from={f(s.at)}
            durationInFrames={f(s.at + s.to - s.from) - f(s.at)}
          >
            <OffthreadVideo
              src={file(`IMG_${s.clip}.mp4`)}
              trimBefore={f(s.from)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

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

// Phrases of up to two lines (about 3 words each), broken at sentence ends.
const PHRASES = (() => {
  const out: Word[][][] = [];
  let lines: Word[][] = [];
  let line: Word[] = [];
  const flush = () => {
    if (line.length) lines.push(line);
    line = [];
  };
  for (const w of data.words) {
    line.push(w);
    const len = line.map((x) => x.w).join(" ").length;
    const end = /[.?!]$/.test(w.w);
    if (end || len >= 15 || (/,$/.test(w.w) && len >= 8)) {
      flush();
      if (end || lines.length === 2) {
        out.push(lines);
        lines = [];
      }
    }
  }
  flush();
  if (lines.length) out.push(lines);
  return out;
})();

const phraseAt = (t: number) => {
  for (let i = PHRASES.length - 1; i >= 0; i--) {
    if (t >= PHRASES[i][0][0].t - 0.05) return i;
  }
  return -1;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / ALLENAMENTO_FPS;
  const cue = TIMED.find(({ start, end }) => frame >= start && frame < end);
  if (cue && cue.o.kind !== "media") return null; // light backgrounds
  const i = phraseAt(t);
  if (i < 0) return null;
  const phrase = PHRASES[i];
  const last = phrase[phrase.length - 1];
  const end = PHRASES[i + 1]?.[0][0].t ?? last[last.length - 1].e + 0.6;
  const out = interpolate(t, [end - 0.18, end - 0.02], [0, 1], clamp);
  const side = cue !== undefined;
  return (
    <div
      style={{
        position: "absolute",
        top: side ? 1020 : 1000,
        left: 80,
        right: side ? 380 : 80,
        textAlign: side ? "left" : "center",
        fontFamily: inter,
        fontSize: 66,
        lineHeight: 1.12,
        letterSpacing: -1,
        color: "#fff",
        textShadow: "0 2px 14px rgba(0,0,0,0.35)",
        opacity: 1 - out,
        filter: `blur(${out * 8}px)`,
      }}
    >
      {phrase.map((ln, li) => (
        <div key={li} style={{ fontWeight: li % 2 ? 700 : 300 }}>
          {ln.map((w, wi) => (
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
      ))}
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // Gone before the first b-roll, so it always sits on the light wall.
  const end = f(at("8122", 3.4)) + FADE;
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 200,
        left: 70,
        right: 70,
        opacity: o,
        filter: `blur(${(1 - o) * 8}px)`,
        textAlign: "center",
        fontFamily: inter,
        lineHeight: 1.02,
        letterSpacing: -3,
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 300, color: colors.plum }}>
        <Reveal
          text="Menopausa:"
          start={3}
          now={frame}
          step={1}
          dur={8}
          seed={7}
        />
      </div>
      <div style={{ fontSize: 104, fontWeight: 700, color: colors.rose }}>
        <Reveal
          text="perché la pancia"
          start={12}
          now={frame}
          step={1}
          dur={8}
          seed={19}
        />
        <br />
        <Reveal
          text="cresce?"
          start={28}
          now={frame}
          step={1}
          dur={8}
          seed={43}
        />
      </div>
    </div>
  );
};

// Plum on the light grid backgrounds, white over video; moved left of the
// picture-in-picture so it never runs over her.
const Sign: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = TIMED.find(({ start, end }) => frame >= start && frame < end);
  const light = cue !== undefined && cue.o.kind !== "media";
  return (
    <AbsoluteFill style={{ right: 560 * pipAmount(frame) }}>
      {light ? (
        <Signature color={colors.plum} fontFamily={inter} bottom={70} />
      ) : (
        <Signature
          color="#fff"
          shadow="0 2px 10px rgba(0,0,0,0.5)"
          fontFamily={inter}
          bottom={70}
        />
      )}
    </AbsoluteFill>
  );
};

export const AllenamentoMenopausa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.pink, fontFamily: inter }}>
    {TIMED.map(({ start, end, o }) => (
      <Sequence key={start} from={start} durationInFrames={end - start}>
        <OverlayView o={o} len={end - start} />
      </Sequence>
    ))}
    <Speaker />
    <Flash />
    <Hook />
    <Captions />
    <Sign />
  </AbsoluteFill>
);
