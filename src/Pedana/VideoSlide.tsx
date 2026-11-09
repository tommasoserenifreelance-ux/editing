import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Slide } from "../Carosello/Slides";
import { sans } from "../PilatesReformer/theme";
import { PEDANA_SLIDES } from "./Slides";

// Video slide of the vibration plate carousel: Elena lying down with her
// calves on the plate (guidelines section 5), with her speech as subtitles.
// Source: GitHub release (IMG_5326.MOV), transcoded to
// public/pedana/video2_h264.mp4. Captions from a Whisper transcript.

export const VIDEO_SLIDE_FPS = 30;
export const VIDEO_SLIDE_DURATION = 995; // 33.17 s, length of the source clip

const s = (seconds: number) => Math.round(seconds * VIDEO_SLIDE_FPS);

const CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: 0.7, to: 2.86, text: "Un altro modo intelligente" },
  { from: 2.86, to: 5.62, text: "di utilizzare la pedana vibrante è questo:" },
  { from: 5.62, to: 6.84, text: "mi sdraio a terra" },
  { from: 6.84, to: 9.88, text: "con i palmi delle mani rivolti verso l'alto" },
  { from: 9.88, to: 12.72, text: "mi lascio proprio andare sulla pedana" },
  {
    from: 12.72,
    to: 16.82,
    text: "con i talloni ovviamente fuori dalla pedana",
  },
  {
    from: 16.82,
    to: 20.22,
    text: "Quando sento le gambe doloranti, un po' gonfie,",
  },
  {
    from: 20.22,
    to: 23.34,
    text: "specialmente dopo una giornata con i tacchi,",
  },
  { from: 23.34, to: 26.8, text: "ecco che entra in gioco la pedana:" },
  { from: 26.8, to: 28.34, text: "smuove la mia circolazione" },
  { from: 28.34, to: 31.0, text: "e le mie gambe sono leggerissime" },
];

const Caption: React.FC<{ text: string; duration: number }> = ({
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 3, duration - 3, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 620,
        textAlign: "center",
        opacity,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 48,
        lineHeight: 1.2,
        color: "white",
        padding: "0 70px",
        WebkitTextStroke: "6px rgba(40,40,40,0.6)",
        paintOrder: "stroke fill",
        textShadow: "0 4px 16px rgba(0,0,0,0.45)",
      }}
    >
      {text}
    </div>
  );
};

const slide = PEDANA_SLIDES.find((d) => d.video)!;

export const PedanaVideoSlide: React.FC = () => (
  <AbsoluteFill>
    <Slide {...slide} />
    {CAPTIONS.map((c) => (
      <Sequence
        key={c.text}
        from={s(c.from)}
        durationInFrames={s(c.to) - s(c.from)}
      >
        <Caption text={c.text} duration={s(c.to) - s(c.from)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
