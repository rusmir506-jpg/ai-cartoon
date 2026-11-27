// ГИГАНТСКИЕ МУТАНТЫ — новое для серии 4 «Колыбельная». Подключается после assets.js, assets2.js, assets3.js.

// Пробирка крупно. level 0..1 — сколько реагента; tilt — наклон (вылить)
function vialBig(level = 1, tilt = 0) {
  return `<g transform="rotate(${tilt})"><rect x="-40" y="-260" width="80" height="40" rx="8" fill="#5b646c"/>
    <path d="M-34 -222 V180 a34 34 0 0 0 68 0 V-222Z" fill="#cfe3ea" opacity=".25" stroke="#b9c7d2" stroke-width="6"/>
    <clipPath id="vclip"><path d="M-31 -220 V180 a31 31 0 0 0 62 0 V-220Z"/></clipPath>
    <g clip-path="url(#vclip)"><rect x="-60" y="${(214 - 420 * level).toFixed(1)}" width="120" height="500" fill="${PAL.reagent}" opacity=".85" transform="rotate(${-tilt} 0 ${214 - 420 * level})"/></g>
    <circle cx="0" cy="0" r="160" fill="${PAL.reagent}" opacity="${(.08 * level).toFixed(2)}"/>
    <path d="M-20 -200 V150" stroke="#fff" stroke-width="8" opacity=".25"/></g>`;
}
// Ладонь, держащая предмет снизу
function handHold() {
  return `<g><rect x="-80" y="40" width="160" height="380" rx="70" fill="${PAL.parka}"/><ellipse cx="0" cy="40" rx="70" ry="60" fill="${PAL.skin}"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${-62 + i * 34}" y="-10" width="28" height="60" rx="14" fill="${PAL.skin}"/>`).join('')}</g>`;
}
// Зелёные круги звука (голос / зов реки). k — сила
function soundRings(t, k = 1, { speed = .8, n = 5, max = 600, color = PAL.eye } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) { const ph = (t * speed + i / n) % 1; s += `<circle r="${(40 + ph * max).toFixed(0)}" fill="none" stroke="${color}" stroke-width="${(6 * (1 - ph) + 1).toFixed(1)}" opacity="${(k * .55 * (1 - ph)).toFixed(2)}"/>`; }
  return s;
}
// Клочья мокрой шерсти на полу
function furTufts(seed = 3) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 9; i++) s += furBlob(80 + r() * 900, 1620 + r() * 220, 30 + r() * 40, 12 + r() * 10, { seed: seed + i, spike: .4, fill: i % 2 ? PAL.fur : PAL.furSh, n: 18 });
  return s;
}
// Машина без номеров, вид сбоку. lights 0..1 — фары
function car(lights = 1, flip = 1) {
  return `<g transform="scale(${flip} 1)"><path d="M-170 -10 V-60 Q-160 -80 -120 -84 L-70 -130 H70 L120 -84 Q170 -80 175 -50 V-10Z" fill="#07090b"/>
    <path d="M-60 -122 H-8 V-86 H-100Z M8 -122 H62 L104 -86 H8Z" fill="#1a2329"/>
    <circle cx="-105" cy="-10" r="30" fill="#020304"/><circle cx="105" cy="-10" r="30" fill="#020304"/>
    <rect x="160" y="-62" width="20" height="18" rx="4" fill="#fff6d0" opacity="${lights}"/>
    ${lights > 0 ? `<path d="M178 -60 L900 -220 L900 140 Z" fill="#fff6d0" opacity="${(.12 * lights).toFixed(2)}"/><circle cx="175" cy="-53" r="40" fill="#fff6d0" opacity="${(.35 * lights).toFixed(2)}"/>` : ''}
    <rect x="-176" y="-56" width="14" height="14" fill="${PAL.red}" opacity=".9"/></g>`;
}
// Глаза в воде (n штук), k — сколько открыто (0..1), off — доля погасших (0..1)
function waterEyes(t, k = 1, off = 0, { n = 46, y0 = 1050, y1 = 1670 } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = hashN(i * 3.3) * 1040 + 20, y = y0 + hashN(i * 7.1) * (y1 - y0), sc = .5 + (y - y0) / (y1 - y0);
    const o = clampN((k - hashN(i) * .7) / .3) * (hashN(i * 9.7) < off ? 0 : 1);
    if (o <= 0) continue;
    s += `<g transform="translate(${x.toFixed(0)} ${(y + Math.sin(t * 2 + i) * 4).toFixed(0)}) scale(${sc.toFixed(2)})"><circle r="26" fill="${PAL.eyeGlow}" opacity="${(o * .18).toFixed(2)}"/><ellipse rx="11" ry="${(11 * o).toFixed(1)}" fill="${PAL.eye}"/><ellipse rx="2.5" ry="${(8 * o).toFixed(1)}" fill="#0b0f08"/></g>`;
  }
  return s;
}

if (typeof module !== 'undefined') module.exports = { vialBig, handHold, soundRings, furTufts, car, waterEyes };
