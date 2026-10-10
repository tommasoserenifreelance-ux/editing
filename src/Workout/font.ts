import { continueRender, delayRender, staticFile } from "remotion";

export const FONT_FAMILY = "Playfair Display";

const faces = [
  { weight: "700", file: "fonts/playfair-display-latin-700-italic.woff2" },
  { weight: "900", file: "fonts/playfair-display-latin-900-italic.woff2" },
];

const handle = delayRender("Loading Playfair Display");

Promise.all(
  faces.map(async ({ weight, file }) => {
    const face = new FontFace(FONT_FAMILY, `url(${staticFile(file)})`, {
      weight,
      style: "italic",
    });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error("Could not load Playfair Display", err);
    continueRender(handle);
  });
