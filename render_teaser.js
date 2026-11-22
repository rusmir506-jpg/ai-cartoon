// Animated teaser format (1080x1920, 30 fps, 27 s). Usage: node render_teaser.js <config.json> <out.mp4> [still:1.5,9]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3], MODE = process.argv[4] || '';
const FPS = 30, DUR = 27;
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces = [400, 500].map(w => ['cyrillic', 'latin'].map(s =>
  `@font-face{font-family:M;font-weight:${w};src:url('${F}montserrat-${s}-${w}-normal.woff2') format('woff2');` +
  (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('')).join('');
const LOGO = 'file://' + path.resolve(__dirname, 'assets/invoyage_logo.jpg');
const TEAL = '#1F7480', GOLD = '#B89A5E', INK = '#5F6F72';
const scenes = cfg.scenes.map((s, i) => `<div class="sc" id="sc${i}">
  <div class="kick" id="k${i}">${s.kick}</div>
  <div class="big" id="b${i}" style="font-size:${s.size || 112}px;color:${s.gold ? GOLD : TEAL}">${s.big}</div>
  <div class="sub" id="s${i}">${s.sub}</div></div>`).join('');
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:M,sans-serif}
body{background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
#star{position:absolute;left:380px;top:640px;width:900px;height:900px;opacity:.1}
.sc{position:absolute;left:70px;right:70px;top:0;height:1920px;display:none;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.kick{font-weight:400;font-size:44px;color:${GOLD};margin-bottom:34px}
.big{font-weight:500;line-height:1.15}
.sub{font-weight:400;font-size:46px;line-height:1.4;color:${INK};margin-top:48px}
.abs{position:absolute;left:70px;right:70px;text-align:center}
#logo{position:absolute;left:35px;top:360px;width:1010px;mix-blend-mode:multiply;
  -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
.tag{top:1180px;font-weight:500;font-size:54px;line-height:1.3;color:${TEAL}}
.cta{top:1480px;font-weight:400;font-size:42px;color:${GOLD}}
</style>
<svg id="star" viewBox="-100 -100 200 200"><g fill="${GOLD}">
 <path d="M0-98 L9-9 L98 0 L9 9 L0 98 L-9 9 L-98 0 L-9-9Z"/><path d="M0-62 L6-6 L62 0 L6 6 L0 62 L-6 6 L-62 0 L-6-6Z" transform="rotate(45)"/></g></svg>
${scenes}
<img id="logo" src="${LOGO}">
<div class="abs tag" id="tag">${cfg.outro.tag}</div>
<div class="abs cta" id="cta">${cfg.outro.cta}</div>
<script>
const ST=${JSON.stringify(cfg.starts)}, END=23;
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const win=(t,a,b)=>{const x=clamp((t-a)/(b-a));return 1-Math.pow(1-x,3)};
const outw=(t,a,b)=>1-clamp((t-a)/(b-a));
const put=(el,o,y=0,s=1)=>{el.style.opacity=o;el.style.transform='translateY('+y+'px) scale('+s+')'};
function render(t){
  $('star').style.transform='rotate('+(t*5)+'deg)';
  ST.forEach((s,i)=>{
    const e=i+1<ST.length?ST[i+1]:END, u=t-s, len=e-s, on=u>=-0.01&&u<=len+0.01, el=$('sc'+i);
    el.style.display=on?'flex':'none'; if(!on)return;
    const o=outw(u,len-0.35,len), a=win(u,0,.5), b=win(u,.12,.7), c=win(u,.5,1.05);
    put($('k'+i),a*o,(1-a)*20); put($('b'+i),b*o,(1-b)*40,.94+.06*b); put($('s'+i),c*o,(1-c)*28);
  });
  const l=win(t,23.5,24.3);put($('logo'),l,0,.96+.04*l);
  const g=win(t,24.4,25.0);put($('tag'),g,(1-g)*24);
  const k=win(t,25.2,25.8);put($('cta'),k,(1-k)*16);
}
</script>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = path.resolve(path.dirname(OUT), '_teaser.html');
  fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.getElementById('logo').complete);
  if (MODE.startsWith('still:')) {
    for (const t of MODE.slice(6).split(',')) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${OUT}_still_${t}.png` }); }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * DUR; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  fs.unlinkSync(tmp); await b.close();
})();
