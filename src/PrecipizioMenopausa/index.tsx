import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  BigNumber,
  Body,
  Frame,
  LIGHT,
  PHOTO,
  Point,
  SlideDef,
  Theme,
  Title,
} from "../EleonoraPiccolo/carousel";

// Violet waves for the cover, lilac for the inner slides.
const COVER: Theme = { ...PHOTO, accent: "#F7B3CB" };
const INNER: Theme = { ...LIGHT, title: "#4B2A5C", accent: "#A3294F" };

const Row: React.FC<{
  theme: Theme;
  years: string;
  title: string;
  text: string;
}> = ({ theme, years, title, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 40,
      borderTop: `2px solid ${colors.grid}`,
      padding: "30px 0",
    }}
  >
    <div style={{ width: 260 }}>
      <div
        style={{
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -2,
          color: theme.accent,
          lineHeight: 1,
        }}
      >
        {years}
      </div>
      <div style={{ fontSize: 24, marginTop: 8, color: "#5E4A6E" }}>
        prima dell&apos;ultimo ciclo
      </div>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 38, fontWeight: 700, color: theme.title }}>
        {title}
      </div>
      <div style={{ fontSize: 30, lineHeight: 1.35, marginTop: 6 }}>{text}</div>
    </div>
  </div>
);

const SLIDES: SlideDef[] = [
  {
    theme: COVER,
    backdrop: "sfondo-viola.png",
    render: (t) => (
      <>
        <Title theme={t} size={104}>
          La menopausa è un <Accent theme={t}>precipizio</Accent>
        </Title>
        <Body size={42}>
          E gli estrogeni iniziano a calare 12 anni prima.
        </Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={68}>
          Si dice che sia una &quot;transizione graduale&quot;
        </Title>
        <Body size={38}>Un nuovo studio dice il contrario.</Body>
        <BigNumber theme={t}>1 milione</BigNumber>
        <Body size={38}>di donne</Body>
        <BigNumber theme={t}>300 milioni</BigNumber>
        <Body size={38}>di esami di laboratorio analizzati</Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={64}>
          Gli ormoni cambiano <Accent theme={t}>più di 10 anni prima</Accent>
        </Title>
        <div style={{ marginTop: 40 }}>
          <Row
            theme={t}
            years="12 anni"
            title="Estrogeni"
            text="iniziano a calare"
          />
          <Row
            theme={t}
            years="14 anni"
            title="FSH"
            text="sale più in fretta: il cervello fatica di più a far ovulare"
          />
          <Row
            theme={t}
            years="15 anni"
            title="AMH"
            text="indicatore della riserva di ovociti, cala più velocemente"
          />
        </div>
        <Body size={30}>
          Prima si pensava che questi cambiamenti iniziassero{" "}
          <b>7 anni prima</b> dell&apos;ultimo ciclo.
        </Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={84}>
          Ti hanno detto che sei{" "}
          <Accent theme={t}>&quot;troppo giovane&quot;</Accent> per la
          perimenopausa?
        </Title>
        <Body size={38}>
          Per molte donne i cambiamenti ormonali iniziano già tra i 35 e i 40
          anni.
        </Body>
        <Body size={38}>
          <b>Prima di essere considerate &quot;abbastanza grandi&quot;.</b>
        </Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
            color: t.accent,
          }}
        >
          POI ARRIVA L&apos;ULTIMO CICLO
        </div>
        <BigNumber theme={t}>52 su 90</BigNumber>
        <Body size={42}>
          <b>esami cambiano di colpo.</b> Succede per ossa, fegato, umore,
          sonno, colesterolo ed equilibrio dei liquidi.
        </Body>
        <Body size={38}>Cosa hanno mostrato gli esami?</Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Un vero <Accent theme={t}>precipizio</Accent>
        </Title>
        <Point
          theme={t}
          title="1. Ossa"
          text="L'osteoporosi aumenta più in fretta che negli uomini. La densità ossea crolla all'ultimo ciclo e anche il piombo nel sangue sale, probabilmente rilasciato dalle ossa."
        />
        <Point
          theme={t}
          title="2. Umore e sonno"
          text="Depressione e difficoltà ad addormentarsi e a dormire bene aumentano di colpo all'ultimo ciclo, poi migliorano piano piano negli anni."
        />
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Un vero <Accent theme={t}>precipizio</Accent>
        </Title>
        <Point
          theme={t}
          title="3. Cuore e colesterolo"
          text='Infarto e ictus aumentano più rapidamente di prima. Il colesterolo LDL (quello "cattivo") e quello totale salgono all&apos;ultimo ciclo.'
        />
        <Point
          theme={t}
          title="4. Fegato e liquidi"
          text="Gli enzimi del fegato sono tra gli esami che cambiano di più. Sale anche il sodio nel sangue, perché gli estrogeni regolano l'ormone che controlla l'equilibrio dell'acqua."
        />
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={76}>
          La terapia ormonale <Accent theme={t}>attutisce la caduta?</Accent>
        </Title>
        <Body size={36}>
          Nelle donne in terapia ormonale con estrogeni molti cambiamenti sono
          risultati più piccoli, soprattutto per ossa, fegato ed equilibrio dei
          liquidi. I loro esami cambiavano in modo più graduale.
        </Body>
        <div
          style={{
            marginTop: 44,
            border: `3px solid ${t.accent}`,
            borderRadius: 18,
            padding: "28px 34px",
            fontSize: 32,
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 3,
              color: t.accent,
            }}
          >
            UN&apos;ECCEZIONE
          </div>
          La PCR, un indicatore di infiammazione, era più alta con la terapia
          per <b>bocca</b>, ma non con i <b>cerotti</b>.
        </div>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={72}>
          La menopausa ti ha cambiato la vita?
        </Title>
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.05,
            marginTop: 40,
            color: t.accent,
          }}
        >
          Non stavi esagerando.
        </div>
        <Body size={36}>
          Questi valori cambiano di colpo all&apos;ultimo ciclo: non è un lento
          declino. Quando il corpo cambia così tanto, è normale fare fatica.
        </Body>
      </>
    ),
  },
  {
    theme: INNER,
    backdrop: "sfondo-lilla.png",
    render: (t) => (
      <>
        <Title theme={t} size={72}>
          La prevenzione può iniziare <Accent theme={t}>già dai 30 anni</Accent>
        </Title>
        <Point
          theme={t}
          title="1. Parlane presto"
          text="Ossa, cuore e metabolismo meritano attenzione già mentre gli ormoni iniziano a cambiare."
        />
        <Point
          theme={t}
          title='2. Non accettare un "sei troppo giovane"'
          text="Se hai dei sintomi, meritano di essere ascoltati."
        />
        <Body size={34}>
          I ricercatori parlano di una finestra di prevenzione che si apre 10
          anni prima della menopausa.{" "}
          <b>È una buona notizia: c&apos;è più tempo per agire.</b>
        </Body>
        <div style={{ marginTop: 40, fontSize: 22, color: "#5E4A6E" }}>
          Fonte: Pridham et al., Nature Medicine, 2026
        </div>
      </>
    ),
  },
];

export const PRECIPIZIO_SLIDE_COUNT = SLIDES.length;

export const PrecipizioMenopausa: React.FC<{ index: number }> = ({ index }) => {
  const slide = SLIDES[index];
  return (
    <Frame
      theme={slide.theme}
      photo={slide.photo}
      bare={slide.bare}
      backdrop={slide.backdrop}
    >
      {slide.render(slide.theme)}
    </Frame>
  );
};
