import { pinkColors as colors } from "../EleonoraPiccolo/brand";
import {
  Accent,
  Body,
  Frame,
  LIGHT,
  PHOTO,
  Theme,
  Title,
} from "../EleonoraPiccolo/carousel";

// 25 novembre: two-slide carousel.
const COVER: Theme = { ...PHOTO, bg: colors.plum };

const ITEMS = [
  "Non essere creduta",
  "Avere paura a casa tua",
  "Sentirti dire che è colpa tua",
  "Stare zitta per non disturbare",
  "Non avere un tuo conto in banca",
  "Essere controllata nel telefono e nelle amicizie",
  "Dover scegliere tra lavoro e figli",
  "Sentirti dire che il tuo dolore è «normale»",
  "Ricevere un calmante invece di una diagnosi",
  "Sentirti dire «è solo l'età»",
  "Essere chiamata esagerata quando chiedi aiuto",
  "Vergognarti dei sintomi della menopausa al lavoro",
  "Sopportare in silenzio il dolore nei rapporti",
  "Sentirti invisibile dopo i 50 anni",
];

export const NON_SOLO_OGGI_SLIDE_COUNT = 2;

const Cover: React.FC = () => (
  <Frame theme={COVER}>
    <div
      style={{
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 4,
        color: COVER.accent,
        marginBottom: 30,
      }}
    >
      25 NOVEMBRE
    </div>
    <Title theme={COVER} size={110}>
      La violenza non sempre <Accent theme={COVER}>fa rumore.</Accent>
    </Title>
    <Body size={42}>
      A volte è silenziosa. A volte succede anche dove dovresti sentirti al
      sicuro.
    </Body>
  </Frame>
);

const List: React.FC = () => (
  <Frame theme={LIGHT}>
    <Title theme={LIGHT} size={64}>
      Violenza è <Accent theme={LIGHT}>anche</Accent>:
    </Title>
    <div style={{ marginTop: 30 }}>
      {ITEMS.map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 30,
            lineHeight: 1.25,
            padding: "11px 0",
            borderBottom: `2px solid ${colors.grid}`,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: colors.rose,
            }}
          />
          {item}
        </div>
      ))}
    </div>
    <div style={{ marginTop: 28, fontSize: 26, color: colors.plum }}>
      Se subisci violenza chiama il <b>1522</b>: gratuito, attivo 24 ore su 24.
    </div>
  </Frame>
);

export const NonSoloOggi: React.FC<{ index: number }> = ({ index }) =>
  index === 0 ? <Cover /> : <List />;
