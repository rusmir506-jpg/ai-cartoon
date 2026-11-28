// Luxe-style cover for the lifehacks reel. Usage: node make_cover_luxe.js <photo> "<bg-pos>" <out_name>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [PHOTO, POS, OUTN] = process.argv.slice(2);
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ';font-style:' + (st || 'normal') + ";src:url('" + F + file + '-' + s + '-' + w + '-' + (st || 'normal') + ".woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const html = '<meta charset="utf-8"><style>' + ff('CG', 'cormorant-garamond', 500, 'italic') + ff('CG', 'cormorant-garamond', 600) + ff('MT', 'montserrat', 500) + ff('MT', 'montserrat', 600) + `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#E8E3D8;color:#2A3F41}
.bg{position:absolute;inset:0;background:url(${'file://' + path.resolve(PHOTO)}) ${POS}/cover;filter:sepia(.14) saturate(.94) contrast(1.05) brightness(1.03)}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.34) 0%,rgba(0,0,0,0) 22%,rgba(232,227,216,0) 26%,rgba(232,227,216,.62) 50%,rgba(232,227,216,.93) 72%,rgba(232,227,216,1) 100%)}
.wm{position:absolute;left:72px;top:104px;font-family:CG;font-style:italic;font-weight:500;font-size:60px;color:#F6F1E7;text-shadow:0 2px 14px rgba(0,0,0,.45)}
.t{position:absolute;left:0;right:0;top:760px;text-align:center}
.k{font-family:MT;font-weight:600;font-size:31px;letter-spacing:.4em;text-transform:uppercase;color:#1B7771;margin-right:-.4em}
.n{position:relative;display:inline-block;font-family:CG;font-weight:600;font-size:460px;line-height:1;padding:0 40px;margin-top:6px;color:#2A3F41}
.n svg{position:absolute;left:-30px;top:34px;width:calc(100% + 60px);height:calc(100% - 20px);overflow:visible}
.n ellipse{fill:none;stroke:#35A59E;stroke-width:2.5;vector-effect:non-scaling-stroke}
.w{font-family:MT;font-weight:600;font-size:70px;letter-spacing:.3em;text-transform:uppercase;margin-top:14px;margin-right:-.3em}
.w span{display:inline-block;padding:22px 0 22px .3em;border-top:2px solid #35A59E;border-bottom:2px solid #35A59E}
.s{font-family:CG;font-style:italic;font-weight:500;font-size:88px;margin-top:28px}
</style><div class="bg"></div><div class="sh"></div><div class="wm">InVoyage</div>
<div class="t"><div class="k">в любой поездке</div><div class="n">5<svg viewBox="0 0 300 400" preserveAspectRatio="none"><ellipse cx="150" cy="200" rx="142" ry="192"/></svg></div><div class="w"><span>лайфхаков</span></div><div class="s">для путешествий</div></div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve('out/_cl_' + path.basename(OUTN) + '.html');
  fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/' + OUTN + '.png' });
  await p.screenshot({ path: 'out/' + OUTN + '_4x5.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
  fs.unlinkSync(tmp); await b.close();
})();
