# IndexPage: Sol2 vs MAIN — Differences and Behavior

Date: 2025-10-22

This document summarizes the differences between the current Sol2 Index page and the MAIN branch Index page.

Files compared:
- Sol2: `src/pages/IndexPage.vue`
- MAIN copy: `src/pages/IndexPage2.vue` (added as an exact copy of MAIN’s `src/pages/IndexPage.vue`)

## Overview
- Sol2 presents an “Effects” page with a header bar and several custom controls (frequency, speed, effects dropdown, brightness).
- MAIN presents a compact “Home page with light controls” using a grid layout with a power button, LED preview, vertical brightness slider, timer + frequency inputs, and a list of effects.

## Key Differences

### 1) Layout and UI
- Sol2
  - Header with title “EFFECTS” and a gear icon to navigate to Settings.
  - LED grid preview component with a power toggle via `@power-changed` from the grid component.
  - Controls: Frequency slider (0–60), Speed slider (0–100), Effects dropdown, and Brightness slider (0–100).
- MAIN
  - Grid layout with:
    - Power button (lightbulb) that toggles device on/off
    - LED grid preview
    - Vertical brightness slider (0–255), disabled when device is OFF
    - Two numeric inputs: timer and frequency (0–50)
    - List of effects (clickable q-list), rather than a dropdown

### 2) WebSocket Lifecycle and Connection Behavior
- Sol2
  - Connects only if a saved device IP exists; no default IP fallback.
  - Uses `isConnected` to gate all message handlers and send operations.
  - Subscribes to `/live` only after a real connection has opened (`onConnected`), and unsubscribes + closes on unmount.
  - Reduces console noise by commenting out verbose logs.
- MAIN
  - Eagerly connects using a default IP (`ws://4.3.2.1:80/ws`), then replaces it if a saved IP is found.
  - No `isConnected` gating; logs inbound messages unconditionally (e.g., “web socket dat”).
  - Unsubscribes and closes WebSocket on unmount.

### 3) Control Ranges and Mappings
- Brightness
  - Sol2 UI slider is 0–100, mapped to device 0–255 before sending.
  - MAIN UI slider is 0–255 directly (and disabled if `wledState.on` is false).
  - MAIN sets `sliderValue = data.bri - 255` on state updates (likely a bug or placeholder; does not map cleanly to 0–255).
- Frequency
  - Sol2 uses 0–60 and maps with `/60` when sending (`seg.ix`).
  - MAIN uses 0–50 and maps with `/50` when sending.
- Speed
  - Sol2 includes a Speed slider (0–100) that sends segment speed `seg.sx` (debounced).
  - MAIN does not have a Speed control.
- Effects selection
  - Sol2 uses a dropdown; MAIN uses a clickable list.

### 4) Message Handling and Logging
- Sol2
  - All inbound handlers early-return unless `isConnected` is true.
  - Logging for inbound data is commented out to avoid “simulated-looking” noise.
  - Brightness mapping is normalized to 0–100 in UI.
- MAIN
  - Logs received data loudly and often.
  - No connection gating around message handling.

### 5) Lifecycle Hooks and Events
- Sol2
  - Emits `preload-mounted` to the parent layout when the page is mounted.
- MAIN
  - No preload event emission.

### 6) Styling
- Sol2
  - Header + card-like control sections, themed with project CSS variables.
- MAIN
  - Compact grid layout (`grid-container`, `grid-item`), bordered containers around the power button and the slider.

## Net Behavior Difference
- Sol2 (as currently wired): remains quiet until a device IP is configured and the WebSocket is actually open; UI actions are gated by `isConnected`.
- MAIN: attempts to connect immediately (default IP fallback) and logs inbound messages regardless of whether a real device is present; more apparent “activity” even without a valid device session.

## Optional: Local Diff Commands
Use these to compare the two files locally in your workspace:

```bash
cd /Users/ernestoikerd/repos/gridlights/mobileapp
# Compare Sol2 page with the MAIN copy
git --no-pager diff --no-index src/pages/IndexPage.vue src/pages/IndexPage2.vue
```

## Notes
- `src/pages/IndexPage2.vue` is an exact copy from MAIN, including its original comments, logs, and some linter warnings (unused imports, loose comparisons). They were left intact intentionally to preserve fidelity for comparison.

