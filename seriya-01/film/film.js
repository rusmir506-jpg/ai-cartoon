// Серия 1 «Куда упадёт» — анимация. renderAt(t) рисует кадр для секунды t.
// Все времена — секунды финальной озвучки (audio/slova.json).
(function () {
  const A = ART, P = A.P, W = window.SLOVA;
  const DUR = 88.5;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const pr = (t, a, b) => cl((t - a) / (b - a));
  const ez = x => x * x * (3 - 2 * x);
  const lerp = (a, b, x) => a + (b - a) * x;
  const f = n => Math.round(n * 10) / 10;
  const turn = t => Math.floor(t / 0.42) % 2 === 0;           // ритм поворотника
  const blink = (t, ph = 0) => ((t + ph) % 3.3) < 0.13;
  const talk = t => 0.5 + 0.5 * Math.sin(t * 19) * Math.sin(t * 7.3);
  const cam = (inner, cx, cy, s, rot = 0) => `<g transform="translate(540 960) rotate(${f(rot)}) scale(${s.toFixed(4)}) translate(${f(-cx)} ${f(-cy)})">${inner}</g>`;
  const at = (x, y, s, inner, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">${inner}</g>`;
  const FONT = 'font-family="Inter, DejaVu Sans, sans-serif"';
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

  const EXTRA_DEFS = `<defs>
    <radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070f" stop-opacity="0"/><stop offset=".5" stop-color="#05070f" stop-opacity=".62"/><stop offset="1" stop-color="#05070f" stop-opacity="0"/></linearGradient>
    <linearGradient id="gBack" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gTrail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.amber}" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
  </defs>`;

  // ---------- общие эффекты ----------
  // горячий ветер: штрихи и искры, летят справа налево
  function wind(t, k, n = 34, seed = 1) {
    if (k <= 0) return '';
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 500 + hash(i + seed) * 700, y = hash(i * 3.1 + seed) * 1920 + Math.sin(t * 2 + i) * 24;
      const x = 1200 - ((hash(i * 7.7 + seed) * 1400 + t * sp * k) % 1400);
      const len = 30 + hash(i * 1.3) * 90;
      s += i % 3 === 0
        ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2 + hash(i) * 3)}" fill="${P.ember}" opacity="${f(.5 * k)}"/>`
        : `<path d="M${f(x)} ${f(y)}h${f(len)}" stroke="${P.amber}" stroke-width="3" stroke-linecap="round" opacity="${f(.16 * k)}"/>`;
    }
    return s;
  }
  function tag(text, y, a) {
    if (a <= 0) return '';
    const w = text.length * 25 + 70;
    return `<g opacity="${f(a)}" transform="translate(${540 - w / 2} ${y})"><rect width="${w}" height="72" rx="36" fill="#05070f" opacity=".82"/><rect width="${w}" height="72" rx="36" fill="none" stroke="${P.ember}" stroke-width="3"/><text x="${w / 2}" y="48" text-anchor="middle" ${FONT} font-weight="800" font-size="34" letter-spacing="3" fill="${P.pale}">${text}</text></g>`;
  }
  const fadeTag = (t, a, b) => Math.min(pr(t, a, a + .25), 1 - pr(t, b - .25, b));
  function papers(t, n, y0, y1, seed) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 260 + hash(i + seed) * 380, x = ((hash(i * 5 + seed) * 1300 + t * sp) % 1300) - 110;
      const y = lerp(y0, y1, hash(i * 2.3 + seed)) + Math.sin(t * 3 + i * 2) * 50;
      s += `<rect x="-22" y="-28" width="44" height="56" fill="${P.pale}" opacity=".75" transform="translate(${f(x)} ${f(y)}) rotate(${f(t * 220 + i * 70)}) scale(1 ${f(Math.cos(t * 5 + i))})"/>`;
    }
    return s;
  }

  // ---------- новые рисунки для крупных планов ----------
  function familyPhoto() {
    return `<g><rect x="-115" y="-140" width="230" height="280" rx="6" fill="${P.pale}"/><rect x="-98" y="-124" width="196" height="208" fill="#1a2540"/>
      <path d="M-98 84v-40q30 -60 78 -60t70 60v40z" fill="#7a2733"/><circle cx="-24" cy="-44" r="40" fill="#d6a58a"/>
      <path d="M-66 -40q0 -52 44 -52q42 0 42 50q-20 -30 -52 -26q-18 30 -34 28z" fill="#5a3a2a"/>
      <circle cx="-38" cy="-42" r="4" fill="#1a1414"/><circle cx="-10" cy="-42" r="4" fill="#1a1414"/><path d="M-36 -24q12 10 26 0" stroke="#7a2733" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M20 84v-20q14 -36 40 -36t38 36v20z" fill="${P.amber}"/><circle cx="58" cy="2" r="30" fill="#e0b294"/>
      <path d="M28 -4q4 -32 32 -30q28 2 28 30q-28 -18 -60 0z" fill="#3a2a22"/>
      <circle cx="48" cy="4" r="3.5" fill="#1a1414"/><circle cx="68" cy="4" r="3.5" fill="#1a1414"/><path d="M50 16q8 8 18 0" stroke="#7a2733" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <rect x="-40" y="-158" width="80" height="34" fill="${P.amber}" opacity=".8" transform="rotate(-4)"/></g>`;
  }
  // приборная панель: fuel 0..1, lamp — красная лампа
  function dash(t, o) {
    const ang = lerp(-68, 68, o.fuel) + (o.jit || 0);
    let ticks = '';
    for (let i = 0; i <= 8; i++) { const a = (-68 + i * 17) * Math.PI / 180; ticks += `<path d="M${f(Math.sin(a) * 196)} ${f(-Math.cos(a) * 196)}L${f(Math.sin(a) * (i % 4 === 0 ? 150 : 172))} ${f(-Math.cos(a) * (i % 4 === 0 ? 150 : 172))}" stroke="${i < 2 ? P.red : P.pale}" stroke-width="${i % 4 === 0 ? 10 : 5}" stroke-linecap="round"/>`; }
    return `<rect width="1080" height="1920" fill="#070912"/>
      <rect x="0" y="0" width="1080" height="1060" fill="url(#gSky)"/>${A.stars(15, 40, 700)}${o.view || ''}
      <path d="M0 0h150L50 1060H0zM1080 0h-150l100 1060h50z" fill="#05060c"/><rect width="1080" height="70" fill="#05060c"/>
      <path d="M0 1050Q540 950 1080 1050V1920H0z" fill="#0b0e1a"/><path d="M0 1050Q540 950 1080 1050" stroke="#232b44" stroke-width="8" fill="none"/>
      <g transform="translate(400 1420)"><circle r="250" fill="#05060c" stroke="#232b44" stroke-width="14"/>
        <circle r="250" fill="${o.lamp ? 'url(#gRed)' : 'none'}" opacity=".35"/>${ticks}
        <text x="-150" y="70" text-anchor="middle" ${FONT} font-weight="900" font-size="64" fill="${P.red}">E</text>
        <text x="150" y="70" text-anchor="middle" ${FONT} font-weight="900" font-size="64" fill="${P.pale}">F</text>
        <text x="0" y="-70" text-anchor="middle" ${FONT} font-weight="800" font-size="40" fill="${P.pale}" opacity=".8">1/2</text>
        <text x="0" y="170" text-anchor="middle" ${FONT} font-weight="700" font-size="30" letter-spacing="6" fill="${P.pale}" opacity=".5">ТОПЛИВО</text>
        <path d="M0 0L0 -178" stroke="${P.ember}" stroke-width="14" stroke-linecap="round" transform="rotate(${f(ang)})"/><circle r="26" fill="${P.ember}"/><circle r="10" fill="#05060c"/>
        <circle cx="0" cy="104" r="20" fill="${o.lamp ? P.red : '#3a1a20'}"/>${o.lamp ? `<circle cx="0" cy="104" r="70" fill="url(#gRed)"/>` : ''}
      </g>
      ${at(830, 1330, 1.25, familyPhoto(), 5 + Math.sin(t * 2.2) * 2)}
      <circle cx="260" cy="2220" r="560" fill="none" stroke="#05060c" stroke-width="70"/>`;
  }
  function carRear(t, o) {
    o = o || {};
    return `<g><ellipse cx="0" cy="24" rx="190" ry="20" fill="#000" opacity=".5"/>
      <rect x="-150" y="-12" width="54" height="46" rx="10" fill="#05060c"/><rect x="96" y="-12" width="54" height="46" rx="10" fill="#05060c"/>
      <path d="M-112 -186q112 -96 224 0z" fill="${P.sedan}"/><rect x="-158" y="-196" width="316" height="196" rx="34" fill="${P.sedan}"/>
      <path d="M-104 -178q104 -74 208 0v54h-208z" fill="#0c1426"/>
      <circle cx="-46" cy="-150" r="27" fill="#05070f"/><path d="M-74 -160q28 -34 56 0z" fill="#05070f"/><circle cx="48" cy="-140" r="26" fill="#05070f"/>
      <rect x="-158" y="-44" width="316" height="44" rx="14" fill="#1a2c40"/><rect x="-46" y="-90" width="92" height="32" rx="4" fill="${P.pale}" opacity=".8"/>
      <circle cx="-116" cy="-96" r="60" fill="url(#gRed)"/><circle cx="116" cy="-96" r="60" fill="url(#gRed)"/>
      <rect x="-148" y="-110" width="64" height="28" rx="8" fill="${P.red}"/><rect x="84" y="-110" width="64" height="28" rx="8" fill="${P.red}"/></g>`;
  }
  function phoneBig(t, state) { // state: 'call' | 'none' | 'off'
    const rings = state === 'call' ? [0, 1, 2].map(i => { const p = ((t * 1.3 + i / 3) % 1); return `<circle cx="0" cy="-150" r="${f(70 + p * 110)}" fill="none" stroke="${P.tv}" stroke-width="6" opacity="${f(.7 * (1 - p))}"/>`; }).join('') : '';
    const on = state !== 'off';
    return `<g><rect x="-230" y="-430" width="460" height="860" rx="56" fill="#0a0c14" stroke="#3a4260" stroke-width="10"/>
      <rect x="-200" y="-390" width="400" height="780" rx="24" fill="${on ? (state === 'none' ? '#241018' : '#14213c') : '#07080e'}"/>
      ${on ? `${rings}<circle cx="0" cy="-150" r="78" fill="#d6a58a"/><path d="M-82 -146q0 -100 86 -100q82 0 80 96q-40 -56 -100 -50q-34 56 -66 54z" fill="#5a3a2a"/>
        <circle cx="-26" cy="-148" r="7" fill="#1a1414"/><circle cx="26" cy="-148" r="7" fill="#1a1414"/><path d="M-24 -112q24 18 48 0" stroke="#7a2733" stroke-width="7" fill="none" stroke-linecap="round"/>
        <text x="0" y="20" text-anchor="middle" ${FONT} font-weight="900" font-size="74" fill="${P.pale}">ДОЧКА</text>
        ${state === 'call' ? `<text x="0" y="96" text-anchor="middle" ${FONT} font-weight="600" font-size="40" fill="${P.tv}">вызов${'.'.repeat(1 + Math.floor(t * 3) % 3)}</text>`
          : `<rect x="-170" y="52" width="340" height="84" rx="14" fill="${P.red}" opacity="${turn(t * 1.6) ? 1 : .55}"/><text x="0" y="112" text-anchor="middle" ${FONT} font-weight="900" font-size="54" fill="#fff">НЕТ СЕТИ</text>`}
        <g transform="translate(120 -350)">${[0, 1, 2, 3].map(i => `<rect x="${i * 16}" y="${-i * 8}" width="10" height="${10 + i * 8}" fill="${state === 'none' ? '#5a2030' : P.pale}"/>`).join('')}${state === 'none' ? `<path d="M-8 -30l72 44" stroke="${P.red}" stroke-width="7" stroke-linecap="round"/>` : ''}</g>
        <circle cx="0" cy="270" r="62" fill="${P.red}"/><path d="M-30 270h60" stroke="#fff" stroke-width="14" stroke-linecap="round"/>` : ''}
    </g>`;
  }

  // =================== СЦЕНЫ ===================
  const S = {};

  // 0–8.55  Небо
  S.sky = t => {
    const morn = Math.min(pr(t, 2.4, 2.8), 1 - pr(t, 4.95, 5.3));
    const dotR = t < 2.5 ? 6 : t < 5.26 ? 0 : lerp(2, 9, ez(pr(t, 5.26, 7.3)));
    const on = t < 7.64 ? true : turn(t);
    let s = A.bg.sky({ dotR: Math.max(dotR, 0.01), dotOn: on });
    if (dotR === 0) s = A.bg.sky({ dotR: 0.01, dotOn: false, dotY: -500 });
    // утренний метеорит
    if (morn > 0) {
      const p = pr(t, 2.9, 4.5), x = lerp(-80, 880, p), y = lerp(180, 1460, p * p);
      const ang = Math.atan2(1280 * 2 * Math.max(p, .05), 960) * 180 / Math.PI;
      s += `<rect width="1080" height="1920" fill="#7fa0c4" opacity="${f(.42 * morn)}"/>`;
      if (p > 0 && p < 1) s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><rect x="-460" y="-7" width="460" height="14" fill="url(#gTrail)"/><circle r="70" fill="url(#gWhite)"/><circle r="14" fill="#fff"/></g>`;
      const fl = pr(t, 4.5, 4.62) * (1 - pr(t, 4.62, 5.2));
      if (fl > 0) s += `<circle cx="880" cy="1460" r="${f(200 + 700 * pr(t, 4.5, 5.2))}" fill="url(#gWhite)" opacity="${f(fl)}"/>`;
    }
    const z = 1 + .22 * ez(pr(t, 0, 8.55));
    let out = cam(s, lerp(540, 640, ez(pr(t, 5, 8.55))), lerp(960, 700, ez(pr(t, 5, 8.55))), z);
    out += wind(t, .5, 20, 3);
    out += tag('УТРОМ', 240, fadeTag(t, 2.5, 5.1)) + tag('ВЕЧЕРОМ', 240, fadeTag(t, 5.3, 8.4));
    const ta = fadeTag(t, .15, 2.4);
    if (ta > 0) out += `<g opacity="${f(ta)}"><text x="540" y="250" text-anchor="middle" ${FONT} font-weight="900" font-size="66" letter-spacing="6" fill="${P.pale}">ПАДЕНИЕ МЕТЕОРИТА</text><text x="540" y="312" text-anchor="middle" ${FONT} font-weight="700" font-size="36" letter-spacing="8" fill="${P.ember}">СЕРИЯ 1 · КУДА УПАДЁТ</text></g>`;
    return out;
  };

  // 8.55–10.4  Такси у башни, поворотник в такт точке
  S.street1 = t => {
    const s = A.bg.street({ dotOn: turn(t), dotR: 7, flow: t * .04 }) + at(640, 1700, 1, A.car({ kind: 'taxi', blink: turn(t), lights: true }));
    const p = ez(pr(t, 8.55, 10.4));
    return cam(s, lerp(640, 660, p), lerp(960, 1380, p), lerp(1, 1.5, p)) + wind(t, .6, 24, 5);
  };

  // 10.4–12.55  Аня за рулём
  S.anya = t => {
    const sweep = ((t * .7) % 1) * 1800 - 400;
    let s = `<rect width="1080" height="1920" fill="#070912"/>
      <rect x="120" y="360" width="840" height="820" rx="90" fill="url(#gSky)"/>
      ${A.headlightRiver(4, [[1300, 1090, 30, 9], [-200, 1090, 30, 9]], 16, t * .12)}
      <rect x="120" y="360" width="840" height="820" rx="90" fill="none" stroke="#05060c" stroke-width="40"/>
      <rect x="330" y="1000" width="420" height="700" rx="80" fill="#10142a"/>
      ${at(540, 2110, 2.6, A.anya({ aL: -40, aL2: 55, aR: 40, aR2: -55, blink: blink(t, .6), look: Math.sin(t * 1.4) * 3, worry: .3 }))}
      <rect x="${f(sweep)}" y="300" width="260" height="1300" fill="${P.amber}" opacity=".09" transform="skewX(-18)"/>
      <path d="M0 1590Q540 1510 1080 1590V1920H0z" fill="#0b0e1a"/>
      <circle cx="540" cy="1790" r="300" fill="none" stroke="#05060c" stroke-width="56" transform="rotate(${f(Math.sin(t * 1.7) * 3)} 540 1790)"/>
      <path d="M540 1790L290 1700M540 1790L790 1700M540 1790V2090" stroke="#05060c" stroke-width="44" transform="rotate(${f(Math.sin(t * 1.7) * 3)} 540 1790)"/>`;
    const p = pr(t, 10.4, 12.55);
    return cam(s, 540, lerp(1150, 1100, p), lerp(1.02, 1.1, p)) + tag('АНЯ · 59 · ТАКСИСТКА', 220, fadeTag(t, 10.6, 12.5));
  };

  // 12.55–17.4  Рейсы на северное поле
  S.road = t => {
    const off1 = (t * 26) % 1130, off2 = (t * 90) % 1130, n = t < 12.9 ? 1 : Math.min(11, 1 + Math.floor(pr(t, 12.9, 16.6) * 10.5));
    const sx = lerp(1500, -520, pr(t, 13.4, 16.0));
    const hit = t > 16.6 ? 1 + .12 * Math.max(0, 1 - (t - 16.6) * 4) : 1;
    let dashes = '';
    for (let i = 0; i < 9; i++) dashes += `<rect x="${f(((i * 160 - t * 900) % 1440 + 1440) % 1440 - 180)}" y="1786" width="90" height="10" fill="${P.pale}" opacity=".3"/>`;
    const s = `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(5, 60, 900)}${A.dot(820, 330, 5, true)}
      <g transform="translate(${f(-off1)} 0)">${A.skyline(21, 1400, 120, 420, '#141226', .1)}<g transform="translate(1130 0)">${A.skyline(21, 1400, 120, 420, '#141226', .1)}</g></g>
      <g transform="translate(${f(-off2)} 0)">${A.skyline(22, 1500, 60, 240, '#0a0b16', .14)}<g transform="translate(1130 0)">${A.skyline(22, 1500, 60, 240, '#0a0b16', .14)}</g></g>
      <rect y="1490" width="1080" height="430" fill="#0a0c16"/><rect y="1490" width="1080" height="14" fill="#1a1f33"/>${dashes}
      <g transform="translate(${f(sx)} 1500)"><path d="M0 0v-560" stroke="#0a0c14" stroke-width="18"/><rect x="-20" y="-900" width="520" height="350" rx="18" fill="#16233c" stroke="${P.pale}" stroke-width="8"/>
        <text x="240" y="-800" text-anchor="middle" ${FONT} font-weight="900" font-size="58" fill="${P.pale}">ПУНКТ СБОРА</text>
        <text x="240" y="-712" text-anchor="middle" ${FONT} font-weight="900" font-size="58" fill="${P.amber}">СЕВЕРНОЕ</text>
        <text x="200" y="-628" text-anchor="middle" ${FONT} font-weight="900" font-size="58" fill="${P.amber}">ПОЛЕ</text>
        <path d="M330 -648h90m-34 -30l34 30l-34 30" stroke="${P.amber}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      ${at(470, 1716 + Math.sin(t * 17) * 3, 1.05, A.car({ kind: 'taxi', lights: true, rot: t * 700 }))}
      ${A.headlightRiver(9, [[1300, 1560, 16, 9], [-200, 1560, 16, 9]], 9, -t * .3)}`;
    const board = `<g transform="translate(540 330) scale(${f(hit)})"><rect x="-300" y="-110" width="600" height="220" rx="24" fill="#05060c" stroke="${P.ember}" stroke-width="6"/>
      <text x="0" y="-52" text-anchor="middle" ${FONT} font-weight="700" font-size="34" letter-spacing="6" fill="${P.pale}" opacity=".7">РЕЙСОВ ЗА ДЕНЬ</text>
      <text x="0" y="70" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="120" fill="${n === 11 ? P.red : P.amber}">${n}</text></g>`;
    return cam(s, 540, 960, 1.04) + wind(t, .9, 30, 7) + board;
  };

  // 17.4–19.3  Фото дочки с внуком, бак на нуле
  S.photo = t => {
    const p = ez(pr(t, 17.4, 19.3));
    const v = A.headlightRiver(4, [[1300, 980, 30, 8], [-200, 980, 30, 8]], 14, t * .1);
    return cam(dash(t, { fuel: 0, lamp: turn(t), jit: Math.sin(t * 30) * 1.2, view: v }), lerp(600, 800, p), lerp(1300, 1320, p), lerp(1.15, 1.75, p));
  };

  // 19.3–22.9  Ключи в залог
  S.keys = t => {
    const tk = 21.6, fall = pr(t, tk, tk + .3), away = ez(pr(t, 22.0, 22.8));
    let bok = '';
    for (let i = 0; i < 14; i++) bok += `<circle cx="${f(hash(i) * 1080 + Math.sin(t * .6 + i) * 30)}" cy="${f(hash(i * 3) * 1500)}" r="${f(40 + hash(i * 5) * 70)}" fill="${i % 3 ? P.amber : P.tv}" opacity="${f(.05 + .05 * hash(i * 9))}"/>`;
    const ky = lerp(880, 1150, fall * fall), kx = lerp(440, 590, fall);
    const closed = pr(t, tk + .35, tk + .7);
    const s = `<rect width="1080" height="1920" fill="#080a14"/>${bok}
      <g transform="translate(${f(-420 * away)} ${f(-560 * away)})"><path d="M-160 240L420 770" stroke="#1e2540" stroke-width="170" stroke-linecap="round"/>
        <path d="M330 690L420 770" stroke="${P.pale}" stroke-width="170" opacity=".9"/><path d="M356 712L420 770" stroke="#1e2540" stroke-width="172"/>
        ${at(150, 470, .55, A.orbitaMark(P.ember), 42)}
        <circle cx="450" cy="800" r="84" fill="${P.skinE}"/><rect x="420" y="800" width="46" height="110" rx="23" fill="${P.skinE}" transform="rotate(-20 440 800)"/></g>
      <path d="M1260 1760L640 1270" stroke="#a8772a" stroke-width="180" stroke-linecap="round"/><path d="M1260 1700L900 1420" stroke="#4a2f25" stroke-width="60" opacity=".0"/>
      <ellipse cx="590" cy="1230" rx="150" ry="112" fill="${P.skinA}" transform="rotate(-18 590 1230)"/>
      ${at(kx, ky - 60, 3.4, A.keys(), lerp(-10, 24, fall) + (fall >= 1 ? Math.sin((t - tk) * 22) * 6 * Math.max(0, 1 - (t - tk - .3) * 2.5) : 0))}
      ${[0, 1, 2, 3].map(i => `<rect x="${430 + i * 70}" y="${f(1110 - closed * 40)}" width="60" height="${f(150 + closed * 30)}" rx="30" fill="#b88266" transform="rotate(${f(-18 + closed * 8)} 590 1230) translate(0 ${f(lerp(120, 30, closed))})" opacity="${f(closed)}"/>`).join('')}`;
    const p = pr(t, 19.3, 22.9);
    return cam(s, 540, lerp(940, 1040, ez(p)), lerp(1, 1.14, p));
  };

  // 22.9–25.05  Пассажир уходит в башню, камера вверх на 25-й
  S.tower = t => {
    const w = pr(t, 22.9, 23.9), up = ez(pr(t, 23.5, 24.9));
    const ex = lerp(560, 240, w), sc = lerp(.95, .72, w);
    const s = A.bg.street({ dotOn: turn(t), dotR: 7, flow: t * .04 })
      + (w < 1 ? at(ex, lerp(1650, 1505, w), sc, A.engineer({ shadow: true, walk: t * 11 })) : '')
      + at(700, 1700, 1, A.car({ kind: 'taxi', lights: true }))
      + (up > .5 ? `<circle cx="210" cy="60" r="${f(160 + 40 * Math.sin(t * 9))}" fill="url(#gGlow)" opacity=".5"/>` : '');
    return cam(s, lerp(480, 330, up), lerp(1420, 330, up), lerp(1.25, 1.75, up)) + wind(t, .5, 18, 9)
      + tag('25-Й ЭТАЖ', 1180, fadeTag(t, 24.0, 25.05));
  };

  // 25.05–26.3  Не вернулся
  S.wait = t => {
    const mins = Math.floor(lerp(3, 47, pr(t, 25.05, 26.2)));
    const s = A.bg.street({ dotOn: turn(t), dotR: 8, flow: t * .04 }) + at(700, 1700, 1, A.car({ kind: 'taxi', lights: false, blink: turn(t) }))
      + at(380, 1690, .95, A.anya({ look: -4, worry: .8, mouth: 'down', keys: true, aR: 14, aR2: 30, blink: blink(t) }));
    return cam(s, 500, 1400, lerp(1.4, 1.5, pr(t, 25.05, 26.3))) + wind(t, .5, 18, 9)
      + `<g transform="translate(540 300)"><rect x="-230" y="-80" width="460" height="160" rx="22" fill="#05060c" stroke="${P.ember}" stroke-width="6"/><text x="0" y="-22" text-anchor="middle" ${FONT} font-weight="700" font-size="30" letter-spacing="6" fill="${P.pale}" opacity=".7">ОЖИДАНИЕ</text><text x="0" y="56" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="72" fill="${P.red}">00:${String(mins).padStart(2, '0')}</text></g>`;
  };

  // 26.3–29.1  Лифт
  S.lift = t => {
    const fl = Math.max(1, Math.min(25, Math.round(lerp(1, 25, pr(t, 26.4, 28.7)))));
    const fk = hash(Math.floor(t * 11)) < .16 ? .3 : 1;
    const open = ez(pr(t, 28.8, 29.1));
    const s = A.bg.lift({ floor: fl, light: fk, open: 0 })
      + at(430, 1700, 1.9, A.anya({ blink: blink(t), look: 2, worry: .7, keys: true, aR: 10, aR2: 20 }))
      + at(730, 1700, 1.9, A.zina({ blink: blink(t, 1.2), look: -3 }))
      + `<rect width="1080" height="1920" fill="#000" opacity="${f((1 - fk) * .5)}"/>`;
    return cam(s, 540, 960 + (fl < 25 ? Math.sin(t * 43) * 5 : 0), lerp(1.02, 1.1 + open * .3, pr(t, 26.3, 29.1)))
      + tag('БАБА ЗИНА · ВАХТЁРША', 1210, fadeTag(t, 26.5, 28.9));
  };

  // 29.1–32.4  Пустой офис, вертолёт
  S.office = t => {
    const h = pr(t, 30.2, 32.4), hx = lerp(180, 1000, h), hy = lerp(1120, 380, ez(h));
    const s = A.bg.office({ dotOn: turn(t), dotR: 9, tv: .85 + .15 * hash(Math.floor(t * 14)), mouth: talk(t), flow: t * .03 })
      + (t > 30.2 ? at(hx, hy, .6, A.heli({ rot: t * 30, blink: turn(t * 2) }), -12) : '')
      + `<path d="M270 330v900M540 330v900M810 330v900M0 780h1080" stroke="#05060c" stroke-width="14"/>`
      + papers(t, 9, 1250, 1750, 2)
      + at(lerp(-140, 150, ez(pr(t, 29.1, 30.2))), 1900, 1.3, A.zina({ walk: t < 30.2 ? t * 9 : 0, look: 3, blink: blink(t) }))
      + at(lerp(-20, 330, ez(pr(t, 29.1, 30.2))), 1910, 1.3, A.anya({ walk: t < 30.2 ? t * 9 : 0, look: 3, worry: .8, blink: blink(t, 1) }));
    const p = pr(t, 29.1, 32.4);
    return cam(s, lerp(540, 600, p), lerp(1000, 900, p), lerp(1, 1.14, p));
  };

  // 32.4–38.2  Телевизор
  S.tv = t => {
    const p = ez(pr(t, 32.4, 37.5));
    const speak = t > 33.3 && t < 38.1;
    const s = A.bg.office({ dotOn: turn(t), dotR: 9, tv: .8 + .2 * hash(Math.floor(t * 14)), mouth: speak ? talk(t) : 0, flow: t * .03 })
      + `<g transform="translate(740 1560)"><rect x="-232" y="${f(-192 + ((t * 180) % 284))}" width="464" height="14" fill="#fff" opacity=".12"/><rect x="-232" y="-192" width="464" height="284" fill="#fff" opacity="${f(hash(Math.floor(t * 20)) < .08 ? .25 : 0)}"/></g>`;
    return cam(s, lerp(640, 740, p), lerp(1300, 1520, p), lerp(1.25, 2.05, p));
  };

  // 38.2–40.75  Баба Зина крупно
  S.zina = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><rect y="0" width="1080" height="620" fill="url(#gSkyLow)"/><path d="M360 0v620M720 0v620M0 610h1080" stroke="#05060c" stroke-width="18"/>
      <circle cx="900" cy="1200" r="800" fill="url(#gTv)" opacity="${f(.7 + .2 * hash(Math.floor(t * 12)))}"/>
      ${at(540, 1960, 3.6, A.zina({ blink: blink(t, .4), look: Math.sin(t * 1.1) * 3, keys: false, aL: 10, aL2: 20 }))}
      <rect width="1080" height="1920" fill="${P.tv}" opacity=".07"/>`;
    const p = pr(t, 38.2, 40.75);
    return cam(s, 540, lerp(1000, 950, p), lerp(1, 1.12, p)) + tag('30 ЛЕТ СЧИТАЛА ТРАЕКТОРИИ', 250, fadeTag(t, 38.9, 40.7));
  };

  // 40.75–47.1  Метки помадой, линия падения
  const MK = [[430, 640, 41.0], [500, 612, 41.42], [570, 586, 41.84], [640, 560, 42.26]];
  function marksLayer(t) {
    let s = '';
    MK.forEach(m => { const a = pr(t, m[2], m[2] + .14); if (a > 0) s += `<g transform="translate(${m[0]} ${m[1]}) scale(${f(lerp(1.8, 1, a))})"><path d="M-16 -16l32 32m0 -32l-32 32" stroke="${P.red}" stroke-width="9" stroke-linecap="round"/></g>`; });
    const l = t < 44.6 ? pr(t, 43.1, 44.6) * .35 : t < 45.6 ? lerp(.35, .7, pr(t, 44.7, 45.5)) : lerp(.7, 1, ez(pr(t, 45.7, 46.5)));
    if (l > 0) s += `<path d="M430 640L640 560Q860 476 930 1010" pathLength="100" stroke="${P.red}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="${f(l * 100)} 200"/>`;
    if (t > 46.5) { for (let i = 0; i < 3; i++) { const q = ((t * 1.1 + i / 3) % 1); s += `<circle cx="930" cy="1010" r="${f(8 + q * 60)}" fill="none" stroke="${P.red}" stroke-width="5" opacity="${f(1 - q)}"/>`; } s += `<circle cx="930" cy="1010" r="9" fill="${P.red}"/>`; }
    return s;
  }
  S.marks = t => {
    const k = MK.filter(m => t >= m[2] - .2).length, tgt = MK[Math.min(3, Math.max(0, k - 1))];
    const drawing = t < 42.6;
    const s = A.bg.office({ dotOn: turn(t), dotR: 9, tv: .9, mouth: 0, flow: t * .03, dotX: 660, dotY: 552 }) + marksLayer(t)
      + at(lerp(250, 330, pr(t, 40.75, 42.4)), 1420, 1.5, A.zina({ lipstick: true, keys: false, aR: drawing ? 118 + Math.sin(t * 15) * 5 : 60, aR2: drawing ? 160 + (tgt[0] - 430) * .05 : 110, mouth: t > 43 && t < 46.9 ? (talk(t) > .5 ? 'open' : 'flat') : 'flat', look: 3, blink: blink(t) }));
    const p = ez(pr(t, 42.8, 46.6));
    return cam(s, lerp(520, 680, p), lerp(800, 820, p), lerp(1.62, 1.3, p));
  };

  // 47.1–50.6  Севернее — поле. Фары ползут туда
  S.river = t => {
    const s = A.bg.office({ dotOn: turn(t), dotR: 9, tv: 0, flow: t * .05, dotX: 660, dotY: 552 }) + marksLayer(t)
      + A.headlightRiver(23, [[80, 1230, 70, 5], [300, 1140, 46, 4], [620, 1060, 26, 3], [900, 1010, 12, 2]], 170, t * .05)
      + `<g transform="translate(930 1010)"><path d="M0 -14v-70" stroke="${P.red}" stroke-width="3"/><text x="-8" y="-98" text-anchor="end" ${FONT} font-weight="900" font-size="30" fill="${P.red}">СЕВЕРНОЕ ПОЛЕ</text></g>`;
    const p = ez(pr(t, 47.1, 50.6));
    return cam(s, lerp(640, 760, p), lerp(960, 1040, p), lerp(1.7, 2.5, p));
  };

  // 50.6–52.15  Я сама их туда отвезла
  S.guilt = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><rect y="0" width="1080" height="700" fill="url(#gSkyLow)"/><path d="M270 0v700M810 0v700M0 690h1080" stroke="#05060c" stroke-width="18"/>
      ${A.headlightRiver(17, [[0, 690, 30, 7], [1080, 560, 20, 5]], 50, t * .05)}
      <circle cx="540" cy="900" r="700" fill="url(#gRed)" opacity="${f(.25 + .2 * Math.sin(t * 6))}"/>
      ${at(540, 2330, 3.6, A.anya({ worry: 1, mouth: 'down', blink: blink(t, 2), look: -2, aL: 6, aR: -6 }))}`;
    const p = pr(t, 50.6, 52.15);
    return cam(s, 540, lerp(1000, 960, p), lerp(1.05, 1.3, ez(p)));
  };

  // 52.15–54.3  Звоню дочке. Сети не было
  S.phone = t => {
    const st = t < 53.18 ? 'call' : t < 54.0 ? 'none' : 'off';
    const sh = st === 'none' ? Math.sin(t * 60) * 14 * Math.max(0, 1 - (t - 53.18) * 3) : 0;
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="${st === 'none' ? 'url(#gRed)' : 'url(#gTv)'}" opacity="${st === 'off' ? 0 : .5}"/>
      <path d="M1250 1900L760 1380" stroke="#a8772a" stroke-width="230" stroke-linecap="round"/>
      ${at(540 + sh, 900, 1.25, phoneBig(t, st), -4)}
      <ellipse cx="800" cy="1260" rx="92" ry="150" fill="${P.skinA}" transform="rotate(34 800 1260)"/>`;
    return cam(s, 540, 940, lerp(1, 1.08, pr(t, 52.15, 54.3)));
  };

  // 54.3–56.7  Бак пуст
  S.empty = t => {
    const p = ez(pr(t, 54.3, 56.7));
    return cam(dash(t, { fuel: 0, lamp: turn(t), jit: Math.sin(t * 30) * 1.5 }), lerp(520, 420, p), lerp(1300, 1400, p), lerp(1.2, 1.7, p));
  };

  // 56.7–58.5  Чужие ключи
  S.pocket = t => {
    const u = ez(pr(t, 56.9, 57.8));
    const gl = pr(t, 57.8, 58.0) * (1 - pr(t, 58.0, 58.5));
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="300" cy="700" r="800" fill="url(#gTv)" opacity=".35"/>
      ${at(470, 2260, 3.2, A.anya({ keys: true, aR: lerp(8, 34, u), aR2: lerp(-10, 150, u), look: 4, worry: .4, blink: blink(t) }))}
      ${gl > 0 ? `<g transform="translate(790 1010) rotate(${f(t * 90)}) scale(${f(gl * 1.6)})"><path d="M0 -110L16 -16L110 0L16 16L0 110L-16 16L-110 0L-16 -16z" fill="#fff"/></g>` : ''}`;
    return cam(s, lerp(540, 600, u), lerp(1100, 1040, u), lerp(1.05, 1.25, u));
  };

  // 58.5–60.3  Парковка
  S.parking = t => {
    const beep = (t > 59.0 && t < 59.22) || (t > 59.45 && t < 59.67);
    const run = pr(t, 58.5, 60.3);
    const s = A.bg.parking({ dotOn: turn(t), dotR: 9 }) + at(470, 1560, 1.15, A.car({ kind: 'sedan', lights: false, blink: beep }))
      + papers(t, 5, 1500, 1800, 6)
      + at(lerp(1350, 1010, run), 1700, 1, `<g transform="scale(-1 1)">${A.zina({ walk: t * 13, keys: false, aL: 20, aR: -30 })}</g>`)
      + at(lerp(1180, 800, run), 1680, 1.05, `<g transform="scale(-1 1)">${A.anya({ walk: t * 14, keys: true, aR: 70, aR2: 110, aL: -30, aL2: -60, worry: .9 })}</g>`);
    return cam(s, lerp(640, 560, run), lerp(1250, 1350, run), lerp(1.1, 1.3, run)) + wind(t, .9, 28, 11);
  };

  // 60.3–61.3  Полбака
  S.half = t => {
    const u = pr(t, 60.38, 60.9), fuel = .5 * (1 - Math.exp(-u * 6) * Math.cos(u * 14));
    return cam(dash(t, { fuel: cl(fuel, 0, .7), lamp: false }), 420, 1400, lerp(1.6, 1.8, pr(t, 60.3, 61.3)));
  };

  // 61.3–62.05  Хватит
  S.go = t => {
    const g = pr(t, 61.45, 62.05), x = 470 + g * g * 900;
    const s = A.bg.parking({ dotOn: turn(t), dotR: 9 }) + at(x + Math.sin(t * 70) * 2, 1560, 1.15, A.car({ kind: 'sedan', lights: true, rot: g * g * 900 }));
    return cam(s, 600, 1350, 1.3) + wind(t, 1, 28, 11);
  };

  // 62.05–66.0  Пустая встречная
  S.highway = t => {
    const s = A.bg.highway({ move: t * 2.6, jam: t * .09, dotOn: turn(t), dotR: 13 })
      + `<rect y="700" width="1080" height="200" fill="${P.rust}" opacity="${f(.12 + .08 * Math.sin(t * 9))}"/>`
      + at(690 + Math.sin(t * 2.1) * 10, 1480 + Math.sin(t * 23) * 3, .86, carRear(t));
    const p = pr(t, 62.05, 66.0);
    return cam(s, lerp(580, 620, p), lerp(1080, 1040, p), lerp(1.06, 1.2, p), Math.sin(t * 1.3) * .6) + wind(t, 1.5, 46, 13);
  };

  // 66.0–70.0  Пропуск на зеркале
  S.badge = t => {
    const sw = Math.sin(t * 3.3) * 13 + Math.sin(t * 8) * 2;
    const s = A.bg.highway({ move: t * 2.6, jam: t * .09, dotOn: turn(t), dotR: 15 })
      + `<rect width="1080" height="230" fill="#05060c"/><path d="M0 0h190L70 1330H0zM1080 0h-190l120 1330h70z" fill="#05060c"/>
      <path d="M0 1330Q540 1230 1080 1330V1920H0z" fill="#080a14"/><path d="M0 1330Q540 1230 1080 1330" stroke="#232b44" stroke-width="8" fill="none"/>
      <path d="M540 200v40" stroke="#05060c" stroke-width="26"/><rect x="380" y="230" width="320" height="110" rx="24" fill="#0c1020" stroke="#232b44" stroke-width="8"/>
      <rect x="400" y="250" width="280" height="70" rx="12" fill="${P.rust}" opacity=".35"/>
      <g transform="translate(540 340) rotate(${f(sw)})"><path d="M0 0v170" stroke="${P.pale}" stroke-width="7"/>${at(0, 165, 1.75, A.badge())}</g>`;
    const p = ez(pr(t, 66.0, 69.5));
    return cam(s, 540, lerp(900, 700, p), lerp(1, 1.42, p), Math.sin(t * 1.3) * .5);
  };

  // 70.0–73.5  Зина: «Камни не мигают»
  S.zina2 = t => {
    const sp = (t > 70.75 && t < 72.05) || (t > 72.16 && t < 73.32);
    let lights = '';
    for (let i = 0; i < 6; i++) lights += `<rect x="${f(((i * 330 - t * 1500) % 1700 + 1700) % 1700 - 300)}" y="${f(520 + hash(i) * 380)}" width="200" height="12" rx="6" fill="${i % 2 ? P.amber : P.red}" opacity=".6"/>`;
    const on = turn(t);
    const s = `<rect width="1080" height="1920" fill="#06070e"/><rect x="90" y="260" width="900" height="900" rx="80" fill="url(#gSky)"/>${lights}
      <rect x="90" y="260" width="900" height="900" rx="80" fill="none" stroke="#05060c" stroke-width="50"/>
      <circle cx="540" cy="1700" r="800" fill="url(#gGlow)" opacity=".35"/>
      ${at(540, 1960, 3.6, A.zina({ blink: blink(t, .9), look: -4, keys: false, mouth: sp && talk(t) > .45 ? 'open' : 'flat', aL: 10, aL2: 20 }))}
      ${on ? `<circle cx="522" cy="926" r="9" fill="#fff"/><circle cx="623" cy="926" r="9" fill="#fff"/><circle cx="522" cy="926" r="34" fill="url(#gWhite)" opacity=".7"/><circle cx="623" cy="926" r="34" fill="url(#gWhite)" opacity=".7"/>` : ''}`;
    const p = pr(t, 70.0, 73.5);
    return cam(s, 540, lerp(1020, 950, p), lerp(1, 1.22, ez(p)), Math.sin(t * 1.3) * .4);
  };

  // 73.5–77.35  Это спутник. Его сбили
  S.sat = t => {
    const z = ez(pr(t, 73.5, 74.5)), hitT = 76.11, hit = t >= hitT;
    const sc = lerp(.06, 1.5, z * z) * (1 + .06 * pr(t, 74.5, 77.35));
    let s = `<rect width="1080" height="1920" fill="url(#gSky)"/>${cam(A.stars(3, 120, 1920), 540, 960, 1 + z * .6)}`;
    s += at(540, 860, sc, A.satellite({ rot: t * 46, lamp: turn(t), fire: hit ? 1.5 : 1 }));
    const aim = pr(t, 75.0, hitT);
    if (aim > 0 && !hit) {
      const r = lerp(520, 190, ez(aim));
      s += `<g transform="translate(540 860) rotate(${f(t * 60)})" opacity="${f(aim)}"><circle r="${f(r)}" fill="none" stroke="${P.red}" stroke-width="8" stroke-dasharray="60 40"/><path d="M0 ${f(-r - 60)}v80M0 ${f(r - 20)}v80M${f(-r - 60)} 0h80M${f(r - 20)} 0h80" stroke="${P.red}" stroke-width="8"/></g>`;
    }
    if (hit) {
      const q = t - hitT;
      for (let i = 0; i < 9; i++) { const a = i * .7 + .3, d = 120 + q * (260 + hash(i) * 380); s += `<rect x="-16" y="-10" width="${f(22 + hash(i * 3) * 30)}" height="${f(12 + hash(i * 5) * 16)}" fill="${i % 2 ? '#c9a24a' : '#23486e'}" transform="translate(${f(540 + Math.cos(a) * d)} ${f(860 + Math.sin(a) * d)}) rotate(${f(q * 300 + i * 40)})"/><circle cx="${f(540 + Math.cos(a) * d)}" cy="${f(860 + Math.sin(a) * d)}" r="46" fill="url(#gGlow)" opacity=".7"/>`; }
      s += `<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.max(0, 1 - q * 4))}"/>`;
    }
    return cam(s, 540 + (hit ? Math.sin(t * 70) * 14 * Math.max(0, 1 - (t - hitT) * 2) : 0), 960, 1) + wind(t, .4, 16, 17);
  };

  // 77.35–86.6  Холм
  const hillFolk = (t, o) => at(350, 1548, .62, A.anya(Object.assign({ back: true }, o && o.a))) + at(240, 1556, .62, A.zina(Object.assign({ back: true, keys: false }, o && o.z)));
  S.hill = t => {
    const arr = ez(pr(t, 77.35, 78.3)), carx = lerp(1250, 660, arr);
    const windK = 1 - ez(pr(t, 78.42, 79.2)), birdK = 1 - pr(t, 79.49, 79.75);
    const out = pr(t, 78.5, 79.0);
    const g = ez(pr(t, 82.13, 85.1));     // свет сзади
    let s = A.bg.hill({ dotOn: turn(t), dotR: 18, grass: windK * (.6 + .4 * Math.sin(t * 5)), flap: birdK * Math.max(0, Math.sin(t * 9)), back: 0 });
    if (g > 0) {
      s += `<path d="M-20 1560Q500 1500 1100 1400V1940H-20z" fill="#8a8672" opacity="${f(g * .85)}"/><rect y="900" width="1080" height="1020" fill="url(#gBack)" opacity="${f(g * .55)}"/>`;
      const L = 60 + g * 520;
      [[240, 1556, 34], [350, 1548, 38], [650, 1478, 150]].forEach(q => { s += `<path d="M${q[0] - q[2]} ${q[1]}L${q[0] + q[2]} ${q[1]}L${f(q[0] + q[2] * .5 + (q[0] - 540) * .25)} ${f(q[1] - L)}L${f(q[0] - q[2] * .5 + (q[0] - 540) * .25)} ${f(q[1] - L)}z" fill="#000" opacity="${f(g * .6)}"/>`; });
    }
    s += at(carx, 1478, .75, `<g transform="rotate(-8)">${A.car({ kind: 'sedan', lights: t < 79.2, rot: (1 - arr) * 800 })}</g>`);
    if (out > 0) s += `<g opacity="${f(out)}">${hillFolk(t)}</g>`;
    if (g > 0) s += `<rect width="1080" height="1920" fill="#fff" opacity="${f(g * g * .22)}"/>`;
    const p = pr(t, 77.35, 85.1);
    return cam(s, 540, lerp(1100, 1180, ez(p)), lerp(1, 1.06, p)) + wind(t, 1.2 * windK, 36, 19);
  };
  // 85.1–86.6  Не с той стороны
  S.turn = t => {
    const g = pr(t, 85.1, 86.5);
    const s = A.bg.hill({ dotOn: turn(t), dotR: 18, grass: 0, flap: 0 })
      + `<path d="M-20 1560Q500 1500 1100 1400V1940H-20z" fill="#b8b4a0"/>`
      + at(700, 2150, 2.6, A.zina({ keys: false, mouth: 'open', look: 0, aL: 20, aR: -20 }))
      + at(360, 2260, 2.6, A.anya({ mouth: 'open', worry: 1, look: 0, aL: 14, aR: -14 }))
      + `<rect width="1080" height="1920" fill="url(#gBack)" opacity="${f(.5 + g * .5)}"/><rect width="1080" height="1920" fill="#fff" opacity="${f(g * g * g)}"/>`;
    return cam(s, 540, lerp(1300, 1240, g), lerp(1.1, 1.35, g));
  };
  S.end = t => {
    const wh = 1 - pr(t, 86.6, 86.9), a = pr(t, 87.0, 87.5);
    return `<rect width="1080" height="1920" fill="#000"/><rect width="1080" height="1920" fill="#fff" opacity="${f(wh)}"/>
      <g opacity="${f(a)}"><text x="540" y="900" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">ПРОДОЛЖЕНИЕ</text><text x="540" y="990" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">СЛЕДУЕТ</text>
      <text x="540" y="1090" text-anchor="middle" ${FONT} font-weight="700" font-size="36" letter-spacing="8" fill="${P.pale}" opacity=".7">ПАДЕНИЕ МЕТЕОРИТА · СЕРИЯ 2</text></g>`;
  };

  const TL = [
    [0, 'sky'], [8.55, 'street1'], [10.4, 'anya'], [12.55, 'road'], [17.4, 'photo'], [19.3, 'keys'], [22.9, 'tower'], [25.05, 'wait'],
    [26.3, 'lift'], [29.1, 'office'], [32.4, 'tv'], [38.2, 'zina'], [40.75, 'marks'], [47.1, 'river'], [50.6, 'guilt'], [52.15, 'phone'],
    [54.3, 'empty'], [56.7, 'pocket'], [58.5, 'parking'], [60.3, 'half'], [61.3, 'go'], [62.05, 'highway'], [66.0, 'badge'], [70.0, 'zina2'],
    [73.5, 'sat'], [77.35, 'hill'], [85.1, 'turn'], [86.6, 'end'],
  ];

  // =================== СУБТИТРЫ ===================
  const KEY = new Set('ОСКОЛКОВ БОЛЬШЕ МЕТЕОРИТ ТОЧКА МИГАЛА ПОВОРОТНИК ТАКСИСТКА ОДИННАДЦАТЬ ДОЧКУ ВНУКОМ КЛЮЧИ ДВАДЦАТЬ ПЯТЫЙ ПУСТ ВЕРТОЛЁТ СПОКОЙСТВИЕ ТРАЕКТОРИИ ПОМАДОЙ ПЕРЕЛЕТИТ ПОЛЕ ТЫСЯЧИ ЧУЖИЕ ПОЛБАКА ХВАТИТ ГОРЯЧИЙ ОРБИТА СПУТНИКОВАЯ СВЯЗЬ КАМНИ СПУТНИК СТИХ ЗАМОЛЧАЛИ СВЕТ ЗАЛОГ ПУСТАЯ ДОЧКЕ'.split(' '));
  const RED = new Set('НЕВЕРНЫ СЕВЕРНЕЕ САМА СЕТИ СБИЛИ ВЕРНУЛСЯ МИГАЮТ'.split(' '));
  const chunks = [];
  (function () {
    let cur = [];
    const flush = () => { if (cur.length) { chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; } };
    W.forEach(w => {
      const txt = w.w.replace(/[«».,:!?—]/g, '').toUpperCase();
      if (!txt) { flush(); return; }
      const len = cur.reduce((n, x) => n + x.t.length + 1, 0) + txt.length;
      if (cur.length && (len > 16 || cur.length >= 4)) flush();
      cur.push({ t: txt, s: w.s, e: w.e });
      if (/[.,:!?»]$/.test(w.w)) flush();
    });
    flush();
    chunks.forEach((c, i) => { c.end = i + 1 < chunks.length ? Math.min(chunks[i + 1].s, c.e + .7) : c.e + .5; });
    const last = chunks[chunks.length - 1]; last.allRed = true;
  })();
  function subs(t) {
    const c = chunks.find(c => t >= c.s - .04 && t < c.end);
    if (!c) return '';
    const n = c.words.reduce((k, x) => k + x.t.length + 1, -1);
    const fs = Math.min(104, 960 / (n * .69));
    const pop = lerp(.86, 1, ez(pr(t, c.s - .04, c.s + .1)));
    const sp = c.words.map((w, i) => {
      const said = t >= w.s - .03;
      const col = c.allRed || RED.has(w.t) ? P.red : KEY.has(w.t) ? P.amber : '#fff';
      return `<tspan fill="${said ? col : '#8f97ad'}" fill-opacity="${said ? 1 : .75}">${i ? ' ' : ''}${w.t}</tspan>`;
    }).join('');
    return `<rect y="1290" width="1080" height="300" fill="url(#gSub)"/>
      <g transform="translate(540 1470) scale(${f(pop * 100) / 100})"><text text-anchor="middle" ${FONT} font-weight="900" font-size="${f(fs)}" stroke="#05070f" stroke-width="${f(fs * .2)}" stroke-linejoin="round" paint-order="stroke" xml:space="preserve">${sp}</text></g>`;
  }

  function frame(t) {
    let i = TL.length - 1;
    while (i > 0 && TL[i][0] > t) i--;
    const cutIn = 1 - pr(t, TL[i][0], TL[i][0] + .14);
    return A.defs() + EXTRA_DEFS + `<rect width="1080" height="1920" fill="#05070f"/>` + S[TL[i][1]](t)
      + `<rect width="1080" height="1920" fill="url(#gVig)"/>`
      + (cutIn > 0 && i > 0 && TL[i][1] !== 'end' ? `<rect width="1080" height="1920" fill="#05070f" opacity="${f(cutIn * .55)}"/>` : '')
      + (t < 86.5 ? subs(t) : '');
  }
  window.FILM = { DUR, FPS: 30, TL, chunks, renderAt(t) { document.getElementById('stage').innerHTML = frame(t); } };
})();
