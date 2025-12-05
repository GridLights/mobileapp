// webservices.js
import gconsole from './utils/gconsole.js';

let ws = null; // WebSocket instance

// Connection state constants
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

export const webservices = {
  reconnectTimeout: 3000, // Initial timeout for reconnect attempts (in milliseconds)
  maxReconnectAttempts: 10, // Maximum number of reconnection attempts
  reconnectAttempts: 0, // Counter for reconnection attempts
  lastProcessedTime: 0,
  commandQueue: [], // Queue for commands
  connectionState: ConnectionState.DISCONNECTED, // Current connection state
  onConnectionStateChange: null, // Callback for state changes

  /**
   * Set the connection state and notify listeners.
   * @param {string} state - The new connection state.
   */
  setConnectionState(state) {
    this.connectionState = state;
    gconsole.log(`Connection state changed to: ${state}`, "ws-state");
    if (this.onConnectionStateChange) {
      this.onConnectionStateChange(state);
    }
  },

  /**
   * Get the current connection state.
   * @returns {string} The current connection state.
   */
  getConnectionState() {
    return this.connectionState;
  },

  /**
   * Check if the WebSocket is currently connected.
   * @returns {boolean} True if connected.
   */
  isConnected() {
    return this.connectionState === ConnectionState.CONNECTED;
  },

  /**
   * Initialize a WebSocket connection.
   * @param {string} wsUrl - The WebSocket URL (e.g., "ws://<WLED-IP>/ws").
   */
  initWebSocket(
    wsUrl,
    onMessageCallback,
    onLiveStreamDataCallback,
    onConnectedCallback
  ) {
    const self = this; // Preserve `this` context for inner functions

    function connect() {
      self.setConnectionState(ConnectionState.CONNECTING);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        gconsole.log("WebSocket connection established.", "ws-open");
        self.reconnectAttempts = 0; // Reset the reconnection attempts on successful connection
        self.setConnectionState(ConnectionState.CONNECTED);

        // Process queued commands
        while (self.commandQueue.length > 0) {
          const command = self.commandQueue.shift();
          self.sendCommandToWebSocket(command);
        }

        if (onConnectedCallback) {
          onConnectedCallback(); // Call the provided callback after the connection is established
        }
      };

      ws.onmessage = function (event) {
        const messageData = event.data;

        if (messageData instanceof Blob) {
          const now = Date.now();
          // from the live stream, only process every X ms
          const processTime = 50;
          // gconsole.log("here", "ws-general");

          if (now - self.lastProcessedTime >= processTime) {
            // gconsole.log("not here", "ws-general");
            self.lastProcessedTime = now;

            const reader = new FileReader();

            reader.onload = function () {
              const arrayBuffer = reader.result;
              const byteArray = new Uint8Array(arrayBuffer);

              // Skip the first byte (header byte 'L')
              const ledData = byteArray.slice(1);

              // console.log(ledData);

              // Helper: build color array from a given offset
              const buildColorsFromOffset = (offset) => {
                const out = [];
                for (let i = offset; i + 2 < ledData.length; i += 3) {
                  const r = ledData[i] === 0 ? 0 : 255;
                  const g = ledData[i + 1] === 0 ? 0 : 255;
                  const b = ledData[i + 2] === 0 ? 0 : 255;
                  const hexColor = ((1 << 24) | (r << 16) | (g << 8) | b)
                    .toString(16)
                    .slice(1)
                    .toUpperCase();
                  out.push(hexColor);
                }
                return out;
              };

              const candidates = [
                buildColorsFromOffset(0),
                buildColorsFromOffset(1),
                buildColorsFromOffset(2),
              ];

              // Score: prefer the one with most non-black; tie-breaker: longest
              const score = (arr) => ({
                nonBlack: arr.reduce((n, c) => n + (c !== "000000" ? 1 : 0), 0),
                len: arr.length,
              });

              let best = candidates[0];
              let bestScore = score(best);
              for (let k = 1; k < candidates.length; k++) {
                const s = score(candidates[k]);
                if (
                  s.nonBlack > bestScore.nonBlack ||
                  (s.nonBlack === bestScore.nonBlack && s.len > bestScore.len)
                ) {
                  best = candidates[k];
                  bestScore = s;
                }
              }

              const leds = best;

              // Output the result in the desired format
              const response = {
                leds,
                n: 1,
              };

              // gconsole.log("Decoded LED Data:", "ws-general");
              // console.log(response);

              // Use the correct callback for live stream data
              if (onLiveStreamDataCallback) {
                onLiveStreamDataCallback(response);
              }
              // this.led
            };

            // Read the Blob as an ArrayBuffer
            reader.readAsArrayBuffer(messageData);
          }
          // const reader = new FileReader();

          // // When reading is complete, process the data
          // reader.onload = function () {
          //   const result = reader.result;

          //   try {
          //     // Attempt to parse as JSON
          //     const parsedData = JSON.parse(result);
          //     console.log("Parsed Data:", parsedData);
          //   } catch (error) {
          //     console.error("Error parsing data:", error);
          //     console.log("Raw Data:", result);
          //   }
          // };

          // // Read the Blob as text
          // reader.readAsText(messageData);

          // Read the Blob as an ArrayBuffer
          // const reader = new FileReader();
          // reader.onloadend = function () {
          //   const arrayBuffer = reader.result;
          //   const text = new TextDecoder().decode(arrayBuffer); // Decode it as text
          //   console.log("Decoded text:", text);
          //   try {
          //     const parsedData = JSON.parse(text); // Try parsing it as JSON if it's a string
          //     console.log("Parsed JSON:", parsedData);
          //   } catch (e) {
          //     console.error("Failed to parse JSON:", e);
          //   }
          // };
          // reader.readAsArrayBuffer(messageData); // Convert Blob to ArrayBuffer
        } else {
          // If it's already text or another valid format
          try {
            const parsedData = JSON.parse(messageData);
            // console.info("Parsed data:", parsedData);
            if (onMessageCallback) {
              onMessageCallback(parsedData);
            }
          } catch (e) {
            gconsole.error("Error parsing JSON:" + e, "error");
          }
        }
      };

      ws.onclose = () => {
        gconsole.log("WebSocket connection closed.","ws-closed");
        self.setConnectionState(ConnectionState.DISCONNECTED);
        ws = null; // Reset WebSocket instance on close
        self.handleReconnect(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback);
      };

      ws.onerror = (error) => {
        gconsole.error("!!! WebSocket error: " , "ws-error");
        console.error(error);
        ws.close(); // Explicitly close the socket on error
      };
    }

    connect();
  },

  /**
   * Handle WebSocket reconnection attempts.
   * @param {string} wsUrl - The WebSocket URL (e.g., "ws://<WLED-IP>/ws").
   * @param {function} onMessageCallback - Callback for handling incoming WebSocket messages.
   * @param {function} onLiveStreamDataCallback - Callback for handling live stream LED data.
   * @param {function} onConnectedCallback - Callback for when the WebSocket connects successfully.
   */
  handleReconnect(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.setConnectionState(ConnectionState.RECONNECTING);
      const delay = this.reconnectTimeout * this.reconnectAttempts; // Exponential backoff
      gconsole.log(`Attempting to reconnect in ${delay / 1000} seconds...`, "ws-reconnect");

      setTimeout(() => {
        this.initWebSocket(
          wsUrl,
          onMessageCallback,
          onLiveStreamDataCallback,
          onConnectedCallback
        );
      }, delay);
    } else {
      this.setConnectionState(ConnectionState.FAILED);
      gconsole.error("Max reconnection attempts reached. Could not reconnect to WebSocket.", "ws-error");
    }
  },

  /**
   * Subscribe to the live LED stream.
   */
  subscribeToLiveStream() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ lv: true }));
      gconsole.log("Subscribed to live LED stream.", "ws-open");
    } else {
      gconsole.error("WebSocket is not open. Cannot subscribe to live stream..", "ws-error");
    }
    // console.log("nothing");
  },

  closeWebSocket() {
    // Clean up WebSocket connection when the component is destroyed
    if (ws) {
      ws.close();
      ws = null;
    }
  },

  /**
   * Unsubscribe from the live LED stream.
   */
  unsubscribeFromLiveStream() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ lv: false }));
      gconsole.log("Unsubscribed from live LED stream.", "ws-closed");
    } else {
      gconsole.error("WebSocket is not open. Cannot unsubscribe from live stream.", "ws-error");
    }
  },

  /**
   * Send a command to the WebSocket. Queue the command if not open.
   * @param {object} command - The JSON command object to send.
   */
  sendCommandToWebSocket(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
      gconsole.log("Command sent via WebSocket:  ", "ws-open");
      console.log(command);
    } else {
      gconsole.warn("WebSocket is not open. Queuing command:" + command, "ws-closed");
      this.commandQueue.push(command);
    }
  },

  /**
   * Set a range of LEDs to a specific color.
   * @param {number} startLed - Start LED index (1-based).
   * @param {number} stopLed - Stop LED index (exclusive, 1-based).
   * @param {Array} color - An array of RGB values (e.g., [255, 0, 0] for red).
   */
  setLedRange(startLed, stopLed, color) {
    const command = {
      on: true,
      bri: 100,
      seg: [
        {
          id: 0,
          start: startLed - 1, // Adjust for 0-indexed
          stop: stopLed,
          col: [color],
        },
      ],
    };
    this.sendCommandToWebSocket(command);
  },
};

export default webservices;
