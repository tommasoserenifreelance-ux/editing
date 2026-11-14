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
          Menopausa prima dei 45 anni: riguarda{" "}
          <Accent theme={t}>1&nbsp;donna su&nbsp;14</Accent>
        </Title>
        <Body size={38}>Il nuovo studio su 716.648 donne in 44 paesi.</Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Lo <Accent theme={t}>studio</Accent>
        </Title>
        <StudyCard src="bmj-studio.png" />
        <Body size={32}>
          Pubblicato su <b>BMJ Global Health</b>, 2026.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Di cosa <Accent theme={t}>parliamo</Accent>
        </Title>
        <Point
          theme={t}
          title="Menopausa prematura"
          text="Quando arriva prima dei 40 anni."
        />
        <Point
          theme={t}
          title="Menopausa precoce"
          text="Quando arriva tra i 40 e i 44 anni."
        />
        <Point
          theme={t}
          title="Per confronto"
          text="In media la menopausa arriva intorno ai 50 anni."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Come è stato <Accent theme={t}>fatto</Accent>
        </Title>
        <Point
          theme={t}
          title="716.648 donne"
          text="Tra i 30 e i 49 anni, in 44 paesi a basso e medio reddito."
        />
        <Point
          theme={t}
          title="Dati nazionali"
          text="Le indagini sulla salute (Demographic and Health Surveys) condotte dal 2015 in poi."
        />
        <Point
          theme={t}
          title="La definizione"
          text="Ciclo fermo da almeno 6 mesi, menopausa riferita o isterectomia prima dei 45 anni."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          I <Accent theme={t}>risultati</Accent>
        </Title>
        <BigNumber theme={t}>7,1%</BigNumber>
        <Body size={38}>
          delle donne tra 30 e 49 anni ha avuto la menopausa prima dei 45 anni:
          circa <b>1 su 14</b>.
        </Body>
        <Body size={32}>
          Si va dal 2,3% della Giordania al 12% dell&apos;Etiopia. È più
          frequente nelle zone rurali, soprattutto in Asia meridionale e
          orientale.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={64}>
          Cosa fa la <Accent theme={t}>differenza</Accent>
        </Title>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: t.accent,
            marginTop: 50,
            marginBottom: 20,
          }}
        >
          Associati a un rischio più basso
        </div>
        <Tag>Istruzione più alta</Tag>
        <Tag>Avere un lavoro</Tag>
        <Tag>Sposarsi dopo i 18 anni</Tag>
        <Tag>Primo figlio dopo i 18 anni</Tag>
        <Tag>Tre o più figli</Tag>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: t.accent,
            marginTop: 40,
            marginBottom: 20,
          }}
        >
          Associati a un rischio più alto
        </div>
        <Tag>Vivere in zone rurali</Tag>
        <Tag>Reddito medio</Tag>
        <Body size={32}>
          Istruzione e autonomia delle ragazze non sono solo diritti: sono anche
          salute.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Perché <Accent theme={t}>conta</Accent>
        </Title>
        <Body size={38}>
          Gli estrogeni non regolano solo il ciclo: aiutano a proteggere{" "}
          <b>ossa, cuore e vasi sanguigni</b>.
          <br />
          <br />
          Quando la menopausa arriva prima, questa protezione si perde per più
          anni. Per questo è associata a un rischio più alto di osteoporosi,
          malattie cardiovascolari e mortalità prematura.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          I segnali da <Accent theme={t}>non ignorare</Accent>
        </Title>
        <div style={{ marginTop: 50 }}>
          <Tag>Ciclo irregolare o assente da mesi</Tag>
          <Tag>Vampate e sudorazioni notturne</Tag>
          <Tag>Secchezza vaginale</Tag>
          <Tag>Sbalzi d&apos;umore e insonnia</Tag>
          <Tag>Difficoltà a concepire</Tag>
        </div>
        <Body size={36}>
          Se compaiono <b>prima dei 45 anni</b>, non aspettare e non pensare che
          sia &quot;solo stress&quot;.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Cosa <Accent theme={t}>fare</Accent>
        </Title>
        <Point
          theme={t}
          title="Parlane con il ginecologo"
          text="Valuterà la tua storia e, se serve, gli esami ormonali per capire cosa sta succedendo."
        />
        <Point
          theme={t}
          title="Proteggi ossa e cuore"
          text="Controlli periodici, attività fisica (anche con i pesi), alimentazione equilibrata e niente fumo."
        />
        <Point
          theme={t}
          title="Valuta la terapia con il medico"
          text="Nella menopausa prematura e precoce la terapia ormonale è spesso indicata fino all'età della menopausa naturale, se non ci sono controindicazioni."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Da portare <Accent theme={t}>a casa</Accent>
        </Title>
        <Body size={38}>
          La menopausa prima dei 45 anni non è rara e non riguarda solo il
          ciclo. Riconoscerla presto significa proteggere la tua salute di
          domani.
          <br />
          <br />
          Lo sapevi che la menopausa precoce riguarda anche cuore e ossa?
          Scrivilo nei commenti.
        </Body>
        <div style={{ marginTop: 60, fontSize: 22, color: colors.muted }}>
          Fonte: Islam RB et al. Prevalence and determinants of premature or
          early menopause. BMJ Glob Health. 2026. PMID: 42414208
        </div>
      </>
    ),
  },
];

export const PRECOCE_SLIDE_COUNT = SLIDES.length;

export const MenopausaPrecoce: React.FC<{ index: number }> = ({ index }) => {
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
