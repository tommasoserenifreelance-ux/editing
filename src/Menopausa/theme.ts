import { continueRender, delayRender, staticFile } from "remotion";

export const anton = "Anton";

// Fonts are bundled in public/fonts so rendering works offline.
const handle = delayRender("Loading fonts");
new FontFace(anton, `url(${staticFile("fonts/anton-latin-400-normal.woff2")})`)
  .load()
  .then((font) => document.fonts.add(font))
  .then(() => continueRender(handle));

// Brand blue from the 2026 template, with rose as the menopause accent.
export const colors = {
  bg: "#FFFFFF",
  ink: "#151515",
  body: "#2B2B2B",
  muted: "#8C8C8C",
  rule: "#E7E7E7",
  blue: "#3FA7E6",
  blueSoft: "#E4F2FC",
  pink: "#E8699E",
  pinkSoft: "#FCE6EF",
};

export const TOTAL = 7;
