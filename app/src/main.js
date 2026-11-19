'use strict';
/* Neon Grid Cover Studio — UI wiring.
   Plain classic script on top of NeonCover (src/cover.js). No network,
   no uploads: photos are read on the user's own machine and drawn
   straight into the cover canvas. */
(function () {
  var NC = window.NeonCover;

  var params = new URLSearchParams(location.search);
  var shot = params.get('shot') || '';

  /* State: 9 panel slots; a layout uses the first cols*rows of them. */
  var state = {
    layout: params.get('layout') || '6',
    size: params.get('size') || '1080x1350',
    grade: parseInt(params.get('grade') || '0', 10) || 0,
    title: 'NEON GRID',
    subtitle: 'SUNSET BOULEVARD',
    badge: '06',
    panels: []
  };
  if (!NC.LAYOUTS[state.layout]) state.layout = '6';
  if (!NC.SIZES[state.size]) state.size = '1080x1350';
  if (state.grade < 0 || state.grade >= NC.GRADES.length) state.grade = 0;

  for (var i = 0; i < 9; i++) {
    state.panels.push({ src: NC.makeSample(i % 4, i + 1), zoom: 1, ox: 0, oy: 0, sample: i % 4 });
  }

  var selected = 0;
  var canvas = document.getElementById('cover');
  var ctx = canvas.getContext('2d');

  function panelCount() {
    var l = NC.LAYOUTS[state.layout];
    return l.cols * l.rows;
  }

  function previewSize() {
    var s = NC.SIZES[state.size];
    var scale = Math.min(560 / s.w, 700 / s.h);
    return { w: Math.round(s.w * scale), h: Math.round(s.h * scale) };
  }

  function render() {
    var ps = previewSize();
    canvas.width = ps.w; canvas.height = ps.h;
    NC.drawCover(ctx, ps.w, ps.h, state);
    renderThumbs();
  }

  /* ---- panel thumbnails ---- */
  var thumbsEl = document.getElementById('thumbs');
  function renderThumbs() {
    var n = panelCount();
    thumbsEl.innerHTML = '';
    for (var i = 0; i < n; i++) {
      (function (idx) {
        var t = document.createElement('canvas');
        t.width = 120; t.height = 150;
        t.className = 'thumb' + (idx === selected ? ' sel' : '');
        t.title = 'Panel ' + (idx + 1);
        var mini = {
          layout: 'solo', grade: state.grade, title: '', subtitle: '', badge: '',
          panels: [state.panels[idx]]
        };
        NC.drawCover(t.getContext('2d'), 120, 150, mini);
        t.addEventListener('click', function () { selected = idx; syncPanelUI(); render(); });
        thumbsEl.appendChild(t);
      })(i);
    }
    var label = document.getElementById('panel-label');
    if (label) label.textContent = 'Panel ' + (selected + 1) + ' of ' + n;
  }

  /* ---- controls ---- */
  function seg(id, current, fn) {
    var el = document.getElementById(id);
    if (!el) return;
    Array.prototype.forEach.call(el.querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.dataset.v === String(current));
      b.addEventListener('click', function () {
        fn(b.dataset.v);
        Array.prototype.forEach.call(el.querySelectorAll('button'), function (x) {
          x.classList.toggle('on', x === b);
        });
      });
    });
  }

  seg('layout-seg', state.layout, function (v) {
    state.layout = v;
    if (selected >= panelCount()) selected = 0;
    syncPanelUI(); render();
  });
  seg('size-seg', state.size, function (v) { state.size = v; render(); });

  var gradeEl = document.getElementById('grade-seg');
  NC.GRADES.forEach(function (g, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade' + (i === state.grade ? ' on' : '');
    b.textContent = g.name;
    b.style.background = 'linear-gradient(135deg,' + g.top + ',' + g.mid + ',' + g.bottom + ')';
    b.addEventListener('click', function () {
      state.grade = i;
      Array.prototype.forEach.call(gradeEl.querySelectorAll('button'), function (x) {
        x.classList.remove('on');
      });
      b.classList.add('on');
      render();
    });
    gradeEl.appendChild(b);
  });

  function bindText(id, key) {
    var el = document.getElementById(id);
    el.value = state[key];
    el.addEventListener('input', function () { state[key] = el.value; render(); });
  }
  bindText('title-input', 'title');
  bindText('subtitle-input', 'subtitle');
  bindText('badge-input', 'badge');

  /* ---- selected panel editing ---- */
  var zoomEl = document.getElementById('zoom');
  function syncPanelUI() {
    var p = state.panels[selected];
    zoomEl.value = String(Math.round((p.zoom || 1) * 100));
    document.getElementById('zoom-val').textContent = Math.round((p.zoom || 1) * 100) + '%';
    document.getElementById('sample-name').textContent =
      p.sample !== null && p.sample !== undefined ? 'Sample scene ' + (p.sample + 1) : 'Your photo';
  }
  zoomEl.addEventListener('input', function () {
    state.panels[selected].zoom = parseInt(zoomEl.value, 10) / 100;
    document.getElementById('zoom-val').textContent = zoomEl.value + '%';
    render();
  });

  document.getElementById('sample-btn').addEventListener('click', function () {
    var p = state.panels[selected];
    var next = ((p.sample === null || p.sample === undefined) ? 0 : p.sample + 1) % 4;
    p.sample = next;
    p.src = NC.makeSample(next, selected * 7 + next + 1);
    p.zoom = 1; p.ox = 0; p.oy = 0;
    syncPanelUI(); render();
  });

  document.getElementById('fill-all-btn').addEventListener('click', function () {
    var p = state.panels[selected];
    for (var i = 0; i < 9; i++) {
      state.panels[i].src = p.src;
      state.panels[i].sample = p.sample;
      state.panels[i].zoom = p.zoom; state.panels[i].ox = 0; state.panels[i].oy = 0;
    }
    render();
  });

  document.getElementById('shuffle-btn').addEventListener('click', function () {
    for (var i = 0; i < 9; i++) {
      var v = Math.floor(Math.random() * 4);
      state.panels[i].sample = v;
      state.panels[i].src = NC.makeSample(v, Date.now() % 100000 + i * 31);
      state.panels[i].zoom = 1; state.panels[i].ox = 0; state.panels[i].oy = 0;
    }
    state.grade = Math.floor(Math.random() * NC.GRADES.length);
    Array.prototype.forEach.call(gradeEl.querySelectorAll('button'), function (x, idx) {
      x.classList.toggle('on', idx === state.grade);
    });
    syncPanelUI(); render();
  });

  document.getElementById('reset-btn').addEventListener('click', function () {
    for (var i = 0; i < 9; i++) {
      state.panels[i] = { src: NC.makeSample(i % 4, i + 1), zoom: 1, ox: 0, oy: 0, sample: i % 4 };
    }
    state.title = 'NEON GRID'; state.subtitle = 'SUNSET BOULEVARD'; state.badge = '06';
    document.getElementById('title-input').value = state.title;
    document.getElementById('subtitle-input').value = state.subtitle;
    document.getElementById('badge-input').value = state.badge;
    syncPanelUI(); render();
  });

  /* photo upload: read locally, never sent anywhere */
  document.getElementById('photo-input').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var p = state.panels[selected];
        p.src = img; p.sample = null;
        p.zoom = 1; p.ox = 0; p.oy = 0;
        syncPanelUI(); render();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    ev.target.value = '';
  });

  /* drag to pan the selected panel, wheel to zoom */
  var dragging = null;
  canvas.addEventListener('pointerdown', function (ev) {
    dragging = { x: ev.clientX, y: ev.clientY };
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    var r = canvas.getBoundingClientRect();
    var p = state.panels[selected];
    p.ox = (p.ox || 0) + (ev.clientX - dragging.x) / r.width;
    p.oy = (p.oy || 0) + (ev.clientY - dragging.y) / r.height;
    p.ox = Math.max(-0.6, Math.min(0.6, p.ox));
    p.oy = Math.max(-0.6, Math.min(0.6, p.oy));
    dragging = { x: ev.clientX, y: ev.clientY };
    render();
  });
  canvas.addEventListener('pointerup', function () { dragging = null; });
  canvas.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var p = state.panels[selected];
    p.zoom = Math.max(0.5, Math.min(3, (p.zoom || 1) * (ev.deltaY < 0 ? 1.08 : 0.93)));
    syncPanelUI(); render();
  }, { passive: false });

  /* ---- export ---- */
  function doExport(sizeKey) {
    var c = NC.exportCover(state, sizeKey);
    c.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'neon-grid-cover-' + sizeKey + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }, 'image/png');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-export]'), function (b) {
    b.addEventListener('click', function () { doExport(b.dataset.export); });
  });

  /* ---- screenshot / deep-link modes ----
     ?shot=cover shows the cover alone, full-bleed, for a clean render.
     ?shot=editor is the normal editor. ?layout, ?size and ?grade presets
     are honoured on load so a link opens exactly one cover. */
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    var size = NC.SIZES[state.size];
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.width = size.w; canvas.height = size.h;
    NC.drawCover(ctx, size.w, size.h, state);
  } else {
    syncPanelUI();
    render();
  }

  window.NeonGrid = { state: state, render: render, exportCover: doExport };
})();
