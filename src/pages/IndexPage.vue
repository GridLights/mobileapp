<template>
  <q-page class="flex flex-col items-center q-pa-md">
    <div class="grid-container">
      <!-- Row 1 -->
      <div class="grid-item col-3">
        <q-img
          src="https://placehold.co/200x200"
          style="width: 100%; height: auto; max-width: 200px"
        />
      </div>

      <div class="grid-item col-1 flex justify-center items-center">
        <q-slider
          v-model="sliderValue"
          vertical
          :min="0"
          :max="100"
          style="height: 150px"
          @update:model-value="logSliderValue"
        />
      </div>

      <div class="grid-item col-2 flex justify-center items-center">
        <q-btn
          :icon="isOn ? 'lightbulb' : 'lightbulb_outline'"
          :color="isOn ? 'orange' : 'grey'"
          @click="toggleButton"
          round
        />
      </div>

      <!-- Row 2 -->
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
            @click="onItemClick(n)"
            v-ripple
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

export default defineComponent({
  name: "IndexPage",

  data() {
    return {
      sliderValue: 50,
      isOn: false,
      timerValue: 0,
      freqValue: 0,
    };
  },

  methods: {
    toggleButton() {
      this.isOn = !this.isOn;
      console.log("button: " + this.isOn);
    },

    logSliderValue() {
      console.log("slider: " + this.sliderValue);
    },

    onTimerInput() {
      console.log("Timer Value: " + this.timerValue);
    },

    onFreqInput() {
      console.log("Frequency Value: " + this.freqValue);
    },

    onItemClick(itemNumber) {
      console.log("Clicked on item:", itemNumber);
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

.input-container {
  width: 100%;
}

.list-container {
  width: 100%;
}
</style>
