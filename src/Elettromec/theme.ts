import { continueRender, delayRender, staticFile } from "remotion";

export const sans = "Montserrat";
export const captionFont = "Poppins";
export const script = "Kaushan Script";

// Fonts are bundled in public/fonts so rendering works offline.
const FONTS: [string, string, string, string][] = [
  [sans, "700", "normal", "montserrat-latin-700-normal"],
  [sans, "800", "normal", "montserrat-latin-800-normal"],
  [sans, "900", "normal", "montserrat-latin-900-normal"],
  [sans, "900", "italic", "montserrat-latin-900-italic"],
  [script, "400", "normal", "kaushan-script-latin-400-normal"],
  [captionFont, "600", "normal", "poppins-latin-600-normal"],
  [captionFont, "700", "normal", "poppins-latin-700-normal"],
  [captionFont, "800", "normal", "poppins-latin-800-normal"],
];

const handle = delayRender("Loading Elettromec fonts");
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

// White text, yellow only for emphasis; navy from the brand sweatshirts.
export const colors = {
  yellow: "#FFD60A",
  navy: "#1C1F6B",
  navyDeep: "#0D0F3A",
  white: "#FFFFFF",
  red: "#FF3B3B",
  whatsapp: "#25D366",
};

export const FPS = 30;
export const END_CARD = 50; // frames appended after the footage
