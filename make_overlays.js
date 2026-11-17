// Renders the caption layers (transparent PNG, 1080x1920) and the brand end card
// with headless Chromium from local HTML only. Usage: node make_overlays.js
const { chromium } = require('playwright');
const path = require('path');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const LOGO = 'file://' + path.resolve(__dirname, 'assets/invoyage_logo.jpg');
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const face = (fam, file, w, style = 'normal') => ['cyrillic', 'latin'].map(s =>
  `@font-face{font-family:'${fam}';font-weight:${w};font-style:${style};` +
  `src:url('${F}${file}-${s}-${w}-${style}.woff2') format('woff2');` +
  (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('');
const CSS = `
${face('Cormorant', 'cormorant-garamond', 500)}${face('Cormorant', 'cormorant-garamond', 500, 'italic')}
${face('Cormorant', 'cormorant-garamond', 600)}${face('Montserrat', 'montserrat', 400)}${face('Montserrat', 'montserrat', 500)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
.cap{position:absolute;left:84px;right:84px;bottom:470px;color:#FBF6EC;text-align:center;
  text-shadow:0 2px 28px rgba(20,14,6,.45),0 1px 3px rgba(20,14,6,.35)}
.kick{font:500 25px/1 Montserrat;letter-spacing:.42em;text-transform:uppercase;margin-right:-.42em;opacity:.92}
.rule{width:64px;height:2px;background:#D9C08A;margin:34px auto 38px}
.h{font:500 88px/1.08 Cormorant;letter-spacing:.005em}
.h i{font-style:italic}
.sub{font:500 31px/1.3 Montserrat;letter-spacing:.2em;text-transform:uppercase;margin-top:34px;margin-right:-.2em}
.end{position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
.end img{position:absolute;left:50%;top:330px;width:1010px;transform:translateX(-50%);mix-blend-mode:multiply;
  -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
.tag{position:absolute;left:0;right:0;top:1130px;text-align:center;color:#3E9AA3}
.tag .rule{margin:0 auto 44px;width:72px}
.tag .h{font:500 italic 70px/1.1 Cormorant;color:#3E9AA3}
.tag .sub{color:#B89A5E;font-size:24px;letter-spacing:.34em;margin-right:-.34em;margin-top:40px}
`;
const cap = (kick, h, sub = '') => `<div class="cap"><div class="kick">${kick}</div><div class="rule"></div>` +
  `<div class="h">${h}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
const LAYERS = {
  cap1: cap('Alila Seminyak · Bali', 'Бали, где океан<br><i>прямо у номера</i>'),
  cap2: cap('Pool', '5 бассейнов<br><i>инфинити</i>'),
  cap3: cap('Rooms', 'Терраса или балкон<br><i>с видом на океан</i>'),
  cap4: cap('Beach', 'Прямо на пляже<br><i>Петитенгет</i>'),
  cap5: cap('Experience', 'Spa и ресторан<br><i>Seasalt</i>'),
  cap6: cap('Alila Seminyak', '4,6/5 <i>на Tripadvisor</i>', '3 538 отзывов'),
  end_bg: `<div class="end"><img src="${LOGO}"></div>`,
  end_text: `<div class="tag"><div class="rule"></div><div class="h">Новый отель каждую среду</div>` +
    `<div class="sub">Alila Seminyak · Bali</div></div>`,
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve(__dirname, 'overlays/_layer.html');
  for (const [name, html] of Object.entries(LAYERS)) {
    require('fs').writeFileSync(tmp, `<meta charset="utf-8"><style>${CSS}</style>${html}`);
    await p.goto('file://' + tmp);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `overlays/${name}.png`, omitBackground: true });
    console.log('overlays/' + name + '.png');
  }
  require('fs').unlinkSync(tmp);
  await b.close();
})();
