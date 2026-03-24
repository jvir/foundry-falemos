This file gives concise, actionable guidance to an AI coding agent working on the Falemos Foundry VTT module.

Key files and entry points
- `module.json` — module manifest: lists `esmodules` (entry `scripts/module.js`), `styles`, and `languages`. Update here when adding new runtime files.
- `scripts/module.js` — main module runtime. Contains Foundry Hooks (init, ready, render* hooks), CONFIG setup, socket handlers (`game.socket.on("module.falemos"...)`), and exported API on `game.falemos`.
- `scripts/utils/falemosVaccinator.js` — a self-contained macro-style utility that the module installs/updates for GMs. Useful examples of DOM-driven Dialog creation and layout math.
- `templates/` — Handlebars templates used at runtime; see `templates/scene/mc-config.html` and `templates/filter/filter.html` for examples of how data is passed to renderTemplate.
- `assets/` and `styles/module.css` — visual assets and CSS. Dynamic CSS is also generated at runtime by `createSceneStyles()` inside `module.js`.

Big-picture architecture and runtime flow
- This is a client-side Foundry VTT module: most code runs in the browser context and hooks into Foundry's client Hooks API. There is no separate server process in this repo.
- Initialization: `Hooks.once("init")` sets `CONFIG.FALEMOS` constants. `Hooks.once("ready")` registers settings, registers sockets, updates a macro for GMs, and exposes `game.falemos` helper functions.
- UI integration: module modifies rendering of camera UI via hooks: `renderCameraViews`, `renderSceneConfig`, `renderSceneNavigation`, and `closeSceneConfig`. It uses jQuery and Handlebars templates produced with `renderTemplate`.
- Settings & persistence: per-scene configuration is stored in scene flags: `scene.setFlag('falemos','config', ...)`. `module.json` language files are used via `game.i18n.localize(...)`.
- Cross-client communication: uses Foundry sockets: messages sent with `game.socket.emit('module.falemos', ...)` and received via `game.socket.on('module.falemos', ...)` and are processed by `onSocketData`.

Project-specific conventions and patterns
- Flag shape: Scene config is stored as `scene.flags.falemos.config` keyed by user id and includes fields such as `x`, `y`, `width`, `filter`, `geometry`, `overlayImg`, `cameraName*`, `fit`, `enable`, and `hide`. Prefer reading existing flags before writing to avoid clobbering unrelated fields.
- Dynamic CSS: `createSceneStyles(imageFormat)` composes CSS strings at runtime and injects a single `<style id="falemosStyles">`. When changing style behavior, update that function rather than static CSS files.
- Exported API: `game.falemos` exposes `getSceneConfig`, `putSceneConfig`, `sceneConfigToMacro`, and `camToTile`. Use these helpers for programmatic scene config operations.
- Internationalization: Strings use `game.i18n.localize('KEY')` and `languages/*.json` defines translations. Add keys to language files when adding user-facing strings.
- Macro management: `updateMacro(macroFile)` fetches a macro file from disk and creates/updates a `Macro` in-game when a GM loads the module; `scripts/utils/falemosVaccinator.js` is installed this way.

Developer workflows (how to run, test, debug)
- Build: This repo is a pure client-side Foundry module. There is no build step in the repo. To test locally, install the module in a Foundry VTT instance (zip or folder) and enable it for a world.
- Running in Dev: Open Foundry VTT (v11-12 compatible per `module.json`) and enable module in a world where you have GM access. Use browser devtools console to inspect errors and to call `game.falemos` functions interactively.
- Debugging: Useful breakpoints: inside `Hooks.once('ready')`, `renderCameraViews`, and `createSceneStyles`. The module logs with `console.log(...)` in several places; search `console.log` in `scripts/` to find places to monitor.

Examples and quick references
- Emit a socket event to toggle fit from user code:
  game.socket.emit('module.falemos', { event: 'toggleFitHotkey', action: 'command', data: { user: game.user, scene: game.scenes.viewed, mode: 'cover' } });
- Read current scene falemos settings:
  const cfg = game.scenes.viewed.flags.falemos?.config;
- Update a single user's fit flag without overwriting the object:
  game.scenes.get(sceneId).setFlag('falemos', `config.${userId}.fit`, 'contain');

Small gotchas and actionable tips
- Always guard for undefined: many hooks assume `game.scenes.viewed` exists. When writing code that runs on startup, check for undefined.
- Many UI interactions depend on DOM elements that Foundry renders; prefer using `renderTemplate` and Foundry Hooks rather than assuming element structure will always be present.
- When modifying flags, prefer `setFlag` to replace only specific nested keys to avoid race conditions between clients.
- The runtime uses jQuery heavily; keep edits consistent with that style for DOM manipulation.

Files to inspect when changing behavior
- `scripts/module.js` — first stop for behavior changes.
- `scripts/utils/falemosVaccinator.js` — example of complex UI dialog logic.
- `templates/scene/mc-config.html` and `templates/filter/filter.html` — template structure and helpers.
- `assets/img/frames/*` — community-provided overlays; check licenses in matching .txt files.

If anything above is unclear or you'd like more examples (e.g., how scene flags are seeded, or to add a unit test harness), tell me which area to expand and I will update this file.
