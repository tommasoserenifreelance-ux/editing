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

type Shot = { clip: string; from: number; to: number; src: number };

// from/to = seconds in the edit, src = second in the source clip
const SHOTS: Shot[] = [
  // wide: walks in, grabs the headphones on the 1.93 s hit, then the glasses
  { clip: "MIRROR.1.mov", from: 0, to: 5.83, src: 0.71 },
  // face CU: glasses land on the 6.81 s accent
  { clip: "MIRROR.1.1.mov", from: 5.83, to: 7.78, src: 24.12 },
  // detail: loafers
  { clip: "MIRROR.1.2.mov", from: 7.78, to: 8.75, src: 1.5 },
  // CU: tattooed hands on the tie
  { clip: "MIRROR.1.1.mov", from: 8.75, to: 9.74, src: 3.0 },
  // medium (after the camera rise): buttons the collar
  { clip: "MIRROR.1.3.mov", from: 9.74, to: 11.69, src: 4.0 },
  // wide: walks out, room empty on the final 14.62 s accent
  { clip: "MIRROR.1.mov", from: 11.69, to: 14.85, src: 20.65 },
];

const END_FRAME = f(14.85); // picture fully black
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
                playbackRate={SPEED}
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
