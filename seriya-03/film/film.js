// Серия 3 «Щит» — анимация. renderAt(t) рисует кадр для секунды t озвучки.
(function () {
  const A = ART, P = A.P, W = window.SLOVA;
  const DUR = 69.0;
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

  const S = {};
  // 0–3.65 посадка
  S.land = t => {
    const p = ez(pr(t, 0, .45)), d = pr(t, .3, 3.5);
    const s = A.bg.emptyField({ dust: d, objY: lerp(1150, 1330, p), glow: 1 - .3 * d, objS: .75 });
    return cam(s, 540, lerp(1200, 1250, pr(t, 0, 3.65)), lerp(1.25, 1.35, pr(t, 0, 3.65))) + (t < .5 ? `<rect width="1080" height="1920" fill="#fff" opacity="${f(.5 * (1 - t * 2))}"/>` : '');
  };
  // 3.65–7.3 сопла погасли, ветер стих
  S.calm = t => {
    const jets = 1 - pr(t, 4.05, 4.6), still = pr(t, 5.5, 6.4);
    let grass = ''; for (let i = 0; i < 40; i++) { const x = hash(i) * 1080, h = 40 + hash(i * 3) * 60, lean = (1 - still) * 30 * Math.sin(t * 6 + i); grass += `<path d="M${f(x)} 1660q${f(lean / 2)} ${f(-h / 2)} ${f(lean)} ${f(-h)}" stroke="#03040a" stroke-width="6" fill="none" stroke-linecap="round"/>`; }
    const s = A.bg.emptyField({ objS: 1.3, objY: 1560, glow: .8 })
      + (jets > 0 ? `<g transform="translate(540 1320)" opacity="${f(jets)}"><path d="M-60 0L-140 200L-20 0zM60 0L140 200L20 0z" fill="${P.tv}" opacity=".8"/></g>` : '')
      + `<rect y="1600" width="1080" height="320" fill="#05060c"/>` + grass;
    return cam(s, 540, 1300, lerp(1.1, 1.15, pr(t, 3.65, 7.3)));
  };
  // 7.3–10.85 пусто, люди ушли
  S.empty = t => {
    const s = A.bg.emptyField({ objS: .35, objY: 1260 }) + A.headlightRiver(9, [[540, 1300, 300, 3], [-100, 1600, 60, 5]], 40, t * .08) + A.headlightRiver(10, [[540, 1300, 300, 3], [1180, 1600, 60, 5]], 40, t * .08);
    return cam(s, 540, lerp(1100, 1250, ez(pr(t, 7.3, 10.85))), lerp(1.0, 1.15, pr(t, 7.3, 10.85)));
  };
  // 10.85–15.4 пассажир снимает очки
  S.glasses = t => {
    const off = t > 11.65;
    const s = A.bg.hq({ dotP: 1 }) + at(540, 2350, 2.5, off ? A.engineerNoGlasses({ aR: 30, aR2: 80, glassesInHand: [110, -250] }) : A.engineer({ bag: false, aR: 120, aR2: 170 }));
    return cam(s, 540, lerp(1150, 1100, pr(t, 10.85, 15.4)), lerp(1.05, 1.18, pr(t, 10.85, 15.4)));
  };
  // 15.4–19.9 Зина побелела
  S.zina = t => {
    const pale = pr(t, 15.66, 16.2);
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="900" fill="url(#gTv)" opacity=".55"/>`
      + at(540, 1950, 3.3, A.zina({ blink: blink(t, .4), look: 2, keys: false, mouth: t > 16.3 && talk(t) > .45 ? 'open' : 'flat' }))
      + `<rect width="1080" height="1920" fill="#dfe8f0" opacity="${f(pale * .16)}"/>`;
    return cam(s, 540, lerp(1050, 1000, pr(t, 15.4, 19.9)), lerp(1.0, 1.12, ez(pr(t, 15.4, 19.9)))) + tag('ЛЮДИ БЫЛИ ЩИТОМ', 230, fadeTag(t, 16.9, 19.8), P.red);
  };
  // 19.9–24.0 ракета на горизонте
  S.missile = t => {
    const p = pr(t, 20.6, 24.0);
    const s = A.bg.emptyField({ objS: .3, objY: 1180 }) + at(lerp(1000, 760, p), lerp(1090, 640, ez(p)), lerp(.15, .4, p), A.missile({ trail: .3 + .7 * p }), -28);
    return cam(s, lerp(860, 760, p), lerp(1000, 760, p), lerp(1.7, 1.3, p));
  };
  // 24.0–27.35 Зина считает: дуга ракеты на экране
  S.calc = t => {
    const s = A.bg.hq({ screen: 0 }) + at(700, 640, 1, map(t, { arc: ez(pr(t, 24.3, 26.6)), missileP: pr(t, 24.3, 27.3) * .3 }));
    return cam(s, 700, 640, lerp(1.6, 1.85, pr(t, 24, 27.35))) + tag('РАКЕТА', 230, fadeTag(t, 26.2, 27.3), P.red);
  };
  // 27.35–28.5 четыре минуты
  S.watch4 = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="800" fill="url(#gRed)" opacity=".3"/>` + at(540, 640, 2.0, A.watch('4:00', .5), -6);
    return cam(s, 540, 960, lerp(1.05, 1.15, pr(t, 27.35, 28.5)));
  };
  // 28.5–31.65 зона удара до элеватора
  S.zone = t => {
    const s = A.bg.hq({ screen: 0 }) + at(700, 640, 1, map(t, { arc: 1, missileP: .3 + .1 * pr(t, 28.5, 31.6), zone: ez(pr(t, 28.6, 30.9)) }));
    return cam(s, 700, 640, lerp(1.85, 2.0, pr(t, 28.5, 31.65))) + (t > 30.7 ? `<rect width="1080" height="1920" fill="${P.red}" opacity="${f(.2 * Math.max(0, 1 - (t - 30.7) * 1.5))}"/>` : '');
  };
  // 31.65–33.65 я сама позвала их туда
  S.guilt = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="700" fill="url(#gRed)" opacity="${f(.3 + .15 * Math.sin(t * 6))}"/>` + at(540, 2330, 3.6, A.anya({ worry: 1, mouth: 'down', blink: blink(t, 2), look: -2 }));
    const ph = pr(t, 32.4, 32.7);
    return cam(s, 540, 1000, lerp(1.05, 1.25, ez(pr(t, 31.65, 33.65))))
      + (ph > 0 ? `<g opacity="${f(ph * .92)}">${at(780, 520, 1.1, familyPhoto(), 6)}</g>` : '');
  };
  // 33.65–37.0 сети нет, полбака, ключи
  S.dash = t => {
    const turnKey = pr(t, 36.25, 36.6);
    const s = `<rect width="1080" height="1920" fill="#070912"/><rect width="1080" height="900" fill="url(#gSky)"/>${A.stars(15, 40, 700)}
      <path d="M0 880Q540 800 1080 880V1920H0z" fill="#0b0e1a"/>
      <g transform="translate(380 1020)"><circle r="230" fill="#05060c" stroke="#232b44" stroke-width="14"/>
        <text x="-140" y="70" text-anchor="middle" ${FONT} font-weight="900" font-size="60" fill="${P.red}">E</text><text x="140" y="70" text-anchor="middle" ${FONT} font-weight="900" font-size="60" fill="${P.pale}">F</text>
        <text x="0" y="-60" text-anchor="middle" ${FONT} font-weight="800" font-size="40" fill="${P.pale}" opacity=".8">1/2</text>
        <path d="M0 0L0 -170" stroke="${P.ember}" stroke-width="14" stroke-linecap="round" transform="rotate(${f(-68 + 68 * ez(pr(t, 36.3, 36.9)) + Math.sin(t * 30) * 1)})"/><circle r="24" fill="${P.ember}"/></g>
      <g transform="translate(800 1060)"><circle r="60" fill="#1a1d2a" stroke="#3a4260" stroke-width="8"/><g transform="rotate(${f(-30 + 70 * turnKey)})">${at(0, -10, 2.2, A.keys())}</g></g>
      ${at(790, 560, .9, A.phone(true), 5)}`;
    return cam(s, lerp(780, 560, ez(pr(t, 34.7, 35.6))), lerp(700, 1040, ez(pr(t, 34.7, 35.6))), lerp(1.5, 1.2, ez(pr(t, 34.7, 35.6))));
  };
  // 37.0–42.85 против толпы, по траве мимо палаток
  S.against = t => {
    const grass = t > 41.0;
    let lights = '';
    for (let i = 0; i < 26; i++) {
      const q = ((hash(i) + (t - 37) * .45) % 1), z = Math.pow(q, 2.2);
      const side = i % 2 ? 1 : -1, x = 540 + side * (40 + z * (grass ? 700 : 420)) + (hash(i * 3) - .5) * 60, y = 900 + z * 900, r = 3 + z * 26;
      lights += `<circle cx="${f(x - r * 1.4)}" cy="${f(y)}" r="${f(r)}" fill="${P.pale}"/><circle cx="${f(x + r * 1.4)}" cy="${f(y)}" r="${f(r)}" fill="${P.pale}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 4)}" fill="url(#gGlow)" opacity=".5"/>`;
    }
    let tents = '';
    if (grass) for (let i = 0; i < 6; i++) { const q = ((i / 6 + (t - 41) * .6) % 1), z = Math.pow(q, 2), side = i % 2 ? 1 : -1; tents += at(540 + side * (120 + z * 900), 900 + z * 800, .2 + z * 2.2, A.tent(260, 160, false, '#2c3530')); }
    const s = `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(8, 60, 800)}<rect y="880" width="1080" height="1040" fill="${grass ? '#0c120c' : '#0e1018'}"/>
      ${at(540 + Math.sin(t * 3) * 6, 880, .12, A.landed({ hatch: 0 }))}${tents}${lights}
      ${at(540 + Math.sin(t * 2.3) * 30, 1640 + Math.sin(t * 23) * 4, .9, carRear(t))}`;
    return cam(s, 540, 1050, 1.05, Math.sin(t * 1.4) * 1) + (t > 41 ? '' : tag('ПРОТИВ ТОЛПЫ', 230, fadeTag(t, 37.3, 40.6)));
  };
  // 42.85–44.95 две минуты
  S.watch2 = t => {
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="700" r="800" fill="url(#gRed)" opacity="${f(.35 + .1 * Math.sin(t * 14))}"/>` + at(540, 640, 2.0, A.watch('2:00', .7), -6);
    return cam(s, 540 + Math.sin(t * 50) * 3, 960, lerp(1.1, 1.25, pr(t, 42.85, 44.95)));
  };
  // 44.95–49.2 у элеватора никого, Аня зовёт
  S.yard = t => {
    const call = t > 46.8;
    const s = A.bg.yard({ lamp: hash(Math.floor(t * 9)) < .12 ? 0 : 1 }) + at(lerp(1300, 900, ez(pr(t, 44.95, 45.8))), 1640, 1, A.car({ kind: 'sedan', lights: true }))
      + at(620, 1700, 1.05, A.anya({ mouth: call && talk(t) > .3 ? 'open' : 'flat', worry: 1, aR: call ? 160 : -8, aR2: call ? 175 : -4, aL: call ? -160 : 8, aL2: call ? -175 : 4, look: -3, blink: blink(t) }))
      + at(820, 1720, .9, A.zina({ look: -3, keys: false, blink: blink(t, 1) }));
    return cam(s, 560, 1400, lerp(1.05, 1.15, pr(t, 44.95, 49.2)));
  };
  // 49.2–51.15 кепка в пыли
  S.cap = t => {
    const s = `<rect width="1080" height="1920" fill="#2a2018"/><circle cx="540" cy="700" r="900" fill="url(#gGlow)" opacity=".2"/>
      ${(() => { let o = ''; for (let i = 0; i < 30; i++) o += `<ellipse cx="${f(hash(i) * 1080)}" cy="${f(hash(i * 2) * 1920)}" rx="${f(30 + hash(i * 3) * 70)}" ry="${f(6 + hash(i * 4) * 12)}" fill="#1a140e"/>`; return o; })()}
      ${at(540, 1000, 3.4, A.cap(1), -12)}<ellipse cx="540" cy="1090" rx="420" ry="40" fill="#000" opacity=".3"/>`;
    return cam(s, 540, 1000, lerp(1.0, 1.15, ez(pr(t, 49.2, 51.15))));
  };
  // 51.15–57.7 телефон: звонок, сеть появилась, «Дочка»
  S.phone = t => {
    const bars = t < 53.5 ? 0 : Math.min(4, Math.floor((t - 53.5) * 5) + 1);
    const sh = t < 52.9 && t > 52.27 ? Math.sin(t * 60) * 10 : 0;
    const s = `<rect width="1080" height="1920" fill="#080a14"/><circle cx="540" cy="900" r="900" fill="url(#gTv)" opacity=".45"/>
      <path d="M1250 1900L760 1380" stroke="#a8772a" stroke-width="230" stroke-linecap="round"/>
      ${at(540 + sh, 900, 1.25, phoneBig(t, { bars, ring: t > 52.27 }), -4)}
      <ellipse cx="800" cy="1260" rx="92" ry="150" fill="${P.skinA}" transform="rotate(34 800 1260)"/>`;
    const z = t > 56.7 ? ez(pr(t, 56.7, 57.6)) : 0;
    return cam(s, 540, lerp(940, 880, z), lerp(1, 1.3, z)) + tag('СЕТЬ ПОЯВИЛАСЬ', 230, fadeTag(t, 53.5, 55.9), '#5ad17a');
  };
  // 57.7–61.6 «Мама, мы у него»: Лена и Тёма бегут к объекту
  S.near = t => {
    const p = pr(t, 57.7, 61.6), run = ez(pr(t, 59.9, 61.5));
    const s = A.bg.emptyField({ objS: .9, objY: 1480, glow: 1 })
      + at(lerp(250, 330, p), 1660, .6, A.lena({ walk: t * 9, phone: true, aR: 160, aR2: -170, look: 3 }))
      + at(lerp(380, 470, run), lerp(1640, 1560, run), .7, A.tyoma({ walk: t * 13, back: true }));
    return cam(s, 470, lerp(1300, 1350, p), lerp(1.2, 1.35, p));
  };
  // 61.6–64.1 люк открывается, кто-то выходит
  S.hatch = t => {
    const h = ez(pr(t, 61.7, 62.6)), out = ez(pr(t, 62.5, 64.0));
    const s = A.bg.emptyField({ objS: 1.5, objY: 1700, hatch: h, glow: 1.1 })
      + (out > 0 ? at(540, lerp(1560, 1700, out), lerp(.5, .9, out), A.stranger({ eyes: out })) : '')
      + `<rect width="1080" height="1920" fill="#fff" opacity="${f(.1 * h)}"/>`;
    return cam(s, 540, lerp(1300, 1250, pr(t, 61.6, 64.1)), lerp(1.2, 1.3, pr(t, 61.6, 64.1)));
  };
  // 64.1–66.9 «он знает, как зовут Тёму»
  S.name = t => {
    const r = ez(pr(t, 65.0, 66.6));
    const s = A.bg.emptyField({ objS: 1.5, objY: 1700, hatch: 1, glow: 1.1 })
      + at(640, 1720, .95, A.stranger({ reach: .2 + .6 * r, eyes: 1 }))
      + at(330, 1730, 1.05, A.tyoma({ back: true, cap: false }))
      + `<rect width="1080" height="1920" fill="#000" opacity="${f(.15 * r)}"/>`;
    return cam(s, lerp(480, 470, r), lerp(1450, 1380, r), lerp(1.3, 1.5, r));
  };
  S.end = t => {
    const a = pr(t, 67.2, 67.7);
    return `<rect width="1080" height="1920" fill="#000"/>
      <g opacity="${f(a)}"><text x="540" y="900" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">ПРОДОЛЖЕНИЕ</text><text x="540" y="990" text-anchor="middle" ${FONT} font-weight="900" font-size="78" letter-spacing="4" fill="${P.amber}">СЛЕДУЕТ</text>
      <text x="540" y="1090" text-anchor="middle" ${FONT} font-weight="700" font-size="36" letter-spacing="8" fill="${P.pale}" opacity=".7">ПАДЕНИЕ МЕТЕОРИТА · СЕРИЯ 4</text></g>`;
  };

  const TL = [
    [0, 'land'], [3.65, 'calm'], [7.3, 'empty'], [10.85, 'glasses'], [15.4, 'zina'], [19.9, 'missile'], [24.0, 'calc'], [27.35, 'watch4'],
    [28.5, 'zone'], [31.65, 'guilt'], [33.65, 'dash'], [37.0, 'against'], [42.85, 'watch2'], [44.95, 'yard'], [49.2, 'cap'], [51.15, 'phone'],
    [57.7, 'near'], [61.6, 'hatch'], [64.1, 'name'], [66.9, 'end'],
  ];

  // ---------- субтитры ----------
  const KEY = new Set('СЕЛ ТАКСИ СОПЛА ПОГАСЛИ ПУСТО УВЕЛА ОЧКИ ЛЮДИ ТОЧКА ТРАЕКТОРИИ ЧЕТЫРЕ МИНУТЫ ЭЛЕВАТОРА ЛЕНУ ТЁМОЙ ПОЛ БАКА КЛЮЧИ ТОЛПЫ НАВСТРЕЧУ ДВЕ КЕПКА ТЕЛЕФОН СЕТЬ ПОЯВИЛАСЬ ДОЧКА ТЁМИНА'.split(' '));
  const RED = new Set('ЩИТОМ СБИЛ КРАСНАЯ РАКЕТА БИТЬ САМА НИКОГО ТИШИНА ВЫШЕЛ ЗНАЕТ'.split(' '));
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
      + (t < 66.9 ? subs(t) : '');
  }
  window.FILM = { DUR, FPS: 30, TL, chunks, renderAt(t) { document.getElementById('stage').innerHTML = frame(t); } };
})();
