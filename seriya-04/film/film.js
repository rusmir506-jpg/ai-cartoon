// Серия 4 «Вахта» — анимация. renderAt(t) рисует кадр для секунды t озвучки.
(function () {
  const A = ART, P = A.P, W = window.SLOVA;
  const DUR = 67.5;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const pr = (t, a, b) => cl((t - a) / (b - a));
  const ez = x => x * x * (3 - 2 * x);
  const lerp = (a, b, x) => a + (b - a) * x;
  const f = n => Math.round(n * 10) / 10;
  const turn = t => Math.floor(t / 0.42) % 2 === 0;
  const blink = (t, ph = 0) => ((t + ph) % 3.3) < 0.13;
  const talk = t => 0.5 + 0.5 * Math.sin(t * 19) * Math.sin(t * 7.3);
  const cam = (inner, cx, cy, s, rot = 0) => `<g transform="translate(540 960) rotate(${f(rot)}) scale(${s.toFixed(4)}) translate(${f(-cx)} ${f(-cy)})">${inner}</g>`;
  const at = (x, y, s, inner, rot = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">${inner}</g>`;
  const FONT = 'font-family="Inter, DejaVu Sans, sans-serif"';
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

  const EXTRA_DEFS = `<defs>
    <radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070f" stop-opacity="0"/><stop offset=".5" stop-color="#05070f" stop-opacity=".62"/><stop offset="1" stop-color="#05070f" stop-opacity="0"/></linearGradient>
  </defs>`;
  function tag(text, y, a, col) {
    if (a <= 0) return '';
    const w = text.length * 25 + 70;
    return `<g opacity="${f(a)}" transform="translate(${540 - w / 2} ${y})"><rect width="${w}" height="72" rx="36" fill="#05070f" opacity=".82"/><rect width="${w}" height="72" rx="36" fill="none" stroke="${col || P.ember}" stroke-width="3"/><text x="${w / 2}" y="48" text-anchor="middle" ${FONT} font-weight="800" font-size="34" letter-spacing="3" fill="${P.pale}">${text}</text></g>`;
  }
  const fadeTag = (t, a, b) => Math.min(pr(t, a, a + .25), 1 - pr(t, b - .25, b));
  function familyPhoto() {
    return `<g><rect x="-115" y="-140" width="230" height="280" rx="6" fill="${P.pale}"/><rect x="-98" y="-124" width="196" height="208" fill="#1a2540"/>
      <path d="M-98 84v-40q30 -60 78 -60t70 60v40z" fill="#7a2733"/><circle cx="-24" cy="-44" r="40" fill="#d6a58a"/>
      <path d="M-66 -40q0 -52 44 -52q42 0 42 50q-20 -30 -52 -26q-18 30 -34 28z" fill="#5a3a2a"/>
      <circle cx="-38" cy="-42" r="4" fill="#1a1414"/><circle cx="-10" cy="-42" r="4" fill="#1a1414"/><path d="M-36 -24q12 10 26 0" stroke="#7a2733" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M20 84v-20q14 -36 40 -36t38 36v20z" fill="${P.amber}"/><circle cx="58" cy="2" r="30" fill="#e0b294"/>
      <path d="M28 -4q4 -32 32 -30q28 2 28 30q-28 -18 -60 0z" fill="#3a2a22"/>
      <circle cx="48" cy="4" r="3.5" fill="#1a1414"/><circle cx="68" cy="4" r="3.5" fill="#1a1414"/><path d="M50 16q8 8 18 0" stroke="#7a2733" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <text x="-50" y="122" text-anchor="middle" ${FONT} font-weight="800" font-size="26" fill="#1d2338">ЛЕНА</text><text x="58" y="122" text-anchor="middle" ${FONT} font-weight="800" font-size="26" fill="#1d2338">ТЁМА</text></g>`;
  }
  // карта на экране штаба: поле, элеватор, ракета и зона удара
  function map(t, o) {
    o = Object.assign({ arc: 0, zone: 0, missileP: 0 }, o);
    const mx = lerp(220, -60, o.missileP), my = lerp(-150, -10, o.missileP) - 90 * Math.sin(o.missileP * Math.PI);
    return `<g><rect x="-260" y="-200" width="520" height="340" rx="14" fill="#05060c" stroke="#232b44" stroke-width="10"/>
      <rect x="-240" y="-180" width="480" height="300" fill="#0c1a2a"/>
      <path d="M-240 60h480M-240 -40h480M-120 -180v300M40 -180v300" stroke="${P.tv}" stroke-width="2" opacity=".3"/>
      <rect x="-200" y="-40" width="230" height="120" fill="${P.tv}" opacity=".12"/><text x="-85" y="100" text-anchor="middle" ${FONT} font-weight="800" font-size="20" fill="${P.tv}">ПОЛЕ</text>
      <rect x="-226" y="-26" width="22" height="40" fill="${P.amber}"/><text x="-215" y="-34" text-anchor="middle" ${FONT} font-weight="800" font-size="15" fill="${P.amber}">ЭЛЕВАТОР</text>
      <circle cx="-85" cy="20" r="10" fill="#fff"/>
      ${o.arc ? `<path d="M240 -160Q120 -190 -85 20" pathLength="100" stroke="${P.red}" stroke-width="5" fill="none" stroke-dasharray="${f(o.arc * 100)} 200"/>` : ''}
      ${o.missileP ? `<circle cx="${f(mx)}" cy="${f(my)}" r="8" fill="${P.red}"/>` : ''}
      ${o.zone ? `<circle cx="-85" cy="20" r="${f(150 * o.zone)}" fill="${P.red}" opacity="${f(.25 + .15 * Math.sin(t * 10))}" stroke="${P.red}" stroke-width="4"/>
        <text x="150" y="100" text-anchor="middle" ${FONT} font-weight="900" font-size="28" fill="${P.red}" opacity="${f(o.zone)}">ЗОНА УДАРА</text>` : ''}
      <text x="-226" y="-150" ${FONT} font-weight="800" font-size="20" fill="${P.tv}">ОРБИТА · ВЕДЕНИЕ</text></g>`;
  }
  function phoneBig(t, o) { // o.bars 0..4, o.ring
    const rings = o.ring ? [0, 1, 2].map(i => { const p = ((t * 1.6 + i / 3) % 1); return `<circle cx="0" cy="-150" r="${f(70 + p * 110)}" fill="none" stroke="#5ad17a" stroke-width="6" opacity="${f(.7 * (1 - p))}"/>`; }).join('') : '';
    return `<g><rect x="-230" y="-430" width="460" height="860" rx="56" fill="#0a0c14" stroke="#3a4260" stroke-width="10"/>
      <rect x="-200" y="-390" width="400" height="780" rx="24" fill="#14213c"/>
      ${rings}<circle cx="0" cy="-150" r="78" fill="#d6a58a"/><path d="M-82 -146q0 -100 86 -100q82 0 80 96q-40 -56 -100 -50q-34 56 -66 54z" fill="#5a3a2a"/>
      <circle cx="-26" cy="-148" r="7" fill="#1a1414"/><circle cx="26" cy="-148" r="7" fill="#1a1414"/><path d="M-24 -112q24 18 48 0" stroke="#7a2733" stroke-width="7" fill="none" stroke-linecap="round"/>
      <text x="0" y="20" text-anchor="middle" ${FONT} font-weight="900" font-size="74" fill="${P.pale}">ДОЧКА</text>
      <text x="0" y="96" text-anchor="middle" ${FONT} font-weight="600" font-size="40" fill="#5ad17a">${o.ring ? 'входящий вызов' : ''}</text>
      <g transform="translate(120 -350)">${[0, 1, 2, 3].map(i => `<rect x="${i * 16}" y="${-i * 8}" width="10" height="${10 + i * 8}" fill="${i < o.bars ? '#5ad17a' : '#3a4260'}"/>`).join('')}</g>
      <circle cx="-110" cy="270" r="62" fill="#3aa85a"/><path d="M-140 270h60" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
      <circle cx="110" cy="270" r="62" fill="${P.red}"/><path d="M80 270h60" stroke="#fff" stroke-width="14" stroke-linecap="round"/></g>`;
  }
  function carRear(t) {
    return `<g><ellipse cx="0" cy="24" rx="190" ry="20" fill="#000" opacity=".5"/>
      <rect x="-150" y="-12" width="54" height="46" rx="10" fill="#05060c"/><rect x="96" y="-12" width="54" height="46" rx="10" fill="#05060c"/>
      <path d="M-112 -186q112 -96 224 0z" fill="${P.sedan}"/><rect x="-158" y="-196" width="316" height="196" rx="34" fill="${P.sedan}"/>
      <path d="M-104 -178q104 -74 208 0v54h-208z" fill="#0c1426"/>
      <circle cx="-46" cy="-150" r="27" fill="#05070f"/><path d="M-74 -160q28 -34 56 0z" fill="#05070f"/><circle cx="48" cy="-140" r="26" fill="#05070f"/>
      <rect x="-158" y="-44" width="316" height="44" rx="14" fill="#1a2c40"/>
      <circle cx="-116" cy="-96" r="60" fill="url(#gRed)"/><circle cx="116" cy="-96" r="60" fill="url(#gRed)"/>
      <rect x="-148" y="-110" width="64" height="28" rx="8" fill="${P.red}"/><rect x="84" y="-110" width="64" height="28" rx="8" fill="${P.red}"/></g>`;
  }

  function wind(t, k, n = 34, seed = 1) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 500 + hash(i + seed) * 700, y = hash(i * 3.1 + seed) * 1920 + Math.sin(t * 2 + i) * 24;
      const x = 1080 - (((hash(i * 7.7 + seed) * 1400 + t * sp * k) % 1400) - 160);
      s += i % 3 === 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2 + hash(i) * 3)}" fill="${P.ember}" opacity="${f(.5 * k)}"/>` : `<path d="M${f(x)} ${f(y)}h${f(30 + hash(i * 1.3) * 90)}" stroke="${P.amber}" stroke-width="3" stroke-linecap="round" opacity="${f(.16 * k)}"/>`;
    }
    return s;
  }
  const S = {};
  // 0–2.85 старт у элеватора: две минуты
  S.start = t => {
    const go = ez(pr(t, .6, 2.85));
    const s = A.bg.yard({}) + at(lerp(820, 1500, go * go), 1640, 1, A.car({ kind: 'sedan', lights: true, rot: go * 900 }));
    return cam(s, 700, 1400, 1.1) + `<g transform="translate(540 330)"><rect x="-200" y="-80" width="400" height="160" rx="22" fill="#05060c" stroke="${P.red}" stroke-width="6"/><text x="0" y="40" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="100" fill="${P.red}">${t < 2 ? '2:00' : '1:58'}</text></g>`;
  };
  // 2.85–7.35 напрямик через поле
  S.drive = t => {
    let tents = '';
    for (let i = 0; i < 8; i++) { const q = ((i / 8 + (t - 2.85) * .5) % 1), z = Math.pow(q, 2), side = i % 2 ? 1 : -1; tents += at(540 + side * (60 + z * 760), 900 + z * 820, .15 + z * 2.4, A.tent(260, 160, i % 3 === 0, '#2c3530')); }
    const s = `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(8, 60, 800)}<rect y="880" width="1080" height="1040" fill="#0c120c"/>
      ${at(540, 890, lerp(.1, .18, pr(t, 2.85, 7.35)), A.landed({ hatch: 1 }))}${tents}
      ${at(540 + Math.sin(t * 2.3) * 30, 1640 + Math.sin(t * 23) * 5, .9, carRear(t))}`;
    return cam(s, 540, 1050, 1.05, Math.sin(t * 1.4) * 1.2) + tag('800 МЕТРОВ', 230, fadeTag(t, 3.0, 5.0));
  };
  // 7.35–11.4 тенты рвутся о капот, ветер в лицо
  S.tents = t => {
    const hit = t > 8.1 ? Math.max(0, 1 - (t - 8.1) * 1.5) : 0;
    let cloth = '';
    if (t > 7.9 && t < 9.4) { const q = pr(t, 7.9, 9.4); cloth = `<path d="M${f(-200 + 1500 * q)} 300q-200 300 -60 700q300 -200 500 -650z" fill="#3a4a3a" opacity=".9"/><path d="M${f(-200 + 1500 * q)} 300l-40 900" stroke="#c8c0a0" stroke-width="5"/>`; }
    const s = `<rect width="1080" height="1920" fill="#06070e"/><rect x="90" y="260" width="900" height="900" rx="80" fill="url(#gSky)"/>
      ${at(540, 900, .3, A.landed({ hatch: 1 }))}<rect x="90" y="900" width="900" height="260" fill="#0c120c"/>
      ${cloth}<rect x="90" y="260" width="900" height="900" rx="80" fill="none" stroke="#05060c" stroke-width="50"/>
      <path d="M0 1160Q540 1080 1080 1160V1920H0z" fill="#0b0e1a"/>
      ${at(540, 2240, 2.7, A.anya({ worry: 1, aL: -40, aL2: 55, aR: 40, aR2: -55, blink: blink(t), look: 0 }))}`;
    return cam(s, 540 + hit * Math.sin(t * 60) * 14, 1050, lerp(1.0, 1.08, pr(t, 7.35, 11.4))) + wind(t, 1.5, 50, 4);
  };
  // 11.4–14.4 телефон: четыре полоски
  S.bars = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="800" r="900" fill="url(#gTv)" opacity=".35"/>
      <path d="M-200 1950L330 1350" stroke="#2c5364" stroke-width="230" stroke-linecap="round"/>
      <g transform="translate(540 820) rotate(-6)"><rect x="-230" y="-430" width="460" height="860" rx="56" fill="#0a0c14" stroke="#3a4260" stroke-width="10"/><rect x="-200" y="-390" width="400" height="780" rx="24" fill="#14213c"/>
        <g transform="translate(-130 60)">${[0, 1, 2, 3].map(i => `<rect x="${i * 70}" y="${-i * 60 - 60}" width="50" height="${60 + i * 60}" rx="6" fill="${t > 12.5 + i * .3 ? '#5ad17a' : '#3a4260'}"/>`).join('')}</g>
        <text x="0" y="200" text-anchor="middle" ${FONT} font-weight="900" font-size="60" fill="#5ad17a">СЕТЬ</text></g>`;
    return cam(s, 540, 900, lerp(1.0, 1.1, pr(t, 11.4, 14.4)));
  };
  // 14.4–16.45 посреди пустого поля
  S.emptyF = t => cam(A.bg.emptyField({ objS: .35, objY: 1220, hatch: 1 }), 540, lerp(1150, 1220, pr(t, 14.4, 16.45)), lerp(1.0, 1.1, pr(t, 14.4, 16.45)));
  // 16.45–18.45 Зина: ракета идёт не на поле
  S.zina = t => {
    const s = `<rect width="1080" height="1920" fill="#06070e"/><circle cx="540" cy="700" r="900" fill="url(#gTv)" opacity=".35"/>`
      + at(540, 1900, 3.0, A.zina({ blink: blink(t, .4), look: 0, keys: false, mouth: talk(t) > .45 ? 'open' : 'flat' }));
    return cam(s, 540, 1000, lerp(1.0, 1.1, pr(t, 16.45, 18.45)));
  };
  // 18.45–21.3 ракета поправляет курс
  S.course = t => {
    const p = pr(t, 18.45, 21.3), bend = ez(pr(t, 19.0, 20.0));
    const path = `M${f(1000)} ${f(1150)}Q${f(820)} ${f(lerp(700, 900, bend))} ${f(lerp(600, 480, bend))} ${f(lerp(600, 760, bend))}`;
    const s = A.bg.emptyField({ objS: .3, objY: 1180, hatch: 1 }) + `<path d="${path}" stroke="${P.red}" stroke-width="5" fill="none" stroke-dasharray="20 14" opacity=".8"/>`
      + at(lerp(1000, lerp(600, 480, bend), p), lerp(1150, lerp(600, 760, bend), p), .35, A.missile({}), lerp(-40, 150 + 20 * bend, p))
      + (t > 20.6 ? `<g transform="translate(540 1180)">${[0, 1, 2].map(i => { const q = ((t * 1.2 + i / 3) % 1); return `<circle r="${f(10 + q * 120)}" fill="none" stroke="#5ad17a" stroke-width="4" opacity="${f(1 - q)}"/>`; }).join('')}</g>` : '');
    return cam(s, 700, 950, lerp(1.2, 1.35, p)) + tag('ИДЁТ НА СИГНАЛ', 230, fadeTag(t, 20.5, 21.3), P.red);
  };
  // 21.3–25.65 машина в канаве, дальше бегом
  S.ditch = t => {
    const crash = t > 23.35, run = ez(pr(t, 24.6, 25.65));
    const s = A.bg.emptyField({ objS: 1.0, objY: 1500, hatch: 1 })
      + (crash ? at(560, 1740, .55, A.carInDitch(t)) : at(lerp(-200, 560, ez(pr(t, 21.3, 23.35))), 1740, .55, A.car({ kind: 'sedan', lights: true, rot: t * 800 })))
      + (t > 24.3 ? at(lerp(620, 520, run), lerp(1760, 1640, run), .45, A.anya({ walk: t * 14, worry: 1, aL: -30, aR: 30 })) + at(lerp(700, 640, run), 1770, .42, A.zina({ walk: t * 11, keys: false })) : '');
    return cam(s, 540, 1450, 1.2) + (crash ? `<rect width="1080" height="1920" fill="#fff" opacity="${f(.3 * Math.max(0, 1 - (t - 23.35) * 4))}"/>` : '');
  };
  // 25.65–29.95 он стоит рядом с Тёмой: сначала силуэт, потом скафандр
  S.figure = t => {
    const lit = ez(pr(t, 27.2, 27.8));
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1, glow: 1.1 })
      + `<g opacity="${f(1 - lit)}">${at(640, 1830, .95, A.stranger({ reach: .45, eyes: 1 }))}</g>`
      + `<g opacity="${f(lit)}">${at(640, 1830, 1.0, A.kostya({ aR: 25, aR2: 30, lamps: 1 }))}</g>`
      + at(400, 1840, 1.05, A.tyoma({ back: true, cap: false, aR: -30, aR2: -40 }));
    return cam(s, 520, lerp(1450, 1400, pr(t, 25.65, 29.95)), lerp(1.25, 1.4, pr(t, 25.65, 29.95)));
  };
  // 29.95–31.25 Лена не кричала
  S.lena = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="900" fill="url(#gWhite)" opacity=".2"/>` + at(540, 2050, 3.2, A.lena({ blink: blink(t), look: 3 }));
    return cam(s, 540, 950, lerp(1.0, 1.08, pr(t, 29.95, 31.25)));
  };
  // 31.25–35.0 нашивка «Орбита»
  S.patch = t => {
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1 }) + at(640, 1830, 1.0, A.kostya({ aR: 25, aR2: 30 }));
    const z = ez(pr(t, 31.3, 33.6));
    return cam(s, lerp(600, 566, z), lerp(1300, 1350, z), lerp(1.3, 4.0, z));
  };
  // 35.0–39.85 «на вахту» — Лена, слёзы
  S.vakhta = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="900" fill="url(#gTv)" opacity=".3"/>` + at(540, 2050, 3.2, A.lena({ blink: blink(t, 1), look: 2 }))
      + `<circle cx="${f(540 - 14 * 3.2 + 2 * 3.2)}" cy="${f(2050 - 345 * 3.2 + ((t - 35) * 40) % 120)}" r="8" fill="${P.tv}" opacity=".8"/>`;
    return cam(s, 540, lerp(950, 920, pr(t, 35, 39.85)), lerp(1.05, 1.2, pr(t, 35, 39.85))) + tag('«НА ВАХТУ»', 230, fadeTag(t, 36.8, 39.6));
  };
  // 39.85–43.25 стекло шлема поднимается — Костя
  S.visor = t => {
    const up = t > 41.0;
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1 }) + at(540, 2700, 2.6, A.kostya({ visor: up ? 'up' : 'down', aR: up ? 150 : 25, aR2: up ? 200 : 30, blink: blink(t) }))
      + (t > 40.8 && t < 41.2 ? `<rect width="1080" height="1920" fill="#fff" opacity=".25"/>` : '');
    return cam(s, 540, lerp(1150, 1180, pr(t, 39.85, 43.25)), lerp(1.0, 1.12, ez(pr(t, 41.8, 43.2))));
  };
  // 43.25–45.4 Лена шагнула — и остановилась
  S.step = t => {
    const st = ez(pr(t, 43.3, 44.4));
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1 }) + at(700, 1830, 1.0, A.kostya({ visor: 'up', look: -4 }))
      + at(lerp(220, 380, st), 1850, 1.1, A.lena({ walk: t < 44.4 ? t * 9 : 0, look: 4 })) + at(470, 1850, .95, A.tyoma({ back: true, cap: false }));
    return cam(s, 500, 1450, 1.25);
  };
  // 45.4–49.1 «Здравствуйте, Анна Петровна»
  S.hello = t => {
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1 }) + at(540, 2700, 2.6, A.kostya({ visor: 'up', mouth: t < 47.0 && talk(t) > .4 ? 'open' : 'flat', look: -4, blink: blink(t) }));
    return cam(s, 540, 1180, lerp(1.12, 1.2, pr(t, 45.4, 49.1)));
  };
  // 49.1–52.95 «Сигнал — это я»
  S.signal = t => {
    const z = ez(pr(t, 50.1, 51.2));
    const s = A.bg.emptyField({ objS: 1.5, objY: 1750, hatch: 1 }) + at(540, 2700, 2.6, A.kostya({ visor: 'up', mouth: talk(t) > .4 ? 'open' : 'flat', aR: 120, aR2: 250, beacon: turn(t) }));
    return cam(s, 540, lerp(1180, 1600, z), lerp(1.2, 2.0, z));
  };
  // 52.95–55.1 одна минута
  S.watch1 = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="800" fill="url(#gRed)" opacity="${f(.4 + .1 * Math.sin(t * 16))}"/>` + at(540, 640, 2.0, A.watch('1:00', .8), -6);
    return cam(s, 540 + Math.sin(t * 50) * 3, 960, lerp(1.1, 1.25, pr(t, 52.95, 55.1)));
  };
  // 55.1–59.8 отпустил руку и ушёл в поле, один
  S.walk = t => {
    const w = ez(pr(t, 56.4, 59.6));
    const s = A.bg.emptyField({ objS: .9, objY: 1400, hatch: 1 })
      + at(lerp(620, 860, w), lerp(1700, 1360, w), lerp(.75, .3, w), A.kostya({ walk: t * 8, beacon: turn(t), lamps: 1 }))
      + at(450, 1720, .8, A.tyoma({ back: true, cap: false, aR: t < 56.0 ? -60 : -10, aR2: t < 56.0 ? -80 : -4 })) + at(320, 1720, .75, A.lena({ look: 3 }));
    return cam(s, lerp(520, 620, w), lerp(1450, 1400, w), lerp(1.25, 1.1, w)) + tag('ОДИН', 230, fadeTag(t, 58.2, 59.7));
  };
  // 59.8–62.25 ракета поворачивает за ним
  S.turnM = t => {
    const p = ez(pr(t, 60.2, 62.1));
    const s = A.bg.emptyField({ objS: .35, objY: 1200, hatch: 1 }) + at(860, 1210, .12, A.kostya({ beacon: turn(t) }))
      + at(lerp(300, 620, p), lerp(500, 640, p), .45, A.missile({}), lerp(10, 40, p))
      + `<path d="M300 500Q600 520 860 1180" stroke="${P.red}" stroke-width="4" fill="none" stroke-dasharray="16 14" opacity="${f(p)}"/>`;
    return cam(s, 600, 850, lerp(1.15, 1.25, p));
  };
  // 62.25–65.5 Тёма побежал за отцом
  S.run = t => {
    const r = ez(pr(t, 62.8, 65.4));
    const s = A.bg.emptyField({ objS: .9, objY: 1400, hatch: 1 }) + at(880, 1330, .26, A.kostya({ walk: t * 8, beacon: turn(t) }))
      + at(330, 1730, .8, A.lena({ aR: 60, aR2: 100, mouth: 'open', look: 4 }))
      + at(lerp(430, 760, r), lerp(1720, 1420, r), lerp(.8, .45, r), A.tyoma({ walk: t * 15, back: true, cap: false }))
      + `<rect width="1080" height="1920" fill="${P.red}" opacity="${f(.06 + .06 * Math.sin(t * 10))}"/>`;
    return cam(s, lerp(520, 640, r), 1500, lerp(1.2, 1.3, r));
  };
  S.end = t => {
    const a = pr(t, 65.8, 66.3);
    return `<rect width="1080" height="1920" fill="#000"/>
      <g opacity="${f(a)}"><text x="540" y="900" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">ПРОДОЛЖЕНИЕ</text><text x="540" y="990" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">СЛЕДУЕТ</text>
      <text x="540" y="1090" text-anchor="middle" ${FONT} font-weight="700" font-size="36" letter-spacing="8" fill="${P.pale}" opacity=".7">ПАДЕНИЕ МЕТЕОРИТА · СЕРИЯ 5</text></g>`;
  };

  const TL = [
    [0, 'start'], [2.85, 'drive'], [7.35, 'tents'], [11.4, 'bars'], [14.4, 'emptyF'], [16.45, 'zina'], [18.45, 'course'], [21.3, 'ditch'],
    [25.65, 'figure'], [29.95, 'lena'], [31.25, 'patch'], [35.0, 'vakhta'], [39.85, 'visor'], [43.25, 'step'], [45.4, 'hello'], [49.1, 'signal'],
    [52.95, 'watch1'], [55.1, 'walk'], [59.8, 'turnM'], [62.25, 'run'], [65.5, 'end'],
  ];

  // ---------- субтитры ----------
  const KEY = new Set('ДВЕ МИНУТЫ ПОЛ БАКА НАПРЯМИК ПАЛАТКИ ГОРЯЧИЙ ВЕТЕР СЕТЬ ЧЕТЫРЕ ПОЛОСКИ ПУСТОГО КАНАВУ БЕГОМ ТЁМОЙ СКАФАНДРЕ НАШИВКУ ОРБИТА ВАХТУ ШЛЕМА КОСТЯ ПЕТРОВНА ОДНА МИНУТА ОДИН ТЁМА'.split(' '));
  const RED = new Set('РАКЕТА СИГНАЛ КРАСНАЯ БИТЬ СЮДА ПОВЕРНУЛА ВЫРВАЛСЯ'.split(' '));
  const chunks = [];
  (function () {
    let cur = [];
    const flush = () => { if (cur.length) { chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; } };
    W.forEach(w => {
      const txt = w.w.replace(/[«».,:!?—…]/g, '').toUpperCase();
      if (!txt) { flush(); return; }
      const len = cur.reduce((n, x) => n + x.t.length + 1, 0) + txt.length;
      if (cur.length && (len > 16 || cur.length >= 4)) flush();
      cur.push({ t: txt, s: w.s, e: w.e });
      if (/[.,:!?»…]$/.test(w.w)) flush();
    });
    flush();
    chunks.forEach((c, i) => { c.end = i + 1 < chunks.length ? Math.min(chunks[i + 1].s, c.e + .7) : c.e + .5; });
    chunks[chunks.length - 1].allRed = true;
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
      + (t < 65.5 ? subs(t) : '');
  }
  window.FILM = { DUR, FPS: 30, TL, chunks, renderAt(t) { document.getElementById('stage').innerHTML = frame(t); } };
})();
