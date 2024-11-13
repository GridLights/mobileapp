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
            v-model="timerValue1"
            type="number"
            filled
            style="width: calc(50% - 5px)"
          >
            <template v-slot:prepend>
              <q-icon name="timer" />
            </template>
          </q-input>

          <q-input
            v-model="timerValue2"
            type="number"
            filled
            style="width: calc(50% - 5px)"
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
          <q-item v-for="n in 10" :key="n" clickable v-ripple>
            <q-item-section>Shape {{ n }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

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


<script>
import { defineComponent } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const sliderValue = ref(50);
    const isOn = ref(false);
    const timerValue = ref(0);

    const toggleButton = () => {
      isOn.value = !isOn.value;
    };

    return {
      sliderValue,
      isOn,
      timerValue,
      toggleButton,
    };
  },
});
</script>
