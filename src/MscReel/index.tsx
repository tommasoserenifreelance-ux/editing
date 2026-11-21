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

export const MSC_FPS = 30;
const CLIP_END = 25.6; // the clean footage (no text) ends here
const CARD = 2.4; // end card
export const MSC_DURATION = Math.round((CLIP_END + CARD) * MSC_FPS);

// Setup Events captions: tight, heavy grotesk in caps, like the profile covers.
const font = "Inter Tight";
const handle = delayRender("Loading fonts");
Promise.all(
  (["500", "800", "900"] as const).map((w) =>
    new FontFace(
      font,
      `url(${staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`)})`,
      { weight: w },
    )
      .load()
      .then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

type Cap = { from: number; to: number; text: string; big?: boolean; sub?: string };

// Times are the cuts of the edit (seconds).
const CAPS: Cap[] = [
  { from: 0, to: 2.2, text: "MSC CI HA\nINVITATI\n*A BORDO*", big: true },
  { from: 2.2, to: 3.4, text: "DELLA *MSC WORLD EUROPA*" },
  { from: 3.4, to: 5.6, text: "UNA DELLE NAVI\n*PIÙ GRANDI*\nAL MONDO", big: true },
  { from: 5.6, to: 6.6, text: "*WELCOME* COCKTAIL" },
  { from: 6.6, to: 7.6, text: "ROADSHOW *MICE*" },
  { from: 7.6, to: 8.8, text: "CON *MY FIRST*\nE *TAP PORTUGAL*" },
  { from: 8.8, to: 10.0, text: "INCONTRI *ONE TO ONE*" },
  { from: 10.0, to: 11.4, text: "MA LA PARTE\n*MIGLIORE?*", big: true },
  { from: 11.4, to: 12.6, text: "LA *VISITA*", big: true },
  { from: 12.6, to: 13.8, text: "PERCHÉ NOI UNA *NAVE*" },
  { from: 13.8, to: 15.0, text: "*NON* LA GUARDIAMO" },
  { from: 15.0, to: 16.2, text: "DA *TURISTI*" },
  { from: 16.2, to: 17.4, text: "OGNI *SPAZIO*" },
  { from: 17.4, to: 18.6, text: "OGNI *PONTE*" },
  { from: 18.6, to: 19.8, text: "LA GUARDIAMO COME…" },
  { from: 19.8, to: 21.6, text: "UN *PALCO*", big: true },
  { from: 21.6, to: 23.6, text: "IL PROSSIMO *EVENTO*\nA BORDO?" },
  { from: 23.6, to: 25.6, text: "POTREBBE ESSERE\n*IL TUO*", big: true },
];

// Words between *asterisks* are the key words, in the Setup Events red.
const RED = "#E3262B";
const renderText = (text: string) =>
  text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") ? (
      <span key={i} style={{ color: RED }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );

const shadow = "0 4px 30px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.35)";

const Caption: React.FC<{ cap: Cap; frames: number }> = ({ cap, frames }) => {
  const f = useCurrentFrame();
  const inT = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const outT = interpolate(f, [frames - 4, frames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const rise = (1 - inT) * 24;
  const scale = cap.big ? interpolate(f, [0, 10], [1.06, 1], { extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: cap.big ? "center" : "flex-end",
        alignItems: "center",
        paddingBottom: cap.big ? 160 : 520,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          opacity: inT * outT,
          transform: `translateY(${rise}px) scale(${scale})`,
          fontFamily: font,
          fontWeight: cap.big ? 900 : 800,
          fontSize: cap.big ? 112 : 64,
          lineHeight: cap.big ? 0.95 : 1.05,
          letterSpacing: cap.big ? "-0.03em" : "-0.01em",
          wordSpacing: "0.08em",
          color: "white",
          textAlign: "center",
          whiteSpace: "pre-line",
          textShadow: shadow,
        }}
      >
        {renderText(cap.text)}
      </div>
    </AbsoluteFill>
  );
};

const Footer: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
    <div
      style={{
        fontFamily: font,
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: "0.22em",
        color: "white",
        textShadow: shadow,
      }}
    >
      SETUPEVENTS
    </div>
    <div
      style={{
        marginTop: 10,
        fontFamily: font,
        fontWeight: 500,
        fontSize: 20,
        letterSpacing: "0.3em",
        color: "rgba(255,255,255,0.85)",
        textShadow: shadow,
      }}
    >
      MSC WORLD EUROPA · GENOVA
    </div>
  </AbsoluteFill>
);

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const b = interpolate(f, [12, 22], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: a, transform: `scale(${1.04 - 0.04 * a})`, textAlign: "center" }}>
        <div style={{ fontFamily: font, fontWeight: 900, fontSize: 118, letterSpacing: "-0.04em", lineHeight: 1 }}>
          <span style={{ color: "white" }}>SETUP</span>
          <span style={{ color: RED }}>EVENTS</span>
        </div>
        <div style={{ marginTop: 18, fontFamily: font, fontWeight: 500, fontSize: 26, letterSpacing: "0.62em", color: "white" }}>
          WE SET THE MOMENT
        </div>
      </div>
      <div
        style={{
          opacity: b,
          transform: `translateY(${(1 - b) * 20}px)`,
          marginTop: 120,
          fontFamily: font,
          fontWeight: 900,
          fontSize: 76,
          letterSpacing: "-0.03em",
          color: "white",
          textAlign: "center",
        }}
      >
        SCRIVICI IN DM
      </div>
    </AbsoluteFill>
  );
};

// MSC emblem in white above the opening title.
const MscLogo: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const inT = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const outT = interpolate(f, [frames - 4, frames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
      <Img
        src={staticFile("msc/msc_logo_white.png")}
        style={{
          height: 300,
          opacity: inT * outT,
          transform: `translateY(${(1 - inT) * 20}px) scale(${1.05 - 0.05 * inT})`,
          filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>
  );
};

export const MscReel: React.FC = () => {
  const s = (t: number) => Math.round(t * MSC_FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={s(CLIP_END)}>
        <OffthreadVideo src={staticFile("msc/nuda.mp4")} muted />
        <Footer />
        <Sequence durationInFrames={s(2.2)}>
          <MscLogo frames={s(2.2)} />
        </Sequence>
        {CAPS.map((c) => (
          <Sequence key={c.from} from={s(c.from)} durationInFrames={s(c.to) - s(c.from)}>
            <Caption cap={c} frames={s(c.to) - s(c.from)} />
          </Sequence>
        ))}
      </Sequence>
      <Sequence from={s(CLIP_END)}>
        <EndCard />
      </Sequence>
      <Audio src={staticFile("msc/sfx.wav")} />
      <Audio src={staticFile("msc/vo.wav")} />
    </AbsoluteFill>
  );
};
