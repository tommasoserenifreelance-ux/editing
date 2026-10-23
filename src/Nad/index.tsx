import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
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
  Framing,
  HEAD_ANCHOR,
  Hype,
  Mattoni,
  NadPrecursori,
  NonDimostrato,
  Promettenti,
  Scarica,
  Serie,
  Sopravvivenza,
  Studi,
  Subscribe,
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
  cam?: "in" | "out"; // force the camera move instead of alternating
  quiet?: boolean; // no whoosh on the cut
  speaker?: boolean;
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

// Each scene runs until the next one starts. Cuts land on spoken words.
const SCENES: Scene[] = [
  { from: 0, caption: "white", speaker: true, render: th("wide") },
  { from: wt("molecole"), caption: "none", render: (t0) => <Serie t0={t0} /> },
  { from: wt("e", 3), caption: "white", speaker: true, render: th("close") },
  { from: wt("il", 5), caption: "none", render: (t0) => <NadPrecursori t0={t0} /> },
  { from: wt("Pensa"), caption: "none", render: (t0) => <BatteriaCellula t0={t0} /> },
  { from: wt("E", 12.5), caption: "white", render: (t0) => <Scarica t0={t0} /> },
  { from: wt("Cos'è"), caption: "white", center: true, render: (t0) => <Domanda t0={t0} /> },
  { from: wt("Il", 16.5), caption: "white", speaker: true, render: th("wide", ["coenzima"]) },
  { from: wt("Serve"), caption: "none", render: (t0) => <EnergiaDna t0={t0} /> },
  { from: wt("Due"), caption: "white", speaker: true, render: th("close", ["letteralmente"]) },
  { from: wt("la", 25.5), caption: "none", render: (t0) => <Sopravvivenza t0={t0} /> },
  { from: wt("quindi", 27), caption: "white", speaker: true, render: th("wide", ["sopravvivenza"]) },
  { from: wt("Ne"), caption: "none", render: (t0) => <Flebo t0={t0} /> },
  { from: wt("Ma", 31), caption: "white", speaker: true, render: th("close", ["orale"]) },
  { from: wt("la", 33.8), caption: "none", render: (t0) => <ViaOrale t0={t0} /> },
  { from: wt("complementare"), caption: "none", render: (t0) => <Complementare t0={t0} /> },
  { from: wt("Ed"), caption: "white", speaker: true, render: th("wide", ["precursori"]) },
  { from: wt("che", 43), caption: "none", render: (t0) => <Mattoni t0={t0} /> },
  { from: wt("Ma", 49.5), caption: "none", render: (t0) => <Studi t0={t0} /> },
  { from: wt("È", 51.5), caption: "white", speaker: true, render: th("close", ["solidità"]) },
  { from: wt("Questi"), caption: "none", render: (t0) => <Aumentano t0={t0} /> },
  { from: wt("Tradurre"), caption: "none", render: (t0) => <Benefici t0={t0} /> },
  { from: wt("E", 65), caption: "white", speaker: true, render: th("wide", ["onestà", "trasparenza"]) },
  // cut right as "differenza" ends so the speaker never starts "il framing" on camera
  { from: 70.62, caption: "none", cam: "in", quiet: true, render: (t0) => <Framing t0={t0} /> },
  { from: wt("il", 73), caption: "none", render: (t0) => <Promettenti t0={t0} /> },
  { from: wt("Promettente"), caption: "none", render: (t0) => <NonDimostrato t0={t0} /> },
  { from: wt("E", 88), caption: "white", speaker: true, render: th("close", ["distinzione"]) },
  { from: wt("insegue"), caption: "none", render: (t0) => <Hype t0={t0} /> },
];

/**
 * Camera move on every scene, alternating a slow zoom-in with a fast
 * zoom-out that settles.
 */
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

// Three "subscribe" call-to-actions, each over a speaker shot.
const SUBSCRIBE_AT = [22.6, 39.4, 89.2];

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
          <Cam
            dir={s.cam ?? (i % 2 === 0 ? "in" : "out")}
            // speaker shots zoom from the top of the head, graphics from centre
            origin={s.speaker ? HEAD_ANCHOR : "50% 50%"}
          >
            {s.render(s.from)}
          </Cam>
          {i > 0 && !s.quiet ? (
            <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.3} />
          ) : null}
        </Sequence>
      );
    })}
    {SUBSCRIBE_AT.map((t) => (
      <Sequence key={t} from={sec(t)} durationInFrames={sec(3)}>
        <Subscribe />
      </Sequence>
    ))}
    <Captions modeAt={modeAt} />
    <Audio src={staticFile("nad/voice.m4a")} volume={0.85} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* YouTube cut: hook → channel intro + title → rest of episode → outro  */
/* ------------------------------------------------------------------ */

// The hook ends on "…con l'età si scarica."; the intro plays, then the
// episode resumes on "Cos'è? Perché conta?".
const HOOK_END = sec(15.5);
const INTRO = sec(13.5);
const OUTRO = sec(5.59);
const BODY = NAD_DURATION - HOOK_END;
export const NAD_YT_DURATION = HOOK_END + INTRO + BODY + OUTRO;

export const NadYouTube: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.black }}>
    <Sequence durationInFrames={HOOK_END}>
      <Nad />
    </Sequence>
    <Sequence from={HOOK_END} durationInFrames={INTRO}>
      <OffthreadVideo src={staticFile("nad/intro.mp4")} />
    </Sequence>
    <Sequence from={HOOK_END + INTRO} durationInFrames={BODY}>
      <Sequence from={-HOOK_END}>
        <Nad />
      </Sequence>
    </Sequence>
    <Sequence from={HOOK_END + INTRO + BODY} durationInFrames={OUTRO}>
      <OffthreadVideo src={staticFile("nad/outro.mp4")} />
    </Sequence>
  </AbsoluteFill>
);
