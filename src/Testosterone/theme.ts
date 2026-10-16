import { continueRender, delayRender, staticFile } from "remotion";

export const sans = "Inter";
export const serif = "Playfair Display";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [sans, "500", "normal", "inter-latin-500-normal"],
  [sans, "600", "normal", "inter-latin-600-normal"],
  [sans, "800", "normal", "inter-latin-800-normal"],
  [serif, "500", "italic", "playfair-display-latin-500-italic"],
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

export const colors = {
  black: "#050505",
  white: "#FBFBFA",
  ink: "#111111",
  grey: "#C9C9CC",
  greyDark: "#8E8E93",
  blue: "#2F5CFF",
  blueDeep: "#1631A8",
  yellow: "#FFE03A",
  green: "#3DFF2E",
  pink: "#FF5C8A",
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
