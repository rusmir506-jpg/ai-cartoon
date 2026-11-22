// Серия 4 — новые рисунки. Дополняет ART (art.js серии 1, art2.js серии 2, art3.js серии 3).
(function () {
  const A = window.ART, P = A.P;
  const f = n => Math.round(n * 10) / 10;
  const FONT = 'font-family="Inter, DejaVu Sans, sans-serif"';
  const rad = d => d * Math.PI / 180;
  function limb(sx, sy, a1, a2, L1, L2, w, c, hc) {
    const ex = sx + L1 * Math.sin(rad(a1)), ey = sy + L1 * Math.cos(rad(a1));
    const hx = ex + L2 * Math.sin(rad(a2)), hy = ey + L2 * Math.cos(rad(a2));
    return { hx, hy, svg: `<path d="M${f(sx)} ${f(sy)}L${f(ex)} ${f(ey)}L${f(hx)} ${f(hy)}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f(hx)}" cy="${f(hy)}" r="${w * .6}" fill="${hc}"/>` };
  }
  // КОСТЯ, отец Тёмы, в скафандре «Орбиты» (рост ~640)
  function kostya(o) {
    o = Object.assign({ visor: 'down', aL: 8, aL2: 4, aR: -8, aR2: -4, walk: 0, beacon: true, look: 0, blink: false, mouth: 'flat', lamps: 1 }, o);
    const sw = Math.sin(o.walk) * 26, suit = '#d8dbe2', suit2 = '#b8bcc8', glove = '#8c93a6';
    const L = limb(-70, -470, o.aL, o.aL2, 110, 100, 42, suit2, glove), R = limb(70, -470, o.aR, o.aR2, 110, 100, 42, suit, glove);
    const face = `<circle cx="0" cy="-575" r="52" fill="#c9926f"/><path d="M-50 -590q4 -50 52 -50q48 0 48 48q-30 -26 -100 2z" fill="#2a1e18"/>
      ${o.blink ? `<path d="M-24 -578h14M10 -578h14" stroke="#1a1414" stroke-width="4" stroke-linecap="round"/>` : `<circle cx="${-17 + o.look}" cy="-578" r="5.5" fill="#1a1414"/><circle cx="${17 + o.look}" cy="-578" r="5.5" fill="#1a1414"/>`}
      <path d="M-28 -592h18M10 -592h18" stroke="#2a1e18" stroke-width="5" stroke-linecap="round"/>
      <path d="M-34 -556q34 30 68 0v14q-34 30 -68 0z" fill="#5a4034" opacity=".55"/>
      ${o.mouth === 'open' ? `<ellipse cx="0" cy="-546" rx="10" ry="7" fill="#3a1a1a"/>` : `<path d="M-12 -548h24" stroke="#5a2a25" stroke-width="4" stroke-linecap="round"/>`}`;
    return `<g><ellipse cx="0" cy="6" rx="110" ry="12" fill="#000" opacity=".4"/>
      <path d="M-34 -250L${-36 + sw} -24" stroke="${suit2}" stroke-width="56" stroke-linecap="round"/><path d="M34 -250L${36 - sw} -24" stroke="${suit}" stroke-width="56" stroke-linecap="round"/>
      <rect x="${-70 + sw}" y="-40" width="68" height="44" rx="14" fill="#3a3f52"/><rect x="${2 - sw}" y="-40" width="68" height="44" rx="14" fill="#3a3f52"/>
      ${L.svg}
      <rect x="-86" y="-500" width="172" height="270" rx="44" fill="${suit}"/>
      <path d="M-86 -330h172" stroke="${P.ember}" stroke-width="10"/><rect x="-40" y="-450" width="80" height="60" rx="10" fill="#3a3f52"/>
      <circle cx="0" cy="-420" r="14" fill="${o.beacon ? P.red : '#4a1a20'}"/>${o.beacon ? `<circle cx="0" cy="-420" r="56" fill="url(#gRed)"/>` : ''}
      <g transform="translate(-74 -470) rotate(-12)"><rect x="-26" y="-18" width="52" height="40" rx="6" fill="${P.ember}"/><text x="0" y="8" text-anchor="middle" ${FONT} font-weight="900" font-size="11" fill="#fff">ОРБИТА</text></g>
      <rect x="-34" y="-510" width="68" height="26" rx="6" fill="${suit2}"/>
      <circle cx="0" cy="-580" r="88" fill="${suit}"/>
      ${o.visor === 'up' ? `<circle cx="0" cy="-578" r="70" fill="#1a2030"/>${face}<path d="M-74 -600a74 74 0 0 1 148 0v-30a74 74 0 0 0 -148 0z" fill="#2a3a5a" opacity=".9"/>`
        : `<circle cx="0" cy="-578" r="70" fill="#0c1426"/><path d="M-50 -620q30 -24 70 -10" stroke="#fff" stroke-width="8" fill="none" opacity=".25" stroke-linecap="round"/>
           ${o.lamps ? `<circle cx="-20" cy="-584" r="7" fill="${P.tv}"/><circle cx="20" cy="-584" r="7" fill="${P.tv}"/><circle cx="0" cy="-584" r="60" fill="url(#gTv)" opacity=".6"/>` : ''}`}
      ${R.svg}</g>`;
  }
  // машина в канаве (нос вниз)
  function carInDitch(t) {
    return `<g><path d="M-420 40Q0 140 420 40V120H-420z" fill="#05060c"/>
      <g transform="rotate(16)">${A.car({ kind: 'sedan', lights: true, blink: Math.floor((t || 0) / .42) % 2 === 0 })}</g>
      <path d="M-200 60q40 -50 80 0M100 70q30 -40 60 0" stroke="#3a2e22" stroke-width="14" fill="none"/></g>`;
  }
  Object.assign(A, { kostya, carInDitch });
})();
