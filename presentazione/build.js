const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require("/root/.claude/skills/synced/41084537-e5d7-4524-901a-bee91dacd109_23202900-4010-4160-a7f3-1e936c9e2954/pptx/scripts/apply_theme.js");

const DIR = __dirname;
const meta = JSON.parse(fs.readFileSync(path.join(DIR, "meta.json"), "utf8"));
const DRIVE = process.argv[2];
const OUT = path.join(DIR, "GLIALTRINFERMIERI.pptx");

const THEME = {
  name: "GLIALTRINFERMIERI",
  headFontFace: "Archivo SemiBold",
  bodyFontFace: "Inter",
  colors: {
    dk1: "1A1A1A", lt1: "FFFFFF", dk2: "3A3A3A", lt2: "F4F4F2",
    accent1: "EF4122", accent2: "C9C63B", accent3: "1A1A1A", accent4: "8A8A8A",
    accent5: "EF4122", accent6: "C9C63B", hlink: "EF4122", folHlink: "C9C63B",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "GLIALTRINFERMIERI";
const C = pres.SchemeColor;
const W = 13.333, H = 7.5;
const LOGO = path.join(DIR, "logo_brand.png");
const LOGO_AR = 1334 / 1168;

pres.defineSlideMaster({ title: "Copertina", background: { color: "FFFFFF" }, objects: [] });
pres.defineSlideMaster({
  title: "Foto",
  background: { color: "FFFFFF" },
  objects: [{ image: { path: LOGO, x: W - 0.25 - 0.55 * LOGO_AR, y: H - 0.25 - 0.55, w: 0.55 * LOGO_AR, h: 0.55 } }],
});

function fit(iw, ih, bw, bh) {
  const s = Math.min(bw / iw, bh / ih);
  return { w: iw * s, h: ih * s };
}

// Cover
pres.addSection({ title: "Copertina" });
let s = pres.addSlide({ masterName: "Copertina", sectionTitle: "Copertina" });
{
  const h = 5.2, w = h * LOGO_AR;
  s.addImage({ path: LOGO, x: (W - w) / 2, y: (H - h) / 2, w, h, altText: "Logo GLIALTRINFERMIERI", objectName: "logo" });
}

// Overview grids: all photos, 6 x 2 per slide
pres.addSection({ title: "Tutte le foto" });
const COLS = 7, ROWS = 2, M = 0.5, G = 0.2;
const cw = (W - 2 * M - (COLS - 1) * G) / COLS;
const ch = (H - 2 * M - (ROWS - 1) * G) / ROWS;
for (let i = 0; i < meta.length; i += COLS * ROWS) {
  s = pres.addSlide({ masterName: "Copertina", sectionTitle: "Tutte le foto" });
  meta.slice(i, i + COLS * ROWS).forEach((m, k) => {
    const c = k % COLS, r = Math.floor(k / COLS);
    const f = fit(m.w, m.h, cw, ch);
    s.addImage({
      path: path.join(DIR, "thumb", m.n),
      x: M + c * (cw + G) + (cw - f.w) / 2, y: M + r * (ch + G) + (ch - f.h) / 2, w: f.w, h: f.h,
      altText: "Foto", objectName: "thumb_" + (i + k + 1),
    });
  });
}

// One photo per slide, as large as possible
pres.addSection({ title: "Foto" });
for (const m of meta) {
  s = pres.addSlide({ masterName: "Foto", sectionTitle: "Foto" });
  const f = fit(m.w, m.h, W - 2 * 0.3, H - 2 * 0.3);
  s.addImage({ path: path.join(DIR, "big", m.n), x: (W - f.w) / 2, y: (H - f.h) / 2, w: f.w, h: f.h, altText: "Foto", objectName: "foto" });
}

// Download
pres.addSection({ title: "Download" });
s = pres.addSlide({ masterName: "Copertina", sectionTitle: "Download" });
{
  const h = 3.6, w = h * LOGO_AR;
  s.addImage({ path: LOGO, x: (W - w) / 2, y: 0.9, w, h, altText: "Logo GLIALTRINFERMIERI", objectName: "logo" });
  s.addText([{ text: "SCARICA TUTTE LE FOTO", options: { hyperlink: { url: DRIVE, tooltip: "Google Drive" } } }], {
    x: 2.5, y: 5.05, w: W - 5, h: 0.6, align: "center", fontFace: "Archivo SemiBold", fontSize: 24, bold: true,
    color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true, objectName: "download_link",
  });
  s.addText([{ text: DRIVE, options: { hyperlink: { url: DRIVE } } }], {
    x: 1.5, y: 5.75, w: W - 3, h: 0.4, align: "center", fontSize: 12, color: C.text2, margin: 0, isTextBox: true,
    objectName: "download_url",
  });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})();
