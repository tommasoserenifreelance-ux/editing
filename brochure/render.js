// Genera i PDF della brochure: anteprima (A4) e stampa (A4 + 3 mm di abbondanza).
// Uso: node render.js  →  poi convertire la versione stampa in CMYK con Ghostscript (vedi README).
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const url = 'file://' + path.join(__dirname, 'brochure.html');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  await page.pdf({ path: path.join(__dirname, 'brochure-studio-bonaccorso.pdf'), printBackground: true, preferCSSPageSize: true });

  await page.evaluate(() => {
    document.documentElement.classList.add('bleed');
    const st = document.createElement('style');
    st.textContent = '@page { size: 216mm 303mm; margin: 0; }';
    document.head.appendChild(st);
    document.querySelectorAll('section.page').forEach((s) => {
      const w = document.createElement('div');
      w.className = 'sheet' + (s.classList.contains('cover') ? ' s-cover' : '');
      s.replaceWith(w);
      w.appendChild(s);
    });
  });
  await page.pdf({ path: path.join(__dirname, 'stampa-rgb.pdf'), printBackground: true, preferCSSPageSize: true });
  await browser.close();
})();
