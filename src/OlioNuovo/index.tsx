import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const OLIO_FPS = 25;
// C9186 from 6.4 s to 14.3 s, shot at 50 fps and played at half speed,
// straightened by 7° and graded (public/olio/graded/versata-slow.mp4).
export const OLIO_DURATION = 395;

// The bottle enters the frame at 4.2 s: the title is gone by then.
const TITLE_OUT = 105;

const script = "Pinyon Script";
const sans = "Jost";

// Fonts are bundled in public/fonts so rendering works offline.
const fontHandle = delayRender("Loading fonts");
Promise.all(
  (
    [
      [script, "400", "pinyon-script-latin-400-normal"],
      [sans, "500", "jost-latin-500-normal"],
    ] as const
  ).map(([family, weight, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
    })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(fontHandle));

export type OlioHook = { top: string; main: string; sub: string };

export const OLIO_HOOKS: OlioHook[] = [
  {
    top: "È arrivato",
    main: "l’Olio Nuovo",
    sub: "Fattoria Bonsalto · Raccolta 2026",
  },
  {
    top: "Olio Nuovo",
    main: "a Bonsalto",
    sub: "Appena franto · Raccolta 2026",
  },
  {
    top: "Appena",
    main: "franto",
    sub: "L’Olio Nuovo di Fattoria Bonsalto",
  },
  {
    top: "Il primo",
    main: "oro dell’anno",
    sub: "Olio Nuovo · Fattoria Bonsalto",
  },
  {
    top: "Oro verde",
    main: "di Toscana",
    sub: "Olio Nuovo · Fattoria Bonsalto",
  },
];

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

const Title: React.FC<{ hook: OlioHook }> = ({ hook }) => {
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
            paddingLeft: 330,
          }}
        >
          {hook.top}
        </div>
        <div
          style={{
            ...reveal(frame, 14),
            fontFamily: script,
            fontSize: 216,
            lineHeight: 0.95,
            textAlign: "center",
            marginTop: -12,
          }}
        >
          {hook.main}
        </div>
        <div
          style={{
            ...reveal(frame, 28),
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            textAlign: "center",
            marginTop: 52,
          }}
        >
          {hook.sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const OlioNuovo: React.FC<{ hook: number }> = ({ hook }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <OffthreadVideo src={staticFile("olio/graded/versata-slow.mp4")} />
    <Title hook={OLIO_HOOKS[hook]} />
  </AbsoluteFill>
);
