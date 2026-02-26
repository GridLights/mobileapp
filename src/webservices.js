// webservices.js
import gconsole from './utils/gconsole.js';

let ws = null; // WebSocket instance
let onGuardReset = null; // Callback to reset useWebSocket composable's guard when reconnectWithNewUrl is called

// Connection state constants
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

// WLED AP-mode default IP — only reachable when device is its own access point.
// On a normal home network this address is unreachable; we skip retries for it.
export const AP_IP = '4.3.2.1';

/**
 * Resolve the best IP address to use on startup.
 *
 * Priority:
 *   1. User-configured IP ('ipAddress' in localStorage) — if it isn't the AP default
 *   2. Last IP that produced a successful WS connection ('lastValidIpAddress')
 *   3. User-configured IP even if it is the AP default (caller handles no-retry policy)
 *   4. null — nothing configured, skip connecting
 *
 * @returns {string|null} IP address string, or null if there is nothing to connect to.
 */
export function resolveStartupIp() {
  try {
    const userIp = localStorage.getItem('ipAddress');
    const lastValidIp = localStorage.getItem('lastValidIpAddress');
    if (userIp && userIp !== AP_IP) return userIp;
    if (lastValidIp && lastValidIp !== AP_IP) return lastValidIp;
    if (userIp) return userIp; // may be AP_IP — caller enforces no-retry
    return null;
  } catch (_) {
    return null; // localStorage unavailable (SSR, test env, etc.)
  }
}

// Default WLED effects list (WLED v0.14.4 - 188 effects)
export const DEFAULT_WLED_EFFECTS = [
  "Solid",
  "Blink",
  "Breathe",
  "Wipe",
  "Wipe Random",
  "Random Colors",
  "Sweep",
  "Dynamic",
  "Colorloop",
  "Rainbow",
  "Scan",
  "Scan Dual",
  "Fade",
  "Theater",
  "Theater Rainbow",
  "Running",
  "Saw",
  "Twinkle",
  "Dissolve",
  "Dissolve Rnd",
  "Sparkle",
  "Sparkle Dark",
  "Sparkle+",
  "Strobe",
  "Strobe Rainbow",
  "Strobe Mega",
  "Blink Rainbow",
  "Android",
  "Chase",
  "Chase Random",
  "Chase Rainbow",
  "Chase Flash",
  "Chase Flash Rnd",
  "Rainbow Runner",
  "Colorful",
  "Traffic Light",
  "Sweep Random",
  "Chase 2",
  "Aurora",
  "Stream",
  "Scanner",
  "Lighthouse",
  "Fireworks",
  "Rain",
  "Tetrix",
  "Fire Flicker",
  "Gradient",
  "Loading",
  "Rolling Balls",
  "Fairy",
  "Two Dots",
  "Fairytwinkle",
  "Running Dual",
  "Chase 3",
  "Tri Wipe",
  "Tri Fade",
  "Lightning",
  "ICU",
  "Multi Comet",
  "Scanner Dual",
  "Stream 2",
  "Oscillate",
  "Pride 2015",
  "Juggle",
  "Palette",
  "Fire 2012",
  "Colorwaves",
  "Bpm",
  "Fill Noise",
  "Noise 1",
  "Noise 2",
  "Noise 3",
  "Noise 4",
  "Colortwinkles",
  "Lake",
  "Meteor",
  "Meteor Smooth",
  "Railway",
  "Ripple",
  "Twinklefox",
  "Twinklecat",
  "Halloween Eyes",
  "Solid Pattern",
  "Solid Pattern Tri",
  "Spots",
  "Spots Fade",
  "Glitter",
  "Candle",
  "Fireworks Starburst",
  "Fireworks 1D",
  "Bouncing Balls",
  "Sinelon",
  "Sinelon Dual",
  "Sinelon Rainbow",
  "Popcorn",
  "Drip",
  "Plasma",
  "Percent",
  "Ripple Rainbow",
  "Heartbeat",
  "Pacifica",
  "Candle Multi",
  "Solid Glitter",
  "Sunrise",
  "Phased",
  "Twinkleup",
  "Noise Pal",
  "Sine",
  "Phased Noise",
  "Flow",
  "Chunchun",
  "Dancing Shadows",
  "Washing Machine",
  "Blends",
  "TV Simulator",
  "Dynamic Smooth",
  "Pixels",
  "Pixelwave",
  "Juggles",
  "Matripix",
  "Gravimeter",
  "Plasmoid",
  "Puddles",
  "Midnoise",
  "Noisemeter",
  "Freqwave",
  "Freqmatrix",
  "Waterfall",
  "Freqpixels",
  "Noisefire",
  "Puddlepeak",
  "Noisemove",
  "Perlin Move",
  "Ripple Peak",
  "Freqmap",
  "Gravcenter",
  "Gravcentric",
  "Gravfreq",
  "DJ Light",
  "Blurz",
  "Flow Stripe",
  "Wavesins",
  "Rocktaves",
  "Spaceships",
  "Crazy Bees",
  "Ghost Rider",
  "Blobs",
  "Scrolling Text",
  "Drift Rose",
  "Distortion Waves",
  "GEQ",
  "Noise2D",
  "Firenoise",
  "Squared Swirl",
  "DNA",
  "Matrix",
  "Metaballs",
  "Funky Plank",
  "Pulser",
  "Drift",
  "Waverly",
  "Sun Radiation",
  "Colored Bursts",
  "Julia",
  "Game Of Life",
  "Tartan",
  "Polar Lights",
  "Swirl",
  "Lissajous",
  "Frizzles",
  "Plasma Ball",
  "Hiphotic",
  "Sindots",
  "DNA Spiral",
  "Black Hole",
  "Soap",
  "Octopus",
  "Waving Cell",
  "Akemi"
];

export const webservices = {
  reconnectTimeout: 3000, // Base timeout for reconnect backoff (in milliseconds)
  maxReconnectAttempts: 10, // Maximum number of reconnection attempts
  reconnectAttempts: 0, // Counter for reconnection attempts
  reconnectTimeoutId: null, // Tracks pending reconnect timer so it can be cancelled
  lastProcessedTime: 0,
  commandQueue: [], // Queue for commands
  connectionState: ConnectionState.DISCONNECTED, // Current connection state
  onConnectionStateChange: null, // Callback for state changes
  _callbacks: null, // Stored callbacks from last initWebSocket call

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
    // Store callbacks for reconnect operations
    this._callbacks = { onMessageCallback, onLiveStreamDataCallback, onConnectedCallback };

    function connect() {
      self.setConnectionState(ConnectionState.CONNECTING);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        gconsole.log("WebSocket connection established.", "ws-open");
        self.reconnectAttempts = 0; // Reset the reconnection attempts on successful connection
        self.setConnectionState(ConnectionState.CONNECTED);

        // Persist this IP as last-known-good so future startups can use it as a fallback
        try {
          const ipMatch = wsUrl.match(/ws:\/\/([^:/]+)/);
          if (ipMatch && ipMatch[1] !== AP_IP) {
            localStorage.setItem('lastValidIpAddress', ipMatch[1]);
          }
        } catch (_) {}

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

              // Skip 2-byte header: byte 0 = 'L' (0x4C), byte 1 = frame counter/flags
              const ledData = byteArray.slice(2);

              // console.log(ledData);

              // Helper: build color array from a given offset
              const buildColors = () => {
                const out = [];
                for (let i = 0; i + 2 < ledData.length; i += 3) {
                  let r = ledData[i];
                  let g = ledData[i + 1];
                  let b = ledData[i + 2];
                  // Normalize to full brightness so the display reflects hue only,
                  // not WLED's dimmer setting
                  const max = Math.max(r, g, b);
                  if (max > 0 && max < 255) {
                    r = Math.round((r / max) * 255);
                    g = Math.round((g / max) * 255);
                    b = Math.round((b / max) * 255);
                  }
                  const hexColor = ((1 << 24) | (r << 16) | (g << 8) | b)
                    .toString(16)
                    .slice(1)
                    .toUpperCase();
                  out.push(hexColor);
                }
                return out;
              };

              const leds = buildColors();

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
        if (ws) {
          ws.onerror = null; // prevent double-firing if onclose also triggers
          ws.close();
        }
      };
    }

    connect();
  },

  /**
   * Handle WebSocket reconnection attempts with true exponential backoff + jitter.
   * @param {string} wsUrl - The WebSocket URL (e.g., "ws://<WLED-IP>/ws").
   * @param {function} onMessageCallback - Callback for handling incoming WebSocket messages.
   * @param {function} onLiveStreamDataCallback - Callback for handling live stream LED data.
   * @param {function} onConnectedCallback - Callback for when the WebSocket connects successfully.
   */
  handleReconnect(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback) {
    // Cancel any pending reconnect timer before scheduling a new one
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Never retry the WLED AP default IP — it is unreachable on a home network
    const ipMatch = wsUrl.match(/ws:\/\/([^:/]+)/);
    if (ipMatch && ipMatch[1] === AP_IP) {
      this.setConnectionState(ConnectionState.FAILED);
      gconsole.log('AP default IP (4.3.2.1) is unreachable on a home network — not retrying. Go to Settings to configure the correct IP.', 'ws-reconnect');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.setConnectionState(ConnectionState.RECONNECTING);

      // True exponential backoff: 3s, 6s, 12s, 24s... capped at 30s, with ±1s jitter
      const base = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      const jitter = (Math.random() - 0.5) * 2000; // ±1s jitter
      const delay = Math.min(base + jitter, 30000);

      gconsole.log(
        `Attempting to reconnect in ${(delay / 1000).toFixed(1)} seconds... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        "ws-reconnect"
      );

      this.reconnectTimeoutId = setTimeout(() => {
        this.reconnectTimeoutId = null;
        this.initWebSocket(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback);
      }, delay);
    } else {
      this.setConnectionState(ConnectionState.FAILED);
      gconsole.error("Max reconnection attempts reached. Could not reconnect to WebSocket.", "ws-error");
    }
  },

  /**
   * Cancel any pending reconnect, close the current socket, and start fresh with a new URL.
   * Call this when the user changes the WLED IP address.
   * @param {string} wsUrl - The new WebSocket URL.
   * @param {function} onMessageCallback
   * @param {function} onLiveStreamDataCallback
   * @param {function} onConnectedCallback
   */
  resetAndReconnect(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback) {
    // Kill any pending reconnect timer
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Close the current socket without triggering the old reconnect chain
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
      ws = null;
    }

    // Reset attempt counter so we get a full 10 attempts on the new IP
    this.reconnectAttempts = 0;
    this.setConnectionState(ConnectionState.DISCONNECTED);

    // Reset the composable's guard so it knows the WebSocket has been closed/reset
    if (typeof onGuardReset === 'function') {
      onGuardReset();
    }

    // Connect immediately with the new URL
    this.initWebSocket(wsUrl, onMessageCallback, onLiveStreamDataCallback, onConnectedCallback);
  },

  /**
   * Reconnect with a new WLED IP, reusing the callbacks from the last initWebSocket call.
   * Call this from SettingsPage when the user saves a new IP address.
   * @param {string} newWsUrl - The new WebSocket URL (e.g., "ws://192.168.1.42/ws").
   */
  reconnectWithNewUrl(newWsUrl) {
    if (!this._callbacks) {
      gconsole.error('reconnectWithNewUrl called before initWebSocket - no callbacks stored. Initializing with default callbacks.', 'ws-error');
      // If called before initialization, start with default callbacks instead of failing silently
      this.initWebSocket(
        newWsUrl,
        null,  // onMessageCallback
        null,  // onLiveStreamDataCallback
        null   // onConnectedCallback
      );
      return;
    }
    const cb = this._callbacks;
    this.resetAndReconnect(
      newWsUrl,
      cb.onMessageCallback,
      cb.onLiveStreamDataCallback,
      cb.onConnectedCallback
    );
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
    // Cancel any pending reconnect timer first so it can't fire after the component unmounts
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    this.reconnectAttempts = 0;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null; // prevent triggering handleReconnect on intentional close
      ws.onerror = null;
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

  /**
   * Fetch the effects list from a WLED instance
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Array>} Array of effect names
   */
  async fetchWledEffects(ipAddress) {
    try {
      const url = `http://${ipAddress}/json/eff`;
      gconsole.log(`Fetching effects from: ${url}`, "wled-api");
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const effects = await response.json();
      gconsole.log(`Fetched ${effects.length} effects from WLED`, "wled-api");
      return effects;
    } catch (error) {
      gconsole.error(`Error fetching WLED effects: ${error.message}`, "wled-api-error");
      throw error;
    }
  },

  /**
   * Fetch device information from a WLED instance
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Object>} Device info object
   */
  async fetchWledInfo(ipAddress) {
    try {
      const url = `http://${ipAddress}/json/info`;
      gconsole.log(`Fetching device info from: ${url}`, "wled-api");
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const info = await response.json();
      gconsole.log(`Fetched device info from WLED`, "wled-api");
      return info;
    } catch (error) {
      gconsole.error(`Error fetching WLED info: ${error.message}`, "wled-api-error");
      throw error;
    }
  },

  /**
   * Analyze WLED instance and identify custom effects
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Object>} Object containing all effects, custom effects, and device info
   */
  async analyzeWledInstance(ipAddress) {
    try {
      gconsole.log(`Analyzing WLED instance at: ${ipAddress}`, "wled-analysis");
      
      // Fetch both effects and device info in parallel
      const [effects, info] = await Promise.all([
        this.fetchWledEffects(ipAddress),
        this.fetchWledInfo(ipAddress)
      ]);

      // Identify custom effects (those not in the default list)
      // Filter out RSVD (reserved) effects and empty/null effects
      const customEffects = effects
        .map((effect, index) => ({ name: effect, id: index }))
        .filter(effect => {
          const name = effect.name || '';
          // Exclude default effects, RSVD/reserved effects, and empty names
          return !DEFAULT_WLED_EFFECTS.includes(effect.name) &&
                 !name.toUpperCase().includes('RSVD') &&
                 name.trim().length > 0;
        });

      const analysisResult = {
        ipAddress,
        deviceInfo: {
          name: info.name || 'Unknown',
          version: info.ver || 'Unknown',
          brand: info.brand || 'WLED',
          mac: info.mac || 'Unknown',
          ledCount: info.leds?.count || 0,
        },
        effects: {
          all: effects,
          custom: customEffects,
          total: effects.length,
          customCount: customEffects.length,
        },
        timestamp: new Date().toISOString(),
      };

      gconsole.log(`Analysis complete: Found ${customEffects.length} custom effects`, "wled-analysis");
      
      // Store custom effects in localStorage
      this.storeCustomEffects(ipAddress, analysisResult);

      return analysisResult;
    } catch (error) {
      gconsole.error(`Error analyzing WLED instance: ${error.message}`, "wled-analysis-error");
      throw error;
    }
  },

  /**
   * Store custom effects analysis in localStorage
   * @param {string} ipAddress - The IP address of the WLED instance
   * @param {Object} analysisResult - The analysis result object
   */
  storeCustomEffects(ipAddress, analysisResult) {
    try {
      // Store the complete analysis result
      const storageKey = `wled_analysis_${ipAddress.replace(/\./g, '_')}`;
      localStorage.setItem(storageKey, JSON.stringify(analysisResult));
      
      // Also store a reference in a master list of analyzed devices
      const analyzedDevices = this.getAnalyzedDevices();
      const existingIndex = analyzedDevices.findIndex(d => d.ipAddress === ipAddress);
      
      const deviceSummary = {
        ipAddress,
        deviceName: analysisResult.deviceInfo.name,
        customEffectCount: analysisResult.effects.customCount,
        lastAnalyzed: analysisResult.timestamp,
      };

      if (existingIndex !== -1) {
        analyzedDevices[existingIndex] = deviceSummary;
      } else {
        analyzedDevices.push(deviceSummary);
      }

      localStorage.setItem('wled_analyzed_devices', JSON.stringify(analyzedDevices));
      
      gconsole.log(`Stored analysis for ${ipAddress}`, "wled-storage");
    } catch (error) {
      gconsole.error(`Error storing custom effects: ${error.message}`, "wled-storage-error");
    }
  },

  /**
   * Get analysis result for a specific WLED instance
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Object|null} Analysis result or null if not found
   */
  getStoredAnalysis(ipAddress) {
    try {
      const storageKey = `wled_analysis_${ipAddress.replace(/\./g, '_')}`;
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      gconsole.error(`Error retrieving stored analysis: ${error.message}`, "wled-storage-error");
      return null;
    }
  },

  /**
   * Get list of all analyzed devices
   * @returns {Array} Array of analyzed device summaries
   */
  getAnalyzedDevices() {
    try {
      const stored = localStorage.getItem('wled_analyzed_devices');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      gconsole.error(`Error retrieving analyzed devices: ${error.message}`, "wled-storage-error");
      return [];
    }
  },

  /**
   * Clear stored analysis for a specific device
   * @param {string} ipAddress - The IP address of the WLED instance
   */
  clearStoredAnalysis(ipAddress) {
    try {
      const storageKey = `wled_analysis_${ipAddress.replace(/\./g, '_')}`;
      localStorage.removeItem(storageKey);
      
      // Remove from master list
      const analyzedDevices = this.getAnalyzedDevices();
      const filtered = analyzedDevices.filter(d => d.ipAddress !== ipAddress);
      localStorage.setItem('wled_analyzed_devices', JSON.stringify(filtered));
      
      gconsole.log(`Cleared analysis for ${ipAddress}`, "wled-storage");
    } catch (error) {
      gconsole.error(`Error clearing stored analysis: ${error.message}`, "wled-storage-error");
    }
  },

  // =========================================================================
  // PRESETS API
  // =========================================================================

  /**
   * Fetch all presets from a WLED instance
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Object>} Object containing all presets
   */
  async fetchWledPresets(ipAddress) {
    try {
      const url = `http://${ipAddress}/presets.json`;
      gconsole.log(`Fetching presets from: ${url}`, "wled-api");
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const presets = await response.json();
      gconsole.log(`Fetched presets from WLED`, "wled-api");
      return presets;
    } catch (error) {
      gconsole.error(`Error fetching WLED presets: ${error.message}`, "wled-api-error");
      throw error;
    }
  },

  /**
   * Fetch palettes list from a WLED instance
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Array>} Array of palette names
   */
  async fetchWledPalettes(ipAddress) {
    try {
      const url = `http://${ipAddress}/json/pal`;
      gconsole.log(`Fetching palettes from: ${url}`, "wled-api");
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const palettes = await response.json();
      gconsole.log(`Fetched ${palettes.length} palettes from WLED`, "wled-api");
      return palettes;
    } catch (error) {
      gconsole.error(`Error fetching WLED palettes: ${error.message}`, "wled-api-error");
      throw error;
    }
  },

  /**
   * Fetch current WLED state
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Object>} Current state object
   */
  async fetchWledState(ipAddress) {
    try {
      const url = `http://${ipAddress}/json/state`;
      gconsole.log(`Fetching state from: ${url}`, "wled-api");
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const state = await response.json();
      gconsole.log(`Fetched state from WLED`, "wled-api");
      return state;
    } catch (error) {
      gconsole.error(`Error fetching WLED state: ${error.message}`, "wled-api-error");
      throw error;
    }
  },

  /**
   * Save a preset to the WLED device
   * @param {string} ipAddress - The IP address of the WLED instance
   * @param {number} presetId - Preset slot ID (1-250)
   * @param {string} name - Preset name
   * @param {Object} options - Additional options
   * @param {boolean} options.includeBrightness - Include brightness in preset
   * @param {boolean} options.saveSegmentBounds - Save segment start/stop bounds
   * @param {Object} options.segmentConfig - Optional custom segment configuration
   * @returns {Promise<boolean>} True if successful
   */
  async savePreset(ipAddress, presetId, name, options = {}) {
    const {
      includeBrightness = true,
      saveSegmentBounds = true,
      segmentConfig = null
    } = options;

    gconsole.log(`Saving preset ${presetId} to ${ipAddress}`, "wled-preset");

    const command = {
      psave: presetId,
      n: name,
      ib: includeBrightness,
      sb: saveSegmentBounds,
    };

    if (segmentConfig) {
      command.seg = segmentConfig;
    }

    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Save preset failed: HTTP ${response.status}`);
    }

    gconsole.log(`Preset ${presetId} saved successfully`, "wled-preset");
    return true;
  },

  /**
   * Delete a preset from the WLED device
   * @param {string} ipAddress - The IP address of the WLED instance
   * @param {number} presetId - Preset ID to delete
   * @returns {Promise<boolean>} True if successful
   */
  async deletePreset(ipAddress, presetId) {
    gconsole.log(`Deleting preset ${presetId} from ${ipAddress}`, "wled-preset");

    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdel: presetId }),
    });

    if (!response.ok) {
      throw new Error(`Delete preset failed: HTTP ${response.status}`);
    }

    gconsole.log(`Preset ${presetId} deleted successfully`, "wled-preset");
    return true;
  },

  /**
   * Apply a preset by ID
   * @param {string} ipAddress - WLED device IP
   * @param {number} presetId - Preset ID to apply
   */
  async applyPreset(ipAddress, presetId) {
    gconsole.log(`Applying preset ${presetId}`, "wled-preset");
    await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ps: presetId }),
    });
    // Immediately suppress sync — presets may have been saved with udpn.send=true
    // which would broadcast state to all WLED devices on the network.
    await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ udpn: { send: false } }),
    });
  },

  /**
   * Save a playlist definition as a WLED preset (atomic single request).
   * Uses psave + playlist together so the definition is captured before
   * WLED transitions to the first playing effect.
   * @param {string} ipAddress - WLED device IP
   * @param {number} presetId - Preset slot ID to save into
   * @param {string} name - Playlist name
   * @param {Object} playlist - Playlist configuration (presets, durations, etc.)
   * @returns {Promise<boolean>} True if successful
   */
  async savePlaylist(ipAddress, presetId, name, playlist) {
    const { presets, durations, transition = 7, repeat = 0, items = [] } = playlist;

    gconsole.log(`Saving playlist "${name}" to preset ${presetId}`, "wled-playlist");

    const command = {
      psave: presetId,
      n: name,
      ib: false,
      playlist: {
        ps: presets,
        dur: durations,
        transition,
        repeat,
      },
    };

    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });

    if (!response.ok) throw new Error(`Save playlist failed: HTTP ${response.status}`);

    // WLED does not store a distinguishing key for playlist presets in presets.json.
    // Track playlist IDs and their full definitions in localStorage so the app
    // can correctly separate playlists from regular presets on reload.
    this.storePlaylistMeta(ipAddress, presetId, { n: name, items, transition, repeat });

    gconsole.log(`Playlist saved to preset ${presetId}`, "wled-playlist");
    return true;
  },

  /**
   * Store playlist metadata in localStorage (since WLED doesn't distinguish
   * playlist presets structurally in presets.json).
   */
  storePlaylistMeta(ipAddress, presetId, meta) {
    try {
      const key = `gridlights_playlists_${ipAddress.replace(/\./g, '_')}`;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      stored[presetId] = meta;
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (_) {}
  },

  /**
   * Remove playlist metadata from localStorage when a playlist is deleted.
   */
  removePlaylistMeta(ipAddress, presetId) {
    try {
      const key = `gridlights_playlists_${ipAddress.replace(/\./g, '_')}`;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      delete stored[presetId];
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (_) {}
  },

  /**
   * Return the stored playlist metadata map for an IP address.
   * Returns an object keyed by preset ID (as strings).
   */
  getStoredPlaylists(ipAddress) {
    try {
      const key = `gridlights_playlists_${ipAddress.replace(/\./g, '_')}`;
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (_) {
      return {};
    }
  },

  /**
   * Start a playlist via HTTP POST
   * @param {string} ipAddress - WLED device IP
   * @param {Object} playlist - Playlist configuration
   */
  async startPlaylist(ipAddress, playlist) {
    const { presets, durations, transition = 7, repeat = 0, endPreset = null } = playlist;

    gconsole.log(`Starting playlist with ${presets.length} presets`, "wled-playlist");

    const command = {
      playlist: {
        ps: presets,
        dur: durations,
        transition: transition,
        repeat: repeat,
      }
    };

    if (endPreset !== null) {
      command.playlist.end = endPreset;
    }

    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Start playlist failed: HTTP ${response.status}`);
    }
    return true;
  },

  /**
   * Stop the current playlist via HTTP POST
   * @param {string} ipAddress - WLED device IP
   */
  async stopPlaylist(ipAddress) {
    gconsole.log("Stopping playlist", "wled-playlist");
    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pl: -1 }),
    });

    if (!response.ok) {
      throw new Error(`Stop playlist failed: HTTP ${response.status}`);
    }
    return true;
  },

  /**
   * Advance to the next preset in a playlist via HTTP POST
   * @param {string} ipAddress - WLED device IP
   */
  async nextPlaylistPreset(ipAddress) {
    gconsole.log("Advancing to next playlist preset", "wled-playlist");
    const response = await fetch(`http://${ipAddress}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ np: true }),
    });

    if (!response.ok) {
      throw new Error(`Next playlist preset failed: HTTP ${response.status}`);
    }
    return true;
  },

  /**
   * Apply effect with full parameters
   * @param {Object} config - Effect configuration
   * @param {number} config.effectId - Effect ID (fx)
   * @param {number} config.speed - Speed 0-255 (sx)
   * @param {number} config.intensity - Intensity 0-255 (ix)
   * @param {number} config.palette - Palette ID (pal)
   * @param {Array} config.colors - Array of up to 3 colors [[r,g,b], [r,g,b], [r,g,b]]
   * @param {number} config.brightness - Brightness 0-255 (bri)
   * @param {number} config.custom1 - Custom slider 1 (c1)
   * @param {number} config.custom2 - Custom slider 2 (c2)
   * @param {number} config.custom3 - Custom slider 3 (c3)
   */
  async applyEffect(config) {
    const { ipAddress, effectId, speed, intensity, palette, colors, brightness, custom1, custom2, custom3 } = config;

    gconsole.log(`Applying effect ${effectId}`, "wled-effect");

    const segConfig = { fx: effectId };
    if (speed !== undefined) segConfig.sx = speed;
    if (intensity !== undefined) segConfig.ix = intensity;
    if (palette !== undefined) segConfig.pal = palette;
    if (colors !== undefined) segConfig.col = colors;
    if (custom1 !== undefined) segConfig.c1 = custom1;
    if (custom2 !== undefined) segConfig.c2 = custom2;
    if (custom3 !== undefined) segConfig.c3 = custom3;

    const command = { on: true, seg: [segConfig], udpn: { send: false } };
    if (brightness !== undefined) command.bri = brightness;

    if (ipAddress) {
      const response = await fetch(`http://${ipAddress}/json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      if (!response.ok) throw new Error(`applyEffect failed: HTTP ${response.status}`);
    } else {
      this.sendCommandToWebSocket(command);
    }
  },

  /**
   * Initialize a newly connected WLED device
   * - Analyzes the device for custom effects
   * - Sets device to "All White" to override startup presets
   * @param {string} ipAddress - The IP address of the WLED instance
   * @returns {Promise<Object>} Analysis result
   */
  async initializeNewDevice(ipAddress) {
    // Only send All White once per device per day — reconnects on the same day
    // should not override whatever effect the user has running.
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const initKey = `wledInitDate_${ipAddress}`;
    const alreadyInitedToday = localStorage.getItem(initKey) === today;

    try {
      gconsole.log(`Initializing device at ${ipAddress}`, "wled-init");

      // Step 1: Analyze device for custom effects
      const analysis = await this.analyzeWledInstance(ipAddress);
      gconsole.log(`Device analyzed: ${analysis.effects.customCount} custom effects found`, "wled-init");

      // Step 2: Set device to "All White" only on first connect of the day
      // to override WLED's default yellow startup preset.
      if (!alreadyInitedToday) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const allWhiteCommand = {
          on: true,
          seg: [
            {
              col: [[255, 255, 255]],
              fx: 0, // Solid effect
            },
          ],
        };

        this.sendCommandToWebSocket(allWhiteCommand);
        localStorage.setItem(initKey, today);
        gconsole.log("Device initialized with All White preset", "wled-init");
      } else {
        gconsole.log("Device already initialized today, skipping All White", "wled-init");
      }

      return {
        success: true,
        analysis,
        initialized: !alreadyInitedToday
      };
    } catch (error) {
      gconsole.error(`Error initializing device: ${error.message}`, "wled-init-error");

      // Even if analysis fails, try to set All White (only on first connect of day)
      if (!alreadyInitedToday) {
        try {
          const allWhiteCommand = {
            on: true,
            seg: [
              {
                col: [[255, 255, 255]],
                fx: 0,
              },
            ],
          };
          this.sendCommandToWebSocket(allWhiteCommand);
          localStorage.setItem(initKey, today);
        } catch (fallbackError) {
          gconsole.error(`Fallback All White failed: ${fallbackError.message}`, "wled-init-error");
        }
      }

      throw error;
    }
  },
};

export default webservices;
