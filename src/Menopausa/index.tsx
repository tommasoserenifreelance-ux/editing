import { Accent, Box, Hl, Row, Slide, Title } from "./ui";
import {
  Art,
  BrainArt,
  CrackedBone,
  FallingHormone,
  Heart,
  HotFlush,
  QuestionBubble,
  Waving,
} from "./illus";
import { colors } from "./theme";

// Carousel for the World Menopause Day (18 October), 1080x1350 stills.

const Cover: React.FC = () => (
  <Slide
    art={
      <Art x={800} y={975} size={220}>
        <HotFlush />
      </Art>
    }
  >
    <div style={{ fontSize: 40, color: colors.accent, letterSpacing: 1 }}>
      18 OTTOBRE · GIORNATA MONDIALE DELLA MENOPAUSA
    </div>
    <div style={{ marginTop: 40 }}>
      <Title size={230}>
        <Accent>17 MILIONI</Accent>
      </Title>
      <Title size={112}>
        DI DONNE IN MENOPAUSA.
        <br />E NE PARLIAMO
        <br />
        SOLO PER LE <Hl>VAMPATE.</Hl>
      </Title>
    </div>
    <div
      style={{
        marginTop: 90,
        display: "flex",
        alignItems: "center",
        gap: 40,
      }}
    >
      <div
        style={{
          background: colors.accent,
          color: colors.bg,
          border: `5px solid ${colors.ink}`,
          borderRadius: 40,
          padding: "16px 44px",
          fontSize: 56,
        }}
      >
        SCORRI →
      </div>
      <div style={{ fontSize: 40, lineHeight: 1.15 }}>
        QUELLO CHE NESSUNO
        <br />
        <Accent>TI DICE SULLA MENOPAUSA</Accent>
      </div>
    </div>
  </Slide>
);

const Question: React.FC = () => (
  <Slide
    art={
      <Art x={790} y={110} size={230}>
        <QuestionBubble />
      </Art>
    }
  >
    <Title>
      <Accent>UNA DOMANDA</Accent>
      <br />
      <Hl>SCOMODA</Hl>
    </Title>
    <div style={{ marginTop: 60, fontSize: 76, lineHeight: 1.1 }}>
      QUAL È LA PRIMA CAUSA
      <br />
      DI MORTE DELLE DONNE
      <br />
      IN ITALIA?
    </div>
    <div
      style={{
        marginTop: 60,
        display: "flex",
        flexDirection: "column",
        gap: 34,
      }}
    >
      <Box variant="white" height={150}>
        <div style={{ fontSize: 70, color: colors.accent }}>A</div>
        <div style={{ fontSize: 60 }}>IL TUMORE AL SENO</div>
      </Box>
      <Box variant="light" height={150}>
        <div style={{ fontSize: 70 }}>B</div>
        <div style={{ fontSize: 60 }}>LE MALATTIE DEL CUORE</div>
      </Box>
    </div>
    <div style={{ marginTop: 50, fontSize: 44, color: colors.accent }}>
      LA RISPOSTA NELLA PROSSIMA SLIDE →
    </div>
  </Slide>
);

const Bar: React.FC<{
  label: string;
  value: number;
  max: number;
  strong?: boolean;
}> = ({ label, value, max, strong }) => (
  <div>
    <div style={{ fontSize: 46, marginBottom: 14 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <div
        style={{
          height: 110,
          width: `${(value / max) * 72}%`,
          background: strong ? colors.accent : colors.light,
          border: `5px solid ${colors.ink}`,
          borderRadius: 18,
        }}
      />
      <div
        style={{
          fontSize: 110,
          lineHeight: 1,
          color: strong ? colors.accent : colors.ink,
        }}
      >
        {value}%
      </div>
    </div>
  </div>
);

const Answer: React.FC = () => (
  <Slide
    source="FONTE: ISTAT, CAUSE DI MORTE IN ITALIA – ANNO 2023 (QUOTA SUL TOTALE DEI DECESSI FEMMINILI)."
    art={
      <Art x={770} y={110} size={240}>
        <Heart />
      </Art>
    }
  >
    <Title>
      <Accent>RISPOSTA B:</Accent>
      <br />
      <Hl>IL CUORE.</Hl>
    </Title>
    <div
      style={{
        marginTop: 60,
        display: "flex",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <Bar label="MALATTIE CARDIOVASCOLARI" value={33} max={33} strong />
      <Bar label="TUTTI I TUMORI MESSI INSIEME" value={23} max={33} />
    </div>
    <div style={{ marginTop: 60, fontSize: 54, lineHeight: 1.12 }}>
      1 DONNA SU 3 MUORE PER CUORE E VASI.
      <br />
      <Accent>E IL RISCHIO ACCELERA DOPO LA MENOPAUSA.</Accent>
    </div>
  </Slide>
);

const Estrogens: React.FC = () => (
  <Slide
    source="FONTE: AMERICAN HEART ASSOCIATION, SCIENTIFIC STATEMENT SU MENOPAUSA E RISCHIO CARDIOVASCOLARE (CIRCULATION, 2020)."
    art={
      <Art x={800} y={100} size={200}>
        <FallingHormone />
      </Art>
    }
  >
    <Title size={112}>
      <Accent>QUANDO CALANO</Accent>
      <br />
      GLI <Hl>ESTROGENI</Hl>
    </Title>
    <div style={{ marginTop: 24 }}>
      <Row n="01" top="LA PRESSIONE" bottom="TENDE A SALIRE" />
      <Row n="02" top="IL COLESTEROLO LDL" bottom="AUMENTA" />
      <Row n="03" top="IL GRASSO SI SPOSTA" bottom="SULL'ADDOME" />
      <Row n="04" top="LE OSSA PERDONO DENSITÀ" bottom="PIÙ IN FRETTA" />
      <Row
        n="05"
        top="CRESCE IL RISCHIO DI"
        bottom="INSULINO-RESISTENZA"
        last
      />
    </div>
  </Slide>
);

const Bones: React.FC = () => (
  <Slide
    source="FONTI: INTERNATIONAL OSTEOPOROSIS FOUNDATION; MINISTERO DELLA SALUTE."
    art={
      <Art x={800} y={150} size={230}>
        <CrackedBone />
      </Art>
    }
  >
    <Title size={116}>
      <Accent>L'OSTEOPOROSI</Accent>
      <br />
      NON FA <Hl>MALE.</Hl>
    </Title>
    <div style={{ marginTop: 20, fontSize: 54, color: colors.accent }}>
      FINCHÉ NON SI ROMPE QUALCOSA.
    </div>
    <div
      style={{
        marginTop: 60,
        display: "flex",
        flexDirection: "column",
        gap: 34,
      }}
    >
      <Box variant="light" height={220}>
        <div style={{ fontSize: 96, lineHeight: 1 }}>1 SU 3</div>
        <div style={{ fontSize: 42, lineHeight: 1.12, textAlign: "right" }}>
          LE DONNE OVER 50 CHE AVRANNO
          <br />
          UNA FRATTURA DA FRAGILITÀ
        </div>
      </Box>
      <Box variant="accent" height={220}>
        <div style={{ fontSize: 96, lineHeight: 1 }}>15–25%</div>
        <div style={{ fontSize: 42, lineHeight: 1.12, textAlign: "right" }}>
          MORTALITÀ ENTRO UN ANNO
          <br />
          DA UNA FRATTURA DI FEMORE
        </div>
      </Box>
    </div>
    <div style={{ marginTop: 50, fontSize: 46, lineHeight: 1.15 }}>
      MOLTE DONNE SCOPRONO DI AVERE OSSA FRAGILI
      <br />
      <Accent>SOLO DOPO LA PRIMA FRATTURA.</Accent>
    </div>
  </Slide>
);

const Brain: React.FC = () => (
  <Slide
    source="FONTE: ISTAT, CAUSE DI MORTE IN ITALIA – ANNO 2023 (QUOTA SUL TOTALE DEI DECESSI PER SESSO)."
    art={
      <Art x={780} y={120} size={230}>
        <BrainArt />
      </Art>
    }
  >
    <Title size={120}>
      <Accent>DEMENZE:</Accent>
      <br />
      UN PROBLEMA <Hl>DONNA</Hl>
    </Title>
    <div style={{ marginTop: 56, display: "flex", gap: 34 }}>
      {[
        { who: "DONNE", value: "7%", variant: "accent" as const },
        { who: "UOMINI", value: "3%", variant: "white" as const },
      ].map((c) => (
        <div key={c.who} style={{ flex: 1 }}>
          <Box variant={c.variant} height={300}>
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 180, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 54 }}>{c.who}</div>
            </div>
          </Box>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontSize: 40, color: colors.muted }}>
      DEI DECESSI È DOVUTO A DEMENZA, ALZHEIMER COMPRESO
    </div>
    <div style={{ marginTop: 44, fontSize: 48, lineHeight: 1.14 }}>
      CONTA L'ETÀ: LE DONNE VIVONO DI PIÙ.
      <br />
      <Accent>MA LA RICERCA GUARDA ANCHE AGLI ESTROGENI,</Accent>
      <br />
      <Accent>CHE AIUTANO A PROTEGGERE IL CERVELLO.</Accent>
    </div>
  </Slide>
);

const Check: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 30, fontSize: 52 }}>
    <div
      style={{
        width: 58,
        height: 58,
        borderRadius: 12,
        border: `5px solid ${colors.ink}`,
        background: colors.light,
        flexShrink: 0,
      }}
    />
    <div>{children}</div>
  </div>
);

const Cta: React.FC = () => (
  <Slide
    art={
      <Art x={800} y={1040} size={200}>
        <Waving />
      </Art>
    }
  >
    <Title size={116}>
      LA MENOPAUSA
      <br />
      NON È UNA MALATTIA.
      <br />
      <Accent>
        <Hl>IGNORARLA</Hl> SÌ.
      </Accent>
    </Title>
    <div style={{ marginTop: 56, fontSize: 46, color: colors.accent }}>
      DA CONTROLLARE:
    </div>
    <div
      style={{
        marginTop: 26,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <Check>PRESSIONE ARTERIOSA</Check>
      <Check>COLESTEROLO, GLICEMIA E Lp(a)</Check>
      <Check>DENSITOMETRIA OSSEA (MOC)</Check>
      <Check>UNA VISITA CON UNO SPECIALISTA</Check>
    </div>
    <div style={{ marginTop: 56, fontSize: 50, lineHeight: 1.14 }}>
      SALVA IL POST E MANDALO
      <br />
      <Accent>A UNA DONNA A CUI VUOI BENE.</Accent>
    </div>
  </Slide>
);

export const MENOPAUSA_SLIDES: { id: string; component: React.FC }[] = [
  { id: "Menopausa-1", component: Cover },
  { id: "Menopausa-2", component: Question },
  { id: "Menopausa-3", component: Answer },
  { id: "Menopausa-4", component: Estrogens },
  { id: "Menopausa-5", component: Bones },
  { id: "Menopausa-6", component: Brain },
  { id: "Menopausa-7", component: Cta },
];
