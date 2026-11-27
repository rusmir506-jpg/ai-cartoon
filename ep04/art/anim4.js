// ГИГАНТСКИЕ МУТАНТЫ — серия 4 «Колыбельная». Собрано из ep01/art/anim.js (движок) + scenes4.js (сцены).
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

// ---------- СЦЕНЫ СЕРИИ 4 «Колыбельная» ----------
const SCENES = [];
const dusk = (k = .35) => `<rect x="-500" y="-500" width="2080" height="2920" fill="#0a0d1a" opacity="${k}"/>`;
const momLying = (x, y, lie, sleep, s = 1) => `<g transform="translate(${x} ${y + lie * 60 * s}) rotate(${lie * 6}) scale(${-s} ${s - lie * .3 * s})">${mutant({ lanyard: true, mouth: 0, eyes: 1 - sleep, pose: { fl: lie * 60, fr: lie * 60, bl: -lie * 50, br: -lie * 50, head: lie * 20 } })}</g>`;

// 0. Ася больше не моргала — река зовёт её по имени
SCENES[0] = (t, lt, L) => {
  const call = .4 + .6 * seg(t, W(L, 'река') - .3, W(L, 'имени') + .3);
  const turn = easeOut(seg(t, W(L, 'имени') - .2, W(L, 'имени') + .4));
  return {
    world: `${bgCourtyard()}${dusk(.4)}<g transform="translate(-120 900)">${soundRings(t, call, { max: 900, speed: .6 })}</g>
      ${at(560, 2120, 4.2, asya({ face: 'calm', hard: 2.2, torch: false, green: 1, pose: { head: lerp(0, -14, turn) } }))}`,
    cam: { s: lerp(1.0, 1.25, seg(t, LSTART[L], LEND[L])), x: 540, y: lerp(980, 920, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .2, wind: 30 }),
  };
};

// 1. Ветер стих — скоро стемнеет — проснутся все
SCENES[1] = (t, lt, L) => {
  const dark = seg(t, LSTART[L], LEND[L]), wake = t > W(L, 'проснутся') ? Math.max(0, 1 - (t - W(L, 'проснутся') - .5) / .6) : 0;
  let fall = '';
  for (let i = 0; i < 10; i++) { const ph = clampN((t - LSTART[L]) / 3 - hashN(i) * .4); fall += `<g transform="translate(${100 + hashN(i * 3) * 880 + Math.sin(t * 2 + i) * 30 * (1 - ph)} ${200 + ph * 1500}) rotate(${i * 40 + t * 60 * (1 - ph)})"><path d="M-14 0 Q0 -10 14 0 Q0 10 -14 0Z" fill="#5a3a1c"/></g>`; }
  return {
    world: `${bgRiver()}${ripples(t, { n: 8 })}${dusk(.2 + .4 * dark)}${waterEyes(t, wake * .5)}${fall}`,
    cam: { s: lerp(1.0, 1.1, dark), x: 540, y: 1000 },
    fx: '',
  };
};

// 2. Последняя пробирка
SCENES[2] = (t, lt, L) => {
  const up = easeOut(seg(t, LSTART[L], W(L, 'пробирка') + .3)), pulse = t > W(L, 'профессор') ? .5 + .5 * Math.sin(t * 6) : 0;
  return {
    world: `<rect width="1080" height="1920" fill="#06080b"/><circle cx="540" cy="960" r="${500 + pulse * 80}" fill="${PAL.reagent}" opacity="${.05 + pulse * .05}"/>
      <g transform="translate(540 ${lerp(1900, 1100, up)})">${handHold()}<g transform="translate(0 -230) scale(.9)">${vialBig(1)}</g></g>`,
    cam: { s: lerp(1.0, 1.15, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
    fx: dust(t, { op: .25, color: '#c8ff9e' }),
  };
};

// 3. Выбор: Асе или в реку
SCENES[3] = (t, lt, L) => {
  const toA = ease(seg(t, W(L, 'асе') - .2, W(L, 'асе') + .4)), toR = ease(seg(t, W(L, 'реку') - .2, W(L, 'реку') + .4));
  const vx = 540 - toA * 200 + toR * 400;
  return {
    world: `<clipPath id="lh"><rect x="-500" y="-500" width="1040" height="2920"/></clipPath><clipPath id="rh"><rect x="540" y="-500" width="1500" height="2920"/></clipPath>
      <g clip-path="url(#lh)">${bgCourtyard()}${dusk(.5)}${at(300, 2150, 4, asya({ face: 'calm', hard: 2.25, torch: false, green: 1, pose: { head: -6 } }))}</g>
      <g clip-path="url(#rh)">${bgRiver()}${dusk(.3)}${ripples(t)}</g>
      <path d="M540 0 V1920" stroke="#000" stroke-width="10"/>
      <g transform="translate(${vx} 1000) scale(.8)"><circle r="200" fill="${PAL.reagent}" opacity=".08"/>${vialBig(1)}</g>`,
    cam: { s: 1.0, x: 540, y: 960 },
    fx: '',
  };
};

// 4. «Мама зовёт» — к мосту
SCENES[4] = (t, lt, L) => {
  const k = ease(seg(t, W(L, 'повела') - .3, LEND[L])), wa = walk(t, 9, 20), wn = walk(t + .3, 8, 18);
  return {
    world: `${bgUnderBridge({ door: 1 })}${dusk(.35)}
      ${at(lerp(1000, 520, k), 1740 + wa.bob, .95, asya({ face: 'calm', hard: 2.25, torch: false, green: 1, pose: Object.assign(wa, { armR: -40 }) }))}
      ${at(lerp(1200, 700, k), 1740 + wn.bob, .9, nikita({ face: 'tense', pose: wn }))}`,
    cam: { s: lerp(1.05, 1.3, k), x: lerp(700, 520, k), y: lerp(1250, 1400, k) },
    fx: rain(t, { op: .12, slant: .1, n: 40 }),
  };
};

// 5. В водозаборе пусто — клочья шерсти
SCENES[5] = (t, lt, L) => {
  const pan = ease(seg(t, W(L, 'клочья') - .4, W(L, 'шерсти') + .5)), fl = 1 + Math.sin(t * 21) * .05;
  return {
    world: `${bgIntake()}${furTufts()}${darkness(lerp(600, 500, pan), lerp(1100, 1700, pan), 700 * fl, .92, 'h5')}`,
    cam: { s: lerp(1.1, 1.6, pan), x: lerp(560, 520, pan), y: lerp(1100, 1700, pan) },
    fx: dust(t, { op: .3 }),
  };
};

// 6. Мост скрипит — глаза открываются, десятки
SCENES[6] = (t, lt, L) => {
  const k = seg(t, W(L, 'открывались') - .2, W(L, 'десятки') + .4), cr = t > W(L, 'заскрип') && t < W(L, 'заскрип') + .6;
  return {
    world: `${bgRiver()}${ripples(t)}${dusk(.45)}${waterEyes(t, k)}`,
    cam: { s: lerp(1.0, 1.2, k), x: 540, y: lerp(900, 1300, ease(k)) }, shake: cr ? 7 : 2,
    fx: '',
  };
};

// 7. Зажигалка — огонь их больше не пугал
SCENES[7] = (t, lt, L) => {
  const near = ease(seg(t, W(L, 'пугал') - .3, LEND[L] + .3)), fl = 1 + Math.sin(t * 23) * .05;
  return {
    world: `${bgRiver()}${dusk(.5)}<g transform="translate(540 ${lerp(0, 260, near)}) scale(${lerp(1, 1.35, near)}) translate(-540 0)">${waterEyes(t, 1)}</g>
      ${at(330, 1900, 1.1, nikita({ face: 'scared', lighter: t > W(L, 'щёлкнул') ? 'on' : 'off', flame: fl }))}${at(520, 1900, 1.15, asya({ face: 'calm', hard: 2.25, torch: false, green: 1 }))}`,
    cam: { s: 1.1, x: 540, y: 1350 }, shake: near * 3,
    fx: '',
  };
};

// 8. Из темноты вышла мама — встала между нами и рекой
SCENES[8] = (t, lt, L) => {
  const come = easeOut(seg(t, LSTART[L], W(L, 'встала') + .3));
  return {
    world: `${bgRiver()}${dusk(.5)}${waterEyes(t, 1)}
      ${at(170, 1900, 1.0, nikita({ face: 'scared', lighter: 'on' }))}${at(330, 1900, 1.05, asya({ face: 'calm', hard: 2.25, torch: false, green: 1 }))}
      <g transform="translate(${lerp(-400, 720, come)} 1880) scale(-1 1)">${mutant({ lanyard: true, mouth: .6, pose: { head: Math.sin(t * 2) * 5 } })}</g>`,
    cam: { s: 1.05, x: 520, y: 1400 }, shake: come < 1 ? 3 : 1,
    fx: '',
  };
};

// 9. Ася запела колыбельную
SCENES[9] = (t, lt, L) => {
  const sing = seg(t, W(L, 'запела') - .1, W(L, 'запела') + .5);
  return {
    world: `${bgRiver()}${dusk(.55)}${at(540, 2120, 4.2, asya({ face: sing > 0 ? 'sing' : 'calm', hard: lerp(2.25, 2.4, seg(t, LSTART[L], LEND[L])), torch: false, green: 1 - sing }))}
      <g transform="translate(540 1100)">${soundRings(t, sing, { max: 900, speed: .5 })}</g>`,
    cam: { s: lerp(1.0, 1.2, seg(t, LSTART[L], LEND[L])), x: 540, y: 1000 },
    fx: dust(t, { op: .2, color: '#c8ff9e', wind: 10 }),
  };
};

// 10. Мама легла. Глаза в воде гасли один за другим
SCENES[10] = (t, lt, L) => {
  const lie = ease(seg(t, W(L, 'легла') - .2, W(L, 'легла') + .9)), off = seg(t, W(L, 'гасли') - .2, LEND[L] + .2);
  return {
    world: `${bgRiver()}${dusk(.5)}${waterEyes(t, 1, off)}
      ${momLying(720, 1880, lie, lie, 1)}${at(330, 1900, 1.05, asya({ face: 'sing', hard: 2.45, torch: false }))}<g transform="translate(330 1645)">${soundRings(t, .6, { max: 700, speed: .5 })}</g>`,
    cam: { s: lerp(1.05, 1.2, off), x: lerp(520, 600, off), y: lerp(1400, 1300, off) },
    fx: '',
  };
};

// 11. Не кровь. Голос.
SCENES[11] = (t, lt, L) => {
  const g = seg(t, W(L, 'голос') - .2, W(L, 'голос') + .5);
  return {
    world: `${bgRiver()}${dusk(.6)}${at(540, 2500, 3.2, nikita({ face: 'tense', pose: { head: Math.sin(t * 2) * 2 } }))}
      <g transform="translate(1180 900)">${soundRings(t, .25 + g * .7, { max: 1300, speed: .5 })}</g>`,
    cam: { s: 1 + seg(t, LSTART[L], LEND[L]) * .1 + g * .1, x: 540, y: 960 },
    fx: '',
  };
};

// 12. С каждой строчкой серое ползло по щеке
SCENES[12] = (t, lt, L) => {
  const hard = lerp(2.45, 2.85, ease(seg(t, W(L, 'строчк') - .2, W(L, 'щеке') + .5)));
  return {
    world: `${bgRiver()}${dusk(.6)}${at(560, 2300, 5.2, asya({ face: 'sing', hard, torch: false }))}<g transform="translate(560 1040)">${soundRings(t, .4, { max: 700, speed: .5 })}</g>`,
    cam: { s: lerp(1.1, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(500, 430, seg(t, LSTART[L], LEND[L])), y: lerp(1000, 1060, seg(t, LSTART[L], LEND[L])) },
    fx: '',
  };
};

// 13. Протянул пробирку — покачала головой — вылила в реку
SCENES[13] = (t, lt, L) => {
  const give = easeOut(seg(t, LSTART[L], W(L, 'пробирк') + .3)), shake = t > W(L, 'покачала') && t < W(L, 'покачала') + 1 ? Math.sin((t - W(L, 'покачала')) * 14) * 14 : 0;
  const pour = ease(seg(t, W(L, 'вылила') - .2, W(L, 'вылила') + .6)), flow = seg(t, W(L, 'вылила') + .3, LEND[L]);
  const vx = lerp(1000, 700, give), vy = 1250;
  let stream = '';
  if (flow > 0) { stream = `<path d="M${vx + 120} ${vy - 40} Q${vx + 170} ${vy + 120} ${vx + 150} 1700" stroke="${PAL.reagent}" stroke-width="16" fill="none" opacity="${.8 * (1 - seg(t, LEND[L] - .6, LEND[L]))}" stroke-dasharray="40 20" stroke-dashoffset="${(-t * 400).toFixed(0)}"/>`;
    for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i / 4) % 1; stream += `<ellipse cx="${vx + 150}" cy="1700" rx="${20 + ph * 220}" ry="${6 + ph * 40}" fill="none" stroke="${PAL.reagent}" stroke-width="4" opacity="${(1 - ph) * .7 * flow}"/>`; } }
  return {
    world: `${bgRiver()}${dusk(.55)}${ripples(t)}
      ${at(330, 2080, 2.2, asya({ face: 'calm', hard: 2.85, torch: false, green: .9, pose: { head: shake, armR: lerp(-14, -100, seg(t, W(L, 'вылила') - .6, W(L, 'вылила'))) } }))}
      <g transform="translate(${vx} ${vy}) scale(.7)">${vialBig(1 - pour * .9, pour * 115)}</g>${stream}`,
    cam: { s: 1.05, x: 560, y: 1250 },
    fx: '',
  };
};

// 14. «Чтобы мне не пришлось петь каждую ночь»
SCENES[14] = (t, lt, L) => ({
  world: `${bgRiver()}${dusk(.6)}${at(540, 2120, 4.2, asya({ face: 'calm', hard: 2.85, torch: false, green: .85, pose: { head: 6 + Math.sin(t) * 2 } }))}`,
  cam: { s: lerp(1.05, 1.3, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
  fx: dust(t, { op: .15, wind: 5 }),
});

// 15. Гигант лёг на дно. Река затихла.
SCENES[15] = (t, lt, L) => {
  const sink = ease(seg(t, LSTART[L], W(L, 'дно') + .8)), calm = seg(t, W(L, 'затихла') - .2, LEND[L]);
  return {
    world: `${bgRiver()}${dusk(.45)}${calm < 1 ? ripples(t, { n: Math.round(22 * (1 - calm)) }) : ''}
      <clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540, 1045 + 300 + sink * 1000, .82, giant({ rise: .5, eyes: .3 * (1 - sink) }))}</g>`,
    cam: { s: lerp(1.0, 1.1, calm), x: 540, y: lerp(1000, 1050, calm) }, shake: (1 - sink) * 3,
    fx: '',
  };
};

// 16. На мосту остановились три машины без номеров
SCENES[16] = (t, lt, L) => {
  const arrive = easeOut(seg(t, LSTART[L], W(L, 'остановились') + .5));
  const cars = [330, 560, 790].map((x, i) => `<g transform="translate(${lerp(1400 + i * 260, x, arrive)} 752) scale(.5)">${car(1)}</g>`).join('');
  return {
    world: `${bgRiver()}${dusk(.45)}${ripples(t, { n: 6 })}${cars}`,
    cam: { s: lerp(1.2, 1.8, ease(seg(t, W(L, 'машины') - .3, LEND[L]))), x: lerp(540, 600, arrive), y: lerp(900, 760, arrive) }, shake: arrive < 1 ? 2 : 0,
    fx: '',
  };
};

// 17. Из первой вышел Вершинин и улыбнулся
SCENES[17] = (t, lt, L) => {
  const out = easeOut(seg(t, LSTART[L], W(L, 'вышел') + .6)), smile = ease(seg(t, W(L, 'улыбнулся') - .2, W(L, 'улыбнулся') + .6));
  return {
    world: `<rect width="1080" height="1920" fill="#05070a"/><circle cx="820" cy="760" r="900" fill="#fff6d0" opacity=".14"/><circle cx="820" cy="760" r="300" fill="#fff6d0" opacity=".22"/>
      <g transform="translate(${lerp(980, 540, out)} 2200) scale(2.6)">${professor({ face: 'calm' })}</g>
      <rect x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="${.15 * (1 - smile)}"/>`,
    cam: { s: lerp(1.0, 1.6, smile), x: 540, y: lerp(960, 1150, smile) },
    fx: '',
  };
};

const KEY = {
  '#c8ff6e': ['река', 'реку', 'зовёт', 'проснутся', 'глаза', 'гасли', 'голос', 'запела', 'колыбельн', 'петь', 'гигант', 'шерсти'],
  '#ff6a55': ['серое', 'щеке', 'кровь', 'доза', 'машины', 'номеров', 'улыбнулся', 'пусто'],
  '#ffa23c': ['зажигалк', 'огонь', 'щёлкнул'],
  '#f2c15a': ['ася', 'асе', 'мама', 'пробирк', 'вершинин', 'профессор'],
};
const EP_LABEL = 'серия 4 · «Колыбельная»';

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
