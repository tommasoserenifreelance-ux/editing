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
import { bigFont, lyricFont, pink, pinkGlow } from "./fonts";
import {
  CAPTIONS,
  CLIPS,
  CUTS,
  Cut,
  DROP,
  END_CARD,
  END_TEXT,
  FLASHES,
  LOGO_END,
  LOGO_STAMP,
  NIGHTLIFE_FPS,
  SMEARS,
} from "./timeline";

export { NIGHTLIFE_DURATION, NIGHTLIFE_FPS } from "./timeline";

export type NightlifeProps = {
  lyrics: string[];
  endText: string;
  logoText: string;
};

export const nightlifeDefaults: NightlifeProps = {
  lyrics: [
    "EL VERANO",
    "SE ACABA",
    "PERO LO NUESTRO SIGUE",
    "BABY",
    "CHIICAS",
    "ESTA DE VUELTA",
    "VOLVEMOS A CASA",
    "NOS VEMOS",
  ],
  endText: "SEE YOU THURSDAY",
  logoText: "VENUS",
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const inRange = (frame: number, ranges: [number, number, ...unknown[]][]) =>
  ranges.find(([a, b]) => frame >= a && frame < b);

const Video: React.FC<{ cut: Cut; style?: React.CSSProperties }> = ({
  cut,
  style,
}) => (
  <OffthreadVideo
    src={staticFile(CLIPS[cut.clip])}
    trimBefore={Math.round(cut.at * NIGHTLIFE_FPS)}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);

const Shot: React.FC<{ cut: Cut }> = ({ cut }) => {
  const local = useCurrentFrame();
  const frame = cut.from + local;
  const bw = cut.from < DROP;
  const smear = inRange(frame, SMEARS);

  // Punch in on every cut, then a slow drift and a little handheld shake.
  const zoom =
    interpolate(local, [0, 6], [1.14, 1.05], clamp) + local * 0.0008;
  const x = Math.sin(frame * 0.9) * 6 + Math.sin(frame * 2.3) * 3;
  const y = Math.cos(frame * 0.7) * 6;
  let transform = `translate(${x}px, ${y}px) scale(${zoom})`;

  let filter = bw
    ? "grayscale(1) contrast(0.95) brightness(1.1)"
    : "contrast(0.92) saturate(0.6) brightness(0.9)";
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
        <AbsoluteFill style={{ background: "#e81cff", mixBlendMode: "color" }} />
      ) : null}
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {frame >= DROP && frame < END_CARD ? (
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
      {/* Matte blacks: nothing goes darker than this, like the reference. */}
      <AbsoluteFill
        style={{
          background: frame >= DROP ? "rgb(14, 12, 20)" : "rgb(14, 14, 14)",
          mixBlendMode: "lighten",
        }}
      />
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

const Caption: React.FC<{
  text: string;
  big?: boolean;
  opacity: number;
}> = ({ text, big, opacity }) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        top: "47.7%",
        width: "100%",
        textAlign: "center",
        opacity,
        ...(big
          ? {
              fontFamily: bigFont,
              fontSize: 190,
              color: pink,
              transform: "translateY(-50%) skewX(-12deg) scaleX(0.78)",
            }
          : {
              fontFamily: lyricFont,
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: 64,
              transform: "translateY(-50%)",
              color: "#f4f7ff",
              WebkitTextStroke: `3px ${pinkGlow}`,
              paintOrder: "stroke fill",
              textShadow: `0 0 12px rgba(230, 50, 240, 0.8)`,
            }),
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

const Captions: React.FC<NightlifeProps> = ({ lyrics, endText }) => {
  const frame = useCurrentFrame();
  const caption = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (caption) {
    const opacity = caption.fade
      ? interpolate(frame, [caption.fade, caption.to], [1, 0.15], clamp)
      : 1;
    return (
      <Caption
        text={lyrics[caption.line] ?? ""}
        big={caption.big}
        opacity={opacity}
      />
    );
  }
  if (frame >= END_TEXT.from && frame < END_TEXT.to) {
    return (
      <Caption
        text={endText}
        opacity={interpolate(frame, [END_TEXT.fade, END_TEXT.to], [1, 0], clamp)}
      />
    );
  }
  return null;
};

const Logo: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const stamp = frame >= LOGO_STAMP[0] && frame < LOGO_STAMP[1];
  const end = frame >= LOGO_END.from && frame < LOGO_END.to;
  if (!stamp && !end) {
    return null;
  }
  const opacity = stamp
    ? 1
    : interpolate(
        frame,
        [LOGO_END.from, LOGO_END.in, LOGO_END.out, LOGO_END.to],
        [0, 1, 1, 0],
        clamp,
      );
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity }}
    >
      <div
        style={{
          marginTop: -40,
          width: 370,
          height: 370,
          borderRadius: "50%",
          border: "30px solid white",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: bigFont,
          fontSize: text.length > 3 ? 110 : 170,
          color: "white",
          transform: "scaleX(0.85)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Nightlife: React.FC<NightlifeProps> = (props) => {
  return (
    <AbsoluteFill style={{ background: "black" }}>
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
      <Logo text={props.logoText} />
      <Audio src={staticFile("nightlife/music.m4a")} />
    </AbsoluteFill>
  );
};
