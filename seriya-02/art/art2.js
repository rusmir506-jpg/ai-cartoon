// Серия 2 — новые рисунки. Дополняет ART из ../seriya-01/art/art.js (стиль и палитра те же).
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

  // ---------- ПОЛИЦЕЙСКИЙ ---------- (рост ~470, фуражка, светоотражающий жилет, фонарь)
  function police(o) {
    o = Object.assign({ aL: 6, aL2: 4, aR: -6, aR2: -4, blink: false, look: 0, mouth: 'flat', walk: 0, torch: false, salute: false, beam: true }, o);
    const sw = Math.sin(o.walk) * 22, skin = '#b98a6e';
    const aR = o.salute ? { a: 140, b: 200 } : { a: o.aR, b: o.aR2 };
    const L = limb(-56, -350, o.aL, o.aL2, 82, 76, 26, '#1f2b3e', skin);
    const R = limb(56, -350, aR.a, aR.b, 82, 76, 26, '#243246', skin);
    let held = '';
    if (o.torch) held = `<g transform="translate(${f(R.hx)} ${f(R.hy)}) rotate(${f(-aR.b + 90)})">
      ${o.beam ? `<path d="M30 -8L700 -170V170L30 8z" fill="${P.pale}" opacity=".22"/><path d="M30 -5L520 -70V70L30 5z" fill="#fff" opacity=".2"/>` : ''}
      <rect x="-14" y="-10" width="48" height="20" rx="5" fill="#0a0c14"/><rect x="28" y="-13" width="10" height="26" rx="3" fill="${P.pale}"/></g>`;
    const mouth = o.mouth === 'open' ? `<ellipse cx="0" cy="-376" rx="11" ry="8" fill="#3a1a1a"/>` : `<path d="M-12 -378h24" stroke="#5a2a25" stroke-width="4" stroke-linecap="round"/>`;
    return `<g>
      <ellipse cx="0" cy="4" rx="80" ry="10" fill="#000" opacity=".35"/>
      <path d="M-26 -170L${-28 + sw} -8" stroke="#141c2c" stroke-width="32" stroke-linecap="round"/><path d="M26 -170L${28 - sw} -8" stroke="#18213a" stroke-width="32" stroke-linecap="round"/>
      <ellipse cx="${-22 + sw}" cy="-4" rx="30" ry="12" fill="#05070f"/><ellipse cx="${34 - sw}" cy="-4" rx="30" ry="12" fill="#05070f"/>
      ${L.svg}
      <rect x="-62" y="-362" width="124" height="206" rx="30" fill="#243246"/>
      <path d="M-62 -330h124v120h-124z" fill="#c8e04a"/><path d="M-62 -300h124M-62 -236h124" stroke="#e8eef2" stroke-width="12"/>
      <rect x="-26" y="-326" width="52" height="22" rx="4" fill="#0d1424"/><text x="0" y="-310" text-anchor="middle" ${FONT} font-weight="900" font-size="15" fill="#c8e04a">ПОЛИЦИЯ</text>
      <rect x="-62" y="-176" width="124" height="16" fill="#0a0c14"/><rect x="-10" y="-178" width="20" height="20" fill="${P.amber}"/>
      <rect x="-15" y="-386" width="30" height="30" fill="${skin}"/>
      <circle cx="0" cy="-410" r="46" fill="${skin}"/>
      <path d="M-50 -440q50 -40 100 0v10h-100z" fill="#1a2438"/><path d="M-62 -430h124l-8 16h-108z" fill="#0d1424"/><rect x="-12" y="-452" width="24" height="16" rx="3" fill="${P.amber}"/>
      ${o.blink ? `<path d="M-24 -408h14M10 -408h14" stroke="#1a1414" stroke-width="3.5" stroke-linecap="round"/>` : `<circle cx="${-17 + o.look}" cy="-408" r="5" fill="#1a1414"/><circle cx="${17 + o.look}" cy="-408" r="5" fill="#1a1414"/>`}
      <path d="M-28 -420h18M10 -420h18" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>
      <path d="M-22 -394q22 10 44 0" stroke="#3a2a22" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${mouth}
      ${R.svg}${held}
    </g>`;
  }

  // ---------- ЧАСЫ ЗИНЫ (крупно, на запястье) ----------
  function watch(text, glow) {
    return `<g>
      <path d="M-420 120L420 -60" stroke="#2c5364" stroke-width="250" stroke-linecap="round"/>
      <path d="M-150 170L140 110" stroke="#d6a58a" stroke-width="150" stroke-linecap="round"/>
      <rect x="-70" y="-60" width="140" height="300" rx="20" fill="#3a2a22" transform="rotate(-12)"/>
      <circle r="150" fill="#c9a24a"/><circle r="128" fill="#f3e6c8"/>
      ${glow ? `<circle r="128" fill="url(#gGlow)" opacity="${glow}"/>` : ''}
      ${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return `<path d="M${f(Math.sin(a) * 108)} ${f(-Math.cos(a) * 108)}L${f(Math.sin(a) * (i % 3 ? 116 : 96))} ${f(-Math.cos(a) * (i % 3 ? 116 : 96))}" stroke="#1d2338" stroke-width="${i % 3 ? 4 : 8}" stroke-linecap="round"/>`; }).join('')}
      <path d="M0 0L0 -78" stroke="#1d2338" stroke-width="10" stroke-linecap="round" transform="rotate(320)"/><path d="M0 0L0 -100" stroke="#1d2338" stroke-width="6" stroke-linecap="round" transform="rotate(${text === '3:00' ? 300 : 222})"/>
      <circle r="12" fill="${P.red}"/>
      <rect x="-150" y="190" width="300" height="100" rx="20" fill="#05070f" stroke="${P.red}" stroke-width="5"/>
      <text x="0" y="262" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-weight="700" font-size="76" fill="${P.red}">${text}</text>
    </g>`;
  }

  // ---------- «СВЕТ»: объект, который ведут (сопла горят) ----------
  function beacon(o) {
    o = Object.assign({ rot: 0, on: true, jets: 1, size: 1 }, o);
    const jet = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -14L${f(160 * o.jets)} 0L0 14z" fill="${P.tv}" opacity=".85"/><path d="M0 -7L${f(90 * o.jets)} 0L0 7z" fill="#fff"/></g>`;
    return `<g>
      <circle r="${f(330 * o.size)}" fill="url(#gWhite)" opacity="${o.on ? .9 : .5}"/>
      <g transform="rotate(${f(o.rot)}) scale(.8)">
        ${jet(-40, 50, 110)}${jet(40, 50, 70)}
        <rect x="-205" y="-30" width="140" height="60" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4"/>
        <path d="M-65 0h20M46 0h22" stroke="#8c93a6" stroke-width="8"/>
        <rect x="-46" y="-46" width="92" height="92" rx="8" fill="#c9a24a"/><path d="M-46 -10h92M-10 -46v92" stroke="#8a6a22" stroke-width="4"/>
        <rect x="68" y="-30" width="140" height="60" fill="url(#pPanel)" stroke="#0a1220" stroke-width="4"/>
        <circle cx="0" cy="-62" r="20" fill="none" stroke="#d8dbe2" stroke-width="6"/><path d="M0 -46v-16" stroke="#d8dbe2" stroke-width="6"/>
        ${o.on ? `<circle cx="30" cy="30" r="44" fill="url(#gWhite)"/><circle cx="30" cy="30" r="10" fill="#fff"/>` : `<circle cx="30" cy="30" r="10" fill="#5a2a25"/>`}
      </g>
    </g>`;
  }

  // ---------- люди в толпе (силуэты) ----------
  function person(seed, sc) {
    const r = rng(seed), h = 150 + r() * 60, c = ['#1a2036', '#231b2e', '#14202a', '#2a2234'][Math.floor(r() * 4)];
    const kid = r() < .15 ? .6 : 1;
    return `<g transform="scale(${f((sc || 1) * kid * 100) / 100})"><rect x="-18" y="${f(-h)}" width="36" height="${f(h - 40)}" rx="16" fill="${c}"/><rect x="-14" y="-46" width="11" height="46" fill="${c}"/><rect x="3" y="-46" width="11" height="46" fill="${c}"/><circle cx="0" cy="${f(-h - 22)}" r="22" fill="${c}"/></g>`;
  }
  function crowd(seed, y0, y1, n, shift) {
    const r = rng(seed); let s = '';
    const items = [];
    for (let i = 0; i < n; i++) { const t = r(); items.push([t, r(), r()]); }
    items.sort((a, b) => a[0] - b[0]);
    items.forEach(([t, xr, k], i) => {
      const y = y0 + t * (y1 - y0), sc = .35 + t * .9;
      let x = xr * 1180 - 50 + (shift || 0) * (xr < .5 ? -1 : 1) * (200 + t * 300);
      s += `<g transform="translate(${f(x)} ${f(y)})">${k < .25 ? `<circle cx="10" cy="${f(-120 * sc)}" r="${f(14 * sc)}" fill="${P.amber}" opacity=".85"/><circle cx="10" cy="${f(-120 * sc)}" r="${f(40 * sc)}" fill="url(#gGlow)"/>` : ''}${person(seed * 31 + i, sc)}</g>`;
    });
    return s;
  }
  function tent(w, h, lit, color) {
    return `<g><path d="M${-w / 2} 0L${-w / 2 + 30} ${-h * .62}L0 ${-h}L${w / 2 - 30} ${-h * .62}L${w / 2} 0z" fill="${color || '#3a4a3a'}"/>
      <path d="M0 ${-h}V0" stroke="#000" stroke-opacity=".25" stroke-width="4"/>
      ${lit ? `<path d="M-60 0L0 ${-h * .6}L60 0z" fill="${P.amber}" opacity=".85"/><circle cx="0" cy="${-h * .3}" r="${h * .8}" fill="url(#gGlow)" opacity=".5"/>` : ''}</g>`;
  }
  // вышка с рупорами
  function paTower(h, talk) {
    const horn = (x, y, d) => `<g transform="translate(${x} ${y}) scale(${d} 1)"><path d="M0 -14L70 -46V46L0 14z" fill="#d8dbe2"/><rect x="-16" y="-16" width="20" height="32" fill="#8c93a6"/>${talk ? `<path d="M90 -40q30 40 0 80M112 -60q46 60 0 120" stroke="${P.pale}" stroke-width="5" fill="none" opacity="${talk}"/>` : ''}</g>`;
    return `<g><path d="M-50 0L-12 ${-h}M50 0L12 ${-h}M-40 ${-h * .25}L40 ${-h * .5}M40 ${-h * .25}L-40 ${-h * .5}M-30 ${-h * .6}L30 ${-h * .82}M30 ${-h * .6}L-30 ${-h * .82}" stroke="#0a0c14" stroke-width="10"/>
      ${horn(14, -h + 10, 1)}${horn(-14, -h + 10, -1)}${horn(14, -h + 70, 1)}<circle cx="0" cy="${-h - 14}" r="8" fill="${P.red}"/></g>`;
  }
  // полицейская машина: мигалка
  function policeCar(o) {
    o = Object.assign({ phase: 0 }, o);
    const blue = o.phase % 2 === 0;
    return `<g>
      <circle cx="-30" cy="-200" r="260" fill="${blue ? 'url(#gTv)' : 'url(#gRed)'}" opacity=".8"/>
      ${A.car({ kind: 'sedan', lights: true })}
      <rect x="-200" y="-74" width="420" height="20" fill="#e8eef2"/><text x="10" y="-30" text-anchor="middle" ${FONT} font-weight="900" font-size="30" fill="#e8eef2">ПОЛИЦИЯ</text>
      <rect x="-80" y="-182" width="56" height="22" rx="6" fill="${blue ? '#4aa8ff' : '#2a3a5a'}"/><rect x="-24" y="-182" width="56" height="22" rx="6" fill="${blue ? '#5a1a22' : P.red}"/>
    </g>`;
  }
  function barrier(open) {
    return `<g><rect x="-30" y="-120" width="60" height="120" fill="#2a2f40"/><circle cx="0" cy="-100" r="16" fill="#8c93a6"/>
      <g transform="translate(0 -100) rotate(${f(-80 * (open || 0))})"><rect x="0" y="-12" width="560" height="24" fill="#e8eef2"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${30 + i * 110}" y="-12" width="55" height="24" fill="${P.red}"/>`).join('')}<circle cx="545" cy="0" r="10" fill="${P.red}"/></g></g>`;
  }

  // ---------- ФОНЫ ----------
  const bg2 = {
    // грунтовка у элеватора
    elevator(o) {
      o = Object.assign({ dotR: 14, dotX: 300, dotY: 380, dust: 0 }, o);
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(12, 70, 900)}
        <circle cx="${o.dotX}" cy="${o.dotY}" r="${o.dotR * 14}" fill="url(#gWhite)" opacity=".8"/><circle cx="${o.dotX}" cy="${o.dotY}" r="${o.dotR}" fill="#fff"/>
        <g fill="#080a12"><rect x="560" y="560" width="110" height="760"/><rect x="680" y="620" width="110" height="700"/><rect x="800" y="600" width="110" height="720"/>
          <rect x="520" y="430" width="140" height="160"/><path d="M520 430l70 -60l70 60z"/><rect x="900" y="900" width="200" height="420"/><path d="M660 470L960 900" stroke="#080a12" stroke-width="16"/></g>
        <rect x="574" y="600" width="18" height="24" fill="${P.amber}" opacity=".7"/>
        <text x="740" y="1000" text-anchor="middle" ${FONT} font-weight="900" font-size="38" fill="${P.pale}" opacity=".18" transform="rotate(-90 740 1000)">ЭЛЕВАТОР</text>
        <rect y="1300" width="1080" height="620" fill="#14100c"/>
        <path d="M430 1300L-300 1920H1380L650 1300z" fill="#3a2e22"/><path d="M540 1300L380 1920M540 1300L700 1920" stroke="#251d16" stroke-width="18" stroke-dasharray="40 50"/>
        ${(() => { let s = ''; const r = rng(91); for (let i = 0; i < 60; i++) { const x = r() * 1080, y = 1300 + r() * 600; s += `<path d="M${f(x)} ${f(y)}v-${f(20 + r() * 50)}" stroke="#0a0806" stroke-width="5" stroke-linecap="round"/>`; } return s; })()}
        ${o.dust ? `<ellipse cx="540" cy="1620" rx="${f(300 + 200 * o.dust)}" ry="140" fill="#8a6a4a" opacity="${f(.25 * o.dust)}"/>` : ''}`;
    },
    // кордон на грунтовке
    cordon(o) {
      o = Object.assign({ phase: 0, open: 0 }, o);
      return this.elevator({ dotR: 16, dotX: 220, dotY: 330 })
        + `<g transform="translate(830 1520) scale(.95)">${policeCar({ phase: o.phase })}</g>`
        + `<g transform="translate(260 1560)">${barrier(o.open)}</g>`
        + `<rect width="1080" height="1920" fill="${o.phase % 2 ? P.red : '#4aa8ff'}" opacity=".07"/>`;
    },
    // поле с людьми, палатками, вышкой
    field(o) {
      o = Object.assign({ dotR: 18, dotX: 760, dotY: 300, talk: 0, shift: 0, lights: 1 }, o);
      let cars = ''; const r = rng(55);
      for (let i = 0; i < 26; i++) { const t = r(), y = 1180 + t * 300, x = r() * 1080, sc = .15 + t * .35; cars += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sc)})"><rect x="-120" y="-80" width="240" height="80" rx="20" fill="#0c0f1a"/><circle cx="-90" cy="-40" r="${f(26 + o.lights * 20)}" fill="url(#gGlow)" opacity="${f(o.lights)}"/><circle cx="90" cy="-40" r="${f(26 + o.lights * 20)}" fill="url(#gGlow)" opacity="${f(o.lights)}"/></g>`; }
      return `<rect width="1080" height="1920" fill="url(#gSky)"/>${A.stars(13, 80, 1000)}
        <circle cx="${o.dotX}" cy="${o.dotY}" r="${o.dotR * 14}" fill="url(#gWhite)" opacity=".85"/><circle cx="${o.dotX}" cy="${o.dotY}" r="${o.dotR}" fill="#fff"/>
        <rect y="1100" width="1080" height="820" fill="#0b0c14"/><rect y="1092" width="1080" height="14" fill="${P.rust}" opacity=".5"/>
        ${A.headlightRiver(5, [[0, 1110, 40, 3], [1080, 1110, 40, 3]], 120, 0)}
        ${cars}
        <g transform="translate(200 1300)">${tent(260, 160, true, '#334433')}</g><g transform="translate(560 1260)">${tent(200, 130, false, '#3a3a2a')}</g>
        <g transform="translate(880 1330)">${tent(300, 200, true, '#2c3c30')}</g>
        ${o.tower === false ? "" : `<g transform="translate(980 1340)">${paTower(560, o.talk)}</g>`}
        ${crowd(17, 1350, 1880, 70, o.shift)}`;
    },
    // штаб внутри палатки
    hq(o) {
      o = Object.assign({ screen: 1, dotP: .5, lamp: 1 }, o);
      const sx = 600 + 200 * o.dotP, sy = 760 - 120 * Math.sin(o.dotP * Math.PI);
      return `<rect width="1080" height="1920" fill="#1a1d14"/>
        <path d="M0 0L540 -40L1080 0V1920H0z" fill="#26291c"/><path d="M540 -40V1300M180 0L120 1300M900 0L960 1300" stroke="#12140e" stroke-width="10"/>
        <circle cx="540" cy="300" r="${f(500 * o.lamp)}" fill="url(#gGlow)" opacity=".45"/><path d="M540 0v240" stroke="#0a0c08" stroke-width="6"/><path d="M500 240h80l20 30h-120z" fill="#3a3a2a"/><circle cx="540" cy="282" r="14" fill="${P.amber}"/>
        <g transform="translate(700 640)"><rect x="-260" y="-200" width="520" height="340" rx="14" fill="#05060c" stroke="#232b44" stroke-width="10"/>
          <rect x="-240" y="-180" width="480" height="300" fill="#0c1a2a" opacity="${o.screen}"/>
          ${o.screen ? `<path d="M-240 60h480M-240 -40h480M-120 -180v300M40 -180v300" stroke="${P.tv}" stroke-width="2" opacity=".3"/>
          <path d="M-220 100Q-60 -150 160 40" stroke="${P.tv}" stroke-width="5" fill="none" stroke-dasharray="14 10"/>
          <circle cx="160" cy="40" r="26" fill="none" stroke="${P.red}" stroke-width="5"/><text x="160" y="96" text-anchor="middle" ${FONT} font-weight="800" font-size="22" fill="${P.red}">ПОЛЕ</text>
          <circle cx="${f(sx - 700)}" cy="${f(sy - 640)}" r="12" fill="#fff"/><circle cx="${f(sx - 700)}" cy="${f(sy - 640)}" r="34" fill="url(#gWhite)"/>
          <text x="-220" y="-140" ${FONT} font-weight="800" font-size="24" fill="${P.tv}">ОРБИТА · ВЕДЕНИЕ</text>` : ''}
          <rect x="-20" y="140" width="40" height="80" fill="#141a2c"/></g>
        <rect x="0" y="1180" width="1080" height="80" fill="#3a2e22"/><rect x="0" y="1260" width="1080" height="660" fill="#14100c"/>
        <g transform="translate(330 1180)"><rect x="-120" y="-90" width="240" height="90" rx="8" fill="#2a2f40"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-90 + i * 36}" cy="-56" r="10" fill="${i % 2 ? P.amber : '#5a6a4a'}"/>`).join('')}<rect x="-90" y="-30" width="180" height="16" fill="#0a0c14"/></g>
        <g transform="translate(540 1180)"><path d="M0 0v-150" stroke="#0a0c14" stroke-width="10"/><rect x="-22" y="-210" width="44" height="74" rx="22" fill="#2a2f40"/><path d="M-22 -180h44M-22 -164h44" stroke="#0a0c14" stroke-width="4"/><rect x="-60" y="-10" width="120" height="14" rx="6" fill="#0a0c14"/></g>`;
    },
  };

  Object.assign(A, { police, watch, beacon, person, crowd, tent, paTower, policeCar, barrier });
  Object.assign(A.bg, bg2);
})();
