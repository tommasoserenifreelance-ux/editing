import { continueRender, delayRender, staticFile } from "remotion";

export const sans = "Montserrat";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string][] = [
  ["700", "montserrat-latin-700-normal"],
  ["800", "montserrat-latin-800-normal"],
  ["900", "montserrat-latin-900-normal"],
];

const handle = delayRender("Loading Ramatex fonts");
Promise.all(
  FONTS.map(([weight, file]) =>
    new FontFace(sans, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
    })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

// Ramatex blue, taken from the machines' livery and the logo plate.
export const colors = {
  blue: "#1846B4",
  blueDeep: "#0E2C78",
  sky: "#6EC3FF",
  white: "#FFFFFF",
  ink: "#0A1430",
};

export const outline: React.CSSProperties = {
  WebkitTextStroke: "8px #0A1430",
  paintOrder: "stroke fill",
  textShadow: "0 6px 0 rgba(10,20,48,0.55), 0 0 30px rgba(0,0,0,0.45)",
};
