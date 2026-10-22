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
  VsCard,
} from "./graphics";
import { colors } from "./theme";
import v1Words from "./transcripts/v1.json";
import v2Words from "./transcripts/v2.json";
import v3Words from "./transcripts/v3.json";
import v4Words from "./transcripts/v4.json";
import v5Words from "./transcripts/v5.json";

// Brand mention: bolt + sparks + zap.
const BrandHit: React.FC<{ t: number; x?: number; y?: number }> = ({ t, x = 820, y = 520 }) => (
  <>
    <At t={t} d={1.2}>
      <Sparks x={x} y={y} />
      <Bolt x={x} y={y} size={200} />
    </At>
    <Sfx t={t} name="zap" volume={0.45} />
  </>
);

// ---------- Video 1: 3 consigli per la batteria in inverno ----------

export const video1: VideoSpec = {
  src: "elettromec/raw/v1.mp4",
  seconds: 56.48,
  words: v1Words as Word[],
  captionY: 1400,
  hideCaptions: [[0.2, 3.5]],
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
      <Sfx t={0.2} name="whoosh" />
      <Sfx t={0.4} name="hit" volume={0.5} />

      <At t={10.1} d={6.6}>
        <Badge kicker="CONSIGLIO" title="#1" sub="Non farla scaricare" />
      </At>
      <Sfx t={10.1} name="whoosh" />
      <At t={12.6} d={2.6}>
        <Battery mode="drain" x={800} y={760} />
      </At>
      <Sfx t={12.6} name="pop" />

      <At t={27.1} d={3.3}>
        <Battery mode="charge" x={800} y={760} />
      </At>
      <Sfx t={27.1} name="pop" />

      <At t={30.45} d={9.9}>
        <Badge kicker="CONSIGLIO" title="#2" sub="Riparala dal freddo" />
      </At>
      <Sfx t={30.45} name="whoosh" />
      <At t={34.6} d={2.0}>
        <Sticker text="AL RIPARO!" x={760} y={820} color={colors.white} rotate={8} />
      </At>
      <Sfx t={34.6} name="pop" />

      <At t={40.8} d={11.3}>
        <Badge kicker="CONSIGLIO" title="#3" sub="Mantenitore di carica" />
      </At>
      <Sfx t={40.8} name="whoosh" />
      <At t={42.0} d={3.2}>
        <Battery mode="charge" x={800} y={760} />
      </At>
      <Sfx t={42.0} name="pop" />

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

// The questions fire in one after another, like notifications, then fly away.
const WhatsAppBurst: React.FC = () => {
  const { frame, fps } = useInOut();
  const outStart = Math.round((BURST_GAP * SHOTS.length + 0.55) * fps);
  return (
    <>
      {SHOTS.map((name, i) => {
        const local = frame - Math.round(i * BURST_GAP * fps);
        const pop = spring({ frame: local, fps, config: { damping: 11, mass: 0.5, stiffness: 230 } });
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
      <div
        style={{
          display: "inline-block",
          marginLeft: 20,
          marginBottom: -10,
          padding: "8px 22px",
          borderRadius: 14,
          background: colors.lime,
          color: colors.navyDeep,
          fontFamily: "Montserrat",
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: 2,
          transform: "rotate(-3deg)",
          position: "relative",
          zIndex: 1,
        }}
      >
        DOMANDA DEL GIORNO
      </div>
      <Img
        src={staticFile("elettromec/video2/whatsapp/q5-bici-elettrica.jpg")}
        style={{
          width: "100%",
          borderRadius: 44,
          border: `6px solid ${colors.lime}`,
          boxShadow: `0 0 50px ${colors.lime}88, 10px 12px 0 ${colors.navyDeep}`,
        }}
      />
    </div>
  );
};

export const video2: VideoSpec = {
  src: "elettromec/raw/v2.mp4",
  seconds: 27.52,
  words: v2Words as Word[],
  captionY: 1520,
  hideCaptions: [[0.4, 3.3]],
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
      <At t={BURST_START} d={BURST_GAP * SHOTS.length + 1.1}>
        <WhatsAppBurst />
      </At>
      {SHOTS.map((s, i) => (
        <Sfx key={s} t={BURST_START + i * BURST_GAP} name="pop" volume={0.7} />
      ))}
      <Sfx t={BURST_START + BURST_GAP * SHOTS.length + 0.55} name="whoosh" />

      <At t={3.35} d={3.9}>
        <FocusQuestion />
      </At>
      <Sfx t={3.35} name="pop" volume={0.8} />

      <At t={14.0} d={4.3}>
        <ChatBubble y={1040} lines={["Mandaci una foto", "dell'etichetta"]} />
      </At>
      <Sfx t={14.0} name="pop" />

      <At t={20.4} d={3.0}>
        <Chips
          y={1000}
          align="center"
          icon="check"
          items={[
            { label: "FATTIBILITÀ", t: 0.1 },
            { label: "COSTO INDICATIVO", t: 1.3 },
          ]}
        />
      </At>
      <Sfx t={20.5} name="pop" />
      <Sfx t={21.7} name="pop" />

      <At t={23.5} d={4.0}>
        <Badge kicker="AL PROSSIMO EPISODIO" title="Nuova domanda →" y={1000} />
      </At>
      <Sfx t={23.5} name="whoosh" />
    </>
  ),
};

// ---------- Video 3: avviatori ----------

export const video3: VideoSpec = {
  src: "elettromec/raw/v3.mp4",
  seconds: 39.02,
  words: v3Words as Word[],
  captionY: 1560,
  zooms: [
    { t: 2.3, d: 0.8, s: 1.2, y: 30 },
    { t: 3.1, d: 1.7, s: 1.3, y: 25 },
    { t: 9.2, d: 1.6, s: 1.2, y: 30 },
    { t: 11.8, d: 1.4, s: 1.25, y: 30 },
    { t: 13.6, d: 1.8, s: 1.15, type: "push", y: 40 },
    { t: 15.9, d: 1.4, s: 1.2, y: 45 },
    { t: 23.4, d: 1.0, s: 1.2, y: 45 },
    { t: 25.4, d: 1.2, s: 1.25, y: 40 },
    { t: 28.0, d: 1.2, s: 1.2, y: 50 },
    { t: 31.6, d: 1.4, s: 1.3, y: 35 },
    { t: 33.1, d: 3.2, s: 1.25, type: "push", y: 30 },
    { t: 36.7, d: 2.3, s: 1.3, y: 30 },
  ],
  overlays: (
    <>
      <At t={3.1} d={1.5}>
        <Sticker text="TANTE!" x={760} y={300} />
      </At>
      <Sfx t={3.1} name="pop" />

      <BrandHit t={11.8} x={880} y={300} />

      <At t={15.8} d={6.6}>
        <ProductTag name="PJ1 PRO" sub="Moto e auto di media cilindrata" />
      </At>
      <Sfx t={15.8} name="whoosh" />

      <At t={23.3} d={3.6}>
        <ProductTag name="PJ2" sub="Avvia anche il trattore!" />
      </At>
      <Sfx t={23.3} name="whoosh" />

      <At t={28.0} d={4.9}>
        <ProductTag name="P2000" sub="Booster al piombo" />
      </At>
      <Sfx t={28.0} name="whoosh" />

      <BrandHit t={35.4} x={880} y={300} />
      <BrandHit t={38.2} x={540} y={380} />
    </>
  ),
};

// ---------- Video 4: servizio SOS ----------

export const video4: VideoSpec = {
  src: "elettromec/raw/v4.mp4",
  seconds: 35.42,
  words: v4Words as Word[],
  captionY: 1520,
  zooms: [
    { t: 0, d: 3.0, s: 1.25, type: "push", y: 35 },
    { t: 5.4, d: 1.0, s: 1.25, y: 30 },
    { t: 6.4, d: 1.4, s: 1.15, y: 30 },
    { t: 7.7, d: 1.1, s: 1.3, y: 30 },
    { t: 11.1, d: 1.6, s: 1.2, y: 30 },
    { t: 14.5, d: 3.3, s: 1.2, type: "push", y: 35 },
    { t: 26.0, d: 1.8, s: 1.25, y: 30 },
    { t: 28.1, d: 0.9, s: 1.2, y: 40 },
    { t: 29.3, d: 1.6, s: 1.45, y: 40 },
    { t: 31.0, d: 2.2, s: 1.2, type: "push", y: 30 },
    { t: 33.4, d: 2.0, s: 1.3, y: 30 },
  ],
  overlays: (
    <>
      <At t={5.4} d={1.0}>
        <Sticker text="SURREALE?" x={540} y={330} color={colors.white} />
      </At>
      <Sfx t={5.4} name="pop" />
      <BrandHit t={7.0} x={880} y={300} />

      <At t={9.5} d={5.4}>
        <SosBadge x={260} y={1130} />
      </At>
      <Sfx t={9.5} name="hit" volume={0.5} />
      <At t={11.1} d={3.8}>
        <TimerRing value="20" unit="MINUTI" x={810} y={1130} />
      </At>
      <Sfx t={11.1} name="pop" />

      <At t={18.5} d={9.3}>
        <Chips
          y={260}
          icon="pin"
          items={[
            { label: "FIRENZE", t: 0.1 },
            { label: "SCANDICCI", t: 1.85 },
            { label: "EMPOLI", t: 2.8 },
            { label: "SAN MINIATO", t: 3.6 },
            { label: "MONTELUPO", t: 4.65 },
            { label: "LASTRA A SIGNA", t: 5.55 },
            { label: "MARRADI?!", t: 7.5, big: true },
          ]}
        />
      </At>
      {[18.6, 20.35, 21.3, 22.1, 23.15, 24.05].map((t) => (
        <Sfx key={t} t={t} name="pop" />
      ))}
      <Sfx t={26.0} name="hit" volume={0.5} />

      <At t={29.3} d={1.5}>
        <Sticker text="?!?!" x={780} y={380} color={colors.red} rotate={10} />
      </At>
      <Sfx t={29.3} name="hit" volume={0.5} />

      <BrandHit t={34.4} x={860} y={330} />
    </>
  ),
};

// ---------- Video 5: rigenerazione batterie ----------

export const video5: VideoSpec = {
  src: "elettromec/raw/v5.mp4",
  seconds: 20.96,
  words: v5Words as Word[],
  captionY: 1560,
  hideCaptions: [[0, 5.5]],
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
          y={1000}
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
        <Sfx key={t} t={t} name="pop" />
      ))}

      <At t={6.0} d={2.8}>
        <VsCard good="RIGENERARE" bad="RICOMPRARE" y={330} />
      </At>
      <Sfx t={6.0} name="whoosh" />

      <At t={13.7} d={3.3}>
        <Chips
          y={300}
          align="center"
          icon="pin"
          items={[
            { label: "PASSA IN NEGOZIO", t: 0.1 },
            { label: "SCRIVICI SU WHATSAPP", t: 1.6 },
          ]}
        />
      </At>
      <Sfx t={13.8} name="pop" />
      <Sfx t={15.3} name="pop" />

      <At t={18.9} d={2.0}>
        <Sticker text="LE PILE?!" x={540} y={330} />
      </At>
      <Sfx t={18.9} name="hit" volume={0.5} />
    </>
  ),
};
