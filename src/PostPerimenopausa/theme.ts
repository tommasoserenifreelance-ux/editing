import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Font salvati in public/fonts (Google Fonts, licenza OFL)
loadFont({ family: "Inter", url: staticFile("fonts/Inter.woff2"), weight: "300 600" });
loadFont({
  family: "League Spartan",
  url: staticFile("fonts/LeagueSpartan.woff2"),
  weight: "300 800",
});

export const fonts = {
  title: "League Spartan",
  sans: "Inter",
};

// Palette ripresa dal feed di @dr.eleonorapiccolo
export const colors = {
  pink: "#EC6DB7",
  magenta: "#C41F87",
  cream: "#FFF5F9",
  plum: "#5B1A48",
  ink: "#3A1830",
  blush: "#F9C6E2",
  white: "#FFFFFF",
};

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;
