// Серия 3 — новые рисунки. Дополняет ART (seriya-01/art/art.js + seriya-02/art/art2.js).
(function () {
  const A = window.ART, P = A.P, rng = A.rng;
  const f = n => Math.round(n * 10) / 10;
  const FONT = 'font-family="Inter, DejaVu Sans, sans-serif"';
  const rad = d => d * Math.PI / 180;
  function limb(sx, sy, a1, a2, L1, L2, w, c, hc) {
    const ex = sx + L1 * Math.sin(rad(a1)), ey = sy + L1 * Math.cos(rad(a1));
    const hx = ex + L2 * Math.sin(rad(a2)), hy = ey + L2 * Math.cos(rad(a2));
    return { hx, hy, svg: `<path d="M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}L${f(hx)} ${f(hy)}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f(hx)}" cy="${f(hy)}" r="${w * .58}" fill="${hc}"/>` };
  }

  // пассажир без очков (поверх рисунка серии 1)
  function engineerNoGlasses(o) {
    o = o || {};
    const glasses = o.glassesInHand;
    const base = A.engineer(Object.assign({ bag: false }, o));
    return `<g>${base}
      <rect x="-30" y="-446" width="62" height="22" fill="${P.skinE}"/>
      <circle cx="-15" cy="-434" r="5" fill="#1a1414"/><circle cx="17" cy="-434" r="5" fill="#1a1414"/>
      <path d="M-28 -446l20 4M30 -446l-20 4" stroke="#05070f" stroke-width="5" stroke-linecap="round"/>
      ${glasses ? `<g transform="translate(${glasses[0]} ${glasses[1]}) rotate(-20)"><rect x="-26" y="-6" width="22" height="12" rx="2" fill="${P.pale}"/><rect x="6" y="-6" width="22" height="12" rx="2" fill="${P.pale}"/><path d="M-4 0h10" stroke="${P.pale}" stroke-width="3"/></g>` : ''}</g>`;
  }

  // ЛЕНА, ~35 (рост ~420): тёмный хвост, бордовая куртка — как на фото
  function lena(o) {
    o = Object.assign({ aL: 8, aL2: 4, aR: -8, aR2: -4, blink: false, look: 0, mouth: 'flat', walk: 0, phone: false }, o);
    const sw = Math.sin(o.walk) * 20, skin = '#d6a58a';
    const L = limb(-50, -300, o.aL, o.aL2, 72, 68, 22, '#5e1f2a', skin), R = limb(50, -300, o.aR, o.aR2, 72, 68, 22, '#7a2733', skin);
    const mouth = o.mouth === 'open' ? `<ellipse cx="0" cy="-326" rx="9" ry="8" fill="#3a1a1a"/>` : `<path d="M-9 -330h18" stroke="#7a2733" stroke-width="4" stroke-linecap="round"/>`;
    return `<g><ellipse cx="0" cy="4" rx="70" ry="9" fill="#000" opacity=".35"/>
      <path d="M-20 -160L${-22 + sw} -8" stroke="#1d2338" stroke-width="28" stroke-linecap="round"/><path d="M20 -160L${22 - sw} -8" stroke="#232a44" stroke-width="28" stroke-linecap="round"/>
      ${L.svg}
      <path d="M-56 -296a26 26 0 0 1 26 -26h60a26 26 0 0 1 26 26l6 140h-124z" fill="#7a2733"/>
      <rect x="-12" y="-338" width="24" height="22" fill="${skin}"/>
      <path d="M30 -390q40 30 20 90q-6 -40 -26 -60z" fill="#5a3a2a"/>
      <circle cx="0" cy="-360" r="40" fill="${skin}"/>
      <path d="M-42 -356q0 -52 44 -52q42 0 40 50q-20 -32 -52 -28q-18 30 -32 30z" fill="#5a3a2a"/>
      ${o.blink ? `<path d="M-20 -360h12M8 -360h12" stroke="#1a1414" stroke-width="3" stroke-linecap="round"/>` : `<circle cx="${-14 + o.look}" cy="-360" r="4.5" fill="#1a1414"/><circle cx="${14 + o.look}" cy="-360" r="4.5" fill="#1a1414"/>`}
      ${mouth}${R.svg}
      ${o.phone ? `<rect x="${f(R.hx - 12)}" y="${f(R.hy - 40)}" width="24" height="42" rx="5" fill="#0a0c14" stroke="${P.tv}" stroke-width="3"/>` : ''}</g>`;
  }
  // ТЁМА, ~6 (рост ~230): жёлтая куртка, красная кепка
  function tyoma(o) {
    o = Object.assign({ aL: 10, aL2: 4, aR: -10, aR2: -4, look: 0, walk: 0, cap: true, back: false }, o);
    const sw = Math.sin(o.walk) * 12, skin = '#e0b294';
    const L = limb(-30, -150, o.aL, o.aL2, 40, 38, 16, '#d9a025', skin), R = limb(30, -150, o.aR, o.aR2, 40, 38, 16, '#e3ad2c', skin);
    return `<g><ellipse cx="0" cy="3" rx="44" ry="6" fill="#000" opacity=".35"/>
      <path d="M-12 -80L${-13 + sw} -6" stroke="#1d2338" stroke-width="18" stroke-linecap="round"/><path d="M12 -80L${13 - sw} -6" stroke="#232a44" stroke-width="18" stroke-linecap="round"/>
      ${L.svg}<rect x="-34" y="-160" width="68" height="90" rx="20" fill="#e3ad2c"/>
      <circle cx="0" cy="-188" r="30" fill="${o.back ? '#3a2a22' : skin}"/>
      ${o.back ? '' : `<path d="M-30 -192q4 -32 32 -30q28 2 28 30q-28 -18 -60 0z" fill="#3a2a22"/><circle cx="${-10 + o.look}" cy="-186" r="3.5" fill="#1a1414"/><circle cx="${10 + o.look}" cy="-186" r="3.5" fill="#1a1414"/><path d="M-6 -174q6 5 12 0" stroke="#7a2733" stroke-width="3" fill="none" stroke-linecap="round"/>`}
      ${o.cap ? `<g transform="translate(0 -206)">${cap(.55)}</g>` : ''}${R.svg}</g>`;
  }
  // Тёмина кепка
  function cap(s) {
    return `<g transform="scale(${s || 1})"><path d="M-54 0q0 -56 54 -56q54 0 54 56z" fill="${P.red}"/><path d="M0 0h88q8 0 4 10h-92z" fill="#a8262f"/>
      <path d="M-54 0h54" stroke="#a8262f" stroke-width="6"/><circle cx="0" cy="-56" r="6" fill="#fff"/>
      <text x="0" y="-14" text-anchor="middle" ${FONT} font-weight="900" font-size="30" fill="#fff">Т</text></g>`;
  }
  // ракета с красным следом (направлена вправо-вверх)
  function missile(o) {
    o = Object.assign({ trail: 1, flame: 1 }, o);
    return `<g><path d="M-${f(700 * o.trail)} 18C-${f(400 * o.trail)} 10 -200 4 -40 0" stroke="${P.red}" stroke-width="10" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M-${f(700 * o.trail)} 30C-${f(400 * o.trail)} 24 -200 12 -40 6" stroke="#8a8a9a" stroke-width="28" fill="none" opacity=".18" stroke-linecap="round"/>
      <circle cx="-46" cy="0" r="${f(46 * o.flame)}" fill="url(#gRed)"/><path d="M-30 -8L${f(-30 - 70 * o.flame)} 0L-30 8z" fill="${P.amber}"/>
      <path d="M-30 -10h90l26 10l-26 10h-90z" fill="#c8ccd6"/><path d="M-30 -10l-14 -16h20l12 16zM-30 10l-14 16h20l12 -16z" fill="#8c93a6"/>
      <circle cx="40" cy="0" r="4" fill="${P.red}"/></g>`;
  }
  // объект на земле: опоры, открытый люк, свет изнутри
  function landed(o) {
    o = Object.assign({ hatch: 0, glow: 1 }, o);
    const h = o.hatch;
    return `<g>
      <ellipse cx="0" cy="0" rx="300" ry="40" fill="#000" opacity=".5"/>
      <circle cx="0" cy="-150" r="${f(320 * o.glow)}" fill="url(#gWhite)" opacity=".55"/>
      <path d="M-70 -110L-130 0M70 -110L130 0M0 -100V0" stroke="#3a3f52" stroke-width="12"/><path d="M-150 0h40M110 0h40" stroke="#3a3f52" stroke-width="10"/>
      <g transform="translate(0 -170) scale(1.1)">
        <rect x="-205" y="-30" width="140" height="60" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4" transform="rotate(-8 -135 0)"/>
        <rect x="68" y="-30" width="140" height="60" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4" transform="rotate(8 138 0)"/>
        <path d="M-65 0h20M46 0h22" stroke="#8c93a6" stroke-width="8"/>
        <rect x="-62" y="-62" width="124" height="124" rx="10" fill="#c9a24a"/><path d="M-62 -16h124M-16 -62v124" stroke="#8a6a22" stroke-width="4"/>
        <rect x="-30" y="-40" width="60" height="96" rx="6" fill="#05070f"/>
        ${h > 0 ? `<rect x="-30" y="-40" width="60" height="96" rx="6" fill="#fff" opacity="${f(h)}"/><path d="M-30 56L${f(-30 - 60 * h)} ${f(56 + 110 * h)}H${f(30 + 60 * h)}L30 56z" fill="#fff" opacity="${f(.35 * h)}"/>` : ''}
        <path d="M-30 -40l${f(-50 * h)} ${f(-30 * h)}v96l${f(50 * h)} ${f(30 * h)}z" fill="#8a6a22"/>
        <circle cx="0" cy="-82" r="20" fill="none" stroke="#d8dbe2" stroke-width="6"/><path d="M0 -66v-16" stroke="#d8dbe2" stroke-width="6"/>
      </g></g>`;
  }
  // «тот, кто вышел»: высокий силуэт, контровой свет, длинные руки
  function stranger(o) {
    o = Object.assign({ reach: 0, eyes: 1 }, o);
    const a = -10 - 70 * o.reach;
    const R = limb(40, -540, a, a - 10, 170, 170, 26, '#030408', '#030408');
    return `<g><ellipse cx="0" cy="4" rx="90" ry="10" fill="#000" opacity=".5"/>
      <path d="M-26 -320L-40 -6M26 -320L40 -6" stroke="#030408" stroke-width="34" stroke-linecap="round"/>
      <path d="M-40 -540L-60 -200" stroke="#030408" stroke-width="26" stroke-linecap="round"/><path d="M-60 -200L-70 -60" stroke="#030408" stroke-width="22" stroke-linecap="round"/>
      <path d="M-56 -560q56 -30 112 0l-14 250h-84z" fill="#030408"/>
      <ellipse cx="0" cy="-620" rx="40" ry="58" fill="#030408"/>
      <path d="M-56 -560q56 -30 112 0l-14 250h-84zM0 -678a40 58 0 0 1 40 58" fill="none" stroke="#fff" stroke-width="4" opacity=".55"/>
      ${R.svg}
      ${o.eyes ? `<circle cx="-14" cy="-626" r="5" fill="${P.tv}" opacity="${o.eyes}"/><circle cx="14" cy="-626" r="5" fill="${P.tv}" opacity="${o.eyes}"/>` : ''}</g>`;
  }

  const bg3 = {
    // пустое поле, объект в центре
    emptyField(o) {
      o = Object.assign({ hatch: 0, dust: 0, glow: 1, objX: 540, objY: 1330, objS: .7 }, o);
      let tents = ''; const r = rng(66);
      for (let i = 0; i < 9; i++) { const t = r(), x = r() * 1080, y = 1180 + t * 300; tents += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(.3 + t * .6)})">${A.tent(260, 160, r() < .3, '#2c3530')}</g>`; }
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(23, 100, 1050)}
        <rect y="1100" width="1080" height="820" fill="#0b0c14"/><rect y="1092" width="1080" height="14" fill="${P.rust}" opacity=".5"/>
        ${A.headlightRiver(5, [[0, 1112, 30, 3], [1080, 1112, 30, 3]], 80, 0)}
        ${tents}
        ${o.dust ? `<ellipse cx="${o.objX}" cy="${o.objY}" rx="${f(200 + 600 * o.dust)}" ry="${f(40 + 120 * o.dust)}" fill="none" stroke="#8a7a60" stroke-width="${f(30 * (1 - o.dust) + 4)}" opacity="${f(.6 * (1 - o.dust))}"/>` : ''}
        <g transform="translate(${o.objX} ${o.objY}) scale(${o.objS})">${landed({ hatch: o.hatch, glow: o.glow })}</g>`;
    },
    // площадка у элеватора
    yard(o) {
      o = Object.assign({ lamp: 1, objGlow: 1 }, o);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(24, 60, 700)}
        <circle cx="880" cy="1060" r="${f(260 * o.objGlow)}" fill="url(#gWhite)" opacity=".7"/>
        <g fill="#080a12"><rect x="-20" y="300" width="200" height="1100"/><rect x="190" y="380" width="200" height="1020"/><rect x="400" y="340" width="180" height="1060"/>
          <rect x="-40" y="160" width="300" height="180"/><path d="M-40 160l150 -120l150 120z"/><path d="M260 240L700 900" stroke="#080a12" stroke-width="22"/></g>
        <text x="300" y="900" text-anchor="middle" ${FONT} font-weight="900" font-size="58" fill="${P.pale}" opacity=".16" transform="rotate(-90 300 900)">ЭЛЕВАТОР</text>
        <rect x="70" y="1100" width="140" height="200" fill="#1a1d2a"/><rect x="90" y="1120" width="100" height="180" fill="#0a0c14"/>
        <rect y="1390" width="1080" height="530" fill="#2a2018"/>
        ${(() => { let s = ''; const r = rng(93); for (let i = 0; i < 40; i++) { s += `<ellipse cx="${f(r() * 1080)}" cy="${f(1420 + r() * 480)}" rx="${f(20 + r() * 50)}" ry="${f(4 + r() * 8)}" fill="#1a140e"/>`; } return s; })()}
        ${A.lamp(780, 1400, 600, o.lamp > .5)}`;
    },
  };

  Object.assign(A, { engineerNoGlasses, lena, tyoma, cap, missile, landed, stranger });
  Object.assign(A.bg, bg3);
})();
