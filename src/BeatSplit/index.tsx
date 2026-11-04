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

// Split-screen reel modelled on the third reference: top half "YOU ENJOY"
// (service, wine, eating), bottom half "WE MAKE" (sushi being made), cut on
// the reference's beats; then one full-frame slow-motion hero shot and the
// logo. Clips are graded copies in public/beat/split. 24 fps vertical.
export const SPLIT_FPS = 24;

const mono = "Space Mono";
const handle = delayRender("Loading Space Mono");
new FontFace(
  mono,
  `url(${staticFile("fonts/space-mono-latin-400-normal.woff2")})`,
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

type Cut = {
  clip: "C0052" | "C9997";
  from: number; // source seconds
  frames: number; // output frames
  rate: number;
  y: number; // vertical crop (object-position %) inside its half
};

// Frame counts follow the reference cut points (1.83, 3.0, 4.67, 7.58 s).
const TOP: Cut[] = [
  { clip: "C0052", from: 6.6, frames: 44, rate: 1, y: 30 }, // tray arrives
  { clip: "C0052", from: 17.6, frames: 28, rate: 1, y: 45 }, // wine pour
  { clip: "C0052", from: 31.0, frames: 40, rate: 1, y: 40 }, // picks a piece
  { clip: "C0052", from: 33.4, frames: 70, rate: 1.3, y: 45 }, // soy, eats
];
const BOTTOM: Cut[] = [
  { clip: "C9997", from: 9.0, frames: 72, rate: 1, y: 38 }, // rice on nori
  { clip: "C9997", from: 15.0, frames: 40, rate: 1, y: 40 }, // pressing rice
  { clip: "C9997", from: 33.0, frames: 70, rate: 1, y: 55 }, // rolling
];
const SPLIT_END = 182;
const HERO = { clip: "C0052", from: 32.1, frames: 19, rate: 0.5 } as const;
const END = { clip: "C0052", from: 12.0, frames: 45, rate: 0.5 } as const;
export const SPLIT_DURATION = SPLIT_END + HERO.frames + END.frames;

const src = (clip: string) => staticFile(`beat/split/${clip}.mp4`);

const Half: React.FC<{ cuts: Cut[]; top: boolean; label: string }> = ({
  cuts,
  top,
  label,
}) => {
  let at = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        height: 960,
        top: top ? 0 : 960,
        overflow: "hidden",
      }}
    >
      {cuts.map((c, i) => {
        const from = at;
        at += c.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={c.frames}>
            <OffthreadVideo
              src={src(c.clip)}
              startFrom={Math.round(c.from * SPLIT_FPS)}
              playbackRate={c.rate}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `50% ${c.y}%`,
              }}
            />
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: top ? 470 : 500,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 54,
          letterSpacing: 4,
          color: "white",
          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Full: React.FC<{
  clip: string;
  from: number;
  rate: number;
  style?: React.CSSProperties;
}> = ({ clip, from, rate, style }) => (
  <OffthreadVideo
    src={src(clip)}
    startFrom={Math.round(from * SPLIT_FPS)}
    playbackRate={rate}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <Img
        src={staticFile("beat/logo-bianco.png")}
        style={{
          width: 340,
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
        }}
      />
    </AbsoluteFill>
  );
};

export const BeatSplit: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <Sequence durationInFrames={SPLIT_END}>
      <Half cuts={TOP} top label="YOU ENJOY" />
      <Half cuts={BOTTOM} top={false} label="WE MAKE" />
    </Sequence>
    <Sequence from={SPLIT_END} durationInFrames={HERO.frames}>
      {/* punch in on the piece being lifted */}
      <Full
        {...HERO}
        style={{ transform: "scale(1.7)", transformOrigin: "33% 36%" }}
      />
    </Sequence>
    <Sequence from={SPLIT_END + HERO.frames} durationInFrames={END.frames}>
      <Full
        {...END}
        style={{
          filter: "blur(7px) brightness(0.85)",
          transform: "scale(1.04)",
        }}
      />
      <Logo />
    </Sequence>
    <Audio src={staticFile("beat/split/reference3-audio.m4a")} />
  </AbsoluteFill>
);
