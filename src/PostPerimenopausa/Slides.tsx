import React from "react";
import { AbsoluteFill } from "remotion";
import { Body, Bullets, Em, PAD, Slide, Title } from "./Layout";
import { Illustration } from "./Illustration";
import { colors, fonts } from "./theme";

const STUDY = "Cunningham AC et al. Menopause. 2026.";

const Footnote: React.FC<{ color: string; children: React.ReactNode; bottom?: number }> = ({
  color,
  children,
  bottom = 110,
}) => (
  <div
    style={{
      position: "absolute",
      left: PAD,
      right: PAD,
      bottom,
      fontSize: 19,
      lineHeight: 1.45,
      fontWeight: 400,
      color,
      opacity: 0.85,
    }}
  >
    {children}
  </div>
);

export const Slide1: React.FC = () => (
  <Slide background={colors.pink} footerColor={colors.plum}>
    <AbsoluteFill style={{ padding: `150px ${PAD}px 0` }}>
      <Title color={colors.white} size={104} style={{ lineHeight: 1.04 }}>
        Se qualcuno
        <br />
        mi chiede ancora
        <br />
        <Em>una cosa…</Em>
      </Title>
      <Body color={colors.white} style={{ fontSize: 40, marginTop: 40, lineHeight: 1.3 }}>
        Stanchezza, irritabilità e perimenopausa:
        <br />
        cosa dice un nuovo studio.
      </Body>
    </AbsoluteFill>
    <Illustration style={{ position: "absolute", left: 0, bottom: 0 }} />
  </Slide>
);

const WORDS: [string, number][] = [
  ["Lavoro", 46], ["Messaggi da leggere", 32], ["Dormire?", 42], ["Spesa", 34],
  ["Bollette", 38], ["Lavatrici", 32], ["Cena", 44], ["Compiti", 34],
  ["Visite mediche", 36], ["Genitori anziani", 40], ["Figli adolescenti", 32],
  ["La chat della scuola", 36], ["Scadenze", 42], ["Traffico", 32], ["“Mamma?”", 50],
  ["Riunioni", 34], ["Regali da comprare", 32], ["Dentista", 38], ["Vampate", 44],
  ["Dolori articolari", 34], ["Ciclo irregolare", 36], ["“Dov’è l’altra scarpa?”", 34],
  ["La mail che hai dimenticato", 32], ["“Chi mi accompagna?”", 38],
  ["“Cosa si mangia stasera?”", 40],
];
const CLOUD = [...WORDS, ...WORDS.slice(3), ...WORDS.slice(0, 8)];

export const Slide2: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <AbsoluteFill style={{ padding: `120px ${PAD}px 0`, overflow: "hidden" }}>
      <Title color={colors.magenta} size={64}>
        Facciamo il punto
        <br />
        della situazione:
      </Title>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          maxHeight: 850,
          overflow: "hidden",
          columnGap: 24,
          rowGap: 6,
          marginTop: 26,
          alignItems: "baseline",
        }}
      >
        {CLOUD.map(([w, size], i) => (
          <span
            key={i}
            style={{ fontSize: size, fontWeight: 300, color: colors.pink, opacity: 0.7, lineHeight: 1.22 }}
          >
            {w}
          </span>
        ))}
      </div>
    </AbsoluteFill>

    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 455,
        backgroundColor: colors.plum,
        borderRadius: 40,
        color: colors.white,
        textAlign: "center",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(91,26,72,0.25)",
      }}
    >
      <div style={{ padding: "50px 60px 40px" }}>
        <div style={{ fontSize: 28, letterSpacing: 7, fontWeight: 500 }}>ULTIM’ORA</div>
        <div style={{ fontFamily: fonts.title, fontSize: 38, marginTop: 22, lineHeight: 1.3 }}>
          Uno studio* su
        </div>
        <div style={{ fontFamily: fonts.title, fontSize: 54, fontWeight: 700, color: colors.blush, lineHeight: 1.2 }}>
          quasi 8.000 donne over 35
        </div>
        <div style={{ fontFamily: fonts.title, fontSize: 38, lineHeight: 1.3 }}>
          ha scoperto che il sintomo che cambia
          <br />
          di più in perimenopausa è…
        </div>
        <div style={{ fontFamily: fonts.title, fontSize: 100, fontWeight: 700, lineHeight: 1.1, marginTop: 10 }}>
          la stanchezza.
        </div>
      </div>
      <div style={{ borderTop: `3px solid ${colors.pink}`, padding: "30px 60px 40px" }}>
        <div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 500, color: colors.blush }}>
          LE DONNE IN PERIMENOPAUSA:
        </div>
        <div style={{ fontFamily: fonts.title, fontWeight: 700, fontSize: 50, marginTop: 10 }}>
          “Ma va?”
        </div>
      </div>
    </div>

    <Footnote color={colors.ink} bottom={100}>
      *Sondaggio tra utenti dell’app Flo; fase riproduttiva autodichiarata.
      <br />
      {STUDY}
    </Footnote>
  </Slide>
);

export const Slide3: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <AbsoluteFill style={{ padding: `120px ${PAD}px 0`, gap: 34 }}>
      <Title color={colors.magenta}>
        Lo sapevamo già? Sì.
        <br />
        Ma ora ci sono i dati.
      </Title>
      <Body>
        Spesso ci accorgiamo che qualcosa è cambiato, ma diamo la colpa allo stress, all’età o alle
        mille cose da fare.
      </Body>
      <Body>
        Rispetto alle donne in premenopausa, quelle in perimenopausa riferiscono più spesso:
      </Body>
      <Bullets dot={colors.pink} items={["Stanchezza", "Irritabilità", "Umore giù", "Ansia"]} />
      <Body>
        E il risultato resta valido anche tenendo conto di chi soffriva già di ansia o depressione.
      </Body>
      <Title color={colors.plum} size={50} style={{ marginTop: 6 }}>
        <Em>Non è solo una sensazione.</Em> È qualcosa che si può misurare.
      </Title>
    </AbsoluteFill>
  </Slide>
);

export const Slide4: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <AbsoluteFill style={{ padding: `120px ${PAD}px 0`, gap: 34 }}>
      <Title color={colors.magenta}>
        E non parliamo della stanchezza da “mi farei un pisolino”.
      </Title>
      <Body>Parliamo di:</Body>
      <Bullets
        dot={colors.pink}
        items={[
          "Sfinimento fisico e mentale",
          "Rendere meno del solito",
          "Vuoti di memoria",
          "Fatica a concentrarsi",
          "Dimenticare le cose",
        ]}
      />
      <Body>
        Al secondo posto c’è l’irritabilità. Lo studio non dice da cosa dipendano questi sintomi.
      </Body>
      <Title color={colors.plum} size={52} style={{ marginTop: 6 }}>
        Ma se sei a pezzi e qualcuno ti fa l’ennesima domanda… <Em>forse un’idea te la sei già fatta.</Em>
      </Title>
    </AbsoluteFill>
  </Slide>
);

export const Slide5: React.FC = () => (
  <Slide background={colors.plum} footerColor={colors.blush} arrow={false}>
    <AbsoluteFill style={{ padding: `120px ${PAD}px 0`, gap: 32 }}>
      <Title color={colors.white} size={76}>
        Non te lo stai
        <br />
        immaginando.
      </Title>
      <Body color={colors.white}>Quello che senti ha un nome, e adesso anche dei numeri.</Body>
      <Title color={colors.pink} size={54}>
        Ed è importante.
      </Title>
      <Body color={colors.white}>
        Stanchezza e irritabilità vengono spesso liquidate con un “è lo stress” o un “sarà l’età”. I
        dati aiutano a prenderle sul serio e a parlarne con il medico senza sentirti esagerata.
      </Body>
      <div style={{ height: 3, backgroundColor: colors.pink, marginTop: 8 }} />
      <Title color={colors.white} size={50}>
        <span style={{ color: colors.blush }}>
          <Em>Per cominciare basta una frase:</Em>
        </span>
        <br />
        “Non mi riconosco più.”
      </Title>
    </AbsoluteFill>
    <Footnote color={colors.white} bottom={105}>
      Limiti dello studio: dati trasversali, mostrano un’associazione ma non un rapporto di
      causa-effetto. Fase menopausale autodichiarata dalle utenti dell’app Flo.
      <br />
      {STUDY} doi:10.1097/GME.0000000000002872
    </Footnote>
  </Slide>
);
