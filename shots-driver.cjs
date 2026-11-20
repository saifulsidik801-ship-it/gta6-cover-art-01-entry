// Screenshot driver for Vice Cover Studio.
// Serves the app with serve.ts, loads it in headless Chromium via
// playwright-core, checks for console/page errors, and captures the four
// screenshots named in shots.json as JPEGs sized to the kit's limits.
const { chromium } = require('/home/hatch/workspace/mm-wallet/node_modules/playwright-core');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 2-editor.jpg: the editor with the sample set loaded.
  await page.screenshot({ path: '/tmp/gca-editor-raw.png' });

  const grab = async (name, fn) => {
    const dataUrl = await page.evaluate(fn);
    fs.writeFileSync('/tmp/' + name + '.b64', dataUrl.split(',')[1]);
  };

  // 1-cover.jpg: default preset, wide 1920x1080.
  await grab('gca-cover', () => {
    window.__vice.setSize('1920x1080');
    const c = window.__vice.exportCanvas();
    return c.toDataURL('image/jpeg', 0.92);
  });

  // 3-cover-square.jpg: Neon Nights + Hero Left, square 1080x1080.
  await grab('gca-square', () => {
    window.__vice.setGrade('neonNights');
    window.__vice.setLayout('heroLeft');
    window.__vice.setCaption(2);
    window.__vice.setSize('1080x1080');
    const c = window.__vice.exportCanvas();
    return c.toDataURL('image/jpeg', 0.92);
  });

  // 4-cover-portrait.jpg: Twilight Pink + Stack, portrait 1080x1350.
  await grab('gca-portrait', () => {
    window.__vice.setGrade('twilightPink');
    window.__vice.setLayout('stack');
    window.__vice.setCaption(3);
    window.__vice.setSize('1080x1350');
    const c = window.__vice.exportCanvas();
    return c.toDataURL('image/jpeg', 0.92);
  });

  console.log('ERRORS:', JSON.stringify(errors, null, 1));
  await browser.close();
})().catch((e) => { console.error('DRIVER FAILED', e); process.exit(1); });
