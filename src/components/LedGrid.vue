//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// LedGrid.vue
//
// LED Polygone grind of LEDs Component
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <div class="svg-container">
    <!-- Background image -->
    <img class="groupIcon" alt="" src="../assets/ledGridBGNoButt.svg" />

    <!-- PowerSwitch positioned over the background -->
    <PowerSwitch
      v-model="powerState"
      class="power-button-overlay"
      :size="32"
      :connectionState="connectionState"
      @toggle="handlePowerToggle"
    />

    <!-- LEDs overlay -->
    <svg class="led-overlay" width="300" height="250">
      <!-- Manual LED positioning with dynamic colors -->

      <!-- Row 1 (top) - 4 LEDs -->
      <circle
        v-if="rows[0] && rows[0][0]"
        :cx="baseX"
        :cy="baseY"
        :r="dotRadius"
        :fill="rows[0][0]"
      />
      <circle
        v-if="rows[0] && rows[0][1]"
        :cx="baseX + row0XOffset + ledSpacing"
        :cy="baseY + row0YOffset"
        :r="dotRadius"
        :fill="rows[0][1]"
      />
      <circle
        v-if="rows[0] && rows[0][2]"
        :cx="baseX + row0XOffset + ledSpacing * 2"
        :cy="baseY + row0YOffset"
        :r="dotRadius"
        :fill="rows[0][2]"
      />
      <circle
        v-if="rows[0] && rows[0][3]"
        :cx="baseX + row0XOffset + ledSpacing * 3"
        :cy="baseY + row0YOffset"
        :r="dotRadius"
        :fill="rows[0][3]"
      />

      <!-- Row 2 - 5 LEDs (offset) -->
      <circle
        v-if="rows[1] && rows[1][0]"
        :cx="baseX + row1XOffset"
        :cy="baseY + row1YOffset"
        :r="dotRadius"
        :fill="rows[1][0]"
      />
      <circle
        v-if="rows[1] && rows[1][1]"
        :cx="baseX + row1XOffset + ledSpacing"
        :cy="baseY + row1YOffset"
        :r="dotRadius"
        :fill="rows[1][1]"
      />
      <circle
        v-if="rows[1] && rows[1][2]"
        :cx="baseX + row1XOffset + ledSpacing * 2"
        :cy="baseY + row1YOffset"
        :r="dotRadius"
        :fill="rows[1][2]"
      />
      <circle
        v-if="rows[1] && rows[1][3]"
        :cx="baseX + row1XOffset + ledSpacing * 3"
        :cy="baseY + row1YOffset"
        :r="dotRadius"
        :fill="rows[1][3]"
      />
      <circle
        v-if="rows[1] && rows[1][4]"
        :cx="baseX + row1XOffset + ledSpacing * 4"
        :cy="baseY + row1YOffset"
        :r="dotRadius"
        :fill="rows[1][4]"
      />

      <!-- Row 3 - 6 LEDs -->
      <circle
        v-if="rows[2] && rows[2][0]"
        :cx="baseX + row2XOffset"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][0]"
      />
      <circle
        v-if="rows[2] && rows[2][1]"
        :cx="baseX + row2XOffset + ledSpacing"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][1]"
      />
      <circle
        v-if="rows[2] && rows[2][2]"
        :cx="baseX + row2XOffset + ledSpacing * 2"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][2]"
      />
      <circle
        v-if="rows[2] && rows[2][3]"
        :cx="baseX + row2XOffset + ledSpacing * 3"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][3]"
      />
      <circle
        v-if="rows[2] && rows[2][4]"
        :cx="baseX + row2XOffset + ledSpacing * 4"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][4]"
      />
      <circle
        v-if="rows[2] && rows[2][5]"
        :cx="baseX + row2XOffset + ledSpacing * 5"
        :cy="baseY + row2YOffset"
        :r="dotRadius"
        :fill="rows[2][5]"
      />

      <!-- Row 4 - 7 LEDs (offset) -->
      <circle
        v-if="rows[3] && rows[3][0]"
        :cx="baseX + row3XOffset"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][0]"
      />
      <circle
        v-if="rows[3] && rows[3][1]"
        :cx="baseX + row3XOffset + ledSpacing"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][1]"
      />
      <circle
        v-if="rows[3] && rows[3][2]"
        :cx="baseX + row3XOffset + ledSpacing * 2"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][2]"
      />
      <circle
        v-if="rows[3] && rows[3][3]"
        :cx="baseX + row3XOffset + ledSpacing * 3"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][3]"
      />
      <circle
        v-if="rows[3] && rows[3][4]"
        :cx="baseX + row3XOffset + ledSpacing * 4"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][4]"
      />
      <circle
        v-if="rows[3] && rows[3][5]"
        :cx="baseX + row3XOffset + ledSpacing * 5"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][5]"
      />
      <circle
        v-if="rows[3] && rows[3][6]"
        :cx="baseX + row3XOffset + ledSpacing * 6"
        :cy="baseY + row3YOffset"
        :r="dotRadius"
        :fill="rows[3][6]"
      />

      <!-- Row 5 - 6 LEDs -->
      <circle
        v-if="rows[4] && rows[4][0]"
        :cx="baseX + row4XOffset"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][0]"
      />
      <circle
        v-if="rows[4] && rows[4][1]"
        :cx="baseX + row4XOffset + ledSpacing"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][1]"
      />
      <circle
        v-if="rows[4] && rows[4][2]"
        :cx="baseX + row4XOffset + ledSpacing * 2"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][2]"
      />
      <circle
        v-if="rows[4] && rows[4][3]"
        :cx="baseX + row4XOffset + ledSpacing * 3"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][3]"
      />
      <circle
        v-if="rows[4] && rows[4][4]"
        :cx="baseX + row4XOffset + ledSpacing * 4"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][4]"
      />
      <circle
        v-if="rows[4] && rows[4][5]"
        :cx="baseX + row4XOffset + ledSpacing * 5"
        :cy="baseY + row4YOffset"
        :r="dotRadius"
        :fill="rows[4][5]"
      />

      <!-- Row 6 - 5 LEDs (offset) -->
      <circle
        v-if="rows[5] && rows[5][0]"
        :cx="baseX + row5XOffset"
        :cy="baseY + row5YOffset"
        :r="dotRadius"
        :fill="rows[5][0]"
      />
      <circle
        v-if="rows[5] && rows[5][1]"
        :cx="baseX + row5XOffset + ledSpacing"
        :cy="baseY + row5YOffset"
        :r="dotRadius"
        :fill="rows[5][1]"
      />
      <circle
        v-if="rows[5] && rows[5][2]"
        :cx="baseX + row5XOffset + ledSpacing * 2"
        :cy="baseY + row5YOffset"
        :r="dotRadius"
        :fill="rows[5][2]"
      />
      <circle
        v-if="rows[5] && rows[5][3]"
        :cx="baseX + row5XOffset + ledSpacing * 3"
        :cy="baseY + row5YOffset"
        :r="dotRadius"
        :fill="rows[5][3]"
      />
      <circle
        v-if="rows[5] && rows[5][4]"
        :cx="baseX + row5XOffset + ledSpacing * 4"
        :cy="baseY + row5YOffset"
        :r="dotRadius"
        :fill="rows[5][4]"
      />

      <!-- Row 7 (bottom) - 4 LEDs -->
      <circle
        v-if="rows[6] && rows[6][0]"
        :cx="baseX + row6XOffset"
        :cy="baseY + row6YOffset"
        :r="dotRadius"
        :fill="rows[6][0]"
      />
      <circle
        v-if="rows[6] && rows[6][1]"
        :cx="baseX + row6XOffset + ledSpacing"
        :cy="baseY + row6YOffset"
        :r="dotRadius"
        :fill="rows[6][1]"
      />
      <circle
        v-if="rows[6] && rows[6][2]"
        :cx="baseX + row6XOffset + ledSpacing * 2"
        :cy="baseY + row6YOffset"
        :r="dotRadius"
        :fill="rows[6][2]"
      />
      <circle
        v-if="rows[6] && rows[6][3]"
        :cx="baseX + row6XOffset + ledSpacing * 3"
        :cy="baseY + row6YOffset"
        :r="dotRadius"
        :fill="rows[6][3]"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import PowerSwitch from "./PowerSwitch.vue";
import { useConnectionState } from "../composables/useConnectionState";

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
  circleRadius: {
    type: Number,
    default: 4,
  },
  spacing: {
    type: Number,
    default: 26,
  },
  powerOn: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['power-changed']);

const { connectionState, subscribe } = useConnectionState();

const powerState = ref(props.powerOn);

watch(() => props.powerOn, (newVal) => {
  powerState.value = newVal;
});

// Positioning constants
const dotRadius = 5;
const baseX = 118;
const baseY = 71;
const ledSpacing = 20.6;
const row0XOffset = 0, row0YOffset = 0;
const row1XOffset = -11, row1YOffset = 18;
const row2XOffset = -21, row2YOffset = 36;
const row3XOffset = -30, row3YOffset = 54;
const row4XOffset = -21, row4YOffset = 73;
const row5XOffset = -11, row5YOffset = 90;
const row6XOffset = 0, row6YOffset = 108;

function handlePowerToggle(newState) {
  emit('power-changed', newState);
}

// Subscribe to connection state changes; automatically cleans up on unmount
let unsubscribeFn = null;
onMounted(() => {
  unsubscribeFn = subscribe(() => {
    // connectionState ref is updated automatically by the composable
  });
});
onBeforeUnmount(() => {
  if (unsubscribeFn) unsubscribeFn();
});
</script>

<style scoped>
.svg-container {
  position: relative;
  margin: 0px;
  width: 300px;
  height: 250px;
}

.groupIcon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}

.power-button-overlay {
  position: absolute;
  top: 23px;
  right: 10px;
  z-index: 3;
}

.led-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: block;
}
</style>
