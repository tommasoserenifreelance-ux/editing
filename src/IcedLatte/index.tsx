import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { Clip, ClipProps } from "./Clip";
import { Title, TitleWord } from "./Title";

const MAIN = "clip-ghiaccio-latte.mp4";
const COFFEE = "clip-caffe.mov";
const STIR = "clip-mescola.mov";

export const TITLE_WORDS: TitleWord[] = [
  { text: "the", size: 220 },
  { text: "iced", size: 400 },
  { text: "latte", size: 400 },
  { text: "you", size: 220 },
  { text: "deserve", size: 300 },
];

type Shot = ClipProps & { frames: number };

// Hook (finished drink + title), then the recipe in quick cuts.
const HOOK: Shot = {
  src: STIR,
  from: 2.95,
  playbackRate: 0.5,
  frames: 72,
  zoomFrom: 1.25,
  zoomTo: 1.4,
  origin: "40% 58%",
};

const SHOTS: Shot[] = [
  // Ice into the glass
  {
    src: MAIN,
    from: 1.6,
    playbackRate: 1.5,
    frames: 38,
    origin: "42% 62%",
    zoomFrom: 1.3,
    zoomTo: 1.4,
    flash: true,
  },
  // Syrup drizzle
  {
    src: MAIN,
    from: 8.9,
    playbackRate: 1.3,
    frames: 42,
    origin: "47% 60%",
    zoomFrom: 1.25,
    zoomTo: 1.35,
    punch: true,
  },
  {
    src: MAIN,
    from: 10.8,
    playbackRate: 1.3,
    frames: 44,
    origin: "47% 64%",
    zoomFrom: 1.55,
    zoomTo: 1.65,
    punch: true,
  },
  // Milk pour
  {
    src: MAIN,
    from: 18.3,
    playbackRate: 1.4,
    frames: 46,
    origin: "45% 64%",
    zoomFrom: 1.3,
    zoomTo: 1.4,
    punch: true,
  },
  {
    src: MAIN,
    from: 20.6,
    playbackRate: 1.4,
    frames: 48,
    origin: "45% 66%",
    zoomFrom: 1.6,
    zoomTo: 1.72,
    punch: true,
  },
  // Espresso over the top
  {
    src: COFFEE,
    from: 2.2,
    playbackRate: 1.6,
    frames: 58,
    origin: "45% 55%",
    zoomFrom: 1.25,
    zoomTo: 1.35,
    flash: true,
  },
  {
    src: COFFEE,
    from: 5.8,
    playbackRate: 1.6,
    frames: 66,
    origin: "42% 56%",
    zoomFrom: 1.55,
    zoomTo: 1.65,
    punch: true,
  },
  // Stir
  {
    src: STIR,
    from: 0.3,
    playbackRate: 1.3,
    frames: 64,
    origin: "42% 55%",
    zoomFrom: 1.3,
    zoomTo: 1.4,
    punch: true,
  },
  // Final glass, slow push-in
  {
    src: STIR,
    from: 2.95,
    playbackRate: 0.6,
    frames: 60,
    origin: "40% 58%",
    zoomFrom: 1.35,
    zoomTo: 1.6,
    punch: true,
  },
];

export const ICED_LATTE_DURATION = [HOOK, ...SHOTS].reduce(
  (sum, s) => sum + s.frames,
  0,
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(15,8,3,0.55) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const IcedLatte: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#140c08" }}>
      <Series>
        <Series.Sequence durationInFrames={HOOK.frames} name="Hook + titolo">
          <Clip {...HOOK} />
          {/* Darken behind the title so it reads like the reference. */}
          <AbsoluteFill style={{ backgroundColor: "rgba(30, 15, 6, 0.38)" }} />
          <Title words={TITLE_WORDS} />
        </Series.Sequence>
        {SHOTS.map(({ frames, ...shot }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Clip {...shot} />
          </Series.Sequence>
        ))}
      </Series>
      <Vignette />
    </AbsoluteFill>
  );
};
