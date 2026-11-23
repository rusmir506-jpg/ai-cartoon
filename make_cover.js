// Cover (1080x1920 + 4:5 crop) for the story reel. Usage: node make_cover.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces = [800, 900].map(w => ['cyrillic', 'latin'].map(s => `@font-face{font-family:M;font-weight:${w};src:url('${F}montserrat-${s}-${w}-normal.woff2') format('woff2');` + (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('')).join('');
const CV = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : { h1: '4 отеля', h2: 'которые кажутся', h3: 'выдумкой', out: 'out/cover' };
const T = k => 'file://' + path.resolve(`out/tmp/story/th${k}.png`);
const LOGO = 'file://' + path.resolve('assets/invoyage_logo.jpg');
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:M,sans-serif}
body{background:radial-gradient(ellipse 90% 70% at 50% 35%,#13697C 0%,#0A3A48 55%,#061F29 100%)}
.h{position:absolute;left:30px;right:30px;text-align:center;color:#fff;font-weight:900;text-transform:uppercase;text-shadow:0 6px 30px rgba(0,0,0,.4)}
.y{color:#FFD84A}
.g{position:absolute;left:50px;top:730px;display:grid;grid-template-columns:480px 480px;gap:40px}
.c{position:relative;width:480px;height:480px;border-radius:44px;overflow:hidden;border:6px solid #fff;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.c img{width:100%;height:100%;object-fit:cover;display:block}
.n{position:absolute;left:18px;top:18px;width:74px;height:74px;border-radius:37px;background:#C9A55C;color:#17323a;font-weight:900;font-size:44px;line-height:74px;text-align:center}
.lg{position:absolute;left:50%;top:120px;width:520px;height:120px;margin-left:-260px;border-radius:60px;background:#fff;overflow:hidden}
.lg img{position:absolute;left:-70px;top:-250px;width:660px}
</style>
<div class="lg"><img src="${LOGO}"></div>
<div class="h" style="top:300px;font-size:156px;line-height:1">${CV.h1}</div>
<div class="h" style="top:470px;font-size:72px;line-height:1">${CV.h2}</div>
<div class="h y" style="top:560px;font-size:148px;line-height:1">${CV.h3}</div>
<div class="g">${[1, 2, 3, 4].map(k => `<div class="c"><img src="${T(k)}"><div class="n">${k}</div></div>`).join('')}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.writeFileSync('out/_cover.html', html);
  await p.goto('file://' + path.resolve('out/_cover.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete));
  await p.screenshot({ path: CV.out + '.png' });
  fs.unlinkSync('out/_cover.html'); await b.close();
})();
