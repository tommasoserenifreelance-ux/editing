const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  await p.goto('file:///home/user/editing/carosello-36-46/carosello.html');
  await p.evaluate(() => document.fonts.ready);
  for (let i = 1; i <= 8; i++)
    await (await p.$('#s' + i)).screenshot({ path: `/home/user/editing/carosello-36-46/slide-${i}.png` });
  await b.close();
})();
