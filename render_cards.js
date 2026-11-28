// Carousel-style reel renderer (1080x1920, 30 fps). Usage:
//   node render_cards.js <timeline.json> <out.mp4>            full video (frames piped to ffmpeg)
//   node render_cards.js <timeline.json> <out_prefix> still:1.5,9   stills at given seconds
//   node render_cards.js <timeline.json> <out_prefix> slides         one finished slide per card (9:16 + 4:5 crop)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const TL = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3], MODE = process.argv[4] || '';
const FPS = 30, DUR = TL.duration;
TL.beats.forEach(b => (b.shots || []).forEach(s => { s.file = path.resolve(s.file); if (s.frames) s.frames = path.resolve(s.frames); }));
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const ff = (fam, file, w, st) => ['cyrillic', 'latin'].map(s => '@font-face{font-family:' + fam + ';font-weight:' + w + ';font-style:' + (st || 'normal') + ";src:url('" + F + file + '-' + s + '-' + w + '-' + (st || 'normal') + ".woff2') format('woff2');" + (s === 'cyrillic' ? 'unicode-range:' + CYR + ';' : '') + '}').join('');
const fonts = ff('OS', 'oswald', 500) + ff('OS', 'oswald', 600) + ff('OS', 'oswald', 700) + ff('MT', 'montserrat', 400) + ff('MT', 'montserrat', 500) + ff('MT', 'montserrat', 600) + ff('CG', 'cormorant-garamond', 500) + ff('CG', 'cormorant-garamond', 500, 'italic') + ff('CG', 'cormorant-garamond', 600);
const notesFonts = ff('MS', 'marck-script', 400);
const greekFonts = ff('FR', 'forum', 400) + ff('TS', 'tenor-sans', 400);
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
.fsub{text-transform:none;letter-spacing:.02em;font-size:40px;line-height:1.4;margin-top:22px;max-width:900px}
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
const MEA = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><path d='M1 29V1H29V22H9V9H20' fill='none' stroke='white' stroke-width='2.6'/></svg>\")";
const GREEKCSS = `
.greek .os,.greek .cg{font-family:FR,serif!important;font-weight:400!important;font-style:normal!important}
.greek .mt{font-family:TS,sans-serif!important}
.greek .shade{background:linear-gradient(180deg,rgba(4,38,86,.55) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 38%,rgba(3,34,80,.8) 76%,rgba(3,30,70,.9) 100%)}
.greek .name,.greek .big,.greek .mid{font-weight:400!important;letter-spacing:.1em;text-transform:uppercase}
.greek .name{font-size:96px!important;line-height:1.08}
.greek .num{font-size:130px;letter-spacing:.04em;color:#9fe3f2;opacity:0}
.greek .fsub,.greek .sub,.greek .cap{text-transform:uppercase;letter-spacing:.12em;font-size:30px;line-height:1.55}
.greek .fsub::before{content:'';display:block;width:420px;height:40px;margin:8px 0 24px;background:${MEA} repeat-x;background-size:40px 40px;opacity:.95}
.greek .shade.cover{background:linear-gradient(180deg,rgba(4,38,86,.6) 0%,rgba(4,38,86,.3) 28%,rgba(3,34,80,.66) 52%,rgba(3,30,70,.92) 100%)}
.greek .kick{text-shadow:0 2px 14px rgba(0,0,0,.6)}
.greek .kick,.greek #a0{font-size:34px;letter-spacing:.3em;text-transform:uppercase}
.greek .wm{font-style:normal;font-size:40px;letter-spacing:.34em;text-transform:uppercase}
.greek .cnt{letter-spacing:.3em}
.gframe{position:absolute;inset:34px;border:2px solid rgba(255,255,255,.7);pointer-events:none}
.greek .lt{display:inline-block;opacity:0}
.greek #etag{font-family:FR,serif!important;font-style:normal!important;text-transform:uppercase;letter-spacing:.14em;font-size:50px;color:#1A6FB8}
`;
const NOTESCSS = `
.luxe .shade{background:linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 46%,rgba(0,0,0,.72) 100%)}
.luxe .shade.cover{background:linear-gradient(180deg,rgba(6,40,48,.5) 0%,rgba(6,40,48,.28) 32%,rgba(6,40,48,.78) 100%)}
.luxe #hint,.luxe #dots{display:none}
.luxe .sc{background:#141210}
.abg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 42% at 50% 36%,rgba(201,165,92,.17),rgba(0,0,0,0) 70%),linear-gradient(180deg,#191715,#0d0c0b)}
.anim{position:absolute;left:0;top:250px;width:1080px;height:1080px;overflow:visible}
.anim .g{fill:none;stroke:#C9A55C;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.anim .w{fill:none;stroke:#F6F1E7;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.lpanel.low{top:1230px}
.light .sc{background:#F7F4EE}
.light .abg{background:radial-gradient(ellipse 80% 42% at 50% 36%,rgba(10,186,181,.15),rgba(255,255,255,0) 70%),linear-gradient(180deg,#FCFBF8,#EAF2F0)}
.light .anim .g{stroke:#0ABAB5}
.light .anim .w{stroke:#1E3A3D}
.light .shade.fact{display:none}
.light .dim{background:#fff}
.light .lpanel{background:rgba(255,255,255,.94);-webkit-backdrop-filter:none;backdrop-filter:none;border:1.5px solid rgba(10,186,181,.75);color:#1E3A3D;box-shadow:0 20px 50px rgba(30,58,61,.13)}
.light .lnum{color:#0ABAB5}
.light .lline{background:#0ABAB5}
.light .lsub{color:rgba(30,58,61,.8)}
.light .tick path{stroke:#0ABAB5}
.light .cb{background:rgba(30,58,61,.2)}
.light .cb i{background:#0ABAB5}
.light .shade.cover{background:linear-gradient(180deg,rgba(0,0,0,.34) 0%,rgba(0,0,0,0) 22%,rgba(247,244,238,0) 26%,rgba(247,244,238,.82) 50%,rgba(247,244,238,.97) 72%,rgba(247,244,238,1) 100%)!important}
.light .nk,.light #a0{color:#0A9E99!important;text-shadow:none!important}
.light .n5{color:#1E3A3D!important;text-shadow:none!important}
.light .n5 svg ellipse{stroke:#0ABAB5!important}
.light .nw{color:#1E3A3D!important}
.light .nw span{border-color:#0ABAB5!important}
.light .n2{color:#1E3A3D!important;text-shadow:none!important}
.light .blk{top:760px!important}
.luxe .ph img{filter:sepia(.14) saturate(.94) contrast(1.05) brightness(1.03)!important}
.luxe .wm{font-family:CG,serif;font-style:italic;font-size:56px}
.luxe .cnt{font-family:MT,sans-serif;letter-spacing:.3em}
.lpanel{position:absolute;left:64px;right:64px;top:1000px;padding:56px 60px 54px;background:rgba(12,12,12,.5);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1.5px solid rgba(201,165,92,.8);color:#F6F1E7;opacity:0}
.lnum{font-family:CG,serif;font-style:italic;font-weight:500;font-size:86px;color:#C9A55C;line-height:1}
.lline{width:88px;height:2px;background:#C9A55C;margin:20px 0 28px}
.ltitle{font-family:CG,serif;font-weight:600;font-size:82px;line-height:1.04;letter-spacing:.005em}
.lsub{font-family:MT,sans-serif;font-weight:400;font-size:34px;line-height:1.55;margin-top:24px;color:rgba(246,241,231,.88)}
.tick{position:absolute;right:50px;top:56px;width:62px;height:62px}
.tick path{fill:none;stroke:#C9A55C;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:130;stroke-dashoffset:130}
#chk{position:absolute;left:72px;right:72px;top:218px;display:none;gap:12px;z-index:50;opacity:0}
.luxe #chk{display:flex}
.cb{flex:1;height:3px;background:rgba(246,241,231,.42);position:relative;overflow:hidden}
.cb i{position:absolute;left:0;top:0;bottom:0;background:#C9A55C;width:0}
.luxe .nk,.luxe #a0{font-size:28px!important;line-height:1.4}
.luxe .nk{font-family:MT,sans-serif;font-weight:500;font-size:30px;letter-spacing:.42em;text-transform:uppercase;color:#C9A55C;text-shadow:0 2px 14px rgba(0,0,0,.5);opacity:0;margin-right:-.42em}
.luxe .n5{position:relative;display:inline-block;font-family:CG,serif;font-weight:600;font-size:440px;line-height:1;color:#F6F1E7;text-shadow:0 8px 30px rgba(0,0,0,.4);opacity:0;padding:0 36px;margin-top:6px}
.luxe .n5 svg{position:absolute;left:-30px;top:30px;width:calc(100% + 60px);height:calc(100% - 20px);overflow:visible}
.luxe .n5 svg ellipse{fill:none;stroke:#C9A55C;stroke-width:2.5;vector-effect:non-scaling-stroke}
.luxe .nw{font-family:MT,sans-serif;font-weight:600;font-size:66px;line-height:1.1;letter-spacing:.3em;text-transform:uppercase;color:#F6F1E7;opacity:0;margin-top:14px;margin-right:-.3em}
.luxe .nw span{display:inline-block;padding:20px 0 20px .3em;border-top:2px solid #C9A55C;border-bottom:2px solid #C9A55C}
.luxe .n2{font-family:CG,serif;font-style:italic;font-weight:500;font-size:84px;color:#F6F1E7;text-shadow:0 3px 18px rgba(0,0,0,.5);opacity:0;margin-top:26px}
`;
const BODYCLS = ((TL.style === 'greek' || TL.style === 'luxe') ? TL.style : '') + (TL.theme ? ' ' + TL.theme : '');
const html = '<meta charset="utf-8"><style>' + fonts + (TL.style === 'greek' ? greekFonts : '') + (TL.style === 'luxe' ? notesFonts : '') + css + (TL.style === 'greek' ? GREEKCSS : '') + (TL.style === 'luxe' ? NOTESCSS : '') + '</style><body class="' + BODYCLS + '"><div id="scenes"></div><div id="chk"></div>' +
  '<div id="top"><div class="cg wm">InVoyage</div><div class="mt cnt" id="cnt"></div></div><div id="dots"></div>' +
  '<div id="hint" class="mt">листай<svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M2 11h34M26 2l10 9-10 9"/></svg></div>' +
  '<div id="end"><img id="elogo" src="' + LOGO + '"><div id="etag">' + TL.end.tag + '</div></div>' +
  '<script>window.TL=' + JSON.stringify(TL) + ';</script><script>' + fs.readFileSync(path.resolve(__dirname, 'anim_defs.js'), 'utf8') + '</script><script>' + fs.readFileSync(path.resolve(__dirname, 'cards_page.js'), 'utf8') + '</script>';
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
    for (const t of MODE.slice(6).split(',')) { await p.evaluate(async t => { window.FORCE = false; render(t); await window.settle(); }, +t); await p.screenshot({ path: OUT + '_still_' + t + '.png' }); }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  if (MODE === 'frames') {          // one clean frame per photo shot (+ tips + end card)
    const times = [];
    TL.beats.forEach(b => { if (b.shots && b.shots.length) b.shots.forEach(sh => times.push(sh.t0 + 1.9)); else times.push(b.t0 + 2.0); });
    times.push(TL.end.t0 + 2.6);
    for (let i = 0; i < times.length; i++) {
      await p.evaluate(async t => { window.FORCE = true; render(t); await window.settle(); }, times[i]);
      const id = String(i + 1).padStart(2, '0');
      await p.screenshot({ path: OUT + '_' + id + '_916.png' });
      await p.screenshot({ path: OUT + '_' + id + '_45.png', clip: { x: 0, y: 285, width: 1080, height: 1350 } });
    }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  if (MODE === 'slides') {
    const times = TL.beats.map(x => x.t0 + 2.0).concat([TL.end.t0 + 2.6]);
    for (let i = 0; i < times.length; i++) {
      await p.evaluate(async t => { window.FORCE = true; render(t); await window.settle(); }, times[i]);
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
    await p.evaluate(async t => { render(t); await window.settle(); }, f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ffp.stdin.write(buf)) await new Promise(r => ffp.stdin.once('drain', r));
  }
  ffp.stdin.end(); await new Promise(r => ffp.on('close', r));
  fs.unlinkSync(tmp); await b.close();
})();
