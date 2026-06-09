# Just Keep Pathing

2.5D 自动寻路迷宫放置游戏原型。页面保留原版 Gemini Canvas 的单页结构、Tailwind 样式、Three.js importmap、像素块迷宫生成、自动 BFS 寻路和 RPG 回合制战斗演出。

## Run Locally

Double-click `RunLocal.cmd` on Windows. It searches for an available port, opens the browser automatically, and falls back across Node, Python, and a PowerShell static server if needed.

Command-line options:

```powershell
npm run dev
```

or:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5173/`.

## Validation

Use the repo validation script on Windows:

```powershell
npm run check
```

It reads `index.html` as UTF-8, extracts the main module script, and checks that script separately. This avoids false failures caused by shell-side encoding mismatches when inspecting the big inline module directly.
The same command also checks extracted `.mjs` modules such as `src/data/game-config.mjs`, `src/logic/hidden-room-routing.mjs`, `src/logic/room-reward-calculations.mjs`, `src/logic/room-reward-plans.mjs`, `src/logic/theme-chain-bonuses.mjs`, `src/view/header-actions.mjs`, `src/view/hud-status-ui.mjs`, `src/view/loading-overlay.mjs`, `src/view/settings-panel.mjs`, `src/view/editors/model-editor-chrome.mjs`, and `src/view/panels/collection-panel.mjs`.

For a real browser startup smoke, run:

```powershell
npm run smoke:browser
```

It launches a temporary local static server and a headless Chrome-compatible browser, then checks page startup, WebGL canvas sizing, loading overlay state, header editor buttons, model editor command chrome, HUD status UI, the settings panel sync state, and the collection panel.

To capture the current desktop viewport after startup, run:

```powershell
npm run smoke:screenshot
```

The screenshot is written to `artifacts/screenshots/latest.png` and is ignored by git.

## Deploy

This repository is configured for GitHub Pages through GitHub Actions. The workflow uploads the static root files directly; no build step is required.

After pushing, enable GitHub Pages with **Source: GitHub Actions** in the repository settings if it is not already enabled.

## Project Notes

- Main playable app: `index.html`
- Experience roadmap: `docs/experience-roadmap.md`
- Hidden room system design: `docs/hidden-room-system.md`
- Hidden room data tables: `docs/hidden-room-data-tables.md`
- Refactor plan: `docs/refactor-plan.md`
- Runtime content tables: `src/data/floor-content.mjs`
- Hidden room runtime rules: `src/logic/hidden-rooms.mjs`
- Hidden room routing and resolution helpers: `src/logic/hidden-room-routing.mjs`, `src/logic/hidden-room-resolution.mjs`
- Room reward calculations: `src/logic/room-reward-calculations.mjs`
- Room reward side-effect and merchant purchase plans: `src/logic/room-reward-plans.mjs`
- Theme-chain bonus plans: `src/logic/theme-chain-bonuses.mjs`
- Maze progression rules: `src/logic/maze-progression.mjs`
- HUD status UI: `src/view/hud-status-ui.mjs`
- Header action bindings: `src/view/header-actions.mjs`
- Editor chrome helpers: `src/view/editors/`
- Loading overlay: `src/view/loading-overlay.mjs`
- Settings panel: `src/view/settings-panel.mjs`
- Collection and path debug panels: `src/view/panels/`
- Original handoff files: `origin/`
- Vendored runtime assets: `vendor/`
- Manual local launcher: `RunLocal.cmd`
- Static server fallback: `scripts/local-static-server.mjs`
