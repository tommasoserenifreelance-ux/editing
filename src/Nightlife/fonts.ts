import { continueRender, delayRender, staticFile } from "remotion";

export const lyricFont = "Inter";
export const bigFont = "Anton";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [lyricFont, "800", "italic", "inter-latin-800-italic"],
  [bigFont, "400", "normal", "anton-latin-400-normal"],
];

const handle = delayRender("Loading nightlife fonts");
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

export const pink = "#f01cfb";
export const pinkGlow = "#d63bd9";
