import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  Body,
  Frame,
  LIGHT,
  BigNumber,
  Point,
  SlideDef,
  Title,
} from "../EleonoraPiccolo/carousel";

const SLIDES: SlideDef[] = [
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 4,
            color: t.accent,
            marginBottom: 30,
          }}
        >
          1994 — OGGI
        </div>
        <Title theme={t} size={90}>
          Torna il grande studio sulla menopausa in{" "}
          <Accent theme={t}>Italia</Accent>
        </Title>
        <Body size={38}>
          A 30 anni dal primo progetto, i ginecologi italiani rilanciano
          &quot;Menopausa Italia&quot;.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Cosa sta <Accent theme={t}>succedendo</Accent>
        </Title>
        <Body>
          L&apos;<b>AOGOI</b>, l&apos;Associazione Ostetrici Ginecologi
          Ospedalieri Italiani, ha rilanciato{" "}
          <b>&quot;Menopausa Italia&quot;</b>: un nuovo studio nazionale per
          fotografare la salute delle donne in menopausa.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Dove tutto è <Accent theme={t}>iniziato</Accent>
        </Title>
        <BigNumber theme={t}>250.000</BigNumber>
        <Body size={38}>
          Le donne, circa, osservate nei centri italiani dal primo progetto
          &quot;Menopausa Italia&quot;, promosso dall&apos;AOGOI nel <b>1994</b>
          .
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Il nuovo <Accent theme={t}>studio</Accent>
        </Title>
        <Point
          theme={t}
          title="Come funziona"
          text="È uno studio osservazionale e multicentrico: raccoglie dati reali da molti centri in tutta Italia."
        />
        <Point
          theme={t}
          title="Cosa osserva"
          text="I sintomi del climaterio e come vengono trattati."
        />
        <Point
          theme={t}
          title="Chi coinvolge"
          text="Le donne seguite nei centri per la menopausa che partecipano alla ricerca."
        />
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t} size={70}>
          Una rete in <Accent theme={t}>crescita</Accent>
        </Title>
        <BigNumber theme={t}>100+</BigNumber>
        <Body size={38}>
          L&apos;obiettivo è passare da circa 70 a <b>oltre 100 centri</b> in
          tutta Italia, pubblici e privati.
        </Body>
        <Body size={32}>
          Con il sostegno di SIGO, SIM e SiGiTe, e una parte dedicata alla
          telemedicina per un percorso di cura più continuo.
        </Body>
      </>
    ),
  },
  {
    theme: LIGHT,
    render: (t) => (
      <>
        <Title theme={t}>
          Perché è <Accent theme={t}>importante</Accent>
        </Title>
        <Body>
          In 30 anni sono cambiate le donne, le terapie e la medicina. Per
          curare bene servono dati sulle donne italiane di oggi: come vivono i
          sintomi e come vengono seguite.
          <br />
          <br />
          Sei seguita da un centro per la menopausa? Raccontalo nei commenti.
        </Body>
        <div style={{ marginTop: 60, fontSize: 22, color: colors.muted }}>
          Fonte: AOGOI, progetto &quot;Menopausa Italia&quot;.
        </div>
      </>
    ),
  },
];

export const MENOPAUSA_ITALIA_SLIDE_COUNT = SLIDES.length;

export const MenopausaItalia: React.FC<{ index: number }> = ({ index }) => {
  const slide = SLIDES[index];
  return (
    <Frame theme={slide.theme} photo={slide.photo} bare={slide.bare}>
      {slide.render(slide.theme)}
    </Frame>
  );
};
