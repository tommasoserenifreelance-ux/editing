import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import tracks from "./tracks.json";

// Overhead "named plates" reel modelled on the second reference: the four
// dishes on the marble, the waiters' hands come in slowly, each dish gets its
// name, then the plates are taken away and the labels leave with them.
// Same music as the reference. Clip: public/beat/plates (client's grade).
export const PLATES_FPS = 30;

const sans = "Montserrat";
const handle = delayRender("Loading Montserrat");
new FontFace(
  sans,
  `url(${staticFile("fonts/montserrat-latin-700-normal.woff2")})`,
  {
    weight: "700",
  },
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

const SRC = staticFile("beat/plates/plates.mp4");
const CLIP_FPS = tracks.fps; // 24

// Timeline (output frames at 30 fps):
const HOLD = 30; // first frame held (no hands yet)
const SLOW = { from: 0, to: 0.85, rate: 0.3 }; // hands come in, plates still
const SLOW_F = Math.round(((SLOW.to - SLOW.from) / SLOW.rate) * PLATES_FPS); // 85
const PULL = { from: 0.85, to: 2.875 }; // plates taken away, real speed
const PULL_F = Math.round((PULL.to - PULL.from) * PLATES_FPS); // 61
export const PLATES_DURATION = HOLD + SLOW_F + PULL_F; // 176 = 5.87 s

// Output frame -> clip seconds.
const clipTime = (f: number) => {
  if (f < HOLD) return 0;
  if (f < HOLD + SLOW_F)
    return SLOW.from + ((f - HOLD) / PLATES_FPS) * SLOW.rate;
  return PULL.from + (f - HOLD - SLOW_F) / PLATES_FPS;
};

type Key = keyof typeof tracks.pts;
type Label = {
  key: Key;
  text: string;
  dx: number;
  dy: number;
  at: number;
  align?: "right";
};

// Offsets from the dish centre (px, 1080x1920 frame); `at` = output frame the
// name pops in (the reference names one dish at a time).
const LABELS: Label[] = [
  {
    key: "tartare",
    text: "Tris di tartare di Beat",
    dx: -350,
    dy: 290,
    at: 44,
  },
  {
    key: "carpaccio",
    text: "Carpaccio di black Angus",
    dx: -470,
    dy: 175,
    at: 58,
  },
  { key: "montanarine", text: "Montanarine fritte", dx: -220, dy: 165, at: 72 },
  {
    key: "uovo",
    text: "L’uovo perfetto",
    dx: -175,
    dy: 160,
    at: 86,
  },
];

const LabelView: React.FC<{ l: Label }> = ({ l }) => {
  const f = useCurrentFrame();
  if (f < l.at) return null;
  const pts = tracks.pts[l.key];
  const i = Math.min(pts.length - 1, Math.round(clipTime(f) * CLIP_FPS));
  const [x, y] = pts[i];
  const pop = interpolate(f - l.at, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x + l.dx,
        top: y + l.dy,
        transform: `translateX(${l.align === "right" ? "-100%" : "0"}) scale(${0.85 + 0.15 * pop})`,
        transformOrigin: l.align === "right" ? "right center" : "left center",
        opacity: pop,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 50,
        color: "#b8201b",
        whiteSpace: "nowrap",
        textShadow: "0 1px 10px rgba(255,255,255,0.35)",
      }}
    >
      {l.text}
    </div>
  );
};

export const BeatPlates: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <Sequence durationInFrames={HOLD}>
      <Img
        src={staticFile("beat/plates/first.png")}
        style={{ width: "100%", height: "100%" }}
      />
    </Sequence>
    <Sequence from={HOLD} durationInFrames={SLOW_F}>
      <OffthreadVideo
        src={SRC}
        playbackRate={SLOW.rate}
        muted
        style={{ width: "100%", height: "100%" }}
      />
    </Sequence>
    <Sequence from={HOLD + SLOW_F} durationInFrames={PULL_F}>
      <OffthreadVideo
        src={SRC}
        startFrom={Math.round(PULL.from * PLATES_FPS)}
        muted
        style={{ width: "100%", height: "100%" }}
      />
    </Sequence>
    {LABELS.map((l) => (
      <LabelView key={l.key} l={l} />
    ))}
    <Audio src={staticFile("beat/plates/ref-audio.m4a")} />
  </AbsoluteFill>
);
