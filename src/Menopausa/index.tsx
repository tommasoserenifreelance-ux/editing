import {
  Art,
  BrainArt,
  CrackedBone,
  FallingHormone,
  Heart,
  HotFlush,
  Waving,
} from "./illus";
import { colors } from "./theme";
import { Blue, Body, Hl, Label, Pink, Row, Slide, Title } from "./ui";

// Carousel for the World Menopause Day (18 October), 1080x1350 stills.

const Cover: React.FC = () => (
  <Slide
    page={1}
    art={
      <>
        <div
          style={{
            position: "absolute",
            right: -260,
            bottom: -300,
            width: 820,
            height: 820,
            borderRadius: "50%",
            background: colors.pinkSoft,
          }}
        />
        <Art x={650} y={800} size={300}>
          <HotFlush />
        </Art>
      </>
    }
  >
    <Label>18 OTTOBRE · IN ITALIA</Label>
    <Title size={200}>
      <Blue>17 MILIONI</Blue>
    </Title>
    <Title size={76}>
      DI DONNE IN MENOPAUSA.
      <br />E NE PARLIAMO SOLO
      <br />
      PER LE <Hl>VAMPATE.</Hl>
    </Title>
    <div
      style={{
        position: "absolute",
        top: 900,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontSize: 30,
        letterSpacing: 4,
      }}
    >
      SCORRI
      <div style={{ width: 90, height: 3, background: colors.pink }} />
    </div>
  </Slide>
);

const Option: React.FC<{ letter: string; text: string }> = ({
  letter,
  text,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 36,
      padding: "26px 0",
      borderTop: `2px solid ${colors.rule}`,
      fontSize: 50,
    }}
  >
    <span style={{ color: colors.pink, width: 40 }}>{letter}</span>
    {text}
  </div>
);

const Question: React.FC = () => (
  <Slide page={2} background={colors.cream}>
    <Label>UNA DOMANDA SCOMODA</Label>
    <Title size={100}>
      QUAL È LA
      <br />
      <Blue>PRIMA CAUSA</Blue>
      <br />
      DI MORTE
      <br />
      DELLE DONNE
      <br />
      IN ITALIA?
    </Title>
    <div style={{ marginTop: 70, borderBottom: `2px solid ${colors.rule}` }}>
      <Option letter="A" text="IL TUMORE AL SENO" />
      <Option letter="B" text="LE MALATTIE DEL CUORE" />
    </div>
    <Body
      size={26}
      style={{ marginTop: 36, color: colors.muted, letterSpacing: 3 }}
    >
      LA RISPOSTA NELLA PROSSIMA SLIDE →
    </Body>
  </Slide>
);

const Bar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div style={{ marginBottom: 34 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 32,
        marginBottom: 12,
      }}
    >
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div style={{ height: 18, borderRadius: 9, background: colors.rule }}>
      <div
        style={{
          height: 18,
          borderRadius: 9,
          width: `${(value / 33) * 100}%`,
          background: color,
        }}
      />
    </div>
  </div>
);

const Answer: React.FC = () => (
  <Slide
    page={3}
    source="FONTE: ISTAT, CAUSE DI MORTE IN ITALIA – ANNO 2023. QUOTA SUL TOTALE DEI DECESSI FEMMINILI."
    art={
      <Art x={780} y={170} size={210}>
        <Heart />
      </Art>
    }
  >
    <Label>RISPOSTA B</Label>
    <div style={{ fontSize: 300, lineHeight: 0.92, color: colors.blue }}>
      33%
    </div>
    <Title size={64}>
      DEI DECESSI FEMMINILI
      <br />È <Hl>CARDIOVASCOLARE.</Hl>
    </Title>
    <div style={{ marginTop: 70 }}>
      <Bar label="CUORE E VASI" value={33} color={colors.blue} />
      <Bar label="TUTTI I TUMORI INSIEME" value={23} color={colors.pink} />
    </div>
    <Body style={{ marginTop: 20 }}>
      E IL RISCHIO <Pink>ACCELERA DOPO LA MENOPAUSA.</Pink>
    </Body>
  </Slide>
);

const Estrogens: React.FC = () => (
  <Slide
    page={4}
    source="FONTE: AMERICAN HEART ASSOCIATION, SCIENTIFIC STATEMENT SU MENOPAUSA E RISCHIO CARDIOVASCOLARE (CIRCULATION, 2020)."
    art={
      <Art x={820} y={170} size={170}>
        <FallingHormone />
      </Art>
    }
  >
    <Label>COSA CAMBIA</Label>
    <Title>
      <Blue>QUANDO CALANO</Blue>
      <br />
      GLI <Hl>ESTROGENI</Hl>
    </Title>
    <div style={{ marginTop: 50 }}>
      <Row n="01" top="LA PRESSIONE" bottom="TENDE A SALIRE" />
      <Row n="02" top="IL COLESTEROLO LDL" bottom="AUMENTA" />
      <Row n="03" top="IL GRASSO SI SPOSTA" bottom="SULL'ADDOME" />
      <Row n="04" top="LE OSSA PERDONO DENSITÀ" bottom="PIÙ IN FRETTA" />
      <Row n="05" top="CRESCE IL RISCHIO DI" bottom="INSULINO-RESISTENZA" />
    </div>
  </Slide>
);

const Stat: React.FC<{
  value: string;
  text: React.ReactNode;
  tone: "blue" | "pink";
}> = ({ value, text, tone }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "40px 46px",
      borderRadius: 28,
      background: tone === "blue" ? colors.blueSoft : colors.pinkSoft,
    }}
  >
    <div
      style={{
        fontSize: 104,
        lineHeight: 1,
        color: tone === "blue" ? colors.blue : colors.pink,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 32, lineHeight: 1.15, textAlign: "right" }}>
      {text}
    </div>
  </div>
);

const Bones: React.FC = () => (
  <Slide
    page={5}
    source="FONTI: INTERNATIONAL OSTEOPOROSIS FOUNDATION; MINISTERO DELLA SALUTE."
    art={
      <Art x={800} y={170} size={190}>
        <CrackedBone />
      </Art>
    }
  >
    <Label>OSSA</Label>
    <Title>
      <Blue>L&apos;OSTEOPOROSI</Blue>
      <br />
      NON FA <Hl>MALE.</Hl>
    </Title>
    <Body size={40} style={{ marginTop: 18, color: colors.pink }}>
      FINCHÉ NON SI ROMPE QUALCOSA.
    </Body>
    <div
      style={{
        marginTop: 60,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <Stat
        tone="blue"
        value="1 SU 3"
        text={
          <>
            DONNE OVER 50 AVRÀ
            <br />
            UNA FRATTURA DA FRAGILITÀ
          </>
        }
      />
      <Stat
        tone="pink"
        value="15–25%"
        text={
          <>
            MORTALITÀ ENTRO UN ANNO
            <br />
            DA UNA FRATTURA DI FEMORE
          </>
        }
      />
    </div>
    <Body style={{ marginTop: 50 }}>
      MOLTE DONNE SCOPRONO DI AVERE OSSA FRAGILI
      <br />
      <Blue>SOLO DOPO LA PRIMA FRATTURA.</Blue>
    </Body>
  </Slide>
);

const Brain: React.FC = () => (
  <Slide
    page={6}
    source="FONTE: ISTAT, CAUSE DI MORTE IN ITALIA – ANNO 2023. QUOTA SUL TOTALE DEI DECESSI PER SESSO."
    art={
      <Art x={790} y={170} size={200}>
        <BrainArt />
      </Art>
    }
  >
    <Label>CERVELLO</Label>
    <Title>
      <Blue>DEMENZE:</Blue>
      <br />
      UN PROBLEMA
      <br />
      <Hl>DONNA.</Hl>
    </Title>
    <div style={{ marginTop: 60, display: "flex", alignItems: "stretch" }}>
      {[
        { who: "DONNE", value: "7%", color: colors.pink },
        { who: "UOMINI", value: "3%", color: colors.blue },
      ].map((c, i) => (
        <div
          key={c.who}
          style={{
            flex: 1,
            paddingLeft: i === 0 ? 0 : 60,
            borderLeft: i === 0 ? "none" : `2px solid ${colors.rule}`,
          }}
        >
          <div style={{ fontSize: 210, lineHeight: 1, color: c.color }}>
            {c.value}
          </div>
          <div style={{ fontSize: 30, letterSpacing: 4, marginTop: 10 }}>
            {c.who}
          </div>
        </div>
      ))}
    </div>
    <Body size={28} style={{ marginTop: 26, color: colors.muted }}>
      DEI DECESSI È DOVUTO A DEMENZA, ALZHEIMER COMPRESO.
    </Body>
    <Body style={{ marginTop: 44 }}>
      CONTA L&apos;ETÀ: LE DONNE VIVONO DI PIÙ.
      <br />
      <Blue>MA LA RICERCA GUARDA ANCHE AGLI ESTROGENI,</Blue>
      <br />
      <Blue>CHE AIUTANO A PROTEGGERE IL CERVELLO.</Blue>
    </Body>
  </Slide>
);

const Check: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 28,
      padding: "18px 0",
      borderTop: `2px solid ${colors.rule}`,
      fontSize: 40,
    }}
  >
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle
        cx={22}
        cy={22}
        r={19}
        fill={colors.blueSoft}
        stroke={colors.blue}
        strokeWidth={3}
      />
      <path
        d="M13 23 L19.5 29 L31 16"
        fill="none"
        stroke={colors.pink}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {children}
  </div>
);

const Cta: React.FC = () => (
  <Slide
    page={7}
    art={
      <Art x={810} y={960} size={180}>
        <Waving />
      </Art>
    }
  >
    <Label>IN SINTESI</Label>
    <Title size={100}>
      LA MENOPAUSA
      <br />
      NON È UNA MALATTIA.
      <br />
      <Pink>
        <Hl>IGNORARLA</Hl> SÌ.
      </Pink>
    </Title>
    <div
      style={{
        marginTop: 64,
        fontSize: 24,
        letterSpacing: 5,
        color: colors.muted,
      }}
    >
      DA CONTROLLARE
    </div>
    <div style={{ marginTop: 18 }}>
      <Check>PRESSIONE ARTERIOSA</Check>
      <Check>COLESTEROLO, GLICEMIA E Lp(a)</Check>
      <Check>DENSITOMETRIA OSSEA (MOC)</Check>
      <Check>VISITA CON UNO SPECIALISTA</Check>
    </div>
    <Body style={{ marginTop: 50 }}>
      SALVA IL POST E MANDALO
      <br />
      <Blue>A UNA DONNA A CUI VUOI BENE.</Blue>
    </Body>
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
