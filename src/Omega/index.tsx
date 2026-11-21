import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import { Grain, Vignette } from "../IvTherapy/fx";
import { CherryTop, Checks, Fire, FuelGauge, IndexGauge, ToTarget, Week } from "./anim";
import { C, Captions, Clip, Lead, norm, Panel, Pill, StudyFan, Title, Wipe, Word } from "./ui";
import words from "./words_ig.json";

/*
 * "Omega 3: il numero, non il barattolo" — vertical IG reel (≈ 63 s).
 * Speaker = approved pre-edit (already cut, 1.05×); words_ig.json holds
 * its word timings. New grammar for the series (see ui.tsx).
 */

const W = words as Word[];
const wt = (text: string, after = 0) => {
  const hit = W.find((x) => x.s >= after - 0.01 && norm(x.w) === norm(text));
  if (!hit) throw new Error(`word not found: ${text} after ${after}`);
  return hit.s;
};
const at = (t0: number, w: string, after = t0 - 0.3) => sec(wt(w, after) - t0);
const f = (w: string, after: number, pre = 0.05) => wt(w, after) - pre;
const lead = (t0: number, text: string, after?: number) =>
  text.split(" ").reduce<{ list: { w: string; at: number }[]; t: number }>(
    (acc, w) => {
      const s = wt(w.replace(/[.,]/g, ""), acc.t);
      acc.list.push({ w, at: sec(s - t0) });
      acc.t = s + 0.01;
      return acc;
    },
    { list: [], t: after ?? t0 - 0.3 },
  ).list;

const VOICE_END = 61.25;
const END = VOICE_END + 1.8;
export const OMEGA_FPS = FPS;
export const OMEGA_IG_DURATION = sec(END);
const ANCHOR = "50% 8%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="omega/clip_ig.mp4" anchor={ANCHOR} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(11,22,34,0.55))" }} />
    <Vignette strength={0.35} />
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

type Scene = { from: number; caps?: boolean; render: (t0: number) => React.ReactNode };

const SCENES: Scene[] = [
  // ---- hook
  { from: 0, caps: true, render: (t0) => <Speaker start={t0} punch={["spiazza"]} /> },
  {
    from: f("Puoi", 1.5),
    caps: true,
    render: (t0) => (
      <Clip src="omega/v_capsula_donna.mp4">
        <Pill text="Omega 3" at={at(t0, "Omega")} x={0.5} y={0.2} />
        <Pill text="ogni giorno" at={at(t0, "tutti")} x={0.5} y={0.29} bg={C.white} size={52} rot={-3} />
      </Clip>
    ),
  },
  {
    from: f("ed", 6.5),
    render: (t0) => (
      <Panel>
        <Lead words={lead(t0, "ed essere comunque biologicamente")} top={0.13} />
        <FuelGauge at={at(t0, "secco") - 6} top={0.3} />
        <Title lines={["*a secco."]} at={[at(t0, "secco")]} top={0.68} size={170} />
      </Panel>
    ),
  },
  { from: f("Ma", 9.3), caps: true, render: (t0) => <Speaker start={t0} punch={["saperlo"]} /> },
  {
    from: f("si", 14.8),
    render: (t0) => (
      <Panel>
        <Title lines={["si possono", "*misurare."]} at={[0, at(t0, "misurare")]} top={0.36} size={150} />
        <Pill text="EPA + DHA" at={at(t0, "misurare") + 8} x={0.5} y={0.62} bg={C.white} size={56} />
      </Panel>
    ),
  },
  // ---- the fire
  {
    from: f("Gli", 16.4),
    render: (t0) => (
      <Panel>
        <Lead words={lead(t0, "gli Omega 3 sono degli")} top={0.09} />
        <Title lines={["*estintori"]} at={[at(t0, "estintori")]} top={0.15} size={160} />
        <Fire at={4} outAt={at(t0, "basso")} top={0.33} />
        <Lead words={lead(t0, "dell'incendio silenzioso dell'infiammazione cronica")} top={0.76} size={58} color={C.yellow} />
      </Panel>
    ),
  },
  // ---- the index
  {
    from: f("Lo", 25),
    render: (t0) => (
      <Panel>
        <Lead words={lead(t0, "lo strumento che pochi conoscono")} top={0.08} />
        <StudyFan
          top={0.2}
          items={[
            { src: "omega/study0.png", at: 3, hl: [0.42, 0.95] },
            { src: "omega/study1.png", at: at(t0, "pochi"), hl: [0.2, 0.62] },
            { src: "omega/study2.png", at: at(t0, "conoscono"), hl: [0.2, 0.62] },
          ]}
        />
        <Title lines={["l'indice", "*omega 3"]} at={[at(t0, "l'indice"), at(t0, "Omega")]} top={0.7} size={140} />
      </Panel>
    ),
  },
  {
    from: f("un", 29),
    render: (t0) => (
      <Panel>
        <Lead words={lead(t0, "un esame che misura la percentuale di EPA e di DHA")} top={0.1} />
        <IndexGauge at={at(t0, "percentuale")} top={0.33} />
        <Title lines={["nelle tue", "*cellule"]} at={[at(t0, "nelle"), at(t0, "membrane")]} top={0.62} size={140} />
      </Panel>
    ),
  },
  {
    from: f("Non", 35),
    render: (t0) => (
      <Panel>
        <Title lines={["non quanto", "ne prendi"]} at={[0, at(t0, "ne")]} top={0.08} size={110} color="rgba(255,255,255,0.55)" />
        <Title lines={["*ma quanto", "*arriva"]} at={[at(t0, "ma"), at(t0, "arrivato")]} top={0.72} size={130} />
        <ToTarget at={at(t0, "ma")} fillAt={at(t0, "arrivato")} top={0.47} />
      </Panel>
    ),
  },
  // ---- why you can still be low
  { from: f("Perché", 40), caps: true, render: (t0) => <Speaker start={t0} punch={["carenti"]} /> },
  {
    from: f("Perché", 44.6),
    render: (t0) => (
      <Clip src="omega/v_softgel.mp4">
        <Lead words={lead(t0, "perché contano")} top={0.22} size={62} color="#fff" />
        <Checks items={[{ text: "QUALITÀ", at: at(t0, "qualità") }, { text: "DOSE VERA", at: at(t0, "dose") }]} top={0.36} />
      </Clip>
    ),
  },
  // ---- food first
  { from: f("E", 47.5), caps: true, render: (t0) => <Speaker start={t0} punch={["cibo"]} /> },
  {
    from: f("Pesce", 50.3),
    render: (t0) => (
      <Clip src="omega/v_pesce.mp4">
        <Lead words={lead(t0, "pesce grasso come")} top={0.14} size={62} color="#fff" />
        <Pill text="sgombro" at={at(t0, "sgombro")} x={0.3} y={0.62} rot={-4} />
        <Pill text="sardine" at={at(t0, "sardine")} x={0.68} y={0.7} bg={C.white} rot={3} />
        <Pill text="salmone" at={at(t0, "salmone")} x={0.36} y={0.79} rot={-2} />
      </Clip>
    ),
  },
  {
    from: f("due", 53.3),
    render: (t0) => (
      <Panel>
        <Title lines={["*2-3 volte", "a settimana"]} at={[0, at(t0, "settimana")]} top={0.24} size={130} />
        <Week at={4} top={0.52} />
      </Panel>
    ),
  },
  {
    from: f("Resta", 55.2),
    render: (t0) => (
      <Panel>
        <Lead words={lead(t0, "resta la base, l'integrazione mirata serve solamente come")} top={0.1} />
        <CherryTop at={at(t0, "base") - 4} capAt={at(t0, "ciliegina")} top={0.42} />
        <Title lines={["*la ciliegina", "sulla torta."]} at={[at(t0, "ciliegina"), at(t0, "torta")]} top={0.68} size={120} />
      </Panel>
    ),
  },
  { from: VOICE_END + 0.05, render: () => <EndCard /> },
];

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [3, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glitch = frame < 8 && frame % 2 === 0;
  return (
    <Panel>
      <Img
        src={staticFile("nadig/logo-white.png")}
        style={{ position: "absolute", left: glitch ? 14 : 0, top: 0, width: 1080, height: 1920, opacity: k, transform: `scale(${1.45 + 0.2 * k})`, filter: glitch ? "hue-rotate(60deg) saturate(3)" : "none" }}
      />
      <Sfx at={0} name="glitch" volume={0.22} />
      <Sfx at={2} name="tvon" volume={0.18} />
    </Panel>
  );
};

const sceneAt = (t: number) => {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].from) i++;
  return i;
};

export const OmegaIG: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {SCENES.map((s, i) => {
      const start = sec(s.from);
      const stop = i < SCENES.length - 1 ? sec(SCENES[i + 1].from) : sec(END);
      return (
        <Sequence key={i} from={start} durationInFrames={Math.max(1, stop - start)}>
          {s.render(s.from)}
        </Sequence>
      );
    })}
    {/* the yellow wipe rides over every cut (starts a few frames before it) */}
    {SCENES.slice(1).map((s, i) => (
      <Sequence key={`w${i}`} from={Math.max(0, sec(s.from) - 4)} durationInFrames={10} layout="none">
        <Wipe dur={9} sound={i < SCENES.length - 2} />
      </Sequence>
    ))}
    <Captions
      words={W}
      keys={["spiazza", "saperlo", "carenti", "cibo", "religiosamente"]}
      top={0.72}
      visible={(t) => !!SCENES[sceneAt(t)].caps}
    />
    <Sequence durationInFrames={sec(VOICE_END + 0.3)} layout="none">
      <Audio src={staticFile("omega/voice_ig.m4a")} volume={0.95} />
    </Sequence>
    <Audio src={staticFile("omega/music_ig.m4a")} volume={0.55} />
  </AbsoluteFill>
);
