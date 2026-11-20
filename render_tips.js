// Renders the animated "tips" format (1080x1920, 30 fps, 27 s) from a config.json with headless Chromium.
// Usage: node render_tips.js <config.json> <out_video.mp4> [still:1.5,9,25]   (still: = save PNG stills only)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3], MODE = process.argv[4] || '';
const FPS = 30, DUR = 27;
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces = [400, 500, 600, 700].map(w => ['cyrillic', 'latin'].map(s =>
  `@font-face{font-family:M;font-weight:${w};src:url('${F}montserrat-${s}-${w}-normal.woff2') format('woff2');` +
  (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('')).join('');
const LOGO = 'file://' + path.resolve(__dirname, 'assets/invoyage_logo.jpg');
const TEAL = '#1F7480', GOLD = '#B89A5E', INK = '#5F6F72';
const tipHtml = cfg.tips.map((t, i) => `
<div class="tip" id="tip${i}">
  <div class="kick" id="k${i}">ОШИБКА</div>
  <div class="num" id="n${i}">${i + 1}</div>
  <div class="h" id="h${i}">${t.h}</div>
  <div class="rule" id="r${i}"></div>
  <div class="s" id="s${i}">${t.s}</div>
</div>`).join('');
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:M,sans-serif}
body{background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
#star{position:absolute;left:380px;top:640px;width:900px;height:900px;opacity:.1}
#prog{position:absolute;left:90px;right:90px;top:150px;display:flex;gap:14px}
#prog i{flex:1;height:6px;border-radius:3px;background:rgba(31,116,128,.16);overflow:hidden;display:block}
#prog b{display:block;height:100%;width:0;background:${GOLD}}
.abs{position:absolute;left:90px;right:90px;text-align:center}
.hook1{top:740px;font-weight:700;font-size:158px;line-height:1;white-space:nowrap;color:${TEAL}}
.hook2{top:950px;font-weight:500;font-size:72px;color:#2A3A3D}
.hook3{top:1110px;font-weight:500;font-size:44px;letter-spacing:.06em;color:${GOLD};text-transform:uppercase}
.tip{position:absolute;left:90px;right:90px;top:500px;text-align:center}
.kick{font-weight:600;font-size:30px;letter-spacing:.5em;margin-right:-.5em;color:${GOLD}}
.num{font-weight:700;font-size:440px;line-height:1;margin-top:10px;color:${GOLD};opacity:.95}
.h{font-weight:700;font-size:78px;line-height:1.15;color:${TEAL};margin-top:20px}
.rule{width:110px;height:3px;background:${GOLD};margin:46px auto 42px;transform-origin:center}
.s{font-weight:400;font-size:46px;line-height:1.4;color:${INK};padding:0 30px}
.out1{top:760px;font-weight:700;font-size:100px;line-height:1.2;color:${TEAL}}
#logo{position:absolute;left:35px;top:360px;width:1010px;mix-blend-mode:multiply;
  -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
.tag{top:1180px;font-weight:600;font-size:64px;line-height:1.25;color:${TEAL}}
.cta{top:1450px;font-weight:600;font-size:30px;letter-spacing:.42em;margin-right:-.42em;color:${GOLD};text-transform:uppercase}
</style>
<svg id="star" viewBox="-100 -100 200 200"><g fill="${GOLD}">
 <path d="M0-98 L9-9 L98 0 L9 9 L0 98 L-9 9 L-98 0 L-9-9Z"/><path d="M0-62 L6-6 L62 0 L6 6 L0 62 L-6 6 L-62 0 L-6-6Z" transform="rotate(45)"/></g></svg>
<div id="prog">${cfg.tips.map((_, i) => `<i><b id="p${i}"></b></i>`).join('')}</div>
<div class="abs hook1" id="hk1">${cfg.hook.big}</div>
<div class="abs hook2" id="hk2">${cfg.hook.mid}</div>
<div class="abs hook3" id="hk3">${cfg.hook.small}</div>
${tipHtml}
<div class="abs out1" id="out1">${cfg.outro.lines}</div>
<img id="logo" src="${LOGO}">
<div class="abs tag" id="tag">${cfg.outro.tag}</div>
<div class="abs cta" id="cta">${cfg.outro.cta}</div>
<script>
const N=${cfg.tips.length};
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const win=(t,a,b)=>{const x=clamp((t-a)/(b-a));return 1-Math.pow(1-x,3)};
const outw=(t,a,b)=>1-clamp((t-a)/(b-a));
const put=(el,o,y=0,s=1)=>{el.style.opacity=o;el.style.transform='translateY('+y+'px) scale('+s+')'};
function render(t){
  $('star').style.transform='rotate('+(t*5)+'deg)';
  // hook 0-3
  const ho=t<3?outw(t,2.7,3.0):0;
  [['hk1',0,.5,40],['hk2',.3,.8,30],['hk3',.65,1.15,24]].forEach(([id,a,b,d])=>{const w=win(t,a,b);put($(id),t<3?w*ho:0,(1-w)*d,id==='hk1'?.92+.08*w:1)});
  // progress
  const pv=win(t,3,3.4)*outw(t,22.7,23);
  $('prog').style.opacity=pv;
  for(let i=0;i<N;i++)$('p'+i).style.width=(100*clamp((t-3-4*i)/4))+'%';
  // tips 3..23, 4 s each
  for(let i=0;i<N;i++){
    const u=t-(3+4*i), on=u>=-0.01&&u<=4.01, o=on?outw(u,3.65,4.0):0, tip=$('tip'+i);
    tip.style.display=on?'block':'none';
    if(!on)continue;
    const a=win(u,0,.5),b=win(u,.15,.65),c=win(u,.35,.9),d=win(u,.55,1.05);
    put($('k'+i),a*o,(1-a)*20);
    put($('n'+i),a*o,(1-a)*50,.9+.1*a);
    put($('h'+i),b*o,(1-b)*36);
    $('r'+i).style.opacity=c*o;$('r'+i).style.transform='scaleX('+c+')';
    put($('s'+i),d*o,(1-d)*28);
  }
  // outro: text 23-24.7, then logo
  const w1=win(t,23,23.6)*outw(t,24.3,24.7);
  put($('out1'),t>=23&&t<24.8?w1:0,(1-win(t,23,23.6))*40);
  const l=win(t,24.6,25.4);put($('logo'),l,0,.96+.04*l);
  const g=win(t,25.3,25.9);put($('tag'),g,(1-g)*24);
  const k=win(t,25.9,26.4);put($('cta'),k,(1-k)*16);
}
</script>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = path.resolve(path.dirname(OUT), '_tips.html');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(tmp, html);
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => document.getElementById('logo').complete);
  if (MODE.startsWith('still:')) {
    for (const t of MODE.slice(6).split(',')) {
      await p.evaluate(t => render(t), +t);
      await p.screenshot({ path: `${OUT}_still_${t}.png` });
    }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * DUR; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  fs.unlinkSync(tmp); await b.close();
})();
