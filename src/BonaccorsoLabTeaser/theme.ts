import { continueRender, delayRender, staticFile } from "remotion";

export const sans = "Jost";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string][] = [
  ["300", "jost-latin-300-normal"],
  ["400", "jost-latin-400-normal"],
  ["500", "jost-latin-500-normal"],
  ["600", "jost-latin-600-normal"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map(([weight, file]) =>
    new FontFace(sans, `url(${staticFile(`fonts/${file}.woff2`)})`, { weight })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

// Palette from studiobonaccorso.it
export const colors = {
  navy: "#3a5881",
  slate: "#7f97ba",
  mid: "#a9bcd4",
  powder: "#e5edf8",
  white: "#ffffff",
};
