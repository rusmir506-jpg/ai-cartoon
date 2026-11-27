// ГИГАНТСКИЕ МУТАНТЫ — общая библиотека рисунков (SVG-строки).
// Каждая функция возвращает кусок SVG. Персонажи рисуются от точки "ноги" (0,0) вверх.
// Используется и листом персонажей, и анимацией.

let _uid = 0;
const clampN = (x) => Math.max(0, Math.min(1, x));
const PAL = {
  night0: '#07090d', night1: '#0d1218', night2: '#151d26', slate: '#243039', slate2: '#33414c',
  fog: '#4a5a66', rust: '#5e3322', rust2: '#7a4428', brick: '#3a2420',
  water0: '#0a1418', water1: '#12232a', waterHi: '#2c4a52',
  reagent: '#8fd16a', eye: '#c8ff6e', eyeGlow: '#9be04a',
  fire0: '#ffd36a', fire1: '#ff8a2a', fire2: '#d4401c',
  skin: '#c79878', skinSh: '#9c705a', hair: '#1b1716',
  parka: '#3c4836', parkaSh: '#2b3427', jeans: '#28303b', shoe: '#121418',
  coat: '#c08a2a', coatSh: '#8e6419', boots: '#7e2a26',
  hard: '#7f8d99', hardHi: '#b9c7d2', hardSh: '#4d5862',
  fur: '#2b2723', furHi: '#4b453e', furSh: '#171513', claw: '#d9d1bd',
  lamp: '#e8d9a0', ink: '#e9e4d8', red: '#d2453a',
};

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Свалявшаяся мокрая шерсть: колючий контур вокруг эллипса
function furBlob(cx, cy, rx, ry, { n = 46, spike = 0.18, seed = 1, fill = PAL.fur, droop = 0.6, stroke = 'none', sw = 0 } = {}) {
  const r = rng(seed); let d = '';
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = i % 2 === 0 ? 1 + spike * (0.4 + r()) : 1 - spike * 0.25 * r();
    let x = cx + Math.cos(t) * rx * k, y = cy + Math.sin(t) * ry * k;
    if (i % 2 === 0) y += Math.max(0, Math.sin(t)) * ry * spike * droop * r() * 2; // мокрые сосульки вниз
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

function furStrands(cx, cy, rx, ry, { n = 14, seed = 3, color = PAL.furHi } = {}) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (r() - 0.5) * rx * 1.5, y = cy + (r() - 0.6) * ry * 1.2, l = 10 + r() * ry * 0.5;
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q ${(r() * 6 - 3).toFixed(1)} ${(l / 2).toFixed(1)} ${(r() * 4 - 2).toFixed(1)} ${l.toFixed(1)}" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  return s;
}

const rot = (deg, x, y) => `rotate(${deg || 0} ${x} ${y})`;

// ---------------- НИКИТА ----------------
// pose: {armL, armR, legL, legR, head, lean} — углы в градусах
// face: 'calm' | 'tense' | 'scared'; lighter: false | 'off' | 'on'
function nikita({ pose = {}, face = 'tense', lighter = false, phone = false, flame = 1 } = {}) {
  const p = Object.assign({ armL: 6, armR: -6, legL: 0, legR: 0, head: 0, lean: 0 }, pose);
  const leg = (x, a, id) => `<g id="${id}" transform="${rot(a, x, -170)}">
      <rect x="${x - 17}" y="-172" width="34" height="160" rx="12" fill="${PAL.jeans}"/>
      <rect x="${x - 19}" y="-24" width="42" height="24" rx="10" fill="${PAL.shoe}"/></g>`;
  const handItem = () => {
    if (lighter) {
      const fl = lighter === 'on' ? `<g class="flame" transform="translate(0 -40) scale(${flame})">
          <circle r="90" fill="${PAL.fire0}" opacity=".10"/><circle r="44" fill="${PAL.fire0}" opacity=".16"/>
          <path d="M0 6 C-12 -4 -6 -20 0 -34 C6 -20 12 -4 0 6Z" fill="${PAL.fire1}"/>
          <path d="M0 4 C-6 -2 -3 -12 0 -20 C3 -12 6 -2 0 4Z" fill="${PAL.fire0}"/></g>` : '';
      return `<rect x="-7" y="-34" width="14" height="24" rx="3" fill="${PAL.red}"/><rect x="-7" y="-40" width="14" height="7" rx="2" fill="#9aa3ab"/>${fl}`;
    }
    if (phone) return `<rect x="-14" y="-50" width="28" height="48" rx="5" fill="#0c0f12" stroke="#3a4650" stroke-width="2"/>
        <rect x="-10" y="-45" width="20" height="36" rx="2" fill="#5f8fa8" opacity=".9"/>`;
    return '';
  };
  // Правая рука (на экране справа) может держать предмет: при lighter/phone рука поднята
  const armR = (lighter || phone) ? -150 + (p.armRup || 0) : p.armR;
  const eyes = face === 'scared'
    ? `<circle cx="-15" cy="-478" r="6" fill="#f4efe6"/><circle cx="15" cy="-478" r="6" fill="#f4efe6"/><circle cx="-15" cy="-478" r="3" fill="#111"/><circle cx="15" cy="-478" r="3" fill="#111"/>
       <path d="M-26 -494 l18 -5 M26 -494 l-18 -5" stroke="${PAL.hair}" stroke-width="5" stroke-linecap="round"/>
       <ellipse cx="0" cy="-452" rx="7" ry="9" fill="#3a1d1a"/>`
    : `<circle cx="-15" cy="-476" r="4.5" fill="#111"/><circle cx="15" cy="-476" r="4.5" fill="#111"/>
       <path d="M-27 -490 l20 ${face === 'tense' ? 4 : 0} M27 -490 l-20 ${face === 'tense' ? 4 : 0}" stroke="${PAL.hair}" stroke-width="5" stroke-linecap="round"/>
       <path d="M-10 -452 q10 ${face === 'calm' ? 4 : -3} 20 0" stroke="#3a1d1a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<g class="nikita" transform="rotate(${p.lean} 0 0)">
    ${leg(-22, p.legL, 'n-legL')}${leg(22, p.legR, 'n-legR')}
    <g id="n-armL" transform="${rot(p.armL, -52, -385)}">
      <rect x="-72" y="-395" width="38" height="170" rx="16" fill="${PAL.parkaSh}"/>
      <circle cx="-53" cy="-224" r="15" fill="${PAL.skinSh}"/></g>
    <path d="M-62 -400 Q-66 -300 -66 -160 L66 -160 Q66 -300 62 -400 Q0 -420 -62 -400Z" fill="${PAL.parka}"/>
    <path d="M0 -405 V-162" stroke="${PAL.parkaSh}" stroke-width="4"/>
    <rect x="-52" y="-240" width="34" height="26" rx="5" fill="${PAL.parkaSh}"/><rect x="18" y="-240" width="34" height="26" rx="5" fill="${PAL.parkaSh}"/>
    <path d="M-66 -168 H66 V-150 H-66Z" fill="${PAL.parkaSh}"/>
    <g id="n-head" transform="${rot(p.head, 0, -410)}">
      <path d="M-62 -420 Q-70 -540 0 -548 Q70 -540 62 -420 Q0 -400 -62 -420Z" fill="${PAL.parkaSh}"/>
      <rect x="-14" y="-428" width="28" height="22" fill="${PAL.skinSh}"/>
      <ellipse cx="0" cy="-470" rx="42" ry="50" fill="${PAL.skin}"/>
      <path d="M-44 -478 Q-46 -530 0 -528 Q42 -530 44 -486 Q30 -506 6 -500 Q-10 -514 -26 -500 Q-36 -496 -44 -478Z" fill="${PAL.hair}"/>
      ${eyes}
    </g>
    <g id="n-armR" transform="${rot(armR, 52, -385)}">
      <rect x="34" y="-395" width="38" height="170" rx="16" fill="${PAL.parka}"/>
      <circle cx="53" cy="-224" r="15" fill="${PAL.skin}"/>
      <g transform="translate(53 -224) rotate(${-armR})">${handItem()}</g></g>
  </g>`;
}

// ---------------- АСЯ ----------------
// hard: 0..1 — насколько поднялась твёрдая кожа по левой руке (0 — нет, 0.5 — до локтя, 1 — плечо)
function asya({ pose = {}, face = 'scared', hard = 0, torch = true, scratch = false, green = 0 } = {}) {
  // hard > 1: серое переходит на плечо и шею (2 — у самой шеи)
  const hk = clampN(hard - 1);
  const shoulder = hk > 0 ? `<path d="M-46 -200 Q-44 -218 -28 -224 L${(-28 + 22 * hk).toFixed(1)} ${(-226 - 4 * hk).toFixed(1)} Q${(-34 + 10 * hk).toFixed(1)} -205 -40 ${(-196 + 20 * (1 - hk)).toFixed(1)}Z" fill="${PAL.hard}"/><path d="M-42 -206 l8 -6 l7 5 l7 -6" stroke="${PAL.hardHi}" stroke-width="2" fill="none"/>` : '';
  const nk = clampN((hk - .5) / .5);
  const neck = nk > 0 ? [[-24, -234, 1], [-30, -246, .8], [-18, -224, .9]].map(([x, y, sz], i) => nk > i / 3 ? `<path d="M${x} ${y - 6 * sz} l${6 * sz} ${6 * sz} l${-6 * sz} ${6 * sz} l${-6 * sz} ${-6 * sz}Z" fill="${PAL.hard}" stroke="${PAL.hardSh}" stroke-width="1.5"/>` : '').join('') : '';
  const p = Object.assign({ armL: 10, armR: -14, legL: 0, legR: 0, head: 0, lean: 0 }, pose);
  const leg = (x, a) => `<g transform="${rot(a, x, -92)}">
      <rect x="${x - 11}" y="-94" width="22" height="70" rx="8" fill="#2d2a33"/>
      <rect x="${x - 14}" y="-46" width="30" height="46" rx="9" fill="${PAL.boots}"/></g>`;
  // Левая рука: длина 100 от плеча (-48,-205). Твёрдые пластины снизу (кисть) вверх.
  const armLen = 104, hLen = armLen * Math.min(1, hard);
  const plates = hard > 0 ? (() => {
    const cid = 'asyaArm' + (++_uid);
    let s = `<clipPath id="${cid}"><rect x="-62" y="${-205 + armLen - hLen + 10}" width="30" height="${hLen + 20}"/></clipPath>
      <g clip-path="url(#${cid})"><rect x="-61" y="-212" width="27" height="${armLen + 4}" rx="11" fill="${PAL.hard}"/>
      <circle cx="-47" cy="-98" r="12" fill="${PAL.hard}"/>`;
    for (let i = 0; i < 7; i++) s += `<path d="M-60 ${-108 - i * 15} l13 -7 l13 7" stroke="${PAL.hardSh}" stroke-width="2.5" fill="none"/>
       <path d="M-55 ${-113 - i * 15} l8 -4" stroke="${PAL.hardHi}" stroke-width="2" stroke-linecap="round"/>`;
    s += `</g><path d="M-61 ${-205 + armLen - hLen + 10} l7 -6 l6 5 l7 -7 l7 6" stroke="${PAL.hardHi}" stroke-width="2" fill="none" opacity=".9"/>`;
    return s;
  })() : '';
  const scr = scratch ? `<path d="M-58 -140 l20 -14 M-58 -130 l20 -14" stroke="${PAL.red}" stroke-width="3" stroke-linecap="round"/>` : '';
  const ck = clampN((hard - 2.2) / .6);
  const cheek = ck > 0 ? [[-22, -236], [-27, -246], [-17, -226], [-31, -254], [-12, -222], [-34, -244]].map(([x, y], i) => ck > i / 6 ? `<path d="M${x} ${y - 5} l5 5 l-5 5 l-5 -5Z" fill="${PAL.hard}" stroke="${PAL.hardSh}" stroke-width="1.2"/>` : '').join('') : '';
  const eyes = face === 'sing'
    ? `<path d="M-17 -262 q6 4 12 0 M5 -262 q6 4 12 0" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-20 -274 l12 -1 M20 -274 l-12 -1" stroke="#3b2a1c" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="0" cy="-243" rx="5" ry="${(5 + 2 * Math.sin((typeof __T !== 'undefined' ? __T : 0) * 7)).toFixed(1)}" fill="#3a1d1a"/>`
    : face === 'scared'
    ? `<circle cx="-11" cy="-262" r="6" fill="#f4efe6"/><circle cx="11" cy="-262" r="6" fill="#f4efe6"/><circle cx="-11" cy="-261" r="3.2" fill="#111"/><circle cx="11" cy="-261" r="3.2" fill="#111"/>
       <path d="M-20 -276 l12 -3 M20 -276 l-12 -3" stroke="#3b2a1c" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="0" cy="-242" rx="5" ry="6" fill="#3a1d1a"/>`
    : `<circle cx="-11" cy="-261" r="4" fill="#111"/><circle cx="11" cy="-261" r="4" fill="#111"/>
       <path d="M-20 -274 l12 2 M20 -274 l-12 2" stroke="#3b2a1c" stroke-width="3.5" stroke-linecap="round"/><path d="M-7 -243 h14" stroke="#3a1d1a" stroke-width="3.5" stroke-linecap="round"/>`;
  const torchG = torch ? `<g><rect x="40" y="-112" width="12" height="30" rx="3" fill="#30363c"/><rect x="38" y="-84" width="16" height="9" rx="2" fill="#5b646c"/></g>` : '';
  return `<g class="asya" transform="rotate(${p.lean} 0 0)">
    ${leg(-14, p.legL)}${leg(14, p.legR)}
    <g id="a-armL" transform="${rot(p.armL, -48, -205)}">
      <rect x="-61" y="-212" width="27" height="${armLen}" rx="11" fill="${PAL.coatSh}"/>
      <circle cx="-47" cy="-98" r="11" fill="${PAL.skin}"/>${plates}${scr}</g>
    <path d="M-40 -215 Q-50 -150 -56 -84 L56 -84 Q50 -150 40 -215 Q0 -228 -40 -215Z" fill="${PAL.coat}"/>
    <path d="M0 -220 V-86" stroke="${PAL.coatSh}" stroke-width="3"/>
    <circle cx="-8" cy="-190" r="3" fill="${PAL.coatSh}"/><circle cx="-8" cy="-160" r="3" fill="${PAL.coatSh}"/><circle cx="-8" cy="-130" r="3" fill="${PAL.coatSh}"/>
    <path d="M-16 -222 L-4 -160 M16 -222 L4 -160" stroke="#a33a2e" stroke-width="3"/>
    <rect x="-13" y="-162" width="26" height="34" rx="3" fill="#dfe3e6"/><rect x="-9" y="-158" width="12" height="12" fill="#6d7a84"/><rect x="-9" y="-142" width="18" height="3" fill="#6d7a84"/><rect x="-9" y="-136" width="14" height="3" fill="#6d7a84"/>
    ${shoulder}
    <g transform="${rot(p.head, 0, -222)}">
      <path d="M-46 -230 Q-52 -318 0 -324 Q52 -318 46 -230 Q0 -214 -46 -230Z" fill="${PAL.coatSh}"/>
      <ellipse cx="0" cy="-258" rx="32" ry="36" fill="${PAL.skin}"/>
      <path d="M-33 -262 Q-34 -298 0 -296 Q34 -298 33 -262 Q22 -282 0 -280 Q-22 -282 -33 -262Z" fill="#4a2e1e"/>
      <path d="M-34 -262 q-6 30 -2 46 M34 -262 q6 30 2 46" stroke="#4a2e1e" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${eyes}${cheek}${green > 0 ? `<g opacity="${green}"><circle cx="-11" cy="-262" r="10" fill="${PAL.eyeGlow}" opacity=".3"/><circle cx="11" cy="-262" r="10" fill="${PAL.eyeGlow}" opacity=".3"/><circle cx="-11" cy="-262" r="6.5" fill="${PAL.eye}"/><circle cx="11" cy="-262" r="6.5" fill="${PAL.eye}"/><ellipse cx="-11" cy="-262" rx="1.6" ry="5" fill="#10140a"/><ellipse cx="11" cy="-262" rx="1.6" ry="5" fill="#10140a"/></g>` : ''}</g>${neck}
    <g id="a-armR" transform="${rot(p.armR, 48, -205)}">
      <rect x="34" y="-212" width="27" height="${armLen}" rx="11" fill="${PAL.coat}"/>
      <circle cx="47" cy="-98" r="11" fill="${PAL.skin}"/>${torchG}</g>
  </g>`;
}

// ---------------- МУТАНТ (с завода) ----------------
// Сгорбленный, длинные лапы, свалявшаяся мокрая шерсть, зелёные глаза. Ноги в (0,0).
function mutant({ pose = {}, seed = 7, eyes = 1, mouth = 0.3, lanyard = false } = {}) {
  const p = Object.assign({ fl: 0, fr: 0, bl: 0, br: 0, head: 0, body: 0 }, pose);
  const limb = (x, y, a, len, c) => `<g transform="${rot(a, x, y)}">
     <path d="M${x - 14} ${y} L${x - 8} ${y + len} L${x + 8} ${y + len} L${x + 14} ${y}Z" fill="${c}"/>
     <path d="M${x - 8} ${y + len} l-12 14 M${x} ${y + len} l-4 18 M${x + 8} ${y + len} l6 15" stroke="${PAL.claw}" stroke-width="4" stroke-linecap="round"/></g>`;
  return `<g class="mutant" transform="rotate(${p.body} 0 -200)">
    ${limb(150, -190, p.br, 175, PAL.furSh)}${limb(-150, -200, p.bl, 185, PAL.furSh)}
    ${furBlob(10, -250, 200, 92, { seed, spike: .22 })}
    ${furBlob(60, -285, 120, 60, { seed: seed + 1, spike: .2, fill: '#37322c', n: 30 })}
    ${furStrands(10, -240, 190, 80, { seed: seed + 2, n: 22 })}
    ${limb(110, -210, p.fr, 200, PAL.fur)}${limb(-110, -215, p.fl, 205, PAL.fur)}
    <g transform="${rot(p.head, -170, -230)}">
      ${furBlob(-215, -215, 78, 58, { seed: seed + 3, spike: .25 })}
      <path d="M-260 -215 Q-330 -205 -350 -175 Q-300 -160 -240 -175Z" fill="${PAL.furSh}"/>
      <path d="M-345 -178 Q-300 ${-178 + 40 * mouth} -245 -178" fill="#3b0f12"/>
      ${[...Array(6)].map((_, i) => `<path d="M${-338 + i * 15} -178 l5 ${10 + (i % 2) * 6} l5 -${10 + (i % 2) * 6}Z" fill="${PAL.claw}"/>`).join('')}
      <g opacity="${eyes}"><circle cx="-250" cy="-232" r="26" fill="${PAL.eyeGlow}" opacity=".18"/><circle cx="-212" cy="-236" r="22" fill="${PAL.eyeGlow}" opacity=".18"/>
      <circle cx="-250" cy="-232" r="11" fill="${PAL.eye}"/><circle cx="-212" cy="-236" r="9" fill="${PAL.eye}"/>
      <ellipse cx="-250" cy="-232" rx="2.5" ry="8" fill="#10140a"/><ellipse cx="-212" cy="-236" rx="2.5" ry="7" fill="#10140a"/></g>
      ${[...Array(5)].map((_, i) => `<path d="M${-280 + i * 22} -165 q2 ${12 + i * 3} 0 ${22 + i * 4}" stroke="${PAL.waterHi}" stroke-width="2.5" fill="none" opacity=".7"/>`).join('')}
      ${lanyard ? `<path d="M-205 -262 Q-190 -170 -150 -250" stroke="#c23a2e" stroke-width="7" fill="none"/><path d="M-182 -196 l-6 34" stroke="#c23a2e" stroke-width="4"/><g transform="rotate(${(Math.sin((typeof __T !== 'undefined' ? __T : 0) * 3) * 12).toFixed(1)} -188 -162)"><rect x="-204" y="-162" width="32" height="40" rx="4" fill="#dfe3e6"/><rect x="-199" y="-156" width="12" height="12" fill="#6d7a84"/><rect x="-199" y="-140" width="20" height="3" fill="#6d7a84"/></g>` : ''}
    </g>
  </g>`;
}

// ---------------- ГИГАНТ (в реке) ----------------
// rise 0..1 — насколько поднялся над водой. Ширина ~1300, высота ~1500 при rise=1. Центр по x=0, вода y=0.
function giant({ rise = 1, seed = 21, eyes = 1 } = {}) {
  const top = -1500 * rise;
  let drips = ''; const r = rng(seed);
  for (let i = 0; i < 40; i++) { const x = (r() - .5) * 1100, y = top + 300 + r() * 1100 * rise; drips += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} v${(30 + r() * 90).toFixed(0)}" stroke="${PAL.waterHi}" stroke-width="${(2 + r() * 3).toFixed(1)}" opacity=".55" stroke-linecap="round"/>`; }
  const eyeRow = [[-120, 140, 26], [70, 120, 30], [-30, 210, 16], [170, 205, 14], [-200, 230, 12]];
  return `<g class="giant">
    ${furBlob(0, top + 1050, 700, 620, { seed, spike: .12, fill: '#0d0f10', n: 70, stroke: '#35525a', sw: 10 })}
    ${furBlob(0, top + 330, 330, 280, { seed: seed + 1, spike: .16, fill: '#121414', n: 50, stroke: '#35525a', sw: 8 })}
    ${furStrands(0, top + 600, 600, 520, { seed: seed + 2, n: 40, color: '#24282a' })}
    ${drips}
    <g opacity="${eyes}">${eyeRow.map(([x, y, s]) => `<circle cx="${x}" cy="${top + y}" r="${s * 3}" fill="${PAL.eyeGlow}" opacity=".12"/><circle cx="${x}" cy="${top + y}" r="${s}" fill="${PAL.eye}"/><ellipse cx="${x}" cy="${top + y}" rx="${s * .22}" ry="${s * .75}" fill="#0b0f08"/>`).join('')}</g>
  </g>`;
}

// ---------------- РЫБА ----------------
// watching: true — человеческий глаз смотрит в камеру; false — глаз закрыт (спит)
function fish({ watching = true, look = 0 } = {}) {
  const eye = watching
    ? `<circle cx="-62" cy="-8" r="22" fill="#e8e2d4"/><circle cx="${-62 + look * 6}" cy="-8" r="12" fill="#3f6a48"/><circle cx="${-62 + look * 6}" cy="-8" r="6" fill="#090b09"/><circle cx="${-58 + look * 6}" cy="-12" r="2.5" fill="#fff"/>
       <path d="M-86 -14 Q-62 -36 -38 -14" stroke="#2a3a38" stroke-width="4" fill="none"/>`
    : `<path d="M-82 -8 Q-62 4 -42 -8" stroke="#1a2624" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<g class="fish">
    <path d="M-110 0 Q-90 -60 0 -55 Q80 -50 110 0 Q80 50 0 55 Q-90 60 -110 0Z" fill="#46605a"/>
    <path d="M100 0 L170 -45 L160 0 L170 45Z" fill="#33463f"/>
    <path d="M-20 -52 Q10 -90 50 -48Z" fill="#33463f"/>
    <path d="M-30 -40 q10 40 0 80 M0 -45 q10 45 0 90 M30 -42 q10 42 0 84" stroke="#3a514b" stroke-width="3" fill="none"/>
    <path d="M-108 4 q14 6 26 2" stroke="#1b2522" stroke-width="3" fill="none"/>
    ${eye}</g>`;
}

// ---------------- РЕКВИЗИТ ----------------
function propPhone() {
  return `<g><rect x="-80" y="-150" width="160" height="300" rx="20" fill="#0c0f12" stroke="#3a4650" stroke-width="4"/>
    <rect x="-68" y="-130" width="136" height="260" rx="6" fill="#16242c"/>
    <text x="0" y="-80" fill="#8fb3c4" font-family="Inter" font-size="16" text-anchor="middle" font-weight="600">ЛАБОРАТОРИЯ</text>
    <text x="0" y="-30" fill="#e9e4d8" font-family="Inter" font-size="18" text-anchor="middle" font-weight="800">Образец № 417</text>
    <rect x="-56" y="0" width="112" height="44" rx="6" fill="#4a1c1a"/>
    <text x="0" y="29" fill="#ff7a6a" font-family="Inter" font-size="19" text-anchor="middle" font-weight="800">НЕ НАЙДЕН</text></g>`;
}
function propLighter(on = true) {
  return `<g><rect x="-26" y="-20" width="52" height="96" rx="8" fill="${PAL.red}"/><rect x="-26" y="-44" width="52" height="28" rx="5" fill="#9aa3ab"/>
    <circle cx="0" cy="-30" r="8" fill="#5b646c"/>${on ? `<path d="M0 -44 C-30 -70 -14 -110 0 -150 C14 -110 30 -70 0 -44Z" fill="${PAL.fire1}"/><path d="M0 -48 C-14 -64 -8 -90 0 -112 C8 -90 14 -64 0 -48Z" fill="${PAL.fire0}"/>` : ''}</g>`;
}
function propPass() {
  return `<g><rect x="-90" y="-58" width="180" height="116" rx="10" fill="#dfe3e6"/><rect x="-90" y="-58" width="180" height="28" rx="10" fill="#7a4428"/>
    <text x="0" y="-38" fill="#f1e6d6" font-family="Inter" font-size="15" text-anchor="middle" font-weight="800">ЗАВОД «РЕКА»</text>
    <rect x="-76" y="-20" width="50" height="62" fill="#6d7a84"/><text x="-14" y="0" fill="#2a3138" font-family="Inter" font-size="15" font-weight="700">НОЧНАЯ</text>
    <text x="-14" y="22" fill="#2a3138" font-family="Inter" font-size="15" font-weight="700">СМЕНА</text><rect x="-14" y="32" width="88" height="6" fill="#2a3138"/></g>`;
}
function propJournal() {
  return `<g><rect x="-170" y="-110" width="340" height="220" rx="6" fill="#8b7d62"/><rect x="-160" y="-102" width="155" height="204" fill="#e3d9c2"/><rect x="5" y="-102" width="155" height="204" fill="#ddd2b8"/>
    <text font-family="Inter" font-size="15" fill="#3a2e22" font-style="italic"><tspan x="-148" y="-70">23.10 — ночь</tspan><tspan x="-148" y="-40">Давление 4,1</tspan><tspan x="-148" y="-10">Реагент — норма</tspan></text>
    <text font-family="Inter" font-size="16" fill="#7a1f1a" font-weight="800"><tspan x="16" y="-66">НАСОСЫ НЕ</tspan><tspan x="16" y="-44">ОСТАНАВЛИВАТЬ.</tspan><tspan x="16" y="-10" font-size="14" font-weight="600" fill="#3a2e22">Реагент держит</tspan><tspan x="16" y="10" font-size="14" font-weight="600" fill="#3a2e22">их во сне.</tspan></text></g>`;
}

// ---------------- ФОНЫ 1080×1920 ----------------
const defsCommon = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070a"/><stop offset=".6" stop-color="#121b22"/><stop offset="1" stop-color="#1c2a30"/></linearGradient>
  <linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14262c"/><stop offset="1" stop-color="#060c0e"/></linearGradient>
  <radialGradient id="lampGlow"><stop offset="0" stop-color="#e8d9a0" stop-opacity=".55"/><stop offset="1" stop-color="#e8d9a0" stop-opacity="0"/></radialGradient>
  <radialGradient id="greenGlow"><stop offset="0" stop-color="#8fd16a" stop-opacity=".35"/><stop offset="1" stop-color="#8fd16a" stop-opacity="0"/></radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
</defs>`;

function clouds(seed, y0 = 0) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 7; i++) s += `<ellipse cx="${(r() * 1300 - 110).toFixed(0)}" cy="${(y0 + r() * 500).toFixed(0)}" rx="${(220 + r() * 260).toFixed(0)}" ry="${(40 + r() * 50).toFixed(0)}" fill="#1a242c" opacity="${(.35 + r() * .4).toFixed(2)}"/>`;
  return s;
}
function cityLights(y, seed = 5, w = 1080) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 26; i++) { const x = r() * w, h = 60 + r() * 220, bw = 40 + r() * 70; s += `<rect x="${x.toFixed(0)}" y="${(y - h).toFixed(0)}" width="${bw.toFixed(0)}" height="${h.toFixed(0)}" fill="#0b1015"/>`;
    for (let j = 0; j < 4; j++) if (r() > .4) s += `<rect x="${(x + 6 + r() * (bw - 16)).toFixed(0)}" y="${(y - h + 10 + r() * (h - 20)).toFixed(0)}" width="7" height="9" fill="#d9b66a" opacity="${(.4 + r() * .5).toFixed(2)}"/>`; }
  return s;
}

// A. Река и мост (начало и финал)
function bgRiver() {
  return `${defsCommon}<rect width="1080" height="1920" fill="url(#sky)"/>${clouds(11, 80)}
  ${cityLights(1010, 9)}
  <rect y="1000" width="1080" height="920" fill="url(#river)"/>
  <g fill="#0a0e12"><rect x="-20" y="760" width="1120" height="46"/><rect x="-20" y="740" width="1120" height="10"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<rect x="${i * 96}" y="700" width="6" height="60"/>`).join('')}
    <rect x="-20" y="696" width="1120" height="8"/>
    <path d="M150 806 L120 1010 L250 1010 L220 806Z"/><path d="M830 806 L800 1010 L930 1010 L900 806Z"/>
    <path d="M220 806 Q525 920 830 806 L830 830 Q525 940 220 830Z" opacity=".8"/></g>
  ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${60 + i * 190}" cy="690" r="5" fill="#e8d9a0"/><circle cx="${60 + i * 190}" cy="690" r="40" fill="url(#lampGlow)"/>`).join('')}
  ${[...Array(18)].map((_, i) => `<path d="M${(i * 137) % 1080} ${1040 + i * 48} h${60 + (i * 53) % 140}" stroke="#2c4a52" stroke-width="3" opacity=".5"/>`).join('')}
  <path d="M0 1700 Q200 1640 420 1700 T1080 1690 V1920 H0Z" fill="#0c0f0e"/>
  <path d="M0 1760 Q300 1720 560 1770 T1080 1760 V1920 H0Z" fill="#070908"/>
  ${[...Array(9)].map((_, i) => `<path d="M${40 + i * 120} 1760 q-8 -70 -24 -110 M${50 + i * 120} 1760 q6 -60 22 -95" stroke="#1d2620" stroke-width="5" fill="none"/>`).join('')}
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// B. Завод снаружи: забор с дырой, трубы, гнущиеся деревья
function bgFactory() {
  return `${defsCommon}<rect width="1080" height="1920" fill="url(#sky)"/>${clouds(4, 60)}
  <g fill="#0c1116"><rect x="620" y="300" width="70" height="560"/><rect x="760" y="380" width="58" height="480"/><rect x="608" y="290" width="94" height="22"/><rect x="750" y="370" width="78" height="20"/></g>
  <circle cx="655" cy="330" r="6" fill="${PAL.red}"/><circle cx="655" cy="330" r="30" fill="${PAL.red}" opacity=".15"/>
  <path d="M640 290 q-40 -60 -140 -80 q-80 -10 -160 -70" stroke="#2a343c" stroke-width="40" fill="none" opacity=".45" stroke-linecap="round"/>
  <path d="M110 860 V560 L330 470 V560 L550 470 V560 L770 470 V560 L990 470 V860Z" fill="#121a21"/>
  <rect x="110" y="860" width="880" height="420" fill="#141d24"/>
  ${[...Array(5)].map((_, i) => `<rect x="${160 + i * 165}" y="680" width="110" height="130" fill="#0a0f13" stroke="#1f2a33" stroke-width="6"/><path d="M${170 + i * 165} 700 l40 60 l30 -40" stroke="#1f2a33" stroke-width="4" fill="none"/>`).join('')}
  <rect x="440" y="1000" width="220" height="280" fill="#0b1015"/><rect x="440" y="1000" width="220" height="280" fill="url(#greenGlow)" opacity=".25"/>
  <text x="550" y="960" fill="#3a4650" font-family="Inter" font-weight="900" font-size="58" text-anchor="middle" letter-spacing="8">ЗАВОД «РЕКА»</text>
  <path d="M60 1180 H1020" stroke="#4b3524" stroke-width="22"/><path d="M60 1220 H1020" stroke="#3a2a1d" stroke-width="10" opacity=".7"/>
  <g stroke="#2a3138" stroke-width="7">${[...Array(16)].map((_, i) => `<path d="M${30 + i * 68} 1260 V1680"/>`).join('')}</g>
  <g stroke="#2a3138" stroke-width="4">${[...Array(15)].map((_, i) => `<path d="M${30 + i * 68} 1300 L${98 + i * 68} 1640 M${98 + i * 68} 1300 L${30 + i * 68} 1640"/>`).join('')}</g>
  <path d="M300 1260 H980 M0 1260 H160" stroke="#3a434b" stroke-width="12"/>
  <path d="M170 1400 Q230 1360 290 1410 L300 1680 L160 1680Z" fill="#05070a"/>
  <path d="M170 1400 l-12 -10 M290 1410 l14 -12 M180 1450 l-16 4 M286 1460 l18 2" stroke="#3a434b" stroke-width="5"/>
  <rect y="1660" width="1080" height="260" fill="#0a0d10"/>
  <ellipse cx="760" cy="1760" rx="200" ry="22" fill="#1c2a30" opacity=".8"/><ellipse cx="760" cy="1760" rx="120" ry="10" fill="#2c4a52" opacity=".6"/>
  <g fill="#06080a"><path d="M40 1680 L60 1100 L80 1680Z"/><path d="M60 1150 q-80 -40 -120 -100 M60 1200 q70 -80 150 -100 M60 1300 q-60 -30 -110 -40" stroke="#06080a" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M1000 1680 L1010 1220 L1030 1680Z"/><path d="M1012 1280 q-70 -50 -100 -110 M1014 1360 q60 -40 110 -50" stroke="#06080a" stroke-width="9" fill="none" stroke-linecap="round"/></g>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// C. Цех внутри: трубы, лампа, балки под потолком
function bgWorkshop() {
  return `${defsCommon}<rect width="1080" height="1920" fill="#0a0e12"/>
  <rect y="0" width="1080" height="500" fill="#06080b"/>
  ${[0, 1, 2, 3].map(i => `<path d="M-20 ${120 + i * 110} H1100" stroke="#141b22" stroke-width="26"/>`).join('')}
  ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${i * 180} 80 L${i * 180 + 180} 520" stroke="#11171d" stroke-width="10"/>`).join('')}
  <rect x="0" y="500" width="1080" height="1000" fill="#121920"/>
  ${[...Array(6)].map((_, i) => `<rect x="${40 + i * 180}" y="580" width="120" height="260" fill="#0b1015" stroke="#1b242c" stroke-width="5"/>`).join('')}
  <g stroke-linecap="round" fill="none"><path d="M-20 900 H500 Q560 900 560 960 V1500" stroke="${PAL.rust}" stroke-width="56"/><path d="M-20 900 H500 Q560 900 560 960 V1500" stroke="${PAL.rust2}" stroke-width="10" opacity=".5" transform="translate(-14 -14)"/>
    <path d="M1100 1040 H760 Q700 1040 700 1100 V1500" stroke="#3d2a20" stroke-width="40"/>
    <path d="M200 500 V860" stroke="#2a2420" stroke-width="30"/></g>
  ${[0, 1, 2].map(i => `<rect x="${130 + i * 170}" y="880" width="18" height="40" fill="#2a1a14"/>`).join('')}
  <path d="M540 0 V300" stroke="#222" stroke-width="4"/><path d="M500 300 h80 l-20 40 h-40Z" fill="#20272d"/>
  <circle cx="540" cy="345" r="420" fill="url(#lampGlow)" opacity=".55"/><path d="M490 340 L260 1500 H820 L590 340Z" fill="#e8d9a0" opacity=".05"/>
  <rect y="1500" width="1080" height="420" fill="#0d1216"/>
  ${[...Array(8)].map((_, i) => `<path d="M0 ${1520 + i * 52} H1080" stroke="#151c22" stroke-width="3"/>`).join('')}
  <ellipse cx="300" cy="1700" rx="180" ry="26" fill="#17252b" opacity=".9"/>
  <g transform="translate(860 1500)"><rect x="-60" y="-160" width="140" height="160" fill="#1c2329"/><rect x="-60" y="-160" width="140" height="20" fill="#2a333a"/><rect x="40" y="-210" width="28" height="50" fill="#2a333a"/></g>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// D. Пультовая: насосы, пульт с лампочками, окно на огни города
function bgControl() {
  return `${defsCommon}<rect width="1080" height="1920" fill="#0b1013"/>
  <rect x="140" y="260" width="800" height="440" fill="#0a1218" stroke="#222c33" stroke-width="18"/>
  <clipPath id="win"><rect x="149" y="269" width="782" height="422"/></clipPath>
  <g clip-path="url(#win)"><rect x="140" y="260" width="800" height="440" fill="url(#sky)"/>${cityLights(700, 31)}</g>
  <path d="M540 260 V700 M140 480 H940" stroke="#222c33" stroke-width="12"/>
  <rect x="0" y="760" width="1080" height="700" fill="#121a1f"/>
  ${[0, 1, 2].map(i => `<g transform="translate(${180 + i * 360} 1080)"><rect x="-110" y="-240" width="220" height="300" rx="20" fill="#26323a"/>
     <circle cx="0" cy="-100" r="80" fill="#1a2329" stroke="#33424c" stroke-width="10"/><circle cx="0" cy="-100" r="22" fill="#33424c"/>
     <rect x="-90" y="20" width="180" height="40" fill="#1a2329"/><circle cx="70" cy="-210" r="11" fill="${PAL.reagent}"/><circle cx="70" cy="-210" r="34" fill="url(#greenGlow)"/></g>`).join('')}
  <path d="M0 860 H1080" stroke="#3d5a3a" stroke-width="22" opacity=".6"/><path d="M0 860 H1080" stroke="${PAL.reagent}" stroke-width="4" opacity=".35"/>
  <path d="M60 1300 L120 1180 H960 L1020 1300Z" fill="#1e272d"/><rect x="60" y="1300" width="960" height="180" fill="#151d22"/>
  ${[...Array(14)].map((_, i) => `<circle cx="${170 + i * 55}" cy="1230" r="9" fill="${i % 4 === 0 ? PAL.red : i % 3 === 0 ? '#d9b66a' : PAL.reagent}" opacity=".85"/>`).join('')}
  <rect y="1480" width="1080" height="440" fill="#0c1114"/>
  <ellipse cx="740" cy="1690" rx="240" ry="34" fill="#2a2416" opacity=".9"/><ellipse cx="740" cy="1690" rx="160" ry="16" fill="#5a4a2a" opacity=".5"/>
  <g transform="translate(860 1560)"><rect x="-80" y="-120" width="180" height="120" fill="#262a1d"/><rect x="-80" y="-120" width="180" height="14" fill="#3a3f2a"/><text x="10" y="-50" fill="#6b6a3a" font-family="Inter" font-weight="900" font-size="26" text-anchor="middle">ГЕН-2</text></g>
  <g transform="translate(180 1540)"><rect x="-50" y="-100" width="100" height="130" rx="6" fill="#2d2a24"/><rect x="-36" y="-84" width="72" height="56" fill="#0b0f10"/></g>
  <rect x="460" y="760" width="160" height="380" fill="#1a2227" stroke="#2c3840" stroke-width="8" opacity=".0"/>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

// E. Коллектор: бетонная труба, решётка, выход к реке
function bgCollector() {
  return `${defsCommon}<rect width="1080" height="1920" fill="#06080a"/>
  ${[0, 1, 2, 3, 4, 5].map(i => { const s = 1 - i * 0.15; return `<ellipse cx="540" cy="900" rx="${620 * s}" ry="${760 * s}" fill="${['#151b1f', '#12171b', '#0f1417', '#0c1013', '#0a0d10', '#080a0c'][i]}" stroke="#1c2428" stroke-width="${10 * s}"/>`; }).join('')}
  <ellipse cx="540" cy="900" rx="90" ry="110" fill="#1c2a30"/><ellipse cx="540" cy="920" rx="60" ry="40" fill="#2c4a52" opacity=".5"/>
  <path d="M120 1400 Q540 1560 960 1400 L960 1920 H120Z" fill="#0b1214"/>
  <path d="M200 1500 Q540 1620 880 1500" stroke="#1f3a40" stroke-width="40" fill="none" opacity=".6"/>
  <g transform="translate(540 960)"><rect x="-300" y="-420" width="600" height="840" fill="none" stroke="#3a2a22" stroke-width="22"/>
    ${[...Array(7)].map((_, i) => `<path d="M${-240 + i * 80} -420 V420" stroke="#4b3524" stroke-width="16"/>`).join('')}
    ${[-200, 0, 200].map(y => `<path d="M-300 ${y} H300" stroke="#4b3524" stroke-width="14"/>`).join('')}</g>
  <rect width="1080" height="1920" fill="url(#vignette)"/>`;
}

if (typeof module !== 'undefined') module.exports = { PAL, rng, furBlob, nikita, asya, mutant, giant, fish, propPhone, propLighter, propPass, propJournal, bgRiver, bgFactory, bgWorkshop, bgControl, bgCollector };
