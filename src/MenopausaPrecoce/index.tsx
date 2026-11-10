import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  BigNumber,
  Body,
  Frame,
  LIGHT,
  Point,
  SlideDef,
  StudyCard,
  Tag,
  Title,
} from "../EleonoraPiccolo/carousel";

const SLIDES: SlideDef[] = [
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={84}>
          Menopausa prima dei 45 anni: riguarda{" "}
          <Accent theme={t}>1 donna su 14</Accent>
        </Title>
        <Body size={38}>
          Il nuovo studio su 716.648 donne in 44 paesi a basso e medio reddito.
        </Body>
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
          title="Perché conta"
          text="È associata a un rischio più alto di malattie cardiovascolari, osteoporosi e mortalità prematura."
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
          Lo studio riguarda paesi a basso e medio reddito, ma il messaggio vale
          per tutte: la menopausa prima dei 45 anni non riguarda solo il ciclo,
          ma anche cuore e ossa.
          <br />
          <br />
          Se il ciclo si ferma prima dei 45 anni, parlane con il tuo medico.
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
    <Frame theme={slide.theme} photo={slide.photo} bare={slide.bare}>
      {slide.render(slide.theme)}
    </Frame>
  );
};
