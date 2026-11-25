import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
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

const sans = "Jost"; // Futura-like, as in the reference
const handle = delayRender("Loading Jost");
new FontFace(sans, `url(${staticFile("fonts/jost-latin-500-normal.woff2")})`, {
  weight: "500",
})
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

const SRC = staticFile("beat/plates/plates.mp4");
const CLIP_FPS = tracks.fps; // 24

// Timeline (output frames at 30 fps), matched to the reference: plates
// alone for 0.2 s, hands hover in slow motion while the names appear, the
// plates are whisked away in ~0.6 s, a beat of empty marble at the end.
const HOLD = 6; // first frame, no hands yet
const SLOW = { from: 0, to: 0.85, frames: 142 }; // hands come in, plates still
const PULL = { from: 0.85, to: 1.8, frames: 18 }; // plates taken away, sped up
const TAIL = { from: 1.8, to: 2.1, frames: 11 }; // empty marble
const rate = (p: { from: number; to: number; frames: number }) =>
  ((p.to - p.from) * PLATES_FPS) / p.frames;
const T_SLOW = HOLD;
const T_PULL = T_SLOW + SLOW.frames;
const T_TAIL = T_PULL + PULL.frames;
export const PLATES_DURATION = T_TAIL + TAIL.frames; // 177 = 5.9 s

// Output frame -> clip seconds.
const clipTime = (f: number) => {
  const seg = (p: typeof SLOW, t0: number) =>
    p.from + ((f - t0) / p.frames) * (p.to - p.from);
  if (f < T_SLOW) return 0;
  if (f < T_PULL) return seg(SLOW, T_SLOW);
  if (f < T_TAIL) return seg(PULL, T_PULL);
  return seg(TAIL, T_TAIL);
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

// Offsets from the dish centre (px, 1080x1920 frame). As in the reference
// the names appear bottom to top, one every 0.4 s from 1.2 s, alternating
// left and right of the plates, with a hard cut (no animation).
const LABELS: Label[] = [
  {
    key: "tartare",
    text: "Tris di tartare di Beat",
    dx: -280,
    dy: 270,
    at: 36,
  },
  {
    key: "carpaccio",
    text: "Carpaccio di black Angus",
    dx: 430,
    dy: 190,
    at: 48,
    align: "right",
  },
  { key: "montanarine", text: "Montanarine fritte", dx: -510, dy: 150, at: 60 },
  {
    key: "uovo",
    text: "L’uovo perfetto",
    dx: 440,
    dy: 95,
    at: 72,
    align: "right",
  },
];

const LabelView: React.FC<{ l: Label }> = ({ l }) => {
  const f = useCurrentFrame();
  if (f < l.at) return null;
  const pts = tracks.pts[l.key];
  const i = Math.min(pts.length - 1, Math.round(clipTime(f) * CLIP_FPS));
  const [x, y] = pts[i];
  return (
    <div
      style={{
        position: "absolute",
        left: x + l.dx,
        top: y + l.dy,
        transform: l.align === "right" ? "translateX(-100%)" : undefined,
        fontFamily: sans,
        fontWeight: 500,
        fontSize: 54,
        color: "#a3191b",
        whiteSpace: "nowrap",
      }}
    >
      {l.text}
    </div>
  );
};

const full: React.CSSProperties = { width: "100%", height: "100%" };

export const BeatPlates: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <Sequence durationInFrames={HOLD}>
      <Img src={staticFile("beat/plates/first.png")} style={full} />
    </Sequence>
    {[
      [SLOW, T_SLOW],
      [PULL, T_PULL],
      [TAIL, T_TAIL],
    ].map(([p, t0]) => {
      const seg = p as typeof SLOW;
      return (
        <Sequence
          key={t0 as number}
          from={t0 as number}
          durationInFrames={seg.frames}
        >
          <OffthreadVideo
            src={SRC}
            startFrom={Math.round(seg.from * PLATES_FPS)}
            playbackRate={rate(seg)}
            muted
            style={full}
          />
        </Sequence>
      );
    })}
    {LABELS.map((l) => (
      <LabelView key={l.key} l={l} />
    ))}
    <Audio src={staticFile("beat/plates/ref-audio.m4a")} />
  </AbsoluteFill>
);
