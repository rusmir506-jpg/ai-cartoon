// ГИГАНТСКИЕ МУТАНТЫ — серия 1 «Завод». Анимация: renderFrame(t) -> SVG 1080×1920.
// Все действия привязаны к словам озвучки (WORDS из words.js).

const FPS = 30, VW = 1080, VH = 1920;
const VOICE_END = WORDS[WORDS.length - 1].e;
const END = VOICE_END + 3.6;           // финальная заставка
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

// ---------- СЦЕНЫ ----------
// Каждая сцена: (t — общее время, lt — время от начала сцены, L — номер строки) -> {world, cam:{s,x,y}, fx (поверх, без камеры), shake}
const SCENES = [];

// 0. Рыба смотрит на тебя
SCENES[0] = (t, lt, L) => {
  const rise = easeOut(seg(t, .15, 1.2)), look = t < W(L, 'смотрит') ? -1 : lerp(-1, 0, easeOut(seg(t, W(L, 'смотрит'), W(L, 'смотрит') + .25)));
  const blink = Math.abs(t - 2.6) < .07 ? 1 : 0;
  const fy = lerp(1500, 980, rise) + Math.sin(t * 2) * 8;
  const pupilGrow = seg(t, W(L, 'тебя'), W(L, 'тебя') + .6);
  return {
    world: `<rect width="1080" height="1920" fill="url(#deep)"/><defs><linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2f36"/><stop offset=".4" stop-color="#0c181c"/><stop offset="1" stop-color="#04080a"/></linearGradient></defs>
      ${[...Array(9)].map((_, i) => `<path d="M${-100 + ((i * 160 + t * 30) % 1300)} 0 L${-300 + ((i * 160 + t * 30) % 1300)} 1920" stroke="#2c4a52" stroke-width="${30 + i % 3 * 20}" opacity=".08"/>`).join('')}
      ${at(560, fy, 3.6, fish({ watching: !blink, look }))}
      <circle cx="${560 - 62 * 3.6 + look * 6 * 3.6}" cy="${fy - 8 * 3.6}" r="${6 * 3.6 * (1 + pupilGrow * .5)}" fill="#050605" opacity="${blink ? 0 : pupilGrow}"/>
      ${ripples(t, { y0: 0, y1: 1920, n: 10 })}${dust(t, { color: '#9ec4cc', op: .5, wind: 10 })}`,
    cam: { s: 1 + t * .05, x: 540, y: 960 + (1 - rise) * 80 },
    fx: rain(t, { n: 60, op: .18 }),
  };
};

// 1. Анализ потерялся
SCENES[1] = (t, lt, L) => {
  const tr = W(L, 'результат') - .1;
  if (t < tr) {
    const k = seg(t, LSTART[L], tr);
    return {
      world: `<g opacity=".55">${bgRiver()}</g>${ripples(t)}
        ${at(540, 2350, 2.5, nikita({ face: 'tense', phone: true, pose: { head: Math.sin(t) * 2 } }))}
        ${at(540 + 53 * 2.5 * 1.6, 2350 - 520 * 2.5, 1, `<circle r="${170 + Math.sin(t * 9) * 6}" fill="#5f8fa8" opacity=".12"/>`)}`,
      cam: { s: 1.05 + k * .12, x: 560, y: 900 }, fx: rain(t, { op: .4, slant: .22 }),
    };
  }
  const lost = t >= W(L, 'потерял');
  const sh = lost ? Math.max(0, 1 - (t - W(L, 'потерял')) / .4) : 0;
  return {
    world: `<rect width="1080" height="1920" fill="#06090c"/>${at(540, 900, 1.25, phoneBig(lost ? 'lost' : 'loading'))}
      ${lost ? `<rect width="1080" height="1920" fill="${PAL.red}" opacity="${(sh * .25).toFixed(2)}"/>` : ''}`,
    cam: { s: 1 + seg(t, tr, LEND[L]) * .08, x: 540, y: 900 }, shake: sh * 14,
    fx: rain(t, { op: .25, slant: .22 }),
  };
};

// 2. Иду на завод через дыру в заборе
SCENES[2] = (t, lt, L) => {
  const t0 = LSTART[L], tHole = W(L, 'дыру'), tGone = W(L, 'детства');
  const k = easeOut(seg(t, t0, tHole));
  const x = lerp(960, 250, k), wk = walk(t, 9, k < 1 ? 24 : 0);
  const duck = seg(t, tHole, tGone), op = 1 - seg(t, tGone - .2, tGone + .4);
  const gust = Math.sin(t * 1.7) * 6;
  return {
    world: `${bgFactory()}
      <g opacity="${op}">${at(x, 1700 + wk.bob * .9 + duck * 40, .95 - duck * .1, nikita({ face: 'tense', pose: Object.assign(wk, { lean: -4 - duck * 28, head: -6 }) }))}</g>
      ${leaves(t, { n: 14 })}<path d="M0 0" />`,
    cam: { s: lerp(1.0, 1.25, ease(seg(t, t0, tGone))), x: lerp(620, 300, ease(seg(t, t0, tGone))), y: lerp(1000, 1350, ease(seg(t, t0, tGone))), r: gust * .15 },
    fx: rain(t, { n: 200, op: .45, slant: .5, speed: 3000 }) + leaves(t + 3, { n: 6, seed: 2 }),
  };
};

// 3. Трубы тёплые
SCENES[3] = (t, lt, L) => {
  const tPipe = W(L, 'трубы'), tWarm = W(L, 'тёпл');
  const hand = easeOut(seg(t, tPipe - .5, tPipe + .2));
  const steam = seg(t, tWarm - .2, tWarm + .8);
  let st = '';
  for (let i = 0; i < 9; i++) { const ph = (t * .7 + i / 9) % 1; st += `<circle cx="${560 + Math.sin(t * 2 + i) * 30 + ph * 60}" cy="${1150 - ph * 420}" r="${20 + ph * 50}" fill="#c9d3d8" opacity="${(.32 * (1 - ph) * (.25 + steam)).toFixed(2)}"/>`; }
  const fl = flicker(t, 3);
  return {
    world: `${bgWorkshop()}${tint('#000', .5 - fl * .25)}
      <g transform="translate(${lerp(1300, 610, hand)} 1150) rotate(-8)"><rect x="0" y="-50" width="520" height="100" rx="45" fill="${PAL.parka}"/><ellipse cx="-10" cy="0" rx="60" ry="52" fill="${PAL.skin}"/>
      ${[0, 1, 2, 3].map(i => `<rect x="-90" y="${-46 + i * 26}" width="80" height="22" rx="11" fill="${PAL.skin}"/>`).join('')}</g>${st}${dust(t, { op: .4 * fl })}`,
    cam: { s: 2.3, x: 590, y: 1120 + Math.sin(t) * 10 },
    fx: '',
  };
};

// 4. У слива рыба спит
SCENES[4] = (t, lt, L) => {
  const tSleep = W(L, 'спит');
  let fishes = '';
  [[300, 1100, 1.4], [760, 950, 1.1], [600, 1400, 1.7], [220, 1650, 1.0], [880, 1550, 1.2]].forEach(([x, y, s], i) =>
    fishes += at(x, y + Math.sin(t * 1.2 + i) * 10, s, fish({ watching: false }), `opacity=".9"`));
  let plume = '';
  for (let i = 0; i < 14; i++) { const ph = (t * .35 + i / 14) % 1; plume += `<circle cx="${130 + ph * 700 + Math.sin(t * 2 + i) * 40}" cy="${520 + ph * 500 + Math.sin(i) * 60}" r="${30 + ph * 140}" fill="${PAL.reagent}" opacity="${(.16 * (1 - ph)).toFixed(2)}"/>`; }
  let bub = '';
  for (let i = 0; i < 24; i++) { const ph = (t * .5 + hash(i)) % 1; bub += `<circle cx="${hash(i * 3) * 1080 + Math.sin(t * 3 + i) * 10}" cy="${1900 - ph * 1700}" r="${3 + hash(i * 7) * 6}" fill="none" stroke="#8fb8c0" stroke-width="2" opacity="${(1 - ph) * .6}"/>`; }
  return {
    world: `<defs><linearGradient id="mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a30"/><stop offset="1" stop-color="#060d0b"/></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#mur)"/>
      <rect x="-60" y="380" width="260" height="260" rx="20" fill="#2a2420"/><circle cx="160" cy="510" r="110" fill="#0a0d0b" stroke="#4b3524" stroke-width="26"/>${plume}${fishes}${bub}`,
    cam: { s: lerp(1, 1.35, ease(seg(t, tSleep - .6, LEND[L]))), x: lerp(540, 600, seg(t, tSleep - .6, LEND[L])), y: lerp(960, 1380, ease(seg(t, tSleep - .6, LEND[L]))) },
    fx: dust(t, { color: '#9ec4a0', op: .4, wind: 8 }),
  };
};

// 5. В цеху — девочка Ася
SCENES[5] = (t, lt, L) => {
  const t0 = LSTART[L], tGirl = W(L, 'девочка'), tAsya = W(L, 'ася'), tPar = W(L, 'родители');
  const reveal = easeOut(seg(t, tGirl - .4, tGirl + .5));
  const beam = seg(t, tAsya, tAsya + .3);
  const fl = 1 + Math.sin(t * 23) * .04 + Math.sin(t * 7) * .05;
  const lx = 330 + 53 * 1.5 * 1.6, ly = 1760 - 600 * 1.5;
  const sad = t > tPar;
  return {
    world: `${bgWorkshop()}
      ${at(330, 1760, 1.5, nikita({ face: 'tense', lighter: 'on', flame: fl, pose: { head: reveal * 8 } }))}
      ${at(790, 1760, 1.6, asya({ face: sad ? 'calm' : 'scared', pose: { armR: lerp(-14, -100, beam), head: sad ? 10 : -6 } }))}
      ${beam > 0 ? `<path d="M${790 + 60} ${1760 - 170 * 1.6} L${330} ${1000} L${330} ${1300}Z" fill="#fff3c4" opacity="${.12 * beam}"/>` : ''}
      ${darkness(lerp(lx, 640, reveal), lerp(ly, 1000, reveal), lerp(260, 820, reveal) * fl, .96, 'h5')}
      ${dust(t, { op: .5 })}`,
    cam: { s: lerp(1.1, sad ? 1.35 : 1.2, ease(seg(t, t0, LEND[L]))), x: lerp(480, 720, ease(seg(t, tGirl, LEND[L]))), y: 1250 },
    fx: '',
  };
};

// 6. Ветер повернул — запах шерсти
SCENES[6] = (t, lt, L) => {
  const tTurn = W(L, 'повернул'), tFur = W(L, 'шерст');
  const sw = Math.sin(t * 5) * 22 * seg(t, tTurn - .2, tTurn + .3);
  const fl = flicker(t, 6, 18);
  const eyes = seg(t, tFur - .1, tFur + .3);
  const head = lerp(0, 24, easeOut(seg(t, tTurn, tTurn + .25)));
  return {
    world: `${bgWorkshop()}${tint('#000', .65 - fl * .35)}
      <g transform="rotate(${sw} 540 0)"><path d="M540 0 V300" stroke="#222" stroke-width="4"/><path d="M500 300 h80 l-20 40 h-40Z" fill="#20272d"/><circle cx="540" cy="345" r="${360 * fl}" fill="url(#lampGlow)" opacity="${.7 * fl}"/></g>
      ${at(360, 1780, 1.6, nikita({ face: 'scared', lighter: 'on', pose: { head } }))}
      ${at(800, 1780, 1.6, asya({ face: 'scared' }))}
      <g opacity="${eyes}">${[[300, 260], [380, 255], [760, 330], [820, 326]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="38" fill="${PAL.eyeGlow}" opacity=".2"/><circle cx="${x}" cy="${y}" r="${i < 2 ? 15 : 11}" fill="${PAL.eye}"/><ellipse cx="${x}" cy="${y}" rx="3" ry="11" fill="#111"/>`).join('')}</g>
      ${leaves(t, { n: 8, op: .7 })}`,
    cam: { s: lerp(1.05, 1.2, seg(t, tTurn, LEND[L])), x: 560, y: lerp(1150, 800, ease(seg(t, tFur - .1, tFur + .5))) },
    fx: dust(t, { wind: 220, op: .5, n: 70 }),
  };
};

// 7. Оно спрыгнуло. Коготь задел руку.
SCENES[7] = (t, lt, L) => {
  const tJump = W(L, 'спрыгн'), tClaw = W(L, 'коготь'), tHand = W(L, 'руку');
  const j = easeOut(seg(t, tJump - .1, tJump + .45));
  const slash = seg(t, tClaw, tClaw + .25), slashOp = t > tClaw ? Math.max(0, 1 - (t - tClaw - .15) / .5) : 0;
  const flash = t > tClaw && t < tClaw + .08 ? .6 : 0;
  const fl = flicker(t, 7, 20);
  return {
    world: `${bgWorkshop()}${tint('#000', .55 - fl * .3)}
      ${at(780, 1780, 1.7, asya({ face: 'scared', scratch: t > tHand, pose: { armL: t > tClaw ? 40 : 10, lean: t > tClaw ? 6 : 0 } }))}
      ${at(lerp(560, 430, j), lerp(200, 1640, j), lerp(.7, 1.15, j), mutant({ mouth: .4 + .6 * j, pose: { fl: -50 + 30 * j, fr: -40 + 30 * j, bl: 30, br: 40, body: -20 + 14 * j, head: -10 } }), `transform-origin="0 0"`)}
      <g opacity="${slashOp}">${[0, 1, 2].map(i => `<path d="M${180 + i * 60} ${1000 + i * 40} Q600 ${1150 + i * 40} ${lerp(200, 1000, slash)} ${1500 + i * 30}" stroke="#f3efe6" stroke-width="${14 - i * 3}" fill="none" stroke-linecap="round"/>`).join('')}</g>
      <rect x="-500" y="-500" width="2080" height="2920" fill="#fff" opacity="${flash}"/>`,
    cam: { s: 1.15, x: 600, y: 1200 }, shake: (t > tJump && t < tJump + .5 ? 18 : 0) + (t > tClaw && t < tClaw + .4 ? 26 : 0),
    fx: dust(t, { op: .3 }),
  };
};

// 8. Кожа становится твёрдой; «на медфаке такого не показывают»
SCENES[8] = (t, lt, L) => {
  const tSkin = W(L, 'кожа'), tHard = W(L, 'твёрд'), tNail = W(L, 'ноготь'), tMed = W(L, 'медфаке') - .15;
  if (t < tMed) {
    const hard = lerp(0, .28, easeOut(seg(t, tSkin, tHard + .5)));
    const kn = t > tNail ? Math.abs(Math.sin((t - tNail) * 14)) * (t < tNail + .5 ? 1 : 0) : 0;
    const knock = t > tNail - .3 ? .4 + kn * .6 : 0;
    return { world: armCloseup(t, hard, { knock }) + `<circle cx="600" cy="1000" r="600" fill="url(#lampGlow)" opacity=".18"/>`,
      cam: { s: 1.1 + seg(t, LSTART[L], tMed) * .2, x: 640, y: 1000 }, shake: kn * 5, fx: dust(t, { op: .3 }) };
  }
  return {
    world: `${bgWorkshop()}${tint('#000', .6)}${at(540, 2500, 3.2, nikita({ face: 'tense', pose: { head: Math.sin(t * 2) * 3 } }))}${darkness(540, 1000, 700, .9, 'h8')}`,
    cam: { s: 1 + seg(t, tMed, LEND[L]) * .1, x: 540, y: 960 }, fx: dust(t, { op: .4 }),
  };
};

// 9. Папин пропуск открыл дверь
SCENES[9] = (t, lt, L) => {
  const tOpen = W(L, 'открыл'), tDoor = W(L, 'пультов');
  const card = easeOut(seg(t, LSTART[L], tOpen));
  const ok = t > tOpen + .1, door = easeOut(seg(t, tOpen + .2, tDoor + .5));
  return {
    world: `<rect width="1080" height="1920" fill="#10161a"/>
      <rect x="160" y="300" width="560" height="1500" fill="#05080a"/><rect x="160" y="300" width="560" height="1500" fill="url(#greenGlow)" opacity="${door * .9}"/>
      <rect x="${160 - door * 520}" y="300" width="560" height="1500" fill="#26323a" stroke="#33424c" stroke-width="10"/>
      <rect x="${200 - door * 520}" y="700" width="480" height="20" fill="#1a2329"/><text x="${440 - door * 520}" y="560" fill="#5a6a74" font-family="Inter" font-weight="900" font-size="56" text-anchor="middle">ПУЛЬТОВАЯ</text>
      <rect x="790" y="880" width="170" height="260" rx="16" fill="#1d2529" stroke="#3a4650" stroke-width="6"/><circle cx="875" cy="940" r="20" fill="${ok ? PAL.reagent : PAL.red}"/><circle cx="875" cy="940" r="60" fill="${ok ? PAL.reagent : PAL.red}" opacity=".2"/>
      <g transform="translate(${lerp(1300, 880, card)} ${lerp(1500, 1060, card)}) rotate(${lerp(30, -6, card)})">${at(0, 0, 1.2, propPass())}<rect x="40" y="40" width="200" height="110" rx="50" fill="${PAL.skin}"/></g>`,
    cam: { s: 1.15, x: 640, y: 1000 }, shake: t > tOpen && t < tOpen + .2 ? 6 : 0,
    fx: dust(t, { op: .3 }),
  };
};

// 10. Журнал смены
SCENES[10] = (t, lt, L) => {
  const fl = 1 + Math.sin(t * 19) * .05;
  return {
    world: `<rect width="1080" height="1920" fill="#0b0f12"/>${at(540, 980, 1.35, journalBig(t, L))}
      <circle cx="900" cy="1500" r="${700 * fl}" fill="${PAL.fire0}" opacity=".1"/>${darkness(700, 1050, 900 * fl, .8, 'h10')}`,
    cam: { s: lerp(1.2, 1.45, seg(t, LSTART[L], LEND[L])), x: lerp(560, 780, ease(seg(t, LSTART[L], LEND[L]))), y: 960 + Math.sin(t * 40) * 2 },
    fx: dust(t, { op: .35 }),
  };
};

// 11. Завод прячет город от них
SCENES[11] = (t, lt, L) => {
  const tCity = W(L, 'он'), pull = ease(seg(t, tCity - .3, tCity + 1.6));
  const tw = t > W(L, 'город', 1) ? .5 + .5 * Math.sin(t * 12) : 0;
  return {
    world: `${bgControl()}<rect x="149" y="269" width="782" height="422" fill="#d9b66a" opacity="${tw * .08}"/>
      <g filter="url(#sil)">${at(430, 1900, 1.5, nikita({ face: 'calm' }))}${at(680, 1900, 1.55, asya({ face: 'calm', torch: false }))}</g>
      ${dust(t, { op: .3 })}`,
    cam: { s: lerp(2.0, 1.0, pull), x: lerp(540, 540, pull), y: lerp(480, 960, pull) },
    fx: '',
  };
};

// 12. Шорох шерсти, бензин под ногами
SCENES[12] = (t, lt, L) => {
  const tRust = W(L, 'шорох'), tGas = W(L, 'бензин');
  const eyes = seg(t, tRust - .1, tRust + .3), tilt = ease(seg(t, tGas - .4, tGas + .3));
  const sheen = (t * 60) % 360;
  return {
    world: `${bgControl()}${tint('#000', .45)}
      <rect x="0" y="1180" width="150" height="500" fill="#020304"/>
      <g opacity="${eyes}"><circle cx="60" cy="1330" r="40" fill="${PAL.eyeGlow}" opacity=".2"/><circle cx="50" cy="1330" r="13" fill="${PAL.eye}"/><circle cx="100" cy="1326" r="11" fill="${PAL.eye}"/></g>
      <ellipse cx="740" cy="1690" rx="300" ry="44" fill="#2a2416" opacity=".95"/>
      <ellipse cx="${700 + Math.sin(t * 2) * 40}" cy="1685" rx="180" ry="18" fill="hsl(${sheen},60%,50%)" opacity=".22"/>
      <ellipse cx="${790 + Math.cos(t * 2) * 30}" cy="1695" rx="110" ry="10" fill="hsl(${(sheen + 120) % 360},60%,55%)" opacity=".2"/>
      <path d="M860 1600 q10 30 -40 70" stroke="#5a4a2a" stroke-width="8" fill="none"/>
      ${at(420, 1900, 1.2, nikita({ face: 'scared', lighter: 'on', pose: { head: -20 } }))}`,
    cam: { s: lerp(1.4, 1.8, tilt), x: lerp(260, 700, tilt), y: lerp(1350, 1640, tilt) }, shake: t > tRust && t < tRust + .3 ? 6 : 0,
    fx: dust(t, { op: .3 }),
  };
};

// 13. Щелчок зажигалки — огонь стеной
SCENES[13] = (t, lt, L) => {
  const tClick = W(L, 'щелч'), tFire = W(L, 'огонь');
  if (t < tFire - .1) {
    const on = t > W(L, 'зажиг');
    const spark = t > tClick + .25 && t < tClick + .45;
    return {
      world: `<rect width="1080" height="1920" fill="#050608"/>${at(540, 1150, 4, propLighter(on))}
        ${spark ? `<g fill="${PAL.fire0}">${[...Array(10)].map((_, i) => `<circle cx="${540 + Math.cos(i) * 80 * hash(i)}" cy="${930 - hash(i * 3) * 120}" r="6"/>`).join('')}</g>` : ''}
        ${on ? `<circle cx="540" cy="700" r="${520 + Math.sin(t * 20) * 20}" fill="${PAL.fire0}" opacity=".12"/>` : ''}`,
      cam: { s: 1.1, x: 540, y: 1000 }, shake: spark ? 8 : 0, fx: '',
    };
  }
  const up = easeOut(seg(t, tFire, tFire + .5));
  const recoil = easeOut(seg(t, tFire + .2, tFire + .8));
  return {
    world: `${bgControl()}${tint('#000', .4)}
      ${at(lerp(420, 640, recoil), 1560, .8, mutant({ mouth: 1, pose: { head: -20 + recoil * 30, body: recoil * 10 } }), '')}
      ${fireWall(t, { y: 1640, h: 620 * up })}
      ${at(320, 2050, 1.4, nikita({ face: 'scared', lighter: 'on', pose: { lean: -4 } }))}${at(760, 2050, 1.5, asya({ face: 'scared' }))}
      ${tint(PAL.fire1, .1 + .05 * Math.sin(t * 13))}${embers(t, { y: 1640 })}`,
    cam: { s: 1.1, x: 540, y: 1250 }, shake: t < tFire + .5 ? 16 : 3,
    fx: '',
  };
};

// 14. Ася отогнула решётку
SCENES[14] = (t, lt, L) => {
  const tStuck = W(L, 'заклин'), tBend = W(L, 'отогнула'), tCalm = W(L, 'поморщ');
  const bend = easeOut(seg(t, tBend, tBend + .9));
  const pull = Math.sin(t * 30) * (t > tStuck && t < tBend ? 3 : 0);
  return {
    world: `${bgCollector()}${grate(bend, .8 + .2 * Math.sin(t * 5))}
      <rect x="-500" y="1500" width="2080" height="900" fill="${PAL.fire1}" opacity="${.12 + .05 * Math.sin(t * 9)}"/>
      ${at(540 + pull, 1880, 2.1, asya({ face: t > tCalm - .3 ? 'calm' : 'scared', hard: .45, torch: false, pose: { armL: 150 - bend * 20, armR: -150 + bend * 20, head: 0 } }), '')}
      ${at(160, 2100, 1.6, nikita({ face: 'scared', lighter: 'on' }))}
      ${embers(t, { y: 2000, n: 30 })}`,
    cam: { s: lerp(1.05, 1.25, seg(t, LSTART[L], LEND[L])), x: 540, y: lerp(1100, 1250, seg(t, tCalm - .3, LEND[L])) }, shake: t > tBend && t < tBend + .6 ? 7 : 0,
    fx: '',
  };
};

// 15. Насосы замолкают
SCENES[15] = (t, lt, L) => {
  const offs = [W(L, 'один'), W(L, 'другим'), W(L, 'замолк')];
  let leds = '';
  [180, 540, 900].forEach((x, i) => { const off = t > offs[i]; leds += `<circle cx="${x + 70}" cy="870" r="13" fill="${off ? '#2a0f0d' : PAL.reagent}"/>${off ? '' : `<circle cx="${x + 70}" cy="870" r="44" fill="url(#greenGlow)"/>`}${t > offs[i] && t < offs[i] + .15 ? `<circle cx="${x + 70}" cy="870" r="80" fill="#fff" opacity=".4"/>` : ''}`; });
  const spin = i => t < offs[i] ? t * 400 : offs[i] * 400 + (1 - Math.exp(-(t - offs[i]) * 3)) * 120;
  let rotors = '';
  [180, 540, 900].forEach((x, i) => rotors += `<g transform="rotate(${spin(i)} ${x} 980)"><path d="M${x - 60} 980 H${x + 60} M${x} 920 V1040" stroke="#4a5a66" stroke-width="12"/></g>`);
  let smoke = '';
  for (let i = 0; i < 12; i++) { const ph = (t * .3 + i / 12) % 1; smoke += `<circle cx="${hash(i) * 1080 + ph * 100}" cy="${1300 - ph * 900}" r="${80 + ph * 200}" fill="#15191c" opacity="${(.5 * (1 - ph)).toFixed(2)}"/>`; }
  return {
    world: `${bgControl()}${tint('#000', .3)}${leds}${rotors}${smoke}${fireWall(t, { y: 1500, h: 520 })}${tint(PAL.fire1, .1)}${embers(t, { y: 1500 })}`,
    cam: { s: 1.35, x: 540, y: lerp(1000, 1080, seg(t, LSTART[L], LEND[L])) }, shake: offs.some(o => t > o && t < o + .2) ? 8 : 2,
    fx: '',
  };
};

// 16. Твёрдое у локтя — ползёт выше
SCENES[16] = (t, lt, L) => {
  const tElbow = W(L, 'локтя'), tUp = W(L, 'выше');
  const hard = lerp(.7, 1, easeOut(seg(t, LSTART[L], tElbow + .3))) + .5 * easeOut(seg(t, tUp - .3, LEND[L]));
  const fl = 1 + Math.sin(t * 21) * .05;
  return {
    world: armCloseup(t, hard) + `<circle cx="900" cy="1300" r="${500 * fl}" fill="${PAL.fire0}" opacity=".12"/>` + darkness(560, 1000, 760 * fl, .85, 'h16'),
    cam: { s: lerp(1.2, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(620, 300, ease(seg(t, tUp - .5, LEND[L]))), y: 1000 },
    fx: dust(t, { op: .3 }),
  };
};

// 17. Вышли к реке — рыба не спит
SCENES[17] = (t, lt, L) => {
  const tWake = W(L, 'спала') - .2;
  let eyes = '';
  for (let i = 0; i < 46; i++) {
    const x = hash(i * 3.3) * 1040 + 20, y = 1050 + hash(i * 7.1) * 620, s = .5 + (y - 1050) / 620;
    const o = seg(t, tWake + hash(i) * .6, tWake + hash(i) * .6 + .15);
    eyes += `<g transform="translate(${x.toFixed(0)} ${(y + Math.sin(t * 2 + i) * 4).toFixed(0)}) scale(${s.toFixed(2)})"><circle r="26" fill="${PAL.eyeGlow}" opacity="${(o * .18).toFixed(2)}"/><ellipse rx="11" ry="${(11 * o).toFixed(1)}" fill="${PAL.eye}" opacity="${o}"/><ellipse rx="2.5" ry="${(8 * o).toFixed(1)}" fill="#0b0f08"/></g>`;
  }
  return {
    world: `${bgRiver()}${ripples(t)}${eyes}
      <g filter="url(#sil)">${at(250, 1790, .75, nikita({ face: 'calm', pose: { head: 10 } }))}${at(360, 1790, .8, asya({ face: 'calm', torch: false }))}</g>`,
    cam: { s: lerp(1.25, 1.05, ease(seg(t, LSTART[L], LEND[L]))), x: 540, y: lerp(1450, 1200, ease(seg(t, LSTART[L], LEND[L]))) },
    fx: rain(t, { op: .4, slant: .3 }),
  };
};

// 18. В реке поднималось что-то. Больше моста.
SCENES[18] = (t, lt, L) => {
  const t0 = LSTART[L], tBig = W(L, 'больше');
  const rise = ease(seg(t, t0 + .3, tBig + .8));
  const eyes = seg(t, W(L, 'моста') - .1, W(L, 'моста') + .3);
  const quake = t > t0 + .3 && t < tBig + 1.2 ? 6 + 8 * seg(t, t0, tBig) : 0;
  let foam = '';
  for (let i = 0; i < 20; i++) { const x = -620 + i * 65 + Math.sin(t * 3 + i) * 20; foam += `<ellipse cx="${540 + x}" cy="${1040 + Math.sin(t * 5 + i) * 8}" rx="${40 + hash(i) * 40}" ry="12" fill="#5f8a94" opacity="${.5 * rise}"/>`; }
  return {
    world: `${bgRiver()}${ripples(t)}
      <clipPath id="abovewater"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#abovewater)">${at(540, 1045 + (1 - rise) * 200, .82, giant({ rise: lerp(.08, 1, rise), eyes }))}</g>
      ${foam}
      <g filter="url(#sil)">${at(250, 1790, .75, nikita({ face: 'scared' }))}${at(360, 1790, .8, asya({ face: 'scared', torch: false }))}</g>`,
    cam: { s: lerp(1.15, .98, ease(seg(t, tBig - .5, tBig + 1.2))), x: 540, y: lerp(1250, 900, ease(seg(t, t0, tBig + 1))) }, shake: quake,
    fx: rain(t, { op: .45, slant: .3, n: 180 }),
  };
};

// ---------- СУБТИТРЫ ----------
const KEY = {
  '#c8ff6e': ['рыба', 'смотрит', 'спит', 'шерст', 'реагент', 'сне', 'них', 'спала', 'моста', 'оно', 'тёпл', 'что'],
  '#ff6a55': ['потерял', 'коготь', 'твёрд', 'ноготь', 'локтя', 'выше', 'замолк', 'бензин', 'насосы', 'заклин'],
  '#ffa23c': ['завод', 'огонь', 'зажиг', 'щелч', 'стеной', 'ураган'],
  '#f2c15a': ['ася', 'пропуск', 'город', 'девочка', 'родители'],
};
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
  let body = '';
  if (t >= VOICE_END + .9) { // финальная заставка
    const k = seg(t, VOICE_END + .9, VOICE_END + 1.6), fl = flicker(t, 2, 10);
    body = `<rect width="1080" height="1920" fill="#000"/>
      <g opacity="${k}"><text x="540" y="900" fill="${PAL.eye}" font-family="Inter" font-weight="900" font-size="104" text-anchor="middle" opacity="${fl}">ГИГАНТСКИЕ</text>
      <text x="540" y="1010" fill="${PAL.eye}" font-family="Inter" font-weight="900" font-size="104" text-anchor="middle" opacity="${fl}">МУТАНТЫ</text>
      <text x="540" y="1110" fill="#8a98a3" font-family="Inter" font-weight="700" font-size="40" text-anchor="middle">серия 1 · «Завод»</text>
      <text x="540" y="1250" fill="#e9e4d8" font-family="Inter" font-weight="800" font-size="48" text-anchor="middle" opacity="${seg(t, VOICE_END + 1.8, VOICE_END + 2.3)}">Продолжение следует…</text></g>`;
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
