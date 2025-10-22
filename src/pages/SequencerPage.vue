//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SequencerPage.vue
//
// Sequencer effects settings page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon -->
      <!-- <div class="header-icon left-icon">
        <img src="../assets/star.svg" alt="Star" width="24" height="24" />
      </div> -->

      <!-- Center Text -->
      <div class="header-title">SEQUENCER</div>

      <!-- Right Icon -->
      <!-- <div class="header-icon right-icon">
        <q-icon name="filter_list" size="24px" color="grey-7" />
      </div> -->
    </div>

    <!-- Fixed Description Bar -->
    <div class="description-bar">
      Queue and sequence lighting effects with custom parameters
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-sequencer">
      <!-- content goes here wrapped in content-padding divs -->
      <div class="content-padding">
        <!-- Effect Queue Card -->
        <div class="effect-queue-card">
          <!-- Queue Header -->
          <div class="queue-header">
            <div class="queue-title">
              <q-icon name="menu_open" size="20px" class="queue-icon" />
              Effect Queue
            </div>
            <div class="queue-controls">
              <q-btn
                icon="play_arrow"
                label="Start"
                unelevated
                class="start-btn"
                @click="startSequence"
              />

              <q-btn
                icon="stop"
                label="Stop"
                unelevated
                class="stop-btn"
                @click="stopSequence"
              />
            </div>
          </div>

          <!-- Queue Content -->
          <div class="queue-content">
            <div v-if="effectQueue.length === 0" class="empty-queue">
              <div class="empty-message">No effects in queue</div>
              <div class="empty-subtitle">
                Add effects from the effect panel to get started
              </div>
            </div>

            <div v-else class="effect-list">
              <div
                v-for="(effect, index) in effectQueue"
                :key="index"
                class="effect-item"
              >
                <div class="effect-info">
                  <div class="effect-name">{{ effect.name }}</div>
                  <div class="effect-duration">{{ effect.duration }}s</div>
                </div>
                <q-btn
                  icon="close"
                  size="sm"
                  flat
                  round
                  @click="removeEffect(index)"
                  class="remove-btn"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Available Effects Section -->
        <div class="available-effects-section">
          <div class="section-header">
            <q-icon name="auto_awesome" size="20px" class="section-icon" />
            Available Effects
          </div>

          <!-- Effect Cards -->
          <div class="effects-grid">
            <div
              v-for="(effect, index) in availableEffects"
              :key="index"
              class="effect-card"
            >
              <div class="effect-card-header">
                <div class="effect-card-title">{{ effect.name }}</div>
                <q-btn
                  icon="add"
                  label="Add To Queue"
                  unelevated
                  size="sm"
                  class="add-to-queue-btn"
                  @click="addToQueue(effect)"
                />
              </div>

              <div class="effect-parameters">
                <div class="parameter-row">
                  <div class="parameter-label">
                    <q-icon name="speed" size="16px" />
                    Hertz
                  </div>
                  <q-input
                    v-model="effect.hertz"
                    type="number"
                    dense
                    outlined
                    class="parameter-input"
                  />
                </div>

                <div class="parameter-row">
                  <div class="parameter-label">
                    <q-icon name="schedule" size="16px" />
                    Time(s)
                  </div>
                  <q-input
                    v-model="effect.time"
                    type="number"
                    dense
                    outlined
                    class="parameter-input"
                  />
                </div>

                <div class="parameter-row brightness-row">
                  <div class="parameter-label">
                    <q-icon name="brightness_6" size="16px" />
                    Brightness (%)
                  </div>
                  <q-slider
                    v-model="effect.brightness"
                    :min="0"
                    :max="100"
                    color="black"
                    track-color="grey-1"
                    class="brightness-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";

import setEffect from "../utils/utils";
import webservices from "../webservices";

export default {
  name: "JourneysPage",

  components: {},

  methods: {
    startSequence() {
      if (this.sequenceRunning) {
        console.log("Sequence already running");
        return;
      }
      if (!this.effectQueue || this.effectQueue.length === 0) {
        console.log("No effects to run in queue");
        return;
      }

      this.sequenceRunning = true;
      this._sequenceIndex = 0;

      const runStep = (index) => {
        if (!this.sequenceRunning) return;
        if (index >= this.effectQueue.length) {
          console.log("Sequence finished");
          this.stopSequence();
          return;
        }

        const entry = this.effectQueue[index];
        const hertz = Number(entry.hertz) || 0;
        const timeSec = Number(entry.time) || 3;
        const brightness = Number(entry.brightness) || 50;

        // Scale values to WLED ranges
        const scaledFreq = Math.round((hertz / 100) * 255);
        const scaledBri = Math.round((brightness / 100) * 255);

        // Send a generic command - using seg fields to set brightness and intensity
        const cmd = { seg: { fx: 0, ix: scaledFreq, bri: scaledBri } };
        webservices.sendCommandToWebSocket(cmd);
        console.log("Sequencer: running step", index, entry, cmd);

        // Schedule next
        this.sequenceTimeout = setTimeout(() => runStep(index + 1), timeSec * 1000);
      };

      runStep(0);
    },

    stopSequence() {
      if (this.sequenceTimeout) {
        clearTimeout(this.sequenceTimeout);
        this.sequenceTimeout = null;
      }
      this.sequenceRunning = false;
      console.log("Sequence stopped");
    },

    removeEffect(index) {
      this.effectQueue.splice(index, 1);
    },

    addToQueue(effect) {
      const effectCopy = {
        name: effect.name,
        hertz: effect.hertz,
        time: effect.time,
        brightness: effect.brightness,
        duration: effect.time, // Use time as duration for queue display
      };
      this.effectQueue.push(effectCopy);
    },
  },

  setup() {
    const selectedItemId = ref(null);
    const effectQueue = ref([]);
    const availableEffects = ref([
      {
        name: "Effect name",
        hertz: 10,
        time: 5,
        brightness: 50,
      },
      {
        name: "Effect 2 name",
        hertz: 10,
        time: 5,
        brightness: 50,
      },
      {
        name: "Effect 3 name",
        hertz: 10,
        time: 5,
        brightness: 50,
      },
    ]);

    const sequenceRunning = ref(false);
    const sequenceTimeout = ref(null);

    return {
      selectedItemId,
      effectQueue,
      availableEffects,
      sequenceRunning,
      sequenceTimeout,
    };
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

.content-area-sequencer {
  margin-top: 130px; /* Same as header height */
  margin-bottom: 10px; /* Space for bottom nav bar - adjust as needed */
  height: calc(100vh - 112px); /* Full height minus header and nav bar */
  overflow-y: auto;
}

.content-padding {
  margin-top: 10px; /* Add space for the fixed description bar */
  padding: 0 20px 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.description-bar {
  font-size: 12px;
  color: var(--header-text-color);

  padding: 20px 20px;
  text-align: center;
  position: fixed;
  top: 80px; /* Adjust this value based on your actual header height */
  left: 0;
  right: 0;
  z-index: 10;
}

.effect-queue-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.queue-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  color: var(--controls-icon-color);
}

.queue-icon {
  margin-right: 8px;
}

.start-btn {
  background-color: var(--controls-button--color);
  border-radius: 4px;
  font-size: 10px;
}

.stop-btn {
  background-color: var(--controls-button--color);
  border-radius: 4px;
  font-size: 10px;
  margin-left: 4px;
}

.queue-content {
  min-height: 200px;
  padding: 20px;
}

.empty-queue {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  color: #999;
}

.empty-message {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #bbb;
}

.effect-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  color: var(--controls-label-color);
  background-color: var(--controls-bg-color);
}

.effect-info {
  display: flex;
  flex-direction: column;
}

.effect-name {
  font-weight: 500;
  font-size: 14px;
}

.effect-duration {
  font-size: 12px;
  color: #666;
}

.remove-btn {
  color: #999;
}

.remove-btn:hover {
  color: #f44336;
}

.available-effects-section {
  width: 100%;
  max-width: 600px;
  margin-top: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.section-icon {
  margin-right: 8px;
}

.effects-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.effect-card {
  background: #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #d0d0d0;
}

.effect-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.effect-card-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.add-to-queue-btn {
  background-color: var(--controls-button--color);
  color: white;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
}

.effect-parameters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parameter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.parameter-row:not(.brightness-row) {
  justify-content: space-between;
}

.parameter-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--controls-label-color);
  font-weight: 500;
  min-width: 80px;
}

.parameter-input {
  width: 120px;
}

.parameter-input :deep(.q-field__control) {
  background-color: var(--controls-input-field-bg-color) !important;
  border-radius: 4px;
}

.parameter-input :deep(.q-field__native) {
  color: var(--controls-label-color) !important;
}

.brightness-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.brightness-slider {
  width: 100%;
  --q-primary: var(--controls-slider-bar--color);
  --q-track-color: var(--controls-slider-bar--color);
}
</style>
