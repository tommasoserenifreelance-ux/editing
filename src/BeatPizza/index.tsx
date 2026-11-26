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
import captions from "./captions.json";

// Pizza reel modelled on the seventh reference: booking-call voiceover with
// word-by-word captions over a quick edit, cut on the reference's cuts, the
// pizza story from dough to the table, then the logo on black.
// 24 fps like the footage (no duplicated frames), every moment used once.
export const PIZZA_FPS = 24;

const sans = "Montserrat";
const handle = delayRender("Loading Montserrat");
new FontFace(
  sans,
  `url(${staticFile("fonts/montserrat-latin-500-normal.woff2")})`,
  {
    weight: "500",
  },
)
  .load()
  .then((f) => document.fonts.add(f))
  .then(() => continueRender(handle));

const SRC = {
  pizza: staticFile("beat/pizza/c7.mp4"), // beat.ref.7
  room: staticFile("beat/montage/c4.mp4"), // dining room shots (beat.ref.4)
  bar: staticFile("beat/bar/bar.mp4"), // guests (beat.ref.3)
};

// Reference cut points (s): 0.7 1.37 2.03 3.23 4.3 5.37 6.27 7.13 7.8 8.67
// 9.87 11.17 12.13 14.1 15.07 15.93 17.1 17.8 18.73 19.27 20.57, end 21.8.
// Every shot sits inside one take of its source clip.
type Shot = { src: keyof typeof SRC; from: number };
const CUTS = [
  0, 0.7, 1.37, 2.03, 3.23, 4.3, 5.37, 6.27, 7.13, 7.8, 8.67, 9.87, 11.17,
  12.13, 14.1, 15.07, 15.93, 17.1, 17.8, 18.73, 19.27, 20.57,
];
const SHOTS: Shot[] = [
  { src: "room", from: 37.5 }, // dining room
  { src: "pizza", from: 69.35 }, // pressing the dough
  { src: "pizza", from: 71.9 }, // stretching it
  { src: "pizza", from: 48.0 }, // tomato sauce
  { src: "pizza", from: 51.3 }, // mozzarella going on
  { src: "pizza", from: 56.0 }, // mozzarella pizza
  { src: "pizza", from: 0.3 }, // toppings
  { src: "pizza", from: 23.5 }, // marinara, stracciatella
  { src: "pizza", from: 30.45 }, // lemon zest
  { src: "pizza", from: 33.2 }, // finishing touch
  { src: "pizza", from: 36.7 }, // finished pizza
  { src: "pizza", from: 16.0 }, // courgette-flower pizza
  { src: "pizza", from: 4.0 }, // slicing
  { src: "pizza", from: 8.5 }, // slicing, closer
  { src: "pizza", from: 43.6 }, // pizza at the table
  { src: "room", from: 36.2 }, // booth
  { src: "bar", from: 49.6 }, // guests at the bar
  { src: "pizza", from: 45.5 }, // sharing at the table
  { src: "pizza", from: 74.3 }, // cheers
  { src: "pizza", from: 21.0 }, // courgette-flower pizza, wide
  { src: "pizza", from: 40.0 }, // last pizza, logo comes in
];
const f24 = (s: number) => Math.round(s * PIZZA_FPS);
const END = 21.8;
export const PIZZA_DURATION = f24(END);
const LOGO_AT = f24(19.6);

const full: React.CSSProperties = { width: "100%", height: "100%" };

const Caption: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ alignItems: "center", top: 880, bottom: "auto" }}>
    <div
      style={{
        fontFamily: sans,
        fontWeight: 500,
        fontSize: 54,
        letterSpacing: 2,
        color: "white",
        textShadow: "0 2px 12px rgba(0,0,0,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <Img src={staticFile("beat/logo-bianco.png")} style={{ width: 300 }} />
    </AbsoluteFill>
  );
};

export const BeatPizza: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => {
      const a = f24(CUTS[i]);
      const b = f24(CUTS[i + 1]);
      return (
        <Sequence key={i} from={a} durationInFrames={b - a}>
          <OffthreadVideo
            src={SRC[s.src]}
            startFrom={f24(s.from)}
            muted
            style={full}
          />
        </Sequence>
      );
    })}
    {captions.map((c, i) => (
      <Sequence
        key={i}
        from={f24(c.s)}
        durationInFrames={Math.max(1, f24(c.e) - f24(c.s))}
      >
        <Caption text={c.text} />
      </Sequence>
    ))}
    <Sequence from={LOGO_AT}>
      <Logo />
    </Sequence>
    <Audio src={staticFile("beat/pizza/ref-audio.m4a")} />
  </AbsoluteFill>
);
