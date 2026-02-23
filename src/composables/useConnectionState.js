// useConnectionState.js
//
// Provides a shared, reactive connection state with multi-listener support.
// Multiple components can subscribe without overwriting each other's callbacks.
//
// Usage:
//   const { connectionState, isConnected } = useConnectionState();

import { ref, readonly } from 'vue';
import webservices, { ConnectionState } from '../webservices';

// Module-level state shared across all composable instances
const connectionState = ref(webservices.getConnectionState());
const listeners = new Set();
let hooked = false;

function ensureHooked() {
  if (hooked) return;
  hooked = true;

  // Patch webservices to fan-out state changes to all registered listeners
  const originalSetConnectionState = webservices.setConnectionState.bind(webservices);
  webservices.setConnectionState = function (state) {
    originalSetConnectionState(state);
    connectionState.value = state;
    for (const fn of listeners) {
      fn(state);
    }
  };
}

export function useConnectionState() {
  ensureHooked();

  function subscribe(callback) {
    listeners.add(callback);
    // Immediately call with current state so the subscriber is in sync
    callback(connectionState.value);
    return () => listeners.delete(callback);
  }

  function unsubscribe(callback) {
    listeners.delete(callback);
  }

  const isConnected = () => connectionState.value === ConnectionState.CONNECTED;

  return {
    connectionState: readonly(connectionState),
    isConnected,
    subscribe,
    unsubscribe,
    ConnectionState,
  };
}
