// Greek-style profile cover. Usage: node make_cover_greek.js <photo> "<bg-pos>" <out_name> "<kicker>" "<TITLE>" "<line2>" "<caption>"
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [PHOTO, POS, OUTN, KICK, TITLE, L2, CAP] = process.argv.slice(2);
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ";src:url('" + F + file + '-' + s + '-' + w + "-normal.woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const MEA = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 30 30'><path d='M1 29V1H29V22H9V9H20' fill='none' stroke='white' stroke-width='2.6'/></svg>\")";
const size = Math.min(400, Math.floor(900 / (TITLE.length * 0.68)));
const html = '<meta charset="utf-8"><style>' + ff('FR', 'forum', 400) + ff('TS', 'tenor-sans', 400) + `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#04264f;color:#fff}
.bg{position:absolute;inset:0;background:url(${'file://' + path.resolve(PHOTO)}) ${POS}/cover;filter:saturate(1.12) contrast(1.05)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,38,86,.45) 0%,rgba(4,38,86,0) 28%,rgba(3,34,80,.4) 52%,rgba(3,30,70,.88) 100%)}
.fr{position:absolute;inset:34px;border:2px solid rgba(255,255,255,.75)}
.wm{position:absolute;left:84px;top:96px;font-family:FR;font-size:42px;letter-spacing:.34em;text-transform:uppercase}
.t{position:absolute;left:40px;right:40px;top:1000px;text-align:center;text-shadow:0 2px 24px rgba(0,0,0,.45)}
.k{font-family:TS;font-size:34px;letter-spacing:.3em;text-transform:uppercase}
.b{font-family:FR;font-size:${size}px;line-height:1.05;letter-spacing:.06em;text-transform:uppercase;margin-top:12px}
.m{font-family:FR;font-size:${Math.min(150, Math.floor(900 / (L2.length * 0.8)))}px;letter-spacing:.1em;text-transform:uppercase;line-height:1.1}
.mea{width:480px;height:40px;margin:26px auto 22px;background:${MEA} repeat-x;background-size:40px 40px;opacity:.95}
.s{margin-top:34px;font-family:TS;font-size:30px;letter-spacing:.14em;text-transform:uppercase;line-height:1.5}
</style><div class="bg"></div><div class="sh"></div><div class="fr"></div><div class="wm">InVoyage</div>
<div class="t"><div class="k">${KICK}</div><div class="b">${TITLE}</div><div class="m">${L2}</div><div class="s">${CAP}</div></div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve('out/_cg_' + path.basename(OUTN) + '.html');
  fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/' + OUTN + '.png' });
  await p.screenshot({ path: 'out/' + OUTN + '_4x5.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
  fs.unlinkSync(tmp); await b.close();
})();
