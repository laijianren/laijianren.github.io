/* 病蟲害徽章插圖：仿手工上色銅版畫（線條＋排線陰影＋淡彩），全部為原創繪製。
   PDJ_ART(name, R, ink, id) 回傳 100×100 座標的 SVG 片段；R 為亂數函式，讓每枚徽章的角度、病斑位置略有不同。 */
(function () {
  function f(n) { return (+n).toFixed(1); }
  var T = { leaf: '#b9cf8e', leaf2: '#9fbf74', fruit: '#e8c25a', pf: '#8fae5a', wax: '#e7a6a0', bark: '#a9825a', bug: '#b08a55', bugG: '#9cc07a', amber: '#e0a43a', rust: '#d0702a', brown: '#7a4a24', halo: '#e6dd78', mold: '#efe9dc' };
  // 葉片：外形、主脈、側脈、下半部排線陰影
  function leaf(x, y, len, w, rot, tint, id, lobe) {
    var s = 'M0 0 C' + f(len * .28) + ' ' + f(-w) + ' ' + f(len * .78) + ' ' + f(-w * .9) + ' ' + f(len) + ' 0 C' + f(len * .78) + ' ' + f(w * .9) + ' ' + f(len * .28) + ' ' + f(w) + ' 0 0 Z';
    var lower = 'M0 0 C' + f(len * .28) + ' ' + f(w) + ' ' + f(len * .78) + ' ' + f(w * .9) + ' ' + f(len) + ' 0 Z';
    var v = '';
    for (var i = 1; i <= 5; i++) { var t = len * i / 6.2; v += 'M' + f(t) + ' 0 Q' + f(t + len * .07) + ' ' + f(-w * .45) + ' ' + f(t + len * .15) + ' ' + f(-w * .72) + 'M' + f(t) + ' 0 Q' + f(t + len * .07) + ' ' + f(w * .45) + ' ' + f(t + len * .15) + ' ' + f(w * .72); }
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><path d="' + s + '" fill="' + (tint || T.leaf) + '"/><path d="' + lower + '" fill="url(#h' + id + ')" stroke="none"/><path d="' + s + '" fill="none"/><path d="M' + f(-len * .12) + ' 0 L' + f(len * .96) + ' 0" /><path d="' + v + '" stroke-width=".7"/></g>';
  }
  // 果實：圓形＋右側新月形排線陰影＋高光
  function fruit(x, y, r, tint, id) {
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + tint + '"/><path d="M' + f(x) + ' ' + f(y - r) + ' A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x) + ' ' + f(y + r) + ' A' + f(r * .7) + ' ' + f(r) + ' 0 0 0 ' + f(x) + ' ' + f(y - r) + 'Z" fill="url(#h' + id + ')" stroke="none"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="none"/><path d="M' + f(x - r * .55) + ' ' + f(y - r * .25) + ' q' + f(r * .1) + ' ' + f(-r * .35) + ' ' + f(r * .4) + ' ' + f(-r * .45) + '" stroke="#fff" stroke-width="2" opacity=".8"/>';
  }
  function stip(R, cx, cy, rx, ry, n, r, col) {
    var o = '';
    for (var i = 0; i < n; i++) { var a = R() * 6.283, d = Math.sqrt(R()); o += '<circle cx="' + f(cx + Math.cos(a) * rx * d) + '" cy="' + f(cy + Math.sin(a) * ry * d) + '" r="' + f(r * (.6 + R() * .7)) + '" fill="' + (col || 'currentColor') + '" stroke="none"/>'; }
    return o;
  }
  function blot(R, cx, cy, r, fill, n) {
    var p = '', k = n || 9;
    for (var i = 0; i <= k; i++) { var a = i / k * 6.283, rr = r * (.75 + R() * .5); p += (i ? 'L' : 'M') + f(cx + Math.cos(a) * rr) + ' ' + f(cy + Math.sin(a) * rr); }
    return '<path d="' + p + 'Z" fill="' + fill + '" stroke-width=".8"/>';
  }
  function branch(x1, y1, x2, y2, w, id) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * w, ny = dx / L * w;
    var p = 'M' + f(x1 + nx) + ' ' + f(y1 + ny) + ' L' + f(x2 + nx * .7) + ' ' + f(y2 + ny * .7) + ' L' + f(x2 - nx * .7) + ' ' + f(y2 - ny * .7) + ' L' + f(x1 - nx) + ' ' + f(y1 - ny) + 'Z';
    var h = 'M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + ' L' + f(x2 - nx * .7) + ' ' + f(y2 - ny * .7) + ' L' + f(x1 - nx) + ' ' + f(y1 - ny) + 'Z';
    var bark = '';
    for (var i = 1; i < 6; i++) { var t = i / 6; bark += 'M' + f(x1 + dx * t + nx * .5) + ' ' + f(y1 + dy * t + ny * .5) + ' l' + f(dx * .05) + ' ' + f(dy * .05); }
    return '<path d="' + p + '" fill="' + T.bark + '"/><path d="' + h + '" fill="url(#h' + id + ')" stroke="none"/><path d="' + bark + '" stroke-width=".7"/>';
  }
  function legs(cx, cy, sp, len, n) {
    var o = '';
    for (var i = 0; i < (n || 3); i++) { var y = cy - sp + i * sp, a = (i - 1) * 28; o += '<path d="M' + f(cx - 6) + ' ' + f(y) + ' l' + f(-len * .6) + ' ' + f(-len * .3 + i * len * .3) + ' l' + f(-len * .3) + ' ' + f(len * .3 + a * .05) + 'M' + f(cx + 6) + ' ' + f(y) + ' l' + f(len * .6) + ' ' + f(-len * .3 + i * len * .3) + ' l' + f(len * .3) + ' ' + f(len * .3 + a * .05) + '" fill="none" stroke-width="1.1"/>'; }
    return o;
  }
  function cater(R, x, y, segs, r, tint, id, tufts, hairs) {
    var o = '', i, cx;
    for (i = 0; i < segs; i++) { cx = x + i * r * 1.45; var cy = y + Math.sin(i * .7) * r * .5; o += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * .95) + '" ry="' + f(r) + '" fill="' + tint + '"/><path d="M' + f(cx - r * .9) + ' ' + f(cy + r * .2) + ' A' + f(r * .95) + ' ' + f(r) + ' 0 0 0 ' + f(cx + r * .9) + ' ' + f(cy + r * .2) + 'Z" fill="url(#h' + id + ')" stroke="none"/>';
      if (hairs) for (var k = -2; k <= 2; k++) o += '<path d="M' + f(cx + k * r * .25) + ' ' + f(cy - r * .9) + ' l' + f(k * 1.2) + ' ' + f(-r * (.7 + R() * .5)) + '" stroke-width=".6"/>';
      if (tufts && tufts.indexOf(i) >= 0) o += '<path d="M' + f(cx - r * .5) + ' ' + f(cy - r) + ' C' + f(cx - r * .6) + ' ' + f(cy - r * 2.6) + ' ' + f(cx + r * .6) + ' ' + f(cy - r * 2.6) + ' ' + f(cx + r * .5) + ' ' + f(cy - r) + 'Z" fill="' + T.mold + '" stroke-width=".8"/><path d="M' + f(cx) + ' ' + f(cy - r) + ' v' + f(-r * 1.4) + '" stroke-width=".5"/>';
      if (i < segs - 1 && i > 0 && i % 2 === 0) o += '<path d="M' + f(cx - r * .3) + ' ' + f(cy + r) + ' v2.5 M' + f(cx + r * .3) + ' ' + f(cy + r) + ' v2.5" stroke-width=".9"/>';
    }
    cx = x - r * 1.2;
    o += '<circle cx="' + f(cx) + '" cy="' + f(y) + '" r="' + f(r * .85) + '" fill="' + T.brown + '"/><circle cx="' + f(cx - r * .3) + '" cy="' + f(y - r * .2) + '" r=".9" fill="#fff" stroke="none"/>';
    return o;
  }
  var ART = {
    '油斑病': function (R, id) { var o = leaf(14, 58, 72, 24, -18 + R() * 8, T.leaf, id); for (var i = 0; i < 6; i++) { var t = .2 + i * .12; o += blot(R, 14 + 72 * t * .95, 58 - 72 * t * .32 + (R() - .5) * 18, 3.5 + R() * 3, '#d9b44a', 8) + stip(R, 14 + 72 * t * .95, 58 - 72 * t * .32, 3, 3, 4, .5); } return o; },
    '潰瘍病': function (R, id) { var o = leaf(14, 60, 72, 25, -20 + R() * 8, T.leaf, id); for (var i = 0; i < 4; i++) { var x = 30 + i * 13 + R() * 4, y = 54 - i * 4.5 + (R() - .5) * 14; o += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6" fill="' + T.halo + '" stroke="none" opacity=".9"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.6" fill="#b88a48"/><path d="M' + f(x - 2.6) + ' ' + f(y) + 'h5.2M' + f(x) + ' ' + f(y - 2.6) + 'v5.2M' + f(x - 1.8) + ' ' + f(y - 1.8) + 'l3.6 3.6" stroke-width=".6"/>'; } return o; },
    '葉片黑點病': function (R, id) { var o = leaf(14, 60, 72, 25, -20 + R() * 8, T.leaf, id); o += stip(R, 50, 48, 22, 9, 70, .9); return o; },
    '枝條黑點病': function (R, id) { var o = branch(16, 74, 84, 30, 6, id) + leaf(56, 50, 34, 11, -80, T.leaf2, id); o += stip(R, 40, 59, 14, 6, 40, .9); return o; },
    '流膠病': function (R, id) { var o = branch(14, 70, 86, 38, 9, id); for (var i = 0; i < 4; i++) { var x = 30 + i * 14, y = 62 - i * 6.5 + 7; o += '<path d="M' + f(x) + ' ' + f(y) + ' c-4 6 -4 11 0 12 c4 -1 4 -6 0 -12Z" fill="' + T.amber + '"/><path d="M' + f(x - 1) + ' ' + f(y + 7) + ' q.5 -2 1.5 -3" stroke="#fff" stroke-width=".9"/>'; } return o; },
    '褐斑病': function (R, id) { var o = '<g>' + leaf(50, 74, 36, 12, -150, T.leaf, id) + leaf(50, 74, 40, 13, -90, T.leaf, id) + leaf(50, 74, 36, 12, -30, T.leaf, id) + '</g><path d="M50 74 L50 92" />'; [[34, 58], [52, 44], [66, 56], [48, 60]].forEach(function (p) { o += '<circle cx="' + f(p[0] + R() * 3) + '" cy="' + f(p[1] + R() * 3) + '" r="5.5" fill="#cfe08a" stroke="none"/><circle cx="' + f(p[0] + R() * 1) + '" cy="' + f(p[1] + R() * 1) + '" r="3.4" fill="#8a5a2e" stroke-width=".7"/>'; }); return o; },
    '疫病': function (R, id) { var o = '<path d="M50 22 q-2 -8 4 -12" fill="none"/>' + fruit(50, 52, 27, T.pf, id); o += blot(R, 58, 60, 13, '#5f6e3e', 11) + '<path d="M50 66 q6 -2 10 -8 M54 70 q6 -1 10 -7" stroke-width=".6"/>' + stip(R, 56, 60, 9, 8, 14, .5); return o; },
    '果實炭疽病': function (R, id) { var o = '<path d="M50 22 q-2 -8 4 -12" fill="none"/>' + fruit(50, 52, 27, T.pf, id), x = 56, y = 58; for (var i = 4; i >= 1; i--) o += '<circle cx="' + x + '" cy="' + y + '" r="' + f(i * 3.2) + '" fill="' + (i % 2 ? '#6a4a2a' : '#a8784a') + '" stroke-width=".6"/>'; o += stip(R, x, y, 9, 9, 16, .6, '#e9c870'); return o; },
    '果腐病': function (R, id) { var o = '<path d="M30 30 Q50 22 70 30 Q78 62 66 78 Q50 86 34 78 Q22 62 30 30Z" fill="' + T.wax + '"/><path d="M50 26 Q70 30 72 56 Q74 72 66 78 Q60 60 50 26Z" fill="url(#h' + id + ')" stroke="none"/><path d="M30 30 Q50 22 70 30 Q78 62 66 78 Q50 86 34 78 Q22 62 30 30Z" fill="none"/><path d="M36 80 q4 4 8 1 q4 4 6 0 q4 4 8 -1" />'; o += blot(R, 44, 62, 12, '#7a4a30', 10) + stip(R, 44, 62, 10, 9, 26, .8, T.mold); return o; },
    '草莓葉枯病': function (R, id) { var o = '<path d="M50 90 L50 62" />' + leaf(50, 62, 30, 13, -150, T.leaf, id) + leaf(50, 62, 34, 14, -90, T.leaf, id) + leaf(50, 62, 30, 13, -30, T.leaf, id); o += '<path d="M48 28 l4 0 l6 8 l-8 4 l-8 -4Z" fill="#8a5a2e" stroke-width=".7"/><path d="M24 44 l3 -4 l7 6 l-6 5Z" fill="#8a5a2e" stroke-width=".7"/>' + stip(R, 50, 34, 5, 4, 8, .5); return o; },
    '銹病': function (R, id) { var o = leaf(16, 58, 68, 26, -22 + R() * 6, '#a9c486', id); o += stip(R, 52, 46, 24, 10, 34, 1.6, T.rust) + stip(R, 52, 46, 24, 10, 12, .5); return o; },
    '褐圓盾介殼蟲': function (R, id) { var o = leaf(10, 62, 80, 28, -18, T.leaf, id); [[34, 56], [50, 48], [62, 54], [46, 62], [70, 42]].forEach(function (p) { var x = p[0] + R() * 2, y = p[1] + R() * 2; o += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="5.6" fill="#7a4a2a"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.3" fill="#a06a3a" stroke-width=".6"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="1.2" fill="#e0b070" stroke-width=".5"/>'; }); return o; },
    '菲緣椿象': function (R, id) { return '<path d="M44 26 l-8 -14 M56 26 l8 -14" fill="none"/>' + legs(50, 52, 10, 20) +
      '<path d="M50 22 C46 22 44 26 44 28 L36 34 C34 52 38 70 50 80 C62 70 66 52 64 34 L56 28 C56 26 54 22 50 22Z" fill="' + T.bug + '"/><path d="M50 34 L64 34 C66 52 62 70 50 80Z" fill="url(#h' + id + ')" stroke="none"/><path d="M50 22 C46 22 44 26 44 28 L36 34 C34 52 38 70 50 80 C62 70 66 52 64 34 L56 28 C56 26 54 22 50 22Z" fill="none"/><path d="M36 34 H64 M42 34 L50 58 L58 34 M40 62 Q50 70 60 62" stroke-width=".8"/><path d="M38 70 l-10 12 l6 -2 Z M62 70 l10 12 l-6 -2 Z" fill="' + T.bug + '" stroke-width=".8"/>'; },
    '蓮霧細蛾': function (R, id) { return '<path d="M20 78 C34 70 40 82 52 72 S70 74 80 64" stroke-dasharray="2 1.5" stroke-width="1.6" fill="none" opacity=".7"/>' +
      '<path d="M50 30 L50 62" /><path d="M50 32 C40 34 24 44 18 58 C30 56 42 50 50 44Z" fill="#e8dcc0"/><path d="M50 32 C60 34 76 44 82 58 C70 56 58 50 50 44Z" fill="#e8dcc0"/><path d="M18 58 l-4 3 M22 57 l-3 4 M26 56 l-2 4 M82 58 l4 3 M78 57 l3 4 M74 56 l2 4" stroke-width=".6"/><path d="M30 46 l6 -2 M40 40 l5 -1 M70 46 l-6 -2 M60 40 l-5 -1" stroke="#8a5a2e" stroke-width="1.4"/><path d="M50 32 C48 22 40 14 30 12 M50 32 C52 22 60 14 70 12" fill="none" stroke-width=".8"/><ellipse cx="50" cy="48" rx="3" ry="14" fill="#c9b48a"/>'; },
    '楊桃鳥羽蛾幼蟲': function (R, id) { return leaf(12, 76, 76, 16, -12, T.leaf2, id) + cater(R, 30, 52, 8, 4.2, '#a8c870', id, null, true); },
    '青蛾蠟蟬若蟲': function (R, id) { var o = branch(10, 80, 90, 70, 4, id); o += '<path d="M44 60 C40 50 44 40 52 40 C60 40 64 50 60 60Z" fill="' + T.bugG + '"/><path d="M52 40 C60 40 64 50 60 60 L52 60Z" fill="url(#h' + id + ')" stroke="none"/><circle cx="48" cy="44" r="1.2" fill="currentColor"/><circle cx="56" cy="44" r="1.2" fill="currentColor"/>' + legs(52, 54, 3, 9); for (var i = 0; i < 9; i++) { var a = -2.4 + i * .18; o += '<path d="M52 41 Q' + f(52 + Math.cos(a) * 18) + ' ' + f(40 + Math.sin(a) * 26) + ' ' + f(52 + Math.cos(a) * 30 + (R() - .5) * 4) + ' ' + f(36 + Math.sin(a) * 30) + '" stroke="#bdb6a6" stroke-width="2.2" fill="none"/><path d="M52 41 Q' + f(52 + Math.cos(a) * 18) + ' ' + f(40 + Math.sin(a) * 26) + ' ' + f(52 + Math.cos(a) * 30) + ' ' + f(36 + Math.sin(a) * 30) + '" stroke="#fff" stroke-width="1" fill="none"/>'; } return o; },
    '綠斑枯葉裳蛾幼蟲': function (R, id) { var o = branch(8, 82, 92, 76, 4, id); o += '<path d="M18 74 C20 50 34 34 50 34 C66 34 78 50 82 74" fill="none" stroke="#7aa44a" stroke-width="13" stroke-linecap="round"/><path d="M18 74 C20 50 34 34 50 34 C66 34 78 50 82 74" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="42" cy="38" r="4" fill="#f1e08a"/><circle cx="42" cy="38" r="2" fill="#1d150b"/><circle cx="58" cy="38" r="4" fill="#f1e08a"/><circle cx="58" cy="38" r="2" fill="#1d150b"/><circle cx="18" cy="74" r="5.5" fill="' + T.brown + '"/>'; return o; },
    '小白紋毒蛾': function (R, id) { return leaf(10, 76, 80, 16, -10, T.leaf2, id) + cater(R, 30, 54, 8, 4.4, '#c9a56a', id, [1, 2, 3, 4], true) + '<path d="M22 50 l-6 -10 M24 50 l-2 -12 M80 50 l8 -8" stroke-width="1" fill="none"/>'; }
  };
  var GENERIC_BUG = function (R, id) { return '<path d="M44 28 l-6 -12 M56 28 l6 -12" fill="none"/>' + legs(50, 52, 10, 18) + '<ellipse cx="50" cy="54" rx="14" ry="22" fill="' + T.bug + '"/><path d="M50 32 A14 22 0 0 1 50 76Z" fill="url(#h' + id + ')" stroke="none"/><ellipse cx="50" cy="54" rx="14" ry="22" fill="none"/><path d="M50 36 V76 M38 40 H62" stroke-width=".8"/><circle cx="50" cy="30" r="6" fill="' + T.brown + '"/>'; };
  var GENERIC_DIS = function (R, id) { return leaf(14, 60, 72, 25, -20, T.leaf, id) + stip(R, 50, 50, 18, 8, 10, 2.2, '#8a5a2e'); };
  function isBug(n) { return /(蟲|蝨|蛾|蟎|椿象|蠅|蚜|螟)$/.test(n); }
  window.PDJ_ART = function (name, R, ink, id) {
    var fn = ART[name];
    if (!fn) { for (var k in ART) if (name.indexOf(k) >= 0 || k.indexOf(name) >= 0) { fn = ART[k]; break; } }
    if (!fn) fn = isBug(name) ? GENERIC_BUG : GENERIC_DIS;
    var rot = (R() - .5) * 24;
    return '<defs><pattern id="h' + id + '" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(' + f(35 + R() * 20) + ')"><path d="M0 0 V2.6" stroke="' + ink + '" stroke-width=".8" opacity=".55"/></pattern><clipPath id="c' + id + '"><circle cx="50" cy="50" r="35"/></clipPath></defs>' +
      '<g clip-path="url(#c' + id + ')"><circle cx="50" cy="50" r="35" fill="#f7f0dc" stroke="none"/><g transform="rotate(' + f(rot) + ' 50 50)" stroke="' + ink + '" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" style="color:' + ink + '">' + fn(R, id) + '</g></g>';
  };
})();
