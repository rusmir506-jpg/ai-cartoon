// Photo-hero cover for the December reel. Usage: node make_cover_dec.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces = [600, 800, 900].map(w => ['cyrillic', 'latin'].map(s => `@font-face{font-family:M;font-weight:${w};src:url('${F}montserrat-${s}-${w}-normal.woff2') format('woff2');` + (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('')).join('');
const P = n => 'file://' + path.resolve('footage/december/' + n);
const LOGO = 'file://' + path.resolve('assets/invoyage_logo.jpg');
const rows = [['🇲🇻', 'Мальдивы', '+30°', '+28°'], ['🇹🇭', 'Пхукет', '+32°', '+28°'], ['🇱🇰', 'Шри-Ланка', '+30°', '+28°'], ['🇦🇪', 'Дубай', '+26°', '+25°']];
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:M,sans-serif;background:#000}
.bg{position:absolute;inset:0;background:url(${P('maldives_sunset.jpg')}) center/cover;filter:saturate(1.1) contrast(1.05)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 30%,rgba(0,0,0,.2) 48%,rgba(0,0,0,.72) 100%)}
.lg{position:absolute;left:50%;top:110px;width:500px;height:112px;margin-left:-250px;border-radius:56px;background:#fff;overflow:hidden}
.lg img{position:absolute;left:-68px;top:-240px;width:636px}
.h{position:absolute;left:30px;right:30px;text-align:center;color:#fff;font-weight:900;text-transform:uppercase;text-shadow:0 6px 34px rgba(0,0,0,.55);line-height:1}
.y{color:#FFD84A}
.t{position:absolute;left:60px;right:60px;top:1030px}
.r{display:flex;align-items:center;height:118px;margin-bottom:22px;border-radius:40px;background:rgba(10,20,28,.5);border:2px solid rgba(255,255,255,.3);color:#fff;padding:0 36px}
.fl{font-family:'Noto Color Emoji';font-size:62px;width:96px}
.c{font-weight:800;font-size:46px;flex:1}
.n{font-weight:900;font-size:50px;margin-left:24px}
.n small{display:block;font-weight:600;font-size:20px;opacity:.85;text-transform:uppercase;letter-spacing:.06em;text-align:center}
.a{color:#FFC857}.w{color:#9FF0FF}
</style>
<div class="bg"></div><div class="sh"></div>
<div class="lg"><img src="${LOGO}"></div>
<div class="h" style="top:330px;font-size:150px">Где тепло</div>
<div class="h" style="top:490px;font-size:84px">в</div>
<div class="h y" style="top:580px;font-size:166px">декабре?</div>
<div class="t">${rows.map(r => `<div class="r"><div class="fl">${r[0]}</div><div class="c">${r[1]}</div><div class="n a"><small>днём</small>${r[2]}</div><div class="n w"><small>вода</small>${r[3]}</div></div>`).join('')}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.writeFileSync('out/_cv.html', html);
  await p.goto('file://' + path.resolve('out/_cv.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/cover_december_v2.png' });
  fs.unlinkSync('out/_cv.html'); await b.close();
})();
