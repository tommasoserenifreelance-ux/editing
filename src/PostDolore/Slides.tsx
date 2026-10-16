import React from "react";
import { AbsoluteFill } from "remotion";
import { Body, Em, PAD, Slide, Title } from "../PostPerimenopausa/Layout";
import { colors, fonts } from "../PostPerimenopausa/theme";
import { MigraineIcon, WaveIcon, WomanIcon } from "./Icons";

const Hl: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = colors.magenta,
}) => <span style={{ color }}>{children}</span>;

const Source: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = colors.ink,
}) => (
  <div
    style={{
      position: "absolute",
      left: PAD,
      bottom: 110,
      fontSize: 24,
      fontWeight: 400,
      color,
      opacity: 0.75,
    }}
  >
    {children}
  </div>
);

// Contenuto centrato in verticale, come nella reference
const Content: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 36 }) => (
  <AbsoluteFill
    style={{
      padding: `0 ${PAD}px 140px`,
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

const List: React.FC<{ items: React.ReactNode[]; gap?: number }> = ({ items, gap = 26 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: "flex", gap: 24, fontSize: 37, lineHeight: 1.36, fontWeight: 300, color: colors.ink }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.pink,
            flexShrink: 0,
            marginTop: 20,
          }}
        />
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontWeight: 500 }}>{children}</span>
);

export const Slide1: React.FC = () => (
  <Slide background={colors.pink} footerColor={colors.white}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 100 }}>
      <Title color={colors.white} size={64}>
        Ottobre è il
      </Title>
      <Title color={colors.plum} size={92} style={{ fontWeight: 700, marginTop: 8 }}>
        Mese mondiale
        <br />
        della MENOPAUSA
      </Title>
      <div style={{ marginTop: 50 }}>
        <WomanIcon color={colors.white} height={340} />
      </div>
      <Title color={colors.plum} size={60} style={{ fontWeight: 700, marginTop: 50 }}>
        18 ottobre
      </Title>
      <Body color={colors.white} style={{ fontSize: 38, marginTop: 4 }}>
        Giornata mondiale della menopausa
      </Body>
      <Body color={colors.white} style={{ fontSize: 44, marginTop: 50 }}>
        Quest’anno si parla di <span style={{ fontWeight: 600 }}>dolore…</span>
      </Body>
    </AbsoluteFill>
  </Slide>
);

export const Slide2: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content gap={50}>
      <Title color={colors.magenta} size={80}>
        Lo sapevi?
      </Title>
      <List
        gap={40}
        items={[
          <>
            Le donne hanno fino al <B>70% di probabilità in più</B> rispetto agli uomini di soffrire
            di dolore cronico
          </>,
          <>
            L’emicrania è tra le <B>prime cause di disabilità</B> nelle donne tra i 15 e i 49 anni
          </>,
          <>
            La fibromialgia (dolore diffuso e persistente in tutto il corpo) è{" "}
            <B>3 volte più frequente</B> nelle donne che negli uomini
          </>,
        ]}
      />
    </Content>
    <Source>International Menopause Society, 2026</Source>
  </Slide>
);

export const Slide3: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content>
      <Title color={colors.plum} size={74}>
        Dolori muscolari e articolari? In perimenopausa sono <Hl>più frequenti.</Hl>
      </Title>
      <div style={{ display: "flex", gap: 30, marginTop: 10 }}>
        {[
          ["4 su 10", "prima della perimenopausa"],
          ["più di 1 su 2", "in perimenopausa e menopausa"],
        ].map(([n, label], i) => (
          <div
            key={n}
            style={{
              flex: 1,
              borderRadius: 30,
              padding: "34px 30px",
              backgroundColor: i === 0 ? colors.white : colors.plum,
              border: i === 0 ? `3px solid ${colors.blush}` : "none",
            }}
          >
            <div
              style={{
                fontFamily: fonts.title,
                fontSize: 64,
                fontWeight: 700,
                color: i === 0 ? colors.pink : colors.blush,
                lineHeight: 1,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontSize: 32,
                marginTop: 16,
                fontWeight: 300,
                lineHeight: 1.3,
                color: i === 0 ? colors.ink : colors.white,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </Content>
    <Source>Kruse et al., 2026</Source>
  </Slide>
);

export const Slide4: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content gap={34}>
      <Title color={colors.magenta} size={74}>
        E aumenta anche l’emicrania.
      </Title>
      <Body>
        In un sondaggio americano su 3.664 donne tra i 35 e i 65 anni che soffrono di emicrania,
        quelle in perimenopausa avevano più spesso <B>10 o più giorni di mal di testa al mese</B>: il{" "}
        <B>12%</B>, contro l’8% di chi non era ancora in perimenopausa.
      </Body>
      <div style={{ alignSelf: "flex-end", marginRight: 40 }}>
        <MigraineIcon color={colors.plum} size={260} />
      </div>
    </Content>
    <Source>Mailis et al., 2026; Martin et al., 2016</Source>
  </Slide>
);

export const Slide5: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content gap={40}>
      <Title color={colors.magenta} size={80}>
        Perché proprio adesso?
      </Title>
      <Body>
        Gli <B>estrogeni</B> potrebbero avere un ruolo. In perimenopausa salgono e scendono in modo
        brusco…
      </Body>
      <WaveIcon color={colors.pink} width={900} />
      <Body>
        …e agiscono su <B>articolazioni, muscoli, nervi</B> e sulle aree del cervello che regolano il
        dolore.
      </Body>
    </Content>
    <Source>Mailis et al., 2026</Source>
  </Slide>
);

export const Slide6: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content>
      <Title color={colors.plum} size={74}>
        <Hl>Esami normali</Hl> non vogliono dire che il dolore non sia reale.
      </Title>
      <Body>
        Spesso l’intensità del dolore non corrisponde a quello che si vede in radiografie o
        risonanze.
      </Body>
      <Body>
        Quando il dolore dura a lungo, il sistema nervoso può iniziare a “leggerlo” in modo diverso.
        Così anche segnali normali vengono percepiti come dolore.
      </Body>
    </Content>
  </Slide>
);

export const Slide7: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content>
      <Title color={colors.magenta} size={80}>
        E allora, cosa aiuta?
      </Title>
      <Body>
        Tra le abitudini di vita, l’<B>attività fisica</B> è quella con più evidenze per le donne over
        40. L’International Menopause Society consiglia in particolare l’<B>allenamento di forza</B>.
      </Body>
      <Body>
        Anche fisioterapia, un sonno migliore, parlarne con qualcuno e, quando serve, i farmaci
        possono fare la differenza.
      </Body>
      <Title color={colors.plum} size={56}>
        Di solito funziona <Em>un mix.</Em>
      </Title>
    </Content>
  </Slide>
);

export const Slide8: React.FC = () => (
  <Slide background={colors.cream} footerColor={colors.magenta}>
    <Content gap={34}>
      <Title color={colors.magenta} size={74}>
        Salvalo per la prossima visita.
      </Title>
      <Body style={{ fontWeight: 500 }}>Chiedi al tuo medico:</Body>
      <List
        gap={18}
        items={[
          "Potrebbe esserci più di una causa?",
          "Può c’entrare la perimenopausa?",
          "Sonno, umore o vampate possono peggiorare il mio dolore?",
          "Quali opzioni ho, ormonali e non ormonali?",
          "Mi aiuterebbe un fisioterapista o uno specialista del dolore?",
        ]}
      />
    </Content>
  </Slide>
);

export const Slide9: React.FC = () => (
  <Slide background={colors.plum} footerColor={colors.blush} arrow={false}>
    <AbsoluteFill style={{ padding: `0 ${PAD}px 140px`, justifyContent: "center", gap: 44 }}>
      <Title color={colors.pink} size={80}>
        La cosa più importante…
      </Title>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        {[
          "Condividi questo post con amiche, familiari, medici, colleghi: con chiunque dovrebbe saperlo",
          "Non affrontare tutto da sola: appoggiati a chi ti sta vicino",
        ].map((t) => (
          <div key={t} style={{ display: "flex", gap: 24, fontSize: 37, lineHeight: 1.36, fontWeight: 300, color: colors.white }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.pink, flexShrink: 0, marginTop: 20 }} />
            {t}
          </div>
        ))}
      </div>
      <div style={{ height: 3, backgroundColor: colors.pink }} />
      <Title color={colors.white} size={52}>
        Mandalo a un’amica e segui <Hl color={colors.blush}>@dr.eleonorapiccolo</Hl> per vivere
        questa fase con più consapevolezza.
      </Title>
    </AbsoluteFill>
  </Slide>
);
