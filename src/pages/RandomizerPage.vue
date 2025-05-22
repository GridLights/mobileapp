<template>
  <q-page padding>
    <div class="no-text-select q-pa-md safe-header">
      <h1 class="text-h4 q-mb-md">Sol Spektrum</h1>
      <q-separator class="q-mb-lg"></q-separator>

      <!-- Master Brightness Slider -->
      <div class="slider-container">
        <div class="slider-label">Master Brightness</div>
        <div class="slider-values">
          <div>1</div>
          <div>100</div>
        </div>
        <q-slider
          v-model="masterBrightness"
          :min="1"
          :max="100"
          label
          label-always
          color="dark"
          dark
        />
      </div>

      <!-- Frequency Band Sliders -->
      <div class="frequency-sliders">
        <div
          v-for="(band, index) in frequencyBands"
          :key="index"
          class="band-slider"
        >
          <div class="percent-label">100 %</div>
          <q-slider
            v-model="band.value"
            :min="0"
            :max="100"
            label
            label-always
            vertical
            reverse
            dark
            color="dark"
            class="band-slider-control"
          />
          <div class="percent-label">0%</div>
          <div class="band-name">{{ band.name }}</div>
          <div class="band-hz">{{ band.range }}</div>
          <q-btn
            round
            flat
            size="md"
            color="black"
            class="band-toggle"
            :class="{ 'active-band': band.active }"
            @click="toggleBand(index)"
          />
        </div>
      </div>

      <!-- Range Controls -->
      <div class="range-controls">
        <div class="range-control">
          <div class="range-label">
            <span>1 %</span>
            <span>Brightness range</span>
            <span>100 %</span>
          </div>
          <q-slider
            v-model="brightnessRange"
            :min="1"
            :max="100"
            label
            label-always
            range
            color="dark"
            dark
          />
        </div>

        <div class="range-control">
          <div class="range-label">
            <span>1 s</span>
            <span>Frequency time</span>
            <span>90 s</span>
          </div>
          <q-slider
            v-model="frequencyTime"
            :min="1"
            :max="90"
            label
            label-always
            range
            color="dark"
            dark
          />
        </div>

        <div class="range-control">
          <div class="range-label">
            <span>1 min</span>
            <span>Sequence time</span>
            <span>60 min</span>
          </div>
          <q-slider
            v-model="sequenceTime"
            :min="1"
            :max="60"
            label
            label-always
            range
            color="dark"
            dark
          />
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="control-buttons">
        <q-btn flat dense size="lg" icon="play_arrow" class="control-btn" />
        <q-btn
          flat
          dense
          size="lg"
          label="00:00"
          class="control-btn timer-btn"
        />
        <q-btn flat dense size="lg" icon="stop" class="control-btn" />
      </div>

      <!-- Bottom Menu -->
      <div class="bottom-menu">
        <q-btn
          flat
          dense
          size="md"
          icon="person"
          label="Select subject"
          class="bottom-btn"
        />
        <q-btn
          flat
          dense
          size="md"
          icon="image"
          label="Remove background"
          class="bottom-btn"
        />
        <q-btn flat dense size="md" icon="grid_view" class="bottom-btn" />
        <q-btn flat dense size="md" icon="brush" class="bottom-btn" />
        <q-btn flat dense size="md" icon="more_horiz" class="bottom-btn" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";

export default {
  name: "SolSpektrumPage",
  setup() {
    const masterBrightness = ref(50);
    const frequencyBands = ref([
      { name: "Delta", range: "1-4 hz", value: 40, active: false },
      { name: "Theta", range: "4-8 hz", value: 20, active: false },
      { name: "Alpha", range: "8-12 hz", value: 35, active: false },
      { name: "Beta", range: "12-24 hz", value: 45, active: false },
      { name: "Gamma", range: "24-60 hz", value: 70, active: false },
    ]);
    const brightnessRange = ref(40);
    const frequencyTime = ref(30);
    const sequenceTime = ref(25);

    const toggleBand = (index) => {
      frequencyBands.value[index].active = !frequencyBands.value[index].active;
    };

    return {
      masterBrightness,
      frequencyBands,
      brightnessRange,
      frequencyTime,
      sequenceTime,
      toggleBand,
    };
  },
};
</script>

<style scoped>
.slider-container {
  margin-bottom: 2rem;
}

.slider-label {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.slider-values {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.frequency-sliders {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  height: 300px;
}

.band-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.band-slider-control {
  height: 200px;
  margin: 0.5rem 0;
}

.percent-label {
  font-size: 0.9rem;
}

.band-name {
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.band-hz {
  font-size: 0.9rem;
  color: #666;
}

.band-toggle {
  margin-top: 0.5rem;
  border: 2px solid #000;
}

.active-band {
  background-color: #e0e0e0;
}

.range-controls {
  margin-bottom: 2rem;
}

.range-control {
  margin-bottom: 1rem;
}

.range-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.control-btn {
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timer-btn {
  font-size: 1.5rem;
}

.bottom-menu {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
}

.bottom-btn {
  font-size: 0.8rem;
}
</style>
