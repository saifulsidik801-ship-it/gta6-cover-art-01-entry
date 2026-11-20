// Vice Cover Studio — editor wiring (classic script, no modules).
// State, sample loading, uploads, panel drag pan / wheel zoom, Shuffle,
// caption editing, role labels and PNG export at four post sizes.
// Photos are read on this machine only and are never uploaded.
(function () {
  'use strict';

  var VC = window.ViceCover;
  var $ = function (id) { return document.getElementById(id); };

  var SAMPLE_URLS = [
    'samples/sample1.jpg', 'samples/sample2.jpg', 'samples/sample3.jpg',
    'samples/sample4.jpg', 'samples/sample5.jpg', 'samples/sample6.jpg',
    'samples/sample7.jpg', 'samples/sample8.jpg'
  ];

  var state = {
    layout: 0,
    grade: 0,
    captionIdx: 0,
    caption: Object.assign({}, VC.CAPTIONS[0]),
    sizeIdx: 2, // Wide 1920x1080
    photos: [],       // HTMLImageElement | null, the library
    assign: [0, 1, 2, 3, 4, 5, 6], // panel -> library index
    frames: [],       // per panel { z, x, y }
    roles: ['THE CAPTAIN', 'THE INSIDER', 'THE RIDER', 'THE BOSS',
      'THE COURIER', 'THE LOOKOUT', 'THE GETAWAY'],
    selected: 0
  };
  for (var p = 0; p < 7; p++) state.frames.push({ z: 1.12, x: 0, y: 0 });

  var canvas = null, statusEl = null, renderQueued = false;

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  function coverState() {
    return {
      layout: state.layout,
      grade: state.grade,
      caption: state.caption,
      photos: state.assign.map(function (li) { return state.photos[li] || null; }),
      frames: state.frames,
      roles: state.roles
    };
  }

  function previewSize() {
    var s = VC.SIZES[state.sizeIdx];
    var maxSide = 1100;
    var scale = Math.min(1, maxSide / Math.max(s.w, s.h));
    return { w: Math.round(s.w * scale), h: Math.round(s.h * scale) };
  }

  function render() {
    if (!canvas) return;
    var ps = previewSize();
    try {
      VC.drawCover(canvas, coverState(), ps.w, ps.h);
    } catch (err) {
      setStatus('Render error: ' + err.message);
      return;
    }
    drawSelection();
    setStatus('Ready — drag any panel to reframe it, then Export PNG');
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(function () { renderQueued = false; render(); });
  }

  // Cyan dashed outline around the selected panel (editor only — never in
  // bare-cover screenshot mode).
  function drawSelection() {
    if (document.body.classList.contains('cover-only')) return;
    var ps = previewSize();
    var lay = VC.layoutPanels(ps.w, ps.h, state.layout);
    var r = lay.rects[state.selected];
    if (!r) return;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setLineDash([10, 6]);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    ctx.setLineDash([]);
    ctx.restore();
  }

  function panelAt(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var x = (clientX - rect.left) * (canvas.width / rect.width);
    var y = (clientY - rect.top) * (canvas.height / rect.height);
    var lay = VC.layoutPanels(canvas.width, canvas.height, state.layout);
    for (var i = 0; i < lay.rects.length; i++) {
      var r = lay.rects[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return -1;
  }

  function bindPointer() {
    var drag = null;
    canvas.addEventListener('pointerdown', function (ev) {
      var i = panelAt(ev.clientX, ev.clientY);
      if (i < 0) return;
      state.selected = i;
      syncRoleEditor();
      drag = { panel: i, x: ev.clientX, y: ev.clientY,
        fx: state.frames[i].x, fy: state.frames[i].y, moved: false };
      canvas.setPointerCapture(ev.pointerId);
      queueRender();
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var rect = canvas.getBoundingClientRect();
      var dx = (ev.clientX - drag.x) * (canvas.width / rect.width);
      var dy = (ev.clientY - drag.y) * (canvas.height / rect.height);
      var r = VC.layoutPanels(canvas.width, canvas.height, state.layout).rects[drag.panel];
      var f = state.frames[drag.panel];
      f.x = clamp(drag.fx + dx / r.w, -0.45, 0.45);
      f.y = clamp(drag.fy + dy / r.h, -0.45, 0.45);
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      queueRender();
    });
    canvas.addEventListener('pointerup', function () { drag = null; });
    canvas.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var i = state.selected;
      var f = state.frames[i];
      f.z = clamp(f.z * (ev.deltaY < 0 ? 1.08 : 0.93), 1.0, 2.6);
      queueRender();
    }, { passive: false });
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // ---- option grids -------------------------------------------------------

  function buildLayouts() {
    var wrap = $('layoutGrid');
    VC.LAYOUTS.forEach(function (lay, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt layout-opt' + (i === state.layout ? ' on' : '');
      b.title = lay.name;
      b.innerHTML = '<span class="mini-grid">' +
        lay.panels.map(function (pp, j) {
          var hero = j === lay.hero ? ' hero' : '';
          return '<span class="mini-cell' + hero + '" style="left:' + (pp[0] * 100) +
            '%;top:' + (pp[1] * 100) + '%;width:' + (pp[2] * 100) +
            '%;height:' + (pp[3] * 100) + '%"></span>';
        }).join('') + '</span><span class="opt-name">' + lay.name + '</span>';
      b.addEventListener('click', function () {
        state.layout = i;
        buildLayouts(); queueRender();
      });
      wrap.appendChild(b);
    });
  }

  function buildGrades() {
    var wrap = $('gradeGrid');
    VC.GRADES.forEach(function (g, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt grade-opt' + (i === state.grade ? ' on' : '');
      b.innerHTML = '<span class="swatch" style="background:linear-gradient(135deg,' +
        g.stops[0] + ',' + g.stops[2] + ',' + g.stops[4] + ')"></span>' +
        '<span class="opt-name">' + g.name + '</span>';
      b.addEventListener('click', function () {
        state.grade = i;
        buildGrades(); queueRender();
      });
      wrap.appendChild(b);
    });
  }

  function buildCaptions() {
    var wrap = $('captionGrid');
    VC.CAPTIONS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt caption-opt' + (i === state.captionIdx ? ' on' : '');
      b.innerHTML = '<span class="cap-title">' + c.title + '</span>' +
        '<span class="cap-script">' + c.script + '</span>';
      b.addEventListener('click', function () {
        state.captionIdx = i;
        state.caption = Object.assign({}, VC.CAPTIONS[i]);
        syncCaptionInputs(); buildCaptions(); queueRender();
      });
      wrap.appendChild(b);
    });
  }

  function buildSizes() {
    var wrap = $('sizeRow');
    VC.SIZES.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill' + (i === state.sizeIdx ? ' on' : '');
      b.textContent = s.label;
      b.addEventListener('click', function () {
        state.sizeIdx = i;
        buildSizes(); fitCanvas(); queueRender();
      });
      wrap.appendChild(b);
    });
  }

  function syncCaptionInputs() {
    $('inTitle').value = state.caption.title || '';
    $('inScript').value = state.caption.script || '';
    $('inTagline').value = state.caption.tagline || '';
    $('inLocation').value = state.caption.location || '';
  }

  function bindCaptionInputs() {
    $('inTitle').addEventListener('input', function (ev) {
      state.caption.title = ev.target.value.toUpperCase().slice(0, 24);
      queueRender();
    });
    $('inScript').addEventListener('input', function (ev) {
      state.caption.script = ev.target.value.slice(0, 32);
      queueRender();
    });
    $('inTagline').addEventListener('input', function (ev) {
      state.caption.tagline = ev.target.value.toUpperCase().slice(0, 60);
      queueRender();
    });
    $('inLocation').addEventListener('input', function (ev) {
      state.caption.location = ev.target.value.toUpperCase().slice(0, 40);
      queueRender();
    });
  }

  // ---- photos -------------------------------------------------------------

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function buildSamples() {
    var wrap = $('sampleStrip');
    wrap.innerHTML = '';
    state.photos.forEach(function (img, li) {
      if (!img) return;
      var thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'thumb';
      thumb.title = 'Drop into panel ' + (state.selected + 1);
      var im = document.createElement('img');
      im.src = img.src; im.alt = 'Sample photo ' + (li + 1);
      thumb.appendChild(im);
      thumb.addEventListener('click', function () {
        state.assign[state.selected] = li;
        state.frames[state.selected] = { z: 1.12, x: 0, y: 0 };
        queueRender();
      });
      wrap.appendChild(thumb);
    });
  }

  function bindUploads() {
    $('fileInput').addEventListener('change', function (ev) {
      var files = Array.prototype.slice.call(ev.target.files || []);
      if (!files.length) return;
      var readers = files.map(function (f) {
        return new Promise(function (resolve) {
          var rd = new FileReader();
          rd.onload = function () { resolve(rd.result); };
          rd.onerror = function () { resolve(null); };
          rd.readAsDataURL(f);
        });
      });
      Promise.all(readers).then(function (urls) {
        var loads = urls.filter(Boolean).map(loadImage);
        return Promise.all(loads);
      }).then(function (imgs) {
        imgs.filter(Boolean).forEach(function (img) {
          state.photos.push(img);
          if (state.photos.length > 24) state.photos.shift();
          state.assign[state.selected] = state.photos.length - 1;
        });
        buildSamples(); queueRender();
        setStatus(files.length + ' photo(s) loaded — nothing was uploaded.');
      });
      ev.target.value = '';
    });
    $('onePhotoBtn').addEventListener('click', function () {
      var li = state.assign[state.selected];
      for (var i = 0; i < 7; i++) state.assign[i] = li;
      queueRender();
      setStatus('One photo in every panel.');
    });
  }

  // ---- role editor ----------------------------------------------------------

  function syncRoleEditor() {
    var sel = $('roleSelect');
    var i = state.selected;
    sel.value = state.roles[i];
    $('roleSub').textContent = VC.ROLE_SUBS[state.roles[i]] || '';
    $('panelLabel').textContent = 'Panel ' + (i + 1) + ' of 7';
  }

  function buildRoleEditor() {
    var sel = $('roleSelect');
    VC.ROLES.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r; o.textContent = r;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function (ev) {
      state.roles[state.selected] = ev.target.value;
      syncRoleEditor(); queueRender();
    });
  }

  // ---- shuffle / export -----------------------------------------------------

  function shuffle() {
    state.layout = Math.floor(Math.random() * VC.LAYOUTS.length);
    state.grade = Math.floor(Math.random() * VC.GRADES.length);
    state.captionIdx = Math.floor(Math.random() * VC.CAPTIONS.length);
    state.caption = Object.assign({}, VC.CAPTIONS[state.captionIdx]);
    var pool = state.photos.map(function (_, i) { return i; });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    for (var k = 0; k < 7; k++) {
      state.assign[k] = pool[k % pool.length];
      state.frames[k] = { z: 1.05 + Math.random() * 0.35,
        x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.3 };
    }
    syncCaptionInputs(); buildLayouts(); buildGrades(); buildCaptions();
    queueRender();
    setStatus('Shuffled — layout, grade, caption and photos randomised.');
  }

  function exportSize(sizeIdx, done) {
    var s = VC.SIZES[sizeIdx];
    var off = document.createElement('canvas');
    try {
      VC.drawCover(off, coverState(), s.w, s.h);
    } catch (err) {
      setStatus('Export error: ' + err.message);
      if (done) done();
      return;
    }
    off.toBlob(function (blob) {
      if (!blob) { setStatus('Export failed — browser blocked the PNG.'); if (done) done(); return; }
      var a = document.createElement('a');
      var name = 'vice-cover-' + s.name.toLowerCase() + '-' + s.w + 'x' + s.h + '.png';
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
        setStatus('Exported ' + name + ' — check your downloads.');
        if (done) done();
      }, 400);
    }, 'image/png');
  }

  function bindActions() {
    $('shuffleBtn').addEventListener('click', shuffle);
    $('exportBtn').addEventListener('click', function () { exportSize(state.sizeIdx); });
    $('exportAllBtn').addEventListener('click', function () {
      var i = 0;
      (function next() {
        if (i >= VC.SIZES.length) return;
        exportSize(i, function () { i++; setTimeout(next, 500); });
      })();
    });
    $('zoomOutBtn').addEventListener('click', function () {
      var f = state.frames[state.selected];
      f.z = clamp(f.z * 0.9, 1.0, 2.6); queueRender();
    });
    $('zoomInBtn').addEventListener('click', function () {
      var f = state.frames[state.selected];
      f.z = clamp(f.z * 1.12, 1.0, 2.6); queueRender();
    });
    $('zoomResetBtn').addEventListener('click', function () {
      state.frames[state.selected] = { z: 1.12, x: 0, y: 0 }; queueRender();
    });
  }

  function fitCanvas() {
    var ps = previewSize();
    canvas.style.aspectRatio = ps.w + ' / ' + ps.h;
  }

  // Deterministic screenshot mode: ?shot=cover&size=wide&layout=0&grade=0&caption=0
  // hides the editor chrome so a headless screenshot captures the bare cover.
  function applyShotParams() {
    var q = new URLSearchParams(window.location.search);
    if (q.has('layout')) state.layout = clamp(parseInt(q.get('layout'), 10) || 0, 0, 7);
    if (q.has('grade')) state.grade = clamp(parseInt(q.get('grade'), 10) || 0, 0, 5);
    if (q.has('caption')) {
      state.captionIdx = clamp(parseInt(q.get('caption'), 10) || 0, 0, 5);
      state.caption = Object.assign({}, VC.CAPTIONS[state.captionIdx]);
    }
    if (q.has('size')) {
      var names = VC.SIZES.map(function (s) { return s.name.toLowerCase(); });
      var si = names.indexOf((q.get('size') || '').toLowerCase());
      if (si >= 0) state.sizeIdx = si;
    }
    if (q.get('shot') === 'cover') {
      document.body.classList.add('cover-only');
      var s = VC.SIZES[state.sizeIdx];
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.aspectRatio = 'auto';
    }
  }

  function boot() {
    canvas = $('coverCanvas');
    statusEl = $('status');
    applyShotParams();
    buildLayouts(); buildGrades(); buildCaptions(); buildSizes();
    buildRoleEditor(); bindCaptionInputs(); bindUploads(); bindActions();
    bindPointer(); syncCaptionInputs(); syncRoleEditor(); fitCanvas();
    VC.ensureFonts().then(function () {
      return Promise.all(SAMPLE_URLS.map(loadImage));
    }).then(function (imgs) {
      state.photos = imgs;
      buildSamples();
      render();
    }).catch(function () {
      state.photos = [];
      buildSamples();
      render();
    });
    window.addEventListener('error', function (ev) {
      setStatus('Error: ' + (ev.message || 'unknown'));
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
