import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { sans, serif } from "../PilatesReformer/theme";

// Carousel slides 2-8 (4:5), after the video cover in ./index.tsx.
// Santa Longevity feed style: pictogram top centre, serif italic title and
// sans body in white, bottom left, over a dark gradient.
// A slide without a photo gets a sage background until one is supplied.

export type SlideData = {
  photo?: string; // file in public/carosello-img/
  title: string;
  body: string;
  source?: string;
  study?: string; // cropped PubMed header in public/studi/
  video?: string; // path in public/, shown instead of a photo
};

export const SLIDES: SlideData[] = [
  {
    photo: "foto4.jpg",
    study: "pounis-2016.png",
    title: "La pasta non è il nemico",
    body: "In uno studio su oltre 23.000 italiani, chi mangiava pasta nell'ambito della dieta mediterranea aveva in media un indice di massa corporea più basso.",
    source: "Pounis et al., Nutrition & Diabetes, 2016",
  },
  {
    photo: "foto6.jpg",
    title: "1. La porzione giusta",
    body: "Per un adulto la porzione di riferimento è di 80 g di pasta secca. Pesarla ogni tanto aiuta a non esagerare.",
    source: "LARN, Società Italiana di Nutrizione Umana",
  },
  {
    photo: "foto8.jpg",
    study: "reynolds-2019.png",
    title: "2. Integrale, quando puoi",
    body: "Più fibre e cereali integrali si associano a un minor rischio di diabete di tipo 2 e malattie cardiovascolari.",
    source: "Reynolds et al., The Lancet, 2019",
  },
  {
    photo: "foto7.jpg",
    study: "shukla-2015.png",
    title: "3. Prima le verdure",
    body: "Iniziare il pasto con verdure e proteine e mangiare i carboidrati per ultimi ha ridotto il picco di glicemia dopo il pasto.",
    source: "Shukla et al., Diabetes Care, 2015",
  },
  {
    photo: "foto10.jpg",
    title: "4. Condimento semplice",
    body: "Aglio, olio extravergine e peperoncino, con pomodorini pachino tagliati a pezzetti. Meglio limitare panna, burro e sughi troppo elaborati.",
  },
  {
    photo: "foto5.jpg",
    study: "chiavaroli-2018.png",
    title: "5. Nel contesto giusto",
    body: "In 32 studi, la pasta inserita in un'alimentazione a basso indice glicemico non ha fatto aumentare di peso: si è associata anzi a un leggero calo.",
    source: "Chiavaroli et al., BMJ Open, 2018",
  },
  {
    photo: "foto16.jpg",
    title: "Quindi no, non devi rinunciarci",
    body: "Porzione giusta, integrale quando puoi, verdure e condimenti semplici: la pasta può far parte di uno stile di vita longevity.",
    source:
      "Salva il post e condividilo con chi pensa di dover dire addio alla pasta",
  },
];

export const Slide: React.FC<SlideData> = ({
  photo,
  title,
  body,
  source,
  study,
  video,
}) => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(160deg, #9BAEA4 0%, #5F7369 100%)",
      fontFamily: sans,
      color: "white",
    }}
  >
    {video ? (
      <OffthreadVideo
        src={staticFile(video)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : null}
    {photo ? (
      <Img
        src={staticFile(`carosello-img/${photo}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : null}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 92,
          filter:
            "drop-shadow(0 2px 4px rgba(0,0,0,0.7)) drop-shadow(0 0 16px rgba(0,0,0,0.55))",
        }}
      />
    </AbsoluteFill>
    {study ? (
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 205 }}>
        <div
          style={{
            width: 880,
            background: "white",
            borderRadius: 24,
            padding: "26px 28px 22px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            transform: "rotate(-1.5deg)",
          }}
        >
          <Img
            src={staticFile(`studi/${study}`)}
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </AbsoluteFill>
    ) : null}
    <AbsoluteFill
      style={{ justifyContent: "flex-end", padding: "0 70px 80px" }}
    >
      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 76,
          lineHeight: 1.08,
          textShadow: "0 3px 16px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 26,
          fontSize: 40,
          fontWeight: 500,
          lineHeight: 1.38,
          textShadow: "0 2px 10px rgba(0,0,0,0.4)",
        }}
      >
        {body}
      </div>
      {source ? (
        <div
          style={{
            marginTop: 26,
            fontSize: 26,
            fontWeight: 500,
            opacity: 0.8,
            lineHeight: 1.35,
          }}
        >
          {source}
        </div>
      ) : null}
    </AbsoluteFill>
  </AbsoluteFill>
);
