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
  | { kind: "media"; src: string; label?: string }
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
    o: { kind: "media", src: "addome.mp4", label: "Il metabolismo rallenta" },
  },
  {
    clip: "8122",
    from: 10.6,
    to: 14.4,
    o: { kind: "media", src: "muscoli.mp4", label: "Meno massa muscolare" },
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
    o: { kind: "media", src: "manubri.mp4", label: "Aumenta il carico" },
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
    o: { kind: "media", src: "cuore.mp4", label: "Cuore e vasi elastici" },
  },
  {
    clip: "8125",
    from: 11.4,
    to: 15.1,
    o: { kind: "media", src: "corsa.mp4", label: "Ogni settimana" },
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
      label: "La cartilagine invecchia",
    },
  },
  {
    clip: "8128",
    from: 9.3,
    to: 13.3,
    o: {
      kind: "media",
      src: "nuoto.mp4",
      label: "Pedalare, nuotare, camminare",
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
    o: { kind: "media", src: "sonno.mp4", label: "Dormi meglio" },
  },
  {
    clip: "8130",
    from: 6.5,
    to: 8.3,
    o: { kind: "media", src: "sorriso.mp4", label: "Umore migliore" },
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

const Label: React.FC<{ children: React.ReactNode; light?: boolean }> = ({
  children,
  light,
}) => (
  <div
    style={{
      position: "absolute",
      top: 230,
      left: 70,
      right: 70,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: light ? "transparent" : colors.plum,
        color: light ? colors.plum : "#fff",
        fontSize: light ? 84 : 52,
        fontWeight: 700,
        letterSpacing: light ? -2 : 0,
        padding: light ? 0 : "18px 34px",
        borderRadius: 20,
        textAlign: "center",
        lineHeight: 1.1,
      }}
    >
      {children}
    </div>
  </div>
);

const zoom = (t: number, len: number) =>
  `scale(${interpolate(t, [0, len], [1, 1.08], clamp)})`;

const Media: React.FC<{ src: string; label?: string; len: number }> = ({
  src,
  label,
  len,
}) => {
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
      {label ? <Label>{label}</Label> : null}
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
      <Label light>{label}</Label>
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
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: i === accent ? colors.rose : colors.plum,
            }}
          >
            {line}
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
      return <Media src={o.src} label={o.label} len={len} />;
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

const PIP_SCALE = 0.3;
const FADE = 6;

// 0 = full screen, 1 = in the corner.
const pipAmount = (frame: number) => {
  let v = 0;
  for (const { start, end } of TIMED) {
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
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "100% 100%",
        transform: `translate(${-50 * k}px, ${-200 * k}px) scale(${scale})`,
        borderRadius: 80 * k,
        overflow: "hidden",
        boxShadow:
          k > 0
            ? `0 0 0 ${18 * k}px #fff, 0 20px 60px rgba(0,0,0,${0.35 * k})`
            : undefined,
      }}
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
  );
};

// ---------- Captions ----------

// Groups of up to 3 words, broken after punctuation.
const CHUNKS = (() => {
  const out: (typeof data.words)[] = [];
  let cur: typeof data.words = [];
  for (const w of data.words) {
    cur.push(w);
    if (cur.length === 3 || /[.,?!]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
})();

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / ALLENAMENTO_FPS;
  const chunk = CHUNKS.find(
    (c, i) =>
      t >= c[0].t && t < (CHUNKS[i + 1]?.[0].t ?? c[c.length - 1].e + 0.4),
  );
  if (!chunk) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 1030,
        left: 60,
        right: 60,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(110,63,99,0.92)",
          borderRadius: 18,
          padding: "14px 28px",
          fontFamily: inter,
          fontSize: 58,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        {chunk.map((w, i) => (
          <span
            key={i}
            style={{ color: t >= w.t ? "#fff" : "rgba(255,255,255,0.45)" }}
          >
            {i ? " " : ""}
            {w.w.replace(/[.,]$/, "")}
          </span>
        ))}
      </div>
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const end = f(at("8122", 5.9));
  const o = Math.min(
    interpolate(frame, [0, 8], [0, 1], clamp),
    interpolate(frame, [end - 8, end], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 70,
        right: 70,
        opacity: o,
        textAlign: "center",
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 1.05,
        letterSpacing: -2,
        color: "#fff",
        textShadow: "0 4px 28px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.5)",
      }}
    >
      Menopausa:
      <br />
      <span style={{ color: "#F6C1CC" }}>perché la pancia cresce?</span>
    </div>
  );
};

// Plum on the light grid backgrounds, white over video.
const Sign: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = TIMED.find(({ start, end }) => frame >= start && frame < end);
  const light = cue !== undefined && cue.o.kind !== "media";
  return light ? (
    <Signature color={colors.plum} fontFamily={inter} bottom={70} />
  ) : (
    <Signature
      color="#fff"
      shadow="0 2px 10px rgba(0,0,0,0.5)"
      fontFamily={inter}
      bottom={70}
    />
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
    <Hook />
    <Captions />
    <Sign />
  </AbsoluteFill>
);
