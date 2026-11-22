// Снимок HTML-страницы в PNG: node shot.js <html> <png> <selector> [scale]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [html, out, sel, scale] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: +(scale || 1) });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve(html));
  await p.locator(sel || 'body').screenshot({ path: out });
  await b.close();
})();
