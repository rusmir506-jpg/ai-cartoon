// Carousel-style reel renderer (1080x1920, 30 fps). Usage:
//   node render_cards.js <timeline.json> <out.mp4>            full video (frames piped to ffmpeg)
//   node render_cards.js <timeline.json> <out_prefix> still:1.5,9   stills at given seconds
//   node render_cards.js <timeline.json> <out_prefix> slides         one finished slide per card (9:16 + 4:5 crop)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const TL = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3], MODE = process.argv[4] || '';
const FPS = 30, DUR = TL.duration;
TL.beats.forEach(b => (b.shots || []).forEach(s => { s.file = path.resolve(s.file); }));
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ';font-style:' + (st || 'normal') + ";src:url('" + F + file + '-' + s + '-' + w + '-' + (st || 'normal') + ".woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const fonts = ff('OS', 'oswald', 500) + ff('OS', 'oswald', 600) + ff('OS', 'oswald', 700) + ff('MT', 'montserrat', 400) + ff('MT', 'montserrat', 500) + ff('MT', 'montserrat', 600) + ff('CG', 'cormorant-garamond', 500) + ff('CG', 'cormorant-garamond', 500, 'italic') + ff('CG', 'cormorant-garamond', 600);
const LOGO = 'file://' + path.resolve(__dirname, 'assets/invoyage_logo.jpg');
const css = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
.cg{font-family:CG,serif}.os{font-family:OS,sans-serif}.mt{font-family:MT,sans-serif}.it{font-style:italic}
.sc{position:absolute;inset:0;overflow:hidden;background:#0b1a22;display:none}
.ph{position:absolute;inset:0;overflow:hidden}
.ph.blur{filter:blur(12px) brightness(.8)}
.ph img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none;filter:saturate(1.08) contrast(1.04)}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.38) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 40%,rgba(0,0,0,.7) 76%,rgba(0,0,0,.84) 100%)}
.shade.tips{background:rgba(5,15,20,.55)}
.dim{position:absolute;inset:0;background:#000;opacity:0}
.blk{position:absolute;left:72px;right:72px;color:#fff;text-shadow:0 2px 22px rgba(0,0,0,.4)}
.num{font-weight:500;font-size:200px;line-height:.9;letter-spacing:-.02em;opacity:0}
.clip{overflow:hidden;padding-top:6px}
.name{font-weight:700;font-size:136px;line-height:1.02;text-transform:uppercase;opacity:0}
.sub{font-weight:500;font-size:34px;letter-spacing:.16em;text-transform:uppercase;margin-top:16px;opacity:0}
.rule{width:96px;height:2px;background:#fff;margin:34px 0 30px;transform-origin:left;opacity:0}
.temps{display:flex;align-items:center;gap:44px;opacity:0}
.tt{display:flex;flex-direction:column}
.lab{font-weight:500;font-size:26px;letter-spacing:.2em;text-transform:uppercase;opacity:.85}
.val{font-weight:600;font-size:84px;line-height:1.05}
.sep{width:2px;height:90px;background:rgba(255,255,255,.55)}
.it{font-weight:500}
#a0{font-size:100px;line-height:1;opacity:0}
.big{font-weight:700;font-size:300px;line-height:.92;text-transform:uppercase;opacity:0}
.mid{font-weight:700;font-size:132px;line-height:1;text-transform:uppercase;opacity:0}
.cap{margin-top:30px;font-weight:500;font-size:30px;letter-spacing:.18em;text-transform:uppercase;opacity:0}
.tt1{font-weight:700;font-size:124px;line-height:1;text-transform:uppercase;margin-bottom:70px;opacity:0}
.row{display:flex;align-items:center;gap:34px;margin-bottom:54px;opacity:0}
.rn{font-weight:500;font-size:110px;line-height:1;width:150px}
.rt{font-weight:600;font-size:60px;line-height:1.05;text-transform:uppercase}
.rs{font-weight:400;font-size:32px;margin-top:8px;opacity:.9}
#top{position:absolute;left:72px;right:72px;top:118px;display:flex;justify-content:space-between;align-items:center;z-index:50;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.5)}
.wm{font-style:italic;font-weight:500;font-size:54px}
.cnt{font-weight:500;font-size:28px;letter-spacing:.24em;opacity:0}
#dots{position:absolute;left:0;right:0;bottom:150px;display:flex;justify-content:center;align-items:center;gap:14px;z-index:50}
.dot{height:12px;width:12px;border-radius:6px;background:rgba(255,255,255,.45)}
#hint{position:absolute;right:72px;bottom:128px;z-index:50;color:#fff;font-weight:500;font-size:26px;letter-spacing:.2em;text-transform:uppercase;display:flex;align-items:center;gap:12px;text-shadow:0 2px 14px rgba(0,0,0,.6);opacity:0}
#end{position:absolute;inset:0;z-index:30;display:none;background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
#end img{position:absolute;left:35px;top:360px;width:1010px;mix-blend-mode:multiply;opacity:0;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
#etag{position:absolute;left:70px;right:70px;top:1180px;text-align:center;font-family:CG,serif;font-style:italic;font-weight:500;font-size:70px;line-height:1.2;color:#1F7480;opacity:0}`;
const html = '<meta charset="utf-8"><style>' + fonts + css + '</style><div id="scenes"></div>' +
  '<div id="top"><div class="cg wm">InVoyage</div><div class="mt cnt" id="cnt"></div></div><div id="dots"></div>' +
  '<div id="hint" class="mt">листай<svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M2 11h34M26 2l10 9-10 9"/></svg></div>' +
  '<div id="end"><img id="elogo" src="' + LOGO + '"><div id="etag">' + TL.end.tag + '</div></div>' +
  '<script>window.TL=' + JSON.stringify(TL) + ';</script><script>' + fs.readFileSync(path.resolve(__dirname, 'cards_page.js'), 'utf8') + '</script>';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = path.resolve(path.dirname(OUT), '_cards.html');
  fs.writeFileSync(tmp, html);
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete));
  if (MODE.startsWith('still:')) {
    for (const t of MODE.slice(6).split(',')) { await p.evaluate(t => { window.FORCE = false; render(t); }, +t); await p.screenshot({ path: OUT + '_still_' + t + '.png' }); }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  if (MODE === 'frames') {          // one clean frame per photo shot (+ tips + end card)
    const times = [];
    TL.beats.forEach(b => { if (b.shots && b.shots.length) b.shots.forEach(sh => times.push(sh.t0 + 1.9)); else times.push(b.t0 + 2.0); });
    times.push(TL.end.t0 + 2.6);
    for (let i = 0; i < times.length; i++) {
      await p.evaluate(t => { window.FORCE = true; render(t); }, times[i]);
      const id = String(i + 1).padStart(2, '0');
      await p.screenshot({ path: OUT + '_' + id + '_916.png' });
      await p.screenshot({ path: OUT + '_' + id + '_45.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
    }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  if (MODE === 'slides') {
    const times = TL.beats.map(x => x.t0 + 2.0).concat([TL.end.t0 + 2.6]);
    for (let i = 0; i < times.length; i++) {
      await p.evaluate(t => { window.FORCE = true; render(t); }, times[i]);
      const id = String(i + 1).padStart(2, '0');
      await p.screenshot({ path: OUT + '_' + id + '_916.png' });
      await p.screenshot({ path: OUT + '_' + id + '_45.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
    }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  const ffp = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(FPS * DUR);
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ffp.stdin.write(buf)) await new Promise(r => ffp.stdin.once('drain', r));
  }
  ffp.stdin.end(); await new Promise(r => ffp.on('close', r));
  fs.unlinkSync(tmp); await b.close();
})();
