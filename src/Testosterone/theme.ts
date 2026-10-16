import { continueRender, delayRender, staticFile } from "remotion";

// Helvetica where installed, TeX Gyre Heros (free Helvetica clone) bundled as fallback.
export const sans = '"Helvetica Neue", Helvetica, "TeX Gyre Heros", Arial, sans-serif';
const HEROS = "TeX Gyre Heros";
export const serif = "Playfair Display";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [HEROS, "400", "normal", "texgyreheros-regular.otf"],
  [HEROS, "700", "normal", "texgyreheros-bold.otf"],
  [serif, "500", "italic", "playfair-display-latin-500-italic.woff2"],
  [serif, "600", "italic", "playfair-display-latin-600-italic.woff2"],
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map(([family, weight, style, file]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {
      weight,
      style,
    })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));

export const colors = {
  black: "#050505",
  white: "#FBFBFA",
  ink: "#111111",
  grey: "#C9C9CC",
  greyDark: "#8E8E93",
  blue: "#2F5CFF",
  blueDeep: "#1631A8",
  yellow: "#FFE03A",
  brand: "#F7C600", // LongevaMed yellow
  brandDeep: "#9E7B00",
  green: "#3DFF2E",
  pink: "#FF5C8A",
  coral: "#EF5B6E",
  mint: "#4CCFA2",
  printInk: "#1E1A24",
};

// Pastel circle backgrounds, same family as the reference avatar grid.
export const pastels = [
  "#7B3FE4",
  "#F6C700",
  "#F07AB8",
  "#2CC5B5",
  "#A7D36B",
  "#E2453C",
  "#8E8CF5",
  "#3E6BE8",
];

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
