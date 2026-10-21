import { continueRender, delayRender, staticFile } from "remotion";

export const captionFont = "Arimo";
export const logoFont = "Anton";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [captionFont, "400", "italic", "arimo-latin-400-italic"],
  [logoFont, "400", "normal", "anton-latin-400-normal"],
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

// Caption yellow from the Venus "Friday" story.
export const yellow = "#ecd25a";
