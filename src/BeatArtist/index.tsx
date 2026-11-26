import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { EndLogo, endTailFrames, endVolume } from "../BeatShared/EndLogo";

// Split-screen reel modelled on the "the artist / the art" reference:
// top half the chef at work, bottom half the dishes, both halves cutting
// together on the reference's beats (30 fps: 1.33, 2.67, 3.97, 5.3, 6.23,
// 7.93 s), then one full-frame close-up and the Beat menu as the logo shot.
// Same music as the reference. Clips: public/beat/artist, already graded by
// the client (copied as-is, no grade applied here).
export const ARTIST_FPS = 30;

const serif = "Cormorant Garamond";
const handle = delayRender("Loading Cormorant");
new FontFace(
  serif,
  `url(${staticFile("fonts/cormorant-garamond-latin-500-normal.woff2")})`,
  { weight: "500" },
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

const CHEF = staticFile("beat/artist/chef.mp4");
const DISHES = staticFile("beat/artist/dishes.mp4");

// from = source seconds, rate = playback rate, zoom = punch-in,
// pos = object-position inside the half (x% y%).
type Cut = {
  from: number;
  rate: number;
  zoom: number;
  pos: string;
  origin?: string;
};

const SPLIT = [40, 40, 39, 40, 28, 51]; // frames per beat, both halves
const TOP: Cut[] = [
  { from: 0.2, rate: 1, zoom: 1, pos: "50% 30%" }, // chef front, cutting
  { from: 4.0, rate: 1, zoom: 1, pos: "50% 28%" }, // cap, head down
  { from: 2.3, rate: 1, zoom: 1.15, pos: "50% 30%", origin: "50% 30%" }, // front, closer
  { from: 6.2, rate: 1, zoom: 1, pos: "50% 32%" }, // side angle
  { from: 1.53, rate: 0.8, zoom: 1.3, pos: "50% 30%", origin: "45% 28%" }, // face close
  { from: 8.5, rate: 1, zoom: 1.1, pos: "50% 34%", origin: "50% 35%" }, // side, working
];
// Dishes: each plate appears once only, slowed down so the hand setting it
// down is seen calmly. Whole and centred in the half (no punch-in):
// object-position y = (dish centre in frame - 0.25) / 0.5. The bottom half
// cuts on the reference beats at 119 and 187 frames.
const BOTTOM: (Cut & { frames: number })[] = [
  { from: 0.65, rate: 0.55, zoom: 1, pos: "50% 56%", frames: 119 }, // tartare
  { from: 3.3, rate: 0.6, zoom: 1, pos: "50% 50%", frames: 68 }, // bowl
  { from: 5.0, rate: 0.65, zoom: 1, pos: "50% 34%", frames: 51 }, // montanarine
];
const SPLIT_END = SPLIT.reduce((a, b) => a + b, 0); // 238
// Carpaccio, the fourth dish, gets the full-frame shot (only appearance).
const HERO = { frames: 36, from: 6.5, rate: 0.85, zoom: 1 };
const LOGO = { frames: 41, from: 11.18, rate: 0.6 }; // the Beat menu
export const ARTIST_DURATION = SPLIT_END + HERO.frames + LOGO.frames;

const Clip: React.FC<{ src: string; c: Cut }> = ({ src, c }) => (
  <OffthreadVideo
    src={src}
    startFrom={Math.round(c.from * ARTIST_FPS)}
    playbackRate={c.rate}
    muted
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: c.pos,
      transform: `scale(${c.zoom})`,
      transformOrigin: c.origin ?? c.pos,
    }}
  />
);

const Half: React.FC<{
  src: string;
  cuts: (Cut & { frames?: number })[];
  top: boolean;
}> = ({ src, cuts, top }) => {
  let at = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: top ? 0 : 960,
        width: 1080,
        height: 960,
        overflow: "hidden",
      }}
    >
      {cuts.map((c, i) => {
        const from = at;
        const len = c.frames ?? SPLIT[i];
        at += len;
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Clip src={src} c={c} />
          </Sequence>
        );
      })}
    </div>
  );
};

const label: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  textAlign: "center",
  fontFamily: serif,
  fontWeight: 500,
  fontSize: 38,
  color: "white",
  textShadow: "0 1px 8px rgba(0,0,0,0.45)",
};

// "the artist" — line with ring ends — "the art", across the split.
const Labels: React.FC = () => (
  <AbsoluteFill>
    <div style={{ ...label, top: 822 }}>the artist</div>
    <svg
      width={20}
      height={240}
      style={{ position: "absolute", left: 530, top: 872 }}
      viewBox="0 0 20 240"
    >
      <line x1={10} y1={12} x2={10} y2={228} stroke="white" strokeWidth={3} />
      <circle
        cx={10}
        cy={10}
        r={7}
        fill="none"
        stroke="white"
        strokeWidth={3}
      />
      <circle
        cx={10}
        cy={230}
        r={7}
        fill="none"
        stroke="white"
        strokeWidth={3}
      />
    </svg>
    <div style={{ ...label, top: 1118 }}>the art</div>
  </AbsoluteFill>
);

// edit + fade to black + Beat logo on black
export const ARTIST_TOTAL = ARTIST_DURATION + endTailFrames(ARTIST_FPS);

export const BeatArtist: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <Sequence durationInFrames={SPLIT_END}>
      <Half src={CHEF} cuts={TOP} top />
      <Half src={DISHES} cuts={BOTTOM} top={false} />
      <Labels />
    </Sequence>
    <Sequence from={SPLIT_END} durationInFrames={HERO.frames}>
      <Clip
        src={DISHES}
        c={{
          from: HERO.from,
          rate: HERO.rate,
          zoom: HERO.zoom,
          pos: "50% 50%",
          origin: "50% 40%",
        }}
      />
    </Sequence>
    <Sequence from={SPLIT_END + HERO.frames} durationInFrames={LOGO.frames}>
      <Clip
        src={CHEF}
        c={{
          from: LOGO.from,
          rate: LOGO.rate,
          zoom: 1.08,
          pos: "50% 40%",
          origin: "50% 38%",
        }}
      />
    </Sequence>
    <EndLogo at={ARTIST_DURATION} />
    <Audio
      src={staticFile("beat/artist/ref-audio.m4a")}
      volume={endVolume(ARTIST_TOTAL, ARTIST_FPS)}
    />
  </AbsoluteFill>
);
