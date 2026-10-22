import React from "react";
import { Img, interpolate, spring, staticFile } from "remotion";
import { Word } from "./Captions";
import { VideoSpec } from "./ElettromecVideo";
import {
  At,
  Badge,
  Battery,
  Bolt,
  ChatBubble,
  Chips,
  HeroTitle,
  ProductTag,
  Sfx,
  SosBadge,
  Sparks,
  Sticker,
  TimerRing,
  useInOut,
  useSlotFrame,
  VsCard,
} from "./graphics";
import { colors } from "./theme";
import { Keep } from "./timeline";
import v1Keep from "./cuts/v1.json";
import v2Keep from "./cuts/v2.json";
import v3Keep from "./cuts/v3.json";
import v4Keep from "./cuts/v4.json";
import v5Keep from "./cuts/v5.json";
import v1Words from "./transcripts/v1.json";
import v2Words from "./transcripts/v2.json";
import v3Words from "./transcripts/v3.json";
import v4Words from "./transcripts/v4.json";
import v5Words from "./transcripts/v5.json";

// Brand mention: bolt + sparks + zap.
const BrandHit: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <>
    <At t={t} d={1.2}>
      <Sparks x={x} y={y} />
      <Bolt x={x} y={y} size={200} />
    </At>
    <Sfx t={t} name="zap" volume={0.55} />
  </>
);

// ---------- Video 1: 3 consigli per la batteria in inverno ----------

export const video1: VideoSpec = {
  src: "elettromec/raw/v1.mp4",
  keep: v1Keep as Keep,
  shots: [3.52, 30.46, 40.8],
  words: v1Words as Word[],
  captionY: 1400,
  // He throws the boxes in the air: black & white.
  grayFrom: 53.2,
  zooms: [
    { t: 0, d: 3.5, s: 1.35, type: "push", y: 45 },
    { t: 5.4, d: 2.4, s: 1.2, x: 50, y: 40 },
    { t: 10.16, d: 3.2, s: 1.45, y: 42 },
    { t: 15.1, d: 2.2, s: 1.25, y: 45 },
    { t: 22.6, d: 4.5, s: 1.4, type: "push", y: 45 },
    { t: 30.5, d: 3.0, s: 1.45, y: 42 },
    { t: 36.5, d: 4.2, s: 1.3, type: "push", y: 45 },
    { t: 40.87, d: 3.4, s: 1.45, y: 42 },
    { t: 47.7, d: 4.8, s: 1.35, type: "push", y: 45 },
    { t: 52.7, d: 1.6, s: 1.5, y: 40 },
  ],
  overlays: (
    <>
      <At t={0.2} d={3.3}>
        <HeroTitle top="BATTERIA IN INVERNO" big="3 CONSIGLI" icon="snow" />
      </At>
      <Sfx t={0.2} name="whoosh" volume={0.5} />
      <Sfx t={0.45} name="hit" volume={0.5} />

      <At t={10.1} d={6.6}>
        <Badge kicker="CONSIGLIO" title="#1" sub="Non farla scaricare" />
      </At>
      <Sfx t={10.1} name="whoosh" volume={0.5} />

      <At t={30.45} d={9.9}>
        <Badge kicker="CONSIGLIO" title="#2" sub="Riparala dal freddo" />
      </At>
      <Sfx t={30.45} name="whoosh" volume={0.5} />

      <At t={40.8} d={11.3}>
        <Badge kicker="CONSIGLIO" title="#3" sub="Mantenitore di carica" />
      </At>
      <Sfx t={40.8} name="whoosh" volume={0.5} />

      <At t={42.0} d={3.2}>
        <Battery mode="charge" x={800} y={760} />
      </At>
      <Sfx t={42.0} name="ding" volume={0.4} />

      <BrandHit t={53.6} x={540} y={560} />
    </>
  ),
};

// ---------- Video 2: domande frequenti su WhatsApp ----------

const SHOTS = [
  "q4-macchina",
  "q1-tosaerba",
  "q3-aspirapolvere",
  "q6-trapano",
  "q2-moto",
  "q7-monopattino",
  "q8-sos-macchina",
  "q5-bici-elettrica",
];
const BURST_START = 0.45;
const BURST_GAP = 0.25;
const BURST_OUT = BURST_START + BURST_GAP * SHOTS.length + 0.4;

// The questions fire in one after another, like notifications, then fly away.
const WhatsAppBurst: React.FC = () => {
  const { frame, fps } = useInOut();
  const slotFrame = useSlotFrame();
  const outStart = slotFrame(BURST_OUT);
  return (
    <>
      {SHOTS.map((name, i) => {
        const local = frame - slotFrame(BURST_START + i * BURST_GAP);
        const pop = spring({
          frame: local,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 230 },
        });
        const out = spring({ frame: frame - outStart - i, fps, config: { damping: 20 } });
        const side = i % 2 ? 1 : -1;
        return (
          <Img
            key={name}
            src={staticFile(`elettromec/video2/whatsapp/${name}.jpg`)}
            style={{
              position: "absolute",
              width: 900,
              left: 90 + side * 30,
              top: 230 + i * 150,
              borderRadius: 40,
              boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
              opacity: local < 0 ? 0 : 1,
              transform: `translateX(${out * side * 1300}px) rotate(${side * (2 + (i % 3))}deg) scale(${interpolate(pop, [0, 1], [0.3, 1])})`,
            }}
          />
        );
      })}
    </>
  );
};

// The bike question comes back alone while he picks it.
const FocusQuestion: React.FC = () => {
  const { enter, exit, frame } = useInOut();
  const wobble = Math.sin(frame / 8) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 1020,
        opacity: exit,
        transform: `scale(${interpolate(enter, [0, 1], [0.4, 1])}) rotate(${-2 + wobble}deg)`,
      }}
    >
      <Img
        src={staticFile("elettromec/video2/whatsapp/q5-bici-elettrica.jpg")}
        style={{
          width: "100%",
          borderRadius: 44,
          border: `6px solid ${colors.yellow}`,
          boxShadow: `0 0 50px ${colors.yellow}88, 0 18px 40px rgba(0,0,0,0.55)`,
        }}
      />
    </div>
  );
};

export const video2: VideoSpec = {
  src: "elettromec/raw/v2.mp4",
  keep: v2Keep as Keep,
  shots: [2.6],
  words: v2Words as Word[],
  captionY: 1520,
  zooms: [
    { t: 3.4, d: 1.0, s: 1.18, y: 30 },
    { t: 7.1, d: 1.2, s: 1.22, y: 30 },
    { t: 8.4, d: 4.6, s: 1.2, type: "push", y: 30 },
    { t: 13.2, d: 0.9, s: 1.25, y: 30 },
    { t: 18.4, d: 5.0, s: 1.18, type: "push", y: 30 },
    { t: 23.5, d: 1.2, s: 1.25, y: 30 },
  ],
  overlays: (
    <>
      <At t={BURST_START} d={BURST_OUT - BURST_START + 0.7}>
        <WhatsAppBurst />
      </At>
      {SHOTS.map((s, i) => (
        <Sfx key={s} t={BURST_START + i * BURST_GAP} name="pop" volume={0.75} />
      ))}
      <Sfx t={BURST_OUT} name="whoosh" volume={0.6} />

      <At t={3.35} d={3.9}>
        <FocusQuestion />
      </At>
      <Sfx t={3.35} name="ding" volume={0.5} />

      <At t={14.0} d={4.3}>
        <ChatBubble y={1040} lines={["Mandaci una foto", "dell'etichetta"]} />
      </At>
      <Sfx t={14.0} name="ding" volume={0.45} />

      <At t={20.4} d={3.0}>
        <Chips
          y={1000}
          align="center"
          icon="check"
          items={[
            { label: "FATTIBILITÀ", t: 20.5 },
            { label: "COSTO INDICATIVO", t: 21.7 },
          ]}
        />
      </At>
      <Sfx t={20.5} name="pop" volume={0.5} />
      <Sfx t={21.7} name="pop" volume={0.5} />
    </>
  ),
};

// ---------- Video 3: avviatori ----------

export const video3: VideoSpec = {
  src: "elettromec/raw/v3.mp4",
  keep: v3Keep as Keep,
  shots: [2.88, 5.68, 9.14, 11.32, 15.16, 22.94, 27.14, 33.08, 36.48],
  words: v3Words as Word[],
  captionY: 1600,
  zooms: [
    // No zooms on the second speaker (2.88-5.68, 9.14-11.32, 33.08-36.48).
    { t: 2.3, d: 0.55, s: 1.2, y: 30 },
    { t: 11.8, d: 1.4, s: 1.25, y: 30 },
    { t: 13.6, d: 1.8, s: 1.15, type: "push", y: 40 },
    { t: 15.9, d: 1.4, s: 1.2, y: 45 },
    { t: 23.4, d: 1.0, s: 1.2, y: 45 },
    { t: 25.4, d: 1.2, s: 1.25, y: 40 },
    { t: 28.0, d: 1.2, s: 1.2, y: 50 },
    { t: 31.6, d: 1.4, s: 1.3, y: 35 },
    { t: 36.7, d: 2.3, s: 1.3, y: 30 },
  ],
  overlays: (
    <>
      <BrandHit t={11.8} x={880} y={300} />

      <At t={15.8} d={6.6}>
        <ProductTag name="PJ1 PRO" sub="Moto e auto di media cilindrata" y={1230} />
      </At>
      <Sfx t={15.8} name="whoosh" volume={0.6} />

      <At t={23.3} d={3.6}>
        <ProductTag name="PJ2" sub="Avvia anche il trattore!" y={1230} />
      </At>
      <Sfx t={23.3} name="whoosh" volume={0.6} />

      <At t={28.0} d={4.9}>
        <ProductTag name="P2000" sub="Booster al piombo" y={1230} />
      </At>
      <Sfx t={28.0} name="whoosh" volume={0.6} />

      <BrandHit t={38.2} x={540} y={380} />
    </>
  ),
};

// ---------- Video 4: servizio SOS ----------

export const video4: VideoSpec = {
  src: "elettromec/raw/v4.mp4",
  keep: v4Keep as Keep,
  shots: [5.34, 6.36, 8.82, 14.94, 19.92, 26.5, 31],
  words: v4Words as Word[],
  captionY: 1520,
  bleep: [[29.3, 29.72]],
  zooms: [
    { t: 0, d: 3.0, s: 1.25, type: "push", y: 35 },
    { t: 5.4, d: 1.0, s: 1.25, y: 30 },
    { t: 6.4, d: 1.4, s: 1.15, y: 30 },
    { t: 7.7, d: 1.1, s: 1.3, y: 30 },
    { t: 11.1, d: 1.6, s: 1.2, y: 30 },
    { t: 14.5, d: 3.3, s: 1.2, type: "push", y: 35 },
    // No zooms on the man behind the bars (26.5-31.0).
    { t: 26.0, d: 0.45, s: 1.25, y: 30 },
    { t: 31.0, d: 2.2, s: 1.2, type: "push", y: 30 },
    { t: 33.4, d: 2.0, s: 1.3, y: 30 },
  ],
  overlays: (
    <>
      <BrandHit t={7.0} x={880} y={300} />

      <At t={9.5} d={5.4}>
        <SosBadge x={260} y={1130} />
      </At>
      <Sfx t={9.5} name="hit" volume={0.6} />
      <At t={11.1} d={3.8}>
        <TimerRing value="20" unit="MINUTI" x={810} y={1130} />
      </At>
      <Sfx t={11.1} name="ding" volume={0.45} />

      <At t={18.5} d={9.3}>
        <Chips
          y={260}
          icon="pin"
          items={[
            { label: "FIRENZE", t: 18.6 },
            { label: "SCANDICCI", t: 20.35 },
            { label: "EMPOLI", t: 21.3 },
            { label: "SAN MINIATO", t: 22.1 },
            { label: "MONTELUPO", t: 23.15 },
            { label: "LASTRA A SIGNA", t: 24.05 },
            { label: "MARRADI?!", t: 26.0, big: true },
          ]}
        />
      </At>
      {[18.6, 20.35, 21.3, 22.1, 23.15, 24.05].map((t) => (
        <Sfx key={t} t={t} name="pop" volume={0.7} />
      ))}
      <Sfx t={26.0} name="hit" volume={0.6} />

      <At t={29.3} d={1.5}>
        <Sticker text="?!?!" x={780} y={380} color={colors.red} rotate={10} />
      </At>

      <BrandHit t={34.4} x={860} y={330} />
    </>
  ),
};

// ---------- Video 5: rigenerazione batterie ----------

export const video5: VideoSpec = {
  src: "elettromec/raw/v5.mp4",
  keep: v5Keep as Keep,
  shots: [8.7, 11.22, 13.32, 16.92],
  words: v5Words as Word[],
  captionY: 1560,
  zooms: [
    { t: 0, d: 5.4, s: 1.2, type: "push", y: 35 },
    { t: 5.5, d: 1.0, s: 1.2, y: 35 },
    { t: 8.8, d: 4.3, s: 1.2, type: "push", y: 45 },
    { t: 13.7, d: 1.2, s: 1.2, y: 35 },
    { t: 17.6, d: 0.8, s: 1.2, y: 35 },
    { t: 18.4, d: 2.5, s: 1.4, y: 40 },
  ],
  overlays: (
    <>
      <At t={0} d={5.6}>
        <Chips
          y={880}
          icon="bolt"
          items={[
            { label: "BICI ELETTRICHE", t: 0.05 },
            { label: "UTENSILI", t: 1.36 },
            { label: "ASPIRATORI", t: 2.24 },
            { label: "TRAPANI", t: 3.12 },
            { label: "FORBICI DA POTATURA", t: 4.24 },
          ]}
        />
      </At>
      {[0.05, 1.36, 2.24, 3.12, 4.24].map((t) => (
        <Sfx key={t} t={t} name="pop" volume={0.7} />
      ))}

      <At t={6.0} d={2.8}>
        <VsCard good="RIGENERARE" bad="RICOMPRARE" y={330} />
      </At>
      <Sfx t={6.0} name="whoosh" volume={0.6} />
      <Sfx t={6.3} name="ding" volume={0.4} />

      <At t={13.7} d={3.3}>
        <Chips
          y={300}
          align="center"
          icon="pin"
          items={[
            { label: "PASSA IN NEGOZIO", t: 13.8 },
            { label: "SCRIVICI SU WHATSAPP", t: 15.3 },
          ]}
        />
      </At>
      <Sfx t={13.8} name="pop" volume={0.7} />
      <Sfx t={15.3} name="pop" volume={0.7} />

      <Sfx t={18.9} name="hit" volume={0.6} />
    </>
  ),
};
