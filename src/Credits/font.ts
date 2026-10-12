import { continueRender, delayRender, staticFile } from "remotion";

// Placeholder brand font (Montserrat, OFL). Swap the files in public/fonts
// for the official Ramatex font and keep the same family name.
export const FONT_FAMILY = "RamatexBrand";

const weights = [300, 500, 700] as const;

const handle = delayRender("Loading brand font");

Promise.all(
  weights.map((weight) => {
    const face = new FontFace(
      FONT_FAMILY,
      `url(${staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`)}) format("woff2")`,
      { weight: String(weight) },
    );
    document.fonts.add(face);
    return face.load();
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
