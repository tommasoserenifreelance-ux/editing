import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

// "Quanta acqua devi bere al giorno?" — trend format (reference reel: a
// 2 s clip of a girl drinking with the question, then a weight → water
// table to screenshot and share), redone in the Santa Longevity yellow &
// lilac. No music: the client adds her own track.
// Water = 30–35 ml per kg of body weight, shown as a range: the usual
// practical rule, consistent with EFSA's adequate intake (2.0 L/day for
// women, 2.5 L for men, water from food included). The reference reel's
// table (~43 ml/kg) overstates it.

export const ACQUA_FPS = 30;
const s = (sec: number) => Math.round(sec * ACQUA_FPS);

const HOOK_LEN = 2.3;
const WIPE = 10; // frames, lilac wave covering the clip
const TABLE_LEN = 6.2;
export const ACQUA_DURATION = s(HOOK_LEN + TABLE_LEN);

// Hook clip: water poured into a glass (client's clip, 720x1280).
const HOOK_SRC = "acqua/hook.mp4";
const HOOK_FROM = 0.9; // seconds into the clip: the pour is already flowing

const YELLOW = "#EEF7A3";
const LILAC = "#D9C4F1";
const LILAC_DEEP = "#B89AE6";
const INK = "#1F1F1F";
const CREAM = "#FAF6EE";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const fmt = (l: number) => l.toFixed(1).replace(".", ",");
const ROWS = Array.from({ length: 12 }, (_, i) => {
  const kg = 45 + i * 5;
  // litres rounded half-up to 0.1 in integer maths (1.65 → 1.7, not 1.6)
  return {
    kg,
    lo: Math.round((kg * 30) / 100) / 10,
    hi: Math.round((kg * 35) / 100) / 10,
  };
});
const MAX_L = ROWS[ROWS.length - 1].hi;

const pill: React.CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  color: INK,
  fontFamily: sans,
  fontWeight: 700,
  whiteSpace: "nowrap",
  boxShadow: "0 8px 24px rgba(60,40,90,0.16)",
};

const Drop: React.FC<{ size: number; color?: string }> = ({
  size,
  color = LILAC_DEEP,
}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 20 26">
    <path
      d="M10 1 C10 1 2 11 2 17 a8 8 0 0 0 16 0 C18 11 10 1 10 1 Z"
      fill={color}
    />
    <ellipse cx="7" cy="17" rx="2" ry="3.2" fill="white" opacity="0.55" />
  </svg>
);

// ---------- Hook: clip + question ----------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: frame - 3, fps, config: { damping: 12, mass: 0.6 } });
  const b = spring({ frame: frame - 9, fps, config: { damping: 12, mass: 0.6 } });
  const bob = Math.sin(frame / 6) * 6;
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(HOOK_SRC)}
        trimBefore={s(HOOK_FROM)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: "rotate(-3deg)",
          }}
        >
          <div
            style={{
              ...pill,
              background: YELLOW,
              fontSize: 76,
              padding: "12px 50px",
              opacity: Math.min(1, a * 2),
              transform: `scale(${a})`,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            Quanta acqua
            <span style={{ transform: `translateY(${bob}px)` }}>
              <Drop size={46} />
            </span>
          </div>
          <div
            style={{
              ...pill,
              background: LILAC,
              fontSize: 66,
              padding: "12px 46px",
              marginTop: -6,
              marginLeft: 60,
              opacity: Math.min(1, b * 2),
              transform: `scale(${b})`,
            }}
          >
            devi bere al giorno?
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Lilac wave rising over the clip into the table.
const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, WIPE], [0, 1], clamp);
  const top = interpolate(p, [0, 1], [1920, -200]);
  const out = interpolate(frame, [WIPE, WIPE + 8], [1, 0], clamp);
  const wave = (ph: number) =>
    Array.from({ length: 21 }, (_, i) => {
      const x = (i / 20) * 1080;
      const y = Math.sin(i / 3 + frame / 2 + ph) * 40;
      return `${x},${y + 60}`;
    }).join(" ");
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg
        width={1080}
        height={2400}
        style={{ position: "absolute", top: top - 60, left: 0 }}
      >
        <polygon points={`0,2400 ${wave(0)} 1080,2400`} fill={LILAC} />
        <polygon
          points={`0,2400 ${wave(2)
            .split(" ")
            .map((pt) => {
              const [x, y] = pt.split(",").map(Number);
              return `${x},${y + 70}`;
            })
            .join(" ")} 1080,2400`}
          fill={YELLOW}
        />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Table ----------
const ROW_H = 62;
const COL_KG = 250;
const BAR_W = 300;

const Row: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = ROWS[i];
  const p = spring({
    frame: frame - 12 - i * 2,
    fps,
    config: { damping: 14, mass: 0.5 },
  });
  const fill = spring({
    frame: frame - 18 - i * 2,
    fps,
    config: { damping: 20, mass: 0.8 },
  });
  return (
    <div
      style={{
        height: ROW_H,
        display: "flex",
        alignItems: "center",
        background: i % 2 ? "rgba(217,196,241,0.18)" : "transparent",
        borderRadius: 22,
        padding: "0 26px",
        opacity: Math.min(1, p * 1.6),
        transform: `translateX(${interpolate(p, [0, 1], [120, 0])}px)`,
        fontFamily: sans,
        color: INK,
      }}
    >
      <div style={{ width: COL_KG, fontSize: 44, fontWeight: 500 }}>
        {r.kg} kg
      </div>
      <div
        style={{
          width: BAR_W,
          height: 22,
          borderRadius: 999,
          background: "rgba(184,154,230,0.18)",
          overflow: "hidden",
          marginRight: 28,
        }}
      >
        <div
          style={{
            width: `${(r.hi / MAX_L) * 100 * fill}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${LILAC} 0%, ${LILAC_DEEP} 100%)`,
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 44,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {fmt(r.lo)}–{fmt(r.hi)} L
      </div>
    </div>
  );
};

const Table: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const head = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const share = spring({
    frame: frame - s(TABLE_LEN - 2.2),
    fps,
    config: { damping: 9, mass: 0.6 },
  });
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      {/* soft brand blobs */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: YELLOW,
          filter: "blur(120px)",
          opacity: 0.75,
          left: -260,
          top: 120 + Math.sin(frame / 25) * 30,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: LILAC,
          filter: "blur(130px)",
          opacity: 0.8,
          right: -300,
          bottom: 80 + Math.cos(frame / 25) * 30,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 270 }}>
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 62,
            filter: "invert(1)",
            opacity: 0.85 * head,
          }}
        />
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `rotate(-2deg) scale(${head})`,
          }}
        >
          <div
            style={{
              ...pill,
              background: YELLOW,
              fontSize: 54,
              padding: "10px 40px",
            }}
          >
            Quanta acqua
          </div>
          <div
            style={{
              ...pill,
              background: LILAC,
              fontSize: 48,
              padding: "10px 38px",
              marginTop: -4,
              marginLeft: 50,
            }}
          >
            devi bere al giorno?
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            width: 940,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 44,
            padding: "26px 22px 22px",
            boxShadow: "0 20px 60px rgba(90,60,130,0.18)",
            opacity: Math.min(1, card * 1.5),
            transform: `translateY(${interpolate(card, [0, 1], [80, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 10px 14px",
            }}
          >
            <div
              style={{ ...pill, background: YELLOW, fontSize: 38, padding: "8px 30px", boxShadow: "none" }}
            >
              Peso
            </div>
            <div
              style={{
                ...pill,
                background: LILAC,
                fontSize: 38,
                padding: "8px 30px",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Drop size={26} />
              Acqua al giorno
            </div>
          </div>
          {ROWS.map((_, i) => (
            <Row key={i} i={i} />
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 27,
            lineHeight: 1.35,
            color: "#6E6478",
            textAlign: "center",
            opacity: head,
          }}
        >
          stima indicativa: 30–35 ml per kg, acqua dei cibi compresa
          <br />
          di più con caldo, sport, gravidanza e allattamento
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 335,
        }}
      >
        <div
          style={{
            ...pill,
            background: YELLOW,
            fontSize: 46,
            padding: "14px 42px",
            opacity: Math.min(1, share * 2),
            transform: `rotate(-3deg) scale(${share})`,
          }}
        >
          Condividilo con un'amica
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Acqua: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CREAM }}>
    <Sequence durationInFrames={s(HOOK_LEN) + WIPE}>
      <Hook />
    </Sequence>
    <Sequence from={s(HOOK_LEN) + WIPE - 2}>
      <Table />
    </Sequence>
    <Sequence from={s(HOOK_LEN)} durationInFrames={WIPE + 10}>
      <Wipe />
    </Sequence>
  </AbsoluteFill>
);
