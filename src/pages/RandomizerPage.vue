//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// RandomizerPage.vue
//
// Randomizer effects page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select randomizer-page">
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

<!-- Styles moved to src/css/pages/RandomizerPage.scss -->
