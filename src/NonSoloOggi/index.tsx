import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";

// 25 novembre: two-slide carousel, after the "Non solo oggi" post.
const brush = "Caveat Brush";
const script = "Great Vibes";

const handle = delayRender("Loading script fonts");
Promise.all(
  [
    [brush, "caveat-brush-latin-400-normal"],
    [script, "great-vibes-latin-400-normal"],
  ].map(([family, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)})`)
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

const BG = colors.rose;
const PINK = "#F6C1CC";

const ITEMS = [
  "non essere creduta quando dici che hai dolore",
  "sentirti dire che è tutto nella tua testa",
  "aspettare anni una diagnosi di endometriosi",
  "sentirti dire «è normale, sei donna»",
  "sentirti dire «sei troppo giovane per la menopausa»",
  "sentirti dire «è solo l'età»",
  "ricevere un calmante invece di una diagnosi",
  "essere chiamata esagerata o isterica",
  "vergognarti delle vampate al lavoro",
  "sopportare in silenzio il dolore nei rapporti",
  "non sapere cosa sta cambiando nel tuo corpo",
  "rinunciare a una cura per paure mai spiegate",
  "farmaci studiati quasi solo sugli uomini",
  "un infarto non riconosciuto perché «atipico»",
  "lasciare il lavoro perché nessuno capisce i tuoi sintomi",
  "curare tutti e non avere tempo per curare te",
  "sentirti invisibile dopo i 50 anni",
  "una ricerca sulla menopausa con pochi fondi",
];

export const NON_SOLO_OGGI_SLIDE_COUNT = 2;

const Cover: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: BG,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 60,
    }}
  >
    <div
      style={{
        fontFamily: brush,
        fontSize: 330,
        lineHeight: 0.85,
        color: PINK,
        textAlign: "center",
        transform: "rotate(-4deg)",
      }}
    >
      Non
      <br />
      solo
    </div>
    <div
      style={{
        fontFamily: script,
        fontSize: 300,
        lineHeight: 1,
        color: "#fff",
        marginTop: -10,
        transform: "rotate(-4deg)",
      }}
    >
      oggi
      <span style={{ color: PINK }}>.</span>
    </div>
    <Signature color="#fff" fontFamily={inter} bottom={70} />
  </AbsoluteFill>
);

const Quote: React.FC<{ style: React.CSSProperties; children: string }> = ({
  style,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      fontFamily: brush,
      fontSize: 260,
      lineHeight: 1,
      color: PINK,
      opacity: 0.85,
      ...style,
    }}
  >
    {children}
  </div>
);

const List: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: BG,
      fontFamily: inter,
      color: "#fff",
      padding: "190px 70px 0 80px",
    }}
  >
    <Quote style={{ top: 10, left: 50 }}>“</Quote>
    <Quote style={{ top: 1010, right: 60 }}>”</Quote>
    <div style={{ position: "relative" }}>
      {ITEMS.map((item) => (
        <div key={item} style={{ fontSize: 29, lineHeight: 1.6 }}>
          <b>Violenza è:</b> {item}
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 140,
        fontSize: 24,
        lineHeight: 1.4,
        color: PINK,
      }}
    >
      Se subisci violenza chiama il <b>1522</b>: gratuito, attivo 24 ore su 24.
    </div>
    <Signature color="#fff" fontFamily={inter} bottom={70} />
  </AbsoluteFill>
);

export const NonSoloOggi: React.FC<{ index: number }> = ({ index }) =>
  index === 0 ? <Cover /> : <List />;
