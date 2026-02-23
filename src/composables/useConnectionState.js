// useConnectionState.js
//
// Provides a shared, reactive connection state with multi-listener support.
// Multiple components can subscribe without overwriting each other's callbacks.
//
// Usage:
//   const { connectionState, isConnected } = useConnectionState();

import { ref, computed, readonly } from 'vue';
import webservices, { ConnectionState } from '../webservices';

// Module-level state shared across all composable instances
const connectionState = ref(webservices.getConnectionState());
const listeners = new Set();
let hooked = false;

function ensureHooked() {
  if (hooked) return;
  hooked = true;

  // Central fanout handler: updates reactive state and notifies all listeners
  const fanoutHandler = function (state) {
    connectionState.value = state;
    for (const fn of listeners) {
      try {
        fn(state);
      } catch (_err) {
        // Swallow listener errors to avoid breaking other subscribers
      }
    }
  };

  // If an onConnectionStateChange handler already exists, include it in the fanout
  const existingHandler = webservices.onConnectionStateChange;
  if (typeof existingHandler === 'function') {
    listeners.add(existingHandler);
  }

  // Ensure that all future internal calls to onConnectionStateChange go through fanoutHandler
  // and that external assignments are integrated into the listeners set.
  let lastAssignedExternalHandler =
    typeof existingHandler === 'function' ? existingHandler : undefined;

  try {
    Object.defineProperty(webservices, 'onConnectionStateChange', {
      configurable: true,
      enumerable: true,
      get() {
        return fanoutHandler;
      },
      set(fn) {
        // Remove the previously assigned external handler from listeners
        if (lastAssignedExternalHandler) {
          listeners.delete(lastAssignedExternalHandler);
          lastAssignedExternalHandler = undefined;
        }

        if (typeof fn === 'function') {
          lastAssignedExternalHandler = fn;
          listeners.add(fn);
        }
      },
    });
  } catch (_err) {
    // If defining the property fails for any reason, fall back to assigning fanoutHandler.
    webservices.onConnectionStateChange = fanoutHandler;
  }

  const originalSetConnectionState = webservices.setConnectionState.bind(webservices);
  webservices.setConnectionState = function (state) {
    // Delegate to the original implementation, which will now call the fanout handler
    // via webservices.onConnectionStateChange.
    originalSetConnectionState(state);
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

  const isConnected = computed(() => connectionState.value === ConnectionState.CONNECTED);

  return {
    connectionState: readonly(connectionState),
    isConnected: readonly(isConnected),
    subscribe,
    unsubscribe,
    ConnectionState,
  };
}
