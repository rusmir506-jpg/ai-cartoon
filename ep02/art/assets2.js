// ГИГАНТСКИЕ МУТАНТЫ — новые рисунки серии 2 «Мост». Подключается после ep01/art/assets.js.

// Морда гиганта крупно. look: -1..1 — куда смотрят зрачки (вниз = 1); eyes: 0..1 — открыты
function giantHead({ look = 0, eyes = 1, sniff = 0, seed = 31 } = {}) {
  const r = rng(seed); let drips = '';
  for (let i = 0; i < 30; i++) { const x = (r() - .5) * 900, y = 100 + r() * 500; drips += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} v${(30 + r() * 120).toFixed(0)}" stroke="${PAL.waterHi}" stroke-width="${(3 + r() * 4).toFixed(1)}" opacity=".6" stroke-linecap="round"/>`; }
  const E = [[-230, -40, 70], [210, -60, 80], [-40, -170, 42], [330, -200, 30], [-360, -190, 26], [40, 40, 24]];
  const nostril = 1 + sniff * .35;
  return `<g class="giantHead">
    ${furBlob(0, 0, 620, 520, { seed, spike: .1, fill: '#0e1011', n: 80, stroke: '#35525a', sw: 10 })}
    ${furStrands(0, 50, 560, 420, { seed: seed + 1, n: 50, color: '#262b2d' })}
    <path d="M-260 300 Q0 520 260 300 Q200 420 0 450 Q-200 420 -260 300Z" fill="#070808"/>
    <ellipse cx="-90" cy="330" rx="${34 * nostril}" ry="${20 * nostril}" fill="#020202"/><ellipse cx="90" cy="330" rx="${34 * nostril}" ry="${20 * nostril}" fill="#020202"/>
    ${E.map(([x, y, s]) => `<circle cx="${x}" cy="${y}" r="${s * 2.6}" fill="${PAL.eyeGlow}" opacity="${.12 * eyes}"/>
      <ellipse cx="${x}" cy="${y}" rx="${s}" ry="${(s * eyes).toFixed(1)}" fill="${PAL.eye}"/>
      <ellipse cx="${x}" cy="${(y + look * s * .45).toFixed(1)}" rx="${(s * .22).toFixed(1)}" ry="${(s * .7 * eyes).toFixed(1)}" fill="#0b0f08"/>`).join('')}
    ${drips}</g>`;
}

// Колесо вентиля. angle — поворот в градусах
function valveWheel(angle = 0) {
  return `<g><rect x="-14" y="0" width="28" height="220" fill="#3a2a22"/>
    <g transform="rotate(${angle})"><circle r="120" fill="none" stroke="#7a2f22" stroke-width="22"/>
    ${[0, 60, 120].map(a => `<path d="M0 0 L${(Math.cos(a * Math.PI / 180) * 120).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 120).toFixed(1)} M0 0 L${(-Math.cos(a * Math.PI / 180) * 120).toFixed(1)} ${(-Math.sin(a * Math.PI / 180) * 120).toFixed(1)}" stroke="#7a2f22" stroke-width="14"/>`).join('')}
    <circle r="26" fill="#4b3524"/>${[...Array(8)].map((_, i) => `<circle cx="${(Math.cos(i) * 110).toFixed(0)}" cy="${(Math.sin(i * 1.7) * 105).toFixed(0)}" r="${5 + i % 3 * 3}" fill="#9a4a24" opacity=".8"/>`).join('')}</g></g>`;
}

// Манометр: v 0..1
function gauge(v = .2) {
  const a = -220 + v * 260;
  return `<g><circle r="60" fill="#d9d3c2" stroke="#3a4650" stroke-width="10"/><path d="M-40 34 A52 52 0 1 1 40 34" fill="none" stroke="#3f8a3a" stroke-width="8"/>
    <path d="M30 40 A52 52 0 0 0 48 10" fill="none" stroke="${PAL.red}" stroke-width="10"/>
    <g transform="rotate(${a.toFixed(1)})"><path d="M0 0 L46 0" stroke="#111" stroke-width="5" stroke-linecap="round"/></g><circle r="7" fill="#111"/></g>`;
}
// Рычаг: down 0..1
function lever(down = 0) {
  return `<g><rect x="-30" y="-10" width="60" height="40" rx="6" fill="#26323a"/><g transform="rotate(${(-40 + down * 80).toFixed(1)})"><rect x="-6" y="-130" width="12" height="130" fill="#5b646c"/><circle cy="-130" r="18" fill="${PAL.red}"/></g></g>`;
}

// Телефон с сообщением. typed 0..1 — сколько проявилось; sign 0..1 — подпись
function phoneSMS(typed = 1, sign = 0) {
  const msg = 'Образец № 417 нашёлся. Приходите один.';
  const n = Math.round(msg.length * typed), a = msg.slice(0, n);
  const l1 = a.slice(0, 23), l2 = a.slice(23);
  return `<rect x="-260" y="-470" width="520" height="940" rx="60" fill="#0c0f12" stroke="#3a4650" stroke-width="10"/>
    <rect x="-226" y="-420" width="452" height="840" rx="20" fill="#121a20"/>
    <text x="0" y="-330" fill="#8fb3c4" font-family="Inter" font-size="34" text-anchor="middle" font-weight="700">Неизвестный номер</text>
    <text x="0" y="-286" fill="#5a6d78" font-family="Inter" font-size="26" text-anchor="middle">03:47</text>
    <rect x="-215" y="-220" width="430" height="${170 + (sign > 0 ? 110 : 0)}" rx="26" fill="#243039"/>
    <text font-family="Inter" font-size="31" font-weight="700" fill="#e9e4d8"><tspan x="-190" y="-160">${l1}</tspan><tspan x="-190" y="-112">${l2}</tspan></text>
    <text x="-176" y="-20" font-family="Inter" font-size="30" font-style="italic" fill="${PAL.eye}" opacity="${sign}">— проф. Г. Л. Вершинин</text>
    <text x="-176" y="16" font-family="Inter" font-size="24" fill="#8a98a3" opacity="${sign}">каф. нормальной физиологии</text>`;
}

// Зелёный туман
function greenMist(t, k = 1, { y0 = 900, y1 = 1900 } = {}) {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const x = (hashN(i * 3.1) * 1400 - 160 + t * 40 * (.5 + hashN(i))) % 1500 - 200, y = y0 + hashN(i * 7.7) * (y1 - y0) + Math.sin(t + i) * 30;
    s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(200 + hashN(i * 5) * 260).toFixed(0)}" ry="${(70 + hashN(i * 9) * 90).toFixed(0)}" fill="${PAL.reagent}" opacity="${(k * .55 * (.08 + hashN(i * 2) * .1)).toFixed(3)}"/>`;
  }
  return s;
}
function hashN(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ---------- ФОНЫ ----------
// F. Под мостом: опора с ржавой дверью водозабора, слева берег, справа река
function bgUnderBridge({ door = 0, led = 'red' } = {}) {
  return `${defsCommon}<rect width="1080" height="1920" fill="url(#sky)"/>${clouds(17, 200)}
  <path d="M0 1050 Q300 1020 600 1060 T1080 1040 V1920 H0Z" fill="url(#river)"/>
  ${cityLights(1040, 13)}
  <rect x="-40" y="0" width="1160" height="330" fill="#0b0f12"/>
  ${[...Array(7)].map((_, i) => `<rect x="${i * 180 - 20}" y="0" width="40" height="360" fill="#080b0d"/>`).join('')}
  <rect x="-40" y="320" width="1160" height="40" fill="#141b20"/>
  ${[...Array(10)].map((_, i) => `<path d="M${i * 120} 360 v${30 + (i % 3) * 25}" stroke="${PAL.waterHi}" stroke-width="4" opacity=".5"/>`).join('')}
  <path d="M240 360 L190 1920 H760 L700 360Z" fill="#1a2126"/>
  <path d="M240 360 L190 1920 H260 L300 360Z" fill="#232c32"/>
  ${[...Array(12)].map((_, i) => `<path d="M${215 + i * 4} ${500 + i * 110} H${735 - i * 3}" stroke="#141a1e" stroke-width="5"/>`).join('')}
  <rect x="360" y="1180" width="240" height="420" fill="#05080a"/>
  <rect x="360" y="1180" width="240" height="420" fill="url(#greenGlow)" opacity="${(door * .8).toFixed(2)}"/>
  <rect x="${360 - door * 220}" y="1180" width="240" height="420" fill="#4b3524" stroke="#2a1d16" stroke-width="10"/>
  <circle cx="${380 - door * 220 + 190}" cy="1400" r="12" fill="#2a1d16"/>
  <text x="${480 - door * 220}" y="1250" fill="#c9a77a" font-family="Inter" font-weight="900" font-size="30" text-anchor="middle" opacity=".7">ВОДОЗАБОР</text>
  <rect x="620" y="1330" width="56" height="90" rx="8" fill="#1d2529"/><circle cx="648" cy="1356" r="9" fill="${led === 'green' ? PAL.reagent : PAL.red}"/><circle cx="648" cy="1356" r="30" fill="${led === 'green' ? PAL.reagent : PAL.red}" opacity=".22"/>
  <path d="M0 1700 Q200 1640 380 1660 L420 1920 H0Z" fill="#0c0f0e"/><path d="M700 1650 Q900 1620 1080 1660 V1920 H760Z" fill="#0a0c0c"/>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// G. Водозабор внутри: цистерна «РЕАГЕНТ. ЗАПАС», вентиль, рычаги, манометры
function bgIntake({ wheel = 0, levers = [0, 0, 0], gauges = [.2, .25, .2], flow = 0 } = {}) {
  return `${defsCommon}<rect width="1080" height="1920" fill="#0a0e11"/>
  ${[...Array(9)].map((_, i) => `<path d="M0 ${200 + i * 190} H1080" stroke="#0e1418" stroke-width="6"/>`).join('')}
  <path d="M-20 160 H1100" stroke="#3d2a20" stroke-width="44"/><path d="M880 160 V560" stroke="#3d2a20" stroke-width="44"/>
  <rect x="80" y="420" width="920" height="560" rx="260" fill="#2a3a33"/><rect x="80" y="420" width="920" height="80" rx="40" fill="#3a4c43" opacity=".6"/>
  ${[260, 540, 820].map(x => `<path d="M${x} 430 V970" stroke="#22302a" stroke-width="10"/>`).join('')}
  <text x="540" y="690" fill="#c9cfa0" font-family="Inter" font-weight="900" font-size="104" text-anchor="middle" letter-spacing="6" opacity=".85">РЕАГЕНТ</text>
  <text x="540" y="810" fill="#c9cfa0" font-family="Inter" font-weight="900" font-size="72" text-anchor="middle" letter-spacing="10" opacity=".75">ЗАПАС</text>
  <path d="M170 700 l30 40 M900 760 l20 30" stroke="#5a3a22" stroke-width="10" opacity=".7"/>
  <path d="M540 980 V1130 H1100" stroke="#3d2a20" stroke-width="56" fill="none"/>
  ${flow > 0 ? `<path d="M540 990 V1130 H1100" stroke="${PAL.reagent}" stroke-width="18" fill="none" opacity="${(.7 * flow).toFixed(2)}" stroke-dasharray="40 30" stroke-dashoffset="${(-flow * 1000).toFixed(0)}"/>` : ''}
  <g transform="translate(300 1210)">${valveWheel(wheel)}</g>
  <rect x="600" y="1220" width="420" height="300" rx="14" fill="#1a2227" stroke="#2c3840" stroke-width="6"/>
  ${gauges.map((v, i) => `<g transform="translate(${680 + i * 130} 1300) scale(.8)">${gauge(v)}</g>`).join('')}
  ${levers.map((d, i) => `<g transform="translate(${680 + i * 130} 1480)">${lever(d)}</g>`).join('')}
  <rect y="1560" width="1080" height="360" fill="#0c1013"/>
  ${[...Array(6)].map((_, i) => `<path d="M0 ${1580 + i * 56} H1080" stroke="#11171b" stroke-width="3"/>`).join('')}
  <rect x="0" y="900" width="110" height="660" fill="#05080a"/>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

if (typeof module !== 'undefined') module.exports = { giantHead, valveWheel, gauge, lever, phoneSMS, greenMist, bgUnderBridge, bgIntake };
