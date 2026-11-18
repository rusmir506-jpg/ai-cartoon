// Серия 2 «Не с той стороны» — анимация. renderAt(t) рисует кадр для секунды t озвучки.
(function () {
  const A = ART, P = A.P, W = window.SLOVA;
  const DUR = 78.5;
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
  const W0 = w => W.find(x => x.w.replace(/[«».,:!?—]/g, '') === w);   // время слова

  const EXTRA_DEFS = `<defs>
    <radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070f" stop-opacity="0"/><stop offset=".5" stop-color="#05070f" stop-opacity=".62"/><stop offset="1" stop-color="#05070f" stop-opacity="0"/></linearGradient>
    <linearGradient id="gColumn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>`;

  function wind(t, k, n = 34, seed = 1, dir = -1) {
    if (k <= 0) return '';
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 500 + hash(i + seed) * 700, y = hash(i * 3.1 + seed) * 1920 + Math.sin(t * 2 + i) * 24;
      let x = ((hash(i * 7.7 + seed) * 1400 + t * sp * k) % 1400) - 160;
      if (dir < 0) x = 1080 - x;
      s += i % 3 === 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2 + hash(i) * 3)}" fill="${P.ember}" opacity="${f(.5 * k)}"/>`
        : `<path d="M${f(x)} ${f(y)}h${f(30 + hash(i * 1.3) * 90)}" stroke="${P.amber}" stroke-width="3" stroke-linecap="round" opacity="${f(.16 * k)}"/>`;
    }
    return s;
  }
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
  // город на горизонте со стороны холма, со светом над крышами
  function cityView(t, bx, by, bs, o) {
    o = o || {};
    return `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(31, 90, 1100)}
      <rect y="1000" width="1080" height="300" fill="${P.rust}" opacity=".25"/>
      ${A.skyline(14, 1260, 60, 260, '#151228', .16, 200)}
      ${o.tower !== false ? `<rect x="610" y="880" width="90" height="400" fill="#0b0d1a"/><rect x="620" y="890" width="70" height="16" fill="${P.pale}" opacity=".7"/>` : ''}
      ${A.skyline(15, 1330, 30, 120, '#0a0b16', .2, 200)}
      ${at(bx, by, bs, A.beacon({ rot: -12 + Math.sin(t) * 4, on: turn(t), jets: .8 + .3 * Math.sin(t * 20) }))}
      <path d="M-20 1500Q540 1400 1100 1520V1940H-20z" fill="#03040a"/>`;
  }

  const S = {};
  // 0–8.25: свет над городом, скользит к нам
  S.city = t => {
    const p = ez(pr(t, 0, 8.25));
    const bx = lerp(250, 640, p), by = lerp(1150, 760, p), bs = lerp(.12, .55, p * p);
    const s = cityView(t, bx, by, bs) + at(400, 1560, 1.1, A.anya({ back: true })) + at(250, 1572, 1.1, A.zina({ back: true, keys: false }))
      + `<rect width="1080" height="1920" fill="#fff" opacity="${f(.05 + .12 * p)}"/>`;
    return cam(s, lerp(540, 520, p), lerp(1100, 1000, p), lerp(1.05, 1.15, p)) + tag('СЕРИЯ 2 · НЕ С ТОЙ СТОРОНЫ', 240, fadeTag(t, .1, 3.3));
  };
  // 8.25–10.6: мигает как поворотник
  S.blink = t => {
    const s = cityView(t, 600, 760, .95, { tower: true });
    return cam(s, 600, 790, lerp(1.6, 1.9, pr(t, 8.25, 10.6))) + (turn(t) ? `<rect width="1080" height="1920" fill="${P.amber}" opacity=".08"/>` : '');
  };
  // 10.6–13.5: ветер вернулся, горячий, в спину
  S.wind = t => {
    const g = .35 + .1 * Math.sin(t * 3);
    let s = A.bg.hill({ dotR: 0.01, dotOn: false, grass: -(.7 + .3 * Math.sin(t * 6)), flap: 0 })
      + `<rect y="900" width="1080" height="1100" fill="#fff" opacity="${f(g * .25)}"/>`
      + at(660, 1478, .75, `<g transform="rotate(-8)">${A.car({ kind: 'sedan', lights: true })}</g>`)
      + at(350, 1548, .62, A.anya({ back: true })) + at(240, 1556, .62, A.zina({ back: true, keys: false }));
    return cam(s, 450, 1350, 1.6 + .08 * pr(t, 10.6, 13.5)) + wind(t, 1.6, 50, 3, 1);
  };
  // 13.5–17.25: часы Зины, 7 минут
  S.watch1 = t => {
    const show = t > W0('Семь').s - .05;
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="url(#gWhite)" opacity=".12"/>`
      + at(540, 640, 2.0, A.watch(show ? '7:00' : '7:12', .35 + .2 * Math.sin(t * 8)), -6);
    return cam(s, 540, 960, lerp(1.0, 1.12, pr(t, 13.5, 17.25))) + wind(t, .5, 16, 5, 1);
  };
  // 17.25–20.9: поле, тысячи людей; фото Лены и Тёмы
  S.field1 = t => {
    const s = A.bg.field({ dotR: 10, dotX: 200, dotY: 260, talk: talk(t) * .6 });
    const ph = pr(t, 19.0, 19.3);
    return cam(s, 540, lerp(1350, 1450, pr(t, 17.25, 20.9)), lerp(1.2, 1.35, pr(t, 17.25, 20.9)))
      + (ph > 0 ? `<rect width="1080" height="1920" fill="#000" opacity="${f(ph * .55)}"/>${at(540, 900, lerp(1.4, 2.0, pr(t, 19.0, 20.9)), familyPhoto(), -4 + Math.sin(t * 2) * 2)}` : '');
  };
  // 20.9–24.55: главная дорога стоит; 11 рейсов
  S.jam = t => {
    const s = A.bg.highway({ move: 0, jam: 0, dotOn: turn(t), dotR: 18 });
    const n = t > 22.9 ? 11 : 0;
    return cam(s, 400, 1150, lerp(1.1, 1.25, pr(t, 20.9, 24.55)))
      + (n ? `<g transform="translate(540 330) scale(${f(1 + .1 * Math.max(0, 1 - (t - 22.9) * 4))})"><rect x="-300" y="-110" width="600" height="220" rx="24" fill="#05060c" stroke="${P.ember}" stroke-width="6"/>
      <text x="0" y="-52" text-anchor="middle" ${FONT} font-weight="700" font-size="34" letter-spacing="6" fill="${P.pale}" opacity=".7">РЕЙСОВ СЮДА</text>
      <text x="0" y="70" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="120" fill="${P.amber}">11</text></g>` : '')
      + tag('ПРОБКА', 1180, fadeTag(t, 21.0, 22.4), P.red);
  };
  // 24.55–26.4: грунтовка за элеватором
  S.dirt = t => {
    const p = pr(t, 24.55, 26.4), x = lerp(-250, 560, ez(p));
    const s = A.bg.elevator({ dust: p, dotX: 300, dotY: 380, dotR: 14 }) + at(x, 1720 - 80 * p, lerp(1.1, .9, p), A.car({ kind: 'sedan', lights: true, rot: t * 500 }), -4 + Math.sin(t * 25) * 1.5);
    return cam(s, 540, lerp(1250, 1300, p), lerp(1.05, 1.12, p)) + tag('ЗА ЭЛЕВАТОРОМ', 240, fadeTag(t, 24.8, 26.3)) + wind(t, .7, 20, 7);
  };
  // 26.4–30.6: кордон, «Назад!»
  S.cordon = t => {
    const ph = Math.floor(t / .25), shout = t > W0('Назад').s - .05;
    const s = A.bg.cordon({ phase: ph }) + at(560, 1760, .9, A.police({ torch: true, aR: shout ? -90 : -60, aR2: shout ? -100 : -80, mouth: shout ? 'open' : 'flat', blink: blink(t), look: -3 }));
    const p = pr(t, 26.4, 30.6);
    return cam(s, lerp(560, 600, p), lerp(1420, 1300, p), lerp(1.15, shout ? 1.7 : 1.35, shout ? ez(pr(t, 29.5, 30.3)) * .5 + p * .5 : p))
      + (shout ? `<rect width="1080" height="1920" fill="#fff" opacity="${f(.5 * Math.max(0, 1 - (t - 29.6) * 3))}"/>` : '');
  };
  // 30.6–33.2: пропуск
  S.badge = t => {
    const u = ez(pr(t, 30.7, 31.6)), pop = t > 32.3 ? 1 + .1 * Math.max(0, 1 - (t - 32.3) * 4) : 1;
    const ph = Math.floor(t / .25);
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="${ph % 2 ? 'url(#gRed)' : 'url(#gTv)'}" opacity=".35"/>
      <path d="M1250 1950L760 1350" stroke="#a8772a" stroke-width="210" stroke-linecap="round"/>
      ${at(lerp(900, 560, u), lerp(1400, 760, u), 2.6 * pop, A.badge(), lerp(20, -4, u))}
      <ellipse cx="${f(lerp(960, 600, u))}" cy="${f(lerp(1700, 1330, u))}" rx="90" ry="64" fill="${P.skinA}"/>`;
    return cam(s, 540, 960, lerp(1, 1.06, pr(t, 30.6, 33.2)));
  };
  // 33.2–34.2: он отступил
  S.salute = t => {
    const o = ez(pr(t, 33.3, 33.9));
    const s = A.bg.cordon({ phase: Math.floor(t / .25), open: o }) + at(lerp(560, 700, o), 1760, .9, A.police({ salute: true, blink: blink(t) }));
    return cam(s, 450, 1450, 1.35);
  };
  // 34.2–38.0: поле гудит, громкоговоритель
  S.field2 = t => {
    const s = A.bg.field({ dotR: 14, dotX: 300, dotY: 250, talk: talk(t) });
    const tx = t > 35.6 ? `<g opacity="${f(pr(t, 35.6, 36.0))}" transform="translate(540 760)"><rect x="-370" y="-60" width="740" height="96" rx="20" fill="#05070f" opacity=".75"/><text x="0" y="8" text-anchor="middle" ${FONT} font-weight="900" font-size="46" fill="${P.tv}">«СОХРАНЯЙТЕ СПОКОЙСТВИЕ»</text></g>` : '';
    return cam(s, lerp(700, 900, pr(t, 34.2, 38)), lerp(1250, 900, ez(pr(t, 34.2, 38))), lerp(1.1, 1.6, pr(t, 34.2, 38))) + tx;
  };
  // 38.0–39.35: голос знакомый — лицо Ани
  S.face = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="900" fill="url(#gTv)" opacity=".3"/>` + at(540, 2300, 3.6, A.anya({ worry: 1, look: Math.sin(t * 3) * 3, blink: blink(t, 1) }));
    return cam(s, 540, lerp(1000, 960, pr(t, 38, 39.35)), lerp(1.05, 1.2, ez(pr(t, 38, 39.35))));
  };
  // 39.35–42.55: сигналю, мигаю фарами
  S.honk = t => {
    const on = Math.floor(t / .18) % 2 === 0;
    const s = A.bg.field({ dotR: 14, dotX: 300, dotY: 250, talk: talk(t) * .5 }) + at(560, 1700 + Math.sin(t * 40) * 2, 1.1, A.car({ kind: 'sedan', lights: on, blink: !on }))
      + (on ? `<path d="M840 1630L1180 1500V1760z" fill="${P.pale}" opacity=".2"/>` : '');
    return cam(s, 560, 1450, 1.25) + (t > 41.4 ? tag('НИКТО НЕ СЛУШАЕТ', 230, fadeTag(t, 41.4, 42.5), P.red) : '');
  };
  // 42.55–46.8: Зина — нужен приказ
  S.zina = t => {
    const sp = t > 43.5;
    const point = t > 45.9;
    const s = `<rect width="1080" height="1920" fill="#080a14"/>${A.bg.field({ dotR: 10, dotX: 250, dotY: 250, talk: talk(t) * .4 }).replace('<rect width="1080" height="1920" fill="url(#gSky)"/>', '<rect width="1080" height="1920" fill="url(#gSky)" opacity=".7"/>')}
      <rect width="1080" height="1920" fill="#000" opacity=".45"/>`
      + at(540, 1820, 2.8, A.zina({ blink: blink(t, .4), look: point ? 4 : 0, keys: false, mouth: sp && talk(t) > .45 ? 'open' : 'flat', aR: point ? 115 : -20, aR2: point ? 145 : 30 }));
    return cam(s, 540, lerp(1050, 980, pr(t, 42.55, 46.8)), lerp(1, 1.1, pr(t, 42.55, 46.8)));
  };
  // 46.8–49.1: вышка с рупорами — где микрофон, там приказ
  S.tower = t => {
    const s = A.bg.field({ dotR: 10, dotX: 250, dotY: 250, talk: talk(t) });
    return cam(s, 980, lerp(1000, 820, ez(pr(t, 46.8, 49.1))), lerp(1.4, 2.0, pr(t, 46.8, 49.1)));
  };
  // 49.1–52.3: штаб и вертолёт
  S.hqOut = t => {
    const pan = ez(pr(t, 51.3, 52.2));
    const s = A.bg.field({ dotR: 12, dotX: 760, dotY: 260, talk: talk(t) * .5 })
      + at(300, 1300, 1.5, A.tent(360, 260, true, '#2c3c30')) + at(720, 1240, 1.1, A.heli({ rot: 0, blink: turn(t * 2) }));
    return cam(s, lerp(330, 720, pan), lerp(1180, 1180, pan), lerp(1.5, 1.9, pan));
  };
  // 52.3–54.95: три минуты
  S.watch3 = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="url(#gWhite)" opacity="${f(.25 + .1 * Math.sin(t * 10))}"/>`
      + at(540, 640, 2.0, A.watch('3:00', .7 + .2 * Math.sin(t * 12)), -6);
    return cam(s, 540 + Math.sin(t * 50) * 3, 960, lerp(1.1, 1.3, pr(t, 52.3, 54.95)));
  };
  // 54.95–57.4: полог открывается — пассажир у микрофона
  S.reveal = t => {
    const o = ez(pr(t, 55.0, 56.2));
    const s = A.bg.hq({ dotP: pr(t, 50, 62) }) + at(540, 1920, 1.6, A.engineer({ bag: false, aR: 40, aR2: 110 }))
      + `<path d="M0 0H${f(540 - 560 * o)}V1920H0z" fill="#2c3c30"/><path d="M1080 0H${f(540 + 560 * o)}V1920H1080z" fill="#26341f"/>`;
    return cam(s, 540, lerp(1000, 1150, ez(pr(t, 55, 57.4))), lerp(1.0, 1.45, ez(pr(t, 55.5, 57.4))));
  };
  // 57.4–62.75: «Его не сбили. Его ведут. Сюда»
  S.engineer = t => {
    const keys = t > W0('ключи').s - .05 && t < 59.8;
    const scr = t > 60.8;
    if (scr) {
      const p = ez(pr(t, 60.8, 62.3));
      const s = A.bg.hq({ dotP: lerp(.55, 1, p) });
      return cam(s, 700, 640, lerp(1.6, 2.0, p)) + (t > 61.7 ? `<rect width="1080" height="1920" fill="${P.red}" opacity="${f(.25 * Math.max(0, 1 - (t - 61.7) * 2))}"/>` : '');
    }
    const s = A.bg.hq({ dotP: .5 }) + at(540, 2400, 2.6, A.engineer({ bag: false, aR: 40, aR2: 110 }))
      + (keys ? `<path d="M-160 1700L210 1200" stroke="#a8772a" stroke-width="210" stroke-linecap="round"/>${at(260, 1080, 3.2, A.keys(), Math.sin(t * 9) * 8)}<ellipse cx="240" cy="1170" rx="110" ry="80" fill="${P.skinA}"/>` : '');
    return cam(s, 540, lerp(1150, 1100, pr(t, 57.4, 60.8)), lerp(1.1, 1.2, pr(t, 57.4, 60.8)));
  };
  // 62.75–67.5: Аня кричит в микрофон
  S.shout = t => {
    const s = A.bg.hq({ dotP: 1 }) + `<rect width="1080" height="1920" fill="${P.red}" opacity="${f(.12 + .06 * Math.sin(t * 12))}"/>`
      + at(540, 2350, 2.7, A.anya({ mouth: talk(t) > .3 ? 'open' : 'flat', worry: 1, aR: 150, aR2: 175, aL: -40, aL2: 10, blink: false }));
    return cam(s, 540 + Math.sin(t * 40) * 4, lerp(1150, 1080, pr(t, 62.75, 67.5)), lerp(1.05, 1.2, pr(t, 62.75, 67.5)))
      + (t > 65.5 ? tag('ЛЕНА! ТЁМА! К ЭЛЕВАТОРУ!', 230, fadeTag(t, 65.6, 67.5), P.red) : '');
  };
  // 67.5–70.3: тысячи фар двинулись
  S.move = t => {
    const lit = ez(pr(t, 67.9, 68.6)), mv = ez(pr(t, 68.4, 70.3));
    const s = A.bg.field({ dotR: 18, dotX: 540, dotY: 420, talk: 0, shift: mv, lights: lit });
    return cam(s, 540, lerp(1350, 1250, pr(t, 67.5, 70.3)), lerp(1.05, 1.0, pr(t, 67.5, 70.3)));
  };
  // 70.3–72.75: свет остановился
  S.stop = t => {
    const s = `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(41, 120, 1300)}`
      + at(540, 640, lerp(.7, .75, pr(t, 70.3, 72.75)), A.beacon({ rot: -12, on: true, jets: t < 71.25 ? 1 : 0, size: 1.2 }))
      + `<rect y="1300" width="1080" height="620" fill="#0b0c14"/>` + A.headlightRiver(5, [[0, 1310, 30, 3], [1080, 1310, 30, 3]], 90, 0);
    return cam(s, 540, 900, lerp(1.0, 1.08, pr(t, 70.3, 72.75)));
  };
  // 72.75–76.6: опускается, как будто садится
  S.land = t => {
    const p = ez(pr(t, 72.85, 76.3));
    let s = A.bg.field({ dotR: .01, dotX: -500, dotY: -500, shift: 1, lights: 1 })
      + `<rect x="${f(540 - 120 - 200 * p)}" y="0" width="${f(240 + 400 * p)}" height="${f(lerp(700, 1500, p))}" fill="url(#gColumn)" opacity="${f(.4 + .5 * p)}"/>`
      + at(540, lerp(500, 1150, p), lerp(.8, 1.3, p), A.beacon({ rot: -12, on: turn(t), jets: 0, size: 1.4 }))
      + `<rect width="1080" height="1920" fill="#fff" opacity="${f(p * p * .5)}"/>`;
    return cam(s, 540, lerp(1000, 1150, p), lerp(1, 1.1, p));
  };
  S.end = t => {
    const wh = 1 - pr(t, 76.6, 76.9), a = pr(t, 77.0, 77.5);
    return `<rect width="1080" height="1920" fill="#000"/><rect width="1080" height="1920" fill="#fff" opacity="${f(wh)}"/>
      <g opacity="${f(a)}"><text x="540" y="900" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">ПРОДОЛЖЕНИЕ</text><text x="540" y="990" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">СЛЕДУЕТ</text>
      <text x="540" y="1090" text-anchor="middle" ${FONT} font-weight="700" font-size="36" letter-spacing="8" fill="${P.pale}" opacity=".7">ПАДЕНИЕ МЕТЕОРИТА · СЕРИЯ 3</text></g>`;
  };

  const TL = [
    [0, 'city'], [8.25, 'blink'], [10.6, 'wind'], [13.5, 'watch1'], [17.25, 'field1'], [20.9, 'jam'], [24.55, 'dirt'], [26.4, 'cordon'],
    [30.6, 'badge'], [33.2, 'salute'], [34.2, 'field2'], [38.0, 'face'], [39.35, 'honk'], [42.55, 'zina'], [46.8, 'tower'], [49.1, 'hqOut'],
    [52.3, 'watch3'], [54.95, 'reveal'], [57.4, 'engineer'], [62.75, 'shout'], [67.5, 'move'], [70.3, 'stop'], [72.75, 'land'], [76.6, 'end'],
  ];

  // ---------- субтитры (как в серии 1) ----------
  const KEY = new Set('СВЕТ ГОРОДА СКОЛЬЗИЛ МИГАЛ ПОВОРОТНИК ГОРЯЧИЙ СПИНУ СЕМЬ МИНУТ ТЫСЯЧИ ЛЕНА ТЁМА ОДИННАДЦАТЬ ГРУНТОВКА ПРОПУСК ОРБИТА ЗНАКОМЫЙ ФАРАМИ ПРИКАЗ МИКРОФОН ВЕРТОЛЁТ ТРИ ПАССАЖИР КЛЮЧИ ЭЛЕВАТОРУ ДВИНУЛИСЬ'.split(' '));
  const RED = new Set('НАЗАД КОРДОН СБИЛИ ВЕДУТ СЮДА УХОДИТЕ ОСТАНОВИЛСЯ СТОЯЛА'.split(' '));
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
      + (t < 76.6 ? subs(t) : '');
  }
  window.FILM = { DUR, FPS: 30, TL, chunks, renderAt(t) { document.getElementById('stage').innerHTML = frame(t); } };
})();
