// Line-art animations for tip cards (luxe style). Gold/ivory strokes on a dark neutral background.
// ANIM[name] = { svg: markup in a 1080x1080 box, upd(root, u): per-frame logic with u = seconds since the card started }
(function () {
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var out3 = function (x) { return 1 - Math.pow(1 - clamp(x), 3); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var GOLD = '#C9A55C', IV = '#F6F1E7';
  function prep(root) {
    root.querySelectorAll('.dr').forEach(function (e) {
      var L = 0; try { L = e.getTotalLength(); } catch (x) {}
      if (!L) L = 1200;
      e.setAttribute('data-L', L); e.style.strokeDasharray = L + ' ' + L; e.style.strokeDashoffset = L;
    });
    root.querySelectorAll('.fi').forEach(function (e) { e.style.transformBox = 'fill-box'; e.style.transformOrigin = 'center'; });
  }
  function run(root, u) {
    root.querySelectorAll('.dr').forEach(function (e) {
      var L = +e.getAttribute('data-L'), d = +e.getAttribute('data-d') || 0, t = +e.getAttribute('data-t') || 0.8;
      e.style.strokeDashoffset = (1 - out3((u - d) / t)) * L;
    });
    root.querySelectorAll('.fi').forEach(function (e) {
      var d = +e.getAttribute('data-d') || 0, y = +e.getAttribute('data-y') || 0, s = e.getAttribute('data-s');
      var o = out3((u - d) / 0.6); e.style.opacity = o;
      var sc = s === null ? 1 : (+s + (1 - +s) * o);
      e.style.transform = 'translateY(' + ((1 - o) * y) + 'px) scale(' + sc + ')';
    });
  }
  var cloud = 'M700 300 H900 a55 55 0 0 0 5 -108 a85 85 0 0 0 -160 -20 a65 65 0 0 0 -45 128 Z';
  var docCopy = '<rect x="-150" y="-210" width="300" height="420" rx="26" fill="rgba(246,241,231,.14)" stroke="' + IV + '" stroke-width="7"/>' +
    '<circle cx="0" cy="-70" r="62" fill="none" stroke="' + GOLD + '" stroke-width="7"/><path d="M-80 40 H80 M-80 90 H80 M-80 140 H10" stroke="' + GOLD + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
  var dots = '';
  for (var j = 0; j < 4; j++) for (var i = 0; i < 5; i++)
    dots += '<circle class="fi" data-d="' + (0.9 + 0.06 * (j * 5 + i)).toFixed(2) + '" data-s=".2" cx="' + (360 + 90 * i) + '" cy="' + (450 + 75 * j) + '" r="9" fill="rgba(246,241,231,.6)"/>';
  var H = [380, 230, 420, 330, 400], bars = '', lab = '';
  for (var b = 0; b < 5; b++) {
    bars += '<rect id="b' + b + '" x="' + (190 + 150 * b) + '" y="800" width="100" height="0" rx="10" fill="rgba(246,241,231,.22)" stroke="' + IV + '" stroke-width="3"/>';
    lab += '<circle class="fi" data-d="' + (0.3 + 0.12 * b) + '" data-s=".2" cx="' + (240 + 150 * b) + '" cy="850" r="8" fill="rgba(246,241,231,.7)"/>';
  }
  var tshirt = 'M-52 -48 L-22 -62 Q0 -44 22 -62 L52 -48 L78 -12 L52 6 L40 -8 V56 H-40 V-8 L-52 6 L-78 -12 Z';
  window.ANIMH = { prep: prep, run: run };
  window.ANIM = {
    docs: {
      svg: '<g id="pp" transform="translate(330 500)">' +
        '<rect class="w dr" data-d=".1" data-t="1.0" x="-150" y="-210" width="300" height="420" rx="26"/>' +
        '<circle class="g dr" data-d=".9" data-t=".8" cx="0" cy="-70" r="62"/>' +
        '<path class="g dr" data-d="1.3" data-t=".7" d="M-80 40 H80 M-80 90 H80 M-80 140 H10"/>' +
        '<path class="w dr" data-d="1.8" data-t=".6" d="M-186 -246 v46 M-186 -246 h46 M186 -246 v46 M186 -246 h-46 M-186 246 v-46 M-186 246 h46 M186 246 v-46 M186 246 h-46"/>' +
        '<rect id="fl" x="-150" y="-210" width="300" height="420" rx="26" fill="#fff" opacity="0"/></g>' +
        '<g id="c1" opacity="0">' + docCopy + '</g><g id="c2" opacity="0">' + docCopy + '</g>' +
        '<path class="g dr" data-d="2.2" data-t=".9" d="' + cloud + '"/>' +
        '<path class="g dr" data-d="3.5" data-t=".5" d="M770 236 l24 24 l46 -50"/>' +
        '<rect class="g dr" data-d="2.7" data-t=".7" x="705" y="725" width="200" height="130" rx="16"/>' +
        '<path class="g dr" data-d="3.1" data-t=".6" d="M705 737 L805 807 L905 737"/>' +
        '<path class="g dr" data-d="4.1" data-t=".5" d="M770 900 l24 24 l46 -50"/>',
      upd: function (root, u) {
        var q = function (id) { return root.querySelector('#' + id); };
        q('fl').setAttribute('opacity', (u >= 2.1 && u < 2.6) ? Math.sin(Math.PI * (u - 2.1) / 0.5) * 0.9 : 0);
        var fly = function (g, t0, tx, ty) {
          var p = out3((u - t0) / 1.0), x = lerp(330, tx, p), y = lerp(500, ty, p), s = lerp(1, 0.24, p);
          g.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + s + ')');
          g.setAttribute('opacity', u < t0 ? 0 : (u > t0 + 1.0 ? 0 : 1));
        };
        fly(q('c1'), 2.5, 790, 245); fly(q('c2'), 3.0, 805, 790);
      }
    },
    cancel: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.0" x="300" y="250" width="480" height="500" rx="34"/>' +
        '<path class="g dr" data-d=".9" data-t=".6" d="M300 350 H780"/>' +
        '<path class="w dr" data-d=".7" data-t=".5" d="M395 225 v56 M685 225 v56"/>' + dots +
        '<circle class="g dr" data-d="2.2" data-t=".8" cx="630" cy="600" r="42"/>' +
        '<path class="g dr" data-d="3.0" data-t=".6" d="M610 602 l14 14 l30 -34"/>' +
        '<g id="bell" transform="translate(870 250)"><path class="g dr" data-d="3.3" data-t=".9" d="M0 -70 C-54 -70 -62 -14 -62 34 L-80 66 H80 L62 34 C62 -14 54 -70 0 -70 Z M0 -70 v-18 M-22 86 a22 22 0 0 0 44 0"/></g>' +
        '<path class="g dr" data-d="4.1" data-t=".5" d="M950 190 q34 50 0 100 M984 168 q54 72 0 144"/><path class="g dr" data-d="4.1" data-t=".5" d="M790 190 q-34 50 0 100"/>',
      upd: function (root, u) {
        var a = u > 50 ? 0 : (u > 3.9 ? Math.sin((u - 3.9) * 16) * 12 * Math.exp(-(u - 3.9) * 0.35) : 0);
        root.querySelector('#bell').setAttribute('transform', 'translate(870 250) rotate(' + a + ' 0 -70)');
      }
    },
    dates: {
      svg: '<path class="g dr" data-d=".1" data-t=".8" d="M150 800 H930"/>' + bars + lab +
        '<path class="g dr" data-d="2.0" data-t=".8" style="stroke-width:2.5px;opacity:.55" d="M150 380 H930"/>' +
        '<path id="plane" d="M-44 0 L44 -18 L20 0 L44 18 Z" fill="' + GOLD + '" opacity="0"/>' +
        '<text id="cheap" class="fi" data-d="3.5" data-y="10" x="390" y="468" text-anchor="middle" font-family="CG,serif" font-style="italic" font-size="52" fill="' + GOLD + '">дешевле</text>',
      upd: function (root, u) {
        for (var i = 0; i < 5; i++) {
          var g = out3((u - 0.4 - i * 0.18) / 0.7), h = H[i] * g, r = root.querySelector('#b' + i);
          r.setAttribute('y', 800 - h); r.setAttribute('height', h);
          r.setAttribute('fill', u > 3.2 ? (i === 1 ? 'rgba(201,165,92,.92)' : 'rgba(246,241,231,.11)') : 'rgba(246,241,231,.22)');
          r.setAttribute('stroke', u > 3.2 && i === 1 ? GOLD : IV);
        }
        var p = out3((u - 2.3) / 1.1), pl = root.querySelector('#plane');
        pl.setAttribute('transform', 'translate(' + lerp(130, 390, p) + ' ' + (lerp(300, 530, p) - Math.sin(Math.PI * p) * 70) + ') rotate(' + lerp(-14, 8, p) + ')');
        pl.setAttribute('opacity', u > 2.3 ? 1 : 0);
      }
    },
    offline: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.1" x="360" y="130" width="360" height="760" rx="58"/>' +
        '<path class="w dr" data-d=".9" data-t=".5" d="M480 168 H600"/>' +
        '<rect class="g dr" data-d="1.0" data-t=".6" x="400" y="215" width="280" height="18" rx="9"/>' +
        '<rect id="pb" x="400" y="215" width="0" height="18" rx="9" fill="' + GOLD + '"/>' +
        '<path class="g dr" data-d="1.4" data-t=".8" d="M540 262 v48 M516 290 l24 24 l24 -24"/>' +
        '<path class="w dr" data-d="1.8" data-t="1.4" d="M395 450 C455 515 525 400 600 500 S690 590 705 660 M395 640 C470 600 540 690 620 645 M470 360 V860 M655 360 V860"/>' +
        '<circle class="g dr" data-d="2.4" data-t=".8" cx="580" cy="760" r="38"/>' +
        '<path class="g dr" data-d="3.4" data-t=".9" d="M820 280 a95 95 0 0 1 130 0 M842 308 a62 62 0 0 1 86 0 M862 336 a30 30 0 0 1 46 0"/>' +
        '<circle class="fi" data-d="3.6" data-s=".2" cx="885" cy="366" r="8" fill="' + GOLD + '"/>' +
        '<path class="w dr" data-d="4.0" data-t=".5" style="stroke-width:7px" d="M808 215 L964 410"/>' +
        '<g class="fi" data-d="4.4" data-y="-180"><path d="M540 650 C510 620 496 600 496 580 A44 44 0 1 1 584 580 C584 600 570 620 540 650 Z" fill="' + GOLD + '"/><circle cx="540" cy="580" r="15" fill="#141210"/></g>' +
        '<circle id="pr" cx="540" cy="650" r="10" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0"/>',
      upd: function (root, u) {
        root.querySelector('#pb').setAttribute('width', 280 * clamp((u - 1.6) / 1.6));
        var pr = root.querySelector('#pr');
        if (u > 50 || u < 5.0) { pr.setAttribute('opacity', 0); return; }
        var k = ((u - 5.0) % 1.5) / 1.5;
        pr.setAttribute('r', 10 + 70 * k); pr.setAttribute('opacity', 0.8 * (1 - k));
      }
    },
    carry: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.1" x="320" y="400" width="440" height="520" rx="50"/>' +
        '<path class="w dr" data-d=".7" data-t=".7" d="M470 400 V340 a24 24 0 0 1 24 -24 H586 a24 24 0 0 1 24 24 V400"/>' +
        '<path class="g dr" data-d="1.0" data-t=".7" d="M320 520 H760"/>' +
        '<g transform="translate(540 700)"><g class="fi" data-d="1.5" data-y="-140" data-s=".5"><g transform="translate(-125 0) scale(.9)"><path class="g" d="' + tshirt + '"/></g></g>' +
        '<g class="fi" data-d="2.0" data-y="-140" data-s=".5"><g transform="translate(0 0)"><rect class="g" x="-9" y="-40" width="18" height="100" rx="9"/><rect class="g" x="-15" y="-74" width="30" height="30" rx="9"/></g></g>' +
        '<g class="fi" data-d="2.5" data-y="-140" data-s=".5"><g transform="translate(125 0)"><rect class="g" x="-26" y="-50" width="52" height="56" rx="10"/><path class="g" d="M-12 -50 V-74 M12 -50 V-74 M0 6 C0 44 -34 34 -34 74"/></g></g></g>' +
        '<circle class="g dr" data-d="3.2" data-t=".8" cx="880" cy="280" r="76"/>' +
        '<path class="g dr" data-d="3.8" data-t=".6" d="M880 280 V232 M880 280 L916 300"/>' +
        '<text class="fi" data-d="4.2" data-y="8" x="880" y="420" text-anchor="middle" font-family="CG,serif" font-style="italic" font-size="60" fill="' + IV + '">24 часа</text>' +
        '<path class="g dr" data-d="4.6" data-t=".5" d="M646 820 l26 26 l52 -56"/>',
      upd: function () {}
    }
  };
})();
