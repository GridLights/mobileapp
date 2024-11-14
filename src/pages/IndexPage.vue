//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// IndexPage.vue
//
// Home page with light controls
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
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
          :icon="isOn ? 'lightbulb' : 'lightbulb_outline'"
          :color="isOn ? 'orange' : 'grey'"
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
            style="height: 180px"
            @update:model-value="updateLedColors"
            :disable="!isOn"
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
            v-for="n in 10"
            :key="n"
            clickable
            @click="isOn ? onListItemClick(n) : null"
            :ripple="false"
            :class="{
              'selected-item': selectedItem === n,
              'disabled-item': !isOn,
            }"
          >
            <q-item-section>Shape {{ n }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import LedGrid from "src/components/LedGrid.vue";

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
      ],
      selectedItem: null,
    };
  },

  mounted() {
    // init all LEDs to black on load
    this.setAllLeds(0);
  },

  methods: {
    //power button handler
    toggleButton() {
      this.isOn = !this.isOn;

      //  set all LEDs to black and disable the slider
      if (!this.isOn) {
        this.setAllLeds(0);
      } else {
        // set LED color to current slider value when turned on
        this.setAllLeds(this.sliderValue);
      }

      console.log("power button: " + this.isOn);
    },

    logSliderValue() {
      console.log("slider: " + this.sliderValue);
    },

    //based on passed in value, pick an LED color
    setAllLeds(value) {
      const clampedValue = Math.max(0, Math.min(value, 100));

      // convert to hex color
      const colorScale = [
        "#000000", // 0 (black)
        "#FF0000", // 20 (red)
        "#FFFF00", // 40 (yellow)
        "#00FF00", // 60 (green)
        "#00FFFF", // 80 (cyan)
        "#FFFFFF", // 100 (white)
      ];

      const index = Math.floor((clampedValue / 100) * (colorScale.length - 1));

      this.ledRows = this.ledRows.map((row) =>
        row.map(() => colorScale[index])
      );
    },

    //set all LEDs to a color based on slider value
    updateLedColors() {
      const colorScale = [
        "#FF0000", //red
        "#FF7F00",
        "#FFFF00", //yellow
        "#7FFF00",
        "#00FF00", //green
        "#00FF7F",
        "#00FFFF", //cyan
        "#007FFF",
        "#0000FF",
        "#7F00FF",
        "#FF00FF",
      ];

      const index = Math.floor(
        (this.sliderValue / 100) * (colorScale.length - 1)
      );

      this.ledRows = this.ledRows.map((row) =>
        row.map(() => colorScale[index])
      );
    },

    //spray all LEDs with random colors
    generateRandomPattern() {
      this.ledRows = this.ledRows.map((row) =>
        row.map(
          () =>
            `#${Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0")}`
        )
      );
    },

    //set a random pattern of LED colors when list item is clicked
    onListItemClick(itemNumber) {
      console.log("Clicked on item:", itemNumber);

      // generate random colors for each LED when an item is clicked
      this.generateRandomPattern();

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
      console.log("Frequency Value: " + this.freqValue);
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
  padding-top: 10px;
  padding-bottom: 10px;
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
