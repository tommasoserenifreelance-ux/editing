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
  Benefici,
  Conseguenze,
  Estradiolo,
  Fisiologico,
  HEAD_ANCHOR_E,
  Logo,
  Menopausa,
  Prevenire,
  Prevenzione,
  Protettori,
  Scudo,
  ScudoGiu,
  Speaker,
  Strumento,
  Tappe,
  Terapie,
} from "./scenes";

// Cut on the first word of a caption so no caption is split by a cut.
const wt = (w: string, after = 0) => chunkStart(wordAt(w, after));

const VOICE_END = 88.37;
const LOGO = 2.5;
export const ESTRO_FPS = FPS;
export const ESTRO_DURATION = sec(VOICE_END + LOGO);

type Scene = {
  from: number;
  caption: CaptionMode;
  kind: "speaker" | "split" | "graphic";
  center?: boolean;
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
  { from: 0, caption: "white", kind: "speaker", render: th("wide") },
  { from: wt("le", 2.3), caption: "white", kind: "split", render: (t0) => <Tappe t0={t0} /> },
  { from: wt("Il", 4), caption: "white", kind: "split", render: (t0) => <Prevenzione t0={t0} /> },
  { from: wt("sta"), caption: "white", kind: "speaker", render: th("close", ["corpo"]) },
  { from: wt("Gli"), caption: "none", kind: "graphic", render: (t0) => <Estradiolo t0={t0} /> },
  { from: wt("sono", 15.5), caption: "white", kind: "split", render: (t0) => <Protettori t0={t0} /> },
  { from: wt("Aiutano"), caption: "white", kind: "split", render: (t0) => <Benefici t0={t0} /> },
  { from: wt("In", 35), caption: "none", kind: "graphic", render: (t0) => <Scudo t0={t0} /> },
  { from: wt("Il", 41), caption: "white", kind: "graphic", center: true, render: (t0) => <Menopausa t0={t0} /> },
  { from: wt("Quando"), caption: "white", kind: "split", render: (t0) => <ScudoGiu t0={t0} /> },
  { from: wt("Quindi", 49.5), caption: "white", kind: "split", render: (t0) => <Conseguenze t0={t0} /> },
  { from: wt("È", 63.5), caption: "none", kind: "graphic", render: (t0) => <Fisiologico t0={t0} /> },
  { from: wt("ma", 67), caption: "white", kind: "speaker", render: th("close", ["finestra", "preziosa"]) },
  { from: wt("E", 72), caption: "none", kind: "graphic", render: (t0) => <Terapie t0={t0} /> },
  { from: wt("Chiaramente", 73.5), caption: "white", kind: "split", render: (t0) => <Strumento t0={t0} /> },
  { from: wt("ma", 80), caption: "white", kind: "split", render: (t0) => <Prevenire t0={t0} /> },
  { from: wt("quindi", 85.5), caption: "white", kind: "speaker", render: th("wide", ["geriatrica"]) },
  { from: VOICE_END, caption: "none", kind: "graphic", render: () => <Logo /> },
];

/** Alternating slow zoom-in / settling zoom-out; split screens move on their own. */
const Cam: React.FC<{
  dir: "in" | "out";
  origin: string;
  children: React.ReactNode;
}> = ({ dir, origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale =
    dir === "in"
      ? interpolate(frame, [0, durationInFrames], [1, 1.07], {
          easing: Easing.inOut(Easing.quad),
        })
      : interpolate(frame, [0, Math.min(durationInFrames, 40)], [1.12, 1], {
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
    split: SCENES[i].kind === "split",
  };
};

export const Estrogeni: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <PrintDefs />
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const end = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : ESTRO_DURATION;
      const body = s.render(s.from);
      return (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          {s.kind === "split" ? (
            body
          ) : (
            <Cam
              dir={i % 2 === 0 ? "in" : "out"}
              origin={s.kind === "speaker" ? HEAD_ANCHOR_E : "50% 50%"}
            >
              {body}
            </Cam>
          )}
          {i > 0 ? (
            <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.3} />
          ) : null}
        </Sequence>
      );
    })}
    <Captions modeAt={modeAt} />
    <Audio src={staticFile("estrogeni/voice.m4a")} volume={0.85} />
  </AbsoluteFill>
);
