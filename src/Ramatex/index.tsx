import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, outline, sans } from "./theme";
import WORDS from "./words.json";

export const RAMATEX_FPS = 30;
const TALK_END = 42.6; // last word ends at 42.3 s
const OUTRO = 2.2;
export const RAMATEX_DURATION = Math.round((TALK_END + OUTRO) * RAMATEX_FPS);

type Word = { w: string; s: number; e: number };

type Machine = {
  name: string;
  img: string;
  nameAt: number; // seconds: the machine is named
  score: number;
  scoreAt: number; // seconds: "x out of ten"
  tag?: string;
};

const MACHINES: Machine[] = [
  { name: "Crosslapper", img: "crosslapper", nameAt: 1.33, score: 8, scoreAt: 2.83 },
  { name: "Lab Card", img: "card", nameAt: 6.24, score: 7, scoreAt: 7.75 },
  { name: "Needle Loom", img: "needle-loom", nameAt: 15.16, score: 10, scoreAt: 16.26, tag: "FLAGSHIP" },
  { name: "Thermal Machine", img: "thermal", nameAt: 25.93, score: 9, scoreAt: 27.87 },
  { name: "End of Line", img: "end-of-line", nameAt: 35.98, score: 8, scoreAt: 37.51 },
];

const f = (s: number) => Math.round(s * RAMATEX_FPS);

const useSpring = (delay = 0, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
};

// --- Talking head, with a punch-in on every score ----------------------------

const Talk: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / RAMATEX_FPS;
  const punched = MACHINES.some((m) => t >= m.scoreAt && t < m.scoreAt + 1.2);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("ramatex/talk.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${punched ? 1.16 : 1.06})`,
          transformOrigin: "50% 40%",
        }}
      />
      {/* Darken the bright bookshelf so the title and list stay legible. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,20,48,0.72) 0%, rgba(10,20,48,0.35) 26%, rgba(10,20,48,0) 42%)",
        }}
      />
    </AbsoluteFill>
  );
};

// --- Header: logo on the blue plate + title ----------------------------------

const Header: React.FC = () => {
  const plate = useSpring(0, 14);
  const title = useSpring(6, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
      <div
        style={{
          background: colors.blue,
          borderRadius: 26,
          padding: "26px 40px",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          transform: `translateY(${interpolate(plate, [0, 1], [-60, 0])}px) scale(${interpolate(plate, [0, 1], [0.8, 1])})`,
          opacity: Math.min(1, plate * 2),
        }}
      >
        <Img src={staticFile("ramatex/logo-white.png")} style={{ width: 420, display: "block" }} />
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.05,
          color: colors.white,
          textAlign: "center",
          opacity: Math.min(1, title * 2),
          transform: `scale(${interpolate(title, [0, 1], [0.85, 1])})`,
        }}
      >
        <div style={outline}>OUR MACHINES RATED</div>
        <div
          style={{
            display: "inline-block",
            marginTop: 14,
            background: colors.blue,
            borderRadius: 16,
            padding: "4px 26px 8px",
            border: `5px solid ${colors.white}`,
          }}
        >
          OUT OF 10
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Left-hand list that fills as each machine is scored ---------------------

const Row: React.FC<{ m: Machine; index: number }> = ({ m, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const named = spring({ frame: frame - f(m.nameAt), fps, config: { damping: 14, mass: 0.6 } });
  const scored = spring({ frame: frame - f(m.scoreAt), fps, config: { damping: 10, mass: 0.5 } });
  const isNamed = frame >= f(m.nameAt);
  const isScored = frame >= f(m.scoreAt);
  return (
    <div style={{ display: "flex", alignItems: "center", height: 104, gap: 14 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          background: isNamed ? colors.blue : "rgba(10,20,48,0.55)",
          border: `4px solid ${colors.white}`,
          color: colors.white,
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
      {isNamed ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: Math.min(1, named * 2),
            transform: `translateX(${interpolate(named, [0, 1], [-40, 0])}px)`,
          }}
        >
          <Img
            src={staticFile(`ramatex/${m.img}.jpg`)}
            style={{
              width: 110,
              height: 76,
              objectFit: "cover",
              borderRadius: 10,
              border: `3px solid ${colors.white}`,
            }}
          />
          <div style={{ fontFamily: sans, fontWeight: 900, color: colors.white, lineHeight: 1 }}>
            <div style={{ fontSize: 32, ...outline, WebkitTextStroke: "7px #0A1430" }}>
              {m.name.toUpperCase()}
            </div>
            {isScored ? (
              <div
                style={{
                  marginTop: 6,
                  display: "inline-block",
                  fontSize: 34,
                  background: colors.white,
                  color: colors.blue,
                  borderRadius: 8,
                  padding: "2px 10px",
                  transform: `scale(${interpolate(scored, [0, 1], [0.3, 1])})`,
                  transformOrigin: "left center",
                }}
              >
                {m.score}/10
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ScoreList: React.FC = () => (
  <AbsoluteFill style={{ paddingTop: 470, paddingLeft: 36 }}>
    {MACHINES.map((m, i) => (
      <Row key={m.name} m={m} index={i} />
    ))}
  </AbsoluteFill>
);

// --- Machine photo that pops over the desk while it is described -------------

const MachineCard: React.FC<{ m: Machine; duration: number }> = ({ m, duration }) => {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 12);
  const badge = useSpring(f(m.scoreAt - m.nameAt), 9);
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showBadge = frame >= f(m.scoreAt - m.nameAt);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1250 }}>
      <div
        style={{
          position: "relative",
          opacity: Math.min(1, enter * 2) * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [160, 0]) + interpolate(exit, [0, 1], [80, 0])}px) rotate(${interpolate(enter, [0, 1], [-6, -2])}deg) scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
        }}
      >
        <div
          style={{
            background: colors.white,
            padding: 10,
            borderRadius: 26,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <Img
            src={staticFile(`ramatex/${m.img}.jpg`)}
            style={{ width: 560, height: 340, objectFit: "cover", borderRadius: 18, display: "block" }}
          />
          <div
            style={{
              marginTop: 10,
              background: colors.blue,
              borderRadius: 14,
              color: colors.white,
              fontFamily: sans,
              fontWeight: 900,
              fontSize: 40,
              textAlign: "center",
              padding: "10px 0 12px",
            }}
          >
            {m.name.toUpperCase()}
          </div>
        </div>
        {m.tag ? (
          <div
            style={{
              position: "absolute",
              top: -26,
              left: -20,
              background: colors.sky,
              color: colors.ink,
              fontFamily: sans,
              fontWeight: 900,
              fontSize: 30,
              padding: "6px 18px",
              borderRadius: 12,
              transform: "rotate(-8deg)",
            }}
          >
            {m.tag}
          </div>
        ) : null}
        {showBadge ? (
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -46,
              width: 170,
              height: 170,
              borderRadius: "50%",
              background: colors.blue,
              border: `8px solid ${colors.white}`,
              boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
              color: colors.white,
              fontFamily: sans,
              fontWeight: 900,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 0.9,
              transform: `scale(${interpolate(badge, [0, 1], [0, 1])}) rotate(${interpolate(badge, [0, 1], [-40, 8])}deg)`,
            }}
          >
            <div style={{ fontSize: 76 }}>{m.score}</div>
            <div style={{ fontSize: 28, opacity: 0.85 }}>/ 10</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// --- Word-by-word captions ----------------------------------------------------

const clean = (w: string) => w.replace(/[.,;:!?]+$/g, "");

type Group = { words: Word[]; start: number; end: number };

// 1-3 word bursts, broken on punctuation and pauses, like the reference.
const groupWords = (words: Word[]): Group[] => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((word, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((n, x) => n + x.w.length, 0);
    if (
      cur.length > 0 &&
      (cur.length >= 3 || chars + word.w.length > 18 || /[.,!?]$/.test(prev.w) || word.s - prev.e > 0.3)
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(word);
  });
  if (cur.length) groups.push(cur);
  return groups.map((g, i) => {
    const next = groups[i + 1];
    const last = g[g.length - 1];
    const end = next && next[0].s - last.e < 0.8 ? next[0].s : last.e + 0.4;
    return { words: g, start: g[0].s, end };
  });
};

const GROUPS = groupWords(WORDS as Word[]);

const CaptionGroup: React.FC<{ g: Group }> = ({ g }) => {
  const frame = useCurrentFrame();
  const t = g.start + frame / RAMATEX_FPS;
  const pop = useSpring(0, 12);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1070 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 14px",
          maxWidth: 900,
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 64,
          color: colors.white,
          textTransform: "uppercase",
          transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
          opacity: Math.min(1, pop * 2),
        }}
      >
        {g.words.map((w, i) => {
          const active = t >= w.s && t < (g.words[i + 1]?.s ?? g.end);
          return (
            <span
              key={i}
              style={{
                padding: "2px 14px 6px",
                borderRadius: 14,
                background: active ? colors.blue : "transparent",
                ...(active ? { boxShadow: "0 8px 22px rgba(0,0,0,0.35)" } : outline),
                transform: active ? "scale(1.06)" : undefined,
              }}
            >
              {clean(w.w)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => (
  <>
    {GROUPS.map((g, i) => (
      <Sequence key={i} from={f(g.start)} durationInFrames={Math.max(1, f(g.end) - f(g.start))} layout="none">
        <CaptionGroup g={g} />
      </Sequence>
    ))}
  </>
);

// --- Outro: logo on full blue --------------------------------------------------

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const logo = spring({ frame: frame - 8, fps, config: { damping: 12, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, ${colors.blue} 0%, ${colors.blueDeep} 85%)`,
          clipPath: `circle(${interpolate(wipe, [0, 1], [0, 120])}% at 50% 50%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("ramatex/logo-white.png")}
          style={{
            width: 820,
            opacity: Math.min(1, logo * 2),
            transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- Composition -----------------------------------------------------------------

export const RamatexVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <Talk />
      <Sequence durationInFrames={f(TALK_END)} layout="none">
        <Header />
        <ScoreList />
        <Captions />
      </Sequence>
      {MACHINES.map((m, i) => {
        const next = MACHINES[i + 1];
        const until = Math.min(m.scoreAt + 3.2, next ? next.nameAt - 0.3 : TALK_END);
        return (
          <React.Fragment key={m.name}>
            <Sequence from={f(m.nameAt)} durationInFrames={f(until - m.nameAt)} layout="none">
              <MachineCard m={m} duration={f(until - m.nameAt)} />
            </Sequence>
            <Sequence from={f(m.nameAt)} layout="none">
              <Audio src={staticFile("ramatex/sfx/whoosh.wav")} volume={0.45} />
            </Sequence>
            <Sequence from={f(m.scoreAt)} layout="none">
              <Audio src={staticFile("ramatex/sfx/ding.wav")} volume={0.4} />
            </Sequence>
          </React.Fragment>
        );
      })}
      <Sequence from={f(TALK_END) - 4}>
        <Outro />
        <Audio src={staticFile("ramatex/sfx/swish.wav")} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
