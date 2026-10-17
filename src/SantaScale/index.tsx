import { AbsoluteFill } from "remotion";
import {
  Background,
  Body,
  Content,
  Kicker,
  Pictogram,
  Shade,
  Step,
  Strong,
  Title,
} from "./Slide";
import { colors, sans, serif } from "./theme";

export { Cover, COVER_DURATION } from "./Cover";
export { SCALE_FPS, SCALE_HEIGHT, SCALE_WIDTH } from "./theme";

const TOTAL = 4;

export const SALITA_DURATION = 112; // 3.75 s, length of the source clip
export const DISCESA_DURATION = 126; // 4.2 s: the clip is empty stairs after this

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div style={{ flex: 1 }}>
    <div
      style={{
        fontFamily: serif,
        fontWeight: 700,
        fontStyle: "italic",
        fontSize: 120,
        lineHeight: 1,
        color: colors.accent,
      }}
    >
      {value}
    </div>
    <Body style={{ fontSize: 28, marginTop: 10 }}>{label}</Body>
  </div>
);

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 21,
      lineHeight: 1.4,
      color: "rgba(255,255,255,0.6)",
      marginTop: 22,
    }}
  >
    {children}
  </div>
);

export const Scienza: React.FC = () => (
  <AbsoluteFill>
    <Background image="foto-salita.jpg" position="50% 30%" />
    <Shade from={22} />
    <Pictogram page={2} total={TOTAL} />
    <Content>
      <Kicker>Cosa dice la scienza</Kicker>
      <Title>Ogni rampa allunga il passo alla longevità</Title>
      <div style={{ display: "flex", gap: 40, marginBottom: 30 }}>
        <Stat value="−39%" label="mortalità cardiovascolare" />
        <Stat value="−24%" label="mortalità per tutte le cause" />
      </div>
      <Body>
        Una meta-analisi su <Strong>quasi 480mila adulti</Strong> ha associato
        il salire regolarmente le scale a un rischio più basso. I benefici
        maggiori? Da <Strong>circa 6 rampe al giorno</Strong>.
      </Body>
      <Note>Dati osservazionali: indicano un’associazione, non una causa.</Note>
    </Content>
  </AbsoluteFill>
);

export const Protocollo: React.FC = () => (
  <AbsoluteFill>
    <Background video="salita.mp4" position="50% 40%" zoom={[1, 1.04]} />
    <Shade from={18} />
    <Pictogram page={3} total={TOTAL} />
    <Content>
      <Kicker>Il protocollo</Kicker>
      <Title>Ripetute, non passeggiate.</Title>
      <Step n="01">
        <Strong>Riscaldati</Strong>: 5′ di camminata e 2 rampe lente
      </Step>
      <Step n="02">
        <Strong>Sali a passo spinto</Strong> per 30–45″, fatica 7–8 su 10
      </Step>
      <Step n="03">
        <Strong>Scendi camminando</Strong>: è il tuo recupero
      </Step>
      <Step n="04">
        <Strong>Ripeti 6–10 volte</Strong>, 2–3 volte a settimana
      </Step>
    </Content>
  </AbsoluteFill>
);

export const Progressione: React.FC = () => (
  <AbsoluteFill>
    <Background video="discesa.mp4" position="50% 40%" zoom={[1.04, 1]} />
    <Shade from={18} />
    <Pictogram page={4} total={TOTAL} />
    <Content>
      <Kicker>Come progredire</Kicker>
      <Title>Ogni settimana, un gradino in più.</Title>
      <Step n="1–2">
        <Strong>6 ripetute</Strong> a ritmo sostenibile
      </Step>
      <Step n="3–4">
        <Strong>8 ripetute</Strong>, salita più decisa
      </Step>
      <Step n="5+">
        <Strong>10 ripetute</Strong> o salita a gradini alterni
      </Step>
      <Body style={{ marginTop: 22, color: colors.ink }}>
        In discesa niente fretta: corrimano e passo controllato.
      </Body>
      <Note>
        Settimane indicative. Patologie cardiache o articolari? Parlane prima
        con il tuo medico.
      </Note>
    </Content>
  </AbsoluteFill>
);
