// «ВСЕ ЛЮДИ ИСЧЕЗЛИ» — графика в стиле «Кино-2D».
// Все функции возвращают куски SVG-разметки. Персонажи рисуются в локальной
// системе 600×800 (по пояс), фоны — в кадре 1080×1920.
(function (root) {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // ---------- палитра ----------
  const C = {
    night: '#151b24', deep: '#1d2531', steel: '#2b3542', slate: '#3b4757', fog: '#5d6b7c',
    mist: '#8996a6', lamp: '#f2b56b', lampSoft: '#d89a5a', amber: '#e0a040',
    green: '#7ee0a0', yellow: '#f0d060', red: '#ff6b5a',
  };

  // ---------- общие эффекты ----------
  function defsCommon() {
    return `
    <filter id="soft4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="soft10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="soft30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.10 0"/>
    </filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1.4" fill="#000" opacity="0.32"/>
    </pattern>
    <radialGradient id="vign" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
    </radialGradient>`;
  }
  // полосы старого экрана + виньетка + зерно поверх кадра
  function screenFx(w, h, t = 0) {
    const roll = ((t * 90) % h);
    return `
    <rect width="${w}" height="${h}" fill="url(#scan)"/>
    <rect y="${roll - 60}" width="${w}" height="120" fill="#fff" opacity="0.025"/>
    <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.6"/>
    <rect width="${w}" height="${h}" fill="url(#vign)"/>`;
  }

  // ---------- глаз ----------
  // cx,cy — центр; w,h — размер; open 0..1; look {x,y} −1..1; mirror — левый глаз (для зрителя)
  // lit — освещённость 0..1 (сторона лица)
  function eye(o) {
    const { cx, cy, w, h, open = 1, look = { x: 0, y: 0 }, mirror = false, lit = 1, iris = '#4a3426', skinDark = '#7a5a50' } = o;
    const k = id('eye');
    const hh = h * Math.max(open, 0.02);
    const sx = mirror ? -1 : 1;
    const X = (dx) => cx + dx * sx;
    const top = `M${X(-w / 2)},${cy} Q${X(-w / 5)},${cy - hh * 1.15} ${X(w / 5)},${cy - hh * 0.98} Q${X(w / 2.4)},${cy - hh * 0.62} ${X(w / 2)},${cy + hh * 0.08}`;
    const bottom = `Q${X(w / 5)},${cy + hh * 0.72} ${X(-w / 6)},${cy + hh * 0.6} Q${X(-w / 2.3)},${cy + hh * 0.42} ${X(-w / 2)},${cy}`;
    const shape = `${top} ${bottom} Z`;
    const white = lit > 0.5 ? '#ddd3cb' : '#8c858a';
    const ir = h * 0.62;
    const ix = cx + look.x * w * 0.22 * 1, iy = cy + h * 0.08 + look.y * h * 0.25;
    const lidW = 2.2 + w * 0.035;
    // складка века и тень глазницы
    const crease = `M${X(-w / 2.3)},${cy - h * 0.55} Q${X(0)},${cy - h * 1.55} ${X(w / 2.1)},${cy - h * 0.6}`;
    let s = `<path d="M${X(-w / 1.7)},${cy - h * 0.2} Q${X(0)},${cy - h * 1.9} ${X(w / 1.6)},${cy - h * 0.2} Q${X(0)},${cy + h * 0.5} ${X(-w / 1.7)},${cy - h * 0.2}Z" fill="${skinDark}" opacity="${lit > 0.5 ? 0.28 : 0.35}" filter="url(#soft4)"/>`;
    s += `<path d="${crease}" fill="none" stroke="${skinDark}" stroke-width="${lidW * 0.7}" stroke-linecap="round" opacity="0.55"/>`;
    if (open < 0.12) {
      // закрытый глаз: линия века и ресницы
      s += `<path d="M${X(-w / 2)},${cy} Q${X(0)},${cy + h * 0.35} ${X(w / 2)},${cy}" fill="none" stroke="#2a1d1c" stroke-width="${lidW}" stroke-linecap="round"/>`;
      return s;
    }
    s += `<clipPath id="${k}"><path d="${shape}"/></clipPath>`;
    s += `<g clip-path="url(#${k})">
      <rect x="${cx - w}" y="${cy - h * 2}" width="${w * 2}" height="${h * 4}" fill="${white}"/>
      <circle cx="${ix}" cy="${iy}" r="${ir}" fill="${iris}"/>
      <circle cx="${ix}" cy="${iy}" r="${ir * 0.62}" fill="${shade(iris, -0.35)}" opacity="0.6"/>
      <circle cx="${ix}" cy="${iy}" r="${ir * 0.42}" fill="#120c0b"/>
      <circle cx="${ix - ir * 0.35 * sx}" cy="${iy - ir * 0.38}" r="${ir * 0.18}" fill="#fff" opacity="${lit > 0.5 ? 0.9 : 0.5}"/>
      <path d="${top}" fill="none" stroke="#000" stroke-width="${h * 0.7}" opacity="0.25" transform="translate(0,${h * 0.25})"/>
    </g>`;
    s += `<path d="${top}" fill="none" stroke="#2a1d1c" stroke-width="${lidW}" stroke-linecap="round"/>`;
    s += `<path d="M${X(w / 2)},${cy + hh * 0.08} ${bottom.replace(/^Q/, 'Q')}" fill="none" stroke="${skinDark}" stroke-width="${lidW * 0.45}" opacity="0.6"/>`;
    return s;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
    return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // градиент «свет слева / тень справа» (lightSide: -1 слева, 1 справа)
  function splitGrad(gid, light, mid, dark, deep, lightSide = -1, x1 = 0.44, x2 = 0.56) {
    const a = lightSide < 0 ? [light, mid, dark, deep] : [deep, dark, mid, light];
    return `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a[0]}"/><stop offset="${x1}" stop-color="${a[1]}"/>
      <stop offset="${x2}" stop-color="${a[2]}"/><stop offset="1" stop-color="${a[3]}"/></linearGradient>`;
  }

  // ---------- рот ----------
  function mouth(cx, cy, w, open = 0, lipColor = '#a86f6a', dark = '#6b4446') {
    const oh = open * 16;
    let s = '';
    if (open > 0.05) s += `<ellipse cx="${cx}" cy="${cy + oh * 0.4}" rx="${w * 0.36}" ry="${oh * 0.55 + 1}" fill="#2a1414"/>`;
    // верхняя губа
    s += `<path d="M${cx - w / 2},${cy} Q${cx - w / 4},${cy - 9} ${cx - 4},${cy - 6} Q${cx},${cy - 4} ${cx + 4},${cy - 6} Q${cx + w / 4},${cy - 9} ${cx + w / 2},${cy} Q${cx},${cy + 2} ${cx - w / 2},${cy}Z" fill="${shade(lipColor, -0.15)}"/>`;
    // нижняя губа
    s += `<path d="M${cx - w / 2.3},${cy + 1 + oh} Q${cx},${cy + 17 + oh} ${cx + w / 2.3},${cy + 1 + oh} Q${cx},${cy + 5 + oh} ${cx - w / 2.3},${cy + 1 + oh}Z" fill="${lipColor}"/>`;
    s += `<path d="M${cx - w / 2},${cy} Q${cx},${cy + 3 + oh * 0.3} ${cx + w / 2},${cy}" fill="none" stroke="${dark}" stroke-width="2.4" stroke-linecap="round"/>`;
    // тень под нижней губой
    s += `<ellipse cx="${cx + 3}" cy="${cy + 24 + oh}" rx="${w * 0.3}" ry="5" fill="${dark}" opacity="0.35" filter="url(#soft4)"/>`;
    return s;
  }

  // ---------- СВЕТА ----------
  // opts: eyes (0..1), look {x,y}, brows (−1 хмурится … 1 подняты), mouth (0..1), radio (bool), lamp (−1 слева, 1 справа)
  function sveta(o = {}) {
    const { eyes = 1, look = { x: 0, y: 0 }, brows = 0, mouthOpen = 0, radio = false, radioLit = false, lamp = -1 } = o;
    const g = id('sv');
    const skin = splitGrad(`${g}skin`, '#e9c3a6', '#d6aa8f', '#86686a', '#5b4954', lamp);
    const neck = splitGrad(`${g}neck`, '#b98f7b', '#a37d6f', '#5e4b52', '#463a44', lamp);
    const hood = splitGrad(`${g}hood`, '#6a7889', '#556273', '#38424f', '#2a323d', lamp, 0.35, 0.6);
    const hair = splitGrad(`${g}hair`, '#6e4a3a', '#4a3029', '#2d1f1d', '#1f1716', lamp, 0.35, 0.6);
    const L = lamp < 0; // свет слева
    let s = `<defs>${skin}${neck}${hood}${hair}
      <clipPath id="${g}face"><path d="M300,150 C366,150 398,200 398,266 C398,322 386,360 362,393 C342,421 322,438 300,441 C278,438 258,421 238,393 C214,360 202,322 202,266 C202,200 234,150 300,150Z"/></clipPath>
    </defs>`;
    // волосы сзади
    s += `<path d="M300,128 C200,128 168,210 172,300 C176,380 168,450 150,520 C200,540 250,520 268,480 L332,480 C350,520 400,540 450,520 C432,450 424,380 428,300 C432,210 400,128 300,128Z" fill="url(#${g}hair)"/>`;
    // туловище — худи
    s += `<path d="M40,800 L52,640 C60,560 130,522 222,500 L300,530 L378,500 C470,522 540,560 548,640 L560,800Z" fill="url(#${g}hood)"/>`;
    // складки худи
    s += `<path d="M150,640 Q180,700 170,800 M450,640 Q420,700 430,800 M300,600 L300,800" stroke="#000" stroke-width="10" opacity="0.12" fill="none" filter="url(#soft4)"/>`;
    // карман-«кенгуру»
    s += `<path d="M175,730 Q300,705 425,730 L440,800 L160,800Z" fill="#000" opacity="0.13"/>`;
    // шея
    s += `<path d="M262,400 L262,500 Q300,525 338,500 L338,400Z" fill="url(#${g}neck)"/>`;
    s += `<path d="M262,440 Q300,470 338,440 L338,470 Q300,495 262,470Z" fill="#2c2228" opacity="0.45" filter="url(#soft4)"/>`;
    // капюшон вокруг шеи
    s += `<path d="M200,505 C230,470 260,486 300,520 C340,486 370,470 400,505 C392,545 350,568 300,560 C250,568 208,545 200,505Z" fill="${shade(L ? '#5b6878' : '#3b4552', 0)}"/>`;
    s += `<path d="M226,510 C258,500 280,512 300,536 C320,512 342,500 374,510" stroke="#1d242d" stroke-width="7" fill="none" opacity="0.55"/>`;
    // завязки
    s += `<path d="M282,548 C278,590 284,620 280,660" stroke="#c9ced6" stroke-width="5" fill="none" stroke-linecap="round" opacity="${L ? 0.9 : 0.6}"/>
          <path d="M318,548 C322,592 316,625 322,668" stroke="#9aa2ad" stroke-width="5" fill="none" stroke-linecap="round" opacity="${L ? 0.6 : 0.9}"/>
          <rect x="276" y="656" width="8" height="18" rx="3" fill="#7f8894"/><rect x="318" y="664" width="8" height="18" rx="3" fill="#6b737e"/>`;
    // уши
    s += `<ellipse cx="203" cy="298" rx="14" ry="26" fill="${L ? '#d8a990' : '#6c5459'}"/>
          <ellipse cx="397" cy="298" rx="14" ry="26" fill="${L ? '#6c5459' : '#d8a990'}"/>`;
    // лицо
    s += `<path d="M300,150 C366,150 398,200 398,266 C398,322 386,360 362,393 C342,421 322,438 300,441 C278,438 258,421 238,393 C214,360 202,322 202,266 C202,200 234,150 300,150Z" fill="url(#${g}skin)"/>`;
    s += `<g clip-path="url(#${g}face)">`;
    // скулы и щёки тенью (на светлой стороне — мягко)
    const cheekL = `M220,330 Q245,365 270,372 Q245,385 225,370Z`, cheekR = `M380,330 Q355,365 330,372 Q355,385 375,370Z`;
    s += `<path d="${L ? cheekL : cheekR}" fill="#8a5f58" opacity="0.35" filter="url(#soft10)"/>`;
    s += `<path d="${L ? cheekR : cheekL}" fill="#2c2230" opacity="0.45" filter="url(#soft10)"/>`;
    // румянец
    s += `<ellipse cx="${L ? 245 : 355}" cy="345" rx="28" ry="16" fill="#d07d72" opacity="0.18" filter="url(#soft10)"/>`;
    // тень от волос на лбу
    s += `<path d="M190,170 Q300,240 410,200 L410,140 L190,140Z" fill="#2a1f22" opacity="0.4" filter="url(#soft10)"/>`;
    // подбородок/челюсть
    s += `<path d="M240,400 Q300,455 360,400 Q330,445 300,445 Q270,445 240,400Z" fill="#3a2b33" opacity="0.35" filter="url(#soft4)"/>`;
    s += `</g>`;
    // брови
    const by = 248 - brows * 10;
    const browIn = brows < 0 ? 6 : brows > 0 ? -6 : 0;
    s += `<path d="M222,${by + 6} Q245,${by - 8} 282,${by + 2 + browIn}" stroke="${L ? '#4a3028' : '#2a1d1c'}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M378,${by + 6} Q355,${by - 8} 318,${by + 2 + browIn}" stroke="${L ? '#2a1d1c' : '#4a3028'}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    // глаза
    s += eye({ cx: 254, cy: 286, w: 50, h: 15, open: eyes, look, mirror: true, lit: L ? 1 : 0.2 });
    s += eye({ cx: 346, cy: 286, w: 50, h: 15, open: eyes, look, mirror: false, lit: L ? 0.2 : 1 });
    // нос тенью
    const nx = L ? 1 : -1;
    s += `<path d="M${300 + nx * 6},292 C${300 + nx * 14},318 ${300 + nx * 18},340 ${300 + nx * 22},356 C${300 + nx * 12},368 ${300 - nx * 2},368 ${300 - nx * 10},362 C${300 + nx * 6},352 ${300 + nx * 6},320 ${300 + nx * 6},292Z" fill="#3a2a30" opacity="0.45" filter="url(#soft4)"/>`;
    s += `<path d="M${300 - nx * 4},300 L${300 - nx * 6},345" stroke="#fff3e6" stroke-width="5" opacity="0.18" stroke-linecap="round" filter="url(#soft4)"/>`;
    s += `<ellipse cx="290" cy="360" rx="5" ry="3" fill="#4a3030" opacity="0.7"/><ellipse cx="310" cy="360" rx="5" ry="3" fill="#4a3030" opacity="0.7"/>`;
    // рот
    s += mouth(300, 396, 46, mouthOpen, L ? '#b97c74' : '#8a5a5a');
    // чёлка и пряди спереди
    s += `<path d="M300,132 C232,132 196,180 194,250 C210,215 240,196 268,190 C290,188 330,170 346,160 C360,176 386,196 404,240 C404,180 368,132 300,132Z" fill="url(#${g}hair)"/>`;
    s += `<path d="M198,240 C192,300 198,360 214,430 C204,470 196,510 180,540 C214,520 230,470 228,420 C216,360 210,300 214,250Z" fill="url(#${g}hair)"/>`;
    s += `<path d="M402,240 C408,300 402,360 386,430 C396,470 404,510 420,540 C386,520 370,470 372,420 C384,360 390,300 386,250Z" fill="url(#${g}hair)"/>`;
    s += `<path d="M260,150 C240,170 228,200 224,230 M300,140 C285,155 275,175 270,195" stroke="#8a5f48" stroke-width="3" fill="none" opacity="${L ? 0.6 : 0.2}"/>`;
    // рация в руке
    if (radio) {
      s += `<g transform="translate(330,600) rotate(-8)">
        <path d="M-40,120 C-50,60 -30,20 10,10 L70,10 C100,30 110,80 100,140Z" fill="${L ? '#b98f7b' : '#6a5458'}"/>
        <rect x="0" y="-60" width="62" height="130" rx="10" fill="#2a3038"/>
        <rect x="44" y="-130" width="8" height="80" rx="3" fill="#20252c"/>
        <rect x="10" y="-40" width="42" height="26" rx="3" fill="${radioLit ? '#4f8f5f' : '#1b2a22'}"/>
        <circle cx="31" cy="20" r="14" fill="#1c2026"/>
        <circle cx="14" cy="-50" r="5" fill="${radioLit ? '#7ee0a0' : '#355040'}"/>
        <path d="M-10,40 C20,30 60,40 80,60" stroke="#000" stroke-width="8" opacity="0.2" fill="none"/>
      </g>`;
    }
    return s;
  }

  // ---------- КУРЬЕР ----------
  function courier(o = {}) {
    const { eyes = 1, look = { x: 0, y: 0 }, brows = 0, mouthOpen = 0, lamp = -1, bag = true } = o;
    const g = id('cr');
    const L = lamp < 0;
    const skin = splitGrad(`${g}skin`, '#d8a888', '#c4957a', '#755a56', '#4d3d45', lamp);
    const neck = splitGrad(`${g}neck`, '#a8806c', '#94705f', '#54434a', '#3d323b', lamp);
    const jacket = splitGrad(`${g}jk`, '#4f6b6a', '#3e5756', '#2a3b3d', '#1e2a2e', lamp, 0.35, 0.6);
    const hair = splitGrad(`${g}hair`, '#3a2e2a', '#2a211e', '#1a1514', '#121010', lamp, 0.35, 0.6);
    const bagG = splitGrad(`${g}bag`, '#b39648', '#9b8038', '#62542a', '#463c20', lamp, 0.3, 0.65);
    let s = `<defs>${skin}${neck}${jacket}${hair}${bagG}
      <clipPath id="${g}face"><path d="M300,160 C372,160 404,212 404,278 C404,336 394,372 370,404 C348,432 324,448 300,450 C276,448 252,432 230,404 C206,372 196,336 196,278 C196,212 228,160 300,160Z"/></clipPath></defs>`;
    // огромная сумка за спиной
    if (bag) {
      s += `<path d="M20,380 L580,380 L590,800 L10,800Z" fill="url(#${g}bag)"/>
            <path d="M20,380 L580,380 L572,410 L28,410Z" fill="#000" opacity="0.18"/>
            <text x="${L ? 70 : 420}" y="470" font-family="JetBrains Mono" font-weight="800" font-size="34" fill="#3d3418" opacity="0.6">ЕДА·24</text>`;
    }
    // куртка
    s += `<path d="M30,800 L44,640 C54,560 120,520 212,498 L300,520 L388,498 C480,520 546,560 556,640 L570,800Z" fill="url(#${g}jk)"/>`;
    // лямки сумки
    if (bag) s += `<path d="M150,520 L190,800 M450,520 L410,800" stroke="#1a1f22" stroke-width="38" opacity="0.85"/>
                   <rect x="160" y="640" width="44" height="22" fill="#77808a"/><rect x="396" y="640" width="44" height="22" fill="#5d656e"/>`;
    // шея
    s += `<path d="M258,410 L258,500 Q300,522 342,500 L342,410Z" fill="url(#${g}neck)"/>`;
    s += `<path d="M258,445 Q300,478 342,445 L342,480 Q300,500 258,480Z" fill="#241c22" opacity="0.5" filter="url(#soft4)"/>`;
    // высокий воротник с молнией
    s += `<path d="M232,470 L246,535 Q300,560 354,535 L368,470 Q300,500 232,470Z" fill="${L ? '#47605f' : '#2d3e40'}"/>
          <path d="M300,500 L300,800" stroke="#9aa3a8" stroke-width="3" opacity="0.6"/>
          <rect x="294" y="540" width="12" height="22" rx="2" fill="#aab2b8"/>`;
    // уши
    s += `<ellipse cx="197" cy="300" rx="15" ry="28" fill="${L ? '#c8987c' : '#5f4a4c'}"/>
          <ellipse cx="403" cy="300" rx="15" ry="28" fill="${L ? '#5f4a4c' : '#c8987c'}"/>`;
    // лицо
    s += `<path d="M300,160 C372,160 404,212 404,278 C404,336 394,372 370,404 C348,432 324,448 300,450 C276,448 252,432 230,404 C206,372 196,336 196,278 C196,212 228,160 300,160Z" fill="url(#${g}skin)"/>`;
    s += `<g clip-path="url(#${g}face)">`;
    s += `<path d="${L ? 'M375,320 Q350,370 322,385 Q355,400 385,370Z' : 'M225,320 Q250,370 278,385 Q245,400 215,370Z'}" fill="#251c26" opacity="0.5" filter="url(#soft10)"/>`;
    s += `<path d="${L ? 'M222,320 Q246,368 272,378 Q240,392 218,370Z' : 'M378,320 Q354,368 328,378 Q360,392 382,370Z'}" fill="#7a5048" opacity="0.35" filter="url(#soft10)"/>`;
    // щетина
    s += `<path d="M222,360 Q236,430 300,452 Q364,430 378,360 Q360,410 330,418 Q300,400 270,418 Q240,410 222,360Z" fill="#2b2326" opacity="0.38" filter="url(#soft4)"/>`;
    s += `<path d="M262,372 Q300,360 338,372 Q300,380 262,372Z" fill="#2b2326" opacity="0.35" filter="url(#soft4)"/>`;
    s += `<path d="M200,190 Q300,236 404,200 L404,150 L200,150Z" fill="#1f1719" opacity="0.4" filter="url(#soft10)"/>`;
    s += `</g>`;
    // брови — гуще
    const by = 252 - brows * 10;
    s += `<path d="M216,${by + 6} Q246,${by - 10} 284,${by + 4}" stroke="#211817" stroke-width="10" fill="none" stroke-linecap="round"/>
          <path d="M384,${by + 6} Q354,${by - 10} 316,${by + 4}" stroke="#211817" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    s += eye({ cx: 252, cy: 290, w: 48, h: 12, open: eyes, look, mirror: true, lit: L ? 1 : 0.2, iris: '#3c4a3a', skinDark: '#6a4c46' });
    s += eye({ cx: 348, cy: 290, w: 48, h: 12, open: eyes, look, mirror: false, lit: L ? 0.2 : 1, iris: '#3c4a3a', skinDark: '#6a4c46' });
    // мешки под глазами (не выспался)
    s += `<path d="M232,308 Q252,318 272,308 M328,308 Q348,318 368,308" stroke="#5a4044" stroke-width="3" fill="none" opacity="0.45"/>`;
    const nx = L ? 1 : -1;
    s += `<path d="M${300 + nx * 6},296 C${300 + nx * 16},322 ${300 + nx * 22},344 ${300 + nx * 26},362 C${300 + nx * 14},374 ${300 - nx * 4},374 ${300 - nx * 14},366 C${300 + nx * 6},356 ${300 + nx * 6},322 ${300 + nx * 6},296Z" fill="#33262c" opacity="0.5" filter="url(#soft4)"/>`;
    s += `<ellipse cx="288" cy="366" rx="6" ry="3.5" fill="#3e2828" opacity="0.7"/><ellipse cx="312" cy="366" rx="6" ry="3.5" fill="#3e2828" opacity="0.7"/>`;
    s += mouth(300, 404, 50, mouthOpen, L ? '#9c6a62' : '#74504e', '#4e3436');
    // короткая стрижка + вязаная шапка
    s += `<path d="M196,262 C192,210 214,176 240,168 L246,206 C224,220 212,240 206,270Z" fill="url(#${g}hair)"/>
          <path d="M404,262 C408,210 386,176 360,168 L354,206 C376,220 388,240 394,270Z" fill="url(#${g}hair)"/>`;
    s += `<path d="M186,226 C186,130 240,96 300,96 C360,96 414,130 414,226 Q300,200 186,226Z" fill="${L ? '#5a4c5e' : '#3a3240'}"/>
          <path d="M186,226 Q300,198 414,226 L412,196 Q300,170 188,196Z" fill="${L ? '#6a5a6e' : '#2f2834'}"/>
          <path d="M220,190 L222,120 M260,180 L262,104 M300,176 L300,98 M340,180 L338,104 M380,190 L378,120" stroke="#000" stroke-width="4" opacity="0.14"/>`;
    return s;
  }

  // ---------- плашки ----------
  function plates({ where = 'БОРТ', when = '??:??', timer = null, timerAlarm = false } = {}) {
    const box = (x, y, label, val, col, w) => `
      <g font-family="JetBrains Mono" font-weight="700">
        <rect x="${x}" y="${y}" width="${w}" height="74" fill="#0b0f14" fill-opacity="0.72" stroke="${col}" stroke-width="3"/>
        <text x="${x + 20}" y="${y + 48}" font-size="32" fill="${col}">${label}</text>
        <text x="${x + 20 + label.length * 19.5 + 14}" y="${y + 48}" font-size="32" fill="#e8eef2">${val}</text>
      </g>`;
    let s = box(48, 90, 'ГДЕ', where, C.green, 70 + 3 * 19.5 + where.length * 19.5 + 14);
    s += box(48, 180, 'КОГДА', when, C.yellow, 70 + 5 * 19.5 + when.length * 19.5 + 14);
    if (timer) {
      const col = timerAlarm ? C.red : '#e8eef2';
      s += `<g font-family="JetBrains Mono" font-weight="700">
        <rect x="770" y="90" width="262" height="74" fill="#0b0f14" fill-opacity="0.72" stroke="${col}" stroke-width="3"/>
        <circle cx="804" cy="127" r="10" fill="${col}"/>
        <text x="828" y="139" font-size="34" fill="${col}">${timer}</text></g>`;
    }
    return s;
  }

  // ---------- ФОНЫ (1080×1920) ----------
  // 1. Зал ожидания, 05:40 — рассвет за стеклом, тёплая лампа
  function bgHall(t = 0) {
    const flick = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 3.1);
    let s = `<defs>
      <linearGradient id="hallSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2740"/><stop offset="0.6" stop-color="#3a4a66"/><stop offset="0.85" stop-color="#8c7a78"/><stop offset="1" stop-color="#c98f62"/></linearGradient>
      <radialGradient id="hallLamp" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="${C.lamp}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.lamp}" stop-opacity="0"/></radialGradient>
    </defs>`;
    s += `<rect width="1080" height="1920" fill="#1a212b"/>`;
    // большое окно
    s += `<rect x="60" y="300" width="960" height="760" fill="url(#hallSky)"/>`;
    s += `<rect x="60" y="1000" width="960" height="60" fill="#1d2430"/>`; // полоса земли
    s += `<path d="M60,1000 L1020,1000" stroke="#d29a62" stroke-width="2" opacity="0.6"/>`;
    // самолёт за окном
    s += `<g transform="translate(560,935)" fill="#2b3442">
      <path d="M-260,20 Q-250,-10 -200,-14 L240,-14 Q290,-10 300,10 Q290,30 240,30 L-200,30 Q-250,30 -260,20Z"/>
      <path d="M-180,-14 L-240,-110 L-205,-110 L-120,-14Z"/><path d="M0,10 L-90,70 L-40,70 L80,10Z"/>
      ${[...Array(14)].map((_, i) => `<circle cx="${-150 + i * 26}" cy="2" r="5" fill="#f2c88a" opacity="0.7"/>`).join('')}
    </g>`;
    // переплёт окна
    for (let x = 60; x <= 1020; x += 240) s += `<rect x="${x - 8}" y="300" width="16" height="760" fill="#11161d"/>`;
    s += `<rect x="52" y="292" width="976" height="16" fill="#11161d"/><rect x="52" y="1052" width="976" height="16" fill="#11161d"/>`;
    // штора, приспущенная слева
    s += `<path d="M60,300 L300,300 L300,${620} Q180,${650} 60,620Z" fill="#3b4250"/>
          ${[90, 150, 210, 270].map((x) => `<path d="M${x},300 L${x},630" stroke="#000" stroke-width="10" opacity="0.18"/>`).join('')}`;
    // табло вылетов
    s += `<g font-family="JetBrains Mono" font-weight="700"><rect x="620" y="140" width="400" height="130" fill="#0c1016" stroke="#2c3644" stroke-width="4"/>
      <text x="640" y="190" font-size="32" fill="${C.amber}">05:40  РЕЙС 540</text>
      <text x="640" y="240" font-size="28" fill="${C.amber}" opacity="0.75">ПОСАДКА · ВЫХОД 2</text></g>`;
    // пол и ряд кресел
    s += `<rect x="0" y="1060" width="1080" height="860" fill="#232a33"/>`;
    s += `<path d="M0,1060 L1080,1060" stroke="#3a4555" stroke-width="3"/>`;
    s += `<rect x="0" y="1060" width="1080" height="420" fill="#fff" opacity="0.03"/>`;
    for (let i = 0; i < 5; i++) {
      const x = -40 + i * 240;
      s += `<g transform="translate(${x},1240)"><rect x="0" y="0" width="200" height="190" rx="18" fill="#2f3a48"/><rect x="0" y="150" width="200" height="60" rx="10" fill="#384556"/>
        <rect x="20" y="210" width="12" height="110" fill="#151a20"/><rect x="168" y="210" width="12" height="110" fill="#151a20"/></g>`;
    }
    // тёплая лампа сверху
    s += `<rect x="460" y="0" width="160" height="26" fill="#0f1318"/><path d="M500,26 L580,26 L600,60 L480,60Z" fill="#2a2f36"/>`;
    s += `<ellipse cx="540" cy="70" rx="80" ry="12" fill="${C.lamp}" opacity="${0.9 * flick}"/>`;
    s += `<path d="M480,60 L600,60 L1000,1920 L80,1920Z" fill="url(#hallLamp)" opacity="${0.7 * flick}"/>`;
    return s;
  }

  // 2. Пустой салон в перспективе
  function bgCabin(t = 0, signOn = true) {
    const vx = 540, vy = 820;
    const blink = signOn ? (Math.floor(t * 1.2) % 2 === 0 ? 1 : 0.35) : 0.2;
    let s = `<defs>
      <linearGradient id="cabWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2d3846"/><stop offset="1" stop-color="#1a222c"/></linearGradient>
      <linearGradient id="cabWallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#26303c"/><stop offset="1" stop-color="#1a222c"/></linearGradient>
      <linearGradient id="cabFloor" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a3240"/><stop offset="1" stop-color="#161c24"/></linearGradient>
      <linearGradient id="cabCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4656"/><stop offset="1" stop-color="#1c232d"/></linearGradient>
    </defs>`;
    s += `<rect width="1080" height="1920" fill="#141a22"/>`;
    s += `<path d="M0,0 L1080,0 L640,720 L440,720Z" fill="url(#cabCeil)"/>`;
    s += `<path d="M0,0 L440,720 L440,940 L0,1920Z" fill="url(#cabWall)"/>`;
    s += `<path d="M1080,0 L640,720 L640,940 L1080,1920Z" fill="url(#cabWallR)"/>`;
    s += `<path d="M0,1920 L440,940 L640,940 L1080,1920Z" fill="url(#cabFloor)"/>`;
    // дальняя стена с дверью кабины
    s += `<rect x="440" y="720" width="200" height="220" fill="#202933"/><rect x="505" y="760" width="70" height="180" fill="#2c3644"/>`;
    // багажные полки
    s += `<path d="M0,180 L470,770 L470,800 L0,420Z" fill="#323e4d"/><path d="M1080,180 L610,770 L610,800 L1080,420Z" fill="#2a3542"/>`;
    // полоска потолочного света
    s += `<path d="M0,170 L470,768" stroke="#a9c0d8" stroke-width="5" opacity="0.25"/><path d="M1080,170 L610,768" stroke="#a9c0d8" stroke-width="5" opacity="0.18"/>`;
    // иллюминаторы со шторками
    for (let i = 0; i < 6; i++) {
      const k = Math.pow(0.72, i);
      const xl = 40 + (1 - k) * 360, yl = 520 + (1 - k) * 280;
      const w = 70 * k, h = 100 * k;
      s += `<rect x="${xl}" y="${yl}" width="${w}" height="${h}" rx="${w / 2.4}" fill="#3a5878" opacity="0.8"/><rect x="${xl}" y="${yl}" width="${w}" height="${h * 0.55}" rx="${w / 3}" fill="#5c6878"/>`;
      s += `<rect x="${1080 - xl - w}" y="${yl}" width="${w}" height="${h}" rx="${w / 2.4}" fill="#2e4a66" opacity="0.8"/><rect x="${1080 - xl - w}" y="${yl}" width="${w}" height="${h * 0.6}" rx="${w / 3}" fill="#4e5a68"/>`;
    }
    // ряды кресел: от дальних к ближним
    for (let i = 7; i >= 0; i--) {
      const k = Math.pow(0.7, i);
      const baseY = vy + 120 + k * 980;
      const aisle = 60 + k * 300;
      const sw = 50 + k * 330, sh = 80 + k * 560;
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? vx - aisle - sw : vx + aisle;
        const col = side < 0 ? '#34506e' : '#2b4560';
        s += `<rect x="${x0}" y="${baseY - sh}" width="${sw}" height="${sh}" rx="${14 * k + 4}" fill="${col}"/>`;
        s += `<rect x="${x0 + sw * 0.08}" y="${baseY - sh}" width="${sw * 0.84}" height="${sh * 0.2}" rx="${10 * k + 3}" fill="#c9d2dc" opacity="0.55"/>`;
        s += `<rect x="${x0}" y="${baseY - sh * 0.35}" width="${sw}" height="${sh * 0.35}" fill="#000" opacity="0.18"/>`;
      }
    }
    // табло «пристегните ремни» мигает
    s += `<g transform="translate(540,300)"><rect x="-70" y="-24" width="140" height="48" rx="8" fill="#0d1116"/>
      <text x="0" y="12" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="30" fill="${C.amber}" opacity="${blink}">⚠ ✈</text></g>`;
    s += `<ellipse cx="540" cy="300" rx="160" ry="60" fill="${C.amber}" opacity="${0.15 * blink}" filter="url(#soft30)"/>`;
    return s;
  }

  // 3. Иллюминатор: внизу город без огней
  function bgWindow(t = 0) {
    const drift = (t * 18) % 120;
    let s = `<defs>
      <clipPath id="winClip"><rect x="250" y="520" width="580" height="820" rx="270"/></clipPath>
      <linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1626"/><stop offset="0.35" stop-color="#26324a"/><stop offset="0.42" stop-color="#6a6070"/><stop offset="0.45" stop-color="#1b2230"/><stop offset="1" stop-color="#0c1118"/></linearGradient>
    </defs>`;
    s += `<rect width="1080" height="1920" fill="#3a4554"/>`;
    s += `<rect width="1080" height="1920" fill="#000" opacity="0.25"/>`;
    // пластик стены
    s += `<rect x="190" y="440" width="700" height="980" rx="330" fill="#56626f"/><rect x="215" y="470" width="650" height="920" rx="310" fill="#2b333e"/>`;
    s += `<g clip-path="url(#winClip)"><rect x="250" y="520" width="580" height="820" fill="url(#winSky)"/>`;
    // сетка тёмных улиц — перспектива
    s += `<g opacity="0.55" stroke="#3a4658" stroke-width="2" fill="none">`;
    for (let i = 0; i < 18; i++) { const y = 900 + Math.pow(i / 17, 2) * 460 + (drift * (i / 17)) % 40; s += `<path d="M200,${y} L900,${y}"/>`; }
    for (let i = -12; i <= 12; i++) s += `<path d="M${540 + i * 14},880 L${540 + i * 90},1360"/>`;
    s += `</g>`;
    // кварталы-силуэты
    for (let i = 0; i < 30; i++) { const x = 250 + ((i * 97) % 580), y = 940 + ((i * 53) % 380); s += `<rect x="${x}" y="${y}" width="${14 + (i % 4) * 6}" height="${8 + (i % 3) * 4}" fill="#0a0e14" opacity="0.8"/>`; }
    // шторка сверху (приспущена)
    s += `<rect x="250" y="520" width="580" height="240" fill="#6b7682"/><rect x="250" y="752" width="580" height="12" fill="#3c444e"/>`;
    s += `</g>`;
    // блик на стекле
    s += `<path d="M330,820 Q360,700 440,640" stroke="#fff" stroke-width="10" opacity="0.06" fill="none"/>`;
    return s;
  }

  // 4. Дверь кабины, экран AUTOPILOT, штора камбуза
  function bgCockpitDoor(t = 0) {
    const glow = 0.8 + 0.2 * Math.sin(t * 2);
    let s = `<rect width="1080" height="1920" fill="#1c232c"/>`;
    // штора камбуза слева
    s += `<path d="M0,200 L280,200 L300,1920 L0,1920Z" fill="#334050"/>`;
    for (let x = 30; x < 300; x += 50) s += `<path d="M${x},200 Q${x + 12},1000 ${x + 6},1920" stroke="#000" stroke-width="16" opacity="0.2" fill="none"/>`;
    // дверь
    s += `<rect x="360" y="380" width="560" height="1540" fill="#3a4757"/><rect x="380" y="400" width="520" height="1520" fill="#45546a"/>`;
    s += `<rect x="380" y="400" width="520" height="1520" fill="#000" opacity="0.15"/>`;
    s += `<rect x="560" y="560" width="160" height="110" rx="6" fill="#1a1f26"/><rect x="574" y="574" width="132" height="82" fill="#2a3746" opacity="0.8"/>`; // глазок-окошко
    // кодовая панель и ручка
    s += `<rect x="790" y="1000" width="80" height="120" rx="6" fill="#1a1f26"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) s += `<rect x="${798 + c * 24}" y="${1010 + r * 26}" width="18" height="18" rx="3" fill="#353d48"/>`;
    s += `<circle cx="830" cy="1145" r="6" fill="${C.red}" opacity="${0.6 + 0.4 * glow}"/>`;
    s += `<rect x="780" y="1180" width="100" height="26" rx="10" fill="#9aa3ae"/>`;
    // экран над дверью
    s += `<rect x="440" y="230" width="400" height="110" rx="8" fill="#0a0e12" stroke="#2c3644" stroke-width="4"/>
          <text x="640" y="302" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="46" fill="${C.green}" opacity="${glow}">AUTOPILOT</text>
          <ellipse cx="640" cy="290" rx="240" ry="80" fill="${C.green}" opacity="${0.08 * glow}" filter="url(#soft30)"/>`;
    // холодный свет на дверь
    s += `<path d="M640,340 L960,1920 L320,1920Z" fill="#7ee0a0" opacity="0.04"/>`;
    return s;
  }

  // 5. Экран в спинке кресла: остаток полёта/топлива
  function bgSeatScreen(t = 0, minutesLeft = 120) {
    const hh = String(Math.floor(minutesLeft / 60)).padStart(2, '0'), mm = String(Math.floor(minutesLeft % 60)).padStart(2, '0');
    const low = minutesLeft < 50;
    let s = `<rect width="1080" height="1920" fill="#22405e"/><rect width="1080" height="1920" fill="#1a2430" opacity="0.7"/>`;
    s += `<rect x="90" y="360" width="900" height="1200" rx="60" fill="#2c3c50"/>`; // спинка
    s += `<rect x="170" y="520" width="740" height="480" rx="14" fill="#06090c"/>`;
    s += `<rect x="186" y="536" width="708" height="448" fill="#0d1a26"/>`;
    // карта: линия маршрута и самолётик
    s += `<path d="M230,900 Q450,620 850,600" stroke="#3a6a8e" stroke-width="4" stroke-dasharray="12 10" fill="none"/>`;
    const p = 0.45 + Math.min(t, 10) * 0.005;
    s += `<text x="${230 + p * 620}" y="${900 - p * 290}" font-size="40" fill="#cfe6ff">✈</text>`;
    s += `<g font-family="JetBrains Mono" font-weight="700">
      <text x="210" y="600" font-size="30" fill="#8fb4d4">ДО ПОСАДКИ</text>
      <text x="210" y="680" font-size="80" fill="${low ? C.red : '#e8eef2'}">${hh}:${mm}</text>
      <text x="210" y="960" font-size="26" fill="#8fb4d4">ТОПЛИВО</text>
      <rect x="380" y="938" width="300" height="26" fill="none" stroke="#8fb4d4" stroke-width="2"/>
      <rect x="383" y="941" width="${294 * Math.max(0, minutesLeft / 120)}" height="20" fill="${low ? C.red : '#7ec0e0'}"/></g>`;
    s += `<rect x="170" y="520" width="740" height="480" fill="#7ec0e0" opacity="0.05"/>`;
    s += `<ellipse cx="540" cy="760" rx="500" ry="400" fill="#4f8fbf" opacity="0.10" filter="url(#soft30)"/>`;
    // карман с журналами
    s += `<rect x="170" y="1180" width="740" height="260" rx="20" fill="#24323f"/><rect x="200" y="1150" width="300" height="60" fill="#56616e" transform="rotate(-3 350 1180)"/>`;
    return s;
  }

  // 6. Люк в полу: свет снизу и рука (финал)
  function bgHatch(t = 0, open = 1, hand = 1) {
    let s = `<defs><linearGradient id="hatchLight" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd9a0" stop-opacity="0.85"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient></defs>`;
    s += `<rect width="1080" height="1920" fill="#12171e"/>`;
    // ковёр прохода в перспективе
    s += `<path d="M120,1920 L420,700 L660,700 L960,1920Z" fill="#2a3240"/>`;
    s += `<path d="M120,1920 L420,700 M960,1920 L660,700" stroke="#7a8aa0" stroke-width="4" opacity="0.25"/>`;
    // ножки кресел по бокам
    for (let i = 0; i < 4; i++) { const k = Math.pow(0.7, i); s += `<rect x="${380 - k * 300}" y="${900 + k * 700}" width="${40 * k + 10}" height="${180 * k + 20}" fill="#1c232c"/><rect x="${660 + k * 260}" y="${900 + k * 700}" width="${40 * k + 10}" height="${180 * k + 20}" fill="#1c232c"/>`; }
    // проём люка
    const hy = 1240;
    s += `<path d="M330,${hy} L750,${hy} L800,${hy + 300} L280,${hy + 300}Z" fill="#ffcf8a" opacity="${0.15 + 0.75 * open}"/>`;
    // крышка люка, приподнятая
    s += `<g transform="translate(330,${hy}) skewX(-4)"><path d="M0,0 L420,0 L${420 - 10},${-260 * open} L10,${-260 * open}Z" fill="#3a4454"/>
      <path d="M0,0 L420,0 L${420 - 10},${-260 * open} L10,${-260 * open}Z" fill="#ffcf8a" opacity="${0.15 * open}"/></g>`;
    // свет вверх из люка
    s += `<path d="M280,${hy + 300} L800,${hy + 300} L980,0 L100,0Z" fill="url(#hatchLight)" opacity="${0.35 * open}"/>`;
    // рука
    if (hand > 0) {
      const ry = hy + 260 - hand * 520;
      s += `<g transform="translate(520,${ry}) rotate(-6)">
        <path d="M-60,600 L-50,200 Q-40,140 0,130 Q50,140 60,200 L70,600Z" fill="#1d232b"/>
        <path d="M-50,200 Q-40,140 0,130 Q50,140 60,200 L60,240 L-50,240Z" fill="#2c3440"/>
        <path d="M-48,130 C-60,40 -50,-20 -40,-60 Q-30,-72 -22,-58 L-18,10 L-10,-120 Q0,-134 10,-120 L12,0 L22,-110 Q34,-120 42,-104 L40,10 L58,-70 Q70,-78 76,-62 L66,60 C70,90 62,120 50,140Z" fill="#141920"/>
        <path d="M-40,-60 L-40,120 M-10,-120 L-10,110 M22,-110 L22,110" stroke="#ffcf8a" stroke-width="3" opacity="0.25"/>
      </g>`;
    }
    return s;
  }

  // ---------- субтитры ----------
  function subtitle(words, activeIdx, keyWords = []) {
    const lines = [[]]; let len = 0;
    words.forEach((w, i) => { if (len + w.length > 20 && lines[lines.length - 1].length) { lines.push([]); len = 0; } lines[lines.length - 1].push(i); len += w.length + 1; });
    let s = `<g font-family="Inter" font-weight="900" font-size="72" text-anchor="middle">`;
    lines.forEach((ln, li) => {
      const y = 1560 + li * 92;
      const txt = ln.map((i) => {
        const w = words[i];
        const key = keyWords.some((k) => w.toLowerCase().includes(k));
        const col = i === activeIdx ? (key ? C.yellow : '#ffffff') : i < activeIdx ? (key ? C.yellow : '#e8eef2') : '#e8eef2';
        const op = i <= activeIdx ? 1 : 0.35;
        return `<tspan fill="${col}" fill-opacity="${op}">${w} </tspan>`;
      }).join('');
      s += `<text x="540" y="${y}" stroke="#05070a" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${txt}</text>`;
    });
    return s + `</g>`;
  }

  root.ART = { C, defsCommon, screenFx, sveta, courier, plates, bgHall, bgCabin, bgWindow, bgCockpitDoor, bgSeatScreen, bgHatch, subtitle, shade };
})(typeof window !== 'undefined' ? window : globalThis);
