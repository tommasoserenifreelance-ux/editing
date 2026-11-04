import { continueRender, delayRender, staticFile } from "remotion";

export const mono = "JetBrains Mono";

// Bundled in public/fonts so rendering works offline (OFL licence).
const FONTS: [string, string][] = [
  ["400", "jetbrains-mono-regular"],
  ["500", "jetbrains-mono-medium"],
  ["700", "jetbrains-mono-bold"],
  ["800", "jetbrains-mono-extrabold"],
];

const handle = delayRender("Loading receipt fonts");
Promise.all(
  FONTS.map(([weight, file]) =>
    new FontFace(mono, `url(${staticFile(`fonts/${file}.ttf`)})`, { weight })
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(handle));
