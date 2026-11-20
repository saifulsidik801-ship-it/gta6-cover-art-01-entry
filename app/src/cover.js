// Vice Cover Studio — cover renderer.
// Draws the whole poster on a 2D canvas: photo panels, role labels, the
// gradient title with retro stripes, the neon script line, top bar, tagline
// strip, credit bar, barcode and the gold seal. Pure canvas, no DOM.

import { LAYOUTS, GRADES } from './presets.js';

export function layoutRects(W, H, layoutKey) {
  const layout = LAYOUTS[layoutKey] || LAYOUTS.classic7;
  return layout.fn(W, H).map((r) => ({
    x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H,
  }));
}

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSeal(ctx, cx, cy, r, label1, label2) {
  // Gold starburst seal.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f5c86b';
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.beginPath();
  const points = 16;
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.86;
    const a = (i * Math.PI) / points;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2a1a05';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.3)}px "Archivo Black", sans-serif`;
  ctx.fillText(label1, 0, -r * 0.18);
  ctx.fillText(label2, 0, r * 0.18);
  drawStar(ctx, 0, r * 0.48, r * 0.09, '#2a1a05');
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 14);
  ctx.fillStyle = '#111111';
  let cx = x;
  let seed = 7;
  while (cx < x + w - 2) {
    seed = (seed * 37 + 11) % 97;
    const bw = 1 + (seed % 4);
    if (seed % 3 !== 0) ctx.fillRect(cx, y, bw, h);
    cx += bw + 1 + (seed % 3);
  }
  ctx.font = `${Math.round(h * 0.22)}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('0 64269 034069', x + w / 2, y + h + 2);
  ctx.restore();
}

function drawPhotoCoverFit(ctx, img, rect, zoom, ox, oy, grade) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (ox || 0) * rect.w * 0.35;
  const dy = rect.y + (rect.h - dh) / 2 + (oy || 0) * rect.h * 0.35;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = grade.filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  // Warm grade tint over the photo.
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  // Gentle bottom shade so labels stay readable.
  const shade = ctx.createLinearGradient(0, rect.y + rect.h * 0.55, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(10,4,20,0)');
  shade.addColorStop(1, 'rgba(10,4,20,0.45)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, grade, W, H) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, grade.bg);
  g.addColorStop(1, '#3a1a5e');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  for (let i = -rect.h; i < rect.w; i += 26) {
    ctx.beginPath();
    ctx.moveTo(rect.x + i, rect.y + rect.h);
    ctx.lineTo(rect.x + i + rect.h, rect.y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `${Math.max(12, Math.round(H * 0.02))}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawRoleLabel(ctx, rect, label, H) {
  if (!label) return;
  let size = Math.max(11, H * 0.021);
  ctx.font = `${Math.round(size)}px "Archivo Black", sans-serif`;
  const padX = size * 0.7;
  const padY = size * 0.42;
  let tw = ctx.measureText(label).width;
  const maxW = rect.w - size * 0.8;
  if (tw > maxW) {
    size = (size * maxW) / tw;
    ctx.font = `${Math.round(size)}px "Archivo Black", sans-serif`;
    tw = ctx.measureText(label).width;
  }
  const bw = tw + padX * 2;
  const bh = size + padY * 2;
  const bx = rect.x + Math.max(4, rect.w * 0.03);
  const by = rect.y + rect.h - bh - Math.max(4, rect.h * 0.04);
  ctx.fillStyle = 'rgba(8,4,16,0.88)';
  rr(ctx, bx, by, bw, bh, bh * 0.18);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + padX, by + bh / 2 + size * 0.04);
}

// One title line, drawn on its own canvas so the retro stripes can be
// clipped to the glyphs with source-atop.
function drawTitleLine(line, fontSize, grade, W) {
  const pad = Math.ceil(fontSize * 0.28);
  const off = document.createElement('canvas');
  const octx = off.getContext('2d');
  octx.font = `${Math.round(fontSize)}px Anton, "Archivo Black", sans-serif`;
  const tw = octx.measureText(line).width;
  off.width = Math.ceil(tw + pad * 2);
  off.height = Math.ceil(fontSize * 1.5);
  octx.font = `${Math.round(fontSize)}px Anton, "Archivo Black", sans-serif`;
  octx.textBaseline = 'middle';
  octx.textAlign = 'left';
  const grad = octx.createLinearGradient(0, pad * 0.4, 0, off.height - pad * 0.4);
  const stops = grade.titleStops;
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
  octx.fillStyle = grad;
  octx.fillText(line, pad, off.height / 2);
  // Retro horizontal stripes, clipped to the letters.
  octx.globalCompositeOperation = 'source-atop';
  octx.fillStyle = 'rgba(20,6,32,0.32)';
  const band = fontSize * 0.16;
  for (let y = off.height * 0.42; y < off.height; y += band * 2) {
    octx.fillRect(0, y, off.width, band);
  }
  octx.globalCompositeOperation = 'source-over';
  // Dark outline around the letters.
  octx.lineJoin = 'round';
  octx.strokeStyle = '#14061f';
  octx.lineWidth = Math.max(2, fontSize * 0.055);
  octx.strokeText(line, pad, off.height / 2);
  return off;
}

export function renderCover(ctx, W, H, state) {
  const grade = GRADES[state.grade] || GRADES.sunsetGold;
  const layout = LAYOUTS[state.layout] || LAYOUTS.classic7;
  const rects = layoutRects(W, H, state.layout);

  // Background.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grade.bg);
  bg.addColorStop(1, grade.bgDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Photo panels.
  const count = layout.panels;
  for (let i = 0; i < count; i++) {
    const r = rects[i];
    const p = state.panels[i] || {};
    const isHero = i === layout.hero;
    let pr = r;
    if (isHero) {
      // Pop-out hero: the panel breaks its frame with a white halo.
      const grow = W * 0.006;
      pr = { x: r.x - grow, y: r.y - grow - H * 0.006, w: r.w + grow * 2, h: r.h + grow * 2 };
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.85)';
      ctx.shadowBlur = W * 0.018;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
      ctx.restore();
    }
    if (p.img) drawPhotoCoverFit(ctx, p.img, pr, p.zoom, p.ox, p.oy, grade);
    else drawEmptyPanel(ctx, pr, grade, W, H);
    ctx.strokeStyle = isHero ? '#ffffff' : grade.border;
    ctx.lineWidth = Math.max(2, W * (isHero ? 0.0035 : 0.0025));
    ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
    drawRoleLabel(ctx, pr, p.label, H);
  }

  // Top bar: stars, press quote, volume badge.
  const barH = H * 0.062;
  ctx.fillStyle = 'rgba(8,4,16,0.35)';
  ctx.fillRect(0, 0, W, barH);
  const starR = H * 0.016;
  for (let s = 0; s < 5; s++) {
    drawStar(ctx, W * 0.025 + s * starR * 2.4, barH / 2, starR, '#ffd166');
  }
  ctx.fillStyle = grade.quote;
  const quoteText = `"${state.quote}" — ${state.source}`;
  let qSize = Math.max(11, H * 0.02);
  ctx.font = `${Math.round(qSize)}px "Archivo Black", sans-serif`;
  const qW = ctx.measureText(quoteText).width;
  const qMax = W * 0.52;
  if (qW > qMax) {
    qSize = Math.max(11, (qSize * qMax) / qW);
    ctx.font = `${Math.round(qSize)}px "Archivo Black", sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(quoteText, W / 2, barH / 2);
  // Volume badge.
  ctx.font = `${Math.max(11, Math.round(H * 0.019))}px "Archivo Black", sans-serif`;
  const volW = ctx.measureText(state.vol).width + H * 0.03;
  ctx.fillStyle = '#ffd166';
  rr(ctx, W - volW - W * 0.015, barH * 0.18, volW, barH * 0.64, barH * 0.12);
  ctx.fill();
  ctx.fillStyle = '#1a0b2e';
  ctx.fillText(state.vol, W - volW / 2 - W * 0.015, barH / 2 + 1);

  // Scrim behind the title so it reads over any photo.
  const scrim = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.92);
  scrim.addColorStop(0, 'rgba(10,4,20,0)');
  scrim.addColorStop(0.45, grade.scrim);
  scrim.addColorStop(1, 'rgba(10,4,20,0)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.55, W, H * 0.37);

  // Title: two lines, gradient + stripes, dark outline, slight italic lean.
  // Size is capped by height as well as width: two lines must end by ~0.80H
  // so the script and every panel label below them stay clear.
  const lines = state.title.filter(Boolean).slice(0, 2);
  let fontSize = Math.min(W * 0.155, H * 0.125);
  ctx.font = `${Math.round(fontSize)}px Anton, "Archivo Black", sans-serif`;
  const longest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
  if (longest > W * 0.94) fontSize *= (W * 0.94) / longest;
  const lineH = fontSize * 0.98;
  const titleTop = H * 0.55;
  lines.forEach((line, li) => {
    const off = drawTitleLine(line, fontSize, grade, W);
    const dw = Math.min(off.width, W * 0.96);
    const dh = (off.height * dw) / off.width;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowOffsetY = H * 0.012;
    ctx.shadowBlur = 0;
    // Italic lean around the line centre.
    const cx = W / 2;
    const cy = titleTop + li * lineH + dh / 2;
    ctx.translate(cx, cy);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.drawImage(off, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  });

  // Neon script subtitle, written across the title's lower third (the
  // winning covers overlap the script with the title, never with the
  // panels below it).
  const scriptSize = H * 0.062;
  ctx.save();
  ctx.translate(W / 2, titleTop + lines.length * lineH - scriptSize * 0.3);
  ctx.rotate(-0.03);
  ctx.font = `${Math.round(scriptSize)}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = grade.script;
  ctx.shadowBlur = H * 0.02;
  ctx.fillStyle = grade.script;
  ctx.fillText(state.script, 0, 0);
  ctx.restore();

  // Tagline strip.
  const tagY = H * 0.895;
  ctx.fillStyle = 'rgba(10,5,18,0.72)';
  ctx.fillRect(0, tagY - H * 0.018, W, H * 0.036);
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.max(11, Math.round(H * 0.02))}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${Math.round(H * 0.003)}px`; } catch (e) { /* older canvas */ }
  ctx.fillText(state.tagline, W / 2, tagY, W * 0.94);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }

  // Sunset hairline above the credit bar.
  const hair = ctx.createLinearGradient(0, 0, W, 0);
  grade.titleStops.forEach((c, i) => hair.addColorStop(i / (grade.titleStops.length - 1), c));
  ctx.fillStyle = hair;
  ctx.fillRect(0, H * 0.925, W, Math.max(2, H * 0.005));

  // Bottom credit bar.
  ctx.fillStyle = grade.bgDeep;
  ctx.fillRect(0, H * 0.93, W, H * 0.07);
  if (state.showComingSoon) {
    ctx.fillStyle = grade.accent;
    ctx.font = `${Math.max(11, Math.round(H * 0.02))}px "Archivo Black", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('COMING SOON', W * 0.015, H * 0.965);
  }
  ctx.fillStyle = '#e8d9b0';
  ctx.font = `${Math.max(9, Math.round(H * 0.0145))}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(state.credit, W * 0.545, H * 0.965, W * 0.66);
  drawBarcode(ctx, W * 0.93, H * 0.942, W * 0.05, H * 0.032);

  // Gold seal, overlapping the panels at the right edge, above the labels.
  if (state.showSeal) {
    drawSeal(ctx, W * 0.925, H * 0.72, H * 0.052, 'ORIGINAL', 'COVER ART');
  }
}

export function drawCoverToCanvas(W, H, state) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  renderCover(canvas.getContext('2d'), W, H, state);
  return canvas;
}
