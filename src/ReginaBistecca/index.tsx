import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const RB_FPS = 25;

// The title is gone after 4.2 s, as in the Bonsalto Olio Nuovo reel.
const TITLE_OUT = 105;

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

// Clips in public/rb/edit are cut by scripts/rb_tagli.py; durations are their
// frame counts at 25 fps.
export const RB_VIDEOS = {
  rb01: { duration: 226, hook: { top: "Dalla brace", main: "al piatto" } },
  rb02: { duration: 401, hook: { top: "La tagliata", main: "della Regina" } },
  rb03: { duration: 538, hook: { top: "Tagliolini", main: "al tartufo" } },
  rb04: { duration: 240, hook: { top: "La nostra", main: "Tartare" } },
  rb05: { duration: 260, hook: { top: "Filetto", main: "al tartufo" } },
  rb06: { duration: 296, hook: { top: "Tra i libri", main: "della Regina" } },
  rb07: { duration: 375, hook: { top: "Inverno", main: "in Toscana" } },
  rb08: { duration: 396, hook: { top: "Pagine", main: "di carne" } },
  rb09: { duration: 676, hook: { top: "Campari", main: "Spritz" } },
  rb10: { duration: 598, hook: { top: "Il drink", main: "in rosa" } },
  rb11: { duration: 310, hook: { top: "Dolci", main: "della casa" } },
} satisfies Record<string, { duration: number; hook: Hook }>;

export type RbVideo = keyof typeof RB_VIDEOS;

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

export const ReginaBistecca: React.FC<{ video: RbVideo }> = ({ video }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile(`rb/edit/${video}.mp4`)} muted />
    <Title hook={RB_VIDEOS[video].hook} />
  </AbsoluteFill>
);
