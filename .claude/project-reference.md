# Gridlights Mobile App - AI Reference Guide

This file contains common instructions, preferences, and project context to avoid repetitive prompting.

## Project Overview

**Gridlights** is a Quasar/Vue.js mobile application for controlling LED grid devices via ESP32. The app connects to physical LED grid hardware over WebSocket and provides a UI for controlling effects, sequences, and settings.

## Tech Stack

- **Framework**: Quasar v2.6.0 (Vue 3)
- **Router**: Vue Router 4 (hash mode for ESP32 compatibility)
- **Build Tool**: Quasar CLI with Webpack
- **Mobile**: THIS WONT BE IN MVP : Capacitor 7 (iOS/Android)
- **Styling**: SCSS with Quasar variables
- **State Management**: Vue 3 Composition API (no Vuex/Pinia)
- **Device Communication**: WebSocket (via `websocketmanager.js`)

## Project Structure

```
src/
├── pages/          # Main application pages
├── components/     # Reusable Vue components
├── layouts/        # Layout components
├── router/         # Vue Router configuration
├── utils/          # Utility functions (websocketmanager.js, utils.js)
├── webservices.js  # API/WebSocket service layer
├── effects/        # LED effect definitions
└── css/           # Global styles
```

## Key Files & Their Roles

- **`src/pages/IndexPage.vue`**: Main control page with LED grid visualization
- **`src/pages/SettingsPage.vue`**: Primary settings page (current implementation)
- **`src/pages/SettingsPage2.vue`**: Alternative settings page (for IP capture)
- **`src/utils/websocketmanager.js`**: WebSocket connection management
- **`src/webservices.js`**: HTTP/WebSocket API wrapper
- **`src/components/LedGrid.vue`**: LED grid visualization component
- **`src/components/PowerSwitch.vue`**: Power toggle component

## Common Preferences & Guidelines

### Code Style
- Use Vue 3 Composition API (`<script setup>`) for new components
- Prefer Quasar components over custom HTML when possible
- Use SCSS variables from `src/css/quasar.variables.scss`
- Dark mode is enabled by default (`dark: "true"` in quasar.config.js)
- Router uses hash mode (required for ESP32 compatibility)

### Device Connection Pattern
- Device IP is stored in `localStorage` with key `'ipAddress'`
- Always check for valid IP before attempting device connection
- Use `websocketmanager.js` for WebSocket connections
- Avoid simulation/fake data when real device IP is available
- Add `console.log()` statements for debugging connection attempts

### localStorage Keys
- `'ipAddress'`: Device IP address for WebSocket connection

### Component Patterns
- Use Quasar's `q-input`, `q-btn`, `q-slider`, etc. for UI elements
- Follow existing component structure in `LedGrid.vue` and `PowerSwitch.vue`
- Use `ref()` and `reactive()` from Vue 3 for state management
- Use `onMounted()` and `onUnmounted()` for lifecycle hooks

### WebSocket Communication
- Connection managed through `websocketmanager.js`
- Messages sent/received via WebSocket protocol
- Handle connection errors gracefully
- Reconnect logic should be implemented in websocketmanager

## Common Tasks

### Adding a New Page
1. Create file in `src/pages/`
2. Add route to `src/router/routes.js`
3. Use Quasar components and dark mode styling
4. Follow existing page structure (see `IndexPage.vue` or `SettingsPage.vue`)

### Modifying Device Connection
1. Check `src/utils/websocketmanager.js` for connection logic
2. Check `src/webservices.js` for API wrapper functions
3. Ensure IP is read from `localStorage.getItem('ipAddress')`
4. Add console.log for debugging
5. Test with real device, not simulation

### Adding New Effects
1. Create effect file in `src/effects/`
2. Export effect function following pattern in `src/effects/index.js`
3. Add to effects dropdown in relevant page
4. Effect should communicate via WebSocket to device

### Styling Guidelines
- Use Quasar's spacing utilities (`q-pa-md`, `q-mt-sm`, etc.)
- Reference `src/css/quasar.variables.scss` for theme colors
- Dark mode is default - ensure contrast is sufficient
- Use Quasar's responsive breakpoints when needed

## Important Constraints

### Branch-Specific Rules
- **Sol3m branch**: See `.copilot-rules` for strict scope limitations
- **Main branch**: Full development allowed
- Check current branch before making changes

### What NOT to Do (Unless Explicitly Requested)
- Don't refactor code "just because"
- Don't change dependencies/versions without asking
- Don't add features outside the current task scope
- Don't modify files marked as "reference only" (e.g., `IndexPageMain.vue`)
- Don't remove or rename files without confirmation
- Don't change router mode from hash to history

### What TO Do
- Make minimal, surgical changes to achieve the goal
- Preserve existing UI/UX unless explicitly changing it
- Test changes with real device when possible
- Add console.log for debugging when needed
- Follow existing code patterns and structure
- Use Quasar components and utilities

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (port 8080)
quasar dev

# Build for production
quasar build

# Lint code
npm run lint

# Format code
npm run format
```

## Device Communication

- **Protocol**: WebSocket
- **IP Storage**: localStorage key `'ipAddress'`
- **Connection**: Managed via `websocketmanager.js`
- **API Layer**: `webservices.js` wraps WebSocket calls

## Testing Notes

- App runs on `http://localhost:8080` in development
- Hash router mode means URLs look like `/#/settings`
- Test with real ESP32 device when possible
- Check browser console for WebSocket connection status

## Common Issues & Solutions

### WebSocket Connection Fails
- Check if IP is stored in localStorage
- Verify IP format and device accessibility
- Check `websocketmanager.js` connection logic
- Look for console errors

### Styles Not Applying
- Check if Quasar variables are imported
- Verify dark mode is enabled in quasar.config.js
- Use Quasar's utility classes when possible

### Router Not Working
- Ensure hash mode is set in quasar.config.js
- Check routes.js for correct path definitions
- Verify router-link components use correct paths

---

**Last Updated**: [Auto-update this when making significant changes]
**Current Branch**: Check git status before making changes
**Active Development**: Sol3m branch (see `.copilot-rules` for constraints)

