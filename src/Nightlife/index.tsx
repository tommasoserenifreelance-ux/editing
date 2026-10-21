import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { captionFont, logoFont, yellow } from "./fonts";
import {
  CAPTIONS,
  CLIPS,
  CUTS,
  Cut,
  DROP,
  END_CARD,
  END_LOGOS,
  END_TEXT,
  FLASHES,
  LOGO_STAMP,
  NIGHTLIFE_FPS,
  SFX,
  SMEARS,
  VOICE_FROM,
  VOICE_TO,
} from "./timeline";

export { NIGHTLIFE_DURATION, NIGHTLIFE_FPS } from "./timeline";

export type NightlifeProps = {
  captions: string[];
  endText: string;
};

export const nightlifeDefaults: NightlifeProps = {
  captions: [
    "The nights grow longer",
    "The evenings are chosen",
    "Few spots",
    "One rule",
    "Be unique",
  ],
  endText: "See you Friday",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const inRange = (frame: number, ranges: [number, number, ...unknown[]][]) =>
  ranges.find(([a, b]) => frame >= a && frame < b);

const Video: React.FC<{ cut: Cut }> = ({ cut }) => (
  <OffthreadVideo
    src={staticFile(CLIPS[cut.clip])}
    trimBefore={Math.round(cut.at * NIGHTLIFE_FPS)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
);

const Shot: React.FC<{ cut: Cut }> = ({ cut }) => {
  const local = useCurrentFrame();
  const frame = cut.from + local;
  const bw = cut.from < DROP;
  const smear = inRange(frame, SMEARS);

  // Punch in on every cut, then a slow drift and a little handheld shake.
  const zoom = interpolate(local, [0, 6], [1.14, 1.05], clamp) + local * 0.0008;
  const x = Math.sin(frame * 0.9) * 6 + Math.sin(frame * 2.3) * 3;
  const y = Math.cos(frame * 0.7) * 6;
  let transform = `translate(${x}px, ${y}px) scale(${zoom})`;

  let filter = bw
    ? "grayscale(1) contrast(0.95) brightness(1.1)"
    : "url(#venus-balance) saturate(0.72) contrast(0.98) brightness(0.86)";
  if (cut.fx === "flicker" && local < 16) {
    filter += ` brightness(${0.6 + random(`flicker${frame}`) * 0.9})`;
  }
  if (smear) {
    const drop = smear[0] === SMEARS[0][0];
    filter = `grayscale(1) brightness(1.9) contrast(1.5) blur(${drop ? 36 : 16}px)`;
    transform += ` scale(1.1, 1.45) skewX(${Math.sin(frame) * 8}deg)`;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform, filter }}>
        <Video cut={cut} />
      </AbsoluteFill>
      {cut.fx === "swirl" && !smear ? (
        // Rotating ghost of the same shot, like a slow-shutter spin.
        <AbsoluteFill
          style={{
            transform: `rotate(${local * 4}deg) scale(${1.3 + local * 0.004})`,
            filter: `${filter} blur(5px)`,
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        >
          <Video cut={cut} />
        </AbsoluteFill>
      ) : null}
      {cut.fx === "rgb" && local < 6 ? (
        // Doubled, colour-shifted copies as the colour section kicks in.
        <>
          <AbsoluteFill
            style={{
              transform: `${transform} translateX(-28px)`,
              filter: `${filter} hue-rotate(-60deg) blur(3px)`,
              mixBlendMode: "screen",
              opacity: 0.6,
            }}
          >
            <Video cut={cut} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `${transform} translateX(28px)`,
              filter: `${filter} hue-rotate(120deg) blur(3px)`,
              mixBlendMode: "screen",
              opacity: 0.6,
            }}
          >
            <Video cut={cut} />
          </AbsoluteFill>
        </>
      ) : null}
      {smear ? (
        // Keep the blown-out luminance, paint it magenta.
        <AbsoluteFill
          style={{ background: "#e81cff", mixBlendMode: "color" }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const color = frame >= DROP;
  return (
    <AbsoluteFill>
      {color && frame < END_CARD ? (
        <AbsoluteFill
          style={{
            background: "#c45cff",
            mixBlendMode: "soft-light",
            opacity: 0.06,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      {/* Matte blacks in black & white and on the end card, like the
          reference; its colour section keeps true blacks. */}
      {!color || frame >= END_CARD ? (
        <AbsoluteFill
          style={{
            background: color ? "rgb(14, 12, 20)" : "rgb(14, 14, 14)",
            mixBlendMode: "lighten",
          }}
        />
      ) : null}
      <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              seed={frame}
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = inRange(frame, FLASHES);
  if (!flash) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{ background: "#fbfbfd", opacity: flash[2] === "soft" ? 0.55 : 1 }}
    />
  );
};

const Caption: React.FC<{ text: string; opacity: number }> = ({
  text,
  opacity,
}) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        top: "47.7%",
        width: "100%",
        transform: "translateY(-50%)",
        textAlign: "center",
        opacity,
        fontFamily: captionFont,
        fontStyle: "italic",
        fontSize: 66,
        color: yellow,
        textShadow: "0 2px 10px rgba(0, 0, 0, 0.55)",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Captions: React.FC<NightlifeProps> = ({ captions, endText }) => {
  const frame = useCurrentFrame();
  const caption = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (caption) {
    const opacity = caption.fade
      ? interpolate(frame, [caption.fade, caption.to], [1, 0.15], clamp)
      : 1;
    return <Caption text={captions[caption.line] ?? ""} opacity={opacity} />;
  }
  if (frame >= END_TEXT.from && frame < END_TEXT.to) {
    return (
      <Caption
        text={endText}
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

const VenusLogo: React.FC = () => (
  <Img src={staticFile("nightlife/venus-logo.png")} style={{ width: 760 }} />
);

// YAB logo redrawn from the brand mark: thin ring, tall condensed letters.
// Drawn on the 448-unit grid of the original artwork.
const YabLogo: React.FC = () => (
  <svg viewBox="0 0 448 448" width={420} height={420}>
    <circle
      cx={225}
      cy={225}
      r={187}
      fill="none"
      stroke="white"
      strokeWidth={20}
    />
    <text
      x={230}
      y={357}
      textAnchor="middle"
      fill="white"
      fontFamily={logoFont}
      // Anton's cap height is 0.86 em: letters span y 100-357 as in the mark.
      fontSize={299}
      textLength={250}
      lengthAdjust="spacingAndGlyphs"
    >
      YAB
    </text>
  </svg>
);

const Logos: React.FC = () => {
  const frame = useCurrentFrame();
  const center = { justifyContent: "center", alignItems: "center" } as const;
  if (frame >= LOGO_STAMP[0] && frame < LOGO_STAMP[1]) {
    // Slams in slightly oversized and settles.
    const scale = interpolate(
      frame,
      [LOGO_STAMP[0], LOGO_STAMP[0] + 4, LOGO_STAMP[1]],
      [1.25, 1, 0.96],
      clamp,
    );
    return (
      <AbsoluteFill style={{ ...center, transform: `scale(${scale})` }}>
        <VenusLogo />
      </AbsoluteFill>
    );
  }
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
    <AbsoluteFill style={{ ...center, opacity }}>
      {end.logo === "venus" ? <VenusLogo /> : <YabLogo />}
    </AbsoluteFill>
  );
};

const Sound: React.FC = () => (
  <>
    {/* The track already holds the pre-roll; ducked under the voice-over. */}
    <Audio
      src={staticFile("nightlife/music.m4a")}
      volume={(f) => interpolate(f, [VOICE_TO, VOICE_TO + 14], [0.5, 1], clamp)}
    />
    <Sequence from={VOICE_FROM} name="Voice">
      <Audio src={staticFile("nightlife/voice.m4a")} />
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

export const Nightlife: React.FC<NightlifeProps> = (props) => {
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        {/* Pull the club's purple light towards the reference's neutral mix. */}
        <filter id="venus-balance" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.85 0 0 0 0  0 1.08 0 0 0  0 0 0.78 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
      {CUTS.map((cut, i) => {
        const to = CUTS[i + 1]?.from ?? END_CARD;
        return (
          <Sequence
            key={cut.from}
            from={cut.from}
            durationInFrames={to - cut.from}
            premountFor={30}
          >
            <Shot cut={cut} />
          </Sequence>
        );
      })}
      <Grade />
      <Flash />
      <Captions {...props} />
      <Logos />
      <Sound />
    </AbsoluteFill>
  );
};
