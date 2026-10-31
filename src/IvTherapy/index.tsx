import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TalkingHead } from "../Nad/scenes";
import { Sfx } from "../Testosterone/primitives";
import { FPS, sec } from "../Testosterone/theme";
import {
  anton,
  BigWord,
  BioChart,
  Broll,
  ColorBars,
  CrtMonitor,
  Dossier,
  Grain,
  Lineup,
  mont,
  PolaroidWall,
  RetroTV,
  ref,
  Room,
  Smoke,
  TornCollage,
  Typewriter,
  Vignette,
} from "./fx";
import { Kinetic, wt } from "./kinetic";

const VOICE_END = 128.15;
export const IV_FPS = FPS;
export const IV_DURATION = sec(VOICE_END + 0.3);

/* ------------------------------------------------------------------ */
/* Speaker                                                              */
/* ------------------------------------------------------------------ */

const ANCHOR_H = "45% 9%";
const ANCHOR_V = "50% 8%";

const Speaker: React.FC<{
  start: number;
  framing: "wide" | "close";
  punch?: string[];
  vertical?: boolean;
}> = ({ start, framing, punch = [], vertical }) => (
  <AbsoluteFill>
    <TalkingHead
      start={start}
      framing={framing}
      punch={punch.map((w) => wt(w, start) - start)}
      src={vertical ? "iv/clip_v.mp4" : "iv/clip.mp4"}
      anchor={vertical ? ANCHOR_V : ANCHOR_H}
      closeScale={vertical ? 1.3 : 1.75}
    />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45))" }} />
    <Vignette strength={0.45} />
    <Grain opacity={0.06} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Scenes (horizontal, 1920x1080)                                        */
/* ------------------------------------------------------------------ */

type Scene = {
  from: number;
  speaker?: boolean;
  smoke?: boolean; // smoke transition into this scene
  bars?: boolean; // colour-bar glitch into this scene
  render: (t0: number) => React.ReactNode;
};

const at = (t0: number, w: string) => sec(wt(w, t0) - t0);

const th = (framing: "wide" | "close", punch: string[] = []) => (t0: number) => (
  <Speaker start={t0} framing={framing} punch={punch} />
);

const LINEUP = [
  { src: "iv/b_donor_nurse.mp4", word: "assorbimento", label: "problemi di assorbimento" },
  { src: "iv/b_scientist.mp4", word: "carenze", label: "carenze documentate" },
  { src: "iv/b_hospital_patient.mp4", word: "rapido", label: "rapido apporto" },
  { src: "iv/b_doctor_patient.mp4", word: "prevenzione", label: "prevenzione" },
];

const lineup = (t0: number) => (
  <Lineup items={LINEUP.map((l) => ({ src: l.src, label: l.label, at: sec(wt(l.word, 48) - t0) }))} />
);

const SCENES: Scene[] = [
  { from: 0, speaker: true, render: th("wide") },
  { from: wt("le", 1.5), render: () => <RetroTV src="iv/b_patient_infusion.mp4" /> },
  {
    from: wt("E", 3.9),
    render: (t0) => (
      <TornCollage
        items={[
          { src: "iv/news1.png", at: 2, w: 0.6, x: 0.36, y: 0.06, rot: -5 },
          { src: "iv/news2.png", at: at(t0, "rischio"), w: 0.5, x: 0.68, y: 0.22, rot: 4 },
          { src: "iv/news3.png", at: at(t0, "servono"), w: 0.62, x: 0.42, y: 0.5, rot: -2 },
        ]}
      />
    ),
  },
  {
    from: wt("o", 9.9),
    smoke: true,
    render: (t0) => (
      <Room>
        <BigWord text="MIRACOLO" at={at(t0, "miracolo")} color={ref.yellow} top={0.36} />
        <BigWord text="TRUFFA" at={at(t0, "truffa")} color={ref.red} top={0.66} />
      </Room>
    ),
  },
  { from: wt("La", 13), speaker: true, render: th("close", ["mezzo"]) },
  { from: wt("La", 18.4), bars: true, render: () => <CrtMonitor big="IV THERAPY" small={"INTRAVENOUS\nTHERAPY"} /> },
  { from: wt("è", 20.3), speaker: true, render: th("wide", ["prezioso", "personalizzata"]) },
  { from: wt("Ma", 25), smoke: true, render: () => <Typewriter text="Ma vediamo il perché. Partiamo dalle basi." /> },
  { from: wt("IV", 28.9), bars: true, render: () => <CrtMonitor big="IV" small="= INTRAVENOSA" smallAt={20} /> },
  { from: wt("cioè"), render: () => <Broll src="iv/b_people.mp4" /> },
  { from: wt("direttamente", 34), render: () => <Broll src="iv/b_paramedic.mp4" startFrom={sec(9)} /> },
  { from: wt("bypassando"), speaker: true, render: th("close") },
  { from: wt("E", 39.9), speaker: true, render: th("wide", ["concreto"]) },
  { from: wt("la", 43.9), smoke: true, render: (t0) => <BioChart ivAt={at(t0, "biodisponibilità")} oralAt={at(t0, "100%") + 10} /> },
  { from: wt("Per", 46.6), speaker: true, render: th("close", ["utile"]) },
  { from: wt("Per", 48.9), render: lineup },
  { from: wt("che", 54.3), speaker: true, render: th("wide") },
  { from: wt("per", 58.3), render: lineup },
  { from: wt("In", 63.9), speaker: true, render: th("close", ["vezzo", "migliore"]) },
  { from: wt("È", 69.7), render: (t0) => <Dossier doc="iv/news3.png" stamp="SOLIDO" stampAt={at(t0, "solido")} /> },
  { from: wt("E", 73.5), speaker: true, render: th("wide", ["vero", "generica"]) },
  { from: wt("la", 80.9), smoke: true, render: (t0) => <Room><BigWord text="PERSONALIZZAZIONE" at={at(t0, "personalizzazione")} color={ref.yellow} top={0.48} /></Room> },
  {
    from: wt("Una", 82.9),
    render: (t0) => (
      <PolaroidWall
        items={[
          { src: "iv/sacca.png", at: 2, caption: "su misura" },
          { src: "iv/b_bromothymol.mp4", video: true, at: at(t0, "nutrienti"), caption: "nutrienti" },
          { src: "iv/b_closeup_therapy.mp4", video: true, at: at(t0, "dosi"), caption: "dosi" },
        ]}
      />
    ),
  },
  { from: wt("in", 90.3), render: (t0) => <Dossier doc="iv/referto.png" photo="iv/b_scientist.mp4" photoIsVideo stamp="SU MISURA" stampAt={at(t0, "obiettivi")} /> },
  { from: wt("È", 94.9), speaker: true, render: th("close", ["tutti", "sartoriale"]) },
  { from: wt("applicato"), speaker: true, render: th("wide") },
  { from: wt("La", 103.7), bars: true, render: () => <RetroTV src="iv/b_donor_nurse.mp4" startFrom={sec(9)} /> },
  { from: wt("Ed", 109.5), speaker: true, render: th("close", ["valutazione"]) },
  { from: wt("capire"), render: () => <Broll src="iv/b_scientist.mp4" /> },
  {
    from: wt("e", 117.6),
    render: (t0) => (
      <PolaroidWall
        items={[
          { src: "iv/referto.png", at: 0, caption: "esami" },
          { src: "iv/sacca.png", at: at(t0, "sacca"), caption: "la tua sacca" },
          { src: "iv/b_people.mp4", video: true, at: at(t0, "ideale"), caption: "ideale" },
        ]}
      />
    ),
  },
  { from: wt("Non", 121.6), smoke: true, render: (t0) => <Room><BigWord text="SELF-SERVICE" at={at(t0, "self-service")} color={ref.red} top={0.48} /></Room> },
  { from: wt("ma", 124), render: () => <Broll src="iv/b_doctor_patient.mp4" /> },
  { from: wt("che", 126.4), speaker: true, render: th("close", ["medico"]) },
];

/** Alternating slow push-in / settling pull-out on every shot. */
const Cam: React.FC<{ dir: "in" | "out"; origin: string; children: React.ReactNode }> = ({ dir, origin, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale =
    dir === "in"
      ? interpolate(frame, [0, durationInFrames], [1, 1.06], { easing: Easing.inOut(Easing.quad) })
      : interpolate(frame, [0, Math.min(durationInFrames, 36)], [1.1, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>{children}</AbsoluteFill>;
};

const sceneAt = (list: Scene[], t: number) => {
  let i = 0;
  while (i < list.length - 1 && t >= list[i + 1].from) i++;
  return i;
};

const Timeline: React.FC<{
  scenes: Scene[];
  end: number;
  voice: string;
  anchor: string;
  voiceEnd?: number; // cut (with a short fade) the voice here
}> = ({ scenes, end, voice, anchor, voiceEnd }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {scenes.map((s, i) => {
      const start = sec(s.from);
      const stop = i < scenes.length - 1 ? sec(scenes[i + 1].from) : sec(end);
      return (
        <Sequence key={i} from={start} durationInFrames={Math.max(1, stop - start)}>
          <Cam dir={i % 2 === 0 ? "in" : "out"} origin={s.speaker ? anchor : "50% 50%"}>
            {s.render(s.from)}
          </Cam>
          {s.smoke ? <Smoke at={-12} dur={26} /> : null}
          {s.bars ? <ColorBars at={0} dur={6} /> : null}
          {i > 0 && !s.smoke && !s.bars ? <Sfx at={0} name={i % 2 ? "whoosh" : "swoosh"} volume={0.28} /> : null}
        </Sequence>
      );
    })}
    <Kinetic
      visible={(t) => {
        const i = sceneAt(scenes, t);
        return { on: !!scenes[i].speaker, end: scenes[i + 1]?.from ?? end };
      }}
    />
    <Sequence durationInFrames={voiceEnd ? sec(voiceEnd) : sec(end)} layout="none">
      <Audio
        src={staticFile(voice)}
        volume={(f) =>
          voiceEnd ? 0.9 * interpolate(f, [sec(voiceEnd) - 6, sec(voiceEnd)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0.9
        }
      />
    </Sequence>
  </AbsoluteFill>
);

export const IvTherapy: React.FC = () => (
  <Timeline scenes={SCENES} end={VOICE_END + 0.3} voice="iv/voice.m4a" anchor={ANCHOR_H} />
);

/* ------------------------------------------------------------------ */
/* YouTube: hook → channel intro with "IV THERAPY" title → body → outro */
/* ------------------------------------------------------------------ */

const HOOK_END = sec(25.12); // after "…mirata e personalizzata."
const INTRO = sec(13.5);
const OUTRO = sec(5.59);
const BODY = IV_DURATION - HOOK_END;
export const IV_YT_DURATION = HOOK_END + INTRO + BODY + OUTRO;

const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = sec(8.9);
  const k = interpolate(frame, [t0, t0 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("iv/intro_bg.mp4")} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: anton, fontSize: 104, color: "#fff", letterSpacing: "0.01em", opacity: k, transform: `scale(${0.96 + 0.04 * k})`, textShadow: "0 4px 18px rgba(0,0,0,0.5)" }}>
          IV THERAPY
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const IvTherapyYouTube: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence durationInFrames={HOOK_END}>
      <IvTherapy />
    </Sequence>
    <Sequence from={HOOK_END} durationInFrames={INTRO}>
      <IntroTitle />
    </Sequence>
    <Sequence from={HOOK_END + INTRO} durationInFrames={BODY}>
      <Sequence from={-HOOK_END}>
        <IvTherapy />
      </Sequence>
    </Sequence>
    <Sequence from={HOOK_END + INTRO + BODY} durationInFrames={OUTRO}>
      <OffthreadVideo src={staticFile("iv/outro.mp4")} />
    </Sequence>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Vertical Instagram cut (≈ 28 s): the hook + closing card              */
/* ------------------------------------------------------------------ */

const V_END = 25.12;
const V_CARD = 3.2;
export const IV_V_DURATION = sec(V_END + V_CARD);

const thV = (framing: "wide" | "close", punch: string[] = []) => (t0: number) => (
  <Speaker start={t0} framing={framing} punch={punch} vertical />
);

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [2, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Room>
      <Img src={staticFile("nadig/logo-white.png")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: k, transform: `translateY(-220px) scale(${1.4 + 0.3 * k})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: mont, fontWeight: 600, fontStyle: "italic", fontSize: 58, color: "#fff", opacity: k }}>
        Continua nel video integrale
      </div>
      <BigWord text="LINK IN BIO" at={12} color={ref.yellow} top={0.62} size={130} />
      <Sfx at={2} name="ding" volume={0.35} />
    </Room>
  );
};

const V_SCENES: Scene[] = [
  { from: 0, speaker: true, render: thV("wide") },
  { from: wt("le", 1.5), render: () => <RetroTV src="iv/b_patient_infusion.mp4" scale={1} /> },
  {
    from: wt("E", 3.9),
    render: (t0) => (
      <TornCollage
        items={[
          { src: "iv/news1.png", at: 2, w: 0.9, x: 0.5, y: 0.14, rot: -5 },
          { src: "iv/news2.png", at: at(t0, "rischio"), w: 0.85, x: 0.5, y: 0.36, rot: 4 },
          { src: "iv/news3.png", at: at(t0, "servono"), w: 0.9, x: 0.5, y: 0.6, rot: -2 },
        ]}
      />
    ),
  },
  {
    from: wt("o", 9.9),
    smoke: true,
    render: (t0) => (
      <Room>
        <BigWord text="MIRACOLO" at={at(t0, "miracolo")} color={ref.yellow} top={0.4} />
        <BigWord text="TRUFFA" at={at(t0, "truffa")} color={ref.red} top={0.58} />
      </Room>
    ),
  },
  { from: wt("La", 13), speaker: true, render: thV("close", ["mezzo"]) },
  { from: wt("La", 18.4), bars: true, render: () => <CrtMonitor big="IV THERAPY" small={"INTRAVENOUS\nTHERAPY"} /> },
  { from: wt("è", 20.3), speaker: true, render: thV("wide", ["prezioso", "personalizzata"]) },
  { from: V_END, smoke: true, render: () => <EndCard /> },
];

export const IvTherapyInstagram: React.FC = () => (
  <Timeline scenes={V_SCENES} end={V_END + V_CARD} voice="iv/voice.m4a" anchor={ANCHOR_V} voiceEnd={V_END + 0.15} />
);
