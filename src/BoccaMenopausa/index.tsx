import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";

// Instagram carousel, 4:5.
export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

type Theme = { bg: string; title: string; text: string; accent: string };

const LIGHT: Theme = {
  bg: colors.pink,
  title: colors.plum,
  text: colors.navy,
  accent: colors.rose,
};
// Text over a darkened photo.
const PHOTO: Theme = {
  bg: colors.plum,
  title: "#fff",
  text: "#fff",
  accent: "#F6C1CC",
};

const Frame: React.FC<{
  theme: Theme;
  photo?: string;
  children: React.ReactNode;
}> = ({ theme, photo, children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.bg,
      fontFamily: inter,
      color: theme.text,
      justifyContent: "center",
      padding: "0 100px 80px",
      textShadow: photo ? "0 2px 14px rgba(0,0,0,0.45)" : undefined,
    }}
  >
    {photo ? (
      <>
        <Img
          src={staticFile(`img/${photo}`)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(rgba(40,20,35,0.35), rgba(40,20,35,0.6))",
          }}
        />
      </>
    ) : null}
    <div style={{ position: "relative" }}>{children}</div>
    <Signature color={theme.title} fontFamily={inter} bottom={70} />
  </AbsoluteFill>
);

const Title: React.FC<{
  theme: Theme;
  size?: number;
  children: React.ReactNode;
}> = ({ theme, size = 78, children }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: -1.5,
      textTransform: "uppercase",
      color: theme.title,
    }}
  >
    {children}
  </div>
);

const Body: React.FC<{ size?: number; children: React.ReactNode }> = ({
  size = 40,
  children,
}) => (
  <div
    style={{ fontSize: size, fontWeight: 400, lineHeight: 1.45, marginTop: 44 }}
  >
    {children}
  </div>
);

const Accent: React.FC<{ theme: Theme; children: React.ReactNode }> = ({
  theme,
  children,
}) => <span style={{ color: theme.accent }}>{children}</span>;

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-block",
      background: colors.plum,
      color: colors.pink,
      fontSize: 34,
      fontWeight: 600,
      padding: "16px 28px",
      borderRadius: 14,
      margin: "0 14px 18px 0",
    }}
  >
    {children}
  </div>
);

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

const SLIDES: {
  theme: Theme;
  photo?: string;
  render: (t: Theme) => React.ReactNode;
}[] = [
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
