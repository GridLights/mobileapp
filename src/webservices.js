// webservices.js

let ws = null; // WebSocket instance

export const webservices = {
  reconnectTimeout: 3000, // Initial timeout for reconnect attempts (in milliseconds)
  maxReconnectAttempts: 10, // Maximum number of reconnection attempts
  reconnectAttempts: 0, // Counter for reconnection attempts
  lastProcessedTime: 0,
  commandQueue: [], // Queue for commands

  handleReconnect(wsUrl) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * this.reconnectAttempts; // Exponential backoff
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);

      setTimeout(() => {
        this.initWebSocket(wsUrl);
      }, delay);
    } else {
      console.error(
        "Max reconnection attempts reached. Could not reconnect to WebSocket."
      );
    }
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
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connection established.");
        self.reconnectAttempts = 0; // Reset the reconnection attempts on successful connection

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
          console.log("here");

          if (now - self.lastProcessedTime >= processTime) {
            console.log("not here");
            self.lastProcessedTime = now;

            const reader = new FileReader();

            reader.onload = function () {
              const arrayBuffer = reader.result;
              const byteArray = new Uint8Array(arrayBuffer);

              // Skip the first byte (header byte 'L')
              const ledData = byteArray.slice(1);

              console.log(ledData);

              // Array to hold the hex color values
              const leds = [];

              // Assuming each LED is represented by 3 bytes (RGB)
              for (let i = 1; i < ledData.length; i += 3) {
                // Extract RGB values (make sure there are enough bytes)
                // const r = ledData[i];
                // const g = ledData[i + 1];
                // const b = ledData[i + 2];

                const r = ledData[i] == 0 ? 0 : 255;
                const g = ledData[i + 1] == 0 ? 0 : 255;
                const b = ledData[i + 2] == 0 ? 0 : 255;

                // Convert RGB to hex color string (e.g., "7D0000")
                const hexColor = ((1 << 24) | (r << 16) | (g << 8) | b)
                  .toString(16)
                  .slice(1)
                  .toUpperCase();

                // Push the hex color string to the LEDs array (skip the first)
                if (i > 0) {
                  leds.push(hexColor);
                }
              }

              // Output the result in the desired format
              const response = {
                leds: leds,
                n: 1,
              };

              console.log("Decoded LED Data:", response);

              if (onConnectedCallback) {
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
            console.log("Parsed data:", parsedData);
            if (onMessageCallback) {
              onMessageCallback(parsedData);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
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
        this.initWebSocket(
          wsUrl,
          onMessageCallback,
          onLiveStreamDataCallback,
          onConnectedCallback
        );
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
    // console.log("nothing");
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
   * Send a command to the WebSocket. Queue the command if not open.
   * @param {object} command - The JSON command object to send.
   */
  sendCommandToWebSocket(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(command));
      console.log("Command sent via WebSocket:", command);
    } else {
      console.warn("WebSocket is not open. Queuing command:", command);
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
