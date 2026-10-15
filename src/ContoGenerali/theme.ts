import { continueRender, delayRender, staticFile } from "remotion";

export const condensed = "Roboto Condensed";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string][] = [
  [condensed, "500", "roboto-condensed-latin-500-normal"],
  [condensed, "700", "roboto-condensed-latin-700-normal"],
  [condensed, "800", "roboto-condensed-latin-800-normal"],
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
  red: "#C21B17",
  redDeep: "#8E1220",
  wine: "#5A0A12",
  wineDark: "#33050A",
  white: "#FFFFFF",
  cream: "#F7F3EF",
  ink: "#1C1416",
  gold: "#D9B45A",
};

// Dark outline + soft drop shadow so white text reads over the white shirt.
export const outline = [
  "-3px -3px 0 rgba(28,10,12,0.9)",
  "3px -3px 0 rgba(28,10,12,0.9)",
  "-3px 3px 0 rgba(28,10,12,0.9)",
  "3px 3px 0 rgba(28,10,12,0.9)",
  "0 -4px 0 rgba(28,10,12,0.9)",
  "0 4px 0 rgba(28,10,12,0.9)",
  "-4px 0 0 rgba(28,10,12,0.9)",
  "4px 0 0 rgba(28,10,12,0.9)",
  "0 10px 24px rgba(0,0,0,0.45)",
].join(", ");
