import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { VenusLogo, YabLogo } from "../Nightlife";
import { captionFont, yellow } from "../Nightlife/fonts";
import {
  CAPTION,
  CLIPS,
  CUTS,
  Cut,
  END_CARD,
  END_LOGOS,
  END_TEXT,
  FLASHES,
  LOGO_FLY,
  LOGO_GHOST,
  ROLL,
  SFX,
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

const Video: React.FC<{ cut: Cut }> = ({ cut }) => (
  <OffthreadVideo
    src={staticFile(CLIPS[cut.clip])}
    trimBefore={Math.round(cut.at * VENUS2_FPS)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
);

// Stop-motion: hold a pose on each hit of the roll, jumping 0.2 s ahead in
// the clip every time, then play on normally from the last pose.
const burstFrame = (frame: number) => {
  const last = ROLL[ROLL.length - 1];
  const hit = ROLL.filter((h) => h <= frame).length - 1;
  return frame < last ? hit * 6 : (ROLL.length - 1) * 6 + (frame - last);
};

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

const Shot: React.FC<{ cut: Cut; length: number; whipIn: boolean }> = ({
  cut,
  length,
  whipIn,
}) => {
  const local = useCurrentFrame();
  const frame = cut.from + local;
  const t = local / length;

  // Punch in on every cut, then a slow drift and a little handheld shake.
  let zoom = interpolate(local, [0, 6], [1.1, 1.03], clamp) + local * 0.0008;
  const x = Math.sin(frame * 0.9) * 5 + Math.sin(frame * 2.3) * 3;
  const y = Math.cos(frame * 0.7) * 5;
  let shift = 0;
  let blur = 0;
  let rotate = 0;
  let brightness = 1;

  // Whip pan: out of a shot to the right, into the next from the left.
  if (cut.whipOut && local >= length - 4) {
    const k = local - (length - 5);
    shift += k * 120;
    blur += k * 8;
  }
  if (whipIn && local < 4) {
    shift -= (4 - local) * 120;
    blur += (4 - local) * 8;
  }
  if (cut.fx === "pushIn") {
    // The camera pushes into the shot and loses focus before the haze.
    const p = interpolate(local, [length - 18, length], [0, 1], clamp);
    zoom += p * p * 0.9;
    blur += p * 18;
  }
  if (cut.fx === "haze") {
    blur += interpolate(local, [0, length], [14, 4], clamp);
    brightness = 0.75;
    shift -= local * 4;
  }
  if (cut.fx === "vortex") {
    rotate = t * t * 50;
    zoom += t * 0.4;
    blur += t * t * 6;
  }
  let video: React.ReactNode = <Video cut={cut} />;
  if (cut.fx === "burst") {
    const hold = burstFrame(frame);
    video = <Freeze frame={hold}>{video}</Freeze>;
    // A small punch on each hit, like a camera firing.
    const sinceHit = frame - Math.max(...ROLL.filter((h) => h <= frame));
    if (frame < ROLL[ROLL.length - 1]) {
      zoom += interpolate(sinceHit, [0, 3], [0.05, 0], clamp);
    }
  }

  const transform = `translate(${x + shift}px, ${y}px) rotate(${rotate}deg) scale(${zoom})`;
  const filter = [
    blur ? `blur(${blur}px)` : "",
    brightness !== 1 ? `brightness(${brightness})` : "",
  ].join(" ");

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform, filter: filter.trim() || undefined }}>
        {video}
      </AbsoluteFill>
      {cut.fx === "vortex"
        ? // Ghosts turning further ahead: the spin blur of the reference.
          [1, 2, 3].map((i) => (
            <AbsoluteFill
              key={i}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotate + i * 7 * t}deg) scale(${zoom + i * 0.04 * t})`,
                filter: `blur(${2 + i * 2}px)`,
                mixBlendMode: "screen",
                opacity: 0.4 * t,
              }}
            >
              <Video cut={cut} />
            </AbsoluteFill>
          ))
        : null}
      {cut.fx === "double" ? (
        // Second exposure of the sign, stacked above the first.
        <AbsoluteFill
          style={{
            transform: `${transform} translateY(-330px)`,
            mixBlendMode: "screen",
            opacity: 0.75,
          }}
        >
          <Video cut={cut} />
        </AbsoluteFill>
      ) : null}
      {cut.fx === "burst" && ROLL.slice(0, -1).includes(frame) ? (
        <AbsoluteFill style={{ background: "white", opacity: 0.35 }} />
      ) : null}
      {cut.fx === "vhs" ? <Camcorder /> : null}
    </AbsoluteFill>
  );
};

// The neon logo seen from behind (mirrored) rising from the bottom of the
// frame, drifting left and back, then turning edge-on and gone by the cut;
// frame by frame after the reference.
const LOGO_KEYS = {
  //      0     1     2     3     4     5     6     7     8     9    10   11
  x: [-60, -40, -20, -20, -40, -90, -270, -110, -50, -60, -60, -60],
  y: [820, 720, 672, 640, 600, 576, 576, 576, 560, 540, 540, 540],
  scale: [0.6, 0.95, 1.15, 1.25, 1.25, 1.25, 1.25, 1.2, 1.15, 1.1, 1.1, 1.1],
  rotateY: [200, 195, 190, 185, 182, 180, 178, 172, 150, 118, 95, 90],
};

const LogoFly: React.FC = () => {
  const frame = useCurrentFrame();
  const glow =
    "drop-shadow(0 0 6px #ff3df0) drop-shadow(0 0 22px #ff3df0) drop-shadow(0 0 50px #c020ff)";
  if (frame >= LOGO_FLY[0] && frame < LOGO_FLY[1]) {
    const k = frame - LOGO_FLY[0];
    return (
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          perspective: 1400,
        }}
      >
        <div
          style={{
            transform: `translate(${LOGO_KEYS.x[k]}px, ${LOGO_KEYS.y[k]}px) rotateY(${LOGO_KEYS.rotateY[k]}deg) scale(${LOGO_KEYS.scale[k]})`,
            filter: glow,
          }}
        >
          <VenusLogo />
        </div>
      </AbsoluteFill>
    );
  }
  if (frame >= LOGO_GHOST[0] && frame < LOGO_GHOST[1]) {
    // A faint double exposure of the logo over the real sign.
    const opacity = interpolate(frame, LOGO_GHOST, [0.8, 0], clamp);
    return (
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", opacity }}
      >
        <div
          style={{
            transform: "translate(-70px, -90px) scale(0.45)",
            filter: glow,
          }}
        >
          <VenusLogo />
        </div>
      </AbsoluteFill>
    );
  }
  return null;
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

const Caption: React.FC<{ text: string; opacity: number; top: string }> = ({
  text,
  opacity,
  top,
}) => (
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
        fontSize: 72,
        color: yellow,
        textShadow:
          "0 0 14px rgba(236, 210, 90, 0.55), 0 2px 10px rgba(0, 0, 0, 0.6)",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Captions: React.FC<Venus2Props> = ({ caption, endText }) => {
  const frame = useCurrentFrame();
  if (frame >= CAPTION.from && frame < CAPTION.to) {
    let shown = 0;
    for (const part of CAPTION.parts) {
      shown += Math.ceil(
        interpolate(
          frame,
          [part.at, part.at + part.frames],
          [0, part.chars],
          clamp,
        ),
      );
    }
    return <Caption text={caption.slice(0, shown)} opacity={1} top="78%" />;
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
        {/* Lifts the mids, as the reference does, before the saturation. */}
        <filter id="venus2-gamma" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude={1} exponent={0.72} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={0.72} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={0.72} offset={0} />
          </feComponentTransfer>
        </filter>
      </svg>
      {frame < END_CARD ? (
        // Venus purple, with the reference's punch: brighter mids, deep
        // blacks, rich colour.
        <AbsoluteFill
          style={{ filter: "url(#venus2-gamma) saturate(1.6) contrast(1.12)" }}
        >
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
                  whipIn={Boolean(CUTS[i - 1]?.whipOut)}
                />
              </Sequence>
            );
          })}
          <LogoFly />
        </AbsoluteFill>
      ) : null}
      <Overlays />
      <Captions {...props} />
      <EndLogos />
      <Sound />
    </AbsoluteFill>
  );
};
