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
// Extra shot for this one, one continuous move on the real camera: locked
// off (handheld drift removed, him centred) he throws the whole stack in the
// air on the 9.25 s hit, then the camera's own tilt down to the floor, sped
// up (peak ~4.5x, motion blur, whoosh) with the subject kept centred, landing
// on the sheets on the floor. No slow motion. Cut on the 10.17 s beat to him
// standing up and walking out, empty room, black + logo as the song closes.
// Sources (scripts/mirror4_build.py, all sharpened):
// a = the 10 jump-cut selects back to back, ramp = MIRROR.4 1970-2037
// stabilised and retimed, c = frames 2038-2114. 24 fps.
export const MIRROR4_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR4_FPS);

const SELECTS_END = 204; // 8.5 s: cut to the locked-off wide (throw on 9.25 s)
const WHOOSH_AT = SELECTS_END + 26; // camera starts moving down (9.58 s)
const RAMP_END = SELECTS_END + 40; // 10.17 s beat: cut to him standing up
const C_LEN = 77;
const END_FRAME = 343; // 14.3 s: black as the song closes
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR4_DURATION = END_FRAME + f(3.1);

const SHOTS = [
  { clip: "a", from: 0, to: SELECTS_END },
  { clip: "ramp", from: SELECTS_END, to: RAMP_END },
  { clip: "c", from: RAMP_END, to: RAMP_END + C_LEN },
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
          from={RAMP_END + C_LEN}
          durationInFrames={END_FRAME - RAMP_END - C_LEN}
        >
          <Freeze frame={C_LEN - 1}>
            <OffthreadVideo
              src={staticFile("mirror/MIRROR.4_c_sharp.mp4")}
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
            [WHOOSH_AT - 4, WHOOSH_AT, WHOOSH_AT + 12, WHOOSH_AT + 20],
            [1, 0.55, 0.55, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
