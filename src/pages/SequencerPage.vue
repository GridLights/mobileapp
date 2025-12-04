//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SequencerPage.vue
//
// Sequencer effects settings page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select sequencer-page">
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
      console.log("Starting sequence...");
      // Add your sequence start logic here
    },

    stopSequence() {
      console.log("Stopping sequence...");
      // Add your sequence stop logic here
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

    return {
      selectedItemId,
      effectQueue,
      availableEffects,
    };
  },
};
</script>

<!-- Styles moved to src/css/pages/SequencerPage.scss -->
