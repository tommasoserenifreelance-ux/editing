import { continueRender, delayRender, staticFile } from "remotion";

export const serif = "Playfair Display";
export const sans = "Montserrat";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [serif, "600", "normal", "playfair-display-latin-600-normal"],
  [serif, "700", "normal", "playfair-display-latin-700-normal"],
  [serif, "500", "italic", "playfair-display-latin-500-italic"],
  [serif, "600", "italic", "playfair-display-latin-600-italic"],
  [sans, "400", "normal", "montserrat-latin-400-normal"],
  [sans, "500", "normal", "montserrat-latin-500-normal"],
  [sans, "700", "normal", "montserrat-latin-700-normal"],
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

export const colors = {
  bg: "#F3ECE2",
  bgDeep: "#E9DDCD",
  ink: "#2F2A25",
  muted: "#7D7064",
  accent: "#C46F4C",
  sage: "#8C9A7E",
};
