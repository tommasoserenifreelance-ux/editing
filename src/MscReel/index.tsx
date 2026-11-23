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
const CLIP_END = 27.2; // the clean footage (no text) ends here
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

type Cap = { from: number; to: number; text: string; big?: boolean; low?: boolean };

// Captions follow the voice over: each chunk starts on its first spoken word
// (word times from the recording, shifted by scripts/place_msc_vo.py).
const CAPS: Cap[] = [
  { from: 0.3, to: 1.82, text: "MSC *WORLD EUROPA*" },
  { from: 1.82, to: 3.8, text: "CI HA INVITATI\n*A BORDO*" },
  { from: 5.02, to: 5.6, text: "UNA DELLE NAVI" },
  { from: 5.6, to: 7.2, text: "*PIÙ GRANDI*\nAL MONDO" },
  { from: 7.37, to: 8.13, text: "WELCOME *COCKTAIL*" },
  { from: 8.13, to: 8.91, text: "*ROADSHOW*", low: true },
  { from: 8.91, to: 11.5, text: "INCONTRI\nCON *IL SETTORE*" },
  { from: 11.79, to: 12.91, text: "POI LA PARTE\n*MIGLIORE*" },
  { from: 12.91, to: 13.96, text: "LA *VISITA*" },
  { from: 13.96, to: 15.1, text: "PER SCOPRIRE\nTUTTI GLI SPAZI" },
  { from: 15.1, to: 17.32, text: "DELLA NAVE DOVE\nORGANIZZARE *EVENTI*" },
  { from: 17.32, to: 18.46, text: "TEATRO, SALE" },
  { from: 18.46, to: 19.58, text: "PONTI *PANORAMICI*" },
  { from: 19.58, to: 20.28, text: "QUI SI PUÒ FARE" },
  { from: 20.28, to: 21.4, text: "DAVVERO *DI TUTTO*" },
  { from: 23.34, to: 24.36, text: "IL PROSSIMO *EVENTO*\nA BORDO" },
  { from: 24.36, to: 27.2, text: "POTREBBE ESSERE\n*IL TUO*" },
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
  const inT = interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const outT = interpolate(f, [frames - 3, frames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const rise = (1 - inT) * 14;
  const scale = cap.big ? interpolate(f, [0, 10], [1.06, 1], { extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: cap.big ? "center" : "flex-end",
        alignItems: "center",
        paddingBottom: cap.big ? 160 : cap.low ? 380 : 600,
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div
        style={{
          opacity: inT * outT,
          transform: `translateY(${rise}px) scale(${scale})`,
          fontFamily: font,
          fontWeight: 900,
          fontSize: cap.big ? 112 : 88,
          lineHeight: 0.98,
          letterSpacing: "-0.025em",
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
  const outT = interpolate(f, [frames - 3, frames], [1, 0], { extrapolateLeft: "clamp" });
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
        <OffthreadVideo src={staticFile("msc/nuda_v2.mp4")} muted />
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
