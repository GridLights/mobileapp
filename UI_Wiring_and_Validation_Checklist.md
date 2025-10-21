# SolSpektrum UI Wiring & Validation Checklist

Purpose
- Provide a single-file checklist you can use to validate the SolSpektrum UI changes and confirm every interactive control is connected to working code (or has a clear TODO to wire it).
- Organized per-view/component: list controls, whether they're wired, issues, suggested wiring, and test steps.

How to use
- Walk the checklist while running the app (or using the dev server). Mark items as Done as you verify them.
- For each ORPHANED control, implement the suggested wiring or flag it for later.

---

## Quick summary
- Power toggle (PowerSwitch → LedGrid → IndexPage → webservices) — wired and functional.
- Brightness and Frequency sliders (IndexPage) — wired (debounced) and call `webservices`.
- Many new controls (Speed slider, Effects dropdown, Randomizer controls, Sequencer start/stop, Settings connect/disconnect, Journey start)
- are present visually but are only partially wired or are placeholders that only log to console.

---

## Global items to check
- [ ] WebSocket connection: `src/webservices.js` initializes WebSocket and exposes `sendCommandToWebSocket`, `initWebSocket`, `subscribeToLiveStream`, `closeWebSocket`.
- [ ] Preload event in `MainLayout.vue`: `@vue:mounted` does not fire by default — replace with a real emitted event or a direct call from each page's `mounted()`.
- [ ] BottomTabBar active tab highlighting: `q-tabs` is bound to a literal `modelValue="tab"` — not reactive. Consider binding to route or removing `modelValue`.

---

# Per-view checklist (detailed)

### 1) `src/pages/IndexPage.vue` (Effects / Home)
Controls present:
- Frequency slider (`freqValue`) — wired
  - Where: `@input="onFreqInput"` → `setFrequency()` → `webservices.sendCommandToWebSocket`
  - Test: change slider, confirm websocket command sent and device changes.
  - [ ] Verify: Done

- Speed slider (`speedValue`) — ORPHANED
  - Where: `v-model="speedValue"`, no handler.
  - Suggested wiring: add `@input="onSpeedInput"` with debounce and call e.g. `webservices.sendCommandToWebSocket({ seg: { sx: scaled }})` or an appropriate parameter for WLED effect speed.
  - Test: change slider, confirm websocket command sent and device responds.
  - TODO: Implement `onSpeedInput()`

- Effects dropdown (`selectedEffect`) — ORPHANED
  - Where: `<select v-model="selectedEffect">` but no `@change` handler.
  - Suggested wiring: `@change="applySelectedEffect"` → call `setEffect(selectedEffect.effectId)` or `setColor` if effectId is null.
  - Test: choose effect, confirm command sent and LED effect changes.
  - TODO: Add `applySelectedEffect()` that handles null `effectId` cases.

- Brightness slider (`sliderValue`) — wired
  - Where: `@input="onSliderUpdate"` → `setBrightness()` → `webservices.sendCommandToWebSocket`
  - Test: adjust slider, confirm command queued/sent after debounce.
  - [ ] Verify: Done

- LED Grid power button (PowerSwitch) — wired
  - Where: `<LedGrid @power-changed="handlePowerChange" />` → `toggleButton()` → `webservices.sendCommandToWebSocket`
  - Test: toggle power, confirm websocket command toggles `on` state.
  - [ ] Verify: Done

- `itemList` click handler (`onListItemClick`) — TEMPLATE MISSING
  - Where: method exists but UI list not rendered in current template. If you re-add list UI, ensure it calls `onListItemClick`.

Notes / Action items for IndexPage:
- Implement `onSpeedInput()` → send speed parameter to device.
- Add `@change` on effects dropdown and implement `applySelectedEffect()`.

---

### 2) `src/pages/RandomizerPage.vue`
Controls present:
- Tap-to-start (`startRandomizer`) — PARTIAL
  - Where: `@click="startRandomizer"` starts a local timer but does not send any device commands.
  - Suggested wiring: on start, pick/queue effects and send initial commands via `webservices.sendCommandToWebSocket` or call a helper (new or existing) to run randomized effects.
  - Test: tap to start, confirm device begins randomized effects.
  - TODO: Implement randomized effect driver and wire it to `startRandomizer`/`stopRandomizer`.

- Wave-type vertical sliders (`waveTypes[].value`) — ORPHANED
  - Where: `v-model` updates values locally, no device calls.
  - Suggested wiring: watch or `@input` with debounce to update effect parameters or randomizer pool.
  - Test: change slider, check if device behavior changes according to the mapped parameter.
  - TODO: Implement mapping from `wave.value` to `webservices` commands.

- Horizontal sliders (brightness, frequencyTime, time) — ORPHANED
  - Where: `v-model` only; no `@input` handlers.
  - Suggested wiring: add handlers to call `setBrightness()`, configure randomizer timing, and adjust frequency.
  - Test: change sliders, confirm device receives updated parameters.

- Effects library items
  - `@click="toggleEffect(effect.id)"` toggles local `effects[].active` — works locally but does not call `webservices`.
  - The 'add' icon inside each effect card has no `@click` handler — ORPHANED.
  - Suggested wiring: `toggleEffect` should optionally send effect to device or add to a run-pool; add icon should explicitly add effect to a queue.

Notes / Action items for RandomizerPage:
- Implement `startRandomizer()` effect driver that dispatches device commands according to pool and sliders.
- Add debounced handlers for sliders and wave controls.
- Add `@click` for effect 'add' icon and wire it to queue management functions.

---

### 3) `src/pages/JourneysPage.vue` + `src/components/SolExpansionItem.vue`
Controls present:
- `SolExpansionItem` "Start Journey" buttons (`@click="startJourney(item)"`) — EMITS `journey-start`
  - Where: `SolExpansionItem` emits `journey-start` with `{ item, journeyType }`.
  - Parent `JourneysPage` has `handleJourneyStart(data)` which currently only `console.log`s and does not start the journey engine.

- Journeys engine in `JourneysPage` `setup()` — present but NOT wired to `handleJourneyStart`
  - `setup()` returns `startJourney`, `startNextEffect`, `cancelJourney`, etc., but the Options API `methods: { handleJourneyStart }` does not call those functions.
  - Result: pressing "Start Journey" triggers an event and log, but does not start the sequence of effects.

Problems & suggested wiring:
- Option A (simple): change `handleJourneyStart` to call the `startJourney()` returned by `setup()` (need to expose it to Options methods). Example: ensure `startJourney` is returned in the `return` of `setup()` and call `this.startJourney()` from `handleJourneyStart` after setting `selectedItemId` or the necessary context.
- Option B (direct): have `SolExpansionItem` emit full journey data including effect IDs and numeric durations; `handleJourneyStart` translates that to the journey engine and calls `startNextEffect(0)`.

Test steps:
- [ ] Click "Start Journey" on any expansion item and confirm the device runs the correct sequence and `localStorage` keys `journey`, `currentIndex`, `endTime` are set.

Action items for Journeys:
- Wire `handleJourneyStart` -> `startJourney`/journey engine and ensure durations are numeric and effectIds are present.
- Map `'5m'` style durations to numeric minute values before starting.

---

### 4) `src/pages/SequencerPage.vue`
Controls present:
- Start button (`@click="startSequence"`) — ORPHANED (placeholder)
- Stop button (`@click="stopSequence"`) — ORPHANED (placeholder)
- Add To Queue buttons (`@click="addToQueue(effect)"`) — wired locally (adds to `effectQueue`)
- Effect parameter inputs (`v-model` on `effect.hertz`, `effect.time`, `effect.brightness`) — local state exists
- Remove effect (`@click="removeEffect(index)"`) — wired

Problems & suggested wiring:
- `startSequence()` and `stopSequence()` must execute the queued effects using webservices. Implement a runner that:
  1. Loops (or recursively steps) through `effectQueue`.
  2. For each entry, compute scaled parameters (map hertz/time/brightness to WLED seg fields) and call `webservices.sendCommandToWebSocket(...)` or a helper `setEffect`.
  3. Wait for `time` seconds before moving to next effect (use setTimeout or an async loop with `await sleep()`), and keep ability to cancel via `stopSequence()`.

Test steps:
- [ ] Add several effects to queue, click Start, and confirm device runs sequence with configured parameters.
- [ ] Click Stop and confirm sequence aborts.

Action items:
- Implement `startSequence()` runner and `stopSequence()` cancellation.

---

### 5) `src/pages/SettingsPage.vue`
Controls present:
- Disconnect button — ORPHANED (no `@click`)
- Scan Network / Search Devices buttons — ORPHANED
- Connect button per listed network — ORPHANED
- WLED device list items (`@click="selectDevice(device)"`) — wired locally (toggles `selected`)
- Check For Updates (`@click="checkForUpdates"`) — stubbed (logs only)
- Choose File (`@click="chooseFile"`) — stubbed (logs only)
- Device Name input (`v-model="deviceName"`) — wired locally
- IP address saved to `localStorage` in onMounted if present — works (but saving control may be missing in template)

Problems & suggested wiring:
- Add `@click` handlers:
  - Disconnect → call `webservices.closeWebSocket()` and update UI
  - Search Devices / Scan → implement device discovery or call a helper
  - Connect → on select, call `webservices.initWebSocket(wsUrl, ...)` using the selected device IP and persist IP using `saveIpAddress()`
- Wire `checkForUpdates()` to a real update flow or mark as TODO
- Provide a visible Save IP control (`Save` button or input blur handler) that calls `saveIpAddress()`

Test steps:
- [ ] Select a WLED device and click Connect, verify websocket reconnects to selected device and live streaming or state updates start.
- [ ] Click Disconnect and verify websocket closes.

Action items:
- Implement `connectToDevice(device)` and bind Connect/Disconnect buttons.
- Implement scan/search or hide until implemented.

---

### 6) `src/layouts/MainLayout.vue`
Controls / issues:
- Preload container uses `<component ... @vue:mounted="onComponentLoaded" />` inside `v-show="false"` — `@vue:mounted` will not fire. This makes `allPagesLoaded` detection unreliable.
- Suggested fix: have each preloaded page emit a custom event from its `mounted()` hook (e.g., `$emit('preload-mounted')`) and listen with `@preload-mounted="onComponentLoaded"`. Alternatively call `onComponentLoaded` directly from each page's `mounted()`.
- `getTransitionClasses` exists but is unused in template; minor cleanup.

Test steps:
- [ ] Confirm preloader hides when pages are loaded, and transitions are smooth without flicker.

Action items:
- Fix `preload` event wiring so `allPagesLoaded` works reliably.

---

### 7) `src/components/LedGrid.vue` & `src/components/PowerSwitch.vue`
Status:
- `LedGrid` uses a background image and hard-coded `circle` coordinates for LEDs and includes `PowerSwitch` overlay.
- `PowerSwitch` emits `update:modelValue` and `toggle` and `LedGrid` listens and emits `power-changed` upward to `IndexPage`.
- `IndexPage.handlePowerChange()` calls `toggleButton()` which uses `webservices.sendCommandToWebSocket` — pathway is wired and functional.

Test steps:
- [ ] Toggle power in UI and confirm websocket command sent.
- [ ] Confirm LED colors update when live stream data is received.

Action items:
- None required for wiring; validate coordinate placement visually on devices.

---

### 8) `src/components/BottomTabBar.vue`
Status:
- Renders route tabs using `q-route-tab` and filtered `NavLinks` — navigation works.
- `q-tabs` used with `modelValue="tab"` which is static; if tab highlighting is desired, bind `v-model` to a reactive route value or remove `modelValue`.

Test steps:
- [ ] Tap each tab and confirm routing and active tab highlight behave as expected on mobile devices.

Action items:
- Optional: make `q-tabs` reactive to route for proper highlighting.

---

# Prioritized implementation suggestions
1. Wire IndexPage quick wins: Speed slider + Effects dropdown.
2. Wire Journeys: connect `SolExpansionItem` event to `startJourney` engine (so journeys actually run).
3. Implement Sequencer runner (`startSequence` / `stopSequence`).
4. Implement Settings connect/disconnect and device selection logic.
5. Implement Randomizer driver to send device commands.
6. Fix MainLayout preload events.

---

# Quick dev/test commands
(Assuming Node and Quasar dev environment)

Start dev server:

```bash
# Install deps (if needed)
npm ci
# Start dev server with Quasar
npx quasar dev
```

Lint the project:

```bash
npm run lint
```

Run a simple grep to find orphaned `@click` or un-handled `v-model` usages:

```bash
# show files with v-model bindings but no corresponding handler in the same file (quick heuristic)
grep -R "v-model" -n src | sed -n '1,200p'
```

---

# Final notes
- This checklist is written to be actionable and minimal-risk. For each ORPHANED control I included suggested wiring and a brief test. If you want, I can implement the highest-priority wiring changes (IndexPage speed/effects, Journeys wiring, Sequencer runner) and run lint/dev checks for you.

---

*Generated: 2025-10-21*

