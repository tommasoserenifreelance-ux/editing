import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions, groupWords, isEmphasis, Word } from "./Captions";
import { EndCard, Sfx, Watermark } from "./graphics";
import { END_CARD, FPS } from "./theme";
import { buildTimeline, Keep, TimeContext } from "./timeline";
import { Shake, Zoom, ZoomVideo } from "./ZoomVideo";

// All times are in source seconds; silences listed outside `keep` are cut.
export type VideoSpec = {
  src: string;
  keep: Keep;
  words: Word[];
  captionY: number;
  heavyCaptions?: boolean; // thicker outline over bright clothes
  shots: number[]; // shot changes in the source

  bleep?: [number, number][];
  grayFrom?: number; // black & white from here to the end of the footage
  // Colour grade over a stretch, e.g. punchier contrast for a hero moment.
  grades?: { t: number; d: number; filter: string }[];
  shakes?: Shake[];
  // Music bed timed to the output timeline, end card included.
  music?: { src: string; volume: number };
  zooms: Zoom[];
  overlays: React.ReactNode;
};

const CAPTION_SFX_GAP = 7; // seconds between caption swishes

// Zooms change together with the picture: one that starts just after or ends
// just short of a shot change moves onto it, one that spans it is cut there.
const SNAP = 0.4;
const snapToShots = ([a, b]: [number, number], shots: number[]): [number, number] => {
  for (const c of shots) {
    if (c <= a && a - c < 0.6) a = c;
    else if (c > a && c < b) {
      if (c - a < SNAP) a = c;
      else b = c;
    } else if (c >= b && c - b < SNAP) b = c;
  }
  return [a, b];
};

export const durationOf = (spec: VideoSpec) =>
  buildTimeline(spec.keep, FPS).frames + END_CARD;

export const ElettromecVideo: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { segments, toFrame, frames } = React.useMemo(
    () => buildTimeline(spec.keep, fps),
    [spec.keep, fps],
  );
  const toSec = (t: number) => toFrame(t) / fps;
  const span = ([a, b]: [number, number]): [number, number] => [toSec(a), toSec(b)];

  // A sentence that starts just before a shot change starts on the new shot
  // (the audio often leads the picture); words closing a sentence stay put.
  const words = spec.words.map((w, i) => {
    const prev = spec.words[i - 1];
    const opens = !prev || /[.?!]$/.test(prev.w) || w.s - prev.e > 0.3;
    const c = spec.shots.find((x) => x > w.s && x - w.s < 0.35);
    const start = opens && c !== undefined ? c : w.s;
    return { ...w, s: toSec(start), e: toSec(Math.max(w.e, start + 0.1)) };
  });
  const cuts = spec.shots.map(toSec);
  const bleep = spec.bleep ?? [];
  const zooms = spec.zooms.map((z) => {
    const [t, end] = span(snapToShots([z.t, z.t + z.d], spec.shots));
    return { ...z, t, d: end - t };
  });

  // A soft swish on a few yellow words only, spaced out so it stays natural.
  const captionSfx: Word[] = [];
  groupWords(words, cuts)
    .map((g) => g.words[g.key])
    .filter((w) => isEmphasis(w.w))
    .forEach((w) => {
      const last = captionSfx[captionSfx.length - 1];
      if (!last || w.s - last.s >= CAPTION_SFX_GAP) captionSfx.push(w);
    });
  const grade = (spec.grades ?? []).find(
    (g) => frame >= toFrame(g.t) && frame < toFrame(g.t + g.d),
  );
  const shakes = (spec.shakes ?? []).map((sh) => {
    const [t, end] = span([sh.t, sh.t + sh.d]);
    return { ...sh, t, d: end - t };
  });
  const gray =
    spec.grayFrom === undefined
      ? 0
      : interpolate(frame, [toFrame(spec.grayFrom), toFrame(spec.grayFrom) + 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <TimeContext.Provider value={toFrame}>
      <AbsoluteFill style={{ backgroundColor: "black" }}>
        <Sequence durationInFrames={frames}>
          <AbsoluteFill
            style={{ filter: `grayscale(${gray}) ${grade ? grade.filter : ""}` }}
          >
            <ZoomVideo
              src={spec.src}
              zooms={zooms}
              segments={segments}
              mute={bleep.map(([a, b]) => [toFrame(a), toFrame(b)])}
              shakes={shakes}
            />
          </AbsoluteFill>
          <Watermark />
          {spec.overlays}
          <Captions
            words={words}
            y={spec.captionY}
            cuts={cuts}
            heavy={spec.heavyCaptions}
          />
          {captionSfx.map((w) => (
            <Sfx key={w.s} t={w.s - 0.03} raw name="swish" volume={0.25} />
          ))}
          {zooms
            .filter((z) => z.type === "push")
            .map((z) => (
              <Sfx key={z.t} t={z.t} raw name="whoosh" volume={0.25} />
            ))}
          {bleep.map(([a, b]) => (
            <Sfx key={a} t={a} name="beep" volume={0.5} dur={b - a} />
          ))}
          <Sfx t={frames / fps - 0.75} raw name="rise" volume={0.35} />
        </Sequence>
        {spec.music && (
          <Audio src={staticFile(spec.music.src)} volume={spec.music.volume} />
        )}
        <Sequence from={frames}>
          <EndCard />
          <Sfx t={0} raw name="hit" volume={0.7} />
          <Sfx t={0} raw name="zap" volume={0.4} />
        </Sequence>
      </AbsoluteFill>
    </TimeContext.Provider>
  );
};
