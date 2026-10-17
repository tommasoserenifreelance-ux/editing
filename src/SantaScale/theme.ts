import { continueRender, delayRender, staticFile } from "remotion";

export const SCALE_FPS = 30;
export const SCALE_WIDTH = 1080;
export const SCALE_HEIGHT = 1350; // 4:5

// Titles: Playfair Display Bold Italic.
export const serif = "Playfair Display";
// Body: Avenir Roman when installed, otherwise Nunito Sans (bundled, closest
// free match) so renders stay consistent offline.
export const sans = "'Avenir', 'Avenir Roman', 'Avenir Next', 'Nunito Sans'";

const FONTS: [string, string, string, string][] = [
  [serif, "700", "italic", "playfair-display-latin-700-italic"],
  ["Nunito Sans", "400", "normal", "nunito-sans-latin-400-normal"],
  ["Nunito Sans", "600", "normal", "nunito-sans-latin-600-normal"],
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
  ink: "#FFFFFF",
  soft: "rgba(255,255,255,0.86)",
  accent: "#E9D8B4",
  shade: "rgba(14,18,14,0.82)",
};

export const asset = (file: string) => staticFile(`santa-scale/${file}`);
