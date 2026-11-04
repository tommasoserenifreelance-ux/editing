import { continueRender, delayRender, staticFile } from "remotion";

export const font = "Montserrat";

const FONTS: [string, string][] = [
  ["500", "montserrat-latin-500-normal"],
  ["600", "montserrat-latin-600-normal"],
  ["700", "montserrat-latin-700-normal"],
  ["800", "montserrat-latin-800-normal"],
  ["900", "montserrat-latin-900-normal"],
];

const handle = delayRender("Loading Zymerex fonts");
Promise.all(
  FONTS.map(([weight, file]) =>
    new FontFace(font, `url(${staticFile(`fonts/${file}.woff2`)})`, {
      weight,
    })
      .load()
      .then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

// Brand colours sampled from the Zymerex logo background and the IB-Support box.
export const C = {
  blue: "#005DA0",
  blueDeep: "#003F73",
  blueLight: "#3E8FD0",
  navy: "#0B2F5B",
  magenta: "#C8197A",
  purple: "#6B2C8F",
  white: "#FFFFFF",
  tint: "#EAF2FA",
  red: "#E5383B",
  green: "#2BB673",
};

export const GRADIENT = `linear-gradient(135deg, ${C.blueLight} 0%, ${C.blue} 55%, ${C.blueDeep} 100%)`;
