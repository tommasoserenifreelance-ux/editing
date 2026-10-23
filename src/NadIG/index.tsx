import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PrintDefs, Sfx } from "../Testosterone/primitives";
import { colors, FPS, sec } from "../Testosterone/theme";
import { CaptionMode, Captions, chunkStart, wt as wordAt } from "./captions";
import {
  BatteriaCellula,
  Complementare,
  Domanda,
  EndCard,
  EnergiaDna,
  Flebo,
  HEAD_ANCHOR_V,
  NadPrecursori,
  Scarica,
  Serie,
  Sopravvivenza,
  Speaker,
  ViaOrale,
} from "./scenes";

// Cut on the first word of a caption so no caption is split by a cut.
const wt = (w: string, after = 0) => chunkStart(wordAt(w, after));

const VOICE_END = 38.73;
const END_CARD = 3.5;
export const NADIG_FPS = FPS;
export const NADIG_DURATION = sec(VOICE_END + END_CARD);

type Scene = {
  from: number;
  caption: CaptionMode;
  center?: boolean;
  speaker?: boolean;
  render: (t0: number) => React.ReactNode;
};

const th =
  (framing: "wide" | "close", punchWords: string[] = []) =>
  (t0: number) => (
    <Speaker
      start={t0}
      framing={framing}
      punch={punchWords.map((w) => wordAt(w, t0) - t0)}
    />
  );

const SCENES: Scene[] = [
  { from: 0, caption: "white", speaker: true, render: th("wide") },
  { from: wt("molecole"), caption: "none", render: (t0) => <Serie t0={t0} /> },
  { from: wt("e", 2.5), caption: "white", speaker: true, render: th("close") },
  { from: wt("il", 4.8), caption: "none", render: (t0) => <NadPrecursori t0={t0} /> },
  { from: wt("Pensa"), caption: "none", render: (t0) => <BatteriaCellula t0={t0} /> },
  { from: wt("E", 11.5), caption: "white", render: (t0) => <Scarica t0={t0} /> },
  { from: wt("Cos'è"), caption: "white", center: true, render: (t0) => <Domanda t0={t0} /> },
  { from: wt("Il", 15), caption: "white", speaker: true, render: th("wide", ["coenzima"]) },
  { from: wt("Serve"), caption: "none", render: (t0) => <EnergiaDna t0={t0} /> },
  { from: wt("Due"), caption: "white", speaker: true, render: th("close", ["letteralmente"]) },
  { from: wt("la", 23), caption: "none", render: (t0) => <Sopravvivenza t0={t0} /> },
  { from: wt("quindi", 24.5), caption: "white", speaker: true, render: th("wide", ["sopravvivenza"]) },
  { from: wt("Ne"), caption: "none", render: (t0) => <Flebo t0={t0} /> },
  { from: wt("Ma", 28), caption: "white", speaker: true, render: th("close", ["orale"]) },
  { from: wt("la", 30.3), caption: "none", render: (t0) => <ViaOrale t0={t0} /> },
  { from: wt("complementare"), caption: "none", render: (t0) => <Complementare t0={t0} /> },
  { from: wt("Ed"), caption: "white", speaker: true, render: th("wide", ["precursori"]) },
  { from: VOICE_END, caption: "none", render: () => <EndCard /> },
];

const Cam: React.FC<{
  dir: "in" | "out";
  origin: string;
  children: React.ReactNode;
}> = ({ dir, origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale =
    dir === "in"
      ? interpolate(frame, [0, durationInFrames], [1, 1.08], {
          easing: Easing.inOut(Easing.quad),
        })
      : interpolate(frame, [0, Math.min(durationInFrames, 40)], [1.14, 1], {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
      {children}
    </AbsoluteFill>
  );
};

const sceneAt = (t: number) => {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].from) i++;
  return i;
};

const modeAt = (t: number) => {
  const i = sceneAt(t);
  return {
    mode: SCENES[i].caption,
    end: SCENES[i + 1]?.from ?? VOICE_END,
    center: !!SCENES[i].center,
  };
};

export const NadInstagram: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <PrintDefs />
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const end = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : NADIG_DURATION;
      return (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          <Cam
            dir={i % 2 === 0 ? "in" : "out"}
            origin={s.speaker ? HEAD_ANCHOR_V : "50% 50%"}
          >
            {s.render(s.from)}
          </Cam>
          {i > 0 ? (
            <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.3} />
          ) : null}
        </Sequence>
      );
    })}
    <Captions modeAt={modeAt} />
    <Audio src={staticFile("nadig/voice.m4a")} volume={0.85} />
  </AbsoluteFill>
);
