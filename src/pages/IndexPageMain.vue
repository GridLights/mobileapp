//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// IndexPage.vue // // Home page with light controls // // Author: Tavis Hord -
tavis@sideburn.com // Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select flex flex-col items-center">
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
            :max="255"
            style="height: 170px"
            :disable="!this.wledState.on"
            @update:model-value="onSliderUpdate"
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
              wledState.on
                ? onListItemClick(item.id, item.effectName, item.effectId)
                : null
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
// import webSocketManager from "../utils/websocketmanager";

export default defineComponent({
  name: "IndexPage",

  components: {
    LedGrid,
  },

  data() {
    return {
      sliderValue: null,
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
    this.freqValue = 0;

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

        if (
          analysis &&
          analysis.effects.custom &&
          analysis.effects.custom.length > 0
        ) {
          console.log(
            `Loading ${analysis.effects.custom.length} custom effects`
          );

          // Map custom effects from WLED analysis (only actual custom effects from device)
          // Filter out RSVD (reserved) effects
          let currentId = 1;
          const customEffectItems = analysis.effects.custom
            .filter(effect => {
              const name = effect.name || '';
              return !name.toUpperCase().includes('RSVD') && name.trim().length > 0;
            })
            .map((effect) => ({
              id: currentId++,
              label: effect.name,
              effectName: effect.name,
              effectId: effect.id,
              isCustom: true,
            }));

          // Add one "All White" entry at the end
          const allWhiteItem = {
            id: currentId,
            label: "All White",
            effectName: "allWhite",
            effectId: null,
          };

          // Combine: only custom effects from WLED + All White
          const combinedList = [...customEffectItems, allWhiteItem];
          
          // Sort alphabetically by label
          this.itemList = combinedList.sort((a, b) => 
            a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
          );

          console.log(
            `Effect list populated with ${this.itemList.length} total effects (${customEffectItems.length} custom + 1 All White)`
          );
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

      // Subscribe to live stream
      webservices.subscribeToLiveStream();
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
      // if (data?.leds != undefined) {
      //   console.log("live stream update");
      //   // if from the live stream, only process every X ms
      //   const processTime = 100;
      //   if (now - this.lastProcessedTime >= processTime) {
      //     this.lastProcessedTime = now;

      //     // Map the /live data to the UI fixture
      //     let newLedRows = this.updateLedRows(this.ledRows, data.info.leds);

      //     if (!newLedRows.length) {
      //       // strobing, do not update
      //       return
      //     }

      //     // Ensure each color has a "#" prefix
      //     newLedRows = newLedRows.map((row) => row.map((color) => `#${color}`));

      //     if (this.areArraysEquivalent(newLedRows, this.ledRows) === false) {
      //       // Update the ledRows value (used by the UI fixture)
      //       this.ledRows = newLedRows;
      //     }
      //   }
      // }
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

      // const data1 = {
      //   // tt: 0,
      //   on: true,
      //   // seg: [
      //   //   {
      //   //     fx: 1,
      //   //     sx: 255,
      //   //     // // tt: 0,
      //   //     // ix: 255,
      //   //     // pal: 0,
      //   //   },
      //   // ],
      // };

      // for (let i = 0; i < 5000; i++) {
      //   const num1 = i % 2;
      //   const dataToSend = num1 === 0 ? data : data1;

      //   // Send the command and schedule the next one
      //   webservices.sendCommandToWebSocket(dataToSend);
      //   setTimeout(() => {
      //     // Do nothing, just a delay
      //   }, 500); // Adjust the delay time (in milliseconds) as needed
      // }
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
      // if (["ben", "diamondSpin"].includes(effectName)) {
      //   this.setCustomEffect(effectName);
      // } else if (effectName === "colorWaves") {
      //   this.setEffect(189);
      // } else if (effectName === "allWhite") {
      //   this.setColor([255, 255, 255]);
      // } else if (effectName === "pauseEffect") {
      //   console.log("interval cleared");
      // } else if (effectName === "strobe") {
      //   this.setStrobe();
      // }

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
      const scaledFreqValue = Math.round((this.freqValue / 50) * 255);
      const data = { seg: { fx: effectId, ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },

    setFrequency(frequencyVal) {
      // Map the selected frequency (0-50 Hz) to the 0-255 scale
      const scaledFreqValue = Math.round((frequencyVal / 50) * 255);
      const data = { seg: { ix: scaledFreqValue } };
      webservices.sendCommandToWebSocket(data);
    },

    // restartCustomEffectWithNewInterval() {
    //   if (this.currentCustomEffect) {
    //     // Cancel current interval, restart with new frequency value
    //     if (this.intervalId !== null) {
    //       clearInterval(this.intervalId);
    //     }
    //     this.setCustomEffect(this.currentCustomEffect);
    //   }
    // },

    // setCustomEffect(effectName) {
    //   console.log(effectName);

    //   // Define frames for the animation
    //   let frames;
    //   if (effectName === "ben") {
    //     frames = ben.frames;
    //   } else if (effectName === "diamondSpin") {
    //     frames = diamondSpin.frames;
    //   }

    //   console.log(frames);

    //   if (frames) {
    //     this.currentCustomEffect = effectName;

    //     // Initialize the current frame
    //     let currentFrame = 0;
    //     // Set an interval to cycle through the frames
    //     this.intervalId = setInterval(() => {
    //       // Send the current frame to the WLED WebSocket
    //       webservices.sendCommandToWebSocket({ seg: frames[currentFrame].seg });
    //       console.log("Frame sent:", frames[currentFrame].seg);
    //       // console.log("filled", this.fillGaps(frames[currentFrame].seg));
    //       // Switch to the next frame
    //       currentFrame = (currentFrame + 1) % frames.length;
    //       // currentFrame = 1;
    //     }, this.freqInterval); // Update every X second
    //   }
    // },
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
