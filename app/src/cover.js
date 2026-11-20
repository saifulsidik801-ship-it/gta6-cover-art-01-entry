// Vice Cover Studio — cover renderer.
// Draws a multi-panel GTA-style poster cover onto any 2D canvas context:
// photo panels with gold frames, a pop-out hero, gradient block lettering,
// a neon script subtitle, a tagline ribbon, press bar, credits and seal.
// All art is drawn in code; no Rockstar logo, artwork or fonts are used.

export const LAYOUTS = [
  {
    id: 'classic',
    name: 'Vice Classic',
    hero: 0,
    panels: [
      { x: 0.3, y: 0.05, w: 0.4, h: 0.58, label: 'THE CAPTAIN' },
      { x: 0.015, y: 0.05, w: 0.27, h: 0.27, label: 'THE INSIDER' },
      { x: 0.715, y: 0.05, w: 0.27, h: 0.27, label: 'THE BOSS' },
      { x: 0.015, y: 0.34, w: 0.27, h: 0.28, label: 'THE RIDER' },
      { x: 0.715, y: 0.34, w: 0.27, h: 0.28, label: 'THE COURIER' },
      { x: 0.015, y: 0.64, w: 0.97, h: 0.29, label: 'THE GETAWAY' },
    ],
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    hero: 3,
    panels: [
      { x: 0.015, y: 0.05, w: 0.315, h: 0.4, label: 'THE DRIVER' },
      { x: 0.345, y: 0.05, w: 0.31, h: 0.4, label: 'THE LOOKOUT' },
      { x: 0.67, y: 0.05, w: 0.315, h: 0.4, label: 'THE BOSS' },
      { x: 0.015, y: 0.47, w: 0.47, h: 0.46, label: 'THE CAPTAIN' },
      { x: 0.5, y: 0.47, w: 0.485, h: 0.22, label: 'THE MECHANIC' },
      { x: 0.5, y: 0.71, w: 0.485, h: 0.22, label: 'THE MOTEL' },
    ],
  },
  {
    id: 'pop-out',
    name: 'Pop-Out Seven',
    hero: 0,
    panels: [
      { x: 0.26, y: 0.03, w: 0.48, h: 0.64, label: 'THE CAPTAIN' },
      { x: 0.015, y: 0.05, w: 0.23, h: 0.28, label: 'THE INSIDER' },
      { x: 0.755, y: 0.05, w: 0.23, h: 0.28, label: 'THE BOSS' },
      { x: 0.015, y: 0.35, w: 0.23, h: 0.28, label: 'THE RIDER' },
      { x: 0.755, y: 0.35, w: 0.23, h: 0.28, label: 'THE COURIER' },
      { x: 0.015, y: 0.65, w: 0.23, h: 0.28, label: 'THE WHEELMAN' },
      { x: 0.755, y: 0.65, w: 0.23, h: 0.28, label: 'THE ANGLER' },
    ],
  },
  {
    id: 'boulevard',
    name: 'Boulevard',
    hero: 0,
    panels: [
      { x: 0.015, y: 0.05, w: 0.36, h: 0.88, label: 'THE CAPTAIN' },
      { x: 0.385, y: 0.05, w: 0.6, h: 0.28, label: 'THE DRIVER' },
      { x: 0.385, y: 0.35, w: 0.295, h: 0.28, label: 'THE LOOKOUT' },
      { x: 0.695, y: 0.35, w: 0.29, h: 0.28, label: 'THE BOSS' },
      { x: 0.385, y: 0.65, w: 0.6, h: 0.28, label: 'THE GETAWAY' },
    ],
  },
  {
    id: 'stripes',
    name: 'Sunset Stripes',
    hero: 2,
    panels: [
      { x: 0.015, y: 0.05, w: 0.3, h: 0.42, label: 'THE INSIDER' },
      { x: 0.015, y: 0.49, w: 0.3, h: 0.44, label: 'THE RIDER' },
      { x: 0.33, y: 0.05, w: 0.34, h: 0.88, label: 'THE CAPTAIN' },
      { x: 0.685, y: 0.05, w: 0.3, h: 0.42, label: 'THE BOSS' },
      { x: 0.685, y: 0.49, w: 0.3, h: 0.44, label: 'THE COURIER' },
    ],
  },
  {
    id: 'seven-stories',
    name: 'Seven Stories',
    hero: 4,
    panels: [
      { x: 0.015, y: 0.05, w: 0.31, h: 0.3, label: 'THE DRIVER' },
      { x: 0.345, y: 0.05, w: 0.31, h: 0.3, label: 'THE NAVIGATOR' },
      { x: 0.675, y: 0.05, w: 0.31, h: 0.3, label: 'THE BOSS' },
      { x: 0.015, y: 0.37, w: 0.27, h: 0.3, label: 'THE LOOKOUT' },
      { x: 0.3, y: 0.37, w: 0.4, h: 0.3, label: 'THE CAPTAIN' },
      { x: 0.715, y: 0.37, w: 0.27, h: 0.3, label: 'THE MECHANIC' },
      { x: 0.015, y: 0.69, w: 0.48, h: 0.24, label: 'THE GETAWAY' },
      { x: 0.505, y: 0.69, w: 0.48, h: 0.24, label: 'THE HIDEOUT' },
    ],
  },
];

export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    photoFilter: 'saturate(1.18) contrast(1.06) brightness(1.02)',
    wash: ['rgba(255,140,66,0.16)', 'rgba(255,46,136,0.20)'],
    titleStops: ['#ffe259', '#ffa751', '#ff2e88', '#b967ff'],
    script: '#ff5da2',
    accent: '#ffd98a',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    photoFilter: 'saturate(1.35) contrast(1.12) brightness(0.98)',
    wash: ['rgba(255,0,128,0.20)', 'rgba(0,229,255,0.18)'],
    titleStops: ['#7df9ff', '#ff5da2', '#ff2e88', '#7b2ff7'],
    script: '#00e5ff',
    accent: '#7df9ff',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    photoFilter: 'saturate(1.25) contrast(1.04) brightness(1.06) sepia(0.18)',
    wash: ['rgba(255,176,32,0.20)', 'rgba(255,110,60,0.14)'],
    titleStops: ['#fff3a3', '#ffb020', '#ff7a18', '#ff4d6d'],
    script: '#ff9e00',
    accent: '#ffe9a8',
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    photoFilter: 'saturate(1.15) contrast(1.1) brightness(0.94)',
    wash: ['rgba(123,47,247,0.22)', 'rgba(8,8,40,0.28)'],
    titleStops: ['#c9b6ff', '#ff7ad9', '#ff2e88', '#5b2ee5'],
    script: '#e07bff',
    accent: '#d9c8ff',
  },
];

export const CAPTIONS = [
  {
    id: 'palm-fever',
    title: 'PALM FEVER',
    subtitle: 'one last summer',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: 'PURE GOLDEN-HOUR MAYHEM',
    source: 'THE HARBOR GAZETTE',
  },
  {
    id: 'high-tide',
    title: 'HIGH TIDE HUSTLE',
    subtitle: 'After the Tide',
    tagline: 'ONE COASTLINE · SIX STORIES · NO CURFEW',
    quote: 'A SUN-SOAKED THRILL RIDE',
    source: 'THE BAYSIDE BUGLE',
  },
  {
    id: 'neon-harbor',
    title: 'NEON HARBOR',
    subtitle: 'Coastline Nights',
    tagline: 'SEVEN LIVES · ONE HARBOR · NO WAY BACK',
    quote: 'NEON NEVER LOOKED THIS GOOD',
    source: 'THE VICE LEDGER',
  },
  {
    id: 'sunset-heist',
    title: 'SUNSET HEIST',
    subtitle: 'The Long Weekend',
    tagline: 'ONE LAST JOB · ONE LONG SUMMER',
    quote: 'FIVE STARS OF PURE ESCAPE',
    source: 'THE PALM POST',
  },
];

export const EXPORT_SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story · 1080 × 1920', w: 1080, h: 1920 },
];

const GOLD = '#ffd98a';
const INK = '#1a0b2e';
const CREAM = '#fff6e0';

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStars(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let i = -2; i <= 2; i++) {
    starPath(ctx, cx + i * r * 2.3, cy, r);
    ctx.fill();
  }
}

function fitFont(ctx, text, maxWidth, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 24 && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

function coverDrawImage(ctx, img, px, py, pw, ph, zoom, ox, oy) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(pw / iw, ph / ih) * zoom;
  const dw = iw * base;
  const dh = ih * base;
  const dx = px + (pw - dw) / 2 + ox * pw * 0.4;
  const dy = py + (ph - dh) / 2 + oy * ph * 0.4;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanelLabel(ctx, x, y, text, scale) {
  ctx.font = `600 ${Math.round(15 * scale)}px Oswald, sans-serif`;
  const pad = 8 * scale;
  const w = ctx.measureText(text).width + pad * 2 + 5 * scale;
  const h = 24 * scale;
  ctx.fillStyle = 'rgba(10,4,20,0.92)';
  ctx.fillRect(x, y - h, w, h);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(x, y - h, 5 * scale, h);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad + 5 * scale, y - h / 2 + 1);
}

function drawPalmSilhouette(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -34, 2, -62);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (-160 + i * 52) * (Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(2, -62);
    ctx.quadraticCurveTo(2 + Math.cos(a) * 26, -62 + Math.sin(a) * 20 - 8, 2 + Math.cos(a) * 44, -62 + Math.sin(a) * 30 + 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 16;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes;
    const rad = i % 2 === 0 ? r : r * 0.86;
    const x = Math.cos(ang) * rad;
    const y = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#f5b90d';
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#8a5a00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe9a8';
  ctx.fill();
  ctx.fillStyle = '#3a1500';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.28);
  ctx.fillText('COVER ART', 0, r * 0.02);
  drawStars(ctx, 0, r * 0.36, 4.5 * scale, '#c0392b');
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, seed) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 14);
  ctx.fillStyle = '#111111';
  let n = seed;
  let bx = x;
  while (bx < x + w) {
    n = (n * 1103515245 + 12345) & 0x7fffffff;
    const bw = 2 + (n % 4);
    if (n % 3 !== 0) ctx.fillRect(bx, y, bw, h);
    bx += bw + 2;
  }
  ctx.fillStyle = '#111111';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('0 02113 128820', x + w / 2, y + h + 10);
}

function drawGrain(ctx, W, H, noiseCanvas) {
  if (!noiseCanvas) return;
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

let noiseTile = null;
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  noiseTile = document.createElement('canvas');
  noiseTile.width = 128;
  noiseTile.height = 128;
  const nctx = noiseTile.getContext('2d');
  const img = nctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 100 + Math.floor(Math.random() * 110);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  return noiseTile;
}

// The main entry: paint the whole cover for the given state at W x H.
export function drawCover(ctx, state, W, H) {
  const layout = LAYOUTS[state.layout] || LAYOUTS[0];
  const grade = GRADES[state.grade] || GRADES[0];
  const scale = W / 1080;
  const gap = Math.max(3, 5 * scale);

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // Photo panels, with the grade's filter applied to the photos.
  ctx.filter = grade.photoFilter;
  layout.panels.forEach((panel, i) => {
    const px = panel.x * W;
    const py = panel.y * H;
    const pw = panel.w * W;
    const ph = panel.h * H;
    const photo = state.panels[i] && state.panels[i].photo;
    const zoom = (state.panels[i] && state.panels[i].zoom) || 1;
    const ox = (state.panels[i] && state.panels[i].ox) || 0;
    const oy = (state.panels[i] && state.panels[i].oy) || 0;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (photo) {
      coverDrawImage(ctx, photo, px, py, pw, ph, zoom, ox, oy);
    } else {
      const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, '#3b1a5e');
      g.addColorStop(1, '#12041f');
      ctx.fillStyle = g;
      ctx.fillRect(px, py, pw, ph);
    }
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    const wash = ctx.createLinearGradient(px, py, px, py + ph);
    wash.addColorStop(0, grade.wash[0]);
    wash.addColorStop(1, grade.wash[1]);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = wash;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(2, 3 * scale);
    ctx.strokeRect(px + gap / 2, py + gap / 2, pw - gap, ph - gap);
  });
  ctx.filter = 'none';

  // Pop-out hero: re-draw the hero photo bigger, breaking its frame with a halo.
  const heroIndex = layout.hero;
  const heroPanel = layout.panels[heroIndex];
  const heroPhoto = state.panels[heroIndex] && state.panels[heroIndex].photo;
  if (heroPhoto && heroPanel) {
    const expandX = 0.022 * W;
    const expandY = 0.03 * H;
    const px = heroPanel.x * W - expandX;
    const py = heroPanel.y * H - expandY;
    const pw = heroPanel.w * W + expandX * 2;
    const ph = heroPanel.h * H + expandY * 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 26 * scale;
    ctx.shadowOffsetY = 10 * scale;
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.filter = grade.photoFilter;
    const zoom = (state.panels[heroIndex].zoom || 1) * 1.04;
    coverDrawImage(ctx, heroPhoto, px, py, pw, ph, zoom, state.panels[heroIndex].ox || 0, state.panels[heroIndex].oy || 0);
    ctx.filter = 'none';
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    const wash = ctx.createLinearGradient(px, py, px, py + ph);
    wash.addColorStop(0, grade.wash[0]);
    wash.addColorStop(1, grade.wash[1]);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = wash;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, 5 * scale);
    ctx.strokeRect(px, py, pw, ph);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1.5, 2 * scale);
    ctx.strokeRect(px + 5 * scale, py + 5 * scale, pw - 10 * scale, ph - 10 * scale);
  }

  // Panel role labels. The hero's label sits at its top edge so the big
  // title never covers it; the rest sit at the bottom-left of their panel.
  layout.panels.forEach((panel, i) => {
    const label = (state.panels[i] && state.panels[i].label) || panel.label;
    if (!label) return;
    if (i === layout.hero) {
      drawPanelLabel(ctx, panel.x * W + 6 * scale, panel.y * H + 31 * scale, label, scale);
    } else {
      drawPanelLabel(ctx, panel.x * W + 6 * scale, (panel.y + panel.h) * H - 7 * scale, label, scale);
    }
  });

  // Warm vignette over everything.
  const vig = ctx.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,24,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Top press bar.
  const barH = 0.048 * H;
  ctx.fillStyle = 'rgba(12,3,26,0.88)';
  ctx.fillRect(0, 0, W, barH);
  drawStars(ctx, 0.075 * W, barH / 2, 8 * scale, '#f5b90d');
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const quotePx = fitFont(ctx, `"${state.quote}"`, 0.42 * W, 17 * scale, 'Oswald, sans-serif', 600);
  ctx.font = `600 ${quotePx}px Oswald, sans-serif`;
  ctx.fillText(`"${state.quote}"`, 0.13 * W, barH / 2 + 1);
  const quoteW = ctx.measureText(`"${state.quote}"`).width;
  ctx.fillStyle = grade.accent;
  const srcPx = fitFont(ctx, `— ${state.quoteSource}`, 0.2 * W, 13 * scale, 'Oswald, sans-serif', 500);
  ctx.font = `500 ${srcPx}px Oswald, sans-serif`;
  ctx.fillText(`— ${state.quoteSource}`, 0.13 * W + quoteW + 12 * scale, barH / 2 + 1);
  const vol = state.volume || 'VOL. 1';
  ctx.font = `700 ${Math.round(15 * scale)}px Oswald, sans-serif`;
  const volW = ctx.measureText(vol).width + 22 * scale;
  ctx.fillStyle = '#f5b90d';
  ctx.fillRect(W - volW - 0.015 * W, barH * 0.14, volW, barH * 0.72);
  ctx.fillStyle = '#1a0b2e';
  ctx.textAlign = 'center';
  ctx.fillText(vol, W - volW / 2 - 0.015 * W, barH / 2 + 1);

  // Palm silhouettes flanking the title zone.
  drawPalmSilhouette(ctx, 0.03 * W, 0.86 * H, 1.1 * scale, 'rgba(20,4,34,0.85)');
  drawPalmSilhouette(ctx, 0.965 * W, 0.86 * H, 0.9 * scale, 'rgba(20,4,34,0.85)');

  // Big gradient title, slightly skewed, with a dark outline and drop shadow.
  // Shrink the title until the whole title block (title + script subtitle +
  // tagline ribbon) clears the bottom credit strip.
  const titleY = H * (H >= W ? 0.72 : 0.7);
  let titleSize = fitFont(ctx, state.title, 0.96 * W, 0.135 * W, 'Anton, sans-serif', 400);
  const subSize = fitFont(ctx, state.subtitle, 0.62 * W, 0.062 * W, 'Pacifico, cursive', 400);
  const tagH = 30 * scale;
  while (titleSize > 40 && titleY + titleSize * 0.62 + subSize * 0.85 + tagH > H * 0.925) {
    titleSize *= 0.92;
  }
  ctx.save();
  ctx.translate(0, titleY);
  ctx.transform(1, 0, -0.045, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${titleSize}px Anton, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 18 * scale;
  ctx.shadowOffsetY = 8 * scale;
  const tg = ctx.createLinearGradient(0, -titleSize * 0.55, 0, titleSize * 0.55);
  grade.titleStops.forEach((c, i) => tg.addColorStop(i / (grade.titleStops.length - 1), c));
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2a0a3a';
  ctx.lineWidth = titleSize * 0.16;
  ctx.strokeText(state.title, W / 2, 0);
  ctx.fillStyle = tg;
  ctx.fillText(state.title, W / 2, 0);
  ctx.restore();

  // Neon script subtitle overlapping the title's lower edge.
  ctx.save();
  ctx.translate(W / 2, titleY + titleSize * 0.62);
  ctx.rotate(-0.045);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = grade.script;
  ctx.shadowBlur = 22 * scale;
  ctx.font = `${subSize}px Pacifico, cursive`;
  ctx.lineWidth = subSize * 0.1;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText(state.subtitle, 0, 0);
  ctx.fillStyle = grade.script;
  ctx.fillText(state.subtitle, 0, 0);
  ctx.restore();

  // Tagline ribbon.
  const tagY = titleY + titleSize * 0.62 + subSize * 0.85;
  ctx.font = `600 ${Math.round(17 * scale)}px Oswald, sans-serif`;
  const tagW = ctx.measureText(state.tagline).width + 44 * scale;
  const tagX = (W - tagW) / 2;
  ctx.fillStyle = 'rgba(8,2,18,0.94)';
  ctx.fillRect(tagX, tagY, tagW, tagH);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeRect(tagX, tagY, tagW, tagH);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(tagX - 12 * scale, tagY + tagH / 2);
  ctx.lineTo(tagX - 2 * scale, tagY + 4 * scale);
  ctx.lineTo(tagX - 2 * scale, tagY + tagH - 4 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tagX + tagW + 12 * scale, tagY + tagH / 2);
  ctx.lineTo(tagX + tagW + 2 * scale, tagY + 4 * scale);
  ctx.lineTo(tagX + tagW + 2 * scale, tagY + tagH - 4 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.tagline, W / 2, tagY + tagH / 2 + 1);

  // Bottom credit strip.
  const credY = H - 0.038 * H;
  ctx.fillStyle = 'rgba(12,3,26,0.9)';
  ctx.fillRect(0, H - 0.062 * H, W, 0.062 * H);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.font = `500 ${Math.round(13.5 * scale)}px Oswald, sans-serif`;
  ctx.fillText('A SUNSET PICTURES PRODUCTION  ·  STARRING YOU  ·  SHOT ON YOUR OWN CAMERA  ·  GRADED BY HAND', W / 2, credY);
  ctx.textAlign = 'left';
  ctx.font = `700 ${Math.round(17 * scale)}px Oswald, sans-serif`;
  ctx.fillStyle = grade.script;
  ctx.shadowColor = grade.script;
  ctx.shadowBlur = 10 * scale;
  ctx.fillText('COMING SOON', 0.018 * W, credY);
  ctx.shadowBlur = 0;
  drawBarcode(ctx, W - 0.115 * W, H - 0.055 * H, 0.085 * W, 0.028 * H, state.title.length * 7919 + 13);
  if (W >= 900) drawSeal(ctx, W - 0.085 * W, H - 0.155 * H, 52 * scale, scale);

  drawGrain(ctx, W, H, getNoiseTile());
  ctx.restore();
}
