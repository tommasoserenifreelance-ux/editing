import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import tracks from "./tracks.json";

// Edit modelled on the reference reel: handheld table shots, a dish is set
// down, its name pops up in pale-yellow mono caps pinned to the table, light
// flashes on the cuts, logo at the end. 24 fps vertical.
export const SUSHI_FPS = 24;

const mono = "Space Mono";
const handle = delayRender("Loading Space Mono");
new FontFace(
  mono,
  `url(${staticFile("fonts/space-mono-latin-400-normal.woff2")})`,
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

type TrackKey = keyof typeof tracks;

// A shot plays one clip through a list of parts: real time while the dish is
// set down, a freeze frame (like a photo) the moment it lands, while the name
// and ingredients appear, then the clip carries on.
type Part =
  | { from: number; to: number; rate: number } // source seconds
  | { freeze: number; frames: number }; // hold the frame at `freeze` s
type Shot = {
  clip: string; // graded clip in public/beat/sushi
  parts: Part[];
  still?: { src: string; frames: number; t: number }; // freeze frame instead
  label?: { name: string; ingredients: string[]; at: number; track: TrackKey };
  logo?: { track: TrackKey };
};

const SHOTS: Shot[] = [
  {
    clip: "C0012",
    parts: [
      { from: 1.45, to: 1.9, rate: 1 },
      { freeze: 1.9, frames: 46 },
      { from: 1.9, to: 3.1, rate: 1 },
    ],
    label: {
      name: "DIVINA\nCOMMEDIA",
      ingredients: [
        "Crudo di Fassona",
        "Avocado",
        "Philadelphia",
        "Bacon croccante",
        "Granella di pistacchio",
      ],
      at: 1.9,
      track: "C0012",
    },
  },
  {
    clip: "C0014",
    parts: [
      { from: 0.3, to: 0.95, rate: 1 },
      { freeze: 0.95, frames: 46 },
      { from: 0.95, to: 2.4, rate: 1 },
    ],
    label: {
      name: "GATTOPARDO",
      ingredients: [
        "Lardo",
        "Philadelphia",
        "Noci",
        "Miele",
        "Pere",
        "Semi di papavero",
      ],
      at: 0.95,
      track: "C0014",
    },
  },
  {
    clip: "C0015",
    parts: [
      { from: 0.35, to: 1.1, rate: 1 },
      { freeze: 1.1, frames: 46 },
      { from: 1.1, to: 2.6, rate: 1 },
    ],
    label: {
      name: "PROMESSI\nSPOSI",
      ingredients: [
        "Crudo di Fassona",
        "Avocado",
        "Philadelphia",
        "Tartufo fresco di stagione",
      ],
      at: 1.1,
      track: "C0015",
    },
  },
  {
    clip: "C0015",
    parts: [],
    still: { src: "beat/sushi/C0015_end.png", frames: 40, t: 3.3 },
    logo: { track: "C0015_logo" },
  },
];

const partFrames = (p: Part) =>
  "freeze" in p ? p.frames : Math.round(((p.to - p.from) / p.rate) * SUSHI_FPS);
const shotFrames = (s: Shot) =>
  s.still ? s.still.frames : s.parts.reduce((n, p) => n + partFrames(p), 0);

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + shotFrames(SHOTS[i - 1])],
  [],
);
export const SUSHI_DURATION =
  starts[starts.length - 1] + shotFrames(SHOTS[SHOTS.length - 1]);

// Output frame (within the shot) -> source seconds, and back.
const srcTime = (s: Shot, f: number) => {
  if (s.still) return s.still.t;
  let base = 0;
  for (const p of s.parts) {
    const n = partFrames(p);
    if (f < base + n)
      return "freeze" in p
        ? p.freeze
        : p.from + ((f - base) / SUSHI_FPS) * p.rate;
    base += n;
  }
  const last = s.parts[s.parts.length - 1];
  return "freeze" in last ? last.freeze : last.to;
};
const outFrame = (s: Shot, t: number) => {
  let base = 0;
  for (const p of s.parts) {
    if ("freeze" in p ? t <= p.freeze : t < p.to)
      return (
        base +
        ("freeze" in p ? 0 : Math.round(((t - p.from) / p.rate) * SUSHI_FPS))
      );
    base += partFrames(p);
  }
  return base;
};

// Table point for this frame, following the handheld camera.
const pinned = (key: TrackKey, t: number) => {
  const tr = tracks[key];
  const i = Math.round((t - tr.t0) * tr.fps);
  const p = tr.pts[Math.max(0, Math.min(tr.pts.length - 1, i))];
  return { x: p[0], y: p[1] };
};

const YELLOW = "#F3EC9C";
const SCRAMBLE = 5; // frames for letters to pop in / out in random order

// Text whose letters pop in (from `on`) and out (from `off`) in random order.
const Scrambled: React.FC<{
  text: string;
  on: number;
  off: number;
  seed: string;
}> = ({ text, on, off, seed }) => {
  const f = useCurrentFrame();
  return (
    <>
      {text.split("").map((ch, k) => {
        const a = on + Math.floor(random(`${seed}in${k}`) * SCRAMBLE);
        const b = off + Math.floor(random(`${seed}out${k}`) * SCRAMBLE);
        return (
          <span key={k} style={{ opacity: f >= a && f < b ? 1 : 0 }}>
            {ch}
          </span>
        );
      })}
    </>
  );
};

const Label: React.FC<{ shot: Shot; seed: string }> = ({ shot, seed }) => {
  const f = useCurrentFrame();
  const l = shot.label!;
  const inAt = outFrame(shot, l.at);
  const outAt = shotFrames(shot) - SCRAMBLE;
  if (f < inAt) return null;
  const { x, y } = pinned(l.track, srcTime(shot, f));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        color: YELLOW,
        whiteSpace: "pre",
        textShadow: "0 0 8px rgba(255,236,140,0.35)",
      }}
    >
      <div style={{ fontSize: 42, lineHeight: 1.12 }}>
        {l.name.split("\n").map((line, i) => (
          <div key={i}>
            <Scrambled
              text={line}
              on={inAt}
              off={outAt}
              seed={`${seed}n${i}`}
            />
          </div>
        ))}
      </div>
      <div
        style={{ fontSize: 25, lineHeight: 1.35, marginTop: 14, opacity: 0.92 }}
      >
        {l.ingredients.map((line, i) => (
          <div key={i}>
            <Scrambled
              text={line.toUpperCase()}
              on={inAt + 6 + i * 3}
              off={outAt}
              seed={`${seed}i${i}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Logo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  if (f < 6) return null;
  const { x, y } = pinned(shot.logo!.track, srcTime(shot, f));
  return (
    <Img
      src={staticFile("beat/logo-bianco.png")}
      style={{
        position: "absolute",
        width: 300,
        left: x - 150,
        top: y - 160,
        filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.35))",
      }}
    />
  );
};

const ShotVideo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const fill: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  if (shot.still) return <Img src={staticFile(shot.still.src)} style={fill} />;
  let base = 0;
  return (
    <>
      {shot.parts.map((p, i) => {
        const from = base;
        base += partFrames(p);
        if ("freeze" in p) {
          // freeze frame: a still grabbed from the graded clip
          return (
            <Sequence key={i} from={from} durationInFrames={p.frames}>
              <Img
                src={staticFile(`beat/sushi/${shot.clip}_f${p.freeze}.png`)}
                style={fill}
              />
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={from} durationInFrames={partFrames(p)}>
            <OffthreadVideo
              src={staticFile(`beat/sushi/${shot.clip}.mp4`)}
              startFrom={Math.round(p.from * SUSHI_FPS)}
              playbackRate={p.rate}
              muted
              style={fill}
            />
          </Sequence>
        );
      })}
    </>
  );
};

// Film-style flash: purple flicker, then a warm white burst on the cut.
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const tint = interpolate(f, [-3, -1, 0, 1], [0, 0.28, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burst = interpolate(f, [-1, 0, 1, 3], [0, 0.95, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (tint === 0 && burst === 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(160deg, #5a46d6, #8b3fae 60%, #2a2a8f)",
          mixBlendMode: "screen",
          opacity: tint,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 40% 45%, #fffbe8 0%, #ffd27a 35%, #ff7a1f 70%, rgba(255,90,0,0.6) 100%)",
          mixBlendMode: "screen",
          opacity: burst,
        }}
      />
    </AbsoluteFill>
  );
};

// Small purple flicker as each name appears (as in the reference).
const Flicker: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const o = interpolate(f, [-2, -1, 0, 1], [0, 0.16, 0.06, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o === 0) return null;
  return (
    <AbsoluteFill
      style={{ background: "#6a4fd8", mixBlendMode: "screen", opacity: o }}
    />
  );
};

// Warm horizontal light leak sweeping across the last frames.
const Streak: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const o = interpolate(f, [0, 3, 8], [0, 0.85, 0.6], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, transparent 52%, rgba(255,140,40,0.0) 54%, rgba(255,160,60,0.9) 60%, rgba(255,210,120,0.95) 63%, rgba(255,120,30,0.5) 68%, transparent 74%)",
        mixBlendMode: "screen",
        opacity: o,
        transform: `translateX(${interpolate(f, [0, 10], [-120, 60])}px)`,
      }}
    />
  );
};

export const BeatSushi: React.FC = () => {
  const end = SUSHI_DURATION;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={shotFrames(s)}>
          <ShotVideo shot={s} />
          {s.label ? <Label shot={s} seed={`l${i}`} /> : null}
          {s.logo ? <Logo shot={s} /> : null}
        </Sequence>
      ))}
      {SHOTS.map((s, i) =>
        s.label ? (
          <Flicker key={`fl${i}`} at={starts[i] + outFrame(s, s.label.at)} />
        ) : null,
      )}
      {starts.slice(1).map((c) => (
        <Flash key={c} at={c} />
      ))}
      <Streak at={end - 9} />
      <Audio
        src={staticFile("beat/sushi/reference2-audio.m4a")}
        volume={(f) =>
          interpolate(f, [end - 12, end], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
