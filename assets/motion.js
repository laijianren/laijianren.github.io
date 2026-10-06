// 捲動動畫：手繪線條自己畫出來、內容隨捲動浮現、首頁圖說故事
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  if (reduce || !('IntersectionObserver' in window)) { root.classList.add('no-motion'); return; }

  // 1. 讓每條手繪線條可以「畫出來」
  var shapes = 'path, circle, ellipse, rect, line, polyline';
  function prepare(svg) {
    svg.querySelectorAll(shapes).forEach(function (el) {
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) {}
      if (!len) return;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      el.dataset.len = len;
    });
  }
  function setDraw(svg, t) { // t: 0 ~ 1
    var els = svg.querySelectorAll(shapes), n = els.length;
    els.forEach(function (el, i) {
      var len = +el.dataset.len; if (!len) return;
      var start = (i / n) * 0.6, local = Math.min(1, Math.max(0, (t - start) / 0.4));
      el.style.strokeDashoffset = len * (1 - local);
    });
    svg.classList.toggle('filled', t >= 0.95);
  }
  document.querySelectorAll('svg.ink').forEach(prepare);

  // 2. 內容隨捲動浮現
  var targets = document.querySelectorAll(
    'main h1:not(.headline), main h2:not(.plain), .card, .facts, .chart, .notice, .table-scroll, .controls, main > ul, .entry-body > p, .entry-body > ul, .entry-body > ol, blockquote, .crop-jump, .brief, .dispatch, .lead-story .columns, .lead-story .more'
  );
  targets.forEach(function (el, i) { el.classList.add('reveal'); });
  // 同一排的卡片依序出現
  document.querySelectorAll('.cards').forEach(function (g) {
    g.querySelectorAll('.card').forEach(function (c, i) { c.style.transitionDelay = (i * 90) + 'ms'; });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('svg.ink').forEach(function (s) { s.classList.add('drawing'); setDraw(s, 1); });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });

  // 頁首與首頁大圖：一進來就畫
  document.querySelectorAll('.mast-art svg.ink, .engraving svg.ink').forEach(function (s) {
    s.classList.add('drawing', 'slow');
    requestAnimationFrame(function () { requestAnimationFrame(function () { setDraw(s, 1); }); });
  });

  // 3. 首頁：捲動時大圖微微漂移、標題淡出（視差）
  var hero = document.querySelector('.hero'), heroArt = document.querySelector('.hero-art');

  // 4. 首頁：釘住的說故事區塊，隨捲動切換三個步驟、線條跟著捲動畫出來
  var story = document.querySelector('.story');
  var figs = story ? story.querySelectorAll('.story-fig') : [];
  var steps = story ? story.querySelectorAll('.story-step') : [];
  var dots = story ? story.querySelectorAll('.story-dots li') : [];
  var figSvgs = Array.prototype.map.call(figs, function (f) { return f.querySelector('svg'); });

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (hero) {
      var r = hero.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / r.height));
      if (heroArt) heroArt.style.transform = 'translateY(' + (p * 80) + 'px) scale(' + (1 + p * .15) + ')';
      hero.style.setProperty('--hero-p', p);
    }
    if (story) {
      var sr = story.getBoundingClientRect();
      var lead = vh * 0.45, total = sr.height - vh + lead, prog = Math.min(0.9999, Math.max(0, (lead - sr.top) / total));
      var idx = Math.floor(prog * 3), local = prog * 3 - idx;
      figs.forEach(function (f, i) { f.classList.toggle('active', i === idx); });
      steps.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i <= idx); });
      figSvgs.forEach(function (svg, i) {
        if (!svg) return;
        setDraw(svg, i < idx ? 1 : i > idx ? 0 : Math.min(1, local * 1.6));
      });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// 圖片全螢幕檢視：點圖放大、雙擊或滾輪再放大、拖曳移動、左右切換
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.chart a, main article img'));
  if (!links.length) return;
  var items = links.map(function (el) {
    var img = el.tagName === 'IMG' ? el : el.querySelector('img');
    var fig = el.closest('figure');
    var cap = fig && fig.querySelector('h3') ? fig.querySelector('h3').textContent : (img.alt || '');
    return { el: el, src: el.tagName === 'A' ? el.href : img.src, cap: cap };
  });

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML =
    '<div class="lb-stage"><img alt=""></div>' +
    '<p class="lb-cap"></p>' +
    '<div class="lb-tools">' +
      '<button class="lb-out" aria-label="縮小">－</button>' +
      '<button class="lb-fit" aria-label="符合螢幕">符合螢幕</button>' +
      '<button class="lb-in" aria-label="放大">＋</button>' +
    '</div>' +
    '<button class="lb-prev" aria-label="上一張">‹</button>' +
    '<button class="lb-next" aria-label="下一張">›</button>' +
    '<button class="lb-close" aria-label="關閉">×</button>' +
    '<p class="lb-hint">雙擊或滾輪放大・拖曳移動・Esc 關閉</p>';
  document.body.appendChild(box);
  var stage = box.querySelector('.lb-stage'), img = stage.querySelector('img'), cap = box.querySelector('.lb-cap');
  var cur = 0, scale = 1, x = 0, y = 0, lastFocus = null;

  function apply(animate) {
    img.style.transition = animate ? 'transform .3s cubic-bezier(.2,.7,.2,1)' : 'none';
    img.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
    box.classList.toggle('zoomed', scale > 1.01);
  }
  function zoomTo(s, cx, cy) {
    s = Math.min(6, Math.max(1, s));
    var r = stage.getBoundingClientRect();
    cx = cx == null ? r.width / 2 : cx - r.left; cy = cy == null ? r.height / 2 : cy - r.top;
    var ox = cx - r.width / 2, oy = cy - r.height / 2, k = s / scale;
    x = ox - (ox - x) * k; y = oy - (oy - y) * k; scale = s;
    if (scale === 1) { x = 0; y = 0; }
    apply(true);
  }
  function show(i) {
    cur = (i + items.length) % items.length;
    scale = 1; x = 0; y = 0; apply(false);
    img.src = items[cur].src; img.alt = items[cur].cap; cap.textContent = items[cur].cap;
    box.classList.toggle('single', items.length < 2);
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i); box.classList.add('open'); document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open'); document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (it, i) {
    it.el.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    it.el.style.cursor = 'zoom-in';
  });
  box.querySelector('.lb-close').onclick = close;
  box.querySelector('.lb-prev').onclick = function () { show(cur - 1); };
  box.querySelector('.lb-next').onclick = function () { show(cur + 1); };
  box.querySelector('.lb-in').onclick = function () { zoomTo(scale * 1.6); };
  box.querySelector('.lb-out').onclick = function () { zoomTo(scale / 1.6); };
  box.querySelector('.lb-fit').onclick = function () { zoomTo(1); };
    stage.addEventListener('dblclick', function (e) { zoomTo(scale > 1.01 ? 1 : 2.5, e.clientX, e.clientY); });
  stage.addEventListener('wheel', function (e) { e.preventDefault(); zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); }, { passive: false });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === '+' || e.key === '=') zoomTo(scale * 1.6);
    else if (e.key === '-') zoomTo(scale / 1.6);
  });

  // 拖曳移動與手機雙指縮放
  var downOnImg = false, pts = new Map(), startDist = 0, startScale = 1, lastX = 0, lastY = 0, moved = false;
  stage.addEventListener('pointerdown', function (e) { downOnImg = e.target === img; }, true);
  stage.addEventListener('pointerdown', function (e) {
    stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); moved = false;
    lastX = e.clientX; lastY = e.clientY;
    if (pts.size === 2) { var a = Array.from(pts.values()); startDist = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY); startScale = scale; }
  });
  stage.addEventListener('pointermove', function (e) {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    if (pts.size === 2) {
      var a = Array.from(pts.values());
      var d = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY);
      var s = Math.min(6, Math.max(1, startScale * d / startDist));
      var k = s / scale; scale = s; x *= k; y *= k; if (scale === 1) { x = 0; y = 0; } apply(false); moved = true;
    } else if (scale > 1.01) {
      x += e.clientX - lastX; y += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; apply(false); moved = true;
    } else {
      x = e.clientX - lastX; if (Math.abs(x) > 6) moved = true; apply(false); // 未放大時左右滑動切換
    }
  });
  function end(e) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (scale <= 1.01 && pts.size === 0) {
      if (x > 70) show(cur - 1); else if (x < -70) show(cur + 1); else { x = 0; apply(true); }
    }
  }
  stage.addEventListener('pointerup', end);
  box.addEventListener('click', function (e) { if ((e.target === box || e.target === stage) && !downOnImg && !moved && scale === 1) close(); });
  stage.addEventListener('pointercancel', end);
})();
