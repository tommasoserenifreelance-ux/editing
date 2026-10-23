import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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
import { Illo } from "../Testosterone/illos";
import { colors, FPS, sans, sec } from "../Testosterone/theme";
import { wt } from "./captions";

type SceneProps = { t0: number };

// Frame (relative to the scene start) at which a spoken word begins.
const at = (t0: number, word: string) => sec(wt(word, t0) - t0);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Heading: React.FC<{
  text: string;
  top: number;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({ text, top, color = colors.ink, size = 56, opacity = 1 }) => (
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
      opacity,
    }}
  >
    {text}
  </div>
);

/* ------------------------------------------------------------------ */
/* Speaker                                                              */
/* ------------------------------------------------------------------ */

export const HEAD_ANCHOR = "53% 6%";

/**
 * The 4K source lets us alternate a wide shot and a tight close-up on the
 * face; each cut lands with a small punch, plus punches on key words.
 */
export const TalkingHead: React.FC<{
  start: number;
  framing: "wide" | "close";
  punch?: number[]; // seconds relative to scene start
}> = ({ start, framing, punch = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = spring({ frame, fps, config: { damping: 20, mass: 0.5 } });
  let scale =
    (framing === "close" ? 1.5 : 1) * interpolate(settle, [0, 1], [1.05, 1]);
  for (const p of punch) {
    const f = Math.round(p * fps);
    if (frame >= f) {
      scale += 0.1 * spring({ frame: frame - f, fps, config: { damping: 18 } });
    }
  }
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("nad/clip.mp4")}
        startFrom={Math.round(start * FPS)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          // anchored on the top of the head so no zoom ever crops it
          transformOrigin: HEAD_ANCHOR,
        }}
      />
      {punch.map((p) => (
        <Sfx key={p} at={p * fps - 2} name="swoosh" volume={0.16} />
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Battery (animated level)                                             */
/* ------------------------------------------------------------------ */

const Battery: React.FC<{
  level: number; // 0..1
  size: number;
  label?: string;
}> = ({ level, size, label = "NAD" }) => {
  const bars = 4;
  const lit = level * bars;
  const fill = level > 0.5 ? colors.brand : level > 0.25 ? "#F59E3B" : colors.coral;
  return (
    <svg
      viewBox="-20 -20 340 200"
      width={size}
      height={(size * 200) / 340}
      style={{ filter: "url(#sticker)", overflow: "visible" }}
    >
      <rect x="0" y="0" width="270" height="160" rx="26" fill={colors.white} stroke={colors.printInk} strokeWidth={10} />
      <rect x="270" y="50" width="26" height="60" rx="8" fill={colors.printInk} />
      {Array.from({ length: bars }, (_, i) => {
        const k = Math.max(0, Math.min(1, lit - i));
        return (
          <rect
            key={i}
            x={18 + i * 62}
            y={18}
            width={52}
            height={124}
            rx={10}
            fill={fill}
            opacity={k}
            stroke={colors.printInk}
            strokeWidth={k > 0 ? 5 : 0}
          />
        );
      })}
      <text
        x="135"
        y="98"
        textAnchor="middle"
        fontFamily={sans}
        fontWeight={700}
        fontSize={56}
        fill={colors.printInk}
        letterSpacing="-2"
      >
        {label}
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Card + items (landscape)                                             */
/* ------------------------------------------------------------------ */

type CardItem = { word: string; emoji: string; label: string };

const CARD = { x: 130, y: 250, w: 860, h: 484 };

/**
 * The speaker shrinks into a card on the left; items pop in a column on
 * the right, linked from the card's edge, with labels to their right so
 * no line crosses text.
 */
export const CardScene: React.FC<
  SceneProps & { items: CardItem[]; bg?: "white" | "mint" | "coral" }
> = ({ t0, items, bg = "white" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const n = items.length;
  const gap = n === 2 ? 340 : 270;
  const y0 = 540 - ((n - 1) * gap) / 2;
  const ex = 1250;
  const size = n === 2 ? 230 : 190;
  return (
    <Fill bg={bg}>
      <GridFloor
        top={680}
        width={1100}
        cx={CARD.x + CARD.w / 2}
        opacity={interpolate(frame, [6, 14], [0, 0.55], clamp)}
      />
      {items.map((it, i) => (
        <Link
          key={`l${i}`}
          x1={CARD.x + CARD.w}
          y1={CARD.y + CARD.h / 2}
          x2={ex - size * 0.55}
          y2={y0 + i * gap}
          delay={at(t0, it.word) - 4}
          dashed
          width={7}
          color={bg === "white" ? colors.blue : colors.white}
        />
      ))}
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Emoji
            name={it.emoji}
            x={ex}
            y={y0 + i * gap}
            size={size}
            delay={at(t0, it.word)}
          />
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={n === 2 ? 76 : 62}
            color={bg === "white" ? colors.ink : colors.white}
            style={{
              left: ex + size * 0.62,
              top: y0 + i * gap - (it.label.split("\n").length * (n === 2 ? 76 : 62) * 0.92) / 2,
              textAlign: "left",
            }}
          />
        </React.Fragment>
      ))}
      <div
        style={{
          position: "absolute",
          left: lerp(0, CARD.x),
          top: lerp(0, CARD.y),
          width: lerp(1920, CARD.w),
          height: lerp(1080, CARD.h),
          borderRadius: lerp(0, 36),
          overflow: "hidden",
          boxShadow: `0 30px 70px rgba(0,0,0,${0.28 * p})`,
          transform: `rotate(${lerp(0, -2.5)}deg)`,
        }}
      >
        <OffthreadVideo
          src={staticFile("nad/clip.mp4")}
          startFrom={Math.round(t0 * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <Sfx at={0} name="whoosh_long" volume={0.35} />
    </Fill>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                               */
/* ------------------------------------------------------------------ */

/* "molecole della longevità" — series opener */
export const Serie: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <Emoji name="molecule" x={560} y={520} size={420} delay={0} />
    <Heading text="la serie" top={300} size={52} />
    <SerifLabel
      text={"molecole della\nlongevità"}
      delay={at(t0, "molecole")}
      size={130}
      style={{ left: 860, top: 390, textAlign: "left" }}
    />
    <Scribble
      delay={at(t0, "longevità") + 4}
      viewBox="0 0 1920 1080"
      width={14}
      len={1200}
      d="M880 680 C 1060 640, 1260 720, 1500 660"
      style={{ left: 0, top: 0, width: 1920, height: 1080 }}
    />
  </Fill>
);

/* "il NAD e i suoi precursori, come NMN e NR" */
const Tag: React.FC<{ text: string; x: number; delay: number; bg: string }> = ({
  text,
  x,
  delay,
  bg,
}) => {
  const p = usePop(delay, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 190,
        top: 780,
        width: 380,
        height: 150,
        borderRadius: 75,
        background: bg,
        border: `8px solid ${colors.printInk}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 92,
        letterSpacing: "-0.03em",
        color: colors.printInk,
        transform: `scale(${p}) rotate(${(x < 960 ? -6 : 6) * p}deg)`,
        filter: "url(#sticker)",
      }}
    >
      {text}
      <Sfx at={delay} name={x < 960 ? "pop1" : "pop2"} volume={0.5} />
    </div>
  );
};

export const NadPrecursori: React.FC<SceneProps> = ({ t0 }) => {
  const dM = at(t0, "NMN");
  const dR = at(t0, "NR");
  return (
    <Fill bg="black">
      <Word3D text="NAD" size={300} top={150} delay={0} />
      <Scribble
        delay={8}
        viewBox="0 0 1920 1080"
        len={900}
        d="M720 520 C 840 470, 1020 560, 1210 500"
        style={{ left: 0, top: 0, width: 1920, height: 1080 }}
      />
      <SerifLabel
        text="i suoi precursori"
        delay={at(t0, "precursori")}
        size={70}
        color={colors.yellow}
        style={{ left: 0, right: 0, top: 580 }}
      />
      <Link x1={800} y1={680} x2={600} y2={770} delay={dM - 6} color={colors.yellow} dashed width={7} />
      <Link x1={1120} y1={680} x2={1320} y2={770} delay={dR - 6} color={colors.yellow} dashed width={7} />
      <Tag text="NMN" x={520} delay={dM} bg={colors.coral} />
      <Tag text="NR" x={1400} delay={dR} bg={colors.mint} />
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
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <circle
          cx={960}
          cy={500}
          r={380 * (0.85 + 0.15 * pC)}
          fill="#7EDDBC"
          stroke={colors.printInk}
          strokeWidth={12}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ring}
          fillOpacity={ring * 0.9}
          style={{ filter: "url(#print)" }}
        />
        <ellipse cx={720} cy={330} rx={44} ry={26} fill={colors.brand} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
        <ellipse cx={1200} cy={680} rx={38} ry={22} fill={colors.coral} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
        <ellipse cx={1240} cy={330} rx={30} ry={18} fill={colors.white} stroke={colors.printInk} strokeWidth={6} opacity={ring} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 500 - 200,
          transform: `scale(${pB}) rotate(${interpolate(pB, [0, 1], [-14, -4])}deg)`,
          opacity: frame < dB ? 0 : 1,
        }}
      >
        <Battery level={1} size={660} />
      </div>
      <Heading text="pensa al NAD come…" top={110} color={colors.white} size={60} />
      <Sfx at={dB} name="pop2" volume={0.55} />
      <Sfx at={dC} name="draw" volume={0.45} />
      <SerifLabel text="cellula" delay={dC + 4} size={86} color={colors.white} style={{ left: 1330, top: 760 }} />
    </Fill>
  );
};

/* "E come ogni batteria, con l'età si scarica." */
export const Scarica: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d0 = at(t0, "l'età");
  const d1 = at(t0, "scarica") + 14;
  const level = interpolate(frame, [d0, d1], [1, 0.18], clamp);
  const age = Math.round(interpolate(frame, [d0, d1], [20, 70], clamp));
  const shake = frame > d1 - 6 && frame < d1 + 6 ? Math.sin(frame * 2.4) * 6 : 0;
  return (
    <Fill bg="coral">
      <div style={{ position: "absolute", left: 960 - 330, top: 150, transform: `translateX(${shake}px) rotate(-4deg)` }}>
        <Battery level={level} size={660} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 600,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 120,
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
    <Word3D
      text="?"
      size={260}
      top={90}
      delay={at(t0, "conta")}
      color={colors.yellow}
      depthColor="#A88A00"
      rotate={10}
    />
  </Fill>
);

/* "Serve a produrre energia e a riparare il DNA." */
export const EnergiaDna: React.FC<SceneProps> = ({ t0 }) => (
  <CardScene
    t0={t0}
    items={[
      { word: "energia", emoji: "bolt", label: "produrre\nenergia" },
      { word: "DNA", emoji: "dna", label: "riparare\nil DNA" },
    ]}
  />
);

/* "la sopravvivenza delle cellule" */
export const Sopravvivenza: React.FC<SceneProps> = ({ t0 }) => {
  const dC = at(t0, "cellule");
  return (
    <Fill bg="white">
      <Word3D text="SOPRAVVIVENZA" size={170} top={170} delay={0} />
      {[560, 960, 1360].map((x, i) => (
        <Emoji key={x} name="cell" x={x} y={700} size={i === 1 ? 300 : 240} delay={dC + i * 3} />
      ))}
    </Fill>
  );
};

/* "Ne abbiamo parlato anche per le flebo." */
export const Flebo: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <Emoji name="flebo" x={640} y={500} size={500} delay={2} />
    <div
      style={{
        position: "absolute",
        left: 1000,
        top: 360,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 52,
        letterSpacing: "-0.03em",
        color: colors.ink,
      }}
    >
      ne abbiamo parlato per le
    </div>
    <SerifLabel text="flebo" delay={at(t0, "flebo")} size={180} style={{ left: 1000, top: 440 }} />
  </Fill>
);

/* "la pillola, la capsula, la compressa" */
export const ViaOrale: React.FC<SceneProps> = ({ t0 }) => {
  const items = [
    { word: "pillola", emoji: "tablet", label: "pillola", x: 480 },
    { word: "capsula", emoji: "pill", label: "capsula", x: 960 },
    { word: "compressa", emoji: "compressa", label: "compressa", x: 1440 },
  ];
  return (
    <Fill bg="coral">
      <Heading text="via orale" top={140} color={colors.white} size={64} />
      {items.map((it) => (
        <React.Fragment key={it.word}>
          <Emoji name={it.emoji} x={it.x} y={510} size={320} delay={at(t0, it.word)} />
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={80}
            color={colors.white}
            style={{ left: it.x - 250, width: 500, top: 700 }}
          />
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
      <Emoji name="pill" x={560} y={470} size={360} delay={0} />
      <SerifLabel text="via orale" delay={2} size={84} style={{ left: 310, width: 500, top: 690 }} />
      <Word3D text="+" size={240} top={300} delay={6} color={colors.yellow} depthColor="#A88A00" rotate={0} />
      <Emoji name="flebo" x={1360} y={470} size={380} delay={dE} />
      <SerifLabel text="endovenosa" delay={dE + 2} size={84} style={{ left: 1110, width: 500, top: 690 }} />
    </Fill>
  );
};

/* "mattoni presi per bocca … per fabbricare NAD" */
export const Mattoni: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dBrick = at(t0, "mattoni");
  const dBuild = at(t0, "fabbricare");
  const dNad = at(t0, "NAD");
  const fly = spring({ frame: frame - dBuild, fps, config: { damping: 14, mass: 0.6 } });
  const pN = usePop(dNad, 9);
  const brick = (name: string, label: string, x0: number, y0: number, d: number) => {
    const x = x0 + (1300 - x0) * fly;
    const y = y0 + (520 - y0) * fly;
    return (
      <>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${1 - 0.55 * fly})`, transformOrigin: `${x}px ${y}px`, opacity: 1 - fly * 0.9 }}>
          <Emoji name={name} x={x} y={y} size={420} delay={d} />
          <div
            style={{
              position: "absolute",
              left: x - 210,
              top: y - 30,
              width: 360,
              textAlign: "center",
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 80,
              color: colors.white,
              opacity: frame < d + 4 ? 0 : 1,
              textShadow: `0 3px 0 ${colors.printInk}`,
            }}
          >
            {label}
          </div>
        </div>
      </>
    );
  };
  return (
    <Fill bg="mint">
      {brick("brickNMN", "NMN", 480, 420, dBrick)}
      {brick("brickNR", "NR", 760, 700, dBrick + 4)}
      <SerifLabel text="mattoni" delay={dBrick + 6} size={90} color={colors.white} style={{ left: 150, top: 120 }} />
      <Sfx at={dBuild} name="whoosh" volume={0.45} />
      <div
        style={{
          position: "absolute",
          left: 1300 - 300,
          top: 520 - 180,
          transform: `scale(${pN}) rotate(${interpolate(pN, [0, 1], [-14, -3])}deg)`,
          opacity: frame < dNad ? 0 : 1,
        }}
      >
        <Battery level={1} size={600} />
      </div>
      <Sfx at={dNad} name="ding" volume={0.35} />
    </Fill>
  );
};

/* "Ma cosa dicono gli studi?" */
export const Studi: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <Emoji name="study" x={700} y={540} size={460} delay={2} />
    <SerifLabel text={"cosa dicono\ngli studi?"} delay={at(t0, "dicono")} size={120} style={{ left: 1000, top: 400, textAlign: "left" }} />
  </Fill>
);

/* "aumentano effettivamente i livelli di NAD" — the battery recharges */
export const Aumentano: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d = at(t0, "aumentano");
  const dOk = at(t0, "effettivamente");
  const level = interpolate(frame, [d, dOk + 8], [0.2, 1], clamp);
  const pulse = frame > d && frame < dOk + 8 ? 1 + Math.sin(frame / 2.2) * 0.015 : 1;
  const bolt = usePop(d, 9);
  return (
    <Fill bg="mint">
      <Heading text="livelli di NAD" top={120} color={colors.white} size={60} />
      <div style={{ position: "absolute", left: 960 - 380, top: 280, transform: `scale(${pulse}) rotate(-3deg)` }}>
        <Battery level={level} size={760} />
      </div>
      <div style={{ position: "absolute", left: 1330, top: 220, transform: `scale(${bolt}) rotate(${-14 * bolt}deg)`, opacity: frame < d ? 0 : 1 }}>
        <Emoji name="bolt" x={90} y={90} size={200} delay={d} />
      </div>
      <Sfx at={d} name="riser" volume={0.4} />
      <Emoji name="check" x={560} y={760} size={190} delay={dOk} />
      <SerifLabel text="aumentano" delay={dOk + 2} size={86} color={colors.white} style={{ left: 680, top: 715 }} />
    </Fill>
  );
};

/* "Tradurre quell'aumento in benefici clinici a lungo termine … embrionale" */
export const Benefici: React.FC<SceneProps> = ({ t0 }) => {
  const dB = at(t0, "benefici");
  const dU = at(t0, "nell'uomo");
  const dE = at(t0, "embrionale");
  return (
    <Fill bg="white">
      <div style={{ position: "absolute", left: 230, top: 330, transform: "rotate(-4deg)" }}>
        <Battery level={1} size={460} />
      </div>
      <Emoji name="check" x={640} y={300} size={150} delay={4} />
      <SerifLabel text={"più NAD"} delay={2} size={72} style={{ left: 260, width: 400, top: 650 }} />
      <Link x1={760} y1={470} x2={1150} y2={470} delay={dB - 4} color={colors.printInk} dashed width={8} />
      <Emoji name="hourglass" x={1380} y={450} size={320} delay={dB} />
      <SerifLabel text={"benefici clinici\na lungo termine"} delay={dB + 2} size={64} style={{ left: 1130, width: 500, top: 650 }} />
      <Word3D text="?" size={200} top={140} delay={dU} color={colors.coral} depthColor="#8E2236" rotate={12} />
      <SerifLabel text="in fase embrionale" delay={dE} size={70} color={colors.coral} style={{ left: 0, right: 0, top: 880 }} />
    </Fill>
  );
};

/* "molecole più studiate e promettenti … meritano attenzione" */
export const Promettenti: React.FC<SceneProps> = ({ t0 }) => (
  <CardScene
    t0={t0}
    items={[
      { word: "studiate", emoji: "microscope", label: "più studiate" },
      { word: "promettenti", emoji: "sparkle", label: "promettenti" },
      { word: "attenzione", emoji: "attention", label: "meritano\nattenzione" },
    ]}
  />
);

/* "Promettente non è ancora dimostrato" */
export const NonDimostrato: React.FC<SceneProps> = ({ t0 }) => {
  const dN = at(t0, "non");
  const dD = at(t0, "dimostrato");
  return (
    <Fill bg="black">
      <SerifLabel text="promettente" delay={0} size={140} color={colors.mint} style={{ left: 120, width: 760, top: 300 }} />
      <Word3D text="≠" size={260} top={230} delay={dN} color={colors.yellow} depthColor="#A88A00" rotate={0} />
      <SerifLabel text="dimostrato" delay={dD} size={140} color={colors.coral} style={{ left: 1040, width: 760, top: 300 }} />
    </Fill>
  );
};

/* "Il framing onesto è questo:" — soft, typed on paper */
export const Framing: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="white">
    <SerifLabel text="il framing onesto" delay={0} size={150} style={{ left: 0, right: 0, top: 380 }} />
    <div
      style={{
        position: "absolute",
        top: 600,
        width: "100%",
        textAlign: "center",
        fontFamily: sans,
        fontWeight: 700,
        fontSize: 60,
        letterSpacing: "-0.03em",
        color: colors.ink,
        opacity: interpolate(useCurrentFrame(), [at(t0, "questo") - 2, at(t0, "questo") + 6], [0, 1], clamp),
      }}
    >
      è questo:
    </div>
  </Fill>
);

/* "chi insegue ogni hype" */
export const Hype: React.FC<SceneProps> = ({ t0 }) => {
  const d = at(t0, "hype");
  return (
    <Fill bg="coral">
      <SerifLabel text="chi insegue ogni…" delay={0} size={90} color={colors.white} style={{ left: 0, right: 0, top: 110 }} />
      <Word3D text="HYPE" size={300} top={300} delay={d} color={colors.white} depthColor={colors.printInk} rotate={-8} />
      <Scribble
        delay={d + 8}
        viewBox="0 0 1920 1080"
        len={1600}
        width={22}
        color={colors.printInk}
        d="M560 430 L1380 740 M600 750 L1360 400"
        style={{ left: 0, top: 0, width: 1920, height: 1080 }}
      />
    </Fill>
  );
};

/* ------------------------------------------------------------------ */
/* YouTube call-to-action sticker (top right, over speaker shots)       */
/* ------------------------------------------------------------------ */

/**
 * Subscribe button pops in, a cursor slides in and clicks it (it turns
 * into "Iscritto"), then bell and thumbs-up pop next to it. ~3 s.
 */
export const Subscribe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const click = 26;
  const pIn = usePop(0, 11);
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  const press = frame >= click && frame < click + 4 ? 0.9 : 1;
  const done = frame >= click;
  const cur = spring({ frame: frame - 8, fps, config: { damping: 16, mass: 0.6 } });
  const curGone = interpolate(frame, [click + 10, click + 18], [1, 0], clamp);
  const ring = frame > click + 6 ? Math.sin((frame - click) / 1.6) * 14 * Math.exp(-(frame - click - 6) / 14) : 0;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: 1440,
          top: 70,
          width: 360,
          height: 120,
          borderRadius: 60,
          background: done ? "#ECE9EF" : "#E5322D",
          border: `7px solid ${colors.printInk}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 50,
          letterSpacing: "-0.02em",
          color: done ? colors.printInk : colors.white,
          transform: `scale(${pIn * press}) rotate(${-4 * pIn}deg)`,
          filter: "url(#sticker)",
        }}
      >
        {done ? "Iscritto ✓" : "ISCRIVITI"}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${ring}deg)`, transformOrigin: "1858px 95px" }}>
        <Emoji name="bell" x={1858} y={135} size={110} delay={click + 6} volume={0.4} />
      </div>
      <Emoji name="thumbup" x={1370} y={150} size={110} delay={click + 12} volume={0.4} />
      <div
        style={{
          position: "absolute",
          left: interpolate(cur, [0, 1], [1940, 1640]),
          top: interpolate(cur, [0, 1], [420, 150]),
          opacity: curGone * (frame < 8 ? 0 : 1),
          transform: `scale(${press})`,
        }}
      >
        <Illo name="cursor" size={110} />
      </div>
      <Sfx at={0} name="pop1" volume={0.45} />
      <Sfx at={click} name="tick" volume={0.7} />
      <Sfx at={click + 6} name="ding" volume={0.3} />
    </AbsoluteFill>
  );
};
