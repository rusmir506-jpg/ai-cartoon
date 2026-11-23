// node shot.js page.html out.png width height scale
const { chromium } = require('playwright');
(async () => {
  const [page, out, w, h, sc] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +(sc || 1) });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + require('path').resolve(page));
  await p.waitForTimeout(300);
  await p.screenshot({ path: out });
  await b.close();
})();
