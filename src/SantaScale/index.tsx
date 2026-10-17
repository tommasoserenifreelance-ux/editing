import { AbsoluteFill } from "remotion";
import {
  Background,
  Body,
  Content,
  Pictogram,
  Shade,
  Step,
  Strong,
  Title,
} from "./Slide";
import { colors, sans, serif } from "./theme";

export { Cover, COVER_DURATION } from "./Cover";
export { SCALE_FPS, SCALE_HEIGHT, SCALE_WIDTH } from "./theme";

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
    <Pictogram />
    <Content>
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
    <Pictogram />
    <Content>
      <Title>Ripetute, non passeggiate.</Title>
      <Step n="01">
        <Strong>Riscaldati</Strong>: 5′ di camminata e 2 rampe lente
      </Step>
      <Step n="02">
        <Strong>Sali a passo spinto</Strong> per 30–45″
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
    <Pictogram />
    <Content>
      <Title>
        Ormai non ne faccio{"\u00a0"}a{"\u00a0"}meno.
      </Title>
      <Body>
        È diventata <Strong>una mia routine</Strong>: due o tre volte a
        settimana le scale sotto casa diventano la mia palestra. Salgo spinta,
        scendo con calma, ripeto. Pochi minuti, zero attrezzi e tanta energia
        per tutta la giornata.
      </Body>
      <div
        style={{
          marginTop: 30,
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 46,
            lineHeight: 1.15,
            color: colors.accent,
          }}
        >
          Voi la conoscevate? La fate già?
        </div>
        <Body style={{ marginTop: 8, color: colors.ink }}>
          Scrivetemelo nei commenti
        </Body>
      </div>
      <Note>
        Patologie cardiache o articolari? Parlane prima con il tuo medico.
      </Note>
    </Content>
  </AbsoluteFill>
);
