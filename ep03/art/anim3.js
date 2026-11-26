// ГИГАНТСКИЕ МУТАНТЫ — серия 3 «Кафедра». Собрано из ep01/art/anim.js (движок) + scenes3.js (сцены).
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

// ---------- СЦЕНЫ СЕРИИ 3 «Кафедра» ----------
const SCENES = [];
const steps = (t, times, dur = .25) => times.reduce((a, tt) => a + (t > tt && t < tt + dur ? 1 - (t - tt) / dur : 0), 0);
const alarm = (t, t0) => t > t0 ? (Math.sin((t - t0) * 9) > 0 ? .22 : .05) : 0;
const sprinkler = (t, t0) => t > t0 ? rain(t, { n: 140, slant: .02, speed: 2200, op: .45 * seg(t, t0, t0 + .6), color: '#cfe0e6' }) : '';

// 0. Профессор Вершинин учил нас…
SCENES[0] = (t, lt, L) => {
  const z = ease(seg(t, W(L, 'вершинин') - .3, W(L, 'врать')));
  const lie = t > W(L, 'врал') ? flicker(t, 4, 16) : 1;
  return {
    world: `${bgDept()}${tint('#000', .5 - lie * .35)}${dust(t, { op: .3 })}`,
    cam: { s: lerp(1.05, 2.7, z), x: 540, y: lerp(900, 720, z) }, shake: t > W(L, 'врал') && t < W(L, 'врал') + .3 ? 5 : 0,
    fx: '',
  };
};

// 1. Реагент выветрился — серое ползёт по шее
SCENES[1] = (t, lt, L) => {
  const hard = lerp(1.55, 2, easeOut(seg(t, W(L, 'серое') - .2, W(L, 'поползло') + .6)));
  return {
    world: `${bgCourtyard()}${tint('#000', .35)}${at(540, 1640, 3.6, asya({ face: 'scared', hard, torch: false, pose: { head: 6 + Math.sin(t * 2) * 2 } }))}`,
    cam: { s: lerp(1.1, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(520, 470, seg(t, W(L, 'серое'), LEND[L])), y: lerp(900, 780, seg(t, W(L, 'серое'), LEND[L])) },
    fx: leaves(t, { n: 8 }) + dust(t, { op: .25, wind: 120 }),
  };
};

// 2. Пошёл к нему — Асю не бросил
SCENES[2] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L], W(L, 'бросил'))), wk = walk(t, 8, 20 * (1 - seg(t, W(L, 'бросил') - .3, W(L, 'бросил')))), wa = walk(t + .3, 10, 18);
  const look = easeOut(seg(t, W(L, 'одного') - .1, W(L, 'одного') + .3));
  return {
    world: `${bgMedFac()}
      ${at(lerp(900, 470, k), lerp(1900, 1700, k) + wk.bob, lerp(1.1, .75, k), nikita({ face: 'tense', pose: Object.assign(wk, { head: look * 14, armL: -30 * look }) }))}
      ${at(lerp(1050, 610, k), lerp(1900, 1700, k) + wa.bob, lerp(1.2, .85, k), asya({ face: 'calm', hard: 2, torch: false, pose: Object.assign(wa, { armR: -14 }) }))}`,
    cam: { s: lerp(1.1, 1.3, k), x: lerp(640, 540, k), y: lerp(1200, 1400, k) },
    fx: leaves(t, { n: 10 }) + rain(t, { op: .2, slant: .45, n: 70 }),
  };
};

// 3. Через анатомичку — в подвал
SCENES[3] = (t, lt, L) => {
  const k = seg(t, LSTART[L], LEND[L]), fl = flicker(t, 9, 14);
  const st = [0, .5, 1, 1.5, 2, 2.5, 3].map(d => LSTART[L] + .2 + d);
  return {
    world: `${bgCorridor()}${tint('#000', .55 - fl * .35)}
      <g filter="url(#sil)">${at(500, lerp(1920, 1350, k), lerp(1.2, .5, k), nikita({ face: 'calm', pose: walk(t, 8, 16) }))}${at(600, lerp(1920, 1350, k), lerp(1.25, .52, k), asya({ face: 'calm', torch: false, pose: walk(t + .3, 9, 14) }))}</g>`,
    cam: { s: lerp(1.0, 1.5, ease(k)), x: 540, y: lerp(1100, 1000, k) }, shake: steps(t, st, .15) * 4,
    fx: dust(t, { op: .25 }),
  };
};

// 4. Знак завода «Река». Пропуск открыл
SCENES[4] = (t, lt, L) => {
  const tP = W(L, 'пропуск'), tO = W(L, 'открыл'), card = easeOut(seg(t, tP - .3, tO));
  const toReader = ease(seg(t, tP - .5, tP + .2));
  return {
    world: `${bgBasementDoor({ lines: ['', ''], on: t > tO + .1 ? 1 : 0 })}
      <g transform="translate(${lerp(1200, 900, card)} ${lerp(1500, 1120, card)}) rotate(${lerp(25, -8, card)}) scale(.7)">${propPass()}<rect x="40" y="40" width="200" height="110" rx="50" fill="${PAL.skin}"/></g>`,
    cam: { s: lerp(2.2, 1.9, toReader), x: lerp(470, 860, toReader), y: lerp(780, 1080, toReader) }, shake: t > tO && t < tO + .2 ? 6 : 0,
    fx: dust(t, { op: .25 }),
  };
};

// 5. Табло: «Орлов. Доступ: донор»
SCENES[5] = (t, lt, L) => {
  const tO = W(L, 'орлов'), tD = W(L, 'доступ'), tN = W(L, 'донор');
  const l1 = 'ОРЛОВ'.slice(0, Math.round(5 * seg(t, tO, tO + .35)));
  const full = 'ДОСТУП: ДОНОР', l2 = full.slice(0, Math.round(full.length * seg(t, tD, tN + .4)));
  const blink = t > tN + .4 ? (Math.sin(t * 10) > 0 ? 1 : .35) : 1;
  return {
    world: `${bgBasementDoor({ lines: [l1, l2], on: blink })}`,
    cam: { s: lerp(2.3, 2.8, seg(t, LSTART[L], LEND[L])), x: 540, y: 310 },
    fx: '',
  };
};

// 6. Аквариумы — каждая рыба смотрела на нас
SCENES[6] = (t, lt, L) => {
  const look = easeOut(seg(t, W(L, 'смотрела') - .2, W(L, 'смотрела') + .4));
  return {
    world: `${bgLab(t, { look: -look })}`,
    cam: { s: lerp(1.6, 2.0, seg(t, LSTART[L], LEND[L])), x: 340, y: 600 },
    fx: dust(t, { op: .25, color: '#9ec4a0' }),
  };
};

// 7. Профессор ждал — посмотрел на шею Аси
SCENES[7] = (t, lt, L) => {
  const look = easeOut(seg(t, W(L, 'посмотрел') - .1, W(L, 'посмотрел') + .4));
  return {
    world: `${bgLab(t)}${tint('#000', .25)}
      ${at(560, 1720, 1.3, professor({ face: 'cold', pose: { head: look * -12, armR: -20 } }))}
      <g filter="url(#sil)">${at(170, 2050, 1.6, nikita({ face: 'calm' }))}${at(340, 2050, 1.7, asya({ face: 'calm', torch: false }))}</g>`,
    cam: { s: lerp(1.05, 1.35, seg(t, LSTART[L], LEND[L])), x: lerp(540, 460, look), y: lerp(1200, 1150, look) },
    fx: dust(t, { op: .25 }),
  };
};

// 8. «Реагент кончается. Делают из одного человека»
SCENES[8] = (t, lt, L) => {
  const fin = easeOut(seg(t, W(L, 'одного') - .2, W(L, 'одного') + .3));
  return {
    world: `${bgLab(t)}${tint('#000', .45)}${at(540, 2400, 2.7, professor({ face: 'cold', pose: { armR: lerp(-6, -150, fin), head: Math.sin(t) * 2 } }))}`,
    cam: { s: lerp(1, 1.12, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
    fx: dust(t, { op: .25 }),
  };
};

// 9. Отдёрнул штору — мужчина в баке
SCENES[9] = (t, lt, L) => {
  const cur = ease(seg(t, W(L, 'отдёрнул') - .1, W(L, 'штору') + .4)), z = ease(seg(t, W(L, 'мужчина') - .3, W(L, 'глаз') + .3));
  return {
    world: `${bgLab(t, { curtain: cur })}${tint('#000', .2)}`,
    cam: { s: lerp(1.05, 2.2, z), x: lerp(620, 800, z), y: lerp(1000, 900, z) }, shake: t > W(L, 'отдёрнул') && t < W(L, 'отдёрнул') + .3 ? 5 : 0,
    fx: '',
  };
};

// 10. Ася прижалась к стеклу — «Папа»
SCENES[10] = (t, lt, L) => {
  const press = easeOut(seg(t, LSTART[L], W(L, 'прижалась') + .5)), z = ease(seg(t, W(L, 'папа') - .3, LEND[L]));
  return {
    world: `<rect width="1080" height="1920" fill="#0b1012"/>${at(720, 1000, 1.35, fatherInTank(t))}
      ${at(lerp(80, 250, press), 2000, 2.3, asya({ face: 'calm', hard: 2, torch: false, pose: { armR: lerp(-14, -95, press), head: -10 } }))}
      <circle cx="${lerp(380, 470, press)}" cy="${lerp(1300, 1170, press)}" r="20" fill="#fff" opacity="${.12 * press}"/>`,
    cam: { s: lerp(1.05, 1.5, z), x: lerp(560, 520, z), y: lerp(1000, 900, z) },
    fx: dust(t, { op: .25, color: '#9ec4a0' }),
  };
};

// 11. «Его кровь держит их во сне… Потом — она»
SCENES[11] = (t, lt, L) => {
  const turn = easeOut(seg(t, W(L, 'она') - .2, W(L, 'она') + .3));
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .4)}${at(540, 2380, 2.6, professor({ face: 'cold', pose: { head: lerp(0, -20, turn), armR: -20 } }))}${tint(PAL.red, .06 * turn)}`,
    cam: { s: lerp(1.0, 1.15, seg(t, LSTART[L], LEND[L])), x: lerp(540, 470, turn), y: 980 },
    fx: dust(t, { op: .25 }),
  };
};

// 12. Вот кто всё скрывал. Он.
SCENES[12] = (t, lt, L) => {
  const z = t > W(L, 'он', 1) ? easeOut(seg(t, W(L, 'он', 1), W(L, 'он', 1) + .25)) : 0;
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .55)}${at(540, 2500, 3.2, nikita({ face: 'tense', pose: { head: Math.sin(t * 2) * 2 } }))}${darkness(540, 1000, 720, .85, 'h12')}`,
    cam: { s: 1 + seg(t, LSTART[L], LEND[L]) * .08 + z * .25, x: 540, y: 960 + z * 60 }, shake: z > 0 && z < 1 ? 8 : 0,
    fx: '',
  };
};

// 13. При пожаре двери открываются сами — датчик дыма
SCENES[13] = (t, lt, L) => {
  const up = ease(seg(t, W(L, 'пожаре') - .3, W(L, 'двери') + .3));
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .35)}<g transform="translate(540 90) scale(1.2)">${smokeDetector(0)}</g>
      ${at(420, 1900, 1.3, nikita({ face: 'tense', pose: { head: -up * 18 } }))}`,
    cam: { s: lerp(1.1, 2.4, up), x: lerp(480, 540, up), y: lerp(1250, 220, up) },
    fx: dust(t, { op: .25 }),
  };
};

// 14. Щелчок зажигалки. Сирена. Замки щёлкнули.
SCENES[14] = (t, lt, L) => {
  const tC = W(L, 'щелчок'), tD = W(L, 'датчик'), tS = W(L, 'сирена'), tZ = W(L, 'замки');
  const on = t > tC + .25;
  let smoke = '';
  if (on) for (let i = 0; i < 10; i++) { const ph = (t * .6 + i / 10) % 1; smoke += `<circle cx="${540 + Math.sin(t * 2 + i) * 30}" cy="${1150 - ph * 950}" r="${20 + ph * 60}" fill="#9aa3ab" opacity="${(.35 * (1 - ph) * seg(t, tC, tD)).toFixed(2)}"/>`; }
  return {
    world: `<rect width="1080" height="1920" fill="#0b1012"/><g transform="translate(540 160) scale(1.6)">${smokeDetector(t > tD ? (Math.sin(t * 12) > 0 ? 1 : 0) : 0)}</g>
      ${at(540, 1400, 3, propLighter(on))}${smoke}
      ${t > tZ ? `<g>${[0, 1, 2].map(i => `<g transform="translate(${200 + i * 340} 1750) scale(${1 + .3 * Math.max(0, 1 - (t - tZ - i * .12) * 4)})"><rect x="-40" y="-20" width="80" height="60" rx="8" fill="#3a4650"/><path d="M-26 -20 v-20 a26 26 0 0 1 ${t > tZ + i * .12 ? 52 : 52} 0 ${t > tZ + i * .12 ? 'v-12' : 'v20'}" stroke="#9aa3ab" stroke-width="10" fill="none"/></g>`).join('')}</g>` : ''}
      <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, tS)}"/>`,
    cam: { s: 1, x: 540, y: 960 }, shake: (t > tC && t < tC + .2 ? 5 : 0) + steps(t, [tZ, tZ + .12, tZ + .24], .15) * 10,
    fx: sprinkler(t, tS),
  };
};

// 15. Профессор в дверях — Ася отодвинула его твёрдой рукой
SCENES[15] = (t, lt, L) => {
  const tP = W(L, 'отодвинула'), push = ease(seg(t, tP - .1, tP + .6));
  return {
    world: `${bgBasementDoor({ lines: ['ТРЕВОГА', 'ДВЕРИ ОТКРЫТЫ'], on: Math.sin(t * 10) > 0 ? 1 : .4, open: 1 })}
      ${at(lerp(470, 820, push), 1680, 1.5, professor({ face: 'shout', pose: { lean: push * 18, armL: 30, armR: -30 } }))}
      ${at(lerp(160, 330, push), 1980, 2.1, asya({ face: 'calm', hard: 2.15, torch: false, pose: { armL: lerp(10, 120, push), lean: push * -5 } }))}
      <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, LSTART[L] - 1)}"/>`,
    cam: { s: 1.2, x: 520, y: 1300 }, shake: 4 + (push > 0 && push < 1 ? 8 : 0),
    fx: sprinkler(t, LSTART[L] - 1),
  };
};

// 16. «Без неё к ночи проснутся все!»
SCENES[16] = (t, lt, L) => ({
  world: `${bgCorridor()}${tint('#000', .3)}${at(540, 2350, 2.5, professor({ face: 'shout', pose: { armL: 50, armR: -80, lean: Math.sin(t * 6) * 2 } }))}
    <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, LSTART[L] - 1)}"/>`,
  cam: { s: lerp(1.15, 1.0, seg(t, LSTART[L], LEND[L])), x: 540, y: 980 }, shake: 9,
  fx: sprinkler(t, LSTART[L] - 1),
});

// 17. На улице Ася обернулась
SCENES[17] = (t, lt, L) => {
  const turn = easeOut(seg(t, W(L, 'обернулась') - .2, W(L, 'обернулась') + .5));
  return {
    world: `${bgCourtyard()}${at(620, 1820, 1.7, asya({ face: 'calm', hard: 2.2, torch: false, pose: { head: lerp(25, 0, turn), lean: lerp(4, 0, turn) } }))}
      <g filter="url(#sil)">${at(160, 2100, 2, nikita({ face: 'calm' }))}</g>`,
    cam: { s: lerp(1.05, 1.45, ease(seg(t, W(L, 'обернулась'), LEND[L]))), x: lerp(540, 620, turn), y: lerp(1200, 1300, turn) },
    fx: leaves(t, { n: 10 }) + dust(t, { op: .2, wind: 140 }),
  };
};

// 18. Глаза у неё были зелёные… Как у них.
SCENES[18] = (t, lt, L) => {
  const g = easeOut(seg(t, W(L, 'зелёные') - .2, W(L, 'зелёные') + .4));
  return {
    world: `${bgCourtyard()}${tint('#000', .45)}${at(540, 2100, 4.6, asya({ face: 'calm', hard: 2.2, torch: false, green: g }))}
      <circle cx="540" cy="910" r="${500 + Math.sin(t * 3) * 20}" fill="${PAL.eyeGlow}" opacity="${.07 * g}"/>`,
    cam: { s: lerp(1.0, 1.35, ease(seg(t, LSTART[L], LEND[L]))), x: 540, y: lerp(960, 920, seg(t, LSTART[L], LEND[L])) },
    fx: leaves(t, { n: 5 }),
  };
};

const KEY = {
  '#c8ff6e': ['рыба', 'смотрела', 'реагент', 'зелён', 'них', 'сне', 'проснутся', 'аквариум'],
  '#ff6a55': ['врал', 'серое', 'шее', 'шею', 'донор', 'кровь', 'доза', 'она', 'скрывал', 'сирена', 'кончается', 'одного'],
  '#ffa23c': ['зажиг', 'пожаре', 'щелчок', 'вентиль', 'река', 'завода'],
  '#f2c15a': ['асю', 'ася', 'аси', 'папа', 'пропуск', 'орлов', 'вершинин', 'профессор'],
};
const EP_LABEL = 'серия 3 · «Кафедра»';

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
