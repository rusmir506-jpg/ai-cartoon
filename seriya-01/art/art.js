// «Падение метеорита» — общая библиотека рисунков (плоский 2D, SVG).
// Всё рисуется функциями, которые возвращают SVG-строки. Используется и листом
// персонажей (sheet.html), и анимацией.
(function () {
  const P = {
    night0: '#05070f', night1: '#0c1122', night2: '#161d36', night3: '#232c4a',
    haze: '#4a2230', rust: '#a8452a', ember: '#e8743b', amber: '#f5b04a',
    pale: '#f3e6c8', tv: '#6cb6e0', red: '#e23b4e',
    skinA: '#c98f72', skinZ: '#d6a58a', skinE: '#8b6a5c', hair: '#b9bcc4',
    taxi: '#d9a025', sedan: '#27405a', steel: '#1a2030',
  };

  const rad = d => d * Math.PI / 180;
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const f = n => Math.round(n * 10) / 10;

  function defs() {
    return `<defs>
      <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.night0}"/><stop offset=".45" stop-color="#141230"/>
        <stop offset=".78" stop-color="${P.haze}"/><stop offset="1" stop-color="${P.rust}"/>
      </linearGradient>
      <linearGradient id="gSkyLow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#141230"/><stop offset=".7" stop-color="${P.haze}"/><stop offset="1" stop-color="${P.rust}"/>
      </linearGradient>
      <radialGradient id="gGlow"><stop offset="0" stop-color="${P.amber}" stop-opacity=".9"/>
        <stop offset=".35" stop-color="${P.ember}" stop-opacity=".35"/><stop offset="1" stop-color="${P.ember}" stop-opacity="0"/></radialGradient>
      <radialGradient id="gWhite"><stop offset="0" stop-color="#fff" stop-opacity="1"/>
        <stop offset=".4" stop-color="${P.pale}" stop-opacity=".55"/><stop offset="1" stop-color="${P.pale}" stop-opacity="0"/></radialGradient>
      <radialGradient id="gTv"><stop offset="0" stop-color="${P.tv}" stop-opacity=".55"/><stop offset="1" stop-color="${P.tv}" stop-opacity="0"/></radialGradient>
      <radialGradient id="gRed"><stop offset="0" stop-color="${P.red}" stop-opacity=".9"/><stop offset="1" stop-color="${P.red}" stop-opacity="0"/></radialGradient>
      <linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.amber}" stop-opacity=".45"/><stop offset="1" stop-color="${P.amber}" stop-opacity="0"/></linearGradient>
      <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${P.pale}" stop-opacity=".55"/><stop offset="1" stop-color="${P.pale}" stop-opacity="0"/></linearGradient>
      <pattern id="pCheck" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="${P.amber}"/><rect width="8" height="8" fill="#111"/><rect x="8" y="8" width="8" height="8" fill="#111"/></pattern>
      <pattern id="pPanel" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#23486e"/><path d="M0 0H14M0 0V14" stroke="#6cb6e0" stroke-width="1.5" opacity=".7"/></pattern>
    </defs>`;
  }

  // ---------- части тела ----------
  function arm(sx, sy, a1, a2, L1, L2, w, c, handC) {
    const ex = sx + L1 * Math.sin(rad(a1)), ey = sy + L1 * Math.cos(rad(a1));
    const hx = ex + L2 * Math.sin(rad(a2)), hy = ey + L2 * Math.cos(rad(a2));
    return {
      hx, hy,
      svg: `<path d="M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}L${f(hx)} ${f(hy)}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f(hx)}" cy="${f(hy)}" r="${w * 0.58}" fill="${handC}"/>`
    };
  }
  function eyes(x1, x2, y, blink, look, r) {
    r = r || 5; look = look || 0;
    if (blink) return `<path d="M${x1 - 6} ${y}h12M${x2 - 6} ${y}h12" stroke="#1a1414" stroke-width="3.5" stroke-linecap="round"/>`;
    return `<circle cx="${x1 + look}" cy="${y}" r="${r}" fill="#1a1414"/><circle cx="${x2 + look}" cy="${y}" r="${r}" fill="#1a1414"/>`;
  }

  // ---------- АНЯ ---------- (ноги в 0,0; рост ~450)
  function anya(o) {
    o = Object.assign({ aL: 8, aL2: 4, aR: -8, aR2: -4, blink: false, look: 0, mouth: 'flat', walk: 0, keys: false, phone: false, worry: 0.5 }, o);
    const sw = Math.sin(o.walk) * 22;
    const armL = arm(-58, -312, o.aL, o.aL2, 78, 72, 26, '#8f6424', P.skinA);
    const armR = arm(58, -312, o.aR, o.aR2, 78, 72, 26, '#a8772a', P.skinA);
    let held = '';
    if (o.keys) held += `<g transform="translate(${f(armR.hx)},${f(armR.hy)})">${keys()}</g>`;
    if (o.phone) held += `<g transform="translate(${f(armR.hx - 14)},${f(armR.hy - 44)}) scale(.5)">${phone(o.phoneOn !== false)}</g>`;
    const mouth = o.mouth === 'open' ? `<ellipse cx="2" cy="-352" rx="9" ry="7" fill="#3a1a1a"/>`
      : o.mouth === 'down' ? `<path d="M-10 -350q12 -8 24 0" stroke="#5a2a25" stroke-width="4" fill="none" stroke-linecap="round"/>`
        : `<path d="M-10 -353h24" stroke="#5a2a25" stroke-width="4" stroke-linecap="round"/>`;
    const w = o.worry * 6;
    return `<g>
      <ellipse cx="0" cy="4" rx="80" ry="10" fill="#000" opacity=".35"/>
      <path d="M-28 -170L${-30 + sw} -8" stroke="#1f2742" stroke-width="34" stroke-linecap="round"/>
      <path d="M28 -170L${30 - sw} -8" stroke="#28304f" stroke-width="34" stroke-linecap="round"/>
      <ellipse cx="${-24 + sw}" cy="-4" rx="30" ry="12" fill="#0a0c14"/><ellipse cx="${36 - sw}" cy="-4" rx="30" ry="12" fill="#0a0c14"/>
      ${armL.svg}
      <rect x="-64" y="-338" width="128" height="196" rx="34" fill="#a8772a"/>
      <path d="M-64 -304a34 34 0 0 1 34 -34h8v196h-8a34 34 0 0 1 -34 -34z" fill="#4a2f25"/>
      <path d="M64 -304a34 34 0 0 0 -34 -34h-8v196h8a34 34 0 0 0 34 -34z" fill="#4a2f25"/>
      <rect x="-14" y="-352" width="28" height="26" fill="${P.skinA}"/>
      <path d="M-22 -338q22 22 44 0" stroke="#8f6424" stroke-width="10" fill="none"/>
      <circle cx="0" cy="-390" r="57" fill="${P.hair}"/>
      <rect x="-58" y="-392" width="18" height="44" rx="9" fill="${P.hair}"/><rect x="40" y="-392" width="18" height="44" rx="9" fill="${P.hair}"/>
      <circle cx="0" cy="-385" r="49" fill="${P.skinA}"/>
      <path d="M-52 -404Q0 -486 52 -404z" fill="#1d2338"/>
      <rect x="-53" y="-414" width="106" height="14" fill="url(#pCheck)"/>
      <path d="M-10 -402q50 -6 78 14q-40 -2 -78 0z" fill="#12162a"/>
      <path d="M-28 ${-401 - w}l20 ${w}M30 ${-401 - w}l-20 ${w}" stroke="${P.hair}" stroke-width="5" stroke-linecap="round" transform="translate(0,6)"/>
      ${eyes(-17, 19, -383, o.blink, o.look)}
      <path d="M-26 -372q9 6 18 0M10 -372q9 6 18 0" stroke="#9a6a55" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M2 -378v12h6" stroke="#9a6a55" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M-30 -360q-4 8 0 14M34 -360q4 8 0 14" stroke="#9a6a55" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${mouth}
      ${o.back ? `<circle cx="0" cy="-385" r="50" fill="${P.hair}"/><path d="M-52 -404Q0 -486 52 -404z" fill="#1d2338"/><rect x="-53" y="-414" width="106" height="14" fill="url(#pCheck)"/>` : ''}
      ${armR.svg}${held}
    </g>`;
  }

  // ---------- БАБА ЗИНА ---------- (рост ~335, сутулая)
  function zina(o) {
    o = Object.assign({ aL: 6, aL2: 10, aR: -20, aR2: 30, blink: false, look: 0, mouth: 'flat', walk: 0, keys: true, lipstick: false }, o);
    const sw = Math.sin(o.walk) * 12;
    const armL = arm(-46, -236, o.aL, o.aL2, 56, 52, 22, '#234453', P.skinZ);
    const armR = arm(52, -236, o.aR, o.aR2, 56, 52, 22, '#2c5364', P.skinZ);
    let held = '';
    if (o.keys) held += `<g transform="translate(${f(armL.hx)},${f(armL.hy)}) scale(.85)">${keys(true)}</g>`;
    if (o.lipstick) held += `<g transform="translate(${f(armR.hx)},${f(armR.hy)}) rotate(-30)"><rect x="-6" y="-30" width="12" height="26" rx="2" fill="#c9a24a"/><path d="M-5 -30v-12l10 -6v18z" fill="${P.red}"/></g>`;
    const mouth = o.mouth === 'open' ? `<ellipse cx="12" cy="-262" rx="8" ry="6" fill="#5a1220" stroke="${P.red}" stroke-width="3"/>`
      : `<path d="M2 -263q10 5 20 0" stroke="${P.red}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `<g>
      <ellipse cx="0" cy="4" rx="84" ry="9" fill="#000" opacity=".35"/>
      <rect x="${-30 + sw}" y="-30" width="24" height="26" fill="#3a2f2a"/><rect x="${10 - sw}" y="-30" width="24" height="26" fill="#3a2f2a"/>
      <ellipse cx="${-16 + sw}" cy="-4" rx="24" ry="10" fill="#0a0c14"/><ellipse cx="${24 - sw}" cy="-4" rx="24" ry="10" fill="#0a0c14"/>
      <path d="M-54 -170h108l22 142h-152z" fill="#33263a"/>
      <path d="M-40 -100l-8 70M0 -110v82M40 -100l8 70" stroke="#261c2c" stroke-width="5"/>
      ${armL.svg}
      <rect x="-60" y="-258" width="120" height="112" rx="34" fill="#2c5364"/>
      <path d="M0 -252v104" stroke="#1d3b48" stroke-width="5"/>
      <circle cx="2" cy="-220" r="5" fill="${P.pale}"/><circle cx="2" cy="-192" r="5" fill="${P.pale}"/><circle cx="2" cy="-164" r="5" fill="${P.pale}"/>
      <path d="M-50 -246q58 46 116 -2l-8 -22h-96z" fill="#7a2733"/>
      <circle cx="10" cy="-288" r="52" fill="#8e2f3a"/>
      <path d="M-34 -262q44 40 90 -2l-2 -26h-84z" fill="#8e2f3a"/>
      <g fill="${P.amber}" opacity=".8"><circle cx="-26" cy="-310" r="3.5"/><circle cx="-8" cy="-330" r="3.5"/><circle cx="18" cy="-334" r="3.5"/><circle cx="44" cy="-318" r="3.5"/><circle cx="54" cy="-292" r="3.5"/><circle cx="-34" cy="-284" r="3.5"/></g>
      <ellipse cx="12" cy="-282" rx="35" ry="37" fill="${P.skinZ}"/>
      <path d="M-18 -306q30 -22 60 0q-30 -10 -60 0z" fill="#e6e6ea"/>
      <path d="M0 -244l-10 22l18 -8zM22 -244l12 20l-18 -6z" fill="#7a2733"/>
      ${eyes(-2, 26, -284, o.blink, o.look, 4.5)}
      <circle cx="-2" cy="-284" r="14" fill="${P.tv}" fill-opacity=".14" stroke="${P.pale}" stroke-width="3.5"/>
      <circle cx="26" cy="-284" r="14" fill="${P.tv}" fill-opacity=".14" stroke="${P.pale}" stroke-width="3.5"/>
      <path d="M12 -284h0" stroke="${P.pale}" stroke-width="3.5"/>
      <path d="M-14 -268q-3 6 1 10M38 -268q3 6 -1 10" stroke="#a87862" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${mouth}
      ${o.back ? `<circle cx="10" cy="-288" r="50" fill="#8e2f3a"/><path d="M-30 -262L10 -196L50 -262z" fill="#7a2733"/>` : ''}
      ${armR.svg}${held}
    </g>`;
  }

  // ---------- ПАССАЖИР-ИНЖЕНЕР ---------- (рост ~480, лицо в тени)
  function engineer(o) {
    o = Object.assign({ aL: 5, aL2: 3, aR: -6, aR2: -3, walk: 0, shadow: false, keys: false, bag: true }, o);
    const sw = Math.sin(o.walk) * 24;
    const coat = o.shadow ? '#05070f' : '#161b2c', coat2 = o.shadow ? '#05070f' : '#1e2540';
    const skin = o.shadow ? '#05070f' : P.skinE;
    const armL = arm(-52, -368, o.aL, o.aL2, 86, 80, 24, coat, skin);
    const armR = arm(52, -368, o.aR, o.aR2, 86, 80, 24, coat2, skin);
    let held = '';
    if (o.bag) held += `<g transform="translate(${f(armL.hx)},${f(armL.hy)})"><rect x="-38" y="6" width="76" height="54" rx="6" fill="${o.shadow ? '#05070f' : '#3a2a22'}"/><path d="M-14 6v-12h28v12" stroke="${o.shadow ? '#05070f' : '#3a2a22'}" stroke-width="6" fill="none"/></g>`;
    if (o.keys) held += `<g transform="translate(${f(armR.hx)},${f(armR.hy)})">${keys()}</g>`;
    const detail = o.shadow ? '' : `
      <path d="M-16 -392L0 -300L16 -392" stroke="${P.pale}" stroke-width="4" fill="none" opacity=".8"/>
      <g transform="translate(0,-292)">${badge(0.36)}</g>
      <rect x="-26" y="-440" width="22" height="12" rx="2" fill="${P.pale}"/><rect x="6" y="-440" width="22" height="12" rx="2" fill="${P.pale}"/>
      <path d="M-4 -434h10" stroke="${P.pale}" stroke-width="3"/>
      <path d="M-8 -408h18" stroke="#3a2420" stroke-width="4" stroke-linecap="round"/>`;
    return `<g>
      <ellipse cx="0" cy="4" rx="76" ry="9" fill="#000" opacity=".35"/>
      <path d="M-22 -150L${-24 + sw} -8" stroke="${o.shadow ? '#05070f' : '#0d1020'}" stroke-width="26" stroke-linecap="round"/>
      <path d="M22 -150L${24 - sw} -8" stroke="${o.shadow ? '#05070f' : '#11152a'}" stroke-width="26" stroke-linecap="round"/>
      <ellipse cx="${-18 + sw}" cy="-4" rx="28" ry="10" fill="#05070f"/><ellipse cx="${30 - sw}" cy="-4" rx="28" ry="10" fill="#05070f"/>
      ${armL.svg}
      <path d="M-56 -362a28 28 0 0 1 28 -28h56a28 28 0 0 1 28 28l10 250h-132z" fill="${coat2}"/>
      <path d="M0 -390v278" stroke="${coat}" stroke-width="6"/>
      <path d="M-30 -390l30 54l30 -54" fill="${coat}"/>
      <rect x="-12" y="-402" width="24" height="20" fill="${skin}"/>
      <circle cx="0" cy="-432" r="44" fill="${skin}"/>
      <path d="M-45 -436q4 -46 48 -44q42 2 42 40q-30 -22 -90 4z" fill="#05070f"/>
      ${detail}
      ${armR.svg}${held}
    </g>`;
  }

  // ---------- ДИКТОР (по пояс, для телевизора) ----------
  function announcer(o) {
    o = Object.assign({ mouth: 0 }, o);
    return `<g>
      <path d="M-120 140q0 -110 120 -110t120 110z" fill="#1d2b44"/>
      <path d="M-22 30L0 86L22 30z" fill="${P.pale}"/><path d="M-7 44L0 100L7 44z" fill="#7a2733"/>
      <rect x="-16" y="0" width="32" height="36" fill="#b8c9d6"/>
      <circle cx="0" cy="-40" r="52" fill="#b8c9d6"/>
      <path d="M-54 -46q0 -56 56 -56q54 0 52 52q-40 -30 -108 4z" fill="#27324a"/>
      <circle cx="-18" cy="-42" r="5" fill="#101522"/><circle cx="18" cy="-42" r="5" fill="#101522"/>
      <path d="M-30 -56h22M10 -56h22" stroke="#27324a" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="0" cy="-12" rx="12" ry="${f(2 + o.mouth * 8)}" fill="#3a2030"/>
    </g>`;
  }

  // ---------- ПРЕДМЕТЫ ----------
  function keys(bunch) {
    const one = (r) => `<g transform="rotate(${r})"><circle cx="0" cy="26" r="11" fill="none" stroke="#d8dbe2" stroke-width="5"/><path d="M0 37v34M0 54h9M0 64h9" stroke="#d8dbe2" stroke-width="5" stroke-linecap="round"/></g>`;
    return `<g><circle cx="0" cy="8" r="10" fill="none" stroke="#8c93a6" stroke-width="3"/>${one(-18)}${bunch ? one(8) + one(34) + one(-44) : `<g transform="rotate(22)"><rect x="-10" y="16" width="20" height="30" rx="5" fill="#16192a" stroke="${P.amber}" stroke-width="2"/><circle cx="0" cy="26" r="3" fill="${P.red}"/></g>`}</g>`;
  }
  function badge(s) {
    s = s || 1;
    return `<g transform="scale(${s})">
      <rect x="-70" y="0" width="140" height="190" rx="12" fill="${P.pale}"/>
      <rect x="-70" y="0" width="140" height="44" rx="12" fill="${P.ember}"/><rect x="-70" y="30" width="140" height="14" fill="${P.ember}"/>
      <g transform="translate(0,84) scale(.42)">${orbitaMark('#1d2338')}</g>
      <text x="0" y="140" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="26" fill="#1d2338">ОРБИТА</text>
      <text x="0" y="164" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-size="11.5" fill="#1d2338">СПУТНИКОВАЯ СВЯЗЬ</text>
    </g>`;
  }
  function orbitaMark(c) {
    return `<g fill="none" stroke="${c}" stroke-width="9"><circle r="34" fill="${c}" stroke="none"/><ellipse rx="86" ry="30" transform="rotate(-24)"/><circle cx="74" cy="-48" r="9" fill="${P.ember}" stroke="none"/></g>`;
  }
  function phone(on) {
    return `<g><rect x="-60" y="-110" width="120" height="220" rx="16" fill="#0a0c14" stroke="#3a4260" stroke-width="4"/>
      <rect x="-50" y="-96" width="100" height="192" rx="6" fill="${on ? '#1a2540' : '#0a0c14'}"/>
      ${on ? `<circle cx="0" cy="-36" r="26" fill="#c98f72"/><path d="M-28 -40q4 -34 30 -32q26 2 26 30q-24 -16 -56 2z" fill="#5a3a2a"/>
      <text x="0" y="30" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="17" fill="${P.pale}">ДОЧКА</text>
      <text x="0" y="62" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="16" fill="${P.red}">НЕТ СЕТИ</text>
      <path d="M-22 -86h6M-12 -86h6M-2 -86h6" stroke="#3a4260" stroke-width="4"/><path d="M-26 -92l34 12" stroke="${P.red}" stroke-width="3"/>` : ''}
    </g>`;
  }
  function wheel(x, y, r, rot) {
    return `<g transform="translate(${x},${y}) rotate(${rot || 0})"><circle r="${r}" fill="#07080e"/><circle r="${r * 0.52}" fill="#3a4055"/><path d="M${-r * 0.5} 0h${r}M0 ${-r * 0.5}v${r}" stroke="#07080e" stroke-width="4"/></g>`;
  }
  // машина сбоку, смотрит вправо; длина ~520, колёса на y=0
  function car(o) {
    o = Object.assign({ kind: 'taxi', blink: false, lights: true, rot: 0, driver: '' }, o);
    const body = o.kind === 'taxi' ? P.taxi : P.sedan, dark = o.kind === 'taxi' ? '#a87a18' : '#1a2c40';
    return `<g>
      <ellipse cx="0" cy="34" rx="270" ry="12" fill="#000" opacity=".4"/>
      ${o.lights ? `<path d="M250 -64l420 -70v190l-420 -60z" fill="url(#gBeam)" opacity=".8"/>` : ''}
      <path d="M-256 -20q0 -66 50 -72l52 -6q30 -76 90 -78h96q54 2 96 76l86 14q44 8 44 54v32h-514z" fill="${body}"/>
      <path d="M-256 -20h514v20h-514z" fill="${dark}"/>
      <path d="M-134 -100q26 -58 72 -60h44v60zM0 -160h60q40 2 72 60h-132z" fill="${o.lights ? '#33405e' : '#141a2c'}"/>
      <g transform="translate(-60,-106)">${o.driver}</g>
      ${o.kind === 'taxi' ? `<rect x="-200" y="-74" width="420" height="16" fill="url(#pCheck)"/><rect x="-50" y="-200" width="60" height="24" rx="5" fill="${P.amber}"/><text x="-20" y="-182" text-anchor="middle" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="17" fill="#111">ТАКСИ</text>` : `<path d="M-200 -66h420" stroke="#35546f" stroke-width="5"/>`}
      <path d="M-10 -98v92" stroke="${dark}" stroke-width="4"/>
      <rect x="236" y="-66" width="22" height="18" rx="5" fill="${o.lights ? P.pale : '#555'}"/>
      <rect x="-258" y="-66" width="14" height="18" rx="4" fill="${o.lights ? P.red : '#522'}"/>
      ${o.blink ? `<circle cx="252" cy="-36" r="34" fill="url(#gGlow)"/><circle cx="-252" cy="-36" r="34" fill="url(#gGlow)"/><rect x="240" y="-44" width="16" height="12" rx="3" fill="${P.amber}"/><rect x="-258" y="-44" width="14" height="12" rx="3" fill="${P.amber}"/>` : `<rect x="240" y="-44" width="16" height="12" rx="3" fill="#6b4a14"/>`}
      ${wheel(-150, 0, 44, o.rot)}${wheel(160, 0, 44, o.rot)}
    </g>`;
  }
  function heli(o) {
    o = Object.assign({ rot: 0, blink: true }, o);
    const w = 150 * Math.abs(Math.cos(o.rot)) + 20;
    return `<g>
      <path d="M-70 0q0 -46 60 -46h40q50 0 60 46q-10 30 -60 30h-50q-50 0 -50 -30z" fill="#080a14"/>
      <path d="M-60 -6l-190 -22v14l190 30z" fill="#080a14"/><path d="M-250 -60v64" stroke="#080a14" stroke-width="10" stroke-linecap="round"/>
      <path d="M30 -36q40 4 52 34h-52z" fill="#2a3a5a"/>
      <path d="M0 -46v-22" stroke="#080a14" stroke-width="8"/>
      <ellipse cx="0" cy="-70" rx="${f(w)}" ry="5" fill="#2a3048" opacity=".9"/>
      <path d="M-40 44h110M-20 30v14M40 30v14" stroke="#080a14" stroke-width="6" stroke-linecap="round"/>
      ${o.blink ? `<circle cx="-250" cy="-60" r="26" fill="url(#gRed)"/><circle cx="-250" cy="-60" r="5" fill="${P.red}"/>` : ''}
    </g>`;
  }
  // «монстр» серии: сбитый спутник. size 1 ≈ 300px
  function satellite(o) {
    o = Object.assign({ rot: 0, fire: 1, lamp: true }, o);
    return `<g>
      <circle r="${f(230 * o.fire)}" fill="url(#gGlow)"/>
      <g transform="rotate(${f(o.rot)})">
        <path d="M-40 -50l-150 -260" stroke="${P.ember}" stroke-width="5" opacity=".7" stroke-dasharray="14 18"/>
        <rect x="-205" y="-30" width="140" height="60" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4"/>
        <path d="M-65 0h20" stroke="#8c93a6" stroke-width="8"/>
        <rect x="-46" y="-46" width="92" height="92" rx="8" fill="#c9a24a"/>
        <path d="M-46 -10h92M-10 -46v92" stroke="#8a6a22" stroke-width="4"/>
        <path d="M46 0h22" stroke="#8c93a6" stroke-width="8"/>
        <path d="M68 -30h70l22 22l-30 10l14 28h-76z" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4"/>
        <path d="M150 -10l30 -16M146 20l34 18M126 34l10 30" stroke="${P.amber}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="0" cy="-62" r="20" fill="none" stroke="#d8dbe2" stroke-width="6"/><path d="M0 -46v-16" stroke="#d8dbe2" stroke-width="6"/>
        ${o.lamp ? `<circle cx="30" cy="30" r="44" fill="url(#gWhite)"/><circle cx="30" cy="30" r="9" fill="#fff"/>` : `<circle cx="30" cy="30" r="9" fill="#5a2a25"/>`}
      </g>
    </g>`;
  }
  function bird(o) {
    o = Object.assign({ flap: 0 }, o);
    return `<g fill="#05070f"><ellipse cx="0" cy="-14" rx="12" ry="16"/><circle cx="4" cy="-32" r="8"/><path d="M11 -33l10 3l-10 3z"/><path d="M-8 -6l-14 ${f(14 - o.flap * 30)}l18 -8z"/><path d="M-3 0v8M3 0v8" stroke="#05070f" stroke-width="2"/></g>`;
  }
  // точка в небе
  function dot(x, y, r, on) {
    return `<circle cx="${x}" cy="${y}" r="${r * 7}" fill="url(#gGlow)" opacity="${on ? 1 : .35}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${on ? '#fff' : P.ember}"/>`;
  }

  // ---------- ФОНЫ (1080×1920) ----------
  function stars(seed, n, maxY) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * 1080)}" cy="${f(r() * maxY)}" r="${f(1 + r() * 1.8)}" fill="${P.pale}" opacity="${f(.15 + r() * .5)}"/>`;
    return s;
  }
  function skyline(seed, baseY, minH, maxH, color, litP, bottom) {
    const r = rng(seed); let s = '', x = -30;
    while (x < 1100) {
      const w = 60 + r() * 90, h = minH + r() * (maxH - minH);
      s += `<rect x="${f(x)}" y="${f(baseY - h)}" width="${f(w)}" height="${f(h + (bottom || 600))}" fill="${color}"/>`;
      for (let wy = baseY - h + 14; wy < baseY - 10; wy += 26)
        for (let wx = x + 10; wx < x + w - 14; wx += 22)
          if (r() < litP) s += `<rect x="${f(wx)}" y="${f(wy)}" width="9" height="12" fill="${P.amber}" opacity="${f(.35 + r() * .5)}"/>`;
      x += w + r() * 14;
    }
    return s;
  }
  function tower(x, top, w, litTop) {
    let s = `<rect x="${x}" y="${top}" width="${w}" height="${1920 - top}" fill="#090c18"/><rect x="${x + w - 16}" y="${top}" width="16" height="${1920 - top}" fill="#0f1426"/>`;
    const r = rng(77);
    for (let y = top + 24; y < 1900; y += 44)
      for (let wx = x + 16; wx < x + w - 36; wx += 40)
        s += `<rect x="${wx}" y="${y}" width="26" height="28" fill="${r() < .06 ? P.amber : '#111830'}" opacity="${r() < .5 ? .9 : .7}"/>`;
    if (litTop) s += `<circle cx="${x + w / 2}" cy="${top + 38}" r="70" fill="url(#gGlow)" opacity=".6"/><rect x="${x + 16}" y="${top + 24}" width="${w - 48}" height="28" fill="${P.pale}"/>`;
    s += `<path d="M${x + w / 2} ${top}v-80" stroke="#090c18" stroke-width="6"/><circle cx="${x + w / 2}" cy="${top - 80}" r="5" fill="${P.red}"/>`;
    return s;
  }
  function lamp(x, y, h, on) {
    return `<path d="M${x} ${y}v${-h}h60" stroke="#0a0c14" stroke-width="10" fill="none" stroke-linecap="round"/>${on !== false ? `<path d="M${x + 60} ${y - h}l-150 ${h}h300z" fill="url(#gCone)"/><circle cx="${x + 60}" cy="${y - h + 4}" r="26" fill="url(#gGlow)"/>` : ''}<rect x="${x + 44}" y="${y - h - 2}" width="32" height="10" rx="4" fill="${on !== false ? P.amber : '#333'}"/>`;
  }
  // река фар
  function headlightRiver(seed, pts, n, shift) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      let t = (i / n + (shift || 0)) % 1; if (t < 0) t += 1;
      const seg = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))), lt = t * (pts.length - 1) - seg;
      const x = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * lt + (r() - .5) * pts[seg][2];
      const y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * lt + (r() - .5) * pts[seg][2] * .4;
      const sz = pts[seg][3] + (pts[seg + 1][3] - pts[seg][3]) * lt;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz)}" fill="${r() < .5 ? P.amber : P.pale}" opacity="${f(.5 + r() * .5)}"/>`;
    }
    return s;
  }

  const bg = {
    // 1. Небо над городом
    sky(o) {
      o = Object.assign({ dotR: 7, dotOn: true, dotX: 700, dotY: 520 }, o);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${stars(3, 90, 1200)}
        ${dot(o.dotX, o.dotY, o.dotR, o.dotOn)}
        <rect y="1380" width="1080" height="540" fill="${P.rust}" opacity=".25"/>
        ${skyline(11, 1560, 80, 300, '#1a1528', .12)}
        ${tower(170, 820, 210, true)}
        ${skyline(12, 1760, 120, 380, '#070913', .1)}`;
    },
    // 2. Улица у башни
    street(o) {
      o = Object.assign({ dotR: 6, dotOn: true }, o);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${stars(5, 60, 900)}${dot(820, 300, o.dotR, o.dotOn)}
        ${skyline(21, 1380, 120, 420, '#141226', .1)}
        ${headlightRiver(8, [[1080, 1392, 10, 5], [520, 1400, 10, 5]], 26, o.flow)}
        <rect x="-10" y="-10" width="470" height="1500" fill="#080b16"/><rect x="430" y="-10" width="30" height="1500" fill="#0e1326"/>
        ${(() => { let s = ''; const r = rng(31); for (let y = 30; y < 1250; y += 92) for (let x = 24; x < 400; x += 100) s += `<rect x="${x}" y="${y}" width="76" height="66" fill="${r() < .05 ? P.amber : '#101730'}" opacity=".9"/>`; return s; })()}
        <rect x="24" y="30" width="376" height="66" fill="${P.pale}" opacity=".85"/><circle cx="210" cy="60" r="150" fill="url(#gGlow)" opacity=".5"/>
        <rect x="130" y="1270" width="200" height="230" fill="${P.amber}" opacity=".75"/><path d="M230 1270v230" stroke="#080b16" stroke-width="8"/>
        <path d="M130 1500h200l120 140h-440z" fill="${P.amber}" opacity=".12"/>
        <rect y="1490" width="1080" height="430" fill="#0a0c16"/><rect y="1490" width="1080" height="14" fill="#1a1f33"/>
        <path d="M0 1790h1080" stroke="${P.pale}" stroke-width="8" stroke-dasharray="90 70" opacity=".25"/>
        ${lamp(900, 1500, 620)}`;
    },
    // 3. Лифт
    lift(o) {
      o = Object.assign({ floor: 25, light: 1, open: 0 }, o);
      const op = o.open * 250;
      return `<rect width="1080" height="1920" fill="#0b0e1a"/>
        <rect x="90" y="140" width="900" height="1560" fill="${P.steel}"/>
        <rect x="90" y="140" width="900" height="1560" fill="${P.pale}" opacity="${f(.10 * o.light)}"/>
        <rect x="290" y="420" width="500" height="1280" fill="#060810"/>
        <rect x="${290 - op}" y="420" width="250" height="1280" fill="#232b42"/><rect x="${540 + op}" y="420" width="250" height="1280" fill="#283150"/>
        <path d="M${540 - op} 420v1280M${540 + op} 420v1280" stroke="#0b0e1a" stroke-width="6"/>
        <rect x="290" y="420" width="500" height="1280" fill="none" stroke="#39425e" stroke-width="12"/>
        <rect x="430" y="230" width="220" height="130" rx="10" fill="#05060c" stroke="#39425e" stroke-width="6"/>
        <text x="540" y="328" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="96" fill="${P.ember}">${o.floor}</text>
        <path d="M610 262l14 -22l14 22z" fill="${P.ember}"/>
        <rect x="840" y="820" width="90" height="300" rx="8" fill="#0f1322"/>
        ${[0, 1, 2, 3, 4].map(i => `<circle cx="885" cy="${870 + i * 52}" r="16" fill="${i === 0 ? P.amber : '#2a324c'}"/>`).join('')}
        <rect x="330" y="150" width="420" height="26" rx="8" fill="${P.pale}" opacity="${f(.25 + .75 * o.light)}"/>
        <path d="M330 176l-170 1524h760l-170 -1524z" fill="${P.pale}" opacity="${f(.06 * o.light)}"/>
        <rect x="90" y="1700" width="900" height="220" fill="#080a12"/>`;
    },
    // 4. Офис на 25-м этаже
    office(o) {
      o = Object.assign({ dotR: 9, dotOn: true, dotX: 640, dotY: 560, tv: 1, marks: 0, mouth: 0, flow: 0 }, o);
      const marks = [[430, 640], [500, 612], [570, 586], [640, 560]];
      let ms = '';
      for (let i = 0; i < Math.min(o.marks, marks.length); i++) ms += `<path d="M${marks[i][0] - 16} ${marks[i][1] - 16}l32 32m0 -32l-32 32" stroke="${P.red}" stroke-width="9" stroke-linecap="round"/>`;
      if (o.marks > 4) ms += `<path d="M430 640L${430 + (o.marks - 4) * 420} ${640 - (o.marks - 4) * 160}" stroke="${P.red}" stroke-width="7" stroke-dasharray="26 18" stroke-linecap="round"/>`;
      return `<rect width="1080" height="1920" fill="#080a14"/>
        <g><rect x="0" y="330" width="1080" height="900" fill="url(#gSkyLow)"/>${stars(9, 40, 800)}
        ${dot(o.dotX, o.dotY, o.dotR, o.dotOn)}
        ${skyline(41, 1150, 30, 150, '#100e1e', .2, 100)}
        ${headlightRiver(17, [[80, 1230, 60, 5], [300, 1140, 40, 4], [620, 1060, 22, 3], [900, 1010, 10, 2]], 110, o.flow)}
        ${ms}</g>
        <path d="M270 330v900M540 330v900M810 330v900M0 780h1080" stroke="#05060c" stroke-width="14"/>
        <rect x="0" y="0" width="1080" height="330" fill="#0c1020"/>
        <rect x="120" y="290" width="840" height="14" rx="6" fill="${P.pale}" opacity=".18"/>
        <g transform="translate(330,170) scale(.8)">${orbitaMark(P.ember)}</g>
        <text x="440" y="200" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="92" letter-spacing="8" fill="${P.pale}" opacity=".92">ОРБИТА</text>
        <text x="444" y="250" font-family="Inter, DejaVu Sans, sans-serif" font-size="30" letter-spacing="7" fill="${P.pale}" opacity=".55">СПУТНИКОВАЯ СВЯЗЬ</text>
        <rect x="0" y="1230" width="1080" height="690" fill="#0a0d18"/><rect x="0" y="1230" width="1080" height="12" fill="#1a2036"/>
        ${[[60, 1340, .7], [640, 1340, .7]].map(d => `<g transform="translate(${d[0]},${d[1]}) scale(${d[2]})"><rect x="0" y="0" width="520" height="24" fill="#1a2036"/><rect x="20" y="24" width="18" height="190" fill="#141a2c"/><rect x="482" y="24" width="18" height="190" fill="#141a2c"/><rect x="150" y="-150" width="210" height="130" rx="6" fill="#05060c" stroke="#1a2036" stroke-width="6"/><rect x="240" y="-20" width="30" height="20" fill="#1a2036"/></g>`).join('')}
        <g transform="translate(740,1560)">
          <circle cx="0" cy="-40" r="${f(420 * o.tv)}" fill="url(#gTv)"/>
          <rect x="-250" y="-210" width="500" height="320" rx="14" fill="#05060c" stroke="#232b44" stroke-width="10"/>
          <rect x="-232" y="-192" width="464" height="284" fill="${o.tv ? '#16324a' : '#080a12'}"/>
          ${o.tv ? `<g transform="translate(-90,-60) scale(.95)">${announcer({ mouth: o.mouth })}</g>
          <rect x="-232" y="44" width="464" height="48" fill="${P.red}"/>
          <text x="-218" y="78" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="29" fill="#fff">СОХРАНЯЙТЕ СПОКОЙСТВИЕ</text>
          <text x="40" y="-120" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="24" fill="${P.pale}">РАСЧЁТЫ</text><text x="40" y="-88" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="24" fill="${P.pale}">НЕВЕРНЫ</text>` : ''}
          <rect x="-20" y="110" width="40" height="250" fill="#141a2c"/><rect x="-130" y="350" width="260" height="16" fill="#141a2c"/>
        </g>`;
    },
    // 5. Парковка у башни
    parking(o) {
      o = Object.assign({ dotR: 8, dotOn: true }, o);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${stars(6, 50, 800)}${dot(300, 380, o.dotR, o.dotOn)}
        ${skyline(51, 1220, 100, 380, '#121024', .08)}
        <rect x="640" y="-10" width="460" height="1300" fill="#080b16"/>
        ${(() => { let s = ''; const r = rng(53); for (let y = 30; y < 1200; y += 92) for (let x = 670; x < 1060; x += 100) s += `<rect x="${x}" y="${y}" width="76" height="66" fill="${r() < .04 ? P.amber : '#101730'}"/>`; return s; })()}
        <rect y="1240" width="1080" height="680" fill="#0b0d17"/>
        <rect y="1240" width="1080" height="60" fill="#151a2c"/>
        ${[0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * 250} 1300l-90 620" stroke="${P.pale}" stroke-width="8" opacity=".22"/>`).join('')}
        <text x="160" y="1420" font-family="Inter, DejaVu Sans, sans-serif" font-weight="700" font-size="60" fill="${P.pale}" opacity=".16">P 25</text>
        ${lamp(120, 1300, 700)}${lamp(760, 1300, 700, false)}`;
    },
    // 6. Трасса, пустая встречная
    highway(o) {
      o = Object.assign({ dotR: 12, dotOn: true, move: 0 }, o);
      const vx = 540, vy = 820; let jam = '', dash = '', posts = '';
      const r = rng(61);
      for (let i = 0; i < 26; i++) {
        const t = Math.pow(((i + .5 + (o.jam || 0) * 26) % 26) / 26, 2.2), y = vy + t * 1100, sc = .08 + t * 1.5;
        for (let lane = 0; lane < 2; lane++) {
          const x = vx - (130 + lane * 250 + (r() - .5) * 30) * sc;
          jam += `<g transform="translate(${f(x)},${f(y)}) scale(${f(sc)})"><rect x="-70" y="-90" width="140" height="90" rx="16" fill="#0a0c16"/><circle cx="-48" cy="-36" r="30" fill="url(#gRed)"/><circle cx="48" cy="-36" r="30" fill="url(#gRed)"/><rect x="-62" y="-46" width="28" height="16" rx="4" fill="${P.red}"/><rect x="34" y="-46" width="28" height="16" rx="4" fill="${P.red}"/></g>`;
        }
      }
      for (let i = 0; i < 12; i++) {
        let t = ((i + (o.move % 1)) / 12); t = Math.pow(t, 2.4);
        const y1 = vy + t * 1100, y2 = y1 + 14 + t * 150, s1 = .08 + t * 1.5, s2 = .08 + ((y2 - vy) / 1100) * 1.5;
        dash += `<path d="M${f(vx + 270 * s1)} ${f(y1)}L${f(vx + 270 * s2)} ${f(y2)}" stroke="${P.pale}" stroke-width="${f(3 + t * 16)}" opacity=".5"/>`;
        posts += `<g transform="translate(${f(vx + 560 * s1)},${f(y1)}) scale(${f(s1)})"><path d="M0 0v-420h-90" stroke="#07080e" stroke-width="16" fill="none"/><circle cx="-90" cy="-416" r="60" fill="url(#gGlow)"/><rect x="-116" y="-426" width="52" height="14" rx="6" fill="${P.amber}"/></g>`;
      }
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${stars(7, 70, 780)}
        ${dot(600, 420, o.dotR, o.dotOn)}
        <rect y="760" width="1080" height="80" fill="${P.rust}" opacity=".35"/>
        ${skyline(62, 826, 6, 30, '#0a0912', 0, 10)}
        <rect y="822" width="1080" height="1100" fill="#07090f"/>
        <path d="M${vx - 40} ${vy}L-760 1920h2600L${vx + 40} ${vy}z" fill="#10131f"/>
        <path d="M${vx} ${vy}L${vx - 30} 1920h60z" fill="#232b44"/>
        ${dash}${posts}${jam}`;
    },
    // 7. Холм над полем
    hill(o) {
      o = Object.assign({ dotR: 16, dotOn: true, glow: 0, back: 0, flap: 0, grass: 0 }, o);
      const r = rng(71); let lights = '', grass = '';
      for (let i = 0; i < 900; i++) {
        const t = Math.pow(r(), 1.8), y = 1075 + t * 400, x = r() * 1080;
        lights += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + t * 4)}" fill="${r() < .6 ? P.amber : P.pale}" opacity="${f(.35 + r() * .6)}"/>`;
      }
      for (let i = 0; i < 70; i++) {
        const x = r() * 1080, y = 1560 - (x / 1080) * 150 + 10 * Math.sin(x / 90), h = 30 + r() * 40, lean = o.grass * 28;
        grass += `<path d="M${f(x)} ${f(y + 6)}q${f(lean / 2)} ${f(-h / 2)} ${f(lean)} ${f(-h)}" stroke="#03040a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      }
      const wy = x => 330 + 60 * Math.sin((x + 200) / 1500 * Math.PI);
      let birds = '';
      [300, 380, 430, 560, 640, 700, 860].forEach((x, i) => birds += `<g transform="translate(${x},${f(wy(x))}) scale(1.5)">${bird({ flap: o.flap * ((i % 2) ? 1 : .6) })}</g>`);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${stars(8, 80, 1000)}
        ${dot(760, 300, o.dotR, o.dotOn)}
        ${o.glow ? `<ellipse cx="540" cy="1060" rx="${f(300 + 900 * o.glow)}" ry="${f(60 + 700 * o.glow)}" fill="url(#gWhite)" opacity="${f(Math.min(1, o.glow * 1.3))}"/>` : ''}
        <rect y="1060" width="1080" height="500" fill="#0a0b14"/>
        <rect y="1052" width="1080" height="16" fill="${P.rust}" opacity=".5"/>
        ${lights}
        <path d="M-20 1560Q500 1500 1100 1400V1940H-20z" fill="#03040a"/>
        ${grass}
        <path d="M130 1560V240M90 300h80M100 360h60" stroke="#03040a" stroke-width="14" stroke-linecap="round"/>
        <path d="M-200 330Q550 ${330 + 120} 1300 330" stroke="#03040a" stroke-width="5" fill="none" transform="translate(0,0)"/>
        ${birds}
        ${o.back ? `<rect width="1080" height="1920" fill="${P.pale}" opacity="${f(o.back * .5)}"/>` : ''}`;
    },
  };

  window.ART = { P, defs, anya, zina, engineer, announcer, keys, badge, orbitaMark, phone, car, heli, satellite, bird, dot, bg, rng, stars, skyline, lamp, headlightRiver };
})();
