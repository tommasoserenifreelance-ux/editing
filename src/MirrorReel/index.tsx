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

// Edit synced to the reference track (public/mirror/music/reference_track.wav).
// The track has a hit every 0.49 s and a short pause + accent every 2 bars
// (2.90, 6.81, 10.72, 14.62 s): gestures and cuts are locked to those hits.
// Wide master opens/closes, close-up inserts in between, all at 0.8x.
export const MIRROR_FPS = 25;
const SPEED = 0.8;
const f = (sec: number) => Math.round(sec * MIRROR_FPS);

type Shot = {
  clip: string;
  from: number;
  to: number;
  src: number;
  speed?: number;
};

// from/to = seconds in the edit, src = second in the source clip
const SHOTS: Shot[] = [
  // wide: walks in, grabs the headphones on the 1.93 s hit; cut before the glasses
  { clip: "MIRROR.1.mov", from: 0, to: 4.86, src: 0.71 },
  // face CU: puts on the glasses (slower), they land on the 6.32 s hit
  { clip: "MIRROR.1.1.mov", from: 4.86, to: 7.29, src: 23.92, speed: 0.671 },
  // detail: loafers, foot move kept whole
  { clip: "MIRROR.1.2.mov", from: 7.29, to: 9.74, src: 1.5 },
  // CU: tattooed hands on the tie
  { clip: "MIRROR.1.1.mov", from: 9.74, to: 10.72, src: 3.0 },
  // wide: both hands on the headphones, from the 10.72 s accent
  { clip: "MIRROR.1.mov", from: 10.72, to: 12.67, src: 17.65 },
  // CU: buttoning
  { clip: "MIRROR.1.1.mov", from: 12.67, to: 13.64, src: 10.1 },
  // wide: walks out, room empty, fade to black
  { clip: "MIRROR.1.mov", from: 13.64, to: 15.3, src: 21.4 },
];

const END_FRAME = f(15.3); // picture fully black
const FADE_OUT = f(0.4);
const LOGO_IN = END_FRAME;
export const MIRROR_DURATION = f(18.44);

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 12, MIRROR_DURATION - LOGO_IN - 15, MIRROR_DURATION - LOGO_IN],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(frame, [0, MIRROR_DURATION - LOGO_IN], [0.96, 1.02], {
    easing: Easing.out(Easing.quad),
  });
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <Img
        src={staticFile("mirror/logo.jpg")}
        style={{ width: 900, transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

export const MirrorReel: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [END_FRAME - FADE_OUT, END_FRAME], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {SHOTS.map((s, i) => {
          const from = f(s.from);
          const dur = f(s.to) - from;
          return (
            <Sequence key={i} from={from} durationInFrames={dur}>
              <OffthreadVideo
                src={staticFile(`mirror/${s.clip}`)}
                trimBefore={Math.round(s.src * MIRROR_FPS)}
                playbackRate={s.speed ?? SPEED}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Sequence from={LOGO_IN}>
        <Logo />
      </Sequence>
      <Audio src={staticFile("mirror/music/reference_track.wav")} />
    </AbsoluteFill>
  );
};
