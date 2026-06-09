# Refactor Plan

## Goals

- Protect the current playable baseline before deeper structural work.
- Split the monolithic `index.html` into small, understandable modules without changing gameplay feel, PC layout, or editor workflows.
- Add repeatable validation so Windows UTF-8 handling does not create false breakages during future edits.

## Current Constraints

- The app is a single static-page game whose runtime, UI, editors, rendering, and audio all live in one module script inside `index.html`.
- The game already has meaningful live features: combat, idle progression, maze generation, hidden room design docs, model editor, and sound editor.
- The project is intentionally build-free for local manual testing and GitHub Pages deployment, so refactors should stay static-host friendly.

## Phase 0: Baseline Protection

- Keep `index.html` as the canonical runnable entry until later phases are proven.
- Use a UTF-8-safe module extraction check in `scripts/check-index-module.mjs`.
- Keep the explicit recovery backup out of the runtime path and avoid casual rewrites through tools that may re-encode files unexpectedly on Windows.

## Phase 1: Data Extraction

- Move pure configuration and content data into `src/data/` modules.
- Start with low-risk constants:
  - enemy archetypes
  - model editor defaults and labels
  - sound event definitions
  - sound preset factories and BGM kernel tables
- Keep behavioral functions in `index.html` unless they are already pure and dependency-light.

## Phase 2: System Separation

- Extract pure game rules into `src/logic/engine/`:
  - spawn formulas
  - maze scaling and reward formulas
  - hidden room roll rules
  - combat value calculations
- Keep hidden-room route scoring, small resolution predicates, reward calculations/plans, merchant purchase decisions, sound audio/config/storage helpers, and theme-chain formulas in `src/logic/` modules. (Started: `hidden-room-routing.mjs`, `hidden-room-resolution.mjs`, `room-reward-calculations.mjs`, `room-reward-plans.mjs`, `sound-audio-utils.mjs`, `sound-config.mjs`, `sound-storage.mjs`, `theme-chain-bonuses.mjs`.)
- Extract shared state helpers into `src/logic/state/` or equivalent modules.
- Preserve current runtime ordering to avoid subtle regressions in timers, audio, and rendering.

## Phase 3: UI And Editor Separation

- Move HUD status UI, loading overlay, settings panel, header actions, collection panel, and path debug panel UI into `src/view/` while preserving their DOM ids and runtime update calls. (Started: `hud-status-ui.mjs`, `loading-overlay.mjs`, `settings-panel.mjs`, `header-actions.mjs`, `panels/collection-panel.mjs`, `panels/path-debug-panel.mjs`.)
- Move model editor UI logic into `src/view/editors/model-editor.mjs`. (Started with `editors/model-editor-chrome.mjs` for header command chrome, shared `editors/editor-chrome.mjs` helpers, `editors/editor-dom.mjs` refs, `editors/editor-log.mjs` logging, and `editors/model-editor-selection-ui.mjs` control state.)
- Move sound editor UI logic into `src/view/editors/sound-editor.mjs`. (Started with `editors/sound-editor-chrome.mjs` for transport command chrome, `editors/sound-editor-transport-ui.mjs` for Play/Pause/Stop state, preview-toggle action decisions, and active-preview config sync decisions, `editors/sound-editor-meta.mjs` for select/meta rendering, `editors/editor-dom.mjs` refs, shared `editors/editor-log.mjs` logging, `editors/sound-editor-controls.mjs` control markup/display formatting, `editors/sound-editor-bindings.mjs` rendered-control binding, and `editors/sound-editor-control-state.mjs` control-state mutation.)
- Keep DOM ids, layout hooks, and existing mobile/PC presentation behavior stable while code moves behind the scenes.

## Phase 4: Render And Scene Separation

- Split Three.js scene construction from gameplay state mutation.
- Extract reusable factories for:
  - actor models
  - maze tiles and walls
  - occlusion reveal materials/effects
  - combat scene dressing and post-processing

## Phase 5: Validation And Smoke

- Keep `npm run check` fast and local.
- Keep the dependency-free `npm run smoke:browser` pass available after risky visual changes, especially for:
  - page startup and module import failures
  - collection and debug panel extraction
  - editor overlays
  - mobile layout
  - wall occlusion reveal
  - looping audio/editor interactions
- Use `npm run smoke:screenshot` when a visual checkpoint is needed without retyping the browser/CDP setup.

## Recommended Next Slices

1. Continue extracting reward resolution state-application helpers from `GameController`.
2. Move remaining lightweight UI/editor shells out of `index.html`, starting with the model editor shell after the header action binding extraction.
3. Isolate the sound runtime from the sound editor UI so live preview and in-game playback rules are easier to reason about.
4. Split the wall-occlusion reveal code path into a dedicated rendering helper and verify it with browser smoke/screenshots before further visual tweaks.
