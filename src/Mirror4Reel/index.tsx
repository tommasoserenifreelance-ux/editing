import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// MIRROR 4 - cut like reference 4 (public/mirror/music/reference_track_4.wav
// = its audio + reverb tail): one wide, jump cuts of him going through the
// sheets and letting them fly, on the reference's cut grid (0.32, 0.56,
// 0.76, 2.16, 3.60, 4.56, 5.96, 6.88, 7.84 s). The track (~127 BPM) has a
// stop every 4 beats; hits after the stops at 9.25, 11.15, 13.05 s.
// No shot where he is talking (lip tracking on the source); the selects show
// him mostly tossing sheets away, a couple of him reading.
// Ending = MIRROR.4.1 reworked: he throws the whole stack in the air on the
// 9.25 s hit, the camera's own tilt down to the floor sped up into a slider
// move (peak 3.5x, motion blur, whoosh, music dipped under it), lands on the
// sheets, cut to him standing up (sway smoothed) and walking out, empty room,
// black + logo as the song closes (~14.3 s).
// Sources (scripts/mirror4_build.py, all sharpened): a = the 13 jump-cut
// selects back to back (extra cuts on the 1.68 / 3.09 / 5.47 s beats so
// most shots land on a toss), b = the reworked ending. 24 fps.
export const MIRROR4_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR4_FPS);

const SELECTS_END = 217; // 9.04 s: cut to the ending (sheets fly on 9.25 s)
const WHOOSH_AT = SELECTS_END + 18; // slider move starts
const B_LEN = 114;
const END_FRAME = 343; // 14.3 s: black as the song closes
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR4_DURATION = END_FRAME + f(3.1);

const SHOTS = [
  { clip: "a", from: 0, to: SELECTS_END },
  { clip: "b", from: SELECTS_END, to: SELECTS_END + B_LEN },
];

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const len = MIRROR4_DURATION - LOGO_IN;
  const opacity = interpolate(frame, [0, 12, len - 15, len], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, len], [0.96, 1.02], {
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <Img
        src={staticFile("mirror/logo.svg")}
        style={{ width: 900, transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

export const Mirror4Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {SHOTS.map((s) => (
          <Sequence key={s.clip} from={s.from} durationInFrames={s.to - s.from}>
            <OffthreadVideo
              src={staticFile(`mirror/MIRROR.4_${s.clip}_sharp.mp4`)}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        ))}
        {/* empty room: hold its last frame into the fade */}
        <Sequence
          from={SELECTS_END + B_LEN}
          durationInFrames={END_FRAME - SELECTS_END - B_LEN}
        >
          <Freeze frame={B_LEN - 1}>
            <OffthreadVideo
              src={staticFile("mirror/MIRROR.4_b_sharp.mp4")}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Freeze>
        </Sequence>
      </AbsoluteFill>
      <Sequence from={WHOOSH_AT - 3}>
        <Audio src={staticFile("mirror/music/whoosh.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio
        src={staticFile("mirror/music/reference_track_4.wav")}
        // dip the music under the whoosh so the slider reads
        volume={(fr) =>
          interpolate(
            fr,
            [WHOOSH_AT - 4, WHOOSH_AT, WHOOSH_AT + 14, WHOOSH_AT + 20],
            [1, 0.55, 0.55, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
