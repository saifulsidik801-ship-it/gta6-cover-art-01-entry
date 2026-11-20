// Vice Cover Studio — editor wiring.
// Live preview on canvas, per-panel crop/position by dragging on the
// preview, layout/grade/caption controls, shuffle, and PNG export at the
// common post sizes. Photos are read on this machine only, never uploaded.

import { LAYOUTS, GRADES, CAPTIONS, ROLES, SAMPLE_PHOTOS, EXPORT_SIZES } from './presets.js';
import { renderCover, layoutRects, drawCoverToCanvas } from './cover.js';

const $ = (id) => document.getElementById(id);

const state = {
  layout: 'classic7',
  grade: 'sunsetGold',
  size: '1920x1080',
  title: ['PALM', 'FEVER'],
  script: 'one last summer',
  tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
  quote: 'PURE GOLDEN-HOUR MAYHEM',
  source: 'THE HARBOR GAZETTE',
  vol: 'VOL. 1',
  credit: 'A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
  showSeal: true,
  showComingSoon: true,
  panels: [],
};

let selected = 0;
let renderQueued = false;

function currentSize() {
  return EXPORT_SIZES.find((s) => s.key === state.size) || EXPORT_SIZES[0];
}

function newPanel(i) {
  return { img: null, src: null, label: ROLES[i] || 'THE CREW', zoom: 1.15, ox: 0, oy: 0 };
}

for (let i = 0; i < 7; i++) state.panels.push(newPanel(i));

async function loadFonts() {
  const faces = [
    ['Anton', 'fonts/Anton-Regular.ttf'],
    ['Archivo Black', 'fonts/ArchivoBlack-Regular.ttf'],
    ['Pacifico', 'fonts/Pacifico-Regular.ttf'],
  ];
  await Promise.all(faces.map(async ([name, url]) => {
    const face = new FontFace(name, `url(${url})`);
    const loaded = await face.load();
    document.fonts.add(loaded);
  }));
  await document.fonts.ready;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSamples() {
  const jobs = SAMPLE_PHOTOS.map((s) => loadImage(s.file));
  const imgs = await Promise.all(jobs);
  // Fill the seven slots, cycling the six samples; the repeat gets a
  // different crop so it never reads as a duplicate panel.
  const order = [0, 1, 2, 3, 4, 5, 2];
  order.forEach((si, slot) => {
    state.panels[slot].img = imgs[si];
    state.panels[slot].src = SAMPLE_PHOTOS[si].file;
    state.panels[slot].label = SAMPLE_PHOTOS[si].label;
    state.panels[slot].zoom = 1.05 + (slot % 3) * 0.12;
    state.panels[slot].ox = slot % 2 === 0 ? -0.08 : 0.08;
    state.panels[slot].oy = slot % 3 === 0 ? -0.05 : 0.05;
  });
  refreshPanelList();
  scheduleRender();
}

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderPreview();
  });
}

function renderPreview() {
  const size = currentSize();
  const canvas = $('previewCanvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, size.w, size.h, state);
  // Selection outline — preview only, never in exports.
  const layout = LAYOUTS[state.layout];
  if (selected < layout.panels) {
    const r = layoutRects(size.w, size.h, state.layout)[selected];
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = Math.max(3, size.w * 0.004);
    ctx.setLineDash([size.w * 0.012, size.w * 0.008]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffd166';
    const tag = `PANEL ${selected + 1} · ${state.panels[selected].label}`;
    ctx.font = `${Math.max(13, Math.round(size.h * 0.022))}px "Archivo Black", sans-serif`;
    const tw = ctx.measureText(tag).width;
    const pad = size.h * 0.012;
    const tagH = size.h * 0.034 + pad;
    ctx.fillRect(r.x, r.y + pad * 0.5, tw + pad * 2, tagH);
    ctx.fillStyle = '#1a0b2e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, r.x + pad, r.y + pad * 0.5 + tagH / 2);
    ctx.restore();
  }
  $('sizeNote').textContent = `${size.name} · live preview`;
}

function refreshPanelList() {
  const list = $('panelList');
  list.innerHTML = '';
  const layout = LAYOUTS[state.layout];
  for (let i = 0; i < layout.panels; i++) {
    const p = state.panels[i];
    const row = document.createElement('div');
    row.className = 'panel-row' + (i === selected ? ' selected' : '');
    row.dataset.index = i;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.src;
      im.alt = p.label;
      thumb.appendChild(im);
    } else {
      thumb.textContent = '+';
    }
    thumb.addEventListener('click', () => { selected = i; refreshPanelList(); scheduleRender(); });

    const body = document.createElement('div');
    body.className = 'panel-body';
    const label = document.createElement('input');
    label.type = 'text';
    label.value = p.label;
    label.maxLength = 18;
    label.addEventListener('input', () => { p.label = label.value.toUpperCase(); scheduleRender(); });
    const sliders = document.createElement('div');
    sliders.className = 'sliders';
    sliders.appendChild(sliderRow('Zoom', 1, 2.5, 0.05, p.zoom, (v) => { p.zoom = v; scheduleRender(); }));
    sliders.appendChild(sliderRow('X', -1, 1, 0.05, p.ox, (v) => { p.ox = v; scheduleRender(); }));
    sliders.appendChild(sliderRow('Y', -1, 1, 0.05, p.oy, (v) => { p.oy = v; scheduleRender(); }));
    body.appendChild(label);
    body.appendChild(sliders);

    const actions = document.createElement('div');
    actions.className = 'panel-actions';
    const up = document.createElement('button');
    up.textContent = 'Upload';
    up.addEventListener('click', () => { pendingPanel = i; $('fileInput').click(); });
    const smp = document.createElement('button');
    smp.textContent = 'Sample';
    smp.addEventListener('click', async () => {
      const next = (SAMPLE_PHOTOS.findIndex((s) => s.file === p.src) + 1) % SAMPLE_PHOTOS.length;
      p.img = await loadImage(SAMPLE_PHOTOS[next].file);
      p.src = SAMPLE_PHOTOS[next].file;
      p.label = SAMPLE_PHOTOS[next].label;
      refreshPanelList();
      scheduleRender();
    });
    const clr = document.createElement('button');
    clr.textContent = 'Clear';
    clr.addEventListener('click', () => { p.img = null; p.src = null; refreshPanelList(); scheduleRender(); });
    actions.appendChild(up);
    actions.appendChild(smp);
    actions.appendChild(clr);

    row.appendChild(thumb);
    row.appendChild(body);
    row.appendChild(actions);
    list.appendChild(row);
  }
}

function sliderRow(name, min, max, step, value, onInput) {
  const wrap = document.createElement('label');
  wrap.className = 'slider-row';
  const span = document.createElement('span');
  span.textContent = name;
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.addEventListener('input', () => onInput(parseFloat(input.value)));
  wrap.appendChild(span);
  wrap.appendChild(input);
  return wrap;
}

let pendingPanel = 0;

function buildControls() {
  // Layout buttons.
  const lb = $('layoutBtns');
  Object.entries(LAYOUTS).forEach(([key, l]) => {
    const b = document.createElement('button');
    b.textContent = `${l.name} · ${l.panels}`;
    b.dataset.key = key;
    b.addEventListener('click', () => { setLayout(key); });
    lb.appendChild(b);
  });
  // Grade buttons.
  const gb = $('gradeBtns');
  Object.entries(GRADES).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.dataset.key = key;
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(90deg, ${g.titleStops.join(',')})`;
    b.appendChild(sw);
    b.appendChild(document.createTextNode(g.name));
    b.addEventListener('click', () => { setGrade(key); });
    gb.appendChild(b);
  });
  // Caption presets.
  const cs = $('captionSelect');
  CAPTIONS.forEach((c, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = c.name;
    cs.appendChild(o);
  });
  cs.addEventListener('change', () => setCaption(parseInt(cs.value, 10)));
  // Size buttons.
  const sb = $('sizeBtns');
  EXPORT_SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.textContent = s.name;
    b.dataset.key = s.key;
    b.addEventListener('click', () => { setSize(s.key); });
    sb.appendChild(b);
  });
  // Caption text inputs.
  const bind = (id, get, set) => {
    const el = $(id);
    el.addEventListener('input', () => { set(el.value); scheduleRender(); });
  };
  bind('inTitle1', null, (v) => { state.title[0] = v.toUpperCase(); });
  bind('inTitle2', null, (v) => { state.title[1] = v.toUpperCase(); });
  bind('inScript', null, (v) => { state.script = v; });
  bind('inTagline', null, (v) => { state.tagline = v.toUpperCase(); });
  bind('inQuote', null, (v) => { state.quote = v.toUpperCase(); });
  bind('inSource', null, (v) => { state.source = v.toUpperCase(); });
  bind('inVol', null, (v) => { state.vol = v.toUpperCase(); });
  bind('inCredit', null, (v) => { state.credit = v.toUpperCase(); });
  $('chkSeal').addEventListener('change', (e) => { state.showSeal = e.target.checked; scheduleRender(); });
  $('chkComing').addEventListener('change', (e) => { state.showComingSoon = e.target.checked; scheduleRender(); });
  $('shuffleBtn').addEventListener('click', shuffle);
  $('loadSamplesBtn').addEventListener('click', loadSamples);
  $('exportBtn').addEventListener('click', () => exportPNG());
  $('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    const p = state.panels[pendingPanel];
    p.img = img;
    p.src = url;
    p.zoom = 1.15;
    p.ox = 0;
    p.oy = 0;
    refreshPanelList();
    scheduleRender();
    e.target.value = '';
  });
  // Preview drag-to-pan + wheel zoom.
  const canvas = $('previewCanvas');
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const toCover = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  canvas.addEventListener('pointerdown', (e) => {
    const pt = toCover(e);
    const rects = layoutRects(canvas.width, canvas.height, state.layout);
    const layout = LAYOUTS[state.layout];
    for (let i = layout.panels - 1; i >= 0; i--) {
      const r = rects[i];
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        selected = i;
        dragging = true;
        lastX = pt.x;
        lastY = pt.y;
        canvas.setPointerCapture(e.pointerId);
        refreshPanelList();
        scheduleRender();
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const pt = toCover(e);
    const rects = layoutRects(canvas.width, canvas.height, state.layout);
    const r = rects[selected];
    const p = state.panels[selected];
    p.ox = Math.max(-1, Math.min(1, p.ox + (pt.x - lastX) / (r.w * 0.35)));
    p.oy = Math.max(-1, Math.min(1, p.oy + (pt.y - lastY) / (r.h * 0.35)));
    lastX = pt.x;
    lastY = pt.y;
    scheduleRender();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = state.panels[selected];
    p.zoom = Math.max(1, Math.min(2.5, p.zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
    scheduleRender();
  }, { passive: false });
  syncControlStates();
}

function syncControlStates() {
  document.querySelectorAll('#layoutBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.key === state.layout);
  });
  document.querySelectorAll('#gradeBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.key === state.grade);
  });
  document.querySelectorAll('#sizeBtns button').forEach((b) => {
    b.classList.toggle('active', b.dataset.key === state.size);
  });
  $('inTitle1').value = state.title[0];
  $('inTitle2').value = state.title[1];
  $('inScript').value = state.script;
  $('inTagline').value = state.tagline;
  $('inQuote').value = state.quote;
  $('inSource').value = state.source;
  $('inVol').value = state.vol;
  $('inCredit').value = state.credit;
  $('chkSeal').checked = state.showSeal;
  $('chkComing').checked = state.showComingSoon;
}

function setLayout(key) {
  state.layout = key;
  selected = 0;
  refreshPanelList();
  syncControlStates();
  scheduleRender();
}

function setGrade(key) {
  state.grade = key;
  syncControlStates();
  scheduleRender();
}

function setCaption(i) {
  const c = CAPTIONS[i];
  if (!c) return;
  state.title = [...c.title];
  state.script = c.script;
  state.tagline = c.tagline;
  state.quote = c.quote;
  state.source = c.source;
  state.vol = c.vol;
  state.credit = c.credit;
  $('captionSelect').value = String(i);
  syncControlStates();
  scheduleRender();
}

function setSize(key) {
  state.size = key;
  syncControlStates();
  scheduleRender();
}

function shuffle() {
  const layoutKeys = Object.keys(LAYOUTS);
  const gradeKeys = Object.keys(GRADES);
  state.layout = layoutKeys[Math.floor(Math.random() * layoutKeys.length)];
  state.grade = gradeKeys[Math.floor(Math.random() * gradeKeys.length)];
  setCaption(Math.floor(Math.random() * CAPTIONS.length));
  // Shuffle the sample assignment across panels.
  const slots = [...state.panels];
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i].img, slots[j].img] = [slots[j].img, slots[i].img];
    [slots[i].src, slots[j].src] = [slots[j].src, slots[i].src];
    [slots[i].label, slots[j].label] = [slots[j].label, slots[i].label];
  }
  state.panels = slots;
  selected = 0;
  refreshPanelList();
  syncControlStates();
  scheduleRender();
}

function exportPNG() {
  const size = currentSize();
  const canvas = drawCoverToCanvas(size.w, size.h, state);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.key}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

// Small API for scripted screenshots and tests.
window.__vice = {
  state,
  setLayout, setGrade, setCaption, setSize, shuffle, loadSamples,
  exportCanvas: () => {
    const size = currentSize();
    return drawCoverToCanvas(size.w, size.h, state);
  },
};

await loadFonts();
buildControls();
await loadSamples();
renderPreview();
