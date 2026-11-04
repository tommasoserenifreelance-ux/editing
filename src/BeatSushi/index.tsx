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

type Shot = {
  clip: string; // graded clip in public/beat/sushi
  from: number; // source seconds
  frames: number; // output frames
  rate: number;
  label?: { text: string; at: number; track: TrackKey }; // `at` = source s
  logo?: { at: number; track: TrackKey };
};

const SHOTS: Shot[] = [
  {
    clip: "C0012",
    from: 1.2,
    frames: 63,
    rate: 1,
    label: { text: "DIVINA\nCOMMEDIA", at: 1.9, track: "C0012" },
  },
  {
    clip: "C0014",
    from: 0.25,
    frames: 66,
    rate: 1,
    label: { text: "GATTOPARDO", at: 0.95, track: "C0014" },
  },
  {
    clip: "C0015",
    from: 0.3,
    frames: 46,
    rate: 1,
    label: { text: "PROMESSI\nSPOSI", at: 1.05, track: "C0015" },
  },
  {
    clip: "C0015",
    from: 2.2,
    frames: 37,
    rate: 0.75,
    logo: { at: 2.2, track: "C0015_logo" },
  },
];

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].frames],
  [],
);
export const SUSHI_DURATION =
  starts[starts.length - 1] + SHOTS[SHOTS.length - 1].frames;

const srcTime = (s: Shot, f: number) => s.from + (f / SUSHI_FPS) * s.rate;

// Table point for this frame, following the handheld camera.
const pinned = (key: TrackKey, t: number) => {
  const tr = tracks[key];
  const i = Math.round((t - tr.t0) * tr.fps);
  const p = tr.pts[Math.max(0, Math.min(tr.pts.length - 1, i))];
  return { x: p[0], y: p[1] };
};

const YELLOW = "#F3EC9C";
const SCRAMBLE = 5; // frames for letters to pop in / out in random order

const Label: React.FC<{ shot: Shot; seed: string }> = ({ shot, seed }) => {
  const f = useCurrentFrame();
  const l = shot.label!;
  const inAt = Math.round(((l.at - shot.from) / shot.rate) * SUSHI_FPS);
  const outAt = shot.frames - SCRAMBLE;
  if (f < inAt) return null;
  const { x, y } = pinned(l.track, srcTime(shot, f));
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: mono,
        fontSize: 42,
        lineHeight: 1.12,
        color: YELLOW,
        whiteSpace: "pre",
        textShadow: "0 0 8px rgba(255,236,140,0.35)",
      }}
    >
      {l.text.split("\n").map((line, li) => (
        <div key={li}>
          {line.split("").map((ch) => {
            const k = n++;
            const on = inAt + Math.floor(random(`${seed}in${k}`) * SCRAMBLE);
            const off = outAt + Math.floor(random(`${seed}out${k}`) * SCRAMBLE);
            const visible = f >= on && f < off;
            return (
              <span key={k} style={{ opacity: visible ? 1 : 0 }}>
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Logo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at =
    Math.round(((shot.logo!.at - shot.from) / shot.rate) * SUSHI_FPS) + 6;
  if (f < at) return null;
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
        <Sequence key={i} from={starts[i]} durationInFrames={s.frames}>
          <OffthreadVideo
            src={staticFile(`beat/sushi/${s.clip}.mp4`)}
            startFrom={Math.round(s.from * SUSHI_FPS)}
            playbackRate={s.rate}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {s.label ? <Label shot={s} seed={`l${i}`} /> : null}
          {s.logo ? <Logo shot={s} /> : null}
        </Sequence>
      ))}
      {SHOTS.map((s, i) =>
        s.label ? (
          <Flicker
            key={`fl${i}`}
            at={
              starts[i] +
              Math.round(((s.label.at - s.from) / s.rate) * SUSHI_FPS)
            }
          />
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
