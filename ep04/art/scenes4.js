// ---------- СЦЕНЫ СЕРИИ 4 «Колыбельная» ----------
const SCENES = [];
const dusk = (k = .35) => `<rect x="-500" y="-500" width="2080" height="2920" fill="#0a0d1a" opacity="${k}"/>`;
const momLying = (x, y, lie, sleep, s = 1) => `<g transform="translate(${x} ${y + lie * 60 * s}) rotate(${lie * 6}) scale(${-s} ${s - lie * .3 * s})">${mutant({ lanyard: true, mouth: 0, eyes: 1 - sleep, pose: { fl: lie * 60, fr: lie * 60, bl: -lie * 50, br: -lie * 50, head: lie * 20 } })}</g>`;

// 0. Ася больше не моргала — река зовёт её по имени
SCENES[0] = (t, lt, L) => {
  const call = .4 + .6 * seg(t, W(L, 'река') - .3, W(L, 'имени') + .3);
  const turn = easeOut(seg(t, W(L, 'имени') - .2, W(L, 'имени') + .4));
  return {
    world: `${bgCourtyard()}${dusk(.4)}<g transform="translate(-120 900)">${soundRings(t, call, { max: 900, speed: .6 })}</g>
      ${at(560, 2120, 4.2, asya({ face: 'calm', hard: 2.2, torch: false, green: 1, pose: { head: lerp(0, -14, turn) } }))}`,
    cam: { s: lerp(1.0, 1.25, seg(t, LSTART[L], LEND[L])), x: 540, y: lerp(980, 920, seg(t, LSTART[L], LEND[L])) },
    fx: dust(t, { op: .2, wind: 30 }),
  };
};

// 1. Ветер стих — скоро стемнеет — проснутся все
SCENES[1] = (t, lt, L) => {
  const dark = seg(t, LSTART[L], LEND[L]), wake = t > W(L, 'проснутся') ? Math.max(0, 1 - (t - W(L, 'проснутся') - .5) / .6) : 0;
  let fall = '';
  for (let i = 0; i < 10; i++) { const ph = clampN((t - LSTART[L]) / 3 - hashN(i) * .4); fall += `<g transform="translate(${100 + hashN(i * 3) * 880 + Math.sin(t * 2 + i) * 30 * (1 - ph)} ${200 + ph * 1500}) rotate(${i * 40 + t * 60 * (1 - ph)})"><path d="M-14 0 Q0 -10 14 0 Q0 10 -14 0Z" fill="#5a3a1c"/></g>`; }
  return {
    world: `${bgRiver()}${ripples(t, { n: 8 })}${dusk(.2 + .4 * dark)}${waterEyes(t, wake * .5)}${fall}`,
    cam: { s: lerp(1.0, 1.1, dark), x: 540, y: 1000 },
    fx: '',
  };
};

// 2. Последняя пробирка
SCENES[2] = (t, lt, L) => {
  const up = easeOut(seg(t, LSTART[L], W(L, 'пробирка') + .3)), pulse = t > W(L, 'профессор') ? .5 + .5 * Math.sin(t * 6) : 0;
  return {
    world: `<rect width="1080" height="1920" fill="#06080b"/><circle cx="540" cy="960" r="${500 + pulse * 80}" fill="${PAL.reagent}" opacity="${.05 + pulse * .05}"/>
      <g transform="translate(540 ${lerp(1900, 1100, up)})">${handHold()}<g transform="translate(0 -230) scale(.9)">${vialBig(1)}</g></g>`,
    cam: { s: lerp(1.0, 1.15, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
    fx: dust(t, { op: .25, color: '#c8ff9e' }),
  };
};

// 3. Выбор: Асе или в реку
SCENES[3] = (t, lt, L) => {
  const toA = ease(seg(t, W(L, 'асе') - .2, W(L, 'асе') + .4)), toR = ease(seg(t, W(L, 'реку') - .2, W(L, 'реку') + .4));
  const vx = 540 - toA * 200 + toR * 400;
  return {
    world: `<clipPath id="lh"><rect x="-500" y="-500" width="1040" height="2920"/></clipPath><clipPath id="rh"><rect x="540" y="-500" width="1500" height="2920"/></clipPath>
      <g clip-path="url(#lh)">${bgCourtyard()}${dusk(.5)}${at(300, 2150, 4, asya({ face: 'calm', hard: 2.25, torch: false, green: 1, pose: { head: -6 } }))}</g>
      <g clip-path="url(#rh)">${bgRiver()}${dusk(.3)}${ripples(t)}</g>
      <path d="M540 0 V1920" stroke="#000" stroke-width="10"/>
      <g transform="translate(${vx} 1000) scale(.8)"><circle r="200" fill="${PAL.reagent}" opacity=".08"/>${vialBig(1)}</g>`,
    cam: { s: 1.0, x: 540, y: 960 },
    fx: '',
  };
};

// 4. «Мама зовёт» — к мосту
SCENES[4] = (t, lt, L) => {
  const k = ease(seg(t, W(L, 'повела') - .3, LEND[L])), wa = walk(t, 9, 20), wn = walk(t + .3, 8, 18);
  return {
    world: `${bgUnderBridge({ door: 1 })}${dusk(.35)}
      ${at(lerp(1000, 520, k), 1740 + wa.bob, .95, asya({ face: 'calm', hard: 2.25, torch: false, green: 1, pose: Object.assign(wa, { armR: -40 }) }))}
      ${at(lerp(1200, 700, k), 1740 + wn.bob, .9, nikita({ face: 'tense', pose: wn }))}`,
    cam: { s: lerp(1.05, 1.3, k), x: lerp(700, 520, k), y: lerp(1250, 1400, k) },
    fx: rain(t, { op: .12, slant: .1, n: 40 }),
  };
};

// 5. В водозаборе пусто — клочья шерсти
SCENES[5] = (t, lt, L) => {
  const pan = ease(seg(t, W(L, 'клочья') - .4, W(L, 'шерсти') + .5)), fl = 1 + Math.sin(t * 21) * .05;
  return {
    world: `${bgIntake()}${furTufts()}${darkness(lerp(600, 500, pan), lerp(1100, 1700, pan), 700 * fl, .92, 'h5')}`,
    cam: { s: lerp(1.1, 1.6, pan), x: lerp(560, 520, pan), y: lerp(1100, 1700, pan) },
    fx: dust(t, { op: .3 }),
  };
};

// 6. Мост скрипит — глаза открываются, десятки
SCENES[6] = (t, lt, L) => {
  const k = seg(t, W(L, 'открывались') - .2, W(L, 'десятки') + .4), cr = t > W(L, 'заскрип') && t < W(L, 'заскрип') + .6;
  return {
    world: `${bgRiver()}${ripples(t)}${dusk(.45)}${waterEyes(t, k)}`,
    cam: { s: lerp(1.0, 1.2, k), x: 540, y: lerp(900, 1300, ease(k)) }, shake: cr ? 7 : 2,
    fx: '',
  };
};

// 7. Зажигалка — огонь их больше не пугал
SCENES[7] = (t, lt, L) => {
  const near = ease(seg(t, W(L, 'пугал') - .3, LEND[L] + .3)), fl = 1 + Math.sin(t * 23) * .05;
  return {
    world: `${bgRiver()}${dusk(.5)}<g transform="translate(540 ${lerp(0, 260, near)}) scale(${lerp(1, 1.35, near)}) translate(-540 0)">${waterEyes(t, 1)}</g>
      ${at(330, 1900, 1.1, nikita({ face: 'scared', lighter: t > W(L, 'щёлкнул') ? 'on' : 'off', flame: fl }))}${at(520, 1900, 1.15, asya({ face: 'calm', hard: 2.25, torch: false, green: 1 }))}`,
    cam: { s: 1.1, x: 540, y: 1350 }, shake: near * 3,
    fx: '',
  };
};

// 8. Из темноты вышла мама — встала между нами и рекой
SCENES[8] = (t, lt, L) => {
  const come = easeOut(seg(t, LSTART[L], W(L, 'встала') + .3));
  return {
    world: `${bgRiver()}${dusk(.5)}${waterEyes(t, 1)}
      ${at(170, 1900, 1.0, nikita({ face: 'scared', lighter: 'on' }))}${at(330, 1900, 1.05, asya({ face: 'calm', hard: 2.25, torch: false, green: 1 }))}
      <g transform="translate(${lerp(-400, 720, come)} 1880) scale(-1 1)">${mutant({ lanyard: true, mouth: .6, pose: { head: Math.sin(t * 2) * 5 } })}</g>`,
    cam: { s: 1.05, x: 520, y: 1400 }, shake: come < 1 ? 3 : 1,
    fx: '',
  };
};

// 9. Ася запела колыбельную
SCENES[9] = (t, lt, L) => {
  const sing = seg(t, W(L, 'запела') - .1, W(L, 'запела') + .5);
  return {
    world: `${bgRiver()}${dusk(.55)}${at(540, 2120, 4.2, asya({ face: sing > 0 ? 'sing' : 'calm', hard: lerp(2.25, 2.4, seg(t, LSTART[L], LEND[L])), torch: false, green: 1 - sing }))}
      <g transform="translate(540 1100)">${soundRings(t, sing, { max: 900, speed: .5 })}</g>`,
    cam: { s: lerp(1.0, 1.2, seg(t, LSTART[L], LEND[L])), x: 540, y: 1000 },
    fx: dust(t, { op: .2, color: '#c8ff9e', wind: 10 }),
  };
};

// 10. Мама легла. Глаза в воде гасли один за другим
SCENES[10] = (t, lt, L) => {
  const lie = ease(seg(t, W(L, 'легла') - .2, W(L, 'легла') + .9)), off = seg(t, W(L, 'гасли') - .2, LEND[L] + .2);
  return {
    world: `${bgRiver()}${dusk(.5)}${waterEyes(t, 1, off)}
      ${momLying(720, 1880, lie, lie, 1)}${at(330, 1900, 1.05, asya({ face: 'sing', hard: 2.45, torch: false }))}<g transform="translate(330 1645)">${soundRings(t, .6, { max: 700, speed: .5 })}</g>`,
    cam: { s: lerp(1.05, 1.2, off), x: lerp(520, 600, off), y: lerp(1400, 1300, off) },
    fx: '',
  };
};

// 11. Не кровь. Голос.
SCENES[11] = (t, lt, L) => {
  const g = seg(t, W(L, 'голос') - .2, W(L, 'голос') + .5);
  return {
    world: `${bgRiver()}${dusk(.6)}${at(540, 2500, 3.2, nikita({ face: 'tense', pose: { head: Math.sin(t * 2) * 2 } }))}
      <g transform="translate(1180 900)">${soundRings(t, .25 + g * .7, { max: 1300, speed: .5 })}</g>`,
    cam: { s: 1 + seg(t, LSTART[L], LEND[L]) * .1 + g * .1, x: 540, y: 960 },
    fx: '',
  };
};

// 12. С каждой строчкой серое ползло по щеке
SCENES[12] = (t, lt, L) => {
  const hard = lerp(2.45, 2.85, ease(seg(t, W(L, 'строчк') - .2, W(L, 'щеке') + .5)));
  return {
    world: `${bgRiver()}${dusk(.6)}${at(560, 2300, 5.2, asya({ face: 'sing', hard, torch: false }))}<g transform="translate(560 1040)">${soundRings(t, .4, { max: 700, speed: .5 })}</g>`,
    cam: { s: lerp(1.1, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(500, 430, seg(t, LSTART[L], LEND[L])), y: lerp(1000, 1060, seg(t, LSTART[L], LEND[L])) },
    fx: '',
  };
};

// 13. Протянул пробирку — покачала головой — вылила в реку
SCENES[13] = (t, lt, L) => {
  const give = easeOut(seg(t, LSTART[L], W(L, 'пробирк') + .3)), shake = t > W(L, 'покачала') && t < W(L, 'покачала') + 1 ? Math.sin((t - W(L, 'покачала')) * 14) * 14 : 0;
  const pour = ease(seg(t, W(L, 'вылила') - .2, W(L, 'вылила') + .6)), flow = seg(t, W(L, 'вылила') + .3, LEND[L]);
  const vx = lerp(1000, 700, give), vy = 1250;
  let stream = '';
  if (flow > 0) { stream = `<path d="M${vx + 120} ${vy - 40} Q${vx + 170} ${vy + 120} ${vx + 150} 1700" stroke="${PAL.reagent}" stroke-width="16" fill="none" opacity="${.8 * (1 - seg(t, LEND[L] - .6, LEND[L]))}" stroke-dasharray="40 20" stroke-dashoffset="${(-t * 400).toFixed(0)}"/>`;
    for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i / 4) % 1; stream += `<ellipse cx="${vx + 150}" cy="1700" rx="${20 + ph * 220}" ry="${6 + ph * 40}" fill="none" stroke="${PAL.reagent}" stroke-width="4" opacity="${(1 - ph) * .7 * flow}"/>`; } }
  return {
    world: `${bgRiver()}${dusk(.55)}${ripples(t)}
      ${at(330, 2080, 2.2, asya({ face: 'calm', hard: 2.85, torch: false, green: .9, pose: { head: shake, armR: lerp(-14, -100, seg(t, W(L, 'вылила') - .6, W(L, 'вылила'))) } }))}
      <g transform="translate(${vx} ${vy}) scale(.7)">${vialBig(1 - pour * .9, pour * 115)}</g>${stream}`,
    cam: { s: 1.05, x: 560, y: 1250 },
    fx: '',
  };
};

// 14. «Чтобы мне не пришлось петь каждую ночь»
SCENES[14] = (t, lt, L) => ({
  world: `${bgRiver()}${dusk(.6)}${at(540, 2120, 4.2, asya({ face: 'calm', hard: 2.85, torch: false, green: .85, pose: { head: 6 + Math.sin(t) * 2 } }))}`,
  cam: { s: lerp(1.05, 1.3, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
  fx: dust(t, { op: .15, wind: 5 }),
});

// 15. Гигант лёг на дно. Река затихла.
SCENES[15] = (t, lt, L) => {
  const sink = ease(seg(t, LSTART[L], W(L, 'дно') + .8)), calm = seg(t, W(L, 'затихла') - .2, LEND[L]);
  return {
    world: `${bgRiver()}${dusk(.45)}${calm < 1 ? ripples(t, { n: Math.round(22 * (1 - calm)) }) : ''}
      <clipPath id="aw"><rect x="-500" y="-1000" width="2080" height="2045"/></clipPath>
      <g clip-path="url(#aw)">${at(540, 1045 + 300 + sink * 1000, .82, giant({ rise: .5, eyes: .3 * (1 - sink) }))}</g>`,
    cam: { s: lerp(1.0, 1.1, calm), x: 540, y: lerp(1000, 1050, calm) }, shake: (1 - sink) * 3,
    fx: '',
  };
};

// 16. На мосту остановились три машины без номеров
SCENES[16] = (t, lt, L) => {
  const arrive = easeOut(seg(t, LSTART[L], W(L, 'остановились') + .5));
  const cars = [330, 560, 790].map((x, i) => `<g transform="translate(${lerp(1400 + i * 260, x, arrive)} 752) scale(.5)">${car(1)}</g>`).join('');
  return {
    world: `${bgRiver()}${dusk(.45)}${ripples(t, { n: 6 })}${cars}`,
    cam: { s: lerp(1.2, 1.8, ease(seg(t, W(L, 'машины') - .3, LEND[L]))), x: lerp(540, 600, arrive), y: lerp(900, 760, arrive) }, shake: arrive < 1 ? 2 : 0,
    fx: '',
  };
};

// 17. Из первой вышел Вершинин и улыбнулся
SCENES[17] = (t, lt, L) => {
  const out = easeOut(seg(t, LSTART[L], W(L, 'вышел') + .6)), smile = ease(seg(t, W(L, 'улыбнулся') - .2, W(L, 'улыбнулся') + .6));
  return {
    world: `<rect width="1080" height="1920" fill="#05070a"/><circle cx="820" cy="760" r="900" fill="#fff6d0" opacity=".14"/><circle cx="820" cy="760" r="300" fill="#fff6d0" opacity=".22"/>
      <g transform="translate(${lerp(980, 540, out)} 2200) scale(2.6)">${professor({ face: 'calm' })}</g>
      <rect x="-500" y="-500" width="2080" height="2920" fill="#000" opacity="${.15 * (1 - smile)}"/>`,
    cam: { s: lerp(1.0, 1.6, smile), x: 540, y: lerp(960, 1150, smile) },
    fx: '',
  };
};

const KEY = {
  '#c8ff6e': ['река', 'реку', 'зовёт', 'проснутся', 'глаза', 'гасли', 'голос', 'запела', 'колыбельн', 'петь', 'гигант', 'шерсти'],
  '#ff6a55': ['серое', 'щеке', 'кровь', 'доза', 'машины', 'номеров', 'улыбнулся', 'пусто'],
  '#ffa23c': ['зажигалк', 'огонь', 'щёлкнул'],
  '#f2c15a': ['ася', 'асе', 'мама', 'пробирк', 'вершинин', 'профессор'],
};
const EP_LABEL = 'серия 4 · «Колыбельная»';
