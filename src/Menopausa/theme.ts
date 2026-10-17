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
  // Pink accent for the menopause campaign instead of the template blue.
  accent: "#E5418C",
  light: "#FBDCEA",
  muted: "#555555",
  rule: "#D9D9D9",
};
