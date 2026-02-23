// useWebSocket.js
//
// Clean composable wrapper around webservices.js.
// Guards against multiple WebSocket initializations.
// Provides reactive connection state and command helpers.
//
// Usage:
//   const { isConnected, connectionState, initWebSocket, sendCommand, ... } = useWebSocket();

import webservices, { ConnectionState } from '../webservices';
import { useConnectionState } from './useConnectionState';
import gconsole from '../utils/gconsole';

// Module-level guard: track whether WS has been initialized
let initialized = false;

export function useWebSocket() {
  const { connectionState, isConnected, subscribe, unsubscribe } = useConnectionState();

  /**
   * Initialize the WebSocket connection.
   * Safe to call multiple times — will not create duplicate connections.
   *
   * @param {object} options
   * @param {function} options.onMessage - JSON state message handler
   * @param {function} options.onLiveStream - Live LED stream handler
   * @param {function} options.onConnected - Called when connection opens
   */
  function initWebSocket({ onMessage, onLiveStream, onConnected } = {}) {
    if (initialized) {
      gconsole.log('WebSocket already initialized, skipping duplicate init.', 'use-ws');
      return;
    }

    const savedIp = localStorage.getItem('ipAddress');
    const ip = savedIp || '4.3.2.1';
    const wsUrl = `ws://${ip}:80/ws`;

    initialized = true;

    webservices.initWebSocket(
      wsUrl,
      onMessage || null,
      onLiveStream || null,
      onConnected || null,
    );
  }

  /**
   * Tear down the WebSocket. Resets the init guard so it can be re-initialized.
   */
  function closeWebSocket() {
    webservices.closeWebSocket();
    initialized = false;
  }

  function sendCommand(command) {
    webservices.sendCommandToWebSocket(command);
  }

  function subscribeToLiveStream() {
    webservices.subscribeToLiveStream();
  }

  function unsubscribeFromLiveStream() {
    webservices.unsubscribeFromLiveStream();
  }

  return {
    connectionState,
    isConnected,
    subscribe,
    unsubscribe,
    initWebSocket,
    closeWebSocket,
    sendCommand,
    subscribeToLiveStream,
    unsubscribeFromLiveStream,
    ConnectionState,
  };
}
