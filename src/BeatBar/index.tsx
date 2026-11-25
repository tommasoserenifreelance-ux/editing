import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";

// Bar montage modelled on the third reference: 17 quick shots (~0.5 s) of
// drinks being made, cut exactly on the reference's cut frames, then a 2 s
// closing shot of the guests toasting. No text, client's own grade, reference music.
// Clip: public/beat/bar/bar.mp4 (beat.ref.3), 24 fps like the reference.
export const BAR_FPS = 24;

const SRC = staticFile("beat/bar/bar.mp4");

// frames = shot length, measured on the reference (cuts at frames 19, 30,
// 42, 58, 69, 79, 93, 105, 117, 131, 147, 162, 176, 195, 209, 222, 244).
// In story order: yellow cocktail, spritz, red wine, then the guests. The
// guests' shots are smooth-stabilised segments (tools/stabilize_smooth.py ->
// public/beat/bar/stab), `seg` set; the others play from the clip.
type Shot = { from: number; rate: number; frames: number; seg?: string };
const SHOTS: Shot[] = [
  { from: 0.5, rate: 1, frames: 19 }, // yellow: first pour
  { from: 2.3, rate: 1, frames: 11 }, // pouring
  { from: 4.0, rate: 1, frames: 12 }, // filling up
  { from: 6.1, rate: 0.8, frames: 16 }, // last drops, peel
  { from: 8.0, rate: 1, frames: 11 }, // finished tumbler
  { from: 12.6, rate: 0.8, frames: 24 }, // spritz: prosecco poured, held longer
  { from: 18.1, rate: 1, frames: 12 }, // orange slice
  { from: 20.2, rate: 1, frames: 12 }, // straw in
  { from: 28.2, rate: 1, frames: 14 }, // the finished spritz
  { from: 36.8, rate: 0.7, frames: 16 }, // red wine pour
  { from: 39.2, rate: 0.8, frames: 15 }, // glass filling
  { from: 42.2, rate: 1, frames: 14 }, // bottle away
  { from: 0, rate: 1, frames: 19, seg: "g1" }, // guests: two friends, wine
  { from: 0, rate: 1, frames: 14, seg: "g2" }, // the group at the bar
  // one continuous shot: two cuts on the same framing read as a jump
  { from: 0, rate: 1, frames: 35, seg: "g3" }, // drinking, laughing
  { from: 0, rate: 1, frames: 48, seg: "hero" }, // the cheers, to the end
];

const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SHOTS[i - 1].frames],
  [],
);
export const BAR_DURATION =
  starts[starts.length - 1] + SHOTS[SHOTS.length - 1].frames; // 292

export const BeatBar: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={s.frames}>
        <OffthreadVideo
          src={s.seg ? staticFile(`beat/bar/stab/${s.seg}.mp4`) : SRC}
          startFrom={Math.round(s.from * BAR_FPS)}
          playbackRate={s.rate}
          muted
          style={{ width: "100%", height: "100%" }}
        />
      </Sequence>
    ))}
    <Audio src={staticFile("beat/bar/ref-audio.m4a")} />
  </AbsoluteFill>
);
