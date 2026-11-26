// Profile-grid cover for a hotel-of-the-week reel (carousel style). Usage:
//   node make_cover_hotel.js <photo> "<pos>" <out_name> "<kicker>" "<BIG>" "<mid>" "<caption>"
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [PHOTO, POS, OUTN, KICK, BIG, MID, CAP] = process.argv.slice(2);
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ';font-style:' + (st || 'normal') + ";src:url('" + F + file + '-' + s + '-' + w + '-' + (st || 'normal') + ".woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const img = 'file://' + path.resolve(PHOTO);
const html = '<meta charset="utf-8"><style>' + ff('OS', 'oswald', 700) + ff('MT', 'montserrat', 500) + ff('CG', 'cormorant-garamond', 500, 'italic') + `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;color:#fff}
.bg{position:absolute;inset:0;background:url(${img}) ${POS}/cover;filter:saturate(1.1) contrast(1.05)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 36%,rgba(0,0,0,.8) 76%,rgba(0,0,0,.88) 100%)}
.wm{position:absolute;left:72px;top:118px;font-family:CG,serif;font-style:italic;font-weight:500;font-size:60px;text-shadow:0 2px 16px rgba(0,0,0,.5)}
.t{position:absolute;left:50px;right:50px;top:1000px;text-align:center;text-shadow:0 2px 22px rgba(0,0,0,.45)}
.k{font-family:CG,serif;font-style:italic;font-weight:500;font-size:96px;line-height:1}
.b{font-family:OS,sans-serif;font-weight:700;font-size:${BIG.length > 7 ? 196 : (BIG.length > 6 ? 230 : 290)}px;line-height:.95;text-transform:uppercase}
.m{font-family:OS,sans-serif;font-weight:700;font-size:112px;line-height:1.02;text-transform:uppercase}
.s{font-family:MT,sans-serif;font-weight:500;font-size:32px;letter-spacing:.2em;text-transform:uppercase;margin-top:32px}
</style><div class="bg"></div><div class="sh"></div><div class="wm">InVoyage</div>
<div class="t"><div class="k">${KICK}</div><div class="b">${BIG}</div><div class="m">${MID}</div><div class="s">${CAP}</div></div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve('out/_ch_' + path.basename(OUTN) + '.html');
  fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/' + OUTN + '.png' });
  await p.screenshot({ path: 'out/' + OUTN + '_4x5.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
  fs.unlinkSync(tmp); await b.close();
})();
