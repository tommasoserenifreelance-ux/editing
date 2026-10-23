import React from "react";
import {
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Battery, Tag, TalkingHead } from "../Nad/scenes";
import {
  Emoji,
  Fill,
  GridFloor,
  Link,
  Scribble,
  SerifLabel,
  Sfx,
  usePop,
  Word3D,
} from "../Testosterone/primitives";
import { colors, FPS, sans, sec } from "../Testosterone/theme";
import { wt } from "./captions";

/*
 * Vertical (1080x1920) Instagram cut of the NAD episode: same scenes as
 * the YouTube version, re-laid out in a column like the testosterone reel.
 */

type SceneProps = { t0: number };

const at = (t0: number, word: string) => sec(wt(word, t0) - t0);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const HEAD_ANCHOR_V = "47% 8%";

export const Speaker: React.FC<{
  start: number;
  framing: "wide" | "close";
  punch?: number[];
}> = (p) => (
  <TalkingHead
    {...p}
    src="nadig/clip.mp4"
    anchor={HEAD_ANCHOR_V}
    closeScale={1.3}
  />
);

const Heading: React.FC<{
  text: string;
  top: number;
  color?: string;
  size?: number;
}> = ({ text, top, color = colors.ink, size = 52 }) => (
  <div
    style={{
      position: "absolute",
      top,
      width: "100%",
      textAlign: "center",
      fontFamily: sans,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.03em",
      color,
    }}
  >
    {text}
  </div>
);

/* "molecole della longevità" */
export const Serie: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <Emoji name="molecule" x={540} y={640} size={460} delay={0} />
    <Heading text="la serie" top={950} />
    <SerifLabel
      text={"molecole della\nlongevità"}
      delay={at(t0, "molecole")}
      size={120}
      style={{ left: 0, right: 0, top: 1030 }}
    />
    <Scribble
      delay={at(t0, "longevità") + 4}
      viewBox="0 0 1080 1920"
      width={14}
      len={1000}
      d="M250 1290 C 420 1250, 640 1330, 840 1270"
      style={{ left: 0, top: 0, width: 1080, height: 1920 }}
    />
  </Fill>
);

/* "il NAD e i suoi precursori, come NMN e NR" */
export const NadPrecursori: React.FC<SceneProps> = ({ t0 }) => {
  const dM = at(t0, "NMN");
  const dR = at(t0, "NR");
  return (
    <Fill bg="black">
      <Word3D text="NAD" size={280} top={520} delay={0} />
      <Scribble
        delay={8}
        viewBox="0 0 1080 1920"
        len={800}
        d="M300 880 C 420 830, 620 920, 790 860"
        style={{ left: 0, top: 0, width: 1080, height: 1920 }}
      />
      <SerifLabel
        text="i suoi precursori"
        delay={at(t0, "precursori")}
        size={76}
        color={colors.yellow}
        style={{ left: 0, right: 0, top: 960 }}
      />
      <Link x1={420} y1={1060} x2={300} y2={1160} delay={dM - 6} color={colors.yellow} dashed width={7} />
      <Link x1={660} y1={1060} x2={780} y2={1160} delay={dR - 6} color={colors.yellow} dashed width={7} />
      <Tag text="NMN" x={300} top={1160} tilt={-6} delay={dM} bg={colors.coral} />
      <Tag text="NR" x={780} top={1160} tilt={6} delay={dR} bg={colors.mint} />
    </Fill>
  );
};

/* "Pensa al NAD come una batteria dentro ogni tua cellula." */
export const BatteriaCellula: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const dB = at(t0, "batteria");
  const dC = at(t0, "cellula");
  const pB = usePop(dB, 10);
  const pC = usePop(dC, 12);
  const ring = interpolate(frame, [dC, dC + 14], [0, 1], clamp);
  return (
    <Fill bg="mint">
      <Heading text="pensa al NAD come…" top={330} color={colors.white} size={58} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <circle
          cx={540}
          cy={960}
          r={420 * (0.85 + 0.15 * pC)}
          fill="#7EDDBC"
          stroke={colors.printInk}
          strokeWidth={12}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ring}
          fillOpacity={ring * 0.9}
          style={{ filter: "url(#print)" }}
        />
        <ellipse cx={330} cy={760} rx={40} ry={24} fill={colors.brand} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
        <ellipse cx={760} cy={1180} rx={36} ry={22} fill={colors.coral} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
        <ellipse cx={780} cy={760} rx={28} ry={18} fill={colors.white} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 960 - 190,
          transform: `scale(${pB}) rotate(${interpolate(pB, [0, 1], [-14, -4])}deg)`,
          opacity: frame < dB ? 0 : 1,
        }}
      >
        <Battery level={1} size={600} />
      </div>
      <Sfx at={dB} name="pop2" volume={0.55} />
      <Sfx at={dC} name="draw" volume={0.45} />
      <SerifLabel text="cellula" delay={dC + 4} size={96} color={colors.white} style={{ left: 0, right: 0, top: 1440 }} />
    </Fill>
  );
};

/* "E come ogni batteria, con l'età si scarica." */
export const Scarica: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d0 = at(t0, "l'età");
  const d1 = at(t0, "scarica") + 12;
  const level = interpolate(frame, [d0, d1], [1, 0.18], clamp);
  const age = Math.round(interpolate(frame, [d0, d1], [20, 70], clamp));
  const shake = frame > d1 - 6 && frame < d1 + 6 ? Math.sin(frame * 2.4) * 6 : 0;
  return (
    <Fill bg="coral">
      <div style={{ position: "absolute", left: 540 - 330, top: 520, transform: `translateX(${shake}px) rotate(-4deg)` }}>
        <Battery level={level} size={660} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1180,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 130,
          letterSpacing: "-0.04em",
          color: colors.white,
          filter: "url(#print)",
        }}
      >
        {age} anni
      </div>
      <Sfx at={d0} name="powerdown" volume={0.5} />
      <Sfx at={d0} name="counter" volume={0.3} />
    </Fill>
  );
};

/* "Cos'è? Perché conta?" */
export const Domanda: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="black">
    <Word3D text="?" size={300} top={480} delay={at(t0, "conta")} color={colors.yellow} depthColor="#A88A00" rotate={10} />
  </Fill>
);

/* Speaker card on top, two items below (vertical version of CardScene) */
const CARD = { x: 230, y: 200, w: 620, h: 860 };

export const EnergiaDna: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const items = [
    { word: "energia", emoji: "bolt", label: "produrre\nenergia", x: 290 },
    { word: "DNA", emoji: "dna", label: "riparare\nil DNA", x: 790 },
  ];
  const rowY = 1400;
  return (
    <Fill bg="white">
      <GridFloor top={1000} width={1000} opacity={interpolate(frame, [6, 14], [0, 0.55], clamp)} />
      {items.map((it) => (
        <Link key={`l${it.word}`} x1={540} y1={CARD.y + CARD.h} x2={it.x} y2={rowY - 150} delay={at(t0, it.word) - 4} dashed width={7} />
      ))}
      {items.map((it) => (
        <React.Fragment key={it.word}>
          <Emoji name={it.emoji} x={it.x} y={rowY} size={260} delay={at(t0, it.word)} />
          <SerifLabel text={it.label} delay={at(t0, it.word) + 2} size={72} style={{ left: it.x - 250, width: 500, top: rowY + 160 }} />
        </React.Fragment>
      ))}
      <div
        style={{
          position: "absolute",
          left: lerp(0, CARD.x),
          top: lerp(0, CARD.y),
          width: lerp(1080, CARD.w),
          height: lerp(1920, CARD.h),
          borderRadius: lerp(0, 40),
          overflow: "hidden",
          boxShadow: `0 30px 70px rgba(0,0,0,${0.25 * p})`,
          transform: `rotate(${lerp(0, -3)}deg)`,
        }}
      >
        <OffthreadVideo
          src={staticFile("nadig/clip.mp4")}
          startFrom={Math.round(t0 * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }}
        />
      </div>
      <Sfx at={0} name="whoosh_long" volume={0.35} />
    </Fill>
  );
};

/* "la sopravvivenza delle cellule" */
export const Sopravvivenza: React.FC<SceneProps> = ({ t0 }) => {
  const dC = at(t0, "cellule");
  return (
    <Fill bg="white">
      <Word3D text="SOPRAVVIVENZA" size={100} top={640} delay={0} />
      {[250, 540, 830].map((x, i) => (
        <Emoji key={x} name="cell" x={x} y={1180} size={i === 1 ? 280 : 220} delay={dC + i * 3} />
      ))}
    </Fill>
  );
};

/* "Ne abbiamo parlato anche per le flebo." */
export const Flebo: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <Emoji name="flebo" x={540} y={760} size={560} delay={2} />
    <Heading text="ne abbiamo parlato per le" top={1120} size={54} />
    <SerifLabel text="flebo" delay={at(t0, "flebo")} size={180} style={{ left: 0, right: 0, top: 1200 }} />
  </Fill>
);

/* "la pillola, la capsula, la compressa" */
export const ViaOrale: React.FC<SceneProps> = ({ t0 }) => {
  const items = [
    { word: "pillola", emoji: "tablet", label: "pillola", y: 640 },
    { word: "capsula", emoji: "pill", label: "capsula", y: 1000 },
    { word: "compressa", emoji: "compressa", label: "compressa", y: 1360 },
  ];
  return (
    <Fill bg="coral">
      <Heading text="via orale" top={320} color={colors.white} size={64} />
      {items.map((it) => (
        <React.Fragment key={it.word}>
          <Emoji name={it.emoji} x={380} y={it.y} size={290} delay={at(t0, it.word)} />
          <SerifLabel text={it.label} delay={at(t0, it.word) + 2} size={86} color={colors.white} style={{ left: 560, top: it.y - 44 }} />
        </React.Fragment>
      ))}
    </Fill>
  );
};

/* "complementare a quella endovenosa" */
export const Complementare: React.FC<SceneProps> = ({ t0 }) => {
  const dE = at(t0, "endovenosa");
  return (
    <Fill bg="white">
      <Emoji name="pill" x={540} y={520} size={340} delay={0} />
      <SerifLabel text="via orale" delay={2} size={84} style={{ left: 0, right: 0, top: 720 }} />
      <Word3D text="+" size={220} top={830} delay={6} color={colors.yellow} depthColor="#A88A00" rotate={0} />
      <Emoji name="flebo" x={540} y={1300} size={380} delay={dE} />
      <SerifLabel text="endovenosa" delay={dE + 2} size={84} style={{ left: 0, right: 0, top: 1510 }} />
    </Fill>
  );
};

/* Closing card: logo + "continua nel video integrale — link in bio" */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const pLogo = usePop(2, 12);
  const pText = interpolate(frame, [14, 22], [0, 1], clamp);
  const pArrow = usePop(26, 9);
  const bob = Math.sin(frame / 6) * 10;
  return (
    <Fill bg="black">
      {/* the logo file is a full 1080x1920 frame with the mark centred */}
      <Img
        src={staticFile("nadig/logo-white.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          opacity: pLogo,
          transform: `translateY(-150px) scale(${1.1 + 0.5 * pLogo})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1120,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 60,
          letterSpacing: "-0.02em",
          color: colors.white,
          opacity: pText,
          transform: `translateY(${(1 - pText) * 20}px)`,
        }}
      >
        Continua nel video integrale
      </div>
      <SerifLabel text="link in bio" delay={20} size={110} color={colors.brand} style={{ left: 0, right: 0, top: 1210 }} />
      <svg
        width={120}
        height={140}
        viewBox="0 0 120 140"
        style={{ position: "absolute", left: 480, top: 1380 + bob, transform: `scale(${pArrow})`, filter: "url(#print)" }}
      >
        <path d="M60 130 V20 M18 60 L60 14 L102 60" fill="none" stroke={colors.brand} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Sfx at={2} name="pop2" volume={0.5} />
      <Sfx at={20} name="typing" volume={0.35} />
      <Sfx at={26} name="ding" volume={0.35} />
    </Fill>
  );
};
