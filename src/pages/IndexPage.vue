<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon -->
      <div class="header-icon left-icon">
        <img src="../assets/star.svg" alt="Star" width="24" height="24" />
      </div>

      <!-- Center Text -->
      <div class="header-title">EFFECTS</div>

      <!-- Right Icon -->
      <div class="header-icon right-icon">
        <img src="../assets/gear.svg" alt="Settings" width="24" height="24" />
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area">
      <div class="content-padding">
        <!-- LED Grid -->
        <div class="led-grid-bg">
          <LedGrid :rows="ledRows" @power-changed="handlePowerChange" />
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
              <input
                type="range"
                v-model="freqValue"
                min="0"
                max="60"
                class="slider"
                @input="onFreqInput"
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
              <input
                type="range"
                v-model="speedValue"
                min="0"
                max="100"
                class="slider"
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
                <option v-for="item in itemList" :key="item.id" :value="item">
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
              <input
                type="range"
                v-model="sliderValue"
                min="0"
                max="100"
                class="slider"
                @input="onSliderUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, effect } from "vue";
import LedGrid from "src/components/LedGrid.vue";
import webservices from "../webservices";
// import webSocketManager from "../utils/websocketmanager";
import { diamondSpin, ben } from "../effects";

export default defineComponent({
  name: "IndexPage",

  components: {
    LedGrid,
  },

  data() {
    return {
      sliderValue: 50,
      isOn: false,
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
        { id: 1, label: "Ben", effectName: "ben", effectId: 191 },
        {
          id: 2,
          label: "Diamond Spin",
          effectName: "diamondSpin",
          effectId: 189,
        },
        {
          id: 3,
          label: "Drunk Diamond Spin",
          effectName: "drunkDiamondSpin",
          effectId: 190,
        },
        {
          id: 4,
          label: "Square Spin",
          effectName: "squareSpin",
          effectId: 187,
        },
        { id: 5, label: "Crazy Spin", effectName: "crazySpin", effectId: 188 },
        { id: 6, label: "All White", effectName: "allWhite", effectId: null },
        { id: 7, label: "All White", effectName: "allWhite", effectId: null },
        { id: 8, label: "All White", effectName: "allWhite", effectId: null },
        { id: 9, label: "All White", effectName: "allWhite", effectId: null },
        { id: 10, label: "All White", effectName: "allWhite", effectId: null },
      ],
      ws: null, // Store the WebSocket connection
      wledState: {}, // Store the current WLED state
      ledColors: [], // Store the real-time LED colors
      messageCounter: 0, // Counter to track the number of messages
      lastProcessedTime: 0,
      intervalId: null,
      frequencyDebounceTimer: null, // Timer for debouncing
      brightnessDebounceTimer: null,
      currentCustomEffect: null, // Track the current custom effect
      wledUrl: "4.3.2.1", // local
      // wledUrl: "192.168.84.43", // remote
      // messageCoun
    };
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
    }

    webservices.initWebSocket(
      wsUrl,
      this.handleWebSocketMessage,
      this.handleLiveStreamData,
      webservices.subscribeToLiveStream
    );

    // Subscribes to /live endpoint
    // webservices.subscribeToLiveStream();
  },

  beforeUnmount() {
    webservices.unsubscribeFromLiveStream();
    webservices.closeWebSocket();
  },

  methods: {
    // Handle power button toggle from LedGrid
    handlePowerChange(newState) {
      console.log("Power state changed:", newState);
      this.toggleButton();
    },

    updateLedRows(ledRows, colorList) {
      if (colorList.length < 38) {
        console.error("Color list must contain at least 38 colors.");
        return;
      }

      // Flatten the ledRows into a single array and map the first 38 elements
      let updatedColors = colorList.slice(0, 38); // Take only the first 38 colors

      let colorIndex = 0; // Track position in the updatedColors array
      var all_off = true;
      let updatedLedRows = ledRows.map((row) => {
        return row.map(() => {
          let color = updatedColors[colorIndex]; // Use the next color
          colorIndex++; // Increment the index
          if (color != "000000") {
            all_off = false;
          }
          return color;
        });
      });

      if (all_off == false) {
        return updatedLedRows;
      }

      return [];
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
      const now = Date.now();

      console.log("web socket dat");
      console.log(data);

      if (data?.state != undefined) {
        // State message incoming
        this.wledState = data.state;
        this.sliderValue = data.bri - 255;
      }
    },

    // called when websocket receives an inbound message
    handleLiveStreamData(data) {
      const now = Date.now();

      console.log("web socket dat");
      console.log(data);

      if (data?.leds != undefined) {
        // if from the live stream, only process every X ms
        const processTime = 10;
        if (now - this.lastProcessedTime >= processTime) {
          this.lastProcessedTime = now;

          // Map the /live data to the UI fixture
          let newLedRows = this.updateLedRows(this.ledRows, data.leds);

          if (!newLedRows.length) {
            // strobing, do not update
            return;
          }

          // Ensure each color has a "#" prefix
          newLedRows = newLedRows.map((row) => row.map((color) => `#${color}`));

          if (this.areArraysEquivalent(newLedRows, this.ledRows) === false) {
            // Update the ledRows value (used by the UI fixture)
            this.ledRows = newLedRows;
          }
        }
      }
    },

    //power button handler
    toggleButton() {
      var lightOn = this.wledState.on;

      // Command to toggle the light
      const command = { on: !lightOn };
      webservices.sendCommandToWebSocket(command);
      console.log(`Toggled light to: ${!lightOn}`);
    },

    logSliderValue() {
      console.log("slider: " + this.sliderValue);
    },

    setStrobe() {
      console.log("strobing: ");

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
      const absBri = Math.abs(bri - 255);
      // var level = Math.floor(((100 - this.sliderValue) / 100) * 255);
      const data = {
        on: true,
        bri: absBri,
        seg: { bri: absBri },
      };

      webservices.sendCommandToWebSocket(data);
    },

    onSliderUpdate() {
      // Clear the existing debounce timer
      clearTimeout(this.brightnessDebounceTimer);

      // Set a new debounce timer
      this.brightnessDebounceTimer = setTimeout(() => {
        console.log("Slider Value: " + this.sliderValue);

        this.setBrightness(this.sliderValue);
        // console.log("Frequency Interval: " + this.freqInterval);
        // this.restartCustomEffectWithNewInterval();
      }, 1000); // Delay of 1 second
    },

    // Temporary mapping of list item click to action/effect
    onListItemClick(itemNumber, effectName, effectId) {
      console.log("Clicked on item:", itemNumber);

      // If an interval is already running, clear it first
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }

      this.currentCustomEffect = null;

      // Could probably pass the click function as a parameter/value in the itemList
      // For now, just do it this way
      if (effectId) {
        this.setEffect(effectId);
      } else if (effectName == "allWhite") {
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
      console.log("Timer Value: " + this.timerValue);
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
        console.log("Frequency Value: " + this.freqValue);

        this.setFrequency(this.freqValue);

        // const msValue = this.calculateMs(this.freqValue);
        // this.freqInterval = msValue;
        // console.log("Frequency Interval: " + this.freqInterval);
        // this.restartCustomEffectWithNewInterval();
      }, 1000); // Delay of 1 second
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
      let on;
      if (brightness === 0) {
        on = false;
      } else {
        on = true;
      }
      const command = {
        on: on,
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
      const scaledFreqValue = Math.round((this.freqValue / 50) * 255);
      const data = { seg: { fx: effectId, ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },

    setFrequency(frequencyVal) {
      // Map the selected frequency (0-50 Hz) to the 0-255 scale
      const scaledFreqValue = Math.round((frequencyVal / 60) * 255);
      const data = { seg: { ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },
  },
});
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px); /* Account for bottom nav */
  overflow: hidden;
  position: relative;
}

.content-padding {
  padding: 0 20px 0px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.led-grid-bg {
  display: flex;
  width: 100%;
  background-color: #e5e5e5;
  border-radius: 4px;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 15px;
}

.controls-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-section {
  background-color: #e5e5e5;
  border-radius: 8px;
  padding: 12px 16px;
}

.control-section:last-child {
  margin-bottom: 5px;
}

.control-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  margin-top: 0px;
}

.control-header svg {
  margin-right: 8px;
  color: #666;
  flex-shrink: 0;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
  flex-grow: 1;
}

.control-value {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-left: auto;
}

.slider-container {
  position: relative;
  border: 0px solid #888;
  border-radius: 4px;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 10px;
  padding-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider {
  width: 100%;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.dropdown-container {
  position: relative;
}

.effects-dropdown {
  width: 100%;
  margin-top: 10px;
  padding: 5px 12px;
  background-color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.effects-dropdown:focus {
  outline: none;
}

/* disabled list items */
.disabled-item {
  opacity: 0.5;
  pointer-events: none;
}

/* highlighted selected item */
.selected-item {
  background-color: #555;
}
</style>
