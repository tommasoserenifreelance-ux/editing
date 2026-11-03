import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { VenusLogo, YabLogo } from "../Nightlife";
import { captionFont, yellow } from "../Nightlife/fonts";
import {
  BEATS,
  BLACK_AND_WHITE,
  CAPTION,
  CLIPS,
  CUTS,
  Cut,
  DROP,
  END_CARD,
  END_LOGOS,
  END_TEXT,
  FLASHES,
  LOGO_FLY,
  LOGO_LAND,
  ROLL,
  SFX,
  SMEARS,
  VENUS2_FPS,
  VOICE_FROM,
  VOICE_TO,
  WASH,
} from "./timeline";

export { VENUS2_DURATION, VENUS2_FPS } from "./timeline";

export type Venus2Props = {
  caption: string;
  endText: string;
};

export const venus2Defaults: Venus2Props = {
  caption: "Friday is Venus",
  endText: "See you Friday",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const inRange = (frame: number, ranges: [number, number][]) =>
  ranges.find(([a, b]) => frame >= a && frame < b);

// Venus purple, folded from all the light like the reference's red: mids
// lifted, deep blacks, skin kept a touch warm.
const PURPLE = "url(#venus2-purple) contrast(1.15)";
// Black & white of the first Venus reel.
const MONO = "grayscale(1) contrast(1.05) brightness(1.08)";

const Video: React.FC<{ cut: Cut }> = ({ cut }) => (
  <OffthreadVideo
    src={staticFile(CLIPS[cut.clip])}
    trimBefore={Math.round(cut.at * VENUS2_FPS)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
);

// Stop-motion: hold a pose on each hit of the roll, jumping 0.2 s ahead in
// the clip every time.
const burstFrame = (frame: number) =>
  Math.max(0, ROLL.filter((h) => h <= frame).length - 1) * 6;

// Camcorder overlay: recording info running down the left edge.
const Camcorder: React.FC = () => {
  const local = useCurrentFrame();
  const seconds = 13 + Math.floor(local / VENUS2_FPS);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 5px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 40,
          bottom: 120,
          transform: "rotate(-90deg)",
          transformOrigin: "left bottom",
          display: "flex",
          gap: 60,
          fontFamily: "monospace",
          fontSize: 34,
          letterSpacing: 2,
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 0 4px rgba(0, 0, 0, 0.6)",
          whiteSpace: "nowrap",
        }}
      >
        <span>12BIT/SOUND1</span>
        <span>SP</span>
        <span>07:45:{String(seconds).padStart(2, "0")}</span>
        <span>▮▮▯</span>
      </div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{
  cut: Cut;
  length: number;
  whipIn?: "left" | "right";
  bounceOut?: boolean;
}> = ({ cut, length, whipIn, bounceOut }) => {
  const local = useCurrentFrame();
  const frame = cut.from + local;

  // Punch in on every cut, a slow drift, and a handheld shake with a little
  // roll; it kicks harder for a moment on the drop.
  let zoom = cut.steady
    ? interpolate(local, [0, 6], [1.06, 1.03], clamp)
    : interpolate(local, [0, 6], [1.14, 1.05], clamp) + local * 0.001;
  const kick =
    interpolate(frame, [DROP, DROP + 14], [3, 1], clamp) *
    (cut.steady ? 0.15 : 1);
  let x = (Math.sin(frame * 0.9) * 7 + Math.sin(frame * 2.3) * 4) * kick;
  let y = (Math.cos(frame * 0.7) * 7 + Math.cos(frame * 1.9) * 3) * kick;
  const rotate = cut.steady ? 0 : Math.sin(frame * 0.5) * 0.8 * kick;
  let blur = 0;

  // Bump the zoom on every beat after the drop.
  const lastBeat = Math.max(...BEATS.filter((b) => b <= frame), -100);
  zoom += interpolate(frame - lastBeat, [0, 5], [0.06, 0], clamp);

  // Whip pans out of a shot and into the next.
  if (cut.whipOut && local >= length - 4) {
    const k = local - (length - 5);
    x += (cut.whipOut === "right" ? 1 : -1) * k * 130;
    blur += k * 9;
  }
  if (whipIn && local < 4) {
    x += (whipIn === "right" ? -1 : 1) * (4 - local) * 130;
    blur += (4 - local) * 9;
  }
  if (cut.fx === "pushIn") {
    // The camera pushes into the shot and loses focus before the haze.
    const p = interpolate(local, [length - 18, length], [0, 1], clamp);
    zoom += p * p * 0.9;
    blur += p * 18;
  }
  // Bounce: the outgoing shot squashes away, the next springs in and
  // overshoots before it settles.
  if (bounceOut && local >= length - 3) {
    const k = local - (length - 3) + 1;
    zoom *= 1 - k * 0.06;
    y -= k * 25;
  }
  if (cut.bounce) {
    zoom *= interpolate(local, [0, 3, 6, 9], [0.8, 1.12, 0.97, 1], clamp);
    y += interpolate(local, [0, 3, 6, 9], [90, -35, 12, 0], clamp);
  }

  const bw = inRange(frame, BLACK_AND_WHITE);
  const smear = inRange(frame, SMEARS);
  let filter = [bw ? MONO : PURPLE, blur ? `blur(${blur}px)` : ""].join(" ");
  let transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${zoom})`;
  if (smear) {
    // Blown out and stretched, painted purple below.
    const drop = smear[0] === SMEARS[0][0];
    filter = `grayscale(1) brightness(1.9) contrast(1.5) blur(${drop ? 34 : 16}px)`;
    transform += ` scale(1.1, 1.45) skewX(${Math.sin(frame) * 8}deg)`;
  }

  let video: React.ReactNode = <Video cut={cut} />;
  if (cut.fx === "burst") {
    video = <Freeze frame={burstFrame(frame)}>{video}</Freeze>;
    // A small punch on each hit, like a camera firing.
    const sinceHit = frame - Math.max(...ROLL.filter((h) => h <= frame));
    transform += ` scale(${interpolate(sinceHit, [0, 3], [1.05, 1], clamp)})`;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform, filter }}>{video}</AbsoluteFill>
      {cut.fx === "rgb" && local < 6
        ? // Doubled, colour-shifted copies as the purple kicks in.
          [-1, 1].map((side) => (
            <AbsoluteFill
              key={side}
              style={{
                transform: `${transform} translateX(${side * 30}px)`,
                filter: `${filter} hue-rotate(${side * 90}deg) blur(3px)`,
                mixBlendMode: "screen",
                opacity: 0.6 * (1 - local / 6),
              }}
            >
              <Video cut={cut} />
            </AbsoluteFill>
          ))
        : null}
      {smear ? (
        <AbsoluteFill
          style={{ background: "#b21cff", mixBlendMode: "color" }}
        />
      ) : null}
      {cut.fx === "burst" && ROLL.slice(0, -1).includes(frame) ? (
        <AbsoluteFill style={{ background: "white", opacity: 0.4 }} />
      ) : null}
      {cut.fx === "vhs" ? <Camcorder /> : null}
    </AbsoluteFill>
  );
};

// The neon logo seen from behind (mirrored) shooting up from the bottom of
// the frame and drifting like the reference's, turning to face the lens by
// the cut, then flying on into the sign shot: it eases in over the sign and
// snaps onto it
// (measured in clip 1: centre 8 px right of and 95 px above the frame's
// centre, 0.59 of the logo's width once the shot's punch-in is counted).
const LOGO_KEYS = {
  frame: [
    148,
    149,
    150,
    152,
    153,
    154,
    155,
    156,
    158,
    159,
    162,
    165,
    LOGO_LAND,
    169,
    173,
  ],
  x: [-60, -20, -20, -60, -180, -120, -60, -20, -10, -4, 6, 8, 8, 8, 8],
  y: [
    820, 672, 640, 590, 560, 540, 500, 440, 380, 250, -40, -80, -95, -95, -95,
  ],
  scale: [
    0.6, 1.15, 1.25, 1.25, 1.2, 1.15, 1.1, 1.05, 1.0, 0.9, 0.7, 0.63, 0.59,
    0.59, 0.59,
  ],
  rotateY: [
    200, 190, 185, 180, 200, 240, 290, 330, 352, 358, 360, 360, 360, 360, 360,
  ],
  opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.6, 0],
};

const LogoAt: React.FC<{ frame: number; opacity: number; glow: number }> = ({
  frame,
  opacity,
  glow,
}) => {
  const at = (key: keyof typeof LOGO_KEYS) =>
    interpolate(frame, LOGO_KEYS.frame, LOGO_KEYS[key], clamp);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1400,
        opacity: at("opacity") * opacity,
      }}
    >
      <div
        style={{
          transform: `translate(${at("x")}px, ${at("y")}px) rotateY(${at("rotateY")}deg) scale(${at("scale")})`,
          filter: `drop-shadow(0 0 ${6 * glow}px #ff3df0) drop-shadow(0 0 ${22 * glow}px #ff3df0) drop-shadow(0 0 ${50 * glow}px #c020ff)`,
        }}
      >
        <VenusLogo />
      </div>
    </AbsoluteFill>
  );
};

const LogoFly: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < LOGO_FLY[0] || frame >= LOGO_FLY[1]) {
    return null;
  }
  // Flares as it hits the sign.
  const glow = interpolate(
    frame,
    [LOGO_LAND - 2, LOGO_LAND, LOGO_LAND + 6],
    [1, 2.2, 1],
    clamp,
  );
  const bloom = interpolate(
    frame,
    [LOGO_LAND - 1, LOGO_LAND, LOGO_LAND + 5],
    [0, 0.9, 0],
    clamp,
  );
  return (
    <>
      {/* Fading copies at the last few positions: a motion trail. */}
      {frame < LOGO_LAND
        ? [3, 2, 1].map((back) => (
            <LogoAt
              key={back}
              frame={frame - back * 0.7}
              opacity={0.42 - back * 0.11}
              glow={1}
            />
          ))
        : null}
      <LogoAt frame={frame} opacity={1} glow={glow} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 45% 12% at 51% 45%, rgba(255,120,240,0.95), rgba(200,40,255,0.4) 50%, transparent 75%)",
          mixBlendMode: "screen",
          opacity: bloom,
        }}
      />
    </>
  );
};

// Film grain over the black & white parts.
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  if (!inRange(frame, BLACK_AND_WHITE)) {
    return null;
  }
  return (
    <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="venus2-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={Math.floor(random(`grain${frame}`) * 1000)}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#venus2-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = FLASHES.find((f) => frame >= f.from && frame < f.to);
  const wash = interpolate(frame, WASH, [0, 1], clamp);
  return (
    <AbsoluteFill>
      {frame >= WASH[0] && frame < WASH[1] ? (
        <AbsoluteFill
          style={{ background: "#b21cff", opacity: wash ** 2 * 0.92 }}
        />
      ) : null}
      {flash ? (
        <AbsoluteFill
          style={{ background: flash.fill, opacity: flash.opacity }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{
  text: string;
  opacity: number;
  top: string;
  size?: number;
}> = ({ text, opacity, top, size = 72 }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        top,
        width: "100%",
        transform: "translateY(-50%)",
        textAlign: "center",
        opacity,
        fontFamily: captionFont,
        fontStyle: "italic",
        fontSize: size,
        color: yellow,
        textShadow:
          "0 0 16px rgba(236, 210, 90, 0.6), 0 3px 12px rgba(0, 0, 0, 0.75)",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Captions: React.FC<Venus2Props> = ({ caption, endText }) => {
  const frame = useCurrentFrame();
  if (frame >= CAPTION.from && frame < CAPTION.to) {
    return <Caption text={caption} opacity={1} top="64%" size={96} />;
  }
  if (frame >= END_TEXT.from && frame < END_TEXT.to) {
    return (
      <Caption
        text={endText}
        top="47.7%"
        opacity={interpolate(
          frame,
          [END_TEXT.from, END_TEXT.from + 5, END_TEXT.fade, END_TEXT.to],
          [0, 1, 1, 0],
          clamp,
        )}
      />
    );
  }
  return null;
};

const EndLogos: React.FC = () => {
  const frame = useCurrentFrame();
  const end = END_LOGOS.find((l) => frame >= l.from && frame < l.to);
  if (!end) {
    return null;
  }
  const opacity = interpolate(
    frame,
    [end.from, end.in, end.out, end.to],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      {end.logo === "venus" ? <VenusLogo /> : <YabLogo />}
    </AbsoluteFill>
  );
};

const Sound: React.FC = () => (
  <>
    {/* Ducked under the voice-over; the master is loud, so kept below 1. */}
    <Audio
      src={staticFile("venus2/music.m4a")}
      volume={(f) =>
        interpolate(f, [VOICE_TO, VOICE_TO + 20], [0.5, 0.68], clamp)
      }
    />
    <Sequence from={VOICE_FROM} name="Voice">
      <Audio src={staticFile("venus2/voice.m4a")} />
    </Sequence>
    {SFX.map((sfx, i) => (
      <Sequence key={i} from={sfx.from} name={`SFX ${sfx.file}`}>
        <Audio
          src={staticFile(`nightlife/sfx/${sfx.file}.wav`)}
          volume={sfx.volume}
        />
      </Sequence>
    ))}
  </>
);

export const Venus2: React.FC<Venus2Props> = (props) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="venus2-purple" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.72 0.5 0.14 0 0  0.12 0.27 0.02 0 0  0.62 0.68 0.48 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude={1} exponent={0.6} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={0.6} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={0.6} offset={0} />
          </feComponentTransfer>
        </filter>
      </svg>
      {frame < END_CARD ? (
        <AbsoluteFill>
          {CUTS.map((cut, i) => {
            const to = CUTS[i + 1]?.from ?? END_CARD;
            return (
              <Sequence
                key={cut.from}
                from={cut.from}
                durationInFrames={to - cut.from}
                premountFor={30}
              >
                <Shot
                  cut={cut}
                  length={to - cut.from}
                  whipIn={CUTS[i - 1]?.whipOut}
                  bounceOut={CUTS[i + 1]?.bounce}
                />
              </Sequence>
            );
          })}
          <LogoFly />
          <Grain />
        </AbsoluteFill>
      ) : null}
      <Overlays />
      <Captions {...props} />
      <EndLogos />
      <Sound />
    </AbsoluteFill>
  );
};
