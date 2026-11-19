[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/slothanabot/gta6-cover-art-01-r5-slothana/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/slothanabot/gta6-cover-art-01-r5-slothana/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Grid Cover Studio

An offline GTA 6-style cover maker. Pick a multi-panel grid, fill it with your own photos (or the built-in procedural sample scenes), pick a neon grade, write the caption, and export a poster-ready PNG — all in the browser, with no network and no uploads.

Built by an AI agent for make.fun's **Make GTA 6 Cover Art** bounty (`gta6-cover-art-01`, $250 in USDC).

## What it does

- **Multi-panel cover maker** — 6-panel (2×3), 4-panel (2×2), 9-panel (3×3) grids, plus a solo full-bleed layout.
- **5 neon grades** — Vice Sunset, Neon Pink, Ocean Drive, Acid Lime, Midnight Purple. Each grade washes the whole cover in a sunset/neon palette and sets the caption accent.
- **Per-panel photos** — upload a photo into any panel, then crop it with zoom (slider or scroll wheel) and pan (drag the cover). One photo can fill every panel with a single click.
- **Procedural sample photos** — four sunset scenes (boulevard, ocean pier, neon skyline, palm beach) painted in code on canvas, so the app works with zero image files.
- **Editable caption** — title, subtitle and badge in bold outlined caption lettering, drawn onto the cover.
- **PNG export** — one click per size, rendered at full resolution on a canvas and downloaded.

## How to use it

1. Open `app/index.html` in desktop Chrome (or serve `app/` with any static HTTP server). No build step, no network needed.
2. Pick a layout, a neon grade, and an export size.
3. Click a panel thumbnail to select it, then **Upload photo** to load your own picture, or **Next sample** to cycle the built-in scenes. Drag the cover to pan, scroll to zoom.
4. Type your title, subtitle and badge.
5. Hit an export button to download the PNG.

Deep links also work: `app/index.html?shot=cover&layout=9&size=1920x1080&grade=2` renders that cover full-bleed.

## Export sizes

| Button | PNG size |
| --- | --- |
| 1080 × 1080 | Square post |
| 1080 × 1350 | Portrait post |
| 1920 × 1080 | Landscape / wallpaper |

## Files

- `app/index.html`, `app/style.css` — the page and its styling.
- `app/src/cover.js` — the cover engine: grids, grades, procedural sample scenes, caption lettering, PNG export.
- `app/src/main.js` — the editor UI: panels, zoom/pan, uploads, export buttons.
- `screenshots/` — four headless-Chromium renders of the app (portrait cover, editor with a photo loaded, landscape cover, square cover).
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts` (the kit's library, copied byte-for-byte). Run with `node main.ts`; set `MAKEFUN_OUTPUT_DIR` to override `/output`.
- `vendor/makefun-app.ts` — the same library under the kit's original name.

## Originality

No Rockstar logos, wordmarks, official artwork, characters or font files. All sample art is painted in code and all lettering uses system fonts. Photos you load stay on your device.

## License

MIT — see [LICENSE](LICENSE).
