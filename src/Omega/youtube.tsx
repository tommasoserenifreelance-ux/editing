import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { sec } from "../Testosterone/theme";
import { ColorBars, Grain, ref, Room, Smoke, Vignette } from "../IvTherapy/fx";
import { chunksOf, Kinetic, Word } from "../IvTherapy/kinetic";
import { Big, BrollWord, Card, Chip, CircleDraw, Lead } from "../Tiroide/mg";
import { IndexRing, Membrane } from "./fx";
import words from "./words_yt.json";

/*
 * Omega 3 — YouTube (16:9, full talk). Same LongevaMed edit as the IG reel,
 * plus the parts only the long version has (heart/brain/eyes, the series
 * link, freshness, the professional, generic products).
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
const VOICE_END = 135.7;
const END = VOICE_END + 1.7;
export const OMEGA_YT_DURATION = sec(END);


const ANCHOR = "52% 22%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="omega/clip_yt.mp4" anchor={ANCHOR} />
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

/** PubMed cards laid out for 16:9: centred column, fanned. */
const StudiesH: React.FC<{ items: { src: string; at: number; hl: [number, number] }[]; label?: React.ReactNode }> = ({ items, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Room>
      {items.map((it, i) => {
        const s = spring({ frame: frame - it.at, fps, config: { damping: 15, mass: 0.6 } });
        if (frame < it.at) return null;
        const hl = interpolate(frame - it.at, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const rot = [-3, 2.5, -1.5][i % 3];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1920 / 2 - 560 + (i - 1) * 60,
              top: 210 + i * 70,
              width: 1120,
              transform: `translateY(${(1 - s) * 900}px) rotate(${rot * s + (1 - s) * 14}deg)`,
              background: "#fff",
              padding: "26px 18px 18px",
              borderRadius: 6,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ position: "relative" }}>
              <Img src={staticFile(it.src)} style={{ width: "100%", display: "block" }} />
              <div style={{ position: "absolute", left: "-1%", top: `${it.hl[0] * 100}%`, height: `${(it.hl[1] - it.hl[0]) * 100}%`, width: `${hl * 102}%`, background: "rgba(247,198,0,0.55)", mixBlendMode: "multiply", borderRadius: 4 }} />
            </div>
            <div style={{ position: "absolute", left: 24, top: -28, background: "#20558A", color: "#fff", fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 32, padding: "6px 16px", borderRadius: 8, transform: "rotate(-3deg)" }}>
              Pub<span style={{ color: "#A9D3F5" }}>Med</span>
            </div>
            <Sfx at={it.at} name="whoosh" volume={0.14} />
          </div>
        );
      })}
      {label}
    </Room>
  );
};

/** B-roll word for 16:9: the lead line sits well above the big word. */
const BW: React.FC<{ src: string; word: string; at: number; lead?: { w: string; at: number }[]; color?: string }> = ({ src, word, at, lead: l, color }) => (
  <>
    <BrollWord src={src} word={word} at={at} color={color} />
    {l ? <Lead words={l} top={0.52} /> : null}
  </>
);

const SCENES: Scene[] = [
  // ---- hook
  { from: 0, speaker: true, render: (t0) => <Speaker start={t0} punch={["spiazza"]} /> },
  { from: f("Puoi", 1.5), render: (t0) => <BW src="omega/h_capsula_donna.mp4" word="OGNI GIORNO" at={at(t0, "tutti")} lead={lead(t0, "il tuo bravo integratore")} /> },
  {
    from: f("ed", 6.8),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "ed essere comunque biologicamente")} top={0.2} />
        <Big text="A SECCO." at={at(t0, "secco")} top={0.38} color={ref.red} size={170} boom />
        <CircleDraw at={at(t0, "secco") + 4} top={0.38} w={0.5} h={0.24} />
        <Lead words={lead(t0, "ma come fai a")} top={0.6} />
        <Big text="SAPERLO?" at={at(t0, "saperlo")} top={0.76} size={150} />
      </Card>
    ),
  },
  { from: f("Omega", 11.8), speaker: true, render: (t0) => <Speaker start={t0} /> },
  {
    from: f("si", 15.3),
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "si possono")} top={0.3} color="#141416" />
        <Big text="MISURARE." at={at(t0, "misurare")} top={0.5} color="#141416" size={190} shadow={false} />
      </Card>
    ),
  },
  { from: f("E", 17.1), speaker: true, render: (t0) => <Speaker start={t0} /> },
  {
    from: f("il", 19.1),
    render: (t0) => (
      <Card>
        <Big text="IL NUMERO," at={at(t0, "numero")} top={0.3} size={170} boom />
        <Lead words={lead(t0, "non solo il")} top={0.5} />
        <Big text="BARATTOLO." at={at(t0, "barattolo")} top={0.7} color={ref.red} size={150} />
      </Card>
    ),
  },
  { from: f("Prima", 22.1), speaker: true, render: (t0) => <Speaker start={t0} punch={["servono"]} /> },
  {
    from: f("Gli", 23.7),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "gli Omega 3, in particolare")} top={0.16} />
        <Chip text="EPA" at={at(t0, "EPA")} x={0.4} y={0.33} rot={-6} />
        <Chip text="DHA" at={at(t0, "DHA")} x={0.6} y={0.36} rot={5} bg={ref.red} />
        <Lead words={lead(t0, "sono potenti modulatori")} top={0.55} />
        <Big text="DELL'INFIAMMAZIONE" at={at(t0, "dell'infiammazione")} top={0.73} color={ref.yellow} size={130} boom />
      </Card>
    ),
  },
  { from: f("e", 30.7), render: (t0) => <BW src="omega/h_cuore.mp4" word="CUORE" at={at(t0, "cuore")} lead={lead(t0, "importantissimi per")} /> },
  { from: f("cervello", 32.9), render: () => <BW src="omega/h_cervello.mp4" word="CERVELLO" at={3} /> },
  { from: f("e", 34.1), render: (t0) => <BW src="omega/h_occhi.mp4" word="OCCHI" at={at(t0, "occhi")} /> },
  { from: f("Hai", 34.9), speaker: true, render: (t0) => <Speaker start={t0} punch={["collegamento", "cronica"]} /> },
  // ---- what they do
  {
    from: f("Gli", 40.5),
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "gli Omega 3 sono degli")} top={0.12} />
        <Big text="ESTINTORI" at={at(t0, "estintori")} top={0.28} size={170} boom />
        <Lead words={lead(t0, "di quell'incendio silenzioso")} top={0.5} />
        <Big text={"INFIAMMAZIONE\nCRONICA"} at={at(t0, "dell'infiammazione")} top={0.72} color={ref.red} size={120} />
        <CircleDraw at={at(t0, "cronica") + 2} top={0.72} w={0.62} h={0.32} color={ref.yellow} />
      </Card>
    ),
  },
  // ---- the index
  {
    from: f("Lo", 50.3),
    render: (t0) => (
      <StudiesH
        items={[
          { src: "omega/study0.png", at: 3, hl: [0.42, 0.95] },
          { src: "omega/study1.png", at: at(t0, "pochi"), hl: [0.2, 0.62] },
          { src: "omega/study2.png", at: at(t0, "conoscono"), hl: [0.2, 0.62] },
        ]}
        label={
          <>
            <Lead words={lead(t0, "lo strumento che pochi conoscono")} top={0.06} />
            <Big text="INDICE OMEGA 3" at={at(t0, "l'indice")} top={0.88} size={130} />
          </>
        }
      />
    ),
  },
  {
    from: f("un", 54.1),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "un esame che misura la percentuale di EPA e di DHA")} top={0.06} />
        <IndexRing at={at(t0, "percentuale") - 4} top={0.56} size={820} />
      </Card>
    ),
  },
  {
    from: f("nelle", 57.7),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "nelle tue membrane,")} top={0.08} />
        <Membrane at={2} fillAt={at(t0, "membrane")} top={0.45} />
        <Big text="DELLE TUE CELLULE." at={at(t0, "delle")} top={0.86} size={110} />
      </Card>
    ),
  },
  {
    from: f("Non", 60.3),
    render: (t0) => (
      <Card bg="red">
        <Lead words={lead(t0, "non quanto ne prendi,")} top={0.2} />
        <Big text="MA QUANTO" at={at(t0, "ma")} top={0.4} color="#fff" size={160} />
        <Big text="ARRIVA A DESTINAZIONE." at={at(t0, "arrivato")} top={0.62} color="#141416" size={110} shadow={false} boom />
      </Card>
    ),
  },
  { from: f("È", 65.4), speaker: true, render: (t0) => <Speaker start={t0} punch={["oggettivo", "intenzioni"]} /> },
  {
    from: f("ti", 73.2),
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "ti permette di personalizzare la dose finché l'indice non è")} top={0.28} color="#141416" />
        <Big text="A TARGET." at={at(t0, "target")} top={0.55} color="#141416" size={190} shadow={false} />
      </Card>
    ),
  },
  // ---- why you can still be low
  { from: f("Perché", 78.2), speaker: true, render: (t0) => <Speaker start={t0} punch={["carenti"]} /> },
  { from: f("Perché", 83), render: (t0) => <BW src="omega/h_softgel.mp4" word="QUALITÀ E DOSE" at={at(t0, "qualità")} /> },
  {
    from: f("Il", 85.9),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "il titolo reale di EPA e di DHA è spesso")} top={0.22} />
        <Big text="PIÙ BASSO" at={at(t0, "basso")} top={0.45} color={ref.red} size={180} boom />
        <Lead words={lead(t0, "di quanto realmente si possa credere.")} top={0.66} color={ref.yellow} />
      </Card>
    ),
  },
  {
    from: f("La", 92.2),
    smoke: true,
    render: (t0) => (
      <Card>
        <Big text="FRESCHEZZA" at={at(t0, "freschezza")} top={0.24} size={160} />
        <Lead words={lead(t0, "perché un Omega 3")} top={0.42} />
        <Big text="OSSIDATO" at={at(t0, "ossidato")} top={0.58} color={ref.red} size={150} boom />
        <Lead words={lead(t0, "vale poco, e la qualità effettiva.")} top={0.76} color={ref.yellow} />
      </Card>
    ),
  },
  { from: f("È", 97.3), speaker: true, render: (t0) => <Speaker start={t0} /> },
  { from: f("la", 100.7), render: (t0) => <BW src="omega/h_medico.mp4" word="PROFESSIONISTA" at={at(t0, "professionista")} lead={lead(t0, "la guida di un")} /> },
  {
    from: f("e", 102.5),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "e una scelta")} top={0.26} />
        <Big text="SU MISURA" at={at(t0, "su")} top={0.44} size={180} />
        <Lead words={lead(t0, "calibrata sul tuo indice")} top={0.64} color={ref.yellow} />
      </Card>
    ),
  },
  { from: f("evitano", 105.8), render: (t0) => <BW src="omega/h_scaffale.mp4" word="GENERICI E SOTTODOSATI" at={at(t0, "generici")} lead={lead(t0, "evitano di farti buttare soldi in prodotti")} color={ref.red} /> },
  // ---- food first
  { from: f("E", 110.3), speaker: true, render: (t0) => <Speaker start={t0} punch={["cibo"]} /> },
  {
    from: f("Pesce", 112.7),
    render: (t0) => (
      <>
        <BW src="omega/h_pesce.mp4" word="PESCE GRASSO" at={at(t0, "Pesce")} />
        <Chip text="SGOMBRO" at={at(t0, "sgombro")} x={0.22} y={0.2} rot={-5} />
        <Chip text="SARDINE" at={at(t0, "sardine")} x={0.5} y={0.26} rot={4} bg={ref.red} />
        <Chip text="SALMONE" at={at(t0, "salmone")} x={0.78} y={0.2} rot={-3} bg="#fff" color="#141416" />
      </>
    ),
  },
  {
    from: f("due", 115.9),
    smoke: true,
    render: (t0) => (
      <Card>
        <Big text="2-3 VOLTE" at={at(t0, "due")} top={0.42} size={190} />
        <Lead words={lead(t0, "a settimana.")} top={0.6} color={ref.yellow} size={72} />
      </Card>
    ),
  },
  { from: f("Resta", 117.8), speaker: true, render: (t0) => <Speaker start={t0} punch={["base"]} /> },
  {
    from: f("l'integrazione", 119.2),
    render: (t0) => (
      <Card bg="yellow">
        <Lead words={lead(t0, "l'integrazione mirata serve solamente come")} top={0.26} color="#141416" />
        <Big text="CILIEGINA SULLA TORTA." at={at(t0, "ciliegina")} top={0.52} color="#141416" size={130} shadow={false} />
      </Card>
    ),
  },
  { from: f("magari", 124), speaker: true, render: (t0) => <Speaker start={t0} punch={["grande"]} /> },
  { from: VOICE_END + 0.05, bars: true, render: () => <EndCard /> },
];

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [2, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Room>
      <Img
        src={staticFile("nadig/logo-white.png")}
        style={{ position: "absolute", left: 420, top: -420, width: 1080, height: 1920, opacity: k, transform: `scale(${1.2 + 0.2 * k})` }}
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
  yellow: ["spiazza", "servono", "collegamento", "cronica", "oggettivo", "cibo", "base", "grande"],
  red: ["carenti", "intenzioni"],
};
// chunked per speaker shot, so a caption never runs into the next shot
const CHUNKS = SCENES.flatMap((sc, i) => {
  if (!sc.speaker) return [];
  const end = SCENES[i + 1]?.from ?? END;
  const ws = W.filter((w) => w.s + 0.01 >= sc.from && w.s + 0.01 < end);
  return ws.length ? chunksOf(ws, [], SETS) : [];
});

export const OmegaYT: React.FC = () => (
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
      <Audio src={staticFile("omega/voice_yt.m4a")} volume={0.95} />
    </Sequence>
    {/* dark trap bed in the spirit of the Pulp Podcast reference, ducked under the voice */}
    <Audio src={staticFile("omega/music_yt.m4a")} volume={0.6} />
  </AbsoluteFill>
);
