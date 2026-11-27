import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { EndLogo, endTailFrames, endVolume } from "../BeatShared/EndLogo";

// Same format as the sushi reel (BeatSushi): each roll is set down on the
// yellow placemat in real time, the frame freezes like a photo, then a warm
// flash cuts to the next roll, the name pops in letter by letter on the
// still (Space Mono, as in the sushi reel); ends on the shared Beat logo.
// Clip: public/beat/rolls/c5.mp4 (beat.ref.5, client's grade). It is itself
// an edit of three takes (cuts at 3.00 and 5.21 s); each shot stays inside
// its take. Freezes use the video itself so colours never shift.
export const ROLLS_FPS = 24;

const SRC = staticFile("beat/rolls/c5.mp4");

// pre = [from, to] source seconds played in real time; the freeze holds the
// frame at `to` once the plate has settled.
// name and ingredients as on the Beat menu
type Shot = {
  pre: [number, number];
  hold: number;
  name: string;
  ingredients: string[];
};
const SHOTS: Shot[] = [
  {
    pre: [0.4, 1.6],
    hold: 46,
    name: "ORLANDO\nFURIOSO",
    ingredients: [
      "Crudo di Fassona piemontese",
      "Burrata artigianale",
      "Cipolla agrodolce",
      "Mandorle tostate",
      "Fondo bruno",
      "Prezzemolo",
    ],
  },
  {
    pre: [3.55, 4.2],
    hold: 46,
    name: "NABUCCO",
    ingredients: [
      "Hummus di ceci",
      "Melanzana grigliata",
      "Avocado",
      "Philadelphia",
      "Semi di papavero",
      "Fiori di zucca secchi",
    ],
  },
  {
    pre: [5.7, 6.6],
    hold: 46,
    name: "VITA\nNUOVA",
    ingredients: [
      "Salsiccia di Cinta Senese DOP",
      "Philadelphia",
      "Pomodoro semi-dry",
      "Porri croccanti",
      "Salsa spicy",
      "Semi di papavero",
    ],
  },
];

const f24 = (s: number) => Math.round(s * ROLLS_FPS);
const preFrames = (s: Shot) => f24(s.pre[1] - s.pre[0]);
const shotFrames = (s: Shot) => preFrames(s) + s.hold;
const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + shotFrames(SHOTS[i - 1])],
  [],
);
const END_AT = starts[starts.length - 1] + shotFrames(SHOTS[SHOTS.length - 1]);
export const ROLLS_DURATION = END_AT;

const full: React.CSSProperties = { width: "100%", height: "100%" };

const mono = "Space Mono";
const fontHandle = delayRender("Loading Space Mono");
new FontFace(
  mono,
  `url(${staticFile("fonts/space-mono-latin-400-normal.woff2")})`,
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(fontHandle));

const SCRAMBLE = 5;
// Text whose letters pop in and out in random order (as in the sushi reel).
const Scrambled: React.FC<{
  text: string;
  on: number;
  off: number;
  seed: string;
}> = ({ text, on, off, seed }) => {
  const f = useCurrentFrame();
  return (
    <>
      {text.split("").map((ch, n) => {
        const a = on + Math.floor(random(`${seed}i${n}`) * SCRAMBLE);
        const b = off + Math.floor(random(`${seed}o${n}`) * SCRAMBLE);
        return (
          <span key={n} style={{ opacity: f >= a && f < b ? 1 : 0 }}>
            {ch}
          </span>
        );
      })}
    </>
  );
};

// Name and ingredients on the bare stone in the lower left.
const Name: React.FC<{ s: Shot; seed: string }> = ({ s, seed }) => {
  const f = useCurrentFrame();
  const on = preFrames(s);
  const off = shotFrames(s) - SCRAMBLE;
  if (f < on) return null;
  const lines = s.name.split("\n");
  const shade = Math.min(1, (f - on) / 6);
  return (
    <>
      {/* soft dark gradient from the bottom so the text reads on yellow/stone */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 820,
          opacity: shade,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 110,
          fontFamily: mono,
          color: "white",
          whiteSpace: "pre",
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontSize: 62, lineHeight: 1.1 }}>
          {lines.map((line, i) => (
            <div key={i}>
              <Scrambled text={line} on={on} off={off} seed={`${seed}n${i}`} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 16 }}>
          {s.ingredients.map((line, i) => (
            <div key={i}>
              <Scrambled
                text={line.toUpperCase()}
                on={on + 6 + i * 3}
                off={off}
                seed={`${seed}i${i}`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const pre = preFrames(s);
  return (
    <Freeze frame={pre - 1} active={f >= pre}>
      <OffthreadVideo src={SRC} startFrom={f24(s.pre[0])} muted style={full} />
    </Freeze>
  );
};

// Warm film flash on every cut, as in the sushi reel.
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const burst = interpolate(f, [-1, 0, 1, 3], [0, 0.95, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (burst === 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 40% 45%, #fffbe8 0%, #ffd27a 35%, #ff7a1f 70%, rgba(255,90,0,0.6) 100%)",
        mixBlendMode: "screen",
        opacity: burst,
      }}
    />
  );
};

// edit + fade to black + Beat logo on black
export const ROLLS_TOTAL = ROLLS_DURATION + endTailFrames(ROLLS_FPS);

export const BeatRolls: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={shotFrames(s)}>
        <ShotView s={s} />
        <Name s={s} seed={`r${i}`} />
      </Sequence>
    ))}
    {starts.slice(1).map((c) => (
      <Flash key={c} at={c} />
    ))}
    <EndLogo at={ROLLS_DURATION} />
    <Audio
      src={staticFile("beat/sushi/reference2-audio.m4a")}
      volume={endVolume(ROLLS_TOTAL, ROLLS_FPS)}
    />
  </AbsoluteFill>
);
