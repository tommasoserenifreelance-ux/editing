import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CaptionMode, Captions, chunkStart, wt as wordAt } from "./captions";

import { CLIP_OFFSETS, TalkingHead } from "./primitives";
import {
  Barre,
  Benefits,
  Cause,
  Domanda,
  Grafico,
  Integratore,
  Mascolinita,
  PuntiDiVista,
  Sistema,
  TestoWord,
  TextScreen,
  Trentacinque,
} from "./scenes";
import { colors, FPS, sec } from "./theme";

// Cut on the first word of a caption so no caption is split by a cut.
const wt = (w: string, after = 0) => chunkStart(wordAt(w, after));

const VOICE_END = 55.03;
export const TESTO_FPS = FPS;
export const TESTO_DURATION = sec(VOICE_END);

type Scene = {
  from: number; // seconds
  caption: CaptionMode;
  render: (t0: number) => React.ReactNode;
};

const th = (punchWords: string[] = []) => (t0: number) => (
  <TalkingHead start={t0} punch={punchWords.map((w) => wordAt(w, t0) - t0)} />
);

// Each scene runs until the next one starts. Cuts land on spoken words.
const SCENES: Scene[] = [
  { from: 0, caption: "white", render: th() },
  { from: wt("simbolo"), caption: "none", render: (t0) => <Mascolinita t0={t0} /> },
  { from: wt("il", 2), caption: "none", render: (t0) => <TestoWord t0={t0} /> },
  { from: wt("Sostiene"), caption: "none", render: (t0) => <Benefits t0={t0} /> },
  { from: CLIP_OFFSETS[1], caption: "white", render: () => <TextScreen bg={colors.black} /> },
  { from: wt("È", 14), caption: "white", render: th(["sistema"]) },
  { from: wt("che", 16), caption: "none", render: (t0) => <Sistema t0={t0} /> },
  { from: wt("Per"), caption: "white", render: th(["squilibrio"]) },
  { from: wt("si", 21), caption: "none", render: (t0) => <PuntiDiVista t0={t0} /> },
  { from: wt("Quindi"), caption: "white", render: (t0) => <Domanda t0={t0} /> },
  { from: wt("A"), caption: "none", render: (t0) => <Grafico t0={t0} /> },
  { from: CLIP_OFFSETS[2], caption: "white", render: th(["maturità"]) },
  { from: wt("dal", 34), caption: "none", render: (t0) => <Trentacinque t0={t0} /> },
  { from: wt("Il", 36), caption: "white", render: th(["uomini"]) },
  { from: wt("dipende"), caption: "none", render: (t0) => <Barre t0={t0} /> },
  { from: wt("Per", 41), caption: "none", render: (t0) => <Cause t0={t0} /> },
  { from: CLIP_OFFSETS[3], caption: "white", render: th() },
  { from: wt("integratore"), caption: "white", render: () => <Integratore /> },
  { from: wt("a", 54), caption: "white", render: th(["leggero"]) },
];

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
  };
};

export const Testosterone: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const end = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : TESTO_DURATION;
      return (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          {s.render(s.from)}
        </Sequence>
      );
    })}
    <Captions modeAt={modeAt} />
    <Audio src={staticFile("longeva/voice.m4a")} />
  </AbsoluteFill>
);
