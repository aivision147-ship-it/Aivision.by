/*! WeddingFrames — векторные рамки, разделители и виньетки для конструктора aivision.by
 *  Рамка рисуется как inline-SVG ровно в пикселях блока (viewBox = реальная ширина × высота),
 *  поэтому углы никогда не растягиваются, а прямые стороны просто становятся длиннее/короче.
 *  Цвет/толщина/прозрачность — CSS-переменные: --frame-color, --accent-color, --frame-stroke,
 *  --frame-opacity; геометрия — --frame-inset, --frame-scale (читаются JS при перерисовке).
 */
(function (root) {
  'use strict';
  var R = function (n) { return Math.round(n * 100) / 100; };
  var R4 = function (n) { return Math.round(n * 10000) / 10000; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var uid = 0;

  var CSS = '.wf-l{fill:none;stroke:var(--frame-color,#8c7355);stroke-width:var(--frame-stroke,1.5px);stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}' +
    '.wf-t{stroke-width:calc(var(--frame-stroke,1.5px)*.6)}' +
    '.wf-b{stroke-width:calc(var(--frame-stroke,1.5px)*2.4)}' +
    '.wf-as{stroke:var(--accent-color,#b8955a)}' +
    '.wf-d{fill:none;stroke:var(--frame-color,#8c7355);stroke-linecap:round}' +
    '.wf-f{fill:var(--frame-color,#8c7355);stroke:none}' +
    '.wf-a{fill:var(--accent-color,#b8955a);stroke:none}';

  /* ---------- геометрические помощники ---------- */
  // 4 угла: markup нарисован для левого верхнего угла (начало координат = угол линии рамки, x вправо, y вниз)
  function corners(m, p, which) {
    var k = p.c / 100, W = p.W, H = p.H, i = p.i;
    var pos = [[i, i, 1, 1], [W - i, i, -1, 1], [W - i, H - i, -1, -1], [i, H - i, 1, -1]];
    var out = '';
    pos.forEach(function (q, j) {
      if (which && which.indexOf(j) < 0) return;
      out += '<g style="--ik1:' + R4(1 / k) + '" transform="translate(' + R(q[0]) + ' ' + R(q[1]) + ') scale(' + R(q[2] * k) + ' ' + R(q[3] * k) + ')">' + m + '</g>';
    });
    return out;
  }
  // прямые стороны между угловыми элементами. off/start — в единицах угла (×k)
  function edges(p, off, start, cls) {
    var k = p.c / 100, i = p.i, W = p.W, H = p.H, o = off * k, s = start * k;
    var d = 'M' + R(i + s) + ' ' + R(i + o) + 'H' + R(W - i - s) +
      'M' + R(i + s) + ' ' + R(H - i - o) + 'H' + R(W - i - s) +
      'M' + R(i + o) + ' ' + R(i + s) + 'V' + R(H - i - s) +
      'M' + R(W - i - o) + ' ' + R(i + s) + 'V' + R(H - i - s);
    return '<path class="' + (cls || 'wf-l') + '" d="' + d + '"/>';
  }
  function at(m, x, y, k, rot) {
    return '<g style="--ik1:' + R4(1 / k) + '" transform="translate(' + R(x) + ' ' + R(y) + ')' + (rot ? ' rotate(' + rot + ')' : '') + ' scale(' + R(k) + ')">' + m + '</g>';
  }
  function diamond(cx, cy, r, cls) {
    return '<path class="' + (cls || 'wf-a') + '" d="M' + R(cx) + ' ' + R(cy - r) + 'L' + R(cx + r) + ' ' + R(cy) + ' ' + R(cx) + ' ' + R(cy + r) + ' ' + R(cx - r) + ' ' + R(cy) + 'Z"/>';
  }
  // кубическая кривая Безье
  function bz(P, t) {
    var u = 1 - t;
    return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0],
      u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]];
  }
  function bzAngle(P, t) {
    var a = bz(P, Math.max(0, t - 0.01)), b = bz(P, Math.min(1, t + 0.01));
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  }
  var LEAF = 'M0 0C.25-.3.68-.32 1 0C.68.32.25.3 0 0Z';
  // веточка: стебель (набор кубических сегментов) + листья попеременно
  function sprig(segs, leaves, opt) {
    opt = opt || {};
    var d = 'M' + segs[0][0].join(' ');
    segs.forEach(function (P) { d += 'C' + [P[1], P[2], P[3]].map(function (q) { return R(q[0]) + ' ' + R(q[1]); }).join(' '); });
    var out = '<path class="wf-l" d="' + d + '"/>';
    leaves.forEach(function (L, j) {
      var P = segs[L[0]], t = L[1], pt = bz(P, t), a = bzAngle(P, t) + (L[3] || (j % 2 ? 38 : -38));
      out += '<path class="wf-l" style="--ik2:' + R4(1 / L[2]) + '" transform="translate(' + R(pt[0]) + ' ' + R(pt[1]) + ') rotate(' + R(a) + ') scale(' + R(L[2]) + ')" d="' + LEAF + '"/>';
    });
    (opt.berries || []).forEach(function (b) { out += '<circle class="wf-a" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>'; });
    return out;
  }
  // «крестиковая» вышивка: сетка из строк, X = основной цвет, o = акцент
  function stitch(rows, cs, ox, oy) {
    var dm = '', da = '', q = cs * 0.84, pad = cs * 0.08;
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var ch = row[x]; if (ch === '.') continue;
        var s = 'M' + R(ox + x * cs + pad) + ' ' + R(oy + y * cs + pad) + 'h' + R(q) + 'v' + R(q) + 'h' + R(-q) + 'z';
        if (ch === 'o') da += s; else dm += s;
      }
    });
    return (dm ? '<path class="wf-f" d="' + dm + '"/>' : '') + (da ? '<path class="wf-a" d="' + da + '"/>' : '');
  }
  var BY_TILE = [
    '.......X.......',
    '......XXX......',
    '.....XX.XX.....',
    'X...XX.o.XX...X',
    'XX.XX.ooo.XX.XX',
    '.XXX.oo.oo.XXX.',
    'XX.XX.ooo.XX.XX',
    'X...XX.o.XX...X',
    '.....XX.XX.....',
    '......XXX......',
    '.......X.......'];
  var BY_MINI = [
    '...X....',
    '..X.X...',
    '.X.o.X..',
    'X.ooo.X.',
    '.X.o.X..',
    '..X.X...',
    '...X....'];

  /* ---------- части (для отдельных файлов и для сборки) ---------- */
  var PART = {
    classic: '<path class="wf-l" d="M0 18A18 18 0 0 0 18 0"/><path class="wf-l wf-t" d="M7 24A25 25 0 0 0 24 7"/>' +
      '<path class="wf-l wf-t" d="M20 20C26 26 36 23 34.5 16.5C33.2 11.5 27 12.5 28 17M20 20C26 26 23 36 16.5 34.5C11.5 33.2 12.5 27 17 28"/>' +
      '<path class="wf-a" d="M0-5.5L5.5 0 0 5.5-5.5 0Z"/>',
    notch: '<path class="wf-l" d="M0 16H16V0"/><path class="wf-l wf-t" d="M6 22H22V6"/><path class="wf-a" d="M8 3L13 8 8 13 3 8Z"/>',
    deco: '<path class="wf-l" d="M0 34H6V20H20V6H34V0"/><path class="wf-l wf-t" d="M10 44V30H30V10H44"/><path class="wf-a" d="M13 9.5L16.5 13 13 16.5 9.5 13Z"/>',
    decoFan: (function () {
      var s = '<path class="wf-a" d="M-7 0A7 7 0 0 0 7 0Z"/>', d = '';
      for (var a = 15; a < 180; a += 15) {
        var r = a * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r), L = (a % 45 === 0 ? 20 : (a % 30 === 0 ? 17 : 14.5));
        d += 'M' + R(c * 10) + ' ' + R(sn * 10) + 'L' + R(c * L) + ' ' + R(sn * L);
      }
      return s + '<path class="wf-l wf-as" d="' + d + '"/>';
    })(),
    vintage: '<path class="wf-l" d="M8 8C30 3 52 3 72 10C84 14.5 86 26 76 28.5C68 30.5 64.5 22.5 70.5 20.5"/>' +
      '<path class="wf-l" d="M8 8C3 30 3 52 10 72C14.5 84 26 86 28.5 76C30.5 68 22.5 64.5 20.5 70.5"/>' +
      '<path class="wf-l wf-t" d="M8 8C16 17 25 22 31 19C35.5 16.5 33.5 11 29.5 12.5M8 8C17 16 22 25 19 31C16.5 35.5 11 33.5 12.5 29.5"/>' +
      '<circle class="wf-a" cx="8" cy="8" r="3.4"/><circle class="wf-a" cx="88" cy="10" r="1.8"/><circle class="wf-a" cx="10" cy="88" r="1.8"/>',
    botanical: sprig([
      [[6, 150], [2, 96], [14, 40], [52, 16]],
      [[52, 16], [80, 0], [118, 2], [150, 6]]],
      [[0, .16, 14], [0, .32, 17], [0, .48, 19], [0, .64, 20], [0, .8, 19], [1, .14, 19], [1, .3, 18], [1, .46, 16], [1, .62, 14], [1, .78, 12], [1, 1, 12, 0]],
      {}) + (function () {
        var P = [[6, 150], [2, 96], [14, 40], [52, 16]], a = bz(P, .62), b = bz(P, .8);
        return '<path class="wf-l wf-t" d="M' + R(a[0]) + ' ' + R(a[1]) + 'Q' + R(a[0] + 10) + ' ' + R(a[1] + 2) + ' ' + R(a[0] + 18) + ' ' + R(a[1] + 10) +
          'M' + R(b[0]) + ' ' + R(b[1]) + 'Q' + R(b[0] + 8) + ' ' + R(b[1] + 4) + ' ' + R(b[0] + 12) + ' ' + R(b[1] + 14) + '"/>' +
          '<circle class="wf-a" cx="' + R(a[0] + 18) + '" cy="' + R(a[1] + 10) + '" r="2.6"/><circle class="wf-a" cx="' + R(b[0] + 12) + '" cy="' + R(b[1] + 14) + '" r="2.2"/>';
      })(),
    sprigSmall: sprig([[[0, 0], [12, -2.5], [28, -3.5], [46, -1]]], [[0, .18, 8], [0, .38, 8.5], [0, .58, 8], [0, .78, 7], [0, 1, 6, 0]])
  };

  /* ---------- 12 рамок ---------- */
  function rect(x, y, w, h, cls) { return '<rect class="' + cls + '" x="' + R(x) + '" y="' + R(y) + '" width="' + R(w) + '" height="' + R(h) + '"/>'; }
  var FRAMES = [
    { id: 'thin', name_ru: 'Тонкая одинарная', divider: 'line-dot', mark: 'rings', accent: false,
      draw: function (p) { return rect(p.i, p.i, p.W - 2 * p.i, p.H - 2 * p.i, 'wf-l'); },
      safe: function (p) { return { t: p.i + 22, r: p.i + 18, b: p.i + 22, l: p.i + 18 }; } },
    { id: 'double', name_ru: 'Двойная (толстая + тонкая)', divider: 'double', mark: 'rings', accent: false,
      draw: function (p) { var g = Math.max(5 * p.u, p.su * 3.5) + p.su * 1.2;
        return rect(p.i, p.i, p.W - 2 * p.i, p.H - 2 * p.i, 'wf-l wf-b') + rect(p.i + g, p.i + g, p.W - 2 * (p.i + g), p.H - 2 * (p.i + g), 'wf-l wf-t'); },
      safe: function (p) { var g = Math.max(5 * p.u, p.su * 3.5) + p.su * 1.2; return { t: p.i + g + 22, r: p.i + g + 16, b: p.i + g + 22, l: p.i + g + 16 }; } },
    { id: 'arch', name_ru: 'Арка', divider: 'diamond', mark: 'rings', accent: true,
      geo: function (p) { var aw = Math.min(p.W - 2 * p.i, (p.H - 2 * p.i) * 0.74); return { aw: aw, x0: (p.W - aw) / 2, r: aw / 2, g: Math.max(6 * p.u, p.su * 4) }; },
      draw: function (p) {
        var G = this.geo(p), x0 = G.x0, x1 = x0 + G.aw, r = G.r, g = G.g, cy = p.i + r, b = p.H - p.i;
        var o = 'M' + R(x0) + ' ' + R(b) + 'V' + R(cy) + 'A' + R(r) + ' ' + R(r) + ' 0 0 1 ' + R(x1) + ' ' + R(cy) + 'V' + R(b) + 'Z';
        var n = 'M' + R(x0 + g) + ' ' + R(b - g) + 'V' + R(cy) + 'A' + R(r - g) + ' ' + R(r - g) + ' 0 0 1 ' + R(x1 - g) + ' ' + R(cy) + 'V' + R(b - g) + 'Z';
        var k = 3 * p.u + p.su * 1.6;
        return '<path class="wf-l" d="' + o + '"/><path class="wf-l wf-t" d="' + n + '"/>' + diamond(p.W / 2, p.i, k) +
          diamond(x0, b, k * .7) + diamond(x1, b, k * .7);
      },
      safe: function (p) { var G = this.geo(p); return { t: p.i + G.r * 0.42 + 10, r: G.x0 + G.g + 16, b: p.i + G.g + 22, l: G.x0 + G.g + 16 }; } },
    { id: 'classic', name_ru: 'Классические фигурные уголки', divider: 'scroll', mark: 'flourish', accent: true,
      draw: function (p) { return edges(p, 0, 18) + edges(p, 7, 24, 'wf-l wf-t') + corners(PART.classic, p); },
      safe: function (p) { var k = p.c / 100; return { t: p.i + 30 * k + 14, r: p.i + 7 * k + 16, b: p.i + 30 * k + 14, l: p.i + 7 * k + 16 }; } },
    { id: 'notch', name_ru: 'Рамка с вырезанными углами', divider: 'deco', mark: 'fan', accent: true,
      draw: function (p) { return edges(p, 0, 16) + edges(p, 6, 22, 'wf-l wf-t') + corners(PART.notch, p); },
      safe: function (p) { var k = p.c / 100; return { t: p.i + 22 * k + 16, r: p.i + 6 * k + 16, b: p.i + 22 * k + 16, l: p.i + 6 * k + 16 }; } },
    { id: 'deco', name_ru: 'Арт-деко ступенчатая', divider: 'deco', mark: 'fan', accent: true,
      draw: function (p) { var k = p.c / 100;
        return edges(p, 0, 34) + edges(p, 10, 44, 'wf-l wf-t') + corners(PART.deco, p) +
          at(PART.decoFan, p.W / 2, p.i, k) + at(PART.decoFan, p.W / 2, p.H - p.i, k, 180); },
      safe: function (p) { var k = p.c / 100; return { t: p.i + 30 * k + 14, r: p.i + 10 * k + 16, b: p.i + 30 * k + 14, l: p.i + 10 * k + 16 }; } },
    { id: 'vintage', name_ru: 'Винтажные вензеля по углам', divider: 'scroll', mark: 'flourish', accent: true,
      draw: function (p) { return corners(PART.vintage, p); },
      safe: function (p) { var k = p.c / 100; return { t: p.i + 34 * k + 8, r: p.i + 14, b: p.i + 34 * k + 8, l: p.i + 14 }; } },
    { id: 'pearl', name_ru: 'Жемчужный пунктир', divider: 'pearls', mark: 'rings', accent: true,
      draw: function (p) {
        var i = p.i, W = p.W, H = p.H, d = Math.max(2.6 * p.u, p.su * 2), g0 = d * 2.5, out = '';
        [[i, i, W - i, i], [i, H - i, W - i, H - i], [i, i, i, H - i], [W - i, i, W - i, H - i]].forEach(function (L) {
          var len = Math.abs(L[2] - L[0]) + Math.abs(L[3] - L[1]), g = len / Math.max(2, Math.round(len / g0));
          out += '<path class="wf-d" style="stroke-width:' + R(d) + 'px;stroke-dasharray:0 ' + R(g) + 'px" d="M' + R(L[0]) + ' ' + R(L[1]) + 'L' + R(L[2]) + ' ' + R(L[3]) + '"/>';
        });
        var j = i + d + 5 * p.u;
        out += rect(j, j, W - 2 * j, H - 2 * j, 'wf-l wf-t');
        [[i, i], [W - i, i], [W - i, H - i], [i, H - i]].forEach(function (q) { out += '<circle class="wf-a" cx="' + R(q[0]) + '" cy="' + R(q[1]) + '" r="' + R(d * 1.05) + '"/>'; });
        [i, H - i].forEach(function (y) {
          out += '<circle class="wf-a" cx="' + R(W / 2) + '" cy="' + R(y) + '" r="' + R(d * 1.3) + '"/>';
        });
        return out;
      },
      safe: function (p) { var d = Math.max(2.6 * p.u, p.su * 2); return { t: p.i + d + 26, r: p.i + d + 18, b: p.i + d + 26, l: p.i + d + 18 }; } },
    { id: 'belarus', name_ru: 'Белорусская орнаментальная полоса', divider: 'belarus', mark: 'star', accent: true,
      geo: function (p) { var aw = p.W - 2 * p.i, cs0 = Math.max(2.4 * p.u, p.c / 26), tw0 = cs0 * 15, n = Math.max(3, Math.round(aw / tw0)), cs = aw / (n * 15);
        return { cs: cs, n: n, aw: aw, band: cs * 11, gap: cs * 1.8 }; },
      draw: function (p) {
        var G = this.geo(p), id = 'wfby' + (++uid), i = p.i, W = p.W, H = p.H, tw = G.cs * 15;
        var top = i + G.gap, bot = H - i - G.gap - G.band;
        var out = '<defs><pattern id="' + id + '" patternUnits="userSpaceOnUse" x="' + R(i) + '" y="0" width="' + R(tw) + '" height="' + R(H) + '">' +
          stitch(BY_TILE, G.cs, 0, top) + stitch(BY_TILE, G.cs, 0, bot) + '</pattern></defs>';
        out += '<rect x="' + R(i) + '" y="' + R(top) + '" width="' + R(G.aw) + '" height="' + R(G.band) + '" fill="url(#' + id + ')"/>';
        out += '<rect x="' + R(i) + '" y="' + R(bot) + '" width="' + R(G.aw) + '" height="' + R(G.band) + '" fill="url(#' + id + ')"/>';
        var l1 = i, l2 = top + G.band + G.gap, l3 = bot - G.gap, l4 = H - i;
        out += '<path class="wf-l" d="M' + R(i) + ' ' + R(l1) + 'H' + R(W - i) + 'M' + R(i) + ' ' + R(l2) + 'H' + R(W - i) +
          'M' + R(i) + ' ' + R(l3) + 'H' + R(W - i) + 'M' + R(i) + ' ' + R(l4) + 'H' + R(W - i) + '"/>';
        return out;
      },
      safe: function (p) { var G = this.geo(p), e = p.i + G.band + G.gap * 2 + 18; return { t: e, r: p.i + 14, b: e, l: p.i + 14 }; } },
    { id: 'oval', name_ru: 'Овал-медальон', divider: 'diamond', mark: 'rings', accent: true,
      geo: function (p) { var a = 0.64, ry = Math.min((p.H - 2 * p.i) / 2, (p.W - 2 * p.i) / 2 / a); return { rx: ry * a, ry: ry, g: Math.max(6 * p.u, p.su * 4) }; },
      draw: function (p) {
        var G = this.geo(p), cx = p.W / 2, cy = p.H / 2, k = 3 * p.u + p.su * 1.6;
        return '<ellipse class="wf-l" cx="' + R(cx) + '" cy="' + R(cy) + '" rx="' + R(G.rx) + '" ry="' + R(G.ry) + '"/>' +
          '<ellipse class="wf-l wf-t" cx="' + R(cx) + '" cy="' + R(cy) + '" rx="' + R(G.rx - G.g) + '" ry="' + R(G.ry - G.g) + '"/>' +
          diamond(cx, cy - G.ry, k) + diamond(cx, cy + G.ry, k) +
          '<circle class="wf-a" cx="' + R(cx - G.rx) + '" cy="' + R(cy) + '" r="' + R(k * .55) + '"/><circle class="wf-a" cx="' + R(cx + G.rx) + '" cy="' + R(cy) + '" r="' + R(k * .55) + '"/>';
      },
      safe: function (p) { var G = this.geo(p); return { t: p.H / 2 - G.ry * 0.74, r: p.W / 2 - G.rx * 0.82, b: p.H / 2 - G.ry * 0.74, l: p.W / 2 - G.rx * 0.82 }; } },
    { id: 'minimal', name_ru: 'Минимализм: линии сверху и снизу', divider: 'diamond', mark: 'rings', accent: true,
      draw: function (p) {
        var Lw = Math.min(p.W - 2 * p.i, Math.max(220 * p.u, p.W * 0.62), 560 * p.u), x0 = (p.W - Lw) / 2, x1 = x0 + Lw, cx = p.W / 2, k = 4 * p.u + p.su * 1.5, gp = k + 8 * p.u, out = '';
        [p.i + 6 * p.u, p.H - p.i - 6 * p.u].forEach(function (y) {
          out += '<path class="wf-l" d="M' + R(x0) + ' ' + R(y) + 'H' + R(cx - gp) + 'M' + R(cx + gp) + ' ' + R(y) + 'H' + R(x1) + '"/>' + diamond(cx, y, k) +
            '<circle class="wf-f" cx="' + R(x0) + '" cy="' + R(y) + '" r="' + R(p.su + 1.2 * p.u) + '"/><circle class="wf-f" cx="' + R(x1) + '" cy="' + R(y) + '" r="' + R(p.su + 1.2 * p.u) + '"/>';
        });
        return out;
      },
      safe: function (p) { return { t: p.i + 34, r: p.i + 14, b: p.i + 34, l: p.i + 14 }; } },
    { id: 'botanical', name_ru: 'Ботанический уголок (веточка)', divider: 'sprig', mark: 'wreath', accent: true,
      draw: function (p) { return corners(PART.botanical, p, [0, 2]); },
      safe: function (p) { var k = p.c / 100; return { t: p.i + 40 * k + 10, r: p.i + 16, b: p.i + 40 * k + 10, l: p.i + 16 }; } }
  ];

  /* ---------- 8 разделителей (viewBox 0 0 240 24) ---------- */
  function fanRays(cx, cy, r1, r2, from, to, step, cls) {
    var d = '';
    for (var a = from; a <= to + 0.01; a += step) { var t = a * Math.PI / 180; d += 'M' + R(cx + Math.cos(t) * r1) + ' ' + R(cy + Math.sin(t) * r1) + 'L' + R(cx + Math.cos(t) * r2) + ' ' + R(cy + Math.sin(t) * r2); }
    return '<path class="' + cls + '" d="' + d + '"/>';
  }
  var DIVIDERS = {
    'line-dot': { name_ru: 'Линия с точкой', svg: '<path class="wf-l" d="M24 12H110M130 12H216"/><circle class="wf-a" cx="120" cy="12" r="3"/>' },
    'double': { name_ru: 'Двойная линия', svg: '<path class="wf-l wf-b" d="M44 10H196"/><path class="wf-l wf-t" d="M70 15.5H170"/>' },
    'diamond': { name_ru: 'Линии с ромбом', svg: '<path class="wf-l" d="M16 12H100M140 12H224"/>' + diamond(120, 12, 6.5) + diamond(106, 12, 2.4, 'wf-f') + diamond(134, 12, 2.4, 'wf-f') },
    'deco': { name_ru: 'Арт-деко веер', svg: '<path class="wf-l" d="M18 17H100M140 17H222"/><path class="wf-l wf-t" d="M56 21H184"/><path class="wf-a" d="M113 17A7 7 0 0 1 127 17Z"/>' + fanRays(120, 17, 9.5, 15, 202.5, 337.5, 22.5, 'wf-l wf-as') },
    'scroll': { name_ru: 'Завиток', svg: (function () {
      var r = 'M127 12C137 5 149 4.5 157 10.5C162 14.5 158.5 19.5 154.5 17M127 12C138 17 150 18 162 14M168 12H222';
      var l = 'M113 12C103 5 91 4.5 83 10.5C78 14.5 81.5 19.5 85.5 17M113 12C102 17 90 18 78 14M72 12H18';
      return '<path class="wf-l" d="' + r + l + '"/>' + diamond(120, 12, 4);
    })() },
    'pearls': { name_ru: 'Жемчужины', svg: (function () {
      var o = '<circle class="wf-a" cx="120" cy="12" r="3.4"/>', rs = [2.3, 2, 1.7, 1.45, 1.25, 1.05, .9, .75];
      rs.forEach(function (r, j) { var dx = 11 + j * 10; o += '<circle class="wf-f" cx="' + (120 - dx) + '" cy="12" r="' + r + '"/><circle class="wf-f" cx="' + (120 + dx) + '" cy="12" r="' + r + '"/>'; });
      return o;
    })() },
    'belarus': { name_ru: 'Орнаментальная полоска', svg: (function () {
      var cs = 2.6, n = 7, tw = 8 * cs, x0 = 120 - (n * tw - cs) / 2, o = '';
      var rows = BY_MINI.map(function (r) { return r; });
      var big = []; for (var y = 0; y < 7; y++) { var s = ''; for (var t = 0; t < n; t++) s += rows[y]; big.push(s); }
      o += stitch(big, cs, x0, 12 - 3.5 * cs);
      return o + '<path class="wf-l wf-t" d="M' + R(x0 - 14) + ' 12H' + R(x0 - 5) + 'M' + R(x0 + n * tw + 3) + ' 12H' + R(x0 + n * tw + 12) + '"/>';
    })() },
    'sprig': { name_ru: 'Веточка', svg: at(PART.sprigSmall, 127, 13, 1.55) + at(PART.sprigSmall, 113, 13, 1.55).replace('scale(1.55)', 'scale(-1.55 1.55)') + '<circle class="wf-a" cx="120" cy="12" r="2.6"/>' }
  };
  /* ---------- 5 виньеток над именами (viewBox 0 0 80 48) ---------- */
  var MARKS = {
    'rings': { name_ru: 'Кольца', svg: '<circle class="wf-l" cx="33" cy="28" r="11"/><circle class="wf-l wf-as" cx="47" cy="28" r="11"/>' + diamond(40, 10, 3.2) },
    'flourish': { name_ru: 'Вензель-завиток', svg: '<path class="wf-l" d="M40 30C46 20 58 15 64.5 21C69 25.5 63.5 31.5 59.5 27.5M40 30C34 20 22 15 15.5 21C11 25.5 16.5 31.5 20.5 27.5M40 30C46 34 56 35 66 32M40 30C34 34 24 35 14 32"/>' + diamond(40, 30, 3.6) + '<circle class="wf-a" cx="40" cy="15" r="2"/>' },
    'fan': { name_ru: 'Веер арт-деко', svg: '<path class="wf-a" d="M30 38A10 10 0 0 1 50 38Z"/>' + fanRays(40, 38, 13, 25, 195, 345, 15, 'wf-l wf-as') + '<path class="wf-l" d="M8 38H72"/><path class="wf-l wf-t" d="M22 42H58"/>' },
    'star': { name_ru: 'Восьмиконечная звезда', svg: (function () {
      var rows = [
        '....X....',
        '.X..X..X.',
        '..XXoXX..',
        '..XoooX..',
        'XXoo.ooXX',
        '..XoooX..',
        '..XXoXX..',
        '.X..X..X.',
        '....X....'];
      return stitch(rows, 4, 22, 6);
    })() },
    'wreath': { name_ru: 'Веточки-венок', svg: sprig([[[40, 42], [26, 42], [12, 34], [10, 14]]], [[0, .2, 7, -40], [0, .4, 8, 40], [0, .58, 8, -40], [0, .76, 7, 40], [0, .92, 6, -40]]) +
      sprig([[[40, 42], [54, 42], [68, 34], [70, 14]]], [[0, .2, 7, 40], [0, .4, 8, -40], [0, .58, 8, 40], [0, .76, 7, -40], [0, .92, 6, 40]]) + '<circle class="wf-a" cx="40" cy="42" r="2.4"/>' }
  };

  /* ---------- API ---------- */
  function byId(id) { for (var j = 0; j < FRAMES.length; j++) if (FRAMES[j].id === id) return FRAMES[j]; return null; }
  function params(W, H, o) {
    o = o || {};
    var s = o.stroke != null ? o.stroke : 1.5, i = o.inset != null ? o.inset : 18, sc = o.scale != null ? o.scale : 1;
    var c = o.corner != null ? o.corner : clamp(Math.min(W, H) * 0.2, 56, 140) * sc;
    var u = o.unit || 1;
    return { W: W, H: H, s: s, su: s * u, u: u, i: i, c: c };
  }
  function frameMarkup(id, W, H, o) { var f = byId(id); var p = params(W, H, o); return { body: f.draw(p), safe: f.safe(p) }; }
  function svgWrap(body, vb, extra) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"' + (extra || '') + '><style>' + CSS + '</style>' + body + '</svg>';
  }
  // Статичный файл (картинка/превью): обводки масштабируются вместе с картинкой
  // (--ik1/--ik2 компенсируют масштаб угловых групп и листьев, чтобы толщина везде была одинаковой)
  function staticCSS(u) { return CSS.replace(/;vector-effect:non-scaling-stroke/g, '').replace(/var\(--frame-stroke,1\.5px\)/g, 'calc(var(--frame-stroke,' + R(1.5 * u) + 'px)*var(--ik1,1)*var(--ik2,1))'); }
  function frameSVG(id, W, H, o) {
    o = o || {}; var b = frameMarkup(id, W, H, o).body;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><style>' + (o.unit ? staticCSS(o.unit) : CSS) + '</style>' + b + '</svg>';
  }
  function dividerSVG(id) { return svgWrap(DIVIDERS[id].svg, '0 0 240 24', ' class="wf-divider" width="240" height="24"'); }
  function markSVG(id) { return svgWrap(MARKS[id].svg, '0 0 80 48', ' class="wf-mark" width="80" height="48"'); }

  // Живой рендер в блок (браузер)
  function num(cs, name, def) { var v = parseFloat(cs.getPropertyValue(name)); return isNaN(v) ? def : v; }
  function render(el, id) {
    if (!el) return;
    el.__wf = el.__wf || {};
    el.__wf.id = id;
    var svg = el.__wf.svg;
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'wf-svg'); svg.setAttribute('aria-hidden', 'true');
      el.insertBefore(svg, el.firstChild); el.__wf.svg = svg;
      if (window.ResizeObserver) { el.__wf.ro = new ResizeObserver(function () { draw(el); }); el.__wf.ro.observe(el); }
    }
    draw(el);
  }
  function draw(el) {
    var st = el.__wf; if (!st) return;
    var W = el.clientWidth, H = el.clientHeight, svg = st.svg;
    if (!st.id || st.id === 'none' || !W || !H) { svg.innerHTML = ''; setSafe(el, null); return; }
    var cs = getComputedStyle(el);
    var o = { stroke: num(cs, '--frame-stroke', 1.5), inset: num(cs, '--frame-inset', 18), scale: num(cs, '--frame-scale', 1) };
    var fc = num(cs, '--frame-corner', NaN); if (!isNaN(fc)) o.corner = fc;
    var m = frameMarkup(st.id, W, H, o);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = m.body;
    setSafe(el, m.safe);
  }
  function setSafe(el, s) {
    ['t', 'r', 'b', 'l'].forEach(function (k) { var n = '--frame-safe-' + { t: 'top', r: 'right', b: 'bottom', l: 'left' }[k]; if (s) el.style.setProperty(n, Math.round(s[k]) + 'px'); else el.style.removeProperty(n); });
  }
  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('wf-css')) return;
    var st = document.createElement('style'); st.id = 'wf-css';
    st.textContent = '.wf-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;opacity:var(--frame-opacity,1);z-index:0}' +
      '.wf-divider,.wf-mark{display:block;margin:0 auto;overflow:visible;opacity:var(--frame-opacity,1)}' + CSS;
    document.head.appendChild(st);
  }
  var API = { CSS: CSS, FRAMES: FRAMES, DIVIDERS: DIVIDERS, MARKS: MARKS, PART: PART, params: params, frameMarkup: frameMarkup, frameSVG: frameSVG,
    dividerSVG: dividerSVG, markSVG: markSVG, svgWrap: svgWrap, staticCSS: staticCSS, render: render, refresh: draw, injectCSS: injectCSS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else { root.WeddingFrames = API; injectCSS(); }
})(this);
