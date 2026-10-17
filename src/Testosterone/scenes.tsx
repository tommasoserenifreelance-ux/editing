import React from "react";
import {
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { wt } from "./captions";
import {
  Bubble,
  clipFor,
  CLIP_OFFSETS,
  Emoji,
  Fill,
  GridFloor,
  Link,
  Scribble,
  SerifLabel,
  Sfx,
  usePop,
  Word3D,
} from "./primitives";
import { colors, FPS, sans, sec } from "./theme";

type SceneProps = { t0: number };

// Frame (relative to the scene start) at which a spoken word begins.
const at = (t0: number, word: string) => sec(wt(word, t0) - t0);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Heading: React.FC<{ text: string; top: number; opacity?: number }> = ({
  text,
  top,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      width: "100%",
      textAlign: "center",
      fontFamily: sans,
      fontWeight: 700,
      fontSize: 50,
      letterSpacing: "-0.03em",
      color: colors.ink,
      opacity,
    }}
  >
    {text}
  </div>
);

/* "simbolo della mascolinità" — Mars symbol drawing itself */
export const Mascolinita: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 16], [0, 1], clamp);
  const p = usePop(0);
  return (
    <Fill bg="white">
      <svg
        viewBox="0 0 200 200"
        width={420}
        height={420}
        style={{
          position: "absolute",
          left: 330,
          top: 430,
          transform: `scale(${p}) rotate(${interpolate(p, [0, 1], [-20, 0])}deg)`,
          filter: `url(#print) drop-shadow(0 0 24px ${colors.blue}66)`,
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
          strokeDashoffset={
            200 * (1 - interpolate(frame, [8, 20], [0, 1], clamp))
          }
        />
      </svg>
      <Sfx at={0} name="draw" volume={0.45} />
      <Sfx at={8} name="pop2" volume={0.4} />
      <Heading text="simbolo della" top={1010} />
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
    <Fill bg="black">
      <Word3D text="TESTOSTERONE" size={112} top={770} delay={d} />
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

/**
 * The speaker shrinks into a card; items pop in a row underneath, each
 * linked to the card. Labels sit below the emoji so no line crosses text.
 */
type CardItem = { word: string; emoji: string; label: string };

const CARD = { x: 270, y: 200, w: 540, h: 740 };

export const CardScene: React.FC<
  SceneProps & { items: CardItem[]; emojiSize: number; labelSize: number }
> = ({ t0, items, emojiSize, labelSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const ci = clipFor(t0);
  const rowY = 1270;
  const slot = 1080 / items.length;
  return (
    <Fill bg="white">
      <GridFloor
        top={860}
        width={1000}
        opacity={interpolate(frame, [6, 14], [0, 0.6], clamp)}
      />
      {items.map((it, i) => (
        <Link
          key={`l${i}`}
          x1={540}
          y1={CARD.y + CARD.h}
          x2={slot * (i + 0.5)}
          y2={rowY - emojiSize * 0.55}
          delay={at(t0, it.word) - 4}
          dashed
          width={7}
        />
      ))}
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Emoji
            name={it.emoji}
            x={slot * (i + 0.5)}
            y={rowY}
            size={emojiSize}
            delay={at(t0, it.word)}
          />
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={labelSize}
            style={{
              left: slot * i,
              width: slot,
              top: rowY + emojiSize * 0.58,
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

export const Benefits: React.FC<SceneProps> = ({ t0 }) => (
  <CardScene
    t0={t0}
    emojiSize={225}
    labelSize={48}
    items={[
      { word: "massa", emoji: "biceps", label: "massa e\nforza\nmuscolare" },
      { word: "densità", emoji: "bone", label: "densità\nossea" },
      { word: "globuli", emoji: "blood", label: "globuli\nrossi" },
      {
        word: "desiderio",
        emoji: "heartfire",
        label: "desiderio e\nfunzione\nsessuale",
      },
    ]}
  />
);

export const CorpoMente: React.FC<SceneProps> = ({ t0 }) => (
  <CardScene
    t0={t0}
    emojiSize={260}
    labelSize={72}
    items={[
      { word: "corpo", emoji: "muscleman", label: "corpo" },
      { word: "mente", emoji: "brain", label: "mente" },
    ]}
  />
);

/* "È l'energia e l'umore." — black screen, two emoji */
export const EnergiaUmore: React.FC<SceneProps> = ({ t0 }) => (
  <Fill bg="black">
    <Emoji name="bolt" x={360} y={640} size={260} delay={at(t0, "l'energia")} />
    <Emoji name="smile" x={720} y={640} size={260} delay={at(t0, "l'umore")} />
  </Fill>
);

/* "si fa sentire sotto tanti punti di vista" — grey avatars multiplying */
const Person = () => (
  <g fill="#fff">
    <circle cx="50" cy="36" r="20" />
    <path d="M14 96 C14 70 30 60 50 60 C70 60 86 70 86 96 Z" />
  </g>
);

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
    <Fill bg="mint">
      <GridFloor top={1180} width={1000} opacity={0.35} />
      {order.map((idx, k) => {
        const sp = spots[idx];
        return (
          <Bubble
            key={idx}
            x={sp.x}
            y={sp.y}
            size={sp.s}
            color="#2E9E7B"
            delay={k * 1.6}
            sound={k % 3 === 0 ? "tick" : undefined}
          >
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
  <Fill bg="black">
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
  const blueT = interpolate(
    frame,
    [dBlue, at(t0, "ormone") + 8],
    [0, 1],
    clamp,
  );
  const axes = interpolate(frame, [0, 10], [0, 1], clamp);
  const ages = [30, 40, 50, 60, 70];
  return (
    <Fill bg="white">
      <Heading text="livelli ormonali" top={430} opacity={axes} />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", filter: "url(#print)" }}
      >
        <line
          x1={X0}
          y1={Y1}
          x2={X0 + (X1 - X0) * axes}
          y2={Y1}
          stroke={colors.ink}
          strokeWidth={5}
        />
        <line
          x1={X0}
          y1={Y1}
          x2={X0}
          y2={Y1 - (Y1 - Y0) * axes}
          stroke={colors.ink}
          strokeWidth={5}
        />
        {ages.map((a, i) => (
          <text
            key={a}
            x={X0 + 60 + i * 180}
            y={Y1 + 60}
            textAnchor="middle"
            fontFamily={sans}
            fontSize={36}
            fill={colors.greyDark}
            opacity={axes}
          >
            {a}
          </text>
        ))}
        <path
          d={pinkD}
          fill="none"
          stroke={colors.pink}
          strokeWidth={14}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - pinkT}
          style={{ filter: `drop-shadow(0 0 12px ${colors.pink}88)` }}
        />
        <path
          d={blueD}
          fill="none"
          stroke={colors.blue}
          strokeWidth={14}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - blueT}
          style={{ filter: `drop-shadow(0 0 12px ${colors.blue}88)` }}
        />
      </svg>
      <Sfx at={0} name="draw" volume={0.35} />
      <Sfx at={dPink} name="riser_short" volume={0.4} />
      <Sfx at={at(t0, "netto")} name="whoosh_down" volume={0.3} />
      <Sfx at={dBlue} name="riser" volume={0.35} />
      <Emoji name="woman" x={860} y={1110} size={130} delay={dPink + 2} volume={0.4} />
      <Emoji name="man" x={880} y={880} size={130} delay={at(t0, "l'uomo")} volume={0.4} />
      <SerifLabel
        text="crollo netto"
        delay={at(t0, "crollo")}
        size={58}
        color={colors.pink}
        style={{ left: 590, top: 610 }}
      />
      <SerifLabel
        text={"calo lento,\ngraduale"}
        delay={at(t0, "lento")}
        size={58}
        color={colors.blue}
        style={{ left: 170, top: 900 }}
      />
      <Scribble
        delay={at(t0, "inesorabile")}
        viewBox="0 0 1080 1920"
        width={10}
        len={900}
        d="M170 1035 C 260 1075, 380 1072, 470 1030"
        style={{ left: 0, top: 0, width: 1080, height: 1920 }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1460,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 40,
          color: colors.greyDark,
          opacity: axes,
        }}
      >
        età
      </div>
    </Fill>
  );
};

/* "35" in LongevaMed yellow, counting up */
export const Trentacinque: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const end = at(t0, "trentacinquesimo") + 8;
  const n = Math.round(interpolate(frame, [0, end], [0, 35], clamp));
  const p = usePop(0, 10);
  const hit = spring({
    frame: frame - end,
    fps: FPS,
    config: { damping: 8, mass: 0.5 },
  });
  return (
    <Fill bg="coral">
      <div
        style={{
          position: "absolute",
          top: 560,
          width: "100%",
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 460,
          letterSpacing: "-0.06em",
          color: colors.brand,
          WebkitTextStroke: `10px ${colors.printInk}`,
          paintOrder: "stroke fill",
          // print misregistration: offset ink + mint layers under the yellow
          textShadow: `14px 16px 0 ${colors.printInk}, -10px -6px 0 ${colors.mint}`,
          filter: "url(#sticker)",
          transform: `scale(${p * (1 + 0.08 * Math.sin(hit * Math.PI))}) rotate(${interpolate(p, [0, 1], [-12, -4])}deg)`,
        }}
      >
        {n}
      </div>
      <Sfx at={0} name="counter" volume={0.45} />
      <Sfx at={end} name="ding" volume={0.3} />
      <SerifLabel
        text="anni"
        delay={at(t0, "anno")}
        size={130}
        color={colors.white}
        style={{ left: 0, right: 0, top: 1190 }}
      />
    </Fill>
  );
};

/* "dipende più dallo stile di vita che dall'età" — two bars */
export const Barre: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = 1400;
  const bar = (delay: number, h: number) =>
    h *
    spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.7 } });
  const dL = at(t0, "stile");
  const dR = at(t0, "dall'età");
  const hL = bar(dL, 780);
  const hR = bar(dR, 240);
  const barStyle = (left: number, h: number, bg: string) =>
    ({
      position: "absolute",
      left,
      width: 260,
      top: base - h,
      height: h,
      borderRadius: "30px 30px 0 0",
      background: bg,
      border: h > 2 ? `6px solid ${colors.printInk}` : "none",
      borderBottom: "none",
      filter: "url(#print)",
    }) as const;
  const line = interpolate(frame, [dL - 2, dL + 8], [0, 1], clamp);
  return (
    <Fill bg="white">
      <Heading text="dipende più da" top={380} />
      <div
        style={{
          ...barStyle(220, hL, colors.brand),
          boxShadow: `0 0 50px ${colors.brand}88`,
        }}
      />
      <div style={barStyle(600, hR, colors.grey)} />
      <div
        style={{
          position: "absolute",
          left: 540 - 400 * line,
          width: 800 * line,
          top: base,
          height: 6,
          background: colors.printInk,
          filter: "url(#print)",
        }}
      />
      <Sfx at={dL} name="rise" volume={0.5} />
      <Sfx at={dR} name="pop3" volume={0.4} />
      <SerifLabel
        text={"stile\ndi vita"}
        delay={dL}
        size={72}
        style={{ left: 150, width: 400, top: base + 40 }}
      />
      <SerifLabel
        text="età"
        delay={dR}
        size={72}
        style={{ left: 530, width: 400, top: base + 40 }}
      />
    </Fill>
  );
};

/* Lifestyle causes, then everything goes grey and T drops */
export const Cause: React.FC<SceneProps> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const dGrey = at(t0, "abbassano");
  const g = interpolate(frame, [dGrey, dGrey + 10], [0, 1], clamp);
  const items = [
    { word: "sovrappeso", label: "sovrappeso", emoji: "scale", x: 270, y: 470 },
    { word: "grasso", label: "grasso\nviscerale", emoji: "burger", x: 810, y: 470 },
    { word: "sonno", label: "sonno\nscarso", emoji: "yawn", x: 540, y: 800 },
    { word: "sedentarietà", label: "sedentarietà", emoji: "couch", x: 270, y: 1130 },
    { word: "stress", label: "stress\ncronico", emoji: "stress", x: 810, y: 1130 },
  ];
  return (
    <Fill bg="coral">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Emoji
            name={it.emoji}
            x={it.x}
            y={it.y}
            size={210}
            delay={at(t0, it.word)}
            grey={g}
          />
          <SerifLabel
            text={it.label}
            delay={at(t0, it.word) + 2}
            size={50}
            color={g > 0.5 ? colors.white : colors.ink}
            style={{ left: it.x - 200, width: 400, top: it.y + 120 }}
          />
        </React.Fragment>
      ))}
      <Sfx at={dGrey} name="powerdown" volume={0.45} />
      <Emoji
        name="chart"
        x={540}
        y={1480}
        size={220}
        delay={at(t0, "incredibilmente")}
      />
      <Sfx at={at(t0, "incredibilmente")} name="whoosh_down" volume={0.4} />
      <Word3D
        text="TESTOSTERONE"
        size={100}
        top={1630}
        delay={at(t0, "testosterone")}
      />
    </Fill>
  );
};

/* "integratore antietà" — black screen, pill */
export const Integratore: React.FC = () => (
  <Fill bg="black">
    <Emoji name="pill" x={540} y={640} size={300} delay={2} />
  </Fill>
);
