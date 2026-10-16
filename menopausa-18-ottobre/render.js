const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  await p.goto('file:///home/user/editing/menopausa-18-ottobre/carosello.html');
  await p.evaluate(() => document.fonts.ready);
  for (let i = 1; i <= 7; i++)
    await (await p.$('#s' + i)).screenshot({ path: `/home/user/editing/menopausa-18-ottobre/slide-${i}.png` });
  await b.close();
})();
