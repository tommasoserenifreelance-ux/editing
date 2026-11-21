import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import { ColorBars, Grain, ref, Room, Smoke, Vignette } from "../IvTherapy/fx";
import { chunksOf, Kinetic, Word } from "../IvTherapy/kinetic";
import { Big, BrollWord, Card, Chip, CircleDraw, Lead, Studies } from "../Tiroide/mg";
import { IndexRing, Membrane } from "./fx";
import words from "./words_ig.json";

/*
 * "Omega 3: il numero, non il barattolo" — vertical IG reel, the usual
 * LongevaMed/Pulp edit (kinetic captions, typographic cards, B-roll with the
 * big decoding word, PubMed cards). Speaker = approved pre-edit v2 (1.05x).
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
const VOICE_END = 60.0;
const END = VOICE_END + 1.7;
export const OMEGA_FPS = FPS;
export const OMEGA_IG_DURATION = sec(END);


const ANCHOR = "50% 8%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="omega/clip_ig.mp4" anchor={ANCHOR} />
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

const f = (w: string, after: number, pre = 0.04) => wt(w, after) - pre;

const SCENES: Scene[] = [
  // ---- hook
  { from: 0, speaker: true, render: (t0) => <Speaker start={t0} punch={["spiazza"]} /> },
  {
    from: f("Puoi", 1.5),
    render: (t0) => <BrollWord src="omega/v_capsula_donna.mp4" word="OGNI GIORNO" at={at(t0, "tutti")} lead={lead(t0, "il tuo bravo integratore")} />,
  },
  {
    from: f("ed", 6.5),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "ed essere comunque biologicamente")} top={0.33} />
        <Big text="A SECCO." at={at(t0, "secco")} top={0.48} color={ref.red} size={150} boom />
        <CircleDraw at={at(t0, "secco") + 4} top={0.48} w={0.86} h={0.14} />
        {/* the question stays on the same card so both can be read */}
        <Lead words={lead(t0, "ma come fai a")} top={0.62} />
        <Big text="SAPERLO?" at={at(t0, "saperlo")} top={0.72} size={140} />
      </Card>
    ),
  },
  { from: f("Omega", 11.3), speaker: true, render: (t0) => <Speaker start={t0} /> },
  {
    from: f("si", 14.8),
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "si possono")} top={0.34} color="#141416" />
        <Big text="MISURARE." at={at(t0, "misurare")} top={0.47} color="#141416" size={150} shadow={false} />
      </Card>
    ),
  },
  // ---- what they do
  {
    from: f("Gli", 16.2),
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "gli Omega 3 sono degli")} top={0.2} />
        <Big text="ESTINTORI" at={at(t0, "estintori")} top={0.31} size={150} boom />
        <Lead words={lead(t0, "di quell'incendio silenzioso")} top={0.5} />
        <Big text={"INFIAMMAZIONE\nCRONICA"} at={at(t0, "dell'infiammazione")} top={0.66} color={ref.red} size={104} />
        <CircleDraw at={at(t0, "cronica") + 2} top={0.66} w={0.96} h={0.17} color={ref.yellow} />
      </Card>
    ),
  },
  // ---- the index
  {
    from: f("Lo", 25),
    render: (t0) => (
      <Studies
        items={[
          { src: "omega/study0.png", at: 3, hl: [0.42, 0.95] },
          { src: "omega/study1.png", at: at(t0, "pochi"), hl: [0.2, 0.62] },
          { src: "omega/study2.png", at: at(t0, "conoscono"), hl: [0.2, 0.62] },
        ]}
        label={
          <>
            <Lead words={lead(t0, "lo strumento che pochi conoscono")} top={0.1} />
            <Big text={"INDICE\nOMEGA 3"} at={at(t0, "l'indice")} top={0.84} />
          </>
        }
      />
    ),
  },
  {
    from: f("un", 28.8),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "un esame che misura la percentuale di EPA e di DHA")} top={0.12} />
        <IndexRing at={at(t0, "percentuale") - 4} top={0.5} />
      </Card>
    ),
  },
  {
    from: f("nelle", 32.2),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "nelle tue membrane,")} top={0.16} />
        <Membrane at={2} fillAt={at(t0, "membrane")} top={0.47} />
        <Big text={"DELLE TUE\nCELLULE."} at={at(t0, "delle")} top={0.8} size={120} />
      </Card>
    ),
  },
  {
    from: f("Non", 34.5),
    render: (t0) => (
      <Card bg="red">
        <Lead words={lead(t0, "non quanto ne prendi,")} top={0.27} />
        <Big text="MA QUANTO" at={at(t0, "ma")} top={0.4} color="#fff" size={140} />
        <Big text={"ARRIVA A\nDESTINAZIONE."} at={at(t0, "arrivato")} top={0.57} color="#141416" size={108} shadow={false} boom />
      </Card>
    ),
  },
  // ---- why you can still be low
  { from: f("Perché", 39.5), speaker: true, render: (t0) => <Speaker start={t0} punch={["carenti"]} /> },
  {
    from: f("Perché", 44.1),
    render: (t0) => <BrollWord src="omega/v_softgel.mp4" word={"QUALITÀ\nE DOSE"} at={at(t0, "qualità")} />,
  },
  // ---- food first
  { from: f("E", 47), speaker: true, render: (t0) => <Speaker start={t0} punch={["cibo"]} /> },
  {
    from: f("Pesce", 49),
    render: (t0) => (
      <>
        <BrollWord src="omega/v_pesce.mp4" word={"PESCE\nGRASSO"} at={at(t0, "Pesce")} />
        <Chip text="SGOMBRO" at={at(t0, "sgombro")} x={0.3} y={0.18} rot={-5} />
        <Chip text="SARDINE" at={at(t0, "sardine")} x={0.68} y={0.27} rot={4} bg={ref.red} />
        <Chip text="SALMONE" at={at(t0, "salmone")} x={0.36} y={0.36} rot={-3} bg="#fff" color="#141416" />
      </>
    ),
  },
  {
    from: f("due", 52),
    smoke: true,
    render: (t0) => (
      <Card>
        <Big text="2-3 VOLTE" at={at(t0, "due")} top={0.42} size={150} />
        <Lead words={lead(t0, "a settimana.")} top={0.53} color={ref.yellow} size={66} />
      </Card>
    ),
  },
  { from: f("Resta", 54), speaker: true, render: (t0) => <Speaker start={t0} punch={["base"]} /> },
  {
    from: f("l'integrazione", 55),
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "l'integrazione mirata serve solamente come")} top={0.32} color="#141416" />
        <Big text={"CILIEGINA\nSULLA TORTA."} at={at(t0, "ciliegina")} top={0.52} color="#141416" size={120} shadow={false} />
      </Card>
    ),
  },
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

// captions only from words spoken on speaker shots: a word that is written on a
// card or B-roll never also appears as a caption (no doubles)
const SETS = {
  yellow: ["spiazza", "cibo", "base"],
  red: ["carenti"],
};
// chunked per speaker shot, so a caption never runs into the next shot
const CHUNKS = SCENES.flatMap((sc, i) => {
  if (!sc.speaker) return [];
  const end = SCENES[i + 1]?.from ?? END;
  const ws = W.filter((w) => w.s + 0.01 >= sc.from && w.s + 0.01 < end);
  return ws.length ? chunksOf(ws, [], SETS) : [];
});

export const OmegaIG: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const stop = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : sec(END);
      return (
        <Sequence key={i} from={start} durationInFrames={Math.max(1, stop - start)}>
          <Cam dir={i % 2 === 0 ? "in" : "out"} origin={s.speaker ? ANCHOR : "50% 50%"}>
            {s.render(s.from)}
          </Cam>
          {s.smoke ? <Smoke at={-12} dur={24} sound={false} /> : null}
          {s.smoke ? <Sfx at={-6} name="smoke" volume={0.16} /> : null}
          {s.bars ? <ColorBars at={0} dur={5} /> : null}
          {i > 0 && !s.smoke && !s.bars ? <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.13} /> : null}
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
      <Audio src={staticFile("omega/voice_ig.m4a")} volume={0.95} />
    </Sequence>
    {/* dark trap bed in the spirit of the Pulp Podcast reference, ducked under the voice */}
    <Audio src={staticFile("omega/music_ig.m4a")} volume={0.6} />
  </AbsoluteFill>
);
