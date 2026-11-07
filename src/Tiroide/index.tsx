import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import { ColorBars, Grain, ref, Room, Smoke, Vignette } from "../IvTherapy/fx";
import { chunksOf, Kinetic, Word } from "../IvTherapy/kinetic";
import { Big, BrollWord, Burst, Card, Chip, CircleDraw, Clock, DotSplit, Lead, Puzzle, Radial, Stamp, Stripes, Studies } from "./mg";
import words from "./words.json";

/*
 * "Tiroide nell'uomo" — vertical reel (≈ 54 s).
 * Speaker = the approved pre-edit (v4, already cut, 1.1×); words.json holds
 * its word timings. Pulp/LongevaMed captions on the speaker, B-roll with a
 * big decoding word, PubMed study cards, and kinetic-typography cards (from
 * the new reference) wherever there is no B-roll.
 */

const W = words as Word[];
const norm = (w: string) => w.replace(/[.,?:!]/g, "").toLowerCase();
/** case-insensitive word-time lookup */
const wt = (text: string, after = 0) => {
  const hit = W.find((x) => x.s >= after - 0.01 && norm(x.w) === norm(text));
  if (!hit) throw new Error(`word not found: ${text} after ${after}`);
  return hit.s;
};
const at = (t0: number, w: string, after = t0 - 0.3) => sec(wt(w, after) - t0);
const VOICE_END = 52.42;
const END = VOICE_END + 1.7;
export const TIR_FPS = FPS;
export const TIR_DURATION = sec(END);

const CHUNKS = chunksOf(W, [], {
  yellow: ["donna", "segnali", "preventiva", "persistenti", "considerarlo", "risultato"],
  red: ["poca", "scontato", "scartarlo"],
});

const ANCHOR = "50% 6%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="tiroide/clip.mp4" anchor={ANCHOR} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5))" }} />
    <Vignette strength={0.4} />
    <Grain opacity={0.06} />
  </AbsoluteFill>
);

type Scene = { from: number; speaker?: boolean; smoke?: boolean; bars?: boolean; render: (t0: number) => React.ReactNode };

const lead = (t0: number, text: string, after?: number) =>
  text.split(" ").reduce<{ list: { w: string; at: number }[]; t: number }>(
    (acc, w) => {
      const clean = w.replace(/[.,]/g, "");
      const s = wt(clean, acc.t);
      acc.list.push({ w, at: sec(s - t0) });
      acc.t = s + 0.01;
      return acc;
    },
    { list: [], t: after ?? t0 - 0.3 },
  ).list;

const SCENES: Scene[] = [
  // ---- hook
  { from: 0, speaker: true, render: (t0) => <Speaker start={t0} punch={["donna"]} /> },
  {
    from: 1.8,
    bars: true,
    render: (t0) => (
      <Card>
        <Burst at={2} x={0.5} y={0.3} />
        <Lead words={lead(t0, "ed è proprio questo")} top={0.39} />
        <Big text="IL PROBLEMA." at={at(t0, "problema")} top={0.52} color={ref.red} size={150} />
        <CircleDraw at={at(t0, "problema") + 4} top={0.52} w={0.92} h={0.14} />
      </Card>
    ),
  },
  // ---- symptoms on B-roll
  { from: 3.48, render: () => <BrollWord src="tiroide/b_stanchezza.mp4" word="STANCHEZZA" /> },
  { from: 3.96, render: () => <BrollWord src="tiroide/b_energia.mp4" word={"CALO DI\nENERGIA"} /> },
  { from: 5.2, render: () => <BrollWord src="tiroide/b_peso.mp4" word={"AUMENTO\nDI PESO"} /> },
  { from: 6.48, render: () => <BrollWord src="tiroide/b_umore.mp4" word={"UMORE\nBASSO"} /> },
  { from: 7.88, render: () => <BrollWord src="tiroide/b_desiderio.mp4" word={"CALO DEL\nDESIDERIO"} /> },
  // ---- "vengono spesso attribuiti ad altro: allo stress, all'età…"
  {
    from: 9.16,
    render: (t0) => (
      <Card bg="red">
        <Lead words={lead(t0, "vengono spesso attribuiti")} top={0.36} />
        <Radial at={at(t0, "ad")} top={0.5} color="#141416" />
        <Big text="AD ALTRO." at={at(t0, "ad")} top={0.5} color="#fff" size={170} />
      </Card>
    ),
  },
  {
    from: 10.98,
    render: (t0) => (
      <Card>
        <Stripes at={0} top={0.47} />
        <Chip text="STRESS" at={at(t0, "stress")} x={0.32} y={0.4} rot={-6} />
        <Chip text="ETÀ" at={at(t0, "all'età")} x={0.68} y={0.55} rot={5} bg={ref.yellow} color="#141416" />
      </Card>
    ),
  },
  {
    from: 12.62,
    render: (t0) => (
      <Studies
        items={[
          { src: "tiroide/study3.png", at: 2, hl: [0.2, 0.5] },
          { src: "tiroide/study4.png", at: at(t0, "calo"), hl: [0.16, 0.5] },
        ]}
        label={
          <>
            <Lead words={lead(t0, "confusi con un calo di")} top={0.1} />
            <Big text="TESTOSTERONE" at={at(t0, "testosterone")} top={0.84} color={ref.red} />
          </>
        }
      />
    ),
  },
  // ---- the reveal
  { from: 15.1, render: (t0) => <BrollWord src="tiroide/b_tiroide.mp4" word="TIROIDE" at={at(t0, "tiroide")} /> },
  { from: 16.36, render: () => <BrollWord src="tiroide/b_collo.mp4" word="TRASCURATA" at={1} color={ref.red} /> },
  { from: 17.15, speaker: true, render: (t0) => <Speaker start={t0} punch={["segnali"]} /> },
  // ---- frequency: many women, few men
  {
    from: 18.97,
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "ciò che cambia è la")} top={0.13} />
        <Big text="FREQUENZA" at={at(t0, "frequenza")} top={0.22} size={140} />
        <DotSplit at={at(t0, "frequenza") + 4} splitAt={at(t0, "più")} />
        <Lead words={lead(t0, "più bassa nell'uomo")} top={0.82} color={ref.yellow} size={66} />
      </Card>
    ),
  },
  { from: 22.82, speaker: true, render: (t0) => <Speaker start={t0} punch={["poca", "risultato"]} /> },
  // ---- later diagnosis
  {
    from: 28.55,
    bars: true,
    render: (t0) => (
      <Studies
        items={[{ src: "tiroide/study6.png", at: 2, hl: [0.25, 0.59] }]}
        label={
          <>
            <Lead words={lead(t0, "una disfunzione tiroidea")} top={0.1} />
            <Big text="NELL'UOMO" at={at(t0, "nell'uomo")} top={0.82} />
          </>
        }
      />
    ),
  },
  {
    from: 31.55,
    render: (t0) => (
      <Card>
        <Clock at={0} top={0.36} />
        <Lead words={lead(t0, "viene riconosciuta")} top={0.6} />
        <Big text={"MOLTO\nPIÙ TARDI."} at={at(t0, "molto")} top={0.76} color={ref.red} size={150} />
      </Card>
    ),
  },
  // ---- prevention message
  { from: 33.88, speaker: true, render: (t0) => <Speaker start={t0} punch={["preventiva", "scontato"]} /> },
  {
    from: 39.03,
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "che la tiroide sia solo un")} top={0.3} />
        <Stripes at={at(t0, "problema") - 5} top={0.52} />
        <Big text={"PROBLEMA\nFEMMINILE"} at={at(t0, "problema")} top={0.52} color="#fff" size={128} />
        <Stamp text="NO" at={at(t0, "femminile")} x={0.74} y={0.7} />
      </Card>
    ),
  },
  { from: 41.82, speaker: true, render: (t0) => <Speaker start={t0} punch={["persistenti"]} /> },
  {
    from: 43.6,
    render: (t0) => (
      <Studies
        items={[
          { src: "tiroide/study0.png", at: 2, hl: [0.24, 0.56] },
          { src: "tiroide/study7.png", at: at(t0, "non"), hl: [0.28, 0.58] },
          { src: "tiroide/study1.png", at: at(t0, "spiegano"), hl: [0.29, 0.51] },
        ]}
        label={<Lead words={lead(t0, "che non si spiegano,")} top={0.1} />}
      />
    ),
  },
  // ---- the check
  { from: 45.18, render: (t0) => <BrollWord src="tiroide/b_provette.mp4" word="CONTROLLO" at={at(t0, "controllo")} /> },
  {
    from: 46.55,
    smoke: true,
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "degli ormoni tiroidei")} top={0.12} color="#141416" />
        <Chip text="TSH" at={at(t0, "ormoni")} x={0.24} y={0.27} rot={-6} />
        <Chip text="FT3" at={at(t0, "tiroidei")} x={0.5} y={0.29} rot={3} bg={ref.red} />
        <Chip text="FT4" at={at(t0, "tiroidei") + 6} x={0.76} y={0.27} rot={-3} />
        <Puzzle at={at(t0, "tassello") - 4} top={0.53} />
        <Big text={"UN TASSELLO\nSEMPLICE."} at={at(t0, "tassello")} top={0.8} color="#141416" size={118} shadow={false} />
      </Card>
    ),
  },
  { from: 49.18, speaker: true, render: (t0) => <Speaker start={t0} punch={["considerarlo"]} /> },
  { from: VOICE_END + 0.05, bars: true, render: () => <EndCard /> },
];

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [2, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Room>
      <Img
        src={staticFile("nadig/logo-white.png")}
        style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: k, transform: `scale(${1.5 + 0.25 * k})` }}
      />
      <Sfx at={2} name="ding" volume={0.35} />
    </Room>
  );
};

const Cam: React.FC<{ dir: "in" | "out"; origin: string; children: React.ReactNode }> = ({ dir, origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale =
    dir === "in"
      ? interpolate(frame, [0, durationInFrames], [1, 1.05], { easing: Easing.inOut(Easing.quad) })
      : interpolate(frame, [0, Math.min(durationInFrames, 30)], [1.08, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>{children}</AbsoluteFill>;
};

const sceneAt = (t: number) => {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].from) i++;
  return i;
};

export const Tiroide: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const stop = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : sec(END);
      return (
        <Sequence key={i} from={start} durationInFrames={Math.max(1, stop - start)}>
          <Cam dir={i % 2 === 0 ? "in" : "out"} origin={s.speaker ? ANCHOR : "50% 50%"}>
            {s.render(s.from)}
          </Cam>
          {s.smoke ? <Smoke at={-12} dur={24} /> : null}
          {s.bars ? <ColorBars at={0} dur={5} /> : null}
          {i > 0 && !s.smoke && !s.bars ? <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.26} /> : null}
        </Sequence>
      );
    })}
    <Kinetic
      chunks={CHUNKS}
      visible={(t) => {
        const i = sceneAt(t);
        return { on: !!SCENES[i].speaker, end: SCENES[i + 1]?.from ?? END };
      }}
    />
    <Sequence durationInFrames={sec(VOICE_END + 0.3)} layout="none">
      <Audio src={staticFile("tiroide/voice.m4a")} volume={0.95} />
    </Sequence>
  </AbsoluteFill>
);
