import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TalkingHead } from "../Nad/scenes";
import {
  Emoji,
  Fill,
  Paper,
  Scribble,
  SerifLabel,
  Sfx,
  usePop,
  Word3D,
} from "../Testosterone/primitives";
import { colors, FPS, sans, sec } from "../Testosterone/theme";
import { wt } from "./captions";

/*
 * Estrogens reel (1080x1920). Editing grammar from the new reference:
 * split screen (speaker on top, graphics below), icons that stack up as
 * they are listed, a definition card, keyword pills, grey vignette paper.
 * Brand stays LongevaMed: screen-print icons, coral/mint/ink/yellow,
 * Helvetica, the same captions.
 */

type SceneProps = { t0: number };

const at = (t0: number, word: string) => sec(wt(word, t0) - t0);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const SRC = "estrogeni/clip.mp4";
export const HEAD_ANCHOR_E = "50% 2%";
// Speaker panel height: tall enough to keep the chin above the seam.
const TOP = 1100;
const PANEL = 1920 - TOP;

/* ------------------------------------------------------------------ */
/* Speaker                                                              */
/* ------------------------------------------------------------------ */

export const Speaker: React.FC<{
  start: number;
  framing: "wide" | "close";
  punch?: number[];
}> = (p) => (
  <TalkingHead {...p} src={SRC} anchor={HEAD_ANCHOR_E} closeScale={1.12} />
);

/** Top half: the speaker, framed from the top of the head. */
const SpeakerPanel: React.FC<{ t0: number; punch?: number[] }> = ({
  t0,
  punch = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let scale = 1 + interpolate(frame, [0, 600], [0, 0.03], clamp);
  for (const p of punch) {
    const f = Math.round(p * fps);
    if (frame >= f) {
      scale += 0.05 * spring({ frame: frame - f, fps, config: { damping: 18 } });
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: TOP,
        overflow: "hidden",
        backgroundColor: colors.black,
      }}
    >
      <OffthreadVideo
        src={staticFile(SRC)}
        startFrom={Math.round(t0 * FPS)}
        muted
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: HEAD_ANCHOR_E,
        }}
      />
      {punch.map((p) => (
        <Sfx key={p} at={p * fps - 2} name="swoosh" volume={0.16} />
      ))}
    </div>
  );
};

/** Bottom half: a graphics panel that slides up into place. */
const GraphicPanel: React.FC<{ bg: Paper; children: React.ReactNode }> = ({
  bg,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: TOP + (1 - slide) * 220,
        width: 1080,
        height: PANEL,
        overflow: "hidden",
        boxShadow: "0 -14px 30px rgba(0,0,0,0.35)",
      }}
    >
      <Fill bg={bg}>{children}</Fill>
    </div>
  );
};

const PANEL_BG: Record<Paper, string> = {
  white: colors.white,
  black: colors.black,
  coral: colors.coral,
  mint: colors.mint,
  grey: "#DEDEE2",
};

export const Split: React.FC<{
  t0: number;
  bg?: Paper;
  punch?: string[];
  children: React.ReactNode;
}> = ({ t0, bg = "grey", punch = [], children }) => (
  // panel colour behind, so nothing dark shows while the panel slides up
  <AbsoluteFill style={{ backgroundColor: PANEL_BG[bg] }}>
    <SpeakerPanel t0={t0} punch={punch.map((w) => wt(w, t0) - t0)} />
    <GraphicPanel bg={bg}>{children}</GraphicPanel>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Building blocks                                                       */
/* ------------------------------------------------------------------ */

/** Rounded keyword pill (reference: the coral "€10.000.000.000" pill). */
const Pill: React.FC<{
  text: string;
  delay: number;
  top: number;
  bg?: string;
  color?: string;
  size?: number;
  tilt?: number;
}> = ({ text, delay, top, bg = colors.coral, color = colors.white, size = 76, tilt = -3 }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: frame < delay ? 0 : 1,
      }}
    >
      <div
        style={{
          padding: `${size * 0.22}px ${size * 0.5}px`,
          borderRadius: size,
          background: bg,
          border: `7px solid ${colors.printInk}`,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: "-0.02em",
          color,
          whiteSpace: "nowrap",
          transform: `scale(${p}) rotate(${tilt * p}deg)`,
          filter: "url(#sticker)",
        }}
      >
        {text}
      </div>
      <Sfx at={delay} name="pop1" volume={0.5} />
    </div>
  );
};

/** Icons that pile up in a grid as they are named (reference: the flags). */
type StackItem = { word: string; emoji: string; label: string };

const StackGrid: React.FC<{
  t0: number;
  items: StackItem[];
  cols: number;
  top: number;
  rowH: number;
  size: number;
  labelColor?: string;
  grey?: number;
  since?: number; // look words up from here (items may have been named in an earlier shot)
}> = ({ t0, items, cols, top, rowH, size, labelColor = colors.ink, grey = 0, since = t0 }) => {
  const colW = 1080 / cols;
  return (
    <>
      {items.map((it, i) => {
        const cx = colW * ((i % cols) + 0.5);
        const cy = top + Math.floor(i / cols) * rowH;
        const d = sec(wt(it.word, since) - t0);
        return (
          <React.Fragment key={it.label}>
            <Emoji name={it.emoji} x={cx} y={cy} size={size} delay={d} grey={grey} />
            <SerifLabel
              text={it.label}
              delay={d + 2}
              size={50}
              color={labelColor}
              style={{ left: cx - colW / 2, width: colW, top: cy + size * 0.55 }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                                */
/* ------------------------------------------------------------------ */

/* "scandisce le tappe della vita femminile" — a timeline */
export const Tappe: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d = at(t0, "tappe");
  const line = interpolate(frame, [d - 4, d + 16], [0, 1], clamp);
  const stops = [160, 413, 666, 920];
  return (
    <Split t0={t0}>
      <svg width={1080} height={PANEL} style={{ position: "absolute", filter: "url(#print)" }}>
        <line x1={140} y1={470} x2={140 + 800 * line} y2={470} stroke={colors.printInk} strokeWidth={10} strokeLinecap="round" />
        {stops.map((x, i) => {
          const k = interpolate(frame, [d + i * 4, d + i * 4 + 6], [0, 1], clamp);
          return <circle key={x} cx={x} cy={470} r={34 * k} fill={[colors.mint, colors.brand, colors.coral, colors.mint][i]} stroke={colors.printInk} strokeWidth={7} />;
        })}
        <g transform="translate(540 220)" opacity={interpolate(frame, [0, 6], [0, 1], clamp)}>
          <circle cx={0} cy={-30} r={78} fill="none" stroke={colors.coral} strokeWidth={22} />
          <path d="M0 48 V170 M-56 112 H56" stroke={colors.coral} strokeWidth={22} strokeLinecap="round" />
        </g>
      </svg>
      {stops.map((_, i) => (
        <Sfx key={i} at={d + i * 4} name="tick" volume={0.5} />
      ))}
      <SerifLabel text="le tappe della vita femminile" delay={d + 4} size={64} style={{ left: 0, right: 0, top: 580 }} />
    </Split>
  );
};

/* "in chiave prevenzione, chiaramente a lungo termine" */
export const Prevenzione: React.FC<SceneProps> = ({ t0 }) => (
  <Split t0={t0} bg="mint">
    <Pill text="prevenzione" delay={at(t0, "prevenzione")} top={130} size={86} />
    <Emoji name="hourglass" x={380} y={520} size={250} delay={at(t0, "lungo")} />
    <SerifLabel text={"a lungo\ntermine"} delay={at(t0, "lungo") + 2} size={78} color={colors.white} style={{ left: 540, top: 440, textAlign: "left" }} />
  </Split>
);

/* "Gli estrogeni, con il 17-beta estradiolo in prima fila" — definition card */
export const Estradiolo: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d = at(t0, "17-beta");
  const p = usePop(d, 11);
  return (
    <Fill bg="grey">
      <SerifLabel text="gli estrogeni" delay={at(t0, "estrogeni")} size={110} style={{ left: 0, right: 0, top: 520 }} />
      <div
        style={{
          position: "absolute",
          left: 110,
          width: 860,
          top: 760,
          padding: "46px 40px",
          background: colors.white,
          border: `8px solid ${colors.printInk}`,
          borderRadius: 26,
          textAlign: "center",
          transform: `scale(${p}) rotate(${-2 * p}deg)`,
          opacity: frame < d ? 0 : 1,
          filter: "url(#sticker)",
          boxShadow: "0 24px 50px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 92, letterSpacing: "-0.04em", color: colors.printInk }}>
          17β-ESTRADIOLO
        </div>
        <div style={{ marginTop: 18, fontFamily: sans, fontSize: 40, color: colors.greyDark, letterSpacing: "-0.01em" }}>
          IN PRIMA FILA TRA GLI <b style={{ color: colors.coral }}>ESTROGENI</b>
        </div>
      </div>
      <Sfx at={d} name="pop2" volume={0.5} />
      <Sfx at={d + 4} name="typing" volume={0.3} />
    </Fill>
  );
};

/* "sono dei grandi protettori" */
export const Protettori: React.FC<SceneProps> = ({ t0 }) => (
  <Split t0={t0} bg="mint">
    <Emoji name="shield" x={540} y={330} size={380} delay={at(t0, "protettori") - 4} />
    <Emoji name="sparkle" x={760} y={160} size={140} delay={at(t0, "protettori") + 4} volume={0.3} />
    <SerifLabel text="grandi protettori" delay={at(t0, "protettori")} size={80} color={colors.white} style={{ left: 0, right: 0, top: 600 }} />
  </Split>
);

/* What they protect — six icons stacking up in a grid. The same grid comes
   back in several short split shots: icons named earlier are already there,
   the new ones pop in, and the shot returns to the speaker in between. */
export const BENEFITS: StackItem[] = [
  { word: "l'osso", emoji: "bone", label: "osso" },
  { word: "vasi", emoji: "heartpulse", label: "vasi e cuore" },
  { word: "umore", emoji: "smile", label: "umore" },
  { word: "sonno", emoji: "yawn", label: "sonno" },
  { word: "memoria", emoji: "brain", label: "memoria" },
  { word: "pelle", emoji: "waterdrop", label: "pelle e mucose" },
];

export const Benefici: React.FC<SceneProps & { upTo: number }> = ({ t0, upTo }) => (
  <Split t0={t0}>
    <StackGrid t0={t0} since={18} cols={3} top={170} rowH={360} size={170} items={BENEFITS.slice(0, upTo)} />
  </Split>
);

/* "In età fertile … una sorta di scudo ormonale su più fronti." */
export const Scudo: React.FC<SceneProps> = ({ t0 }) => {
  const dS = at(t0, "scudo");
  const dF = at(t0, "fronti");
  const ring = ["bone", "heartpulse", "smile", "yawn", "brain", "waterdrop"];
  return (
    <Fill bg="mint">
      <Emoji name="shield" x={540} y={900} size={620} delay={dS} />
      <Emoji name="thinker" x={540} y={1000} size={300} delay={0} />
      {ring.map((n, i) => {
        const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
        return <Emoji key={n} name={n} x={540 + Math.cos(a) * 420} y={900 + Math.sin(a) * 470} size={150} delay={dF + i * 2} volume={0.25} />;
      })}
      <SerifLabel text="scudo ormonale" delay={dS + 2} size={96} color={colors.white} style={{ left: 0, right: 0, top: 1560 }} />
    </Fill>
  );
};

/* "Il punto di svolta è la menopausa." */
export const Menopausa: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="black">
    <Pill text="MENOPAUSA" delay={at(t0, "menopausa")} top={560} size={110} />
  </Fill>
);

/* "Quando la produzione di estrogeni cala … questo scudo si abbassa." */
export const ScudoGiu: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dC = at(t0, "cala");
  const dA = at(t0, "abbassa");
  const drop = spring({ frame: frame - dA, fps, config: { damping: 9, mass: 0.8 } });
  const grey = interpolate(frame, [dA, dA + 10], [0, 1], clamp);
  const arrow = usePop(dC, 10);
  return (
    <Split t0={t0}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: PANEL, transform: `translateY(${drop * 260}px) rotate(${drop * 8}deg)`, transformOrigin: "540px 330px" }}>
        <Emoji name="shield" x={540} y={330} size={380} delay={0} grey={grey} />
      </div>
      <div style={{ position: "absolute", left: 790, top: 180, transform: `scale(${arrow})`, opacity: frame < dC ? 0 : 1 }}>
        <svg width={140} height={200} viewBox="0 0 140 200" style={{ filter: "url(#print)" }}>
          <path d="M70 12 V170 M22 120 L70 180 L118 120" fill="none" stroke={colors.coral} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <SerifLabel text="estrogeni" delay={dC} size={62} color={colors.coral} style={{ left: 730, top: 400 }} />
      <Sfx at={dC} name="whoosh_down" volume={0.4} />
      <Sfx at={dA} name="powerdown" volume={0.45} />
    </Split>
  );
};

/* Consequences — four icons stacking up on coral */
export const Conseguenze: React.FC<SceneProps> = ({ t0 }) => (
  <Split t0={t0} bg="coral" punch={["accelera", "maschile"]}>
    <StackGrid
      t0={t0}
      cols={2}
      top={170}
      rowH={380}
      size={180}
      labelColor={colors.white}
      items={[
        { word: "densità", emoji: "bone", label: "densità ossea" },
        { word: "profilo", emoji: "heartpulse", label: "profilo\ncardiovascolare" },
        { word: "vampate", emoji: "flame", label: "vampate" },
        { word: "disturbi", emoji: "yawn", label: "disturbi\ndel sonno" },
      ]}
    />
  </Split>
);

/* "un passaggio fisiologico, non una malattia" */
export const Fisiologico: React.FC<SceneProps> = ({ t0 }) => {
  const dM = at(t0, "malattia");
  return (
    <Fill bg="grey">
      <Pill text="passaggio fisiologico" delay={at(t0, "passaggio")} top={620} bg={colors.mint} color={colors.printInk} size={72} tilt={-2} />
      <Emoji name="check" x={930} y={600} size={130} delay={at(t0, "fisiologico")} volume={0.3} />
      <Pill text="malattia" delay={dM} top={1020} size={80} tilt={3} />
      <Scribble
        delay={dM + 6}
        viewBox="0 0 1080 1920"
        width={12}
        len={700}
        color={colors.printInk}
        d="M330 1085 L760 1095"
        style={{ left: 0, top: 0, width: 1080, height: 1920 }}
      />
    </Fill>
  );
};

/* "E le terapie ormonali?" */
export const Terapie: React.FC<SceneProps> = () => (
  <Fill bg="grey">
    <Emoji name="thinker" x={540} y={860} size={500} delay={0} />
    <Word3D text="?" size={240} top={440} delay={8} color={colors.coral} depthColor="#8E2236" rotate={12} />
    <SerifLabel text={"e le terapie\normonali?"} delay={2} size={110} style={{ left: 0, right: 0, top: 1180 }} />
  </Fill>
);

/* "uno strumento fondamentale per gestire … i sintomi" */
export const Strumento: React.FC<SceneProps> = ({ t0 }) => (
  <Split t0={t0} bg="mint">
    <Emoji name="pill" x={420} y={300} size={310} delay={2} />
    <Emoji name="check" x={720} y={200} size={160} delay={at(t0, "esistono")} volume={0.3} />
    <SerifLabel text={"strumento\nfondamentale"} delay={at(t0, "fondamentale")} size={84} color={colors.white} style={{ left: 0, right: 0, top: 520 }} />
  </Split>
);

/* "ma per prevenire patologie correlate" */
export const Prevenire: React.FC<SceneProps> = ({ t0 }) => (
  <Split t0={t0}>
    <Emoji name="shield" x={540} y={290} size={330} delay={at(t0, "prevenire")} />
    <Pill text="prevenire" delay={at(t0, "prevenire") + 4} top={500} size={70} bg={colors.mint} color={colors.printInk} />
    <SerifLabel text="le patologie correlate" delay={at(t0, "patologie")} size={58} style={{ left: 0, right: 0, top: 660 }} />
  </Split>
);

/* Closing logo */
export const Logo: React.FC = () => {
  const p = usePop(2, 12);
  return (
    <Fill bg="black">
      <Img
        src={staticFile("nadig/logo-white.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: p,
          transform: `scale(${1.2 + 0.5 * p})`,
        }}
      />
      <Sfx at={2} name="ding" volume={0.35} />
    </Fill>
  );
};
