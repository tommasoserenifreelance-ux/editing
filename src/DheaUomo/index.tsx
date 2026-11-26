import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import { ColorBars, Grain, ref, Room, Smoke, Vignette } from "../IvTherapy/fx";
import { chunksOf, Kinetic, Word } from "../IvTherapy/kinetic";
import { Big, BrollWord, Card, Lead, Stamp, Studies } from "../Tiroide/mg";
import { Adrenals } from "../Dhea/mg";
import { Cascade } from "./mg";
import words from "./words.json";

/*
 * "DHEA nell'uomo" — vertical IG reel, the usual LongevaMed/Pulp edit.
 * Speaker = approved pre-edit v6 (cut, 1.1x); words.json holds its timings.
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
const VOICE_END = 43.65;
const END = VOICE_END + 1.7;
export const DHEAU_FPS = FPS;
export const DHEAU_DURATION = sec(END);


const ANCHOR = "50% 10%";

const Speaker: React.FC<{ start: number; punch?: string[] }> = ({ start, punch = [] }) => (
  <AbsoluteFill>
    <TalkingHead start={start} framing="wide" punch={punch.map((w) => wt(w, start - 0.3) - start)} src="dheau/clip.mp4" anchor={ANCHOR} />
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
  { from: 0, speaker: true, render: (t0) => <Speaker start={t0} punch={["nell'uomo"]} /> },
  {
    from: f("Il", 2.0),
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "il DHEA è prodotto soprattutto dai")} top={0.1} />
        <Adrenals at={at(t0, "surreni")} top={0.5} male />
        <Big text="SURRENI" at={at(t0, "surreni")} top={0.84} size={150} />
      </Card>
    ),
  },
  { from: f("e", 5.1), speaker: true, render: (t0) => <Speaker start={t0} punch={["precursore"]} /> },
  {
    from: f("da", 7.0),
    smoke: true,
    render: (t0) => (
      <Card>
        <Lead words={lead(t0, "da cui il corpo poi ricava a valle")} top={0.1} />
        <Cascade
          top={0.3}
          tiers={[
            { text: "DHEA", at: 4, bg: ref.yellow, color: "#141416" },
            { text: "ALTRI ORMONI", at: at(t0, "altri"), bg: "#fff", color: "#141416" },
            { text: "ANDROGENI", at: at(t0, "androgeni"), bg: ref.red, color: "#fff" },
          ]}
        />
      </Card>
    ),
  },
  {
    from: f("nello", 10.8),
    render: (t0) => <BrollWord src="dheau/palestra.mp4" word="TESTOSTERONE" at={at(t0, "testosterone")} lead={lead(t0, "nello specifico il")} />,
  },
  {
    from: f("Il", 12.4),
    render: (t0) => <BrollWord src="dheau/uomo_pensieroso.mp4" word="CON GLI ANNI" at={at(t0, "con")} lead={lead(t0, "il DHEA diminuisce in maniera costante")} color={ref.red} />,
  },
  { from: f("Proprio", 15.6), speaker: true, render: (t0) => <Speaker start={t0} punch={["sull'uomo"]} /> },
  {
    from: f("viene", 17.0),
    render: (t0) => <BrollWord src="dheau/integratore.mp4" word="ANTI-AGING" at={at(t0, "anti-aging")} lead={lead(t0, "proposto come integratore")} />,
  },
  { from: f("E", 21.5), speaker: true, render: (t0) => <Speaker start={t0} punch={["scetticismo"]} /> },
  {
    from: f("poiché", 23.9),
    render: (t0) => (
      <Studies
        items={[{ src: "dheau/study0.png", at: 3, hl: [0.31, 0.56] }]}
        label={
          <>
            <Lead words={lead(t0, "le prove che un'integrazione a tappeto porti benefici concreti di longevità sono")} top={0.08} />
            <Big text={"PRESSOCHÉ\nDEBOLI."} at={at(t0, "pressoché")} top={0.82} color={ref.red} size={130} boom />
          </>
        }
      />
    ),
  },
  { from: f("È", 31.3), speaker: true, render: (t0) => <Speaker start={t0} punch={["rispetto"]} /> },
  {
    from: f("e", 35.0),
    render: (t0) => <BrollWord src="dheau/pillole_colorate.mp4" word="CARAMELLA" at={at(t0, "caramella")} lead={lead(t0, "non come una")} color={ref.red} />,
  },
  { from: f("E", 37.1), speaker: true, render: (t0) => <Speaker start={t0} punch={["medico"]} /> },
  {
    from: f("con", 39.9),
    render: (t0) => <BrollWord src="dheau/provette.mp4" word="MISURE ALLA MANO" at={at(t0, "misure")} />,
  },
  {
    from: f("non", 41.5),
    render: (t0) => (
      <Card bg="yellow">
        <Big text={"NO AL\nFAI DA TE."} at={at(t0, "non")} top={0.46} color="#141416" size={150} shadow={false} boom />
        <Stamp text="NO" at={at(t0, "te") + 2} x={0.74} y={0.66} size={220} />
      </Card>
    ),
  },
  { from: VOICE_END + 0.05, bars: true, render: () => <EndCard /> },
];

const CHUNKS = SCENES.flatMap((sc, i) => {
  if (!sc.speaker) return [];
  const end = SCENES[i + 1]?.from ?? END;
  const ws = W.filter((w) => w.s + 0.01 >= sc.from && w.s + 0.01 < end);
  return ws.length ? chunksOf(ws, [], { yellow: ["nell'uomo", "precursore", "sull'uomo", "scetticismo", "rispetto", "medico"], red: [] }) : [];
});

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

export const DheaUomo: React.FC = () => (
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
      <Audio src={staticFile("dheau/voice.m4a")} volume={0.95} />
    </Sequence>
    {/* dark trap bed in the spirit of the Pulp Podcast reference, ducked under the voice */}
    <Audio src={staticFile("dheau/music.m4a")} volume={0.6} />
  </AbsoluteFill>
);
