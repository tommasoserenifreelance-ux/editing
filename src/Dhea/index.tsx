import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import { ColorBars, Grain, ref, Room, Smoke, Vignette } from "../IvTherapy/fx";
import { chunksOf, Kinetic, Word } from "../IvTherapy/kinetic";
import { Big, BrollWord, Card, Lead, Studies } from "../Tiroide/mg";
import { Adrenals, BrickSplit, Decline, NotEqual, Target } from "./mg";
import words from "./words.json";

/*
 * "DHEA nella donna" — vertical IG reel (≈ 57 s), same LongevaMed/Pulp
 * edit as the thyroid reel. Speaker = approved pre-edit v4 (already cut,
 * 1.05×); words.json holds its word timings.
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
const VOICE_END = 55.2;
const END = VOICE_END + 1.7;
export const DHEA_FPS = FPS;
export const DHEA_DURATION = sec(END);

// words from "gestione" on are written on the B-roll: keep them out of the speaker captions
const CHUNKS = chunksOf(W.filter((w) => w.s < 51), [], {
  yellow: ["longevità", "precursore", "prevenzione", "donna", "sostenere", "accompagna"],
  red: ["inseguire"],
});

const ANCHOR = "50% 6%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="dhea/clip.mp4" anchor={ANCHOR} />
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
  { from: 0, speaker: true, render: (t0) => <Speaker start={t0} punch={["longevità"]} /> },
  // ---- what it is
  {
    from: f("Il", 5.6),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "il DHEA è prodotto dalle")} top={0.1} />
        <Adrenals at={at(t0, "ghiandole")} top={0.5} />
        <Big text={"GHIANDOLE\nSURRENALI"} at={at(t0, "ghiandole")} top={0.82} size={130} />
      </Card>
    ),
  },
  { from: f("ed", 9.4), speaker: true, render: (t0) => <Speaker start={t0} punch={["precursore"]} /> },
  {
    from: f("un", 11.3),
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "un mattone fondamentale di partenza")} top={0.14} />
        <BrickSplit at={at(t0, "mattone")} leftAt={at(t0, "estrogeni")} rightAt={at(t0, "androgeni")} top={0.4} />
      </Card>
    ),
  },
  { from: f("Il", 18), speaker: true, render: (t0) => <Speaker start={t0} punch={["prevenzione"]} /> },
  // ---- it declines with age
  {
    from: f("il", 21.4),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "il DHEA")} top={0.08} />
        <Big text="CALA" at={at(t0, "cala")} top={0.19} color={ref.red} size={170} boom />
        <Decline at={at(t0, "cala") + 3} top={0.33} dur={sec(25.4 - 22.95)} />
        <Lead words={lead(t0, "progressivamente, di anno in anno.")} top={0.8} color={ref.yellow} size={58} />
      </Card>
    ),
  },
  // ---- association is not causation
  {
    from: f("Associazione", 25.5),
    render: (t0) => (
      <Card bg="red">
        <NotEqual left="ASSOCIAZIONE" leftAt={at(t0, "Associazione")} right="CAUSA" at={at(t0, "causa")} top={0.3} />
      </Card>
    ),
  },
  {
    from: f("Persone", 28),
    render: (t0) => (
      <Studies
        items={[{ src: "dhea/study0.png", at: 3, hl: [0.19, 0.36] }]}
        label={
          <>
            <Lead words={lead(t0, "persone più in salute potrebbero")} top={0.09} />
            <Big text="PIÙ DHEA" at={sec(wt("più", 32.4) - t0)} top={0.83} />
          </>
        }
      />
    ),
  },
  { from: f("ma", 33.5), speaker: true, render: (t0) => <Speaker start={t0} punch={["donna"]} /> },
  // ---- where it is used in women
  {
    from: f("In", 39.3),
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "in alcuni usi")} top={0.16} />
        <Target at={at(t0, "usi")} top={0.43} />
        <Big text={"MIRATI E\nLOCALIZZATI"} at={at(t0, "mirati")} top={0.74} size={122} />
      </Card>
    ),
  },
  {
    from: f("Per", 42),
    render: (t0) => (
      <BrollWord src="dhea/b_ginecologa.mp4" word="MENOPAUSA" at={at(t0, "menopausa")} lead={lead(t0, "a livello vaginale per i disturbi della")} />
    ),
  },
  // ---- the take-away
  { from: f("più", 45.3), speaker: true, render: (t0) => <Speaker start={t0} punch={["sostenere"]} /> },
  { from: f("gestione", 51), render: (t0) => <BrollWord src="dhea/b_stress.mp4" word="STRESS" at={at(t0, "stress")} lead={lead(t0, "gestione dello")} /> },
  { from: f("sonno", 52.4), render: (t0) => <BrollWord src="dhea/b_sonno.mp4" word="SONNO" at={at(t0, "sonno")} startFrom={60} /> },
  {
    from: f("e", 53.3),
    render: (t0) => <BrollWord src="dhea/b_salute.mp4" word={"SALUTE\nSURRENALE"} at={at(t0, "salute")} />,
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

export const Dhea: React.FC = () => (
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
      <Audio src={staticFile("dhea/voice.m4a")} volume={0.95} />
    </Sequence>
    {/* dark trap bed in the spirit of the Pulp Podcast reference, ducked under the voice */}
    <Audio src={staticFile("dhea/music.m4a")} volume={0.6} />
  </AbsoluteFill>
);
