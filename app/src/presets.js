// Vice Cover Studio — presets: layouts, colour grades, caption sets, cast roles.
// Layouts are functions of (W, H) returning panel rects in pixels, in a
// 0..1 fraction space so one layout works at every export size.
// The panel zone runs under the top bar and behind the title; the title is
// drawn over the lower panels, exactly like the winning covers.

export const PANEL_ZONE = { x: 0.015, y: 0.08, w: 0.97, h: 0.86 };

function rect(x, y, w, h) {
  return { x, y, w, h };
}

// Seven panels: big hero in the centre, six around it. The classic winner.
// Panels end at y 0.86 so the tagline strip (0.877) and credit bar (0.93)
// never cover a panel's role label.
function layoutClassic7(W, H) {
  return [
    rect(0.31, 0.08, 0.38, 0.544), // 0 hero
    rect(0.015, 0.08, 0.28, 0.272),
    rect(0.705, 0.08, 0.28, 0.272),
    rect(0.015, 0.37, 0.28, 0.254),
    rect(0.705, 0.37, 0.28, 0.254),
    rect(0.015, 0.642, 0.48, 0.218),
    rect(0.505, 0.642, 0.48, 0.218),
  ];
}

// Five panels: tall hero on the left, a 2x2 grid on the right.
function layoutHeroLeft(W, H) {
  return [
    rect(0.015, 0.08, 0.44, 0.78), // 0 hero
    rect(0.475, 0.08, 0.25, 0.381),
    rect(0.74, 0.08, 0.245, 0.381),
    rect(0.475, 0.479, 0.25, 0.381),
    rect(0.74, 0.479, 0.245, 0.381),
  ];
}

// Six panels: hero in the middle, corners around it.
function layoutHeroCenter(W, H) {
  return [
    rect(0.3, 0.08, 0.4, 0.526), // 0 hero
    rect(0.015, 0.08, 0.27, 0.254),
    rect(0.715, 0.08, 0.27, 0.254),
    rect(0.015, 0.624, 0.31, 0.236),
    rect(0.34, 0.624, 0.32, 0.236),
    rect(0.675, 0.624, 0.31, 0.236),
  ];
}

// Six panels: an even 3x2 grid.
function layoutGrid6(W, H) {
  return [
    rect(0.015, 0.08, 0.315, 0.381),
    rect(0.345, 0.08, 0.315, 0.381),
    rect(0.675, 0.08, 0.31, 0.381),
    rect(0.015, 0.479, 0.315, 0.381),
    rect(0.345, 0.479, 0.315, 0.381),
    rect(0.675, 0.479, 0.31, 0.381),
  ];
}

// Four panels: one wide hero on top, three below.
function layoutCinematic(W, H) {
  return [
    rect(0.015, 0.08, 0.97, 0.472), // 0 hero
    rect(0.015, 0.57, 0.315, 0.29),
    rect(0.345, 0.57, 0.315, 0.29),
    rect(0.675, 0.57, 0.31, 0.29),
  ];
}

// Five panels, tuned for tall covers: hero on top, 2x2 below.
function layoutStack(W, H) {
  return [
    rect(0.015, 0.08, 0.97, 0.417), // 0 hero
    rect(0.015, 0.515, 0.97, 0.163), // 1 wide band behind the title
    rect(0.015, 0.697, 0.48, 0.163),
    rect(0.505, 0.697, 0.48, 0.163),
  ];
}

export const LAYOUTS = {
  classic7: { name: 'Classic 7', panels: 7, hero: 0, fn: layoutClassic7 },
  heroLeft: { name: 'Hero Left', panels: 5, hero: 0, fn: layoutHeroLeft },
  heroCenter: { name: 'Hero Center', panels: 6, hero: 0, fn: layoutHeroCenter },
  grid6: { name: 'Grid 6', panels: 6, hero: -1, fn: layoutGrid6 },
  cinematic: { name: 'Cinematic', panels: 4, hero: 0, fn: layoutCinematic },
  stack: { name: 'Stack', panels: 4, hero: 0, fn: layoutStack },
};

// A grade is the whole colour world of a cover: background, border, the
// title's gradient stops, the script colour, the photo tint and the filter
// the photos are drawn with.
export const GRADES = {
  sunsetGold: {
    name: 'Sunset Gold',
    bg: '#160a24', bgDeep: '#0b0512', border: '#f5c86b',
    titleStops: ['#ffe259', '#ffa751', '#ff5e62', '#c642ff'],
    script: '#ff5fa2', accent: '#ffd166', quote: '#ffd166',
    tint: 'rgba(255,120,40,0.10)', filter: 'saturate(1.25) contrast(1.08)',
    scrim: 'rgba(20,6,32,0.55)',
  },
  neonNights: {
    name: 'Neon Nights',
    bg: '#0b0618', bgDeep: '#05030c', border: '#7df9ff',
    titleStops: ['#7df9ff', '#b06bff', '#ff2e88', '#ff8c42'],
    script: '#37f4ff', accent: '#ff2e88', quote: '#7df9ff',
    tint: 'rgba(120,40,255,0.12)', filter: 'saturate(1.35) contrast(1.12)',
    scrim: 'rgba(8,4,24,0.55)',
  },
  twilightPink: {
    name: 'Twilight Pink',
    bg: '#220a1e', bgDeep: '#120610', border: '#ffb3d9',
    titleStops: ['#fff1a8', '#ffb347', '#ff5e8a', '#a64dff'],
    script: '#ff7ad9', accent: '#ffd166', quote: '#ffb3d9',
    tint: 'rgba(255,60,140,0.10)', filter: 'saturate(1.3) contrast(1.06)',
    scrim: 'rgba(30,8,26,0.55)',
  },
  palmNoir: {
    name: 'Palm Noir',
    bg: '#0a0f14', bgDeep: '#05080a', border: '#e8e8e8',
    titleStops: ['#ffffff', '#ffd166', '#ff8c42', '#e23a3a'],
    script: '#8affd1', accent: '#ffffff', quote: '#e8e8e8',
    tint: 'rgba(0,0,0,0.18)', filter: 'saturate(1.1) contrast(1.15)',
    scrim: 'rgba(5,8,10,0.55)',
  },
};

// Caption sets: title (two lines), neon script line, tagline, press quote.
export const CAPTIONS = [
  {
    name: 'Palm Fever',
    title: ['PALM', 'FEVER'], script: 'one last summer',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    quote: 'PURE GOLDEN-HOUR MAYHEM', source: 'THE HARBOR GAZETTE', vol: 'VOL. 1',
    credit: 'A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
  },
  {
    name: 'Heatwave',
    title: ['HEAT', 'WAVE'], script: 'Coastline Nights',
    tagline: 'ONE COASTLINE · SIX STORIES · NO CURFEW',
    quote: 'HOTTER THAN THE ASPHALT', source: 'THE PALM GAZETTE', vol: 'VOL. 2',
    credit: 'A NIGHTSHIFT PICTURE · STARRING YOUR CREW · SHOT ON YOUR OWN CAMERA · INKED BY HAND IN THE STUDIO',
  },
  {
    name: 'Neon Harbor',
    title: ['NEON', 'HARBOR'], script: 'Salt & Sirens',
    tagline: 'SEVEN LIVES · ONE HARBOR · NO WAY BACK',
    quote: 'PURE SALT-WATER MAYHEM', source: 'THE HARBOR POST', vol: 'VOL. 7',
    credit: 'A NEON HARBOR PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
  },
  {
    name: 'Sunset Heist',
    title: ['SUNSET', 'HEIST'], script: 'Ocean Avenue',
    tagline: 'ONE LAST SUMMER JOB',
    quote: 'A CAST TO DIE FOR', source: 'NIGHT OWL WEEKLY', vol: 'SEASON ONE',
    credit: 'A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA · GRADED BY HAND',
  },
];

export const ROLES = [
  'THE DRIVER', 'THE BOSS', 'THE INSIDER', 'THE RIDER',
  'THE COURIER', 'THE MECHANIC', 'THE LOOKOUT', 'THE CAPTAIN',
  'THE CHOPPER', 'THE GETAWAY', 'THE MOTEL', 'THE HIDEOUT',
];

export const SAMPLE_PHOTOS = [
  { file: 'samples/hero-woman.jpg', label: 'THE DRIVER' },
  { file: 'samples/boss-man.jpg', label: 'THE BOSS' },
  { file: 'samples/neon-car.jpg', label: 'THE GETAWAY' },
  { file: 'samples/boat-palms.jpg', label: 'THE CAPTAIN' },
  { file: 'samples/fisherman.jpg', label: 'THE ANGLER' },
  { file: 'samples/heli-city.jpg', label: 'THE CHOPPER' },
];

export const EXPORT_SIZES = [
  { key: '1920x1080', w: 1920, h: 1080, name: 'Wide 1920 × 1080' },
  { key: '1080x1080', w: 1080, h: 1080, name: 'Square 1080 × 1080' },
  { key: '1080x1350', w: 1080, h: 1350, name: 'Portrait 1080 × 1350' },
  { key: '1080x1920', w: 1080, h: 1920, name: 'Story 1080 × 1920' },
];
