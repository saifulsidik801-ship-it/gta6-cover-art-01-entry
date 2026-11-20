// Vice Cover Studio — cover renderer (canvas 2D, offline, no libraries).
// Draws the dense multi-panel GTA-style poster: 7 panels, giant striped
// gradient title, neon script subtitle, location chip, starburst badges,
// palm-silhouette strip, catalogue number, corner mark and credit footer.
// Everything is drawn from the state object; main.js owns the editor UI.
(function () {
  'use strict';

  var GOLD = '#f5c542';
  var INK = '#1a0b2e';
  var CREAM = '#fff3d6';

  // Six colour grades. tint is washed over every photo so the panels grade
  // together; stops drive the title gradient.
  var GRADES = [
    { name: 'Vice Sunset', bg: '#1a0b2e', border: '#f5c542', tint: 'rgba(255,110,60,0.16)',
      stops: ['#ffe45e', '#ffb347', '#ff5e3a', '#ff2e88', '#b537f2', '#7b2ff7'],
      script: '#ff5da2', scriptGlow: '#ff2e88', band: '#ff7a3d', accent: '#ff2e88' },
    { name: 'Neon Nights', bg: '#0d0221', border: '#ffd94d', tint: 'rgba(255,46,136,0.20)',
      stops: ['#fef08a', '#fbbf24', '#f472b6', '#e879f9', '#a855f7', '#6366f1'],
      script: '#67e8f9', scriptGlow: '#22d3ee', band: '#c026d3', accent: '#22d3ee' },
    { name: 'Golden Hour', bg: '#241207', border: '#ffd94d', tint: 'rgba(255,170,40,0.20)',
      stops: ['#fff7cc', '#fde68a', '#fbbf24', '#f97316', '#ea580c', '#9a3412'],
      script: '#ffb347', scriptGlow: '#f97316', band: '#f59e0b', accent: '#f97316' },
    { name: 'Midnight Purple', bg: '#12041f', border: '#e9d5ff', tint: 'rgba(123,47,247,0.22)',
      stops: ['#fdf4ff', '#f5d0fe', '#e879f9', '#c026d3', '#7e22ce', '#4c1d95'],
      script: '#f0abfc', scriptGlow: '#c026d3', band: '#9333ea', accent: '#e879f9' },
    { name: 'Coral Heat', bg: '#2b0713', border: '#fecaca', tint: 'rgba(255,80,80,0.20)',
      stops: ['#fef9c3', '#fde047', '#fb923c', '#f43f5e', '#be123c', '#881337'],
      script: '#fda4af', scriptGlow: '#f43f5e', band: '#e11d48', accent: '#fb7185' },
    { name: 'Palm Teal', bg: '#062a2a', border: '#fde68a', tint: 'rgba(45,212,191,0.16)',
      stops: ['#fef9c3', '#fde68a', '#5eead4', '#2dd4bf', '#0ea5e9', '#7c3aed'],
      script: '#5eead4', scriptGlow: '#14b8a6', band: '#0d9488', accent: '#2dd4bf' }
  ];

  // Six caption presets. Every preset carries the full density kit: title,
  // script subtitle, tagline, press quote, location chip, catalogue number
  // and the mid-frame starburst text.
  var CAPTIONS = [
    { title: 'PALM FEVER', script: 'one last summer',
      tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
      quote: 'PURE GOLDEN-HOUR MAYHEM', quoteSrc: 'THE HARBOR GAZETTE',
      location: 'CORAL CAUSEWAY · 7:15 PM', catalog: 'CAT. HW-0826',
      burst: "HOT SUMMER '25", vol: 'VOL. 1' },
    { title: 'HEATWAVE', script: 'Coastline Nights',
      tagline: 'ONE COASTLINE · SIX STORIES · NO CURFEW',
      quote: 'HOTTER THAN THE ASPHALT', quoteSrc: 'THE PALM GAZETTE',
      location: 'OCEAN DRIVE · 6:42 PM', catalog: 'CAT. HW-0917',
      burst: "HOT SUMMER '25", vol: 'VOL. 2' },
    { title: 'HIGH TIDE HUSTLE', script: 'After the Tide',
      tagline: 'ONE COAST · SIX STORIES · NO CURFEW',
      quote: 'A SUN-SOAKED THRILL RIDE.', quoteSrc: 'THE BAYSIDE BUGLE',
      location: 'BAY 13 · 8:05 PM', catalog: 'CAT. HW-1130',
      burst: 'SEASON ONE', vol: 'SEASON ONE' },
    { title: 'NEON HARBOR', script: 'Salt & Sirens',
      tagline: 'SEVEN LIVES · ONE HARBOR · NO WAY BACK',
      quote: 'PURE SALT-WATER MAYHEM', quoteSrc: 'THE HARBOR POST',
      location: 'ROOFTOP BAR · 9:40 PM', catalog: 'CAT. HW-0741',
      burst: 'WANTED ★★★★★', vol: 'VOL. 07' },
    { title: 'SUNSET HEIST', script: 'Ocean Avenue',
      tagline: 'ONE LAST SUMMER JOB',
      quote: 'PURE GOLDEN-HOUR MAYHEM', quoteSrc: 'THE HARBOR GAZETTE',
      location: 'PALM COURT · 11:15 PM', catalog: 'CAT. HW-1220',
      burst: 'ORIGINAL COVER ART', vol: 'VOL. 1' },
    { title: 'SUNSET STATE', script: 'Neon Tide',
      tagline: 'ONE COAST · NO RULES · COMING SOON',
      quote: 'A FEVER DREAM IN NEON', quoteSrc: 'THE COAST HERALD',
      location: 'COAST HIGHWAY · 7:15 PM', catalog: 'CAT. SSC-25-0926',
      burst: 'ORIGINAL COVER ART', vol: 'VOL. 06' }
  ];

  var ROLES = ['THE DRIVER', 'THE BOSS', 'THE INSIDER', 'THE RIDER',
    'THE COURIER', 'THE MECHANIC', 'THE LOOKOUT', 'THE CHOPPER',
    'THE HIDEOUT', 'THE CAPTAIN', 'THE GETAWAY', 'THE WHEELMAN',
    'THE ANGLER', 'THE MOTEL', 'THE STAKEOUT', 'THE ESCAPE'];

  var ROLE_SUBS = {
    'THE DRIVER': 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE',
    'THE BOSS': 'ROOFTOP BAR · 8:05 PM · OWNS THE SKYLINE',
    'THE INSIDER': 'NEON GARAGE · 9:40 PM · KNOWS EVERYTHING',
    'THE RIDER': 'COAST HIGHWAY · 7:15 PM · FULL THROTTLE',
    'THE COURIER': 'RAMEN ROW · 11:20 PM · ALWAYS ON TIME',
    'THE MECHANIC': 'NEON GARAGE · 9:40 PM · CLOSES LATE',
    'THE LOOKOUT': 'BONFIRE BEACH · 6:15 PM · SEES EVERYTHING',
    'THE CHOPPER': 'SKYLINE RUN · 5:30 PM · EYES IN THE SKY',
    'THE HIDEOUT': 'PALM COURT · 11:15 PM · VACANCY',
    'THE CAPTAIN': 'MARINA DEL SOL · 7:48 PM · NO WITNESSES',
    'THE GETAWAY': 'MIDNIGHT STRIP · 12:05 AM · NO BRAKES',
    'THE WHEELMAN': 'MARINA DEL SOL · 7:48 PM · NO WITNESSES',
    'THE ANGLER': 'PIER 9 · 5:55 AM · PATIENT AS EVER',
    'THE MOTEL': 'PALM COURT · 11:15 PM · VACANCY',
    'THE STAKEOUT': 'ROOFTOP BAR · 10:10 PM · WAITING GAME',
    'THE ESCAPE': 'SPEEDBOAT DOCK · 6:05 PM · GONE IN 60'
  };

  // Eight layouts. Rects are fractions of the panel area (x, y, w, h).
  // Every layout has exactly 7 panels; hero is the pop-out panel index.
  var LAYOUTS = [
    { name: 'Vice Classic', hero: 0, slant: 0, panels: [
      [0.27, 0, 0.46, 1], [0, 0, 0.27, 0.34], [0, 0.34, 0.27, 0.33],
      [0, 0.67, 0.27, 0.33], [0.73, 0, 0.27, 0.34], [0.73, 0.34, 0.27, 0.33],
      [0.73, 0.67, 0.27, 0.33] ] },
    { name: 'Hero Left', hero: 0, slant: 0, panels: [
      [0, 0, 0.42, 1], [0.42, 0, 0.29, 0.34], [0.71, 0, 0.29, 0.34],
      [0.42, 0.34, 0.29, 0.33], [0.71, 0.34, 0.29, 0.33],
      [0.42, 0.67, 0.29, 0.33], [0.71, 0.67, 0.29, 0.33] ] },
    { name: 'Hero Right', hero: 6, slant: 0, panels: [
      [0, 0, 0.29, 0.34], [0.29, 0, 0.29, 0.34], [0, 0.34, 0.29, 0.33],
      [0.29, 0.34, 0.29, 0.33], [0, 0.67, 0.29, 0.33], [0.29, 0.67, 0.29, 0.33],
      [0.58, 0, 0.42, 1] ] },
    { name: 'Neon Grid', hero: 4, slant: 0, panels: [
      [0, 0, 0.34, 0.30], [0.34, 0, 0.32, 0.30], [0.66, 0, 0.34, 0.30],
      [0, 0.30, 0.34, 0.36], [0.34, 0.30, 0.32, 0.36], [0.66, 0.30, 0.34, 0.36],
      [0, 0.66, 1, 0.34] ] },
    { name: 'Boulevard', hero: 0, slant: 0, panels: [
      [0, 0, 1, 0.42], [0, 0.42, 0.34, 0.29], [0.34, 0.42, 0.32, 0.29],
      [0.66, 0.42, 0.34, 0.29], [0, 0.71, 0.34, 0.29], [0.34, 0.71, 0.32, 0.29],
      [0.66, 0.71, 0.34, 0.29] ] },
    { name: 'Slanted Seven', hero: 0, slant: 1, panels: [
      [0.27, 0, 0.46, 1], [0, 0, 0.27, 0.34], [0, 0.34, 0.27, 0.33],
      [0, 0.67, 0.27, 0.33], [0.73, 0, 0.27, 0.34], [0.73, 0.34, 0.27, 0.33],
      [0.73, 0.67, 0.27, 0.33] ] },
    { name: 'Sunset Stripes', hero: 3, slant: 0, panels: [
      [0, 0, 0.34, 0.34], [0.34, 0, 0.32, 0.34], [0.66, 0, 0.34, 0.34],
      [0, 0.34, 1, 0.33], [0, 0.67, 0.34, 0.33], [0.34, 0.67, 0.32, 0.33],
      [0.66, 0.67, 0.34, 0.33] ] },
    { name: 'Pop-Out Seven', hero: 0, slant: 0, panels: [
      [0.30, 0, 0.40, 0.92], [0, 0, 0.30, 0.40], [0.70, 0, 0.30, 0.40],
      [0, 0.40, 0.30, 0.30], [0.70, 0.40, 0.30, 0.30],
      [0, 0.70, 0.30, 0.30], [0.70, 0.70, 0.30, 0.30] ] }
  ];

  var SIZES = [
    { name: 'Square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
    { name: 'Portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
    { name: 'Wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
    { name: 'Story', label: 'Story · 1080 × 1920', w: 1080, h: 1920 }
  ];

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // Panel area in pixels: between the top quote bar and the palm strip.
  function panelArea(W, H) {
    return { x: W * 0.012, y: H * 0.052, w: W * 0.976, h: H * 0.852 };
  }

  function layoutPanels(W, H, idx) {
    var lay = LAYOUTS[clamp(idx, 0, LAYOUTS.length - 1)];
    var area = panelArea(W, H);
    var gap = Math.max(3, W * 0.004);
    var rects = lay.panels.map(function (p) {
      return {
        x: area.x + p[0] * area.w + gap / 2,
        y: area.y + p[1] * area.h + gap / 2,
        w: p[2] * area.w - gap,
        h: p[3] * area.h - gap
      };
    });
    return { rects: rects, hero: lay.hero, slant: lay.slant, name: lay.name };
  }

  // Parallelogram path for slanted dividers (top edge shifted right).
  function panelPath(ctx, r, slant) {
    var s = slant ? r.h * 0.055 : 0;
    ctx.beginPath();
    ctx.moveTo(r.x + s, r.y);
    ctx.lineTo(r.x + r.w + s, r.y);
    ctx.lineTo(r.x + r.w - s, r.y + r.h);
    ctx.lineTo(r.x - s, r.y + r.h);
    ctx.closePath();
  }

  function drawPhoto(ctx, img, r, frame, grade) {
    if (!img || !img.naturalWidth) {
      var g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
      g.addColorStop(0, '#3b1d5e'); g.addColorStop(1, '#12041f');
      ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
      return;
    }
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var base = Math.max(r.w / iw, r.h / ih) * (frame ? frame.z : 1.1);
    var dw = iw * base, dh = ih * base;
    var dx = r.x + (r.w - dw) / 2 + (frame ? frame.x : 0) * r.w;
    var dy = r.y + (r.h - dh) / 2 + (frame ? frame.y : 0) * r.h;
    ctx.save();
    try { ctx.filter = 'saturate(1.18) contrast(1.06)'; } catch (e) { /* older canvas */ }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    ctx.fillStyle = grade.tint;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    var warm = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
    warm.addColorStop(0, 'rgba(255,180,80,0.05)');
    warm.addColorStop(1, 'rgba(26,11,46,0.28)');
    ctx.fillStyle = warm;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function starburstPath(ctx, cx, cy, rOut, rIn, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var r = (i % 2 === 0) ? rOut : rIn;
      var a = (Math.PI * i) / points - Math.PI / 2;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawPalm(ctx, x, y, s, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.16, y - s * 0.85);
    ctx.stroke();
    var tx = x + s * 0.16, ty = y - s * 0.85;
    var fronds = [[-1, -0.15], [-0.75, -0.55], [-0.3, -0.8], [0.25, -0.75], [0.7, -0.5], [1, -0.1]];
    for (var i = 0; i < fronds.length; i++) {
      var fx = fronds[i][0], fy = fronds[i][1];
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + fx * s * 0.35, ty + fy * s * 0.45,
        tx + fx * s * 0.62, ty + fy * s * 0.62 + s * 0.28);
      ctx.stroke();
    }
  }

  function drawBarcode(ctx, x, y, w, h, seed) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, y - 3, w + 8, h + 16);
    ctx.fillStyle = '#111111';
    var cx = x, n = 0;
    while (cx < x + w) {
      var bw = 2 + ((seed.charCodeAt(n % seed.length) + n * 7) % 5);
      if ((n + seed.length) % 3 !== 0) ctx.fillRect(cx, y, bw, h);
      cx += bw + 2; n++;
    }
    ctx.fillStyle = '#111111';
    ctx.font = 'bold ' + Math.max(9, h * 0.22) + 'px Oswald, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(seed.replace(/[^0-9A-Z]/g, '').slice(0, 12) || '0826', x + w / 2, y + h + 3);
  }

  function fitTitleFont(ctx, title, maxW, startSize) {
    var size = startSize;
    ctx.font = size + 'px Anton, sans-serif';
    // Effective width includes the thick outline and the italic shear.
    while (size > 24 && ctx.measureText(title).width + size * 0.25 > maxW) {
      size *= 0.94;
      ctx.font = size + 'px Anton, sans-serif';
    }
    return size;
  }

  function drawTitle(ctx, W, H, caption, grade) {
    var title = caption.title || 'PALM FEVER';
    var maxW = W * 0.88;
    var size = fitTitleFont(ctx, title, maxW, W * 0.16);
    var cx = W / 2;
    var baseline = H * 0.795;
    // Offscreen: gradient fill + retro stripes clipped to the letterforms.
    // All coordinates below are in OFFSCREEN space (origin at topY).
    var topY = H * 0.63;
    var off = document.createElement('canvas');
    off.width = Math.ceil(W); off.height = Math.ceil(H * 0.30);
    var o = off.getContext('2d');
    var offBase = baseline - topY;
    o.font = size + 'px Anton, sans-serif';
    o.textAlign = 'center'; o.textBaseline = 'alphabetic';
    o.lineJoin = 'round';
    var grad = o.createLinearGradient(0, offBase - size * 0.72, 0, offBase + size * 0.12);
    var stops = grade.stops;
    for (var i = 0; i < stops.length; i++) {
      grad.addColorStop(i / (stops.length - 1), stops[i]);
    }
    o.save();
    // Italic lean sheared around the baseline, so the title stays centred
    // and the same shear on the main canvas lands exactly on this fill.
    o.translate(cx, offBase);
    o.transform(1, 0, -0.07, 1, 0, 0);
    o.translate(-cx, -offBase);
    o.fillStyle = grad;
    o.fillText(title, cx, offBase);
    // Retro horizontal stripes, kept only where the letters are. They start
    // just below the glyph tops so the yellow crown of the gradient stays
    // clean, and stay light enough to read as retro striping, not a bar.
    o.globalCompositeOperation = 'source-atop';
    var bandTop = offBase - size * 0.68;
    for (var y = bandTop; y < bandTop + size * 1.0; y += size * 0.17) {
      o.fillStyle = 'rgba(60,8,80,0.30)';
      o.fillRect(0, y, W, size * 0.05);
    }
    o.restore();
    // Thick dark outline + drop shadow, drawn on the main canvas with the
    // same shear the offscreen fill already carries. The offscreen image
    // itself is composited WITHOUT an extra transform (a second shear here
    // would shift the fill away from its outline).
    ctx.save();
    ctx.translate(cx, baseline);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.translate(-cx, -baseline);
    ctx.font = size + 'px Anton, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.10;
    ctx.shadowOffsetY = size * 0.045;
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(6, size * 0.085);
    ctx.strokeText(title, cx, baseline);
    ctx.restore();
    ctx.drawImage(off, 0, topY);
    ctx.save();
    ctx.translate(cx, baseline);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.translate(-cx, -baseline);
    ctx.font = size + 'px Anton, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(26,11,46,0.9)';
    ctx.lineWidth = Math.max(3, size * 0.03);
    ctx.strokeText(title, cx, baseline);
    ctx.restore();
    return { size: size, baseline: baseline, top: baseline - size, width: ctx.measureText(title).width };
  }

  function drawScript(ctx, W, H, caption, grade) {
    var script = caption.script || '';
    if (!script) return;
    var size = Math.max(26, W * 0.058);
    ctx.save();
    ctx.translate(W * 0.58, H * 0.865);
    ctx.rotate(-0.045);
    ctx.font = size + 'px Pacifico, cursive';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = grade.scriptGlow;
    ctx.shadowBlur = size * 0.55;
    ctx.fillStyle = grade.script;
    ctx.fillText(script, 0, 0);
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(1.5, size * 0.03);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeText(script, 0, 0);
    ctx.restore();
  }

  function drawRoleLabel(ctx, r, role, sub, W, H, titleRect, isHero, sealRect) {
    var fs = Math.max(13, W * 0.0135);
    var subFs = Math.max(9, W * 0.0085);
    var pad = fs * 0.7;
    // Measure with a given sub-line; returns the label's box.
    function measure(s) {
      ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      var tw = ctx.measureText(role).width;
      ctx.font = '600 ' + subFs + 'px Oswald, sans-serif';
      var sw = s ? ctx.measureText(s).width : 0;
      var bw = Math.max(tw, sw) + pad * 2 + fs * 0.5;
      var bh = fs * 1.5 + (s ? subFs * 1.5 : 0) + pad * 0.6;
      return { bw: bw, bh: bh };
    }
    var parts = sub ? sub.split(' · ') : [];
    var cur = sub || '';
    var box = measure(cur);
    var bx = r.x + Math.max(4, W * 0.004);
    var by = r.y + r.h - box.bh - Math.max(4, W * 0.004);
    function hitsSeal(x, y, w, h) {
      if (!sealRect) return false;
      return x < sealRect.x1 && x + w > sealRect.x0 &&
        y < sealRect.y1 && y + h > sealRect.y0;
    }
    // Never let the gold seal sit on a label: shorten the sub-line segment
    // by segment, then slide the label left of the seal if it still touches.
    while (hitsSeal(bx, by, box.bw, box.bh) && parts.length > 0) {
      parts.pop();
      cur = parts.join(' · ');
      box = measure(cur);
    }
    if (hitsSeal(bx, by, box.bw, box.bh)) {
      bx = Math.max(r.x + Math.max(4, W * 0.004), sealRect.x0 - box.bw - 6);
    }
    var bw = box.bw, bh = box.bh;
    // Bottom-left by default; the hero label lives top-left (its bottom is
    // under the title + tagline pill), and any label the title would cover
    // hops to the top of its panel instead.
    if (isHero) {
      by = r.y + Math.max(4, W * 0.004);
    } else if (titleRect && by < titleRect.bottom && by + bh > titleRect.top &&
        bx < titleRect.right && bx + bw > titleRect.left) {
      by = r.y + Math.max(4, W * 0.004);
    }
    ctx.save();
    ctx.fillStyle = 'rgba(10,4,20,0.88)';
    roundRect(ctx, bx, by, bw, bh, 3);
    ctx.fill();
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(bx, by, Math.max(3, fs * 0.28), bh);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
    ctx.fillText(role, bx + pad + fs * 0.5, by + pad * 0.6 + fs * 0.62);
    if (cur) {
      ctx.fillStyle = GOLD;
      ctx.font = '600 ' + subFs + 'px Oswald, sans-serif';
      ctx.fillText(cur, bx + pad + fs * 0.5, by + pad * 0.6 + fs * 1.35 + subFs * 0.6);
    }
    ctx.restore();
  }

  function drawCover(canvas, state, W, H) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var grade = GRADES[clamp(state.grade | 0, 0, GRADES.length - 1)];
    var caption = state.caption || CAPTIONS[0];
    var lay = layoutPanels(W, H, state.layout | 0);
    var m = Math.max(8, W * 0.008);

    // Backdrop + frame.
    ctx.fillStyle = grade.bg;
    ctx.fillRect(0, 0, W, H);
    var vign = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.2, W / 2, H * 0.5, W * 0.75);
    vign.addColorStop(0, 'rgba(255,140,60,0.10)');
    vign.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, W, H);

    // Panels (hero drawn last so its halo overlaps neighbours).
    var order = lay.rects.map(function (r, i) { return i; })
      .sort(function (a, b) { return (a === lay.hero ? 1 : 0) - (b === lay.hero ? 1 : 0); });
    order.forEach(function (i) {
      var r = lay.rects[i];
      ctx.save();
      panelPath(ctx, r, lay.slant);
      ctx.clip();
      drawPhoto(ctx, state.photos[i], r, state.frames[i], grade);
      ctx.restore();
      ctx.save();
      panelPath(ctx, r, lay.slant);
      ctx.strokeStyle = grade.border;
      ctx.lineWidth = Math.max(2, W * 0.0022);
      ctx.stroke();
      ctx.restore();
    });

    // Hero pop-out: redraw slightly enlarged with a strong white halo.
    (function () {
      var i = lay.hero, r = lay.rects[i];
      var ex = r.w * 0.022, ey = r.h * 0.018;
      var hr = { x: r.x - ex, y: r.y - ey * 1.6, w: r.w + ex * 2, h: r.h + ey * 2.6 };
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = W * 0.02; ctx.shadowOffsetY = H * 0.012;
      panelPath(ctx, hr, lay.slant);
      ctx.clip();
      drawPhoto(ctx, state.photos[i], hr, state.frames[i], grade);
      ctx.restore();
      ctx.save();
      panelPath(ctx, hr, lay.slant);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(4, W * 0.006);
      ctx.stroke();
      ctx.strokeStyle = grade.border;
      ctx.lineWidth = Math.max(1.5, W * 0.0016);
      panelPath(ctx, { x: hr.x + W * 0.006, y: hr.y + W * 0.006,
        w: hr.w - W * 0.012, h: hr.h - W * 0.012 }, lay.slant);
      ctx.stroke();
      ctx.restore();
    })();

    // Location chip (top-2 density) over the upper panels.
    (function () {
      var text = caption.location || '';
      var fs = Math.max(12, W * 0.013);
      ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      var tw = ctx.measureText(text).width;
      var bw = tw + fs * 1.6, bh = fs * 1.9;
      var bx = W * 0.56, by = H * 0.062;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, bx, by, bw, bh, 3);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + bw / 2, by + bh / 2 + 1);
      ctx.restore();
    })();

    // Top bar: stars + press quote + VOL badge + corner mark.
    (function () {
      var fs = Math.max(12, W * 0.014);
      var y = H * 0.026;
      var quote = '"' + (caption.quote || '') + '"';
      var src = '— ' + (caption.quoteSrc || '');
      // Measure everything with its own font first, then shrink the whole
      // bar if it would run into the VOL badge.
      ctx.save();
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      var qw = ctx.measureText(quote).width;
      ctx.font = '600 ' + fs * 0.85 + 'px Oswald, sans-serif';
      var sw = ctx.measureText(src).width;
      var total = W * 0.02 + fs * 5.4 + qw + fs * 1.2 + sw;
      var volW = W * 0.09;
      if (total > W - volW - W * 0.03) fs *= (W - volW - W * 0.03) / total;
      ctx.fillStyle = GOLD;
      ctx.font = fs + 'px sans-serif';
      ctx.fillText('★★★★★', W * 0.02, y);
      ctx.fillStyle = CREAM;
      ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      ctx.fillText(quote, W * 0.02 + fs * 5.4, y);
      var qx = W * 0.02 + fs * 5.4 + ctx.measureText(quote).width + fs * 1.2;
      ctx.fillStyle = GOLD;
      ctx.font = '600 ' + fs * 0.85 + 'px Oswald, sans-serif';
      ctx.fillText(src, qx, y);
      // VOL badge, top-right.
      var vol = caption.vol || 'VOL. 1';
      ctx.font = '800 ' + fs + 'px Oswald, sans-serif';
      var vw = ctx.measureText(vol).width + fs * 1.4;
      ctx.fillStyle = '#ffd21f';
      roundRect(ctx, W - vw - W * 0.015, y - fs * 0.95, vw, fs * 1.9, 2);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center';
      ctx.fillText(vol, W - vw / 2 - W * 0.015, y + 1);
      // Corner mark.
      ctx.fillStyle = grade.accent;
      roundRect(ctx, W * 0.012, H * 0.905 + H * 0.055, W * 0.026, H * 0.032, 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 ' + Math.max(10, W * 0.011) + 'px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HW', W * 0.012 + W * 0.013, H * 0.905 + H * 0.071);
      ctx.restore();
    })();

    // Role labels on every panel. The title's real glyph zone ends just
    // below its baseline, so bottom-row labels stay at the panel bottom.
    // The gold seal's box is shared so no label ever slides under it.
    var sealRad = Math.max(30, W * 0.048);
    var sealRect = { x0: W * 0.905 - sealRad, y0: H * 0.845 - sealRad,
      x1: W * 0.905 + sealRad, y1: H * 0.845 + sealRad };
    var titleRect = { left: W * 0.035, right: W * 0.965, top: H * 0.60, bottom: H * 0.815 };
    lay.rects.forEach(function (r, i) {
      var role = (state.roles && state.roles[i]) || ROLES[i % ROLES.length];
      drawRoleLabel(ctx, r, role, ROLE_SUBS[role] || '', W, H, titleRect, i === lay.hero, sealRect);
    });

    // Mid-frame starburst badge (top-2 "HOT SUMMER '25"), drawn after the
    // labels so it always sits on top: parked on the divider just right of
    // the hero, between the mid-row labels and the title, never on a face.
    (function () {
      var cx = W * 0.745, cy = H * 0.48, rad = Math.max(26, W * 0.042);
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(-0.22); ctx.translate(-cx, -cy);
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = rad * 0.25;
      ctx.shadowOffsetY = rad * 0.08;
      starburstPath(ctx, cx, cy, rad, rad * 0.82, 14);
      ctx.fillStyle = '#ffd21f'; ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#7a1e00'; ctx.lineWidth = Math.max(2, rad * 0.05);
      ctx.stroke();
      ctx.fillStyle = '#7a1e00';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var burst = caption.burst || "HOT SUMMER '25";
      var fs = Math.max(11, rad * 0.30);
      ctx.font = '800 ' + fs + 'px Oswald, sans-serif';
      var words = burst.split(' ');
      if (words.length > 1) {
        ctx.fillText(words.slice(0, -1).join(' '), cx, cy - fs * 0.55);
        ctx.fillText(words[words.length - 1], cx, cy + fs * 0.55);
      } else {
        ctx.fillText(burst, cx, cy);
      }
      ctx.restore();
    })();

    // Giant title + script subtitle + tagline pill.
    var titleInfo = drawTitle(ctx, W, H, caption, grade);
    drawScript(ctx, W, H, caption, grade, titleInfo);
    (function () {
      var text = caption.tagline || '';
      var fs = Math.max(12, W * 0.0145);
      ctx.font = '700 ' + fs + 'px Oswald, sans-serif';
      var tw = ctx.measureText(text).width;
      var bw = tw + fs * 2.4, bh = fs * 2.0;
      var bx = (W - bw) / 2, by = H * 0.878;
      ctx.save();
      ctx.fillStyle = 'rgba(8,3,18,0.92)';
      roundRect(ctx, bx, by, bw, bh, 3);
      ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = Math.max(1.5, W * 0.0012);
      ctx.stroke();
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.moveTo(bx - fs * 0.7, by + bh / 2);
      ctx.lineTo(bx - fs * 0.1, by + fs * 0.3);
      ctx.lineTo(bx - fs * 0.1, by + bh - fs * 0.3);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx + bw + fs * 0.7, by + bh / 2);
      ctx.lineTo(bx + bw + fs * 0.1, by + fs * 0.3);
      ctx.lineTo(bx + bw + fs * 0.1, by + bh - fs * 0.3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, W / 2, by + bh / 2 + 1);
      ctx.restore();
    })();

    // Palm-silhouette strip above the footer.
    (function () {
      var y0 = H * 0.912, y1 = H * 0.948;
      var band = ctx.createLinearGradient(0, y0, 0, y1);
      band.addColorStop(0, grade.band);
      band.addColorStop(1, grade.bg);
      ctx.fillStyle = band;
      ctx.fillRect(0, y0, W, y1 - y0);
      var sunR = (y1 - y0) * 0.85;
      var sg = ctx.createRadialGradient(W * 0.5, y1, 2, W * 0.5, y1, sunR * 1.6);
      sg.addColorStop(0, '#ffe45e'); sg.addColorStop(1, 'rgba(255,46,136,0.0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(W * 0.5, y1, sunR * 1.6, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ffd21f';
      ctx.beginPath(); ctx.arc(W * 0.5, y1, sunR, Math.PI, 0); ctx.fill();
      var s = (y1 - y0) * 0.9;
      for (var i = 0; i < 7; i++) {
        var px = W * (0.06 + i * 0.145) + (i % 2 ? W * 0.03 : 0);
        if (Math.abs(px - W * 0.5) < W * 0.07) continue;
        drawPalm(ctx, px, y1 - 2, s * (0.8 + (i % 3) * 0.15), 'rgba(20,6,32,0.85)');
      }
    })();

    // Bottom-right starburst seal.
    (function () {
      var cx = W * 0.905, cy = H * 0.845, rad = Math.max(30, W * 0.048);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = rad * 0.2; ctx.shadowOffsetY = rad * 0.06;
      starburstPath(ctx, cx, cy, rad, rad * 0.84, 16);
      ctx.fillStyle = '#ffd21f'; ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#7a1e00'; ctx.lineWidth = Math.max(2, rad * 0.04);
      ctx.stroke();
      ctx.fillStyle = '#7a1e00';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var fs = Math.max(10, rad * 0.26);
      ctx.font = '800 ' + fs + 'px Oswald, sans-serif';
      ctx.fillText('ORIGINAL', cx, cy - fs * 0.85);
      ctx.fillText('COVER ART', cx, cy + fs * 0.05);
      ctx.font = fs * 0.8 + 'px sans-serif';
      ctx.fillText('★★★★★', cx, cy + fs * 0.95);
      ctx.restore();
    })();

    // Footer: COMING SOON + credits + catalogue + barcode.
    (function () {
      var y = H * 0.968;
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ff5da2';
      ctx.font = '800 ' + Math.max(12, W * 0.014) + 'px Oswald, sans-serif';
      ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = 8;
      ctx.textAlign = 'left';
      ctx.fillText('COMING SOON', W * 0.045, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,243,214,0.92)';
      ctx.font = '600 ' + Math.max(10, W * 0.0105) + 'px Oswald, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
        W * 0.52, y);
      ctx.fillStyle = GOLD;
      ctx.font = '700 ' + Math.max(10, W * 0.0105) + 'px Oswald, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(caption.catalog || '', W * 0.86, y);
      drawBarcode(ctx, W * 0.885, H * 0.952, W * 0.075, H * 0.02,
        (caption.catalog || 'HW-0826').replace(/[^0-9]/g, '') + '12820');
      ctx.restore();
    })();

    // Outer frame.
    ctx.save();
    ctx.strokeStyle = grade.border;
    ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(m / 2, m / 2, W - m, H - m);
    ctx.restore();
  }

  function ensureFonts() {
    var faces = [
      ['Anton', 'fonts/Anton-Regular.ttf', '400'],
      ['Oswald', 'fonts/Oswald.ttf', '400'],
      ['Oswald', 'fonts/Oswald.ttf', '700'],
      ['Pacifico', 'fonts/Pacifico-Regular.ttf', '400']
    ];
    var loads = faces.map(function (f) {
      try {
        var face = new FontFace(f[0], 'url(' + f[1] + ')', { weight: f[2] });
        document.fonts.add(face);
        return face.load().catch(function () { return null; });
      } catch (e) { return Promise.resolve(null); }
    });
    return Promise.all(loads).then(function () {
      return Promise.all([
        document.fonts.load('100px Anton'),
        document.fonts.load('700 20px Oswald'),
        document.fonts.load('40px Pacifico')
      ]).catch(function () { return null; });
    });
  }

  window.ViceCover = {
    GRADES: GRADES, CAPTIONS: CAPTIONS, ROLES: ROLES, ROLE_SUBS: ROLE_SUBS,
    LAYOUTS: LAYOUTS, SIZES: SIZES,
    layoutPanels: layoutPanels, drawCover: drawCover, ensureFonts: ensureFonts,
    panelArea: panelArea
  };
})();
