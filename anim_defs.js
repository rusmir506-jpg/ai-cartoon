// Line-art animations for tip cards (luxe style). Gold/ivory strokes on a dark neutral background.
// ANIM[name] = { svg: markup in a 1080x1080 box, upd(root, u): per-frame logic with u = seconds since the card started }
(function () {
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var out3 = function (x) { return 1 - Math.pow(1 - clamp(x), 3); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var LIGHT = !!(window.TL && window.TL.theme === 'light');
  var GOLD = LIGHT ? '#35A59E' : '#C9A55C', IV = LIGHT ? '#2A3F41' : '#F6F1E7', BG = LIGHT ? '#E8E3D8' : '#141210';
  var FA = function (a) { return LIGHT ? 'rgba(53,165,158,' + a + ')' : 'rgba(246,241,231,' + a + ')'; };
  var GA = function (a) { return LIGHT ? 'rgba(53,165,158,' + a + ')' : 'rgba(201,165,92,' + a + ')'; };
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
  var docCopy = '<rect x="-150" y="-210" width="300" height="420" rx="26" fill="' + FA('.14') + '" stroke="' + IV + '" stroke-width="7"/>' +
    '<circle cx="0" cy="-70" r="62" fill="none" stroke="' + GOLD + '" stroke-width="7"/><path d="M-80 40 H80 M-80 90 H80 M-80 140 H10" stroke="' + GOLD + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
  var dots = '';
  for (var j = 0; j < 4; j++) for (var i = 0; i < 5; i++)
    dots += '<circle class="fi" data-d="' + (0.9 + 0.06 * (j * 5 + i)).toFixed(2) + '" data-s=".2" cx="' + (360 + 90 * i) + '" cy="' + (450 + 75 * j) + '" r="9" fill="' + FA('.6') + '"/>';
  var H = [380, 230, 420, 330, 400], bars = '', lab = '';
  for (var b = 0; b < 5; b++) {
    bars += '<rect id="b' + b + '" x="' + (190 + 150 * b) + '" y="800" width="100" height="0" rx="10" fill="' + FA('.22') + '" stroke="' + IV + '" stroke-width="3"/>';
    lab += '<circle class="fi" data-d="' + (0.3 + 0.12 * b) + '" data-s=".2" cx="' + (240 + 150 * b) + '" cy="850" r="8" fill="' + FA('.7') + '"/>';
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
          r.setAttribute('fill', u > 3.2 ? (i === 1 ? '' + GA('.92') + '' : '' + FA('.11') + '') : '' + FA('.22') + '');
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
        '<g class="fi" data-d="4.4" data-y="-180"><path d="M540 650 C510 620 496 600 496 580 A44 44 0 1 1 584 580 C584 600 570 620 540 650 Z" fill="' + GOLD + '"/><circle cx="540" cy="580" r="15" fill="' + BG + '"/></g>' +
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
    },
    insure: {
      svg: '<path class="w dr" data-d=".1" data-t="1.3" d="M540 150 L780 240 V500 C780 680 660 800 540 880 C420 800 300 680 300 500 V240 Z"/>' +
        '<path class="g dr" data-d="1.4" data-t=".8" d="M440 500 l72 72 l128 -150"/>' +
        '<path class="g dr" data-d="2.4" data-t=".6" d="M850 200 v110 M795 255 h110"/>' +
        '<rect class="w dr" data-d="3.0" data-t=".8" x="760" y="700" width="190" height="150" rx="18"/>' +
        '<path class="g dr" data-d="3.6" data-t=".6" d="M795 750 H915 M795 790 H915 M795 825 H860"/>' +
        '<path class="g dr" data-d="4.3" data-t=".5" d="M120 760 h110 M120 800 h70"/>',
      upd: function () {}
    },
    cards: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.0" x="250" y="170" width="580" height="320" rx="36"/>' +
        '<path class="g dr" data-d=".9" data-t=".6" d="M250 270 H830"/>' +
        '<rect class="g dr" data-d="1.3" data-t=".6" x="305" y="345" width="92" height="72" rx="14"/>' +
        '<text class="fi" data-d="1.7" data-y="8" x="760" y="440" text-anchor="end" font-family="CG,serif" font-style="italic" font-size="50" fill="' + IV + '">банк 1</text>' +
        '<rect class="w dr" data-d="2.2" data-t="1.0" x="250" y="590" width="580" height="320" rx="36"/>' +
        '<path class="g dr" data-d="3.0" data-t=".6" d="M250 690 H830"/>' +
        '<rect class="g dr" data-d="3.4" data-t=".6" x="305" y="765" width="92" height="72" rx="14"/>' +
        '<text class="fi" data-d="3.8" data-y="8" x="760" y="860" text-anchor="end" font-family="CG,serif" font-style="italic" font-size="50" fill="' + IV + '">банк 2</text>' +
        '<path class="g dr" data-d="4.4" data-t=".6" d="M900 380 l30 30 l56 -64"/>' +
        '<path class="g dr" data-d="4.9" data-t=".6" d="M900 800 l30 30 l56 -64"/>',
      upd: function () {}
    },
    tracker: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.1" x="320" y="400" width="440" height="520" rx="50"/>' +
        '<path class="w dr" data-d=".7" data-t=".7" d="M470 400 V340 a24 24 0 0 1 24 -24 H586 a24 24 0 0 1 24 24 V400"/>' +
        '<circle class="g dr" data-d="1.6" data-t=".8" cx="540" cy="680" r="68"/>' +
        '<circle class="fi" data-d="2.4" data-s=".2" cx="540" cy="680" r="16" fill="' + GOLD + '"/>' +
        '<path class="g dr" data-d="3.0" data-t=".8" d="M845 560 a105 105 0 0 1 0 150 M885 520 a165 165 0 0 1 0 230"/>' +
        '<g class="fi" data-d="3.8" data-y="-120"><path d="M880 250 C850 220 836 200 836 180 A44 44 0 1 1 924 180 C924 200 910 220 880 250 Z" fill="' + GOLD + '"/><circle cx="880" cy="180" r="15" fill="' + BG + '"/></g>' +
        '<circle id="pr" cx="540" cy="680" r="10" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0"/>',
      upd: function (root, u) {
        var pr = root.querySelector('#pr');
        if (u < 3.0) { pr.setAttribute('opacity', 0); return; }
        var k = ((u - 3.0) % 1.5) / 1.5;
        pr.setAttribute('r', 70 + 70 * k); pr.setAttribute('opacity', 0.8 * (1 - k));
      }
    },
    power: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.1" x="330" y="300" width="420" height="520" rx="50"/>' +
        '<path class="g dr" data-d=".9" data-t=".7" d="M540 300 v-50 a36 36 0 0 1 36 -36 H730"/>' +
        '<path class="g dr" data-d="1.5" data-t=".9" d="M565 400 L470 590 H545 L515 730 L625 520 H550 Z"/>' +
        '<rect class="fi" data-d="2.6" data-s=".4" x="390" y="765" width="80" height="22" rx="8" fill="' + GOLD + '"/>' +
        '<rect class="fi" data-d="2.9" data-s=".4" x="500" y="765" width="80" height="22" rx="8" fill="' + GOLD + '"/>' +
        '<rect class="fi" data-d="3.2" data-s=".4" x="610" y="765" width="80" height="22" rx="8" fill="' + GOLD + '"/>' +
        '<text class="fi" data-d="3.7" data-y="8" x="540" y="930" text-anchor="middle" font-family="CG,serif" font-style="italic" font-size="56" fill="' + IV + '">только в ручной клади</text>',
      upd: function () {}
    },
    list: {
      svg: '<rect class="w dr" data-d=".1" data-t="1.2" x="330" y="200" width="420" height="680" rx="40"/>' +
        '<path class="w dr" data-d=".9" data-t=".5" d="M450 200 v-44 h180 v44"/>' +
        '<rect class="g dr" data-d="1.2" data-t=".5" x="395" y="330" width="62" height="62" rx="12"/>' +
        '<path class="w dr" data-d="1.4" data-t=".6" d="M495 361 H690"/>' +
        '<path class="g dr" data-d="2.0" data-t=".5" d="M406 362 l18 20 l34 -46"/>' +
        '<rect class="g dr" data-d="2.2" data-t=".5" x="395" y="480" width="62" height="62" rx="12"/>' +
        '<path class="w dr" data-d="2.4" data-t=".6" d="M495 511 H690"/>' +
        '<path class="g dr" data-d="3.0" data-t=".5" d="M406 512 l18 20 l34 -46"/>' +
        '<rect class="g dr" data-d="3.2" data-t=".5" x="395" y="630" width="62" height="62" rx="12"/>' +
        '<path class="w dr" data-d="3.4" data-t=".6" d="M495 661 H640"/>' +
        '<path class="g dr" data-d="4.0" data-t=".5" d="M406 662 l18 20 l34 -46"/>',
      upd: function () {}
    }
  };
})();
