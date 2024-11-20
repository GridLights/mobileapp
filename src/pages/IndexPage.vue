//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// IndexPage.vue // // Home page with light controls // // Author: Tavis Hord -
tavis@sideburn.com // Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="flex flex-col items-center">
    <div class="grid-container">
      <!-- row 1 -->
      <div
        class="grid-item col-2 flex justify-center items-center button-container"
      >
        <q-btn
          :ripple="false"
          :icon="this.wledState.on ? 'lightbulb' : 'lightbulb_outline'"
          :color="this.wledState.on ? 'orange' : 'grey'"
          @click="toggleButton"
          round
        />
      </div>

      <div class="grid-item col-3">
        <LedGrid :rows="ledRows" />
      </div>

      <div class="grid-item col-1 flex justify-center items-center">
        <div class="slider-container">
          <q-slider
            v-model="sliderValue"
            vertical
            :min="0"
            :max="100"
            style="height: 170px"
            :disable="!this.wledState.on"
          />
        </div>
      </div>

      <!-- row 2 -->
      <div class="grid-item col-span-3 input-container">
        <div class="flex justify-between">
          <q-input
            class="q-mr-sm"
            v-model="timerValue"
            type="number"
            min="0"
            max="50"
            filled
            style="width: 171px"
            @update:model-value="onTimerInput"
          >
            <template v-slot:prepend>
              <q-icon name="timer" />
            </template>
          </q-input>

          <q-input
            v-model="freqValue"
            type="number"
            filled
            min="0"
            max="50"
            style="width: 171px"
            @update:model-value="onFreqInput"
          >
            <template v-slot:prepend>
              <q-icon name="timeline" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="grid-item col-span-3 list-container">
        <q-list
          bordered
          class="rounded-borders"
          style="width: 100%; max-height: 200px; overflow-y: auto"
        >
          <q-item
            v-for="(item, index) in itemList"
            :key="index"
            clickable
            @click="
              wledState.on ? onListItemClick(item.id, item.effectName) : null
            "
            :ripple="false"
            :class="{
              'selected-item': selectedItem === item.id,
              'disabled-item': !wledState.on,
            }"
          >
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, effect } from "vue";
import LedGrid from "src/components/LedGrid.vue";
import webservices from "../webservices";
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
      freqValue: 0,
      freqInterval: 10000, // 0 = 10s and 50 = 100ms
      ledRows: [
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"],
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#fcfcfc"],
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ff00ff", "#fcfcfc"],
        [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ff00ff",
          "#fcfcfc",
          "#ff0000",
          "#ffccff",
        ],
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#ff00ff", "#fcfcfc"],
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#fcfcfc"],
        ["#ff0000", "#00ff00", "#0000ff", "#ff00ff"],
      ], // need this initial shape definition
      selectedItem: null,
      itemList: [
        { id: 1, label: "Ben", effectName: "ben" },
        { id: 2, label: "Diamond Spin", effectName: "diamondSpin" },
        { id: 3, label: "Colorwaves", effectName: "colorWaves" },
        { id: 4, label: "All White", effectName: "allWhite" },
        { id: 5, label: "Stop Effect", effectName: "pauseEffect" },
        { id: 6, label: "Shape 6", effectName: "allWhite" },
        { id: 7, label: "Shape 7", effectName: "allWhite" },
        { id: 8, label: "Shape 8", effectName: "allWhite" },
        { id: 9, label: "Shape 9", effectName: "allWhite" },
        { id: 10, label: "Shape 10", effectName: "allWhite" },
      ],
      ws: null, // Store the WebSocket connection
      wledState: {}, // Store the current WLED state
      ledColors: [], // Store the real-time LED colors
      messageCounter: 0, // Counter to track the number of messages
      lastProcessedTime: 0,
      intervalId: null,
      frequencyDebounceTimer: null, // Timer for debouncing
      currentCustomEffect: null, // Track the current custom effect
      // messageCoun
    };
  },

  mounted() {
    // Clear any interval that is running on refresh
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    // Store somewhere?
    this.freqValue = 0;

    // Initialize WebSocket when the component is mounted
    const wsUrl = "ws://192.168.84.43:80/ws"; // TODO: set this in the UI?
    webservices.initWebSocket(
      wsUrl,
      this.handleWebSocketMessage,
      webservices.subscribeToLiveStream
    );

    // Subscribes to /live endpoint
    webservices.subscribeToLiveStream();
  },

  beforeUnmount() {
    webservices.unsubscribeFromLiveStream();
    webservices.closeWebSocket();
  },

  methods: {
    updateLedRows(ledRows, colorList) {
      if (colorList.length < 38) {
        console.error("Color list must contain at least 38 colors.");
        return;
      }

      // Flatten the ledRows into a single array and map the first 38 elements
      let updatedColors = colorList.slice(0, 38); // Take only the first 38 colors

      let colorIndex = 0; // Track position in the updatedColors array
      let updatedLedRows = ledRows.map((row) => {
        return row.map(() => {
          let color = updatedColors[colorIndex]; // Use the next color
          colorIndex++; // Increment the index
          return color;
        });
      });

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
      const now = Date.now();

      if (data.state != undefined) {
        // State message incoming
        this.wledState = data.state;
      }
      if (data.leds != undefined) {
        // if from the live stream, only process every X ms
        const processTime = 100;
        if (now - this.lastProcessedTime >= processTime) {
          this.lastProcessedTime = now;

          // Map the /live data to the UI fixture
          let newLedRows = this.updateLedRows(this.ledRows, data.leds);

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

    setBrightness() {
      var level = Math.floor(((100 - this.sliderValue) / 100) * 255);

      const data = {
        on: true,
        seg: { bri: level },
      };

      webservices.sendCommandToWebSocket(data);
    },

    // Temporary mapping of list item click to action/effect
    onListItemClick(itemNumber, effectName) {
      console.log("Clicked on item:", itemNumber);

      // If an interval is already running, clear it first
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }

      this.currentCustomEffect = null;

      // Could probably pass the click function as a parameter/value in the itemList
      // For now, just do it this way
      if (["ben", "diamondSpin"].includes(effectName)) {
        this.setCustomEffect(effectName);
      } else if (effectName === "colorWaves") {
        this.setEffect(67);
      } else if (effectName === "allWhite") {
        this.setColor([255, 255, 255]);
      } else if (effectName === "pauseEffect") {
        console.log("interval cleared");
      }

      // if (itemNumber === 6) {
      //   this.diamondSpin();
      // }

      // <button @click="setLedRange(1, 10, [0, 255, 0])">Set LED Range</button>
      // <button @click="repeatProgressiveTrail(5, 125, 8)">Start Trail Effect</button>

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
      if (this.freqValue > 50) {
        this.freqValue = 50;
      }
      if (this.freqValue < 0) {
        this.freqValue = 0;
      }
      // Clear the existing debounce timer
      clearTimeout(this.frequencyDebounceTimer);

      // Set a new debounce timer
      this.frequencyDebounceTimer = setTimeout(() => {
        console.log("Frequency Value: " + this.freqValue);
        const msValue = this.calculateMs(this.freqValue);
        this.freqInterval = msValue;
        console.log("Frequency Interval: " + this.freqInterval);
        this.restartCustomEffectWithNewInterval();
      }, 1000); // Delay of 1 second
    },

    // Calculate ms value based on freqValue
    calculateMs(freqValue) {
      const minFreq = 0; // Min frequency value
      const maxFreq = 50; // Max frequency value
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
      const data = { seg: { fx: effectId } };
      webservices.sendCommandToWebSocket(data);
    },

    restartCustomEffectWithNewInterval() {
      if (this.currentCustomEffect) {
        // Cancel current interval, restart with new frequency value
        if (this.intervalId !== null) {
          clearInterval(this.intervalId);
        }
        this.setCustomEffect(this.currentCustomEffect);
      }
    },

    setCustomEffect(effectName) {
      console.log(effectName);

      // Define frames for the animation
      let frames;
      if (effectName === "ben") {
        frames = ben.frames;
      } else if (effectName === "diamondSpin") {
        frames = diamondSpin.frames;
      }

      console.log(frames);

      if (frames) {
        this.currentCustomEffect = effectName;

        // Initialize the current frame
        let currentFrame = 0;
        // Set an interval to cycle through the frames
        this.intervalId = setInterval(() => {
          // Send the current frame to the WLED WebSocket
          webservices.sendCommandToWebSocket({ seg: frames[currentFrame].seg });
          console.log("Frame sent:", frames[currentFrame].seg);
          // console.log("filled", this.fillGaps(frames[currentFrame].seg));
          // Switch to the next frame
          currentFrame = (currentFrame + 1) % frames.length;
          // currentFrame = 1;
        }, this.freqInterval); // Update every X second
      }
    },
  },
});
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 3fr 1fr 2fr;
  grid-template-rows: auto auto;
  gap: 10px;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.col-span-3 {
  grid-column: span 3;
}

.slider-container {
  border: 1px solid #888;
  border-radius: 4px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 15px;
  padding-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-container {
  border: 1px solid #888;
  border-radius: 4px;
  padding: 10px;
}

.input-container {
  width: 100%;
}

.list-container {
  width: 100%;
}

/* disabled list items */
.disabled-item {
  opacity: 0.5; /* disabled */
  pointer-events: none; /* prevent interaction */
}

/* hilighted selected item */
.selected-item {
  background-color: #555; /* bg color for highlighted item */
}
</style>
