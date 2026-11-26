// Two alternative covers for the Singapore rain reel (magazine + polaroid). Usage: node make_cover_sg.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ';font-style:' + (st || 'normal') + ";src:url('" + F + file + '-' + s + '-' + w + '-' + (st || 'normal') + ".woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const fonts = ff('PF', 'playfair-display', 900) + ff('PF', 'playfair-display', 900, 'italic') + ff('PF', 'playfair-display', 700, 'italic') + ff('OS', 'oswald', 700) + ff('MT', 'montserrat', 500) + ff('MT', 'montserrat', 600) + ff('CG', 'cormorant-garamond', 500, 'italic');
const P = n => 'file://' + path.resolve('footage/singapore/' + n);
const base = '*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}';
const V = {
  b_magazine: `${base}body{background:#000;color:#fff;font-family:MT}
  .bg{position:absolute;inset:0;background:url(${P('01_facade.jpg')}) 50% 30%/cover;filter:saturate(1.1) contrast(1.05)}
  .sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,0) 60%,rgba(0,0,0,.75) 100%)}
  .mast{position:absolute;left:0;right:0;top:130px;text-align:center;font-family:PF;font-weight:900;font-size:158px;line-height:1;letter-spacing:.01em;text-shadow:0 4px 30px rgba(0,0,0,.35)}
  .iss{position:absolute;left:60px;right:60px;top:330px;display:flex;justify-content:space-between;font-weight:600;font-size:30px;letter-spacing:.22em;text-transform:uppercase;border-top:2px solid #fff;border-bottom:2px solid #fff;padding:16px 0}
  .lines{position:absolute;left:70px;bottom:150px;font-family:PF;font-style:italic;font-weight:700;font-size:66px;line-height:1.25;text-shadow:0 2px 22px rgba(0,0,0,.55)}
  .lines span{display:block}.lines small{display:block;margin-top:26px;font-family:MT;font-style:normal;font-weight:600;font-size:28px;letter-spacing:.2em;text-transform:uppercase}
  .wm{position:absolute;right:70px;bottom:150px;font-family:CG;font-style:italic;font-size:58px}
  </style><div class="bg"></div><div class="sh"></div><div class="mast">SINGAPORE</div>
  <div class="iss"><span>декабрь</span><span>сезон дождей</span><span>советы</span></div>
  <div class="lines"><span>Тепло, даже когда льёт</span><span>5 правил поездки</span><small>листайте</small></div><div class="wm">InVoyage</div>`,
  c_polaroid: `${base}body{background:#E9EEEE;color:#1d3b40;font-family:MT}
  .w{position:absolute;left:0;right:0;top:150px;text-align:center;font-family:CG;font-style:italic;font-size:64px;color:#1F7480}
  .h1{position:absolute;left:0;right:0;top:250px;text-align:center;font-family:PF;font-style:italic;font-weight:900;font-size:124px;line-height:1}
  .h2{position:absolute;left:0;right:0;top:400px;text-align:center;font-family:OS;font-weight:700;font-size:92px;letter-spacing:.06em;text-transform:uppercase}
  .pol{position:absolute;background:#fff;padding:22px 22px 86px;box-shadow:0 24px 50px rgba(20,40,50,.28)}
  .pol i{display:block;width:100%;height:100%;background-size:cover}
  .cap{position:absolute;left:0;right:0;bottom:130px;text-align:center;font-weight:600;font-size:32px;letter-spacing:.22em;text-transform:uppercase;color:#1F7480}
  </style><div class="w">InVoyage</div><div class="h1">Сингапур</div><div class="h2">в дождь</div>
  <div class="pol" style="left:50px;top:600px;width:520px;height:700px;transform:rotate(-5deg)"><i style="background-image:url(${P('01_facade.jpg')});background-position:50% 40%"></i></div>
  <div class="pol" style="left:520px;top:700px;width:500px;height:660px;transform:rotate(4deg)"><i style="background-image:url(${P('03_night_underside.jpg')})"></i></div>
  <div class="pol" style="left:250px;top:1180px;width:560px;height:520px;transform:rotate(-2deg)"><i style="background-image:url(${P('02_south_bridge_rd.jpg')});background-position:50% 60%"></i></div>
  <div class="cap">5 советов на декабрь</div>`,
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.mkdirSync('out/cover_singapore', { recursive: true });
  for (const [name, body] of Object.entries(V)) {
    const tmp = path.resolve('out/_sg_' + name + '.html');
    fs.writeFileSync(tmp, '<meta charset="utf-8"><style>' + fonts + body);
    await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `out/cover_singapore/${name}.png` });
    await p.screenshot({ path: `out/cover_singapore/${name}_4x5.png`, clip: { x: 0, y: 285, width: 1080, height: 1350 } });
    fs.unlinkSync(tmp);
  }
  await b.close();
})();
