// Vice Cover Studio — editor wiring.
// Owns the state, the photo library (bundled samples + user uploads),
// panel selection with drag-to-pan and wheel zoom, Shuffle, caption
// presets, live preview and PNG export at four post sizes.
// Photos are read on this machine only and never uploaded anywhere.

import { LAYOUTS, GRADES, CAPTIONS, EXPORT_SIZES, drawCover } from './cover.js';

const SAMPLES = [
  { src: 'samples/sample1.jpg', name: 'Golden Hour', role: 'THE CAPTAIN' },
  { src: 'samples/sample2.jpg', name: 'White Suit', role: 'THE BOSS' },
  { src: 'samples/sample3.jpg', name: 'Speedboat', role: 'THE GETAWAY' },
  { src: 'samples/sample4.jpg', name: 'Beach Party', role: 'THE LOOKOUT' },
  { src: 'samples/sample5.jpg', name: 'Motel Dusk', role: 'THE COURIER' },
  { src: 'samples/sample6.jpg', name: 'Boulevard', role: 'THE DRIVER' },
];

const state = {
  layout: 0,
  grade: 0,
  caption: 0,
  title: CAPTIONS[0].title,
  subtitle: CAPTIONS[0].subtitle,
  tagline: CAPTIONS[0].tagline,
  quote: CAPTIONS[0].quote,
  quoteSource: CAPTIONS[0].source,
  volume: 'VOL. 1',
  size: 'wide',
  panels: [],
  selectedPanel: 0,
};

const photos = [];
let previewW = 960;
let previewH = 540;
let renderQueued = false;

const $ = (id) => document.getElementById(id);
const canvas = $('coverCanvas');
const ctx = canvas.getContext('2d');

function layoutPanels() {
  return LAYOUTS[state.layout].panels;
}

function resetPanels(photoOrder) {
  state.panels = layoutPanels().map((panel, i) => ({
    photo: photos.length ? photos[photoOrder[i % photoOrder.length]] : null,
    zoom: 1,
    ox: 0,
    oy: 0,
    label: panel.label,
  }));
  state.selectedPanel = LAYOUTS[state.layout].hero;
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderPreview();
  });
}

function renderPreview() {
  const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[2];
  const fitW = 960;
  const fitH = Math.round((fitW * size.h) / size.w);
  previewW = fitW;
  previewH = fitH;
  if (canvas.width !== fitW || canvas.height !== fitH) {
    canvas.width = fitW;
    canvas.height = fitH;
  }
  drawCover(ctx, state, fitW, fitH);
  drawSelection();
  updatePanelInspector();
}

function drawSelection() {
  const panel = layoutPanels()[state.selectedPanel];
  if (!panel) return;
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(panel.x * previewW + 2, panel.y * previewH + 2, panel.w * previewW - 4, panel.h * previewH - 4);
  ctx.setLineDash([]);
  ctx.restore();
}

function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const fx = (clientX - rect.left) / rect.width;
  const fy = (clientY - rect.top) / rect.height;
  const panels = layoutPanels();
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) return i;
  }
  return -1;
}

// ---- Photo library -------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load ' + src));
    img.src = src;
  });
}

async function loadSamples() {
  const loaded = [];
  for (const s of SAMPLES) {
    try {
      const img = await loadImage(s.src);
      loaded.push(img);
    } catch (err) {
      console.warn('Sample failed:', s.src, err);
    }
  }
  photos.push(...loaded);
  resetPanels([0, 1, 2, 3, 4, 5]);
  renderPhotoStrip();
  queueRender();
}

function renderPhotoStrip() {
  const strip = $('photoStrip');
  strip.innerHTML = '';
  photos.forEach((img, i) => {
    const btn = document.createElement('button');
    btn.className = 'thumb';
    btn.type = 'button';
    btn.title = 'Use this photo in the selected panel';
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = 'Photo ' + (i + 1);
    btn.appendChild(thumb);
    const tag = document.createElement('span');
    tag.textContent = i < SAMPLES.length ? SAMPLES[i].name : 'Upload ' + (i - SAMPLES.length + 1);
    btn.appendChild(tag);
    btn.addEventListener('click', () => {
      state.panels[state.selectedPanel].photo = img;
      queueRender();
      flashStatus('Photo placed in panel ' + (state.selectedPanel + 1));
    });
    strip.appendChild(btn);
  });
}

function handleUpload(files) {
  const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
  if (!list.length) return;
  let pending = list.length;
  list.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(reader.result)
        .then((img) => {
          photos.push(img);
          renderPhotoStrip();
          state.panels[state.selectedPanel].photo = img;
          queueRender();
        })
        .catch(() => flashStatus('Could not read ' + file.name))
        .finally(() => {
          pending -= 1;
          if (pending === 0) flashStatus(list.length + ' photo(s) added — stored only on this machine');
        });
    };
    reader.readAsDataURL(file);
  });
}

// ---- Controls ------------------------------------------------------------

function buildLayoutPicker() {
  const wrap = $('layoutPicker');
  LAYOUTS.forEach((layout, i) => {
    const btn = document.createElement('button');
    btn.className = 'layout-btn' + (i === state.layout ? ' active' : '');
    btn.type = 'button';
    btn.title = layout.name;
    const mini = document.createElement('span');
    mini.className = 'layout-mini';
    layout.panels.forEach((p) => {
      const cell = document.createElement('i');
      cell.style.left = p.x * 100 + '%';
      cell.style.top = p.y * 100 + '%';
      cell.style.width = p.w * 100 + '%';
      cell.style.height = p.h * 100 + '%';
      if (layout.panels.indexOf(p) === layout.hero) cell.classList.add('hero');
      mini.appendChild(cell);
    });
    btn.appendChild(mini);
    const label = document.createElement('span');
    label.className = 'layout-name';
    label.textContent = layout.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      const oldPhotos = state.panels.map((p) => p.photo);
      state.layout = i;
      state.panels = layoutPanels().map((panel, k) => ({
        photo: oldPhotos[k % oldPhotos.length] || null,
        zoom: 1,
        ox: 0,
        oy: 0,
        label: panel.label,
      }));
      state.selectedPanel = LAYOUTS[i].hero;
      document.querySelectorAll('.layout-btn').forEach((b, k) => b.classList.toggle('active', k === i));
      queueRender();
    });
    wrap.appendChild(btn);
  });
}

function buildGradePicker() {
  const wrap = $('gradePicker');
  GRADES.forEach((grade, i) => {
    const btn = document.createElement('button');
    btn.className = 'grade-btn' + (i === state.grade ? ' active' : '');
    btn.type = 'button';
    const sw = document.createElement('span');
    sw.className = 'grade-sw';
    sw.style.background = `linear-gradient(135deg, ${grade.titleStops[0]}, ${grade.titleStops[2]}, ${grade.titleStops[3]})`;
    btn.appendChild(sw);
    const label = document.createElement('span');
    label.textContent = grade.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state.grade = i;
      document.querySelectorAll('.grade-btn').forEach((b, k) => b.classList.toggle('active', k === i));
      queueRender();
    });
    wrap.appendChild(btn);
  });
}

function buildCaptionPicker() {
  const wrap = $('captionPicker');
  CAPTIONS.forEach((cap, i) => {
    const btn = document.createElement('button');
    btn.className = 'caption-btn' + (i === state.caption ? ' active' : '');
    btn.type = 'button';
    btn.innerHTML = '';
    const title = document.createElement('b');
    title.textContent = cap.title;
    const sub = document.createElement('span');
    sub.textContent = cap.subtitle;
    btn.appendChild(title);
    btn.appendChild(sub);
    btn.addEventListener('click', () => {
      applyCaption(i);
    });
    wrap.appendChild(btn);
  });
}

function applyCaption(i) {
  const cap = CAPTIONS[i];
  state.caption = i;
  state.title = cap.title;
  state.subtitle = cap.subtitle;
  state.tagline = cap.tagline;
  state.quote = cap.quote;
  state.quoteSource = cap.source;
  $('titleInput').value = cap.title;
  $('subtitleInput').value = cap.subtitle;
  $('taglineInput').value = cap.tagline;
  document.querySelectorAll('.caption-btn').forEach((b, k) => b.classList.toggle('active', k === i));
  queueRender();
}

function buildSizePicker() {
  const wrap = $('sizePicker');
  EXPORT_SIZES.forEach((size) => {
    const btn = document.createElement('button');
    btn.className = 'size-btn' + (size.id === state.size ? ' active' : '');
    btn.type = 'button';
    btn.textContent = size.label;
    btn.addEventListener('click', () => {
      state.size = size.id;
      document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      queueRender();
    });
    wrap.appendChild(btn);
  });
}

function updatePanelInspector() {
  const panel = state.panels[state.selectedPanel];
  if (!panel) return;
  $('panelName').textContent = 'Panel ' + (state.selectedPanel + 1) + ' — ' + (panel.label || 'Untitled');
  $('labelInput').value = panel.label || '';
  $('zoomSlider').value = Math.round(panel.zoom * 100);
  $('zoomValue').textContent = Math.round(panel.zoom * 100) + '%';
}

function shuffleAll() {
  const order = photos.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  state.layout = Math.floor(Math.random() * LAYOUTS.length);
  state.grade = Math.floor(Math.random() * GRADES.length);
  applyCaption(Math.floor(Math.random() * CAPTIONS.length));
  document.querySelectorAll('.layout-btn').forEach((b, k) => b.classList.toggle('active', k === state.layout));
  document.querySelectorAll('.grade-btn').forEach((b, k) => b.classList.toggle('active', k === state.grade));
  resetPanels(order);
  queueRender();
  flashStatus('Shuffled — new layout, grade, caption and photo order');
}

let statusTimer = null;
function flashStatus(msg) {
  const el = $('statusLine');
  el.textContent = msg;
  el.classList.add('live');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('live'), 2600);
}

// ---- Export ---------------------------------------------------------------

async function exportPng() {
  const size = EXPORT_SIZES.find((s) => s.id === state.size) || EXPORT_SIZES[2];
  const t0 = performance.now();
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off.getContext('2d'), state, size.w, size.h);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  if (!blob) {
    flashStatus('Export failed — please try again');
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vice-cover-${size.w}x${size.h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  flashStatus(`Exported ${size.w} × ${size.h} PNG in ${secs}s — ready to post`);
  $('lastExport').textContent = `Last export: ${size.label} · ${(blob.size / 1024).toFixed(0)} KB`;
}

async function exportAllSizes() {
  for (const size of EXPORT_SIZES) {
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off.getContext('2d'), state, size.w, size.h);
    const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
    if (!blob) continue;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    await new Promise((r) => setTimeout(r, 350));
  }
  flashStatus('Exported all 4 sizes');
}

// ---- Pointer: click to select, drag to pan, wheel to zoom ----------------

let drag = null;

canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  state.selectedPanel = i;
  drag = { x: e.clientX, y: e.clientY, ox: state.panels[i].ox, oy: state.panels[i].oy, moved: false };
  canvas.setPointerCapture(e.pointerId);
  queueRender();
});

canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const panel = state.panels[state.selectedPanel];
  const dx = (e.clientX - drag.x) / rect.width;
  const dy = (e.clientY - drag.y) / rect.height;
  if (Math.abs(dx) + Math.abs(dy) > 0.004) drag.moved = true;
  panel.ox = Math.max(-1, Math.min(1, drag.ox + dx * 2.2));
  panel.oy = Math.max(-1, Math.min(1, drag.oy + dy * 2.2));
  queueRender();
});

canvas.addEventListener('pointerup', () => {
  drag = null;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[state.selectedPanel];
  if (!panel) return;
  const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * factor));
  queueRender();
}, { passive: false });

// ---- Boot -----------------------------------------------------------------

function bindControls() {
  $('uploadInput').addEventListener('change', (e) => handleUpload(e.target.files));
  $('shuffleBtn').addEventListener('click', shuffleAll);
  $('exportBtn').addEventListener('click', exportPng);
  $('exportAllBtn').addEventListener('click', exportAllSizes);
  $('titleInput').addEventListener('input', (e) => {
    state.title = e.target.value.toUpperCase();
    queueRender();
  });
  $('subtitleInput').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    queueRender();
  });
  $('taglineInput').addEventListener('input', (e) => {
    state.tagline = e.target.value.toUpperCase();
    queueRender();
  });
  $('labelInput').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].label = e.target.value.toUpperCase();
    queueRender();
  });
  $('zoomSlider').addEventListener('input', (e) => {
    state.panels[state.selectedPanel].zoom = Number(e.target.value) / 100;
    queueRender();
  });
  $('resetPanelBtn').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    panel.zoom = 1;
    panel.ox = 0;
    panel.oy = 0;
    queueRender();
    flashStatus('Panel framing reset');
  });
  $('onePhotoBtn').addEventListener('click', () => {
    const photo = state.panels[state.selectedPanel].photo;
    if (!photo) return;
    state.panels.forEach((p) => {
      p.photo = photo;
    });
    queueRender();
    flashStatus('One photo now fills every panel');
  });
  $('volumeInput').addEventListener('input', (e) => {
    state.volume = e.target.value.toUpperCase() || 'VOL. 1';
    queueRender();
  });
}

async function boot() {
  buildLayoutPicker();
  buildGradePicker();
  buildCaptionPicker();
  buildSizePicker();
  bindControls();
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('taglineInput').value = state.tagline;
  try {
    await document.fonts.load('400 80px Anton');
    await document.fonts.load('400 40px Pacifico');
    await document.fonts.load('600 20px Oswald');
    await document.fonts.ready;
  } catch (err) {
    console.warn('Font preload skipped:', err);
  }
  await loadSamples();
  flashStatus('Ready — drag any panel to reframe it, then Export PNG');
}

document.addEventListener('DOMContentLoaded', boot);
