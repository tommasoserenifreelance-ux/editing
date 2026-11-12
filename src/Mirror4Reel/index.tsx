import {
  AbsoluteFill,
  Audio,
  Easing,
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
// Extra beat shot for this one: he throws the whole stack in the air on the
// 9.25 s hit, the camera slides down with the falling sheets (speed ramp:
// 1x throw -> 3x fall with motion blur -> eases to ~0.08x and settles on the
// sheets on the floor), cut on 11.15 s to him standing up and walking out,
// empty room, black + logo as the song closes (~14.3 s).
// Sources (scripts/mirror4_build.py, all with the MIRROR 2 sharpening):
// a = the 10 jump-cut selects back to back, ramp = MIRROR.4 frames
// 1985-2037 retimed, c = frames 2038-2112. 24 fps, 1x except the ramp.
export const MIRROR4_FPS = 24;
const f = (sec: number) => Math.round(sec * MIRROR4_FPS);

const SELECTS_END = 219; // 9.125 s: last select runs straight into the ramp
const RAMP_END = 268; // 11.15 s hit (49 retimed frames)
const END_FRAME = 343; // 14.3 s: black as the song closes
const FADE_OUT = 9;
const LOGO_IN = END_FRAME;
export const MIRROR4_DURATION = END_FRAME + f(3.1);

const SHOTS = [
  { clip: "a", from: 0, to: SELECTS_END },
  { clip: "ramp", from: SELECTS_END, to: RAMP_END },
  { clip: "c", from: RAMP_END, to: END_FRAME },
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
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio src={staticFile("mirror/music/reference_track_4.wav")} />
    </AbsoluteFill>
  );
};
