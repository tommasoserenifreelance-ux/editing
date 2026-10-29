import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const RB_FPS = 25;

// The title is gone after 4.2 s, as in the Bonsalto Olio Nuovo reel.
const TITLE_OUT = 105;

// Every reel ends the same way: the logo fades in over the picture, the
// picture goes down to black under it over the clip's last second, then the
// logo holds alone on black for RB_OUTRO frames after the clip.
export const RB_OUTRO = 30;
const LOGO_LEAD = 45;
const BLACK_LEN = 25;

const script = "Pinyon Script";

// Fonts are bundled in public/fonts so rendering works offline.
const fontHandle = delayRender("Loading fonts");
new FontFace(
  script,
  `url(${staticFile("fonts/pinyon-script-latin-400-normal.woff2")})`,
  { weight: "400" },
)
  .load()
  .then((font) => document.fonts.add(font))
  .then(() => continueRender(fontHandle));

type Hook = { top: string; main: string };

// Clips in public/rb/edit are cut and graded by scripts/rb_tagli.py, which
// also writes their frame counts to durations.ts.
const videos = {
  // The logo waits for the last of the salt (9.7 s).
  rb01: { hook: { top: "Dalla brace", main: "al piatto" }, logoAt: 243 },
  rb02: { hook: { top: "La tagliata", main: "della Regina" } },
  rb03: { hook: { top: "Tagliolini", main: "al tartufo" } },
  rb04: { hook: { top: "La nostra", main: "Tartare" } },
  rb05: { hook: { top: "Filetto", main: "al tartufo" } },
  rb06: { hook: { top: "Tra i libri", main: "della Regina" } },
  rb07: { hook: { top: "Inverno", main: "in Toscana" } },
  rb08: { hook: { top: "Pagine", main: "di carne" } },
  rb09: { hook: { top: "Campari", main: "Spritz" } },
  rb10: { hook: { top: "Il drink", main: "in rosa" } },
  rb11: { hook: { top: "Dolci", main: "della casa" } },
} satisfies Record<string, RbEdit>;

type RbEdit = { hook: Hook; logoAt?: number };

export type RbVideo = keyof typeof videos;

export const RB_VIDEOS: Record<RbVideo, RbEdit> = videos;

// Each line drifts up out of a soft blur, one after the other.
const reveal = (frame: number, start: number) => {
  const p = interpolate(frame, [start, start + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(frame, [TITLE_OUT - 18, TITLE_OUT], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    opacity: p * out,
    filter: `blur(${(1 - p) * 10}px)`,
    transform: `translateY(${(1 - p) * 24}px)`,
  };
};

const Title: React.FC<{ hook: Hook }> = ({ hook }) => {
  const frame = useCurrentFrame();
  const dim = interpolate(
    frame,
    [0, 10, TITLE_OUT - 18, TITLE_OUT],
    [0.35, 1, 1, 0],
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: dim,
          background:
            "radial-gradient(ellipse 90% 45% at 50% 33%, rgba(20,12,4,0.62), rgba(20,12,4,0.18) 75%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 0,
          right: 0,
          color: "white",
          textShadow: "0 3px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            ...reveal(frame, 4),
            fontFamily: script,
            fontSize: 132,
            lineHeight: 1,
            paddingLeft: 250,
          }}
        >
          {hook.top}
        </div>
        <div
          style={{
            ...reveal(frame, 14),
            fontFamily: script,
            fontSize: 200,
            lineHeight: 0.95,
            textAlign: "center",
            marginTop: -12,
          }}
        >
          {hook.main}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Regina Bistecca al Duomo logo, white on transparent.
const EndLogo: React.FC<{ at?: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clipEnd = durationInFrames - RB_OUTRO;
  const start = at ?? clipEnd - LOGO_LEAD;
  const p = interpolate(frame, [start, start + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          opacity: p,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 46%, rgba(20,12,4,0.66), rgba(20,12,4,0.3) 80%)",
        }}
      />
      <Img
        src={staticFile("rb/logo-regina-bistecca.png")}
        style={{
          width: 860,
          marginTop: -120,
          opacity: p,
          filter: `blur(${(1 - p) * 8}px) drop-shadow(0 4px 24px rgba(0,0,0,0.35))`,
          transform: `scale(${0.96 + 0.04 * p})`,
        }}
      />
    </AbsoluteFill>
  );
};

// The picture (not the logo) goes down to black as the clip ends.
const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const clipEnd = durationInFrames - RB_OUTRO;
  const opacity = interpolate(frame, [clipEnd - BLACK_LEN, clipEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "black", opacity }} />;
};

export const ReginaBistecca: React.FC<{ video: RbVideo }> = ({ video }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile(`rb/edit/${video}.mp4`)} muted />
    {/* A different classical piano piece per reel (public/rb/music). */}
    <Audio src={staticFile(`rb/music/${video}.m4a`)} />
    <Title hook={RB_VIDEOS[video].hook} />
    <FadeToBlack />
    <EndLogo at={RB_VIDEOS[video].logoAt} />
  </AbsoluteFill>
);
