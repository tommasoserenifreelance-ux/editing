import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill } from "remotion";
import { Background } from "./Background";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { Reason } from "./Reason";

const REASONS: string[][] = [
  ["Rinforzi il core", "senza stressare", "le articolazioni"],
  ["Migliori", "la postura"],
  ["È adatto", "a tutti i livelli"],
  ["Tonifichi in modo", "lungo ed elastico"],
  ["Allena la mente,", "non solo il corpo"],
];

const INTRO = 105;
const REASON = 105;
const OUTRO = 120;
const TRANSITION = 15;

export const PILATES_DURATION =
  INTRO + REASONS.length * REASON + OUTRO - (REASONS.length + 1) * TRANSITION;

const timing = linearTiming({ durationInFrames: TRANSITION });

export const PilatesReformer: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        {REASONS.map((lines, i) => [
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={i === 0 ? fade() : slide({ direction: "from-right" })}
            timing={timing}
          />,
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={REASON}>
            <Reason index={i + 1} total={REASONS.length} lines={lines} />
          </TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
