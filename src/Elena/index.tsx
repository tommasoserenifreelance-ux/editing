import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { sans, serif } from "../PilatesReformer/theme";

// "Elena's story" slide-crossing carousel (4:5), one Santa Longevity pastel
// per slide, black text. Rendered as ONE panorama (all slides side by side)
// in which Elena walks continuously from the first slide to the last;
// scripts/split-elena.py then cuts each slide out of it, so she visibly
// passes from one slide into the next.
// Walk: public/elena/walk_loop.webm (VP9 with alpha) = one stride, green
// screen frames 42-60, cut out with scripts/elena-matte.py + elena-compose.py
// and normalised with scripts/elena-loop.py.

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

// One stride whose last pose matches the first: replaying it shifted by one
// stride gives a natural, endless walk with no sliding feet.
export const LOOP = 19;
// Clip is 1080×1400 (source rows 150–1550) with a baked contact shadow.
const CUT_W = 1080;
const CUT_H = 1400;
const CUT_SCALE = 0.7;
const FLOOR_Y = 1300;
// Frames are normalised by scripts/elena-loop.py (same size, same floor line,
// torso at constant speed), so the loop restarts without any jolt.
export const STRIDE = 347 * CUT_SCALE; // torso travel per loop, px
// Body sits ~202–437 px from the clip's left edge at the start of a loop.
export const BODY_LEFT = 202;
export const BODY_W = 235;
export const START_X = -BODY_LEFT - BODY_W - 20; // fully off the first slide
export const LOOPS = Math.ceil(
  (PANORAMA_W + 20 - START_X - BODY_LEFT) / STRIDE,
);
export const ELENA_PANORAMA_DURATION = LOOPS * LOOP;

const Stride: React.FC<{ index: number }> = ({ index }) => {
  const w = CUT_W * CUT_SCALE;
  const h = CUT_H * CUT_SCALE;
  return (
    <OffthreadVideo
      src={staticFile("elena/walk_loop.webm")}
      transparent
      muted
      style={{
        position: "absolute",
        width: w,
        height: h,
        left: START_X + index * STRIDE,
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
    {Array.from({ length: LOOPS }, (_, i) => (
      <Sequence
        key={`s${i}`}
        from={i * LOOP}
        durationInFrames={LOOP}
        layout="none"
      >
        <Stride index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
