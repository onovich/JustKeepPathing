# JustKeepPathing Next TODO

Updated 2026-06-10 after reviewing the current runtime state.

## Already Landed

- Support-room automation now uses floor supplies, HP pressure, and auto-strategy settings for `rest` and `merchant` room appetite.
- Event/trial seed expansion is present in runtime data and handlers:
  - event: `repair_dock`
  - event: `supply_depot`
  - trial: `breach_charge`
  - trial: `guard_cache`
- The read-only collection/codex surface exists and persists discovered event seeds, trial seeds, relics, and finale bosses.
- The stale duplicate hidden-room interaction definitions and duplicate elite builder definition were removed from `index.html`; the surviving interaction path records event/trial seed discoveries.
- Empty treasure-room completion now still routes through `applyThemeChainBonus('treasure', ...)`, so salvage-theme treasure bonuses are not skipped when no cache nodes remain.
- `Reflex Shield` combat text now reports how much damage was blocked and how much damage was actually taken.
- Empty relic-pool rewards now explain that no new core is available instead of saying the core slots are full.
- Hidden room plan generation no longer reads the selected type key before initialization, and `npm run check` now exercises `buildHiddenRoomPlan(...)` directly.
- A dependency-free browser smoke now launches a temporary static server and headless Chrome to verify startup, canvas sizing, loading overlay state, collection persisted discoveries, and the path debug panel.
- HUD status UI initialization was extracted into `src/view/hud-status-ui.mjs`, and browser smoke now verifies HUD supply/relic/pill/upgrade nodes.
- `LoadingOverlay` was extracted into `src/view/loading-overlay.mjs`.
- The settings/strategy panel was extracted into `src/view/settings-panel.mjs`, with focused hint text checks.
- `CollectionPanel` and `PathDebugPanel` were extracted into `src/view/panels/` with explicit `GameState`/controller dependencies; PathDebugPanel routing summary counts and room lifecycle flags now have focused checks.
- Header editor button binding was extracted into `src/view/header-actions.mjs`, with focused checks and browser smoke coverage for the editor buttons' startup state.
- Model editor header button chrome was extracted into `src/view/editors/model-editor-chrome.mjs`, with focused checks and browser smoke coverage for command labels and close-button icon/accessibility state.
- Shared editor chrome and sound editor transport button chrome were extracted into `src/view/editors/editor-chrome.mjs` and `src/view/editors/sound-editor-chrome.mjs`, with focused checks and browser smoke coverage for preview/stop/read/reset/save/close startup state.
- Model/sound editor DOM id maps were extracted into `src/view/editors/editor-dom.mjs`, with focused checks and browser smoke coverage for editor instance refs.
- Shared editor log formatting/writing was extracted into `src/view/editors/editor-log.mjs`, with focused checks and browser smoke coverage for model/sound editor log DOM updates.
- Model editor selection UI state orchestration and DOM application were extracted into `src/view/editors/model-editor-selection-ui.mjs`, with focused checks and browser smoke coverage for idle disabled controls.
- Sound editor slider/select/checkbox markup and live range display formatting were extracted into `src/view/editors/sound-editor-controls.mjs`, with focused checks and browser smoke coverage for default one-shot controls.
- Sound editor rendered-control event binding was extracted into `src/view/editors/sound-editor-bindings.mjs`, with focused checks and browser smoke coverage for range input updates.
- Sound editor control-state mutation was extracted into `src/view/editors/sound-editor-control-state.mjs`, with focused checks for oneshot/loop/track/bgm/meta writes and browser smoke coverage for range and track-select updates.
- Sound editor event select options and metadata labels were extracted into `src/view/editors/sound-editor-meta.mjs`, with focused checks and browser smoke coverage for select/type/usage/description rendering.
- Sound editor Play/Pause/Stop transport UI state, preview-toggle action decision, and active-preview config sync decision were extracted into `src/view/editors/sound-editor-transport-ui.mjs`, with focused checks and browser smoke coverage for initial transport state.
- Sound audio math helpers for effective volume, MIDI frequency, clamping, footstep timing, BGM step plans, and distortion curves were extracted into `src/logic/sound-audio-utils.mjs`, with focused checks for gain curves, MIDI octaves, footstep intervals, BGM note planning, swing offsets, and curve shape.
- Sound config sanitizing and cloning were extracted into `src/logic/sound-config.mjs`, with focused checks for numeric clamps, waveform fallback, track caps, BGM kernel fallback, and deep cloning.
- Sound master-volume and sound-config localStorage helpers were extracted into `src/logic/sound-storage.mjs`, with focused checks for missing, invalid, and blocked storage reads/writes.
- Collection/codex storage sanitizing, progress counts, and persistence helpers were extracted into `src/logic/collection-state.mjs`, with focused checks and browser smoke coverage for persisted discoveries.
- Hidden-room diversion scoring, routing-debug assembly, interaction-resolution, pending-entity lookup, pickup pending-state, clear-state application, and marker entity-cleanup helpers were extracted into `src/logic/hidden-room-routing.mjs` and `src/logic/hidden-room-resolution.mjs`, with focused check scripts.
- Elite enemy archetype construction now lives in `src/logic/hidden-rooms.mjs`, with focused checks for stat scaling, reward tier fallback, variant intro text, and the `GameController` path guard.
- Hidden cache, event, elite-support, and trial node entity state now lives in `src/logic/hidden-rooms.mjs`, with focused checks for reward formulas, hazard ratio, support data, animation state, and controller path guards.
- Hidden room cache/event/elite/trial preparation now lives in `src/logic/hidden-rooms.mjs`, with focused checks for slot sorting, node counts, elite support selection, reset state, and controller path guards.
- Hidden room chamber blueprint and candidate-cell planning now lives in `src/logic/hidden-rooms.mjs`, with focused checks for shape offsets, bounds/exit filtering, and the `GameController` path guard while grid carving remains in `GameController`.
- Hidden room reward-profile fallback now lives in `src/logic/hidden-rooms.mjs`, with focused checks and controller path guards for event/rest/merchant/trial/elite reward resolvers.
- Theme-chain bonus formulas were extracted into `src/logic/theme-chain-bonuses.mjs`, with focused checks and `GameController` still owning message/effect presentation.
- Event, rest, merchant, trial, and elite room reward formulas were extracted into `src/logic/room-reward-calculations.mjs`, with focused checks.
- Event stockpile, trial supply rewards, and merchant purchase decisions were extracted into `src/logic/room-reward-plans.mjs`, with focused checks.
- Event/rest/merchant/trial/elite/treasure reward resolution now shares `src/logic/room-reward-resolution.mjs` hidden-room reward finalization, with focused checks for theme-chain routing, detail order, empty base messages, and UI refresh callbacks.
- Echo Engine event-room next-floor attack bonus capping and visible text are now routed through `src/logic/room-reward-resolution.mjs`, with focused checks.
- Run relic reward result text and presentation effect plans for added, duplicate, overflow, and empty-pool outcomes are now formatted in `src/logic/room-reward-resolution.mjs`, with focused checks.
- Elite-room and boss run-relic roll request planning now shares `src/logic/room-reward-plans.mjs`, with focused checks for elite, boss, and disabled fallback plans.
- `scripts/check-room-reward-paths.mjs` now guards hidden-room reward source coverage, Echo Engine final event routing, and elite/boss relic roll plan usage.
- `npm run smoke:screenshot` now captures a reusable local browser screenshot at `artifacts/screenshots/latest.png`.
- `npm run verify:refactor` now runs check, browser smoke, and screenshot smoke with compact success output for lower-noise refactor turns.
- Loading overlay progress/snapshot and delayed-generation reveal checks were extracted into `src/view/loading-overlay.mjs`, with focused checks and browser smoke coverage for delayed text reveal/cleanup.
- Browser smoke now exercises the `Echo Engine` event-room finalization path with a deterministic fixture and restores runtime state afterward.
- Browser smoke now covers consecutive elite/boss run-relic rolls for both double-add and single-slot overflow outcomes.
- Path Debug now surfaces per-room access, gate progress, detour, final diversion score, and lifecycle flags, with browser smoke coverage for a deterministic two-room fixture.
- Browser smoke now covers rest, merchant, trial, and treasure room completion rewards with a deterministic runtime fixture that restores `GameState` afterward.
- Browser smoke now covers full elite-room clear presentation, including lifecycle clearing, marker/grid cleanup, relic presentation, and theme-chain rewards.
- Browser smoke's page-side fixture now lives in `scripts/browser-smoke-page.mjs`, leaving `scripts/browser-smoke.mjs` focused on server/browser/CDP orchestration; `npm run check` now syntax-checks both smoke modules.
- Model editor asset select rendering was extracted into `src/view/editors/model-editor-assets-ui.mjs`, with focused checks and browser smoke coverage for startup asset options.
- Shared editor select-option rendering now lives in `src/view/editors/editor-select-options.mjs`, and model editor pattern/line style options were extracted into `src/view/editors/model-editor-style-options-ui.mjs` with focused checks and browser smoke coverage.
- Model editor rendered-control binding now lives in `src/view/editors/model-editor-bindings.mjs`, with focused checks for command/input/backdrop/EyeDropper wiring and browser smoke coverage for header-open/close modal flow.
- Model editor pointer/preview interaction math now lives in `src/view/editors/model-editor-pointer-ui.mjs`, with focused checks for resize, rotation, drag threshold, wheel zoom, and pointer NDC plus browser smoke coverage for wheel zoom.
- Model editor pick-selection state decisions now live in `src/view/editors/model-editor-selection-state.mjs`, with focused checks for hit priority, single-select, additive same-kind selection, toggle-clear, miss-clear, and mixed-selection blocking.
- Model appearance config sanitizing, cloning, part lookup, entry defaults, and selection-entry writes now live in `src/logic/model-appearance-config.mjs`, with focused checks for clamping, cleanup, and default-write removal.
- Auto-strategy sanitizing, diversion threshold adjustment, supply priority/need state, and merchant budget calculations now live in `src/logic/auto-strategy.mjs`, with focused checks for mode fallback, scarcity pressure, and budget quotes.
- Floor buff defaults, supply roll/consumption decisions, run-relic floor-start effects, and theme directive buff application now live in `src/logic/floor-buffs.mjs`, with focused checks for supply weights, relic stacking, Echo Engine consumption, and finale directive scaling.
- Player/maze upgrade cost formulas and purchase-state application now live in `src/logic/player-upgrades.mjs`, with focused checks for cost scaling, insufficient score, size caps, HP refill, speed floor, and merchant quote reuse.
- Run relic overflow score, roll chance, miss/empty-pool result formatting, and claim-state decisions now live in `src/logic/run-relic-state.mjs`, with focused checks for duplicate, overflow, empty-pool, chance caps, and non-mutating inventory updates.
- HUD upgrade button value/cost/affordability state building and DOM application now live in `src/view/hud-upgrade-ui.mjs`, with focused checks for level labels, size MAX state, and affordability class toggles.
- Shared easing curves and tween queue management now live in `src/view/tween-manager.mjs`, with focused checks for curve outputs, interpolation, default easing, completion callbacks, and cleanup.
- Maze cell keys, grid lookup, walkable-neighbor filtering, BFS pathing, hidden-room transit guards, and distance-map generation now live in `src/logic/maze-navigation.mjs`, with focused checks for shortest paths, unreachable targets, hidden-room allowances, and distance maps.
- Rest-room hidden reward decisions, state action plans, message assembly, and action application now live in `src/logic/room-reward-state.mjs`, with focused checks for fortify/restock decisions, heal rewards, fallback boosts, and state mutations.
- Merchant-room hidden reward state plans now share `src/logic/room-reward-state.mjs`, with focused checks for supply purchases, intel fallback bonuses, discounted upgrade rebates, and failed-deal fallback score.
- Trial-room hidden reward state plans now share `src/logic/room-reward-state.mjs`, with focused checks for repair loops, guard caches, survey scouting, attack overdrive, supply rewards, fallback scouting, and room bonus-supply state.
- Event-room hidden reward state plans now share `src/logic/room-reward-state.mjs`, with focused checks for healing supplies, repair guards, power penalties, stockpiles, density changes, and Echo Engine next-floor attack capping.
- Elite-room clear reward score, repair, and base summary now share `src/logic/room-reward-state.mjs`, with focused checks for HP caps and no-repair summaries while presentation remains in `GameController`.
- Event, trial, and elite hidden-room node pickup reward state now share `src/logic/room-reward-state.mjs`, with focused checks for charge counters, hazard damage, reward fallbacks, HP floors, and score actions while animations remain in `GameController`.
- Treasure cache hidden-room pickup reward state now shares `src/logic/room-reward-state.mjs`, with focused checks for chest reward multipliers, score actions, and floor chest counters while random supply drops remain in `GameController`.
- Theme-chain bonus state application now routes through `src/logic/room-reward-state.mjs`, with focused checks for next-floor attack caps, hidden-room odds caps, salvage score/supplies, quarantine repairs, damage reduction, and reflex-shield refresh.
- Finale boss archetype construction, clear-bonus calculation, and boss mechanic state initialization now live in `src/logic/finale-boss-state.mjs`, with focused checks and path guards while combat presentation remains in `GameController`.
- Finale boss mechanic damage and enemy-attack prep decisions now share `src/logic/finale-boss-state.mjs`, with focused checks for signal jam, seal layers, heat ramp, salvage repair, floating-text plans, and state mutation.
- Combat victory reward state now lives in `src/logic/combat-state.mjs`, with focused checks for score rewards, kill counters, and finale bonus score while combat animation and messaging remain in `GameController`.
- Enemy attack damage and reflex-shield consumption now route through `src/logic/combat-state.mjs`, with focused checks for damage multipliers, shield prevention text, raw combat HP loss, and shield state clearing.
- Combat profile scaling for rewards, HP, attack, boss multipliers, and elite-support intro text now lives in `src/logic/combat-state.mjs`, with focused checks while hidden-room lookup remains in `GameController`.
- Player attack damage calculation now routes through `src/logic/combat-state.mjs`, with focused checks for attack multipliers, boss damage dampening, and multiplier fallback while combat animation remains in `GameController`.
- Exploration chest and level-exit reward state now live in `src/logic/exploration-state.mjs`, with focused checks for chest score multipliers, chest counters, exit score, and level increments while pickup effects remain in `GameController`.

## 1. Browser Smoke Follow-Up

Goal:

- broaden browser coverage while keeping the current smoke fast enough for local refactor checks

Recommended slice:

- optionally archive screenshots from `npm run smoke:screenshot` before visual-risky refactors
- keep adding targeted smoke coverage for UI paths that still live in `index.html`

Acceptance:

- `npm run check` still stays fast and local
- browser smoke can be run manually before risky UI/render changes
- the smoke does not require a production build step or external npm dependency

## 2. Refactor Follow-Up

Goal:

- keep reducing `index.html` without changing gameplay feel or static-host deployment

Recommended next extraction candidates:

- remaining reward resolution state-application helpers
- remaining lightweight UI shells
- model editor UI shell

Acceptance:

- extracted modules stay dependency-light and static-host friendly
- runtime ordering stays stable
- `index.html` remains playable after each slice
