// ГИГАНТСКИЕ МУТАНТЫ — новые рисунки серии 3 «Кафедра». Подключается после ep01/art/assets.js и ep02/art/assets2.js.

const COAT = '#c4c9cc', COATSH = '#959ca1';

// ---------- ПРОФЕССОР ВЕРШИНИН ----------
// face: 'calm' | 'cold' | 'shout'
function professor({ pose = {}, face = 'cold' } = {}) {
  const p = Object.assign({ armL: 6, armR: -6, legL: 0, legR: 0, head: 0, lean: 0 }, pose);
  const leg = (x, a) => `<g transform="${rot(a, x, -170)}"><rect x="${x - 17}" y="-172" width="34" height="160" rx="12" fill="#34373c"/><rect x="${x - 19}" y="-24" width="42" height="24" rx="10" fill="#0f1012"/></g>`;
  const mouth = face === 'shout' ? `<ellipse cx="0" cy="-448" rx="12" ry="14" fill="#2a1210"/>` : face === 'calm' ? `<path d="M-12 -450 q12 6 24 0" stroke="#3a1d1a" stroke-width="4" fill="none" stroke-linecap="round"/>` : `<path d="M-12 -450 h24" stroke="#3a1d1a" stroke-width="4" stroke-linecap="round"/>`;
  const brows = face === 'shout' ? `<path d="M-30 -496 l22 8 M30 -496 l-22 8" stroke="#8d8f90" stroke-width="6" stroke-linecap="round"/>` : `<path d="M-30 -492 l22 2 M30 -492 l-22 2" stroke="#8d8f90" stroke-width="6" stroke-linecap="round"/>`;
  return `<g class="professor" transform="rotate(${p.lean} 0 0)">
    ${leg(-22, p.legL)}${leg(22, p.legR)}
    <g transform="${rot(p.armL, -52, -385)}"><rect x="-74" y="-395" width="40" height="175" rx="16" fill="${COATSH}"/><circle cx="-54" cy="-218" r="15" fill="${PAL.skinSh}"/></g>
    <path d="M-64 -400 Q-70 -280 -74 -120 L74 -120 Q70 -280 64 -400 Q0 -420 -64 -400Z" fill="${COAT}"/>
    <path d="M-20 -404 L0 -330 L20 -404" fill="#2d3540"/><path d="M-6 -390 L0 -330 L6 -390Z" fill="#7a1f1a"/>
    <path d="M0 -330 V-122" stroke="${COATSH}" stroke-width="4"/><rect x="18" y="-330" width="36" height="40" rx="4" fill="${COATSH}"/><path d="M28 -336 v30 M40 -338 v30" stroke="#2d3540" stroke-width="4"/>
    <rect x="-54" y="-300" width="30" height="40" rx="3" fill="#e9e4d8"/><text x="-39" y="-276" fill="#2a3138" font-family="Inter" font-size="9" font-weight="800" text-anchor="middle">ВЕРШ.</text>
    <g transform="${rot(p.head, 0, -410)}">
      <rect x="-14" y="-428" width="28" height="22" fill="${PAL.skinSh}"/>
      <ellipse cx="0" cy="-470" rx="44" ry="52" fill="${PAL.skin}"/>
      <path d="M-44 -470 Q-48 -510 -30 -514 L-30 -478Z M44 -470 Q48 -510 30 -514 L30 -478Z" fill="#9a9c9d"/>
      <path d="M-36 -456 Q-30 -410 0 -404 Q30 -410 36 -456 Q20 -430 0 -432 Q-20 -430 -36 -456Z" fill="#a9abab"/>
      ${brows}
      <circle cx="-17" cy="-476" r="13" fill="#cfe3ea" opacity=".35" stroke="#1d2226" stroke-width="3.5"/><circle cx="17" cy="-476" r="13" fill="#cfe3ea" opacity=".35" stroke="#1d2226" stroke-width="3.5"/><path d="M-4 -476 h8" stroke="#1d2226" stroke-width="3"/>
      <circle cx="-17" cy="-476" r="3.6" fill="#111"/><circle cx="17" cy="-476" r="3.6" fill="#111"/>
      ${mouth}</g>
    <g transform="${rot(p.armR, 52, -385)}"><rect x="34" y="-395" width="40" height="175" rx="16" fill="${COAT}"/><circle cx="54" cy="-218" r="15" fill="${PAL.skin}"/></g>
  </g>`;
}

// ---------- ОТЕЦ В БАКЕ ----------
function fatherInTank(t = 0, { eyes = 0, glow = 1 } = {}) {
  const fy = Math.sin(t * 1.2) * 10;
  let bub = '';
  for (let i = 0; i < 14; i++) { const ph = (t * .4 + hashN(i)) % 1; bub += `<circle cx="${-130 + hashN(i * 3) * 260}" cy="${380 - ph * 900}" r="${4 + hashN(i * 7) * 7}" fill="none" stroke="#bfe8a8" stroke-width="2" opacity="${(1 - ph) * .7}"/>`; }
  let plates = '';
  for (let y = -300; y < 330; y += 34) plates += `<path d="M-58 ${y} l29 -15 l29 15 l29 -15 l29 15" stroke="${PAL.hardSh}" stroke-width="4" fill="none"/>`;
  return `<g>
    <rect x="-200" y="-560" width="400" height="1040" rx="60" fill="#1b3a2a" opacity=".85"/>
    <rect x="-200" y="-560" width="400" height="1040" rx="60" fill="url(#greenGlow)" opacity="${.7 * glow}"/>
    <path d="M-60 -560 v120 M0 -560 v90 M60 -560 v130" stroke="#3a4650" stroke-width="10"/>
    <g transform="translate(0 ${fy})">
      <path d="M-62 -230 Q-80 0 -70 300 L70 300 Q80 0 62 -230 Q0 -250 -62 -230Z" fill="${PAL.hard}"/>${plates}
      <rect x="-104" y="-220" width="34" height="260" rx="16" fill="${PAL.hard}" transform="rotate(8 -88 -220)"/><rect x="70" y="-220" width="34" height="260" rx="16" fill="${PAL.hard}" transform="rotate(-8 88 -220)"/>
      <ellipse cx="0" cy="-300" rx="50" ry="60" fill="${PAL.hard}"/>
      <path d="M-40 -330 Q0 -350 40 -330" stroke="${PAL.hardHi}" stroke-width="4" fill="none"/>
      <path d="M-44 -306 l12 -8 l12 8 l12 -8 l12 8 l12 -8 l12 8 l12 -8" stroke="${PAL.hardSh}" stroke-width="3" fill="none"/>
      ${eyes > 0 ? `<circle cx="-18" cy="-296" r="${8 * eyes}" fill="${PAL.eye}"/><circle cx="18" cy="-296" r="${8 * eyes}" fill="${PAL.eye}"/>` : `<path d="M-28 -294 h18 M10 -294 h18" stroke="#3b444c" stroke-width="4" stroke-linecap="round"/>`}
      <path d="M-30 -250 q30 -6 60 0" stroke="#3b444c" stroke-width="3" fill="none"/>
      <path d="M-36 -330 C-60 -420 -60 -500 -60 -560 M30 -200 C80 -300 60 -480 60 -560" stroke="#b9c7d2" stroke-width="5" fill="none" opacity=".7"/>
    </g>${bub}
    <rect x="-200" y="-560" width="400" height="1040" rx="60" fill="none" stroke="#6b8a8f" stroke-width="12"/>
    <path d="M-150 -480 V400" stroke="#ffffff" stroke-width="14" opacity=".12"/>
    <rect x="-230" y="470" width="460" height="70" rx="10" fill="#26323a"/><rect x="-230" y="-600" width="460" height="60" rx="10" fill="#26323a"/>
  </g>`;
}

// ---------- СТЕНА АКВАРИУМОВ ----------
function aquariumWall(t = 0, look = 0, { cols = 3, rows = 4, w = 300, h = 220 } = {}) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * (w + 24), y = r * (h + 24), i = r * cols + c;
    s += `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="8" fill="#123029"/><rect width="${w}" height="${h}" rx="8" fill="url(#greenGlow)" opacity=".5"/>
      <g transform="translate(${w / 2 + Math.sin(t + i) * 20} ${h / 2 + Math.sin(t * 1.3 + i) * 8}) scale(${i % 2 ? -.7 : .7} .7)">${fish({ watching: true, look: (i % 2 ? -1 : 1) * look })}</g>
      <rect width="${w}" height="${h}" rx="8" fill="none" stroke="#3a4650" stroke-width="10"/><path d="M14 14 h${w * .4}" stroke="#fff" stroke-width="6" opacity=".12"/></g>`;
  }
  return s;
}

function logoReka(sz = 1) {
  return `<g transform="scale(${sz})"><circle r="80" fill="none" stroke="#c9a77a" stroke-width="10"/><path d="M-56 -6 q14 -16 28 0 t28 0 t28 0 t28 0 M-56 24 q14 -16 28 0 t28 0 t28 0 t28 0" stroke="#c9a77a" stroke-width="9" fill="none"/>
    <text y="128" fill="#c9a77a" font-family="Inter" font-weight="900" font-size="36" text-anchor="middle" letter-spacing="3">ЗАВОД «РЕКА»</text></g>`;
}
function display(lines, on = 1, color = PAL.reagent) {
  return `<g><rect x="-200" y="-70" width="400" height="140" rx="10" fill="#050807" stroke="#2c3840" stroke-width="8"/>
    ${lines.map((l, i) => `<text x="0" y="${-12 + i * 44}" fill="${color}" opacity="${on}" font-family="JetBrains Mono" font-weight="800" font-size="34" text-anchor="middle">${l}</text>`).join('')}</g>`;
}
function smokeDetector(led = 0) {
  return `<g><rect x="-70" y="-20" width="140" height="20" fill="#cfd3d5"/><ellipse cx="0" cy="10" rx="80" ry="26" fill="#e3e6e7"/><circle cx="40" cy="14" r="7" fill="${led ? PAL.red : '#555'}"/>${led ? `<circle cx="40" cy="14" r="26" fill="${PAL.red}" opacity=".3"/>` : ''}</g>`;
}

// ---------- ФОНЫ ----------
// H. Коридор кафедры: стенд с портретом профессора, окна с дождём
function bgDept() {
  return `${defsCommon}<rect width="1080" height="1920" fill="#141a1e"/>
  <rect y="1300" width="1080" height="620" fill="#0e1215"/>${[...Array(8)].map((_, i) => `<path d="M0 ${1320 + i * 76} H1080" stroke="#151b1f" stroke-width="3"/>`).join('')}
  <rect y="1200" width="1080" height="100" fill="#26353a"/>
  ${[60, 760].map(x => `<rect x="${x}" y="220" width="260" height="520" fill="url(#sky)" stroke="#2a3338" stroke-width="16"/><path d="M${x + 130} 220 V740 M${x} 480 H${x + 260}" stroke="#2a3338" stroke-width="10"/>`).join('')}
  <rect x="340" y="320" width="400" height="760" rx="6" fill="#1f2a2f" stroke="#3a4650" stroke-width="8"/>
  <text x="540" y="380" fill="#b9c3c8" font-family="Inter" font-weight="900" font-size="26" text-anchor="middle">КАФЕДРА</text>
  <text x="540" y="414" fill="#b9c3c8" font-family="Inter" font-weight="900" font-size="26" text-anchor="middle">НОРМАЛЬНОЙ ФИЗИОЛОГИИ</text>
  <rect x="420" y="450" width="240" height="300" fill="#d9d3c2"/><g transform="translate(540 871) scale(.62)"><clipPath id="portr"><rect x="-194" y="-679" width="388" height="484"/></clipPath><g clip-path="url(#portr)">${professor({ face: 'calm' })}</g></g>
  <text x="540" y="800" fill="#e9e4d8" font-family="Inter" font-weight="800" font-size="28" text-anchor="middle">проф. Г. Л. Вершинин</text>
  <text x="540" y="840" fill="#8a98a3" font-family="Inter" font-size="22" text-anchor="middle">заведующий кафедрой</text>
  ${[0, 1, 2].map(i => `<rect x="${380 + i * 110}" y="900" width="90" height="120" fill="#e3d9c2" opacity=".7"/>`).join('')}
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// I. Медфак снаружи: колонны, вывеска, деревья гнутся, рассвет
function bgMedFac() {
  return `${defsCommon}<defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1118"/><stop offset=".55" stop-color="#253039"/><stop offset=".8" stop-color="#5a4a40"/><stop offset="1" stop-color="#2a2a2c"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#dawn)"/>${clouds(23, 120)}
  <path d="M80 760 L540 560 L1000 760Z" fill="#1d252b"/><rect x="80" y="760" width="920" height="80" fill="#222b31"/>
  <text x="540" y="815" fill="#b9c3c8" font-family="Inter" font-weight="900" font-size="40" text-anchor="middle" letter-spacing="4">МЕДИЦИНСКИЙ ФАКУЛЬТЕТ</text>
  <rect x="80" y="840" width="920" height="700" fill="#1a2227"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${130 + i * 150}" y="840" width="56" height="700" fill="#2a343a"/><rect x="${126 + i * 150}" y="840" width="64" height="26" fill="#323e45"/>`).join('')}
  ${[0, 1, 2, 3, 4].map(i => `<rect x="${206 + i * 150}" y="900" width="60" height="110" fill="#0b1015"/><rect x="${206 + i * 150}" y="1100" width="60" height="110" fill="${i === 3 ? '#d9b66a' : '#0b1015'}" opacity="${i === 3 ? .6 : 1}"/>`).join('')}
  <rect x="470" y="1330" width="140" height="210" fill="#0a0e11"/>
  ${[0, 1, 2, 3].map(i => `<rect x="${380 - i * 30}" y="${1540 + i * 30}" width="${320 + i * 60}" height="30" fill="#2b343a"/>`).join('')}
  <rect y="1660" width="1080" height="260" fill="#111518"/>
  <g fill="#06080a"><path d="M30 1680 L50 1050 L70 1680Z"/><path d="M50 1100 q-80 -40 -120 -100 M50 1160 q70 -80 150 -100 M50 1260 q-60 -30 -110 -40" stroke="#06080a" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M1010 1680 L1020 1150 L1040 1680Z"/><path d="M1022 1200 q-70 -50 -100 -110 M1024 1300 q60 -40 110 -50" stroke="#06080a" stroke-width="9" fill="none" stroke-linecap="round"/></g>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// J. Кафельный коридор анатомички: холодильные дверцы, лампы, в конце — стальная дверь
function bgCorridor() {
  let tiles = '';
  for (let i = 0; i < 12; i++) tiles += `<path d="M0 ${700 + i * 60} L${380 - i * 2} ${820 + i * 30}" stroke="#2a3a3c" stroke-width="2"/><path d="M1080 ${700 + i * 60} L${700 + i * 2} ${820 + i * 30}" stroke="#2a3a3c" stroke-width="2"/>`;
  return `${defsCommon}<rect width="1080" height="1920" fill="#1d2a2b"/>
  <path d="M0 0 H1080 L700 700 H380Z" fill="#141c1d"/><path d="M0 1920 H1080 L700 1200 H380Z" fill="#101718"/>
  <path d="M0 0 L380 700 V1200 L0 1920Z" fill="#223233"/><path d="M1080 0 L700 700 V1200 L1080 1920Z" fill="#1f2e2f"/>${tiles}
  <rect x="380" y="700" width="320" height="500" fill="#0c1112"/><rect x="460" y="800" width="160" height="400" fill="#33414a" stroke="#4a5a66" stroke-width="6"/>
  ${[0, 1, 2].map(r => [0, 1].map(c => `<path d="M${30 + c * 150} ${560 + r * 260 - c * 80} L${150 + c * 130} ${590 + r * 220 - c * 60} L${150 + c * 130} ${780 + r * 200 - c * 60} L${30 + c * 150} ${780 + r * 260 - c * 80}Z" fill="#9aa6a8" stroke="#5b6668" stroke-width="5" opacity=".8"/><circle cx="${130 + c * 130}" cy="${690 + r * 230 - c * 70}" r="8" fill="#4b5658"/>`).join('')).join('')}
  ${[0, 1, 2].map(i => `<rect x="${500 - i * 60}" y="${120 + i * 160}" width="${80 + i * 120}" height="${14 + i * 6}" fill="#e8e6d8" opacity=".85"/>`).join('')}
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// K. Дверь подвала со знаком завода, считыватель и табло
function bgBasementDoor({ lines = ['', ''], on = 0, open = 0 } = {}) {
  return `${defsCommon}<rect width="1080" height="1920" fill="#151c1e"/>
  ${[...Array(20)].map((_, i) => `<path d="M0 ${i * 100} H1080" stroke="#1b2426" stroke-width="3"/><path d="M${(i % 2) * 90} ${i * 100} v100" stroke="#1b2426" stroke-width="3"/>`).join('')}
  <rect x="190" y="420" width="560" height="1260" fill="#030506"/><rect x="190" y="420" width="560" height="1260" fill="url(#greenGlow)" opacity="${open * .9}"/>
  <g transform="translate(${-open * 520} 0)"><rect x="190" y="420" width="560" height="1260" fill="#3a464e" stroke="#252e33" stroke-width="14"/>
    ${[560, 900, 1240].map(y => `<rect x="230" y="${y}" width="480" height="16" fill="#2c363c"/>`).join('')}
    <g transform="translate(470 760)">${logoReka(1.2)}</g>
    <rect x="640" y="1080" width="26" height="140" rx="10" fill="#1e2529"/></g>
  <rect x="800" y="980" width="150" height="230" rx="14" fill="#1d2529" stroke="#3a4650" stroke-width="6"/><circle cx="875" cy="1040" r="18" fill="${on ? PAL.reagent : PAL.red}"/>
  <g transform="translate(540 300)">${display(lines, on)}</g>
  <rect y="1680" width="1080" height="240" fill="#0d1214"/>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// L. Лаборатория: аквариумы слева, стол с банкой № 417, штора справа (curtain 0..1 — отдёрнута)
function bgLab(t = 0, { look = 0, curtain = 0, red = 0 } = {}) {
  return `${defsCommon}<rect width="1080" height="1920" fill="#0b1012"/>
  <g transform="translate(20 260) scale(.62)">${aquariumWall(t, look)}</g>
  <path d="M0 0 H1080" stroke="#26323a" stroke-width="40"/>
  <g transform="translate(800 1020) scale(.62)">${fatherInTank(t)}</g>
  <g transform="translate(${curtain * 300} 0)"><path d="M560 100 H1100 V1500 H560 Q590 1200 560 900 Q590 600 560 100Z" fill="#3a2c34"/>${[620, 720, 820, 920, 1020].map(x => `<path d="M${x} 110 Q${x + 20} 800 ${x} 1490" stroke="#2a1f26" stroke-width="12" fill="none"/>`).join('')}</g>
  <rect x="80" y="1380" width="700" height="40" fill="#3b4248"/><rect x="110" y="1420" width="30" height="300" fill="#2b3036"/><rect x="720" y="1420" width="30" height="300" fill="#2b3036"/>
  <g transform="translate(260 1300)"><rect x="-50" y="-80" width="100" height="160" rx="12" fill="#5a8a8f" opacity=".55" stroke="#b9c7d2" stroke-width="5"/><rect x="-50" y="-30" width="100" height="110" rx="10" fill="${PAL.reagent}" opacity=".35"/><rect x="-36" y="-10" width="72" height="34" fill="#e9e4d8"/><text x="0" y="16" fill="#2a3138" font-family="Inter" font-weight="900" font-size="22" text-anchor="middle">№ 417</text></g>
  <g transform="translate(520 1340)">${[0, 1, 2].map(i => `<rect x="${i * 40}" y="-30" width="14" height="70" rx="4" fill="#c9d3d8" opacity=".6"/>`).join('')}<rect x="120" y="-30" width="14" height="70" rx="4" fill="${PAL.reagent}"/></g>
  <rect y="1720" width="1080" height="200" fill="#0d1214"/>
  ${red ? `<rect width="1080" height="1920" fill="${PAL.red}" opacity="${red}"/>` : ''}
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// M. Двор медфака на рассвете (для финала)
function bgCourtyard() {
  return `${defsCommon}<defs><linearGradient id="dawn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a22"/><stop offset=".6" stop-color="#3a3f44"/><stop offset="1" stop-color="#6a5547"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#dawn2)"/>${clouds(29, 160)}${cityLights(1150, 41)}
  <rect y="1150" width="1080" height="770" fill="#15191c"/>${[...Array(6)].map((_, i) => `<path d="M0 ${1200 + i * 120} H1080" stroke="#1b2024" stroke-width="3"/>`).join('')}
  <path d="M0 1150 H260 V700 H0Z" fill="#1a2227"/>${[0, 1, 2].map(i => `<rect x="40" y="${760 + i * 130}" width="60" height="90" fill="#0b1015"/><rect x="150" y="${760 + i * 130}" width="60" height="90" fill="#0b1015"/>`).join('')}
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

if (typeof module !== 'undefined') module.exports = { professor, fatherInTank, aquariumWall, logoReka, display, smokeDetector, bgDept, bgMedFac, bgCorridor, bgBasementDoor, bgLab, bgCourtyard };
