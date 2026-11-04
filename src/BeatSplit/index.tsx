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
  seg: string; // stabilised segment in public/beat/split/stab (starts at its cut)
  frames: number; // output frames
  rate: number;
  pos: string; // object-position inside its half
};

// Every shot is tripod-locked (tools/stabilize_segments.py). Frame counts
// follow the reference cut points (1.83, 3.0, 4.67, 7.58 s); both halves cut
// together.
const TOP: Cut[] = [
  { seg: "t1", frames: 44, rate: 1, pos: "50% 30%" }, // tray arrives
  { seg: "t2", frames: 28, rate: 1, pos: "50% 45%" }, // wine pour
  { seg: "t3", frames: 40, rate: 1, pos: "50% 40%" }, // picks a piece
  { seg: "t4", frames: 70, rate: 0.6, pos: "50% 45%" }, // dipping in soy (slowed)
];
const BOTTOM: Cut[] = [
  { seg: "b1", frames: 44, rate: 1, pos: "50% 38%" }, // rice on nori (C9997)
  { seg: "b2", frames: 28, rate: 1.5, pos: "50% 2%" }, // piping cream (C0005)
  { seg: "b3", frames: 40, rate: 1.6, pos: "50% 2%" }, // honey drizzle (C0005)
  { seg: "b4", frames: 70, rate: 0.85, pos: "50% 55%" }, // rolling (C9997)
];
const SPLIT_END = 182;
// The top shot carries straight on full-frame (no restart), in slow motion.
const HERO_START = Math.round(70 * 0.6); // t4 frames already shown
const HERO = { frames: 24, rate: 0.5 }; // ends as he lifts it, before the bite
const END = { clip: "C0052", from: 12.0, frames: 40, rate: 0.5 } as const;
export const SPLIT_DURATION = SPLIT_END + HERO.frames + END.frames;

const src = (clip: string) => staticFile(`beat/split/${clip}.mp4`);
const stab = (seg: string) => staticFile(`beat/split/stab/${seg}.mp4`);

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
              src={stab(c.seg)}
              playbackRate={c.rate}
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: c.pos,
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
      <OffthreadVideo
        src={stab("t4")}
        startFrom={HERO_START}
        playbackRate={HERO.rate}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
