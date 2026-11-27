import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Line } from "./Caption";
import { Snow } from "./Snow";
import { Sparkles } from "./Sparkles";
import { cream, gold, red, sans, serif } from "./theme";

export const XMAS_FPS = 30;
const sec = (s: number) => Math.round(s * XMAS_FPS);

const TREE_END = sec(15.9);
const CAL_END = sec(31.9);
export const XMAS_DURATION = sec(34.5);
const XFADE = 12;

// Synced to the voice-over (public/xmas/voce.wav, see scripts/make_xmas_audio.py).
const CAPTIONS: { from: number; to: number; lines: Line[] }[] = [
  {
    from: 0.7,
    to: 3.95,
    lines: [
      { text: "Dal 1 al 23", kind: "small" },
      { text: "dicembre", kind: "big" },
    ],
  },
  {
    from: 4.0,
    to: 7.6,
    lines: [
      { text: "Festeggia il Natale", kind: "small" },
      { text: "in Mythos", kind: "big" },
    ],
  },
  {
    from: 7.8,
    to: 12.0,
    lines: [
      { text: "Scegli il", kind: "small" },
      { text: "tuo giorno", kind: "big" },
    ],
  },
  {
    from: 12.0,
    to: 15.9,
    lines: [
      { text: "Allenamento", kind: "big" },
      { text: "GRATUITO", kind: "badge" },
    ],
  },
  {
    from: 16.4,
    to: 21.2,
    lines: [
      { text: "Apri con noi il", kind: "small" },
      { text: "Calendario", kind: "big" },
      { text: "dell'Avvento", kind: "big" },
    ],
  },
  {
    from: 21.3,
    to: 24.9,
    lines: [
      { text: "Tanti regali", kind: "big" },
      { text: "ti aspettano", kind: "small" },
    ],
  },
  {
    from: 24.9,
    to: 29.8,
    lines: [
      { text: "nel giorno del tuo", kind: "small" },
      { text: "allenamento", kind: "big" },
      { text: "GRATUITO", kind: "badge" },
    ],
  },
  {
    from: 29.9,
    to: 31.9,
    lines: [
      { text: "Quindi...", kind: "small" },
      { text: "cosa aspetti?", kind: "big" },
    ],
  },
];

const Photo: React.FC<{
  src: string;
  duration: number;
  from: [number, number, number];
  to: [number, number, number];
  fadeIn?: boolean;
}> = ({ src, duration, from, to, fadeIn }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ease = p * p * (3 - 2 * p);
  const [s, x, y] = from.map((v, i) => v + (to[i] - v) * ease);
  const opacity = fadeIn
    ? interpolate(frame, [0, XFADE], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s}) translate(${x}px, ${y}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(40,0,8,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(40,0,8,0.78) 100%)",
      boxShadow: "inset 0 0 220px rgba(0,0,0,0.55)",
    }}
  />
);

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 200 } });
  const b = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const c = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - 25) / 5) * 0.025;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: a }}>
        <Img
          src={staticFile("xmas/albero.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(14px) brightness(0.45)",
            transform: "scale(1.1)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            opacity: a,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 52,
            letterSpacing: 10,
            color: cream,
          }}
        >
          1 – 23 DICEMBRE
        </div>
        <div
          style={{
            opacity: a,
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 150,
            lineHeight: 1.05,
            color: gold,
            marginTop: 30,
            textShadow: "0 0 30px rgba(242,198,109,0.6)",
          }}
        >
          Allenamento
        </div>
        <div
          style={{
            marginTop: 30,
            transform: `scale(${b * pulse})`,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 110,
            letterSpacing: 6,
            color: "#fff",
            background: red,
            padding: "8px 44px",
            borderRadius: 22,
            border: `5px solid ${gold}`,
          }}
        >
          GRATUITO
        </div>
        <div
          style={{
            opacity: c,
            transform: `translateY(${interpolate(c, [0, 1], [30, 0])}px)`,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 50,
            color: cream,
            marginTop: 70,
          }}
        >
          + un regalo dal nostro
          <br />
          Calendario dell'Avvento
        </div>
        <div
          style={{
            opacity: c,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: 12,
            color: cream,
            marginTop: 90,
          }}
        >
          MYTHOS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const XmasSponsor: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a0008" }}>
      <Audio src={staticFile("xmas/voce.wav")} />
      <Audio src={staticFile("xmas/musica.wav")} volume={0.22} />

      <Sequence durationInFrames={TREE_END + XFADE}>
        <Photo
          src="xmas/albero.jpg"
          duration={TREE_END}
          from={[1.0, 0, 0]}
          to={[1.18, 0, 60]}
        />
      </Sequence>
      <Sequence from={TREE_END} durationInFrames={CAL_END - TREE_END + XFADE}>
        <Photo
          src="xmas/calendario.jpg"
          duration={CAL_END - TREE_END}
          from={[1.3, 0, 180]}
          to={[1.3, 0, -200]}
          fadeIn
        />
      </Sequence>
      <Shade />
      <Sparkles />

      {CAPTIONS.map(({ from, to, lines }) => (
        <Sequence
          key={from}
          from={sec(from)}
          durationInFrames={sec(to) - sec(from)}
        >
          <Caption lines={lines} duration={sec(to) - sec(from)} />
        </Sequence>
      ))}

      <Sequence from={CAL_END}>
        <EndCard />
      </Sequence>
      <Snow />
    </AbsoluteFill>
  );
};
