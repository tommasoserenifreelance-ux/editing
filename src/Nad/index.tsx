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
  Aumentano,
  BatteriaCellula,
  Benefici,
  Complementare,
  Domanda,
  EnergiaDna,
  Flebo,
  Hype,
  Mattoni,
  NadPrecursori,
  NonDimostrato,
  Promettenti,
  Scarica,
  Serie,
  Sopravvivenza,
  Studi,
  TalkingHead,
  ViaOrale,
} from "./scenes";

// Cut on the first word of a caption so no caption is split by a cut.
const wt = (w: string, after = 0) => chunkStart(wordAt(w, after));

const VOICE_END = 95.3;
export const NAD_FPS = FPS;
export const NAD_DURATION = sec(VOICE_END);

type Scene = {
  from: number; // seconds
  caption: CaptionMode;
  center?: boolean; // caption in the middle (text-only screens)
  render: (t0: number) => React.ReactNode;
};

const th =
  (framing: "wide" | "close", punchWords: string[] = []) =>
  (t0: number) => (
    <TalkingHead
      start={t0}
      framing={framing}
      punch={punchWords.map((w) => wordAt(w, t0) - t0)}
    />
  );

const black = () => <AbsoluteFill style={{ backgroundColor: colors.black }} />;

// Each scene runs until the next one starts. Cuts land on spoken words.
const SCENES: Scene[] = [
  { from: 0, caption: "white", render: th("wide") },
  { from: wt("molecole"), caption: "none", render: (t0) => <Serie t0={t0} /> },
  { from: wt("e", 3), caption: "white", render: th("close", ["studiata"]) },
  { from: wt("il", 5), caption: "none", render: (t0) => <NadPrecursori t0={t0} /> },
  { from: wt("Pensa"), caption: "none", render: (t0) => <BatteriaCellula t0={t0} /> },
  { from: wt("E", 12.5), caption: "white", render: (t0) => <Scarica t0={t0} /> },
  { from: wt("Cos'è"), caption: "white", center: true, render: (t0) => <Domanda t0={t0} /> },
  { from: wt("Il", 16.5), caption: "white", render: th("wide", ["coenzima"]) },
  { from: wt("Serve"), caption: "none", render: (t0) => <EnergiaDna t0={t0} /> },
  { from: wt("Due"), caption: "white", render: th("close", ["letteralmente"]) },
  { from: wt("la", 25.5), caption: "none", render: (t0) => <Sopravvivenza t0={t0} /> },
  { from: wt("quindi", 27), caption: "white", render: th("wide", ["sopravvivenza"]) },
  { from: wt("Ne"), caption: "none", render: (t0) => <Flebo t0={t0} /> },
  { from: wt("Ma", 31), caption: "white", render: th("close", ["orale"]) },
  { from: wt("la", 33.8), caption: "none", render: (t0) => <ViaOrale t0={t0} /> },
  { from: wt("complementare"), caption: "none", render: (t0) => <Complementare t0={t0} /> },
  { from: wt("Ed"), caption: "white", render: th("wide", ["precursori"]) },
  { from: wt("che", 43), caption: "none", render: (t0) => <Mattoni t0={t0} /> },
  { from: wt("Ma", 49.5), caption: "none", render: (t0) => <Studi t0={t0} /> },
  { from: wt("È", 51.5), caption: "white", render: th("close", ["solidità"]) },
  { from: wt("Questi"), caption: "none", render: (t0) => <Aumentano t0={t0} /> },
  { from: wt("Tradurre"), caption: "none", render: (t0) => <Benefici t0={t0} /> },
  { from: wt("E", 65), caption: "white", render: th("wide", ["onestà", "trasparenza"]) },
  { from: wt("Il", 70.5), caption: "white", center: true, render: black },
  { from: wt("il", 73), caption: "none", render: (t0) => <Promettenti t0={t0} /> },
  { from: wt("Promettente"), caption: "none", render: (t0) => <NonDimostrato t0={t0} /> },
  { from: wt("E", 88), caption: "white", render: th("close", ["distinzione"]) },
  { from: wt("insegue"), caption: "white", render: (t0) => <Hype t0={t0} /> },
];

/**
 * Camera move on every scene, alternating a slow zoom-in with a fast
 * zoom-out that settles.
 */
const Cam: React.FC<{ dir: "in" | "out"; children: React.ReactNode }> = ({
  dir,
  children,
}) => {
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
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
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

export const Nad: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <PrintDefs />
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const end = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : NAD_DURATION;
      return (
        <Sequence key={i} from={start} durationInFrames={end - start}>
          <Cam dir={i % 2 === 0 ? "in" : "out"}>{s.render(s.from)}</Cam>
          {i > 0 ? (
            <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.3} />
          ) : null}
        </Sequence>
      );
    })}
    <Captions modeAt={modeAt} />
    <Audio src={staticFile("nad/voice.m4a")} volume={0.85} />
  </AbsoluteFill>
);
