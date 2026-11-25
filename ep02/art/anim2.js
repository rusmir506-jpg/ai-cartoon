// ГИГАНТСКИЕ МУТАНТЫ — серия 2 «Мост». Собрано из ep01/art/anim.js (движок) + scenes2.js (сцены).
// ГИГАНТСКИЕ МУТАНТЫ — серия 1 «Завод». Анимация: renderFrame(t) -> SVG 1080×1920.
// Все действия привязаны к словам озвучки (WORDS из words.js).

const FPS = 30, VW = 1080, VH = 1920;
const VOICE_END = WORDS[WORDS.length - 1].e;
const END = VOICE_END + 2.7;           // финальная заставка
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const norm = w => w.toLowerCase().replace(/[^а-яёa-z]/g, '');

// ---------- время слов ----------
const LINES = [];
WORDS.forEach(w => { (LINES[w.line] = LINES[w.line] || []).push(w); });
// W(строка, кусок слова, номер совпадения) -> время начала слова
function W(line, stem, k = 0, end = false) {
  const m = LINES[line].filter(w => norm(w.w).includes(stem));
  const w = m[Math.min(k, m.length - 1)];
  if (!w) throw new Error('нет слова ' + stem + ' в строке ' + line);
  return end ? w.e : w.s;
}
const LSTART = LINES.map((l, i) => i === 0 ? 0 : l[0].s - 0.12);
const LEND = LINES.map((l, i) => i < LINES.length - 1 ? LSTART[i + 1] : END);

// ---------- эффекты ----------
function rain(t, { n = 150, slant = .28, speed = 2600, len = 70, op = .35, seed = 1, color = '#9fb4c0', w = 2.2 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = hash(seed * 1000 + i) * 1600 - 300, y0 = hash(seed * 2000 + i) * 2200;
    const sp = speed * (.75 + hash(i * 7 + seed) * .5);
    const y = ((y0 + t * sp) % 2200) - 140, x = x0 + y * slant;
    const l = len * (.6 + hash(i * 3) * .8);
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(l * slant).toFixed(1)} ${l.toFixed(1)}" stroke="${color}" stroke-width="${w}" opacity="${(op * (.5 + hash(i) * .5)).toFixed(2)}" stroke-linecap="round"/>`;
  }
  return s;
}
function dust(t, { n = 50, seed = 3, color = '#e8d9a0', op = .35, wind = 30 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = ((hash(seed + i) * 1200 + t * wind * (.5 + hash(i + 9))) % 1200) - 60;
    const y = ((hash(seed * 3 + i) * 2000 - t * 18 * hash(i + 4)) % 2000 + 2000) % 2000;
    s += `<circle cx="${(x + Math.sin(t * 1.3 + i) * 12).toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + hash(i * 5) * 2.5).toFixed(1)}" fill="${color}" opacity="${(op * hash(i * 11)).toFixed(2)}"/>`;
  }
  return s;
}
function embers(t, { n = 40, seed = 5, x0 = 0, x1 = 1080, y = 1500 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const ph = (t * (.4 + hash(i + seed) * .5) + hash(i * 3 + seed)) % 1;
    const x = x0 + hash(i * 7 + seed) * (x1 - x0) + Math.sin(t * 3 + i) * 30 + ph * 80;
    s += `<circle cx="${x.toFixed(1)}" cy="${(y - ph * 900).toFixed(1)}" r="${(2 + hash(i) * 4).toFixed(1)}" fill="${hash(i * 13) > .5 ? PAL.fire0 : PAL.fire1}" opacity="${(1 - ph).toFixed(2)}"/>`;
  }
  return s;
}
function leaves(t, { n = 12, seed = 8, op = .9 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const sp = 700 + hash(i + seed) * 600, ph = hash(i * 5 + seed) * 2000;
    const x = 1200 - ((ph + t * sp) % 1500), y = hash(i * 9 + seed) * 1800 + Math.sin(t * 4 + i) * 60;
    s += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${((t * 400 + i * 50) % 360).toFixed(0)})"><path d="M-14 0 Q0 -10 14 0 Q0 10 -14 0Z" fill="${['#5a3a1c', '#6e4a1a', '#3e2a16'][i % 3]}" opacity="${op}"/></g>`;
  }
  return s;
}
function ripples(t, { n = 22, y0 = 1000, y1 = 1900, seed = 4 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.6 + hash(i + seed)) % 1, k = Math.floor(t * 1.6 + hash(i + seed));
    const x = hash(i * 17 + k * 3 + seed) * 1080, y = y0 + hash(i * 23 + k * 5) * (y1 - y0);
    const sc = .4 + (y - y0) / (y1 - y0);
    s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(ph * 40 * sc).toFixed(1)}" ry="${(ph * 10 * sc).toFixed(1)}" fill="none" stroke="#5f8a94" stroke-width="2" opacity="${(.6 * (1 - ph)).toFixed(2)}"/>`;
  }
  return s;
}
// мерцание лампы: 1 — горит, иногда проседает
function flicker(t, seed = 1, rate = 14) {
  const k = Math.floor(t * rate), h = hash(k * 3.7 + seed);
  if (h > .93) return .15; if (h > .85) return .55; return .9 + .1 * hash(k + seed * 9);
}
function fireWall(t, { x0 = -40, x1 = 1120, y = 1500, h = 420, n = 22, seed = 2 } = {}) {
  let back = '', mid = '', front = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + .5) * (x1 - x0) / n, w = (x1 - x0) / n * 1.6;
    const hh = h * (.6 + .4 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i)) * (.7 + hash(i + seed) * .5);
    const sw = Math.sin(t * 7 + i) * 25;
    const tongue = (k, c) => `<path d="M${x - w / 2 * k} ${y} Q${x - w * .3 * k + sw} ${y - hh * k * .5} ${x + sw * 1.4} ${y - hh * k} Q${x + w * .3 * k + sw} ${y - hh * k * .5} ${x + w / 2 * k} ${y}Z" fill="${c}"/>`;
    back += tongue(1, PAL.fire2); mid += tongue(.72, PAL.fire1); front += tongue(.42, PAL.fire0);
  }
  return `<ellipse cx="${(x0 + x1) / 2}" cy="${y - h * .3}" rx="${(x1 - x0) * .7}" ry="${h * 1.4}" fill="${PAL.fire1}" opacity=".18"/>${back}${mid}${front}<rect x="${x0}" y="${y - 4}" width="${x1 - x0}" height="40" fill="${PAL.fire0}" opacity=".9"/>`;
}
const darkness = (cx, cy, r, op = .94, id = 'hole') => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">
   <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#000" stop-opacity="${op * .35}"/><stop offset="1" stop-color="#030406" stop-opacity="${op}"/></radialGradient>
   <rect x="-500" y="-500" width="2080" height="2920" fill="url(#${id})"/>`;
const tint = (c, op) => `<rect x="-500" y="-500" width="2080" height="2920" fill="${c}" opacity="${op}"/>`;
const SIL = `<filter id="sil" color-interpolation-filters="sRGB"><feFlood flood-color="#04060a"/><feComposite in2="SourceAlpha" operator="in"/></filter>`;
const at = (x, y, s, inner, extra = '') => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})" ${extra}>${inner}</g>`;
const walk = (t, sp = 7, a = 22) => { const s = Math.sin(t * sp); return { legL: a * s, legR: -a * s, armL: 6 - a * .7 * s, armR: -6 + a * .7 * s, bob: Math.abs(Math.cos(t * sp)) * 8 }; };

// ---------- крупный план руки Аси ----------
// hard: 0..1.25 — 0 нет; 1 — до локтя (x=250); >1 — заползает под рукав
function armCloseup(t, hard, { scratch = 1, knock = 0 } = {}) {
  const sx = 690; // царапина
  const reach = hard <= 0 ? 0 : hard <= 1 ? lerp(0, sx - 250, hard) : sx - 250 + (hard - 1) * 600;
  let plates = '';
  if (hard > 0) {
    plates += `<clipPath id="armc"><path d="M250 905 Q600 880 900 925 L900 1075 Q600 1110 250 1095Z"/></clipPath>
      <g clip-path="url(#armc)"><path d="M${sx - reach} 880 Q${sx - reach - 20} 1000 ${sx - reach} 1120 L${sx + reach * .45 + 40} 1120 Q${sx + reach * .45 + 60} 1000 ${sx + reach * .45 + 40} 880Z" fill="${PAL.hard}"/>`;
    for (let x = sx - reach + 10; x < sx + reach * .45 + 30; x += 34) plates += `<path d="M${x} 915 l18 ${30} l-18 ${30} l18 30 l-18 30 l18 30" stroke="${PAL.hardSh}" stroke-width="4" fill="none"/><path d="M${x + 6} 925 l10 18" stroke="${PAL.hardHi}" stroke-width="3"/>`;
    plates += `</g>`;
    if (hard > 1) { // серые прожилки на рукаве выше локтя
      const k = hard - 1;
      for (let i = 0; i < 6; i++) plates += `<path d="M250 ${930 + i * 28} q${-60 * k - i * 8} ${-10 + i * 3} ${-180 * k - i * 20} ${-20 + i * 9}" stroke="${PAL.hardHi}" stroke-width="5" fill="none" opacity=".75"/>`;
    }
  }
  const scr = scratch ? `<path d="M${sx - 20} 945 l50 70 M${sx - 2} 940 l50 70 M${sx + 16} 942 l44 62" stroke="${PAL.red}" stroke-width="7" stroke-linecap="round" opacity=".9"/>` : '';
  const kx = 1000 - knock * 70;
  const knockHand = knock > 0 ? `<g transform="translate(${kx} 820)"><rect x="0" y="-40" width="300" height="90" rx="40" fill="${PAL.parka}"/><circle cx="0" cy="5" r="44" fill="${PAL.skin}"/><path d="M-30 -20 h20 M-34 5 h20 M-30 30 h20" stroke="${PAL.skinSh}" stroke-width="5" stroke-linecap="round"/></g>` : '';
  return `<rect width="1080" height="1920" fill="#0c1014"/>
    <path d="M-100 860 Q100 850 260 890 L260 1110 Q100 1150 -100 1140Z" fill="${PAL.coat}"/>
    <path d="M200 880 Q240 1000 210 1120" stroke="${PAL.coatSh}" stroke-width="16" fill="none"/>
    <path d="M250 905 Q600 880 900 925 L900 1075 Q600 1110 250 1095Z" fill="${PAL.skin}"/>
    <path d="M250 1060 Q600 1090 900 1050" stroke="${PAL.skinSh}" stroke-width="18" fill="none" opacity=".6"/>
    <ellipse cx="960" cy="1000" rx="95" ry="85" fill="${PAL.skin}"/>
    ${[0, 1, 2, 3].map(i => `<rect x="1000" y="${930 + i * 38}" width="110" height="30" rx="15" fill="${PAL.skin}"/>`).join('')}
    ${plates}${scr}${knockHand}`;
}

// ---------- телефон ----------
function phoneBig(state) {
  const body = state === 'loading'
    ? `<text x="0" y="40" fill="#8fb3c4" font-family="Inter" font-size="34" font-weight="700" text-anchor="middle">Поиск…</text>`
    : `<rect x="-200" y="0" width="400" height="120" rx="14" fill="#4a1c1a"/><text x="0" y="80" fill="#ff7a6a" font-family="Inter" font-size="54" text-anchor="middle" font-weight="900">НЕ НАЙДЕН</text>`;
  return `<rect x="-260" y="-470" width="520" height="940" rx="60" fill="#0c0f12" stroke="#3a4650" stroke-width="10"/>
    <rect x="-226" y="-420" width="452" height="840" rx="20" fill="#16242c"/>
    <text x="0" y="-260" fill="#8fb3c4" font-family="Inter" font-size="40" text-anchor="middle" font-weight="700">ЛАБОРАТОРИЯ</text>
    <text x="0" y="-150" fill="#e9e4d8" font-family="Inter" font-size="50" text-anchor="middle" font-weight="900">Образец № 417</text>
    <text x="0" y="-90" fill="#6f8794" font-family="Inter" font-size="30" text-anchor="middle">вода, р. Река, у моста</text>${body}`;
}

// ---------- журнал ----------
function journalBig(t, L) {
  const lines = [[W(L, 'насосы'), 'НАСОСЫ НЕ', 34, PAL.red, 900], [W(L, 'останав'), 'ОСТАНАВЛИВАТЬ.', 34, PAL.red, 900],
    [W(L, 'реагент'), 'Реагент держит', 30, '#3a2e22', 700], [W(L, 'их'), 'их во сне.', 30, '#3a2e22', 700]];
  let txt = '';
  lines.forEach(([tt, s, fs, c, fw], i) => { const k = seg(t, tt - .05, tt + .35);
    txt += `<text x="30" y="${-110 + i * 60 + (i > 1 ? 20 : 0)}" fill="${c === PAL.red ? '#7a1f1a' : c}" font-family="Inter" font-size="${fs}" font-weight="${fw}" font-style="italic" opacity="${k}">${s}</text>`;
    if (k > 0 && k < 1) txt += `<circle cx="${30 + k * 300}" cy="${-118 + i * 60 + (i > 1 ? 20 : 0)}" r="5" fill="#1a120c"/>`; });
  return `<rect x="-380" y="-260" width="760" height="520" rx="12" fill="#6b5f48"/><rect x="-360" y="-240" width="350" height="480" fill="#e3d9c2"/><rect x="10" y="-240" width="350" height="480" fill="#ddd2b8"/>
    <path d="M0 -240 V240" stroke="#8b7d62" stroke-width="10"/>
    ${[...Array(10)].map((_, i) => `<path d="M-340 ${-190 + i * 44} H-30 M30 ${-190 + i * 44} H340" stroke="#b7ab90" stroke-width="2"/>`).join('')}
    <text font-family="Inter" font-size="28" fill="#3a2e22" font-style="italic"><tspan x="-330" y="-170">22.10 — ночь</tspan><tspan x="-330" y="-110">Давление 4,1</tspan><tspan x="-330" y="-50">Реагент — норма</tspan><tspan x="-330" y="10">Насос 3 — шум</tspan><tspan x="-330" y="70">Смена: Орлов,</tspan><tspan x="-330" y="110">Орлова</tspan></text>
    ${txt}`;
}

// ---------- решётка коллектора ----------
function grate(bend, heat) {
  const col = heat > 0 ? `rgb(${(75 + 180 * heat) | 0},${(53 + 80 * heat) | 0},${(36 + 10 * heat) | 0})` : '#4b3524';
  let s = `<g transform="translate(540 960)">`;
  if (heat > .2) s += `<rect x="-320" y="-440" width="640" height="880" fill="${PAL.fire1}" opacity="${(.12 * heat).toFixed(2)}"/>`;
  s += `<rect x="-300" y="-420" width="600" height="840" fill="none" stroke="${col}" stroke-width="22"/>`;
  [-240, -160, -80, 0, 80, 160, 240].forEach((x, i) => {
    const dir = x < 0 ? -1 : x > 0 ? 1 : 0, mid = (i === 2 || i === 3 || i === 4);
    const b = mid ? (x === 0 ? -1 : dir) * bend * (x === 0 ? 150 : 110) : 0;
    s += `<path d="M${x} -420 Q${x + b * 1.6} 0 ${x} 420" stroke="${col}" stroke-width="16" fill="none"/>`;
  });
  [-200, 0, 200].forEach(y => s += `<path d="M-300 ${y} H${-90 + 0} M90 ${y} H300" stroke="${col}" stroke-width="14"/>` + (bend < .3 ? `<path d="M-90 ${y} H90" stroke="${col}" stroke-width="14"/>` : ''));
  return s + `</g>`;
}

// ---------- СЦЕНЫ СЕРИИ 2 «Мост» ----------
const SCENES = [];
const steps = (t, times, dur = .25) => times.reduce((a, tt) => a + (t > tt && t < tt + dur ? 1 - (t - tt) / dur : 0), 0);
const smokeCols = (t, x0, y0, n = 3) => { let s = ''; for (let c = 0; c < n; c++) for (let i = 0; i < 8; i++) { const ph = (t * .25 + i / 8) % 1; s += `<circle cx="${x0 + c * 70 + ph * 160 + Math.sin(t + i) * 12}" cy="${y0 - ph * 520}" r="${30 + ph * 90}" fill="#1a1f22" opacity="${(.7 * (1 - ph)).toFixed(2)}"/>`; } return s; };
function hardArm(len = 700) {
  let s = `<rect x="-42" y="0" width="84" height="${len}" rx="40" fill="${PAL.hard}"/>`;
  for (let y = 40; y < len; y += 38) s += `<path d="M-38 ${y} l38 -20 l38 20" stroke="${PAL.hardSh}" stroke-width="5" fill="none"/><path d="M-22 ${y - 12} l16 -8" stroke="${PAL.hardHi}" stroke-width="4"/>`;
  return s + `<ellipse cx="0" cy="0" rx="58" ry="50" fill="${PAL.hard}"/><path d="M-30 -20 h22 M-34 4 h22 M-30 26 h22" stroke="${PAL.hardSh}" stroke-width="5"/>`;
}
function intakeDoorway(t, inner) {
  return `<rect width="1080" height="1920" fill="#10161a"/>${[...Array(9)].map((_, i) => `<path d="M0 ${200 + i * 190} H1080" stroke="#0c1115" stroke-width="6"/>`).join('')}
    <rect x="220" y="560" width="640" height="1120" fill="#030506"/><rect x="200" y="540" width="680" height="1150" fill="none" stroke="#2a1d16" stroke-width="30"/>
    <clipPath id="dw"><rect x="220" y="560" width="640" height="1120"/></clipPath><g clip-path="url(#dw)">${inner}</g>
    <rect y="1680" width="1080" height="240" fill="#0c1013"/>`;
}

// 0. Он был больше моста... и смотрел на Асю
SCENES[0] = (t, lt, L) => {
  const tLook = W(L, 'смотрел') - .1;
  if (t < tLook) return {
    world: `${bgRiver()}${ripples(t)}<clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540, 1045 + Math.sin(t * 1.5) * 10, .82, giant({ rise: 1 }))}</g>
      <g filter="url(#sil)">${at(250, 1790, .75, nikita({ face: 'scared' }))}${at(360, 1790, .8, asya({ face: 'scared', torch: false }))}</g>`,
    cam: { s: lerp(.9, .98, seg(t, 0, tLook)), x: 540, y: 760 }, shake: 4, fx: rain(t, { op: .45, slant: .3, n: 180 }),
  };
  const look = easeOut(seg(t, W(L, 'асю') - .2, W(L, 'асю') + .4));
  return { world: `<rect width="1080" height="1920" fill="#0a1016"/>${at(540, 900, 1.05, giantHead({ look }))}`,
    cam: { s: 1 + seg(t, tLook, LEND[L]) * .1, x: 540, y: 900 + look * 60 }, fx: rain(t, { op: .4, slant: .3 }) };
};

// 1. Не нападал — принюхивался к руке
SCENES[1] = (t, lt, L) => {
  const tS = W(L, 'принюх'), down = ease(seg(t, LSTART[L], tS + .4));
  const sniff = t > tS ? Math.max(0, Math.sin((t - tS) * 9)) : 0;
  const hy = lerp(150, 520, down);
  return {
    world: `${bgRiver()}${tint('#000', .3)}${at(540, hy, .85, giantHead({ look: 1, sniff }))}
      ${at(560, 1880, 2.3, asya({ face: 'scared', hard: 1, torch: false, pose: { armL: 14 + sniff * 6, head: 6 + sniff * 4, lean: -sniff * 3 } }))}`,
    cam: { s: lerp(1.0, 1.15, seg(t, tS, LEND[L])), x: 540, y: lerp(900, 1150, seg(t, W(L, 'руке') - .4, LEND[L])) }, shake: sniff * 3,
    fx: rain(t, { op: .35, slant: .3 }) + leaves(t, { n: 5 }),
  };
};

// 2. Пока Ася рядом — не уйдёт. Насосы сгорели.
SCENES[2] = (t, lt, L) => {
  const tB = W(L, 'сгорели'), turn = easeOut(seg(t, W(L, 'насосы') - .3, W(L, 'насосы') + .2));
  return {
    world: `${bgRiver()}<ellipse cx="900" cy="980" rx="300" ry="90" fill="${PAL.fire1}" opacity="${.22 + .08 * Math.sin(t * 7)}"/>${smokeCols(t, 800, 960)}
      ${at(lerp(560, 520, turn), 2420, 2.4, nikita({ face: 'tense', pose: { head: lerp(0, 18, turn) } }))}`,
    cam: { s: 1.05 + seg(t, LSTART[L], LEND[L]) * .08, x: lerp(540, 640, turn), y: 1000 }, shake: t > tB && t < tB + .3 ? 6 : 0,
    fx: rain(t, { op: .4, slant: .3 }),
  };
};

// 3. Водозабор под мостом — бежим
SCENES[3] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L] + .2, W(L, 'пацан'))), wk = walk(t, 13, 28), wa = walk(t + .2, 15, 26);
  return {
    world: `${bgUnderBridge()}
      ${at(lerp(1150, 560, k), 1720 + wk.bob, .9, nikita({ face: 'tense', pose: Object.assign(wk, { lean: -8 }) }))}
      ${at(lerp(1300, 700, k), 1720 + wa.bob, .95, asya({ face: 'scared', hard: 1.1, torch: false, pose: Object.assign(wa, { lean: -8 }) }))}`,
    cam: { s: lerp(1, 1.3, ease(seg(t, W(L, 'водозабор') - .3, LEND[L]))), x: lerp(620, 520, k), y: lerp(1100, 1380, k) },
    fx: rain(t, { op: .3, slant: .25, n: 90 }),
  };
};

// 4. Пропуск открыл дверь
SCENES[4] = (t, lt, L) => {
  const tO = W(L, 'открыл'), card = easeOut(seg(t, LSTART[L], tO));
  const door = easeOut(seg(t, W(L, 'дверь'), W(L, 'дверь') + .7));
  return {
    world: `${bgUnderBridge({ door, led: t > tO + .1 ? 'green' : 'red' })}
      <g transform="translate(${lerp(900, 700, card)} ${lerp(1600, 1400, card)}) rotate(${lerp(25, -8, card)}) scale(.55)">${propPass()}<rect x="40" y="40" width="200" height="110" rx="50" fill="${PAL.hard}"/></g>`,
    cam: { s: 2.0, x: 560, y: 1380 }, shake: t > tO && t < tO + .2 ? 5 : 0,
    fx: rain(t, { op: .2, slant: .25, n: 60 }),
  };
};

// 5. Зажигалка — цистерна «РЕАГЕНТ. ЗАПАС»
SCENES[5] = (t, lt, L) => {
  const tR = W(L, 'реагент'), rev = ease(seg(t, W(L, 'цистерн') - .3, tR + .3));
  const fl = 1 + Math.sin(t * 23) * .04 + Math.sin(t * 7) * .05;
  const lx = 220 + 53 * 1.3 * 1.6, ly = 1900 - 600 * 1.3;
  return {
    world: `${bgIntake()}${at(220, 1900, 1.3, nikita({ face: 'tense', lighter: 'on', flame: fl }))}
      ${darkness(lerp(lx, 540, rev), lerp(ly, 700, rev), lerp(300, 900, rev) * fl, .95, 'h5')}${dust(t, { op: .4 })}`,
    cam: { s: lerp(1.3, 1.1, rev), x: lerp(380, 540, rev), y: lerp(1200, 800, rev) },
    fx: '',
  };
};

// 6. Вентиль прикипел — твёрдая рука — повернулся
SCENES[6] = (t, lt, L) => {
  const tS = W(L, 'прикипел'), tG = W(L, 'взялась'), tT = W(L, 'повернулся');
  const grab = easeOut(seg(t, tG - .3, tG + .3));
  const strain = t > tG && t < tT ? Math.sin(t * 40) * 3 : 0;
  const turn = ease(seg(t, tT - .1, tT + 1.2));
  const wh = strain + turn * 200 + (t > tS && t < tG ? Math.sin(t * 30) * 1.5 : 0);
  return {
    world: `${bgIntake({ wheel: wh })}${tint('#000', .35)}
      <g transform="translate(${lerp(-200, 300, grab)} ${lerp(1700, 1330, grab)}) rotate(35)">${hardArm()}</g>
      <circle cx="300" cy="1210" r="300" fill="${PAL.fire0}" opacity=".06"/>${dust(t, { op: .3 })}`,
    cam: { s: 2.1, x: 330, y: 1260 }, shake: Math.abs(strain) * 2 + (t > tT && t < tT + .5 ? 6 : 0),
    fx: '',
  };
};

// 7. Серое ползёт к плечу — растёт
SCENES[7] = (t, lt, L) => {
  const hard = 1 + .45 * easeOut(seg(t, LSTART[L], W(L, 'плечу') + .4)) + .2 * easeOut(seg(t, W(L, 'растёт') - .2, W(L, 'растёт') + .5));
  const fl = 1 + Math.sin(t * 21) * .05;
  return {
    world: `${bgIntake()}${tint('#000', .55)}${at(540, 1620, 3.4, asya({ face: 'scared', hard, torch: false, pose: { armL: 12, head: -4 } }))}
      <circle cx="900" cy="1300" r="${600 * fl}" fill="${PAL.fire0}" opacity=".1"/>${darkness(460, 900, 820 * fl, .85, 'h7')}`,
    cam: { s: lerp(1.05, 1.3, seg(t, LSTART[L], LEND[L])), x: lerp(540, 380, seg(t, LSTART[L], LEND[L])), y: lerp(1000, 880, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .3 }),
  };
};

// 8. Шаги над головой, запах шерсти
SCENES[8] = (t, lt, L) => {
  const tS = W(L, 'шаги'), st = [tS, tS + .55, tS + 1.1, tS + 1.65, tS + 2.2];
  const hit = steps(t, st);
  let fall = '';
  st.forEach((tt, j) => { if (t > tt) for (let i = 0; i < 14; i++) { const d = t - tt; fall += `<circle cx="${180 + hashN(i + j * 31) * 720}" cy="${180 + d * d * 900 + hashN(i * 3) * 40}" r="${2 + hashN(i) * 4}" fill="#8a8a7a" opacity="${Math.max(0, .8 - d * .5).toFixed(2)}"/>`; } });
  const look = easeOut(seg(t, tS - .2, tS + .3));
  return {
    world: `${bgIntake()}${tint('#000', .5)}${fall}
      ${at(380, 1880, 1.5, nikita({ face: 'scared', lighter: 'on', pose: { head: -look * 16 } }))}${at(760, 1880, 1.6, asya({ face: 'scared', hard: 1.65, torch: false, pose: { head: look * 10 } }))}
      ${darkness(560, 1100, 820, .9, 'h8')}`,
    cam: { s: 1.1, x: 560, y: lerp(1250, 900, ease(seg(t, W(L, 'запах') - .2, LEND[L]))) }, shake: hit * 12,
    fx: dust(t, { op: .3 }),
  };
};

// 9. Тварь в дверях — красный шнурок — как у Аси
SCENES[9] = (t, lt, L) => {
  const tA = W(L, 'как'), tL = W(L, 'шнурок');
  if (t > tA - .1) {
    return { world: `<rect width="1080" height="1920" fill="#0b0f12"/><path d="M400 0 L470 840 M680 0 L610 840" stroke="#c23a2e" stroke-width="12"/>${at(540, 960, 2.4, propPass())}${darkness(540, 960, 800, .7, 'h9b')}`,
      cam: { s: 1 + seg(t, tA, LEND[L]) * .1, x: 540, y: 960 }, fx: '' };
  }
  const come = easeOut(seg(t, LSTART[L], LSTART[L] + 1.4));
  const z = ease(seg(t, tL - .4, tL + .4));
  return {
    world: intakeDoorway(t, `${at(lerp(1250, 820, come), 1670, 1.6, mutant({ lanyard: true, mouth: .2, pose: { head: Math.sin(t * 2) * 4 } }))}`),
    cam: { s: lerp(1.1, 2.4, z), x: lerp(540, lerp(1250, 820, come) - 185 * 1.6, z), y: lerp(1150, 1670 - 200 * 1.6, z) }, shake: 3,
    fx: dust(t, { op: .3 }),
  };
};

// 10. Доза по весу — открыл всё
SCENES[10] = (t, lt, L) => {
  const tE = W(L, 'этот') - .1, tO = W(L, 'открыл');
  if (t < tE) return { world: `${bgIntake()}${tint('#000', .55)}${at(540, 2500, 3.2, nikita({ face: 'tense', lighter: 'on', pose: { head: Math.sin(t * 2) * 2 } }))}${darkness(540, 1000, 700, .85, 'h10')}`,
    cam: { s: 1 + seg(t, LSTART[L], tE) * .1, x: 540, y: 960 }, fx: dust(t, { op: .3 }) };
  const lv = [0, .3, .6].map(d => easeOut(seg(t, tO + d, tO + d + .25)));
  const g = lv.map((v, i) => .2 + .75 * easeOut(seg(t, tO + .3 + i * .3, tO + 1.2 + i * .3)) + Math.sin(t * 30 + i) * .02 * v);
  return {
    world: `${bgIntake({ levers: lv, gauges: g, flow: t > tO ? (t - tO) : 0 })}${tint('#000', .25)}`,
    cam: { s: lerp(1.6, 2.0, seg(t, tE, LEND[L])), x: 810, y: 1380 }, shake: steps(t, [tO, tO + .3, tO + .6]) * 9,
    fx: dust(t, { op: .3 }),
  };
};

// 11. Зелёное ушло в реку — гигант оседает
SCENES[11] = (t, lt, L) => {
  const tJ = W(L, 'дёрнулся'), tD = W(L, 'оседать');
  const sink = ease(seg(t, tD - .3, LEND[L] + .3)), jolt = t > tJ && t < tJ + .35 ? Math.sin((t - tJ) * 60) * 30 : 0;
  const plume = seg(t, LSTART[L], tJ + 1);
  let pl = '';
  for (let i = 0; i < 18; i++) { const r = plume * (120 + hashN(i) * 380); pl += `<ellipse cx="${200 + hashN(i * 3) * 700 + Math.sin(t + i) * 20}" cy="${1150 + hashN(i * 5) * 600}" rx="${r.toFixed(0)}" ry="${(r * .25).toFixed(0)}" fill="${PAL.reagent}" opacity=".13"/>`; }
  return {
    world: `${bgRiver()}${ripples(t)}${pl}<clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540 + jolt, 1045 + sink * 1100, .82, giant({ rise: 1, eyes: 1 - sink * .9 }))}</g>${pl}`,
    cam: { s: lerp(1.0, 1.1, seg(t, LSTART[L], LEND[L])), x: 540, y: lerp(850, 1050, sink) }, shake: Math.abs(jolt) * .4 + (t < tD + 2 ? 4 * sink : 0),
    fx: rain(t, { op: .4, slant: .3 }),
  };
};

// 12. Зелёный туман — тварь зашаталась
SCENES[12] = (t, lt, L) => {
  const mist = seg(t, LSTART[L], W(L, 'двери') + .5), sway = seg(t, W(L, 'зашат') - .2, W(L, 'зашат') + .3);
  return {
    world: intakeDoorway(t, `${at(800, 1670, 1.6, mutant({ lanyard: true, mouth: .5, eyes: 1 - sway * .3, pose: { body: Math.sin(t * 3) * 9 * sway, head: Math.sin(t * 2.3) * 10 * sway, fl: sway * 10 } }))}`)
      + greenMist(t, .4 + mist * 1.2, { y0: 600, y1: 1900 }),
    cam: { s: 1.2, x: 560, y: 1250 }, shake: 2,
    fx: greenMist(t + 7, .3 * mist, { y0: 0, y1: 1900 }),
  };
};

// 13. Ася шагнула... «Мама?»
SCENES[13] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L], W(L, 'мама'))), wk = walk(t, 6, 14 * (1 - k)), zoom = ease(seg(t, W(L, 'мама') - .3, LEND[L]));
  return {
    world: `${bgIntake()}${tint('#000', .45)}${greenMist(t, 1.2, { y0: 800, y1: 1900 })}
      ${at(900, 1800, 1.3, mutant({ lanyard: true, mouth: .1, eyes: .7, pose: { head: 14, body: 4 } }), 'transform-origin="0 0"')}
      ${at(lerp(260, 470, k), 1800 + wk.bob, 1.6, asya({ face: 'calm', hard: 1.85, torch: false, pose: Object.assign(wk, { armR: lerp(-14, -70, k) }) }))}`,
    cam: { s: lerp(1.05, 1.9, zoom), x: lerp(560, lerp(260, 470, k), zoom), y: lerp(1300, 1400, zoom) },
    fx: greenMist(t + 3, .3, { y0: 0, y1: 1900 }),
  };
};

// 14. Тварь легла у её ног и уснула
SCENES[14] = (t, lt, L) => {
  const lie = ease(seg(t, W(L, 'легла') - .2, W(L, 'легла') + .9)), sleep = seg(t, W(L, 'уснула') - .1, W(L, 'уснула') + .6);
  return {
    world: `${bgIntake()}${tint('#000', .45)}${greenMist(t, 1, { y0: 900, y1: 1900 })}
      <g transform="translate(820 ${1800 + lie * 90}) rotate(${-lie * 6}) scale(1.3 ${1.3 - lie * .35})">${mutant({ lanyard: true, mouth: 0, eyes: 1 - sleep, pose: { fl: lie * 60, fr: lie * 60, bl: -lie * 50, br: -lie * 50, head: lie * 20 } })}</g>
      ${at(380, 1800, 1.6, asya({ face: 'calm', hard: 1.9, torch: false, pose: { armR: -60, head: 12 } }))}`,
    cam: { s: lerp(1.2, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(560, 700, sleep), y: lerp(1450, 1600, sleep) },
    fx: greenMist(t + 5, .25, { y0: 0, y1: 1900 }),
  };
};

// 15. Серое остановилось у самой шеи
SCENES[15] = (t, lt, L) => {
  const tSt = W(L, 'остановилось'), hard = lerp(1.9, 2, easeOut(seg(t, LSTART[L], tSt))) + (t < tSt ? Math.sin(t * 12) * .02 : 0);
  return {
    world: `${bgIntake()}${tint('#000', .55)}${greenMist(t, .8, { y0: 600, y1: 1900 })}${at(540, 1620, 3.4, asya({ face: 'calm', hard, torch: false, pose: { head: -6 } }))}`,
    cam: { s: lerp(1.3, 1.9, ease(seg(t, LSTART[L], LEND[L]))), x: lerp(480, 470, seg(t, LSTART[L], LEND[L])), y: lerp(900, 780, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .3, color: '#c8ff9e' }),
  };
};

// 16. Телефон: «Образец № 417 нашёлся. Приходите один»
SCENES[16] = (t, lt, L) => {
  const tV = W(L, 'завибрировал'), tA = W(L, 'образец') - .1, tB = W(L, 'один', 0, true);
  const vib = t > tV && t < tA + .3 ? Math.sin(t * 90) * 5 : 0;
  return {
    world: `<rect width="1080" height="1920" fill="#040506"/><g transform="rotate(${vib} 540 960)">${at(540, 960, 1.25, phoneSMS(seg(t, tA, tB), 0))}</g>
      <circle cx="540" cy="900" r="700" fill="#5f8fa8" opacity=".06"/>`,
    cam: { s: lerp(1.0, 1.12, seg(t, LSTART[L], LEND[L])), x: 540, y: 900 }, shake: Math.abs(vib),
    fx: '',
  };
};

// 17. Подпись научного руководителя
SCENES[17] = (t, lt, L) => {
  const sign = seg(t, W(L, 'подпись') - .1, W(L, 'подпись') + .5), z = ease(seg(t, W(L, 'подпись'), W(L, 'руковод') + .8));
  return {
    world: `<rect width="1080" height="1920" fill="#040506"/>${at(540, 960, 1.25, phoneSMS(1, sign))}`,
    cam: { s: lerp(1.12, 2.4, z), x: lerp(540, 540 - 30, z), y: lerp(900, 960 + 1.25 * 0, z) },
    fx: '',
  };
};

const KEY = {
  '#c8ff6e': ['моста', 'смотрел', 'принюх', 'реагент', 'запас', 'туман', 'зелён', 'шерсти', 'уснула', 'тварь', 'гигант'],
  '#ff6a55': ['твёрд', 'сгорели', 'прикипел', 'серое', 'плечу', 'растёт', 'шеи', 'шнурок', 'руководит', 'один', 'нашёлся', 'весу'],
  '#ffa23c': ['зажигалка', 'водозабор', 'открыл', 'вентиль'],
  '#f2c15a': ['асю', 'ася', 'аси', 'мама', 'пропуск', 'дверь', 'подпись'],
};
const EP_LABEL = 'серия 2 · «Мост»';

// ---------- СУБТИТРЫ ----------

const keyColor = w => { const n = norm(w); for (const [c, l] of Object.entries(KEY)) if (l.some(k => n.startsWith(k))) return c; return null; };
// куски по 1–3 слова
const CHUNKS = [];
LINES.forEach((ws, li) => {
  let cur = [];
  const push = () => { if (cur.length) CHUNKS.push({ words: cur, line: li }); cur = []; };
  ws.forEach(w => {
    if (/^[—–-]+$/.test(w.w)) { if (cur.length) cur[cur.length - 1] = Object.assign({}, cur[cur.length - 1], { w: cur[cur.length - 1].w + ' —' }); return; }
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 17)) push();
    cur.push(w);
    if (/[.…!?]$/.test(w.w)) push();
  });
  push();
});
CHUNKS.forEach(c => { c.s = c.words[0].s - .05; });
CHUNKS.forEach((c, i) => { const nx = CHUNKS[i + 1]; c.e = nx ? Math.min(nx.s, c.words[c.words.length - 1].e + .9) : VOICE_END + .8; });

function subtitles(t) {
  const c = CHUNKS.find(c => t >= c.s && t < c.e); if (!c) return '';
  const pop = 1 + .08 * (1 - easeOut(seg(t, c.s, c.s + .18)));
  const clean = w => w.replace(/\.\.\.+|…/g, '').replace(/[«»]/g, '').toUpperCase();
  const txt = c.words.map(w => clean(w.w)).join(' ');
  const fs = Math.min(92, 1220 / Math.max(8, txt.length));
  const spans = c.words.map(w => {
    const said = t >= w.s - .02, now = t >= w.s - .02 && t < w.e + .05, kc = keyColor(w.w);
    const col = kc || '#ffffff';
    return `<tspan fill="${col}" fill-opacity="${said ? 1 : .4}" stroke-opacity="${said ? 1 : .45}">${clean(w.w)}</tspan>`;
  }).join(' ');
  return `<g transform="translate(540 1440) scale(${pop.toFixed(3)})"><text x="0" y="0" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs.toFixed(0)}" letter-spacing="1"
    stroke="#000" stroke-width="${(fs * .2).toFixed(0)}" stroke-linejoin="round" paint-order="stroke">${spans}</text></g>`;
}

// ---------- КАДР ----------
function renderFrame(t) {
  globalThis.__T = t;
  let body = '';
  if (t >= VOICE_END + .9) { // финальная заставка
    const k = seg(t, VOICE_END + .9, VOICE_END + 1.6), fl = flicker(t, 2, 10);
    body = `<rect width="1080" height="1920" fill="#000"/>
      <g opacity="${k}"><text x="540" y="900" fill="${PAL.eye}" font-family="Inter" font-weight="900" font-size="104" text-anchor="middle" opacity="${fl}">ГИГАНТСКИЕ</text>
      <text x="540" y="1010" fill="${PAL.eye}" font-family="Inter" font-weight="900" font-size="104" text-anchor="middle" opacity="${fl}">МУТАНТЫ</text>
      <text x="540" y="1110" fill="#8a98a3" font-family="Inter" font-weight="700" font-size="40" text-anchor="middle">${EP_LABEL}</text>
      <text x="540" y="1250" fill="#e9e4d8" font-family="Inter" font-weight="800" font-size="48" text-anchor="middle" opacity="${seg(t, VOICE_END + 1.4, VOICE_END + 1.8)}">Продолжение следует…</text></g>`;
  } else {
    const L = Math.max(0, LSTART.findIndex((s, i) => t >= s && t < LEND[i]));
    const sc = SCENES[L](t, t - LSTART[L], L);
    const cam = sc.cam || { s: 1, x: 540, y: 960 };
    const sh = (sc.shake || 0) + 3; // лёгкая «ручная камера» всегда
    const dx = (Math.sin(t * 13.1) + Math.sin(t * 7.3)) * sh * .5, dy = (Math.cos(t * 11.7) + Math.sin(t * 5.1)) * sh * .5;
    const cut = 1 - seg(t - LSTART[L], 0, .16);
    body = `<g transform="translate(${(540 + dx).toFixed(1)} ${(960 + dy).toFixed(1)}) rotate(${cam.r || 0}) scale(${cam.s.toFixed(4)}) translate(${(-cam.x).toFixed(1)} ${(-cam.y).toFixed(1)})">${sc.world}</g>
      ${sc.fx || ''}<rect width="1080" height="1920" fill="url(#vignette)"/>
      <rect width="1080" height="1920" fill="#000" opacity="${(cut * .85).toFixed(2)}"/>
      ${t > VOICE_END + .3 ? `<rect width="1080" height="1920" fill="#000" opacity="${seg(t, VOICE_END + .3, VOICE_END + .9)}"/>` : ''}
      ${subtitles(t)}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${defsCommon}<defs>${SIL}</defs><rect width="1080" height="1920" fill="#000"/>${body}</svg>`;
}
