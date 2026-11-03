import {
  AbsoluteFill,
  Audio,
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
  CAPTIONS,
  CLIPS,
  CUTS,
  Cut,
  END_CARD,
  END_LOGOS,
  END_TEXT,
  FLASHES,
  LEAK,
  LIGHTNING,
  LOGO_FLY,
  SFX,
  VENUS2_FPS,
  VOICE_FROM,
  VOICE_TO,
  WASH,
} from "./timeline";

export { VENUS2_DURATION, VENUS2_FPS } from "./timeline";

export type Venus2Props = {
  captions: string[];
  endText: string;
};

export const venus2Defaults: Venus2Props = {
  captions: ["Friday night", "YAB Privé", "Venus"],
  endText: "See you Friday",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Video: React.FC<{ cut: Cut; style?: React.CSSProperties }> = ({
  cut,
  style,
}) => (
  <OffthreadVideo
    src={staticFile(CLIPS[cut.clip])}
    trimBefore={Math.round(cut.at * VENUS2_FPS)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);

// Camcorder overlay: recording info running down the left edge.
const Camcorder: React.FC<{ local: number }> = ({ local }) => {
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

// Camcorder overlay timed from the start of its shot.
const CamcorderAtFrame: React.FC = () => (
  <Camcorder local={useCurrentFrame()} />
);

const Shot: React.FC<{ cut: Cut; length: number }> = ({ cut, length }) => {
  const local = useCurrentFrame();
  const frame = cut.from + local;

  // Punch in on every cut, then a slow drift and a little handheld shake.
  const zoom = interpolate(local, [0, 6], [1.12, 1.04], clamp) + local * 0.0008;
  const x = Math.sin(frame * 0.9) * 5 + Math.sin(frame * 2.3) * 3;
  const y = Math.cos(frame * 0.7) * 5;
  let transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  let filter = "";

  // Whip pan in: the first frames slide in from the left, smeared.
  if (cut.whip && local < 4) {
    transform = `translateX(${-(4 - local) * 110}px) ${transform}`;
    filter += ` blur(${(4 - local) * 7}px)`;
  }
  // And out of the shot before a whip.
  const nextWhips = CUTS.find((c) => c.from === cut.from + length)?.whip;
  if (nextWhips && local >= length - 3) {
    const k = local - (length - 4);
    transform = `translateX(${k * 110}px) ${transform}`;
    filter += ` blur(${k * 7}px)`;
  }
  if (cut.fx === "trail") {
    transform += ` translateX(${-local * 30}px) scale(1.3, 1.05)`;
    filter += " blur(9px) brightness(1.5)";
  }
  if (cut.fx === "spin") {
    transform += ` rotate(${local * 8}deg) scale(${1.25 + local * 0.02})`;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform, filter: filter || undefined }}>
        <Video cut={cut} />
      </AbsoluteFill>
      {cut.fx === "spin" ? (
        // Rotating ghost for a zoom-spin blur.
        <AbsoluteFill
          style={{
            transform: `${transform} rotate(${local * 5}deg) scale(1.15)`,
            filter: "blur(6px)",
            mixBlendMode: "screen",
            opacity: 0.55,
          }}
        >
          <Video cut={cut} />
        </AbsoluteFill>
      ) : null}
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
    </AbsoluteFill>
  );
};

// White Venus logo with a neon glow, spinning towards the lens and settling
// where the real sign sits in the next shot.
const LogoFly: React.FC = () => {
  const frame = useCurrentFrame();
  const [from, to] = LOGO_FLY;
  if (frame < from || frame >= to) {
    return null;
  }
  const p = interpolate(frame, [from, to - 6], [0, 1], clamp);
  const ease = 1 - (1 - p) ** 3;
  const opacity = interpolate(
    frame,
    [from, from + 3, to - 6, to],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1200,
        opacity,
      }}
    >
      <div
        style={{
          transform: [
            `translate(${interpolate(ease, [0, 1], [-260, 0])}px, ${interpolate(ease, [0, 1], [420, -125])}px)`,
            `rotateY(${interpolate(ease, [0, 1], [170, 0])}deg)`,
            `rotateZ(${interpolate(ease, [0, 1], [-14, 0])}deg)`,
            `scale(${interpolate(ease, [0, 1], [0.4, 0.74])})`,
          ].join(" "),
          filter:
            "drop-shadow(0 0 6px #ff3df0) drop-shadow(0 0 22px #ff3df0) drop-shadow(0 0 50px #c020ff)",
        }}
      >
        <VenusLogo />
      </div>
    </AbsoluteFill>
  );
};

// A jagged bolt from the top of the frame downwards, with one fork.
const boltPath = (seed: string) => {
  let px = 120 + random(`${seed}x`) * 840;
  let py = random(`${seed}y`) * 250;
  const end = 900 + random(`${seed}e`) * 700;
  const main = [`M ${px} ${py}`];
  const fork: string[] = [];
  for (let i = 0; py < end; i++) {
    px += (random(`${seed}${i}dx`) - 0.5) * 140;
    py += 40 + random(`${seed}${i}dy`) * 60;
    main.push(`L ${px} ${py}`);
    if (i === 4) {
      let fx = px;
      let fy = py;
      fork.push(`M ${fx} ${fy}`);
      for (let j = 0; j < 5; j++) {
        fx += 30 + random(`${seed}${j}fx`) * 60;
        fy += 30 + random(`${seed}${j}fy`) * 50;
        fork.push(`L ${fx} ${fy}`);
      }
    }
  }
  return `${main.join(" ")} ${fork.join(" ")}`;
};

const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < LIGHTNING[0] || frame >= LIGHTNING[1]) {
    return null;
  }
  // New bolts every few frames, flickering on and off.
  const step = Math.floor(frame / 3);
  if (random(`on${step}`) < 0.35 || random(`flicker${frame}`) < 0.2) {
    return null;
  }
  const bolts = 1 + Math.floor(random(`n${step}`) * 2);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <defs>
          <filter id="bolt-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: bolts }, (_, i) => (
          <g key={i} filter="url(#bolt-glow)">
            <path
              d={boltPath(`bolt${step}-${i}`)}
              fill="none"
              stroke="#b46bff"
              strokeWidth={9}
              strokeLinejoin="round"
            />
            <path
              d={boltPath(`bolt${step}-${i}`)}
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = FLASHES.find(([a, b]) => frame >= a && frame < b);
  const leak = interpolate(frame, LEAK, [0, 1], clamp);
  const wash = interpolate(frame, WASH, [0, 1], clamp);
  return (
    <AbsoluteFill>
      {frame >= LEAK[0] && frame < LEAK[1] ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 60% 80% at ${130 - leak * 60}% 50%, rgba(255, 40, 20, 0.95), rgba(255, 90, 30, 0.4) 45%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      {frame >= WASH[0] && frame < WASH[1] ? (
        <AbsoluteFill
          style={{ background: "#ff1a10", opacity: wash ** 2 * 0.95 }}
        />
      ) : null}
      {flash ? (
        <AbsoluteFill style={{ background: flash[2], opacity: flash[3] }} />
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

const Captions: React.FC<Venus2Props> = ({ captions, endText }) => {
  const frame = useCurrentFrame();
  const caption = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (caption) {
    const text = captions[caption.line] ?? "";
    const shown = Math.ceil(
      interpolate(
        frame,
        [caption.from, caption.from + caption.type],
        [0, text.length],
        clamp,
      ),
    );
    return <Caption text={text.slice(0, shown)} opacity={1} top="78%" />;
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
        {/* Red club grade of the reference: light folded into red, skin
            kept warm, shadows lifted a touch. */}
        <filter id="venus2-red" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.95 0.6 0.2 0 0  0.14 0.28 0 0 0  0.06 0.06 0.2 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude={1} exponent={0.7} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={0.7} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={0.7} offset={0} />
          </feComponentTransfer>
        </filter>
      </svg>
      {frame < END_CARD ? (
        <AbsoluteFill style={{ filter: "url(#venus2-red) contrast(1.15)" }}>
          {CUTS.map((cut, i) => {
            const to = CUTS[i + 1]?.from ?? END_CARD;
            return (
              <Sequence
                key={cut.from}
                from={cut.from}
                durationInFrames={to - cut.from}
                premountFor={30}
              >
                <Shot cut={cut} length={to - cut.from} />
              </Sequence>
            );
          })}
          <LogoFly />
        </AbsoluteFill>
      ) : null}
      {CUTS.filter((c) => c.fx === "vhs").map((cut) => {
        const i = CUTS.indexOf(cut);
        return (
          <Sequence
            key={`vhs${cut.from}`}
            from={cut.from}
            durationInFrames={CUTS[i + 1].from - cut.from}
          >
            <CamcorderAtFrame />
          </Sequence>
        );
      })}
      <Lightning />
      <Overlays />
      <Captions {...props} />
      <EndLogos />
      <Sound />
    </AbsoluteFill>
  );
};
