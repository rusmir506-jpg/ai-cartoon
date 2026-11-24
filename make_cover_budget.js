// Cover for the "warm and affordable in winter" reel (editorial fonts). Usage: node make_cover_budget.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st = 'normal') => ['cyrillic', 'latin'].map(s => `@font-face{font-family:${fam};font-weight:${w};font-style:${st};src:url('${F}${file}-${s}-${w}-${st}.woff2') format('woff2');` + (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('');
const P = n => 'file://' + path.resolve('footage/budget/' + n);
const LOGO = 'file://' + path.resolve('assets/invoyage_logo.jpg');
const rows = [['🇻🇳', 'Фукуок', '+30°', '+28°'], ['🇮🇳', 'Гоа', '+32°', '+28°'], ['🇪🇬', 'Шарм-эль-Шейх', '+22°', '+25°'], ['🇰🇭', 'Кох Ронг', '+28°', '+29°']];
const html = `<meta charset="utf-8"><style>${ff('PF', 'playfair-display', 900, 'italic')}${ff('OS', 'oswald', 600)}${ff('OS', 'oswald', 700)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;font-family:OS,sans-serif}
.bg{position:absolute;inset:0;background:url(${P('goa_sunset_pool.jpg')}) center/cover;filter:saturate(1.1) contrast(1.05)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.15) 30%,rgba(0,0,0,.2) 46%,rgba(0,0,0,.78) 100%)}
.lg{position:absolute;left:50%;top:110px;width:500px;height:112px;margin-left:-250px;border-radius:56px;background:#fff;overflow:hidden}
.lg img{position:absolute;left:-68px;top:-240px;width:636px}
.h{position:absolute;left:30px;right:30px;text-align:center;color:#fff;font-family:PF;font-weight:900;font-style:italic;text-shadow:0 6px 34px rgba(0,0,0,.55);line-height:1}
.y{color:#FFD84A}
.t{position:absolute;left:60px;right:60px;top:1030px}
.r{display:flex;align-items:center;height:118px;margin-bottom:22px;border-radius:40px;background:rgba(10,20,28,.5);border:2px solid rgba(255,255,255,.3);color:#fff;padding:0 34px}
.fl{font-family:'Noto Color Emoji';font-size:60px;width:92px}
.c{font-weight:600;font-size:46px;flex:1;letter-spacing:.02em}
.n{font-weight:700;font-size:52px;margin-left:22px}
.n small{display:block;font-weight:600;font-size:20px;opacity:.85;text-transform:uppercase;letter-spacing:.1em;text-align:center}
.a{color:#FFC857}.w{color:#9FF0FF}
.tag{position:absolute;right:48px;top:878px;background:#F6EBCB;color:#5B3A12;border-radius:16px;padding:10px 26px;font-weight:700;font-size:40px;letter-spacing:.08em;text-transform:uppercase;transform:rotate(-5deg);box-shadow:0 8px 24px rgba(0,0,0,.4)}
</style>
<div class="bg"></div><div class="sh"></div>
<div class="lg"><img src="${LOGO}"></div>
<div class="h" style="top:300px;font-size:150px">Где тепло</div>
<div class="h y" style="top:470px;font-size:164px">и недорого</div>
<div class="h" style="top:660px;font-size:132px">зимой?</div>
<div class="tag">Бюджетно</div>
<div class="t">${rows.map(r => `<div class="r"><div class="fl">${r[0]}</div><div class="c">${r[1]}</div><div class="n a"><small>днём</small>${r[2]}</div><div class="n w"><small>вода</small>${r[3]}</div></div>`).join('')}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.writeFileSync('out/_cvb.html', html);
  await p.goto('file://' + path.resolve('out/_cvb.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/cover_budget.png' });
  fs.unlinkSync('out/_cvb.html'); await b.close();
})();
