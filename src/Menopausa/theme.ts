import { continueRender, delayRender, staticFile } from "remotion";

export const anton = "Anton";

// Fonts are bundled in public/fonts so rendering works offline.
const handle = delayRender("Loading fonts");
new FontFace(anton, `url(${staticFile("fonts/anton-latin-400-normal.woff2")})`)
  .load()
  .then((font) => document.fonts.add(font))
  .then(() => continueRender(handle));

export const colors = {
  bg: "#FFFFFF",
  ink: "#141414",
  blue: "#3FA7E6",
  light: "#D3E8F8",
  muted: "#555555",
  rule: "#D9D9D9",
};
