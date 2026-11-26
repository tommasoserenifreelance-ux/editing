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
import { EndLogo, endTailFrames, endVolume } from "../BeatShared/EndLogo";
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

// Timeline (output frames at 30 fps), measured on the reference: the clip
// plays while the hands come in, FREEZES once the hands are on the plates
// (the names appear on the still), then plays on as the plates are taken away
// (reference: 12 frames in, 100 frames still, 60 frames out).
const FREEZE_AT = 0.75; // clip seconds: hands on the plates, nothing moved yet
const IN = { from: 0, to: FREEZE_AT, frames: 22 }; // real time
const FREEZE = 101; // frames (3.4 s), like the reference
// plays to 2.5 s: the tartare plate only clears the bottom-left edge at 2.17 s
const OUT = { from: FREEZE_AT, to: 2.5, frames: 54 }; // ~0.97x, ends on empty marble
const rate = (p: { from: number; to: number; frames: number }) =>
  ((p.to - p.from) * PLATES_FPS) / p.frames;
const T_FREEZE = IN.frames;
const T_OUT = T_FREEZE + FREEZE;
export const PLATES_DURATION = T_OUT + OUT.frames; // 177 = 5.9 s

// Output frame -> clip seconds.
const clipTime = (f: number) => {
  if (f < T_FREEZE) return (f / IN.frames) * IN.to;
  if (f < T_OUT) return FREEZE_AT;
  return OUT.from + ((f - T_OUT) / OUT.frames) * (OUT.to - OUT.from);
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
// the names appear bottom to top, one every 0.4 s, alternating
// left and right of the plates, with a hard cut (no animation), starting
// 0.8 s into the freeze like the reference.
const LABELS: Label[] = [
  {
    key: "tartare",
    text: "Tris di tartare di Beat",
    dx: -280,
    dy: 270,
    at: 46,
  },
  {
    key: "carpaccio",
    text: "Carpaccio di black Angus",
    dx: 430,
    dy: 190,
    at: 58,
    align: "right",
  },
  { key: "montanarine", text: "Montanarine fritte", dx: -510, dy: 150, at: 70 },
  {
    key: "uovo",
    text: "L’uovo perfetto",
    dx: 440,
    dy: 95,
    at: 82,
    align: "right",
  },
];

const LabelView: React.FC<{ l: Label }> = ({ l }) => {
  const f = useCurrentFrame();
  // names only on the still: gone as soon as the plates start moving
  if (f < l.at || f >= T_OUT) return null;
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

// edit + fade to black + Beat logo on black
export const PLATES_TOTAL = PLATES_DURATION + endTailFrames(PLATES_FPS);

export const BeatPlates: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <Sequence durationInFrames={IN.frames}>
      <OffthreadVideo src={SRC} playbackRate={rate(IN)} muted style={full} />
    </Sequence>
    <Sequence from={T_FREEZE} durationInFrames={FREEZE}>
      <Img src={staticFile("beat/plates/freeze.png")} style={full} />
    </Sequence>
    <Sequence from={T_OUT} durationInFrames={OUT.frames}>
      <OffthreadVideo
        src={SRC}
        startFrom={Math.round(OUT.from * PLATES_FPS)}
        playbackRate={rate(OUT)}
        muted
        style={full}
      />
    </Sequence>
    {LABELS.map((l) => (
      <LabelView key={l.key} l={l} />
    ))}
    <EndLogo at={PLATES_DURATION} />
    <Audio
      src={staticFile("beat/plates/ref-audio.m4a")}
      volume={endVolume(PLATES_TOTAL, PLATES_FPS)}
    />
  </AbsoluteFill>
);
