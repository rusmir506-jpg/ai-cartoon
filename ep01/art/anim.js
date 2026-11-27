// Серия 1 «Автопилот» — покадровая анимация. render(t) рисует кадр в момент t (сек).
(function () {
  const A = ART, W = window.WORDS;
  const END = 78.0;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
  const ramp = (t, a, b) => ease((t - a) / (b - a));
  const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---- тайминг по словам ----
  const lines = []; W.forEach((w) => (lines[w.line] = lines[w.line] || []).push(w));
  const ws = (n, k) => lines[n - 1][k].s;          // начало k-го слова строки n
  const we = (n, k) => lines[n - 1][k].e;
  const lineS = (n) => lines[n - 1][0].s;
  const lineE = (n) => lines[n - 1][lines[n - 1].length - 1].e;
  const cut = (n) => (n === 1 ? 0 : n > 18 ? lineE(18) + 0.7 : Math.max(lineE(n - 1) + 0.05, lineS(n) - 0.3));

  // ---- общее: моргание, рот ----
  function blink(t, seed = 0) {
    const period = 3.3 + seed * 0.7, ph = (t + seed * 1.3) % period;
    return ph < 0.13 ? Math.abs(ph - 0.065) / 0.065 : 1;
  }
  const talk = (t, a, b) => (t > a && t < b ? 0.25 + 0.45 * Math.abs(Math.sin(t * 17)) * Math.abs(Math.sin(t * 6.3 + 1)) : 0);

  // ---- таймер топлива (минуты) ----
  function fuel(t) {
    const fast = ws(12, 5);
    if (t < fast) return 120 - (t - 25) * 0.02;
    if (t < fast + 3.5) return lerp(120 - (fast - 25) * 0.02, 41, ease((t - fast) / 3.5));
    return 41 - (t - fast - 3.5) * 0.12;
  }
  const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;

  // ---- шум (живое зерно) ----
  const noise = [];
  (function makeNoise() {
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas'); c.width = 360; c.height = 640;
      const x = c.getContext('2d'), d = x.createImageData(360, 640);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 28; }
      x.putImageData(d, 0, 0); noise.push(c.toDataURL());
    }
  })();
  function fx(t) {
    const roll = (t * 140) % 2100 - 120;
    return `<image href="${noise[Math.floor(t * 15) % noise.length]}" width="1080" height="1920" preserveAspectRatio="none" style="mix-blend-mode:overlay"/>
      <rect width="1080" height="1920" fill="url(#scan)"/>
      <rect y="${roll}" width="1080" height="90" fill="#fff" opacity="0.03"/>
      <rect width="1080" height="1920" fill="url(#vign)"/>`;
  }
  // пылинки в свете
  function dust(t, col = '#f2d2a0', n = 26) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = (rnd(i) * 1080 + Math.sin(t * 0.3 + i) * 40 + t * 6 * (rnd(i + 9) - 0.5)) % 1080;
      const y = (rnd(i + 3) * 1920 - t * (8 + rnd(i + 5) * 14) + 1920 * 4) % 1920;
      s += `<circle cx="${x}" cy="${y}" r="${1.5 + rnd(i + 7) * 2.5}" fill="${col}" opacity="${0.12 + 0.2 * rnd(i + 2)}"/>`;
    }
    return s;
  }
  const cam = (inner, s = 1, fx0 = 540, fy0 = 960, dx = 0, dy = 0) =>
    `<g transform="translate(${fx0 + dx},${fy0 + dy}) scale(${s}) translate(${-fx0},${-fy0})">${inner}</g>`;
  const drift = (t, a = 6) => [Math.sin(t * 0.5) * a, Math.cos(t * 0.37) * a];
  const place = (inner, x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${inner}</g>`;
  const tint = (col, op) => `<rect width="1080" height="1920" fill="${col}" opacity="${op}"/>`;

  // сумка в проходе (перспектива)
  function aisleBag() {
    return `<g transform="translate(300,1270)">
      <path d="M0,60 L480,60 L500,560 L-20,560Z" fill="#9b8038"/><path d="M0,60 L480,60 L470,0 L10,0Z" fill="#b39648"/>
      <path d="M240,60 L250,560 L500,560 L480,60Z" fill="#000" opacity="0.28"/>
      <text x="40" y="200" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#3d3418" opacity="0.65">ЕДА·24</text>
      <rect x="60" y="250" width="120" height="150" fill="#e8e2d4" transform="rotate(-4 120 320)"/>
      <path d="M75,280 L165,276 M75,305 L160,301 M75,330 L150,326" stroke="#555" stroke-width="5" transform="rotate(-4 120 320)"/></g>`;
  }

  // чек крупно
  function receipt(t) {
    const n = 13, k0 = 4;
    const L = lines[n - 1];
    const shown = (k) => t >= L[k].s - 0.05;
    const q = L.slice(k0).map((w, i) => ({ w: w.w.replace(/[«»]/g, ''), on: shown(i + k0) }));
    const l1 = q.slice(0, 4), l2 = q.slice(4);
    const row = (arr, y, col) => `<text x="250" y="${y}" font-size="46" fill="${col}">${arr.map((o) => `<tspan opacity="${o.on ? 1 : 0}">${o.w} </tspan>`).join('')}</text>`;
    let s = `<rect width="1080" height="1920" fill="#141a22"/>
      <circle cx="300" cy="300" r="700" fill="#f2b56b" opacity="0.18" filter="url(#soft30)"/>
      <g transform="rotate(-3 540 960)">
      <path d="M200,260 L880,260 L880,1660 L860,1680 L840,1660 L820,1680 L800,1660 L780,1680 L760,1660 L740,1680 L720,1660 L700,1680 L680,1660 L660,1680 L640,1660 L620,1680 L600,1660 L580,1680 L560,1660 L540,1680 L520,1660 L500,1680 L480,1660 L460,1680 L440,1660 L420,1680 L400,1660 L380,1680 L360,1660 L340,1680 L320,1660 L300,1680 L280,1660 L260,1680 L240,1660 L220,1680 L200,1660Z" fill="#e6dfd0"/>
      <rect x="200" y="260" width="680" height="1420" fill="url(#rcptShade)"/>
      <g font-family="JetBrains Mono" font-weight="700" fill="#2b2a28">
        <text x="540" y="380" text-anchor="middle" font-size="64" font-weight="800">ЕДА·24</text>
        <text x="540" y="440" text-anchor="middle" font-size="32">ЧЕК № 0540</text>
        <path d="M240,480 L840,480" stroke="#2b2a28" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="250" y="560" font-size="36">АДРЕС: БОРТ, РЕЙС 5:40</text>
        <text x="250" y="620" font-size="36">ПОРЦИЙ: 2</text>
        <text x="250" y="680" font-size="36">ОПЛАТА: ПРОИЗВЕДЕНА</text>
        <path d="M240,730 L840,730" stroke="#2b2a28" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="250" y="810" font-size="36">КОММЕНТАРИЙ:</text>
        ${row(l1.slice(0, 2), 900, '#2b2a28')}${row(l1.slice(2), 960, '#2b2a28')}
        ${row(l2.slice(0, 2), 1060, '#9a2a20')}${row(l2.slice(2), 1120, '#9a2a20')}
        <path d="M240,1200 L840,1200" stroke="#2b2a28" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="540" y="1290" text-anchor="middle" font-size="32">СПАСИБО ЗА ЗАКАЗ</text>
      </g></g>`;
    return s;
  }

  // радиоволна дыхания
  function breathWaves(t, x, y, on) {
    if (!on) return '';
    const br = 0.5 + 0.5 * Math.sin(t * 2.4);
    let s = '';
    for (let i = 0; i < 3; i++) {
      const r = 40 + ((t * 60 + i * 50) % 150);
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#7ee0a0" stroke-width="4" opacity="${(1 - r / 190) * 0.5 * br}"/>`;
    }
    return s;
  }

  // ---- сцены ----
  const sv = (o) => A.sveta(o);
  const cr = (o) => A.courier(o);
  const S = [];
  const scene = (from, to, plates, draw) => S.push({ from, to, plates, draw });
  const BOARD = (t) => ({ where: 'БОРТ', when: '??:??', timer: t > cut(7) ? hhmm(fuel(t)) : null, timerAlarm: t > ws(12, 5) + 2 });

  // 1. пробуждение
  scene(1, 1, BOARD, (t) => {
    const open = ramp(t, 1.0, 1.4);
    const eyes = open < 0.1 ? 0 : open * blink(t);
    const look = { x: t > ws(1, 4) ? -0.6 : t > 2.0 ? 0.5 : 0, y: 0 };
    const s = lerp(1.9, 1.0, ramp(t, 0.6, 3.6));
    const body = A.bgCabin(t) + tint('#0b0f14', 0.2) + place(sv({ eyes, look, brows: open * 0.7 }), 15, 430, 1.75);
    return cam(body, s, 540, 920) + `<rect width="1080" height="1920" fill="#000" opacity="${1 - ramp(t, 0, 0.5)}"/>`;
  });
  // 2. флешбэк: зал ожидания
  scene(2, 2, () => ({ where: 'ЗАЛ ОЖИДАНИЯ', when: '05:40' }), (t, lt) => {
    const body = A.bgHall(t) + place(sv({ eyes: blink(t, 1), look: { x: 0.2, y: 0.1 } }), -80, 600, 1.45) + dust(t);
    return cam(body, lerp(1.0, 1.08, lt / 4)) + tint('#f2b56b', 0.08);
  });
  // 3. курьер садится рядом
  scene(3, 3, () => ({ where: 'ЗАЛ ОЖИДАНИЯ', when: '05:41' }), (t, lt) => {
    const cx = lerp(1100, 450, ramp(lt, 0.1, 1.0));
    const q0 = ws(3, 6), q1 = lineE(3);
    const svLook = { x: t > ws(3, 10) ? 0.8 : 0.3, y: 0 };
    const body = A.bgHall(t) +
      place(sv({ eyes: blink(t, 1), look: svLook, brows: t > ws(3, 10) ? 0.5 : 0 }), -160, 740, 1.3) +
      place(cr({ eyes: blink(t, 2), look: { x: -0.6, y: 0 }, mouthOpen: talk(t, q0, q1), lamp: -1 }), cx, 720, 1.35) + dust(t);
    const [dx, dy] = drift(t, 5);
    return cam(body, lerp(1.0, 1.06, lt / 5), 540, 960, dx, dy) + tint('#f2b56b', 0.08);
  });
  // 4. «кто второй» — крупно, лампа мигает
  scene(4, 4, () => ({ where: 'ЗАЛ ОЖИДАНИЯ', when: '05:41' }), (t, lt) => {
    const fl = rnd(Math.floor(t * 12)) > 0.75 ? 0.35 : 0;
    const body = A.bgHall(t * 3) + place(sv({ eyes: blink(t, 1), look: { x: -0.7, y: 0.1 }, brows: 0.4 }), 15, 430, 1.75) + dust(t);
    return cam(body, lerp(1.05, 1.2, lt / 2.2), 540, 900) + tint('#f2b56b', 0.08) + tint('#000', fl);
  });
  // 5. сумка в проходе, курьер спит
  scene(5, 5, BOARD, (t, lt) => {
    const reveal = ramp(t, ws(5, 7), ws(5, 7) + 0.6);
    const body = A.bgCabin(t) + tint('#0b0f14', 0.25) +
      place(cr({ eyes: 0, lamp: 1, bag: false }), 250, 830, 1.0 + 0.0) +
      `<rect x="250" y="830" width="600" height="800" fill="#0b0f14" opacity="${0.75 * (1 - reveal)}"/>` + aisleBag();
    const [dx, dy] = drift(t, 4);
    return cam(body, lerp(1.0, 1.15, lt / 4.5), 540, 1300, dx, dy);
  });
  // 6. двое — курьер просыпается
  scene(6, 6, BOARD, (t, lt) => {
    const wake = ramp(t, ws(6, 2), ws(6, 2) + 0.3);
    const up = ramp(t, ws(6, 6), ws(6, 6) + 0.6);
    const look = { x: 0.1, y: -0.4 * up };
    const body = A.bgCabin(t) + tint('#0b0f14', 0.25) +
      place(sv({ eyes: blink(t, 1), look: up > 0 ? look : { x: 0.7, y: 0 }, brows: 0.3 }), -170, 760, 1.3) +
      place(cr({ eyes: wake < 0.1 ? 0 : wake * blink(t, 2), look: up > 0 ? look : { x: -0.6, y: 0 }, lamp: 1, brows: wake * 0.6 }), 460, 740, 1.3);
    return cam(body, 1.04, 540, 960, 0, lerp(0, 120, up));
  });
  // 7. дверь кабины → AUTOPILOT
  scene(7, 7, BOARD, (t, lt) => {
    const shake = t > ws(7, 2) && t < ws(7, 2) + 0.5 ? Math.sin(t * 90) * 8 : 0;
    const z = ramp(t, ws(7, 5) - 0.1, ws(7, 5) + 0.7);
    return cam(A.bgCockpitDoor(t), lerp(1.0, 1.7, z), lerp(540, 640, z), lerp(960, 300, z), shake, 0);
  });
  // 8–9. иллюминатор: города без огней
  scene(8, 9, BOARD, (t, lt, dur) => {
    const s = lerp(1.0, 1.5, ease(lt / dur));
    return cam(A.bgWindow(t), s, 540, 1050) + tint('#000', 0.25 * ramp(t, cut(9), cut(9) + 2));
  });
  // 10–11. рация: папина волна → чужое дыхание
  scene(10, 11, BOARD, (t, lt, dur) => {
    const lit = t > ws(10, 3);
    const breath = t > ws(11, 4);
    const fear = ramp(t, ws(11, 4), ws(11, 4) + 0.4);
    const pulse = breath ? (Math.sin(t * 2.4) > 0) : lit;
    const body = A.bgCabin(t) + tint('#0b0f14', 0.35) +
      place(sv({ eyes: (1 + fear * 0.25) * blink(t, 3), radio: true, radioLit: pulse, brows: fear, mouthOpen: fear * 0.4, look: { x: lit ? 0 : 0.3, y: lit && !breath ? 0.7 : 0 } }), 15, 430, 1.75) +
      breathWaves(t, 15 + 1.75 * 345, 430 + 1.75 * 600, breath);
    return cam(body, lerp(1.0, 1.25, ease(lt / dur)), 540, 1000);
  });
  // 12. экран обещает → курьер считает
  scene(12, 12, BOARD, (t, lt) => {
    const k = ws(12, 5) - 0.1;
    if (t < k) return cam(A.bgSeatScreen(t, 120 - (t - cut(12)) * 0.4), lerp(1.0, 1.12, lt / 2.5), 540, 760);
    const body = A.bgCabin(t) + tint('#0b0f14', 0.35) + place(cr({ eyes: blink(t, 2), brows: 1, look: { x: 0.5, y: 0.6 }, lamp: -1 }), 15, 470, 1.75);
    return cam(body, lerp(1.0, 1.15, (t - k) / 4), 540, 900) + tint('#ff3020', t > ws(12, 9) ? 0.06 + 0.05 * Math.sin(t * 8) : 0);
  });
  // 13. чек
  scene(13, 13, BOARD, (t, lt, dur) => cam(receipt(t), lerp(1.05, 1.25, ease(lt / dur)), 540, lerp(700, 1050, ease(lt / dur))));
  // 14. нас оставили специально — двое смотрят друг на друга
  scene(14, 14, BOARD, (t, lt) => {
    const body = A.bgCabin(t) + tint('#05080c', 0.5) +
      place(sv({ eyes: blink(t, 1), look: { x: 0.8, y: 0 }, brows: -0.5, lamp: 1 }), -170, 760, 1.3) +
      place(cr({ eyes: blink(t, 2), look: { x: -0.8, y: 0 }, brows: 0.6, lamp: -1 }), 460, 740, 1.3);
    return cam(body, lerp(1.0, 1.12, lt / 4), 540, 1000) + tint('#ff3020', t > ws(14, 5) ? 0.08 : 0);
  });
  // 15–16. «Нас двое. Мы живы» → дыхание замолкает
  scene(15, 16, BOARD, (t, lt, dur) => {
    const off = t > ws(16, 1);
    const fear = ramp(t, ws(16, 0), ws(16, 1));
    const body = A.bgCabin(t) + tint('#0b0f14', 0.35 + 0.25 * fear) +
      place(sv({ eyes: (1 + fear * 0.3) * blink(t, 3), radio: true, radioLit: !off && Math.sin(t * 2.4) > -0.6, brows: fear > 0 ? fear : -1, mouthOpen: talk(t, ws(15, 9), lineE(15)), look: { x: fear > 0 ? -0.5 : 0, y: 0 } }), 15, 430, 1.75) +
      breathWaves(t, 15 + 1.75 * 345, 430 + 1.75 * 600, !off && t < ws(15, 9));
    return cam(body, lerp(1.0, 1.3, ease(lt / dur)), 540, 920);
  });
  // 17–18. люк и рука
  scene(17, 18, BOARD, (t, lt, dur) => {
    const open = ramp(t, ws(17, 0), lineE(17) + 0.3);
    const hand = ramp(t, ws(18, 2) - 0.2, lineE(18) + 0.5);
    const z = lerp(1.0, 1.5, ease(lt / dur));
    return cam(A.bgHatch(t, open, hand), z, 540, 1150);
  });

  // ---- субтитры ----
  const KEY = ['никого', 'пять', 'сорок', 'двоих', 'второй', 'курьер', 'экипаж', 'автопилот', 'огонька', 'пуст', 'папину', 'дыхание', 'втрое', 'оставить', 'специально', 'вру', 'живы', 'замолкает', 'люк', 'рука'];
  const RED = ['дыхание', 'специально', 'рука', 'втрое', 'оставить'];
  const chunks = lines.map((L) => {
    const out = [[]]; let len = 0;
    L.forEach((w, i) => {
      if (len + w.w.length > 22 && out[out.length - 1].length) { out.push([]); len = 0; }
      out[out.length - 1].push(w); len += w.w.length + 1;
      if (/[.…:»]$/.test(w.w) && len > 12 && i < L.length - 1) { out.push([]); len = 0; }
    });
    return out.filter((c) => c.length);
  });
  function subs(t) {
    let li = -1;
    for (let i = 0; i < lines.length; i++) if (t >= lines[i][0].s - 0.05 && t <= lineE(i + 1) + 0.6) li = i;
    if (li < 0) return '';
    let ch = chunks[li][0];
    for (const c of chunks[li]) if (t >= c[0].s - 0.05) ch = c;
    // разбивка на строки по ~15 символов
    const rows = [[]]; let len = 0;
    ch.forEach((w) => { if (len + w.w.length > 15 && rows[rows.length - 1].length) { rows.push([]); len = 0; } rows[rows.length - 1].push(w); len += w.w.length + 1; });
    let s = `<g font-family="Inter" font-weight="900" text-anchor="middle">`;
    const y0 = 1580 - (rows.length - 1) * 46;
    rows.forEach((r, ri) => {
      const tsp = r.map((w) => {
        const clean = w.w.toLowerCase().replace(/[^а-яё]/g, '');
        const key = KEY.some((k) => clean.startsWith(k));
        const red = RED.some((k) => clean.startsWith(k));
        const on = t >= w.s - 0.04;
        const active = t >= w.s - 0.04 && t <= w.e + 0.05;
        const col = key ? (red ? '#ff6b5a' : '#f0d060') : '#ffffff';
        const txt = w.w.replace(/—/g, ' —');
        return `<tspan fill="${col}" fill-opacity="${on ? 1 : 0}" stroke-opacity="${on ? 1 : 0}" font-size="${active ? 84 : 78}">${txt} </tspan>`;
      }).join('');
      s += `<text x="540" y="${y0 + ri * 96}" stroke="#05070a" stroke-width="14" stroke-linejoin="round" paint-order="stroke">${tsp}</text>`;
    });
    return s + '</g>';
  }

  // ---- финальная плашка ----
  function endCard(t) {
    const k = t - cut(19);
    const txt = 'ПРОДОЛЖЕНИЕ СЛЕДУЕТ';
    const n = Math.floor(clamp(k / 1.0) * txt.length);
    const cursor = Math.floor(t * 3) % 2 ? '▌' : ' ';
    return `<rect width="1080" height="1920" fill="#06080b"/>
      <g font-family="JetBrains Mono" font-weight="800" text-anchor="middle">
      <text x="540" y="900" font-size="62" fill="#e8eef2">${txt.slice(0, n)}${cursor}</text>
      <text x="540" y="1000" font-size="34" fill="#8fa0b4" opacity="${ramp(k, 1.2, 1.6)}">ВСЕ ЛЮДИ ИСЧЕЗЛИ · СЕРИЯ 2</text>
      <text x="540" y="1120" font-size="44" fill="#ff6b5a" opacity="${ramp(k, 1.6, 2.0) * (Math.floor(t * 2) % 2 ? 1 : 0.4)}">● ${hhmm(fuel(t))}</text></g>`;
  }

  function render(t) {
    let body = '', pl = null, idx = -1;
    if (t >= cut(19)) body = endCard(t);
    else {
      for (let i = 0; i < S.length; i++) if (t >= cut(S[i].from)) idx = i;
      const sc = S[idx];
      const a = cut(sc.from), b = cut(sc.to + 1);
      body = sc.draw(t, t - a, b - a);
      // склейка: короткий сбой
      const since = t - a;
      if (since < 0.12 && idx > 0) {
        const off = (rnd(Math.floor(t * 30)) - 0.5) * 60;
        body = `<g transform="translate(${off},0)">${body}</g><rect width="1080" height="1920" fill="#cfe6ff" opacity="${0.18 * (1 - since / 0.12)}"/>`;
      }
      pl = sc.plates(t);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>${A.defsCommon()}
      <linearGradient id="rcptShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient></defs>
      <rect width="1080" height="1920" fill="#000"/>
      ${body}${fx(t)}${pl ? A.plates(pl) : ''}${subs(t)}</svg>`;
    document.getElementById('stage').innerHTML = svg;
  }
  window.render = render; window.END = END;
})();
