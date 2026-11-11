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

// Edit modelled on the reference: wide master opens and closes (entrance /
// exit), close-up inserts in between, hard cuts on the beat, everything
// slightly slowed down. Music: public/mirror/music (123 BPM, original).
export const MIRROR_FPS = 25;
const BPM = 123;
const BEAT = 60 / BPM;
const SPEED = 0.8;
const beatToFrame = (b: number) => Math.round(b * BEAT * MIRROR_FPS);

type Shot = { clip: string; fromBeat: number; toBeat: number; src: number };

// src = second in the source clip where the shot starts
const SHOTS: Shot[] = [
  { clip: "MIRROR.1.mov", fromBeat: 0, toBeat: 12, src: 0.5 }, // wide: walks in, headphones
  { clip: "MIRROR.1.1.mov", fromBeat: 12, toBeat: 16, src: 23.85 }, // face CU: glasses
  { clip: "MIRROR.1.2.mov", fromBeat: 16, toBeat: 19, src: 1.6 }, // detail: loafers
  { clip: "MIRROR.1.1.mov", fromBeat: 19, toBeat: 22, src: 3.0 }, // CU: hands on the tie
  { clip: "MIRROR.1.3.mov", fromBeat: 22, toBeat: 28, src: 3.0 }, // medium: to camera, collar
  { clip: "MIRROR.1.1.mov", fromBeat: 28, toBeat: 30, src: 10.1 }, // CU: buttoning
  { clip: "MIRROR.1.mov", fromBeat: 30, toBeat: 40, src: 19.25 }, // wide: walks out
];

const END_FRAME = beatToFrame(40); // final hit: fade to black + logo
const FADE_OUT = 10; // frames of picture fade to black before the hit
const LOGO_IN = END_FRAME + 4;
export const MIRROR_DURATION = beatToFrame(40) + Math.round(3.6 * MIRROR_FPS);

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 14, MIRROR_DURATION - LOGO_IN - 12, MIRROR_DURATION - LOGO_IN],
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
          const from = beatToFrame(s.fromBeat);
          const dur = beatToFrame(s.toBeat) - from;
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
      <Audio src={staticFile("mirror/music/mirror_track.wav")} />
    </AbsoluteFill>
  );
};
