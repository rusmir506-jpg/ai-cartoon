// Серия 5 (финал) — новые рисунки: маячок, рассвет, вспышка.
(function () {
  const A = window.ART, P = A.P;
  const f = n => Math.round(n * 10) / 10;
  // снятый маячок с обрывком ремня
  function beaconDevice(on) {
    return `<g><path d="M-60 0q-40 30 -90 20M60 0q40 -30 90 -10" stroke="#3a3f52" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="-60" y="-40" width="120" height="80" rx="14" fill="#3a3f52"/><rect x="-46" y="-28" width="92" height="56" rx="8" fill="#1a1d2a"/>
      <circle r="20" fill="${on ? P.red : '#4a1a20'}"/>${on ? `<circle r="90" fill="url(#gRed)"/>` : ''}</g>`;
  }
  // рассветное небо поверх любого фона (верхняя часть кадра)
  function dawn(k, sunY) {
    return `<defs><linearGradient id="gDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a6a"/><stop offset=".55" stop-color="#c86a5a"/><stop offset=".85" stop-color="#f5b04a"/><stop offset="1" stop-color="#ffe2a0"/></linearGradient></defs>
      <rect width="1080" height="1080" fill="url(#gDawn)" opacity="${f(k)}"/>
      <circle cx="760" cy="${sunY || 1060}" r="110" fill="#ffe9b0" opacity="${f(k)}"/><circle cx="760" cy="${sunY || 1060}" r="380" fill="url(#gGlow)" opacity="${f(k * .8)}"/>`;
  }
  // далёкая вспышка на горизонте
  function farFlash(k) {
    return `<ellipse cx="0" cy="0" rx="${f(200 + 900 * k)}" ry="${f(60 + 400 * k)}" fill="url(#gWhite)" opacity="${f(Math.min(1, k * 1.4))}"/><circle r="${f(40 + 120 * k)}" fill="#fff" opacity="${f(1 - k * .6)}"/>`;
  }
  Object.assign(A, { beaconDevice, dawn, farFlash });
})();
