import { Img, staticFile } from "remotion";
import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  Body,
  Frame,
  LIGHT,
  SlideDef,
  Tag,
  Title,
} from "../EleonoraPiccolo/carousel";

const Point: React.FC<{ theme: typeof LIGHT; title: string; text: string }> = ({
  theme,
  title,
  text,
}) => (
  <div style={{ marginTop: 40 }}>
    <div style={{ fontSize: 40, fontWeight: 700, color: theme.accent }}>
      {title}
    </div>
    <div style={{ fontSize: 33, lineHeight: 1.4, marginTop: 8 }}>{text}</div>
  </div>
);

const SLIDES: SlideDef[] = [
  {
    // The photo's own beige backdrop, so the fade behind the text is seamless.
    theme: { ...LIGHT, bg: "#BEA386" },
    photo: "acog-calla.jpg",
    bare: true,
    render: (t) => (
      <>
        <Title theme={t} size={76}>
          Menopausa: le nuove linee guida <Accent theme={t}>ACOG</Accent>
        </Title>
        <Body size={38}>
          Vampate, sonno e umore: cosa raccomandano gli esperti.
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
        <Img
          src={staticFile("img/acog-studio.png")}
          style={{
            marginTop: 50,
            width: "100%",
            background: "#fff",
            padding: 24,
            borderRadius: 18,
            boxShadow: "0 12px 40px rgba(110,63,99,0.18)",
          }}
        />
        <Body size={32}>
          Pubblicato su <b>Obstetrics &amp; Gynecology</b>, novembre 2026.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Cosa è <Accent theme={t}>successo</Accent>
        </Title>
        <Body>
          L&apos;<b>American College of Obstetricians and Gynecologists</b>{" "}
          (ACOG), la società americana di ostetricia e ginecologia, ha
          pubblicato una nuova linea guida di pratica clinica.
          <br />
          <br />
          Il tema è uno di quelli che tocca più da vicino le donne: come gestire
          i sintomi della menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          L&apos;<Accent theme={t}>obiettivo</Accent>
        </Title>
        <Body size={38}>
          Dare raccomandazioni basate sulle migliori evidenze scientifiche
          disponibili per tre gruppi di sintomi:
        </Body>
        <div style={{ marginTop: 40 }}>
          <Tag>Vampate e sudorazioni</Tag>
          <Tag>Disturbi del sonno</Tag>
          <Tag>Alterazioni dell&apos;umore</Tag>
        </div>
        <Body size={34}>
          Sia nella menopausa spontanea sia in quella indotta, dai 40 anni in
          su.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          A chi si <Accent theme={t}>rivolge</Accent>
        </Title>
        <Body>
          A chi è in <b>perimenopausa</b> o in <b>postmenopausa</b> ed è stato
          assegnato al sesso femminile alla nascita: donne, uomini transgender e
          persone con identità di genere diverse.
          <br />
          <br />
          In particolare a chi ha vampate, disturbi del sonno o cambiamenti
          dell&apos;umore legati alla menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={66}>
          Come sono state <Accent theme={t}>costruite</Accent>
        </Title>
        <Point
          theme={t}
          title="Un gruppo di specialisti"
          text="Esperti di endocrinologia della riproduzione, della Menopause Society e di ostetricia e ginecologia."
        />
        <Point
          theme={t}
          title="Doppio controllo"
          text="Ogni studio è stato valutato in modo indipendente da due esperti, con criteri standard."
        />
        <Point
          theme={t}
          title="Metodo GRADE"
          text="Uno degli strumenti più usati al mondo per valutare la qualità delle evidenze scientifiche."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Cosa <Accent theme={t}>contengono</Accent>
        </Title>
        <Point
          theme={t}
          title="Trattamenti farmacologici e non"
          text="Indicazioni su entrambi gli approcci, per vampate, sonno e umore."
        />
        <Point
          theme={t}
          title="Raccomandazioni classificate"
          text="Ognuna ha un grado, in base alla sua forza e alla qualità delle evidenze."
        />
        <Point
          theme={t}
          title="Good Practice Points"
          text="Dove i dati scientifici non bastano, consigli pratici per orientare comunque i medici."
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
        <Body>
          I sintomi della menopausa non vanno semplicemente sopportati. Esistono
          opzioni, farmacologiche e non, valutate sulla base delle evidenze.
          <br />
          <br />
          Il percorso giusto si costruisce insieme al tuo medico.
        </Body>
        <div style={{ marginTop: 60, fontSize: 22, color: colors.muted }}>
          Fonte: ACOG Clinical Practice Guideline. Obstet Gynecol. 2026 Nov
          1;148(5):e345-e369. doi: 10.1097/AOG.0000000000006428
        </div>
      </>
    ),
  },
];

export const ACOG_SLIDE_COUNT = SLIDES.length;

export const LineeGuidaACOG: React.FC<{ index: number }> = ({ index }) => {
  const slide = SLIDES[index];
  return (
    <Frame theme={slide.theme} photo={slide.photo} bare={slide.bare}>
      {slide.render(slide.theme)}
    </Frame>
  );
};
