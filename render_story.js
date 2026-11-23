// Animated scene renderer (1080x1920, 30 fps). Usage: node render_story.js <timeline.json> <out.mp4> [still:1,2.5]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const TL = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3], MODE = process.argv[4] || '';
const FPS = 30, DUR = TL.duration;
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const faces = [400, 500, 600, 800, 900].map(w => ['cyrillic', 'latin'].map(s =>
  `@font-face{font-family:M;font-weight:${w};src:url('${F}montserrat-${s}-${w}-normal.woff2') format('woff2');` +
  (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('')).join('') +
  `@font-face{font-family:GV;src:url('${F}great-vibes-latin-400-normal.woff2') format('woff2')}`;
const LOGO = 'file://' + path.resolve(__dirname, 'assets/invoyage_logo.jpg');
const GOLD = '#C9A55C';
const STAR = `<path d="M0-98 L9-9 L98 0 L9 9 L0 98 L-9 9 L-98 0 L-9-9Z"/><path d="M0-62 L6-6 L62 0 L6 6 L0 62 L-6 6 L-62 0 L-6-6Z" transform="rotate(45)"/>`;
const stampSvg = (i, d) => `<svg viewBox="-200 -200 400 400" width="560" height="560" style="overflow:visible">
<defs><filter id="ink${i}" x="-10%" y="-10%" width="120%" height="120%">
 <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="${i + 4}" result="t"/>
 <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 2.15" result="a"/>
 <feComposite in="SourceGraphic" in2="a" operator="in" result="s"/><feDisplacementMap in="s" in2="t" scale="2.6"/></filter>
<path id="top${i}" d="M -127 0 A 127 127 0 0 1 127 0"/><path id="bot${i}" d="M -160 0 A 160 160 0 0 0 160 0"/></defs>
<circle r="188" fill="rgba(255,253,248,.94)"/>
<g filter="url(#ink${i})" fill="${d.color}" style="font-family:M,sans-serif">
 <circle r="168" fill="none" stroke="${d.color}" stroke-width="9"/><circle r="120" fill="none" stroke="${d.color}" stroke-width="3"/>
 <text font-size="29" font-weight="600" text-anchor="middle" letter-spacing="2"><textPath href="#top${i}" startOffset="50%">${d.country}</textPath></text>
 <text font-size="23" font-weight="600" text-anchor="middle" letter-spacing="1.2"><textPath href="#bot${i}" startOffset="50%">${d.vibe}</textPath></text>
 <text y="-6" font-size="108" font-weight="600" text-anchor="middle">${d.n}</text>
 <text y="58" font-size="${d.city.length >= 8 ? 30 : 40}" font-weight="600" text-anchor="middle">${d.city}</text></g></svg>`;
const stamps = TL.stamps.map((s, i) => `<div class="stamp" id="st${i}">${stampSvg(i, s)}</div>`).join('');
const bigs = TL.bigs.map((b, i) => `<div class="big" id="bg${i}" style="top:${b.top}px">${b.lines.map((l, j) => `<div class="hl" id="bg${i}_${j}">${l}</div>`).join('')}</div>`).join('');
const titles = TL.titles.map((p, i) => `<div class="script" id="ti${i}">${p.text}</div>`).join('');
const emos = TL.emojis.map((p, i) => `<div class="emo" id="em${i}">${p.ch}</div>`).join('');
const tips = TL.beats.filter(b => b.scene === 'tip').map((b, i) => `<div class="scn tipbg" id="s_tip${b.tip.n}">
  <div class="card" id="card${b.tip.n}"><div class="badge">Совет ${b.tip.n}</div><div class="ticon">${b.tip.icon}</div>
  <div class="th">${b.tip.h}</div><div class="ts" id="ts${b.tip.n}">${b.tip.s}</div><div class="chk" id="chk${b.tip.n}">✓</div></div></div>`).join('');
const photoLayer = TL.beats.map((b, i) => (b.shots || []).map((s, j) => `<div class="shot2" id="ph${i}_${j}"><img id="pi${i}_${j}" src="file://${path.resolve(s.file)}" style="width:${s.iw}px;height:${s.ih}px"></div>`).join('')).join('');
const temps = TL.beats.map((b, i) => b.scene !== 'temp' ? '' : b.shots ? `<div class="scn" id="s_temp${i}" style="background:linear-gradient(180deg,rgba(0,0,0,.36) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 52%,rgba(0,0,0,.5) 100%)">
  <div class="note" style="top:1115px"><span>${b.temp.note}</span></div>
  <div class="gcards"><div class="gc"><div class="gl">☀️ ${b.temp.air_label || 'днём'}</div><div class="gn" id="an${i}">+0°</div><div class="gb"><i id="abar${i}" style="background:linear-gradient(90deg,#FF8A3D,#FFD166)"></i></div></div>
  <div class="gc"><div class="gl">🌊 вода</div><div class="gn" id="wn${i}">+0°</div><div class="gb"><i id="wbar${i}" style="background:linear-gradient(90deg,#1E9BC9,#9FF0FF)"></i></div></div></div></div>` : `<div class="scn" id="s_temp${i}" style="background:linear-gradient(180deg,${b.temp.bg[0]} 0%,${b.temp.bg[1]} 55%,${b.temp.bg[2]} 100%)">
  <svg class="full" viewBox="0 0 1080 1920"><defs>
   <linearGradient id="ga${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF5E3A"/><stop offset="1" stop-color="#FFC857"/></linearGradient>
   <linearGradient id="gw${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1E9BC9"/><stop offset="1" stop-color="#9FF0FF"/></linearGradient></defs>
   <circle cx="900" cy="330" r="190" fill="rgba(255,240,190,.22)"/>
   ${[[300, 'a'], [780, 'w']].map(([x, k]) => `<rect x="${x - 60}" y="600" width="120" height="580" rx="60" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="6"/>
   <rect id="${k}f${i}" x="${x - 46}" y="1190" width="92" height="0" rx="46" fill="url(#g${k === 'a' ? 'a' : 'w'}${i})"/>
   <circle cx="${x}" cy="1190" r="86" fill="url(#g${k === 'a' ? 'a' : 'w'}${i})" stroke="#fff" stroke-width="6"/>`).join('')}
   <path id="wv${i}" fill="rgba(255,255,255,.22)"/></svg>
  <div class="tnum" id="an${i}" style="left:60px">+0°</div><div class="tnum" id="wn${i}" style="left:540px">+0°</div>
  <div class="tlab" style="left:60px">${b.temp.air_label || 'днём'}</div><div class="tlab" style="left:540px">вода</div>
  <div class="ticon2" id="ic${i}">${b.temp.icon}</div>
  <div class="note"><span>${b.temp.note}</span></div></div>`).join('');
const hudPins = TL.hud.labels.map((l, i) => `<div class="hp" id="hp${i}"><div class="hc" id="hc${i}">${i + 1}</div><div class="hl2">${l}</div></div>`).join('');
const html = `<meta charset="utf-8"><style>${faces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;font-family:M,sans-serif}
.scn{position:absolute;inset:0;display:none;overflow:hidden}
.full{position:absolute;inset:0}
.tipbg{background:linear-gradient(180deg,#0F5566,#0A3040)}
.card{position:absolute;left:70px;right:70px;top:430px;height:960px;border-radius:56px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);
  text-align:center;color:#fff;backdrop-filter:blur(6px)}
.badge{margin:50px auto 0;display:inline-block;padding:12px 34px;border-radius:40px;background:${GOLD};color:#17323a;font-weight:800;font-size:36px;text-transform:uppercase;letter-spacing:.08em}
.ticon{font-family:'Noto Color Emoji';font-size:230px;line-height:1;margin-top:46px}
.th{font-weight:800;font-size:84px;line-height:1.1;margin-top:38px}
.ts{font-weight:500;font-size:44px;line-height:1.35;margin:34px 60px 0;color:#CBE7EE}
.chk{position:absolute;right:50px;bottom:44px;width:120px;height:120px;border-radius:60px;background:#37C978;color:#fff;font-size:84px;line-height:116px;font-weight:800;opacity:0}
.star{position:absolute;opacity:.9}
.shot2{position:absolute;inset:0;overflow:hidden;display:none;filter:saturate(1.08) contrast(1.04)}
.shot2 img{position:absolute;left:0;top:0;transform-origin:0 0;max-width:none}
.gcards{position:absolute;left:50px;right:50px;top:1215px;display:flex;gap:30px}
.gc{flex:1;height:215px;border-radius:38px;background:rgba(10,20,28,.45);border:2px solid rgba(255,255,255,.3);backdrop-filter:blur(12px);padding:22px 30px;color:#fff;position:relative}
.gl{font-weight:700;font-size:34px;text-transform:uppercase;letter-spacing:.06em}
.gn{font-weight:900;font-size:96px;line-height:1;margin-top:6px}
.gb{position:absolute;left:30px;right:30px;bottom:22px;height:10px;border-radius:5px;background:rgba(255,255,255,.25);overflow:hidden}
.gb i{display:block;height:100%;width:0;border-radius:5px}
.tnum{position:absolute;top:470px;width:480px;text-align:center;color:#fff;font-weight:900;font-size:112px;line-height:1;text-shadow:0 6px 24px rgba(0,0,0,.3)}
.tlab{position:absolute;top:1300px;width:480px;text-align:center;color:#fff;font-weight:800;font-size:40px;text-transform:uppercase;letter-spacing:.08em;text-shadow:0 2px 10px rgba(0,0,0,.4)}
.ticon2{position:absolute;left:340px;top:790px;width:400px;text-align:center;font-family:'Noto Color Emoji';font-size:200px;line-height:1}
.note{position:absolute;left:60px;right:60px;top:1385px;text-align:center}
.note span{display:inline-block;padding:14px 38px;border-radius:44px;background:rgba(255,255,255,.22);color:#fff;font-weight:700;font-size:44px;border:2px solid rgba(255,255,255,.4)}
#hud{position:absolute;left:0;right:0;top:110px;height:170px;opacity:0}
.hp{position:absolute;top:0;width:200px;margin-left:-100px;text-align:center;color:#fff}
.hc{width:76px;height:76px;margin:0 auto;border-radius:38px;background:rgba(255,255,255,.22);border:3px solid #fff;font-weight:800;font-size:38px;line-height:70px}
.hl2{margin-top:10px;font-weight:600;font-size:27px;text-shadow:0 0 10px rgba(0,0,0,.75),0 2px 6px rgba(0,0,0,.6)}
#plane{position:absolute;font-family:'Noto Color Emoji';font-size:50px;top:-50px}
.big{position:absolute;left:30px;right:30px;text-align:center}
.hl{font-weight:900;font-size:124px;line-height:1.05;color:#fff;opacity:0;text-shadow:0 6px 30px rgba(0,0,0,.45);text-transform:uppercase}
.hl b{color:#FFD84A;font-weight:900}
.script{position:absolute;left:0;right:0;top:300px;text-align:center;font-family:GV;font-size:150px;color:#fff;opacity:0;line-height:1;
  text-shadow:0 4px 30px rgba(0,0,0,.5),0 1px 4px rgba(0,0,0,.4);white-space:nowrap}
.emo{position:absolute;font-family:'Noto Color Emoji';opacity:0;line-height:1}
.stamp{position:absolute;left:260px;top:700px;width:560px;height:560px;opacity:0;filter:drop-shadow(0 20px 30px rgba(0,0,0,.35))}
#cap{position:absolute;left:40px;right:40px;top:1500px;text-align:center;font-weight:800;font-size:46px;letter-spacing:.06em;color:#fff;
  text-transform:uppercase;text-shadow:0 3px 14px rgba(0,0,0,.65),0 1px 3px rgba(0,0,0,.6)}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
#end{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse 75% 60% at 50% 45%,#fff 0%,#fbfcfc 45%,#f0f4f5 100%)}
#end img{position:absolute;left:35px;top:360px;width:1010px;mix-blend-mode:multiply;opacity:0;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 62%,transparent 100%)}
#end .tag{position:absolute;left:70px;right:70px;top:1180px;text-align:center;font-weight:500;font-size:58px;line-height:1.3;color:#1F7480;opacity:0}
</style>
${photoLayer}<div id="world">
<div class="scn" id="s_cover" style="background:linear-gradient(180deg,#0F5566,#082F3C 70%,#061F29)">
  <svg class="star" id="cstar" width="1000" height="1000" viewBox="-100 -100 200 200" style="left:40px;top:760px;opacity:.16"><g fill="${GOLD}">${STAR}</g></svg>
  <div id="cfloat"></div></div>
<div class="scn" id="s_roof" style="background:linear-gradient(180deg,#040a1a,#0c2146 55%,#183560)">
  <div id="stars_roof"></div>
  <svg class="full" viewBox="0 0 1080 1920">
   <rect x="0" y="900" width="1080" height="1020" fill="#141b29"/><rect x="0" y="1380" width="1080" height="540" fill="#232a38"/>
   <rect x="300" y="1060" width="480" height="170" rx="18" fill="#7b5a3b"/><rect x="270" y="1190" width="540" height="130" rx="26" fill="#efe9de"/>
   <ellipse cx="400" cy="1178" rx="95" ry="38" fill="#fff"/><ellipse cx="680" cy="1178" rx="95" ry="38" fill="#fff"/>
   <rect x="270" y="1250" width="540" height="70" rx="22" fill="#4aa0a8"/>
   <rect x="850" y="1190" width="60" height="150" rx="10" fill="#6b4d33"/><circle cx="880" cy="1172" r="70" fill="rgba(255,200,120,.28)"/>
   <circle id="btn" cx="880" cy="1236" r="15" fill="#ffd166"/><circle id="btnr" cx="880" cy="1236" r="15" fill="none" stroke="#ffd166" stroke-width="4" opacity="0"/>
   <g id="pL"><rect x="0" y="0" width="542" height="900" fill="#3b2c20"/>${[...Array(9)].map((_, k) => `<rect x="0" y="${70 + k * 100}" width="542" height="5" fill="#2a1e15"/>`).join('')}</g>
   <g id="pR"><rect x="538" y="0" width="542" height="900" fill="#3b2c20"/>${[...Array(9)].map((_, k) => `<rect x="538" y="${70 + k * 100}" width="542" height="5" fill="#2a1e15"/>`).join('')}</g>
   <rect x="0" y="896" width="1080" height="10" fill="#1f160f"/>
   <line id="shoot" x1="0" y1="0" x2="120" y2="70" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0"/>
  </svg><div id="hand" style="position:absolute;left:830px;top:1262px;font-family:'Noto Color Emoji';font-size:90px;opacity:0">👆</div></div>
<div class="scn" id="s_deep" style="background:linear-gradient(180deg,#8FE3F0 0%,#1E9BC9 22%,#0B5E90 52%,#052B4A 100%)">
  <svg class="full" viewBox="0 0 1080 1920"><g id="rays"></g>
   <path id="wave" fill="rgba(255,255,255,.35)"/>
   <line x1="120" y1="470" x2="120" y2="1270" stroke="rgba(255,255,255,.7)" stroke-width="4"/>
   ${[0, 1, 2, 3, 4, 5].map(k => `<line x1="120" y1="${470 + k * 160}" x2="${k % 5 === 0 ? 170 : 150}" y2="${470 + k * 160}" stroke="#fff" stroke-width="4"/><text x="186" y="${482 + k * 160}" fill="#fff" font-size="32" font-weight="600" font-family="M">${k}${k === 5 ? ' м' : ''}</text>`).join('')}
   <g id="marker"><circle r="26" fill="#FFD84A"/><text id="mtxt" x="46" y="12" fill="#FFD84A" font-size="46" font-weight="800" font-family="M">0 м</text></g>
   <g id="dome" opacity="0"><path d="M 240 1400 A 300 340 0 0 1 840 1400 Z" fill="rgba(255,226,170,.22)" stroke="rgba(255,255,255,.8)" stroke-width="7"/>
    <rect x="360" y="1290" width="360" height="110" rx="20" fill="#efe9de"/><rect x="340" y="1230" width="400" height="90" rx="14" fill="#7b5a3b"/>
    <rect x="360" y="1340" width="360" height="60" rx="16" fill="#4aa0a8"/><circle cx="540" cy="1240" r="150" fill="rgba(255,210,140,.18)"/></g>
   <rect x="0" y="1400" width="1080" height="520" fill="#031c33"/>
   <g id="fish"></g><g id="bubbles"></g></svg></div>
<div class="scn" id="s_skypool" style="background:linear-gradient(180deg,#2B1B5E 0%,#8A3F8F 35%,#FF7A5C 68%,#FFC37A 100%)">
  <svg class="full" viewBox="0 0 1080 1920">
   <circle id="sun" cx="540" cy="900" r="150" fill="rgba(255,236,170,.55)"/><circle cx="540" cy="900" r="90" fill="#FFE9A8"/>
   <g id="clouds" fill="rgba(255,255,255,.18)"><ellipse cx="200" cy="640" rx="170" ry="34"/><ellipse cx="830" cy="560" rx="200" ry="38"/></g>
   <rect x="0" y="1180" width="1080" height="740" fill="#2a1a55"/>
   ${[...Array(12)].map((_, k) => `<rect x="${k * 92 - 10}" y="${1180 - (k * 37 % 5) * 40}" width="70" height="${300 + (k * 37 % 5) * 60}" fill="#3a2670"/>`).join('')}
   <rect x="250" y="800" width="150" height="1100" fill="#14122e"/><rect x="465" y="800" width="150" height="1100" fill="#14122e"/><rect x="680" y="800" width="150" height="1100" fill="#14122e"/>
   <path d="M 120 790 Q 540 760 960 790 L 930 830 Q 540 810 150 830 Z" fill="#14122e"/>
   <rect x="170" y="765" width="740" height="24" rx="12" fill="#7FE0F2"/><g id="shim" stroke="#fff" stroke-width="3" opacity=".75"></g>
   <g id="elev"><rect x="500" y="0" width="80" height="60" rx="8" fill="#FFD84A"/></g>
   <g id="meas" opacity="0"><line x1="170" y1="735" x2="910" y2="735" stroke="#fff" stroke-width="5"/><line x1="170" y1="715" x2="170" y2="755" stroke="#fff" stroke-width="5"/><line x1="910" y1="715" x2="910" y2="755" stroke="#fff" stroke-width="5"/>
    <text x="540" y="705" fill="#fff" font-size="56" font-weight="900" text-anchor="middle" font-family="M">150 м</text></g></svg>
  <div id="flr" style="position:absolute;left:0;right:0;top:480px;text-align:center;color:#fff;font-weight:900;font-size:150px;line-height:1;text-shadow:0 6px 30px rgba(0,0,0,.35)"><span id="flrn">1</span><span style="font-size:60px;font-weight:700"> этаж</span></div></div>
<div class="scn" id="s_ice" style="background:linear-gradient(180deg,#E3F6FF 0%,#8FD3F0 45%,#3F86C4 100%)">
  <div id="warm" style="position:absolute;inset:0;background:linear-gradient(180deg,#FFE7A8,#FFC7A0);opacity:0"></div>
  <svg class="full" viewBox="0 0 1080 1920"><g id="snow"></g>
   <path d="M -50 1500 Q 270 1380 540 1450 T 1130 1420 L 1130 1920 L -50 1920 Z" fill="#fff"/>
   <ellipse id="pud" cx="540" cy="1440" rx="10" ry="4" fill="#5FB6E8" opacity="0"/>
   <g id="hall" style="transform-origin:540px 1420px"><g id="blocks"></g>
    <path d="M 430 1420 L 430 1200 Q 540 1090 650 1200 L 650 1420 Z" fill="#FFC46B"/><path d="M 455 1420 L 455 1212 Q 540 1125 625 1212 L 625 1420 Z" fill="#FFE2A3"/></g></svg>
  <div id="sunE" style="position:absolute;left:760px;top:420px;font-family:'Noto Color Emoji';font-size:200px;opacity:0">☀️</div>
  <div id="flower" style="position:absolute;left:760px;top:1360px;font-family:'Noto Color Emoji';font-size:110px;opacity:0">🌷</div></div>
<div class="scn tipbg" id="s_tipintro"></div>
${tips}${temps}
</div>
<div id="hud"><svg width="1080" height="170" style="position:absolute;inset:0"><path id="hpath" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 16" d="M 150 38 L 930 38"/></svg>${hudPins}<div id="plane">✈️</div></div>
${stamps}${bigs}${titles}${emos}
<div id="shadeTop" style="position:absolute;left:0;right:0;top:0;height:420px;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,0))"></div><div id="shade" style="position:absolute;left:0;right:0;top:1300px;bottom:0;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.42))"></div><div id="flash"></div><div id="cap"></div>
<div id="end"><img id="elogo" src="${LOGO}"><div class="tag" id="etag">${TL.end.tag}</div></div>
<script>
const TL=${JSON.stringify(TL)};
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const win=(t,a,b)=>{const x=clamp((t-a)/(b-a));return 1-Math.pow(1-x,3)};
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const back=x=>{x=clamp(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const rnd=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(7);
const NS='http://www.w3.org/2000/svg', mk=(tag,at,p)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);p.appendChild(e);return e};
// ---- static generation ----
const stars=[]; for(let i=0;i<90;i++){const e=document.createElement('div');const s=2+rnd()*4;e.style.cssText='position:absolute;border-radius:50%;background:#fff;width:'+s+'px;height:'+s+'px;left:'+rnd()*1080+'px;top:'+rnd()*1000+'px';$('stars_roof').appendChild(e);stars.push([e,rnd()*6])}
const cfl=[]; for(let i=0;i<7;i++){const e=document.createElement('div');e.innerHTML='<svg width="150" height="150" viewBox="-70 -70 140 140"><circle r="62" fill="none" stroke="#C9A55C" stroke-width="6" opacity=".7"/><circle r="46" fill="none" stroke="#C9A55C" stroke-width="2" opacity=".7"/></svg>';e.style.cssText='position:absolute;left:'+(rnd()*900)+'px;top:'+(100+rnd()*1500)+'px;opacity:.18';$('cfloat').appendChild(e);cfl.push([e,rnd()*6,.5+rnd()])}
const deepRays=$('rays'); for(let i=0;i<5;i++)mk('polygon',{points:(120+i*210)+',380 '+(190+i*210)+',380 '+(40+i*210)+',1250 '+(-60+i*210)+',1250',fill:'rgba(255,255,255,.10)',class:'ray'},deepRays);
const bubs=[]; for(let i=0;i<26;i++){const c=mk('circle',{r:4+rnd()*11,fill:'none',stroke:'rgba(255,255,255,.7)','stroke-width':2.5},$('bubbles'));bubs.push([c,rnd()*1080,rnd()*1100,30+rnd()*50,rnd()*6])}
const fishes=[]; for(let i=0;i<3;i++){const g=mk('g',{},$('fish'));mk('path',{d:'M0 0 Q30 -22 64 0 Q30 22 0 0 M64 0 L88 -18 L88 18 Z',fill:'rgba(6,40,70,.75)'},g);fishes.push([g,600+i*230,90+i*60,i*400])}
const shim=$('shim'); const shl=[]; for(let i=0;i<9;i++)shl.push(mk('line',{x1:0,y1:776,x2:0,y2:776},shim));
const snow=[]; for(let i=0;i<50;i++){const c=mk('circle',{r:3+rnd()*6,fill:'#fff',opacity:.85},$('snow'));snow.push([c,rnd()*1080,rnd()*1500,40+rnd()*60,rnd()*6])}
const blocks=[]; for(let r=0;r<6;r++)for(let c=0;c<8;c++){const x=100+c*110,y=1420-(r+1)*100;const g=mk('rect',{x:x,y:y,width:106,height:96,rx:10,fill:'#BFEAFF',stroke:'#fff','stroke-width':3,opacity:.9},$('blocks'));blocks.push([g,r])}
// ---- scene animators: u = seconds into scene ----
const S={
 cover(u,t){$('cstar').style.transform='rotate('+(t*7)+'deg)';cfl.forEach(([e,p,s])=>{e.style.transform='translateY('+(Math.sin(t*s+p)*40)+'px) rotate('+(t*20*s)+'deg)'})},
 roof(u,t,bt){const c=bt.cues||{},a0=c.a?c.a.t0:1.2,a1=c.a?c.a.t1:1.7;const p=win(u,a1,a1+1.3);$('pL').style.transform='translateX('+(-545*p)+'px)';$('pR').style.transform='translateX('+(545*p)+'px)';
  stars.forEach(([e,ph])=>{e.style.opacity=.25+.75*p*(.6+.4*Math.sin(t*3+ph))});
  const pr=clamp((u-a0)/.5);$('btnr').setAttribute('r',15+50*pr);$('btnr').setAttribute('opacity',pr>0&&pr<1?1-pr:0);$('btn').setAttribute('r',u>a0&&u<a0+.15?11:15);
  const h=$('hand');h.style.opacity=clamp((u-(a0-.9))/.2)*clamp(((a0+.6)-u)/.3);h.style.transform='translateY('+(-30*(1-win(u,a0-.9,a0-.2)))+'px)';
  const s=clamp((u-(a1+1.8))/.7),sh=$('shoot');sh.setAttribute('opacity',s>0&&s<1?1-s*.4:0);sh.setAttribute('transform','translate('+(700-460*s)+','+(120+260*s)+')')},
 deep(u,t,bt){const c=bt.cues||{},a0=c.a?c.a.t0:1.2,b0=c.b?c.b.t0:2.5;const m=win(u,a0-.9,a0+1.4);$('marker').setAttribute('transform','translate(120,'+(470+800*m)+')');$('mtxt').textContent=Math.round(5*m)+' м';
  let d='M 0 400';for(let x=0;x<=1080;x+=40)d+=' L '+x+' '+(400+Math.sin(x/90+t*3)*12);d+=' L 1080 340 L 0 340 Z';$('wave').setAttribute('d',d);
  $('dome').setAttribute('opacity',win(u,b0,b0+.7));
  document.querySelectorAll('.ray').forEach((r,i)=>r.setAttribute('fill','rgba(255,255,255,'+(.07+.06*Math.sin(t*1.4+i))+')'));
  bubs.forEach(([c,x,y,sp,ph])=>{const yy=1400-((y+t*sp)%1100);c.setAttribute('cx',x+Math.sin(t*2+ph)*14);c.setAttribute('cy',yy)});
  fishes.forEach(([g,y,sp,o])=>{const x=-120+((o+t*sp*2)%1400);g.setAttribute('transform','translate('+x+','+(y+700+Math.sin(t*3+o)*14)+')')})},
 skypool(u,t,bt){const c=bt.cues||{},a0=c.a?c.a.t0:1.0,b0=c.b?c.b.t0:3.4;const n=win(u,a0-.2,a0+2.2);$('flrn').textContent=Math.max(1,Math.round(57*n));$('elev').setAttribute('transform','translate(0,'+(1800-1010*n)+')');
  const m=win(u,b0,b0+.9);$('meas').setAttribute('opacity',m);$('meas').setAttribute('transform','translate(540 0) scale('+m+' 1) translate(-540 0)');
  $('sun').setAttribute('cy',900-30*Math.min(u,4));$('clouds').setAttribute('transform','translate('+(t*12)+',0)');
  shl.forEach((l,i)=>{const x=190+((i*85+t*90)%700);l.setAttribute('x1',x);l.setAttribute('x2',x+26);l.setAttribute('y1',770+(i%3)*5);l.setAttribute('y2',770+(i%3)*5)})},
 ice(u,t,bt){const c=bt.cues||{},a0=c.a?c.a.t0-.3:.2,b0=c.b?c.b.t0-.2:3.0;blocks.forEach(([b,r])=>{const a=win(u,a0+.3*r,a0+.4+.3*r);b.setAttribute('opacity',.9*a);b.setAttribute('transform','translate(0,'+(40*(1-a))+')')});
  const me=win(u,b0,b0+1.8);$('hall').style.transform='scaleY('+(1-.82*me)+')';$('hall').style.opacity=1-.25*me;
  const pd=$('pud');pd.setAttribute('rx',10+360*me);pd.setAttribute('ry',4+34*me);pd.setAttribute('opacity',me);
  $('warm').style.opacity=.55*me;const sn=$('sunE');sn.style.opacity=me;sn.style.transform='scale('+(.5+.5*back((u-b0)/.7))+') rotate('+(t*30)+'deg)';
  const fl=$('flower');fl.style.opacity=win(u,b0+1.3,b0+1.7);fl.style.transform='scale('+(.3+.7*back((u-b0-1.3)/.5))+')';
  snow.forEach(([c,x,y,sp,ph])=>{c.setAttribute('cx',x+Math.sin(t*1.5+ph)*30);c.setAttribute('cy',((y+t*sp)%1500)-40);c.setAttribute('opacity',(1-.7*me)*.85)})},
 temp(u,t,b,i){const c=b.cues||{},g0=c.a?Math.max(.2,c.a.t0-.1):.4,pr=win(u,g0,g0+1.7),T=b.temp;
  if(b.shots){[['an','abar',T.air],['wn','wbar',T.water]].forEach(([n,bar,v])=>{$(n+i).textContent='+'+Math.round(v*pr)+'°';$(bar+i).style.width=(100*v/40*pr)+'%'});return}
  [['a',T.air,'an'],['w',T.water,'wn']].forEach(([k,v,n])=>{const h=590*(v/40)*pr;const r=$(k+'f'+i);r.setAttribute('y',1190-h);r.setAttribute('height',h);$(n+i).textContent='+'+Math.round(v*pr)+'°'});
  let d='M 0 1760';for(let x=0;x<=1080;x+=40)d+=' L '+x+' '+(1760+Math.sin(x/110+t*2.5)*16);d+=' L 1080 1920 L 0 1920 Z';$('wv'+i).setAttribute('d',d);
  const ic=$('ic'+i);ic.style.opacity=win(u,.3,.8);ic.style.transform='translateY('+(Math.sin(t*2.2)*14)+'px) scale('+(.6+.4*back((u-.3)/.5))+')'},
 tipintro(){}, tip(u,t,b){const n=b.tip.n,c=$('card'+n),a=back(u/.45);c.style.transform='translateX('+(1-a)*90+'px) scale('+(.9+.1*a)+')';c.style.opacity=clamp(u/.2);
  $('ts'+n).style.opacity=win(u,.35,.8);const k=$('chk'+n),q=back((u-.9)/.4);k.style.opacity=clamp((u-.9)/.1);k.style.transform='scale('+q+')'}
};
function render(t){
  let cur=null;
  TL.beats.forEach((b,i)=>{const id=b.scene==='tip'?'s_tip'+b.tip.n:(b.scene==='temp'?'s_temp'+i:'s_'+b.scene),el=$(id);const on=t>=b.t0&&t<b.t1;el.style.display=on?'block':'none';
    if(on&&b.shots&&b.scene==='cover')el.style.background='linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,.08) 40%,rgba(0,0,0,.5))';
    if(on){cur=b;const u=t-b.t0,L=b.t1-b.t0;S[b.scene](u,t,b,i);const pu=clamp(u/.3);el.style.transform='scale('+((1+.05*clamp(u/L))*(1+.06*Math.pow(1-pu,2)))+')'}});
  TL.beats.forEach((b,i)=>(b.shots||[]).forEach((s,j)=>{const el=$('ph'+i+'_'+j),on=t>=s.t0&&t<s.t1;el.style.display=on?'block':'none';if(!on)return;
    const u=sm((t-s.t0)/(s.t1-s.t0)),z=s.z0+(s.z1-s.z0)*u,cx=s.cx0+(s.cx1-s.cx0)*u,cy=s.cy0+(s.cy1-s.cy0)*u,base=Math.min(s.iw,s.ih*9/16),w=base/z,h=w*16/9;
    const x=clamp(cx*s.iw-w/2,0,s.iw-w),y=clamp(cy*s.ih-h/2,0,s.ih-h),k=1080/w;$('pi'+i+'_'+j).style.transform='scale('+k+') translate('+(-x)+'px,'+(-y)+'px)';
    const pu=clamp((t-s.t0)/.3);el.style.transform='scale('+(1+.06*Math.pow(1-pu,2))+')'}));
  let fl=0;TL.beats.forEach(b=>{const d=t-b.t0;if(b.t0>.01&&d>=0&&d<.14)fl=.3*(1-d/.14);(b.shots||[]).forEach(s=>{const e=t-s.t0;if(s.t0>.01&&e>=0&&e<.14)fl=Math.max(fl,.28*(1-e/.14))})});$('flash').style.opacity=fl;
  // big lines
  TL.bigs.forEach((b,i)=>{b.lines.forEach((l,j)=>{const e=$('bg'+i+'_'+j),a=.15+.25*j,o=clamp((b.t1-t)/.25),p=back((t-b.t0-a)/.3);e.style.opacity=(t-b.t0>=a)?o:0;e.style.transform='scale('+(.5+.5*p)+')'})});
  // titles / emojis
  TL.titles.forEach((p,i)=>{const e=$('ti'+i),o=clamp((t-p.t0)/.12)*clamp((p.t1-t)/.25),a=back((t-p.t0)/.4);e.style.fontSize=(p.text.length>12?112:150)+'px';e.style.opacity=o;e.style.transform='rotate(-4deg) scale('+(.6+.4*a)+')'});
  TL.emojis.forEach((p,i)=>{const e=$('em'+i),o=clamp((t-p.t0)/.12)*clamp((p.t1-t)/.25),a=back((t-p.t0)/.4);e.style.left=p.x+'px';e.style.top=(p.y+Math.sin(t*4+i)*8)+'px';e.style.fontSize=p.size+'px';e.style.opacity=o;e.style.transform='rotate('+(Math.sin(t*3+i)*8)+'deg) scale('+(.4+.6*a)+')'});
  // stamps (thud at scene start, then gone)
  TL.stamps.forEach((s,i)=>{const e=$('st'+i),u=t-s.t0;if(u<0||u>1.0){e.style.opacity=0;return}
    const k=clamp(u/.2),sc=u<.2?1.8-.8*k*k:(u<.7?1-.03*Math.sin(Math.PI*clamp((u-.2)/.3)):1-.5*clamp((u-.7)/.3));
    e.style.opacity=(u<.1?u/.1:1)*(u>.7?1-(u-.7)/.3:1);e.style.transform='rotate('+(-8+i*5+(u<.2?9*(1-k):0))+'deg) scale('+sc+') translateY('+(u>.7?-(u-.7)/.3*300:0)+'px)'});
  // HUD
  const H=TL.hud,hv=clamp((t-H.t0)/.4)*clamp((H.t1-t)/.3);$('hud').style.opacity=hv;
  const xs=[150,410,670,930];let act=-1;H.starts.forEach((s,i)=>{if(t>=s)act=i});
  xs.forEach((x,i)=>{const e=$('hp'+i);e.style.left=x+'px';const c=$('hc'+i);const on=i===act,done=i<act;c.style.background=on?'#C9A55C':(done?'#1F9E8A':'rgba(255,255,255,.22)');c.style.transform='scale('+(on?1.2:1)+')'});
  let px=150;if(act>=0){const s=H.starts[act];px=act===0?xs[0]:xs[act-1]+(xs[act]-xs[act-1])*sm((t-s)/.7)}$('plane').style.left=(px-30)+'px';
  // captions
  let word='',ws=0;for(const w of TL.words){if(t>=w.t0&&t<w.t0+Math.max(.28,w.t1-w.t0+.08)){word=w.text;ws=w.t0}}
  $('cap').textContent=t<TL.end.t0+.2?word:'';const q=back((t-ws)/.14);$('cap').style.transform='scale('+(.8+.2*q)+')';
  // end
  const E=TL.end.t0;$('end').style.opacity=clamp((t-E)/.4);$('elogo').style.opacity=win(t,E+.3,E+1);const tg=$('etag'),g=win(t,E+1,E+1.6);tg.style.opacity=g;tg.style.transform='translateY('+(1-g)*24+'px)';
}
</script>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = path.resolve(path.dirname(OUT), '_story.html');
  fs.writeFileSync(tmp, html);
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete));
  if (MODE.startsWith('still:')) {
    for (const t of MODE.slice(6).split(',')) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${OUT}_still_${t}.png` }); }
    fs.unlinkSync(tmp); await b.close(); return;
  }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(FPS * DUR);
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  fs.unlinkSync(tmp); await b.close();
})();
