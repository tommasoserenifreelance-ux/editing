import { continueRender, delayRender, staticFile } from "remotion";

// Shared look for Dr.ssa Eleonora Piccolo's reels.
export const serif = "Cormorant Garamond";
export const sans = "Montserrat";
export const inter = "Inter";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string][] = [
  [serif, "500", "cormorant-garamond-latin-500-normal"],
  [serif, "600", "cormorant-garamond-latin-600-normal"],
  [sans, "400", "montserrat-latin-400-normal"],
  [sans, "500", "montserrat-latin-500-normal"],
  [sans, "700", "montserrat-latin-700-normal"],
  [inter, "400", "inter-latin-400-normal"],
  [inter, "500", "inter-latin-500-normal"],
  [inter, "600", "inter-latin-600-normal"],
  [inter, "700", "inter-latin-700-normal"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map(([family, weight, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
    })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

export const colors = {
  cream: "#F7F0E8",
  plum: "#6E3F63",
  rose: "#C9606F",
  navy: "#2E3A55",
  muted: "#8A7F86",
  grid: "#E4D9CF",
};

export const Signature: React.FC<{
  color: string;
  shadow?: string;
  opacity?: number;
  fontFamily?: string;
}> = ({ color, shadow, opacity = 1, fontFamily = serif }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 170,
      opacity,
      textAlign: "center",
      color,
      fontFamily,
      fontWeight: 600,
      fontSize: fontFamily === serif ? 44 : 36,
      letterSpacing: fontFamily === serif ? 2 : 1,
      textShadow: shadow,
    }}
  >
    Dr.ssa Eleonora Piccolo
  </div>
);
