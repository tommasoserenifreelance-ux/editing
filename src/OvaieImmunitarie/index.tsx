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
  StudyCard,
  Tag,
  Title,
} from "../EleonoraPiccolo/carousel";

const SLIDES: SlideDef[] = [
  {
    // The photo's own dark grey backdrop, so the fade behind the text is seamless.
    theme: { ...PHOTO, bg: "#2A2A2C" },
    photo: "precoce-ovaio.jpg",
    bare: true,
    textTop: true,
    render: (t) => (
      <>
        <Title theme={t} size={76}>
          Dopo la menopausa le ovaie{" "}
          <Accent theme={t}>non vanno in pensione</Accent>
        </Title>
        <Body size={36}>
          Potrebbero diventare organi con un ruolo immunitario.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          La <Accent theme={t}>notizia</Accent>
        </Title>
        <StudyCard src="ovaie-notizia.png" />
        <Body size={32}>
          Pubblicata su <b>Science</b>, giugno 2026. Racconta due studi: uno sui
          topi e uno sulle donne.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Cosa <Accent theme={t}>pensavamo</Accent>
        </Title>
        <Body>
          Dopo la menopausa le ovaie smettono di ovulare e di produrre estrogeni
          in quantità importanti.
          <br />
          <br />
          Per questo sono sempre state considerate organi &quot;a riposo&quot;,
          senza più un ruolo vero e proprio.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Lo studio sui <Accent theme={t}>topi</Accent>
        </Title>
        <Point
          theme={t}
          title="Chi"
          text="Il laboratorio di Francesca Duncan alla Northwestern University (Stati Uniti). Pubblicato su Molecular Human Reproduction."
        />
        <Point
          theme={t}
          title="Come"
          text="Hanno confrontato le ovaie di topi giovani, di mezza età e anziani, cioè oltre la fase riproduttiva."
        />
        <Point
          theme={t}
          title="Cosa hanno visto"
          text="Come previsto, meno follicoli e più tessuto fibroso. Ma anche qualcosa di inatteso."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          La <Accent theme={t}>sorpresa</Accent>
        </Title>
        <Body size={38}>
          Nelle ovaie dei topi anziani gli scienziati hanno trovato:
        </Body>
        <div style={{ marginTop: 40 }}>
          <Tag>Molte più cellule immunitarie</Tag>
          <Tag>Linfociti T</Tag>
          <Tag>Macrofagi</Tag>
          <Tag>Geni dell&apos;infiammazione più attivi</Tag>
        </div>
        <Body size={34}>
          I segnali infiammatori prodotti dall&apos;ovaio potrebbero arrivare
          anche al resto del corpo.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          E nelle <Accent theme={t}>donne?</Accent>
        </Title>
        <BigNumber theme={t}>28</BigNumber>
        <Body size={36}>
          donne in postmenopausa tra i 50 e i 75 anni. I ricercatori
          (Northwestern University e Buck Institute) hanno analizzato le
          proteine di ovaie sane.
        </Body>
        <Body size={32}>
          Con l&apos;età aumentano le proteine legate a infiammazione, attività
          immunitaria e rimodellamento dei tessuti. Le differenze sono più
          marcate tra i 50 e i 70 anni e oltre.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={66}>
          Cosa non sappiamo <Accent theme={t}>ancora</Accent>
        </Title>
        <Point
          theme={t}
          title="Funzione o deposito?"
          text="Non è chiaro se le ovaie mandino davvero segnali immunitari al corpo o se raccolgano soltanto cellule immunitarie."
        />
        <Point
          theme={t}
          title="Un bene o un male?"
          text="Non sappiamo ancora se questo cambiamento sia utile o dannoso."
        />
        <Point
          theme={t}
          title="Dati iniziali"
          text="La parte principale della ricerca è sui topi, e lo studio sulle donne è piccolo."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Cosa significa <Accent theme={t}>per te</Accent>
        </Title>
        <Body size={38}>
          Le ovaie non diventano organi &quot;inutili&quot; dopo la menopausa:
          continuano a cambiare e a dialogare con il resto del corpo.
          <br />
          <br />
          Ogni decisione sulla loro rimozione va valutata con attenzione insieme
          al tuo ginecologo.
          <br />
          <br />
          Pensavi che dopo la menopausa le ovaie non servissero più? Scrivilo
          nei commenti.
        </Body>
        <div style={{ marginTop: 50, fontSize: 22, color: colors.muted }}>
          Fonti: Science (giugno 2026); Duncan lab, Molecular Human Reproduction
          (2026); Northwestern University e Buck Institute, Aging Cell (2026).
        </div>
      </>
    ),
  },
];

export const OVAIE_SLIDE_COUNT = SLIDES.length;

export const OvaieImmunitarie: React.FC<{ index: number }> = ({ index }) => {
  const slide = SLIDES[index];
  return (
    <Frame
      theme={slide.theme}
      photo={slide.photo}
      bare={slide.bare}
      textTop={slide.textTop}
    >
      {slide.render(slide.theme)}
    </Frame>
  );
};
