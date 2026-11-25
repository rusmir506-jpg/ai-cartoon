// ---------- СЦЕНЫ СЕРИИ 2 «Мост» ----------
const SCENES = [];
const steps = (t, times, dur = .25) => times.reduce((a, tt) => a + (t > tt && t < tt + dur ? 1 - (t - tt) / dur : 0), 0);
const smokeCols = (t, x0, y0, n = 3) => { let s = ''; for (let c = 0; c < n; c++) for (let i = 0; i < 8; i++) { const ph = (t * .25 + i / 8) % 1; s += `<circle cx="${x0 + c * 70 + ph * 160 + Math.sin(t + i) * 12}" cy="${y0 - ph * 520}" r="${30 + ph * 90}" fill="#1a1f22" opacity="${(.7 * (1 - ph)).toFixed(2)}"/>`; } return s; };
function hardArm(len = 700) {
  let s = `<rect x="-42" y="0" width="84" height="${len}" rx="40" fill="${PAL.hard}"/>`;
  for (let y = 40; y < len; y += 38) s += `<path d="M-38 ${y} l38 -20 l38 20" stroke="${PAL.hardSh}" stroke-width="5" fill="none"/><path d="M-22 ${y - 12} l16 -8" stroke="${PAL.hardHi}" stroke-width="4"/>`;
  return s + `<ellipse cx="0" cy="0" rx="58" ry="50" fill="${PAL.hard}"/><path d="M-30 -20 h22 M-34 4 h22 M-30 26 h22" stroke="${PAL.hardSh}" stroke-width="5"/>`;
}
function intakeDoorway(t, inner) {
  return `<rect width="1080" height="1920" fill="#10161a"/>${[...Array(9)].map((_, i) => `<path d="M0 ${200 + i * 190} H1080" stroke="#0c1115" stroke-width="6"/>`).join('')}
    <rect x="220" y="560" width="640" height="1120" fill="#030506"/><rect x="200" y="540" width="680" height="1150" fill="none" stroke="#2a1d16" stroke-width="30"/>
    <clipPath id="dw"><rect x="220" y="560" width="640" height="1120"/></clipPath><g clip-path="url(#dw)">${inner}</g>
    <rect y="1680" width="1080" height="240" fill="#0c1013"/>`;
}

// 0. Он был больше моста... и смотрел на Асю
SCENES[0] = (t, lt, L) => {
  const tLook = W(L, 'смотрел') - .1;
  if (t < tLook) return {
    world: `${bgRiver()}${ripples(t)}<clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540, 1045 + Math.sin(t * 1.5) * 10, .82, giant({ rise: 1 }))}</g>
      <g filter="url(#sil)">${at(250, 1790, .75, nikita({ face: 'scared' }))}${at(360, 1790, .8, asya({ face: 'scared', torch: false }))}</g>`,
    cam: { s: lerp(.9, .98, seg(t, 0, tLook)), x: 540, y: 760 }, shake: 4, fx: rain(t, { op: .45, slant: .3, n: 180 }),
  };
  const look = easeOut(seg(t, W(L, 'асю') - .2, W(L, 'асю') + .4));
  return { world: `<rect width="1080" height="1920" fill="#0a1016"/>${at(540, 900, 1.05, giantHead({ look }))}`,
    cam: { s: 1 + seg(t, tLook, LEND[L]) * .1, x: 540, y: 900 + look * 60 }, fx: rain(t, { op: .4, slant: .3 }) };
};

// 1. Не нападал — принюхивался к руке
SCENES[1] = (t, lt, L) => {
  const tS = W(L, 'принюх'), down = ease(seg(t, LSTART[L], tS + .4));
  const sniff = t > tS ? Math.max(0, Math.sin((t - tS) * 9)) : 0;
  const hy = lerp(150, 520, down);
  return {
    world: `${bgRiver()}${tint('#000', .3)}${at(540, hy, .85, giantHead({ look: 1, sniff }))}
      ${at(560, 1880, 2.3, asya({ face: 'scared', hard: 1, torch: false, pose: { armL: 14 + sniff * 6, head: 6 + sniff * 4, lean: -sniff * 3 } }))}`,
    cam: { s: lerp(1.0, 1.15, seg(t, tS, LEND[L])), x: 540, y: lerp(900, 1150, seg(t, W(L, 'руке') - .4, LEND[L])) }, shake: sniff * 3,
    fx: rain(t, { op: .35, slant: .3 }) + leaves(t, { n: 5 }),
  };
};

// 2. Пока Ася рядом — не уйдёт. Насосы сгорели.
SCENES[2] = (t, lt, L) => {
  const tB = W(L, 'сгорели'), turn = easeOut(seg(t, W(L, 'насосы') - .3, W(L, 'насосы') + .2));
  return {
    world: `${bgRiver()}<ellipse cx="900" cy="980" rx="300" ry="90" fill="${PAL.fire1}" opacity="${.22 + .08 * Math.sin(t * 7)}"/>${smokeCols(t, 800, 960)}
      ${at(lerp(560, 520, turn), 2420, 2.4, nikita({ face: 'tense', pose: { head: lerp(0, 18, turn) } }))}`,
    cam: { s: 1.05 + seg(t, LSTART[L], LEND[L]) * .08, x: lerp(540, 640, turn), y: 1000 }, shake: t > tB && t < tB + .3 ? 6 : 0,
    fx: rain(t, { op: .4, slant: .3 }),
  };
};

// 3. Водозабор под мостом — бежим
SCENES[3] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L] + .2, W(L, 'пацан'))), wk = walk(t, 13, 28), wa = walk(t + .2, 15, 26);
  return {
    world: `${bgUnderBridge()}
      ${at(lerp(1150, 560, k), 1720 + wk.bob, .9, nikita({ face: 'tense', pose: Object.assign(wk, { lean: -8 }) }))}
      ${at(lerp(1300, 700, k), 1720 + wa.bob, .95, asya({ face: 'scared', hard: 1.1, torch: false, pose: Object.assign(wa, { lean: -8 }) }))}`,
    cam: { s: lerp(1, 1.3, ease(seg(t, W(L, 'водозабор') - .3, LEND[L]))), x: lerp(620, 520, k), y: lerp(1100, 1380, k) },
    fx: rain(t, { op: .3, slant: .25, n: 90 }),
  };
};

// 4. Пропуск открыл дверь
SCENES[4] = (t, lt, L) => {
  const tO = W(L, 'открыл'), card = easeOut(seg(t, LSTART[L], tO));
  const door = easeOut(seg(t, W(L, 'дверь'), W(L, 'дверь') + .7));
  return {
    world: `${bgUnderBridge({ door, led: t > tO + .1 ? 'green' : 'red' })}
      <g transform="translate(${lerp(900, 700, card)} ${lerp(1600, 1400, card)}) rotate(${lerp(25, -8, card)}) scale(.55)">${propPass()}<rect x="40" y="40" width="200" height="110" rx="50" fill="${PAL.hard}"/></g>`,
    cam: { s: 2.0, x: 560, y: 1380 }, shake: t > tO && t < tO + .2 ? 5 : 0,
    fx: rain(t, { op: .2, slant: .25, n: 60 }),
  };
};

// 5. Зажигалка — цистерна «РЕАГЕНТ. ЗАПАС»
SCENES[5] = (t, lt, L) => {
  const tR = W(L, 'реагент'), rev = ease(seg(t, W(L, 'цистерн') - .3, tR + .3));
  const fl = 1 + Math.sin(t * 23) * .04 + Math.sin(t * 7) * .05;
  const lx = 220 + 53 * 1.3 * 1.6, ly = 1900 - 600 * 1.3;
  return {
    world: `${bgIntake()}${at(220, 1900, 1.3, nikita({ face: 'tense', lighter: 'on', flame: fl }))}
      ${darkness(lerp(lx, 540, rev), lerp(ly, 700, rev), lerp(300, 900, rev) * fl, .95, 'h5')}${dust(t, { op: .4 })}`,
    cam: { s: lerp(1.3, 1.1, rev), x: lerp(380, 540, rev), y: lerp(1200, 800, rev) },
    fx: '',
  };
};

// 6. Вентиль прикипел — твёрдая рука — повернулся
SCENES[6] = (t, lt, L) => {
  const tS = W(L, 'прикипел'), tG = W(L, 'взялась'), tT = W(L, 'повернулся');
  const grab = easeOut(seg(t, tG - .3, tG + .3));
  const strain = t > tG && t < tT ? Math.sin(t * 40) * 3 : 0;
  const turn = ease(seg(t, tT - .1, tT + 1.2));
  const wh = strain + turn * 200 + (t > tS && t < tG ? Math.sin(t * 30) * 1.5 : 0);
  return {
    world: `${bgIntake({ wheel: wh })}${tint('#000', .35)}
      <g transform="translate(${lerp(-200, 300, grab)} ${lerp(1700, 1330, grab)}) rotate(35)">${hardArm()}</g>
      <circle cx="300" cy="1210" r="300" fill="${PAL.fire0}" opacity=".06"/>${dust(t, { op: .3 })}`,
    cam: { s: 2.1, x: 330, y: 1260 }, shake: Math.abs(strain) * 2 + (t > tT && t < tT + .5 ? 6 : 0),
    fx: '',
  };
};

// 7. Серое ползёт к плечу — растёт
SCENES[7] = (t, lt, L) => {
  const hard = 1 + .45 * easeOut(seg(t, LSTART[L], W(L, 'плечу') + .4)) + .2 * easeOut(seg(t, W(L, 'растёт') - .2, W(L, 'растёт') + .5));
  const fl = 1 + Math.sin(t * 21) * .05;
  return {
    world: `${bgIntake()}${tint('#000', .55)}${at(540, 1620, 3.4, asya({ face: 'scared', hard, torch: false, pose: { armL: 12, head: -4 } }))}
      <circle cx="900" cy="1300" r="${600 * fl}" fill="${PAL.fire0}" opacity=".1"/>${darkness(460, 900, 820 * fl, .85, 'h7')}`,
    cam: { s: lerp(1.05, 1.3, seg(t, LSTART[L], LEND[L])), x: lerp(540, 380, seg(t, LSTART[L], LEND[L])), y: lerp(1000, 880, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .3 }),
  };
};

// 8. Шаги над головой, запах шерсти
SCENES[8] = (t, lt, L) => {
  const tS = W(L, 'шаги'), st = [tS, tS + .55, tS + 1.1, tS + 1.65, tS + 2.2];
  const hit = steps(t, st);
  let fall = '';
  st.forEach((tt, j) => { if (t > tt) for (let i = 0; i < 14; i++) { const d = t - tt; fall += `<circle cx="${180 + hashN(i + j * 31) * 720}" cy="${180 + d * d * 900 + hashN(i * 3) * 40}" r="${2 + hashN(i) * 4}" fill="#8a8a7a" opacity="${Math.max(0, .8 - d * .5).toFixed(2)}"/>`; } });
  const look = easeOut(seg(t, tS - .2, tS + .3));
  return {
    world: `${bgIntake()}${tint('#000', .5)}${fall}
      ${at(380, 1880, 1.5, nikita({ face: 'scared', lighter: 'on', pose: { head: -look * 16 } }))}${at(760, 1880, 1.6, asya({ face: 'scared', hard: 1.65, torch: false, pose: { head: look * 10 } }))}
      ${darkness(560, 1100, 820, .9, 'h8')}`,
    cam: { s: 1.1, x: 560, y: lerp(1250, 900, ease(seg(t, W(L, 'запах') - .2, LEND[L]))) }, shake: hit * 12,
    fx: dust(t, { op: .3 }),
  };
};

// 9. Тварь в дверях — красный шнурок — как у Аси
SCENES[9] = (t, lt, L) => {
  const tA = W(L, 'как'), tL = W(L, 'шнурок');
  if (t > tA - .1) {
    return { world: `<rect width="1080" height="1920" fill="#0b0f12"/><path d="M400 0 L470 840 M680 0 L610 840" stroke="#c23a2e" stroke-width="12"/>${at(540, 960, 2.4, propPass())}${darkness(540, 960, 800, .7, 'h9b')}`,
      cam: { s: 1 + seg(t, tA, LEND[L]) * .1, x: 540, y: 960 }, fx: '' };
  }
  const come = easeOut(seg(t, LSTART[L], LSTART[L] + 1.4));
  const z = ease(seg(t, tL - .4, tL + .4));
  return {
    world: intakeDoorway(t, `${at(lerp(1250, 820, come), 1670, 1.6, mutant({ lanyard: true, mouth: .2, pose: { head: Math.sin(t * 2) * 4 } }))}`),
    cam: { s: lerp(1.1, 2.4, z), x: lerp(540, lerp(1250, 820, come) - 185 * 1.6, z), y: lerp(1150, 1670 - 200 * 1.6, z) }, shake: 3,
    fx: dust(t, { op: .3 }),
  };
};

// 10. Доза по весу — открыл всё
SCENES[10] = (t, lt, L) => {
  const tE = W(L, 'этот') - .1, tO = W(L, 'открыл');
  if (t < tE) return { world: `${bgIntake()}${tint('#000', .55)}${at(540, 2500, 3.2, nikita({ face: 'tense', lighter: 'on', pose: { head: Math.sin(t * 2) * 2 } }))}${darkness(540, 1000, 700, .85, 'h10')}`,
    cam: { s: 1 + seg(t, LSTART[L], tE) * .1, x: 540, y: 960 }, fx: dust(t, { op: .3 }) };
  const lv = [0, .3, .6].map(d => easeOut(seg(t, tO + d, tO + d + .25)));
  const g = lv.map((v, i) => .2 + .75 * easeOut(seg(t, tO + .3 + i * .3, tO + 1.2 + i * .3)) + Math.sin(t * 30 + i) * .02 * v);
  return {
    world: `${bgIntake({ levers: lv, gauges: g, flow: t > tO ? (t - tO) : 0 })}${tint('#000', .25)}`,
    cam: { s: lerp(1.6, 2.0, seg(t, tE, LEND[L])), x: 810, y: 1380 }, shake: steps(t, [tO, tO + .3, tO + .6]) * 9,
    fx: dust(t, { op: .3 }),
  };
};

// 11. Зелёное ушло в реку — гигант оседает
SCENES[11] = (t, lt, L) => {
  const tJ = W(L, 'дёрнулся'), tD = W(L, 'оседать');
  const sink = ease(seg(t, tD - .3, LEND[L] + .3)), jolt = t > tJ && t < tJ + .35 ? Math.sin((t - tJ) * 60) * 30 : 0;
  const plume = seg(t, LSTART[L], tJ + 1);
  let pl = '';
  for (let i = 0; i < 18; i++) { const r = plume * (120 + hashN(i) * 380); pl += `<ellipse cx="${200 + hashN(i * 3) * 700 + Math.sin(t + i) * 20}" cy="${1150 + hashN(i * 5) * 600}" rx="${r.toFixed(0)}" ry="${(r * .25).toFixed(0)}" fill="${PAL.reagent}" opacity=".13"/>`; }
  return {
    world: `${bgRiver()}${ripples(t)}${pl}<clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540 + jolt, 1045 + sink * 1100, .82, giant({ rise: 1, eyes: 1 - sink * .9 }))}</g>${pl}`,
    cam: { s: lerp(1.0, 1.1, seg(t, LSTART[L], LEND[L])), x: 540, y: lerp(850, 1050, sink) }, shake: Math.abs(jolt) * .4 + (t < tD + 2 ? 4 * sink : 0),
    fx: rain(t, { op: .4, slant: .3 }),
  };
};

// 12. Зелёный туман — тварь зашаталась
SCENES[12] = (t, lt, L) => {
  const mist = seg(t, LSTART[L], W(L, 'двери') + .5), sway = seg(t, W(L, 'зашат') - .2, W(L, 'зашат') + .3);
  return {
    world: intakeDoorway(t, `${at(800, 1670, 1.6, mutant({ lanyard: true, mouth: .5, eyes: 1 - sway * .3, pose: { body: Math.sin(t * 3) * 9 * sway, head: Math.sin(t * 2.3) * 10 * sway, fl: sway * 10 } }))}`)
      + greenMist(t, .4 + mist * 1.2, { y0: 600, y1: 1900 }),
    cam: { s: 1.2, x: 560, y: 1250 }, shake: 2,
    fx: greenMist(t + 7, .3 * mist, { y0: 0, y1: 1900 }),
  };
};

// 13. Ася шагнула... «Мама?»
SCENES[13] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L], W(L, 'мама'))), wk = walk(t, 6, 14 * (1 - k)), zoom = ease(seg(t, W(L, 'мама') - .3, LEND[L]));
  return {
    world: `${bgIntake()}${tint('#000', .45)}${greenMist(t, 1.2, { y0: 800, y1: 1900 })}
      ${at(900, 1800, 1.3, mutant({ lanyard: true, mouth: .1, eyes: .7, pose: { head: 14, body: 4 } }), 'transform-origin="0 0"')}
      ${at(lerp(260, 470, k), 1800 + wk.bob, 1.6, asya({ face: 'calm', hard: 1.85, torch: false, pose: Object.assign(wk, { armR: lerp(-14, -70, k) }) }))}`,
    cam: { s: lerp(1.05, 1.9, zoom), x: lerp(560, lerp(260, 470, k), zoom), y: lerp(1300, 1400, zoom) },
    fx: greenMist(t + 3, .3, { y0: 0, y1: 1900 }),
  };
};

// 14. Тварь легла у её ног и уснула
SCENES[14] = (t, lt, L) => {
  const lie = ease(seg(t, W(L, 'легла') - .2, W(L, 'легла') + .9)), sleep = seg(t, W(L, 'уснула') - .1, W(L, 'уснула') + .6);
  return {
    world: `${bgIntake()}${tint('#000', .45)}${greenMist(t, 1, { y0: 900, y1: 1900 })}
      <g transform="translate(820 ${1800 + lie * 90}) rotate(${-lie * 6}) scale(1.3 ${1.3 - lie * .35})">${mutant({ lanyard: true, mouth: 0, eyes: 1 - sleep, pose: { fl: lie * 60, fr: lie * 60, bl: -lie * 50, br: -lie * 50, head: lie * 20 } })}</g>
      ${at(380, 1800, 1.6, asya({ face: 'calm', hard: 1.9, torch: false, pose: { armR: -60, head: 12 } }))}`,
    cam: { s: lerp(1.2, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(560, 700, sleep), y: lerp(1450, 1600, sleep) },
    fx: greenMist(t + 5, .25, { y0: 0, y1: 1900 }),
  };
};

// 15. Серое остановилось у самой шеи
SCENES[15] = (t, lt, L) => {
  const tSt = W(L, 'остановилось'), hard = lerp(1.9, 2, easeOut(seg(t, LSTART[L], tSt))) + (t < tSt ? Math.sin(t * 12) * .02 : 0);
  return {
    world: `${bgIntake()}${tint('#000', .55)}${greenMist(t, .8, { y0: 600, y1: 1900 })}${at(540, 1620, 3.4, asya({ face: 'calm', hard, torch: false, pose: { head: -6 } }))}`,
    cam: { s: lerp(1.3, 1.9, ease(seg(t, LSTART[L], LEND[L]))), x: lerp(480, 470, seg(t, LSTART[L], LEND[L])), y: lerp(900, 780, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .3, color: '#c8ff9e' }),
  };
};

// 16. Телефон: «Образец № 417 нашёлся. Приходите один»
SCENES[16] = (t, lt, L) => {
  const tV = W(L, 'завибрировал'), tA = W(L, 'образец') - .1, tB = W(L, 'один', 0, true);
  const vib = t > tV && t < tA + .3 ? Math.sin(t * 90) * 5 : 0;
  return {
    world: `<rect width="1080" height="1920" fill="#040506"/><g transform="rotate(${vib} 540 960)">${at(540, 960, 1.25, phoneSMS(seg(t, tA, tB), 0))}</g>
      <circle cx="540" cy="900" r="700" fill="#5f8fa8" opacity=".06"/>`,
    cam: { s: lerp(1.0, 1.12, seg(t, LSTART[L], LEND[L])), x: 540, y: 900 }, shake: Math.abs(vib),
    fx: '',
  };
};

// 17. Подпись научного руководителя
SCENES[17] = (t, lt, L) => {
  const sign = seg(t, W(L, 'подпись') - .1, W(L, 'подпись') + .5), z = ease(seg(t, W(L, 'подпись'), W(L, 'руковод') + .8));
  return {
    world: `<rect width="1080" height="1920" fill="#040506"/>${at(540, 960, 1.25, phoneSMS(1, sign))}`,
    cam: { s: lerp(1.12, 2.4, z), x: lerp(540, 540 - 30, z), y: lerp(900, 960 + 1.25 * 0, z) },
    fx: '',
  };
};

const KEY = {
  '#c8ff6e': ['моста', 'смотрел', 'принюх', 'реагент', 'запас', 'туман', 'зелён', 'шерсти', 'уснула', 'тварь', 'гигант'],
  '#ff6a55': ['твёрд', 'сгорели', 'прикипел', 'серое', 'плечу', 'растёт', 'шеи', 'шнурок', 'руководит', 'один', 'нашёлся', 'весу'],
  '#ffa23c': ['зажигалка', 'водозабор', 'открыл', 'вентиль'],
  '#f2c15a': ['асю', 'ася', 'аси', 'мама', 'пропуск', 'дверь', 'подпись'],
};
const EP_LABEL = 'серия 2 · «Мост»';
