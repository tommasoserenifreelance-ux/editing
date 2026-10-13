import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { Clip, ClipProps } from "./Clip";
import { FilmLook } from "./FilmLook";
import { Title, TitleWord, WORD_DELAY, WORD_STAGGER } from "./Title";

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

// Hook (finished drink + title), then the recipe.
const HOOK: Shot = {
  src: STIR,
  from: 2.6,
  playbackRate: 0.5,
  frames: 72,
  zoomFrom: 1.15,
  zoomTo: 1.25,
  origin: "40% 58%",
};

// Each action is kept whole: no cutting before a pour or the beans are done.
const SHOTS: Shot[] = [
  // Ice into the glass
  { src: MAIN, from: 1.4, playbackRate: 1.5, frames: 44, origin: "42% 62%" },
  // Syrup drizzle
  { src: MAIN, from: 8.9, playbackRate: 1.5, frames: 80, origin: "47% 62%" },
  // Milk pour
  { src: MAIN, from: 18.3, playbackRate: 1.5, frames: 90, origin: "45% 64%" },
  // Espresso over the top, the whole pour
  { src: COFFEE, from: 1.9, playbackRate: 1.3, frames: 141, origin: "45% 55%" },
  // Coffee beans on top, then the finished glass with a slow push-in
  {
    src: STIR,
    from: 0.3,
    playbackRate: 1,
    frames: 117,
    origin: "40% 58%",
    zoomFrom: 1.12,
    zoomTo: 1.22,
  },
];

export const ICED_LATTE_DURATION = [HOOK, ...SHOTS].reduce(
  (sum, s) => sum + s.frames,
  0,
);

const TitleSfx: React.FC = () => {
  const lastWordAt = WORD_DELAY + (TITLE_WORDS.length - 1) * WORD_STAGGER;
  return (
    <>
      <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      {TITLE_WORDS.map((_, i) => (
        <Sequence key={i} from={WORD_DELAY + i * WORD_STAGGER}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={lastWordAt + 6}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={HOOK.frames - 12}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
      </Sequence>
    </>
  );
};

export const IcedLatte: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c130d" }}>
      <Series>
        <Series.Sequence durationInFrames={HOOK.frames} name="Hook + titolo">
          <Clip {...HOOK} />
          {/* Darken behind the title so it reads like the reference. */}
          <AbsoluteFill style={{ backgroundColor: "rgba(30, 15, 6, 0.38)" }} />
          <Title words={TITLE_WORDS} />
          <TitleSfx />
        </Series.Sequence>
        {SHOTS.map(({ frames, ...shot }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Clip {...shot} />
          </Series.Sequence>
        ))}
      </Series>
      <FilmLook />
    </AbsoluteFill>
  );
};
