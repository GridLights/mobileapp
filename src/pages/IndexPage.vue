//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// IndexPage.vue
//
// Home effects page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select index-page">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon -->
      <div class="header-icon left-icon">
        <img src="../assets/star.svg" alt="Star" width="24" height="24" />
      </div>

      <!-- Center Text -->
      <div class="header-title">EFFECTS</div>

      <!-- Right Icon -->
      <div class="header-icon right-icon" @click="goToSettings">
        <img src="../assets/gear.svg" alt="Settings" width="24" height="24" />
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area">
      <div class="content-padding">
        <!-- LED Grid -->
        <div class="led-grid-bg">
          <LedGrid :rows="ledRows" :powerOn="isOn" @power-changed="handlePowerChange" />
        </div>

        <!-- Controls Container -->
        <div class="controls-container">
          <!-- Frequency Slider -->
          <div class="control-section">
            <div class="control-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
              <span class="control-label">FREQUENCY</span>
              <span class="control-value">{{ freqValue }}Hz</span>
            </div>
            <div class="slider-container">
              <q-slider
                v-model="freqValue"
                :min="0"
                :max="60"
                color="black"
                track-color="grey-1"
                @update:model-value="onFreqInput"
              />
            </div>
          </div>

          <!-- Speed Slider -->
          <div class="control-section">
            <div class="control-header">
              <span class="control-label">SPEED</span>
              <span class="control-value">{{ speedValue }}%</span>
            </div>
            <div class="slider-container">
              <q-slider
                v-model="speedValue"
                :min="0"
                :max="100"
                color="black"
                track-color="grey-1"
                @update:model-value="onSpeedUpdate"
              />
            </div>
          </div>

          <!-- Effects Dropdown -->
          <div class="control-section">
            <div class="control-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
              <span class="control-label">EFFECTS</span>
            </div>
            <div class="dropdown-container">
              <select v-model="selectedEffect" class="effects-dropdown">
                <option value="">Select Effect</option>
                <option v-for="item in itemList" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Brightness Slider -->
          <div class="control-section">
            <div class="control-header">
              <span class="control-label">BRIGHTNESS</span>
              <span class="control-value">{{ sliderValue }}%</span>
            </div>
            <div class="slider-container">
              <q-slider
                v-model="sliderValue"
                :min="0"
                :max="100"
                color="black"
                track-color="grey-1"
                @update:model-value="onSliderUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import LedGrid from "src/components/LedGrid.vue";
import webservices from "../webservices";
import gconsole from "../utils/gconsole";

export default defineComponent({
  name: "IndexPage",

  components: {
    LedGrid,
  },

  data() {
    return {
      sliderValue: 50,
      isOn: false,
      isLiveSubscribed: false,
      timerValue: 0,
      freqValue: 50,
      speedValue: 50,
      selectedEffect: "",
      freqInterval: 10000, // 0 = 10s and 50 = 100ms
      ledRows: [
        ["#000000", "#000000", "#000000", "#000000"],
        ["#000000", "#000000", "#000000", "#000000", "#000000"],
        ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
        [
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
          "#000000",
        ],
        ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
        ["#000000", "#000000", "#000000", "#000000", "#000000"],
        ["#000000", "#000000", "#000000", "#000000"],
      ], // need this initial shape definition
      selectedItem: null,
      itemList: [
        { id: 1, label: "All White", effectName: "allWhite", effectId: null }
      ],
      ws: null, // Store the WebSocket connection
      wledState: {}, // Store the current WLED state
      ledColors: [], // Store the real-time LED colors
      messageCounter: 0, // Counter to track the number of messages
      lastProcessedTime: 0,
      intervalId: null,
      frequencyDebounceTimer: null, // Timer for debouncing
      brightnessDebounceTimer: null,
      speedDebounceTimer: null,
      currentCustomEffect: null, // Track the current custom effect
      wledUrl: "4.3.2.1", // local
      // wledUrl: "192.168.84.43", // remote
      // messageCoun
    };
  },

  watch: {
    selectedEffect(newVal) {
      // Trigger effect change when a new effect is selected from the dropdown
      if (newVal == null || newVal === "") return;
      try {
        let item = null;
        if (typeof newVal === "object") {
          item = newVal;
        } else {
          // treat as id (string or number)
          const id = typeof newVal === "string" ? parseInt(newVal, 10) : newVal;
          item = this.itemList.find((it) => it.id === id) || null;
        }
        if (!item) return;

        if (item.effectId != null) {
          this.setEffect(item.effectId);
        } else if (item.effectName === "allWhite") {
          this.setColor([255, 255, 255]);
        }
        // set selectedItem for consistency with MAIN’s highlighting logic
        this.selectedItem = item.id ?? null;
      } catch (e) {
        gconsole.error("Error applying selected effect: " + (e && e.message ? e.message : e), 'index-page');
      }
    },
    currentCustomEffect(newVal, oldVal) {
      gconsole.log(`*******  currentCustomEffect changed from ${oldVal} to ${newVal}`, 'index-page');
    },
  },

  mounted() {
    // Clear any interval that is running on refresh
    // if (this.intervalId !== null) {
    //   clearInterval(this.intervalId);
    // }

    // Store somewhere?
    //this.freqValue = 0;

    // Initialize WebSocket when the component is mounted
    //const wsUrl = "ws://192.168.84.43:80/ws"; // TODO: set this in the UI?
    var wsUrl = "ws://4.3.2.1:80/ws"; // Tavis

    // Load IP Address from local storage on page reload
    const savedIp = localStorage.getItem("ipAddress");
    if (savedIp) {
      wsUrl = `ws://${savedIp}:80/ws`;
      this.wledUrl = savedIp;
    }

    // Load custom effects for the current device
    this.loadCustomEffects();

    // Do not auto-subscribe on connect; we'll manage subscription based on power state
    webservices.initWebSocket(
      wsUrl,
      this.handleWebSocketMessage,
      this.handleLiveStreamData,
      this.onWebSocketConnected
    );

    // Subscribes to /live endpoint
    // webservices.subscribeToLiveStream();
  },

  beforeUnmount() {
    webservices.unsubscribeFromLiveStream();
    webservices.closeWebSocket();
  },

  methods: {
    // Load custom effects from localStorage and populate the itemList
    loadCustomEffects() {
      try {
        const analysis = webservices.getStoredAnalysis(this.wledUrl);
        
        if (analysis && analysis.effects.custom && analysis.effects.custom.length > 0) {
          console.log(`Loading ${analysis.effects.custom.length} custom effects`);
          
          // Map custom effects from WLED analysis
          // Filter out RSVD (reserved) effects
          let currentId = 1;
          const customEffectItems = analysis.effects.custom
            .filter(effect => {
              const name = effect.name || '';
              return !name.toUpperCase().includes('RSVD') && name.trim().length > 0;
            })
            .map(effect => ({
              id: currentId++,
              label: effect.name,
              effectName: effect.name,
              effectId: effect.id,
              isCustom: true
            }));
          
          // Add one "All White" entry at the end
          const allWhiteItem = { 
            id: currentId, 
            label: "All White", 
            effectName: "allWhite", 
            effectId: null 
          };
          
          // Combine: custom effects + All White
          const combinedList = [...customEffectItems, allWhiteItem];
          
          // Sort alphabetically by label
          this.itemList = combinedList.sort((a, b) => 
            a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
          );
          
          console.log(`Effect list populated with ${this.itemList.length} total effects (${customEffectItems.length} custom + 1 All White)`);
        } else {
          // No custom effects found - only show All White
          this.itemList = [
            { id: 1, label: "All White", effectName: "allWhite", effectId: null }
          ];
          console.log("No custom effects found, showing All White only");
        }
      } catch (error) {
        console.error("Error loading custom effects:", error);
      }
    },

    // Called when WebSocket connection is established
    async onWebSocketConnected() {
      console.log("WebSocket connected, initializing device...");
      
      try {
        // Initialize device: analyze for custom effects and set All White
        const result = await webservices.initializeNewDevice(this.wledUrl);
        
        if (result.success) {
          console.log("Device initialized successfully");
          
          // Reload custom effects if new ones were found
          if (result.analysis.effects.customCount > 0) {
            this.loadCustomEffects();
          }
        }
      } catch (error) {
        console.error("Error during device initialization:", error);
      }
      
      // Note: We don't auto-subscribe here, subscription is managed by power state
    },

    // Navigate to settings page
    goToSettings() {
      this.$router.push("/settings");
    },

    // Handle power button toggle from LedGrid
    handlePowerChange(newState) {
      gconsole.log("Power state changed: " + JSON.stringify(newState), 'index-page');
      this.setPower(newState);
    },

    updateLedRows(ledRows, colorList) {
      const needed = 37; // 4+5+6+7+6+5+4
      const sanitized = Array.isArray(colorList) ? colorList : [];

      // Build a list of exactly `needed` colors: take what we have; pad with "000000" if short
      const updatedColors = sanitized.slice(0, needed);
      while (updatedColors.length < needed) updatedColors.push("000000");

      let colorIndex = 0;
      const updatedLedRows = ledRows.map((row) =>
        row.map(() => updatedColors[colorIndex++])
      );

      return updatedLedRows;
    },

    // equivalency check for arrays where == is always false
    areArraysEquivalent(arr1, arr2) {
      // Check if lengths are equal
      if (arr1.length !== arr2.length) {
        return false;
      }

      // Iterate over each pair of inner arrays
      for (let i = 0; i < arr1.length; i++) {
        const innerArray1 = arr1[i];
        const innerArray2 = arr2[i];

        // Check if inner array lengths are equal
        if (innerArray1.length !== innerArray2.length) {
          return false;
        }

        // Compare elements within inner arrays
        for (let j = 0; j < innerArray1.length; j++) {
          if (innerArray1[j] !== innerArray2[j]) {
            return false;
          }
        }
      }

      // console.log("true it matches");
      // If all comparisons pass, the arrays are equivalent
      return true;
    },

    // called when websocket receives an inbound message
    handleWebSocketMessage(data) {
      gconsole.log("web state socket data: " + JSON.stringify(data.state), 'index-page');
      gconsole.log("web info socket data: " + JSON.stringify(data.info), 'index2-page');
      if (data?.state !== undefined) {
        this.wledState = data.state;
        if (typeof data.state.bri === "number") {
          this.sliderValue = Math.round((data.state.bri / 255) * 100);
        }
        if (typeof data.state.on === "boolean") {
          this.isOn = data.state.on;
          if (this.isOn && !this.isLiveSubscribed) {
            webservices.subscribeToLiveStream();
            this.isLiveSubscribed = true;
          } else if (!this.isOn && this.isLiveSubscribed) {
            webservices.unsubscribeFromLiveStream();
            this.isLiveSubscribed = false;
          }
        }
      }
    },

    // called when websocket receives an inbound message
    handleLiveStreamData(data) {
      const now = Date.now();
      if (!this.isOn) {
        return;
      }
      if (data?.leds !== undefined) {
        const processTime = 10;
        if (now - this.lastProcessedTime >= processTime) {
          this.lastProcessedTime = now;
          let newLedRows = this.updateLedRows(this.ledRows, data.leds);

          // Ensure each color has a "#" prefix
          newLedRows = newLedRows.map((row) => row.map((color) => `#${color}`));

          if (this.areArraysEquivalent(newLedRows, this.ledRows) === false) {
            this.ledRows = newLedRows;
          }
        }
      }
    },

    // Explicitly set power state and manage live updates subscription
    setPower(turnOn) {
      const command = { on: !!turnOn };
      webservices.sendCommandToWebSocket(command);

      // Update local state immediately for responsiveness
      this.isOn = !!turnOn;

      if (this.isOn && !this.isLiveSubscribed) {
        webservices.subscribeToLiveStream();
        this.isLiveSubscribed = true;
      } else if (!this.isOn && this.isLiveSubscribed) {
        webservices.unsubscribeFromLiveStream();
        this.isLiveSubscribed = false;
      }
    },

    //power button handler (kept for compatibility; now delegates to setPower)
    toggleButton() {
      const lightOn = !!this.wledState.on;
      this.setPower(!lightOn);
    },

    logSliderValue() {
      gconsole.log("slider: " + this.sliderValue, 'index-page');
    },

    setStrobe() {
      gconsole.log("strobing: ", 'index-page');

      const data = {
        tt: 0,
        // on: true,
        seg: [
          {
            fx: 23,
            sx: 255,
            // ix: 255,
            // // tt: 0,
            // ix: 255,
            // pal: 0,
          },
        ],
      };
      webservices.sendCommandToWebSocket(data);
    },

    setBrightness(bri) {
      // `bri` is a UI percent value (0-100). Convert to WLED 0-255 range.
      const wledBri = Math.round((bri / 100) * 255);
      const data = {
        on: wledBri > 0,
        bri: wledBri,
        seg: { bri: wledBri },
      };

      webservices.sendCommandToWebSocket(data);
    },

    onSliderUpdate() {
      // Clear the existing debounce timer
      clearTimeout(this.brightnessDebounceTimer);

      // Set a new debounce timer
      this.brightnessDebounceTimer = setTimeout(() => {
        gconsole.log("Slider Value: " + this.sliderValue, 'index-page');

        this.setBrightness(this.sliderValue);
      }, 1000); // Delay of 1 second
    },

    // Temporary mapping of list item click to action/effect
    onListItemClick(itemNumber, effectName, effectId) {
      gconsole.log("Clicked on item: " + JSON.stringify(itemNumber), 'index-page');

      // If an interval is already running, clear it first
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }

      this.currentCustomEffect = null;

      // Could probably pass the click function as a parameter/value in the itemList
      // For now, just do it this way
      if (effectId) {
        this.setEffect(effectId);
      } else if (effectName === "allWhite") {
        this.setColor([255, 255, 255]);
      }

      // set the selected item for highlighting
      this.selectedItem = itemNumber;
    },

    //timer input field handler
    onTimerInput() {
      if (this.timerValue > 50) {
        this.timerValue = 50;
      }
      if (this.timerValue < 0) {
        this.timerValue = 0;
      }
      gconsole.log("Timer Value: " + this.timerValue, 'index-page');
    },

    //frequency input field handler
    onFreqInput() {
      if (this.freqValue > 60) {
        this.freqValue = 60;
      }
      if (this.freqValue < 0) {
        this.freqValue = 0;
      }
      // Clear the existing debounce timer
      clearTimeout(this.frequencyDebounceTimer);

      // Set a new debounce timer
      this.frequencyDebounceTimer = setTimeout(() => {
        gconsole.log("Frequency Value: " + this.freqValue, 'index-page');

        this.setFrequency(this.freqValue);

        // const msValue = this.calculateMs(this.freqValue);
        // this.freqInterval = msValue;
        // console.log("Frequency Interval: " + this.freqInterval);
        // this.restartCustomEffectWithNewInterval();
      }, 1000); // Delay of 1 second
    },

    onSpeedUpdate() {
      // clamp
      if (this.speedValue > 100) this.speedValue = 100;
      if (this.speedValue < 0) this.speedValue = 0;

      clearTimeout(this.speedDebounceTimer);
      this.speedDebounceTimer = setTimeout(() => {
        gconsole.log("Speed Value: " + this.speedValue, 'index-page');
        this.setSpeed(this.speedValue);
      }, 500); // small debounce
    },

    // Calculate ms value based on freqValue
    calculateMs(freqValue) {
      const minFreq = 0; // Min frequency value
      const maxFreq = 60; // Max frequency value
      const minMs = 10000; // Corresponding ms value for minFreq
      const maxMs = 100; // Corresponding ms value for maxFreq

      // Linear interpolation formula
      return (
        minMs + ((maxMs - minMs) / (maxFreq - minFreq)) * (freqValue - minFreq)
      );
    },

    async setLedRange(startLed, stopLed, color) {
      // const url = "http://4.3.2.1/json/state"; // Replace with your WLED IP
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

      webservices.sendCommandToWebSocket(command);
    },

    setAllLedsToBrightness(brightness) {
      const on = brightness !== 0;
      const command = {
        on,
        seg: { bri: brightness },
      };

      webservices.sendCommandToWebSocket(command);
    },

    turnOffAndOn(delayMs, repetitions) {
      let delay = 0;
      for (let i = 0; i < repetitions; i++) {
        setTimeout(() => this.toggleButton(), delay);
        delay += delayMs;
      }
    },

    setColor(color) {
      const data = {
        on: true,
        seg: [
          {
            col: [color],
            fx: 0,
          },
        ],
      };
      webservices.sendCommandToWebSocket(data);
    },

    setEffect(effectId) {
      // Map frequency to index value (0-255)
      const scaledFreqValue = Math.round((this.freqValue / 60) * 255);
      const data = { seg: { fx: effectId, ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },

    setSpeed(speedVal) {
      // Map 0-100% speed to 0-255 WLED scale
      const sx = Math.round((speedVal / 100) * 255);
      const data = { seg: { sx } };
      webservices.sendCommandToWebSocket(data);
    },

    setFrequency(frequencyVal) {
      // Map the selected frequency (0-60 Hz) to the 0-255 scale
      const scaledFreqValue = Math.round((frequencyVal / 60) * 255);
      const data = { seg: { ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },
  },
});
</script>

<!-- Styles moved to src/css/pages/IndexPage.scss -->
