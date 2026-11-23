// Серия 5 «Последний рейс» (финал) — анимация. renderAt(t) рисует кадр для секунды t озвучки.
(function () {
  const A = ART, P = A.P, W = window.SLOVA;
  const DUR = 72.0;
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
  const SKY = '<rect width="1080" height="1920" fill="url(#gSky)"/>';
  const S = {};
  const field = (o) => A.bg.emptyField(Object.assign({ objS: 1.0, objY: 1450, hatch: 1 }, o || {}));
  // 0–4.5 последний осколок — маячок на груди Кости
  S.open = t => {
    const z = ez(pr(t, 1.8, 4.4));
    const s = field({ objS: .7, objY: 1300 }) + at(820, 1400, .45, A.kostya({ walk: t * 8, beacon: turn(t) }));
    return cam(s, lerp(540, 820, z), lerp(1150, 1205, z), lerp(1.0, 4.2, z)) + tag('СЕРИЯ 5 · ПОСЛЕДНИЙ РЕЙС', 230, fadeTag(t, .1, 2.0));
  };
  // 4.5–9.95 Тёма бежит, я — за ним
  S.chase = t => {
    const p = pr(t, 4.5, 9.95);
    const s = field({ objS: .8, objY: 1380 }) + at(900, 1360, .3, A.kostya({ walk: t * 8, beacon: turn(t) }))
      + at(lerp(420, 700, p), lerp(1700, 1520, p), lerp(.75, .55, p), A.tyoma({ walk: t * 15, back: true, cap: false }))
      + (t > 6.4 ? at(lerp(240, 560, pr(t, 6.4, 9.95)), lerp(1800, 1600, pr(t, 6.4, 9.95)), .75, A.anya({ walk: t * 13, worry: 1, aL: -40, aR: 40 })) : '');
    return cam(s, lerp(480, 640, p), lerp(1500, 1450, p), 1.2) + wind(t, .6, 24, 3);
  };
  // 9.95–14.7 поймала у канавы; Костя обернулся
  S.catch = t => {
    const turned = t > 12.6;
    const s = field({ objS: 1.2, objY: 1600 }) + at(560, 1820, .5, A.carInDitch(t))
      + at(860, 1700, .7, A.kostya({ visor: turned ? 'up' : 'down', beacon: turn(t), look: -4 }))
      + at(420, 1820, 1.0, A.anya({ worry: 1, aR: -40, aR2: -70, aL: 40, aL2: 70 })) + at(470, 1830, .9, A.tyoma({ cap: false, look: 3 }));
    return cam(s, lerp(520, 640, ez(pr(t, 12.2, 13.6))), 1500, 1.3);
  };
  // 14.7–19.7 сорок секунд; Зина идёт со связкой
  S.forty = t => {
    const w = pr(t, 17.4, 19.6);
    const s = field({ objS: 1.2, objY: 1600 }) + at(860, 1760, .8, A.kostya({ visor: 'up', beacon: turn(t) }))
      + at(lerp(300, 640, w), 1800, .8, A.zina({ walk: t * 10, keys: true, aL: 20, aL2: 30 }))
      + `<g transform="translate(540 330)"><rect x="-200" y="-80" width="400" height="160" rx="22" fill="#05060c" stroke="${P.red}" stroke-width="6"/><text x="0" y="40" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="100" fill="${P.red}">0:${String(Math.max(0, 40 - Math.floor(t - 14.9))).padStart(2, '0')}</text></g>`;
    return cam(s, 600, 1480, 1.25);
  };
  // 19.7–23.1 тридцать лет открывала любые замки — башня, связка
  S.keys30 = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="url(#gGlow)" opacity=".25"/>`
      + at(540, 900, 5.5, A.keys(true), Math.sin(t * 3) * 10);
    return cam(s, 540, 960, lerp(1.0, 1.15, pr(t, 19.7, 23.1))) + tag('30 ЛЕТ — ЛЮБЫЕ ЗАМКИ', 230, fadeTag(t, 20.0, 23.0));
  };
  // 23.1–28.4 поддела маячок — щёлк
  S.pry = t => {
    const off = t > 25.95, lift = ez(pr(t, 26.0, 27.0));
    const s = `<rect width="1080" height="1920" fill="#d8dbe2"/><rect x="0" y="1000" width="1080" height="40" fill="${P.ember}"/>
      <rect x="330" y="560" width="420" height="300" rx="30" fill="#3a3f52" opacity="${off ? .5 : 1}"/>
      ${off ? '' : `<g transform="translate(540 710) scale(2.4)">${A.beaconDevice(turn(t))}</g>`}
      <path d="M-200 1950L${f(lerp(380, 420, pr(t, 23.5, 25.9)))} 900" stroke="#2c5364" stroke-width="210" stroke-linecap="round"/>
      ${off ? `<g transform="translate(${f(lerp(540, 380, lift))} ${f(lerp(710, 820, lift))}) scale(2.4)">${A.beaconDevice(true)}</g>` : `${at(470, 830, 3.2, A.keys(true), -20 + Math.sin(t * 20) * 4)}`}
      <ellipse cx="${off ? f(lerp(470, 330, lift)) : 450}" cy="${off ? f(lerp(900, 960, lift)) : 920}" rx="90" ry="70" fill="#d6a58a"/>
      ${t > 25.95 && t < 26.2 ? `<rect width="1080" height="1920" fill="#fff" opacity=".5"/>` : ''}`;
    return cam(s, 540, 860, lerp(1.0, 1.1, pr(t, 23.1, 28.4)));
  };
  // 28.4–31.55 сигналом был маячок
  S.device = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/>` + at(540, 820, 4.2, A.beaconDevice(turn(t)))
      + (t > 29.9 ? `<g transform="translate(540 820)">${[0, 1, 2].map(i => { const q = ((t * 1.2 + i / 3) % 1); return `<circle r="${f(120 + q * 420)}" fill="none" stroke="${P.red}" stroke-width="6" opacity="${f(1 - q)}"/>`; }).join('')}</g>` : '');
    return cam(s, 540, 900, lerp(1.0, 1.12, pr(t, 28.4, 31.55)));
  };
  // 31.55–34.6 Костя упёрся в бампер — машина выползла
  S.push = t => {
    const out = ez(pr(t, 33.0, 34.4));
    const s = field({ objS: 1.2, objY: 1600 })
      + (out < .5 ? at(540, 1760, .9, A.carInDitch(t)) : at(lerp(470, 560, out), 1760, .9, A.car({ kind: 'sedan', lights: true })))
      + at(lerp(160, 120, out), 1800, .8, A.kostya({ visor: 'up', aL: -80, aL2: -90, aR: -70, aR2: -90 }));
    return cam(s, 480, 1500, 1.3) + (out > .4 && out < .6 ? `<rect width="1080" height="1920" fill="#000" opacity=".2"/>` : '');
  };
  // 34.6–40.55 взяла маячок: последний рейс — мой
  S.take = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="url(#gRed)" opacity="${f(.25 + .1 * turn(t))}"/>`
      + at(540, 2300, 3.4, A.anya({ worry: .3, mouth: 'flat', aR: 30, aR2: 150, blink: blink(t) }))
      + at(820, 1080, 1.4, A.beaconDevice(turn(t)));
    return cam(s, 540, lerp(1000, 960, pr(t, 34.6, 40.55)), lerp(1.0, 1.15, ez(pr(t, 34.6, 40.55)))) + tag('ПОСЛЕДНИЙ РЕЙС', 230, fadeTag(t, 38.8, 40.5));
  };
  // 40.55–44.5 полбака, ключи, пропуск на зеркале
  S.cabin = t => {
    const sw = Math.sin(t * 3.3) * 13;
    const s = `<rect width="1080" height="1920" fill="#06070e"/><rect x="0" y="0" width="1080" height="1100" fill="url(#gSky)"/>${A.stars(15, 40, 700)}
      <rect y="900" width="1080" height="200" fill="#0c120c"/>
      <path d="M0 0h190L70 1330H0zM1080 0h-190l120 1330h70z" fill="#05060c"/><rect width="1080" height="230" fill="#05060c"/>
      <path d="M0 1330Q540 1230 1080 1330V1920H0z" fill="#080a14"/>
      <g transform="translate(330 1580)"><circle r="190" fill="#05060c" stroke="#232b44" stroke-width="12"/><text x="0" y="-50" text-anchor="middle" ${FONT} font-weight="800" font-size="36" fill="${P.pale}">1/2</text><path d="M0 0L0 -150" stroke="${P.ember}" stroke-width="12" stroke-linecap="round" transform="rotate(${f(Math.sin(t * 25) * 1.5)})"/><circle r="20" fill="${P.ember}"/></g>
      <g transform="translate(800 1560)"><circle r="56" fill="#1a1d2a"/>${at(0, -10, 2.0, A.keys())}</g>
      ${at(640, 1440, .9, A.beaconDevice(turn(t)))}
      <path d="M540 200v40" stroke="#05060c" stroke-width="26"/><rect x="380" y="230" width="320" height="110" rx="24" fill="#0c1020" stroke="#232b44" stroke-width="8"/>
      <rect x="400" y="250" width="280" height="70" rx="12" fill="${P.rust}" opacity=".3"/>
      <g transform="translate(540 340) rotate(${f(sw)})"><path d="M0 0v150" stroke="${P.pale}" stroke-width="7"/>${at(0, 145, 1.5, A.badge())}</g>`;
    const z = t < 41.6 ? 0 : t < 42.8 ? 1 : 2;
    return z === 0 ? cam(s, 330, 1560, 2.2) : z === 1 ? cam(s, 760, 1540, 2.4) : cam(s, 540, lerp(700, 650, pr(t, 42.8, 44.5)), 1.5);
  };
  // 44.5–46.4 в зеркале росла красная точка
  S.mirror = t => {
    const g = ez(pr(t, 44.6, 46.3));
    const s = `<rect width="1080" height="1920" fill="#05060c"/><g transform="translate(540 860)"><rect x="-460" y="-180" width="920" height="360" rx="80" fill="#0c1020" stroke="#232b44" stroke-width="16"/>
      <rect x="-430" y="-150" width="860" height="300" rx="60" fill="url(#gSky)"/>
      <circle cx="${f(lerp(-200, 40, g))}" cy="${f(lerp(-40, 0, g))}" r="${f(8 + 46 * g)}" fill="${P.red}"/><circle cx="${f(lerp(-200, 40, g))}" cy="${f(lerp(-40, 0, g))}" r="${f(60 + 200 * g)}" fill="url(#gRed)"/></g>`;
    return cam(s, 540, 900, lerp(1.0, 1.15, g));
  };
  // 46.4–49.6 газ связкой — прыжок в траву
  S.jump = t => {
    const j = ez(pr(t, 48.5, 49.5)), carX = lerp(420, 1500, ez(pr(t, 48.6, 49.6)));
    const s = field({ objS: .5, objY: 1250 }) + at(carX, 1700, 1.0, A.car({ kind: 'sedan', lights: true, rot: t * 900 }))
      + (t > 48.6 ? at(lerp(520, 260, j), lerp(1560, 1820, j), .8, A.anya({ worry: 1, aL: -150, aL2: -170, aR: 150, aR2: 170 }), lerp(0, -70, j)) : '')
      + (t < 48.6 ? `<g transform="translate(560 1660)">${at(0, 0, 1.4, A.keys(true), 30)}</g>` : '');
    return cam(s, 520, 1550, 1.25) + wind(t, 1.2, 40, 5);
  };
  // 49.6–53.5 машина в темноту, точка за ней
  S.away = t => {
    const p = pr(t, 49.6, 53.4);
    const s = field({ objS: .4, objY: 1220 }) + at(lerp(700, 980, p), lerp(1300, 1150, p), lerp(.25, .08, p), A.car({ kind: 'sedan', lights: true }))
      + at(lerp(200, 900, p), lerp(400, 1000, p), .35, A.missile({}), 40 - 10 * p)
      + at(240, 1700, .8, A.anya({ back: true }));
    return cam(s, 600, 1100, 1.1);
  };
  // 53.5–57.1 вспышка и тишина
  S.flash = t => {
    const k = pr(t, 53.65, 54.6), sil = pr(t, 54.86, 55.8);
    const s = field({ objS: .4, objY: 1220 }) + `<g transform="translate(980 1130)">${A.farFlash(k)}</g>` + at(240, 1700, .8, A.anya({ back: true }));
    return cam(s, 600, 1100, 1.1 + .02 * Math.sin(t * 60) * (1 - sil)) + `<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.max(0, .9 - (t - 53.65) * 1.6) * (t > 53.65 ? 1 : 0))}"/><rect width="1080" height="1920" fill="#000" opacity="${f(sil * .85)}"/>`;
  };
  // 57.1–59.2 утром запели птицы
  S.morning = t => {
    const s = A.bg.hill({ dotR: .01, dotOn: false, flap: Math.max(0, Math.sin(t * 9)), grass: .2 * Math.sin(t * 2) }).replace(SKY, SKY + A.dawn(ez(pr(t, 57.1, 58.4)) * .92 + .08, 1040));
    return `<rect width="1080" height="1920" fill="#000" opacity="${f(1 - pr(t, 57.1, 57.6))}"/>` + cam(s, 540, lerp(700, 760, pr(t, 57.1, 59.2)), 1.15) + `<rect width="1080" height="1920" fill="#000" opacity="${f(1 - pr(t, 57.1, 57.7))}"/>`;
  };
  // 59.2–63.3 кепка Тёме; Лена держит Костю за руку
  S.family = t => {
    const c = ez(pr(t, 59.3, 60.3));
    const s = A.bg.hill({ dotR: .01, dotOn: false, flap: Math.max(0, Math.sin(t * 9)), grass: .2 * Math.sin(t * 2) }).replace(SKY, SKY + A.dawn(1, 1040))
      + `<path d="M-20 1560Q500 1470 1100 1420V2400H-20z" fill="#2a2418"/>`
      + at(820, 1820, 1.0, A.kostya({ visor: 'up', aL: 6, aL2: 4, beacon: false, look: -3 })) + at(660, 1820, 1.1, A.lena({ aR: -30, aR2: -40, look: 3 }))
      + at(330, 1820, 1.1, A.anya({ aR: c < 1 ? 70 : 20, aR2: c < 1 ? 120 : 40, worry: .2 }))
      + `<g transform="translate(480 1830) scale(1.15)">${A.tyoma({ cap: false, look: -3 })}<g transform="translate(0 ${f(lerp(-330, -206, c))})">${A.cap(.55)}</g></g>`
      + at(130, 1830, 1.0, A.zina({ keys: false, look: 3 }));
    return cam(s, 500, lerp(1450, 1420, pr(t, 59.2, 63.3)), 1.15);
  };
  // 63.3–66.4 почему стреляли — не сказали (вид сверху на поле утром)
  S.why = t => {
    const s = A.bg.emptyField({ objS: .5, objY: 1250, hatch: 1, glow: .3 }).replace(SKY, SKY + A.dawn(.85, 1000));
    return cam(s, 540, lerp(1100, 1000, pr(t, 63.3, 66.4)), lerp(1.1, 1.0, pr(t, 63.3, 66.4)));
  };
  // 66.4–68.9 последний осколок я отвезла сама — Аня крупно
  S.last = t => {
    const s = A.dawn(1, 1000) + `<rect y="1000" width="1080" height="920" fill="#2a2418"/>` + at(540, 2300, 3.4, A.anya({ worry: 0, blink: blink(t), look: 2 }));
    return cam(s, 540, 1000, lerp(1.0, 1.12, ez(pr(t, 66.4, 68.9))));
  };
  S.end = t => {
    const a = pr(t, 69.2, 69.9);
    return `<rect width="1080" height="1920" fill="#000"/>
      <g opacity="${f(a)}"><text x="540" y="880" text-anchor="middle" ${FONT} font-weight="900" font-size="150" letter-spacing="6" fill="${P.amber}">КОНЕЦ</text>
      <text x="540" y="990" text-anchor="middle" ${FONT} font-weight="700" font-size="40" letter-spacing="8" fill="${P.pale}" opacity=".8">ПАДЕНИЕ МЕТЕОРИТА</text>
      <text x="540" y="1060" text-anchor="middle" ${FONT} font-weight="600" font-size="30" letter-spacing="6" fill="${P.pale}" opacity=".5">5 СЕРИЙ</text></g>`;
  };

  const TL = [
    [0, 'open'], [4.5, 'chase'], [9.95, 'catch'], [14.7, 'forty'], [19.7, 'keys30'], [23.1, 'pry'], [28.4, 'device'], [31.55, 'push'],
    [34.6, 'take'], [40.55, 'cabin'], [44.5, 'mirror'], [46.4, 'jump'], [49.6, 'away'], [53.5, 'flash'], [57.1, 'morning'], [59.2, 'family'],
    [63.3, 'why'], [66.4, 'last'], [69.0, 'end'],
  ];

  // ---------- субтитры ----------
  const KEY = new Set('ОСКОЛКОВ БОЛЬШЕ ПОСЛЕДНИЙ МИГАЛ ГРУДИ ТЁМА ПОЙМАЛА ОБЕРНУЛСЯ СОРОК СЕКУНД СВЯЗКОЙ КЛЮЧЕЙ ТРИДЦАТЬ ЗАМКИ МАЯЧОК ЩЁЛК БАМПЕР РЕЙС МОЙ ПОЛОВИНА БАКА ЧУЖИЕ КЛЮЧИ ПРОПУСК ГАЗ ТРАВУ ПТИЦЫ КЕПКУ ОСКОЛОК САМА'.split(' '));
  const RED = new Set('КРАСНАЯ ТОЧКА ВСПЫШКА СТРЕЛЯЛИ'.split(' '));
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
      + (t < 69.0 ? subs(t) : '');
  }
  window.FILM = { DUR, FPS: 30, TL, chunks, renderAt(t) { document.getElementById('stage').innerHTML = frame(t); } };
})();
