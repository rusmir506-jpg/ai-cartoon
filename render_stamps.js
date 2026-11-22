// "Passport stamps" format (1080x1920, 30 fps, 27 s). Usage: node render_stamps.js <config.json> <out.mp4> [still:1.5,9]
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
const CX = [220, 660], CY = [365, 835], ANG = [-7, 6, -4, 8];
const stamp = (i, d) => `<svg viewBox="-180 -180 360 360" width="380" height="380" style="overflow:visible">
<defs><filter id="ink${i}" x="-10%" y="-10%" width="120%" height="120%">
 <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="${i + 4}" result="t"/>
 <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 2.15" result="a"/>
 <feComposite in="SourceGraphic" in2="a" operator="in" result="s"/>
 <feDisplacementMap in="s" in2="t" scale="2.6"/></filter>
<path id="top${i}" d="M -127 0 A 127 127 0 0 1 127 0"/><path id="bot${i}" d="M -160 0 A 160 160 0 0 0 160 0"/></defs>
<g filter="url(#ink${i})" fill="${d.color}" style="font-family:M,sans-serif">
 <circle r="168" fill="none" stroke="${d.color}" stroke-width="9"/><circle r="120" fill="none" stroke="${d.color}" stroke-width="3"/>
 <text font-size="29" font-weight="500" text-anchor="middle" letter-spacing="2"><textPath href="#top${i}" startOffset="50%">${d.country}</textPath></text>
 <text font-size="25" font-weight="500" text-anchor="middle" letter-spacing="1.5"><textPath href="#bot${i}" startOffset="50%">${d.vibe}</textPath></text>
 <text y="-6" font-size="108" font-weight="500" text-anchor="middle">${i + 1}</text>
 <text y="58" font-size="${d.city.length >= 8 ? 30 : 40}" font-weight="500" text-anchor="middle">${d.city}</text></g></svg>`;
const slots = cfg.dests.map((d, i) => {
  const x = CX[i % 2], y = CY[Math.floor(i / 2)];
  return `<div class="slot" style="left:${x - 190}px;top:${y - 190}px">
  <div class="ph" id="ph${i}"><svg viewBox="-180 -180 360 360" width="380" height="380"><circle r="150" fill="none" stroke="#DDD3BA" stroke-width="4" stroke-dasharray="14 12"/>
  <text y="38" font-size="110" font-weight="400" text-anchor="middle" fill="#E6DECA" style="font-family:M">${i + 1}</text></svg></div>
  <div class="st" id="st${i}">${stamp(i, d)}</div></div>`;
}).join('');
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;font-family:M,sans-serif}
body{background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
#star{position:absolute;left:380px;top:640px;width:900px;height:900px;opacity:.08}
.abs{position:absolute;left:70px;right:70px;text-align:center}
.sc{position:absolute;left:70px;right:70px;top:0;height:1920px;display:none;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.kick{font-weight:400;font-size:44px;color:${GOLD};margin-bottom:34px}
.big{font-weight:500;line-height:1.15;color:${TEAL}}
#cap1{top:190px;font-weight:500;font-size:62px;color:${TEAL}}
#cap2{top:150px;font-weight:500;font-size:76px;line-height:1.15;color:${TEAL}}
#page{position:absolute;left:100px;top:390px;width:880px;height:1100px;background:#FFFDF8;border:2px solid #E8DFC9;border-radius:28px;
  box-shadow:0 34px 80px rgba(31,70,80,.16),0 2px 0 #fff inset}
#page .hd{position:absolute;left:0;right:0;top:44px;text-align:center;font-size:36px;color:${GOLD};font-weight:400}
#page .ln{position:absolute;left:300px;right:300px;top:112px;height:2px;background:#E3D7B8}
.slot{position:absolute;width:380px;height:380px}
.slot>div{position:absolute;inset:0}
#logo{position:absolute;left:35px;top:360px;width:1010px;mix-blend-mode:multiply;
  -webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
.tag{top:1180px;font-weight:500;font-size:56px;line-height:1.3;color:${TEAL}}
</style>
<svg id="star" viewBox="-100 -100 200 200"><g fill="${GOLD}"><path d="M0-98 L9-9 L98 0 L9 9 L0 98 L-9 9 L-98 0 L-9-9Z"/><path d="M0-62 L6-6 L62 0 L6 6 L0 62 L-6 6 L-62 0 L-6-6Z" transform="rotate(45)"/></g></svg>
<div class="sc" id="hook"><div class="kick" id="hk">${cfg.hook.kick}</div><div class="big" id="hb" style="font-size:104px">${cfg.hook.big}</div></div>
<div class="abs" id="cap1">${cfg.cap1}</div><div class="abs" id="cap2">${cfg.cap2}</div>
<div id="page"><div class="hd">${cfg.header}</div><div class="ln"></div>${slots}</div>
<div class="sc" id="mid"><div class="kick" id="mk">${cfg.mid.kick}</div><div class="big" id="mb" style="font-size:104px">${cfg.mid.big}</div></div>
<img id="logo" src="${LOGO}"><div class="abs tag" id="tag">${cfg.outro.tag}</div>
<script>
const T=${JSON.stringify(cfg.stamps)}, ANG=${JSON.stringify(ANG)};
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const win=(t,a,b)=>{const x=clamp((t-a)/(b-a));return 1-Math.pow(1-x,3)};
const outw=(t,a,b)=>1-clamp((t-a)/(b-a));
const put=(el,o,y=0,s=1)=>{el.style.opacity=o;el.style.transform='translateY('+y+'px) scale('+s+')'};
function render(t){
  $('star').style.transform='rotate('+(t*5)+'deg)';
  const h=$('hook'); h.style.display=t<3.01?'flex':'none';
  if(t<3.01){const o=outw(t,2.65,3.0),a=win(t,0,.5),b=win(t,.15,.75);put($('hk'),a*o,(1-a)*20);put($('hb'),b*o,(1-b)*40,.94+.06*b)}
  const pin=win(t,2.7,3.5), pout=outw(t,19.2,19.8);
  let shake=0; T.forEach(s=>{const u=t-(s+0.2); if(u>=0&&u<0.6) shake+=11*Math.exp(-u*11)*Math.cos(u*38)});
  const pg=$('page'); pg.style.opacity=pin*pout;
  pg.style.transform='translateY('+((1-pin)*150+(1-pout)*130+shake)+'px) rotate(-1.2deg)';
  put($('cap1'),win(t,3.1,3.7)*outw(t,14.7,15.0),(1-win(t,3.1,3.7))*20);
  put($('cap2'),win(t,15.0,15.6)*outw(t,19.0,19.4),(1-win(t,15.0,15.6))*24);
  T.forEach((s,i)=>{
    const u=t-s, ph=$('ph'+i), st=$('st'+i);
    if(u<0){ph.style.opacity=1;st.style.opacity=0;return}
    ph.style.opacity=u<0.2?1:0;
    const k=clamp(u/.2), ease=k*k;
    let sc=u<.2?1.7-.7*ease:1-.035*Math.sin(Math.PI*clamp((u-.2)/.3));
    const p=t-(15.3+0.4*i); if(p>0&&p<.5) sc*=1+.07*Math.sin(Math.PI*p/.5);
    st.style.opacity=clamp(u/.1)*.93;
    st.style.transform='rotate('+(ANG[i]+(u<.2?9*(1-k):0))+'deg) scale('+sc+')';
  });
  const m=$('mid'); const mi=win(t,19.8,20.4), mo=outw(t,22.65,23.0); m.style.display=(t>=19.75&&t<23.05)?'flex':'none';
  put($('mk'),mi*mo,(1-mi)*20); put($('mb'),win(t,19.95,20.6)*mo,(1-win(t,19.95,20.6))*40,.94+.06*win(t,19.95,20.6));
  const l=win(t,23.5,24.3);put($('logo'),l,0,.96+.04*l);
  const g=win(t,24.4,25.0);put($('tag'),g,(1-g)*24);
}
</script>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = path.resolve(path.dirname(OUT), '_stamps.html');
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
