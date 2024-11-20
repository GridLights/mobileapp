// webservices.js

let ws = null; // WebSocket instance

export const webservices = {
  reconnectTimeout: 3000, // Initial timeout for reconnect attempts (in milliseconds)
  maxReconnectAttempts: 10, // Maximum number of reconnection attempts
  reconnectAttempts: 0, // Counter for reconnection attempts

  /**
   * Initialize a WebSocket connection.
   * @param {string} wsUrl - The WebSocket URL (e.g., "ws://<WLED-IP>/ws").
   */
  initWebSocket(wsUrl, onMessageCallback, onConnectedCallback) {
    const self = this; // Preserve `this` context for inner functions

    function connect() {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established.");
        self.reconnectAttempts = 0; // Reset the reconnection attempts on successful connection
        if (onConnectedCallback) {
          onConnectedCallback(); // Call the provided callback after the connection is established
        }
      };

      ws.onmessage = (event) => {
        // Parse the incoming message as JSON
        const data = JSON.parse(event.data);
        if (onMessageCallback) {
          onMessageCallback(data); // Pass the message to the callback
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
        ws = null; // Reset WebSocket instance on close
        self.handleReconnect(wsUrl, onMessageCallback, onConnectedCallback);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Explicitly close the socket on error
      };
    }

    connect();
  },

  /**
   * Handle WebSocket reconnection attempts.
   * @param {string} wsUrl - The WebSocket URL (e.g., "ws://<WLED-IP>/ws").
   * @param {function} onMessageCallback - Callback for handling incoming WebSocket messages.
   * @param {function} onConnectedCallback - Callback for when the WebSocket connects successfully.
   */
  handleReconnect(wsUrl, onMessageCallback, onConnectedCallback) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * this.reconnectAttempts; // Exponential backoff
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);

      setTimeout(() => {
        this.initWebSocket(wsUrl, onMessageCallback, onConnectedCallback);
      }, delay);
    } else {
      console.error(
        "Max reconnection attempts reached. Could not reconnect to WebSocket."
      );
    }
  },

  /**
   * Subscribe to the live LED stream.
   */
  subscribeToLiveStream() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ lv: true }));
      console.log("Subscribed to live LED stream.");
    } else {
      console.error("WebSocket is not open. Cannot subscribe to live stream.");
    }
  },

  closeWebSocket() {
    // Clean up WebSocket connection when the component is destroyed
    if (this.ws) {
      this.ws.close();
    }
  },

  /**
   * Unsubscribe from the live LED stream.
   */
  unsubscribeFromLiveStream() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ lv: false }));
      console.log("Unsubscribed from live LED stream.");
    } else {
      console.error(
        "WebSocket is not open. Cannot unsubscribe from live stream."
      );
    }
  },

  /**
   * Send a command to the WebSocket.
   * @param {object} command - The JSON command object to send.
   */
  sendCommandToWebSocket(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
      console.log("Command sent via WebSocket:", command);
    } else {
      console.error("WebSocket connection is not open.");
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
