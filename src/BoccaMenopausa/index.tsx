import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  Body,
  Frame,
  LIGHT,
  PHOTO,
  SlideDef,
  Tag,
  Title,
} from "../EleonoraPiccolo/carousel";

export { SLIDE_HEIGHT, SLIDE_WIDTH } from "../EleonoraPiccolo/carousel";

const SYMPTOMS: [string, string][] = [
  [
    "Bocca secca",
    "Il calo degli estrogeni può ridurre la produzione di saliva",
  ],
  [
    "Gengive più fragili",
    "Le fluttuazioni ormonali possono rendere le gengive più sensibili, infiammate o inclini a sanguinare",
  ],
  [
    "Il legame con le ossa",
    "La menopausa accelera la perdita di massa ossea, che può influire sulla densità della mandibola e sul sostegno dei denti",
  ],
  [
    "Sindrome della bocca che brucia",
    "Alcune donne avvertono bruciore, formicolio o dolore in bocca senza una causa evidente",
  ],
];

const SLIDES: SlideDef[] = [
  {
    theme: PHOTO,
    photo: "bocca-sorriso.jpg",
    render: (t) => (
      <>
        <Title theme={t} size={96}>
          La menopausa ci lascia la bocca <Accent theme={t}>secca</Accent>
        </Title>
        <Body size={38}>
          Parliamo di cosa succede nella bocca di una donna in peri/menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Sì, esiste la <Accent theme={t}>bocca da peri/menopausa</Accent>
        </Title>
        <Body>
          Medici e dentisti la descrivono come un insieme di problemi di salute
          orale causati dal <b>calo degli estrogeni</b> durante la
          peri/menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <Body size={50}>
        Come se vampate, ciclo irregolare, sudorazioni notturne e secchezza
        vaginale non bastassero…
        <br />
        <br />
        <b style={{ color: t.title }}>
          alla lista dobbiamo aggiungere bocca secca, gengive doloranti,
          bruciore alla lingua e mandibola serrata.
        </b>
      </Body>
    ),
  },
  {
    theme: PHOTO,
    photo: "bocca-ragazza.jpg",
    render: (t) => (
      <>
        <Title theme={t} size={68}>
          Cosa succede <Accent theme={t}>esattamente?</Accent>
        </Title>
        {SYMPTOMS.map(([name, text]) => (
          <div key={name} style={{ marginTop: 40 }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: t.accent }}>
              {name}
            </div>
            <div style={{ fontSize: 31, lineHeight: 1.4, marginTop: 8 }}>
              {text}
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Il corpo di una donna <Accent theme={t}>non è sempre uguale</Accent>
        </Title>
        <Body size={38}>
          I livelli ormonali possono cambiare di settimana in settimana, e la
          salute orale nelle donne può essere diversa da quella degli uomini.
          <br />
          <br />
          Sintomi come la <b>bocca secca</b> non vanno ignorati, soprattutto se
          stai entrando in peri o menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={64}>
          Altri sintomi orali comuni in <Accent theme={t}>menopausa</Accent>:
        </Title>
        <div style={{ marginTop: 50 }}>
          <Tag>Gengive gonfie o che sanguinano</Tag>
          <Tag>Alito cattivo o sapore metallico</Tag>
          <Tag>Più carie</Tag>
          <Tag>Afte o piccole ulcere</Tag>
          <Tag>Sensibilità a cibi caldi o piccanti</Tag>
        </div>
      </>
    ),
  },
  {
    theme: PHOTO,
    photo: "bocca-donna.jpg",
    render: (t) => (
      <Body size={44}>
        I sintomi orali in menopausa{" "}
        <b style={{ color: t.accent }}>non sono qualcosa di cui vergognarsi</b>:
        fanno parte della nostra biologia, ed esserne consapevoli è importante.
        <br />
        <br />
        Accogliamo questi cambiamenti e chiediamo più ascolto e più cura quando
        li viviamo.
      </Body>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Ti ritrovi in uno di questi <Accent theme={t}>sintomi?</Accent>
        </Title>
        <Body>
          Raccontamelo nei commenti.
          <br />
          <br />
          Salva il post e condividilo con un&apos;amica che ha bisogno di
          saperlo.
        </Body>
        <div
          style={{
            marginTop: 70,
            fontSize: 24,
            color: colors.muted,
          }}
        >
          Le informazioni hanno scopo divulgativo e non sostituiscono il parere
          del medico o del dentista.
        </div>
      </>
    ),
  },
];

export const SLIDE_COUNT = SLIDES.length;

export const BoccaMenopausa: React.FC<{ index: number }> = ({ index }) => {
  const slide = SLIDES[index];
  return (
    <Frame theme={slide.theme} photo={slide.photo}>
      {slide.render(slide.theme)}
    </Frame>
  );
};
