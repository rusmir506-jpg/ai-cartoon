// ---------- СЦЕНЫ СЕРИИ 3 «Кафедра» ----------
const SCENES = [];
const steps = (t, times, dur = .25) => times.reduce((a, tt) => a + (t > tt && t < tt + dur ? 1 - (t - tt) / dur : 0), 0);
const alarm = (t, t0) => t > t0 ? (Math.sin((t - t0) * 9) > 0 ? .22 : .05) : 0;
const sprinkler = (t, t0) => t > t0 ? rain(t, { n: 140, slant: .02, speed: 2200, op: .45 * seg(t, t0, t0 + .6), color: '#cfe0e6' }) : '';

// 0. Профессор Вершинин учил нас…
SCENES[0] = (t, lt, L) => {
  const z = ease(seg(t, W(L, 'вершинин') - .3, W(L, 'врать')));
  const lie = t > W(L, 'врал') ? flicker(t, 4, 16) : 1;
  return {
    world: `${bgDept()}${tint('#000', .5 - lie * .35)}${dust(t, { op: .3 })}`,
    cam: { s: lerp(1.05, 2.7, z), x: 540, y: lerp(900, 720, z) }, shake: t > W(L, 'врал') && t < W(L, 'врал') + .3 ? 5 : 0,
    fx: '',
  };
};

// 1. Реагент выветрился — серое ползёт по шее
SCENES[1] = (t, lt, L) => {
  const hard = lerp(1.55, 2, easeOut(seg(t, W(L, 'серое') - .2, W(L, 'поползло') + .6)));
  return {
    world: `${bgCourtyard()}${tint('#000', .35)}${at(540, 1640, 3.6, asya({ face: 'scared', hard, torch: false, pose: { head: 6 + Math.sin(t * 2) * 2 } }))}`,
    cam: { s: lerp(1.1, 1.5, seg(t, LSTART[L], LEND[L])), x: lerp(520, 470, seg(t, W(L, 'серое'), LEND[L])), y: lerp(900, 780, seg(t, W(L, 'серое'), LEND[L])) },
    fx: leaves(t, { n: 8 }) + dust(t, { op: .25, wind: 120 }),
  };
};

// 2. Пошёл к нему — Асю не бросил
SCENES[2] = (t, lt, L) => {
  const k = ease(seg(t, LSTART[L], W(L, 'бросил'))), wk = walk(t, 8, 20 * (1 - seg(t, W(L, 'бросил') - .3, W(L, 'бросил')))), wa = walk(t + .3, 10, 18);
  const look = easeOut(seg(t, W(L, 'одного') - .1, W(L, 'одного') + .3));
  return {
    world: `${bgMedFac()}
      ${at(lerp(900, 470, k), lerp(1900, 1700, k) + wk.bob, lerp(1.1, .75, k), nikita({ face: 'tense', pose: Object.assign(wk, { head: look * 14, armL: -30 * look }) }))}
      ${at(lerp(1050, 610, k), lerp(1900, 1700, k) + wa.bob, lerp(1.2, .85, k), asya({ face: 'calm', hard: 2, torch: false, pose: Object.assign(wa, { armR: -14 }) }))}`,
    cam: { s: lerp(1.1, 1.3, k), x: lerp(640, 540, k), y: lerp(1200, 1400, k) },
    fx: leaves(t, { n: 10 }) + rain(t, { op: .2, slant: .45, n: 70 }),
  };
};

// 3. Через анатомичку — в подвал
SCENES[3] = (t, lt, L) => {
  const k = seg(t, LSTART[L], LEND[L]), fl = flicker(t, 9, 14);
  const st = [0, .5, 1, 1.5, 2, 2.5, 3].map(d => LSTART[L] + .2 + d);
  return {
    world: `${bgCorridor()}${tint('#000', .55 - fl * .35)}
      <g filter="url(#sil)">${at(500, lerp(1920, 1350, k), lerp(1.2, .5, k), nikita({ face: 'calm', pose: walk(t, 8, 16) }))}${at(600, lerp(1920, 1350, k), lerp(1.25, .52, k), asya({ face: 'calm', torch: false, pose: walk(t + .3, 9, 14) }))}</g>`,
    cam: { s: lerp(1.0, 1.5, ease(k)), x: 540, y: lerp(1100, 1000, k) }, shake: steps(t, st, .15) * 4,
    fx: dust(t, { op: .25 }),
  };
};

// 4. Знак завода «Река». Пропуск открыл
SCENES[4] = (t, lt, L) => {
  const tP = W(L, 'пропуск'), tO = W(L, 'открыл'), card = easeOut(seg(t, tP - .3, tO));
  const toReader = ease(seg(t, tP - .5, tP + .2));
  return {
    world: `${bgBasementDoor({ lines: ['', ''], on: t > tO + .1 ? 1 : 0 })}
      <g transform="translate(${lerp(1200, 900, card)} ${lerp(1500, 1120, card)}) rotate(${lerp(25, -8, card)}) scale(.7)">${propPass()}<rect x="40" y="40" width="200" height="110" rx="50" fill="${PAL.skin}"/></g>`,
    cam: { s: lerp(2.2, 1.9, toReader), x: lerp(470, 860, toReader), y: lerp(780, 1080, toReader) }, shake: t > tO && t < tO + .2 ? 6 : 0,
    fx: dust(t, { op: .25 }),
  };
};

// 5. Табло: «Орлов. Доступ: донор»
SCENES[5] = (t, lt, L) => {
  const tO = W(L, 'орлов'), tD = W(L, 'доступ'), tN = W(L, 'донор');
  const l1 = 'ОРЛОВ'.slice(0, Math.round(5 * seg(t, tO, tO + .35)));
  const full = 'ДОСТУП: ДОНОР', l2 = full.slice(0, Math.round(full.length * seg(t, tD, tN + .4)));
  const blink = t > tN + .4 ? (Math.sin(t * 10) > 0 ? 1 : .35) : 1;
  return {
    world: `${bgBasementDoor({ lines: [l1, l2], on: blink })}`,
    cam: { s: lerp(2.3, 2.8, seg(t, LSTART[L], LEND[L])), x: 540, y: 310 },
    fx: '',
  };
};

// 6. Аквариумы — каждая рыба смотрела на нас
SCENES[6] = (t, lt, L) => {
  const look = easeOut(seg(t, W(L, 'смотрела') - .2, W(L, 'смотрела') + .4));
  return {
    world: `${bgLab(t, { look: -look })}`,
    cam: { s: lerp(1.6, 2.0, seg(t, LSTART[L], LEND[L])), x: 340, y: 600 },
    fx: dust(t, { op: .25, color: '#9ec4a0' }),
  };
};

// 7. Профессор ждал — посмотрел на шею Аси
SCENES[7] = (t, lt, L) => {
  const look = easeOut(seg(t, W(L, 'посмотрел') - .1, W(L, 'посмотрел') + .4));
  return {
    world: `${bgLab(t)}${tint('#000', .25)}
      ${at(560, 1720, 1.3, professor({ face: 'cold', pose: { head: look * -12, armR: -20 } }))}
      <g filter="url(#sil)">${at(170, 2050, 1.6, nikita({ face: 'calm' }))}${at(340, 2050, 1.7, asya({ face: 'calm', torch: false }))}</g>`,
    cam: { s: lerp(1.05, 1.35, seg(t, LSTART[L], LEND[L])), x: lerp(540, 460, look), y: lerp(1200, 1150, look) },
    fx: dust(t, { op: .25 }),
  };
};

// 8. «Реагент кончается. Делают из одного человека»
SCENES[8] = (t, lt, L) => {
  const fin = easeOut(seg(t, W(L, 'одного') - .2, W(L, 'одного') + .3));
  return {
    world: `${bgLab(t)}${tint('#000', .45)}${at(540, 2400, 2.7, professor({ face: 'cold', pose: { armR: lerp(-6, -150, fin), head: Math.sin(t) * 2 } }))}`,
    cam: { s: lerp(1, 1.12, seg(t, LSTART[L], LEND[L])), x: 540, y: 960 },
    fx: dust(t, { op: .25 }),
  };
};

// 9. Отдёрнул штору — мужчина в баке
SCENES[9] = (t, lt, L) => {
  const cur = ease(seg(t, W(L, 'отдёрнул') - .1, W(L, 'штору') + .4)), z = ease(seg(t, W(L, 'мужчина') - .3, W(L, 'глаз') + .3));
  return {
    world: `${bgLab(t, { curtain: cur })}${tint('#000', .2)}`,
    cam: { s: lerp(1.05, 2.2, z), x: lerp(620, 800, z), y: lerp(1000, 900, z) }, shake: t > W(L, 'отдёрнул') && t < W(L, 'отдёрнул') + .3 ? 5 : 0,
    fx: '',
  };
};

// 10. Ася прижалась к стеклу — «Папа»
SCENES[10] = (t, lt, L) => {
  const press = easeOut(seg(t, LSTART[L], W(L, 'прижалась') + .5)), z = ease(seg(t, W(L, 'папа') - .3, LEND[L]));
  return {
    world: `<rect width="1080" height="1920" fill="#0b1012"/>${at(720, 1000, 1.35, fatherInTank(t))}
      ${at(lerp(80, 250, press), 2000, 2.3, asya({ face: 'calm', hard: 2, torch: false, pose: { armR: lerp(-14, -95, press), head: -10 } }))}
      <circle cx="${lerp(380, 470, press)}" cy="${lerp(1300, 1170, press)}" r="20" fill="#fff" opacity="${.12 * press}"/>`,
    cam: { s: lerp(1.05, 1.5, z), x: lerp(560, 520, z), y: lerp(1000, 900, z) },
    fx: dust(t, { op: .25, color: '#9ec4a0' }),
  };
};

// 11. «Его кровь держит их во сне… Потом — она»
SCENES[11] = (t, lt, L) => {
  const turn = easeOut(seg(t, W(L, 'она') - .2, W(L, 'она') + .3));
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .4)}${at(540, 2380, 2.6, professor({ face: 'cold', pose: { head: lerp(0, -20, turn), armR: -20 } }))}${tint(PAL.red, .06 * turn)}`,
    cam: { s: lerp(1.0, 1.15, seg(t, LSTART[L], LEND[L])), x: lerp(540, 470, turn), y: 980 },
    fx: dust(t, { op: .25 }),
  };
};

// 12. Вот кто всё скрывал. Он.
SCENES[12] = (t, lt, L) => {
  const z = t > W(L, 'он', 1) ? easeOut(seg(t, W(L, 'он', 1), W(L, 'он', 1) + .25)) : 0;
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .55)}${at(540, 2500, 3.2, nikita({ face: 'tense', pose: { head: Math.sin(t * 2) * 2 } }))}${darkness(540, 1000, 720, .85, 'h12')}`,
    cam: { s: 1 + seg(t, LSTART[L], LEND[L]) * .08 + z * .25, x: 540, y: 960 + z * 60 }, shake: z > 0 && z < 1 ? 8 : 0,
    fx: '',
  };
};

// 13. При пожаре двери открываются сами — датчик дыма
SCENES[13] = (t, lt, L) => {
  const up = ease(seg(t, W(L, 'пожаре') - .3, W(L, 'двери') + .3));
  return {
    world: `${bgLab(t, { curtain: 1 })}${tint('#000', .35)}<g transform="translate(540 90) scale(1.2)">${smokeDetector(0)}</g>
      ${at(420, 1900, 1.3, nikita({ face: 'tense', pose: { head: -up * 18 } }))}`,
    cam: { s: lerp(1.1, 2.4, up), x: lerp(480, 540, up), y: lerp(1250, 220, up) },
    fx: dust(t, { op: .25 }),
  };
};

// 14. Щелчок зажигалки. Сирена. Замки щёлкнули.
SCENES[14] = (t, lt, L) => {
  const tC = W(L, 'щелчок'), tD = W(L, 'датчик'), tS = W(L, 'сирена'), tZ = W(L, 'замки');
  const on = t > tC + .25;
  let smoke = '';
  if (on) for (let i = 0; i < 10; i++) { const ph = (t * .6 + i / 10) % 1; smoke += `<circle cx="${540 + Math.sin(t * 2 + i) * 30}" cy="${1150 - ph * 950}" r="${20 + ph * 60}" fill="#9aa3ab" opacity="${(.35 * (1 - ph) * seg(t, tC, tD)).toFixed(2)}"/>`; }
  return {
    world: `<rect width="1080" height="1920" fill="#0b1012"/><g transform="translate(540 160) scale(1.6)">${smokeDetector(t > tD ? (Math.sin(t * 12) > 0 ? 1 : 0) : 0)}</g>
      ${at(540, 1400, 3, propLighter(on))}${smoke}
      ${t > tZ ? `<g>${[0, 1, 2].map(i => `<g transform="translate(${200 + i * 340} 1750) scale(${1 + .3 * Math.max(0, 1 - (t - tZ - i * .12) * 4)})"><rect x="-40" y="-20" width="80" height="60" rx="8" fill="#3a4650"/><path d="M-26 -20 v-20 a26 26 0 0 1 ${t > tZ + i * .12 ? 52 : 52} 0 ${t > tZ + i * .12 ? 'v-12' : 'v20'}" stroke="#9aa3ab" stroke-width="10" fill="none"/></g>`).join('')}</g>` : ''}
      <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, tS)}"/>`,
    cam: { s: 1, x: 540, y: 960 }, shake: (t > tC && t < tC + .2 ? 5 : 0) + steps(t, [tZ, tZ + .12, tZ + .24], .15) * 10,
    fx: sprinkler(t, tS),
  };
};

// 15. Профессор в дверях — Ася отодвинула его твёрдой рукой
SCENES[15] = (t, lt, L) => {
  const tP = W(L, 'отодвинула'), push = ease(seg(t, tP - .1, tP + .6));
  return {
    world: `${bgBasementDoor({ lines: ['ТРЕВОГА', 'ДВЕРИ ОТКРЫТЫ'], on: Math.sin(t * 10) > 0 ? 1 : .4, open: 1 })}
      ${at(lerp(470, 820, push), 1680, 1.5, professor({ face: 'shout', pose: { lean: push * 18, armL: 30, armR: -30 } }))}
      ${at(lerp(160, 330, push), 1980, 2.1, asya({ face: 'calm', hard: 2.15, torch: false, pose: { armL: lerp(10, 120, push), lean: push * -5 } }))}
      <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, LSTART[L] - 1)}"/>`,
    cam: { s: 1.2, x: 520, y: 1300 }, shake: 4 + (push > 0 && push < 1 ? 8 : 0),
    fx: sprinkler(t, LSTART[L] - 1),
  };
};

// 16. «Без неё к ночи проснутся все!»
SCENES[16] = (t, lt, L) => ({
  world: `${bgCorridor()}${tint('#000', .3)}${at(540, 2350, 2.5, professor({ face: 'shout', pose: { armL: 50, armR: -80, lean: Math.sin(t * 6) * 2 } }))}
    <rect x="-500" y="-500" width="2080" height="2920" fill="${PAL.red}" opacity="${alarm(t, LSTART[L] - 1)}"/>`,
  cam: { s: lerp(1.15, 1.0, seg(t, LSTART[L], LEND[L])), x: 540, y: 980 }, shake: 9,
  fx: sprinkler(t, LSTART[L] - 1),
});

// 17. На улице Ася обернулась
SCENES[17] = (t, lt, L) => {
  const turn = easeOut(seg(t, W(L, 'обернулась') - .2, W(L, 'обернулась') + .5));
  return {
    world: `${bgCourtyard()}${at(620, 1820, 1.7, asya({ face: 'calm', hard: 2.2, torch: false, pose: { head: lerp(25, 0, turn), lean: lerp(4, 0, turn) } }))}
      <g filter="url(#sil)">${at(160, 2100, 2, nikita({ face: 'calm' }))}</g>`,
    cam: { s: lerp(1.05, 1.45, ease(seg(t, W(L, 'обернулась'), LEND[L]))), x: lerp(540, 620, turn), y: lerp(1200, 1300, turn) },
    fx: leaves(t, { n: 10 }) + dust(t, { op: .2, wind: 140 }),
  };
};

// 18. Глаза у неё были зелёные… Как у них.
SCENES[18] = (t, lt, L) => {
  const g = easeOut(seg(t, W(L, 'зелёные') - .2, W(L, 'зелёные') + .4));
  return {
    world: `${bgCourtyard()}${tint('#000', .45)}${at(540, 2100, 4.6, asya({ face: 'calm', hard: 2.2, torch: false, green: g }))}
      <circle cx="540" cy="910" r="${500 + Math.sin(t * 3) * 20}" fill="${PAL.eyeGlow}" opacity="${.07 * g}"/>`,
    cam: { s: lerp(1.0, 1.35, ease(seg(t, LSTART[L], LEND[L]))), x: 540, y: lerp(960, 920, seg(t, LSTART[L], LEND[L])) },
    fx: leaves(t, { n: 5 }),
  };
};

const KEY = {
  '#c8ff6e': ['рыба', 'смотрела', 'реагент', 'зелён', 'них', 'сне', 'проснутся', 'аквариум'],
  '#ff6a55': ['врал', 'серое', 'шее', 'шею', 'донор', 'кровь', 'доза', 'она', 'скрывал', 'сирена', 'кончается', 'одного'],
  '#ffa23c': ['зажиг', 'пожаре', 'щелчок', 'вентиль', 'река', 'завода'],
  '#f2c15a': ['асю', 'ася', 'аси', 'папа', 'пропуск', 'орлов', 'вершинин', 'профессор'],
};
const EP_LABEL = 'серия 3 · «Кафедра»';
