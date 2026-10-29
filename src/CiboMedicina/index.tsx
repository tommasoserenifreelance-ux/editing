import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const CIBO_FPS = 30;
export const CIBO_DURATION = 450; // 15 s, length of the background clip

const serif = "Cormorant Garamond";

// Fonts are bundled in public/fonts so rendering works offline.
const handle = delayRender("Loading fonts");
Promise.all(
  ["500", "600"].map((weight) =>
    new FontFace(
      serif,
      `url(${staticFile(`fonts/cormorant-garamond-latin-${weight}-normal.woff2`)})`,
      { weight },
    )
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

const FOODS: [string, string, string][] = [
  ["Semi di lino", "🥄", "aiutano a bilanciare gli estrogeni"],
  ["Frutti di bosco", "🍓", "riducono l'infiammazione"],
  ["Broccoli", "🥦", "aiutano a depurare gli estrogeni"],
  ["Soia", "🫘", "aiuta a ridurre le vampate"],
  ["Salmone", "🐟", "riduce l'infiammazione"],
  ["Spinaci", "🥬", "danno energia"],
  ["Frutta secca", "🥜", "aiuta a stabilizzare la glicemia"],
  ["Avocado", "🥑", "sostiene la salute della pelle"],
  ["Ceci", "🧆", "favoriscono l'equilibrio degli estrogeni"],
  ["Curcuma", "🌿", "antinfiammatoria"],
  ["Cioccolato fondente", "🍫", "aiuta a ridurre l'ansia e migliora l'umore"],
  ["Tè verde", "🍵", "stimola il metabolismo"],
  ["Patate dolci", "🍠", "energia costante"],
  ["Semi di zucca", "🎃", "sostengono l'umore"],
];

const shadow = "0 2px 10px rgba(0,0,0,0.55)";

export const CiboMedicina: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        muted
        src={staticFile("video/frutta-acqua.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
      <AbsoluteFill
        style={{
          opacity,
          alignItems: "center",
          paddingTop: 250,
          color: "#fff",
          fontFamily: serif,
          fontWeight: 500,
          textAlign: "center",
          textShadow: shadow,
        }}
      >
        <div style={{ fontSize: 92, lineHeight: 1.12 }}>
          Il cibo è medicina
          <br />
          in perimenopausa
        </div>
        <div
          style={{
            marginTop: 70,
            width: 980,
            fontSize: 49,
            lineHeight: 1.3,
          }}
        >
          {FOODS.map(([food, emoji, benefit]) => (
            <div key={food}>
              {food} {emoji} {benefit}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 170,
          color: "#fff",
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 2,
          textShadow: shadow,
        }}
      >
        Dr.ssa Eleonora Piccolo
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
