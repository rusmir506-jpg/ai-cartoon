// Рендер кадров: node render.js <outDir> <fromFrame> <toFrame> [step]
// или контактный лист: node render.js --times out.png 1.0 5.5 ...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../film/film.html'));
  await p.evaluate(() => document.fonts.ready);
  if (args[0] === '--times') {
    const dir = args[1]; fs.mkdirSync(dir, { recursive: true });
    for (const t of args.slice(2)) {
      await p.evaluate(t => FILM.renderAt(t), +t);
      await p.screenshot({ path: path.join(dir, `t${(+t).toFixed(2).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 80 });
      if (errs.length) { console.error('ERR at', t, errs.splice(0)); }
    }
  } else {
    const [dir, from, to] = [args[0], +args[1], +args[2]];
    fs.mkdirSync(dir, { recursive: true });
    for (let i = from; i < to; i++) {
      await p.evaluate(t => FILM.renderAt(t), i / 30);
      await p.screenshot({ path: path.join(dir, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
      if (errs.length) { console.error('ERR frame', i, errs.splice(0)); process.exit(1); }
    }
  }
  await b.close();
})();
