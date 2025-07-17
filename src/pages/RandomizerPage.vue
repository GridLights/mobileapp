//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// RandomizerPage.vue
//
// Randomizer effects page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Center Text -->
      <div class="header-title">RANDOMIZER</div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-randomizer">
      <!-- content goes here wrapped in content-padding divs -->
      <div class="content-padding">
        <!-- Tap to Start / Timer Section -->
        <div class="start-timer-section">
          <div v-if="!isRunning" class="tap-to-start" @click="startRandomizer">
            Tap To Start
          </div>
          <div v-else class="timer-display">
            {{ formatTime(currentTime) }}
          </div>
        </div>

        <!-- Wave Type Sliders -->
        <div class="wave-sliders-section">
          <div class="wave-sliders-background">
            <div
              class="wave-slider-container"
              @touchmove.prevent
              @touchstart.prevent
            >
              <div class="wave-slider" v-for="wave in waveTypes" :key="wave.id">
                <div class="wave-slider-track">
                  <q-slider
                    v-model="wave.value"
                    vertical
                    reverse
                    :min="0"
                    :max="100"
                    color="black"
                    track-color="grey-3"
                    class="vertical-slider"
                  />
                </div>
                <div class="wave-label">
                  <div class="wave-symbol">{{ wave.symbol }}</div>
                  <div class="wave-name">{{ wave.name }}</div>
                  <div class="wave-freq">{{ wave.frequency }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Horizontal Sliders -->
        <div class="horizontal-sliders-section">
          <!-- Brightness Slider -->
          <div class="slider-control-section">
            <div class="slider-row">
              <div class="slider-label">Brightness</div>
              <div class="slider-value">{{ brightness }}</div>
              <div class="slider-container">
                <q-slider
                  v-model="brightness"
                  :min="0"
                  :max="100"
                  color="black"
                  track-color="grey-3"
                  class="custom-slider"
                />
                <div class="slider-scale">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Frequency Time Slider -->
          <div class="slider-control-section">
            <div class="slider-row">
              <div class="slider-label">Frequence Time</div>
              <div class="slider-value">{{ frequencyTime }} s</div>
              <div class="slider-container">
                <q-slider
                  v-model="frequencyTime"
                  :min="0"
                  :max="100"
                  color="black"
                  track-color="grey-3"
                  class="custom-slider"
                />
                <div class="slider-scale">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Slider -->
          <div class="slider-control-section">
            <div class="slider-row">
              <div class="slider-label">Time</div>
              <div class="slider-value">{{ time }} Min</div>
              <div class="slider-container">
                <q-slider
                  v-model="time"
                  :min="0"
                  :max="100"
                  color="black"
                  track-color="grey-3"
                  class="custom-slider"
                />
                <div class="slider-scale">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Effects Library -->
        <div class="effects-library-section">
          <div class="section-header">Effects Library</div>
          <div class="effects-list">
            <div
              v-for="effect in effects"
              :key="effect.id"
              class="effect-item"
              :class="{ active: effect.active }"
              @click="toggleEffect(effect.id)"
            >
              <div class="effect-checkbox">
                <q-icon
                  :name="
                    effect.active
                      ? 'radio_button_checked'
                      : 'radio_button_unchecked'
                  "
                  size="20px"
                  :color="effect.active ? 'black' : 'grey-5'"
                />
              </div>
              <div class="effect-name">{{ effect.name }}</div>
              <div class="effect-add-btn">
                <q-icon name="add" size="20px" color="grey-7" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";

import setEffect from "../utils/utils";
import webservices from "../webservices";

export default {
  name: "RandomizerPage",

  components: {},

  methods: {
    startRandomizer() {
      this.isRunning = true;
      this.currentTime = this.time * 60; // Convert minutes to seconds
      this.startTimer();
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.currentTime > 0) {
          this.currentTime--;
        } else {
          this.stopRandomizer();
        }
      }, 1000);
    },

    stopRandomizer() {
      this.isRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },

    toggleEffect(effectId) {
      const effect = this.effects.find((e) => e.id === effectId);
      if (effect) {
        effect.active = !effect.active;
      }
    },
  },

  setup() {
    const selectedItemId = ref(null);
    const isRunning = ref(false);
    const currentTime = ref(0);
    const timerInterval = ref(null);

    // Slider values
    const brightness = ref(25);
    const frequencyTime = ref(25);
    const time = ref(25);

    // Wave types with circular sliders
    const waveTypes = ref([
      { id: 1, symbol: "δ", name: "Delta", frequency: "0.5Hz", value: 20 },
      { id: 2, symbol: "θ", name: "Theta", frequency: "4.8Hz", value: 40 },
      { id: 3, symbol: "α", name: "Alpha", frequency: "9.12Hz", value: 60 },
      { id: 4, symbol: "β", name: "Beta", frequency: "9.12Hz", value: 30 },
      { id: 5, symbol: "γ", name: "Gamma", frequency: "9.12Hz", value: 50 },
    ]);

    // Effects library
    const effects = ref([
      { id: 1, name: "Rainbow Cycle", active: false },
      { id: 2, name: "Breathing", active: false },
      { id: 3, name: "Strobe", active: false },
    ]);

    return {
      selectedItemId,
      isRunning,
      currentTime,
      timerInterval,
      brightness,
      frequencyTime,
      time,
      waveTypes,
      effects,
    };
  },

  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
};
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  overflow: hidden;
  position: relative;
}

.content-area-randomizer {
  margin-top: 80px;
  margin-bottom: 10px;
  height: calc(100vh - 90px);
  overflow-y: auto;
}

.content-padding {
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.start-timer-section {
  width: 100%;
  text-align: center;
  padding-top: 3px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tap-to-start {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.timer-display {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  /*font-family: "Courier New", monospace;*/
}

.wave-sliders-section {
  width: 100%;
  margin-bottom: 15px;
  touch-action: none;
}

.wave-sliders-background {
  background-color: var(--controls-bg-color);

  border-radius: 8px;
  padding: 20px 15px;
  margin: 0 0px;
}

.wave-slider-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  touch-action: none;
}

.wave-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 60px;
}

.wave-slider-track {
  position: relative;
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  padding-right: 5px;
}

.vertical-slider {
  height: 120px;
  width: 40px;
  --q-primary: #333;
  --q-track-color: #e0e0e0;
}

.wave-label {
  text-align: center;
  font-size: 12px;
  width: 100%;
}

.wave-symbol {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.wave-name {
  color: #666;
  margin-bottom: 2px;
}

.wave-freq {
  color: #999;
  font-size: 11px;
}

.horizontal-sliders-section {
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.slider-control-section {
  background-color: var(--controls-bg-color);
  border-radius: 8px;
  padding: 8px 16px;
}

.slider-row {
  margin-bottom: 0;
}

.slider-label {
  font-size: 14px;
  color: #333;
  margin-bottom: -8px;
  font-weight: 500;
}

.slider-value {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-bottom: 0px;
}

.slider-container {
  position: relative;
}

.custom-slider {
  --q-primary: #333;
  --q-track-color: #e0e0e0;
}

.slider-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 10px;
  color: #999;
}

.effects-library-section {
  width: 100%;
}

.section-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.effects-list {
  background-color: var(--controls-bg-color);

  border-radius: 8px;
  padding: 10px;
}

.effect-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.effect-item:hover {
  background-color: #f8f8f8;
}

.effect-item.active {
  background-color: #f0f0f0;
}

.effect-checkbox {
  margin-right: 12px;
}

.effect-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.effect-add-btn {
  margin-left: 12px;
}

/* Prevent text selection during interaction */
.wave-slider-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
