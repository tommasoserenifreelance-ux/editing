import { continueRender, delayRender, staticFile } from "remotion";

export const sans = "Poppins";
export const serif = "Playfair Display";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [sans, "600", "normal", "poppins-latin-600-normal"],
  [sans, "700", "normal", "poppins-latin-700-normal"],
  [sans, "800", "normal", "poppins-latin-800-normal"],
  [serif, "600", "italic", "playfair-display-latin-600-italic"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map(([family, weight, style, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
      style,
    })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

// Blues from the dr.michele.bonaccorso feed.
export const colors = {
  white: "#FFFFFF",
  blue: "#1F5FE8",
  navy: "#0A2552",
  cyan: "#8FE1FF",
};
