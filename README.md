# gta6-cover-art-01-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/saifulsidik801-ship-it/gta6-cover-art-01-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/saifulsidik801-ship-it/gta6-cover-art-01-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — turn your photos into GTA-style multi-panel cover art: a sunset-graded poster with bold gradient lettering, a neon script line, cast labels, press quote and barcode, exported as a PNG in the common post sizes. It runs offline in a desktop browser from its own static files; your photos never leave your machine.

## What it does

- **Multi-panel covers** — 6 layouts (Classic 7, Hero Left, Hero Center, Grid 6, Cinematic, Stack) with a pop-out hero panel that breaks its frame.
- **Any photo** — upload your own photos, or use the 6 bundled AI-generated sample photos. Click a panel to select it, drag on the preview to move its photo, scroll to zoom, and tune zoom / X / Y per panel. One photo can fill several panels.
- **Caption editing** — title (two lines), neon script line, tagline, press quote + source, volume badge and credit line, all editable, plus 4 caption presets.
- **Colour grades** — Sunset Gold, Neon Nights, Twilight Pink and Palm Noir; each re-grades the photos, the title gradient, the script glow and the borders.
- **Fast to PNG** — one click shuffles layout + grade + caption + photo order; one click exports an exact-size PNG (1080 × 1080, 1080 × 1350, 1920 × 1080, 1080 × 1920).
- **Original art** — no Rockstar Games logo, artwork or fonts. Lettering uses Anton, Archivo Black and Pacifico, all under the SIL Open Font License and bundled under `app/fonts/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network requests: every file the app loads lives under `app/`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mxhczr02&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
