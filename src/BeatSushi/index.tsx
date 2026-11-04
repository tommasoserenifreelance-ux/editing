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

// Each shot: the clip plays while the tray is set down (`pre`), then freezes
// like a photo once the camera has settled, while name and ingredients
// appear, then carries on (`post`). From the freeze on, the footage is
// tripod-locked (tools/stabilize_segments.py -> public/beat/sushi/stab), so the
// text sits still on screen. `zoom` is the stabiliser's border-hiding zoom,
// applied to `pre` too so the framing doesn't jump at the freeze.
type Shot = {
  clip: string;
  pre?: [number, number]; // source seconds, real time
  freeze: number; // source second of the freeze (= start of the stab clip)
  hold: number; // freeze length, frames
  post: number; // source second the shot cuts at
  zoom: number;
  end?: boolean; // final still with logo
  label?: { name: string; ingredients: string[]; x: number; y: number };
};

// from public/beat/sushi/stab/zooms.json (stabiliser output)
const zooms = { C0012: 1.048, C0014: 1.0928, C0015: 1.0602 };

const SHOTS: Shot[] = [
  {
    clip: "C0012",
    pre: [1.45, 2.6],
    freeze: 2.6,
    hold: 46,
    post: 3.55,
    zoom: zooms.C0012,
    label: {
      name: "DIVINA\nCOMMEDIA",
      ingredients: [
        "Crudo di Fassona",
        "Avocado",
        "Philadelphia",
        "Bacon croccante",
        "Granella di pistacchio",
      ],
      x: 80,
      y: 1420,
    },
  },
  {
    clip: "C0014",
    pre: [0.3, 1.6],
    freeze: 1.6,
    hold: 46,
    post: 2.85,
    zoom: zooms.C0014,
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
      x: 80,
      y: 1600,
    },
  },
  {
    clip: "C0015",
    pre: [0.35, 2.0],
    freeze: 2.0,
    hold: 46,
    post: 2.9,
    zoom: zooms.C0015,
    label: {
      name: "PROMESSI\nSPOSI",
      ingredients: [
        "Crudo di Fassona",
        "Avocado",
        "Philadelphia",
        "Tartufo fresco di stagione",
      ],
      x: 80,
      y: 1320,
    },
  },
  { clip: "C0015", freeze: 3.3, hold: 40, post: 3.3, zoom: 1, end: true },
];

const f24 = (sec: number) => Math.round(sec * SUSHI_FPS);
const preFrames = (s: Shot) => (s.pre ? f24(s.pre[1] - s.pre[0]) : 0);
const postFrames = (s: Shot) => f24(s.post - s.freeze);
const shotFrames = (s: Shot) => preFrames(s) + s.hold + postFrames(s);

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + shotFrames(SHOTS[i - 1])],
  [],
);
export const SUSHI_DURATION =
  starts[starts.length - 1] + shotFrames(SHOTS[SHOTS.length - 1]);

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
  const inAt = preFrames(shot);
  const outAt = shotFrames(shot) - SCRAMBLE;
  if (f < inAt) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: l.x,
        top: l.y,
        fontFamily: mono,
        color: YELLOW,
        whiteSpace: "pre",
        textShadow: "0 1px 6px rgba(0,0,0,0.55), 0 0 8px rgba(255,236,140,0.3)",
      }}
    >
      <div style={{ fontSize: 46, lineHeight: 1.1 }}>
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
      <div style={{ fontSize: 26, lineHeight: 1.35, marginTop: 14 }}>
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

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 6) return null;
  return (
    <Img
      src={staticFile("beat/logo-bianco.png")}
      style={{
        position: "absolute",
        width: 300,
        left: 390,
        top: 1330,
        filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.35))",
      }}
    />
  );
};

const fill: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const ShotVideo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const dir = "beat/sushi";
  if (shot.end) {
    return <Img src={staticFile(`${dir}/stab/C0015_end.png`)} style={fill} />;
  }
  const pre = preFrames(shot);
  return (
    <>
      {shot.pre ? (
        <Sequence durationInFrames={pre}>
          <OffthreadVideo
            src={staticFile(`${dir}/${shot.clip}.mp4`)}
            startFrom={f24(shot.pre[0])}
            muted
            style={{ ...fill, transform: `scale(${shot.zoom})` }}
          />
        </Sequence>
      ) : null}
      <Sequence from={pre} durationInFrames={shot.hold}>
        <Img
          src={staticFile(`${dir}/stab/${shot.clip}_freeze.png`)}
          style={fill}
        />
      </Sequence>
      <Sequence from={pre + shot.hold} durationInFrames={postFrames(shot)}>
        <OffthreadVideo
          src={staticFile(`${dir}/stab/${shot.clip}.mp4`)}
          muted
          style={fill}
        />
      </Sequence>
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

export const BeatSushi: React.FC = () => {
  const end = SUSHI_DURATION;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {SHOTS.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={shotFrames(s)}>
          <ShotVideo shot={s} />
          {s.label ? <Label shot={s} seed={`l${i}`} /> : null}
          {s.end ? <Logo /> : null}
        </Sequence>
      ))}
      {SHOTS.map((s, i) =>
        s.label ? (
          <Flicker key={`fl${i}`} at={starts[i] + preFrames(s)} />
        ) : null,
      )}
      {starts.slice(1).map((c) => (
        <Flash key={c} at={c} />
      ))}
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
