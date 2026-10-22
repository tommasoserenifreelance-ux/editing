import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Captions, groupWords, isEmphasis, Word } from "./Captions";
import { EndCard, Sfx, Watermark } from "./graphics";
import { END_CARD, FPS } from "./theme";
import { buildTimeline, Keep, TimeContext } from "./timeline";
import { Zoom, ZoomVideo } from "./ZoomVideo";

// All times are in source seconds; silences listed outside `keep` are cut.
export type VideoSpec = {
  src: string;
  keep: Keep;
  words: Word[];
  captionY: number;
  hideCaptions?: [number, number][];
  bleep?: [number, number][];
  zooms: Zoom[];
  overlays: React.ReactNode;
};

export const durationOf = (spec: VideoSpec) =>
  buildTimeline(spec.keep, FPS).frames + END_CARD;

export const ElettromecVideo: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const { fps } = useVideoConfig();
  const { segments, toFrame, frames } = React.useMemo(
    () => buildTimeline(spec.keep, fps),
    [spec.keep, fps],
  );
  const toSec = (t: number) => toFrame(t) / fps;
  const span = ([a, b]: [number, number]): [number, number] => [toSec(a), toSec(b)];

  const words = spec.words.map((w) => ({ ...w, s: toSec(w.s), e: toSec(w.e) }));
  const hidden = (spec.hideCaptions ?? []).map(span);
  const bleep = spec.bleep ?? [];
  const zooms = spec.zooms.map((z) => {
    const [t, end] = span([z.t, z.t + z.d]);
    return { ...z, t, d: end - t };
  });

  // A swish on every highlighted word, plus a pop when it's a yellow one.
  const captionSfx = groupWords(words)
    .filter((g) => !hidden.some(([a, b]) => g.start < b && g.end > a))
    .map((g) => g.words[g.key]);

  return (
    <TimeContext.Provider value={toFrame}>
      <AbsoluteFill style={{ backgroundColor: "black" }}>
        <Sequence durationInFrames={frames}>
          <ZoomVideo
            src={spec.src}
            zooms={zooms}
            segments={segments}
            mute={bleep.map(([a, b]) => [toFrame(a), toFrame(b)])}
          />
          <Watermark />
          {spec.overlays}
          <Captions words={words} y={spec.captionY} hide={hidden} />
          {captionSfx.map((w) => (
            <React.Fragment key={w.s}>
              <Sfx t={w.s - 0.03} raw name="swish" volume={0.35} />
              {isEmphasis(w.w) && <Sfx t={w.s} raw name="pop" volume={0.45} />}
            </React.Fragment>
          ))}
          {zooms
            .filter((z) => z.type === "push")
            .map((z) => (
              <Sfx key={z.t} t={z.t} raw name="whoosh" volume={0.4} />
            ))}
          {bleep.map(([a, b]) => (
            <Sfx key={a} t={a} name="beep" volume={0.5} dur={b - a} />
          ))}
          <Sfx t={frames / fps - 0.75} raw name="rise" volume={0.35} />
        </Sequence>
        <Sequence from={frames}>
          <EndCard />
          <Sfx t={0} raw name="hit" volume={0.7} />
          <Sfx t={0} raw name="zap" volume={0.4} />
        </Sequence>
      </AbsoluteFill>
    </TimeContext.Provider>
  );
};
