// 頭版田野地圖：依「地點」欄把診斷案件與參訪筆記標在鄉鎮位置
(function () {
  var root = document.querySelector('.field-map');
  if (!root) return;
  var records = JSON.parse(document.getElementById('map-records').textContent);
  var towns = JSON.parse(document.getElementById('map-towns').textContent);
  var svg = root.querySelector('svg.tw-map'), pinLayer = svg.querySelector('.pins');
  var list = root.querySelector('.map-list'), place = root.querySelector('.map-place');
  var tip = root.querySelector('.map-tip'), cropSel = root.querySelector('.map-crop');
  var NS = 'http://www.w3.org/2000/svg';
  var state = { kind: 'all', crop: '', town: '' };

  // 「臺中市東勢區、苗栗縣卓蘭鎮」「南投縣竹山鎮、鹿谷鄉」→ 鄉鎮清單
  function placesOf(loc) {
    var out = [], county = '';
    (loc || '').replace(/台/g, '臺').split(/[、,，]/).forEach(function (part) {
      part = part.trim(); if (!part) return;
      var m = part.match(/^(.+?[縣市])(.*)$/);
      if (m && towns[m[1]]) { county = m[1]; part = m[2]; }
      var key = county + part;
      if (towns[key]) out.push(key); else if (!part && towns[county]) out.push(county);
    });
    return out;
  }
  function cropsOf(r) { return (r.crop || '').split(/[、,，]/).map(function (c) { return c.replace(/（.*?）/g, '').trim(); }).filter(Boolean); }

  records.forEach(function (r) { r.places = placesOf(r.location); r.crops = cropsOf(r); });

  var allCrops = [];
  records.forEach(function (r) { r.crops.forEach(function (c) { if (allCrops.indexOf(c) < 0) allCrops.push(c); }); });
  allCrops.sort(function (a, b) { return a.localeCompare(b, 'zh-Hant'); }).forEach(function (c) {
    var o = document.createElement('option'); o.value = o.textContent = c; cropSel.appendChild(o);
  });

  function matches(r) {
    return (state.kind === 'all' || r.kind === state.kind) && (!state.crop || r.crops.indexOf(state.crop) >= 0);
  }
  function label(key) { return key.replace(/^(.+?[縣市])/, '$1 '); }

  function drawPins() {
    while (pinLayer.firstChild) pinLayer.removeChild(pinLayer.firstChild);
    var groups = {};
    records.filter(matches).forEach(function (r) {
      r.places.forEach(function (k) { (groups[k] = groups[k] || []).push(r); });
    });
    var counties = {};
    Object.keys(groups).sort(function (a, b) { return towns[a][1] - towns[b][1]; }).forEach(function (k, i) {
      var rs = groups[k], xy = towns[k], n = rs.length;
      counties[(k.match(/^.+?[縣市]/) || [k])[0]] = 1;
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'pin ' + (rs.some(function (r) { return r.kind === 'case'; }) ? 'case' : 'visit') + (state.town === k ? ' on' : ''));
      g.setAttribute('transform', 'translate(' + xy[0] + ' ' + xy[1] + ')');
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', label(k) + '，' + n + ' 篇');
      g.style.animationDelay = (i * 45) + 'ms';
      var r = 4.5 + Math.min(n, 4) * 1.2;
      var ring = document.createElementNS(NS, 'circle'); ring.setAttribute('class', 'ring'); ring.setAttribute('r', r + 4);
      var dot = document.createElementNS(NS, 'circle'); dot.setAttribute('class', 'dot'); dot.setAttribute('r', r);
      g.appendChild(ring); g.appendChild(dot);
      if (n > 1) { var t = document.createElementNS(NS, 'text'); t.setAttribute('dy', '.35em'); t.textContent = n; g.appendChild(t); }
      g.addEventListener('click', function () { select(state.town === k ? '' : k); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(state.town === k ? '' : k); } });
      g.addEventListener('mouseenter', function () { showTip(k, n); });
      g.addEventListener('mouseleave', function () { tip.hidden = true; });
      pinLayer.appendChild(g);
    });
    svg.querySelectorAll('.county').forEach(function (p) { p.classList.toggle('visited', !!counties[p.getAttribute('data-county')]); });
    return groups;
  }

  function showTip(k, n) {
    var box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, xy = towns[k];
    tip.textContent = label(k) + '・' + n + ' 篇';
    tip.style.left = (xy[0] / vb.width * box.width) + 'px';
    tip.style.top = (xy[1] / vb.height * box.height) + 'px';
    tip.hidden = false;
  }

  function render() {
    var groups = drawPins();
    var shown = records.filter(matches).filter(function (r) { return !state.town || r.places.indexOf(state.town) >= 0; });
    var nTowns = Object.keys(groups).length;
    root.querySelector('.map-stats').textContent = nTowns + ' 個鄉鎮・' + records.filter(matches).length + ' 篇紀錄';
    place.innerHTML = '';
    if (state.town) {
      place.textContent = label(state.town) + '　';
      var back = document.createElement('button'); back.type = 'button'; back.textContent = '顯示全部 ×';
      back.addEventListener('click', function () { select(''); }); place.appendChild(back);
    } else place.textContent = '點選地圖上的圖釘，查看當地的紀錄。';
    list.innerHTML = '';
    shown.forEach(function (r) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = r.url; a.className = 'map-item';
      if (r.cover) { var img = document.createElement('img'); img.src = r.cover; img.alt = ''; img.loading = 'lazy'; a.appendChild(img); }
      var tx = document.createElement('span'); tx.className = 'tx';
      var meta = document.createElement('span'); meta.className = 'meta';
      meta.textContent = (r.kind === 'visit' ? '參訪・' : '診斷・') + r.date.replace(/-/g, '.') + '・' + (r.location || '');
      var h = document.createElement('strong'); h.textContent = r.title;
      tx.appendChild(h); tx.appendChild(meta); a.appendChild(tx); li.appendChild(a); list.appendChild(li);
      a.addEventListener('mouseenter', function () { hl(r.places, true); });
      a.addEventListener('mouseleave', function () { hl(r.places, false); });
    });
    if (!shown.length) list.innerHTML = '<li class="empty">沒有符合的紀錄。</li>';
  }
  function hl(keys, on) {
    pinLayer.querySelectorAll('.pin').forEach(function (g) {
      var k = g.getAttribute('aria-label').split('，')[0].replace(' ', '');
      if (keys.indexOf(k) >= 0) g.classList.toggle('hot', on);
    });
  }
  function select(k) {
    state.town = k;
    svg.classList.add('settled');
    render();
    // 手機版清單在地圖下方，點圖釘後捲過去
    if (k && window.matchMedia('(max-width: 820px)').matches) place.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  root.querySelectorAll('.map-filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      state.kind = b.getAttribute('data-kind'); state.town = ''; svg.classList.add('settled');
      root.querySelectorAll('.map-filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      render();
    });
  });
  cropSel.addEventListener('change', function () { state.crop = cropSel.value; state.town = ''; svg.classList.add('settled'); render(); });

  render();
  // 捲到地圖時圖釘才落下
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { svg.classList.add('drop'); io.disconnect(); } }, { threshold: .25 });
    io.observe(svg);
  } else svg.classList.add('drop');
})();
