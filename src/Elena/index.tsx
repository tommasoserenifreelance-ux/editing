import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { sans, serif } from "../PilatesReformer/theme";

// "Elena's story" slide-crossing carousel (4:5), one Santa Longevity pastel
// per slide, black text. Rendered as ONE panorama (all slides side by side)
// in which Elena walks continuously from the first slide to the last;
// scripts/split-elena.py then cuts each slide out of it, so she visibly
// passes from one slide into the next.
// Cutout made with scripts/elena-matte.py + scripts/elena-compose.py.

export const ELENA_FPS = 24;

export const ELENA_SLIDES: {
  kicker?: string;
  title: string;
  body?: string;
  color: string;
}[] = [
  {
    kicker: "Mi sono sempre definita",
    title: "una pizza 4 stagioni",
    color: "#F3ECE2",
  },
  {
    kicker: "Sono",
    title: "Elena",
    body: "e da maggio ho deciso di dedicarmi alla mia passione per lo sport, lo stile di vita sano, il beauty e la longevità",
    color: "#EEF7A3",
  },
  {
    title: "Perché sono qui",
    body: "Queste passioni le ho sempre avute, ma la richiesta di tante donne e amiche mi ha spinta ad aprire questo canale diretto",
    color: "#D9C4F1",
  },
  {
    title: "Santa Longevity",
    body: "è uno spazio per far capire che piccoli cambiamenti nelle nostre abitudini possono fare la differenza nella qualità della vita",
    color: "#DCE5DA",
  },
  {
    title: "Fun fact",
    body: "Ogni mattina bevo una tisana tiepida e mi ripeto: «Oggi sarà una grande giornata!»… anche quando non lo sarà 😂",
    color: "#F6DCC8",
  },
  {
    kicker: "Grazie per",
    title: "la vostra fiducia",
    body: "Mi riempie il cuore di gioia leggere i vostri messaggi",
    color: "#EEF7A3",
  },
];

const SLIDE_W = 1080;
export const PANORAMA_W = SLIDE_W * ELENA_SLIDES.length;

// Walk: the original, uninterrupted green screen walk (frames 21-78,
// public/elena/walk_full.webm) — no repeated stride, so nothing jumps.
// In every slide she enters at the left edge and leaves at the right edge;
// slide k's walk starts when slide k-1's ends, so in the panorama she passes
// straight from one slide into the next.
export const WALK = 58; // frames
const ENTER_END = 10; // last frame cut by the cutout's left edge
const EXIT_START = 43; // first frame cut by its right edge
// Clip is 1080×1400 (source rows 150–1550) with a baked contact shadow.
const CUT_W = 1080;
const CUT_H = 1400;
const CUT_SCALE = 0.7;
const FLOOR_Y = 1300;
const W = CUT_W * CUT_SCALE;
export const ELENA_PANORAMA_DURATION = WALK * ELENA_SLIDES.length;

const Walk: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  // The cutout's own edges cut her while she enters (walk frames 0-10) and
  // leaves (43-57). The clip slides at constant speed so those edges stay
  // outside the slide: she walks straight in from the left edge of the slide
  // and straight out of its right edge, and reappears on the next slide.
  const drift = interpolate(frame, [ENTER_END, EXIT_START], [0, SLIDE_W - W], {
    extrapolateLeft: "extend",
    extrapolateRight: "extend",
  });
  const h = CUT_H * CUT_SCALE;
  return (
    <OffthreadVideo
      src={staticFile("elena/walk_full.webm")}
      transparent
      muted
      style={{
        position: "absolute",
        width: W,
        height: h,
        left: index * SLIDE_W + drift,
        top: FLOOR_Y - h + 60,
      }}
    />
  );
};

const SlidePage: React.FC<{ index: number }> = ({ index }) => {
  const slide = ELENA_SLIDES[index];
  return (
    <div
      style={{
        position: "absolute",
        left: index * SLIDE_W,
        top: 0,
        width: SLIDE_W,
        height: 1350,
        backgroundColor: slide.color,
      }}
    >
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
        <Img
          src={staticFile("logo.png")}
          style={{ width: 92, filter: "invert(1)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 150,
          textAlign: "center",
          color: "#1F1F1F",
        }}
      >
        {slide.kicker ? (
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 46 }}>
            {slide.kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1.05,
            padding: "0 60px",
          }}
        >
          {slide.title}
        </div>
        {slide.body ? (
          <div
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 38,
              lineHeight: 1.35,
              marginTop: 22,
              padding: "0 90px",
            }}
          >
            {slide.body}
          </div>
        ) : null}
      </AbsoluteFill>
    </div>
  );
};

export const ElenaPanorama: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "white", overflow: "hidden" }}>
    {ELENA_SLIDES.map((_, i) => (
      <SlidePage key={`p${i}`} index={i} />
    ))}
    {ELENA_SLIDES.map((_, i) => (
      <Sequence
        key={`w${i}`}
        from={i * WALK}
        durationInFrames={WALK}
        layout="none"
      >
        <Walk index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
