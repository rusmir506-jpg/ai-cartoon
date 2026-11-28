// Browser-side logic for render_cards.js (carousel-style reel). window.TL is the timeline.
(function () {
  var TL = window.TL;
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var sm = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var out3 = function (x) { return 1 - Math.pow(1 - clamp(x), 3); };
  var n = TL.beats.length, E = TL.end.t0, PEND = [];
  window.settle = function () { var q = PEND; PEND = []; return Promise.all(q); };
  var scenes = $('scenes');
  TL.beats.forEach(function (b, i) {
    var el = document.createElement('div'); el.className = 'sc'; el.id = 'sc' + i;
    var c = b.card || {}, h = '';
    (b.shots || []).forEach(function (s, j) {
      h += '<div class="ph' + (c.type === 'tips' ? ' blur' : '') + '" id="ph' + i + '_' + j + '"><img id="pi' + i + '_' + j + '" src="file://' + s.file + '" style="width:' + s.iw + 'px;height:' + s.ih + 'px"></div>';
    });
    h += '<div class="shade ' + (c.type || '') + '"></div>';
    if (c.type === 'cover' && TL.style === 'luxe') {
      var parts = c.l1.split(' '), num = parts.shift(), word = parts.join(' ');
      h += '<div class="blk" style="top:560px;text-align:center"><div class="nk" id="a' + i + '">' + c.kick + '</div><div class="n5" id="b' + i + '">' + num + '<svg viewBox="0 0 300 400" preserveAspectRatio="none"><ellipse id="el' + i + '" cx="150" cy="200" rx="142" ry="192"/></svg></div><div class="nw" id="c' + i + '"><span>' + word + '</span></div><div class="n2" id="d' + i + '">' + c.l2 + '</div></div>';
    } else if (c.type === 'fact' && TL.style === 'luxe') {
      if (c.anim && window.ANIM[c.anim]) h += '<div class="abg"></div><svg class="anim" id="an' + i + '" viewBox="0 0 1080 1080">' + window.ANIM[c.anim].svg + '</svg>';
      h += '<div class="lpanel' + (c.anim ? ' low' : '') + '" id="nt' + i + '"><div class="lnum">0' + parseInt(c.n, 10) + '</div><div class="lline"></div><div class="ltitle">' + c.name + '</div><div class="lsub">' + c.sub + '</div><svg class="tick" viewBox="0 0 100 100"><path id="tk' + i + '" d="M16 54 L40 78 L86 22"/></svg></div>';
    } else
    if (c.type === 'cover') {
      if (TL.style === 'greek') {
        var lets = c.l1.split('').map(function (ch, k) { return '<span class="lt" id="lt' + i + '_' + k + '">' + ch + '</span>'; }).join('');
        h += '<div class="blk" style="top:700px;text-align:center"><div class="cg it kick" id="a' + i + '">' + c.kick + '</div><div class="os big" id="b' + i + '" style="font-size:' + Math.min(400, Math.floor(900 / (c.l1.length * 0.68))) + 'px;letter-spacing:.06em;opacity:1">' + lets + '</div><div class="os mid" id="c' + i + '" style="font-size:' + Math.min(150, Math.floor(900 / (c.l2.length * 0.8))) + 'px;letter-spacing:.1em">' + c.l2 + '</div><div class="mt cap" id="d' + i + '">' + c.sub + '</div></div>';
      } else
      h += '<div class="blk" style="top:740px"><div class="cg it" id="a' + i + '">' + c.kick + '</div><div class="os big" id="b' + i + '" style="font-size:' + (c.l1.length > 8 ? 176 : (c.l1.length > 7 ? 196 : (c.l1.length > 6 ? 232 : 300))) + 'px">' + c.l1 + '</div><div class="os mid" id="c' + i + '">' + c.l2 + '</div><div class="mt cap" id="d' + i + '">' + c.sub + '</div></div>';
    } else if (c.type === 'place') {
      h += '<div class="blk" style="top:930px"><div class="cg num" id="n' + i + '">' + c.n + '</div><div class="clip"><div class="os name" id="nm' + i + '" style="font-size:' + (c.name.length > 11 ? 104 : 136) + 'px">' + c.name + '</div></div><div class="mt sub" id="sb' + i + '">' + c.sub + '</div><div class="rule" id="ru' + i + '"></div>' +
        '<div class="temps" id="tp' + i + '"><div class="tt"><span class="mt lab">днём</span><span class="os val" id="av' + i + '">+0°</span></div><div class="sep"></div><div class="tt"><span class="mt lab">вода</span><span class="os val" id="wv' + i + '">+0°</span></div></div></div>';
    } else if (c.type === 'fact') {
      h += '<div class="blk" style="top:930px"><div class="cg num" id="n' + i + '">' + c.n + '</div><div class="clip"><div class="os name" id="nm' + i + '" style="font-size:' + (c.name.length > 14 ? 100 : (c.name.length > 10 ? 118 : 136)) + 'px">' + c.name + '</div></div><div class="mt sub fsub" id="sb' + i + '">' + c.sub + '</div></div>';
    } else if (c.type === 'tips') {
      h += '<div class="blk" style="top:520px"><div class="os tt1" id="t' + i + '">' + c.title + '</div>';
      c.items.forEach(function (it, k) { h += '<div class="row" id="r' + i + '_' + k + '"><div class="cg rn">0' + (k + 1) + '</div><div><div class="os rt">' + it[0] + '</div><div class="mt rs">' + it[1] + '</div></div></div>'; });
      h += '</div>';
    }
    if (TL.style === 'greek') h += '<div class="gframe"></div>';
    h += '<div class="dim" id="dim' + i + '"></div>';
    el.innerHTML = h; scenes.appendChild(el);
  });
  var dots = $('dots'); for (var k = 0; k < n - 1; k++) { var d = document.createElement('div'); d.className = 'dot'; d.id = 'dot' + k; dots.appendChild(d); }
  var places = TL.beats.filter(function (b) { return b.card && (b.card.type === 'place' || b.card.type === 'fact'); }).length;

  function rv(id, u, delay, dy) { var e = $(id); if (!e) return; var o = out3((u - delay) / 0.6); e.style.opacity = o; e.style.transform = 'translateY(' + ((1 - o) * dy) + 'px)'; }

  window.render = function (t) {
    var FORCE = !!window.FORCE;
    TL.beats.forEach(function (b, i) {
      var el = $('sc' + i), nextT = (i + 1 < n) ? TL.beats[i + 1].t0 : E;
      var on = t >= b.t0 - 0.001 && t < nextT + 0.62;
      el.style.display = on ? 'block' : 'none'; if (!on) return;
      var tu = t - b.t0, u = FORCE ? 99 : tu, x = 0, dim = 0, c = b.card || {};
      if (i > 0 && tu < 0.55) x = (1 - out3(tu / 0.55)) * 1080;
      if (t > nextT) { var q = out3((t - nextT) / 0.55); x = -q * 300; dim = 0.55 * q; }
      el.style.transform = 'translateX(' + x + 'px)'; el.style.zIndex = i + 1; $('dim' + i).style.opacity = dim;
      (b.shots || []).forEach(function (s, j) {
        var ph = $('ph' + i + '_' + j), nx = b.shots[j + 1], endS = nx ? nx.t0 + 0.45 : nextT + 0.62;
        var vis = t >= s.t0 - 0.001 && t < endS; ph.style.display = vis ? 'block' : 'none'; if (!vis) return;
        ph.style.opacity = j === 0 ? 1 : clamp((t - s.t0) / 0.45);
        if (s.frames) {                                  // video clip: show the frame for this moment
          var idx = Math.min(s.n, Math.max(1, Math.floor((t - s.t0) * s.fps) + 1)), im = $('pi' + i + '_' + j);
          if (im.getAttribute('data-idx') !== String(idx)) {
            im.setAttribute('data-idx', String(idx));
            im.src = 'file://' + s.frames + '/' + ('00000' + idx).slice(-5) + '.jpg';
            PEND.push(im.decode().catch(function () {}));
          }
          im.style.transform = 'none'; return;
        }
        var span = Math.max(0.1, (nx ? nx.t0 : b.t1) - s.t0), uu = sm((t - s.t0) / span);
        var z = s.z0 + (s.z1 - s.z0) * uu, cx = s.cx0 + (s.cx1 - s.cx0) * uu, cy = s.cy0 + (s.cy1 - s.cy0) * uu;
        var base = Math.min(s.iw, s.ih * 9 / 16), w = base / z, hh = w * 16 / 9;
        var px = clamp(cx * s.iw - w / 2, 0, s.iw - w), py = clamp(cy * s.ih - hh / 2, 0, s.ih - hh), k = 1080 / w;
        $('pi' + i + '_' + j).style.transform = 'scale(' + k + ') translate(' + (-px) + 'px,' + (-py) + 'px)';
      });
      if (TL.style === 'luxe' && c.type === 'cover') {
        rv('a' + i, u, 0.3, 24); rv('b' + i, u, 0.55, 80); rv('c' + i, u, 1.35, 40); rv('d' + i, u, 1.85, 24);
        var el = $('el' + i); if (el) { var dr = out3((u - 0.95) / 0.7); el.style.strokeDasharray = '1060'; el.style.strokeDashoffset = String((1 - dr) * 1060); }
      } else if (TL.style === 'luxe' && c.type === 'fact') {
        var o1 = out3((u - 0.35) / 0.6), nt = $('nt' + i), tk = clamp((u - 1.7) / 0.5);
        nt.style.opacity = o1;
        nt.style.transform = 'translateY(' + ((1 - o1) * 80) + 'px)';
        if (c.anim && window.ANIM[c.anim]) { var ar = $('an' + i); if (!el._p) { window.ANIMH.prep(ar); el._p = 1; } window.ANIMH.run(ar, u); window.ANIM[c.anim].upd(ar, u); }
        $('tk' + i).style.strokeDashoffset = String((1 - tk) * 130);
      }
      if (c.type === 'cover' && TL.style !== 'luxe') {
        if (TL.style === 'greek') {
          rv('a' + i, u, 0.3, 24);
          c.l1.split('').forEach(function (ch, k) { var e = $('lt' + i + '_' + k), o = out3((u - 0.55 - k * 0.18) / 0.6); e.style.opacity = o; e.style.transform = 'translateY(' + ((1 - o) * 70) + 'px) scale(' + (0.9 + 0.1 * o) + ')'; });
          var dl = 0.55 + c.l1.length * 0.18 + 0.2; rv('c' + i, u, dl, 30); rv('d' + i, u, dl + 0.5, 20);
        } else { rv('a' + i, u, 0.45, 30); rv('b' + i, u, 0.6, 60); rv('c' + i, u, 0.78, 40); rv('d' + i, u, 1.05, 24); }
      }
      if (c.type === 'place') {
        rv('n' + i, u, 0.35, 40); rv('nm' + i, u, 0.45, 170); rv('sb' + i, u, 0.72, 24);
        var ru = $('ru' + i), ro = out3((u - 0.85) / 0.5); ru.style.opacity = ro; ru.style.transform = 'scaleX(' + ro + ')';
        rv('tp' + i, u, 0.95, 24); var cn = out3((u - 0.95) / 1.0);
        $('av' + i).textContent = '+' + Math.round(c.air * cn) + '°'; $('wv' + i).textContent = '+' + Math.round(c.water * cn) + '°';
      }
      if (c.type === 'fact') { rv('n' + i, u, 0.35, 40); rv('nm' + i, u, 0.45, 170); rv('sb' + i, u, 0.75, 24); }
      if (c.type === 'tips') { rv('t' + i, u, 0.4, 40); c.items.forEach(function (it, k) { rv('r' + i + '_' + k, u, 0.75 + 0.4 * k, 40); }); }
    });
    // overlays
    var ov = 1 - clamp((t - (E - 0.15)) / 0.3); $('top').style.opacity = ov; $('dots').style.opacity = ov * clamp((t - TL.beats[1].t0) / 0.4); $('hint').style.opacity = 0;
    if (TL.style === 'luxe') {                      // checklist at the top: one bar per tip, filled when its tick is drawn
      var fb = []; TL.beats.forEach(function (b, i) { if (b.card && (b.card.type === 'fact' || b.card.type === 'place')) fb.push(i); });
      var chk = $('chk');
      if (!chk.children.length) fb.forEach(function () { var d = document.createElement('div'); d.className = 'cb'; d.innerHTML = '<i></i>'; chk.appendChild(d); });
      chk.style.opacity = clamp((t - TL.beats[fb[0]].t0) / 0.3) * ov;
      fb.forEach(function (bi, k) { var bb = TL.beats[bi]; chk.children[k].firstChild.style.width = (100 * clamp((window.FORCE ? 99 : (t - (bb.t0 + 1.7))) / 0.4)) + '%'; });
    }
    var cur = -1; TL.beats.forEach(function (b, i) { var nx = (i + 1 < n) ? TL.beats[i + 1].t0 : E; if (t >= b.t0 + 0.25 && t < nx) cur = i; });
    var cb = cur >= 0 ? TL.beats[cur].card : null, cnt = $('cnt');
    $('top').style.color = (TL.theme === 'light' && cb && cb.anim) ? '#2A3F41' : '#fff'; $('top').style.textShadow = (TL.theme === 'light' && cb && cb.anim) ? 'none' : '';
    if (cb && (cb.type === 'place' || cb.type === 'fact')) { cnt.textContent = cb.n + ' / 0' + places; cnt.style.opacity = 1; } else cnt.style.opacity = 0;
    for (var k2 = 0; k2 < n - 1; k2++) {
      var bt = TL.beats[k2 + 1], nt = (k2 + 2 < n) ? TL.beats[k2 + 2].t0 : E;
      var s1 = clamp((t - (bt.t0 + 0.15)) / 0.3) * (1 - clamp((t - (nt + 0.15)) / 0.3));
      var dd = $('dot' + k2); dd.style.width = (12 + 32 * s1) + 'px'; dd.style.background = 'rgba(255,255,255,' + (0.45 + 0.55 * s1) + ')';
    }
    var h0 = TL.beats[1].t0 + 0.7, hh0 = clamp((t - h0) / 0.4) * (1 - clamp((t - (h0 + 2.2)) / 0.4)); $('hint').style.opacity = hh0 * ov;
    // end card
    var eu = t - E, p = out3(eu / 0.6), en = $('end');
    en.style.display = eu >= -0.001 ? 'block' : 'none'; en.style.transform = 'translateX(' + ((1 - p) * 1080) + 'px)';
    $('elogo').style.opacity = FORCE ? 1 : out3((eu - 0.5) / 0.7);
    var tg = $('etag'), tq = FORCE ? 1 : out3((eu - 1.1) / 0.7); tg.style.opacity = tq; tg.style.transform = 'translateY(' + ((1 - tq) * 24) + 'px)';
  };
})();
