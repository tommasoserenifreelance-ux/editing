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
import { wt } from "./captions";
import {
  Belly,
  Body,
  Bolt,
  Bone,
  Brain,
  Cells,
  Couch,
  Dumbbell,
  Heart,
  Moon,
  Person,
  Scale,
  Smile,
  Storm,
} from "./icons";
import {
  Bubble,
  clipFor,
  CLIP_OFFSETS,
  Fill,
  GridFloor,
  Link,
  Scribble,
  SerifLabel,
  usePop,
  Word3D,
} from "./primitives";
import { colors, FPS, pastels, sans, sec } from "./theme";

type SceneProps = { t0: number };

// Frame (relative to the scene start) at which a spoken word begins.
const at = (t0: number, word: string) => sec(wt(word, t0) - t0);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/* "simbolo della mascolinità" — Mars symbol drawing itself */
export const Mascolinita: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 16], [0, 1], clamp);
  const p = usePop(0);
  return (
    <Fill bg={colors.white}>
      <svg
        viewBox="0 0 200 200"
        width={420}
        height={420}
        style={{
          position: "absolute",
          left: 330,
          top: 430,
          transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-20, 0])}deg)`,
          filter: `drop-shadow(0 0 24px ${colors.blue}66)`,
        }}
      >
        <circle
          cx="82"
          cy="118"
          r="56"
          fill="none"
          stroke={colors.blue}
          strokeWidth="20"
          strokeDasharray={352}
          strokeDashoffset={352 * (1 - draw)}
        />
        <path
          d="M122 78 L176 24 M130 24 H176 V70"
          fill="none"
          stroke={colors.blue}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={200}
          strokeDashoffset={200 * (1 - interpolate(frame, [8, 20], [0, 1], clamp))}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 1010,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 48,
          letterSpacing: "-0.03em",
          color: colors.ink,
        }}
      >
        simbolo della
      </div>
      <SerifLabel
        text="mascolinità"
        delay={at(t0, "mascolinità")}
        size={140}
        style={{ top: 1090, left: 0, right: 0 }}
      />
    </Fill>
  );
};

/* "il testosterone nell'uomo" — big 3D word on black */
export const TestoWord: React.FC<SceneProps> = ({ t0 }) => {
  const d = at(t0, "testosterone");
  return (
    <Fill bg={colors.black}>
      <Word3D text="TESTOSTERONE" size={132} top={760} delay={d} />
      <Scribble
        delay={d + 8}
        d="M150 120 C 320 60, 520 190, 700 110 S 930 70, 960 150"
        style={{ left: 0, top: 860, width: 1080, height: 400 }}
      />
      <SerifLabel
        text="nell'uomo"
        delay={at(t0, "nell'uomo")}
        size={110}
        color={colors.yellow}
        style={{ top: 1130, left: 0, right: 0 }}
      />
    </Fill>
  );
};

/* What it does — the speaker shrinks into a card, benefits pop around him */
const CARD = { x: 290, y: 140, w: 500, h: 680 };

export const Benefits: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const ci = clipFor(t0);
  const items = [
    { word: "massa", label: "forza\nmuscolare", icon: <Dumbbell />, x: 290, y: 1220 },
    { word: "densità", label: "densità\nossea", icon: <Bone />, x: 790, y: 1220 },
    { word: "globuli", label: "globuli\nrossi", icon: <Cells />, x: 290, y: 1640 },
    { word: "desiderio", label: "desiderio", icon: <Heart />, x: 790, y: 1640 },
  ];
  return (
    <Fill bg={colors.white}>
      <GridFloor top={720} width={1000} opacity={interpolate(frame, [6, 14], [0, 0.7], clamp)} />
      {items.map((it, i) => (
        <Link
          key={`l${i}`}
          x1={540}
          y1={CARD.y + CARD.h}
          x2={it.x}
          y2={it.y}
          delay={at(t0, it.word) - 4}
          dashed
          width={7}
        />
      ))}
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Bubble
            x={it.x}
            y={it.y}
            size={230}
            color={pastels[[0, 1, 5, 2][i]]}
            delay={at(t0, it.word)}
          >
            {it.icon}
          </Bubble>
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={50}
            style={{
              left: it.x - 200,
              width: 400,
              top: it.y - 248,
            }}
          />
        </React.Fragment>
      ))}
      <div
        style={{
          position: "absolute",
          left: lerp(0, CARD.x),
          top: lerp(0, CARD.y),
          width: lerp(1080, CARD.w),
          height: lerp(1920, CARD.h),
          borderRadius: lerp(0, 44),
          overflow: "hidden",
          boxShadow: `0 30px 70px rgba(0,0,0,${0.25 * p})`,
          transform: `rotate(${lerp(0, -3)}deg)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(`longeva/clip${ci + 1}.mp4`)}
          startFrom={Math.round((t0 - CLIP_OFFSETS[ci]) * FPS)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 22%",
          }}
        />
      </div>
    </Fill>
  );
};

/* "ormone di sistema ... corpo e mente" — hub with satellites */
export const Sistema: React.FC<SceneProps> = ({ t0 }) => {
  const cx = 540;
  const cy = 820;
  const sats = [<Dumbbell key="a" />, <Bone key="b" />, <Cells key="c" />, <Heart key="d" />, <Bolt key="e" />, <Smile key="f" />];
  const s0 = at(t0, "tocca");
  return (
    <Fill bg={colors.white}>
      {sats.map((_, i) => {
        const a = (i / sats.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <Link
            key={`l${i}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * 330}
            y2={cy + Math.sin(a) * 330}
            delay={s0 + i * 3}
            width={6}
          />
        );
      })}
      {sats.map((icon, i) => {
        const a = (i / sats.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <Bubble
            key={i}
            x={cx + Math.cos(a) * 330}
            y={cy + Math.sin(a) * 330}
            size={150}
            color={pastels[i]}
            delay={s0 + i * 3 + 4}
          >
            {icon}
          </Bubble>
        );
      })}
      <Bubble x={cx} y={cy} size={260} color={colors.blue} delay={0}>
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight={800}
          fontSize="66"
          fill="#fff"
        >
          T
        </text>
      </Bubble>
      <Link x1={cx} y1={cy + 130} x2={290} y2={1520} delay={at(t0, "corpo") - 3} color={colors.ink} width={5} dashed />
      <Link x1={cx} y1={cy + 130} x2={790} y2={1520} delay={at(t0, "mente") - 3} color={colors.ink} width={5} dashed />
      <Bubble x={290} y={1560} size={210} color={pastels[7]} delay={at(t0, "corpo")}>
        <Body />
      </Bubble>
      <Bubble x={790} y={1560} size={210} color={pastels[0]} delay={at(t0, "mente")}>
        <Brain />
      </Bubble>
      <SerifLabel text="corpo" delay={at(t0, "corpo") + 2} size={70} style={{ left: 90, width: 400, top: 1700 }} />
      <SerifLabel text="mente" delay={at(t0, "mente") + 2} size={70} style={{ left: 590, width: 400, top: 1700 }} />
    </Fill>
  );
};

/* "si fa sentire sotto tanti punti di vista" — grey avatars multiplying */
export const PuntiDiVista: React.FC<SceneProps> = ({ t0 }) => {
  const spots: { x: number; y: number; s: number }[] = [];
  const rows = [
    { y: 560, n: 7, s: 110 },
    { y: 720, n: 6, s: 140 },
    { y: 910, n: 5, s: 175 },
    { y: 1130, n: 4, s: 210 },
  ];
  rows.forEach((r) => {
    const gap = r.s * 1.12;
    for (let i = 0; i < r.n; i++) {
      spots.push({ x: 540 + (i - (r.n - 1) / 2) * gap, y: r.y, s: r.s });
    }
  });
  const order = spots
    .map((sp, i) => ({ i, d: Math.hypot(sp.x - 540, (sp.y - 1130) * 1.4) }))
    .sort((a, b) => a.d - b.d)
    .map((o) => o.i);
  return (
    <Fill bg={colors.white}>
      <GridFloor top={1180} width={1000} opacity={0.6} />
      {order.map((idx, k) => {
        const sp = spots[idx];
        return (
          <Bubble key={idx} x={sp.x} y={sp.y} size={sp.s} color={colors.grey} delay={k * 1.6}>
            <Person />
          </Bubble>
        );
      })}
      <SerifLabel
        text="tanti punti di vista"
        delay={at(t0, "tanti")}
        size={86}
        style={{ left: 0, right: 0, top: 1420 }}
      />
    </Fill>
  );
};

/* "Quindi come cambia con l'età?" — black text screen + yellow ? */
export const Domanda: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg={colors.black}>
    <Word3D
      text="?"
      size={300}
      top={430}
      delay={at(t0, "cambia")}
      color={colors.yellow}
      depthColor="#A88A00"
      rotate={10}
    />
  </Fill>
);

/* Woman vs man decline chart */
export const Grafico: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const X0 = 130;
  const X1 = 960;
  const Y0 = 620;
  const Y1 = 1320;
  const pinkD = `M${X0} 700 C 330 700, 430 705, 500 720 C 540 760, 560 1180, 620 1230 S 900 1250, ${X1} 1255`;
  const blueD = `M${X0} 690 C 400 720, 650 900, ${X1} 1060`;
  const dPink = at(t0, "donna");
  const dBlue = at(t0, "calo");
  const pinkT = interpolate(frame, [dPink, at(t0, "netto") + 6], [0, 1], clamp);
  const blueT = interpolate(frame, [dBlue, at(t0, "ormone") + 8], [0, 1], clamp);
  const axes = interpolate(frame, [0, 10], [0, 1], clamp);
  const ages = [30, 40, 50, 60, 70];
  return (
    <Fill bg={colors.white}>
      <div
        style={{
          position: "absolute",
          top: 430,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 46,
          letterSpacing: "-0.03em",
          color: colors.ink,
          opacity: axes,
        }}
      >
        livelli ormonali
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <line x1={X0} y1={Y1} x2={X0 + (X1 - X0) * axes} y2={Y1} stroke={colors.ink} strokeWidth={5} />
        <line x1={X0} y1={Y1} x2={X0} y2={Y1 - (Y1 - Y0) * axes} stroke={colors.ink} strokeWidth={5} />
        {ages.map((a, i) => (
          <text
            key={a}
            x={X0 + 60 + i * 180}
            y={Y1 + 60}
            textAnchor="middle"
            fontFamily={sans}
            fontWeight={500}
            fontSize={36}
            fill={colors.greyDark}
            opacity={axes}
          >
            {a}
          </text>
        ))}
        <path d={pinkD} fill="none" stroke={colors.pink} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pinkT} style={{ filter: `drop-shadow(0 0 12px ${colors.pink}88)` }} />
        <path d={blueD} fill="none" stroke={colors.blue} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - blueT} style={{ filter: `drop-shadow(0 0 12px ${colors.blue}88)` }} />
      </svg>
      <SerifLabel text="donna" delay={dPink + 2} size={68} color={colors.pink} style={{ left: 740, top: 1130 }} />
      <SerifLabel text="crollo netto" delay={at(t0, "crollo")} size={58} color={colors.pink} style={{ left: 590, top: 610 }} />
      <SerifLabel text="uomo" delay={at(t0, "l'uomo")} size={68} color={colors.blue} style={{ left: 840, top: 900 }} />
      <SerifLabel text={"calo lento,\ngraduale"} delay={at(t0, "lento")} size={58} color={colors.blue} style={{ left: 170, top: 900 }} />
      <Scribble
        delay={at(t0, "inesorabile")}
        viewBox="0 0 1080 1920"
        width={10}
        len={900}
        d="M170 1035 C 260 1075, 380 1072, 470 1030"
        style={{ left: 0, top: 0, width: 1080, height: 1920 }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 40, color: colors.greyDark, opacity: axes }}>
        età
      </div>
    </Fill>
  );
};

/* "35" in fluo green */
export const Trentacinque: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const d = 0;
  const n = Math.round(
    interpolate(frame, [d, at(t0, "trentacinquesimo") + 8], [0, 35], clamp),
  );
  const p = usePop(d, 10);
  return (
    <Fill bg={colors.white}>
      <div
        style={{
          position: "absolute",
          top: 560,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 440,
          letterSpacing: "-0.06em",
          color: colors.green,
          WebkitTextStroke: "6px #12920A",
          textShadow: `0 0 50px ${colors.green}cc, 8px 10px 0 #0E6E08`,
          transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-12, -4])}deg)`,
          opacity: frame < d ? 0 : 1,
        }}
      >
        {n}
      </div>
      <SerifLabel text="anni" delay={at(t0, "anno")} size={130} style={{ left: 0, right: 0, top: 1170 }} />
    </Fill>
  );
};

/* "dipende più dallo stile di vita che dall'età" — two bars */
export const Barre: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = 1400;
  const bar = (delay: number, h: number) =>
    h * spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.7 } });
  const hL = bar(at(t0, "stile"), 780);
  const hR = bar(at(t0, "dall'età"), 240);
  return (
    <Fill bg={colors.white}>
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: sans, fontWeight: 600, fontSize: 52, letterSpacing: "-0.03em", color: colors.ink }}>
        dipende più da
      </div>
      <div style={{ position: "absolute", left: 220, width: 260, top: base - hL, height: hL, borderRadius: "30px 30px 0 0", background: colors.green, boxShadow: `0 0 50px ${colors.green}aa` }} />
      <div style={{ position: "absolute", left: 600, width: 260, top: base - hR, height: hR, borderRadius: "30px 30px 0 0", background: colors.grey }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: base, height: 5, background: colors.ink }} />
      <SerifLabel text={"stile\ndi vita"} delay={at(t0, "stile")} size={72} style={{ left: 150, width: 400, top: base + 40 }} />
      <SerifLabel text="età" delay={at(t0, "dall'età")} size={72} style={{ left: 530, width: 400, top: base + 40 }} />
    </Fill>
  );
};

/* Lifestyle causes, then everything goes grey and T drops */
export const Cause: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [at(t0, "abbassano"), at(t0, "abbassano") + 10], [0, 1], clamp);
  const items = [
    { word: "sovrappeso", label: "sovrappeso", icon: <Scale />, x: 270, y: 560 },
    { word: "grasso", label: "grasso\nviscerale", icon: <Belly />, x: 810, y: 560 },
    { word: "sonno", label: "sonno\nscarso", icon: <Moon />, x: 540, y: 900 },
    { word: "sedentarietà", label: "sedentarietà", icon: <Couch />, x: 270, y: 1240 },
    { word: "stress", label: "stress\ncronico", icon: <Storm />, x: 810, y: 1240 },
  ];
  const dArrow = at(t0, "incredibilmente");
  const arrowY = interpolate(frame, [dArrow, dArrow + 10], [-80, 0], clamp);
  const arrowO = interpolate(frame, [dArrow, dArrow + 4], [0, 1], clamp);
  return (
    <Fill bg={colors.white}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Bubble x={it.x} y={it.y} size={220} color={pastels[[2, 1, 6, 3, 5][i]]} delay={at(t0, it.word)} grey={g}>
            {it.icon}
          </Bubble>
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={50}
            style={{ left: it.x - 200, width: 400, top: it.y + 128 }}
          />
        </React.Fragment>
      ))}
      <svg width={160} height={170} viewBox="0 0 160 170" style={{ position: "absolute", left: 460, top: 1450 + arrowY, opacity: arrowO, filter: `drop-shadow(0 0 18px ${colors.blue}99)` }}>
        <path d="M80 10 V140 M30 95 L80 150 L130 95" fill="none" stroke={colors.blue} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Word3D text="TESTOSTERONE" size={118} top={1640} delay={at(t0, "testosterone")} />
    </Fill>
  );
};

/* "integratore antietà" — black screen, capsule */
export const Integratore: React.FC = () => {
  const p = usePop(2, 10);
  const frame = useCurrentFrame();
  return (
    <Fill bg={colors.black}>
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 560,
          width: 280,
          height: 120,
          borderRadius: 60,
          overflow: "hidden",
          display: "flex",
          transform: `scale(${p}) rotate(${-30 + Math.sin(frame / 10) * 4}deg)`,
          boxShadow: `0 0 50px ${colors.yellow}66`,
        }}
      >
        <div style={{ flex: 1, background: colors.yellow }} />
        <div style={{ flex: 1, background: colors.white }} />
      </div>
    </Fill>
  );
};

export const TextScreen: React.FC<{ bg: string }> = ({ bg }) => (
  <AbsoluteFill style={{ backgroundColor: bg }} />
);
